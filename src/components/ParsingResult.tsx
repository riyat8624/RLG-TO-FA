import React from 'react';
import { Layers, FileCode, CheckCircle2 } from 'lucide-react';
import { Grammar } from '../types';

interface ParsingResultProps {
  grammar: Grammar;
}

export const ParsingResult: React.FC<ParsingResultProps> = ({ grammar }) => {
  if (!grammar.isValid || grammar.productions.length === 0) {
    return null;
  }

  return (
    <section id="parsing-result" className="w-full bg-[#13141f] border border-[#222538] rounded-xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between pb-2.5 border-b border-[#222538] mb-3">
        <div>
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <span>Parsing Result</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            4-tuple: <span className="font-mono text-indigo-300">G = (V, Σ, R, S)</span>
          </p>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Parsed
        </span>
      </div>

      {/* 4-Tuple Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3.5">
        {/* Variables V */}
        <div className="p-2.5 rounded-lg bg-[#0d0e17] border border-[#222538]">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
            Variables (V)
          </span>
          <div className="flex flex-wrap gap-1 items-center">
            {grammar.variables.map((v) => (
              <span
                key={v}
                className="px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-700/50 font-mono text-[11px] font-bold text-indigo-200"
              >
                {v}
              </span>
            ))}
          </div>
        </div>

        {/* Terminals Sigma */}
        <div className="p-2.5 rounded-lg bg-[#0d0e17] border border-[#222538]">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
            Terminals (Σ)
          </span>
          <div className="flex flex-wrap gap-1 items-center">
            {grammar.terminals.length > 0 ? (
              grammar.terminals.map((t) => (
                <span
                  key={t}
                  className="px-1.5 py-0.5 rounded bg-[#1a1c2d] border border-[#2d304a] font-mono text-[11px] font-bold text-slate-200"
                >
                  {t}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-500">None (ε-only)</span>
            )}
          </div>
        </div>

        {/* Start Variable S */}
        <div className="p-2.5 rounded-lg bg-[#0d0e17] border border-[#222538]">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
            Start (S)
          </span>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-700/50 font-mono text-[11px] font-bold text-amber-200">
              {grammar.startVariable}
            </span>
            <span className="text-[10px] text-slate-500">Initial state</span>
          </div>
        </div>

        {/* Productions Count */}
        <div className="p-2.5 rounded-lg bg-[#0d0e17] border border-[#222538]">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
            Productions (R)
          </span>
          <span className="font-mono text-xs font-bold text-indigo-200">
            {grammar.productions.length} Rules
          </span>
        </div>
      </div>

      {/* Production Rules Table Breakdown */}
      <div>
        <h3 className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
          <FileCode className="w-3.5 h-3.5 text-slate-400" />
          <span>Rules Interpretation</span>
        </h3>

        <div className="overflow-x-auto rounded-lg border border-[#222538] bg-[#0d0e17] max-h-48 overflow-y-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#151726] text-slate-400 border-b border-[#222538] uppercase text-[9px] tracking-wider sticky top-0">
              <tr>
                <th className="py-1.5 px-2">#</th>
                <th className="py-1.5 px-2">Rule</th>
                <th className="py-1.5 px-2">Category</th>
                <th className="py-1.5 px-2">NFA Mapping</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2133] text-slate-300 font-mono">
              {grammar.productions.map((rule, idx) => (
                <tr key={rule.id} className="hover:bg-[#181a2b] transition-colors">
                  <td className="py-1.5 px-2 text-slate-500 font-sans">{idx + 1}</td>
                  <td className="py-1.5 px-2 font-bold text-indigo-200">
                    {rule.lhs} → {rule.rhs}
                  </td>
                  <td className="py-1.5 px-2 font-sans">
                    {rule.type === 'variable_target' && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[10px] border border-indigo-500/30">
                        A → aB
                      </span>
                    )}
                    {rule.type === 'terminal_only' && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/30">
                        A → a
                      </span>
                    )}
                    {rule.type === 'epsilon' && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/30">
                        A → ε
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 px-2 font-sans text-slate-400 text-[10px]">
                    {rule.type === 'variable_target' && (
                      <span>
                        <code className="text-indigo-300 font-mono">δ({rule.lhs},{rule.symbol}) ∋ {rule.targetVar}</code>
                      </span>
                    )}
                    {rule.type === 'terminal_only' && (
                      <span>
                        <code className="text-emerald-300 font-mono">δ({rule.lhs},{rule.symbol}) ∋ F</code>
                      </span>
                    )}
                    {rule.type === 'epsilon' && (
                      <span>
                        <code className="text-amber-300 font-mono">{rule.lhs} ∈ F</code>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
