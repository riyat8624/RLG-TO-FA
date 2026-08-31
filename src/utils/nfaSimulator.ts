import { NFA, SimulationResult, SimulationStep } from '../types';

/**
 * Computes the ε-closure of a set of states
 */
export function getEpsilonClosure(states: string[], nfa: NFA): string[] {
  const closure = new Set<string>(states);
  const queue = [...states];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    for (const t of nfa.transitions) {
      if (t.from === curr && (t.symbol === 'ε' || t.symbol === 'epsilon' || t.symbol === '')) {
        if (!closure.has(t.to)) {
          closure.add(t.to);
          queue.push(t.to);
        }
      }
    }
  }

  return Array.from(closure);
}

/**
 * Simulates an NFA on an input string
 * Supports non-deterministic multiple active states and ε-transitions
 */
export function simulateNFA(nfa: NFA, rawInput: string): SimulationResult {
  if (!nfa.startState || nfa.states.length === 0) {
    return {
      inputString: rawInput,
      isAccepted: false,
      steps: [],
      allPaths: [],
      finalStates: [],
      message: 'NFA is not initialized or has no start state.',
    };
  }

  const input = rawInput.trim();
  const steps: SimulationStep[] = [];

  // Initial state with epsilon closure
  let currentStates = getEpsilonClosure([nfa.startState], nfa);
  let isAcceptedAtStep = currentStates.some(s => nfa.finalStates.includes(s));

  steps.push({
    stepIndex: 0,
    consumedChar: null,
    remainingString: input,
    currentStates: [...currentStates],
    transitionsTaken: [],
    isFinalStateActive: isAcceptedAtStep,
  });

  // If input is empty string
  if (input === '' || input === 'ε' || input === 'epsilon') {
    const accepted = currentStates.some(s => nfa.finalStates.includes(s));
    return {
      inputString: input || 'ε',
      isAccepted: accepted,
      steps,
      allPaths: currentStates.map(s => ({
        path: [{ state: s }],
        isAccepted: nfa.finalStates.includes(s),
      })),
      finalStates: currentStates.filter(s => nfa.finalStates.includes(s)),
      message: accepted
        ? 'Empty string ε is ACCEPTED (Start state reaches an accepting state via ε).'
        : 'Empty string ε is REJECTED (Start state is not an accepting state).',
    };
  }

  // Step through each character
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const nextStatesSet = new Set<string>();
    const transitionsTaken: { from: string; symbol: string; to: string }[] = [];

    for (const st of currentStates) {
      for (const t of nfa.transitions) {
        if (t.from === st && t.symbol === char) {
          nextStatesSet.add(t.to);
          transitionsTaken.push({ from: t.from, symbol: t.symbol, to: t.to });
        }
      }
    }

    // Apply epsilon closure on all reachable next states
    const closedNextStates = getEpsilonClosure(Array.from(nextStatesSet), nfa);
    currentStates = closedNextStates;
    isAcceptedAtStep = currentStates.some(s => nfa.finalStates.includes(s));

    steps.push({
      stepIndex: i + 1,
      consumedChar: char,
      remainingString: input.slice(i + 1),
      currentStates: [...currentStates],
      transitionsTaken,
      isFinalStateActive: isAcceptedAtStep,
    });

    // If no states are active (dead state / trap)
    if (currentStates.length === 0) {
      break;
    }
  }

  const isAccepted = currentStates.some(s => nfa.finalStates.includes(s)) && steps.length === input.length + 1;
  const activeFinals = currentStates.filter(s => nfa.finalStates.includes(s));

  let message = '';
  if (isAccepted) {
    message = `String "${input}" is ACCEPTED. Final active accepting state(s): {${activeFinals.join(', ')}}.`;
  } else if (currentStates.length === 0) {
    message = `String "${input}" is REJECTED. Simulation reached a trap / dead state with no valid transitions.`;
  } else {
    message = `String "${input}" is REJECTED. Ended in states {${currentStates.join(', ')}}, none of which are in final states {${nfa.finalStates.join(', ')}}.`;
  }

  return {
    inputString: input,
    isAccepted,
    steps,
    allPaths: currentStates.map(s => ({
      path: [{ state: s }],
      isAccepted: nfa.finalStates.includes(s),
    })),
    finalStates: activeFinals,
    message,
  };
}
