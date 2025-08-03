const fs = require('fs').promises;
const path = require('path');
const { createActivity } = require('./activityController');

const PATIENTS_FILE = path.join(__dirname, '../data/patients.json');
const STATUS_REQUESTS_FILE = path.join(__dirname, '../data/status-requests.json');

const getAllPatients = async (req, res) => {
  try {
    const data = await fs.readFile(PATIENTS_FILE, 'utf8');
    const patients = JSON.parse(data);
    res.json(patients);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Si el archivo no existe, devuelve un array vacío
      await fs.writeFile(PATIENTS_FILE, JSON.stringify({ patients: [] }));
      return res.json({ patients: [] });
    }
    res.status(500).json({ message: 'Error al obtener pacientes' });
  }
};

const getProfessionalPatients = async (req, res) => {
  try {
    const { professionalId } = req.params;
    const data = await fs.readFile(PATIENTS_FILE, 'utf8');
    const { patients } = JSON.parse(data);
    
    // Filtrar pacientes asignados al profesional
    const professionalPatients = patients
      .filter(p => p.professionalId === professionalId)
      .map(patient => ({
        ...patient,
        audioNote: patient.audioNote ? `/uploads/audios/${patient.audioNote}` : undefined
      }));
    
    res.json({ patients: professionalPatients });
  } catch (error) {
    console.error('Error al obtener pacientes del profesional:', error);
    res.status(500).json({ message: 'Error al obtener pacientes' });
  }
};

const assignPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { 
      professionalId, 
      professionalName, 
      status, 
      assignedAt, 
      textNote, 
      audioNote,
      sessionFrequency
    } = req.body;
    
    const data = await fs.readFile(PATIENTS_FILE, 'utf8');
    const { patients } = JSON.parse(data);
    
    const patientIndex = patients.findIndex(p => p.id === patientId);
    
    if (patientIndex === -1) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }
    
    // Actualizar solo los campos enviados
    const updatedPatient = { ...patients[patientIndex] };
    if (professionalId !== undefined) updatedPatient.professionalId = professionalId;
    if (professionalName !== undefined) updatedPatient.professionalName = professionalName;
    if (status !== undefined) updatedPatient.status = status;
    if (assignedAt !== undefined) updatedPatient.assignedAt = assignedAt;
    if (textNote !== undefined) updatedPatient.textNote = textNote;
    if (audioNote !== undefined) updatedPatient.audioNote = audioNote;
    if (sessionFrequency !== undefined) updatedPatient.sessionFrequency = sessionFrequency;

    patients[patientIndex] = updatedPatient;
    
    await fs.writeFile(PATIENTS_FILE, JSON.stringify({ patients }, null, 2));
    
    // Crear una actividad para registrar la asignación
    await createActivity(
      'PATIENT_ASSIGNED',
      'Paciente asignado',
      `El paciente ${patients[patientIndex].name} ha sido asignado al profesional ${professionalName}`,
      {
        patientId,
        patientName: patients[patientIndex].name,
        professionalId,
        professionalName,
        status,
        sessionFrequency
      }
    );
    
    res.json(patients[patientIndex]);
  } catch (error) {
    console.error('Error al asignar paciente:', error);
    res.status(500).json({ message: 'Error al asignar paciente' });
  }
};

const addPatient = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    let data = { patients: [] };
    try {
      const fileContent = await fs.readFile(PATIENTS_FILE, 'utf8');
      data = JSON.parse(fileContent);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    
    const newPatient = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    data.patients.push(newPatient);
    
    await fs.writeFile(PATIENTS_FILE, JSON.stringify(data, null, 2));
    
    res.status(201).json(newPatient);
  } catch (error) {
    console.error('Error al agregar paciente:', error);
    res.status(500).json({ message: 'Error al agregar paciente' });
  }
};

const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(PATIENTS_FILE, 'utf8');
    const { patients } = JSON.parse(data);
    
    const patientIndex = patients.findIndex(p => p.id === id);
    
    if (patientIndex === -1) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }
    
    // Eliminar el paciente
    patients.splice(patientIndex, 1);
    
    await fs.writeFile(PATIENTS_FILE, JSON.stringify({ patients }, null, 2));
    
    res.json({ message: 'Paciente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.status(500).json({ message: 'Error al eliminar paciente' });
  }
};

