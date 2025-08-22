'use strict';
const MessageDTO = require('../dtos/MessageDTO');

function toMessageDTO(source) {
  return new MessageDTO(source);
}

function toMessageDTOList(list) {
  return list.map(toMessageDTO);
}

module.exports = { toMessageDTO, toMessageDTOList };
