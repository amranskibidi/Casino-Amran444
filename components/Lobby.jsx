"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { startBgMusic, stopBgMusic } from "@/lib/sound";

const GAMES = [
  { id:"slot",   name:"Classic Slot",  icon:"🎰", tag:"CLASSIC",    accent:"#f0c040", desc:"Putar 3 reel — sejajarkan simbol untuk menang besar!" },
  { id:"card",   name:"Card Guesser",  icon:"🃏", tag:"PREDICTION", accent:"#e05a7a", desc:"Tebak kartu: lebih tinggi, rendah, atau warnanya?" },
  { id:"number", name:"Number Picker", icon:"🎯", tag:"JACKPOT",    accent:"#40c0e0", desc:"Pilih angka 1–10. Tebak benar = JACKPOT 9× lipat!" },
];

const DECO = [
  { sym:"♠", left:"6%",  top:"22%", size:"1.2rem", dur:2.8, delay:0,   amp:10 },
  { sym:"♥", left:"20%", top:"58%", size:"1.5rem", dur:3.2, delay:0.4, amp:14 },
  { sym:"♦", left:"40%", top:"15%", size:"1.0rem", dur:2.5, delay:0.8, amp:8  },
  { sym:"♣", left:"58%", top:"65%", size:"1.3rem", dur:3.0, delay:0.2, amp:12 },
  { sym:"🎰",left:"72%", top:"28%", size:"1.4rem", dur:2.7, delay:0.6, amp:10 },
  { sym:"7️⃣",left:"86%", top:"52%", size:"1.1rem", dur:3.4, delay:1.0, amp:9  },
  { sym:"⭐",left:"14%", top:"80%", size:"0.9rem", dur:2.9, delay:0.5, amp:11 },
  { sym:"💎",left:"92%", top:"78%", size:"1.0rem", dur:3.1, delay:0.3, amp:13 },
];

export default function Lobby({ onSelect }) {
  useEffect(() => {
    startBgMusic();
    return () => stopBgMusic();
  }, []);

  return (
    <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}}
      exit={{opacity:0,y:-18}} transition={{duration:.38}}
      style={{position:"relative"}}>

      {}
      <div className="lobby-deco" aria-hidden="true">
        {DECO.map((d,i) => (
          <motion.span key={i} className="deco-sym"
            style={{left:d.left,top:d.top,fontSize:d.size,opacity:.14}}
            animate={{y:[0,-d.amp,0],opacity:[0.1,0.25,0.1]}}
            transition={{duration:d.dur,repeat:Infinity,delay:d.delay,ease:"easeInOut"}}>
            {d.sym}
          </motion.span>
        ))}
      </div>

      {}
      <div className="lobby-hero">
        <motion.div className="lobby-h1"
          initial={{opacity:0,y:-24,letterSpacing:"0.3em"}}
          animate={{opacity:1,y:0,letterSpacing:"0.1em"}}
          transition={{delay:.08,duration:.5}}>
          AMRAN444
        </motion.div>
        <motion.div className="lobby-sub"
          initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.3}}>
          ✦ Premium Casino Experience ✦
        </motion.div>
        <div className="lobby-divider" />

        {}
        <motion.div
          style={{
            fontSize:"0.72rem",color:"rgba(201,162,39,0.5)",marginTop:10,
            fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.12em",
          }}
          initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.5}}>
          🎵 Musik aktif · Suara hidup · Fortune menanti
        </motion.div>
      </div>

      {}
      <div className="game-grid">
        {GAMES.map((g,i) => (
          <motion.button key={g.id} className="g-card"
            onClick={() => onSelect(g.id)}
            initial={{opacity:0,x:-24,scale:0.97}}
            animate={{opacity:1,x:0,scale:1}}
            transition={{delay:i*.12+.25,type:"spring",stiffness:240,damping:22}}
            whileHover={{scale:1.025,y:-3}} whileTap={{scale:.975}}>

            <div className="g-card-inner">
              <div className="g-left">
                <div className="g-tag" style={{color:g.accent}}>{g.tag}</div>
                <div className="g-name">{g.name}</div>
                <div className="g-desc">{g.desc}</div>
                <motion.div className="g-cta" style={{color:g.accent}}
                  animate={{x:[0,3,0]}} transition={{duration:1.8,repeat:Infinity,delay:i*0.4}}>
                  Main Sekarang →
                </motion.div>
              </div>
              <motion.div className="g-ico-wrap"
                style={{background:`${g.accent}12`,border:`1px solid ${g.accent}35`}}
                animate={{scale:[1,1.05,1]}}
                transition={{duration:2,repeat:Infinity,delay:i*0.5}}>
                <span className="g-ico">{g.icon}</span>
              </motion.div>
            </div>

            <div className="g-glow" style={{background:`linear-gradient(90deg,${g.accent}1a,transparent)`}}/>
            <div className="g-border-glow" style={{background:`linear-gradient(90deg,${g.accent},transparent)`}}/>
          </motion.button>
        ))}
      </div>

      {}
      <div style={{marginTop:20,textAlign:"center"}}>
        <div style={{
          display:"inline-block",padding:"8px 20px",borderRadius:999,
          background:"rgba(201,162,39,0.06)",border:"1px solid rgba(201,162,39,0.12)",
          marginBottom:8,
        }}>
          <span style={{
            fontFamily:"'Cinzel',serif",fontSize:"0.72rem",
            color:"rgba(201,162,39,0.7)",letterSpacing:"0.1em",
          }}>
            ✦ Dibuat oleh <span style={{color:"var(--gl)"}}>Amran</span> ✦
          </span>
        </div>
        <div className="lobby-footer">🔞 Main dengan bijak · Hanya untuk hiburan</div>
      </div>
    </motion.div>
  );
}
