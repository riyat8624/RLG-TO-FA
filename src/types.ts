/**
 * Types and interfaces for Right-Linear Grammar (RLG) to Finite Automaton (NFA) conversion
 */

export type ProductionType = 'variable_target' | 'terminal_only' | 'epsilon';

export interface ProductionRule {
  id: string;
  lhs: string;            // Non-terminal / Variable, e.g., "S", "A"
  rhs: string;            // Right hand side string, e.g., "aA", "b", "ε"
  symbol: string;         // The terminal symbol, e.g., "a", "b", "ε"
  targetVar: string | null; // The right-hand variable, e.g., "A", or null if terminal_only / epsilon
  type: ProductionType;   // 'variable_target' (A -> aB), 'terminal_only' (A -> a), 'epsilon' (A -> ε)
  raw: string;            // Original rule representation, e.g., "S → aA"
  lineNumber?: number;
}

export interface Grammar {
  rawText: string;
  variables: string[];    // V = {S, A, B, ...}
  terminals: string[];    // Σ = {a, b, 0, 1, ...}
  startVariable: string;  // S ∈ V
  productions: ProductionRule[];
  isValid: boolean;
  errors: string[];
}

export interface NFATransition {
  from: string;
  symbol: string;         // terminal symbol or 'ε'
  to: string;
  ruleId?: string;
}

export interface NFA {
  states: string[];       // Q
  alphabet: string[];     // Σ
  startState: string;     // q0
  finalStates: string[];  // F
  transitions: NFATransition[];
  hasGeneratedFinalState: boolean;
  generatedFinalStateName: string; // usually "F"
}

export interface ConversionStep {
  id: string;
  stepNumber: number;
  title: string;
  titleHi: string;
  category: 'PARSE' | 'STATES' | 'TRANSITION' | 'EPSILON' | 'FINAL_STATES' | 'COMPLETE';
  descriptionEn: string;
  descriptionHi: string;
  grammarRule?: string;
  nfaAction?: string;
  nfaActionHi?: string;
  highlightStates?: string[];
  highlightEdge?: { from: string; symbol: string; to: string };
}

export interface SimulationStep {
  stepIndex: number;
  consumedChar: string | null;
  remainingString: string;
  currentStates: string[];
  transitionsTaken: { from: string; symbol: string; to: string }[];
  isFinalStateActive: boolean;
}

export interface SimulationResult {
  inputString: string;
  isAccepted: boolean;
  steps: SimulationStep[];
  allPaths: {
    path: { state: string; symbol?: string }[];
    isAccepted: boolean;
  }[];
  finalStates: string[];
  message: string;
}

export interface GrammarExample {
  id: string;
  title: string;
  description: string;
  grammar: string;
  testStrings: { input: string; shouldAccept: boolean }[];
  badge?: string;
}

export type VoiceLanguage = 'en' | 'hi';
