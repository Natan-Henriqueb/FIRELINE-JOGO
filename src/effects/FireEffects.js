
import * as THREE from "three";

export default class FireEffects {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    this.elapsed = 0;

    this.light = new THREE.PointLight(
      0xff4b16,
      0,
      18,
      2
    );

    this.light.position.set(-4, 2, -4);

    this.scene.add(this.light);
  }

  activate() {
    this.active = true;
    this.light.intensity = 3;
  }

  update(delta) {
    if (!this.active) return;

    this.elapsed += delta;

    const variation =
      Math.sin(this.elapsed * 13) * 0.4 +
      Math.sin(this.elapsed * 7) * 0.25;

    this.light.intensity = 3 + variation;
  }

  deactivate() {
    this.active = false;
    this.light.intensity = 0;
  }

  dispose() {
    this.deactivate();
    this.scene.remove(this.light);
  }
}
