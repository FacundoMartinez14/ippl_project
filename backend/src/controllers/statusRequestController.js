const fs = require('fs').promises;
const path = require('path');
const { createActivity } = require('./activityController');

const STATUS_REQUESTS_FILE = path.join(__dirname, '../data/status-requests.json');
const PATIENTS_FILE = path.join(__dirname, '../data/patients.json');

const VALID_STATUSES = ['active', 'pending', 'inactive', 'absent'];

// Asegurarse de que el archivo existe
const initializeRequestsFile = async () => {
  try {
    await fs.access(STATUS_REQUESTS_FILE);
  } catch (error) {
    await fs.writeFile(STATUS_REQUESTS_FILE, JSON.stringify({ requests: [] }, null, 2));
  }
};

// Crear una nueva solicitud
const createRequest = async (req, res) => {
  try {
    await initializeRequestsFile();
    const requestData = req.body;
    
    // Validar estados
    if (!VALID_STATUSES.includes(requestData.currentStatus) || !VALID_STATUSES.includes(requestData.requestedStatus)) {
      return res.status(400).json({ 
        message: 'Estado no válido. Los estados permitidos son: activo, pendiente, inactivo y ausente' 
      });
    }

    // Validar cambio específico de activo a inactivo
    if (requestData.currentStatus === 'active' && requestData.requestedStatus !== 'inactive') {
      return res.status(400).json({
        message: 'Solo se permiten solicitudes de cambio de estado de activo a inactivo'
      });
    }
    
    // Leer solicitudes existentes
    const data = await fs.readFile(STATUS_REQUESTS_FILE, 'utf8');
    const { requests } = JSON.parse(data);
    
    // Verificar si ya existe una solicitud pendiente para este paciente
    const existingRequest = requests.find(r => 
      r.patientId === requestData.patientId && 
      r.status === 'pending'
    );
    
    if (existingRequest) {
      return res.status(400).json({ 
        message: 'Ya existe una solicitud pendiente para este paciente' 
      });
    }
    
    // Crear nueva solicitud
    const newRequest = {
      id: Date.now().toString(),
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    requests.push(newRequest);
    await fs.writeFile(STATUS_REQUESTS_FILE, JSON.stringify({ requests }, null, 2));
    
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ message: 'Error al crear la solicitud' });
  }
};

// Obtener solicitudes pendientes
const getPendingRequests = async (req, res) => {
  try {
    await initializeRequestsFile();
    const data = await fs.readFile(STATUS_REQUESTS_FILE, 'utf8');
    const { requests } = JSON.parse(data);
    
    const pendingRequests = requests.filter(r => r.status === 'pending');
    res.json({ requests: pendingRequests });
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ message: 'Error al obtener las solicitudes' });
  }
};

// Obtener solicitudes de un profesional
const getProfessionalRequests = async (req, res) => {
  try {
    await initializeRequestsFile();
    const { professionalId } = req.params;
    const data = await fs.readFile(STATUS_REQUESTS_FILE, 'utf8');
    const { requests } = JSON.parse(data);
    
    const professionalRequests = requests.filter(r => r.professionalId === professionalId);
    res.json({ requests: professionalRequests });
  } catch (error) {
    console.error('Error al obtener solicitudes del profesional:', error);
    res.status(500).json({ message: 'Error al obtener las solicitudes' });
  }
};

// Aprobar una solicitud
const approveRequest = async (req, res) => {
  console.log('DEBUG: Llamada a approveRequest con ID:', req.params.requestId);
  try {
    const { requestId } = req.params;
    const { adminResponse } = req.body;
    
    // Leer solicitudes
    const requestsData = await fs.readFile(STATUS_REQUESTS_FILE, 'utf8');
    const { requests } = JSON.parse(requestsData);
    
    const request = requests.find(r => r.id === requestId);
    if (!request) {
      console.log('DEBUG: Solicitud no encontrada para ID:', requestId);
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Esta solicitud ya fue procesada' });
    }
    
    // Actualizar estado del paciente
    const patientsData = await fs.readFile(PATIENTS_FILE, 'utf8');
    const { patients } = JSON.parse(patientsData);
    
    const patientIndex = patients.findIndex(p => p.id === request.patientId);
    if (patientIndex === -1) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }
    
    // Actualizar el paciente según el tipo de solicitud
    if (request.type === 'frequency_change') {
      patients[patientIndex].sessionFrequency = request.requestedFrequency;
      
      // Crear actividad para el cambio de frecuencia
      await createActivity(
        'FREQUENCY_CHANGE_APPROVED',
        'Cambio de frecuencia aprobado',
        `Se ha aprobado el cambio de frecuencia de sesiones para el paciente ${request.patientName} de ${request.currentFrequency} a ${request.requestedFrequency}`,
        {
          patientId: request.patientId,
          patientName: request.patientName,
          professionalId: request.professionalId,
          professionalName: request.professionalName,
          oldFrequency: request.currentFrequency,
          newFrequency: request.requestedFrequency,
          adminResponse
        }
      );
    } else if (request.type === 'activation') {
      patients[patientIndex].status = 'alta';
      patients[patientIndex].activatedAt = new Date().toISOString();
      await createActivity(
        'PATIENT_ACTIVATION_APPROVED',
        'Alta de paciente aprobada',
        `Se ha aprobado el alta para el paciente ${request.patientName}`,
        {
          patientId: request.patientId,
          patientName: request.patientName,
          professionalId: request.professionalId,
          professionalName: request.professionalName,
          adminResponse
        }
      );
    } else {
      // Solicitud de cambio de estado
      patients[patientIndex].status = request.requestedStatus;
      
      // Crear actividad para el cambio de estado
      await createActivity(
        'STATUS_CHANGE_APPROVED',
        'Cambio de estado aprobado',
        `Se ha aprobado el cambio de estado para el paciente ${request.patientName} de ${request.currentStatus} a ${request.requestedStatus}`,
        {
          patientId: request.patientId,
          patientName: request.patientName,
          professionalId: request.professionalId,
          professionalName: request.professionalName,
          oldStatus: request.currentStatus,
          newStatus: request.requestedStatus,
          adminResponse
        }
      );
    }
    
    // Actualizar solicitud
    const requestIndex = requests.findIndex(r => r.id === requestId);
    requests[requestIndex] = {
      ...request,
      status: 'approved',
      adminResponse,
      updatedAt: new Date().toISOString(),
      changedAt: new Date().toISOString()
    };
    
    // Guardar cambios
    await Promise.all([
      fs.writeFile(STATUS_REQUESTS_FILE, JSON.stringify({ requests }, null, 2)),
      fs.writeFile(PATIENTS_FILE, JSON.stringify({ patients }, null, 2))
    ]);
    
    res.json(requests[requestIndex]);
  } catch (error) {
    console.error('Error al aprobar solicitud:', error);
    res.status(500).json({ message: 'Error al aprobar la solicitud' });
  }
};

