import React, { useEffect, useRef } from 'react';
import './DiwaliEffects.css';

// Web Audio API Synthesizer for realistic cracker & sparkler sounds (No external audio files needed!)
class CrackerAudio {
  constructor() {
    this.ctx = null;
    this.enabled = false;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPop() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);

      // Add noise crackle
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.linearRampToValueAtTime(300, now + 0.12);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);
    } catch (e) {
      // Audio fallback silent
    }
  }

  playSparkle() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3000, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch (e) {}
  }
}

const audioInstance = new CrackerAudio();

// Main Interactive Diwali Effects Layer (Canvas Fireworks, Sparklers & Rockets)
export default function DiwaliEffects({ isMobile }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle pools
    const sparklers = [];
    const fireworks = [];
    const rockets = [];

    // Color palettes for fireworks
    const PALETTES = [
      ['#fbbf24', '#f59e0b', '#d97706', '#fef08a'], // Golden Diwali
      ['#ef4444', '#f87171', '#fecaca', '#fbbf24'], // Crimson Ruby
      ['#10b981', '#34d399', '#a7f3d0', '#fbbf24'], // Emerald
      ['#a855f7', '#c084fc', '#e9d5ff', '#38bdf8'], // Royal Violet
      ['#38bdf8', '#60a5fa', '#93c5fd', '#ffffff'], // Sapphire
      ['#ec4899', '#f472b6', '#fbcfe8', '#fde047'], // Festive Rose
    ];

    // Spawn Sparkler particle (Anar / Handheld)
    const addSparkler = (x, y, vx, vy, color, size = 2, maxLife = 40) => {
      sparklers.push({
        x,
        y,
        vx,
        vy,
        color,
        size,
        life: 0,
        maxLife: maxLife + Math.random() * 20,
        gravity: 0.12,
        decay: 0.96,
        flicker: Math.random() * 6.28
      });
    };

    // Spawn Explosion
    const triggerExplosion = (x, y, style = 'normal') => {
      const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
      const count = isMobile ? 35 : (style === 'bomb' ? 80 : 55);

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = style === 'bomb' ? (2 + Math.random() * 6.5) : (1.5 + Math.random() * 4.5);
        fireworks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: palette[Math.floor(Math.random() * palette.length)],
          size: style === 'bomb' ? (2 + Math.random() * 2.5) : (1.8 + Math.random() * 1.8),
          alpha: 1,
          gravity: 0.08,
          friction: 0.97,
          life: 0,
          maxLife: 35 + Math.random() * 25,
          twinkle: Math.random() > 0.4
        });
      }
    };

    window.__triggerDiwaliExplosion = triggerExplosion;

    // Launch a rocket that rises and bursts
    const launchRocket = (startX, targetX, targetY) => {
      rockets.push({
        x: startX,
        y: canvas.height + 10,
        targetX,
        targetY,
        vx: (targetX - startX) * 0.035,
        vy: -7 - Math.random() * 3,
        color: '#fef08a'
      });
    };

    // Mouse/Touch Handheld Sparkler Emitter
    let mouse = { x: -100, y: -100, active: false };
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onMouseLeave = () => {
      mouse.active = false;
    };
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
        mouse.active = true;
      }
    };

    const parentElem = canvas.parentElement;
    if (parentElem) {
      parentElem.addEventListener('mousemove', onMouseMove);
      parentElem.addEventListener('mouseleave', onMouseLeave);
      parentElem.addEventListener('touchmove', onTouchMove);
      parentElem.addEventListener('touchend', onMouseLeave);
    }

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Cursor Sparkler (Phuljhadi in hand)
      if (mouse.active && frame % 2 === 0) {
        for (let i = 0; i < (isMobile ? 2 : 4); i++) {
          const a = Math.random() * Math.PI * 2;
          const s = 1.2 + Math.random() * 3.2;
          const c = Math.random() > 0.4 ? '#fde047' : (Math.random() > 0.5 ? '#f97316' : '#ffffff');
          addSparkler(mouse.x, mouse.y, Math.cos(a) * s, Math.sin(a) * s, c, 1.8, 25);
        }
        if (Math.random() < 0.15) {
          audioInstance.playSparkle();
        }
      }

      // 2. Periodic Background Fireworks Rockets
      if (frame % (isMobile ? 120 : 80) === 0) {
        const side = Math.random() > 0.5 ? 'left' : 'right';
        const startX = side === 'left' ? canvas.width * 0.15 : canvas.width * 0.85;
        const targetX = canvas.width * (0.2 + Math.random() * 0.6);
        const targetY = canvas.height * (0.15 + Math.random() * 0.35);
        launchRocket(startX, targetX, targetY);
      }

      // 4. Update and draw Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.08; // slight drag

        // Rocket sparkle trail
        addSparkler(r.x, r.y, (Math.random() - 0.5) * 1.5, Math.random() * 2, '#fde047', 1.6, 16);

        // Rocket head
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.fill();

        // Check if reached apex or target
        if (r.y <= r.targetY || r.vy >= 0) {
          triggerExplosion(r.x, r.y, Math.random() > 0.6 ? 'bomb' : 'normal');
          audioInstance.playPop();
          rockets.splice(i, 1);
        }
      }

      // 5. Update and draw Fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const p = fireworks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = p.twinkle && Math.random() > 0.3 ? p.alpha * 0.6 : p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - (p.life / p.maxLife) * 0.3), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life >= p.maxLife) {
          fireworks.splice(i, 1);
        }
      }

      // 6. Update and draw Sparklers
      for (let i = sparklers.length - 1; i >= 0; i--) {
        const s = sparklers[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += s.gravity;
        s.vx *= s.decay;
        s.vy *= s.decay;
        s.life++;
        const alpha = Math.max(0, 1 - s.life / s.maxLife);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 6;

        // Draw glittering star/spark
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (1 - (s.life / s.maxLife) * 0.4), 0, Math.PI * 2);
        ctx.fill();

        // Subtle spark glimmer cross
        if (s.life < s.maxLife * 0.4 && Math.random() > 0.7) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(s.x - 3, s.y);
          ctx.lineTo(s.x + 3, s.y);
          ctx.moveTo(s.x, s.y - 3);
          ctx.lineTo(s.x, s.y + 3);
          ctx.stroke();
        }

        ctx.restore();

        if (s.life >= s.maxLife) {
          sparklers.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      if (parentElem) {
        parentElem.removeEventListener('mousemove', onMouseMove);
        parentElem.removeEventListener('mouseleave', onMouseLeave);
        parentElem.removeEventListener('touchmove', onTouchMove);
        parentElem.removeEventListener('touchend', onMouseLeave);
      }
      delete window.__triggerDiwaliExplosion;
    };
  }, [isMobile]);

  return (
    <div ref={containerRef} className="diwali-effects-wrapper">
      {/* Interactive HTML5 Canvas for Fireworks, Rockets & Sparklers */}
      <canvas ref={canvasRef} className="diwali-canvas" />
    </div>
  );
}
