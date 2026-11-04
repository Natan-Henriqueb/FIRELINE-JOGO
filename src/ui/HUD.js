
export default class HUD {
  constructor(game) {
    this.game = game;
    this.elapsed = 0;

    this.alertElement = document.querySelector("#alertMessage");

    this.introTimeout = null;
    this.introActive = false;
  }

  update(delta) {
    this.elapsed += delta;

    this.updateClock();
    this.updateStatus();
  }

  updateClock() {
    const clock = document.querySelector("#simClock");

    if (!clock) return;

    const minutes = Math.floor(this.elapsed / 60);
    const seconds = Math.floor(this.elapsed % 60);

    clock.textContent =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  updateStatus() {
    const detector = document.querySelector("#detectorState");
    const alarm = document.querySelector("#alarmState");
    const risk = document.querySelector("#riskState");

    if (detector) {
      detector.textContent = this.game.detector.getStatus();
    }

    if (alarm) {
      alarm.textContent = this.game.alarm.getStatus();
    }

    if (risk) {
      risk.textContent = this.game.emergency.active
        ? "ALTO"
        : "BAIXO";
    }
  }

  // Apresentação inicial da missão
  showMissionIntro(scenario) {
    if (!this.alertElement) return;

    this.clearIntroTimeout();

    this.introActive = true;

    const container = document.createElement("div");
    container.className = "hud-alert-content hud-alert-intro";

    const label = document.createElement("span");
    label.className = "hud-alert-label";
    label.textContent = "BRIEFING DE EMERGÊNCIA";

    const heading = document.createElement("h2");
    heading.textContent = "ATENÇÃO: MISSÃO INICIADA";

    const description = document.createElement("p");
    description.textContent =
      scenario?.description ||
      "Você está em um escritório corporativo. Observe o ambiente e fique atento aos sinais de emergência.";

    const objective = document.createElement("p");
    objective.className = "hud-alert-objective";
    objective.textContent =
      "OBJETIVO: Identificar riscos e tomar decisões corretas em uma situação de incêndio.";

    const instruction = document.createElement("span");
    instruction.className = "hud-alert-countdown";
    instruction.textContent = "A MISSÃO COMEÇA EM 5 SEGUNDOS";

    container.append(
      label,
      heading,
      description,
      objective,
      instruction
    );

    this.alertElement.replaceChildren(container);
    this.alertElement.classList.remove("hidden");
    this.alertElement.classList.add("hud-alert", "hud-alert--intro");

    this.introTimeout = window.setTimeout(() => {
      this.introActive = false;
      this.hideAlert();
    }, 5000);
  }

  showAlert(title, message) {
    if (!this.alertElement) return;

    this.clearIntroTimeout();
    this.introActive = false;

    const heading = document.createElement("strong");
    heading.textContent = title;

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    this.alertElement.replaceChildren(heading, paragraph);
    this.alertElement.classList.remove("hidden");
    this.alertElement.classList.add("hud-alert");
    this.alertElement.classList.remove("hud-alert--intro");
  }

  hideAlert() {
    this.alertElement?.classList.add("hidden");
    this.alertElement?.classList.remove("hud-alert--intro");
  }

  clearIntroTimeout() {
    if (this.introTimeout !== null) {
      window.clearTimeout(this.introTimeout);
      this.introTimeout = null;
    }
  }

  reset() {
    this.clearIntroTimeout();

    this.elapsed = 0;
    this.introActive = false;

    this.hideAlert();

    const clock = document.querySelector("#simClock");

    if (clock) {
      clock.textContent = "00:00";
    }

    // Apresenta o briefing depois que o cenário é iniciado.
    this.showMissionIntro(this.game?.selectedScenario || this.game?.scenario);
  }

  dispose() {
    this.clearIntroTimeout();
    this.hideAlert();
  }
}
