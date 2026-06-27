'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number; size: number; speedX: number; speedY: number;
  opacity: number; fadeDir: number; char: string;
}

const CHARS = ['✦', '✧', '·', '◦', '❋', '✿', '°', '∗'];

export default function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 12 + 8,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4 - 0.2,
        opacity: Math.random() * 0.4 + 0.1,
        fadeDir: Math.random() > 0.5 ? 1 : -1,
        char: CHARS[Math.floor(Math.random() * CHARS.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.fadeDir * 0.003;
        if (p.opacity >= 0.5 || p.opacity <= 0.05) p.fadeDir *= -1;
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = '#C9962C';
        ctx.font = `${p.size}px serif`;
        ctx.fillText(p.char, p.x, p.y);
        ctx.restore();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
