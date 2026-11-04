
export const MathUtils = {
  // Limita um valor entre mínimo e máximo
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },

  // Interpolação linear
  lerp(start, end, amount) {
    return start + (end - start) * amount;
  },

  // Número aleatório entre dois valores
  random(min, max) {
    return Math.random() * (max - min) + min;
  },

  // Número inteiro aleatório
  randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Converte um valor para uma escala diferente
  map(value, inMin, inMax, outMin, outMax) {
    if (inMax === inMin) return outMin;

    return (
      ((value - inMin) * (outMax - outMin)) /
      (inMax - inMin)
    ) + outMin;
  },

  // Converte segundos em MM:SS
  formatTime(seconds) {
    const safeSeconds = Math.max(0, Math.floor(seconds));

    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return (
      `${String(minutes).padStart(2, "0")}:` +
      `${String(remainingSeconds).padStart(2, "0")}`
    );
  },

  // Converte graus para radianos
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  },

  // Converte radianos para graus
  toDegrees(radians) {
    return radians * (180 / Math.PI);
  },

  // Distância entre dois pontos 2D
  distance2D(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    return Math.sqrt(dx * dx + dy * dy);
  },

  // Suavização de animações
  smoothStep(value) {
    const t = this.clamp(value, 0, 1);

    return t * t * (3 - 2 * t);
  },

  // Aproximação de um valor
  moveTowards(current, target, maxDelta) {
    if (Math.abs(target - current) <= maxDelta) {
      return target;
    }

    return current + Math.sign(target - current) * maxDelta;
  }
};
