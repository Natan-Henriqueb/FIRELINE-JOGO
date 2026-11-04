
import * as THREE from "three";

export default class Computer {
    constructor(scene, x = 0, z = 0) {
        this.group = new THREE.Group();

        // Identifica o computador como obstáculo para o jogador.
        this.group.userData.firelineCollider = true;

        const body = new THREE.MeshStandardMaterial({
            color: "#151d27",
            metalness: 0.5,
            roughness: 0.35
        });

        const screenMaterial = new THREE.MeshStandardMaterial({
            color: "#176b96",
            emissive: "#075078",
            emissiveIntensity: 1.2
        });

        const monitor = new THREE.Mesh(
            new THREE.BoxGeometry(1.35, 0.95, 0.12),
            body
        );

        monitor.position.y = 0.75;
        this.group.add(monitor);

        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(1.15, 0.72),
            screenMaterial
        );

        screen.position.set(0, 0.75, 0.066);
        this.group.add(screen);

        const support = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.4, 0.3),
            body
        );

        support.position.y = 0.15;
        this.group.add(support);

        const keyboard = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 0.06, 0.35),
            body
        );

        keyboard.position.set(0, -0.05, 0.65);
        this.group.add(keyboard);

        this.group.position.set(x, 2.1, z);

        this.group.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        });

        scene.add(this.group);
    }
}
