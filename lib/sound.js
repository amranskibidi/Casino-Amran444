"use client";

let ctx = null;
const C = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

const osc = (freq, type, t, dur, vol = 0.3) => {
  const c = C(), o = c.createOscillator(), g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + t);
  g.gain.setValueAtTime(vol, c.currentTime + t);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t + dur);
  o.start(c.currentTime + t); o.stop(c.currentTime + t + dur);
};

const sweep = (f0, f1, type, t, dur, vol = 0.2) => {
  const c = C(), o = c.createOscillator(), g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = type;
  o.frequency.setValueAtTime(f0, c.currentTime + t);
  o.frequency.exponentialRampToValueAtTime(f1, c.currentTime + t + dur);
  g.gain.setValueAtTime(vol, c.currentTime + t);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t + dur);
  o.start(c.currentTime + t); o.stop(c.currentTime + t + dur + 0.05);
};

const noise = (t, dur, vol = 0.12) => {
  const c = C(), buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(), g = c.createGain();
  src.buffer = buf; src.connect(g); g.connect(c.destination);
  g.gain.setValueAtTime(vol, c.currentTime + t);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t + dur);
  src.start(c.currentTime + t); src.stop(c.currentTime + t + dur + 0.05);
};

export function playLeverPull() {
  try {
    noise(0, 0.04, 0.18);
    sweep(300, 120, "sawtooth", 0, 0.12, 0.1);
    noise(0.1, 0.06, 0.12);
  } catch {}
}

export function playSlotSpin() {
  try {
    sweep(60, 280, "sawtooth", 0, 0.8, 0.09);
    sweep(80, 320, "square", 0.05, 0.75, 0.05);
    for (let i = 0; i < 12; i++) {
      noise(i * 0.07, 0.05, 0.07 + i * 0.003);
      osc(120 + i * 8, "square", i * 0.07, 0.04, 0.05);
    }
  } catch {}
}

export function playSlotStop(idx = 0) {
  try {
    noise(idx * 0.02, 0.07, 0.22);
    osc(200 - idx * 25, "square", idx * 0.02, 0.06, 0.18);
    osc(100, "sine", idx * 0.02 + 0.03, 0.05, 0.08);
  } catch {}
}

export function playCardFlip() {
  try {
    noise(0, 0.05, 0.15);
    sweep(900, 400, "sine", 0, 0.08, 0.06);
  } catch {}
}

export function playNumberTick() {
  try {
    noise(0, 0.03, 0.1);
    osc(350 + Math.random() * 150, "square", 0, 0.03, 0.07);
  } catch {}
}

export function playWin() {
  try {
    const mel = [523,659,784,880,1047,1319];
    mel.forEach((f, i) => {
      osc(f, "triangle", i * 0.1, 0.25, 0.22);
      osc(f * 2, "sine", i * 0.1 + 0.02, 0.15, 0.06);
    });
    for (let i = 0; i < 8; i++) osc(1500 + Math.random()*600, "sine", i*0.08, 0.1, 0.05);
    sweep(100, 60, "sine", 0, 0.3, 0.25);
  } catch {}
}

export function playLose() {
  try {
    sweep(320, 100, "sawtooth", 0, 0.18, 0.22);
    sweep(200, 80, "sawtooth", 0.15, 0.2, 0.18);
    osc(60, "sine", 0.3, 0.2, 0.12);
  } catch {}
}

export function playTopUp() {
  try {
    [1047,1319,1568,2093,2637].forEach((f,i) => {
      osc(f, "sine", i*0.07, 0.2, 0.2);
      osc(f*1.5, "sine", i*0.07+0.01, 0.1, 0.06);
    });
    osc(3500, "sine", 0.35, 0.5, 0.05);
  } catch {}
}

export function playClick() {
  try {
    noise(0, 0.025, 0.08);
    osc(600, "sine", 0, 0.04, 0.06);
  } catch {}
}

let bgTimers = [];
let bgGain = null;

