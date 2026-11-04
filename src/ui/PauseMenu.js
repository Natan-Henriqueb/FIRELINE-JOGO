
export default class PauseMenu {
  constructor(game) {
    this.game = game;
    this.paused = false;
  }

  init() {
    document.querySelector("#pauseButton")
      ?.addEventListener("click", () => {
        this.toggle();
      });

    document.querySelector("#resumeButton")
      ?.addEventListener("click", () => {
        this.resume();
      });

    document.querySelector("#pauseBackButton")
      ?.addEventListener("click", () => {
        this.game.stopSimulation();
        this.paused = false;
        this.hide();
      });
  }

  toggle() {
    if (this.paused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  pause() {
    if (!this.game.running || this.paused) return;

    this.paused = true;
    this.game.running = false;

    document.querySelector("#pauseMenu")
      ?.classList.remove("hidden");
  }

  resume() {
    if (!this.paused) return;

    this.paused = false;
    this.game.running = true;

    this.hide();
  }

  hide() {
    document.querySelector("#pauseMenu")
      ?.classList.add("hidden");
  }

  reset() {
    this.paused = false;
    this.hide();
  }
}
