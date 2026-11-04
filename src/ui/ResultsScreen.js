
export default class ResultsScreen {
  constructor(game) {
    this.game = game;
    this.element = document.querySelector("#resultsScreen");
  }

  show(result) {
    if (!this.element) return;

    this.element.innerHTML = "";

    const card = document.createElement("div");
    card.className = "results-card";

    const eyebrow = document.createElement("span");
    eyebrow.className = "results-card__eyebrow";
    eyebrow.textContent = "SIMULAÇÃO FINALIZADA";

    const title = document.createElement("h2");
    title.textContent = "RELATÓRIO DE DESEMPENHO";

    const playerName = document.createElement("p");
    playerName.className = "results-player";
    playerName.textContent = `JOGADOR: ${result.playerName || "JOGADOR"}`;

    const playerRoom = document.createElement("p");
    playerRoom.className = "results-room";
    playerRoom.textContent = `TURMA: ${result.playerRoom || "NÃO INFORMADA"}`;

    const scenario = document.createElement("p");
    scenario.className = "results-scenario";
    scenario.textContent = `CENÁRIO: ${result.scenario || "NÃO INFORMADO"}`;

    const difficulty = document.createElement("p");
    difficulty.className = "results-difficulty";

    const difficultyNames = {
      easy: "FÁCIL",
      medium: "INTERMEDIÁRIO",
      hard: "DIFÍCIL"
    };

    difficulty.textContent =
      `DIFICULDADE: ${difficultyNames[result.difficulty] || result.difficulty || "NÃO INFORMADA"}`;

    const score = document.createElement("div");
    score.className = "results-score";
    score.textContent = String(result.points ?? 0);

    const scoreLabel = document.createElement("span");
    scoreLabel.className = "results-score-label";
    scoreLabel.textContent = "PONTOS";

    const classification = document.createElement("p");
    classification.className = "results-classification";
    classification.textContent = result.classification || "SEM CLASSIFICAÇÃO";

    const time = document.createElement("p");
    time.className = "results-time";
    time.textContent =
      `Tempo de simulação: ${Math.floor(result.elapsed || 0)} segundos`;

    const status = document.createElement("p");
    status.className = "results-status";
    status.textContent = result.success
      ? "MISSÃO CONCLUÍDA COM SUCESSO"
      : "MISSÃO NÃO CONCLUÍDA";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "results-button";
    button.textContent = "VOLTAR AO MENU";

    button.addEventListener("click", () => {
      this.game.stopSimulation();
    });

    card.append(
      eyebrow,
      title,
      playerName,
      playerRoom,
      scenario,
      difficulty,
      score,
      scoreLabel,
      classification,
      time,
      status,
      button
    );

    this.element.appendChild(card);
    this.element.classList.remove("hidden");
  }

  hide() {
    this.element?.classList.add("hidden");
  }
}
