/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Camera,
  Calendar,
  Sparkles,
  History,
  User,
  Brain,
  BookOpen,
  Compass,
  Loader2,
  HelpCircle,
  Upload,
  X,
  ArrowRight,
  Info,
  Flame,
  Fingerprint,
} from "lucide-react";
import WebcamCapture from "./components/WebcamCapture";
import ReportDashboard from "./components/ReportDashboard";
import HistorySidebar from "./components/HistorySidebar";
import SubscriptionModal from "./components/SubscriptionModal";
import DailyAdviceWidget from "./components/DailyAdviceWidget";
import { AnalysisResult, HistoryRecord } from "./types";

export default function App() {
  const [lang, setLang] = useState<"id" | "en">("id");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    const d = new Date();
    const monthsId = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const monthsEn = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const months = lang === "en" ? monthsEn : monthsId;
    setSelectedMonth(`${months[d.getMonth()]} ${d.getFullYear()}`);
  }, [lang]);

  const [photo, setPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"analyze" | "how-it-works">("analyze");
  const [error, setError] = useState<string | null>(null);

  // Modals / Sidedrawers
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Premium Subscription & Limit state
  const [subscriptionPlan, setSubscriptionPlan] = useState<"free" | "weekly" | "monthly" | "yearly">(() => {
    try {
      const saved = localStorage.getItem("aura_subscription_plan");
      if (saved === "free" || saved === "weekly" || saved === "monthly" || saved === "yearly") {
        return saved;
      }
      const oldSub = localStorage.getItem("aura_subscribed") === "true";
      return oldSub ? "monthly" : "free";
    } catch {
      return "free";
    }
  });

  const getWeekString = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    const monday = new Date(date.setDate(diff));
    return monday.toDateString();
  };

  const [creditsUsedToday, setCreditsUsedToday] = useState<number>(() => {
    try {
      const today = new Date().toDateString();
      const savedDate = localStorage.getItem("aura_credits_date");
      if (savedDate === today) {
        return parseInt(localStorage.getItem("aura_credits_used") || "0", 10);
      }
      return 0;
    } catch {
      return 0;
    }
  });

  const [creditsUsedThisWeek, setCreditsUsedThisWeek] = useState<number>(() => {
    try {
      const currentWeek = getWeekString(new Date());
      const savedWeek = localStorage.getItem("aura_credits_week_date");
      if (savedWeek === currentWeek) {
        return parseInt(localStorage.getItem("aura_credits_week_used") || "0", 10);
      }
      return 0;
    } catch {
      return 0;
    }
  });

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [lastAnalysisDate, setLastAnalysisDate] = useState<string>(() => {
    try {
      return localStorage.getItem("aura_last_analysis_date") || "";
    } catch {
      return "";
    }
  });

  const isSubscribed = subscriptionPlan !== "free";

  const getDailyLimit = (plan: "free" | "weekly" | "monthly" | "yearly"): number => {
    if (plan === "free") return 5; // 5 per week
    if (plan === "weekly") return 10; // 10 per day
    if (plan === "monthly") return 25; // 25 per day
    return Infinity; // yearly is unlimited
  };

  const handleSubscribe = (email: string, plan: "weekly" | "monthly" | "yearly") => {
    localStorage.setItem("aura_subscribed", "true");
    localStorage.setItem("aura_subscription_plan", plan);
    setSubscriptionPlan(plan);
    setError(null);
  };

  // History state locally persisted
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem("aura_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("aura_history", JSON.stringify(history));
  }, [history]);

  // Handle file uploads for faces if camera is not available
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError(lang === "en" ? "Photo size is too large. Please use a photo under 10MB." : "Ukuran foto terlalu besar. Gunakan foto dengan ukuran di bawah 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Perform Analysis API request with sequenced loading messages for magical feel
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) {
      setError(lang === "en" ? "Birth Date is required." : "Tanggal lahir wajib diisi.");
      return;
    }

    // Verify tiered analysis limits
    const today = new Date().toDateString();
    const currentWeek = getWeekString(new Date());

    if (subscriptionPlan === "free") {
      if (creditsUsedThisWeek >= 5) {
        setError(lang === "en" 
          ? "Free Limit Reached: You have reached the free 5x weekly analysis limit. Activate Premium Subscription to unlock daily credits!" 
          : "Batas Gratis Tercapai: Anda telah mencapai batas 5x analisis gratis mingguan. Aktifkan Langganan Premium untuk membuka kredit harian!"
        );
        setShowSubscriptionModal(true);
        return;
      }
    } else if (subscriptionPlan === "weekly") {
      if (creditsUsedToday >= 10) {
        setError(lang === "en" 
          ? "Weekly Limit Reached: You have reached the 10x daily limit of your Weekly Plan. Upgrade to Monthly or Yearly plan to unlock more credits!" 
          : "Batas Mingguan Tercapai: Anda telah mencapai batas 10x harian paket Mingguan Anda. Tingkatkan ke paket Bulanan atau Tahunan untuk membuka lebih banyak kredit harian!"
        );
        setShowSubscriptionModal(true);
        return;
      }
    } else if (subscriptionPlan === "monthly") {
      if (creditsUsedToday >= 25) {
        setError(lang === "en" 
          ? "Monthly Limit Reached: You have reached the 25x daily limit of your Monthly Plan. Upgrade to Yearly plan for unlimited cosmic analyses!" 
          : "Batas Bulanan Tercapai: Anda telah mencapai batas 25x harian paket Bulanan Anda. Tingkatkan ke paket Tahunan untuk analisis kosmik tanpa batas!"
        );
        setShowSubscriptionModal(true);
        return;
      }
    }

    setIsAnalyzing(true);
    setError(null);

    const steps = lang === "en" ? [
      "Initializing analytical algorithms...",
      "Reading face contour structure & San Ting...",
      "Harmonizing Qi elements of forehead, nose, & chin...",
      "Calculating Javanese Weton & Neptu from ancient manuscripts...",
      "Aligning Life Path, Shio, & Western Horoscope vibrations...",
      "Formulating tactical predictions for Career, Love, & Wealth...",
      "Structuring humanistic psychological advice...",
    ] : [
      "Menginisialisasi algoritma analitik...",
      "Membaca kontur struktur wajah & San Ting...",
      "Mengharmonisasikan elemen Qi dahi, hidung, & dagu...",
      "Mengkalkulasikan Weton & Neptu menurut kitab Primbon...",
      "Menyelaraskan getaran Life Path, Shio, & Zodiak...",
      "Merumuskan ramalan taktis Karir, Asmara, & Keuangan...",
      "Menyusun wejangan psikologis humanistik...",
    ];

    let stepIndex = 0;
    setAnalyzingStep(steps[0]);

    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length - 1) {
        stepIndex++;
        setAnalyzingStep(steps[stepIndex]);
      }
    }, 1800);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || (lang === "en" ? "User" : "Pengguna"),
          birthDate,
          photo,
          selectedMonth,
          lang,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || (lang === "en" ? "An error occurred during profile analysis." : "Terjadi kesalahan saat menganalisis profil."));
      }

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);

      // Save last analysis date and increment credits upon success
      const todayStr = new Date().toDateString();
      const currentWeekStr = getWeekString(new Date());
      localStorage.setItem("aura_last_analysis_date", todayStr);
      setLastAnalysisDate(todayStr);

      if (subscriptionPlan === "free") {
        const newWeeklyCredits = creditsUsedThisWeek + 1;
        localStorage.setItem("aura_credits_week_date", currentWeekStr);
        localStorage.setItem("aura_credits_week_used", String(newWeeklyCredits));
        setCreditsUsedThisWeek(newWeeklyCredits);
      } else {
        const newDailyCredits = creditsUsedToday + 1;
        localStorage.setItem("aura_credits_date", todayStr);
        localStorage.setItem("aura_credits_used", String(newDailyCredits));
        setCreditsUsedToday(newDailyCredits);
      }

      // Save to local history
      const newRecord: HistoryRecord = {
        id: crypto.randomUUID(),
        name: name.trim() || (lang === "en" ? "User" : "Pengguna"),
        birthDate,
        photoUrl: photo || undefined,
        selectedMonth,
        dateAnalyzed: new Date().toISOString(),
        result,
      };
      setHistory((prev) => [newRecord, ...prev]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || (lang === "en" ? "Failed to contact the server for analysis. Please try again." : "Gagal menghubungi server untuk melakukan analisis. Harap coba lagi."));
    } finally {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setAnalyzingStep("");
    }
  };

  const handleSelectHistory = (record: HistoryRecord) => {
    setName(record.name);
    setBirthDate(record.birthDate);
    setPhoto(record.photoUrl || null);
    setSelectedMonth(record.selectedMonth);
    setAnalysisResult(record.result);
    setIsHistoryOpen(false);
    setError(null);
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    setIsHistoryOpen(false);
  };

  // Generate lists of available months for selection (current month + 5 months ahead)
  const getMonthOptions = () => {
    const options = [];
    const date = new Date();
    const monthsId = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const monthsEn = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const months = lang === "en" ? monthsEn : monthsId;
    for (let i = -1; i < 6; i++) {
      const d = new Date(date.getFullYear(), date.getMonth() + i, 1);
      options.push(`${months[d.getMonth()]} ${d.getFullYear()}`);
    }
    return options;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950/20 to-slate-900 text-slate-800 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Background ambient stars */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-transparent to-transparent pointer-events-none" />

      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/80 border-b border-indigo-950/40 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between no-print">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-2.5 text-white shadow-md shadow-indigo-950/50">
            <Compass className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <span className="font-display font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              AuraPsych <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 font-bold">KOSMIK</span>
            </span>
            <p className="text-[10px] text-indigo-200/60 font-sans tracking-wide">
              {lang === "en" ? "Personality & Destiny Comparative Analysis" : "Analisis Kepribadian & Takdir Komparatif"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher Pill Toggle */}
          <div className="flex items-center bg-indigo-950/60 border border-indigo-900 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setLang("id")}
              className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                lang === "id"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-indigo-300 hover:text-indigo-100"
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                lang === "en"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-indigo-300 hover:text-indigo-100"
              }`}
            >
              EN
            </button>
          </div>

          {/* Credit status pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/40 border border-indigo-950/40 text-[11px] font-bold text-slate-300 animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {lang === "en" ? "Credits:" : "Kredit:"}{" "}
              <span className="font-mono text-amber-400">
                {subscriptionPlan === "free" ? (
                  `${creditsUsedThisWeek}/5 ${lang === "en" ? "this week" : "minggu ini"}`
                ) : subscriptionPlan === "weekly" ? (
                  `${creditsUsedToday}/10 ${lang === "en" ? "today" : "hari ini"}`
                ) : subscriptionPlan === "monthly" ? (
                  `${creditsUsedToday}/25 ${lang === "en" ? "today" : "hari ini"}`
                ) : (
                  lang === "en" ? "Unlimited" : "Tanpa Batas"
                )}
              </span>
            </span>
          </div>

          <button
            onClick={() => setShowSubscriptionModal(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-md cursor-pointer ${
              isSubscribed
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                : "border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
          >
            <Sparkles className={`h-4 w-4 ${isSubscribed ? "text-amber-400 animate-pulse" : "text-amber-300"}`} />
            <span>
              {(() => {
                switch (subscriptionPlan) {
                  case "weekly":
                    return lang === "en" ? "Weekly Premium" : "Premium Seminggu";
                  case "monthly":
                    return lang === "en" ? "Monthly Premium" : "Premium Sebulan";
                  case "yearly":
                    return lang === "en" ? "Yearly Premium" : "Premium Tahunan";
                  default:
                    return lang === "en" ? "Subscribe" : "Langganan";
                }
              })()}
            </span>
          </button>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-950 bg-indigo-950/40 text-xs font-semibold text-indigo-200 hover:bg-indigo-900/50 hover:text-white transition-all shadow-inner cursor-pointer"
            title={lang === "en" ? "View your analysis history" : "Lihat riwayat analisis Anda"}
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">{lang === "en" ? "History" : "Riwayat"}</span>
            <span className="bg-indigo-600 text-white rounded-full text-[9px] font-bold px-1.5 py-0.5 font-mono">
              {history.length}
            </span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 z-10">
        {analysisResult ? (
          /* Show beautifully integrated report dashboard if analysis is available */
          <ReportDashboard
            name={name.trim() || (lang === "en" ? "User" : "Pengguna")}
            photoUrl={photo || undefined}
            result={analysisResult}
            lang={lang}
            onReset={() => {
              setAnalysisResult(null);
              // Do not wipe inputs, allowing quick modification
            }}
          />
        ) : (
          /* Analysis Input Screen */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side: interactive analysis form */}
            <div className="lg:col-span-7 bg-white border border-slate-150 rounded-3xl shadow-xl overflow-hidden">
              {/* Form Tab selectors */}
              <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1">
                <button
                  onClick={() => setActiveTab("analyze")}
                  className={`flex-1 py-3 px-4 rounded-xl font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                    activeTab === "analyze"
                      ? "bg-white text-slate-800 shadow-sm border border-slate-150"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  {lang === "en" ? "Start Reading" : "Mulai Pembacaan"}
                </button>
                <button
                  onClick={() => setActiveTab("how-it-works")}
                  className={`flex-1 py-3 px-4 rounded-xl font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                    activeTab === "how-it-works"
                      ? "bg-white text-slate-800 shadow-sm border border-slate-150"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <HelpCircle className="h-4 w-4 text-amber-500" />
                  {lang === "en" ? "How It Works" : "Cara Kerja & Ilmu Acuan"}
                </button>
              </div>

              {activeTab === "analyze" ? (
                /* Core interactive form */
                <form onSubmit={handleAnalyze} className="p-6 sm:p-8 space-y-6">
                  <div className="space-y-2">
                    <h2 className="font-display font-extrabold text-2xl tracking-tight text-slate-800">
                      {lang === "en" ? "Unveil Your True Self & Destiny Secrets" : "Singkap Rahasia Jati Diri & Takdir Anda"}
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {lang === "en" 
                        ? "Synergy of Eastern & Western classic wisdom: Physiognomy (Mian Xiang), Feng Shui Qi, Javanese Primbon, Weton, Numerology, Shio, and Western Astrology."
                        : "Sinergi kearifan klasik Timur & Barat: analisis struktur wajah Fisiognomi (Mian Xiang), keseimbangan Qi Feng Shui, naskah kuno Primbon Jawa, getaran Weton, Numerologi, Shio, dan Astrologi Barat."}
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-150 flex items-start gap-3 text-xs text-rose-700 leading-relaxed">
                      <Info className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>{error}</div>
                    </div>
                  )}

                  {/* Input Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-600 font-display uppercase tracking-wider">
                        {lang === "en" ? "Full Name / Nickname" : "Nama Lengkap / Panggilan"}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={lang === "en" ? "Enter your name..." : "Masukkan nama Anda..."}
                          className="block w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Birth Date */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-600 font-display uppercase tracking-wider">
                        {lang === "en" ? "Birth Date" : "Tanggal, Bulan, & Tahun Lahir"} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <input
                          type="date"
                          required
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="block w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Month Selection */}
                    <div className="space-y-2 sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 font-display uppercase tracking-wider">
                        {lang === "en" ? "Destiny Reading Month" : "Bulan Ramalan Peruntungan"}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {getMonthOptions().map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setSelectedMonth(opt)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                              selectedMonth === opt
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                                : "bg-slate-50 border-slate-150 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Camera / Photo Analysis */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-600 font-display uppercase tracking-wider">
                        {lang === "en" ? "Face Photo (Optional, Highly Recommended)" : "Foto Wajah Anda (Opsional, Sangat Direkomendasikan)"}
                      </label>
                      <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-150">
                        {lang === "en" ? "Physiognomy & Face Feng Shui" : "Fisiognomi & Feng Shui Wajah"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Photo capture & Upload card */}
                      <div className="rounded-2xl border-2 border-dashed border-slate-200 p-5 flex flex-col items-center justify-center text-center gap-3 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-300 transition-all">
                        <div className="rounded-full bg-indigo-50 p-3 text-indigo-600">
                          <Camera className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-700">
                            {lang === "en" ? "Capture Live from Camera" : "Ambil Langsung dari Kamera"}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {lang === "en" ? "Requires camera permission in browser" : "Memerlukan izin kamera di browser"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsWebcamOpen(true)}
                          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-all shadow-sm cursor-pointer"
                        >
                          {lang === "en" ? "Turn on Camera" : "Nyalakan Kamera"}
                        </button>
                      </div>

                      {/* File Upload card */}
                      <div className="rounded-2xl border-2 border-dashed border-slate-200 p-5 flex flex-col items-center justify-center text-center gap-3 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-300 transition-all relative">
                        <div className="rounded-full bg-violet-50 p-3 text-violet-600">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-700">
                            {lang === "en" ? "Upload Your Photo File" : "Unggah File Foto Anda"}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {lang === "en" ? "Supports JPEG, PNG up to 10MB" : "Mendukung JPEG, PNG hingga 10MB"}
                          </p>
                        </div>
                        <label className="rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm cursor-pointer">
                          {lang === "en" ? "Choose Photo File" : "Pilih File Foto"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Preview Image if selected */}
                    {photo && (
                      <div className="flex items-center gap-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                        <img
                          src={photo}
                          alt="Face Preview"
                          className="h-16 w-16 object-cover rounded-xl ring-2 ring-indigo-500/20"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {lang === "en" ? "Face photo attached" : "Foto wajah terlampir"}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {lang === "en" ? "Ready to analyze with Mian Xiang & Feng Shui" : "Siap dianalisis dengan Mian Xiang & Feng Shui"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPhoto(null)}
                          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Submission Action Button */}
                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 py-4 font-display font-extrabold text-sm sm:text-base text-white shadow-lg shadow-indigo-200/50 hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {lang === "en" ? "Analyzing Profile..." : "Melakukan Analisis Profil..."}
                      </>
                    ) : (
                      <>
                        {lang === "en" ? "Reveal Character Reading" : "Singkap Pembacaan Karakter"}
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Information about the sciences and how it works */
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-display font-extrabold text-xl text-slate-800">
                      {lang === "en" ? "How Does This App Work?" : "Bagaimana Aplikasi ini Bekerja?"}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {lang === "en"
                        ? "We blend classic wisdom scripts with state-of-the-art AI-powered visual processing to deliver rich cross-cultural humanist-spiritual guidance."
                        : "Kami memadukan naskah wejangan klasik dengan pemrosesan visual canggih bertenaga AI untuk memberikan panduan psikologis humanis-spiritual lintas budaya."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card 1: Fisiognomi */}
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2.5">
                      <div className="flex items-center gap-2 text-indigo-700">
                        <div className="rounded-lg bg-indigo-50 p-1.5">
                          <User className="h-4 w-4" />
                        </div>
                        <h4 className="font-display font-bold text-xs sm:text-sm">
                          {lang === "en" ? "Physiognomy (Mian Xiang)" : "Fisiognomi (Mian Xiang)"}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed text-justify">
                        {lang === "en"
                          ? "An ancient Chinese and classic Greek art of face reading. By analyzing the forehead shape (upper San Ting), eye focus (middle San Ting), and chin/jaw contour (lower San Ting), the AI maps core character traits, mental clarity, career suitability, and emotional resilience."
                          : "Seni kuno pembacaan wajah dari dinasti Tiongkok kuno dan Yunani klasik. Dengan menelaah bentuk dahi (San Ting atas), tatapan mata (San Ting tengah), serta kontur dagu dan rahang (San Ting bawah), AI memetakan karakter dasar, kejernihan mental, kecocokan karir, dan resiliensi emosi Anda."}
                      </p>
                    </div>

                    {/* Card 2: Feng Shui Wajah */}
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2.5">
                      <div className="flex items-center gap-2 text-teal-700">
                        <div className="rounded-lg bg-teal-50 p-1.5">
                          <Compass className="h-4 w-4" />
                        </div>
                        <h4 className="font-display font-bold text-xs sm:text-sm">
                          {lang === "en" ? "Face Feng Shui" : "Feng Shui Wajah"}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed text-justify">
                        {lang === "en"
                          ? "Every face structure carries the manifestation of the 5 Elements (Wood, Fire, Earth, Metal, Water). We analyze the flow of Qi across facial areas to identify your luckiest features and offer spiritual guidance to align them in daily life."
                          : "Setiap struktur wajah membawa manifestasi 5 Elemen (Kayu, Api, Tanah, Logam, Air). Kami menganalisis aliran energi Qi di area wajah guna mengidentifikasi bagian wajah pembawa hoki terbesar (auspicious feature) serta memberikan bimbingan spiritual untuk menyelaraskannya dalam keseharian."}
                      </p>
                    </div>

                    {/* Card 3: Primbon Jawa & Weton */}
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2.5">
                      <div className="flex items-center gap-2 text-amber-700">
                        <div className="rounded-lg bg-amber-50 p-1.5">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <h4 className="font-display font-bold text-xs sm:text-sm">
                          {lang === "en" ? "Javanese Primbon & Weton" : "Primbon Jawa & Weton"}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed text-justify">
                        {lang === "en"
                          ? "Heritage manuscripts of the Javanese archipelago that calculate your Gregorian birth date alongside Javanese Pasaran cycles. The AI calculates the precise Neptu score to translate your innate character, inherent weaknesses, and tactical daily prosperity advice."
                          : "Naskah warisan leluhur nusantara yang menghitung hari kelahiran Masehi dan Pasaran Jawa Anda. AI menghitung jumlah Neptu weton secara presisi guna menerjemahkan watak pembawaan (watak lahir), kelemahan bawaan, serta petuah keselamatan/peruntungan taktis harian."}
                      </p>
                    </div>

                    {/* Card 4: Psikologi Lintas Budaya */}
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2.5">
                      <div className="flex items-center gap-2 text-violet-700">
                        <div className="rounded-lg bg-violet-50 p-1.5">
                          <Brain className="h-4 w-4" />
                        </div>
                        <h4 className="font-display font-bold text-xs sm:text-sm">
                          {lang === "en" ? "Numerology & Astrology" : "Numerologi & Astrologi"}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed text-justify">
                        {lang === "en"
                          ? "We align ancient mystical scripts with modern analysis: Life Path Number, Western Zodiac, and Chinese Zodiac (Shio). This integration produces a multi-dimensional analysis balancing scientific logic with classic spiritual intuition."
                          : "Kami menyandingkan naskah mistis kuno dengan analisis modern: Angka Jalur Kehidupan (Life Path Number), Zodiak Barat, dan Shio Tionghoa. Integrasi ini menghasilkan analisis multi-dimensional yang menyeimbangkan logika ilmiah dengan intuisi spiritual klasik."}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 text-[11px] text-indigo-700 leading-relaxed">
                    <span className="font-bold flex items-center gap-1.5 mb-1 text-xs">
                      <Info className="h-4 w-4 shrink-0" />
                      {lang === "en" ? "Humanistic Psychological Approach" : "Pendekatan Psikologi Humanistik"}
                    </span>
                    {lang === "en"
                      ? "We believe that destiny and personality are not rigid or binding. All readings are presented as a tool for reflective journaling, self-empowerment, and practical counseling to cultivate inner peace and harmony in life."
                      : "Kami percaya bahwa peruntungan dan kepribadian bukanlah takdir kaku yang mengikat. Seluruh pembacaan kami sajikan sebagai sarana jurnaling reflektif, dorongan motivasi diri (self-empowerment), dan terapi praktis untuk melatih ketenangan batin dalam menjalani hidup secara harmonis."}
                  </div>

                  <button
                    onClick={() => setActiveTab("analyze")}
                    className="flex items-center gap-2 rounded-xl bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 hover:bg-slate-750 transition-colors mx-auto cursor-pointer"
                  >
                    {lang === "en" ? "Back To Reading Form" : "Kembali Ke Form Pembacaan"}
                  </button>
                </div>
              )}
            </div>

            {/* Right side: Beautiful visual introduction cards */}
            <div className="lg:col-span-5 space-y-6">
              {/* Feature Highlights */}
              <div className="rounded-3xl border border-indigo-950/40 bg-slate-900/60 p-6 sm:p-8 text-white space-y-6 backdrop-blur-sm">
                <h3 className="font-display font-bold text-lg tracking-tight text-amber-400 flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
                  {lang === "en" ? "Synergy of Wisdom Dimensions" : "Sinergi Dimensi Kearifan"}
                </h3>

                <div className="space-y-4">
                  {/* Item 1 */}
                  <div className="flex gap-3.5 items-start">
                    <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-2 text-indigo-300">
                      <Fingerprint className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-xs sm:text-sm">
                        {lang === "en" ? "Visual Character Map" : "Peta Karakter Visual"}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {lang === "en"
                          ? "Detect aura color vibrations, micro-expression cues, dominant Feng Shui elements, and your destiny fortune features."
                          : "Mendeteksi getaran warna aura, analisis keremangan mikroekspresi, dominasi elemen Feng Shui, bentuk dahi, hidung, dan dagu penentu hoki Anda."}
                      </p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex gap-3.5 items-start">
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-amber-300">
                      <BookOpen className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-xs sm:text-sm">
                        {lang === "en" ? "Timeless Javanese Primbon" : "Primbon Jawa Abadi"}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {lang === "en"
                          ? "Pure weton calculations fused with birth neptu values, mapping authentic character and inner balance teachings from ancestral archipelago culture."
                          : "Perhitungan weton murni dipadu nilai neptu lahir, memetakan watak asli dan wejangan keseimbangan batin dari budaya leluhur nusantara."}
                      </p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex gap-3.5 items-start">
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-emerald-300">
                      <Compass className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-xs sm:text-sm">
                        {lang === "en" ? "Monthly Energy Guidance" : "Panduan Energi Bulanan"}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {lang === "en"
                          ? "Get in-depth scores and actionable advice for romance, career, finance, and stress management for your selected month."
                          : "Dapatkan ulasan skor asmara, karir, keuangan, dan saran stres untuk bulan yang Anda pilih secara mendalam dan terarah."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Advice premium widget */}
              <DailyAdviceWidget
                subscriptionPlan={subscriptionPlan}
                onOpenSubscribe={() => setShowSubscriptionModal(true)}
                userName={name}
                birthDate={birthDate}
                zodiac={analysisResult?.birthAnalysis?.zodiac}
                shio={analysisResult?.birthAnalysis?.shio}
                weton={analysisResult?.birthAnalysis?.primbonJawa?.weton}
                lang={lang}
              />

              {/* Quotes or motivational badge */}
              <div className="rounded-3xl border border-slate-150 bg-white p-6 space-y-3.5">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  {lang === "en" ? "Today's Soul Reflection" : "Refleksi Jiwa Hari Ini"}
                </div>
                <blockquote className="text-xs text-slate-600 leading-relaxed italic text-justify">
                  &quot;Mengenal orang lain adalah kecerdasan; mengenal diri sendiri adalah kebijaksanaan sejati. Menguasai orang lain adalah kekuatan; menguasai diri sendiri adalah kekuasaan yang sesungguhnya.&quot;
                </blockquote>
                <p className="text-[10px] text-slate-400 font-semibold font-display text-right">— Lao Tzu, Tao Te Ching</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Analyzing Overlay Loading State Screen */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 text-white p-6 backdrop-blur-md">
          <div className="relative flex flex-col items-center text-center max-w-sm space-y-6">
            <div className="relative">
              {/* Outer spinning ring */}
              <div className="absolute inset-[-12px] rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              {/* Inner reverse spinning ring */}
              <div className="absolute inset-[-6px] rounded-full border-2 border-amber-400/10 border-t-amber-400 animate-spin-slow" />
              {/* Center icon */}
              <div className="rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-500/30">
                <Compass className="h-10 w-10 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-extrabold text-xl tracking-tight text-white">
                {lang === "en" ? "Reading Your Cosmic Destiny" : "Membaca Takdir Kosmik Anda"}
              </h3>
              <p className="text-xs text-indigo-200/70">
                {lang === "en" ? "Please wait a moment while the AI aligns your personal data." : "Harap tunggu beberapa saat selagi AI menyelaraskan data diri Anda."}
              </p>
            </div>

            {/* Dynamic analyzing steps */}
            <div className="rounded-2xl border border-indigo-950 bg-indigo-950/50 px-4 py-3 min-w-[280px] text-center shadow-inner">
              <span className="font-mono text-xs text-amber-300 font-semibold flex items-center justify-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                {analyzingStep}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Webcam Modal */}
      {isWebcamOpen && (
        <WebcamCapture
          onCapture={(base64) => {
            setPhoto(base64);
            setIsWebcamOpen(false);
          }}
          onClose={() => setIsWebcamOpen(false)}
        />
      )}

      {/* History Sidebar */}
      <HistorySidebar
        history={history}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
        onClearAll={handleClearAllHistory}
      />

      {/* Premium Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscribe}
        lang={lang}
      />

      {/* Footer copyright */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 px-4 text-center text-slate-500 text-xs mt-auto no-print">
        <p className="font-display font-medium text-slate-400">Pembaca Karakter & Peruntungan AuraPsych © 2026</p>
        <p className="text-[10px] text-slate-600 mt-1">
          Ditenagai oleh Google Gemini 3.5 Flash • Menggabungkan Tradisi Timur (Mian Xiang & Primbon) & Barat (Astrologi)
        </p>
      </footer>
    </div>
  );
}
