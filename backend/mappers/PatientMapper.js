'use strict';
const PatientDTO = require('../dtos/PatientDTO');

function toPatientDTO(source) {
  const plain = typeof source.get === 'function'
    ? source.get({ plain: true })
    : source;
  return new PatientDTO(plain);
}

function toPatientDTOList(list) {
  return list.map(toPatientDTO);
}

module.exports = { toPatientDTO, toPatientDTOList };
