'use strict';
const UserDTO = require('../dtos/UserDTO');

function toUserDTO(source) {
  const plain = typeof source.get === 'function'
    ? source.get({ plain: true })
    : source;
  return new UserDTO(plain);
}

module.exports = { toUserDTO };