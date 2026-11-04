
import * as THREE from "three";

export default class Door {
    constructor(scene, x = 0, y = 2.3, z = 0) {
        this.group = new THREE.Group();

        const frameMaterial = new THREE.MeshStandardMaterial({
            color: "#343e49",
            metalness: 0.5
        });

        const doorMaterial = new THREE.MeshStandardMaterial({
            color: "#654c3b",
            roughness: 0.7
        });

        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(3.2, 4.6, 0.3),
            frameMaterial
        );
        this.group.add(frame);

        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(2.85, 4.3, 0.12),
            doorMaterial
        );
        panel.position.z = 0.2;
        this.group.add(panel);

        const handle = new THREE.Mesh(
            new THREE.SphereGeometry(0.09, 16, 16),
            new THREE.MeshStandardMaterial({
                color: "#d9bd78",
                metalness: 0.9
            })
        );
        handle.position.set(1, 2.1, 0.3);
        this.group.add(handle);

        this.group.position.set(x, y, z);
        scene.add(this.group);
    }
}
