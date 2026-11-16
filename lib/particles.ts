type Particle = {
  x: number; y: number; vx: number; vy: number; r: number; c: string;
  rot: number; vr: number; life: number; g: string | null; float?: boolean;
};

const COLORS = ["#e8557a", "#f58aa5", "#e9b44c", "#ffd6e0", "#6d1a36", "#fff"];

export type ParticleEngine = {
  burst: (x: number, y: number, n?: number, glyphs?: string[] | null) => void;
  rain: (n?: number) => void;
  destroy: () => void;
};

export function createParticles(cv: HTMLCanvasElement): ParticleEngine {
  const cx = cv.getContext("2d")!;
  let P: Particle[] = [];
  let raf = 0;

  const size = () => { cv.width = innerWidth; cv.height = innerHeight; };
  size();
  addEventListener("resize", size);

  const burst: ParticleEngine["burst"] = (x, y, n = 120, glyphs = null) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = Math.random() * 9 + 3;
      P.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4, r: Math.random() * 6 + 4,
        c: COLORS[i % COLORS.length], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
        life: 160, g: glyphs ? glyphs[0] : Math.random() < 0.25 ? "♥" : null,
      });
    }
  };

  const rain: ParticleEngine["rain"] = (n = 150) => {
    for (let i = 0; i < n; i++)
      P.push({
        x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight,
        vx: (Math.random() - 0.5) * 2, vy: Math.random() * 3 + 2, r: Math.random() * 6 + 4,
        c: COLORS[i % COLORS.length], rot: 0, vr: 0.1, life: 400, g: Math.random() < 0.3 ? "♥" : null,
      });
  };

  const loop = () => {
    cx.clearRect(0, 0, cv.width, cv.height);
    P = P.filter((p) => p.life-- > 0 && p.y < innerHeight + 40);
    for (const p of P) {
      if (!p.float) p.vy += 0.12; // floating hearts ignore gravity
      p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot);
      cx.globalAlpha = Math.min(1, p.life / 40); cx.fillStyle = p.c;
      if (p.g) { cx.font = `${p.r * 3}px serif`; cx.fillText(p.g, 0, 0); }
      else cx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
      cx.restore();
    }
    raf = requestAnimationFrame(loop);
  };
  loop();

  // gentle floating hearts
  const hearts = setInterval(() => {
    if (P.length < 200)
      P.push({
        x: Math.random() * innerWidth, y: innerHeight + 20, vx: 0, vy: -1.6, r: 5 + Math.random() * 4,
        c: "#f58aa5", rot: 0, vr: 0, life: 500, g: "♥", float: true,
      });
  }, 900);

  return {
    burst,
    rain,
    destroy: () => {
      cancelAnimationFrame(raf);
      clearInterval(hearts);
      removeEventListener("resize", size);
    },
  };
}
