'use strict';
const ActivityDTO = require('../dtos/ActivityDTO');

function toActivityDTO(source) {
  const plain = typeof source.get === 'function' ? source.get({ plain: true }) : source;
  return new ActivityDTO(plain);
}

function toActivityDTOList(list) {
  return list.map(toActivityDTO);
}

module.exports = { toActivityDTO, toActivityDTOList };
