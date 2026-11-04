
export default class EmergencySystem {
  constructor() {
    this.active = false;
    this.startedAt = null;
    this.status = "NORMAL";
  }

  activate() {
    this.active = true;
    this.startedAt = Date.now();
    this.status = "EMERGÊNCIA";
  }

  deactivate() {
    this.active = false;
    this.startedAt = null;
    this.status = "NORMAL";
  }

  getElapsedTime() {
    if (!this.startedAt) return 0;

    return Math.floor((Date.now() - this.startedAt) / 1000);
  }

  getStatus() {
    return this.status;
  }
}
