// ============================================================
// Audio trigger — abstract interface for notification sounds.
// The browser implementation uses HTMLAudioElement.
// For Unity: implement the same interface with Unity's AudioSource.
// ============================================================

/**
 * Abstract sound player interface.
 * Implement this for each platform (browser, Unity, etc.).
 */
export interface SoundPlayer {
  /** Play a notification sound. Returns a promise that resolves when done or fails gracefully. */
  play(): Promise<void>;
}

/**
 * Browser implementation using HTMLAudioElement.
 * Creates a single Audio instance and reuses it.
 */
export function createBrowserSoundPlayer(audioUrl: string): SoundPlayer {
  let audio: HTMLAudioElement | null = null;

  return {
    async play(): Promise<void> {
      try {
        if (!audio) {
          audio = new Audio(audioUrl);
          // Preload
          audio.load();
        }
        audio.currentTime = 0;
        await audio.play();
      } catch {
        // User hasn't interacted with the page yet, or audio file missing.
        // Silently ignore — sound is a nice-to-have, not critical.
      }
    },
  };
}

/**
 * No-op sound player — use when sound is unavailable or disabled.
 */
export function createNoopSoundPlayer(): SoundPlayer {
  return {
    async play(): Promise<void> {
      // intentional no-op
    },
  };
}

/**
 * Create a beep sound using the Web Audio API (no audio file needed).
 * Falls back to no-op if Web Audio is unavailable.
 */
export function createBeepSoundPlayer(): SoundPlayer {
  return {
    async play(): Promise<void> {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);

        // Clean up after playback
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
          ctx.close();
        };
      } catch {
        // Web Audio not available — silent fallback
      }
    },
  };
}
