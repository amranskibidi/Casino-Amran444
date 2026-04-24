"use client";

let ctx = null;
const C = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

const osc = (freq, type, t, dur, vol = 0.3) => {
  try {
    const c = C(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + t);
    g.gain.setValueAtTime(vol, c.currentTime + t);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t + dur);
    o.start(c.currentTime + t); o.stop(c.currentTime + t + dur + 0.05);
  } catch {}
};

const sweep = (f0, f1, type, t, dur, vol = 0.2) => {
  try {
    const c = C(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type;
    o.frequency.setValueAtTime(f0, c.currentTime + t);
    o.frequency.exponentialRampToValueAtTime(f1, c.currentTime + t + dur);
    g.gain.setValueAtTime(vol, c.currentTime + t);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t + dur);
    o.start(c.currentTime + t); o.stop(c.currentTime + t + dur + 0.05);
  } catch {}
};

const noise = (t, dur, vol = 0.12) => {
  try {
    const c = C(), buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(), g = c.createGain();
    src.buffer = buf; src.connect(g); g.connect(c.destination);
    g.gain.setValueAtTime(vol, c.currentTime + t);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t + dur);
    src.start(c.currentTime + t); src.stop(c.currentTime + t + dur + 0.05);
  } catch {}
};

export function playLeverPull() {
  try { noise(0, 0.04, 0.18); sweep(300, 120, "sawtooth", 0, 0.12, 0.1); noise(0.1, 0.06, 0.12); } catch {}
}

export function playSlotSpin() {
  try {
    sweep(60, 280, "sawtooth", 0, 0.8, 0.09);
    sweep(80, 320, "square", 0.05, 0.75, 0.05);
    for (let i = 0; i < 12; i++) { noise(i * 0.07, 0.05, 0.07 + i * 0.003); osc(120 + i * 8, "square", i * 0.07, 0.04, 0.05); }
  } catch {}
}

export function playSlotStop(idx = 0) {
  try { noise(idx * 0.02, 0.07, 0.22); osc(200 - idx * 25, "square", idx * 0.02, 0.06, 0.18); osc(100, "sine", idx * 0.02 + 0.03, 0.05, 0.08); } catch {}
}

export function playCardFlip() {
  try { noise(0, 0.05, 0.15); sweep(900, 400, "sine", 0, 0.08, 0.06); } catch {}
}

export function playNumberTick() {
  try { noise(0, 0.03, 0.1); osc(350 + Math.random() * 150, "square", 0, 0.03, 0.07); } catch {}
}

export function playClick() {
  try { noise(0, 0.025, 0.08); osc(600, "sine", 0, 0.04, 0.06); } catch {}
}

export function playTopUp() {
  try {
    [1047,1319,1568,2093,2637].forEach((f,i) => { osc(f,"sine",i*0.07,0.2,0.2); osc(f*1.5,"sine",i*0.07+0.01,0.1,0.06); });
    osc(3500,"sine",0.35,0.5,0.05);
  } catch {}
}

export function playWin(multiplier = 1) {
  try {
    if (multiplier >= 10) {
      playMegaWin();
    } else if (multiplier >= 5) {
      const mel = [392,494,587,659,784,988,1047,1319];
      mel.forEach((f,i) => { osc(f,"triangle",i*0.09,0.3,0.28); osc(f*2,"sine",i*0.09,0.15,0.08); });
      sweep(80,40,"sine",0,0.5,0.3);
      for (let i=0;i<10;i++) osc(1400+Math.random()*800,"sine",i*0.07,0.12,0.06);
    } else {
      const mel = [523,659,784,1047];
      mel.forEach((f,i) => { osc(f,"triangle",i*0.12,0.22,0.22); osc(f*2,"sine",i*0.12,0.1,0.05); });
      for (let i=0;i<5;i++) osc(1600+Math.random()*500,"sine",i*0.08,0.1,0.05);
      sweep(100,60,"sine",0,0.3,0.2);
    }
  } catch {}
}

