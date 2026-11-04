
import * as THREE from "three";
import { state, resetSimulation } from "./state.js";

import SceneManager from "../scene/SceneManager.js";
import Office from "../scene/Office.js";
import Lighting from "../scene/Lighting.js";

import FireSystem from "../systems/FireSystem.js";
import SmokeSystem from "../systems/SmokeSystem.js";
import AlarmSystem from "../systems/AlarmSystem.js";
import DetectorSystem from "../systems/DetectorSystem.js";
import EvacuationSystem from "../systems/EvacuationSystem.js";
import EmergencySystem from "../systems/EmergencySystem.js";
import ScoreSystem from "../systems/ScoreSystem.js";

import HUD from "../ui/HUD.js";
import ResultsScreen from "../ui/ResultsScreen.js";
import Particles from "../effects/Particles.js";

import FireExtinguisher from "../objects/FireExtinguisher.js";

const API_URL = `${window.location.protocol}//${window.location.hostname}:3001`;

export default class Game {
    constructor(audio) {
        this.audio = audio;

        this.sceneManager = null;
        this.scene = null;
        this.office = null;
        this.lighting = null;

        this.fire = null;
        this.smoke = null;
        this.alarm = null;
        this.detector = null;
        this.evacuation = null;
        this.emergency = null;
        this.score = null;

        this.hud = null;
        this.results = null;
        this.particles = null;

        this.running = false;
        this.alertTriggered = false;

        this.elapsed = 0;
        this.timeRemaining = 120;
        this.fireElapsed = 0;

        this.scenario = null;
        this.player = null;

        this.emergencyTimeout = null;
        this.countdownInterval = null;

        this.extinguisherObject = null;
        this.extinguisherGroup = null;
        this.heldExtinguisher = null;

        this.extinguisherPosition = new THREE.Vector3(10.8, 0, -10);

        this.hasExtinguisher = false;

        this.pickupDistance = 2.8;
        this.fireDistance = 4.5;

        this.nearestFireIndex = -1;

        this.interactionPrompt = null;
        this.fireCounter = null;
        this.equipmentStatus = null;
        this.announcement = null;

        this.sprayEffects = [];

        this.warningStages = {
            80: false,
            105: false
        };

        this.onKeyDown = this.onKeyDown.bind(this);
        this.update = this.update.bind(this);
    }

    async init() {
        const canvas = document.querySelector("#gameCanvas");

        if (!canvas) {
            throw new Error("Canvas #gameCanvas não encontrado.");
        }

        this.sceneManager = new SceneManager(canvas);
        this.scene = this.sceneManager.scene;

        this.office = new Office(this.scene);
        this.lighting = new Lighting(this.scene);

        this.fire = new FireSystem(this.scene);
        this.smoke = new SmokeSystem(this.scene);
        this.alarm = new AlarmSystem(this.audio);
        this.detector = new DetectorSystem();

        this.evacuation = new EvacuationSystem();
        this.emergency = new EmergencySystem();
        this.score = new ScoreSystem();

        this.hud = new HUD(this);
        this.results = new ResultsScreen(this);
        this.particles = new Particles(this.scene);

        this.createExtinguisher();
        this.createInteractionUI();

        this.sceneManager.onUpdate = this.update;

        document.addEventListener("keydown", this.onKeyDown);

        this.bindEvents();
        this.sceneManager.start();

        console.log("FOGO EM ALERTA inicializado.");
    }

    bindEvents() {
        document.querySelector("#triggerButton")
            ?.addEventListener("click", () => {
                if (!this.alertTriggered) return;
                this.triggerAlert();
            });

        document.querySelector("#backButton")
            ?.addEventListener("click", () => this.stopSimulation());
    }

