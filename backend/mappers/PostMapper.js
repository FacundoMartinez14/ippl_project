'use strict';
const PostDTO = require('../dtos/PostDTO');

function toPostDTO(source) {
  return new PostDTO(source);
}

function toPostDTOList(list) {
  return list.map(toPostDTO);
}

module.exports = { toPostDTO, toPostDTOList };
