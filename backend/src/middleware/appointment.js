'use strict';

const { Appointment } = require('../../models');

module.exports = async function authorizeAppointmentEdit(req, res, next) {
  try {
    const { id } = req.params;

    // Trae solo lo necesario; si usas soft delete con deletedAt, compruébalo aquí
    const appt = await Appointment.findByPk(id, {
      attributes: ['id', 'professionalId', 'deletedAt'],
    });

    if (!appt || appt.deletedAt) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    const isAdmin = req.user?.role === 'admin';
    const isOwner = String(req.user?.id) === String(appt.professionalId);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    req.appointment = appt;

    return next();
  } catch (error) {
    console.error('[authorizeAppointmentEdit] Error:', error);
    return res.status(500).json({ message: 'Error al verificar permisos' });
  }
};
