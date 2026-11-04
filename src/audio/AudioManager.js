
export default class AudioManager {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.volume = 0.65;
    this.initialized = false;
    this.activeOscillators = new Set();
  }

  // Inicializa o sistema de áudio
  async init() {
    if (this.initialized) {
      await this.resume();
      return;
    }

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      console.warn("Web Audio API não disponível.");
      return;
    }

    this.context = new AudioContextClass();

    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = this.volume;

    this.masterGain.connect(this.context.destination);

    this.initialized = true;

    await this.resume();
  }

  // Retoma o áudio após interação do usuário
  async resume() {
    if (
      this.context &&
      this.context.state === "suspended"
    ) {
      await this.context.resume();
    }
  }

  // Controla o volume geral
  setVolume(value) {
    this.volume = Math.max(
      0,
      Math.min(1, Number(value))
    );

    if (this.masterGain && this.context) {
      this.masterGain.gain.setTargetAtTime(
        this.volume,
        this.context.currentTime,
        0.05
      );
    }
  }

  // Cria um tom sonoro
  playTone(frequency, duration = 0.2, type = "sine") {
    if (!this.initialized || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();

    const now = this.context.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + duration
    );

    oscillator.connect(gain);
    gain.connect(this.masterGain);

    this.activeOscillators.add(oscillator);

    oscillator.onended = () => {
      this.activeOscillators.delete(oscillator);
      oscillator.disconnect();
      gain.disconnect();
    };

    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  }

  // Som de alerta de emergência
  async playAlert() {
    await this.init();

    if (!this.context) return;

    const sequence = [
      { frequency: 880, duration: 0.25 },
      { frequency: 660, duration: 0.25 },
      { frequency: 880, duration: 0.25 },
      { frequency: 660, duration: 0.25 }
    ];

    let delay = 0;

    for (const tone of sequence) {
      setTimeout(() => {
        this.playTone(
          tone.frequency,
          tone.duration,
          "square"
        );
      }, delay);

      delay += 350;
    }
  }

  // Som de confirmação
  async playConfirm() {
    await this.init();

    this.playTone(660, 0.12);
    setTimeout(() => this.playTone(880, 0.16), 130);
  }

  // Som de clique
  async playClick() {
    await this.init();

    this.playTone(520, 0.07, "sine");
  }

  // Som de finalização
  async playSuccess() {
    await this.init();

    this.playTone(523, 0.15);
    setTimeout(() => this.playTone(659, 0.15), 180);
    setTimeout(() => this.playTone(784, 0.25), 360);
  }

  // Interrompe os sons em execução
  stopAll() {
    for (const oscillator of this.activeOscillators) {
      try {
        oscillator.stop();
      } catch {
        // O oscilador pode já ter sido finalizado.
      }
    }

    this.activeOscillators.clear();
  }

  // Encerra o sistema de áudio
  async dispose() {
    this.stopAll();

    if (this.context) {
      await this.context.close();
    }

    this.context = null;
    this.masterGain = null;
    this.initialized = false;
  }
}
