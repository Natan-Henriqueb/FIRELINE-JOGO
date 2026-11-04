
import * as THREE from "three";

export default class EmergencySign {
    constructor(scene, x = 9, y = 6.8, z = -14.5) {
        this.group = new THREE.Group();

        const green = new THREE.MeshStandardMaterial({
            color: "#087c4d",
            emissive: "#005c36",
            emissiveIntensity: 1
        });

        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.8, 0.15),
            green
        );
        this.group.add(panel);

        const arrow = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 0.12, 0.05),
            new THREE.MeshStandardMaterial({
                color: "#ffffff",
                emissive: "#ffffff",
                emissiveIntensity: 0.5
            })
        );
        arrow.position.z = 0.1;
        this.group.add(arrow);

        this.group.position.set(x, y, z);
        scene.add(this.group);
    }
}
