'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useGame } from '../hooks/useGameState';

export default function AudioSystem() {
  const { settings, gameState } = useGame();
  const audioContextRef = useRef(null);
  const bgMusicRef = useRef(null);
  const bgAudioRef = useRef(null);
  const initializedRef = useRef(false);
  const groanIntervalRef = useRef(null);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;
    }
    if (!initializedRef.current) {
      initializedRef.current = true;
      startBackgroundMusic();
    }
  }, []);

  const playSound = useCallback((frequency, duration, type = 'sawtooth', volume = 0.1) => {
    try {
      if (!audioContextRef.current || settings.sfxVolume === 0) return;
      const ctx = audioContextRef.current;
      const masterVol = settings.masterVolume !== undefined ? settings.masterVolume : 1.0;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(volume * settings.sfxVolume * masterVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }, [settings.sfxVolume, settings.masterVolume]);

  const playGunshot = useCallback(() => {
    playSound(200, 0.08, 'sawtooth', 0.25);
    setTimeout(() => playSound(150, 0.05, 'square', 0.2), 30);
    setTimeout(() => playSound(120, 0.1, 'sawtooth', 0.15), 50);
    setTimeout(() => playSound(80, 0.2, 'sine', 0.08), 80);
    try {
      if (!audioContextRef.current) return;
      const ctx = audioContextRef.current;
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(ctx.currentTime);
    } catch(e) {}
  }, [playSound]);

  const playZombieDeath = useCallback(() => {
    playSound(300, 0.1, 'sawtooth', 0.15);
    setTimeout(() => playSound(200, 0.15, 'sawtooth', 0.12), 80);
    setTimeout(() => playSound(100, 0.25, 'sine', 0.1), 150);
    setTimeout(() => playSound(60, 0.3, 'sine', 0.08), 250);
  }, [playSound]);

  const playHit = useCallback(() => {
    playSound(180, 0.05, 'square', 0.2);
    setTimeout(() => playSound(120, 0.1, 'sawtooth', 0.15), 30);
    setTimeout(() => playSound(80, 0.2, 'sine', 0.12), 80);
  }, [playSound]);

  const playPickup = useCallback(() => {
    playSound(600, 0.08, 'sine', 0.1);
    setTimeout(() => playSound(800, 0.08, 'sine', 0.1), 60);
    setTimeout(() => playSound(1000, 0.1, 'sine', 0.08), 120);
    setTimeout(() => playSound(1200, 0.15, 'sine', 0.06), 180);
  }, [playSound]);

  const playZombieGroan = useCallback(() => {
    playSound(90, 0.5, 'sawtooth', 0.04);
    setTimeout(() => playSound(70, 0.8, 'sine', 0.03), 100);
  }, [playSound]);

  // Background music using actual audio file (only during gameplay)
  const startBackgroundMusic = useCallback(() => {
    try {
      if (bgAudioRef.current) return;
      // Stop welcome music when game starts
      if (window.__welcomeMusic) {
        window.__welcomeMusic.pause();
        window.__welcomeMusic = null;
      }
      const masterVol = settings.masterVolume !== undefined ? settings.masterVolume : 1.0;
      const musicVol = settings.musicVolume * masterVol;
      
      const audio = new Audio('/sounds/zombie-sound-2-357976.mp3');
      audio.loop = true;
      audio.volume = musicVol * 0.3;
      audio.play().catch(() => {});
      bgAudioRef.current = audio;
      
      // Also start oscillator-based ambient music
      if (!audioContextRef.current) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = ctx;
      }
      const ctx = audioContextRef.current;
      const oscillators = [];
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.03 * musicVol, ctx.currentTime);
      gain.connect(ctx.destination);
      
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, ctx.currentTime);
      osc1.connect(gain);
      oscillators.push(osc1);
      
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(82.5, ctx.currentTime);
      osc2.connect(gain);
      oscillators.push(osc2);
      
      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(65.4, ctx.currentTime);
      osc3.connect(gain);
      oscillators.push(osc3);
      
      const osc4 = ctx.createOscillator();
      osc4.type = 'sine';
      osc4.frequency.setValueAtTime(27.5, ctx.currentTime);
      osc4.connect(gain);
      oscillators.push(osc4);
      
      const osc5 = ctx.createOscillator();
      osc5.type = 'triangle';
      osc5.frequency.setValueAtTime(110, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.01 * musicVol, ctx.currentTime);
      osc5.connect(lfoGain);
      lfoGain.connect(ctx.destination);
      oscillators.push(osc5);
      
      oscillators.forEach(osc => osc.start(ctx.currentTime));
      bgMusicRef.current = { oscillators, gain };
      
      // Periodic zombie groans
      if (settings.zombieGroans) {
        if (groanIntervalRef.current) clearInterval(groanIntervalRef.current);
        groanIntervalRef.current = setInterval(() => {
          if (Math.random() < 0.3) playZombieGroan();
        }, 4000);
      }
    } catch (e) {}
  }, [settings.musicVolume, settings.masterVolume, settings.zombieGroans, playZombieGroan]);

  const stopBackgroundMusic = useCallback(() => {
    if (bgAudioRef.current) {
      try { bgAudioRef.current.pause(); bgAudioRef.current = null; } catch(e) {}
    }
    if (bgMusicRef.current) {
      try {
        const { oscillators, gain } = bgMusicRef.current;
        gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.5);
        setTimeout(() => { oscillators.forEach(osc => { try { osc.stop(); } catch(e) {} }); }, 500);
      } catch (e) {}
      bgMusicRef.current = null;
    }
    if (groanIntervalRef.current) { clearInterval(groanIntervalRef.current); groanIntervalRef.current = null; }
  }, []);

  // Update music volume when settings change
  useEffect(() => {
    if (bgAudioRef.current) {
      const masterVol = settings.masterVolume !== undefined ? settings.masterVolume : 1.0;
      bgAudioRef.current.volume = settings.musicVolume * masterVol * 0.3;
    }
    if (bgMusicRef.current) {
      const masterVol = settings.masterVolume !== undefined ? settings.masterVolume : 1.0;
      bgMusicRef.current.gain.gain.setValueAtTime(0.03 * settings.musicVolume * masterVol, audioContextRef.current.currentTime);
    }
  }, [settings.musicVolume, settings.masterVolume]);

  // Update zombie groans when settings change
  useEffect(() => {
    if (settings.zombieGroans && !groanIntervalRef.current) {
      groanIntervalRef.current = setInterval(() => {
        if (Math.random() < 0.3) playZombieGroan();
      }, 4000);
    } else if (!settings.zombieGroans && groanIntervalRef.current) {
      clearInterval(groanIntervalRef.current);
      groanIntervalRef.current = null;
    }
  }, [settings.zombieGroans, playZombieGroan]);

  useEffect(() => {
    window.__audio = {
      init: initAudio,
      playGunshot,
      playZombieDeath,
      playHit,
      playPickup,
      playZombieGroan,
      playSound,
      stopMusic: stopBackgroundMusic,
      startMusic: startBackgroundMusic,
    };
    return () => {
      stopBackgroundMusic();
      delete window.__audio;
    };
  }, [initAudio, playGunshot, playZombieDeath, playHit, playPickup, playZombieGroan, playSound, stopBackgroundMusic, startBackgroundMusic]);

  return null;
}