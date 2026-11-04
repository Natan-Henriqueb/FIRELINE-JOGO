
export default class EvacuationSystem {
  constructor() {
    this.active = false;
    this.steps = [
      {
        title: "MANTENHA A CALMA",
        description: "Evite correr e siga as orientações da equipe responsável."
      },
      {
        title: "SIGA AS SAÍDAS SINALIZADAS",
        description: "Utilize as rotas de evacuação indicadas no plano do local."
      },
      {
        title: "NÃO UTILIZE ELEVADORES",
        description: "Em situações de incêndio, siga o procedimento de evacuação por escadas sinalizadas."
      },
      {
        title: "DIRIJA-SE AO PONTO DE ENCONTRO",
        description: "Permaneça no local seguro indicado pelo plano de emergência."
      },
      {
        title: "AGUARDE AUTORIZAÇÃO",
        description: "Não retorne ao edifício até que as autoridades autorizem."
      }
    ];

    this.currentStep = 0;
  }

  activate() {
    this.active = true;
    this.currentStep = 0;
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }

    return this.getCurrentStep();
  }

  getCurrentStep() {
    return this.steps[this.currentStep];
  }

  getAllSteps() {
    return this.steps;
  }

  reset() {
    this.active = false;
    this.currentStep = 0;
  }
}
