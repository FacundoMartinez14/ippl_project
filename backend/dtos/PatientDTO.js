'use strict';
class PatientDTO {
  constructor({
    id,
    name,
    status,
    professionalId,
    professionalName,
    description,
    email,
    phone,
    createdAt,
    assignedAt,
    sessionFrequency,
    textNote,
    audioNote
  }) {
    this.id = String(id);
    this.name = name;
    this.status = status;
    this.professionalId = professionalId ? String(professionalId) : undefined;
    this.professionalName = professionalName;
    this.description = description;
    this.email = email;
    this.phone = phone;
    this.createdAt = createdAt.toISOString();
    this.assignedAt = assignedAt?.toISOString();
    this.sessionFrequency = sessionFrequency;
    this.textNote = textNote;
    this.audioNote = audioNote;
  }
}
module.exports = PatientDTO;
