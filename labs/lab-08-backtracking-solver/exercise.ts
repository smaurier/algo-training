// =============================================================================
// Lab 08 — Backtracking Solver
// =============================================================================
// Exécuter avec : npx tsx exercise.ts
// =============================================================================

console.log("=== Lab 08 : Backtracking Solver ===\n");

// =============================================================================
// PARTIE 1 : Permutations
// =============================================================================

console.log("--- Partie 1 : Permutations ---");

function permutations(nums: number[]): number[][] {
  // TODO : Retourner toutes les permutations de nums
  // Pattern : choose → explore → unchoose
  // Utilisez un booléen used[] pour marquer les éléments utilisés
  // Base case : si le chemin actuel a la même taille que nums → ajouter une copie

  const result: number[][] = [];

  // TODO : votre code ici

  return result;
}

console.log("Permutations de [1,2,3]:", permutations([1, 2, 3]));
console.log(`Count: ${permutations([1, 2, 3]).length} (attendu: 6)`);

// =============================================================================
// PARTIE 2 : Combination Sum
// =============================================================================

console.log("\n--- Partie 2 : Combination Sum ---");

function combinationSum(candidates: number[], target: number): number[][] {
  // TODO : Trouver toutes les combinaisons qui totalisent target
  // Un candidat peut être réutilisé plusieurs fois
  // Triez les candidats d'abord pour pouvoir couper les branches (if sum > target: break)
  // Utilisez un index de départ pour éviter les doublons

  const result: number[][] = [];

  // TODO : votre code ici

  return result;
}

console.log("Combinations(2,3,6,7) → 7:", combinationSum([2, 3, 6, 7], 7));
// Attendu : [[2,2,3], [7]]

console.log("Combinations(2,3,5) → 8:", combinationSum([2, 3, 5], 8));
// Attendu : [[2,2,2,2], [2,3,3], [3,5]]

// =============================================================================
// PARTIE 3 : Sudoku Solver
// =============================================================================

console.log("\n--- Partie 3 : Sudoku Solver ---");

type Board = number[][];

function solveSudoku(board: Board): boolean {
  // TODO : Résoudre le Sudoku en place par backtracking
  // 1. Trouver la prochaine case vide (valeur 0)
  // 2. Essayer les chiffres 1-9
  // 3. Vérifier si le chiffre est valide (isValid)
  // 4. Si valide, placer et récurser
  // 5. Si la récursion échoue, backtrack (remettre à 0)
  // 6. Si aucune case vide → résolu (retourner true)

  return false;
}

function isValid(board: Board, row: number, col: number, num: number): boolean {
  // TODO : Vérifier si num peut être placé à (row, col)
  // Vérifier : ligne, colonne, bloc 3×3

  return false;
}

const sudoku: Board = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const solved = solveSudoku(sudoku);
console.log("Résolu:", solved);
if (solved) {
  console.log("Grille:");
  sudoku.forEach(row => console.log(row.join(" ")));
}

// =============================================================================
// PARTIE BONUS : Parenthèses valides
// =============================================================================

console.log("\n--- Bonus : Parenthèses valides ---");

function generateParentheses(n: number): string[] {
  // TODO : Générer toutes les parenthèses valides pour n paires
  // Gardez un compteur open et close
  // - Si open < n → on peut ajouter "("
  // - Si close < open → on peut ajouter ")"
  // Base case : si current.length === 2*n → ajouter au résultat

  return [];
}

console.log("n=3:", generateParentheses(3));
// Attendu : ["((()))", "(()())", "(())()", "()(())", "()()()"]

console.log("\n=== Fin du Lab 08 ===");
