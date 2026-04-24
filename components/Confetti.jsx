"use client";
import { useEffect, useRef } from "react";

export default function Confetti({ active }) {
  const ref = useRef();

  useEffect(() => {
    if (!active || !ref.current) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      w: 8 + Math.random() * 8,
      h: 4 + Math.random() * 4,
      color: ["#f0c040","#ff2d78","#00e5ff","#00c864","#fff","#c9a227"][Math.floor(Math.random()*6)],
      vx: (Math.random() - 0.5) * 5,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * 360,
      rSpeed: (Math.random() - 0.5) * 10,
    }));

    let anim;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach(p => {
        if (p.y < canvas.height + 20) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
        p.x += p.vx; p.y += p.vy;
        p.rot += p.rSpeed; p.vy += 0.06;
        p.vx *= 0.99;
      });
      if (alive) anim = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(anim);
  }, [active]);

  if (!active) return null;
  return <canvas ref={ref} style={{ position:"fixed", inset:0, zIndex:999, pointerEvents:"none" }} />;
}
