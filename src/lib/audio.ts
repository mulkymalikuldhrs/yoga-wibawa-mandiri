// ============================================================
// Audio utilities for YWM Dashboard
// ============================================================

/**
 * Play a short notification beep using the Web Audio API.
 * Safe to call anywhere — wrapped in try/catch.
 */
export function playNotificationBeep() {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gain.gain.value = 0.3;
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch {
    // Silently fail — audio not supported or blocked
  }
}

/**
 * Play an alert beep (higher pitch, longer duration).
 */
export function playAlertBeep() {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 1200;
    oscillator.type = 'square';
    gain.gain.value = 0.2;
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch {
    // Silently fail
  }
}
