'use strict';
const MedicalHistoryDTO = require('../dtos/MedicalHistoryDTO');

function toMedicalHistoryDTO(source) {
  return new MedicalHistoryDTO(source);
}

function toMedicalHistoryDTOList(list) {
  return list.map(toMedicalHistoryDTO);
}

module.exports = { toMedicalHistoryDTO, toMedicalHistoryDTOList };
