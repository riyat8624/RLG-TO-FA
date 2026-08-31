import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, CheckCircle2, XCircle, SkipForward, SkipBack, Sparkles, FastForward } from 'lucide-react';
import confetti from 'canvas-confetti';
import { NFA, SimulationResult } from '../types';
import { simulateNFA } from '../utils/nfaSimulator';

interface StringTesterProps {
  nfa: NFA;
  onSimulationStateHighlight?: (states: string[], edge?: { from: string; symbol: string; to: string }) => void;
  presetStrings?: { input: string; shouldAccept: boolean }[];
}

export const StringTester: React.FC<StringTesterProps> = ({
  nfa,
  onSimulationStateHighlight,
  presetStrings = [
    { input: 'ab', shouldAccept: true },
    { input: 'aab', shouldAccept: true },
    { input: 'bab', shouldAccept: true },
    { input: 'b', shouldAccept: false },
    { input: 'a', shouldAccept: false },
  ],
}) => {
  const [testInput, setTestInput] = useState<string>('ab');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isAutoStepping, setIsAutoStepping] = useState<boolean>(false);

  // Run simulation on input string
  const handleTestString = (customInput?: string) => {
    const stringToTest = customInput !== undefined ? customInput : testInput;
    if (customInput !== undefined) {
      setTestInput(customInput);
    }

    const sim = simulateNFA(nfa, stringToTest);
    setResult(sim);
    setActiveStepIndex(0);
    setIsAutoStepping(false);

    if (sim.isAccepted) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.75 },
      });
    }

    if (sim.steps.length > 0 && onSimulationStateHighlight) {
      onSimulationStateHighlight(sim.steps[0].currentStates);
    }
  };

  // Reset Simulation
  const handleResetSimulation = () => {
    setResult(null);
    setActiveStepIndex(0);
    setIsAutoStepping(false);
    if (onSimulationStateHighlight) {
      onSimulationStateHighlight([]);
    }
  };

  // Highlight visualizer nodes when step changes
  useEffect(() => {
    if (result && result.steps[activeStepIndex] && onSimulationStateHighlight) {
      const step = result.steps[activeStepIndex];
      const edge = step.transitionsTaken.length > 0 ? step.transitionsTaken[0] : undefined;
      onSimulationStateHighlight(step.currentStates, edge);
    }
  }, [result, activeStepIndex]);

  // Auto-play stepper effect
  useEffect(() => {
    let timer: any = null;
    if (isAutoStepping && result) {
      if (activeStepIndex < result.steps.length - 1) {
        timer = setTimeout(() => {
          setActiveStepIndex((prev) => prev + 1);
        }, 900);
      } else {
        setIsAutoStepping(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isAutoStepping, activeStepIndex, result]);

  const currentStep = result ? result.steps[activeStepIndex] : null;

  return (
    <section id="string-tester" className="w-full bg-[#13141f] border border-[#222538] rounded-xl p-4 sm:p-5 shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222538] mb-3.5">
        <div>
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>NFA String Simulator</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Simulate strings against the NFA with non-deterministic subset state tracking
          </p>
        </div>

        {/* Preset quick test chips */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-0.5">Presets:</span>
          {presetStrings.slice(0, 5).map((preset, idx) => (
            <button
              key={idx}
              type="button"
              id={`preset-string-btn-${idx}`}
              onClick={() => handleTestString(preset.input)}
              className="px-2 py-0.5 rounded-lg bg-[#1a1c2d] hover:bg-[#25283f] text-[11px] font-mono text-slate-300 border border-[#2d304a] transition-all cursor-pointer"
              title={`Test "${preset.input || 'ε'}"`}
            >
              {preset.input === '' ? 'ε' : `"${preset.input}"`}
            </button>
          ))}
        </div>
      </div>

      {/* Input & Action Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center mb-3.5">
        <div className="sm:col-span-8 relative">
          <input
            id="test-string-input"
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTestString();
            }}
            placeholder="Enter string to test (e.g. ab, aab, ε)..."
            className="w-full bg-[#0d0e17] border border-[#222538] rounded-xl px-3 py-2 font-mono text-sm text-indigo-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>

        <div className="sm:col-span-4 flex items-center gap-1.5">
          {/* Test String CTA */}
          <button
            id="test-string-btn"
            onClick={() => handleTestString()}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-900/30 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Test String</span>
          </button>

          {/* Reset Simulation CTA */}
          <button
            id="reset-simulation-btn"
            onClick={handleResetSimulation}
            className="p-2 rounded-xl bg-[#1a1c2d] hover:bg-[#25283f] text-slate-300 hover:text-white border border-[#2d304a] transition-colors cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Simulation Result Output */}
      {result && (
        <div className="space-y-3">
          {/* Accepted / Rejected Banner */}
          <div
            id="simulation-result-banner"
            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
              result.isAccepted
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {result.isAccepted ? (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold tracking-tight">
                  {result.isAccepted ? '✓ ACCEPTED' : '✗ REJECTED'}
                </h3>
                <p className="text-[11px] text-slate-300">{result.message}</p>
              </div>
            </div>

            {/* Stepper Controls */}
            {result.steps.length > 1 && (
              <div className="flex items-center gap-1 self-start sm:self-auto bg-[#0d0e17] p-1 rounded-lg border border-[#222538]">
                <button
                  id="sim-step-back-btn"
                  onClick={() => {
                    setIsAutoStepping(false);
                    if (activeStepIndex > 0) setActiveStepIndex(activeStepIndex - 1);
                  }}
                  disabled={activeStepIndex === 0}
                  className="p-1 rounded bg-[#1a1c2d] hover:bg-[#25283f] disabled:opacity-40 text-slate-300 border border-[#2d304a] cursor-pointer"
                  title="Previous character step"
                >
                  <SkipBack className="w-3 h-3" />
                </button>

                <button
                  id="sim-auto-step-btn"
                  onClick={() => {
                    if (activeStepIndex >= result.steps.length - 1) {
                      setActiveStepIndex(0);
                    }
                    setIsAutoStepping(!isAutoStepping);
                  }}
                  className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <FastForward className="w-3 h-3" />
                  <span>{isAutoStepping ? 'Pause' : 'Auto Step'}</span>
                </button>

                <button
                  id="sim-step-next-btn"
                  onClick={() => {
                    setIsAutoStepping(false);
                    if (activeStepIndex < result.steps.length - 1) {
                      setActiveStepIndex(activeStepIndex + 1);
                    }
                  }}
                  disabled={activeStepIndex === result.steps.length - 1}
                  className="p-1 rounded bg-[#1a1c2d] hover:bg-[#25283f] disabled:opacity-40 text-slate-300 border border-[#2d304a] cursor-pointer"
                  title="Next character step"
                >
                  <SkipForward className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Current Step State Tracer Card */}
          {currentStep && (
            <div className="p-3 rounded-xl bg-[#0d0e17] border border-[#222538] text-xs space-y-2.5">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span>
                  Step {activeStepIndex} / {result.steps.length - 1}
                </span>
                <span>
                  Active states:{' '}
                  <strong className="text-indigo-300">{currentStep.currentStates.length}</strong>
                </span>
              </div>

              {/* Progress visual representation along the input string */}
              <div className="flex items-center gap-1.5 p-2 bg-[#151726] rounded-lg border border-[#26283d] font-mono text-xs overflow-x-auto">
                <span className="text-[10px] text-slate-500 uppercase font-sans">Input:</span>
                {testInput.length === 0 ? (
                  <span className="px-1.5 py-0.5 rounded bg-[#1a1c2d] text-slate-300 text-xs">ε (empty)</span>
                ) : (
                  testInput.split('').map((ch, idx) => {
                    const isConsumed = idx < activeStepIndex;
                    const isCurrent = idx === activeStepIndex - 1;
                    return (
                      <span
                        key={idx}
                        className={`px-1.5 py-0.5 rounded text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-indigo-600 text-white shadow ring-1 ring-indigo-400'
                            : isConsumed
                            ? 'bg-[#1a1c2d] text-slate-400'
                            : 'bg-[#0d0e17] text-slate-200 border border-[#222538]'
                        }`}
                      >
                        {ch}
                      </span>
                    );
                  })
                )}
              </div>

              {/* Active state set list */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 font-medium text-[11px]">Active state set:</span>
                {currentStep.currentStates.length === 0 ? (
                  <span className="px-2 py-0.5 rounded bg-rose-950/50 text-rose-300 font-mono border border-rose-800/40 text-[11px]">
                    ∅ (Dead state / No valid path)
                  </span>
                ) : (
                  currentStep.currentStates.map((st) => {
                    const isFinal = nfa.finalStates.includes(st);
                    return (
                      <span
                        key={st}
                        className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border flex items-center gap-1 ${
                          isFinal
                            ? 'bg-emerald-950/60 text-emerald-200 border-emerald-600/60'
                            : 'bg-indigo-950/60 text-indigo-200 border-indigo-700/50'
                        }`}
                      >
                        {st}
                        {isFinal && <span className="text-[9px] text-emerald-400 font-sans font-normal">(Final)</span>}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
