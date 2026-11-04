
import { SCENARIOS } from "../core/config.js";

// Salas disponíveis para identificação dos jogadores.
const ROOMS = [
  "MALM - ALMOXARIFADO",
  "MALP 1A - AUXILIAR DE LINHA DE PRODUÇÃO",
  "MALP 1B - AUXILIAR DE LINHA DE PRODUÇÃO - MALP 1B",
  "MAMVP2_BUNGE - AUXILIAR MECÂNICO DE VEÍCULOS PESADOS",
  "MCE2 - CONSTRUTOR DE ESTOFADOS",
  "MU2 - MECÂNICO DE USINAGEM",
  "MS1 - SOLDADOR",
  "MTAI 2- AUTOMAÇÃO INDUSTRIAL",
  "TALP 1 - AUXILIAR DE LINHA DE PRODUÇÃO",
  "TELI 1 - ELETRICISTA INDUSTRIAL",
  "TMV 4 - MECÂNICO DE MANUTENÇÃO DE VEÍCULOS PESADOS E RODOVIÁRIOS",
  "TOP 1A - OPERADOR DE MQ DE USINAGEM DE MADEIRA CONVENCIONAL E CNC",
  "TOP 1B - OPERADOR DE MQ DE USINAGEM DE MADEIRA CONVENCIONAL E CNC",
  "TAMVP - 1GUA - AUXILIAR MECÂNICO DE VEÍCULOS PESADOS",
  "TS 1 - SOLDADOR",
  "TF2 - TÉCNICO EM FABRICAÇÃO MECÂNICA",
  "TF1_FACCHINI - TÉCNICO EM FABRICAÇÃO MECÂNICA",
  "TDS3 - TÉCNICO EM DESENVOLVIMENTO DE SISTEMAS",
  "TTAI 2 - AUTOMAÇÃO INDUSTRIAL",
  "DEV SESI 2A - TÉCNICO EM DESENVOLVIMENTO DE SISTEMAS",
  "DEV SESI 2B - TÉCNICO EM DESENVOLVIMENTO DE SISTEMAS",
  "DEV SESI 1A - TÉCNICO EM DESENVOLVIMENTO DE SISTEMAS",
  "DEV SESI 1B - TÉCNICO EM DESENVOLVIMENTO DE SISTEMAS",
  "TI MULTI 2 - TÉCNICO EM MULTIMÍDIA",
  "TI MULTI 1A- TÉCNICO EM MULTIMÍDIA",
  "TI MULTI 1B- TÉCNICO EM MULTIMÍDIA",
  "TM SEDUC 1 - TÉCNICO EM MÓVEIS"
];

const API_URL =
  `${window.location.protocol}//${window.location.hostname}:3001`;

export default class ScenarioSelect {
  constructor(game) {
    this.game = game;
    this.selected = SCENARIOS[0] || null;
    this.selectedDifficulty = null;
    this.player = null;
    this.step = "scenario";
    this.rankingTimer = null;
    this.rankingLoading = false;

    this.difficulties = [
      {
        id: "easy",
        name: "FÁCIL",
        tag: "INICIANTE",
        description:
          "O fogo se espalha lentamente, com menos focos de incêndio e mais tempo para controlar a emergência.",
        duration: "PROPAGAÇÃO LENTA"
      },
      {
        id: "medium",
        name: "INTERMEDIÁRIO",
        tag: "AVANÇADO",
        description:
          "Os incêndios surgem mais rapidamente e em maior quantidade. Será necessário agir com atenção.",
        duration: "PROPAGAÇÃO MODERADA"
      },
      {
        id: "hard",
        name: "DIFÍCIL",
        tag: "DESAFIADOR",
        description:
          "A propagação acontece rapidamente, com muitos focos de incêndio e pouco tempo para controlar a situação.",
        duration: "PROPAGAÇÃO RÁPIDA"
      }
    ];

    this.originalTitle = null;
    this.originalDescription = null;
    this.originalStartText = null;
    this.originalBackText = null;
  }

  init() {
    this.saveOriginalTexts();
    this.addRankingStyles();
    this.renderScenarios();
    this.bindEvents();
  }

