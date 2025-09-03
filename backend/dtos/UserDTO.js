function toNumber(v) {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

class UserDTO {
  constructor({ id, name, email, role, status, commission, saldoTotal, saldoPendiente, createdAt }) {
    this.id             = id;
    this.name           = name;
    this.email          = email;
    this.role           = role;
    this.status         = status;
    this.createdAt      = createdAt.toISOString();
    this.commission     = commission;
    this.saldoTotal     = toNumber(saldoTotal);
    this.saldoPendiente = toNumber(saldoPendiente);
  }
}
module.exports = UserDTO;