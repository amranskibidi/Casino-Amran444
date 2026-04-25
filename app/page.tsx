"use client";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useBalance, useToast } from "@/lib/casino";
import { Header, Toasts, TopUpModal } from "@/components/UI";
import Lobby from "@/components/Lobby";
import SlotGame from "@/components/games/SlotGame";
import CardGame from "@/components/games/CardGame";
import NumberGame from "@/components/games/NumberGame";
import WithdrawModal from "@/components/WithdrawModal";

export default function Page() {
  const { bal, deduct, add } = useBalance();
  const { toasts, toast } = useToast();
  const [game, setGame] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWD, setShowWD] = useState(false);

  const gp = { bal, deduct, add, toast };

  const handleWithdraw = (amt: any) => {
    deduct(amt);
    toast(`💸 WD ${import('@/lib/casino').then(m=>m.fmt(amt))} berhasil dikirim ke GoPay!`, "info");
  };

  return (
    <div style={{display:"flex",flexDirection:"column",minHeight:"100vh"}}>
      <Header bal={bal} onTopUp={()=>setShowTopUp(true)}
        onWithdraw={()=>setShowWD(true)}
        onHome={()=>setGame(null)} game={game}/>
      <main className="main">
        <AnimatePresence mode="wait">
          {!game        && <Lobby      key="lobby"  onSelect={setGame}/>}
          {game==="slot"   && <SlotGame   key="slot"   {...gp}/>}
          {game==="card"   && <CardGame   key="card"   {...gp}/>}
          {game==="number" && <NumberGame key="number" {...gp}/>}
        </AnimatePresence>
      </main>
      <AnimatePresence>
        {showTopUp&&<TopUpModal key="topup" onClose={()=>setShowTopUp(false)} onTopUp={a=>{add(a);}}/>}
        {showWD&&<WithdrawModal key="wd" onClose={()=>setShowWD(false)} bal={bal} onWithdraw={handleWithdraw}/>}
      </AnimatePresence>
      <Toasts toasts={toasts}/>
    </div>
  );
}
