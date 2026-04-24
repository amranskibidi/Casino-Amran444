"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fmt } from "@/lib/casino";
import { playNumberTick, playWin, playLose, startGameAmbient, stopGameAmbient } from "@/lib/sound";
import { BetSelector } from "@/components/UI";
import Confetti from "@/components/Confetti";

export default function NumberGame({ bal, deduct, add, toast }) {
  const [picked, setPicked] = useState(null);
  const [display, setDisplay] = useState(5);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [bet, setBet] = useState(10000);
  const [confetti, setConfetti] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => { startGameAmbient(); return () => stopGameAmbient(); }, []);

  const play = () => {
    if (picked === null) { toast("Pilih angka dulu!", "info"); return; }
    if (bal < bet) { toast("Saldo tidak cukup!", "loss"); return; }
    deduct(bet); setSpinning(true); setResult(null);

    let count = 0;
    const iv = setInterval(() => {
      setDisplay(Math.floor(Math.random() * 10) + 1);
      playNumberTick();
      if (++count >= 24) {
        clearInterval(iv);
        const final = Math.floor(Math.random() * 10) + 1;
        setDisplay(final); setSpinning(false);
        setHistory(h => [final, ...h.slice(0,6)]);
        if (final === picked) {
          const prize = bet * 9; add(prize);
          setResult({ win:true, n:final, prize });
          playWin();
          setConfetti(true); setTimeout(() => setConfetti(false), 4500);
          toast(`🎯 JACKPOT! Angka ${final}! +${fmt(prize)}`, "win");
        } else {
          setResult({ win:false, n:final });
          playLose();
          toast(`Angka keluar: ${final}. Coba lagi!`, "loss");
        }
      }
    }, 70);
  };

  return (
    <div className="gview">
      <Confetti active={confetti} />
      <div className="gtitle">🎯 Number Picker</div>
      <p className="gsub">Pilih angka 1–10 · Tebak benar = JACKPOT 9×!</p>

      {}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,margin:"16px 0"}}>
        <div style={{position:"relative"}}>
          <motion.div className={`num-disp ${spinning?"spin":""} ${result?.win?"won":""}`}
            animate={spinning ? {scale:[1,1.06,1],rotate:[0,3,-3,0]} : {scale:1,rotate:0}}
            transition={{repeat:spinning?Infinity:0,duration:0.3}}>
            {display}
          </motion.div>
          {}
          {spinning && (
            <motion.div style={{
              position:"absolute",inset:-8,borderRadius:"50%",
              border:"2px solid var(--cyan)",opacity:0.4,
            }} animate={{scale:[1,1.15,1],opacity:[0.4,0,0.4]}}
            transition={{duration:0.6,repeat:Infinity}}/>
          )}
        </div>

        <AnimatePresence>
          {result && (
            <motion.div className={`res ${result.win?"res-win":"res-loss"}`}
              initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}} exit={{opacity:0}}
              transition={{type:"spring",stiffness:500}}>
              {result.win ? `🏆 JACKPOT! +${fmt(result.prize)}` : `Keluar: ${result.n} — Coba lagi!`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {}
      <div className="num-grid">
        {Array.from({length:10},(_,i)=>i+1).map(n => {
          const isHistory = history[0] === n;
          return (
            <motion.button key={n}
              className={`nbtn ${picked===n?"on":""}`}
              style={isHistory&&!spinning ? {
                borderColor:"rgba(255,45,120,0.4)",
                background:"rgba(255,45,120,0.06)",
              } : {}}
              onClick={() => !spinning && setPicked(n)}
              whileHover={{scale:1.12}} whileTap={{scale:0.88}}>
              {n}
              {isHistory && <span style={{position:"absolute",top:2,right:4,fontSize:"0.45rem",color:"var(--pink)"}}>●</span>}
            </motion.button>
          );
        })}
      </div>

      {}
      {history.length > 0 && (
        <div style={{
          display:"flex",gap:6,justifyContent:"center",
          margin:"6px 0 14px", flexWrap:"wrap",
        }}>
          <span style={{fontSize:"0.65rem",color:"var(--dim)",alignSelf:"center"}}>Riwayat:</span>
          {history.map((n,i) => (
            <motion.span key={i} initial={{scale:0}} animate={{scale:1}}
              style={{
                width:26,height:26,borderRadius:6,
                background:i===0?"rgba(201,162,39,0.15)":"rgba(255,255,255,0.04)",
                border:`1px solid ${i===0?"rgba(201,162,39,0.4)":"rgba(255,255,255,0.08)"}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"0.78rem",fontFamily:"'Cinzel',serif",fontWeight:700,
                color:i===0?"var(--gl)":"var(--dim)",
              }}>
              {n}
            </motion.span>
          ))}
        </div>
      )}

      <BetSelector bet={bet} onChange={setBet} bal={bal} />
      <button className="actbtn lg" onClick={play} disabled={spinning || picked===null}>
        {spinning ? "🎲 Memutar..." : picked ? `🎯 Pasang ${fmt(bet)} di angka ${picked}` : "🎯 Pilih angka dulu"}
      </button>
    </div>
  );
}
