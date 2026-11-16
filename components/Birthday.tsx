"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CONFIG, PHOTOS } from "@/lib/config";
import { createParticles, type ParticleEngine } from "@/lib/particles";
import { playSong } from "@/lib/song";

export default function Birthday() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fx = useRef<ParticleEngine | null>(null);
  const cakeRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [envOpen, setEnvOpen] = useState(false);
  const [introGone, setIntroGone] = useState(false);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [lightbox, setLightbox] = useState<{ src: string; cap: string } | null>(null);
  const [candlesOut, setCandlesOut] = useState(false);
  const [wish, setWish] = useState("");

  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  // particles + double-click hearts
  useEffect(() => {
    const engine = createParticles(canvasRef.current!);
    fx.current = engine;
    const onDbl = (e: MouseEvent) => engine.burst(e.clientX, e.clientY, 40, ["♥"]);
    document.addEventListener("dblclick", onDbl);
    return () => {
      engine.destroy();
      document.removeEventListener("dblclick", onDbl);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  // reveal on scroll
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("show")),
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal,.moment").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const openEnvelope = () => {
    if (envOpen) return;
    setEnvOpen(true);
    later(() => {
      setIntroGone(true);
      fx.current?.rain(220);
      playSong();
    }, 1300);
  };

  const flip = (i: number) => {
    setFlipped((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
    fx.current?.burst(innerWidth / 2, innerHeight / 2, 18, ["♥"]);
  };

  const blow = () => {
    setCandlesOut(true);
    const r = cakeRef.current!.getBoundingClientRect();
    fx.current?.burst(r.left + r.width / 2, r.top + 40, 160);
    setWish("Your wish is on its way ✨");
    later(() => setCandlesOut(false), 6000);
  };

  const more = () => {
    fx.current?.rain(300);
    for (let i = 0; i < 5; i++)
      later(() => fx.current?.burst(Math.random() * innerWidth, Math.random() * innerHeight * 0.6, 90), i * 400);
  };

  return (
    <>
      <canvas id="fx" ref={canvasRef} />

      <div id="intro" className={introGone ? "gone" : ""}>
        <div className={`envelope${envOpen ? " open" : ""}`} onClick={openEnvelope}>
          <div className="back" />
          <div className="letter">For You ♥</div>
          <div className="front" />
          <div className="flap" />
          <div className="seal">💌</div>
        </div>
        <p>Tap the envelope to open</p>
      </div>

      <section className="hero">
        <h1>Happy Birthday</h1>
        <div className="name script">{CONFIG.name}</div>
        <p className="sub">Today the world celebrates you — and so do I, more than anyone.</p>
        <div className="scroll-hint">scroll down ↓</div>
      </section>

      <section>
        <h2 className="reveal">Reasons I Love You</h2>
        <p className="lead reveal">Tap each card ♥</p>
        <div className="cards">
          {CONFIG.reasons.map((r, i) => (
            <div className="card reveal" key={i} onClick={() => flip(i)}>
              <div className={`in${flipped.has(i) ? " flip" : ""}`}>
                <div className="f"><span>♥</span>Reason #{i + 1}</div>
                <div className="b">{r}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "#fff" }}>
        <h2 className="reveal">Our Little Story</h2>
        <p className="lead reveal">Some of my favourite chapters so far</p>
        <div className="timeline">
          {CONFIG.moments.map((m) => (
            <div className="moment" key={m.t}>
              <h3>{m.t}</h3>
              <p>{m.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="reveal">Us</h2>
        <p className="lead reveal">Every picture with you is my favourite picture. Tap one to see it bigger ♥</p>
        <div className="gallery">
          {PHOTOS.map(([f, c, pos]) => (
            <div className="polaroid" key={f} onClick={() => setLightbox({ src: `/photos/${f}`, cap: c })}>
              <label>
                <Image src={`/photos/${f}`} alt={c} fill sizes="(max-width: 600px) 90vw, 320px" style={{ objectFit: "cover", objectPosition: pos }} />
              </label>
              <div className="cap">{c}</div>
            </div>
          ))}
        </div>
        <div id="lightbox" className={lightbox ? "on" : ""} onClick={() => setLightbox(null)}>
          {lightbox && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightbox.src} alt={lightbox.cap} />
              <div id="lbCap" className="script">{lightbox.cap}</div>
            </>
          )}
        </div>
      </section>

      <section style={{ background: "#fff" }}>
        <h2 className="reveal">Make a Wish</h2>
        <p className="lead reveal">Close your eyes, make a wish, and blow out the candles</p>
        <div className={`cake-wrap${candlesOut ? " out" : ""}`} ref={cakeRef}>
          <div className="candles">
            {[0, 1, 2].map((i) => (
              <div className="candle" key={i}><div className="flame" /></div>
            ))}
          </div>
          <div className="cake">
            <div className="plate" />
            <div className="layer l1" />
            <div className="layer l2" />
            <div className="layer l3" />
          </div>
        </div>
        <div className="row">
          <button className="btn" onClick={blow}>Blow the candles 🌬️</button>
          <button className="btn ghost" onClick={playSong}>Play the birthday song 🎵</button>
        </div>
        <div id="wish">{wish}</div>
      </section>

      <section>
        <h2 className="reveal">A Letter For You</h2>
        <div className="paper reveal">
          <p className="script letter-greeting">My dearest {CONFIG.name},</p>
          {CONFIG.letter.map((p, i) => <p key={i}>{p}</p>)}
          <div className="sign">{CONFIG.from} ♥</div>
        </div>
      </section>

      <section className="final">
        <h2 className="reveal">I Love You</h2>
        <p className="lead reveal">Happy Birthday, {CONFIG.name}. Here&apos;s to many, many more together.</p>
        <button className="btn reveal" onClick={more}>One more surprise ✨</button>
      </section>
      <footer>made with all my love, just for you</footer>

      <button id="music" title="Birthday song" onClick={playSong}>🎵</button>
    </>
  );
}