  // =========================================
  // ESTILOS
  // =========================================

  addRankingStyles() {
    if (document.querySelector("#rankingStyles")) return;

    const style = document.createElement("style");
    style.id = "rankingStyles";

    style.textContent = `
      #scenarioCards.player-mode {
        display: block !important;
        width: 100% !important;
        max-width: 1150px !important;
        margin: 0 auto !important;
        box-sizing: border-box !important;
      }

      .player-ranking-layout {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        align-items: stretch !important;
        gap: 22px !important;
        width: 100% !important;
        max-width: 1150px !important;
        margin: 0 auto !important;
        padding: 0 18px 25px !important;
        position: relative !important;
        left: auto !important;
        right: auto !important;
        transform: none !important;
        height: auto !important;
        min-height: 0 !important;
        box-sizing: border-box !important;
      }

      .player-ranking-layout > * {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        margin: 0 !important;
        box-sizing: border-box !important;
      }

      .player-ranking-layout .player-form {
        display: flex !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
      }

      .player-ranking-layout .player-form__panel {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        height: 100% !important;
        min-height: 0 !important;
        padding: 28px !important;
        box-sizing: border-box !important;
        background: rgba(17, 27, 41, 0.85);
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 14px;
      }

      .player-form__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
        font-size: 32px;
      }

      .player-form__title,
      .player-form__subtitle {
        text-align: center;
        overflow-wrap: anywhere;
      }

      .player-form__fields-row {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) !important;
        gap: 18px !important;
        width: 100% !important;
        min-width: 0 !important;
        margin-top: 24px !important;
        box-sizing: border-box !important;
      }

      .player-form__field {
        display: flex !important;
        flex-direction: column !important;
        gap: 9px !important;
        width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        box-sizing: border-box !important;
      }

      .player-form__field label {
        display: block !important;
        min-height: 0 !important;
        margin-bottom: 0 !important;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1px;
        overflow-wrap: anywhere;
      }

      .player-form__field input,
      .player-form__field select {
        display: block !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        height: 48px !important;
        min-height: 48px !important;
        padding: 0 12px !important;
        box-sizing: border-box !important;
      }

      .player-form__notice {
        width: 100% !important;
        min-width: 0 !important;
        margin-top: 22px !important;
        padding: 14px !important;
        box-sizing: border-box !important;
        overflow-wrap: anywhere;
      }

      .player-form__notice p {
        overflow-wrap: anywhere;
      }

      .player-ranking-panel {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        height: 100% !important;
        min-height: 0 !important;
        max-height: 520px !important;
        padding: 28px !important;
        background: linear-gradient(145deg, #121c28, #0b111a);
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 14px;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }

      .player-ranking-heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
      }

      .player-ranking-heading h3 {
        margin: 0;
        font-size: 21px;
        overflow-wrap: anywhere;
      }

      .player-ranking-refresh {
        color: #6de0a2;
        font-size: 10px;
        font-weight: 800;
        white-space: nowrap;
      }

      .player-ranking-subtitle {
        margin: 12px 0 18px;
        color: rgba(255,255,255,.62);
        font-size: 12px;
        line-height: 1.6;
        overflow-wrap: anywhere;
      }

      .player-ranking-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
        min-width: 0;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 5px;
        box-sizing: border-box;
      }

      .player-ranking-item {
        display: grid !important;
        grid-template-columns: 38px minmax(0, 1fr) 75px !important;
        align-items: center;
        gap: 10px;
        width: 100%;
        min-width: 0;
        min-height: 70px;
        padding: 12px;
        border: 1px solid rgba(255,255,255,.09);
        border-radius: 10px;
        background: rgba(255,255,255,.04);
        box-sizing: border-box;
      }

      .player-ranking-position {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 34px;
        height: 34px;
        border-radius: 8px;
        background: rgba(217,182,109,.12);
        color: #e7c77e;
        font-weight: 900;
      }

      .player-ranking-item:nth-child(1) .player-ranking-position {
        background: rgba(230,190,80,.18);
        color: #ffd66b;
      }

      .player-ranking-item:nth-child(2) .player-ranking-position {
        background: rgba(190,200,215,.15);
        color: #d9e0eb;
      }

      .player-ranking-item:nth-child(3) .player-ranking-position {
        background: rgba(190,125,75,.15);
        color: #e5ad80;
      }

      .player-ranking-info {
        min-width: 0;
      }

      .player-ranking-name {
        color: #fff;
        font-size: 13px;
        font-weight: 800;
        overflow-wrap: anywhere;
      }

      .player-ranking-room {
        margin-top: 5px;
        color: rgba(255,255,255,.58);
        font-size: 10px;
        line-height: 1.5;
        overflow-wrap: anywhere;
      }

      .player-ranking-score {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        color: #e7c77e;
        font-size: 13px;
        font-weight: 900;
        text-align: right;
      }

      .player-ranking-time {
        margin-top: 5px;
        color: rgba(255,255,255,.58);
        font-size: 10px;
        font-weight: 500;
      }

      .player-ranking-empty {
        padding: 25px 12px;
        color: rgba(255,255,255,.65);
        font-size: 12px;
        line-height: 1.7;
        text-align: center;
        overflow-wrap: anywhere;
      }

      .player-ranking-error {
        color: #ffaaaa;
      }

      @media (max-width: 900px) {
        .player-ranking-layout {
          gap: 15px !important;
          padding-left: 12px !important;
          padding-right: 12px !important;
        }

        .player-ranking-layout .player-form__panel,
        .player-ranking-panel {
          padding: 20px !important;
        }

        .player-ranking-heading h3 {
          font-size: 17px;
        }
      }

      @media (max-width: 700px) {
        #scenarioCards.player-mode {
          width: 100% !important;
        }

        .player-ranking-layout {
          grid-template-columns: minmax(0, 1fr) !important;
          width: 100% !important;
          max-width: 600px !important;
          gap: 18px !important;
          padding: 0 12px 25px !important;
        }

        .player-ranking-layout .player-form__panel,
        .player-ranking-panel {
          padding: 20px !important;
        }

        .player-ranking-panel {
          height: 420px !important;
          max-height: 420px !important;
        }
      }

      @media (max-width: 480px) {
        .player-ranking-item {
          grid-template-columns: 32px minmax(0, 1fr) 68px !important;
          gap: 7px;
          padding: 10px;
        }

        .player-ranking-heading h3 {
          font-size: 16px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // =========================================
  // TEXTOS ORIGINAIS
  // =========================================

  saveOriginalTexts() {
    const section = document.querySelector("#scenarioSelect");
    if (!section) return;

    const title = section.querySelector("h2");
    const description = section.querySelector(".scenario-heading p");
    const startButton = document.querySelector("#startScenario");
    const backButton = document.querySelector("#backToMenu");

    this.originalTitle =
      title?.textContent.trim() || "ESCOLHA UM CENÁRIO";

    this.originalDescription =
      description?.textContent.trim() ||
      "Cada ambiente apresenta uma situação diferente de emergência.";

    this.originalStartText =
      startButton?.textContent.trim() || "INICIAR CENÁRIO →";

    this.originalBackText =
      backButton?.textContent.trim() || "← VOLTAR";
  }

  updateHeader(title, description) {
    const section = document.querySelector("#scenarioSelect");
    if (!section) return;

    const heading = section.querySelector("h2");
    const paragraph = section.querySelector(".scenario-heading p");

    if (heading) heading.textContent = title;
    if (paragraph) paragraph.textContent = description;
  }

  updateButtons(startText, backText) {
    const startButton = document.querySelector("#startScenario");
    const backButton = document.querySelector("#backToMenu");

    if (startButton) {
      startButton.textContent = startText;
      startButton.disabled = false;
    }

    if (backButton) {
      backButton.textContent = backText;
    }
  }

  // =========================================
  // SELEÇÃO DE CENÁRIOS
  // =========================================

  renderScenarios() {
    this.stopRankingRefresh();

    const container = document.querySelector("#scenarioCards");
    if (!container) return;

    container.classList.remove("player-mode");

    this.step = "scenario";
    this.selectedDifficulty = null;

    this.updateHeader(
      this.originalTitle,
      this.originalDescription
    );

    this.updateButtons(
      this.originalStartText,
      this.originalBackText
    );

    container.innerHTML = "";

    SCENARIOS.forEach((scenario, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "scenario-card";

      if (
        scenario.id === this.selected?.id ||
        (!this.selected && index === 0)
      ) {
        card.classList.add("selected");
      }

      const tag = document.createElement("span");
      tag.className = "scenario-card__tag";
      tag.textContent = scenario.difficulty || "CENÁRIO";

      const name = document.createElement("strong");
      name.textContent = scenario.name;

      const description = document.createElement("span");
      description.textContent = scenario.description;

      const duration = document.createElement("span");
      duration.className = "scenario-card__duration";
      duration.textContent =
        `DURAÇÃO: ${Math.floor((scenario.duration || 0) / 60)} MIN`;

      card.append(tag, name, description, duration);

      card.addEventListener("click", () => {
        this.selectScenario(scenario, card);
      });

      container.appendChild(card);
    });
  }

  selectScenario(scenario, selectedCard) {
    this.selected = scenario;

    document.querySelectorAll(".scenario-card").forEach(card => {
      card.classList.remove("selected");
    });

    selectedCard.classList.add("selected");
  }

  // =========================================
  // SELEÇÃO DE DIFICULDADE
  // =========================================

  renderDifficulties() {
    this.stopRankingRefresh();

    const container = document.querySelector("#scenarioCards");
    if (!container) return;

    container.classList.remove("player-mode");

    this.step = "difficulty";
    this.selectedDifficulty = this.difficulties[0];

    this.updateHeader(
      "ESCOLHA A DIFICULDADE",
      "Defina a intensidade da emergência que você enfrentará."
    );

    this.updateButtons(
      "CONTINUAR →",
      "← VOLTAR AOS CENÁRIOS"
    );

    container.innerHTML = "";

    this.difficulties.forEach((difficulty, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "scenario-card";

      if (index === 0) card.classList.add("selected");

      const tag = document.createElement("span");
      tag.className = "scenario-card__tag";
      tag.textContent = difficulty.tag;

      const name = document.createElement("strong");
      name.textContent = difficulty.name;

      const description = document.createElement("span");
      description.textContent = difficulty.description;

      const duration = document.createElement("span");
      duration.className = "scenario-card__duration";
      duration.textContent = difficulty.duration;

      card.append(tag, name, description, duration);

      card.addEventListener("click", () => {
        this.selectDifficulty(difficulty, card);
      });

      container.appendChild(card);
    });
  }

  selectDifficulty(difficulty, selectedCard) {
    this.selectedDifficulty = difficulty;

    document.querySelectorAll(".scenario-card").forEach(card => {
      card.classList.remove("selected");
    });

    selectedCard.classList.add("selected");
  }

  // =========================================
  // FORMULÁRIO E RANKING
  // =========================================

  renderPlayerForm() {
    this.stopRankingRefresh();

    const container = document.querySelector("#scenarioCards");
    if (!container) return;

    container.classList.add("player-mode");

    this.step = "player";

    this.updateHeader(
      "IDENTIFICAÇÃO DO JOGADOR",
      "Preencha seus dados para registrar sua participação na simulação."
    );

    this.updateButtons(
      "INICIAR SIMULAÇÃO →",
      "← VOLTAR À DIFICULDADE"
    );

    container.innerHTML = "";

    const layout = document.createElement("div");
    layout.className = "player-ranking-layout";

    // FORMULÁRIO

    const form = document.createElement("div");
    form.className = "player-form";

    const panel = document.createElement("div");
    panel.className = "player-form__panel";

    const icon = document.createElement("div");
    icon.className = "player-form__icon";
    icon.textContent = "♙";

    const title = document.createElement("h3");
    title.className = "player-form__title";
    title.textContent = "DADOS DO PARTICIPANTE";

    const subtitle = document.createElement("p");
    subtitle.className = "player-form__subtitle";
    subtitle.textContent =
      "Identifique-se antes de iniciar o treinamento.";

    const fieldsRow = document.createElement("div");
    fieldsRow.className = "player-form__fields-row";

    // NOME

    const nameField = document.createElement("div");
    nameField.className = "player-form__field";

    const nameLabel = document.createElement("label");
    nameLabel.htmlFor = "playerName";
    nameLabel.textContent = "NOME COMPLETO";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "playerName";
    nameInput.name = "playerName";
    nameInput.placeholder = "Digite seu nome";
    nameInput.maxLength = 80;
    nameInput.autocomplete = "name";
    nameInput.required = true;

    nameField.append(nameLabel, nameInput);

    // TURMA

    const roomField = document.createElement("div");
    roomField.className = "player-form__field";

    const roomLabel = document.createElement("label");
    roomLabel.htmlFor = "playerRoom";
    roomLabel.textContent = "SALA / TURMA";

    const roomSelect = document.createElement("select");
    roomSelect.id = "playerRoom";
    roomSelect.name = "playerRoom";
    roomSelect.required = true;

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Selecione sua turma";
    placeholder.disabled = true;
    placeholder.selected = true;

    roomSelect.appendChild(placeholder);

    ROOMS.forEach(room => {
      const option = document.createElement("option");
      option.value = room;
      option.textContent = room;
      roomSelect.appendChild(option);
    });

    roomField.append(roomLabel, roomSelect);

    fieldsRow.append(nameField, roomField);

    // AVISO

    const notice = document.createElement("div");
    notice.className = "player-form__notice";

    const noticeIcon = document.createElement("span");
    noticeIcon.textContent = "ⓘ";

    const noticeText = document.createElement("p");
    noticeText.textContent =
      "Seus dados serão associados ao resultado desta simulação.";

    notice.append(noticeIcon, noticeText);

    panel.append(
      icon,
      title,
      subtitle,
      fieldsRow,
      notice
    );

    form.appendChild(panel);

    // PAINEL DO RANKING

    const rankingPanel = document.createElement("aside");
    rankingPanel.className = "player-ranking-panel";

    const rankingHeading = document.createElement("div");
    rankingHeading.className = "player-ranking-heading";

    const rankingTitle = document.createElement("h3");
    rankingTitle.textContent = "🏆 RANKING GERAL";

    const refreshLabel = document.createElement("span");
    refreshLabel.className = "player-ranking-refresh";
    refreshLabel.textContent = "● AO VIVO";

    rankingHeading.append(rankingTitle, refreshLabel);

    const rankingSubtitle = document.createElement("p");
    rankingSubtitle.className = "player-ranking-subtitle";
    rankingSubtitle.textContent =
      "Maior pontuação primeiro. Em caso de empate, menor tempo.";

    const rankingList = document.createElement("div");
    rankingList.className = "player-ranking-list";
    rankingList.id = "playerRankingList";

    rankingPanel.append(
      rankingHeading,
      rankingSubtitle,
      rankingList
    );

    layout.append(form, rankingPanel);
    container.appendChild(layout);

    nameInput.focus();

    this.loadRanking();

    this.rankingTimer = setInterval(() => {
      if (this.step === "player") {
        this.loadRanking();
      }
    }, 10000);
  }

  // =========================================
  // CARREGAMENTO DO RANKING
  // =========================================

  async loadRanking() {
    const list = document.querySelector("#playerRankingList");

    if (!list || this.rankingLoading) return;

    this.rankingLoading = true;

    try {
      const response = await fetch(
        `${API_URL}/api/ranking`,
        {
          method: "GET",
          cache: "no-store"
        }
      );

      if (!response.ok) {
        throw new Error(
          `Servidor respondeu com status ${response.status}.`
        );
      }

      const ranking = await response.json();

      if (!Array.isArray(ranking)) {
        throw new Error(
          "O servidor não retornou uma lista válida de jogadores."
        );
      }

      // REGRA:
      // 1º Maior pontuação.
      // 2º Menor tempo, quando houver empate de pontos.

      ranking.sort((a, b) =>
        Number(b.points || 0) - Number(a.points || 0) ||
        Number(a.elapsed || 0) - Number(b.elapsed || 0)
      );

      // Limpa a lista anterior.

      list.innerHTML = "";

      if (ranking.length === 0) {
        const empty = document.createElement("div");
        empty.className = "player-ranking-empty";
        empty.textContent =
          "Ainda não existem resultados registrados. Seja o primeiro a entrar no ranking!";

        list.appendChild(empty);
        return;
      }

      // MOSTRA OS 10 MELHORES JOGADORES.

      ranking.slice(0, 10).forEach((player, index) => {
        const item = document.createElement("div");
        item.className = "player-ranking-item";

        const position = document.createElement("div");
        position.className = "player-ranking-position";
        position.textContent = `${index + 1}º`;

        const info = document.createElement("div");
        info.className = "player-ranking-info";

        const name = document.createElement("div");
        name.className = "player-ranking-name";
        name.textContent = player.name || "JOGADOR";

        const room = document.createElement("div");
        room.className = "player-ranking-room";
        room.textContent = player.room || "TURMA NÃO INFORMADA";

        info.append(name, room);

        const score = document.createElement("div");
        score.className = "player-ranking-score";
        score.appendChild(
          document.createTextNode(
            `${Number(player.points || 0)} pts`
          )
        );

        const time = document.createElement("div");
        time.className = "player-ranking-time";
        time.textContent = this.formatTime(player.elapsed);

        score.appendChild(time);

        item.append(position, info, score);
        list.appendChild(item);
      });

    } catch (error) {
      console.error("Erro ao carregar ranking:", error);

      list.innerHTML = "";

      const message = document.createElement("div");
      message.className =
        "player-ranking-empty player-ranking-error";

      message.textContent =
        "Não foi possível carregar o ranking. Verifique se o servidor está ligado na porta 3001.";

      list.appendChild(message);

    } finally {
      this.rankingLoading = false;
    }
  }

  // =========================================
  // FORMATAÇÃO DO TEMPO
  // =========================================

  formatTime(seconds) {
    const total = Math.max(
      0,
      Math.floor(Number(seconds) || 0)
    );

    const minutes = Math.floor(total / 60);
    const remainingSeconds = total % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  // =========================================
  // ATUALIZAÇÃO AUTOMÁTICA
  // =========================================

  stopRankingRefresh() {
    if (this.rankingTimer) {
      clearInterval(this.rankingTimer);
      this.rankingTimer = null;
    }
  }

  // =========================================
  // EVENTOS
  // =========================================

  bindEvents() {
    document.querySelector("#startScenario")
      ?.addEventListener("click", () => {
        this.start();
      });

    document.querySelector("#backToMenu")
      ?.addEventListener("click", () => {
        this.back();
      });
  }

  // =========================================
  // INICIAR SIMULAÇÃO
  // =========================================

  start() {
    if (!this.selected) {
      alert("Selecione um cenário para continuar.");
      return;
    }

    if (this.step === "scenario") {
      this.renderDifficulties();
      return;
    }

    if (this.step === "difficulty") {
      if (!this.selectedDifficulty) {
        alert("Selecione uma dificuldade.");
        return;
      }

      this.renderPlayerForm();
      return;
    }

    if (this.step === "player") {
      const nameInput = document.querySelector("#playerName");
      const roomSelect = document.querySelector("#playerRoom");

      const name = nameInput?.value.trim();
      const room = roomSelect?.value;

      if (!name) {
        alert("Digite seu nome para continuar.");
        nameInput?.focus();
        return;
      }

      if (!room) {
        alert("Selecione sua sala para continuar.");
        roomSelect?.focus();
        return;
      }

      this.stopRankingRefresh();

      this.player = { name, room };

      const selectedScenario = {
        ...this.selected,
        gameDifficulty: this.selectedDifficulty.id
      };

      document.querySelector("#scenarioSelect")
        ?.classList.add("hidden");

      this.game.startSimulation(
        selectedScenario,
        this.player
      );
    }
  }

  // =========================================
  // VOLTAR
  // =========================================

  back() {
    if (this.step === "player") {
      this.renderDifficulties();
      return;
    }

    if (this.step === "difficulty") {
      this.renderScenarios();
      return;
    }

    document.querySelector("#scenarioSelect")
      ?.classList.add("hidden");

    document.querySelector("#mainMenu")
      ?.classList.remove("hidden");
  }
}
