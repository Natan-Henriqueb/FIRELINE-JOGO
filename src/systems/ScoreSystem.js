
export default class ScoreSystem {
  constructor() {
    this.maximumPoints = 1000;
  }

  calculate(seconds) {
    const elapsed = Math.max(0, seconds);

    const timePenalty = Math.min(elapsed * 2, 500);
    const points = Math.max(
      0,
      Math.round(this.maximumPoints - timePenalty)
    );

    let classification = "PRECISA MELHORAR";

    if (points >= 850) {
      classification = "EXCELENTE";
    } else if (points >= 700) {
      classification = "MUITO BOM";
    } else if (points >= 500) {
      classification = "BOM";
    }

    return {
      points,
      classification,
      elapsed,
      maximumPoints: this.maximumPoints
    };
  }
}
