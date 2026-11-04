
export default class AlarmSystem {
  constructor(audio) {
    this.audio = audio;
    this.active = false;
    this.elapsed = 0;
  }

  activate() {
    if (this.active) return;

    this.active = true;
    this.elapsed = 0;
  }

  update(delta) {
    if (!this.active) return;

    this.elapsed += delta;
  }

  deactivate() {
    this.active = false;
    this.elapsed = 0;
  }

  getStatus() {
    return this.active ? "ATIVADO" : "INATIVO";
  }
}
