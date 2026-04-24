"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CARD_SUITS, CARD_VALS, CARD_NUM, fmt } from "@/lib/casino";
import { playCardFlip, playWin, playLose, playClick, startGameAmbient, stopGameAmbient } from "@/lib/sound";
import { BetSelector } from "@/components/UI";
import Confetti from "@/components/Confetti";

const rand = () => ({ val: CARD_VALS[Math.floor(Math.random()*13)], suit: CARD_SUITS[Math.floor(Math.random()*4)] });

function PCard({ card, hidden, flip }) {
  if (hidden) return (
    <div className="pcard back" style={{
      background:"linear-gradient(135deg,#1a1230,#0a0818)",
      border:"2px solid rgba(201,162,39,0.25)",
      boxShadow:"0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
    }}>
      <div style={{fontSize:"2.4rem",opacity:0.7}}>🂠</div>
    </div>
  );
  const red = card.suit === "♥" || card.suit === "♦";
  return (
    <motion.div className={`pcard face ${red?"red":"blk"}`}
      style={{boxShadow:"0 8px 28px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)"}}
      initial={flip ? {rotateY:90,scale:0.85} : false}
      animate={{rotateY:0,scale:1}}
      transition={{duration:0.4,type:"spring",stiffness:280}}>
      <div className="cc tl">{card.val}<br/>{card.suit}</div>
      <div className="cmid">{card.suit}</div>
      <div className="cc br">{card.val}<br/>{card.suit}</div>
    </motion.div>
  );
}

export default function CardGame({ bal, deduct, add, toast }) {
  const [cur, setCur] = useState(rand());
  const [next, setNext] = useState(null);
  const [phase, setPhase] = useState("guess");
  const [bet, setBet] = useState(10000);
  const [mode, setMode] = useState("hl");
  const [confetti, setConfetti] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => { startGameAmbient(); return () => stopGameAmbient(); }, []);

  const reset = (m) => { playClick(); setMode(m); setPhase("guess"); setCur(rand()); setNext(null); setStreak(0); };

  const guess = (choice) => {
    if (bal < bet) { toast("Saldo tidak cukup!", "loss"); return; }
    deduct(bet);
    const nc = rand();
    setNext(nc); setPhase("reveal");
    playCardFlip();
    let win = false;
    if (mode === "hl") {
      const cn = CARD_NUM[cur.val] || +cur.val;
      const nn = CARD_NUM[nc.val] || +nc.val;
      win = choice === "hi" ? nn > cn : nn < cn;
    } else {
      const isRed = nc.suit === "♥" || nc.suit === "♦";
      win = choice === "rd" ? isRed : !isRed;
    }
    if (win) {
      const newStreak = streak + 1;
      const multi = newStreak >= 3 ? 3 : newStreak >= 2 ? 2.5 : 2;
      const p = Math.floor(bet * multi);
      add(p); setStreak(newStreak);
      playWin();
      if (newStreak >= 2) { setConfetti(true); setTimeout(() => setConfetti(false), 3000); }
      toast(`✅ Benar! +${fmt(p)}${newStreak >= 2 ? ` 🔥×${newStreak}` : ""}`, "win");
    } else {
      playLose(); setStreak(0);
      toast("❌ Salah tebak!", "loss");
    }
  };

  return (
    <div className="gview">
      <Confetti active={confetti} />
      <div className="gtitle">🃏 Card Guesser</div>

      {}
      <AnimatePresence>
        {streak > 0 && (
          <motion.div initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0}}
            style={{
              textAlign:"center", marginBottom:12,
              background:"linear-gradient(135deg,rgba(240,192,64,0.15),rgba(201,162,39,0.05))",
              border:"1px solid rgba(240,192,64,0.3)", borderRadius:999,
              padding:"6px 20px", display:"inline-block",
              width:"100%", fontFamily:"'Cinzel',serif", fontSize:"0.85rem", color:"var(--gl)",
            }}>
            🔥 Streak ×{streak} {streak>=3?"PANAS BANGET!":streak>=2?"Terus lanjut!":""}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mode-row">
        <button className={`mode-btn ${mode==="hl"?"on":""}`} onClick={() => reset("hl")}>⬆⬇ Tinggi / Rendah</button>
        <button className={`mode-btn ${mode==="col"?"on":""}`} onClick={() => reset("col")}>🔴⚫ Warna</button>
      </div>

      <div className="card-arena">
        <div className="card-slot"><span className="card-lbl">Kartu Kamu</span><PCard card={cur} /></div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
          <div className="card-vs">VS</div>
          <div style={{fontSize:"0.65rem",color:"var(--dim)"}}>tebak</div>
        </div>
        <div className="card-slot">
          <span className="card-lbl">Kartu Berikutnya</span>
          {phase==="reveal"&&next ? <PCard card={next} flip /> : <PCard hidden />}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase==="guess" && (
          <motion.div key="guess" className="guess-row"
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}>
            {mode==="hl" ? (<>
              <button className="gbtn hi" onClick={() => guess("hi")}>⬆ Lebih Tinggi</button>
              <button className="gbtn lo" onClick={() => guess("lo")}>⬇ Lebih Rendah</button>
            </>) : (<>
              <button className="gbtn rd" onClick={() => guess("rd")}>🔴 Merah</button>
              <button className="gbtn bk" onClick={() => guess("bk")}>⚫ Hitam</button>
            </>)}
          </motion.div>
        )}
        {phase==="reveal" && (
          <motion.div key="next" className="next-row"
            initial={{opacity:0}} animate={{opacity:1}}>
            <button className="actbtn" style={{maxWidth:220}}
              onClick={() => { setCur(next); setNext(null); setPhase("guess"); }}>
              Kartu Berikutnya →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <BetSelector bet={bet} onChange={setBet} bal={bal} />
      <p className="gnote">Menang = 2× · Streak ×2 = 2.5× · Streak ×3 = 3×</p>
    </div>
  );
}
