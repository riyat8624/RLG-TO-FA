import React, { useRef } from 'react';
import { Play, Sparkles, Trash2, AlertCircle, CheckCircle2, Copy, Check } from 'lucide-react';
import { Grammar } from '../types';

interface GrammarInputProps {
  rawInput: string;
  onInputChange: (val: string) => void;
  onConvert: () => void;
  onLoadExample: () => void;
  onClear: () => void;
  grammar: Grammar;
}

export const GrammarInput: React.FC<GrammarInputProps> = ({
  rawInput,
  onInputChange,
  onConvert,
  onLoadExample,
  onClear,
  grammar,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = React.useState(false);

  const insertSymbol = (symbol: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + symbol + after;
    onInputChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 10);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="grammar-input" className="w-full bg-[#13141f] border border-[#222538] rounded-xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-[#222538]">
          <div>
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <span>Grammar Input (RLG)</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Format: <code className="text-indigo-300 font-mono">A → aB</code>,{' '}
              <code className="text-indigo-300 font-mono">A → a</code>, or{' '}
              <code className="text-indigo-300 font-mono">A → ε</code>
            </p>
          </div>

          <button
            id="copy-grammar-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1a1c2d] hover:bg-[#25283f] text-xs font-medium text-slate-300 transition-colors border border-[#2d304a] cursor-pointer"
            title="Copy grammar rules to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Quick Insertion Symbols Bar */}
        <div className="flex items-center flex-wrap gap-1.5 mb-3 p-1.5 bg-[#0d0e17] rounded-lg border border-[#222538] text-xs text-slate-400">
          <span className="font-bold text-[10px] text-slate-500 uppercase px-1">Insert:</span>
          {['→', '|', 'ε', 'S', 'A', 'B', 'F', 'a', 'b', '0', '1'].map((sym) => (
            <button
              key={sym}
              type="button"
              id={`insert-btn-${sym}`}
              onClick={() => insertSymbol(sym === '→' ? ' → ' : sym === '|' ? ' | ' : sym)}
              className="px-2 py-0.5 rounded bg-[#1a1c2d] hover:bg-indigo-600 hover:text-white text-slate-200 font-mono text-xs font-semibold border border-[#2d304a] transition-all cursor-pointer"
            >
              {sym}
            </button>
          ))}
        </div>

        {/* Textarea Input */}
        <div className="relative mb-3">
          <textarea
            ref={textareaRef}
            id="grammar-textarea"
            value={rawInput}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={`S → aA | b\nA → aS | b`}
            rows={5}
            className="w-full bg-[#0d0e17] border border-[#222538] rounded-xl p-3 font-mono text-sm text-indigo-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-y leading-relaxed shadow-inner"
            spellCheck={false}
          />
        </div>

        {/* Grammar Parsing Validation Status */}
        {rawInput.trim() && (
          <div className="mb-3">
            {grammar.isValid ? (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-800/50 px-3 py-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  Valid RLG ({grammar.variables.length} Vars, {grammar.terminals.length} Terms, {grammar.productions.length} Prods)
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-xs text-amber-300 bg-amber-950/30 border border-amber-800/50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div className="space-y-0.5">
                  {grammar.errors.map((err, idx) => (
                    <p key={idx}>{err}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons matching the screenshot's prominent cobalt/indigo CTA */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#222538]">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Convert to NFA Button */}
          <button
            id="convert-to-nfa-btn"
            onClick={onConvert}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-900/30 transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Convert to NFA</span>
          </button>

          {/* Load Example Button */}
          <button
            id="load-example-btn"
            onClick={onLoadExample}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a1c2d] hover:bg-[#25283f] text-slate-200 font-semibold text-xs border border-[#2d304a] transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Example</span>
          </button>
        </div>

        {/* Clear Button */}
        <button
          id="clear-grammar-btn"
          onClick={onClear}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#1a1c2d] hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 font-medium text-xs border border-[#2d304a] hover:border-rose-800/50 transition-all active:scale-95 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>
    </section>
  );
};
