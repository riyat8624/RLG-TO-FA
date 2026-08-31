import { Grammar, ProductionRule, ProductionType } from '../types';

/**
 * Normalizes symbols and representations
 */
export function normalizeEpsilon(symbol: string): string {
  const s = symbol.trim().toLowerCase();
  if (s === 'ε' || s === 'epsilon' || s === 'eps' || s === 'λ' || s === 'lambda' || s === '^' || s === '') {
    return 'ε';
  }
  return symbol.trim();
}

/**
 * Parses Right-Linear Grammar text into a structured Grammar object.
 * 
 * Supports:
 * - A → aB
 * - A → a
 * - A → ε / epsilon
 * - A -> aB | bC | c | epsilon
 * - Comments (# or //)
 * - Trailing/leading whitespaces
 */
export function parseRLG(input: string): Grammar {
  const lines = input.split('\n');
  const productions: ProductionRule[] = [];
  const variablesSet = new Set<string>();
  const terminalsSet = new Set<string>();
  const errors: string[] = [];
  let startVariable = '';

  let ruleIndex = 0;

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    let line = lines[lineNum].trim();

    // Skip empty lines or comment lines
    if (!line || line.startsWith('#') || line.startsWith('//')) {
      continue;
    }

    // Split by arrow (support ->, →, =>, \to)
    const arrowMatch = line.match(/(->|→|=>|\\to)/);
    if (!arrowMatch) {
      errors.push(`Line ${lineNum + 1}: Missing arrow (-> or →) in "${line}"`);
      continue;
    }

    const arrow = arrowMatch[0];
    const parts = line.split(arrow);
    if (parts.length !== 2) {
      errors.push(`Line ${lineNum + 1}: Multiple arrows detected in "${line}"`);
      continue;
    }

    const lhs = parts[0].trim();
    const rhsPart = parts[1].trim();

    if (!lhs) {
      errors.push(`Line ${lineNum + 1}: Missing Left-Hand Side variable`);
      continue;
    }

    // LHS in RLG must be a single non-terminal variable (e.g. S, A, B, S0)
    if (!/^[A-Z][a-zA-Z0-9_]*$/.test(lhs) && !/^[A-Z]$/.test(lhs)) {
      errors.push(`Line ${lineNum + 1}: Left-Hand Side "${lhs}" should be a Variable (uppercase letter, e.g. S, A)`);
    }

    if (!startVariable) {
      startVariable = lhs;
    }
    variablesSet.add(lhs);

    // Split RHS alternatives by |
    const alternatives = rhsPart.split('|').map(a => a.trim()).filter(a => a.length > 0 || rhsPart.includes('ε') || rhsPart.includes('epsilon'));

    if (alternatives.length === 0) {
      errors.push(`Line ${lineNum + 1}: Empty Right-Hand Side for variable ${lhs}`);
      continue;
    }

    for (const alt of alternatives) {
      ruleIndex++;
      const cleanAlt = alt.trim();
      const normAlt = normalizeEpsilon(cleanAlt);

      // Case 1: Epsilon transition (A -> ε or A -> epsilon)
      if (normAlt === 'ε') {
        productions.push({
          id: `rule-${ruleIndex}`,
          lhs,
          rhs: 'ε',
          symbol: 'ε',
          targetVar: null,
          type: 'epsilon',
          raw: `${lhs} → ε`,
          lineNumber: lineNum + 1,
        });
        continue;
      }

      // Case 2: A -> aB (terminal followed by variable)
      // Matches a terminal (lowercase letter, digit, or special char) followed by a Variable (uppercase)
      const varTargetMatch = cleanAlt.match(/^([^A-Z\s]+)?([A-Z][a-zA-Z0-9_]*)$/);
      
      if (varTargetMatch && varTargetMatch[1]) {
        const term = varTargetMatch[1].trim();
        const targetVar = varTargetMatch[2].trim();
        terminalsSet.add(term);
        variablesSet.add(targetVar);

        productions.push({
          id: `rule-${ruleIndex}`,
          lhs,
          rhs: cleanAlt,
          symbol: term,
          targetVar,
          type: 'variable_target',
          raw: `${lhs} → ${cleanAlt}`,
          lineNumber: lineNum + 1,
        });
        continue;
      }

      // Case 3: Unit production A -> B (where target is just variable, treated as A -> ε B)
      if (varTargetMatch && !varTargetMatch[1]) {
        const targetVar = varTargetMatch[2].trim();
        variablesSet.add(targetVar);
        productions.push({
          id: `rule-${ruleIndex}`,
          lhs,
          rhs: cleanAlt,
          symbol: 'ε',
          targetVar,
          type: 'variable_target',
          raw: `${lhs} → ε${cleanAlt}`,
          lineNumber: lineNum + 1,
        });
        continue;
      }

      // Case 4: A -> a (terminal only, no target variable)
      // Terminal is anything without an uppercase variable at the end
      terminalsSet.add(cleanAlt);
      productions.push({
        id: `rule-${ruleIndex}`,
        lhs,
        rhs: cleanAlt,
        symbol: cleanAlt,
        targetVar: null,
        type: 'terminal_only',
        raw: `${lhs} → ${cleanAlt}`,
        lineNumber: lineNum + 1,
      });
    }
  }

  // Ensure start variable exists
  if (!startVariable && variablesSet.size > 0) {
    startVariable = Array.from(variablesSet)[0];
  }

  const variables = Array.from(variablesSet);
  const terminals = Array.from(terminalsSet).filter(t => t !== 'ε');

  const isValid = errors.length === 0 && productions.length > 0 && !!startVariable;

  if (productions.length === 0 && errors.length === 0 && input.trim()) {
    errors.push('No valid production rules found. Format: S → aA | b');
  }

  return {
    rawText: input,
    variables,
    terminals,
    startVariable,
    productions,
    isValid,
    errors,
  };
}

/**
 * Format grammar nicely for export/view
 */
export function formatGrammar(grammar: Grammar): string {
  const grouped = new Map<string, string[]>();
  for (const p of grammar.productions) {
    if (!grouped.has(p.lhs)) {
      grouped.set(p.lhs, []);
    }
    grouped.get(p.lhs)!.push(p.rhs);
  }

  const lines: string[] = [];
  for (const [v, rhsList] of grouped.entries()) {
    lines.push(`${v} → ${rhsList.join(' | ')}`);
  }
  return lines.join('\n');
}
