'use strict';

function toIso(v) {
  if (!v) return undefined;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

class StatusRequestDTO {
  constructor(sr) {
    const {
      id,
      patientId, patientName,
      professionalId, professionalName,
      currentStatus, requestedStatus,
      reason, status, adminResponse,
      createdAt, updatedAt,
      type: persistedType,
    } = typeof sr.get === 'function' ? sr.get({ plain: true }) : sr;

    const validTypes = new Set(['activation', 'status_change']);

    const inferredType =
      (currentStatus === 'pending' && requestedStatus !== 'pending')
        ? 'activation'
        : 'status_change';

    const type = validTypes.has(persistedType) ? persistedType : inferredType;

    this.id = String(id);
    this.patientId = patientId != null ? String(patientId) : undefined;
    this.patientName = patientName ?? undefined;
    this.professionalId = professionalId != null ? String(professionalId) : undefined;
    this.professionalName = professionalName ?? undefined;

    this.currentStatus = currentStatus;
    this.requestedStatus = requestedStatus;

    this.reason = reason ?? '';
    this.status = status;
    this.adminResponse = adminResponse ?? undefined;

    this.createdAt = toIso(createdAt);
    this.updatedAt = toIso(updatedAt);

    this.type = type;
  }
}

module.exports = StatusRequestDTO;
