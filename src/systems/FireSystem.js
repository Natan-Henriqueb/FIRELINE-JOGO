
import * as THREE from "three";

export default class FireSystem {
    constructor(scene) {
        this.scene = scene;

        this.active = false;
        this.elapsed = 0;
        this.fires = [];

        this.firePositions = [
            new THREE.Vector3(-8, 0, -8),
            new THREE.Vector3(1, 0, -7),
            new THREE.Vector3(8, 0, -1),
            new THREE.Vector3(-8, 0, 7),
            new THREE.Vector3(5, 0, 7)
        ];

        this.fireColors = ["#ff3215", "#ff7818", "#ffc247"];

        this.spawnedCount = 0;
        this.spreadingComplete = false;
        this.growthStarted = false;

        this.difficulty = "medium";

        this.difficultySettings = {
            easy: {
                spreadStages: [
                    { time: 25, index: 2 },
                    { time: 50, index: 3 },
                    { time: 75, index: 4 }
                ],
                growthStart: 25,
                growthSpeed: 0.004,
                maxGrowth: 1.5,
                initialScale: 0.65,
                newFireScale: 0.75,
                lightIntensity: 4
            },

            medium: {
                spreadStages: [
                    { time: 15, index: 2 },
                    { time: 30, index: 3 },
                    { time: 45, index: 4 }
                ],
                growthStart: 15,
                growthSpeed: 0.007,
                maxGrowth: 1.8,
                initialScale: 0.75,
                newFireScale: 0.85,
                lightIntensity: 5
            },

            hard: {
                spreadStages: [
                    { time: 8, index: 2 },
                    { time: 18, index: 3 },
                    { time: 30, index: 4 }
                ],
                growthStart: 8,
                growthSpeed: 0.012,
                maxGrowth: 2.1,
                initialScale: 0.9,
                newFireScale: 1,
                lightIntensity: 6
            }
        };

        // Pode ser utilizado pelo game.js para mostrar alertas.
        this.onSpread = null;
    }

    activate(difficulty = "medium") {
        if (this.active) return;

        this.active = true;
        this.elapsed = 0;

        this.fires = [];
        this.spawnedCount = 0;
        this.spreadingComplete = false;
        this.growthStarted = false;

        this.difficulty = this.difficultySettings[difficulty]
            ? difficulty
            : "medium";

        this.settings = this.difficultySettings[this.difficulty];

        // O incêndio começa com dois focos.
        this.createFire(
            this.firePositions[0],
            0,
            this.settings.initialScale
        );

        this.createFire(
            this.firePositions[1],
            1,
            this.settings.initialScale
        );
    }

    createFire(position, index, initialScale = 1) {
        const group = new THREE.Group();

        group.position.copy(position);
        group.scale.setScalar(initialScale);

        const fire = {
            group,
            flames: [],
            light: null,
            active: true,
            index,
            baseScale: initialScale,
            growth: 1
        };

        for (let i = 0; i < 7; i++) {
            const geometry = new THREE.ConeGeometry(
                0.2 + Math.random() * 0.18,
                0.7 + Math.random() * 0.7,
                8
            );

            const material = new THREE.MeshBasicMaterial({
                color: this.fireColors[i % this.fireColors.length],
                transparent: true,
                opacity: 0.85
            });

            const flame = new THREE.Mesh(geometry, material);

            flame.position.set(
                (Math.random() - 0.5) * 0.8,
                0.45 + Math.random() * 0.25,
                (Math.random() - 0.5) * 0.8
            );

            group.add(flame);
            fire.flames.push(flame);
        }

        fire.light = new THREE.PointLight(
            "#ff541c",
            this.settings?.lightIntensity || 5,
            5
        );

        fire.light.position.set(0, 1.2, 0);

        group.add(fire.light);

        this.scene.add(group);
        this.fires.push(fire);

        this.spawnedCount++;

        return fire;
    }

    spreadFire(index) {
        if (!this.active || index >= this.firePositions.length) {
            return false;
        }

        // Evita criar o mesmo foco duas vezes.
        if (this.fires.some(fire => fire.index === index)) {
            return false;
        }

        const fire = this.createFire(
            this.firePositions[index],
            index,
            this.settings.newFireScale
        );

        console.log(
            `Novo foco de incêndio: ${index + 1} | Dificuldade: ${this.difficulty}`
        );

        // Avisa o game.js que um novo foco apareceu.
        if (typeof this.onSpread === "function") {
            this.onSpread({
                index,
                total: this.spawnedCount,
                difficulty: this.difficulty,
                elapsed: this.elapsed,
                fire
            });
        }

        return true;
    }

