'use strict';

function toIso(value) {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

class ActivityDTO {
  constructor({
    id,
    type,
    title,
    description,
    occurredAt, // <- columna en BD
    metadata,
    read,
  }) {
    this._id = String(id);
    this.type = type;
    this.title = title;
    this.description = description;
    this.date  = toIso(occurredAt);
    this.read = !!read;
    this.metadata = metadata ?? undefined;
    this.id = this._id;
    this.createdAt = this.date;
  }
}

module.exports = ActivityDTO;