// Solicitar dar de baja a un paciente
async function requestDischargePatient(req, res) {
  try {
    const { patientId } = req.params;
    const { reason } = req.body;
    const { id, name } = req.user;

    // Leer datos del paciente
    const data = await fs.readFile(PATIENTS_FILE, 'utf8');
    const { patients } = JSON.parse(data);
    const patient = patients.find(p => p.id === patientId);

    if (!patient) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    // Actualizar el estado del paciente
    patient.dischargeRequest = {
      requestedBy: id,
      requestDate: new Date().toISOString(),
      reason,
      status: 'pending'
    };

    // Guardar cambios en patients.json
    await fs.writeFile(PATIENTS_FILE, JSON.stringify({ patients }, null, 2));

    // Crear solicitud en status-requests.json
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
      professionalId: id,
      professionalName: name,
      currentStatus: patient.status,
      requestedStatus: 'inactive',
      reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    statusRequestsData.requests.push(newRequest);
    await fs.writeFile(STATUS_REQUESTS_FILE, JSON.stringify(statusRequestsData, null, 2));

    // Crear una actividad para notificar la solicitud
    await createActivity(
      'PATIENT_DISCHARGE_REQUEST',
      'Solicitud de baja de paciente',
      `El profesional ${name} ha solicitado dar de baja al paciente ${patient.name}`,
      {
        patientId,
        patientName: patient.name,
        professionalId: id,
        professionalName: name,
        reason
      }
    );

    res.json({ success: true, message: 'Solicitud de baja enviada correctamente' });
  } catch (error) {
    console.error('Error requesting patient discharge:', error);
    res.status(500).json({ error: 'Error al solicitar la baja del paciente' });
  }
}

// Solicitar alta de un paciente
async function requestActivationPatient(req, res) {
  try {
    const { patientId } = req.params;
    const { reason } = req.body;
    const { id, name } = req.user;

    const data = await fs.readFile(PATIENTS_FILE, 'utf8');
    const { patients } = JSON.parse(data);
    const patient = patients.find(p => p.id === patientId);

    if (!patient) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    let statusRequestsData = { requests: [] };
    try {
      const statusRequestsContent = await fs.readFile(STATUS_REQUESTS_FILE, 'utf8');
      statusRequestsData = JSON.parse(statusRequestsContent);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    const existingRequest = statusRequestsData.requests.find(r =>
      r.patientId === patientId &&
      r.status === 'pending' &&
      r.requestedStatus === 'alta'
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Ya existe una solicitud de alta pendiente para este paciente' });
    }

    // No permitir solicitar alta si ya hay una solicitud pendiente de inactivación
    const pendingDischarge = statusRequestsData.requests.find(r =>
      r.patientId === patientId &&
      r.status === 'pending' &&
      r.requestedStatus === 'inactive'
    );
    if (pendingDischarge) {
      return res.status(400).json({ message: 'No se puede solicitar el alta mientras hay una solicitud de inactivación pendiente para este paciente' });
    }

    const newRequest = {
      id: Date.now().toString(),
      patientId,
      patientName: patient.name,
      professionalId: id,
      professionalName: name,
      currentStatus: patient.status,
      requestedStatus: 'alta',
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
      type: 'activation'
    };

    statusRequestsData.requests.push(newRequest);
    await fs.writeFile(STATUS_REQUESTS_FILE, JSON.stringify(statusRequestsData, null, 2));

    await createActivity(
      'PATIENT_ACTIVATION_REQUEST',
      'Solicitud de alta de paciente',
      `El profesional ${name} ha solicitado dar de alta al paciente ${patient.name}`,
      {
        patientId,
        patientName: patient.name,
        professionalId: id,
        professionalName: name,
        reason
      }
    );

    res.json({ success: true, message: 'Solicitud de alta enviada correctamente' });
  } catch (error) {
    console.error('Error requesting patient activation:', error);
    res.status(500).json({ error: 'Error al solicitar el alta del paciente' });
  }
}

module.exports = {
  getAllPatients,
  getProfessionalPatients,
  assignPatient,
  addPatient,
  deletePatient,
  requestDischargePatient,
  requestActivationPatient
}; 