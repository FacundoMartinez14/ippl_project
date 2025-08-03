const fs = require('fs').promises;
const path = require('path');
const Activity = require('../data/models/Activity');

const ACTIVITIES_FILE = path.join(__dirname, '../data/activities.json');

// Helper function to read activities
async function readActivities() {
  try {
    const data = await fs.readFile(ACTIVITIES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper function to write activities
async function writeActivities(activities) {
  await fs.writeFile(ACTIVITIES_FILE, JSON.stringify(activities, null, 2));
}

// Crear una nueva actividad
async function createActivity(type, title, description, metadata = {}) {
  try {
    const activities = await readActivities();
    const newActivity = new Activity(type, title, description, metadata);
    activities.unshift(newActivity); // Agregar al inicio para mostrar las más recientes primero
    await writeActivities(activities);
    return newActivity;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
}

// Obtener todas las actividades
async function getActivities(req, res) {
  try {
    const activities = await readActivities();
    // Filtrar actividades relevantes para notificaciones del sistema
    const relevantTypes = [
      'PATIENT_DISCHARGE_REQUEST',
      'PATIENT_ACTIVATION_REQUEST',
      'STATUS_CHANGE_APPROVED',
      'STATUS_CHANGE_REJECTED',
      'FREQUENCY_CHANGE_REQUEST',
      'FREQUENCY_CHANGE_APPROVED',
      'FREQUENCY_CHANGE_REJECTED'
    ];
    const systemNotifications = activities.filter(activity => relevantTypes.includes(activity.type));
    res.json(systemNotifications);
  } catch (error) {
    console.error('Error getting activities:', error);
    res.status(500).json({ error: 'Error al obtener las actividades' });
  }
}

// Marcar una actividad como leída
async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const activities = await readActivities();
    const activityIndex = activities.findIndex(a => a._id === id);
    
    if (activityIndex === -1) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    activities[activityIndex].read = true;
    await writeActivities(activities);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking activity as read:', error);
    res.status(500).json({ error: 'Error al marcar la actividad como leída' });
  }
}

// Marcar todas las actividades como leídas
async function markAllAsRead(req, res) {
  try {
    const activities = await readActivities();
    const updatedActivities = activities.map(activity => ({ ...activity, read: true }));
    await writeActivities(updatedActivities);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all activities as read:', error);
    res.status(500).json({ error: 'Error al marcar todas las actividades como leídas' });
  }
}

// Obtener el conteo de actividades no leídas
async function getUnreadCount(req, res) {
  try {
    const activities = await readActivities();
    const count = activities.filter(activity => !activity.read).length;
    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Error al obtener el conteo de actividades no leídas' });
  }
}

// Limpiar todas las actividades
async function clearAllActivities(req, res) {
  try {
    await writeActivities([]);
    res.json({ success: true, message: 'Todas las actividades han sido eliminadas' });
  } catch (error) {
    console.error('Error clearing activities:', error);
    res.status(500).json({ error: 'Error al limpiar las actividades' });
  }
}

module.exports = {
  createActivity,
  getActivities,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  clearAllActivities
}; 