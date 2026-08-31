/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { IntroScreen } from './components/IntroScreen';
import { Navbar } from './components/Navbar';
import { GrammarInput } from './components/GrammarInput';
import { ParsingResult } from './components/ParsingResult';
import { ConversionSteps } from './components/ConversionSteps';
import { TransitionTable } from './components/TransitionTable';
import { NfaVisualizer } from './components/NfaVisualizer';
import { StringTester } from './components/StringTester';
import { ExamplesSection } from './components/ExamplesSection';
import { TheorySection } from './components/TheorySection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';

import { parseRLG } from './utils/grammarParser';
import { convertRLGToNFA } from './utils/nfaConverter';
import { GRAMMAR_EXAMPLES } from './utils/examples';
import { GrammarExample, VoiceLanguage } from './types';

export default function App() {
  // Screen Mode: true = Intro Screen, false = Main Application
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Default Grammar Input: S → aA | b, A → aS | b
  const [rawInput, setRawInput] = useState<string>(
    `S → aA | b\nA → aS | b`
  );

  const [activeExampleIndex, setActiveExampleIndex] = useState<number>(0);
  const [voiceLang, setVoiceLang] = useState<VoiceLanguage>('en');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Highlighting for visualizer
  const [highlightStates, setHighlightStates] = useState<string[]>([]);
  const [highlightEdge, setHighlightEdge] = useState<
    { from: string; symbol: string; to: string } | undefined
  >(undefined);

  // Parse Grammar
  const grammar = useMemo(() => {
    return parseRLG(rawInput);
  }, [rawInput]);

  // Convert RLG to NFA
  const { nfa, steps } = useMemo(() => {
    return convertRLGToNFA(grammar);
  }, [grammar]);

  // When steps change or active step changes, sync highlight states with the current step
  useEffect(() => {
    if (steps.length > 0 && steps[activeStepIndex]) {
      const step = steps[activeStepIndex];
      setHighlightStates(step.highlightStates || []);
      setHighlightEdge(step.highlightEdge);
    } else {
      setHighlightStates([]);
      setHighlightEdge(undefined);
    }
  }, [steps, activeStepIndex]);

  // Convert button handler
  const handleConvert = () => {
    setActiveStepIndex(0);
    const element = document.getElementById('parsing-result');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Load Example button handler (cycles through curated examples)
  const handleLoadExample = () => {
    const nextIdx = (activeExampleIndex + 1) % GRAMMAR_EXAMPLES.length;
    setActiveExampleIndex(nextIdx);
    const eg = GRAMMAR_EXAMPLES[nextIdx];
    setRawInput(eg.grammar);
    setActiveStepIndex(0);
  };

  // Select specific example from Examples section
  const handleSelectExample = (example: GrammarExample) => {
    setRawInput(example.grammar);
    setActiveStepIndex(0);
    const element = document.getElementById('grammar-input');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Clear button handler
  const handleClear = () => {
    setRawInput('');
    setActiveStepIndex(0);
    setHighlightStates([]);
    setHighlightEdge(undefined);
  };

  // Simulation highlight callback
  const handleSimulationHighlight = (
    states: string[],
    edge?: { from: string; symbol: string; to: string }
  ) => {
    setHighlightStates(states);
    setHighlightEdge(edge);
  };

  // If on Intro Screen
  if (showIntro) {
    return (
      <IntroScreen
        onEnter={() => setShowIntro(false)}
        onQuickLoadExample={(grammarText) => {
          setRawInput(grammarText);
          setShowIntro(false);
        }}
      />
    );
  }

  // Active preset test strings from current example if matched
  const currentExample = GRAMMAR_EXAMPLES.find(
    (eg) => eg.grammar.trim() === rawInput.trim()
  );
  const activePresetStrings = currentExample?.testStrings;

  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Sticky Navbar */}
      <Navbar
        onBackToIntro={() => setShowIntro(true)}
        voiceLang={voiceLang}
        onVoiceLangChange={setVoiceLang}
        onQuickLoadExample={handleLoadExample}
      />

      {/* Main Bento Grid Container */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-5 space-y-3.5">
        {/* Bento Hero Header Card */}
        <section id="hero-section" className="bg-[#13141f] border border-[#222538] rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-2">
              Type-3 Regular Grammar Converter
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Right-Linear Grammar <span className="text-indigo-400">→</span> Finite Automaton
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Transform Right-Linear Grammars into equivalent Nondeterministic Finite Automata with bilingual speech synthesis, transition matrix, step-by-step algorithms, and interactive simulation.
            </p>
          </div>

          {/* Quick Metrics Badge Group */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <div className="px-3 py-2 rounded-xl bg-[#0d0e17] border border-[#222538] text-center">
              <span className="block text-[10px] uppercase font-bold text-slate-500">Variables</span>
              <span className="text-sm font-bold text-indigo-300 font-mono">{grammar.variables.length}</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-[#0d0e17] border border-[#222538] text-center">
              <span className="block text-[10px] uppercase font-bold text-slate-500">Terminals</span>
              <span className="text-sm font-bold text-emerald-300 font-mono">{grammar.terminals.length}</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-[#0d0e17] border border-[#222538] text-center">
              <span className="block text-[10px] uppercase font-bold text-slate-500">States</span>
              <span className="text-sm font-bold text-amber-300 font-mono">{nfa.states.length}</span>
            </div>
          </div>
        </section>

        {/* Bento Grid: Input & Parsing Result vs Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          {/* Left Column: Grammar Input & Parsing Result */}
          <div className="lg:col-span-5 space-y-3.5">
            {/* 1. Grammar Input */}
            <GrammarInput
              rawInput={rawInput}
              onInputChange={setRawInput}
              onConvert={handleConvert}
              onLoadExample={handleLoadExample}
              onClear={handleClear}
              grammar={grammar}
            />

            {/* 2. Parsing Result */}
            {grammar.isValid && <ParsingResult grammar={grammar} />}
          </div>

          {/* Right Column: NFA Visualization */}
          <div className="lg:col-span-7">
            {nfa.states.length > 0 && (
              <NfaVisualizer
                nfa={nfa}
                highlightStates={highlightStates}
                highlightEdge={highlightEdge}
              />
            )}
          </div>
        </div>

        {/* Bento Grid: Conversion Steps & Transition Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          {/* 3. Conversion Steps & Voice Tutor */}
          <div className="lg:col-span-7">
            {steps.length > 0 && (
              <ConversionSteps
                steps={steps}
                activeStepIndex={activeStepIndex}
                onStepChange={setActiveStepIndex}
                voiceLang={voiceLang}
                onVoiceLangChange={setVoiceLang}
              />
            )}
          </div>

          {/* 4. NFA Transition Table */}
          <div className="lg:col-span-5">
            {nfa.states.length > 0 && <TransitionTable nfa={nfa} />}
          </div>
        </div>

        {/* 5. String Tester */}
        {nfa.states.length > 0 && (
          <StringTester
            nfa={nfa}
            onSimulationStateHighlight={handleSimulationHighlight}
            presetStrings={activePresetStrings}
          />
        )}

        {/* 6. Curated Examples Section */}
        <ExamplesSection onSelectExample={handleSelectExample} />

        {/* 7. Mathematical Foundation & About Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          <div className="lg:col-span-6">
            <TheorySection />
          </div>
          <div className="lg:col-span-6">
            <AboutSection />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer onBackToIntro={() => setShowIntro(true)} />
    </div>
  );
}
