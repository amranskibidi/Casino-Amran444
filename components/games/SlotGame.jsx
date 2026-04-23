"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { SLOT_SYMBOLS, SLOT_PAY, fmt } from "@/lib/casino";
import { BetSelector } from "@/components/UI";

export default function SlotGame({ bal, deduct, add, toast }) {
  const [reels, setReels] = useState(["🍒", "🔔", "💎"]);
  const [spinning, setSpinning] = useState(false);
  const [pull, setPull] = useState(false);
  const [bet, setBet] = useState(10000);
  const [result, setResult] = useState(null);

  const spin = () => {
    if (spinning || bal < bet) { toast("Saldo tidak cukup!", "loss"); return; }
    deduct(bet); setSpinning(true); setPull(true); setResult(null);
    setTimeout(() => setPull(false), 550);

    const nr = Array.from({ length: 3 }, () => SLOT_SYMBOLS[Math.floor(Math.random() * 6)]);
    if (Math.random() < .22) nr[0] = nr[1] = nr[2] = SLOT_SYMBOLS[Math.floor(Math.random() * 6)];

    setTimeout(() => {
      setReels(nr); setSpinning(false);
      if (nr[0] === nr[1] && nr[1] === nr[2]) {
        const m = SLOT_PAY[nr[0]] || 2, prize = bet * m;
        add(prize); setResult({ win: true, prize, m });
        toast(`🏆 JACKPOT! +${fmt(prize)} (×${m})`, "win");
      } else {
        setResult({ win: false });
        toast("Hampir! Coba lagi.", "loss");
      }
    }, 1100);
  };

  return (
    <div className="gview">
      <div className="gtitle">🎰 Classic Slot</div>
      <div className="slot-wrap">
        <div className="slot-body">
          <div className="slot-screen">
            {reels.map((s, i) => (
              <motion.div key={i} className="reel"
                animate={spinning ? { y: [0, -16, 0, -10, 0] } : { y: 0 }}
                transition={{ duration: .85, delay: i * .1 }}>
                {s}
              </motion.div>
            ))}
          </div>
          {result && (
            <motion.div className={`res ${result.win ? "res-win" : "res-loss"}`}
              initial={{ scale: .7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 480 }}>
              {result.win ? `+${fmt(result.prize)} ×${result.m}` : "Tidak menang 😢"}
            </motion.div>
          )}
        </div>
        <motion.button className="lever" onClick={spin}
          disabled={spinning || bal < bet}
          animate={pull ? { rotate: [0, 28, 0], scaleY: [1, .9, 1] } : {}}
          transition={{ duration: .5 }} whileTap={{ scale: .9 }}>
          <div className="l-knob">⬤</div>
          <div className="l-rod" />
          PULL
        </motion.button>
      </div>
      <BetSelector bet={bet} onChange={setBet} bal={bal} />
      <div className="payout">
        <div className="pay-ttl">Tabel Bayar</div>
        <div className="pay-grid">
          {Object.entries(SLOT_PAY).map(([s, m]) => (
            <div key={s} className="pay-row">
              <span>{s}{s}{s}</span>
              <span className="pay-mult">×{m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
