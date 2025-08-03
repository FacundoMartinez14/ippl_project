const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');
const { createActivity } = require('../controllers/activityController');

const FREQUENCY_REQUESTS_FILE = path.join(__dirname, '../data/frequency-requests.json');
const PATIENTS_FILE = path.join(__dirname, '../data/patients.json');

// Asegurarse de que el archivo existe
const initializeRequestsFile = async () => {
  try {
    await fs.access(FREQUENCY_REQUESTS_FILE);
  } catch (error) {
    await fs.writeFile(FREQUENCY_REQUESTS_FILE, JSON.stringify({ requests: [] }, null, 2));
  }
};

// Crear una nueva solicitud
router.post('/', authenticateToken, checkRole(['professional']), async (req, res) => {
  try {
    await initializeRequestsFile();
    const { patientId, newFrequency, reason } = req.body;
    const { id: professionalId, name: professionalName } = req.user;

    // Validar que todos los campos requeridos estén presentes
    if (!patientId || !newFrequency || !reason) {
      return res.status(400).json({ 
        message: 'Faltan campos requeridos. Se necesita: patientId, newFrequency y reason' 
      });
    }

    // Validar la frecuencia solicitada
    const validFrequencies = ['weekly', 'biweekly', 'monthly'];
    if (!validFrequencies.includes(newFrequency)) {
      return res.status(400).json({ 
        message: 'Frecuencia no válida. Las frecuencias permitidas son: semanal, quincenal y mensual' 
      });
    }

    // Validar que la razón no esté vacía
    if (!reason.trim()) {
      return res.status(400).json({ 
        message: 'La razón del cambio no puede estar vacía' 
      });
    }

    // Leer datos del paciente
    const patientsData = await fs.readFile(PATIENTS_FILE, 'utf8');
    const { patients } = JSON.parse(patientsData);
    const patient = patients.find(p => p.id === patientId);

    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    // Verificar que el profesional está asignado al paciente
    if (patient.professionalId !== professionalId) {
      return res.status(403).json({ message: 'No tienes permiso para modificar este paciente' });
    }

    // Verificar que la frecuencia sea diferente a la actual
    if (patient.sessionFrequency === newFrequency) {
      return res.status(400).json({ 
        message: 'La nueva frecuencia debe ser diferente a la frecuencia actual' 
      });
    }

    // Leer solicitudes existentes
    const requestsData = await fs.readFile(FREQUENCY_REQUESTS_FILE, 'utf8');
    const { requests } = JSON.parse(requestsData);

    // Verificar si ya existe una solicitud pendiente
    const existingRequest = requests.find(r => 
      r.patientId === patientId && 
      r.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Ya existe una solicitud pendiente para este paciente' });
    }

    // Crear nueva solicitud
    const newRequest = {
      id: Date.now().toString(),
      patientId,
      patientName: patient.name,
      professionalId,
      professionalName,
      currentFrequency: patient.sessionFrequency || 'No asignada',
      requestedFrequency: newFrequency,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    requests.push(newRequest);
    await fs.writeFile(FREQUENCY_REQUESTS_FILE, JSON.stringify({ requests }, null, 2));

    // Crear actividad
    await createActivity(
      'FREQUENCY_CHANGE_REQUESTED',
      'Nueva solicitud de cambio de frecuencia',
      `${professionalName} ha solicitado cambiar la frecuencia de sesiones de ${patient.name} a ${newFrequency}`,
      {
        patientId,
        patientName: patient.name,
        professionalId,
        professionalName,
        currentFrequency: patient.sessionFrequency,
        requestedFrequency: newFrequency
      }
    );

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ message: 'Error al crear la solicitud' });
  }
});

// Obtener solicitudes pendientes
router.get('/pending', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    await initializeRequestsFile();
    const data = await fs.readFile(FREQUENCY_REQUESTS_FILE, 'utf8');
    const { requests } = JSON.parse(data);
    const pendingRequests = requests.filter(r => r.status === 'pending');
    res.json(pendingRequests);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ message: 'Error al obtener las solicitudes' });
  }
});

