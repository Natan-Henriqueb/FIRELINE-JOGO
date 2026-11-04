
export default class SoundEffects {
  constructor(audioManager) {
    this.audio = audioManager;
    this.enabled = true;
  }

  // Ativa ou desativa os efeitos
  setEnabled(status) {
    this.enabled = Boolean(status);
  }

  // Alerta de emergência
  playEmergency() {
    if (!this.enabled) return;

    this.audio?.playAlert();
  }

  // Clique nos botões
  playClick() {
    if (!this.enabled) return;

    this.audio?.playClick();
  }

  // Confirmação de ação
  playConfirm() {
    if (!this.enabled) return;

    this.audio?.playConfirm();
  }

  // Finalização da simulação
  playSuccess() {
    if (!this.enabled) return;

    this.audio?.playSuccess();
  }

  // Controle de volume
  setVolume(value) {
    this.audio?.setVolume(value);
  }

  // Interrompe todos os sons
  stopAll() {
    this.audio?.stopAll();
  }
}
