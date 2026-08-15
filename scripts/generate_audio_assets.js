import fs from 'fs';
import path from 'path';

function createWavBuffer(sampleRate, durationSec, generateSampleFn) {
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * 2; // 16-bit mono
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels (1 = Mono)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32);  // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sampleVal = Math.max(-1, Math.min(1, generateSampleFn(t, durationSec)));
    const intVal = Math.floor(sampleVal * 32767);
    buffer.writeInt16LE(intVal, 44 + i * 2);
  }

  return buffer;
}

const sampleRate = 44100;
const soundsDir = path.resolve('d:/SDE Software/9Teach/TeachDS/public/assets/sounds');

if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// 1. Star Chime (Ting-Ting 880Hz -> 1760Hz)
const chimeWav = createWavBuffer(sampleRate, 0.4, (t) => {
  const env1 = Math.exp(-12 * t);
  const env2 = t > 0.1 ? Math.exp(-10 * (t - 0.1)) : 0;
  return 0.4 * env1 * Math.sin(2 * Math.PI * 880 * t) + 0.6 * env2 * Math.sin(2 * Math.PI * 1760 * (t - 0.1));
});
fs.writeFileSync(path.join(soundsDir, 'star-chime.wav'), chimeWav);
console.log('✅ Generated star-chime.wav');

// 2. Applause (Rhythmic Noise Pulses)
const applauseWav = createWavBuffer(sampleRate, 0.8, (t) => {
  const env = Math.exp(-3 * t);
  const clap = Math.sin(2 * Math.PI * 25 * t) > 0 ? 1 : -1;
  const noise = (Math.random() * 2 - 1) * env * 0.4;
  return noise * (0.8 + 0.2 * clap);
});
fs.writeFileSync(path.join(soundsDir, 'applause.wav'), applauseWav);
console.log('✅ Generated applause.wav');

// 3. Fireworks Fanfare (C-Major Chord Burst)
const fanfareWav = createWavBuffer(sampleRate, 0.8, (t) => {
  const freqs = [523.25, 659.25, 783.99, 1046.50];
  let val = 0;
  freqs.forEach((f, idx) => {
    const delay = idx * 0.08;
    if (t >= delay) {
      const env = Math.exp(-6 * (t - delay));
      val += 0.25 * env * Math.sin(2 * Math.PI * f * (t - delay));
    }
  });
  return val;
});
fs.writeFileSync(path.join(soundsDir, 'fireworks-fanfare.wav'), fanfareWav);
console.log('✅ Generated fireworks-fanfare.wav');

// 4. Warning Beep (440Hz Sawtooth)
const warningWav = createWavBuffer(sampleRate, 0.3, (t) => {
  const env = Math.exp(-8 * t);
  return 0.3 * env * (2 * ((t * 440) % 1) - 1);
});
fs.writeFileSync(path.join(soundsDir, 'warning-beep.wav'), warningWav);
console.log('✅ Generated warning-beep.wav');

console.log('🎉 All static WAV audio files generated in public/assets/sounds/');
