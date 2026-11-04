
import * as THREE from "three";

export default class SmokeDetector {
    constructor(scene, x = 0, y = 8.65, z = 0) {
        this.group = new THREE.Group();

        const white = new THREE.MeshStandardMaterial({
            color: "#e8edf1",
            roughness: 0.5
        });

        const detector = new THREE.Mesh(
            new THREE.CylinderGeometry(0.45, 0.45, 0.18, 32),
            white
        );
        this.group.add(detector);

        this.ledMaterial = new THREE.MeshStandardMaterial({
            color: "#24ff8a",
            emissive: "#24ff8a",
            emissiveIntensity: 1
        });

        const led = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 12, 12),
            this.ledMaterial
        );
        led.position.set(0.25, -0.1, 0.25);
        this.group.add(led);

        this.group.position.set(x, y, z);
        scene.add(this.group);

        this.elapsed = 0;
        this.alarmActive = false;
    }

    activateAlarm() {
        this.alarmActive = true;
        this.ledMaterial.color.set("#ff2020");
        this.ledMaterial.emissive.set("#ff0000");
    }

    reset() {
        this.alarmActive = false;
        this.ledMaterial.color.set("#24ff8a");
        this.ledMaterial.emissive.set("#24ff8a");
    }

    update(delta) {
        this.elapsed += delta;

        if (this.alarmActive) {
            this.ledMaterial.emissiveIntensity =
                Math.sin(this.elapsed * 10) > 0 ? 2 : 0.1;
        } else {
            this.ledMaterial.emissiveIntensity =
                0.7 + Math.sin(this.elapsed * 2) * 0.2;
        }
    }
}
