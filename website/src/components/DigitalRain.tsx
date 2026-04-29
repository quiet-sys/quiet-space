"use client";

import { useEffect, useRef } from "react";

const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";

interface Drop {
  x: number;
  y: number;
  speed: number;
  length: number;
}

export default function DigitalRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const drops: Drop[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const columns = Math.floor(canvas.width / 20);
    for (let i = 0; i < columns; i++) {
      drops.push({
        x: i * 20,
        y: Math.random() * canvas.height * -1,
        speed: 0.5 + Math.random() * 1.5,
        length: 5 + Math.floor(Math.random() * 15),
      });
    }

    const draw = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const drop of drops) {
        drop.y += drop.speed;

        if (drop.y > canvas.height + 50) {
          drop.y = -(drop.length * 20);
          drop.x = Math.floor(Math.random() * columns) * 20;
        }

        for (let i = 0; i < drop.length; i++) {
          const y = drop.y - i * 20;
          if (y < 0 || y > canvas.height) continue;

          const char = chars[Math.floor(Math.random() * chars.length)];
          const alpha = 1 - i / drop.length;
          ctx.fillStyle = `rgba(0, 240, 255, ${alpha * 0.12})`;
          ctx.font = "14px monospace";
          ctx.fillText(char, drop.x, y);
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
