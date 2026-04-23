"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fmt, BETS, TOPUPS } from "@/lib/casino";

export function Header({ bal, onTopUp, onHome, game }) {
    return (
        <header className="hdr">
            <div>
                {game ? (
                    <button className="back-btn" onClick={onHome}>← Lobby</button>
                ) : (
                    <div className="logo">♠ NOIR<span>CASINO</span></div>
                )}
            </div>
            <div className="hdr-r">
                <div className="bal">
                    <span className="bal-lbl">SALDO</span>
                    <motion.span className="bal-val" key={bal}
                        initial={{ y: -6, opacity: .5 }} animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: .22 }}>
                        {fmt(bal)}
                    </motion.span>
                </div>
                <button className="topup-btn" onClick={onTopUp}>+ Isi</button>
            </div>
        </header>
    );
}

export function BetSelector({ bet, onChange, bal }) {
    return (
        <div className="bet-row">
            <span className="bet-lbl">BET:</span>
            <div className="bet-opts">
                {BETS.map(b => (
                    <button key={b}
                        className={`bopt ${bet === b ? "on" : ""} ${bal < b ? "dis" : ""}`}
                        onClick={() => bal >= b && onChange(b)}>
                        {b >= 1000 ? `${b / 1000}K` : b}
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
                {toasts.map(t => (
                    <motion.div key={t.id} className={`toast t-${t.type}`}
                        initial={{ opacity: 0, y: -30, scale: .9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: .92 }}
                        transition={{ type: "spring", stiffness: 380, damping: 26 }}>
                        <span>{t.type === "win" ? "🏆" : t.type === "loss" ? "💸" : "✨"}</span>
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
        const amt = sel ?? parseInt(custom || "0");
        if (!amt || amt < 1000) return;
        onTopUp(amt); onClose();
    };

    return (
        <motion.div className="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}>
            <motion.div className="mbox"
                initial={{ scale: .85, y: 40 }} animate={{ scale: 1, y: 0 }}
                exit={{ scale: .9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 360, damping: 26 }}
                onClick={e => e.stopPropagation()}>
                <div className="mhdr">
                    <span className="mtitle">Top Up Saldo 💰</span>
                    <button className="mclose" onClick={onClose}>✕</button>
                </div>
                <p className="msub">Pilih nominal atau masukkan jumlah custom</p>
                <div className="tgrid">
                    {TOPUPS.map(a => (
                        <button key={a} className={`tbtn ${sel === a ? "on" : ""}`}
                            onClick={() => { setSel(a); setCustom(""); }}>
                            {fmt(a)}
                        </button>
                    ))}
                </div>
                <input className="tinput" type="number" placeholder="Custom (min. Rp 1.000)"
                    value={custom} min="1000"
                    onChange={e => { setCustom(e.target.value); setSel(null); }} />
                <button className="cfmbtn" onClick={confirm}>Isi Saldo Sekarang</button>
            </motion.div>
        </motion.div>
    );
}
