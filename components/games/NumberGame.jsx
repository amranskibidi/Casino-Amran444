"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { fmt } from "@/lib/casino";
import { BetSelector } from "@/components/UI";

export default function NumberGame({ bal, deduct, add, toast }) {
  const [picked, setPicked] = useState(null);
  const [display, setDisplay] = useState(5);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [bet, setBet] = useState(10000);

  const play = () => {
    if (picked === null) { toast("Pilih angka dulu!", "info"); return; }
    if (bal < bet) { toast("Saldo tidak cukup!", "loss"); return; }
    deduct(bet); setSpinning(true); setResult(null);
    let count = 0;
    const iv = setInterval(() => {
      setDisplay(Math.floor(Math.random() * 10) + 1);
      if (++count >= 20) {
        clearInterval(iv);
        const final = Math.floor(Math.random() * 10) + 1;
        setDisplay(final); setSpinning(false);
        if (final === picked) {
          const prize = bet * 9; add(prize);
          setResult({ win: true, n: final, prize });
          toast(`🎯 JACKPOT! Angka ${final}! +${fmt(prize)}`, "win");
        } else {
          setResult({ win: false, n: final });
          toast(`Angka keluar: ${final}. Coba lagi!`, "loss");
        }
      }
    }, 75);
  };

  return (
    <div className="gview">
      <div className="gtitle">🎯 Number Picker</div>
      <p className="gsub">Pilih angka 1–10 · Tebak benar = 9× lipat!</p>
      <div className="num-wrap">
        <motion.div
          className={`num-disp ${spinning ? "spin" : ""} ${result?.win ? "won" : ""}`}
          animate={spinning ? { scale: [1, 1.04, 1] } : { scale: 1 }}
          transition={{ repeat: spinning ? Infinity : 0, duration: .38 }}>
          {display}
        </motion.div>
        {result && (
          <motion.div className={`res ${result.win ? "res-win" : "res-loss"}`}
            initial={{ scale: .6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500 }}>
            {result.win ? `🏆 JACKPOT! +${fmt(result.prize)}` : `Angka keluar: ${result.n}`}
          </motion.div>
        )}
      </div>
      <div className="num-grid">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <motion.button key={n} className={`nbtn ${picked === n ? "on" : ""}`}
            onClick={() => setPicked(n)}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: .9 }}>
            {n}
          </motion.button>
        ))}
      </div>
      <BetSelector bet={bet} onChange={setBet} bal={bal} />
      <button className="actbtn lg" onClick={play} disabled={spinning || picked === null}>
        {spinning ? "🎲 Memutar..." : "🎯 Pasang Bet!"}
      </button>
    </div>
  );
}
