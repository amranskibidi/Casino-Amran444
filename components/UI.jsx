"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fmt, BETS, TOPUPS } from "@/lib/casino";
import { playTopUp, playClick } from "@/lib/sound";

export function Header({ bal, onTopUp, onWithdraw, onHome, game }) {
  return (
    <header className="hdr">
      <div>
        {game ? (
          <button className="back-btn" onClick={onHome}>← Lobby</button>
        ) : (
          <div className="logo">
            <div className="logo-main">AMRAN444</div>
            <div className="logo-sub">Premium Casino · Est. 2026</div>
          </div>
        )}
      </div>
      <div className="hdr-r">
        <div className="bal">
          <span className="bal-lbl">SALDO</span>
          <motion.span className="bal-val" key={bal}
            initial={{y:-8,opacity:.4,scale:.95}} animate={{y:0,opacity:1,scale:1}}
            transition={{duration:.28,type:"spring",stiffness:400}}>
            {fmt(bal)}
          </motion.span>
        </div>
        <button className="wd-btn" onClick={()=>{playClick();onWithdraw();}}>WD</button>
        <button className="topup-btn" onClick={()=>{playClick();onTopUp();}}>+ Isi</button>
      </div>
    </header>
  );
}

export function BetSelector({ bet, onChange, bal }) {
  return (
    <div className="bet-row">
      <span className="bet-lbl">BET:</span>
      <div className="bet-opts">
        {BETS.map(b=>(
          <button key={b} className={`bopt ${bet===b?"on":""} ${bal<b?"dis":""}`}
            onClick={()=>{if(bal>=b){playClick();onChange(b);}}}>
            {b>=1000?`${b/1000}K`:b}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toasts({ toasts }) {
  return (
    <div className="toasts">
      <AnimatePresence>
        {toasts.map(t=>(
          <motion.div key={t.id} className={`toast t-${t.type}`}
            initial={{opacity:0,y:-32,scale:.88}} animate={{opacity:1,y:0,scale:1}}
            exit={{opacity:0,y:-16,scale:.94}}
            transition={{type:"spring",stiffness:400,damping:28}}>
            <span style={{fontSize:"1.1rem"}}>{t.type==="win"?"🏆":t.type==="loss"?"💸":"✨"}</span>
            <span>{t.msg}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function TopUpModal({ onClose, onTopUp }) {
  const [sel, setSel] = useState(null);
  const [custom, setCustom] = useState("");
  const confirm = () => {
    const amt = sel ?? parseInt(custom||"0");
    if (!amt||amt<1000) return;
    playTopUp(); onTopUp(amt); onClose();
  };
  return (
    <motion.div className="overlay"
      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}>
      <motion.div className="mbox"
        initial={{scale:.82,y:50,opacity:0}} animate={{scale:1,y:0,opacity:1}}
        exit={{scale:.9,opacity:0}} transition={{type:"spring",stiffness:340,damping:28}}
        onClick={e=>e.stopPropagation()}>
        <div className="mhdr">
          <span className="mtitle">💰 Top Up Saldo</span>
          <button className="mclose" onClick={onClose}>✕</button>
        </div>
        <p className="msub">Pilih nominal atau masukkan jumlah custom</p>
        <div className="tgrid">
          {TOPUPS.map(a=>(
            <button key={a} className={`tbtn ${sel===a?"on":""}`}
              onClick={()=>{setSel(a);setCustom("");}}>
              {fmt(a)}
            </button>
          ))}
        </div>
        <input className="tinput" type="number" placeholder="Custom (min. Rp 1.000)"
          value={custom} min="1000" onChange={e=>{setCustom(e.target.value);setSel(null);}}/>
        <button className="cfmbtn" onClick={confirm}>Isi Saldo Sekarang ✨</button>
      </motion.div>
    </motion.div>
  );
}
