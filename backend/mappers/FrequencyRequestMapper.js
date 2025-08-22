'use strict';
const FrequencyRequestDTO = require('../dtos/FrequencyRequestDTO');

function toFrequencyRequestDTO(source) {
  return new FrequencyRequestDTO(source);
}

function toFrequencyRequestDTOList(list) {
  return list.map(toFrequencyRequestDTO);
}

module.exports = { toFrequencyRequestDTO, toFrequencyRequestDTOList };