// Obtener solicitudes de un paciente
router.get('/patient/:patientId', authenticateToken, checkRole(['admin', 'professional']), async (req, res) => {
  try {
    await initializeRequestsFile();
    const { patientId } = req.params;
    const data = await fs.readFile(FREQUENCY_REQUESTS_FILE, 'utf8');
    const { requests } = JSON.parse(data);
    const patientRequests = requests.filter(r => r.patientId === patientId);
    res.json(patientRequests);
  } catch (error) {
    console.error('Error al obtener solicitudes del paciente:', error);
    res.status(500).json({ message: 'Error al obtener las solicitudes' });
  }
});

// Aprobar una solicitud
router.post('/:requestId/approve', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminResponse } = req.body;

    const data = await fs.readFile(FREQUENCY_REQUESTS_FILE, 'utf8');
    const { requests } = JSON.parse(data);
    const requestIndex = requests.findIndex(r => r.id === requestId);

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    const request = requests[requestIndex];
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Esta solicitud ya fue procesada' });
    }

    // Actualizar la frecuencia del paciente
    const patientsData = await fs.readFile(PATIENTS_FILE, 'utf8');
    const { patients } = JSON.parse(patientsData);
    const patientIndex = patients.findIndex(p => p.id === request.patientId);

    if (patientIndex === -1) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    patients[patientIndex].sessionFrequency = request.requestedFrequency;
    requests[requestIndex].status = 'approved';
    requests[requestIndex].adminResponse = adminResponse;
    requests[requestIndex].updatedAt = new Date().toISOString();

    await Promise.all([
      fs.writeFile(PATIENTS_FILE, JSON.stringify({ patients }, null, 2)),
      fs.writeFile(FREQUENCY_REQUESTS_FILE, JSON.stringify({ requests }, null, 2))
    ]);

    // Crear actividad
    await createActivity(
      'FREQUENCY_CHANGE_APPROVED',
      'Solicitud de cambio de frecuencia aprobada',
      `Se ha aprobado el cambio de frecuencia para ${request.patientName} a ${request.requestedFrequency}`,
      {
        patientId: request.patientId,
        patientName: request.patientName,
        professionalId: request.professionalId,
        professionalName: request.professionalName,
        newFrequency: request.requestedFrequency
      }
    );

    res.json(requests[requestIndex]);
  } catch (error) {
    console.error('Error al aprobar solicitud:', error);
    res.status(500).json({ message: 'Error al aprobar la solicitud' });
  }
});

// Rechazar una solicitud
router.post('/:requestId/reject', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminResponse } = req.body;

    if (!adminResponse) {
      return res.status(400).json({ message: 'Se requiere una razón para el rechazo' });
    }

    const data = await fs.readFile(FREQUENCY_REQUESTS_FILE, 'utf8');
    const { requests } = JSON.parse(data);
    const requestIndex = requests.findIndex(r => r.id === requestId);

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    const request = requests[requestIndex];
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Esta solicitud ya fue procesada' });
    }

    requests[requestIndex].status = 'rejected';
    requests[requestIndex].adminResponse = adminResponse;
    requests[requestIndex].updatedAt = new Date().toISOString();

    await fs.writeFile(FREQUENCY_REQUESTS_FILE, JSON.stringify({ requests }, null, 2));

    // Crear actividad
    await createActivity(
      'FREQUENCY_CHANGE_REJECTED',
      'Solicitud de cambio de frecuencia rechazada',
      `Se ha rechazado el cambio de frecuencia para ${request.patientName}`,
      {
        patientId: request.patientId,
        patientName: request.patientName,
        professionalId: request.professionalId,
        professionalName: request.professionalName,
        requestedFrequency: request.requestedFrequency,
        reason: adminResponse
      }
    );

    res.json(requests[requestIndex]);
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    res.status(500).json({ message: 'Error al rechazar la solicitud' });
  }
});

module.exports = router; 