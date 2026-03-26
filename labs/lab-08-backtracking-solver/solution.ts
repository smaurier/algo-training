// =============================================================================
// Lab 08 — Backtracking Solver — Solutions
// =============================================================================
// Exécuter avec : npx tsx solution.ts
// =============================================================================

console.log("=== Lab 08 : Backtracking Solver — Solutions ===\n");

// =============================================================================
// PARTIE 1 : Permutations
// =============================================================================

console.log("--- Partie 1 : Permutations ---");

function permutations(nums: number[]): number[][] {
  const result: number[][] = [];
  const used = new Array(nums.length).fill(false);

  function backtrack(path: number[]) {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      backtrack(path);
      path.pop();
      used[i] = false;
    }
  }

  backtrack([]);
  return result;
}

console.log("Permutations de [1,2,3]:", permutations([1, 2, 3]));
console.log(`Count: ${permutations([1, 2, 3]).length}`);

// =============================================================================
// PARTIE 2 : Combination Sum
// =============================================================================

console.log("\n--- Partie 2 : Combination Sum ---");

function combinationSum(candidates: number[], target: number): number[][] {
  const result: number[][] = [];
  candidates.sort((a, b) => a - b);

  function backtrack(start: number, path: number[], sum: number) {
    if (sum === target) {
      result.push([...path]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (sum + candidates[i] > target) break; // pruning
      path.push(candidates[i]);
      backtrack(i, path, sum + candidates[i]); // i, pas i+1 — réutilisation
      path.pop();
    }
  }

  backtrack(0, [], 0);
  return result;
}

console.log("Combinations(2,3,6,7) → 7:", combinationSum([2, 3, 6, 7], 7));
console.log("Combinations(2,3,5) → 8:", combinationSum([2, 3, 5], 8));

// =============================================================================
// PARTIE 3 : Sudoku Solver
// =============================================================================

console.log("\n--- Partie 3 : Sudoku Solver ---");

type Board = number[][];

function isValid(board: Board, row: number, col: number, num: number): boolean {
  // Vérifier la ligne
  for (let j = 0; j < 9; j++) {
    if (board[row][j] === num) return false;
  }
  // Vérifier la colonne
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) return false;
  }
  // Vérifier le bloc 3×3
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = boxRow; i < boxRow + 3; i++) {
    for (let j = boxCol; j < boxCol + 3; j++) {
      if (board[i][j] === num) return false;
    }
  }
  return true;
}

function solveSudoku(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== 0) continue;

      for (let num = 1; num <= 9; num++) {
        if (isValid(board, row, col, num)) {
          board[row][col] = num;
          if (solveSudoku(board)) return true;
          board[row][col] = 0; // backtrack
        }
      }
      return false; // aucun chiffre valide → backtrack
    }
  }
  return true; // plus de cases vides → résolu
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
  const result: string[] = [];

  function backtrack(current: string, open: number, close: number) {
    if (current.length === 2 * n) {
      result.push(current);
      return;
    }
    if (open < n) backtrack(current + "(", open + 1, close);
    if (close < open) backtrack(current + ")", open, close + 1);
  }

  backtrack("", 0, 0);
  return result;
}

console.log("n=3:", generateParentheses(3));

console.log("\n=== Fin du Lab 08 ===");
