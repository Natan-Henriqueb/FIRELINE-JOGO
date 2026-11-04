
export const state = {
  application: "menu",
  simulation: "inactive",

  scenario: null,

  detector: {
    active: false,
    detected: false,
    sensitivity: 0.75
  },

  alarm: {
    active: false
  },

  fire: {
    active: false,
    intensity: 0
  },

  smoke: {
    active: false,
    intensity: 0
  },

  emergency: {
    active: false
  },

  timer: {
    elapsed: 0,
    remaining: 300
  },

  score: {
    points: 0,
    completed: false
  },

  settings: {
    volume: 0.65,
    quality: "high",
    fullscreen: false
  }
};

export function resetSimulation() {
  state.simulation = "inactive";
  state.detector.active = false;
  state.detector.detected = false;
  state.alarm.active = false;
  state.fire.active = false;
  state.fire.intensity = 0;
  state.smoke.active = false;
  state.smoke.intensity = 0;
  state.emergency.active = false;
  state.timer.elapsed = 0;
  state.timer.remaining = 300;
  state.score.points = 0;
  state.score.completed = false;
}

export function setApplication(application) {
  state.application = application;
}