const CHORDS = [
  [220, 261, 329],
  [174, 220, 261],
  [130, 164, 196],
  [196, 246, 294],
];
const MELODY = [440,494,523,440,392,440,523,494, 523,587,659,523,494,523,659,587];
let melIdx = 0;
let chordIdx = 0;

function scheduleChord(gain) {
  const c = C();
  const chord = CHORDS[chordIdx % CHORDS.length];
  chordIdx++;
  chord.forEach(freq => {
    const o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(gain);
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(0.18, c.currentTime + 0.1);
    g.gain.linearRampToValueAtTime(0, c.currentTime + 1.6);
    o.start(c.currentTime); o.stop(c.currentTime + 1.8);
  });
}

function scheduleMelody(gain) {
  const c = C();
  const freq = MELODY[melIdx % MELODY.length];
  melIdx++;
  const o = c.createOscillator(), g = c.createGain();
  o.connect(g); g.connect(gain);
  o.type = "triangle";
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.05);
  g.gain.linearRampToValueAtTime(0, c.currentTime + 0.35);
  o.start(c.currentTime); o.stop(c.currentTime + 0.4);
}

export function startBgMusic() {
  try {
    if (bgGain) return;
    const c = C();
    bgGain = c.createGain();
    bgGain.gain.setValueAtTime(0.06, c.currentTime);
    bgGain.connect(c.destination);

    const chordLoop = () => {
      if (!bgGain) return;
      scheduleChord(bgGain);
      bgTimers.push(setTimeout(chordLoop, 1800));
    };

    const melLoop = () => {
      if (!bgGain) return;
      scheduleMelody(bgGain);
      bgTimers.push(setTimeout(melLoop, 280 + Math.random() * 120));
    };

    const hatLoop = () => {
      if (!bgGain) return;
      noise(0, 0.04, 0.04);
      bgTimers.push(setTimeout(hatLoop, 300 + Math.random() * 200));
    };

    chordLoop();
    bgTimers.push(setTimeout(melLoop, 400));
    bgTimers.push(setTimeout(hatLoop, 200));
  } catch {}
}

export function stopBgMusic() {
  try {
    bgTimers.forEach(t => clearTimeout(t));
    bgTimers = [];
    if (bgGain) {
      try { bgGain.gain.exponentialRampToValueAtTime(0.001, C().currentTime + 0.4); } catch {}
      bgGain = null;
    }
    melIdx = 0; chordIdx = 0;
  } catch {}
}

let gameTimers = [];
let gameGain = null;

export function startGameAmbient() {
  try {
    if (gameGain) return;
    const c = C();
    gameGain = c.createGain();
    gameGain.gain.setValueAtTime(0.03, c.currentTime);
    gameGain.connect(c.destination);

    const ambLoop = () => {
      if (!gameGain) return;
      const freqs = [130, 155, 174, 196];
      const f = freqs[Math.floor(Math.random() * freqs.length)];
      const o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(gameGain);
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0, c.currentTime);
      g.gain.linearRampToValueAtTime(0.15, c.currentTime + 0.3);
      g.gain.linearRampToValueAtTime(0, c.currentTime + 1.2);
      o.start(c.currentTime); o.stop(c.currentTime + 1.5);
      gameTimers.push(setTimeout(ambLoop, 800 + Math.random() * 1200));
    };

    const coinLoop = () => {
      if (!gameGain) return;
      osc(1200 + Math.random()*400, "sine", 0, 0.15, 0.07);
      osc(800 + Math.random()*300, "sine", 0.08, 0.1, 0.05);
      gameTimers.push(setTimeout(coinLoop, 3000 + Math.random() * 5000));
    };

    ambLoop();
    gameTimers.push(setTimeout(coinLoop, 2000));
  } catch {}
}

export function stopGameAmbient() {
  try {
    gameTimers.forEach(t => clearTimeout(t));
    gameTimers = [];
    if (gameGain) {
      try { gameGain.gain.exponentialRampToValueAtTime(0.001, C().currentTime + 0.4); } catch {}
      gameGain = null;
    }
  } catch {}
}
