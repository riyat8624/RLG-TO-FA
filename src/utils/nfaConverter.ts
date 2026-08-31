import { Grammar, NFA, NFATransition, ConversionStep } from '../types';

/**
 * Converts a Right-Linear Grammar (RLG) into an NFA according to the formal theory of computation rules.
 */
export function convertRLGToNFA(grammar: Grammar): { nfa: NFA; steps: ConversionStep[] } {
  if (!grammar.isValid || grammar.productions.length === 0) {
    return {
      nfa: {
        states: [],
        alphabet: [],
        startState: '',
        finalStates: [],
        transitions: [],
        hasGeneratedFinalState: false,
        generatedFinalStateName: 'F',
      },
      steps: [],
    };
  }

  const steps: ConversionStep[] = [];
  let stepCount = 1;

  // Step 1: Initial Parsing Step
  steps.push({
    id: `step-${stepCount}`,
    stepNumber: stepCount++,
    title: 'Parse Right-Linear Grammar',
    titleHi: 'व्याकरण का विश्लेषण (Parse Grammar)',
    category: 'PARSE',
    descriptionEn: `Identified variables (non-terminals) V = {${grammar.variables.join(', ')}} and terminals Σ = {${grammar.terminals.join(', ')}}. Start symbol is ${grammar.startVariable}.`,
    descriptionHi: `नॉन-टर्मिनल्स V = {${grammar.variables.join(', ')}} और टर्मिनल्स Σ = {${grammar.terminals.join(', ')}} पहचाने गए। प्रारंभिक प्रतीक ${grammar.startVariable} है।`,
    highlightStates: [grammar.startVariable],
  });

  // Step 2: Determine States & Check if we need a dummy final state F
  // Rule A -> a creates a transition to a new final state F.
  const hasTerminalOnly = grammar.productions.some(p => p.type === 'terminal_only');
  
  // Pick an unused name for the dummy final state, default 'F'
  let dummyFinalState = 'F';
  if (grammar.variables.includes('F')) {
    let suffix = 1;
    while (grammar.variables.includes(`F${suffix}`)) {
      suffix++;
    }
    dummyFinalState = `F${suffix}`;
  }

  const states = [...grammar.variables];
  if (hasTerminalOnly) {
    states.push(dummyFinalState);
  }

  const finalStatesSet = new Set<string>();
  if (hasTerminalOnly) {
    finalStatesSet.add(dummyFinalState);
  }

  steps.push({
    id: `step-${stepCount}`,
    stepNumber: stepCount++,
    title: 'Initialize NFA States',
    titleHi: 'NFA स्टेट्स बनाएं',
    category: 'STATES',
    descriptionEn: hasTerminalOnly
      ? `Created NFA states from variables: {${grammar.variables.join(', ')}} plus a dedicated accepting state {${dummyFinalState}} for terminal productions.`
      : `Created NFA states corresponding to the grammar variables: {${grammar.variables.join(', ')}}.`,
    descriptionHi: hasTerminalOnly
      ? `वेरिएबल्स से स्टेट्स बनाए गए: {${grammar.variables.join(', ')}} तथा टर्मिनल नियमों के लिए एक नया अंतिम स्टेट {${dummyFinalState}} जोड़ा गया।`
      : `व्याकरण वेरिएबल्स के अनुसार NFA स्टेट्स {${grammar.variables.join(', ')}} बनाए गए।`,
    highlightStates: states,
  });

  const transitions: NFATransition[] = [];

  // Step 3+: Process each production rule
  for (const prod of grammar.productions) {
    if (prod.type === 'variable_target' && prod.targetVar) {
      // Rule: A -> aB  =>  delta(A, a) contains B
      transitions.push({
        from: prod.lhs,
        symbol: prod.symbol,
        to: prod.targetVar,
        ruleId: prod.id,
      });

      steps.push({
        id: `step-${stepCount}`,
        stepNumber: stepCount++,
        title: `Transition: ${prod.lhs} → ${prod.rhs}`,
        titleHi: `ट्रांज़िशन: ${prod.lhs} → ${prod.rhs}`,
        category: 'TRANSITION',
        grammarRule: `${prod.lhs} → ${prod.rhs}`,
        nfaAction: `Add transition: δ(${prod.lhs}, ${prod.symbol}) → ${prod.targetVar}`,
        nfaActionHi: `नया ट्रांज़िशन जोड़ें: δ(${prod.lhs}, ${prod.symbol}) → ${prod.targetVar}`,
        descriptionEn: `For rule "${prod.lhs} → ${prod.rhs}", symbol "${prod.symbol}" is read at state "${prod.lhs}" moving to variable state "${prod.targetVar}".`,
        descriptionHi: `नियम "${prod.lhs} → ${prod.rhs}" के लिए, स्टेट "${prod.lhs}" पर सिंबल "${prod.symbol}" आने पर स्टेट "${prod.targetVar}" पर ट्रांज़िशन होता है।`,
        highlightStates: [prod.lhs, prod.targetVar],
        highlightEdge: { from: prod.lhs, symbol: prod.symbol, to: prod.targetVar },
      });
    } else if (prod.type === 'terminal_only') {
      // Rule: A -> a  =>  delta(A, a) contains F (final state)
      transitions.push({
        from: prod.lhs,
        symbol: prod.symbol,
        to: dummyFinalState,
        ruleId: prod.id,
      });

      steps.push({
        id: `step-${stepCount}`,
        stepNumber: stepCount++,
        title: `Terminal Rule: ${prod.lhs} → ${prod.rhs}`,
        titleHi: `टर्मिनल नियम: ${prod.lhs} → ${prod.rhs}`,
        category: 'TRANSITION',
        grammarRule: `${prod.lhs} → ${prod.rhs}`,
        nfaAction: `Add transition: δ(${prod.lhs}, ${prod.symbol}) → ${dummyFinalState} (Accepting State)`,
        nfaActionHi: `नया ट्रांज़िशन जोड़ें: δ(${prod.lhs}, ${prod.symbol}) → ${dummyFinalState} (स्वीकार्य स्टेट)`,
        descriptionEn: `For terminal-only rule "${prod.lhs} → ${prod.rhs}", the production ends the string. We create a transition on "${prod.symbol}" from "${prod.lhs}" to the final state "${dummyFinalState}".`,
        descriptionHi: `टर्मिनल नियम "${prod.lhs} → ${prod.rhs}" के लिए स्ट्रिंग यहीं समाप्त होती है। अतः "${prod.lhs}" से अंतिम स्टेट "${dummyFinalState}" पर "${prod.symbol}" का ट्रांज़िशन बनाते हैं।`,
        highlightStates: [prod.lhs, dummyFinalState],
        highlightEdge: { from: prod.lhs, symbol: prod.symbol, to: dummyFinalState },
      });
    } else if (prod.type === 'epsilon') {
      // Rule: A -> ε  =>  A is a final state
      finalStatesSet.add(prod.lhs);

      steps.push({
        id: `step-${stepCount}`,
        stepNumber: stepCount++,
        title: `Epsilon Rule: ${prod.lhs} → ε`,
        titleHi: `एप्सिलॉन नियम: ${prod.lhs} → ε`,
        category: 'EPSILON',
        grammarRule: `${prod.lhs} → ε`,
        nfaAction: `Mark state ${prod.lhs} as an Accepting / Final State (${prod.lhs} ∈ F)`,
        nfaActionHi: `स्टेट ${prod.lhs} को अंतिम/स्वीकार्य स्टेट बनाएं (${prod.lhs} ∈ F)`,
        descriptionEn: `For the empty-string rule "${prod.lhs} → ε", state "${prod.lhs}" can accept the string directly without reading any more input. Thus, "${prod.lhs}" is marked as a Final state.`,
        descriptionHi: `खाली स्ट्रिंग नियम "${prod.lhs} → ε" के लिए, स्टेट "${prod.lhs}" बिना कोई इनपुट पढ़े स्वीकार कर सकता है। अतः "${prod.lhs}" को अंतिम स्टेट चिन्हित किया जाता है।`,
        highlightStates: [prod.lhs],
      });
    }
  }

  const finalStates = Array.from(finalStatesSet);

  // Final Step: Complete NFA Summary
  steps.push({
    id: `step-${stepCount}`,
    stepNumber: stepCount++,
    title: 'NFA Construction Complete',
    titleHi: 'NFA निर्माण पूर्ण हुआ',
    category: 'COMPLETE',
    descriptionEn: `Complete NFA: States Q = {${states.join(', ')}}, Start q₀ = ${grammar.startVariable}, Final F = {${finalStates.join(', ')}}, Alphabet Σ = {${grammar.terminals.join(', ')}}.`,
    descriptionHi: `पूर्ण NFA: स्टेट्स Q = {${states.join(', ')}}, प्रारंभ q₀ = ${grammar.startVariable}, अंतिम F = {${finalStates.join(', ')}}, वर्णमाला Σ = {${grammar.terminals.join(', ')}}।`,
    highlightStates: states,
  });

  const nfa: NFA = {
    states,
    alphabet: grammar.terminals,
    startState: grammar.startVariable,
    finalStates,
    transitions,
    hasGeneratedFinalState: hasTerminalOnly,
    generatedFinalStateName: dummyFinalState,
  };

  return { nfa, steps };
}

