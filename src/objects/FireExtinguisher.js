
import * as THREE from "three";

export default class FireExtinguisher {
  constructor(scene, x = 10.8, z = -10) {
    this.scene = scene;
    this.group = new THREE.Group();

    const redMaterial = new THREE.MeshStandardMaterial({
      color: 0xc82020,
      roughness: 0.42,
      metalness: 0.15
    });

    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x202020,
      roughness: 0.65
    });

    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0xbfc5c9,
      metalness: 0.85,
      roughness: 0.25
    });

    const labelMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8
    });

    // Corpo do extintor
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.25, 1.15, 24),
      redMaterial
    );

    body.position.y = 0.75;
    this.group.add(body);

    // Parte superior
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.12, 0.18, 16),
      metalMaterial
    );

    neck.position.y = 1.42;
    this.group.add(neck);

    // Válvula
    const valve = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.07, 0.12),
      darkMaterial
    );

    valve.position.set(0, 1.55, 0);
    this.group.add(valve);

    // Alça
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.035, 8, 20, Math.PI),
      darkMaterial
    );

    handle.rotation.x = Math.PI / 2;
    handle.position.set(0, 1.61, 0);
    this.group.add(handle);

    // Mangueira
    const hoseCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.12, 1.45, 0),
      new THREE.Vector3(0.35, 1.25, 0.05),
      new THREE.Vector3(0.38, 0.85, 0.08),
      new THREE.Vector3(0.25, 0.55, 0.08)
    ]);

    const hose = new THREE.Mesh(
      new THREE.TubeGeometry(hoseCurve, 20, 0.035, 8, false),
      darkMaterial
    );

    this.group.add(hose);

    // Rótulo frontal
    const label = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.38, 0.018),
      labelMaterial
    );

    label.position.set(0, 0.85, 0.235);
    this.group.add(label);

    // Bico
    const nozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.035, 0.28, 12),
      darkMaterial
    );

    nozzle.rotation.z = Math.PI / 2;
    nozzle.position.set(0.38, 0.55, 0.08);
    this.group.add(nozzle);

    this.group.position.set(x, 0, z);

    this.group.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    this.scene.add(this.group);
  }

  getObject() {
    return this.group;
  }

  remove() {
    this.group.removeFromParent();
  }
}
