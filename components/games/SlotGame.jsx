"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { SLOT_SYMBOLS, SLOT_PAY, fmt } from "@/lib/casino";
import { playLeverPull, playSlotSpin, playSlotStop, playWin, playLose, startGameAmbient, stopGameAmbient } from "@/lib/sound";
import { BetSelector } from "@/components/UI";
import Confetti from "@/components/Confetti";

function Reel({ finalSymbol, spinning, delay, onStop, index }) {
  const [display, setDisplay] = useState(finalSymbol);
  const [rolling, setRolling] = useState(false);
  const ivRef = useRef();

  useEffect(() => {
    if (!spinning) return;
    setRolling(true);
    ivRef.current = setInterval(() => {
      setDisplay(SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]);
    }, 50);
    const t = setTimeout(() => {
      clearInterval(ivRef.current);
      setDisplay(finalSymbol);
      setRolling(false);
      playSlotStop(index);
      onStop?.();
    }, 900 + delay * 1000);
    return () => { clearInterval(ivRef.current); clearTimeout(t); };
  }, [spinning]);

  return (
    <div style={{
      flex:1, background: rolling ? "rgba(0,20,30,0.95)" : "rgba(5,5,12,0.92)",
      border:`2px solid ${rolling?"rgba(0,229,255,0.5)":"rgba(201,162,39,0.2)"}`,
      borderRadius:12, height:110, display:"flex", alignItems:"center",
      justifyContent:"center", overflow:"hidden", position:"relative",
      boxShadow: rolling
        ? "inset 0 0 24px rgba(0,229,255,0.12), 0 0 14px rgba(0,229,255,0.15)"
        : "inset 0 4px 20px rgba(0,0,0,0.7)",
      transition:"all 0.25s",
    }}>
      {rolling && <>
        <div style={{position:"absolute",top:0,left:0,right:0,height:28,background:"linear-gradient(180deg,rgba(0,229,255,0.1),transparent)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:28,background:"linear-gradient(0deg,rgba(0,229,255,0.1),transparent)",pointerEvents:"none"}}/>
      </>}
      <motion.div
        style={{fontSize:"3rem",lineHeight:1,userSelect:"none"}}
        animate={rolling?{y:[0,-18,0,-12,0,-6,0],scale:[1,0.88,1,0.94,1]}:{y:0,scale:1}}
        transition={rolling?{duration:0.16,repeat:Infinity,ease:"easeInOut"}:{type:"spring",stiffness:500,damping:20}}>
        {display}
      </motion.div>
    </div>
  );
}

function DragLever({ onPull, disabled }) {
  const y = useMotionValue(0);
  const pulled = useRef(false);

  const handleDragEnd = useCallback((_, info) => {
    if (info.offset.y > 55 && !pulled.current && !disabled) {
      pulled.current = true;
      playLeverPull();
      onPull();
    }
    pulled.current = false;
    y.set(0);
  }, [onPull, disabled]);

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:56,userSelect:"none"}}>
      <div style={{fontSize:"0.55rem",fontFamily:"'Cinzel',serif",fontWeight:700,color:disabled?"var(--dim)":"var(--gold)",letterSpacing:"0.14em",marginBottom:8}}>PULL</div>
      <div style={{position:"relative",width:20,height:140,display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{position:"absolute",top:14,bottom:0,width:6,background:"linear-gradient(180deg,#c9a227,#5a3e08)",borderRadius:4,boxShadow:"0 2px 8px rgba(0,0,0,0.5)"}}/>
        <div style={{position:"absolute",bottom:0,width:20,height:20,background:"linear-gradient(180deg,#2a1800,#0d0800)",borderRadius:4,border:"1px solid var(--gd)"}}/>
        <motion.div
          drag={disabled?false:"y"} dragConstraints={{top:0,bottom:110}} dragElastic={0.08}
          style={{y,position:"relative",zIndex:2}} onDragEnd={handleDragEnd}
          whileDrag={{cursor:"grabbing"}}>
          <motion.div style={{
            width:28,height:28,borderRadius:"50%",
            background:"linear-gradient(135deg,#f0c040,#8a5c00)",
            border:"2px solid rgba(255,220,100,0.6)",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:`0 0 14px rgba(201,162,39,${disabled?0.1:0.5}), 0 4px 8px rgba(0,0,0,0.6)`,
            fontSize:"0.55rem",color:"#000",fontWeight:900,
            opacity:disabled?0.4:1,cursor:disabled?"not-allowed":"grab",
          }}
            animate={!disabled?{boxShadow:["0 0 8px rgba(201,162,39,0.3)","0 0 22px rgba(201,162,39,0.7)","0 0 8px rgba(201,162,39,0.3)"]}:{}}
            transition={{duration:1.8,repeat:Infinity}}>
            ●
          </motion.div>
        </motion.div>
      </div>
      <div style={{fontSize:"0.5rem",color:disabled?"rgba(100,90,80,0.4)":"var(--dim)",marginTop:6,textAlign:"center",fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.06em"}}>drag<br/>↓</div>
    </div>
  );
}

const WIN_LABELS = {
  2:"WIN!",3:"WIN!",4:"BIG WIN!",5:"BIG WIN!",6:"SUPER WIN!",7:"SUPER WIN!",8:"MEGA WIN!",9:"MEGA WIN!",10:"⚡ MEGA JACKPOT ⚡"
};
const WIN_COLORS = {
  2:"#00c864",3:"#00c864",4:"#f0c040",5:"#f0c040",6:"#ff8c00",7:"#ff8c00",8:"#ff2d78",9:"#ff2d78",10:"#00e5ff"
};

export default function SlotGame({ bal, deduct, add, toast }) {
  const [finalReels, setFinalReels] = useState(["🍒","🔔","💎"]);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(10000);
  const [result, setResult] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [winMult, setWinMult] = useState(1);
  const stopped = useRef(0);
  const reelsRef = useRef(["🍒","🔔","💎"]);

  useEffect(() => { startGameAmbient(); return () => stopGameAmbient(); }, []);

  const handleReelStop = useCallback(() => {
    stopped.current += 1;
    if (stopped.current < 3) return;
    setSpinning(false);
    const nr = reelsRef.current;
    if (nr[0]===nr[1] && nr[1]===nr[2]) {
      const m = SLOT_PAY[nr[0]] || 2, prize = bet * m;
      add(prize); setResult({ win:true, prize, m });
      setWinMult(m);
      playWin(m);
      setConfetti(true);
      setTimeout(() => setConfetti(false), m >= 10 ? 6000 : m >= 5 ? 4500 : 3500);
      const label = WIN_LABELS[Math.min(m,10)] || "WIN!";
      toast(`${label} +${fmt(prize)} ×${m}`, "win");
    } else {
      setResult({ win:false }); playLose();
      toast("Huuuu... coba lagi!", "loss");
    }
  }, [bet, add, toast]);

  const spin = useCallback(() => {
    if (spinning || bal < bet) { toast("Saldo tidak cukup!", "loss"); return; }
    deduct(bet); setSpinning(true); setResult(null);
    stopped.current = 0;
    playSlotSpin();
    const nr = Array.from({length:3},()=>SLOT_SYMBOLS[Math.floor(Math.random()*6)]);
    if (Math.random()<0.22) nr[0]=nr[1]=nr[2]=SLOT_SYMBOLS[Math.floor(Math.random()*6)];
    reelsRef.current = nr;
    setFinalReels([...nr]);
  }, [spinning,bal,bet,deduct,toast]);

  return (
    <div className="gview">
      <Confetti active={confetti} multiplier={winMult} />

      {}
      <AnimatePresence>
        {confetti && winMult >= 5 && (
          <motion.div
            initial={{opacity:0,scale:0.5}}
            animate={{opacity:1,scale:1}}
            exit={{opacity:0,scale:1.2}}
            style={{
              position:"fixed",inset:0,zIndex:998,display:"flex",
              alignItems:"center",justifyContent:"center",pointerEvents:"none",
            }}>
            <motion.div
              animate={{scale:[1,1.08,1],rotate:[-1,1,-1]}}
              transition={{duration:0.5,repeat:Infinity}}
              style={{
                fontFamily:"'Cinzel',serif",textAlign:"center",
                textShadow:`0 0 40px ${WIN_COLORS[Math.min(winMult,10)]||"#f0c040"}`,
              }}>
              <div style={{
                fontSize: winMult>=10?"3rem":"2.2rem",
                fontWeight:900,color:WIN_COLORS[Math.min(winMult,10)]||"#f0c040",
                letterSpacing:"0.08em",
              }}>
                {WIN_LABELS[Math.min(winMult,10)]||"WIN!"}
              </div>
              {winMult>=10&&<div style={{fontSize:"1.1rem",color:"#fff",marginTop:8,opacity:0.9}}>⚡ ×{winMult} LIPAT ⚡</div>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="gtitle">🎰 Classic Slot</div>
      <div style={{
        background:"linear-gradient(180deg,#0f0f1a,#080810)",
        border:"2px solid rgba(201,162,39,0.28)",borderRadius:20,
        padding:"18px 14px",margin:"0 0 14px",
        boxShadow:"0 0 40px rgba(201,162,39,0.07),inset 0 0 40px rgba(0,0,0,0.6)",
        position:"relative",overflow:"hidden",
      }}>
        {["tl","tr","bl","br"].map(c=>(
          <div key={c} style={{
            position:"absolute",
            top:c.includes("t")?8:"auto",bottom:c.includes("b")?8:"auto",
            left:c.includes("l")?8:"auto",right:c.includes("r")?8:"auto",
            width:12,height:12,
            borderTop:c.includes("t")?"2px solid rgba(201,162,39,0.45)":"none",
            borderBottom:c.includes("b")?"2px solid rgba(201,162,39,0.45)":"none",
            borderLeft:c.includes("l")?"2px solid rgba(201,162,39,0.45)":"none",
            borderRight:c.includes("r")?"2px solid rgba(201,162,39,0.45)":"none",
          }}/>
        ))}
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:6,background:"rgba(0,0,0,0.5)",border:"1px solid rgba(201,162,39,0.12)",borderRadius:14,padding:"10px",marginBottom:10}}>
              {[0,1,2].map(i=>(
                <Reel key={i} index={i} finalSymbol={finalReels[i]} spinning={spinning} delay={i*0.3} onStop={handleReelStop}/>
              ))}
            </div>
            <div style={{height:2,background:"linear-gradient(90deg,transparent,rgba(201,162,39,0.35),transparent)",borderRadius:2,marginBottom:8}}/>
            <AnimatePresence>
              {result&&(
                <motion.div className={`res ${result.win?"res-win":"res-loss"}`}
                  initial={{scale:0.6,opacity:0,y:10}} animate={{scale:1,opacity:1,y:0}}
                  exit={{opacity:0,y:-10}} transition={{type:"spring",stiffness:500,damping:22}}
                  style={result.win?{borderColor:WIN_COLORS[Math.min(result.m,10)],color:WIN_COLORS[Math.min(result.m,10)]}:{}}>
                  {result.win?`${WIN_LABELS[Math.min(result.m,10)]||"WIN!"} +${fmt(result.prize)} ×${result.m}`:"😢 Huuuu... Tidak menang"}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <DragLever onPull={spin} disabled={spinning||bal<bet}/>
        </div>
      </div>

      <BetSelector bet={bet} onChange={setBet} bal={bal}/>
      <div className="payout">
        <div className="pay-ttl">Tabel Bayar</div>
        <div className="pay-grid">
          {Object.entries(SLOT_PAY).map(([s,m])=>(
            <div key={s} className="pay-row">
              <span style={{fontSize:"0.95rem"}}>{s}{s}{s}</span>
              <span className="pay-mult" style={{color:WIN_COLORS[Math.min(m,10)]||"var(--gold)"}}>×{m}</span>
            </div>
          ))}
        </div>
      </div>
      <p style={{textAlign:"center",fontSize:"0.72rem",color:"var(--dim)",marginTop:10}}>💡 Seret tuas ke bawah untuk memutar</p>
    </div>
  );
}
