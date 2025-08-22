'use strict';

class ProfessionalDTO {
  constructor(source) {
    const s = typeof source.get === 'function' ? source.get({ plain: true }) : source;

    this.id    = String(s.id);
    this.name  = s.name;
    this.email = s.email;
    this.role  = 'professional';

    // Si en el futuro agregás una columna User.speciality, se mapeará aquí.
    // Por ahora, quedará undefined si no existe.
    this.speciality = s.speciality ?? undefined;
  }
}

module.exports = ProfessionalDTO;