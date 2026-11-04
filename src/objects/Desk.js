
import * as THREE from "three";

export default class Desk {
    constructor(scene, x = 0, z = 0) {
        this.group = new THREE.Group();

        // Identifica a mesa como obstáculo para o jogador.
        this.group.userData.firelineCollider = true;

        const wood = new THREE.MeshStandardMaterial({
            color: "#76543f",
            roughness: 0.6
        });

        const metal = new THREE.MeshStandardMaterial({
            color: "#343e49",
            metalness: 0.7
        });

        const top = new THREE.Mesh(
            new THREE.BoxGeometry(3.6, 0.2, 1.7),
            wood
        );

        top.position.y = 2.1;
        this.group.add(top);

        for (const px of [-1.5, 1.5]) {
            for (const pz of [-0.65, 0.65]) {
                const leg = new THREE.Mesh(
                    new THREE.BoxGeometry(0.14, 2, 0.14),
                    metal
                );

                leg.position.set(px, 1, pz);
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
