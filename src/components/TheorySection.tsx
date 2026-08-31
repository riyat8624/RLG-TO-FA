import React from 'react';
import { BookOpen } from 'lucide-react';

export const TheorySection: React.FC = () => {
  return (
    <section id="theory-section" className="w-full bg-[#13141f] border border-[#222538] rounded-xl p-4 sm:p-5 shadow-lg">
      <div className="pb-3 border-b border-[#222538] mb-3.5">
        <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>How It Works: Mathematical Foundation</span>
        </h2>
        <p className="text-[11px] text-slate-400">
          Chomsky Hierarchy Type-3 Regular Grammars & NFA Construction Algorithm
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
        {/* Left Card: Formal RLG Definition */}
        <div className="p-3.5 rounded-xl bg-[#0d0e17] border border-[#222538] space-y-2">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">1</span>
            <span>Right-Linear Grammar Definition</span>
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            In formal language theory, a <strong>Right-Linear Grammar (RLG)</strong> is a formal grammar <code className="text-indigo-300 font-mono">G = (V, Σ, R, S)</code> where every production in <code className="text-indigo-300 font-mono">R</code> strictly takes one of three forms:
          </p>
          <ul className="space-y-1 text-[11px] font-mono text-indigo-200 pl-1.5">
            <li className="flex items-center gap-1.5">
              <span className="text-indigo-400">•</span>
              <span>A → aB</span>
              <span className="text-[10px] text-slate-500 font-sans">(Variable target)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-indigo-400">•</span>
              <span>A → a</span>
              <span className="text-[10px] text-slate-500 font-sans">(Single terminal)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-indigo-400">•</span>
              <span>A → ε</span>
              <span className="text-[10px] text-slate-500 font-sans">(Empty string)</span>
            </li>
          </ul>
        </div>

        {/* Right Card: Translation Algorithm */}
        <div className="p-3.5 rounded-xl bg-[#0d0e17] border border-[#222538] space-y-2">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">2</span>
            <span>NFA Construction Algorithm</span>
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            To construct equivalent NFA <code className="text-indigo-300 font-mono">M = (Q, Σ, δ, q₀, F)</code>:
          </p>
          <div className="space-y-1.5 text-[11px]">
            <div className="p-2.5 rounded-lg bg-[#151726] border border-[#26283d]">
              <strong className="text-indigo-300 block mb-0.5">Rule 1: A → aB</strong>
              <span className="text-slate-400">Creates transition: <code className="text-indigo-200 font-mono">δ(A, a) ∋ B</code></span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#151726] border border-[#26283d]">
              <strong className="text-emerald-300 block mb-0.5">Rule 2: A → a</strong>
              <span className="text-slate-400">Transition to final state: <code className="text-emerald-200 font-mono">δ(A, a) ∋ F</code></span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#151726] border border-[#26283d]">
              <strong className="text-amber-300 block mb-0.5">Rule 3: A → ε</strong>
              <span className="text-slate-400">Marks <code className="text-amber-200 font-mono">A</code> directly as final (<code className="text-amber-200 font-mono">A ∈ F</code>)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

