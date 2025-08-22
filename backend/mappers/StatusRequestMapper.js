'use strict';
const StatusRequestDTO = require('../dtos/StatusRequestDTO');

function toStatusRequestDTO(source) {
  const plain = typeof source.get === 'function' ? source.get({ plain: true }) : source;
  return new StatusRequestDTO(plain);
}
function toStatusRequestDTOList(list) {
  return list.map(toStatusRequestDTO);
}

module.exports = { toStatusRequestDTO, toStatusRequestDTOList };