    createInteractionUI() {
        const simulation = document.querySelector("#simulation");

        if (!simulation) return;

        this.interactionPrompt = document.createElement("div");
        this.interactionPrompt.id = "interactionPrompt";

        Object.assign(this.interactionPrompt.style, {
            position: "fixed",
            left: "50%",
            bottom: "105px",
            transform: "translateX(-50%)",
            zIndex: "1000",
            display: "none",
            alignItems: "center",
            gap: "15px",
            minWidth: "300px",
            padding: "15px 22px",
            borderRadius: "12px",
            background: "rgba(8, 13, 20, 0.96)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#ffffff",
            boxShadow: "0 12px 40px rgba(0,0,0,0.45)"
        });

        this.interactionPrompt.innerHTML = `
            <div id="interactionKey" style="
                width:48px;height:48px;display:flex;
                align-items:center;justify-content:center;
                background:#ed343e;border-radius:9px;
                font-size:21px;font-weight:900;">
                E
            </div>
            <div>
                <strong id="interactionTitle" style="
                    display:block;font-size:13px;
                    letter-spacing:1px;">
                    PEGAR EXTINTOR
                </strong>
                <span id="interactionDescription" style="
                    display:block;margin-top:5px;
                    color:#b8c2cf;font-size:11px;">
                    Pressione E para pegar o equipamento
                </span>
            </div>
        `;

        this.fireCounter = document.createElement("div");
        this.fireCounter.id = "fireCounter";

        Object.assign(this.fireCounter.style, {
            position: "fixed",
            top: "110px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: "900",
            padding: "10px 18px",
            background: "rgba(15,20,28,0.9)",
            color: "#ffffff",
            border: "1px solid rgba(237,52,62,0.5)",
            borderRadius: "9px",
            fontSize: "13px",
            fontWeight: "800",
            display: "none"
        });

        this.equipmentStatus = document.createElement("div");
        this.equipmentStatus.id = "equipmentStatus";
        this.equipmentStatus.textContent = "EXTINTOR EQUIPADO";

        Object.assign(this.equipmentStatus.style, {
            position: "fixed",
            bottom: "25px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: "900",
            padding: "10px 18px",
            background: "rgba(20,130,75,0.9)",
            color: "#ffffff",
            borderRadius: "8px",
            fontSize: "11px",
            fontWeight: "800",
            display: "none"
        });

        this.announcement = document.createElement("div");
        this.announcement.id = "fireAnnouncement";

        Object.assign(this.announcement.style, {
            position: "fixed",
            inset: "0",
            zIndex: "2000",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            padding: "25px",
            background: "rgba(4, 8, 14, 0.88)",
            backdropFilter: "blur(7px)",
            color: "#ffffff",
            textAlign: "center"
        });

        this.announcement.innerHTML = `
            <div style="
                max-width:650px;
                padding:38px;
                border:1px solid rgba(237,52,62,.65);
                border-radius:16px;
                background:rgba(20,25,34,.97);
                box-shadow:0 15px 60px rgba(0,0,0,.6);
            ">
                <div style="
                    color:#ff424d;
                    font-size:13px;
                    font-weight:900;
                    letter-spacing:4px;
                    margin-bottom:18px;
                ">
                    FOGO EM ALERTA — ALERTA
                </div>

                <div id="announcementTitle" style="
                    font-size:clamp(24px,4vw,38px);
                    font-weight:900;
                    margin-bottom:15px;
                ">
                    ATENÇÃO: PRINCÍPIO DE INCÊNDIO
                </div>

                <div id="announcementMessage" style="
                    color:#cbd3df;
                    font-size:15px;
                    line-height:1.7;
                ">
                    Um incêndio está prestes a começar. Prepare-se para agir!
                </div>

                <div id="announcementCountdown" style="
                    margin-top:25px;
                    color:#ff424d;
                    font-size:34px;
                    font-weight:900;
                ">
                    5
                </div>
            </div>
        `;

        simulation.appendChild(this.interactionPrompt);
        simulation.appendChild(this.fireCounter);
        simulation.appendChild(this.equipmentStatus);
        simulation.appendChild(this.announcement);
    }

