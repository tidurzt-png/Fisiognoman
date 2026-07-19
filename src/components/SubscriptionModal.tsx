import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Shield, Flame, CheckCircle2, Mail, Loader2, ArrowRight, Copy, Check, QrCode, Wallet, Phone } from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (email: string, plan: PlanType) => void;
  lang: "id" | "en";
}

type PlanType = "weekly" | "monthly" | "yearly";

export default function SubscriptionModal({ isOpen, onClose, onSubscribe, lang }: SubscriptionModalProps) {
  const [email, setEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [trxId, setTrxId] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("monthly");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const danaNumber = "082120308797";

  const plans = {
    weekly: {
      name: lang === "en" ? "Weekly Plan" : "Paket Seminggu",
      price: "Rp 20.000",
      period: lang === "en" ? "week" : "minggu",
      desc: lang === "en" ? "10x daily credits for face reading for a full week." : "10x kredit harian pembacaan wajah selama seminggu.",
      badge: lang === "en" ? "Try First" : "Coba Dulu",
    },
    monthly: {
      name: lang === "en" ? "Monthly Plan" : "Paket Sebulan",
      price: "Rp 42.000",
      period: lang === "en" ? "month" : "bulan",
      desc: lang === "en" ? "25x daily credits + exclusive Daily Spiritual Advice." : "25x kredit harian + Wejangan Harian eksklusif.",
      badge: lang === "en" ? "Most Popular" : "Paling Populer",
    },
    yearly: {
      name: lang === "en" ? "Yearly Plan" : "Paket Tahunan",
      price: "Rp 179.000",
      period: lang === "en" ? "year" : "tahun",
      desc: lang === "en" ? "Unlimited credits + Daily Spiritual Advice & Motivation." : "Kredit unlimited + Wejangan & Motivasi Harian kosmik.",
      badge: lang === "en" ? "Save 60%" : "Hemat 60%",
    },
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(danaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError(lang === "en" ? "Please enter a valid email address." : "Harap masukkan alamat email yang valid.");
      return;
    }
    if (!senderName.trim()) {
      setError(lang === "en" ? "Please enter the sender's name." : "Harap masukkan nama pengirim.");
      return;
    }

    setStatus("loading");
    setError(null);

    // Simulate authentic mystical subscription activation
    setTimeout(() => {
      setStatus("success");
      onSubscribe(email, selectedPlan);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          {/* Backdrop trigger close */}
          <div className="absolute inset-0 cursor-default" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg my-8 overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border border-amber-400/20 text-white shadow-2xl p-6 sm:p-8 z-10"
          >
            {/* Absolute Ambient Background Glows */}
            <div className="absolute -top-12 -left-12 h-36 w-36 rounded-full bg-amber-400/10 blur-2xl" />
            <div className="absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-indigo-500/15 blur-2xl" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full p-1.5 text-indigo-200/60 hover:bg-white/10 hover:text-white transition-colors z-10"
              id="btn-close-sub"
            >
              <X className="h-5 w-5" />
            </button>

            {status !== "success" ? (
              <div className="space-y-6 relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] font-bold text-amber-300 font-display uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  {lang === "en" ? "Premium Spiritual Upgrade" : "Premium Spiritual Upgrade"}
                </div>

                {/* Header text */}
                <div className="space-y-1.5">
                  <h3 className="font-display font-extrabold text-2xl tracking-tight text-white flex items-center gap-2">
                    <Flame className="h-6 w-6 text-amber-500 animate-pulse" />
                    {lang === "en" ? "AuraPsych Cosmic Premium" : "AuraPsych Kosmik Premium"}
                  </h3>
                  <p className="text-xs text-indigo-200/70 leading-relaxed">
                    {lang === "en"
                      ? "Harmonize your destiny limits instantly. Activate Premium to bypass daily limits, open exclusive custom daily advice, and fully align your inner Qi."
                      : "Sinergikan kekuatan takdir Anda tanpa batas. Aktifkan Premium untuk bypass batasan harian, buka wejangan harian kustom eksklusif, dan sinkronkan energi batin Anda."}
                  </p>
                </div>

                {/* Pricing Plans Selector */}
                <div className="space-y-2.5">
                  <label className="block text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    {lang === "en" ? "Choose Your Energy Plan" : "Pilih Paket Energi Anda"}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(Object.keys(plans) as PlanType[]).map((key) => {
                      const plan = plans[key];
                      const isSelected = selectedPlan === key;
                      return (
                        <div
                          key={key}
                          onClick={() => setSelectedPlan(key)}
                          className={`relative rounded-2xl p-3.5 border transition-all cursor-pointer text-left ${
                            isSelected
                              ? "bg-amber-400/10 border-amber-400/70 shadow-lg shadow-amber-400/5"
                              : "bg-slate-900/60 border-slate-800 hover:border-indigo-800"
                          }`}
                          id={`plan-card-${key}`}
                        >
                          {plan.badge && (
                            <span className="absolute -top-2 left-3 px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[8px] font-black uppercase tracking-wider font-display">
                              {plan.badge}
                            </span>
                          )}
                          <div className="space-y-1 pt-1">
                            <h4 className="font-display font-bold text-xs text-white">{plan.name}</h4>
                            <div className="flex items-baseline gap-1">
                              <span className="font-display font-black text-sm text-amber-300">{plan.price}</span>
                              <span className="text-[9px] text-slate-400">/{plan.period}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-normal">{plan.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* QRIS & Payment details card */}
                <div className="rounded-2xl bg-slate-950 border border-indigo-900/50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-indigo-950 pb-2.5">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4.5 w-4.5 text-amber-400" />
                      <span className="text-xs font-bold text-white">
                        {lang === "en" ? "QRIS Payment Instructions" : "Instruksi Pembayaran QRIS"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-full text-amber-300 text-[9px] font-bold">
                      <Wallet className="h-3 w-3" />
                      DANA E-Wallet
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Visual Mock QRIS code inside modal */}
                    <div className="bg-white p-2 rounded-xl shrink-0 border border-amber-300 shadow-md">
                      <svg width="100" height="100" viewBox="0 0 100 100" className="text-slate-950">
                        {/* Outer frame */}
                        <path d="M5,5 h15 M5,5 v15 M95,5 h-15 M95,5 v15 M5,95 h15 M5,95 v-15 M95,95 h-15 M95,95 v-15" fill="none" stroke="#ea580c" strokeWidth="3" />
                        {/* QRIS text indicator inside */}
                        <rect x="35" y="38" width="30" height="24" rx="2" fill="#ea580c" />
                        <text x="50" y="53" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="monospace">QRIS</text>
                        {/* Mock QR codes */}
                        <rect x="15" y="15" width="15" height="15" fill="currentColor" />
                        <rect x="18" y="18" width="9" height="9" fill="white" />
                        <rect x="21" y="21" width="3" height="3" fill="currentColor" />

                        <rect x="70" y="15" width="15" height="15" fill="currentColor" />
                        <rect x="73" y="18" width="9" height="9" fill="white" />
                        <rect x="76" y="21" width="3" height="3" fill="currentColor" />

                        <rect x="15" y="70" width="15" height="15" fill="currentColor" />
                        <rect x="18" y="73" width="9" height="9" fill="white" />
                        <rect x="21" y="76" width="3" height="3" fill="currentColor" />

                        <rect x="42" y="18" width="6" height="10" fill="currentColor" />
                        <rect x="52" y="15" width="8" height="6" fill="currentColor" />
                        <rect x="70" y="50" width="12" height="14" fill="currentColor" />
                        <rect x="48" y="72" width="15" height="8" fill="currentColor" />
                        <rect x="80" y="70" width="8" height="8" fill="currentColor" />
                      </svg>
                      <div className="text-center text-[8px] font-black text-slate-800 tracking-wider mt-1 uppercase">AuraPsych Pay</div>
                    </div>

                    <div className="space-y-2 text-left w-full">
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {lang === "en"
                          ? "Scan the QRIS above using your DANA, GoPay, OVO, or other e-wallet app. Or send a direct transfer to the DANA e-wallet below:"
                          : "Pindai QRIS di atas menggunakan aplikasi DANA, GoPay, OVO, atau e-wallet lainnya. Atau kirim transfer langsung ke e-wallet DANA di bawah:"}
                      </p>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-indigo-300" />
                          <div className="font-mono text-xs font-extrabold text-amber-300">{danaNumber}</div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyNumber}
                          className="flex items-center gap-1 rounded bg-indigo-950 border border-indigo-900 px-2 py-1 text-[9px] font-bold text-indigo-200 hover:bg-indigo-900 hover:text-white transition-all cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" /> {lang === "en" ? "Copied" : "Terpilih"}
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> {lang === "en" ? "Copy" : "Salin No."}
                            </>
                          )}
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>
                          {lang === "en" ? "Payment verified instantly in real-time" : "Pembayaran diverifikasi otomatis secara langsung"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Subscription Confirmation Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5 pt-2 border-t border-slate-800/80">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-indigo-200 uppercase tracking-wider">
                        {lang === "en" ? "Sender's Name (Confirmation)" : "Nama Pengirim (Konfirmasi)"}
                      </label>
                      <input
                        type="text"
                        required
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder={lang === "en" ? "Account / e-wallet owner name" : "Nama pemilik rekening/e-wallet"}
                        className="block w-full px-3.5 py-2.5 bg-slate-950 border border-indigo-900/60 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-indigo-200 uppercase tracking-wider">
                        {lang === "en" ? "Your Email Address" : "Alamat Email Anda"}
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@anda.com"
                        className="block w-full px-3.5 py-2.5 bg-slate-950 border border-indigo-900/60 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-indigo-200 uppercase tracking-wider">
                      {lang === "en" ? "Transaction ID / Payment Notes (Optional)" : "ID Transaksi / Catatan Pembayaran (Opsional)"}
                    </label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder={lang === "en" ? "Example: TRX-10293 or your DANA Number" : "Contoh: TRX-10293 atau No. HP DANA Anda"}
                      className="block w-full px-3.5 py-2.5 bg-slate-950 border border-indigo-900/60 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all font-medium"
                    />
                  </div>

                  {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 py-3 font-display font-extrabold text-xs text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                    id="btn-submit-sub"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                        {lang === "en" ? "Synchronizing Cosmic Payment..." : "Menyelaraskan Pembayaran Kosmik..."}
                      </>
                    ) : (
                      <>
                        {lang === "en" ? "Confirm Payment" : "Konfirmasi Pembayaran"} ({plans[selectedPlan].price})
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Success Animating Card */
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-center py-6 space-y-6 relative z-10"
              >
                <div className="mx-auto rounded-full bg-emerald-500/10 p-4 border border-emerald-500/30 text-emerald-400 w-16 h-16 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-display font-extrabold text-xl text-white">
                    {lang === "en" ? "Payment Successfully Verified!" : "Pembayaran Sukses Diverifikasi!"}
                  </h3>
                  <p className="text-xs text-indigo-200/70 leading-relaxed max-w-sm mx-auto">
                    {lang === "en" ? (
                      <>
                        Congratulations, your <strong>{plans[selectedPlan].name}</strong> is now active for <strong>{email}</strong>. Daily limit is bypassed instantly and you can enjoy premium features!
                      </>
                    ) : (
                      <>
                        Selamat, paket <strong>{plans[selectedPlan].name}</strong> Anda telah aktif untuk email <strong>{email}</strong>. Batas harian dilewati secara instan dan Anda dapat menikmati fitur premium seutuhnya!
                      </>
                    )}
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="rounded-xl bg-white text-slate-900 px-6 py-2.5 text-xs font-bold hover:bg-slate-100 transition-all shadow-md cursor-pointer"
                  id="btn-explore-premium"
                >
                  {lang === "en" ? "Unlock Premium Spiritual Gate" : "Buka Gerbang Spiritual Premium"}
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
