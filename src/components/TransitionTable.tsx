import React, { useState } from 'react';
import { Table, Download, Copy, Check, Info } from 'lucide-react';
import { NFA } from '../types';
import { buildTransitionMatrix, downloadCSV } from '../utils/nfaConverter';

interface TransitionTableProps {
  nfa: NFA;
}

export const TransitionTable: React.FC<TransitionTableProps> = ({ nfa }) => {
  const [copied, setCopied] = useState(false);

  if (!nfa.startState || nfa.states.length === 0) {
    return null;
  }

  const matrix = buildTransitionMatrix(nfa);

  const handleDownloadCSV = () => {
    downloadCSV(nfa, `nfa_transition_table_${Date.now()}.csv`);
  };

  const handleCopyMarkdown = () => {
    const header = `| State | ${matrix.columns.join(' | ')} |`;
    const separator = `| :--- | ${matrix.columns.map(() => ':---:').join(' | ')} |`;
    const rows = matrix.rows.map((row) => {
      const stateLabel = (row.isStart ? '→ ' : '') + (row.isFinal ? '* ' : '') + row.state;
      const cellValues = matrix.columns.map((col) => {
        const dests = row.cells[col];
        if (!dests || dests.length === 0) return '—';
        return dests.length === 1 ? dests[0] : `{${dests.join(', ')}}`;
      });
      return `| ${stateLabel} | ${cellValues.join(' | ')} |`;
    });

    const markdown = [header, separator, ...rows].join('\n');
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="transition-table" className="w-full bg-[#13141f] border border-[#222538] rounded-xl p-4 sm:p-5 shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222538] mb-3.5">
        <div>
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <Table className="w-4 h-4 text-indigo-400" />
            <span>NFA Transition Table & 5-Tuple</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Matrix <span className="font-mono text-indigo-300">δ: Q × (Σ ∪ {'{ε}'}) → 𝒫(Q)</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Download CSV Button */}
          <button
            id="download-csv-btn"
            onClick={handleDownloadCSV}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1a1c2d] hover:bg-[#25283f] text-slate-200 font-semibold text-xs border border-[#2d304a] transition-all cursor-pointer"
            title="Download Transition Table as CSV file"
          >
            <Download className="w-3 h-3 text-indigo-400" />
            <span>CSV</span>
          </button>

          {/* Copy Markdown Table */}
          <button
            id="copy-markdown-btn"
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1a1c2d] hover:bg-[#25283f] text-slate-200 font-semibold text-xs border border-[#2d304a] transition-all cursor-pointer"
            title="Copy as Markdown Table"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Markdown'}</span>
          </button>
        </div>
      </div>

      {/* Formal 5-Tuple Badges */}
      <div className="p-3 rounded-xl bg-[#0d0e17] border border-[#222538] mb-3.5 space-y-1.5 text-xs">
        <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
          <Info className="w-3 h-3 text-indigo-400" />
          <span>Formal NFA 5-Tuple: M = (Q, Σ, δ, q₀, F)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 font-mono text-[11px]">
          <div>
            <span className="text-slate-500 font-sans">Q: </span>
            <span className="text-indigo-300 font-bold">{`{${nfa.states.join(', ')}}`}</span>
          </div>
          <div>
            <span className="text-slate-500 font-sans">Σ: </span>
            <span className="text-indigo-300 font-bold">{`{${nfa.alphabet.join(', ')}}`}</span>
          </div>
          <div>
            <span className="text-slate-500 font-sans">q₀: </span>
            <span className="text-amber-300 font-bold">{nfa.startState}</span>
          </div>
          <div>
            <span className="text-slate-500 font-sans">F: </span>
            <span className="text-emerald-300 font-bold">{`{${nfa.finalStates.join(', ')}}`}</span>
          </div>
        </div>
      </div>

      {/* Transition Table Grid */}
      <div className="overflow-x-auto rounded-xl border border-[#222538] bg-[#0d0e17] max-h-56 overflow-y-auto">
        <table className="w-full text-center text-xs">
          <thead className="bg-[#151726] text-slate-300 border-b border-[#222538] font-mono sticky top-0">
            <tr>
              <th className="py-2 px-3 text-left font-bold text-[10px] uppercase tracking-wider text-slate-400 font-sans">
                State (q ∈ Q)
              </th>
              {matrix.columns.map((col) => (
                <th key={col} className="py-2 px-3 font-bold text-indigo-300">
                  Input &apos;{col}&apos;
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2133] font-mono text-xs">
            {matrix.rows.map((row) => (
              <tr
                key={row.state}
                className={`hover:bg-[#181a2b] transition-colors ${
                  row.isFinal ? 'bg-emerald-950/15' : ''
                }`}
              >
                {/* State Label */}
                <td className="py-2.5 px-3 text-left font-bold text-slate-200">
                  <div className="flex items-center gap-1.5">
                    {row.isStart && (
                      <span className="text-amber-400 text-[10px] px-1.5 py-0.2 rounded bg-amber-950/50 border border-amber-800/50 font-sans font-bold">
                        → start
                      </span>
                    )}
                    {row.isFinal && (
                      <span className="text-emerald-400 text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/50 border border-emerald-800/50 font-sans font-bold">
                        * final
                      </span>
                    )}
                    <span className="text-xs text-indigo-100 font-bold">{row.state}</span>
                  </div>
                </td>

                {/* State Transition Cells */}
                {matrix.columns.map((col) => {
                  const destinations = row.cells[col] || [];
                  return (
                    <td key={col} className="py-2.5 px-3">
                      {destinations.length === 0 ? (
                        <span className="text-slate-600 font-normal">—</span>
                      ) : destinations.length === 1 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-950/80 text-indigo-200 border border-indigo-700/50 font-bold text-xs">
                          {destinations[0]}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-950/90 text-indigo-200 border border-indigo-600/50 font-bold text-xs">
                          {`{${destinations.join(', ')}}`}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2.5 text-[11px] text-slate-400 flex items-center justify-between">
        <span>
          Legend: <span className="text-amber-400 font-mono">→</span> Start,{' '}
          <span className="text-emerald-400 font-mono">*</span> Final.
        </span>
        <span className="font-mono text-[10px] text-slate-500">
          Transitions: {nfa.transitions.length}
        </span>
      </div>
    </section>
  );
};
