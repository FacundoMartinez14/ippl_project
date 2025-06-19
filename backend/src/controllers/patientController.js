const fs = require('fs').promises;
const path = require('path');

const PATIENTS_FILE = path.join(__dirname, '../data/patients.json');

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
    const professionalPatients = patients.filter(p => p.professionalId === professionalId);
    
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
      nextAppointment, 
      textNote, 
      audioNote,
      sessionCost,
      commission
    } = req.body;
    
    const data = await fs.readFile(PATIENTS_FILE, 'utf8');
    const { patients } = JSON.parse(data);
    
    const patientIndex = patients.findIndex(p => p.id === patientId);
    
    if (patientIndex === -1) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }
    
    // Actualizar los datos del paciente
    patients[patientIndex] = {
      ...patients[patientIndex],
      professionalId,
      professionalName,
      status: status || patients[patientIndex].status,
      assignedAt: assignedAt || new Date().toISOString(),
      nextAppointment,
      textNote,
      audioNote,
      sessionCost,
      commission
    };
    
    await fs.writeFile(PATIENTS_FILE, JSON.stringify({ patients }, null, 2));
    
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

module.exports = {
  getAllPatients,
  getProfessionalPatients,
  assignPatient,
  addPatient,
  deletePatient
}; 