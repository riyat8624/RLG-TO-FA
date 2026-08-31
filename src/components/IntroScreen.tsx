import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Cpu, BookOpen, Volume2, Network, CheckCircle2, Plus } from 'lucide-react';

interface IntroScreenProps {
  onEnter: () => void;
  onQuickLoadExample?: (grammarText: string) => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onEnter }) => {
  const [animStage, setAnimStage] = useState<number>(0);

  // Animation cycle through grammar -> transition -> mini NFA
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimStage((prev) => (prev + 1) % 3);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="intro-screen" className="min-h-screen bg-[#090a10] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Decorative Bento Grids & Indigo Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#312e8118_1px,transparent_1px),linear-gradient(to_bottom,#312e8118_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold shadow-inner">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">
                RLG <span className="text-indigo-400">&rarr;</span> NFA
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO ENGINE
              </span>
            </div>
            <span className="block text-xs text-slate-400 font-medium">
              Right-Linear Grammar to Finite Automaton
            </span>
          </div>
        </div>

        <button
          id="intro-header-enter-btn"
          onClick={onEnter}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141522] hover:bg-[#1c1d2e] text-sm font-semibold text-indigo-300 border border-indigo-900/60 hover:border-indigo-500/60 transition-all shadow-sm cursor-pointer"
        >
          <span>Open Converter</span>
          <ArrowRight className="w-4 h-4 text-indigo-400" />
        </button>
      </header>

      {/* Main Hero Content */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 py-8 flex flex-col items-center text-center">
        {/* Animated Orbit Container */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 mb-6 relative flex items-center justify-center">
          <div className="absolute w-full h-full border-2 border-dashed border-indigo-500/60 rounded-full animate-[spin_12s_linear_infinite]" />
          <div className="absolute w-3/4 h-3/4 border border-indigo-900/40 rounded-full" />
          <div id="intro-anim" className="text-xl sm:text-2xl font-mono font-bold text-indigo-300 z-10 bg-[#12131f]/90 px-4 py-2 rounded-xl border border-indigo-500/40 shadow-xl backdrop-blur-md">
            {animStage === 0 && 'S → aA | b'}
            {animStage === 1 && 'δ(S, a) = A'}
            {animStage === 2 && 'q₀ ──a──→ q₁'}
          </div>
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tighter text-white mb-2"
        >
          RLG <span className="text-indigo-500">&rarr;</span> NFA
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-base sm:text-lg text-slate-400 font-normal max-w-2xl mb-8"
        >
          Right-Linear Grammar to Finite Automaton Conversion & Simulation Suite
        </motion.p>

        {/* Primary CTA Button matching the prominent DronyX action button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center mb-10"
        >
          <button
            id="enter-converter-btn"
            onClick={onEnter}
            className="group relative inline-flex items-center justify-between gap-4 px-6 py-3.5 bg-[#5850ec] hover:bg-[#4d45e5] text-white rounded-xl font-bold text-sm sm:text-base transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-indigo-600/30 cursor-pointer min-w-[260px]"
          >
            <span>Enter the Converter</span>
            <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <Plus className="w-4 h-4" />
            </span>
          </button>
        </motion.div>

        {/* Bento Grid Feature Preview matching card style in screenshot with square '+' badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl text-left"
        >
          <div className="bg-[#13141f] border border-[#23263a] rounded-xl p-4 shadow-lg flex flex-col justify-between group hover:border-indigo-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                <Plus className="w-4 h-4" />
              </div>
              <Network className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">NFA Visualizer</h4>
              <p className="text-[11px] text-slate-400 leading-snug">SVG graph with pan, zoom & draggable nodes</p>
            </div>
          </div>

          <div className="bg-[#13141f] border border-[#23263a] rounded-xl p-4 shadow-lg flex flex-col justify-between group hover:border-indigo-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                <Plus className="w-4 h-4" />
              </div>
              <Volume2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">Voice Tutor</h4>
              <p className="text-[11px] text-slate-400 leading-snug">Audio explanations in English & Hindi</p>
            </div>
          </div>

          <div className="bg-[#13141f] border border-[#23263a] rounded-xl p-4 shadow-lg flex flex-col justify-between group hover:border-indigo-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                <Plus className="w-4 h-4" />
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">String Simulator</h4>
              <p className="text-[11px] text-slate-400 leading-snug">Subset state tracer with step progression</p>
            </div>
          </div>

          <div className="bg-[#13141f] border border-[#23263a] rounded-xl p-4 shadow-lg flex flex-col justify-between group hover:border-indigo-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                <Plus className="w-4 h-4" />
              </div>
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">Transition Matrix</h4>
              <p className="text-[11px] text-slate-400 leading-snug">Formal 5-tuple with CSV export</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 text-center text-[11px] text-slate-500 border-t border-[#191b29]">
        AutomataLab • Right-Linear Grammar (Type-3 Regular) to Nondeterministic Finite Automaton Engine
      </footer>
    </div>
  );
};
