
export default class DetectorSystem {
  constructor() {
    this.active = true;
    this.detected = false;
    this.sensitivity = 0.75;
    this.lastDetection = null;
  }

  detect() {
    if (!this.active) return false;

    this.detected = true;
    this.lastDetection = new Date();

    return true;
  }

  reset() {
    this.detected = false;
    this.lastDetection = null;
  }

  setSensitivity(value) {
    this.sensitivity = Math.max(0, Math.min(1, value));
  }

  getStatus() {
    if (!this.active) return "DESATIVADO";

    return this.detected
      ? "FUMAÇA DETECTADA"
      : "OPERACIONAL";
  }
}
