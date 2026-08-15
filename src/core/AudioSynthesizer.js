/**
 * TeachDS Hybrid Audio Engine (Pre-rendered PCM Audio Buffers + Web Audio Synthesizer Fallback)
 * Senior Architecture Layer: Core Audio Engine
 * Task ID: TASK-SP1-04 (Sprint 1)
 */

export const AUDIO_THEMES = {
  FUN: 'FUN',
  GAMESHOW: 'GAMESHOW',
  CLASSIC: 'CLASSIC'
};

class AudioSynthesizer {
  constructor() {
    this.audioContext = null;
    this.isMuted = false;
    this.volume = 0.85;
    this.currentTheme = AUDIO_THEMES.FUN;

    // Rich Pre-rendered Audio Buffer Cache
    this.bufferCache = new Map();
    this.audioFiles = {
      chime: '/assets/sounds/star-chime.wav',
      applause: '/assets/sounds/applause.wav',
      fanfare: '/assets/sounds/fireworks-fanfare.wav',
      warning: '/assets/sounds/warning-beep.wav'
    };

    this.initAudioContext();
  }

  initAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        this.preRenderBuffers();
      }
    } catch (e) {
      console.warn('⚠️ [AudioEngine] Web Audio API not supported in this browser environment');
    }
  }

  ensureAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  /**
   * Pre-render high quality AudioBuffers into RAM memory on startup
   */
  preRenderBuffers() {
    if (!this.audioContext) return;
    const sampleRate = this.audioContext.sampleRate || 44100;

    // 1. Pre-render Chime Buffer (Ting-Ting 880Hz -> 1760Hz)
    const chimeDur = 0.4;
    const chimeLen = Math.floor(sampleRate * chimeDur);
    const chimeBuf = this.audioContext.createBuffer(1, chimeLen, sampleRate);
    const cData = chimeBuf.getChannelData(0);
    for (let i = 0; i < chimeLen; i++) {
      const t = i / sampleRate;
      const env1 = Math.exp(-12 * t);
      const env2 = t > 0.1 ? Math.exp(-10 * (t - 0.1)) : 0;
      cData[i] = 0.4 * env1 * Math.sin(2 * Math.PI * 880 * t) + 0.6 * env2 * Math.sin(2 * Math.PI * 1760 * (t - 0.1));
    }
    this.bufferCache.set('chime', chimeBuf);

    // 2. Pre-render Applause Buffer (Rhythmic Applause Cheer)
    const appDur = 0.8;
    const appLen = Math.floor(sampleRate * appDur);
    const appBuf = this.audioContext.createBuffer(1, appLen, sampleRate);
    const aData = appBuf.getChannelData(0);
    for (let i = 0; i < appLen; i++) {
      const t = i / sampleRate;
      const env = Math.exp(-3 * t);
      const clap = Math.sin(2 * Math.PI * 25 * t) > 0 ? 1 : -1;
      const noise = (Math.random() * 2 - 1) * env * 0.3;
      aData[i] = noise * (0.8 + 0.2 * clap);
    }
    this.bufferCache.set('applause', appBuf);

    // 3. Pre-render Fanfare Buffer (C-Major Celebration Chord)
    const fanDur = 0.8;
    const fanLen = Math.floor(sampleRate * fanDur);
    const fanBuf = this.audioContext.createBuffer(1, fanLen, sampleRate);
    const fData = fanBuf.getChannelData(0);
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    for (let i = 0; i < fanLen; i++) {
      const t = i / sampleRate;
      let val = 0;
      freqs.forEach((freq, idx) => {
        const delay = idx * 0.08;
        if (t >= delay) {
          const env = Math.exp(-6 * (t - delay));
          val += 0.25 * env * Math.sin(2 * Math.PI * freq * (t - delay));
        }
      });
      fData[i] = val;
    }
    this.bufferCache.set('fanfare', fanBuf);

    // 4. Pre-render Warning Buffer (440Hz Sawtooth Beep)
    const warnDur = 0.3;
    const warnLen = Math.floor(sampleRate * warnDur);
    const warnBuf = this.audioContext.createBuffer(1, warnLen, sampleRate);
    const wData = warnBuf.getChannelData(0);
    for (let i = 0; i < warnLen; i++) {
      const t = i / sampleRate;
      const env = Math.exp(-8 * t);
      wData[i] = 0.3 * env * (2 * ((t * 440) % 1) - 1);
    }
    this.bufferCache.set('warning', warnBuf);

    console.log('🎵 [AudioEngine Hybrid] Pre-rendered 4 high-quality PCM AudioBuffers into RAM');
  }

  /**
   * Play Sound using Hybrid approach: Try AudioBuffer RAM cache first, fallback to oscillator
   */
  async playSound(soundKey, synthesizerFallbackFn) {
    if (this.isMuted) return;
    this.ensureAudioContext();

    if (this.audioContext && this.bufferCache.has(soundKey)) {
      try {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        source.buffer = this.bufferCache.get(soundKey);
        gainNode.gain.value = this.volume;

        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start(0);
        console.log(`🎵 [AudioEngine Hybrid] Played static audio buffer: '${soundKey}'`);
        return;
      } catch (e) {
        console.warn(`[AudioEngine Hybrid] Error playing buffer '${soundKey}', trying fallback:`, e);
      }
    }

    // Fallback
    if (typeof synthesizerFallbackFn === 'function') {
      synthesizerFallbackFn();
    }
  }

  /**
   * Play Star Reward Chime (Ting-Ting)
   */
  playChime() {
    this.playSound('chime', () => this.synthesizeChime());
  }

  /**
   * Play Applause Cheer Sound
   */
  playApplause() {
    this.playSound('applause', () => this.synthesizeApplause());
  }

  /**
   * Play Fireworks Celebration Fanfare
   */
  playFanfare() {
    this.playSound('fanfare', () => this.synthesizeFanfare());
  }

  /**
   * Play Warning Alert Beep
   */
  playWarning() {
    this.playSound('warning', () => this.synthesizeWarning());
  }

  // Fallback Oscillator Generators
  /**
   * Play Focus Chime Sequence (Plays 5 consecutive attention beeps)
   */
  playFocusChimeSequence(count = 5) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.playWarning();
      }, i * 220);
    }
  }

  synthesizeChime() {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  synthesizeApplause() {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, now);
    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  synthesizeFanfare() {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(523.25, now);
    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  synthesizeWarning() {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Sound Engine Controls
   */
  setTheme(themeName) {
    if (AUDIO_THEMES[themeName]) {
      this.currentTheme = themeName;
      console.log(`🎵 [AudioEngine] Switched audio theme to: ${themeName}`);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * Self-benchmarking test verifying DoD compliance (< 10ms trigger time)
   */
  benchmarkAudio() {
    console.log(`🧪 [AudioEngine Benchmark] Testing audio trigger latency...`);
    const start = performance.now();
    this.playChime();
    const duration = performance.now() - start;

    console.log(`🏆 [AudioEngine Benchmark Results]:`);
    console.log(`   - Audio Trigger Duration: ${duration.toFixed(3)}ms`);
    console.log(`   - DoD Standard (< 10ms): ${duration < 10.0 ? '✅ PASSED PERFECTLY' : '❌ FAILED'}`);
    return duration < 10.0;
  }
}

export const audioSynthesizer = new AudioSynthesizer();
