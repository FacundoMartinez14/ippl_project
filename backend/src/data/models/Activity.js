class Activity {
  constructor(type, title, description, metadata = {}) {
    this._id = Date.now().toString();
    this.type = type;
    this.title = title;
    this.description = description;
    this.date = new Date().toISOString();
    this.metadata = metadata;
    this.read = false;
  }
}

module.exports = Activity; 