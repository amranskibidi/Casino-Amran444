"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fmt } from "@/lib/casino";
import { playWithdraw, playClick } from "@/lib/sound";

const WD_AMOUNTS = [50000,100000,200000,500000,1000000];

const STEPS = ["input","confirm","processing","success"];

export default function WithdrawModal({ onClose, bal, onWithdraw }) {
  const [step, setStep] = useState("input");
  const [amount, setAmount] = useState(null);
  const [custom, setCustom] = useState("");
  const [phone, setPhone] = useState("");
  const [progress, setProgress] = useState(0);

  const selectedAmt = amount ?? parseInt(custom || "0");

  const goConfirm = () => {
    if (!selectedAmt || selectedAmt < 10000) return;
    if (selectedAmt > bal) return;
    if (phone.length < 10) return;
    playClick();
    setStep("confirm");
  };

  const goProcess = () => {
    playClick();
    setStep("processing");
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 8;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          playWithdraw();
          onWithdraw(selectedAmt);
          setStep("success");
        }, 400);
      }
    }, 180);
  };

  return (
    <motion.div className="overlay"
      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      onClick={step==="input"?onClose:undefined}>
      <motion.div className="mbox"
        initial={{scale:.82,y:50,opacity:0}} animate={{scale:1,y:0,opacity:1}}
        exit={{scale:.9,opacity:0}}
        transition={{type:"spring",stiffness:340,damping:28}}
        onClick={e=>e.stopPropagation()}>

        <AnimatePresence mode="wait">

          {}
          {step==="input"&&(
            <motion.div key="input" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}>
              <div className="mhdr">
                <span className="mtitle">💸 Withdraw</span>
                <button className="mclose" onClick={onClose}>✕</button>
              </div>
              <p className="msub">Saldo tersedia: <strong style={{color:"var(--gl)"}}>{fmt(bal)}</strong></p>

              {}
              <div style={{
                display:"flex",alignItems:"center",gap:10,
                background:"rgba(0,173,67,0.1)",border:"1px solid rgba(0,173,67,0.3)",
                borderRadius:12,padding:"10px 14px",marginBottom:14,
              }}>
                <div style={{
                  width:36,height:36,borderRadius:10,
                  background:"linear-gradient(135deg,#00ad43,#007d30)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:"1.2rem",fontWeight:900,color:"#fff",fontFamily:"sans-serif",
                  flexShrink:0,boxShadow:"0 2px 8px rgba(0,173,67,0.4)",
                }}>G</div>
                <div>
                  <div style={{fontSize:"0.85rem",fontWeight:700,color:"#00d44f",fontFamily:"'Rajdhani',sans-serif",letterSpacing:"0.04em"}}>GoPay</div>
                  <div style={{fontSize:"0.68rem",color:"var(--dim)"}}>Dompet Digital · Instan</div>
                </div>
                <div style={{marginLeft:"auto",fontSize:"0.65rem",color:"#00d44f",fontWeight:700,letterSpacing:"0.08em"}}>AKTIF ✓</div>
              </div>

              {}
              <div style={{fontSize:"0.65rem",color:"var(--dim)",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:8}}>Nominal WD</div>
              <div className="tgrid" style={{marginBottom:10}}>
                {WD_AMOUNTS.map(a=>(
                  <button key={a} className={`tbtn ${amount===a?"on":""} ${bal<a?"dis":""}`}
                    onClick={()=>{if(bal>=a){setAmount(a);setCustom("");}}}>
                    {fmt(a)}
                  </button>
                ))}
              </div>
              <input className="tinput" type="number" placeholder="Nominal lain (min. Rp 10.000)"
                value={custom} min="10000"
                onChange={e=>{setCustom(e.target.value);setAmount(null);}}/>

              {}
              <div style={{fontSize:"0.65rem",color:"var(--dim)",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:6}}>No. GoPay / HP</div>
              <input className="tinput" type="tel" placeholder="Contoh: 0812-3456-7890"
                value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,""))}
                maxLength={13}/>

              {}
              {selectedAmt > bal && <p style={{fontSize:"0.75rem",color:"var(--pink)",marginBottom:8}}>⚠ Nominal melebihi saldo</p>}
              {selectedAmt>0&&selectedAmt<10000 && <p style={{fontSize:"0.75rem",color:"var(--pink)",marginBottom:8}}>⚠ Minimal WD Rp 10.000</p>}

              <button className="cfmbtn"
                style={{background:(!selectedAmt||selectedAmt<10000||selectedAmt>bal||phone.length<10)?"rgba(100,100,100,0.3)":"linear-gradient(135deg,#00ad43,#007d30)",color:(!selectedAmt||selectedAmt<10000||selectedAmt>bal||phone.length<10)?"#666":"#fff"}}
                onClick={goConfirm}
                disabled={!selectedAmt||selectedAmt<10000||selectedAmt>bal||phone.length<10}>
                Lanjut Withdraw →
              </button>
            </motion.div>
          )}

          {}
          {step==="confirm"&&(
            <motion.div key="confirm" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}>
              <div className="mhdr">
                <span className="mtitle">Konfirmasi WD</span>
                <button className="mclose" onClick={()=>setStep("input")}>←</button>
              </div>
              <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:14,padding:"16px",marginBottom:16}}>
                <Row label="Metode" val="GoPay 🟢"/>
                <Row label="No. Tujuan" val={`0${phone.slice(0,3)}-${phone.slice(3,7)}-****`}/>
                <Row label="Nominal" val={fmt(selectedAmt)} highlight/>
                <Row label="Biaya Admin" val="Rp 0 (GRATIS)"/>
                <Row label="Total Diterima" val={fmt(selectedAmt)} highlight/>
              </div>
              <div style={{fontSize:"0.72rem",color:"var(--dim)",textAlign:"center",marginBottom:14}}>
                Dana akan masuk dalam <strong style={{color:"var(--gl)"}}>1–3 detik</strong> 😄
              </div>
              <button className="cfmbtn"
                style={{background:"linear-gradient(135deg,#00ad43,#007d30)",color:"#fff"}}
                onClick={goProcess}>
                ✅ Konfirmasi & Tarik Dana
              </button>
              <button style={{width:"100%",marginTop:8,background:"none",border:"1px solid var(--border)",color:"var(--dim)",borderRadius:10,padding:"10px",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.88rem"}}
                onClick={()=>setStep("input")}>Batal</button>
            </motion.div>
          )}

          {}
          {step==="processing"&&(
            <motion.div key="processing" initial={{opacity:0}} animate={{opacity:1}} style={{textAlign:"center",padding:"20px 0"}}>
              <motion.div style={{fontSize:"3rem",marginBottom:16}}
                animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:"linear"}}>
                ⚙️
              </motion.div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:"1rem",color:"var(--gold)",marginBottom:12}}>Memproses Withdraw...</div>
              {}
              <div style={{background:"var(--bg3)",borderRadius:999,height:8,overflow:"hidden",marginBottom:8}}>
                <motion.div style={{
                  height:"100%",borderRadius:999,
                  background:"linear-gradient(90deg,#00ad43,#00e5ff)",
                  width:`${progress}%`,transition:"width 0.2s",
                }}/>
              </div>
              <div style={{fontSize:"0.75rem",color:"var(--dim)"}}>{Math.round(progress)}%</div>
            </motion.div>
          )}

          {}
          {step==="success"&&(
            <motion.div key="success" initial={{opacity:0,scale:0.85}} animate={{opacity:1,scale:1}} style={{textAlign:"center",padding:"16px 0"}}>
              <motion.div style={{fontSize:"3.5rem",marginBottom:12}}
                animate={{scale:[1,1.2,1]}} transition={{duration:0.5,repeat:2}}>
                🎉
              </motion.div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:"1.2rem",color:"#00d44f",marginBottom:6,fontWeight:700}}>
                Withdraw Berhasil!
              </div>
              <div style={{fontSize:"2rem",fontFamily:"'Cinzel',serif",color:"var(--gl)",fontWeight:900,marginBottom:4}}>
                {fmt(selectedAmt)}
              </div>
              <div style={{fontSize:"0.8rem",color:"var(--dim)",marginBottom:6}}>
                Terkirim ke GoPay <strong style={{color:"#00d44f"}}>0{phone.slice(0,3)}-****-****</strong>
              </div>
              <div style={{
                display:"inline-block",padding:"6px 16px",borderRadius:999,
                background:"rgba(0,212,79,0.12)",border:"1px solid rgba(0,212,79,0.3)",
                fontSize:"0.75rem",color:"#00d44f",marginBottom:18,
              }}>✓ Dana masuk dalam hitungan detik</div>
              <button className="cfmbtn"
                style={{background:"linear-gradient(135deg,#00ad43,#007d30)",color:"#fff"}}
                onClick={onClose}>
                Tutup
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function Row({ label, val, highlight }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
      <span style={{fontSize:"0.78rem",color:"var(--dim)"}}>{label}</span>
      <span style={{fontSize:"0.82rem",fontWeight:700,color:highlight?"var(--gl)":"var(--text)",fontFamily:highlight?"'Cinzel',serif":"inherit"}}>{val}</span>
    </div>
  );
}
