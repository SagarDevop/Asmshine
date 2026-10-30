/**
 * Web Audio API synthesized order chime
 * Clean, pleasant two-tone bell chime for new orders without external audio files
 */
class OrderSoundNotifier {
  constructor() {
    this.audioCtx = null;
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    return this.audioCtx;
  }

  playChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      // Browser autoplay policy requires resume if suspended
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Note 1: High crisp ding (880 Hz - A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.5);

      // Note 2: Harmonious second ding slightly delayed (1318.5 Hz - E6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1318.5, now + 0.12);
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.3, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.12);
      osc2.stop(now + 0.7);
    } catch (err) {
      console.warn('[AudioAlert] Could not play order notification sound:', err.message);
    }
  }
}

export const orderSoundNotifier = new OrderSoundNotifier();
export const playOrderNotificationSound = () => orderSoundNotifier.playChime();
