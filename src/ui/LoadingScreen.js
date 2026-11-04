
export default class LoadingScreen {
  constructor() {
    this.element = document.querySelector("#loadingScreen");
    this.progress = document.querySelector("#loadingProgress");
    this.label = document.querySelector("#loadingLabel");
  }

  show() {
    this.element?.classList.remove("hidden");
    this.setProgress(0, "INICIALIZANDO SISTEMA");
  }

  setProgress(value, message = "CARREGANDO") {
    const percentage = Math.max(0, Math.min(100, value));

    if (this.progress) {
      this.progress.style.width = `${percentage}%`;
    }

    if (this.label) {
      this.label.textContent =
        `${message} — ${Math.round(percentage)}%`;
    }
  }

  async simulateLoading() {
    this.show();

    const stages = [
      { progress: 15, message: "CARREGANDO INTERFACE" },
      { progress: 35, message: "PREPARANDO AMBIENTE 3D" },
      { progress: 60, message: "INICIALIZANDO SISTEMAS" },
      { progress: 85, message: "PREPARANDO SIMULAÇÃO" },
      { progress: 100, message: "SISTEMA PRONTO" }
    ];

    for (const stage of stages) {
      this.setProgress(stage.progress, stage.message);

      await new Promise(resolve => setTimeout(resolve, 250));
    }

    this.hide();
  }

  hide() {
    this.element?.classList.add("hidden");
  }
}
