/**
 * Web Audio API synth notification sound for kitchen order alerts.
 * Plays a pleasant double chime notification when a new order arrives.
 */
export function playNewOrderSound() {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    // First tone (G5 - 783.99 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    // Second tone (C6 - 1046.50 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.6);

    // Third tone (E6 - 1318.51 Hz) - high flourish
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();

    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.3);
    gain3.gain.setValueAtTime(0.5, ctx.currentTime + 0.3);
    gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

    osc3.connect(gain3);
    gain3.connect(ctx.destination);

    osc3.start(ctx.currentTime + 0.3);
    osc3.stop(ctx.currentTime + 0.9);

  } catch (err) {
    console.warn('Audio chime playback failed:', err);
  }
}