    showAnnouncement(title, message, seconds = null) {
        if (!this.announcement) return;

        const titleElement = this.announcement.querySelector("#announcementTitle");
        const messageElement = this.announcement.querySelector("#announcementMessage");
        const countdownElement = this.announcement.querySelector("#announcementCountdown");

        titleElement.textContent = title;
        messageElement.textContent = message;

        countdownElement.style.display = seconds === null ? "none" : "block";

        if (seconds !== null) {
            countdownElement.textContent = String(seconds);
        }

        this.announcement.style.display = "flex";
    }

    hideAnnouncement() {
        if (this.announcement) {
            this.announcement.style.display = "none";
        }
    }

    showInteraction(key, title, description) {
        if (!this.interactionPrompt) return;

        const keyElement = this.interactionPrompt.querySelector("#interactionKey");
        const titleElement = this.interactionPrompt.querySelector("#interactionTitle");
        const descriptionElement = this.interactionPrompt.querySelector("#interactionDescription");

        keyElement.textContent = key;
        titleElement.textContent = title;
        descriptionElement.textContent = description;

        this.interactionPrompt.style.display = "flex";
    }

    hideInteraction() {
        if (this.interactionPrompt) {
            this.interactionPrompt.style.display = "none";
        }
    }

    updateFireCounter() {
        if (!this.fireCounter || !this.alertTriggered || !this.fire) return;

        const remaining = this.fire.getRemaining();
        const total = this.fire.getTotal();

        this.fireCounter.style.display = "block";
        this.fireCounter.textContent =
            `INCÊNDIOS ATIVOS: ${remaining} / ${total}`;
    }

    createExtinguisher() {
        if (this.extinguisherObject) {
            this.extinguisherObject.remove();
        }

        this.extinguisherObject = new FireExtinguisher(
            this.scene,
            this.extinguisherPosition.x,
            this.extinguisherPosition.z
        );

        this.extinguisherGroup = this.extinguisherObject.getObject();
    }

    getPlayerPosition() {
        return this.sceneManager.camera.position;
    }

    getHorizontalDistance(a, b) {
        const dx = a.x - b.x;
        const dz = a.z - b.z;

        return Math.sqrt(dx * dx + dz * dz);
    }

    onKeyDown(event) {
        if (!this.running || !this.alertTriggered) return;
        if (event.repeat) return;

        if (event.code === "KeyE") {
            this.tryPickupExtinguisher();
        }

        if (event.code === "Enter" || event.code === "NumpadEnter") {
            event.preventDefault();
            this.tryExtinguishFire();
        }
    }

    tryPickupExtinguisher() {
        if (this.hasExtinguisher || !this.extinguisherGroup) return;

        const player = this.getPlayerPosition();

        const distance = this.getHorizontalDistance(
            player,
            this.extinguisherPosition
        );

        if (distance > this.pickupDistance) return;

        this.hasExtinguisher = true;

        this.extinguisherObject.remove();

        this.heldExtinguisher = this.extinguisherGroup.clone(true);

        this.heldExtinguisher.position.set(0.48, -0.48, -0.95);
        this.heldExtinguisher.rotation.set(0.12, -0.22, -0.18);
        this.heldExtinguisher.scale.set(0.42, 0.42, 0.42);

        this.sceneManager.camera.add(this.heldExtinguisher);

        if (this.equipmentStatus) {
            this.equipmentStatus.style.display = "block";
        }

        this.hideInteraction();

        this.setInstruction(
            "EXTINTOR COLETADO",
            "Aproxime-se de um incêndio e pressione ENTER para tentar apagá-lo."
        );
    }

