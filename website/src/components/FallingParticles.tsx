"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  swing: number;
  swingSpeed: number;
  phase: number;
}

interface FallingParticlesProps {
  count?: number;
  color?: string;
  type?: "petal" | "snow" | "dot";
  sizeRange?: [number, number];
  speedRange?: [number, number];
  opacityRange?: [number, number];
}

export default function FallingParticles({
  count = 40,
  color = "#ff69b4",
  type = "petal",
  sizeRange = [2, 6],
  speedRange = [0.3, 1.2],
  opacityRange = [0.2, 0.6],
}: FallingParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const init = () => {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * -1,
        size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
        speedY: speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: opacityRange[0] + Math.random() * (opacityRange[1] - opacityRange[0]),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        swing: Math.random() * 50 + 20,
        swingSpeed: 0.002 + Math.random() * 0.003,
        phase: Math.random() * Math.PI * 2,
      }));
    };
    init();

    const drawPetal = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawSnow = (p: Particle) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = p.opacity * 0.6;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = p.opacity * 0.3;
      ctx.fill();
    };

    const drawDot = (p: Particle) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.phase += p.swingSpeed;
        p.x += p.speedX + Math.sin(p.phase) * 0.3;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
          p.phase = Math.random() * Math.PI * 2;
        }
        if (p.x < -50) p.x = canvas.width + 50;
        if (p.x > canvas.width + 50) p.x = -50;

        if (type === "petal") drawPetal(p);
        else if (type === "snow") drawSnow(p);
        else drawDot(p);
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [count, color, type, sizeRange, speedRange, opacityRange]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
