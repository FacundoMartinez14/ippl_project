'use strict';
const AppointmentDTO = require('../dtos/AppointmentDTO');

function toAppointmentDTO(source) {
  return new AppointmentDTO(source);
}

function toAppointmentDTOList(list) {
  return list.map(toAppointmentDTO);
}

module.exports = { toAppointmentDTO, toAppointmentDTOList };
