
export const CONFIG = {
  appName: "FIRELINE 3D",
  version: "1.0.0",

  graphics: {
    antialias: true,
    shadows: true,
    pixelRatioLimit: 2
  },

  camera: {
    fov: 65,
    near: 0.1,
    far: 1000,
    position: {
      x: 0,
      y: 5,
      z: 13
    }
  },

  office: {
    width: 24,
    height: 9,
    depth: 30
  },

  simulation: {
    duration: 300,
    smokeIntensity: 0.75,
    fireIntensity: 0.6,
    alertDelay: 2
  },

  audio: {
    enabled: true,
    volume: 0.65
  },

  controls: {
    mouseSensitivity: 1,
    cameraMovement: true
  }
};

export const SCENARIOS = [
  {
    id: "office",
    name: "ESCRITÓRIO CORPORATIVO",
    description: "Simulação de emergência em um ambiente corporativo.",
    difficulty: "NORMAL",
    duration: 300
  },
  {
    id: "night",
    name: "EXPEDIENTE NOTURNO",
    description: "Simulação em um escritório com iluminação reduzida.",
    difficulty: "AVANÇADO",
    duration: 360
  },
  {
    id: "large",
    name: "COMPLEXO EMPRESARIAL",
    description: "Simulação em um ambiente corporativo de maior dimensão.",
    difficulty: "AVANÇADO",
    duration: 420
  }
];
