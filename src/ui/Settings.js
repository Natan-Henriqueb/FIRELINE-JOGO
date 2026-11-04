
export default class Settings {
  constructor(audio) {
    this.audio = audio;

    this.settings = {
      volume: 65,
      quality: "high"
    };
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    const volume = document.querySelector("#volumeControl");
    const quality = document.querySelector("#qualityControl");

    volume?.addEventListener("input", event => {
      const value = Number(event.target.value);

      this.settings.volume = value;
      this.audio?.setVolume(value / 100);

      const label = document.querySelector("#volumeValue");

      if (label) {
        label.textContent = `${value}%`;
      }
    });

    quality?.addEventListener("change", event => {
      this.settings.quality = event.target.value;

      document.documentElement.dataset.quality =
        this.settings.quality;
    });

    document.querySelector("#closeSettings")
      ?.addEventListener("click", () => {
        this.close();
      });

    document.querySelector("#fullscreenButton")
      ?.addEventListener("click", () => {
        this.toggleFullscreen();
      });
  }

  close() {
    document.querySelector("#settingsPanel")
      ?.classList.add("hidden");
  }

  async toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Erro ao alterar tela cheia:", error);
    }
  }

  getSettings() {
    return this.settings;
  }
}
