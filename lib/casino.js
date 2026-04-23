"use client";
import { useState, useEffect, useCallback } from "react";

export const fmt = (n) => `Rp ${Number(n).toLocaleString("id-ID")}`;

export const SLOT_SYMBOLS = ["🍒","🔔","💎","🃏","⭐","7️⃣"];
export const SLOT_PAY = { "🍒":2,"🔔":3,"💎":5,"🃏":4,"⭐":6,"7️⃣":10 };
export const CARD_SUITS = ["♠","♥","♦","♣"];
export const CARD_VALS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
export const CARD_NUM = {A:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,J:11,Q:12,K:13};
export const BETS = [5000,10000,25000,50000,100000];
export const TOPUPS = [50000,100000,250000,500000,1000000];

export function useBalance() {
  const [bal, setBal] = useState(() => {
    try { const v = localStorage.getItem("nc_bal"); return v ? +v : 500000; }
    catch { return 500000; }
  });
  useEffect(() => { try { localStorage.setItem("nc_bal", bal); } catch {} }, [bal]);
  const deduct = useCallback((n) => setBal((b) => Math.max(0, b - n)), []);
  const add = useCallback((n) => setBal((b) => b + n), []);
  return { bal, deduct, add };
}

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p.slice(-3), { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);
  return { toasts, toast };
}
