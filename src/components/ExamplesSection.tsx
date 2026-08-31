import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { GRAMMAR_EXAMPLES } from '../utils/examples';
import { GrammarExample } from '../types';

interface ExamplesSectionProps {
  onSelectExample: (example: GrammarExample) => void;
}

export const ExamplesSection: React.FC<ExamplesSectionProps> = ({ onSelectExample }) => {
  return (
    <section id="examples-section" className="w-full bg-[#13141f] border border-[#222538] rounded-xl p-4 sm:p-5 shadow-lg">
      <div className="pb-3 border-b border-[#222538] mb-3.5 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Curated Grammar Examples</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Standard Right-Linear Grammars ready to load and convert
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {GRAMMAR_EXAMPLES.map((eg) => (
          <div
            key={eg.id}
            id={`example-card-${eg.id}`}
            className="p-3.5 rounded-xl bg-[#0d0e17] border border-[#222538] hover:border-indigo-500/50 transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {eg.title}
                </h3>
                {eg.badge && (
                  <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {eg.badge}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                {eg.description}
              </p>

              {/* Grammar snippet preview */}
              <div className="p-2 bg-[#151726] rounded-lg border border-[#26283d] font-mono text-[11px] text-indigo-200 whitespace-pre-line mb-2.5">
                {eg.grammar}
              </div>
            </div>

            <button
              id={`load-btn-${eg.id}`}
              onClick={() => onSelectExample(eg)}
              className="w-full flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1a1c2d] group-hover:bg-indigo-600 text-slate-200 group-hover:text-white text-xs font-bold border border-[#2d304a] group-hover:border-indigo-500 transition-all cursor-pointer shadow-sm"
            >
              <span>Load Example</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

