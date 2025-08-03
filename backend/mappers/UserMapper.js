const UserDTO = require('../dtos/UserDTO');
function toUserDTO(userModel) {
    const plain = userModel.get({ plain: true });
  return new UserDTO(plain);
}
module.exports = { toUserDTO };