import React from 'react';
import { Info, Sparkles, Code2, ShieldCheck } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about-section" className="w-full bg-[#13141f] border border-[#222538] rounded-xl p-4 sm:p-5 shadow-lg">
      <div className="pb-3 border-b border-[#222538] mb-3.5">
        <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>About RLG → NFA Converter</span>
        </h2>
        <p className="text-[11px] text-slate-400">
          Interactive educational tool for Theory of Computation, Formal Languages, & Automata
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs text-slate-400 leading-relaxed">
        <div className="p-3.5 rounded-xl bg-[#0d0e17] border border-[#222538] space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-200 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Voice Tutor</span>
          </div>
          <p className="text-[11px]">
            Automated step-by-step conversion voice playback in English 🇬🇧 and Hindi 🇮🇳 utilizing the browser Web Speech API.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0d0e17] border border-[#222538] space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-200 font-bold text-xs">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>SVG Graph Visualizer</span>
          </div>
          <p className="text-[11px]">
            Dynamic graph with zoom, pan, draggable state nodes, concentric accepting rings, and bidirectional transition curves.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0d0e17] border border-[#222538] space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-200 font-bold text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Automata Engine</span>
          </div>
          <p className="text-[11px]">
            Rigorous parsing supporting multiple production alternatives (<code className="text-indigo-300 font-mono">|</code>), ε-transitions, and subset simulation.
          </p>
        </div>
      </div>
    </section>
  );
};

