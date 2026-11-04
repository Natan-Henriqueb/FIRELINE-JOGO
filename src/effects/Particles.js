
import * as THREE from "three";

export default class Particles {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.particles = [];

    this.geometry = new THREE.SphereGeometry(0.045, 6, 6);
    this.material = new THREE.MeshBasicMaterial({
      color: 0xffa33b,
      transparent: true,
      opacity: 0.9
    });

    this.scene.add(this.group);
  }

  burst(position = new THREE.Vector3(-4, 2, -4)) {
    for (let i = 0; i < 45; i++) {
      const particle = new THREE.Mesh(
        this.geometry,
        this.material.clone()
      );

      particle.position.copy(position);

      particle.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        Math.random() * 3,
        (Math.random() - 0.5) * 3
      );

      particle.life = 1.5 + Math.random();
      particle.maxLife = particle.life;

      this.group.add(particle);
      this.particles.push(particle);
    }
  }

  update(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      particle.position.addScaledVector(
        particle.velocity,
        delta
      );

      particle.velocity.y -= 1.5 * delta;

      particle.life -= delta;

      const progress = Math.max(
        0,
        particle.life / particle.maxLife
      );

      particle.material.opacity = progress;

      particle.scale.setScalar(
        Math.max(0.1, progress)
      );

      if (particle.life <= 0) {
        this.group.remove(particle);
        particle.material.dispose();

        this.particles.splice(i, 1);
      }
    }
  }

  clear() {
    for (const particle of this.particles) {
      this.group.remove(particle);
      particle.material.dispose();
    }

    this.particles = [];
  }

  dispose() {
    this.clear();

    this.scene.remove(this.group);

    this.geometry.dispose();
    this.material.dispose();
  }
}
