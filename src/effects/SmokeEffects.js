
import * as THREE from "three";

export default class SmokeEffects {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    this.clouds = [];
    this.elapsed = 0;

    this.geometry = new THREE.SphereGeometry(
      1,
      12,
      12
    );

    this.material = new THREE.MeshStandardMaterial({
      color: 0x777e89,
      transparent: true,
      opacity: 0.16,
      roughness: 1,
      depthWrite: false
    });

    this.createClouds();
  }

  createClouds() {
    for (let i = 0; i < 10; i++) {
      const cloud = new THREE.Mesh(
        this.geometry,
        this.material.clone()
      );

      cloud.position.set(
        -4 + (Math.random() - 0.5) * 4,
        1.5 + Math.random() * 3,
        -4 + (Math.random() - 0.5) * 4
      );

      const scale = 0.8 + Math.random() * 1.2;

      cloud.scale.set(
        scale * 1.3,
        scale,
        scale * 1.3
      );

      cloud.visible = false;

      this.scene.add(cloud);
      this.clouds.push(cloud);
    }
  }

  activate() {
    this.active = true;

    this.clouds.forEach(cloud => {
      cloud.visible = true;
    });
  }

  update(delta) {
    if (!this.active) return;

    this.elapsed += delta;

    this.clouds.forEach((cloud, index) => {
      cloud.position.y += delta * 0.18;

      cloud.position.x +=
        Math.sin(this.elapsed + index) * delta * 0.12;

      cloud.material.opacity =
        0.10 + Math.sin(this.elapsed * 2 + index) * 0.04;

      if (cloud.position.y > 7) {
        cloud.position.y = 1.5;
      }
    });
  }

  deactivate() {
    this.active = false;

    this.clouds.forEach(cloud => {
      cloud.visible = false;
    });
  }

  dispose() {
    this.deactivate();

    this.clouds.forEach(cloud => {
      this.scene.remove(cloud);
      cloud.material.dispose();
    });

    this.clouds = [];

    this.geometry.dispose();
    this.material.dispose();
  }
}
