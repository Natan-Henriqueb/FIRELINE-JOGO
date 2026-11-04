
import * as THREE from "three";

export default class Chair {
    constructor(scene, x = 0, z = 0) {
        this.group = new THREE.Group();

        // Identifica a cadeira como obstáculo para o jogador.
        this.group.userData.firelineCollider = true;

        const fabric = new THREE.MeshStandardMaterial({
            color: "#303b49",
            roughness: 0.85
        });

        const metal = new THREE.MeshStandardMaterial({
            color: "#687582",
            metalness: 0.75,
            roughness: 0.3
        });

        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(1.1, 0.16, 1),
            fabric
        );

        seat.position.y = 1.1;
        this.group.add(seat);

        const back = new THREE.Mesh(
            new THREE.BoxGeometry(1.1, 1.15, 0.16),
            fabric
        );

        back.position.set(0, 1.7, 0.42);
        this.group.add(back);

        for (const px of [-0.4, 0.4]) {
            for (const pz of [-0.35, 0.35]) {
                const leg = new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 1.05, 0.08),
                    metal
                );

                leg.position.set(px, 0.52, pz);
                this.group.add(leg);
            }
        }

        this.group.position.set(x, 0, z);

        this.group.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        });

        scene.add(this.group);
    }
}
