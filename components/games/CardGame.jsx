"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CARD_SUITS, CARD_VALS, CARD_NUM, fmt } from "@/lib/casino";
import { BetSelector } from "@/components/UI";

const rand = () => ({ val: CARD_VALS[Math.floor(Math.random() * 13)], suit: CARD_SUITS[Math.floor(Math.random() * 4)] });

function PCard({ card, hidden }) {
  if (hidden) return <div className="pcard back">🂠</div>;
  const red = card.suit === "♥" || card.suit === "♦";
  return (
    <div className={`pcard face ${red ? "red" : "blk"}`}>
      <div className="cc tl">{card.val}<br />{card.suit}</div>
      <div className="cmid">{card.suit}</div>
      <div className="cc br">{card.val}<br />{card.suit}</div>
    </div>
  );
}

export default function CardGame({ bal, deduct, add, toast }) {
  const [cur, setCur] = useState(rand());
  const [next, setNext] = useState(null);
  const [phase, setPhase] = useState("guess");
  const [bet, setBet] = useState(10000);
  const [mode, setMode] = useState("hl");

  const reset = (m) => { setMode(m); setPhase("guess"); setCur(rand()); setNext(null); };

  const guess = (choice) => {
    if (bal < bet) { toast("Saldo tidak cukup!", "loss"); return; }
    deduct(bet);
    const nc = rand(); setNext(nc); setPhase("reveal");
    let win = false;
    if (mode === "hl") {
      const cn = CARD_NUM[cur.val] || +cur.val, nn = CARD_NUM[nc.val] || +nc.val;
      win = choice === "hi" ? nn > cn : nn < cn;
    } else {
      const isRed = nc.suit === "♥" || nc.suit === "♦";
      win = choice === "rd" ? isRed : !isRed;
    }
    if (win) { const p = bet * 2; add(p); toast(`✅ Benar! +${fmt(p)}`, "win"); }
    else toast("❌ Salah tebak!", "loss");
  };

  return (
    <div className="gview">
      <div className="gtitle">🃏 Card Guesser</div>
      <div className="mode-row">
        <button className={`mode-btn ${mode === "hl" ? "on" : ""}`} onClick={() => reset("hl")}>Lebih Tinggi / Rendah</button>
        <button className={`mode-btn ${mode === "col" ? "on" : ""}`} onClick={() => reset("col")}>Merah / Hitam</button>
      </div>
      <div className="card-arena">
        <div className="card-slot"><span className="card-lbl">Sekarang</span><PCard card={cur} /></div>
        <div className="card-vs">VS</div>
        <div className="card-slot">
          <span className="card-lbl">Berikutnya</span>
          {phase === "reveal" && next
            ? <motion.div initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} transition={{ duration: .4 }}><PCard card={next} /></motion.div>
            : <PCard hidden />}
        </div>
      </div>
      {phase === "guess" && (
        <motion.div className="guess-row" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {mode === "hl" ? (<>
            <button className="gbtn hi" onClick={() => guess("hi")}>⬆ Lebih Tinggi</button>
            <button className="gbtn lo" onClick={() => guess("lo")}>⬇ Lebih Rendah</button>
          </>) : (<>
            <button className="gbtn rd" onClick={() => guess("rd")}>🔴 Merah</button>
            <button className="gbtn bk" onClick={() => guess("bk")}>⚫ Hitam</button>
          </>)}
        </motion.div>
      )}
      {phase === "reveal" && (
        <div className="next-row">
          <button className="actbtn" style={{ maxWidth: 220 }}
            onClick={() => { setCur(next); setNext(null); setPhase("guess"); }}>
            Kartu Berikutnya →
          </button>
        </div>
      )}
      <BetSelector bet={bet} onChange={setBet} bal={bal} />
      <p className="gnote">Menang = 2× bet anda</p>
    </div>
  );
}
