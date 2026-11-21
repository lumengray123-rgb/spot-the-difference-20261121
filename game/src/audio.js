// Tiny synthesized sound effects for Double Take. No audio files: every
// sound is a few WebAudio oscillator notes, so the game loads nothing.

let context = null;
let muted = false;

function ensureContext() {
  if (!context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    context = new AudioContextClass();
  }
  if (context.state === 'suspended') void context.resume();
  return context;
}

// Unlock audio on the first user gesture; browsers block sound before one.
export function unlockAudio() {
  ensureContext();
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = value;
}

function tone(freq, startIn, duration, type = 'sine', volume = 0.16) {
  if (muted) return;
  const ctx = ensureContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ctx.currentTime + startIn;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

// A bright two-note chime when a difference is found.
export function playFind() {
  tone(880, 0, 0.16, 'sine', 0.18);
  tone(1318, 0.09, 0.24, 'sine', 0.16);
}

// A soft low buzz for a wrong click.
export function playMiss() {
  tone(160, 0, 0.18, 'sawtooth', 0.07);
  tone(120, 0.05, 0.18, 'sawtooth', 0.06);
}

// A short rising arpeggio when a scene is completed.
export function playSceneDone() {
  tone(523, 0, 0.18, 'triangle', 0.16);
  tone(659, 0.11, 0.18, 'triangle', 0.16);
  tone(784, 0.22, 0.18, 'triangle', 0.16);
  tone(1046, 0.33, 0.34, 'triangle', 0.17);
}

// A longer fanfare for finishing the whole game.
export function playVictory() {
  const notes = [523, 659, 784, 1046, 784, 1046, 1318];
  notes.forEach((freq, i) => tone(freq, i * 0.13, 0.22, 'triangle', 0.16));
}

// A single soft tick for a button press.
export function playTick() {
  tone(660, 0, 0.07, 'sine', 0.08);
}

// A gentle shimmer when a hint fires.
export function playHint() {
  tone(1174, 0, 0.14, 'sine', 0.1);
  tone(1568, 0.08, 0.2, 'sine', 0.09);
}