    tryExtinguishFire() {
        if (!this.hasExtinguisher) {
            this.setInstruction(
                "EXTINTOR NÃO EQUIPADO",
                "Encontre o equipamento e pressione E para pegá-lo."
            );
            return;
        }

        if (this.nearestFireIndex === -1) {
            this.setInstruction(
                "NENHUM INCÊNDIO PRÓXIMO",
                "Aproxime-se de um incêndio para utilizar o extintor."
            );
            return;
        }

        const fire = this.fire.fires[this.nearestFireIndex];

        if (!fire || !fire.active || !fire.group) return;

        const sprayPosition = fire.group.position.clone();

        const extinguished = this.fire.extinguish(fire.index);

        if (!extinguished) return;

        this.createSprayEffect(sprayPosition);

        const remaining = this.fire.getRemaining();

        this.updateFireCounter();

        const missionComplete = this.fire.isComplete();

        if (missionComplete) {
            this.finishMission(true);
            return;
        }

        this.setInstruction(
            "INCÊNDIO CONTROLADO",
            remaining > 0
                ? `Ainda existem ${remaining} incêndios ativos. Continue a missão.`
                : "Aguarde e fique atento: a propagação ainda pode gerar novos incêndios."
        );
    }

    createSprayEffect(position) {
        const geometry = new THREE.BufferGeometry();

        const count = 100;
        const positions = [];
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions.push(
                (Math.random() - 0.5) * 0.35,
                Math.random() * 0.3,
                (Math.random() - 0.5) * 0.35
            );

            velocities.push(
                (Math.random() - 0.5) * 2,
                Math.random() * 2 + 0.5,
                (Math.random() - 0.5) * 2
            );
        }

        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(positions, 3)
        );

        const material = new THREE.PointsMaterial({
            color: "#edf5ff",
            size: 0.22,
            transparent: true,
            opacity: 0.85,
            depthWrite: false
        });

        const points = new THREE.Points(geometry, material);
        points.position.copy(position);
        this.scene.add(points);

        this.sprayEffects.push({
            points,
            velocities,
            age: 0,
            duration: 1.3
        });
    }

    updateSprayEffects(delta) {
        for (let i = this.sprayEffects.length - 1; i >= 0; i--) {
            const effect = this.sprayEffects[i];

            effect.age += delta;

            const positions = effect.points.geometry.attributes.position;

            for (let j = 0; j < positions.count; j++) {
                positions.setX(j, positions.getX(j) + effect.velocities[j * 3] * delta);
                positions.setY(j, positions.getY(j) + effect.velocities[j * 3 + 1] * delta);
                positions.setZ(j, positions.getZ(j) + effect.velocities[j * 3 + 2] * delta);
            }

            positions.needsUpdate = true;

            effect.points.material.opacity =
                Math.max(0, 0.85 * (1 - effect.age / effect.duration));

            if (effect.age >= effect.duration) {
                this.scene.remove(effect.points);
                effect.points.geometry.dispose();
                effect.points.material.dispose();
                this.sprayEffects.splice(i, 1);
            }
        }
    }

    setInstruction(title, message) {
        const titleElement = document.querySelector("#simTitle");
        const descriptionElement = document.querySelector("#simDescription");

        if (titleElement) titleElement.textContent = title;
        if (descriptionElement) descriptionElement.textContent = message;
    }

    updateInteractionPrompt() {
        if (!this.alertTriggered) {
            this.hideInteraction();
            return;
        }

        const player = this.getPlayerPosition();

        this.nearestFireIndex = -1;

        if (!this.hasExtinguisher) {
            const distance = this.getHorizontalDistance(
                player,
                this.extinguisherPosition
            );

            if (distance <= this.pickupDistance) {
                this.showInteraction(
                    "E",
                    "PEGAR EXTINTOR",
                    "Pressione E para coletar o equipamento."
                );
            } else {
                this.hideInteraction();
            }

            return;
        }

        let nearestDistance = this.fireDistance;

        this.fire.fires.forEach((fire, index) => {
            if (!fire || !fire.active || !fire.group) return;

            const distance = this.getHorizontalDistance(
                player,
                fire.group.position
            );

            if (distance <= nearestDistance) {
                nearestDistance = distance;
                this.nearestFireIndex = index;
            }
        });

        if (this.nearestFireIndex !== -1) {
            this.showInteraction(
                "ENTER",
                "APAGAR INCÊNDIO",
                "Pressione ENTER para liberar o agente extintor."
            );
        } else {
            this.hideInteraction();
        }
    }

    configureFireAlerts() {
        if (!this.fire) return;

        this.fire.onSpread = (event) => {
            const messages = {
                easy: {
                    title: "ATENÇÃO: O FOGO ESTÁ SE ESPALHANDO",
                    message: "Um novo foco de incêndio foi identificado. Mantenha a calma e controle a situação."
                },
                medium: {
                    title: "ALERTA: PROPAGAÇÃO DO INCÊNDIO",
                    message: "O fogo está se espalhando pelo ambiente. Um novo foco foi identificado. Aja rapidamente."
                },
                hard: {
                    title: "ALERTA CRÍTICO: NOVO FOCO DE INCÊNDIO",
                    message: "A propagação está avançando rapidamente. Um novo incêndio surgiu. A situação exige atenção imediata."
                }
            };

            const alert = messages[event.difficulty] || messages.medium;

            this.hud?.showAlert(alert.title, alert.message);
            this.updateFireCounter();

            console.log(`Alerta de propagação exibido. Foco ${event.index + 1}.`);
        };
    }

    updateEmergencyWarnings() {
        if (!this.alertTriggered) return;

        const stages = [
            {
                time: 80,
                title: "RISCO ELEVADO",
                message: "A situação está crítica. Priorize sua segurança e não entre em áreas com fumaça intensa."
            },
            {
                time: 105,
                title: "ALERTA CRÍTICO",
                message: "O tempo está acabando. Se não for seguro permanecer, evacue."
            }
        ];

        for (const stage of stages) {
            if (
                this.fireElapsed >= stage.time &&
                !this.warningStages[stage.time]
            ) {
                this.warningStages[stage.time] = true;
                this.hud?.showAlert(stage.title, stage.message);
            }
        }
    }

    startSimulation(scenario, player = null) {
        this.clearEmergencyTimeout();
        this.clearCountdownInterval();

        resetSimulation();

        this.elapsed = 0;
        this.fireElapsed = 0;
        this.timeRemaining = 120;

        this.alertTriggered = false;
        this.running = true;

        this.scenario = scenario;

        this.player = {
            name: player?.name?.trim() || "JOGADOR",
            room: player?.room?.trim() || "TURMA NÃO INFORMADA"
        };

        this.hasExtinguisher = false;
        this.nearestFireIndex = -1;

        this.warningStages = {
            80: false,
            105: false
        };

        state.scenario = scenario;
        state.simulation = "running";

        document.querySelector("#mainMenu")?.classList.add("hidden");
        document.querySelector("#scenarioSelect")?.classList.add("hidden");
        document.querySelector("#simulation")?.classList.remove("hidden");
        document.querySelector(".side-panel")?.classList.remove("hidden");
        document.querySelector(".footer")?.classList.remove("hidden");

        const scenarioName = document.querySelector("#scenarioName");

        if (scenarioName) {
            scenarioName.textContent = scenario?.name || "ESCRITÓRIO CORPORATIVO";
        }

        this.setInstruction(
            "PREPARE-SE",
            "Um princípio de incêndio foi identificado. Aguarde o início da ocorrência."
        );

        const detectorState = document.querySelector("#detectorState");
        const alarmState = document.querySelector("#alarmState");
        const riskState = document.querySelector("#riskState");

        if (detectorState) detectorState.textContent = "OPERACIONAL";
        if (alarmState) alarmState.textContent = "INATIVO";
        if (riskState) riskState.textContent = "BAIXO";

        const clock = document.querySelector("#simClock");
        if (clock) clock.textContent = "02:00";

        const triggerButton = document.querySelector("#triggerButton");
        if (triggerButton) triggerButton.disabled = true;

        this.fire?.deactivate();
        this.smoke?.deactivate();
        this.alarm?.deactivate();
        this.detector?.reset();
        this.emergency?.deactivate();

        this.configureFireAlerts();

        this.office?.deactivateEmergency();
        this.lighting?.setEmergency(false);

        this.hud?.reset();

        this.hideInteraction();

        if (this.fireCounter) this.fireCounter.style.display = "none";
        if (this.equipmentStatus) this.equipmentStatus.style.display = "none";

        if (this.heldExtinguisher) {
            this.sceneManager.camera.remove(this.heldExtinguisher);
            this.heldExtinguisher = null;
        }

        this.createExtinguisher();

        this.showAnnouncement(
            "ATENÇÃO: PRINCÍPIO DE INCÊNDIO",
            "Um incêndio está prestes a começar. Prepare-se para agir!",
            5
        );

        let countdown = 5;

        this.countdownInterval = window.setInterval(() => {
            if (!this.running || this.alertTriggered) {
                this.clearCountdownInterval();
                return;
            }

            countdown--;

            const countdownElement = this.announcement?.querySelector("#announcementCountdown");

            if (countdownElement) {
                countdownElement.textContent = String(countdown);
            }

            if (countdown <= 0) {
                this.clearCountdownInterval();
            }
        }, 1000);

        this.emergencyTimeout = window.setTimeout(() => {
            if (this.running && !this.alertTriggered) {
                this.triggerAlert();
            }
        }, 5000);

        return true;
    }

    clearEmergencyTimeout() {
        if (this.emergencyTimeout !== null) {
            window.clearTimeout(this.emergencyTimeout);
            this.emergencyTimeout = null;
        }
    }

    clearCountdownInterval() {
        if (this.countdownInterval !== null) {
            window.clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    triggerAlert() {
        if (!this.running || this.alertTriggered) return;

        this.clearEmergencyTimeout();
        this.clearCountdownInterval();
        this.hideAnnouncement();

        this.alertTriggered = true;

        this.elapsed = 0;
        this.timeRemaining = 120;
        this.fireElapsed = 0;

        state.detector.detected = true;
        state.alarm.active = true;
        state.fire.active = true;
        state.smoke.active = true;
        state.emergency.active = true;

        this.detector.detect();
        this.alarm.activate();

        const difficulty = this.scenario?.gameDifficulty || "medium";
        this.fire.activate(difficulty);

        this.smoke.activate();
        this.emergency.activate();

        this.office?.activateEmergency();
        this.lighting?.setEmergency(true);

        const detectorState = document.querySelector("#detectorState");
        const alarmState = document.querySelector("#alarmState");
        const riskState = document.querySelector("#riskState");

        if (detectorState) detectorState.textContent = "FUMAÇA DETECTADA";
        if (alarmState) alarmState.textContent = "ATIVADO";
        if (riskState) riskState.textContent = "ALTO";

        const triggerButton = document.querySelector("#triggerButton");
        if (triggerButton) triggerButton.disabled = true;

        this.setInstruction(
            "INCÊNDIO DETECTADO",
            "Localize o extintor. Você tem dois minutos para concluir a missão. Se a situação não for segura, evacue."
        );

        this.updateFireCounter();

        this.hud?.showAlert(
            "INCÊNDIO DETECTADO",
            "A emergência começou. Localize o equipamento e siga as orientações de segurança."
        );

        this.audio?.playAlert?.();
    }

    update(delta) {
        if (!this.running) return;

        this.office?.update(delta);
        this.lighting?.update(delta);
        this.smoke?.update(delta);
        this.fire?.update(delta);
        this.particles?.update(delta);

        this.updateSprayEffects(delta);

        if (!this.alertTriggered) return;

        this.elapsed += delta;
        this.fireElapsed += delta;
        this.timeRemaining -= delta;

        const seconds = Math.max(0, Math.ceil(this.timeRemaining));
        const minutes = Math.floor(seconds / 60);
        const remainder = seconds % 60;

        const clock = document.querySelector("#simClock");

        if (clock) {
            clock.textContent =
                `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
        }

        this.hud?.update(delta);

        this.updateFireCounter();
        this.updateInteractionPrompt();
        this.updateEmergencyWarnings();

        if (this.timeRemaining <= 0) {
            this.finishMission(false);
        }
    }

    async saveRanking(result) {
        try {
            const response = await fetch(`${API_URL}/api/ranking`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: result.playerName,
                    room: result.playerRoom,
                    points: result.points,
                    elapsed: result.elapsed,
                    classification: result.classification,
                    scenario: result.scenario,
                    difficulty: result.difficulty,
                    success: result.success
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro ao registrar resultado.");
            }

            console.log("Ranking atualizado:", data.message);

            return true;
        } catch (error) {
            console.error("Não foi possível salvar no ranking:", error);
            return false;
        }
    }

    async finishMission(success) {
        if (!this.running) return;

        this.clearEmergencyTimeout();
        this.clearCountdownInterval();

        this.running = false;

        this.hideInteraction();
        this.hideAnnouncement();

        state.simulation = "finished";

        if (success) {
            this.setInstruction(
                "MISSÃO CONCLUÍDA!",
                "Todos os incêndios foram controlados dentro do tempo."
            );
        } else {
            this.setInstruction(
                "TEMPO ESGOTADO",
                "A missão não foi concluída. Em uma emergência real, priorize a evacuação e acione os serviços de emergência."
            );
        }

        const result = this.score.calculate(this.elapsed);

        if (result && typeof result === "object") {
            result.playerName = this.player?.name || "JOGADOR";
            result.playerRoom = this.player?.room || "TURMA NÃO INFORMADA";

            result.scenario = this.scenario?.name || "CENÁRIO";
            result.difficulty = this.scenario?.gameDifficulty || "medium";

            result.success = success;
            result.message = success
                ? "Todos os incêndios foram controlados."
                : "O tempo da missão terminou.";
        }

        // Somente missões concluídas entram no ranking.
        if (success) {
            await this.saveRanking(result);
        }

        this.results.show(result);
    }

    finishSimulation() {
        this.finishMission(false);
    }

    stopSimulation() {
        this.clearEmergencyTimeout();
        this.clearCountdownInterval();

        this.running = false;
        this.alertTriggered = false;
        this.scenario = null;
        this.player = null;
        this.hasExtinguisher = false;

        resetSimulation();

        this.fire?.deactivate();
        this.smoke?.deactivate();
        this.alarm?.deactivate();
        this.detector?.reset();
        this.emergency?.deactivate();

        this.office?.deactivateEmergency();
        this.lighting?.setEmergency(false);

        if (this.heldExtinguisher) {
            this.sceneManager.camera.remove(this.heldExtinguisher);
            this.heldExtinguisher = null;
        }

        this.sprayEffects.forEach(effect => {
            this.scene.remove(effect.points);
            effect.points.geometry.dispose();
            effect.points.material.dispose();
        });

        this.sprayEffects = [];

        this.hideInteraction();
        this.hideAnnouncement();

        if (this.fireCounter) this.fireCounter.style.display = "none";
        if (this.equipmentStatus) this.equipmentStatus.style.display = "none";

        this.hud?.reset();

        document.querySelector("#simulation")?.classList.add("hidden");
        document.querySelector("#mainMenu")?.classList.remove("hidden");
        document.querySelector(".side-panel")?.classList.add("hidden");
        document.querySelector(".footer")?.classList.add("hidden");

        this.results?.hide();

        this.createExtinguisher();
    }

    dispose() {
        this.clearEmergencyTimeout();
        this.clearCountdownInterval();

        this.running = false;

        document.removeEventListener("keydown", this.onKeyDown);

        this.hud?.dispose();
        this.audio?.dispose?.();
        this.sceneManager?.dispose();
    }
}
