
export default class Menu {
  constructor(game) {
    this.game = game;
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    document.querySelector("#playButton")
      ?.addEventListener("click", () => {
        this.openScenarios();
      });

    document.querySelector("#settingsButton")
      ?.addEventListener("click", () => {
        this.openSettings();
      });

    document.querySelector("#exitButton")
      ?.addEventListener("click", () => {
        this.openExitDialog();
      });

    document.querySelector("#closeExit")
      ?.addEventListener("click", () => {
        this.closeExitDialog();
      });

    document.querySelector("#confirmExit")
      ?.addEventListener("click", () => {
        this.closeExitDialog();
      });
  }

  openScenarios() {
    document.querySelector("#mainMenu")?.classList.add("hidden");
    document.querySelector("#scenarioSelect")?.classList.remove("hidden");
  }

  openSettings() {
    document.querySelector("#settingsPanel")?.classList.remove("hidden");
  }

  openExitDialog() {
    document.querySelector("#exitDialog")?.classList.remove("hidden");
  }

  closeExitDialog() {
    document.querySelector("#exitDialog")?.classList.add("hidden");
  }
}
