
/* ==========================================
   FOGO EM ALERTA
   Arquivo principal da aplicação
========================================== */

// ==========================================
// ESTILOS
// ==========================================

import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/global.css";
import "./styles/menu.css";
import "./styles/interface.css";
import "./styles/animations.css";

// ==========================================
// SISTEMA PRINCIPAL
// ==========================================

import Game from "./core/game.js";

// ==========================================
// INTERFACES
// ==========================================

import Menu from "./ui/Menu.js";
import LoadingScreen from "./ui/LoadingScreen.js";
import Settings from "./ui/Settings.js";
import ScenarioSelect from "./ui/ScenarioSelect.js";
import PauseMenu from "./ui/PauseMenu.js";

// ==========================================
// ÁUDIO
// ==========================================

import AudioManager from "./audio/AudioManager.js";

// ==========================================
// INSTÂNCIAS PRINCIPAIS
// ==========================================

const audio = new AudioManager();

const game = new Game(audio);

const loadingScreen = new LoadingScreen();

const menu = new Menu(game);

const settings = new Settings(audio);

const scenarioSelect = new ScenarioSelect(game);

const pauseMenu = new PauseMenu(game);

// ==========================================
// INICIALIZAÇÃO DO ÁUDIO
// ==========================================

let audioUnlocked = false;

async function unlockAudio() {
    if (audioUnlocked) return;

    audioUnlocked = true;

    try {
        await audio.init();
    } catch (error) {
        console.warn(
            "Não foi possível iniciar o áudio:",
            error
        );
    }
}

// O navegador exige interação do usuário
// antes de permitir a reprodução de áudio.

document.addEventListener(
    "pointerdown",
    unlockAudio,
    { once: true }
);

// ==========================================
// TRATAMENTO DE ERROS
// ==========================================

function showStartupError(error) {
    console.error(
        "Erro ao iniciar o FOGO EM ALERTA:",
        error
    );

    const loading = document.querySelector("#loadingScreen");

    if (!loading) {
        alert(
            "Não foi possível iniciar o FOGO EM ALERTA. Verifique o console do navegador."
        );
        return;
    }

    loading.classList.remove("hidden");

    loading.innerHTML = `
        <div class="loading-content">

            <div class="loading-brand">
                <span class="brand-symbol">F</span>

                <div>
                    <h1>FOGO <span>EM ALERTA</span></h1>
                    <p>SIMULADOR DE EMERGÊNCIAS</p>
                </div>
            </div>

            <h2>FALHA NA INICIALIZAÇÃO</h2>

            <p>
                NÃO FOI POSSÍVEL CARREGAR O SISTEMA.
            </p>

            <p>
                VERIFIQUE O CONSOLE DO NAVEGADOR.
            </p>

            <button
                id="reloadGame"
                class="primary-button"
                style="margin-top: 25px;"
            >
                TENTAR NOVAMENTE
            </button>

        </div>
    `;

    const reloadButton = document.querySelector("#reloadGame");

    reloadButton?.addEventListener("click", () => {
        window.location.reload();
    });
}

// ==========================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ==========================================

async function initializeGame() {
    try {
        console.log("================================");
        console.log("FOGO EM ALERTA");
        console.log("Inicializando aplicação...");
        console.log("================================");

        // 1. Mostrar carregamento

        loadingScreen.show();

        loadingScreen.setProgress(
            10,
            "INICIALIZANDO APLICAÇÃO"
        );

        // 2. Inicializar ambiente 3D

        loadingScreen.setProgress(
            30,
            "PREPARANDO AMBIENTE 3D"
        );

        await game.init();

        // 3. Inicializar interfaces

        loadingScreen.setProgress(
            65,
            "CARREGANDO INTERFACE"
        );

        menu.init();

        scenarioSelect.init();

        settings.init();

        pauseMenu.init();

        // 4. Preparar tela inicial

        loadingScreen.setProgress(
            85,
            "PREPARANDO SISTEMAS"
        );

        document.querySelector("#mainMenu")
            ?.classList.remove("hidden");

        document.querySelector("#scenarioSelect")
            ?.classList.add("hidden");

        document.querySelector("#simulation")
            ?.classList.add("hidden");

        document.querySelector("#settingsPanel")
            ?.classList.add("hidden");

        document.querySelector("#pauseMenu")
            ?.classList.add("hidden");

        document.querySelector("#resultsScreen")
            ?.classList.add("hidden");

        // 5. Finalizar carregamento

        loadingScreen.setProgress(
            100,
            "SISTEMA PRONTO"
        );

        await new Promise(resolve => {
            setTimeout(resolve, 400);
        });

        loadingScreen.hide();

        console.log(
            "FOGO EM ALERTA iniciado com sucesso!"
        );

    } catch (error) {
        showStartupError(error);
    }
}

// ==========================================
// EVENTOS GERAIS
// ==========================================

// Evita que o menu de contexto atrapalhe
// a experiência durante a simulação.

document.addEventListener("contextmenu", event => {
    if (
        event.target.closest("#gameCanvas") ||
        event.target.closest("#simulation")
    ) {
        event.preventDefault();
    }
});

// Atalho ESC para pausar ou retomar.

document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    if (!game.running) return;

    const pauseMenuElement =
        document.querySelector("#pauseMenu");

    if (
        pauseMenuElement?.classList.contains("hidden")
    ) {
        pauseMenu.pause();
    } else {
        pauseMenu.resume();
    }
});

// ==========================================
// INICIAR A APLICAÇÃO
// ==========================================

initializeGame();

// ==========================================
// ACESSO PARA DEPURAÇÃO
// ==========================================

window.FIRELINE = {
    game,
    audio,
    menu,
    settings,
    scenarioSelect,
    pauseMenu
};
