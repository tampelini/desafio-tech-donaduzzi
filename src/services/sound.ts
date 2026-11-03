/*
 * Efeitos sonoros sintetizados com Web Audio (sem arquivos externos, funciona
 * offline). O AudioContext só é criado após um toque do usuário, respeitando
 * as políticas de autoplay do Chrome.
 */

export type SoundName = 'start' | 'correct' | 'wrong' | 'next' | 'finish';

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

/** Chamar dentro de um handler de toque. */
export function unlockAudio() {
  if (!enabled) return;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

type Note = [freq: number, start: number, duration: number, type?: OscillatorType, gain?: number];

const SOUNDS: Record<SoundName, Note[]> = {
  start: [[523, 0, 0.12, 'triangle'], [659, 0.1, 0.12, 'triangle'], [784, 0.2, 0.22, 'triangle']],
  correct: [[660, 0, 0.1, 'sine', 0.25], [990, 0.09, 0.22, 'sine', 0.25]],
  wrong: [[220, 0, 0.18, 'sawtooth', 0.08], [180, 0.14, 0.24, 'sawtooth', 0.08]],
  next: [[880, 0, 0.06, 'sine', 0.12]],
  finish: [[523, 0, 0.14, 'triangle'], [659, 0.12, 0.14, 'triangle'], [784, 0.24, 0.14, 'triangle'], [1047, 0.36, 0.4, 'triangle']],
};

export function playSound(name: SoundName) {
  if (!enabled || !ctx || ctx.state !== 'running') return;
  try {
    const now = ctx.currentTime;
    for (const [freq, start, duration, type = 'sine', gain = 0.18] of SOUNDS[name]) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, now + start);
      g.gain.exponentialRampToValueAtTime(gain, now + start + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
      osc.connect(g).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + duration + 0.05);
    }
  } catch {
    // Áudio é opcional: qualquer falha é ignorada.
  }
}
