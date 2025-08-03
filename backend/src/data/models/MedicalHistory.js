class MedicalHistory {
  constructor(id, patientId, date, diagnosis, treatment, notes, professionalId) {
    this.id = id;
    this.patientId = patientId;
    this.date = date;
    this.diagnosis = diagnosis;
    this.treatment = treatment;
    this.notes = notes;
    this.professionalId = professionalId;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = MedicalHistory; 