// =============================================================================
// Lab 09 — Programmation dynamique — Solutions
// =============================================================================
// Exécuter avec : npx tsx solution.ts
// =============================================================================

console.log("=== Lab 09 : Programmation dynamique — Solutions ===\n");

// =============================================================================
// PARTIE 1 : Coin Change
// =============================================================================

console.log("--- Partie 1 : Coin Change ---");

function coinChange(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1;
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log("coins=[1,5,10,25] amount=36:", coinChange([1, 5, 10, 25], 36));
console.log("coins=[2] amount=3:", coinChange([2], 3));

// =============================================================================
// PARTIE 2 : Knapsack 0/1
// =============================================================================

console.log("\n--- Partie 2 : Knapsack 0/1 ---");

interface Item { name: string; weight: number; value: number }

function knapsack(items: Item[], capacity: number): { maxValue: number; chosen: string[] } {
  const n = items.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w]; // ne pas prendre
      if (item.weight <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - item.weight] + item.value);
      }
    }
  }

  // Reconstruction
  const chosen: string[] = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      chosen.push(items[i - 1].name);
      w -= items[i - 1].weight;
    }
  }

  return { maxValue: dp[n][capacity], chosen: chosen.reverse() };
}

const items: Item[] = [
  { name: "Laptop", weight: 3, value: 2000 },
  { name: "Camera", weight: 1, value: 1500 },
  { name: "Book", weight: 1, value: 500 },
  { name: "Headphones", weight: 1, value: 300 },
  { name: "Tablet", weight: 2, value: 1200 },
];

const result = knapsack(items, 4);
console.log(`Max value: $${result.maxValue}, Items: [${result.chosen.join(", ")}]`);

// =============================================================================
// PARTIE 3 : LCS (Longest Common Subsequence)
// =============================================================================

console.log("\n--- Partie 3 : LCS ---");

function lcs(s1: string, s2: string): { length: number; sequence: string } {
  const m = s1.length, n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Reconstruction
  let seq = "";
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (s1[i - 1] === s2[j - 1]) {
      seq = s1[i - 1] + seq;
      i--; j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return { length: dp[m][n], sequence: seq };
}

const { length, sequence } = lcs("ABCBDAB", "BDCAB");
console.log(`LCS length: ${length}, sequence: "${sequence}"`);

// =============================================================================
// PARTIE BONUS : Chemins dans une grille avec obstacles
// =============================================================================

console.log("\n--- Bonus : Unique Paths avec obstacles ---");

function uniquePaths(grid: number[][]): number {
  const m = grid.length, n = grid[0].length;
  if (grid[0][0] === 1 || grid[m - 1][n - 1] === 1) return 0;

  const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  dp[0][0] = 1;

  // Première ligne
  for (let c = 1; c < n; c++) {
    dp[0][c] = grid[0][c] === 1 ? 0 : dp[0][c - 1];
  }

  // Première colonne
  for (let r = 1; r < m; r++) {
    dp[r][0] = grid[r][0] === 1 ? 0 : dp[r - 1][0];
  }

  // Remplir le reste
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      dp[r][c] = grid[r][c] === 1 ? 0 : dp[r - 1][c] + dp[r][c - 1];
    }
  }

  return dp[m - 1][n - 1];
}

const grid = [
  [0, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 1, 0],
];

console.log("Chemins:", uniquePaths(grid));

console.log("\n=== Fin du Lab 09 ===");
