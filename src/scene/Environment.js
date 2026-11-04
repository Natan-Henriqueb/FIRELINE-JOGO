
import * as THREE from "three";

export default class Environment {
  constructor(scene) {
    this.scene = scene;

    this.createFloor();
    this.createGrid();
  }

  createFloor() {
    const geometry = new THREE.PlaneGeometry(40, 45);

    const material = new THREE.MeshStandardMaterial({
      color: "#303a45",
      roughness: 0.65,
      metalness: 0.25
    });

    this.floor = new THREE.Mesh(geometry, material);

    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = 0;

    this.floor.receiveShadow = true;

    this.scene.add(this.floor);
  }

  createGrid() {
    const grid = new THREE.GridHelper(
      40,
      40,
      "#63798d",
      "#465564"
    );

    grid.position.y = 0.015;
    grid.material.transparent = true;
    grid.material.opacity = 0.18;

    this.scene.add(grid);
  }
}
