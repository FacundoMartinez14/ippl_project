'use strict';
const { Patient, Derivation } = require('../models');
const { toPatientDTO }          = require('../mappers/PatientMapper');
const { createActivity }        = require('./activityController');

// Obtener todos los pacientes con su última derivación
async function getAllPatients(req, res) {
  try {
    const patients = await Patient.findAll({
      where: { active: true },
      include: [{
        model: Derivation,
        as: 'derivations',
        limit: 1,
        order: [['createdAt', 'DESC']]
      }]
    });

    const dtos = patients.map(p => {
      const plain = p.get({ plain: true });
      const lastDer = plain.derivations[0] || {};
      const enriched = { ...plain, textNote: lastDer.textNote, audioNote: lastDer.audioNote };
      return toPatientDTO(enriched);
    });

    res.json({ patients: dtos });
  } catch (err) {
    console.error('Error al obtener pacientes:', err);
    res.status(500).json({ message: 'Error al obtener pacientes' });
  }
}


// Obtener pacientes de un profesional
async function getProfessionalPatients(req, res) {
  try {
    const { professionalId } = req.params;
    const patients = await Patient.findAll({
      where: { professionalId },
      include: [{
        model: Derivation,
        as: 'derivations',
        limit: 1,
        order: [['createdAt', 'DESC']]
      }]
    });

    const dtos = patients.map(p => {
      const plain = p.get({ plain: true });
      const lastDer = plain.derivations[0] || {};
      const enriched = { ...plain, textNote: lastDer.textNote, audioNote: lastDer.audioNote };
      return toPatientDTO(enriched);
    });

    res.json({ patients: dtos });
  } catch (err) {
    console.error('Error al obtener pacientes del profesional:', err);
    res.status(500).json({ message: 'Error al obtener pacientes' });
  }
}

async function assignPatient(req, res) {
  try {
    const { patientId } = req.params;
    const {
      professionalId,
      professionalName,
      status,
      assignedAt,
      textNote,
      audioNote,
      sessionFrequency,
      statusChangeReason
    } = req.body;

    const patient = await Patient.findByPk(patientId);
    if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });

    if (professionalId !== undefined)   patient.professionalId   = professionalId;
    if (professionalName !== undefined) patient.professionalName = professionalName;
    if (status !== undefined)           patient.status           = status;
    if (assignedAt !== undefined)       patient.assignedAt       = new Date(assignedAt);
    if (sessionFrequency)               patient.sessionFrequency = sessionFrequency;
    await patient.save();

    const derivation = await Derivation.create({
      patientId,
      professionalId,
      textNote,
      audioNote,
      sessionFrequency,
      statusChangeReason
    });

    // 3) Log de actividad
    await createActivity(
      'PATIENT_ASSIGNED',
      'Paciente asignado',
      `Paciente ${patient.name} derivado al profesional ID ${professionalId}`,
      { patientId, professionalId, sessionFrequency }
    );

    // Enriquecer y devolver DTO
    const plain = patient.get({ plain: true });
    const enriched = { ...plain, textNote: derivation.textNote, audioNote: derivation.audioNote };
    return res.json(toPatientDTO(enriched));
  } catch (err) {
    console.error('Error al asignar paciente:', err);
    res.status(500).json({ message: 'Error al asignar paciente' });
  }
}

async function addPatient(req, res) {
  try {
    const { name, description } = req.body;
    const patient = await Patient.create({ name, description, status: 'pending' });

    return res.status(201).json(toPatientDTO(patient));
  } catch (err) {
    console.error('Error al agregar paciente:', err);

    return res.status(500).json({ message: 'Error al agregar paciente' });
  }
}

async function deletePatient(req, res) {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id);
    if (!patient || !patient.active) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    // Soft delete
    patient.active = false;
    await patient.save();
    return res.json({ message: 'Paciente eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar paciente:', err);
    return res.status(500).json({ message: 'Error al eliminar paciente' });
  }
}


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