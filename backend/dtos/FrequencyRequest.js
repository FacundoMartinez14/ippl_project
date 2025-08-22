'use strict';

class FrequencyRequestDTO {
  constructor(source) {
    const r = typeof source.get === 'function' ? source.get({ plain: true }) : source;

    this.id = String(r.id);
    this.patientId = String(r.patientId);
    this.patientName = r.patientName;

    // Si el profesional pudo quedar en null (p. ej. borrado físico), devolvemos string vacío para respetar el tipo del cliente.
    this.professionalId = r.professionalId != null ? String(r.professionalId) : '';
    this.professionalName = r.professionalName;

    this.currentFrequency = r.currentFrequency;     // 'weekly' | 'biweekly' | 'monthly'
    this.requestedFrequency = r.requestedFrequency; // 'weekly' | 'biweekly' | 'monthly'
    this.reason = r.reason;
    this.status = r.status;                         // 'pending' | 'approved' | 'rejected'

    // Sólo incluir si viene con contenido
    if (r.adminResponse != null && r.adminResponse !== '') {
      this.adminResponse = r.adminResponse;
    }

    this.createdAt = new Date(r.createdAt).toISOString();
    if (r.updatedAt) {
      this.updatedAt = new Date(r.updatedAt).toISOString();
    }
  }
}

module.exports = FrequencyRequestDTO;
