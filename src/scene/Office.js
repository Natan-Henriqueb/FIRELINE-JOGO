
import * as THREE from "three";
import Environment from "./Environment.js";

import Desk from "../objects/Desk.js";
import Chair from "../objects/Chair.js";
import Computer from "../objects/Computer.js";
import Door from "../objects/Door.js";
import Window from "../objects/Window.js";
import EmergencySign from "../objects/EmergencySign.js";
import SmokeDetector from "../objects/SmokeDetector.js";

export default class Office {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        this.elapsed = 0;

        this.emergencyActive = false;
        this.emergencyElapsed = 0;

        this.environment = new Environment(scene);

        this.ceilingLights = [];
        this.emergencyBeacon = null;
        this.detector = null;
        this.door = null;

        this.createRoom();
        this.createWindows();
        this.createFurniture();
        this.createCeiling();
        this.createDetector();
        this.createEmergencySign();
        this.createEmergencyBeacon();
        this.createDoor();
    }

    addObject(object) {
        this.scene.add(object);
        this.objects.push(object);
        return object;
    }

    createBox(width, height, depth, color, x, y, z, options = {}) {
        const geometry = new THREE.BoxGeometry(
            width,
            height,
            depth
        );

        const material = new THREE.MeshStandardMaterial({
            color,
            roughness: options.roughness ?? 0.65,
            metalness: options.metalness ?? 0.1
        });

        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return this.addObject(mesh);
    }

    createRoom() {
        const wallColor = "#77818d";
        const trimColor = "#4b5663";

        // Parede do fundo.
        this.createBox(
            24, 9, 0.4,
            wallColor,
            0, 4.5, -15
        );

        // Parede esquerda.
        this.createBox(
            0.4, 9, 30,
            wallColor,
            -12, 4.5, 0
        );

        // Parede direita com abertura para a porta.
        this.createBox(
            0.4, 9, 22,
            wallColor,
            12, 4.5, -4
        );

        this.createBox(
            0.4, 9, 3,
            wallColor,
            12, 4.5, 13.5
        );

        // Parte superior da abertura da porta.
        this.createBox(
            0.4, 4.4, 5,
            wallColor,
            12, 6.8, 10
        );

        // Parede da frente: fecha a área que estava aberta.
        this.createBox(
            24, 9, 0.4,
            wallColor,
            0, 4.5, 15
        );

        // Teto.
        this.createBox(
            24, 0.35, 30,
            "#202a35",
            0, 9, 0
        );

        // Rodapés.
        this.createBox(
            24, 0.25, 0.4,
            trimColor,
            0, 0.12, -15
        );

        this.createBox(
            24, 0.25, 0.4,
            trimColor,
            0, 0.12, 15
        );

        this.createBox(
            0.4, 0.25, 30,
            trimColor,
            -12, 0.12, 0
        );

        // Rodapé da parede direita, respeitando a porta.
        this.createBox(
            0.4, 0.25, 22,
            trimColor,
            12, 0.12, -4
        );

        this.createBox(
            0.4, 0.25, 3,
            trimColor,
            12, 0.12, 13.5
        );
    }

    createWindows() {
        const positions = [-8, -2.7, 2.7, 8];

        positions.forEach(x => {
            new Window(
                this.scene,
                x,
                5.2,
                -14.72
            );
        });
    }

    createFurniture() {
        const positions = [
            [-7, -5],
            [0, -5],
            [7, -5],
            [-7, 3],
            [0, 3],
            [7, 3]
        ];

        positions.forEach(([x, z]) => {
            this.createDesk(x, z);
        });

        this.createMeetingTable();
    }

    createDesk(x, z) {
        new Desk(this.scene, x, z);

        new Computer(
            this.scene,
            x,
            z - 0.35
        );

        new Chair(
            this.scene,
            x,
            z + 2
        );
    }

    createMeetingTable() {
        const table = this.createBox(
            5.5, 0.25, 2.5,
            "#574538",
            0, 2.1, 10
        );

        // Pés da mesa.
        for (const x of [-2.2, 2.2]) {
            for (const z of [-0.9, 0.9]) {
                this.createBox(
                    0.16, 2, 0.16,
                    "#303840",
                    x, 1, 10 + z
                );
            }
        }

        return table;
    }

    createCeiling() {
        for (let i = 0; i < 5; i++) {
            const x = -9 + i * 4.5;

            // Estrutura da luminária.
            const fixture = this.createBox(
                2.2, 0.12, 0.8,
                "#e5e9ed",
                x, 8.72, 0,
                {
                    metalness: 0.3,
                    roughness: 0.3
                }
            );

            const light = new THREE.PointLight(
                "#e8f3ff",
                18,
                14
            );

            light.position.set(x, 8.3, 0);

            this.addObject(light);

            this.ceilingLights.push({
                fixture,
                light,
                originalIntensity: 18
            });
        }

        // Luminárias adicionais.
        for (const z of [-9, 9]) {
            for (const x of [-6, 0, 6]) {
                this.createBox(
                    1.8, 0.1, 0.7,
                    "#dce4ec",
                    x, 8.72, z
                );

                const light = new THREE.PointLight(
                    "#e8f3ff",
                    10,
                    12
                );

                light.position.set(x, 8.25, z);
                this.addObject(light);

                this.ceilingLights.push({
                    light,
                    originalIntensity: 10
                });
            }
        }
    }

    createDetector() {
        this.detector = new SmokeDetector(
            this.scene,
            0,
            8.65,
            0
        );
    }

    createEmergencySign() {
        new EmergencySign(
            this.scene,
            9,
            6.8,
            -14.5
        );
    }

    createDoor() {
        const door = new Door(
            this.scene,
            11.7,
            2.3,
            10
        );

        door.group.rotation.y = Math.PI / 2;

        this.door = door;
    }

    createEmergencyBeacon() {
        this.emergencyBeacon = new THREE.Group();

        const baseMaterial = new THREE.MeshStandardMaterial({
            color: "#333b45",
            metalness: 0.5
        });

        const redMaterial = new THREE.MeshStandardMaterial({
            color: "#ff2020",
            emissive: "#ff0000",
            emissiveIntensity: 0
        });

        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.45, 0.45, 0.18, 24
            ),
            baseMaterial
        );

        const cover = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.34, 0.34, 0.45, 24
            ),
            redMaterial
        );

        cover.position.y = -0.3;

        this.beaconMaterial = redMaterial;

        this.beaconLight = new THREE.PointLight(
            "#ff1717",
            0,
            18
        );

        this.beaconLight.position.y = -0.5;

        this.emergencyBeacon.add(
            base,
            cover,
            this.beaconLight
        );

        this.emergencyBeacon.position.set(
            0,
            8.7,
            0
        );

        this.scene.add(this.emergencyBeacon);
    }

    activateEmergency() {
        this.emergencyActive = true;
        this.emergencyElapsed = 0;

        if (this.detector) {
            this.detector.activateAlarm();
        }
    }

    deactivateEmergency() {
        this.emergencyActive = false;
        this.emergencyElapsed = 0;

        if (this.beaconLight) {
            this.beaconLight.intensity = 0;
        }

        if (this.beaconMaterial) {
            this.beaconMaterial.emissiveIntensity = 0;
        }

        if (this.detector) {
            this.detector.reset();
        }

        this.ceilingLights.forEach(item => {
            item.light.intensity = item.originalIntensity;
        });
    }

    update(delta) {
        this.elapsed += delta;

        if (this.detector) {
            this.detector.update(delta);
        }

        if (!this.emergencyActive) {
            return;
        }

        this.emergencyElapsed += delta;

        // Luz vermelha piscando.
        const flashing =
            Math.sin(this.emergencyElapsed * 9) > 0;

        this.beaconLight.intensity =
            flashing ? 18 : 0.2;

        this.beaconMaterial.emissiveIntensity =
            flashing ? 2.5 : 0.1;

        // Oscilação das luzes do escritório.
        const flickering =
            Math.sin(this.emergencyElapsed * 18) > 0.94;

        this.ceilingLights.forEach(item => {
            item.light.intensity = flickering
                ? 2
                : item.originalIntensity;
        });
    }
}
