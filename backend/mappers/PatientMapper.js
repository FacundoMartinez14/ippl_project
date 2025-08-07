'use strict';
const PatientDTO = require('../dtos/PatientDTO');

function toPatientDTO(source) {
  const plain = typeof source.get === 'function'
    ? source.get({ plain: true })
    : source;
  return new PatientDTO(plain);
}

module.exports = { toPatientDTO };