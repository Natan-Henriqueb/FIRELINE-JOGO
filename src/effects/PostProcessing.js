
export default class PostProcessing {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    this.enabled = true;
    this.exposure = 1;
  }

  setExposure(value) {
    this.exposure = Math.max(
      0.1,
      Math.min(2, value)
    );

    this.renderer.toneMappingExposure = this.exposure;
  }

  setEnabled(status) {
    this.enabled = Boolean(status);

    this.renderer.toneMappingExposure =
      this.enabled ? this.exposure : 1;
  }

  update() {
    // Espaço reservado para futuros efeitos visuais.
  }

  dispose() {
    this.enabled = false;
  }
}
