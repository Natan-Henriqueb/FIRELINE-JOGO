
import * as THREE from "three";

export default class SmokeSystem {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    this.particles = [];
    this.elapsed = 0;
  }

  activate() {
    if (this.active) return;

    this.active = true;
    this.createSmoke();
  }

  createSmoke() {
    const geometry = new THREE.SphereGeometry(1, 12, 12);

    for (let i = 0; i < 22; i++) {
      const material = new THREE.MeshStandardMaterial({
        color: "#737a83",
        transparent: true,
        opacity: 0.13,
        depthWrite: false
      });

      const cloud = new THREE.Mesh(geometry, material);

      cloud.position.set(
        -4 + Math.random() * 4,
        2 + Math.random() * 5,
        -5 + Math.random() * 4
      );

      const size = 0.6 + Math.random() * 1.1;
      cloud.scale.setScalar(size);

      cloud.userData.speed = 0.2 + Math.random() * 0.35;
      cloud.userData.offset = Math.random() * 10;

      this.scene.add(cloud);
      this.particles.push(cloud);
    }
  }

  update(delta) {
    if (!this.active) return;

    this.elapsed += delta;

    this.particles.forEach((particle, index) => {
      particle.position.y += particle.userData.speed * delta;

      particle.position.x +=
        Math.sin(this.elapsed + particle.userData.offset) * 0.12 * delta;

      particle.material.opacity = Math.min(
        0.24,
        0.1 + this.elapsed * 0.005
      );

      if (particle.position.y > 10) {
        particle.position.y = 1.5;
      }
    });
  }

  deactivate() {
    this.active = false;

    this.particles.forEach(particle => {
      this.scene.remove(particle);
      particle.material.dispose();
    });

    this.particles = [];
  }
}
