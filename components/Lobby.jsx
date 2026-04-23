"use client";
import { motion } from "framer-motion";

const GAMES = [
  { id:"slot",   name:"Classic Slot",  icon:"🎰", tag:"CLASSIC",    accent:"#f0c040", desc:"Putar 3 reel — sejajarkan simbol untuk menang!" },
  { id:"card",   name:"Card Guesser",  icon:"🃏", tag:"PREDICTION", accent:"#e05a7a", desc:"Tebak kartu: lebih tinggi, rendah, atau warnanya?" },
  { id:"number", name:"Number Picker", icon:"🎯", tag:"JACKPOT",    accent:"#40c0e0", desc:"Pilih angka 1–10. Tebak benar = JACKPOT 9× lipat!" },
];

export default function Lobby({ onSelect }) {
  return (
    <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
      exit={{ opacity:0,y:-20 }} transition={{ duration:.35 }}>
      <div className="lobby-hero">
        <div className="lobby-h1">Pilih Game</div>
        <div className="lobby-sub">Fortune favors the bold</div>
      </div>
      <div className="game-grid">
        {GAMES.map((g, i) => (
          <motion.button key={g.id} className="g-card"
            style={{ "--ca": g.accent, borderColor: "var(--border)" }}
            onClick={() => onSelect(g.id)}
            initial={{ opacity:0,y:28 }} animate={{ opacity:1,y:0 }}
            transition={{ delay:i*.09, type:"spring", stiffness:280, damping:22 }}
            whileHover={{ scale:1.02, y:-3, borderColor: g.accent }}
            whileTap={{ scale:.98 }}>
            <div className="g-tag" style={{ color: g.accent }}>{g.tag}</div>
            <div className="g-ico">{g.icon}</div>
            <div className="g-name">{g.name}</div>
            <div className="g-desc">{g.desc}</div>
            <div className="g-cta" style={{ color: g.accent }}>Main Sekarang →</div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
