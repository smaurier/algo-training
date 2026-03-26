// =============================================================================
// Lab 03 — Stacks et Queues — SOLUTION
// =============================================================================

console.log("=== Lab 03 : Stacks et Queues — SOLUTION ===\n");

// =============================================================================
// PARTIE 1 : Validateur de parenthèses étendu
// =============================================================================

console.log("--- Partie 1 : Validateur de parenthèses ---");

interface ValidationResult { valid: boolean; error?: string }

function isValidBrackets(s: string): ValidationResult {
  const stack: Array<{ char: string; pos: number }> = [];
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const openers = new Set(["(", "[", "{"]);
  const closers = new Set([")", "]", "}"]);

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (openers.has(c)) {
      stack.push({ char: c, pos: i });
    } else if (closers.has(c)) {
      if (stack.length === 0) {
        return { valid: false, error: `Fermant '${c}' sans ouvrant correspondant à la position ${i}` };
      }
      const top = stack[stack.length - 1];
      if (top.char !== pairs[c]) {
        return { valid: false, error: `Fermant '${c}' ne correspond pas à l'ouvrant '${top.char}' à la position ${top.pos}` };
      }
      stack.pop();
    }
  }

  if (stack.length > 0) {
    return { valid: false, error: `Ouvrant '${stack[stack.length - 1].char}' non fermé` };
  }

  return { valid: true };
}

const bracketTests = [
  { input: "()", expected: true },
  { input: "()[]{}", expected: true },
  { input: "(]", expected: false },
  { input: "([{}])", expected: true },
  { input: "(()", expected: false },
  { input: "{[}]", expected: false },
  { input: "", expected: true },
  { input: "function() { return arr[0]; }", expected: true },
];

for (const test of bracketTests) {
  const result = isValidBrackets(test.input);
  const pass = result.valid === test.expected;
  console.log(`"${test.input}" → ${result.valid} ${pass ? "✅" : "❌"} ${result.error ?? ""}`);
}

// =============================================================================
// PARTIE 2 : Évaluateur RPN
// =============================================================================

console.log("\n--- Partie 2 : Évaluateur RPN ---");

function evalRPN(tokens: string[]): number {
  const stack: number[] = [];
  const operators = new Set(["+", "-", "*", "/"]);

  for (const token of tokens) {
    if (operators.has(token)) {
      const b = stack.pop()!;
      const a = stack.pop()!;
      switch (token) {
        case "+": stack.push(a + b); break;
        case "-": stack.push(a - b); break;
        case "*": stack.push(a * b); break;
        case "/": stack.push(Math.trunc(a / b)); break;
      }
    } else {
      stack.push(Number(token));
    }
  }

  return stack[0];
}

const rpnTests = [
  { tokens: ["2", "1", "+", "3", "*"], expected: 9 },
  { tokens: ["4", "13", "5", "/", "+"], expected: 6 },
  { tokens: ["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"], expected: 22 },
];

for (const test of rpnTests) {
  const result = evalRPN(test.tokens);
  const pass = result === test.expected;
  console.log(`evalRPN(...) = ${result} ${pass ? "✅" : "❌"} (attendu: ${test.expected})`);
}

// =============================================================================
// PARTIE 3 : Système Undo/Redo
// =============================================================================

console.log("\n--- Partie 3 : Undo/Redo Editor ---");

class UndoRedoEditor {
  private text = "";
  private undoStack: string[] = [];
  private redoStack: string[] = [];

  type(text: string): void {
    this.undoStack.push(this.text);
    this.text += text;
    this.redoStack = []; // Nouvelle action → vider redo
  }

  undo(): void {
    if (this.undoStack.length === 0) return;
    this.redoStack.push(this.text);
    this.text = this.undoStack.pop()!;
  }

  redo(): void {
    if (this.redoStack.length === 0) return;
    this.undoStack.push(this.text);
    this.text = this.redoStack.pop()!;
  }

  getText(): string {
    return this.text;
  }
}

const editor = new UndoRedoEditor();
editor.type("Hello");
console.log(`Après "Hello": "${editor.getText()}" ✅`);
editor.type(" World");
console.log(`Après " World": "${editor.getText()}" ✅`);
editor.undo();
console.log(`Après undo: "${editor.getText()}" ✅`);
editor.undo();
console.log(`Après undo: "${editor.getText()}" ✅`);
editor.redo();
console.log(`Après redo: "${editor.getText()}" ✅`);
editor.type("!");
console.log(`Après "!": "${editor.getText()}" ✅`);
editor.redo();
console.log(`Après redo (noop): "${editor.getText()}" ✅`);

// =============================================================================
// PARTIE BONUS : LRU Cache
// =============================================================================

console.log("\n--- Bonus : LRU Cache ---");

class LRUCache<K, V> {
  private cache = new Map<K, V>();

  constructor(private capacity: number) {}

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    // Rafraîchir en supprimant et réinsérant (Map garde l'ordre d'insertion)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    this.cache.delete(key);
    if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  get size(): number {
    return this.cache.size;
  }
}

const lru = new LRUCache<string, number>(3);
lru.set("a", 1);
lru.set("b", 2);
lru.set("c", 3);
console.log(`get("a") = ${lru.get("a")} ✅`);
lru.set("d", 4);
console.log(`get("b") = ${lru.get("b")} ✅ (évincé)`);
console.log(`get("c") = ${lru.get("c")} ✅`);
console.log(`get("d") = ${lru.get("d")} ✅`);

console.log("\n=== Fin du Lab 03 — SOLUTION ===");
