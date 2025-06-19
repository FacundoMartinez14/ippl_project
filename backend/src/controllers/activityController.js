const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ACTIVITIES_FILE = path.join(__dirname, '../data/activities.json');

// Asegurarse de que el archivo de actividades existe
const initializeActivitiesFile = async () => {
  try {
    await fs.access(ACTIVITIES_FILE);
  } catch (error) {
    await fs.writeFile(ACTIVITIES_FILE, JSON.stringify({ activities: [] }));
  }
};

// Inicializar el archivo al cargar el controlador
initializeActivitiesFile();

const activityController = {
  // Obtener actividades recientes
  getRecentActivities: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const data = JSON.parse(await fs.readFile(ACTIVITIES_FILE, 'utf8'));
      
      // Ordenar por fecha y limitar la cantidad
      const activities = data.activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);

      res.json(activities);
    } catch (error) {
      console.error('Error al obtener actividades:', error);
      res.status(500).json({ message: 'Error al obtener actividades' });
    }
  },

  // Registrar una nueva actividad
  logActivity: async (req, res) => {
    try {
      const { type, description, actor } = req.body;

      if (!type || !description) {
        return res.status(400).json({ message: 'Tipo y descripción son requeridos' });
      }

      const newActivity = {
        id: uuidv4(),
        type,
        description,
        actor,
        timestamp: new Date().toISOString()
      };

      const data = JSON.parse(await fs.readFile(ACTIVITIES_FILE, 'utf8'));
      data.activities.push(newActivity);

      // Mantener solo las últimas 1000 actividades para no sobrecargar el archivo
      if (data.activities.length > 1000) {
        data.activities = data.activities
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 1000);
      }

      await fs.writeFile(ACTIVITIES_FILE, JSON.stringify(data, null, 2));
      res.status(201).json(newActivity);
    } catch (error) {
      console.error('Error al registrar actividad:', error);
      res.status(500).json({ message: 'Error al registrar actividad' });
    }
  }
};

module.exports = activityController; 