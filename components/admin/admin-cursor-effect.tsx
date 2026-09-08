"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, MousePointer, Flame, EyeOff } from "lucide-react";

export type CursorEffectType = "neon-glow" | "bubble-trail" | "spotlight-torch" | "galaxy-dust" | "product-orbit" | "disabled";

const STORAGE_KEY = "admin_cursor_effect";

export function AdminCursorEffect() {
  const [effectType, setEffectType] = useState<CursorEffectType>("neon-glow");
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [trailPos, setTrailPos] = useState({ x: -100, y: -100 });
  const [isClicking, setIsClicking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; radius: number; color: string; alpha: number; life: number }>>([]);
  const animFrameRef = useRef<number | null>(null);

  // Product Orbit state
  const productImagesRef = useRef<string[]>([]);
  const productCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [productOrbitParticles, setProductOrbitParticles] = useState<Array<{
    id: number; x: number; y: number; vx: number; vy: number;
    size: number; maxSize: number; alpha: number; life: number;
    imgUrl: string; angle: number; orbitSpeed: number;
  }>>([]);
  const orbitIdRef = useRef(0);

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as CursorEffectType | null;
    if (saved && ["neon-glow", "bubble-trail", "spotlight-torch", "galaxy-dust", "product-orbit", "disabled"].includes(saved)) {
      setEffectType(saved);
    }

    const handleStorageChange = () => {
      const updated = localStorage.getItem(STORAGE_KEY) as CursorEffectType | null;
      if (updated) setEffectType(updated);
    };

    window.addEventListener("admin_cursor_change", handleStorageChange);
    return () => window.removeEventListener("admin_cursor_change", handleStorageChange);
  }, []);

  // Load product images for product-orbit effect
  useEffect(() => {
    if (effectType !== "product-orbit") return;
    if (productImagesRef.current.length > 0) return;

    fetch("/api/products?limit=50")
      .then((res) => res.json())
      .then((data) => {
        const allImages: string[] = [];
        (data.products || []).forEach((p: any) => {
          if (p.images && p.images.length > 0) {
            allImages.push(p.images[0]);
          }
        });
        productImagesRef.current = [...new Set(allImages)].slice(0, 20);
      })
      .catch(() => {});
  }, [effectType]);

  // Track Mouse Movement
  useEffect(() => {
    if (effectType === "disabled") return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      setMousePos({ x, y });

      // Spawn particles for Bubble Trail or Neon Sparkles
      if (effectType === "bubble-trail") {
        const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];
        for (let i = 0; i < 2; i++) {
          particlesRef.current.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2 - 1,
            radius: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            life: 1,
          });
        }
      } else if (effectType === "neon-glow") {
        if (Math.random() > 0.3) {
          particlesRef.current.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            radius: Math.random() * 3 + 1.5,
            color: "#34d399",
            alpha: 1,
            life: 1,
          });
        }
      } else if (effectType === "galaxy-dust") {
        const galaxyColors = ["#a78bfa", "#818cf8", "#c084fc", "#f0abfc", "#67e8f9", "#fbbf24"];
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.5 + 0.5;
        for (let i = 0; i < 3; i++) {
          const spiralAngle = angle + i * (Math.PI * 2 / 3);
          particlesRef.current.push({
            x: x + Math.cos(spiralAngle) * (Math.random() * 8),
            y: y + Math.sin(spiralAngle) * (Math.random() * 8),
            vx: Math.cos(spiralAngle) * speed * 0.6,
            vy: Math.sin(spiralAngle) * speed * 0.6 - 0.5,
            radius: Math.random() * 4 + 2,
            color: galaxyColors[Math.floor(Math.random() * galaxyColors.length)],
            alpha: 1,
            life: 1,
          });
        }
      } else if (effectType === "product-orbit" && productImagesRef.current.length > 0) {
        if (Math.random() > 0.7) {
          const angle = Math.random() * Math.PI * 2;
          const imgUrl = productImagesRef.current[Math.floor(Math.random() * productImagesRef.current.length)];
          const newParticle = {
            id: orbitIdRef.current++,
            x, y,
            vx: Math.cos(angle) * (Math.random() * 0.6 + 0.2),
            vy: Math.sin(angle) * (Math.random() * 0.6 + 0.2),
            size: 12,
            maxSize: Math.random() * 50 + 25,
            alpha: 0.85,
            life: 1,
            imgUrl,
            angle,
            orbitSpeed: (Math.random() - 0.5) * 0.03,
          };
          setProductOrbitParticles(prev => [...prev.slice(-25), newParticle]);
        }
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [effectType]);

  // Lagging trail position animation loop
  useEffect(() => {
    if (effectType === "disabled") return;

    const loop = () => {
      setTrailPos((prev) => ({
        x: prev.x + (mousePos.x - prev.x) * 0.2,
        y: prev.y + (mousePos.y - prev.y) * 0.2,
      }));

      // Render Canvas Particles
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          particlesRef.current.forEach((p, idx) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.alpha = Math.max(0, p.life);

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0, p.radius * p.life), 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.restore();
          });

          // Remove dead particles
          particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
        }
      }

      // Update Product Orbit Particles (DOM-based, no canvas)
      if (effectType === "product-orbit") {
        setProductOrbitParticles(prev => {
          const updated = prev.map(p => ({
            ...p,
            angle: p.angle + p.orbitSpeed,
            x: p.x + p.vx + Math.cos(p.angle) * 0.4,
            y: p.y + p.vy + Math.sin(p.angle) * 0.4,
            size: Math.min(p.size + 0.3, p.maxSize),
            life: p.life - 0.003,
            alpha: Math.max(0, (p.life - 0.003) * 0.7),
          }));
          return updated.filter(p => p.life > 0);
        });
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mousePos, effectType]);

  // Resize canvas to window size
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (effectType === "disabled") return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Canvas for Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Style 1: Neon Glow Cursor */}
      {effectType === "neon-glow" && (
        <>
          {/* Direct Dot */}
          <div
            className="fixed top-0 left-0 size-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75"
            style={{
              transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) scale(${isClicking ? 0.7 : 1})`,
            }}
          />

          {/* Smooth Trailing Neon Ring */}
          <div
            className="fixed top-0 left-0 size-8 rounded-full border-2 border-emerald-400/80 shadow-[0_0_20px_#10b981] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-100 ease-out"
            style={{
              transform: `translate3d(${trailPos.x}px, ${trailPos.y}px, 0) scale(${isClicking ? 1.4 : 1})`,
            }}
          />
        </>
      )}

      {/* Style 2: Bubble Trail Center Dot */}
      {effectType === "bubble-trail" && (
        <div
          className="fixed top-0 left-0 size-4 rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-300 shadow-[0_0_15px_#34d399] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) scale(${isClicking ? 1.5 : 1})`,
          }}
        />
      )}

      {/* Style 3: Radial Torch Spotlight */}
      {effectType === "spotlight-torch" && (
        <>
          {/* Torch Light Beam Overlay */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.18), rgba(6, 182, 212, 0.08) 40%, transparent 80%)`,
            }}
          />

          {/* Torch Cursor Ring */}
          <div
            className="fixed top-0 left-0 size-10 rounded-full border border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.5)] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-100"
            style={{
              transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) scale(${isClicking ? 1.3 : 1})`,
            }}
          />
        </>
      )}

      {/* Style 4: Galaxy Dust */}
      {effectType === "galaxy-dust" && (
        <>
          {/* Pulsating Galaxy Core */}
          <div
            className="fixed top-0 left-0 size-5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) scale(${isClicking ? 1.6 : 1})`,
              background: 'radial-gradient(circle, #c084fc 0%, #818cf8 40%, transparent 70%)',
              boxShadow: '0 0 20px #a78bfa, 0 0 40px #818cf8, 0 0 60px rgba(167,139,250,0.3)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />

          {/* Orbiting Ring */}
          <div
            className="fixed top-0 left-0 size-10 rounded-full border border-purple-400/50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              transform: `translate3d(${trailPos.x}px, ${trailPos.y}px, 0) scale(${isClicking ? 1.5 : 1})`,
              boxShadow: '0 0 15px rgba(192,132,252,0.4), inset 0 0 15px rgba(129,140,248,0.2)',
              animation: 'spin 4s linear infinite',
            }}
          />

          {/* Ambient Aurora Glow */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(250px circle at ${mousePos.x}px ${mousePos.y}px, rgba(167,139,250,0.12), rgba(192,132,252,0.06) 40%, transparent 70%)`,
            }}
          />
        </>
      )}

      {/* Style 5: Product Orbit */}
      {effectType === "product-orbit" && (
        <>
          {/* Floating Product Images (DOM-based) */}
          {productOrbitParticles.map((p) => (
            <div
              key={p.id}
              className="fixed top-0 left-0 rounded-full overflow-hidden pointer-events-none"
              style={{
                width: p.size,
                height: p.size,
                transform: `translate3d(${p.x - p.size / 2}px, ${p.y - p.size / 2}px, 0)`,
                opacity: p.alpha,
                boxShadow: `0 0 ${p.size * 0.3}px rgba(203,184,219,0.4), 0 0 ${p.size * 0.6}px rgba(203,184,219,0.15)`,
                border: '2px solid rgba(203,184,219,0.35)',
              }}
            >
              <img
                src={p.imgUrl}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          ))}

          {/* Cursor Core Dot */}
          <div
            className="fixed top-0 left-0 size-4 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) scale(${isClicking ? 1.5 : 1})`,
              background: 'radial-gradient(circle, #CBB8DB 0%, #9b7fb8 50%, transparent 70%)',
              boxShadow: '0 0 15px rgba(203,184,219,0.6), 0 0 30px rgba(155,127,184,0.3)',
            }}
          />

          {/* Trailing Ring */}
          <div
            className="fixed top-0 left-0 size-8 rounded-full border border-[#CBB8DB]/40 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-100"
            style={{
              transform: `translate3d(${trailPos.x}px, ${trailPos.y}px, 0) scale(${isClicking ? 1.4 : 1})`,
              boxShadow: '0 0 12px rgba(203,184,219,0.3)',
            }}
          />

          {/* Subtle Ambient Glow */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(203,184,219,0.08), transparent 70%)`,
            }}
          />
        </>
      )}
    </div>
  );
}

export function AdminCursorSwitcher() {
  const [current, setCurrent] = useState<CursorEffectType>("neon-glow");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as CursorEffectType | null;
    if (saved && ["neon-glow", "bubble-trail", "spotlight-torch", "galaxy-dust", "product-orbit", "disabled"].includes(saved)) {
      setCurrent(saved);
    }
  }, []);

  const changeEffect = (newType: CursorEffectType) => {
    setCurrent(newType);
    localStorage.setItem(STORAGE_KEY, newType);
    window.dispatchEvent(new Event("admin_cursor_change"));
    setIsOpen(false);
  };

  const getEffectLabel = (type: CursorEffectType) => {
    switch (type) {
      case "neon-glow":
        return "✨ Neon Glow";
      case "bubble-trail":
        return "🫧 Bubble Trail";
      case "spotlight-torch":
        return "🔦 Spotlight Torch";
      case "galaxy-dust":
        return "🌌 Galaxy Dust";
      case "product-orbit":
        return "🛍️ Product Orbit";
      case "disabled":
        return "🚫 Off";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 dark:bg-slate-800/80 hover:bg-muted dark:hover:bg-slate-700 border border-border dark:border-slate-700 text-xs font-bold text-foreground transition"
        title="Change Admin Cursor Effect"
      >
        <Sparkles className="size-3.5 text-emerald-500" />
        <span className="hidden sm:inline">Cursor:</span>
        <span className="text-emerald-600 dark:text-emerald-400">{getEffectLabel(current)}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-card dark:bg-[#161b22] border border-border dark:border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-bold text-muted-foreground uppercase px-2.5 py-1">
            Select Cursor Style
          </div>

          <button
            onClick={() => changeEffect("neon-glow")}
            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              current === "neon-glow"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-foreground hover:bg-muted/50 dark:hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">✨ 1. Neon Glow</span>
            {current === "neon-glow" && <span className="size-1.5 rounded-full bg-emerald-500" />}
          </button>

          <button
            onClick={() => changeEffect("bubble-trail")}
            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              current === "bubble-trail"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-foreground hover:bg-muted/50 dark:hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">🫧 2. Bubble Trail</span>
            {current === "bubble-trail" && <span className="size-1.5 rounded-full bg-emerald-500" />}
          </button>

          <button
            onClick={() => changeEffect("spotlight-torch")}
            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              current === "spotlight-torch"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-foreground hover:bg-muted/50 dark:hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">🔦 3. Spotlight Torch</span>
            {current === "spotlight-torch" && <span className="size-1.5 rounded-full bg-emerald-500" />}
          </button>

          <button
            onClick={() => changeEffect("galaxy-dust")}
            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              current === "galaxy-dust"
                ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold"
                : "text-foreground hover:bg-muted/50 dark:hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">🌌 4. Galaxy Dust</span>
            {current === "galaxy-dust" && <span className="size-1.5 rounded-full bg-purple-500" />}
          </button>

          <button
            onClick={() => changeEffect("product-orbit")}
            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              current === "product-orbit"
                ? "bg-[#CBB8DB]/20 text-[#9b7fb8] dark:text-[#CBB8DB] font-bold"
                : "text-foreground hover:bg-muted/50 dark:hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">🛍️ 5. Product Orbit</span>
            {current === "product-orbit" && <span className="size-1.5 rounded-full bg-[#CBB8DB]" />}
          </button>

          <div className="my-1 border-t border-border dark:border-slate-800" />

          <button
            onClick={() => changeEffect("disabled")}
            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              current === "disabled"
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold"
                : "text-muted-foreground hover:bg-muted/50 dark:hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">🚫 Disabled</span>
            {current === "disabled" && <span className="size-1.5 rounded-full bg-rose-500" />}
          </button>
        </div>
      )}
    </div>
  );
}
