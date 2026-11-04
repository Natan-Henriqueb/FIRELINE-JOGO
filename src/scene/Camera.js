
import * as THREE from "three";
import { CONFIG } from "../core/config.js";

export default class Camera {
    constructor(canvas, scene = null) {
        this.canvas = canvas;
        this.scene = scene;

        this.camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            window.innerWidth / window.innerHeight,
            CONFIG.camera.near,
            CONFIG.camera.far
        );

        this.camera.position.set(
            CONFIG.camera.position.x,
            CONFIG.camera.position.y,
            CONFIG.camera.position.z
        );

        this.camera.rotation.order = "YXZ";

        this.yaw = 0;
        this.pitch = 0;
        this.sensitivity = 0.002;
        this.moveSpeed = 5;

        this.playerRadius = 0.42;

        // Limites internos do escritório.
        this.bounds = {
            minX: -11.45,
            maxX: 11.45,
            minZ: -14.4,
            maxZ: 14.4
        };

        this.colliders = [];
        this.colliderRefresh = 0;

        this.enabled = true;
        this.locked = false;

        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };

        this.onDocumentClick = this.onDocumentClick.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onPointerLockChange = this.onPointerLockChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);

        document.addEventListener("click", this.onDocumentClick);
        document.addEventListener("mousemove", this.onMouseMove);
        document.addEventListener("pointerlockchange", this.onPointerLockChange);
        document.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("keyup", this.onKeyUp);

        this.updateRotation();
    }

    onDocumentClick(event) {
        if (!this.enabled || this.locked) return;

        const simulation = document.querySelector("#simulation");

        if (!simulation || !simulation.contains(event.target)) return;

        if (
            event.target.closest(
                "button, a, input, textarea, select, .side-panel, .footer, .simulation-footer"
            )
        ) {
            return;
        }

        if (this.canvas.requestPointerLock) {
            this.canvas.requestPointerLock();
        }
    }

    onPointerLockChange() {
        this.locked = document.pointerLockElement === this.canvas;

        if (!this.locked) {
            this.resetKeys();
        }
    }

    onMouseMove(event) {
        if (!this.enabled || !this.locked) return;

        this.yaw -= event.movementX * this.sensitivity;
        this.pitch -= event.movementY * this.sensitivity;

        this.pitch = THREE.MathUtils.clamp(
            this.pitch,
            -Math.PI / 2.5,
            Math.PI / 2.5
        );

        this.updateRotation();
    }

    updateRotation() {
        this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ");
    }

    onKeyDown(event) {
        if (!this.enabled || !this.locked) return;

        switch (event.code) {
            case "KeyW":
            case "ArrowUp":
                this.keys.forward = true;
                break;

            case "KeyS":
            case "ArrowDown":
                this.keys.backward = true;
                break;

            case "KeyA":
            case "ArrowLeft":
                this.keys.left = true;
                break;

            case "KeyD":
            case "ArrowRight":
                this.keys.right = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case "KeyW":
            case "ArrowUp":
                this.keys.forward = false;
                break;

            case "KeyS":
            case "ArrowDown":
                this.keys.backward = false;
                break;

            case "KeyA":
            case "ArrowLeft":
                this.keys.left = false;
                break;

            case "KeyD":
            case "ArrowRight":
                this.keys.right = false;
                break;
        }
    }

    resetKeys() {
        this.keys.forward = false;
        this.keys.backward = false;
        this.keys.left = false;
        this.keys.right = false;
    }

    refreshColliders() {
        if (!this.scene) return;

        this.colliders = [];

        this.scene.updateMatrixWorld(true);

        this.scene.traverse(object => {
            if (
                object.userData &&
                object.userData.firelineCollider &&
                object.visible
            ) {
                const box = new THREE.Box3().setFromObject(object);

                if (!box.isEmpty()) {
                    this.colliders.push(box);
                }
            }
        });
    }

    canMoveTo(x, z) {
        const radius = this.playerRadius;

        // Impede atravessar as paredes do escritório.
        if (
            x - radius < this.bounds.minX ||
            x + radius > this.bounds.maxX ||
            z - radius < this.bounds.minZ ||
            z + radius > this.bounds.maxZ
        ) {
            return false;
        }

        // Verifica colisão com mesas, cadeiras e computadores.
        for (const box of this.colliders) {
            const overlapsX =
                x + radius > box.min.x &&
                x - radius < box.max.x;

            const overlapsZ =
                z + radius > box.min.z &&
                z - radius < box.max.z;

            if (overlapsX && overlapsZ) {
                return false;
            }
        }

        return true;
    }

    update(delta) {
        if (!this.enabled || !this.locked) return;

        // Atualiza a lista de obstáculos periodicamente.
        this.colliderRefresh += delta;

        if (this.colliderRefresh >= 0.5 || this.colliders.length === 0) {
            this.refreshColliders();
            this.colliderRefresh = 0;
        }

        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();

        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        right.crossVectors(forward, this.camera.up).normalize();

        const direction = new THREE.Vector3();

        if (this.keys.forward) direction.add(forward);
        if (this.keys.backward) direction.sub(forward);
        if (this.keys.left) direction.sub(right);
        if (this.keys.right) direction.add(right);

        if (direction.lengthSq() === 0) return;

        direction.normalize();

        const distance = this.moveSpeed * delta;

        const currentX = this.camera.position.x;
        const currentZ = this.camera.position.z;

        const nextX = currentX + direction.x * distance;
        const nextZ = currentZ + direction.z * distance;

        // Permite deslizar pela lateral dos móveis.
        if (this.canMoveTo(nextX, currentZ)) {
            this.camera.position.x = nextX;
        }

        if (this.canMoveTo(this.camera.position.x, nextZ)) {
            this.camera.position.z = nextZ;
        }
    }

    dispose() {
        document.removeEventListener("click", this.onDocumentClick);
        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener(
            "pointerlockchange",
            this.onPointerLockChange
        );
        document.removeEventListener("keydown", this.onKeyDown);
        document.removeEventListener("keyup", this.onKeyUp);

        this.resetKeys();

        if (document.pointerLockElement === this.canvas) {
            document.exitPointerLock();
        }
    }
}
