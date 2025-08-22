const { Op } = require('sequelize');
const { Appointment, Patient, User } = require('../../models');
const { toAppointmentDTO, toAppointmentDTOList } = require('../../mappers/AppointmentMapper');

function toMinutes(hhmm) {
  const [h, m] = String(hhmm || '').split(':').map((x) => parseInt(x, 10));
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

function toAmount(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const getAllAppointments = async (req, res) => {
  try {
    const appts = await Appointment.findAll({
      where: { active: true },
      order: [
        ['date', 'DESC'],
        ['startTime', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });

    return res.json({ appointments: toAppointmentDTOList(appts) });
  } catch (error) {
    console.error('Error al obtener citas:', error);
    return res.status(500).json({ message: 'Error al obtener citas' });
  }
};

const getProfessionalAppointments = async (req, res) => {
  try {
    const { professionalId } = req.params;

    const appts = await Appointment.findAll({
      where: { active: true, professionalId },
      order: [
        ['date', 'DESC'],
        ['startTime', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });

    return res.json({ appointments: toAppointmentDTOList(appts) });
  } catch (error) {
    console.error('Error al obtener citas del profesional:', error);
    return res.status(500).json({ message: 'Error al obtener citas' });
  }
};

const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appts = await Appointment.findAll({
      where: { active: true, patientId },
      order: [
        ['date', 'DESC'],
        ['startTime', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });

    return res.json({ appointments: toAppointmentDTOList(appts) });
  } catch (error) {
    console.error('Error al obtener citas del paciente:', error);
    return res.status(500).json({ message: 'Error al obtener citas' });
  }
};

const createAppointment = async (req, res) => {
  try {
    const {
      patientId,
      professionalId,
      date,
      startTime,
      endTime,
      type = 'regular',
      notes,
      audioNote,
      sessionCost,
    } = req.body;

    // 1) Validaciones básicas
    if (!patientId || !professionalId || !date || !startTime || !endTime) {
      return res.status(400).json({
        message:
          'Faltan campos requeridos (patientId, professionalId, date, startTime, endTime)',
      });
    }
    if (toMinutes(endTime) <= toMinutes(startTime)) {
      return res.status(400).json({ message: 'endTime debe ser mayor que startTime' });
    }

    // 2) Snapshots de nombres (si no existen, seguimos con texto por defecto)
    const [patient, professional] = await Promise.all([
      Patient.findByPk(patientId, { attributes: ['id', 'name'] }),
      User.findByPk(professionalId, { attributes: ['id', 'name'] }),
    ]);

    // 3) Chequeo de solapamientos: misma fecha/profesional, activo y no cancelado
    const sameDay = await Appointment.findAll({
      where: {
        active: true,
        professionalId,
        date,
        status: { [Op.ne]: 'cancelled' },
      },
      attributes: ['id', 'startTime', 'endTime'],
    });
    const newStart = toMinutes(startTime);
    const newEnd = toMinutes(endTime);
    const overlaps = sameDay.some((a) => {
      const s = toMinutes(a.startTime);
      const e = toMinutes(a.endTime);
      // Solapa si empieza antes de que termine la otra y termina después de que empieza la otra
      return newStart < e && s < newEnd;
    });
    if (overlaps) {
      return res.status(400).json({ message: 'El horario seleccionado no está disponible' });
    }

    // 4) Saneos / normalizaciones
    const safeAudio =
      audioNote && typeof audioNote === 'string' && audioNote.startsWith('/uploads/')
        ? audioNote
        : null;

    const sessionCostNum = toAmount(sessionCost);
    // Como no hay paymentAmount en el DTO de creación, asumimos 0 al calcular remainingBalance
    const paymentAmountNum = 0;
    const remainingBalanceNum =
      sessionCostNum !== null ? Math.max(sessionCostNum - paymentAmountNum, 0) : null;

    // 5) Crear cita (status fijo 'scheduled'; completedAt lo setean hooks al marcar 'completed')
    const created = await Appointment.create({
      patientId,
      patientName: patient?.name || 'Paciente no encontrado',
      professionalId,
      professionalName: professional?.name || 'Profesional no encontrado',
      date,
      startTime,
      endTime,
      type,                 // 'regular' | 'first_time' | 'emergency'
      status: 'scheduled',  // ← forzado al crear
      notes: notes ?? null,
      audioNote: safeAudio,
      sessionCost: sessionCostNum,
      attended: null,               // no viene en el DTO de creación
      paymentAmount: null,          // no viene en el DTO de creación
      remainingBalance: remainingBalanceNum,
      // active: true por defecto (soft delete en el modelo)
    });

    return res.status(201).json(toAppointmentDTO(created));
  } catch (error) {
    console.error('[createAppointment] Error al crear cita:', error);
    return res.status(500).json({ message: 'Error al crear cita', error: error.message });
  }
};


const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const appt = await Appointment.findByPk(id);
    if (!appt || appt.active === false) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    // Campos permitidos
    const updates = {};
    const fields = [
      'date', 'startTime', 'endTime',
      'type', 'status',
      'notes', 'audioNote',
      'sessionCost', 'attended',
      'paymentAmount', // remainingBalance lo recalculamos
      'patientId', 'professionalId',
    ];
    for (const f of fields) if (body[f] !== undefined) updates[f] = body[f];

    // Normalizar attended (acepta string "true"/"false")
    if (updates.attended !== undefined) {
      if (typeof updates.attended === 'string') {
        updates.attended = updates.attended.toLowerCase() === 'true';
      } else {
        updates.attended = !!updates.attended;
      }
    }

    // Saneo de audioNote (solo rutas internas)
    if (updates.audioNote !== undefined) {
      const v = updates.audioNote;
      updates.audioNote =
        v && typeof v === 'string' && v.startsWith('/uploads/') ? v : null;
    }

    // Si cambian fecha/hora/profesional → validar (end > start) + solapamientos
    const newDate  = updates.date          ?? appt.date;
    const newStart = updates.startTime     ?? appt.startTime;
    const newEnd   = updates.endTime       ?? appt.endTime;
    const newProf  = updates.professionalId ?? appt.professionalId;

    if (newStart && newEnd && toMinutes(newEnd) <= toMinutes(newStart)) {
      return res.status(400).json({ message: 'endTime debe ser mayor que startTime' });
    }

    if (
      updates.date !== undefined ||
      updates.startTime !== undefined ||
      updates.endTime !== undefined ||
      updates.professionalId !== undefined
    ) {
      const sameDay = await Appointment.findAll({
        where: {
          id: { [Op.ne]: appt.id },
          active: true,
          professionalId: newProf,
          date: newDate,
          status: { [Op.ne]: 'cancelled' },
        },
        attributes: ['id', 'startTime', 'endTime'],
      });

      const nS = toMinutes(newStart);
      const nE = toMinutes(newEnd);
      const overlaps = sameDay.some(a => {
        const s = toMinutes(a.startTime);
        const e = toMinutes(a.endTime);
        return nS < e && s < nE;
      });
      if (overlaps) {
        return res.status(400).json({ message: 'El horario seleccionado no está disponible' });
      }
    }

    // Refrescar snapshots si cambian IDs
    if (updates.patientId !== undefined) {
      const patient = await Patient.findByPk(updates.patientId, { attributes: ['id', 'name'] });
      updates.patientName = patient?.name || 'Paciente no encontrado';
    }
    if (updates.professionalId !== undefined) {
      const prof = await User.findByPk(updates.professionalId, { attributes: ['id', 'name'] });
      updates.professionalName = prof?.name || 'Profesional no encontrado';
    }

    // Normalizar montos y recalcular remainingBalance si corresponde
    let recalcRB = false;

    if (updates.sessionCost !== undefined) {
      updates.sessionCost = toAmount(updates.sessionCost);
      recalcRB = true;
    }
    if (updates.paymentAmount !== undefined) {
      updates.paymentAmount = toAmount(updates.paymentAmount);
      recalcRB = true;
    }

    if (recalcRB) {
      const sc = updates.sessionCost   !== undefined ? (updates.sessionCost   ?? 0) : (toAmount(appt.sessionCost)   ?? 0);
      const pa = updates.paymentAmount !== undefined ? (updates.paymentAmount ?? 0) : (toAmount(appt.paymentAmount) ?? 0);
      updates.remainingBalance = Math.max(sc - pa, 0);
    }

    // Actualizar (los hooks del modelo ajustan completedAt si cambia status)
    await appt.update(updates);
    await appt.reload();

    return res.json(toAppointmentDTO(appt));
  } catch (error) {
    console.error('[updateAppointment] Error:', error);
    return res.status(500).json({ message: 'Error al actualizar cita', error: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appt = await Appointment.findByPk(id);
    if (!appt || appt.active === false) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    await appt.update({ active: false });
    await appt.reload();

    return res.json({
      message: 'Cita eliminada correctamente',
      appointment: toAppointmentDTO(appt),
    });
  } catch (error) {
    console.error('[deleteAppointment] Error al eliminar cita:', error);
    return res.status(500).json({
      message: 'Error al eliminar la cita',
      error: error.message,
    });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { professionalId } = req.params;
    const { date } = req.query;

    if (!professionalId || !date) {
      return res.status(400).json({ message: 'professionalId y date son requeridos' });
    }

    // Traer citas activas del profesional para ese día (excepto canceladas)
    const dayAppointments = await Appointment.findAll({
      where: {
        active: true,
        professionalId,
        date,
        status: { [Op.ne]: 'cancelled' },
      },
      attributes: ['startTime', 'endTime'],
      order: [['startTime', 'ASC']],
    });

    // Generar slots de 60 min entre 09:00 y 17:00 (inclusive 17:00 como en tu implementación original)
    const allSlots = Array.from({ length: 9 }, (_, i) => fmt(9 + i)); // 09:00 ... 17:00
    const SLOT_MINUTES = 60;

    const availableSlots = allSlots.filter((slot) => {
      const sStart = toMinutes(slot);
      const sEnd = sStart + SLOT_MINUTES;

      // Excluir si solapa con alguna cita existente
      const overlaps = dayAppointments.some((a) => {
        const aStart = toMinutes(a.startTime);
        const aEnd = toMinutes(a.endTime);
        // solapan si el inicio del slot es antes del fin de la cita y
        // el inicio de la cita es antes del fin del slot
        return sStart < aEnd && aStart < sEnd;
      });

      return !overlaps;
    });

    return res.json({ slots: availableSlots });
  } catch (error) {
    console.error('Error al obtener slots disponibles:', error);
    return res.status(500).json({ message: 'Error al obtener slots disponibles' });
  }
};

const getUpcomingAppointments = async (req, res) => {
  try {
    const appts = await Appointment.findAll({
      where: {
        active: true,
        status: 'scheduled',
        // Fecha >= hoy (según la BD)
        date: { [Op.gte]: fn('CURRENT_DATE') },
      },
      order: [
        ['date', 'ASC'],
        ['startTime', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });

    return res.json({ appointments: toAppointmentDTOList(appts) });
  } catch (error) {
    console.error('Error al obtener citas próximas:', error);
    return res.status(500).json({ message: 'Error al obtener citas próximas' });
  }
};

module.exports = {
  getAllAppointments,
  getProfessionalAppointments,
  getPatientAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots,
  getUpcomingAppointments
}; 