// =============================================================================
// Lab 03 — Stacks et Queues
// =============================================================================
// Exécuter avec : npx tsx exercise.ts
// =============================================================================

console.log("=== Lab 03 : Stacks et Queues ===\n");

// =============================================================================
// PARTIE 1 : Validateur de parenthèses étendu
// =============================================================================

console.log("--- Partie 1 : Validateur de parenthèses ---");

interface ValidationResult {
  valid: boolean;
  error?: string; // message d'erreur si invalide
}

function isValidBrackets(s: string): ValidationResult {
  // TODO : Implémentez cette fonction avec une stack
  // Supportez : () [] {}
  // Retournez { valid: true } si OK
  // Retournez { valid: false, error: "..." } avec un message descriptif sinon
  // Messages possibles :
  //   "Fermant '}' sans ouvrant correspondant à la position X"
  //   "Ouvrant '(' non fermé"
  //   "Fermant ']' ne correspond pas à l'ouvrant '(' à la position X"

  return { valid: false, error: "Non implémenté" }; // À modifier
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
// PARTIE 2 : Évaluateur RPN (Reverse Polish Notation)
// =============================================================================

console.log("\n--- Partie 2 : Évaluateur RPN ---");

function evalRPN(tokens: string[]): number {
  // TODO : Implémentez cette fonction avec une stack
  // Parcourez les tokens :
  //   - Si c'est un nombre, empiler
  //   - Si c'est un opérateur (+, -, *, /), dépiler 2 opérandes, calculer, empiler le résultat
  // Attention : pour la division, tronquer vers zéro (Math.trunc)
  // Retournez le résultat final (dernier élément de la stack)

  return 0; // À modifier
}

const rpnTests = [
  { tokens: ["2", "1", "+", "3", "*"], expected: 9 },     // (2+1)*3 = 9
  { tokens: ["4", "13", "5", "/", "+"], expected: 6 },    // 4+(13/5) = 4+2 = 6
  { tokens: ["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"], expected: 22 },
];

for (const test of rpnTests) {
  const result = evalRPN(test.tokens);
  const pass = result === test.expected;
  console.log(`evalRPN(${JSON.stringify(test.tokens)}) = ${result} ${pass ? "✅" : "❌"} (attendu: ${test.expected})`);
}

// =============================================================================
// PARTIE 3 : Système Undo/Redo
// =============================================================================

console.log("\n--- Partie 3 : Undo/Redo Editor ---");

class UndoRedoEditor {
  // TODO : Implémentez cette classe
  // Propriétés suggérées :
  //   - text: string (état courant)
  //   - undoStack: string[] (états précédents)
  //   - redoStack: string[] (états annulés)

  constructor() {
    // TODO
  }

  type(text: string): void {
    // TODO : Ajouter du texte à la fin
    // Sauvegarder l'état précédent dans undoStack
    // Vider redoStack (une nouvelle action invalide l'historique de redo)
  }

  undo(): void {
    // TODO : Revenir à l'état précédent
    // Déplacer l'état courant dans redoStack
    // Restaurer le dernier état de undoStack
  }

  redo(): void {
    // TODO : Ré-appliquer la dernière action annulée
    // Sauvegarder l'état courant dans undoStack
    // Restaurer le dernier état de redoStack
  }

  getText(): string {
    return ""; // À modifier
  }
}

const editor = new UndoRedoEditor();
editor.type("Hello");
console.log(`Après "Hello": "${editor.getText()}" ${editor.getText() === "Hello" ? "✅" : "❌"}`);

editor.type(" World");
console.log(`Après " World": "${editor.getText()}" ${editor.getText() === "Hello World" ? "✅" : "❌"}`);

editor.undo();
console.log(`Après undo: "${editor.getText()}" ${editor.getText() === "Hello" ? "✅" : "❌"}`);

editor.undo();
console.log(`Après undo: "${editor.getText()}" ${editor.getText() === "" ? "✅" : "❌"}`);

editor.redo();
console.log(`Après redo: "${editor.getText()}" ${editor.getText() === "Hello" ? "✅" : "❌"}`);

editor.type("!");
console.log(`Après "!": "${editor.getText()}" ${editor.getText() === "Hello!" ? "✅" : "❌"}`);

editor.redo(); // Devrait ne rien faire (redo vidé par la nouvelle action)
console.log(`Après redo (noop): "${editor.getText()}" ${editor.getText() === "Hello!" ? "✅" : "❌"}`);

// =============================================================================
// PARTIE BONUS : LRU Cache
// =============================================================================

console.log("\n--- Bonus : LRU Cache ---");

class LRUCache<K, V> {
  // TODO : Implémentez cette classe
  // Utilisez une Map JavaScript (qui maintient l'ordre d'insertion)
  // get(key) : retourne la valeur et rafraîchit la position
  // set(key, value) : ajoute/met à jour et évince le plus ancien si capacité dépassée

  constructor(private capacity: number) {
    // TODO
  }

  get(key: K): V | undefined {
    return undefined; // À modifier
  }

  set(key: K, value: V): void {
    // TODO
  }

  get size(): number {
    return 0; // À modifier
  }
}

const lru = new LRUCache<string, number>(3);
lru.set("a", 1);
lru.set("b", 2);
lru.set("c", 3);
console.log(`get("a") = ${lru.get("a")} ${lru.get("a") === 1 ? "✅" : "❌"}`);

lru.set("d", 4); // Devrait évincer "b" (le moins récemment utilisé, car "a" a été accédé)
console.log(`get("b") = ${lru.get("b")} ${lru.get("b") === undefined ? "✅" : "❌"} (évincé)`);
console.log(`get("c") = ${lru.get("c")} ${lru.get("c") === 3 ? "✅" : "❌"}`);
console.log(`get("d") = ${lru.get("d")} ${lru.get("d") === 4 ? "✅" : "❌"}`);

console.log("\n=== Fin du Lab 03 ===");
