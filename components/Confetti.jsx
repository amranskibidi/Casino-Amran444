"use client";
import { useEffect, useRef } from "react";

export default function Confetti({ active, multiplier = 1 }) {
  const ref = useRef();
  const lightning = useRef();

  useEffect(() => {
    if (!active) return;

    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const count = multiplier >= 10 ? 300 : multiplier >= 5 ? 200 : multiplier >= 3 ? 140 : 80;
    const colors = multiplier >= 10
      ? ["#f0c040","#ff2d78","#00e5ff","#00c864","#fff","#c9a227","#ffd700","#ff6600","#ff0000"]
      : multiplier >= 5
      ? ["#f0c040","#ff2d78","#00e5ff","#00c864","#fff","#c9a227"]
      : ["#f0c040","#ff2d78","#00e5ff","#00c864","#fff"];

    const useCoins = multiplier >= 5;

    const pieces = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: -30 - Math.random() * 300,
      w: useCoins ? 12 + Math.random() * 8 : 8 + Math.random() * 8,
      h: useCoins ? 12 + Math.random() * 8 : 4 + Math.random() * 5,
      isCoin: useCoins && Math.random() > 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * (multiplier >= 5 ? 7 : 5),
      vy: 1.5 + Math.random() * (multiplier >= 10 ? 5 : 3.5),
      rot: Math.random() * 360,
      rSpeed: (Math.random() - 0.5) * (multiplier >= 5 ? 14 : 9),
      opacity: 0.85 + Math.random() * 0.15,
    }));

    const bills = multiplier >= 10
      ? Array.from({ length: 30 }, () => ({
          x: Math.random() * canvas.width,
          y: -50 - Math.random() * 200,
          vx: (Math.random() - 0.5) * 4,
          vy: 1 + Math.random() * 2.5,
          rot: Math.random() * 360,
          rSpeed: (Math.random() - 0.5) * 6,
        }))
      : [];

    let lightningFlash = 0;
    let lightningTimer = null;
    if (multiplier >= 10) {
      const flashLightning = () => {
        lightningFlash = 1;
        setTimeout(() => { lightningFlash = 0; }, 80);
        lightningTimer = setTimeout(flashLightning, 600 + Math.random() * 800);
      };
      lightningTimer = setTimeout(flashLightning, 200);
    }

    let anim;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (lightningFlash > 0) {
        ctx.fillStyle = `rgba(200,230,255,${lightningFlash * 0.18})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = `rgba(100,200,255,${lightningFlash * 0.9})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = "#00e5ff";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        const lx = Math.random() * canvas.width;
        ctx.moveTo(lx, 0);
        let cy = 0;
        while (cy < canvas.height * 0.6) {
          cy += 40 + Math.random() * 60;
          ctx.lineTo(lx + (Math.random() - 0.5) * 80, cy);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        lightningFlash = Math.max(0, lightningFlash - 0.15);
      }

      bills.forEach(b => {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot * Math.PI / 180);
        ctx.fillStyle = "#1a7a3a";
        ctx.strokeStyle = "#2aba5a";
        ctx.lineWidth = 1;
        ctx.fillRect(-20, -10, 40, 20);
        ctx.strokeRect(-20, -10, 40, 20);
        ctx.fillStyle = "#2aba5a";
        ctx.font = "bold 8px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Rp", 0, 4);
        ctx.restore();
        b.x += b.vx; b.y += b.vy; b.rot += b.rSpeed; b.vy += 0.04;
      });

      let alive = false;
      pieces.forEach(p => {
        if (p.y < canvas.height + 30) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.isCoin) {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.4)";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          ctx.beginPath();
          ctx.ellipse(-p.w/6, -p.h/6, p.w/5, p.h/5, 0, 0, Math.PI*2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }

        ctx.restore();
        p.x += p.vx; p.y += p.vy;
        p.rot += p.rSpeed; p.vy += 0.055;
        p.vx *= 0.995;
        if (Math.abs(p.vx) < 0.1) p.vx += (Math.random() - 0.5) * 0.3;
      });

      if (alive || bills.some(b => b.y < canvas.height + 50)) {
        anim = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => {
      cancelAnimationFrame(anim);
      if (lightningTimer) clearTimeout(lightningTimer);
    };
  }, [active, multiplier]);

  if (!active) return null;
  return (
    <canvas ref={ref} style={{
      position: "fixed", inset: 0, zIndex: 999,
      pointerEvents: "none", width: "100vw", height: "100vh",
    }} />
  );
}
