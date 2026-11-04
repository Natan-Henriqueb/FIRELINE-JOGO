
import * as THREE from "three";
import { CONFIG } from "../core/config.js";
import Camera from "./Camera.js";

export default class SceneManager {
    constructor(canvas) {
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            throw new Error("SceneManager: #gameCanvas precisa ser um canvas válido.");
        }

        this.canvas = canvas;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color("#111820");
        this.scene.fog = new THREE.Fog("#111820", 20, 65);

        this.cameraController = new Camera(canvas, this.scene);
        this.camera = this.cameraController.camera;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: CONFIG.graphics.antialias,
            alpha: false
        });

        this.renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                CONFIG.graphics.pixelRatioLimit
            )
        );

        this.renderer.shadowMap.enabled = CONFIG.graphics.shadows;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;

        this.clock = new THREE.Clock();
        this.onUpdate = null;

        this.running = false;
        this.alertActive = false;
        this.animationFrameId = null;

        this.handleResize = () => this.resize();

        this.resize();
        window.addEventListener("resize", this.handleResize);
    }

    resize() {
        if (!this.canvas || !this.renderer || !this.camera) return;

        const width = Math.max(1, window.innerWidth);
        const height = Math.max(1, window.innerHeight);

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height, false);
    }

    start() {
        if (this.running) return;

        this.running = true;
        this.clock.start();

        const animate = () => {
            if (!this.running) return;

            this.animationFrameId = requestAnimationFrame(animate);

            const delta = Math.min(this.clock.getDelta(), 0.05);

            this.cameraController.update(delta);

            if (typeof this.onUpdate === "function") {
                this.onUpdate(delta);
            }

            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    stop() {
        this.running = false;

        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        this.clock.stop();
    }

    setAlert(active) {
        this.alertActive = Boolean(active);
    }

    dispose() {
        this.stop();

        window.removeEventListener("resize", this.handleResize);

        this.cameraController.dispose();
        this.renderer.dispose();

        this.onUpdate = null;
    }
}