// Rechazar una solicitud
const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminResponse } = req.body;
    
    if (!adminResponse) {
      return res.status(400).json({ message: 'Se requiere una razón para el rechazo' });
    }
    
    // Leer solicitudes
    const data = await fs.readFile(STATUS_REQUESTS_FILE, 'utf8');
    const { requests } = JSON.parse(data);
    
    const requestIndex = requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }
    
    const request = requests[requestIndex];
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Esta solicitud ya fue procesada' });
    }
    
    // Actualizar solicitud
    requests[requestIndex] = {
      ...request,
      status: 'rejected',
      adminResponse,
      updatedAt: new Date().toISOString(),
      changedAt: new Date().toISOString()
    };
    
    await fs.writeFile(STATUS_REQUESTS_FILE, JSON.stringify({ requests }, null, 2));

    // Crear actividad según el tipo de solicitud
    if (request.type === 'frequency_change') {
      await createActivity(
        'FREQUENCY_CHANGE_REJECTED',
        'Cambio de frecuencia rechazado',
        `Se ha rechazado el cambio de frecuencia de sesiones para el paciente ${request.patientName}`,
        {
          patientId: request.patientId,
          patientName: request.patientName,
          professionalId: request.professionalId,
          professionalName: request.professionalName,
          requestedFrequency: request.requestedFrequency,
          currentFrequency: request.currentFrequency,
          reason: adminResponse
        }
      );
    } else {
      await createActivity(
        'STATUS_CHANGE_REJECTED',
        'Cambio de estado rechazado',
        `Se ha rechazado el cambio de estado para el paciente ${request.patientName}`,
        {
          patientId: request.patientId,
          patientName: request.patientName,
          professionalId: request.professionalId,
          professionalName: request.professionalName,
          requestedStatus: request.requestedStatus,
          currentStatus: request.currentStatus,
          reason: adminResponse
        }
      );
    }
    
    res.json(requests[requestIndex]);
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    res.status(500).json({ message: 'Error al rechazar la solicitud' });
  }
};

const requestFrequencyChange = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { newFrequency, reason, currentFrequency } = req.body;
    const { id: professionalId, name: professionalName } = req.user;

    // Leer datos del paciente
    const patientsData = await fs.readFile(PATIENTS_FILE, 'utf8');
    const { patients } = JSON.parse(patientsData);
    const patient = patients.find(p => p.id === patientId);

    if (!patient) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    // Leer solicitudes existentes
    let statusRequestsData = { requests: [] };
    try {
      const statusRequestsContent = await fs.readFile(STATUS_REQUESTS_FILE, 'utf8');
      statusRequestsData = JSON.parse(statusRequestsContent);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    // Verificar si ya existe una solicitud pendiente
    const existingRequest = statusRequestsData.requests.find(r => 
      r.patientId === patientId && 
      r.status === 'pending' &&
      r.type === 'frequency_change'
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Ya existe una solicitud pendiente para este paciente' });
    }

    // Crear nueva solicitud
    const newRequest = {
      id: Date.now().toString(),
      type: 'frequency_change',
      patientId,
      patientName: patient.name,
      professionalId,
      professionalName,
      currentFrequency,
      requestedFrequency: newFrequency,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    statusRequestsData.requests.push(newRequest);
    await fs.writeFile(STATUS_REQUESTS_FILE, JSON.stringify(statusRequestsData, null, 2));

    // Crear una actividad para notificar la solicitud
    await createActivity(
      'FREQUENCY_CHANGE_REQUEST',
      'Solicitud de cambio de frecuencia',
      `El profesional ${professionalName} ha solicitado cambiar la frecuencia de sesiones del paciente ${patient.name} de ${currentFrequency} a ${newFrequency}`,
      {
        patientId,
        patientName: patient.name,
        professionalId,
        professionalName,
        currentFrequency,
        newFrequency,
        reason
      }
    );

    res.json({ success: true, message: 'Solicitud de cambio de frecuencia enviada correctamente' });
  } catch (error) {
    console.error('Error requesting frequency change:', error);
    res.status(500).json({ error: 'Error al solicitar el cambio de frecuencia' });
  }
};

module.exports = {
  createRequest,
  getPendingRequests,
  getProfessionalRequests,
  approveRequest,
  rejectRequest,
  requestFrequencyChange
}; 