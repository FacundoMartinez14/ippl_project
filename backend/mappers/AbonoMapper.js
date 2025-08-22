'use strict';
const AbonoDTO = require('../dtos/AbonoDTO');

function toAbonoDTO(source) {
  return new AbonoDTO(source);
}

function toAbonoDTOList(list) {
  return list.map(toAbonoDTO);
}

module.exports = { toAbonoDTO, toAbonoDTOList };