    increaseFireIntensity() {
        this.fires.forEach(fire => {
            if (!fire.active) return;

            fire.growth = Math.min(
                fire.growth + 0.35,
                this.settings.maxGrowth
            );

            const targetScale = fire.baseScale * fire.growth;

            fire.group.scale.setScalar(targetScale);

            if (fire.light) {
                fire.light.distance = 5 + fire.growth * 2;
                fire.light.intensity =
                    this.settings.lightIntensity + fire.growth * 3;
            }
        });

        this.growthStarted = true;
    }

    update(delta) {
        if (!this.active) return;

        this.elapsed += delta;

        const growthStart = this.settings.growthStart;

        // Começa a aumentar a intensidade das chamas.
        if (
            this.elapsed >= growthStart &&
            !this.growthStarted
        ) {
            this.increaseFireIntensity();
        }

        // Crescimento progressivo de acordo com a dificuldade.
        if (this.elapsed >= growthStart) {
            this.fires.forEach(fire => {
                if (!fire.active) return;

                const growth = Math.min(
                    1 + (this.elapsed - growthStart) *
                    this.settings.growthSpeed,
                    this.settings.maxGrowth
                );

                fire.growth = growth;

                fire.group.scale.setScalar(
                    fire.baseScale * growth
                );

                if (fire.light) {
                    fire.light.intensity =
                        this.settings.lightIntensity +
                        Math.sin(this.elapsed * 10 + fire.index) * 2 +
                        growth * 2;

                    fire.light.distance = 5 + growth * 2;
                }
            });
        }

        // Propagação de acordo com a dificuldade selecionada.
        this.settings.spreadStages.forEach(stage => {
            if (
                this.elapsed >= stage.time &&
                !this.fires.some(fire => fire.index === stage.index)
            ) {
                this.spreadFire(stage.index);
            }
        });

        const lastStage = this.settings.spreadStages[
            this.settings.spreadStages.length - 1
        ];

        if (this.elapsed >= lastStage.time) {
            this.spreadingComplete = true;
        }

        // Animação das chamas.
        this.fires.forEach((fire, index) => {
            if (!fire.active) return;

            fire.flames.forEach((flame, flameIndex) => {
                flame.scale.y =
                    0.8 + Math.sin(
                        this.elapsed * 8 + flameIndex + index
                    ) * 0.25;

                flame.rotation.y += delta * 1.5;
            });

            if (this.elapsed < growthStart && fire.light) {
                fire.light.intensity =
                    this.settings.lightIntensity * 0.6 +
                    Math.sin(this.elapsed * 8 + index);
            }
        });
    }

    extinguish(index) {
        const fire = this.fires.find(
            item => item.index === index
        );

        if (!fire || !fire.active) return false;

        fire.active = false;

        this.scene.remove(fire.group);

        fire.flames.forEach(flame => {
            flame.geometry.dispose();
            flame.material.dispose();
        });

        fire.group.clear();
        fire.light = null;

        return true;
    }

    extinguishNearest(position, maxDistance = 3) {
        let nearestFire = null;
        let nearestDistance = maxDistance;

        this.fires.forEach(fire => {
            if (!fire.active) return;

            const distance = position.distanceTo(
                fire.group.position
            );

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestFire = fire;
            }
        });

        if (!nearestFire) return false;

        return this.extinguish(nearestFire.index);
    }

    getRemaining() {
        return this.fires.filter(fire => fire.active).length;
    }

    getTotal() {
        return this.spawnedCount;
    }

    getDifficulty() {
        return this.difficulty;
    }

    getRemainingStages() {
        return this.settings.spreadStages.filter(stage => {
            return !this.fires.some(
                fire => fire.index === stage.index
            );
        }).length;
    }

    isComplete() {
        return (
            this.active &&
            this.spreadingComplete &&
            this.getRemaining() === 0
        );
    }

    deactivate() {
        this.fires.forEach(fire => {
            if (fire.active) {
                this.scene.remove(fire.group);

                fire.flames.forEach(flame => {
                    flame.geometry.dispose();
                    flame.material.dispose();
                });

                fire.group.clear();
            }
        });

        this.fires = [];
        this.active = false;
        this.elapsed = 0;
        this.spawnedCount = 0;
        this.spreadingComplete = false;
        this.growthStarted = false;
        this.settings = null;
        this.onSpread = null;
    }
}
