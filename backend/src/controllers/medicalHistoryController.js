const fs = require('fs').promises;
const path = require('path');
const MedicalHistory = require('../data/models/MedicalHistory');
const { v4: uuidv4 } = require('uuid');

const MEDICAL_HISTORY_FILE = path.join(__dirname, '../data/medical-histories.json');

// Asegurarse de que el archivo existe
const initializeDatabase = async () => {
  try {
    await fs.access(MEDICAL_HISTORY_FILE);
  } catch (error) {
    // Si el archivo no existe, créalo con un array vacío
    await fs.writeFile(MEDICAL_HISTORY_FILE, '[]');
    console.log('Created medical histories database file');
  }
};

// Inicializar la base de datos al cargar el controlador
initializeDatabase().catch(console.error);

const getMedicalHistories = async (req, res) => {
  try {
    const data = await fs.readFile(MEDICAL_HISTORY_FILE, 'utf8');
    const histories = JSON.parse(data);
    
    // Si viene de la ruta /patient/:patientId
    if (req.params.patientId) {
      const patientHistories = histories.filter(h => h.patientId === req.params.patientId);
      return res.json(patientHistories);
    }
    
    // Si viene de la ruta /professional/:professionalId
    if (req.params.professionalId) {
      const professionalHistories = histories.filter(h => h.professionalId === req.params.professionalId);
      return res.json(professionalHistories);
    }
    
    // Si se proporciona un patientId como query parameter
    if (req.query.patientId) {
      const patientHistories = histories.filter(h => h.patientId === req.query.patientId);
      return res.json(patientHistories);
    }
    
    // Si se proporciona un professionalId como query parameter
    if (req.query.professionalId) {
      const professionalHistories = histories.filter(h => h.professionalId === req.query.professionalId);
      return res.json(professionalHistories);
    }
    
    res.json(histories);
  } catch (error) {
    console.error('Error al obtener los historiales médicos:', error);
    res.status(500).json({ message: 'Error al obtener los historiales médicos' });
  }
};

const getMedicalHistoryById = async (req, res) => {
  try {
    const data = await fs.readFile(MEDICAL_HISTORY_FILE, 'utf8');
    const histories = JSON.parse(data);
    const history = histories.find(h => h.id === req.params.id);
    
    if (!history) {
      return res.status(404).json({ message: 'Historial médico no encontrado' });
    }
    
    res.json(history);
  } catch (error) {
    console.error('Error al obtener el historial médico:', error);
    res.status(500).json({ message: 'Error al obtener el historial médico' });
  }
};

const createMedicalHistory = async (req, res) => {
  try {
    const { patientId, date, diagnosis, treatment, notes } = req.body;
    const professionalId = req.user.id; // Asumiendo que el ID del profesional viene del token

    const newHistory = new MedicalHistory(
      uuidv4(),
      patientId,
      date,
      diagnosis,
      treatment,
      notes,
      professionalId
    );

    const data = await fs.readFile(MEDICAL_HISTORY_FILE, 'utf8');
    const histories = JSON.parse(data);
    histories.push(newHistory);
    
    await fs.writeFile(MEDICAL_HISTORY_FILE, JSON.stringify(histories, null, 2));
    
    res.status(201).json(newHistory);
  } catch (error) {
    console.error('Error al crear el historial médico:', error);
    res.status(500).json({ message: 'Error al crear el historial médico' });
  }
};

const updateMedicalHistory = async (req, res) => {
  try {
    const { diagnosis, treatment, notes } = req.body;
    const historyId = req.params.id;

    const data = await fs.readFile(MEDICAL_HISTORY_FILE, 'utf8');
    const histories = JSON.parse(data);
    
    const historyIndex = histories.findIndex(h => h.id === historyId);
    
    if (historyIndex === -1) {
      return res.status(404).json({ message: 'Historial médico no encontrado' });
    }

    // Verificar que el profesional que intenta actualizar es el mismo que lo creó
    if (req.user.role !== 'admin' && histories[historyIndex].professionalId !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para modificar este historial' });
    }

    // Actualizar solo los campos proporcionados
    histories[historyIndex] = {
      ...histories[historyIndex],
      diagnosis: diagnosis || histories[historyIndex].diagnosis,
      treatment: treatment || histories[historyIndex].treatment,
      notes: notes || histories[historyIndex].notes,
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(MEDICAL_HISTORY_FILE, JSON.stringify(histories, null, 2));
    
    res.json(histories[historyIndex]);
  } catch (error) {
    console.error('Error al actualizar el historial médico:', error);
    res.status(500).json({ message: 'Error al actualizar el historial médico' });
  }
};

const deleteMedicalHistory = async (req, res) => {
  try {
    const historyId = req.params.id;
    
    const data = await fs.readFile(MEDICAL_HISTORY_FILE, 'utf8');
    const histories = JSON.parse(data);
    
    const filteredHistories = histories.filter(h => h.id !== historyId);
    
    if (filteredHistories.length === histories.length) {
      return res.status(404).json({ message: 'Historial médico no encontrado' });
    }
    
    await fs.writeFile(MEDICAL_HISTORY_FILE, JSON.stringify(filteredHistories, null, 2));
    
    res.json({ message: 'Historial médico eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el historial médico:', error);
    res.status(500).json({ message: 'Error al eliminar el historial médico' });
  }
};

module.exports = {
  getMedicalHistories,
  getMedicalHistoryById,
  createMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory
}; 