export function playMegaWin() {
  try {
    noise(0, 0.08, 0.9);
    noise(0.05, 0.06, 0.7);
    sweep(8000, 200, "sawtooth", 0, 0.15, 0.4);
    sweep(6000, 100, "sawtooth", 0.06, 0.2, 0.35);
    sweep(150, 40, "sine", 0.1, 0.6, 0.5);
    osc(60, "sine", 0.1, 0.8, 0.4);
    const mel = [262,330,392,494,523,659,784,988,1047,1319,1568,2093];
    mel.forEach((f,i) => {
      osc(f,"triangle",0.2+i*0.08,0.35,0.25);
      osc(f*2,"sine",0.2+i*0.08+0.02,0.2,0.08);
      osc(f*0.5,"sine",0.2+i*0.08,0.3,0.1);
    });
    for (let i=0;i<20;i++) osc(1200+Math.random()*1200,"sine",i*0.06+0.3,0.15,0.07);
    setTimeout(() => { noise(0,0.06,0.7); sweep(5000,150,"sawtooth",0,0.12,0.3); }, 800);
  } catch {}
}

export function playLose() {
  try {
    sweep(320, 160, "sawtooth", 0, 0.4, 0.15);
    sweep(280, 140, "sawtooth", 0.05, 0.4, 0.12);
    sweep(300, 150, "sawtooth", 0.1, 0.4, 0.1);
    sweep(400, 100, "triangle", 0, 0.5, 0.18);
    osc(80, "sine", 0.4, 0.3, 0.15);
    noise(0.45, 0.15, 0.08);
  } catch {}
}

export function playWithdraw() {
  try {
    for (let i=0;i<8;i++) {
      osc(800+Math.random()*600,"sine",i*0.08,0.18,0.14);
      osc(1200+Math.random()*400,"sine",i*0.08+0.04,0.12,0.08);
      noise(i*0.08,0.05,0.06);
    }
    sweep(200,80,"sine",0.6,0.4,0.2);
    [1047,1319,1568].forEach((f,i)=>osc(f,"triangle",0.7+i*0.1,0.2,0.15));
  } catch {}
}

let bgTimers = [];
let bgGain = null;

const JAZZ_CHORDS = [
  [220, 277, 330, 415],
  [174, 220, 277, 349],
  [196, 247, 294, 370],
  [130, 165, 196, 247],
  [233, 277, 349, 415],
  [146, 185, 220, 277],
];

const BASS_NOTES = [110, 98, 87, 110, 123, 110, 98, 87, 130, 110, 98, 87];
const MELODY_LICKS = [
  [523,587,659,587,523,494,523],
  [659,698,659,587,523,494,440,494],
  [784,698,659,587,659,698,784],
  [523,494,440,415,440,494,523,587],
  [659,587,523,440,392,440,523],
];

let chordIdx = 0, bassIdx = 0, lickIdx = 0, noteInLick = 0;

function playJazzChord(gain) {
  try {
    const c = C();
    const chord = JAZZ_CHORDS[chordIdx % JAZZ_CHORDS.length]; chordIdx++;
    chord.forEach((freq, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(gain);
      o.type = i === 0 ? "triangle" : "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, c.currentTime);
      g.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.08);
      g.gain.linearRampToValueAtTime(0.06, c.currentTime + 1.0);
      g.gain.linearRampToValueAtTime(0, c.currentTime + 1.8);
      o.start(c.currentTime); o.stop(c.currentTime + 2.0);
    });
  } catch {}
}

function playWalkingBass(gain) {
  try {
    const c = C();
    const freq = BASS_NOTES[bassIdx % BASS_NOTES.length]; bassIdx++;
    const o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(gain);
    o.type = "triangle"; o.frequency.value = freq;
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(0.22, c.currentTime + 0.03);
    g.gain.linearRampToValueAtTime(0, c.currentTime + 0.38);
    o.start(c.currentTime); o.stop(c.currentTime + 0.45);
  } catch {}
}

