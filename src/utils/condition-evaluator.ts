/**
 * Safe condition evaluator without using eval()
 */
export class ConditionEvaluator {
  private context: Record<string, any>;

  constructor(context: Record<string, any>) {
    this.context = context;
  }

  /**
   * Evaluate a condition expression safely
   */
  evaluate(expression: string): boolean {
    // Remove whitespace
    expression = expression.trim();

    // Handle simple boolean values
    if (expression === 'true') return true;
    if (expression === 'false') return false;

    // Handle negation
    if (expression.startsWith('!')) {
      return !this.evaluate(expression.substring(1));
    }

    // Handle parentheses
    if (expression.startsWith('(') && expression.endsWith(')')) {
      return this.evaluate(expression.slice(1, -1));
    }

    // Handle AND operations
    if (expression.includes('&&')) {
      const parts = this.splitByOperator(expression, '&&');
      return parts.every(part => this.evaluate(part));
    }

    // Handle OR operations
    if (expression.includes('||')) {
      const parts = this.splitByOperator(expression, '||');
      return parts.some(part => this.evaluate(part));
    }

    // Handle comparisons
    if (expression.includes('===')) {
      const [left, right] = this.splitByOperator(expression, '===');
      return this.getValue(left) === this.getValue(right);
    }

    if (expression.includes('!==')) {
      const [left, right] = this.splitByOperator(expression, '!==');
      return this.getValue(left) !== this.getValue(right);
    }

    if (expression.includes('==')) {
      const [left, right] = this.splitByOperator(expression, '==');
      return this.getValue(left) == this.getValue(right);
    }

    if (expression.includes('!=')) {
      const [left, right] = this.splitByOperator(expression, '!=');
      return this.getValue(left) != this.getValue(right);
    }

    // Simple variable lookup
    return Boolean(this.getValue(expression));
  }

  /**
   * Split expression by operator, respecting parentheses
   */
  private splitByOperator(expression: string, operator: string): string[] {
    const parts: string[] = [];
    let current = '';
    let depth = 0;
    let i = 0;

    while (i < expression.length) {
      if (expression[i] === '(') {
        depth++;
      } else if (expression[i] === ')') {
        depth--;
      } else if (depth === 0 && expression.substring(i, i + operator.length) === operator) {
        parts.push(current.trim());
        current = '';
        i += operator.length - 1;
      } else {
        current += expression[i];
      }
      i++;
    }

    if (current) {
      parts.push(current.trim());
    }

    return parts;
  }

  /**
   * Get value from context or parse as literal
   */
  private getValue(key: string): any {
    key = key.trim();

    // Remove quotes if string literal
    if ((key.startsWith('"') && key.endsWith('"')) || 
        (key.startsWith("'") && key.endsWith("'"))) {
      return key.slice(1, -1);
    }

    // Check if it's a number
    const num = Number(key);
    if (!isNaN(num)) {
      return num;
    }

    // Check if it's a boolean
    if (key === 'true') return true;
    if (key === 'false') return false;
    if (key === 'null') return null;
    if (key === 'undefined') return undefined;

    // Look up in context
    return this.context[key];
  }
}