/**
 * Builds the matrix transition table mapping:
 * State -> { symbol: Set<TargetStates> }
 */
export function buildTransitionMatrix(nfa: NFA): {
  columns: string[]; // alphabet symbols plus 'ε' if present
  rows: {
    state: string;
    isStart: boolean;
    isFinal: boolean;
    cells: Record<string, string[]>;
  }[];
} {
  const hasEpsilon = nfa.transitions.some(t => t.symbol === 'ε');
  const columns = [...nfa.alphabet];
  if (hasEpsilon && !columns.includes('ε')) {
    columns.push('ε');
  }

  const rows = nfa.states.map(state => {
    const isStart = state === nfa.startState;
    const isFinal = nfa.finalStates.includes(state);
    const cells: Record<string, string[]> = {};

    for (const col of columns) {
      cells[col] = [];
    }

    for (const t of nfa.transitions) {
      if (t.from === state) {
        if (!cells[t.symbol]) {
          cells[t.symbol] = [];
        }
        if (!cells[t.symbol].includes(t.to)) {
          cells[t.symbol].push(t.to);
        }
      }
    }

    return {
      state,
      isStart,
      isFinal,
      cells,
    };
  });

  return { columns, rows };
}

/**
 * Generates CSV content from the NFA Transition Table
 */
export function generateTransitionTableCSV(nfa: NFA): string {
  const matrix = buildTransitionMatrix(nfa);
  const header = ['State', 'Is Start', 'Is Final', ...matrix.columns];
  
  const csvRows: string[] = [header.join(',')];

  for (const row of matrix.rows) {
    const stateLabel = (row.isStart ? '-> ' : '') + (row.isFinal ? '* ' : '') + row.state;
    const rowValues = [
      `"${stateLabel}"`,
      row.isStart ? 'Yes' : 'No',
      row.isFinal ? 'Yes' : 'No',
      ...matrix.columns.map(col => {
        const dests = row.cells[col];
        if (!dests || dests.length === 0) return '"—"';
        return `"{${dests.join(', ')}}"`;
      }),
    ];
    csvRows.push(rowValues.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Triggers an actual browser download for the Transition Table CSV
 */
export function downloadCSV(nfa: NFA, filename = 'nfa_transition_table.csv') {
  const csvContent = generateTransitionTableCSV(nfa);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
