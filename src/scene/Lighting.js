
import * as THREE from "three";

export default class Lighting {
  constructor(scene) {
    this.scene = scene;
    this.emergencyActive = false;
    this.elapsed = 0;

    this.ambient = new THREE.HemisphereLight(
      "#dcecff",
      "#29313b",
      2
    );

    scene.add(this.ambient);

    this.mainLight = new THREE.DirectionalLight(
      "#ffffff",
      2.5
    );

    this.mainLight.position.set(-5, 12, 8);
    this.mainLight.castShadow = true;

    scene.add(this.mainLight);

    this.fillLight = new THREE.PointLight(
      "#6b91b8",
      12,
      30
    );

    this.fillLight.position.set(8, 5, -5);
    scene.add(this.fillLight);

    this.emergencyLight = new THREE.PointLight(
      "#ff2020",
      0,
      35
    );

    this.emergencyLight.position.set(0, 7, 0);
    scene.add(this.emergencyLight);
  }

  setEmergency(active) {
    this.emergencyActive = active;

    if (!active) {
      this.emergencyLight.intensity = 0;
      this.ambient.intensity = 2;
    }
  }

  update(delta) {
    if (!this.emergencyActive) return;

    this.elapsed += delta;

    this.emergencyLight.intensity =
      3 + Math.sin(this.elapsed * 8) * 2;

    this.ambient.intensity =
      1.5 + Math.sin(this.elapsed * 8) * 0.3;
  }
}
