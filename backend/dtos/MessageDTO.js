'use strict';

class MessageDTO {
  constructor(source) {
    const m = typeof source.get === 'function' ? source.get({ plain: true }) : source;

    this._id = String(m.id);
    this.nombre = m.nombre;
    this.apellido = m.apellido;
    this.correoElectronico = m.correoElectronico;
    this.mensaje = m.mensaje;
    this.fecha = (m.fecha ? new Date(m.fecha) : new Date(m.createdAt)).toISOString();
    this.leido = !!m.leido;
  }
}

module.exports = MessageDTO;
