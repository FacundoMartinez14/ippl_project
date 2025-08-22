const { Activity } = require('../../models');
const { toActivityDTO, toActivityDTOList } = require('../../mappers/ActivityMapper');

// Crear una nueva actividad
async function createActivity(type, title, description, metadata = {}) {
  try {
    const patientId = metadata?.patientId ?? null;
    const professionalId = metadata?.professionalId ?? null;

    const created = await Activity.create({
      type,
      title,
      description,
      metadata,
      occurredAt: new Date(),
      patientId,
      professionalId,
    });

    return toActivityDTO(created);
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
}

// Obtener todas las actividades
async function getActivities(req, res) {
  try {
    // Incluyo ambos sufijos por compatibilidad: REQUEST vs REQUESTED
    const relevantTypes = [
      'PATIENT_DISCHARGE_REQUEST',
      'PATIENT_ACTIVATION_REQUEST',
      'STATUS_CHANGE_APPROVED',
      'STATUS_CHANGE_REJECTED',
      'FREQUENCY_CHANGE_REQUEST',
      'FREQUENCY_CHANGE_APPROVED',
      'FREQUENCY_CHANGE_REJECTED'
    ];

    const activities = await Activity.findAll({
      where: { type: relevantTypes },
      order: [['occurredAt', 'DESC']],
      // Opcional: limit/offset vía querystring si lo necesitas
      // limit: Number(req.query.limit) || 100,
      // offset: Number(req.query.offset) || 0,
    });

    // Devolvemos array (igual que antes), pero mapeado a DTO
    console.log(activities);
    res.json(toActivityDTOList(activities));
  } catch (error) {
    console.error('Error getting activities:', error);
    res.status(500).json({ error: 'Error al obtener las actividades' });
  }
}

// Marcar una actividad como leída
async function markAsRead(req, res) {
  try {
    const { id } = req.params; // el cliente envía _id como string; acá usamos la PK "id"
    const activity = await Activity.findByPk(id);
    if (!activity) return res.status(404).json({ error: 'Actividad no encontrada' });

    if (!activity.read) await activity.update({ read: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking activity as read:', error);
    res.status(500).json({ error: 'Error al marcar la actividad como leída' });
  }
}

// Marcar todas las actividades como leídas
async function markAllAsRead(req, res) {
  try {
    await Activity.update({ read: true }, { where: { read: false } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all activities as read:', error);
    res.status(500).json({ error: 'Error al marcar todas las actividades como leídas' });
  }
}

// Obtener el conteo de actividades no leídas
async function getUnreadCount(req, res) {
  try {
    const count = await Activity.count({
      where: { read: false, type: { [Op.in]: CLIENT_ACTIVITY_TYPES } },
    });
    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Error al obtener el conteo de actividades no leídas' });
  }
}

// Limpiar todas las actividades
async function clearAllActivities(req, res) {
  try {
    await Activity.destroy({ where: {} });
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