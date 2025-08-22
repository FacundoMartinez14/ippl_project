'use strict';
const ProfessionalDTO = require('../dtos/ProfessionalDTO');

function toProfessionalDTO(source) {
  return new ProfessionalDTO(source);
}

function toProfessionalDTOList(list) {
  return list.map(toProfessionalDTO);
}

module.exports = { toProfessionalDTO, toProfessionalDTOList };