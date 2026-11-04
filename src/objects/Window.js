
import * as THREE from "three";

export default class Window {
    constructor(scene, x = 0, y = 5.2, z = -14.72) {
        this.group = new THREE.Group();

        const glass = new THREE.MeshStandardMaterial({
            color: "#4b9bc0",
            transparent: true,
            opacity: 0.55,
            roughness: 0.2,
            metalness: 0.3
        });

        const frame = new THREE.MeshStandardMaterial({
            color: "#394b5b",
            metalness: 0.65,
            roughness: 0.35
        });

        const pane = new THREE.Mesh(
            new THREE.BoxGeometry(3.8, 2.8, 0.1),
            glass
        );
        this.group.add(pane);

        for (const px of [-1.95, 1.95]) {
            const side = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 3, 0.18),
                frame
            );
            side.position.x = px;
            this.group.add(side);
        }

        for (const py of [-1.45, 1.45]) {
            const horizontal = new THREE.Mesh(
                new THREE.BoxGeometry(4, 0.12, 0.18),
                frame
            );
            horizontal.position.y = py;
            this.group.add(horizontal);
        }

        this.group.position.set(x, y, z);
        scene.add(this.group);
    }
}