function playMelodyNote(gain) {
  try {
    const c = C();
    const lick = MELODY_LICKS[lickIdx % MELODY_LICKS.length];
    const freq = lick[noteInLick % lick.length];
    noteInLick++;
    if (noteInLick >= lick.length) { noteInLick = 0; lickIdx++; }
    const o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(gain);
    o.type = "triangle"; o.frequency.value = freq;
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(0.14, c.currentTime + 0.02);
    g.gain.linearRampToValueAtTime(0, c.currentTime + 0.28);
    o.start(c.currentTime); o.stop(c.currentTime + 0.32);
  } catch {}
}

function playHiHat(gain) {
  try {
    const c = C();
    const buf = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
    const src = c.createBufferSource(), g = c.createGain();
    const hpf = c.createBiquadFilter();
    hpf.type = "highpass"; hpf.frequency.value = 8000;
    src.buffer = buf; src.connect(hpf); hpf.connect(g); g.connect(gain);
    g.gain.setValueAtTime(0.06, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05);
    src.start(c.currentTime); src.stop(c.currentTime + 0.06);
  } catch {}
}

export function startBgMusic() {
  try {
    if (bgGain) return;
    const c = C();
    bgGain = c.createGain();
    bgGain.gain.setValueAtTime(0.07, c.currentTime);
    bgGain.connect(c.destination);

    const chordLoop = () => { if (!bgGain) return; playJazzChord(bgGain); bgTimers.push(setTimeout(chordLoop, 1800)); };
    const bassLoop = () => { if (!bgGain) return; playWalkingBass(bgGain); bgTimers.push(setTimeout(bassLoop, 420)); };
    const melLoop = () => { if (!bgGain) return; playMelodyNote(bgGain); bgTimers.push(setTimeout(melLoop, 240 + Math.random()*140)); };
    const hatLoop = () => { if (!bgGain) return; playHiHat(bgGain); bgTimers.push(setTimeout(hatLoop, 210 + (Math.random()>0.7?210:0))); };

    chordLoop();
    bgTimers.push(setTimeout(bassLoop, 100));
    bgTimers.push(setTimeout(melLoop, 500));
    bgTimers.push(setTimeout(hatLoop, 50));
  } catch {}
}

export function stopBgMusic() {
  try {
    bgTimers.forEach(t => clearTimeout(t));
    bgTimers = [];
    if (bgGain) { try { bgGain.gain.exponentialRampToValueAtTime(0.001, C().currentTime + 0.5); } catch {} bgGain = null; }
    chordIdx = 0; bassIdx = 0; lickIdx = 0; noteInLick = 0;
  } catch {}
}

let gameTimers = [], gameGain = null;
export function startGameAmbient() {
  try {
    if (gameGain) return;
    const c = C();
    gameGain = c.createGain();
    gameGain.gain.setValueAtTime(0.035, c.currentTime);
    gameGain.connect(c.destination);
    const ambLoop = () => {
      if (!gameGain) return;
      const freqs = [130,155,174,196,220];
      const f = freqs[Math.floor(Math.random()*freqs.length)];
      const o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(gameGain);
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0,c.currentTime);
      g.gain.linearRampToValueAtTime(0.15,c.currentTime+0.3);
      g.gain.linearRampToValueAtTime(0,c.currentTime+1.4);
      o.start(c.currentTime); o.stop(c.currentTime+1.6);
      gameTimers.push(setTimeout(ambLoop, 900 + Math.random()*1400));
    };
    const coinLoop = () => {
      if (!gameGain) return;
      osc(1000+Math.random()*500,"sine",0,0.18,0.08);
      osc(700+Math.random()*300,"sine",0.1,0.12,0.05);
      gameTimers.push(setTimeout(coinLoop, 2500 + Math.random()*5000));
    };
    ambLoop();
    gameTimers.push(setTimeout(coinLoop, 1500));
  } catch {}
}

export function stopGameAmbient() {
  try {
    gameTimers.forEach(t => clearTimeout(t));
    gameTimers = [];
    if (gameGain) { try { gameGain.gain.exponentialRampToValueAtTime(0.001, C().currentTime+0.4); } catch {} gameGain = null; }
  } catch {}
}
