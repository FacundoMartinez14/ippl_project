class UserDTO {
  constructor({ id, name, email, role, status, commission, saldoTotal, saldoPendiente, createdAt }) {
    this.id             = id;
    this.name           = name;
    this.email          = email;
    this.role           = role;
    this.status         = status;
    this.createdAt      = createdAt.toISOString();
    this.commission     = commission;
    this.saldoTotal     = saldoTotal;
    this.saldoPendiente = saldoPendiente;
  }
}
module.exports = UserDTO;