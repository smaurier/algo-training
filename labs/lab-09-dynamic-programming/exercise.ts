// =============================================================================
// Lab 09 — Programmation dynamique
// =============================================================================
// Exécuter avec : npx tsx exercise.ts
// =============================================================================

console.log("=== Lab 09 : Programmation dynamique ===\n");

// =============================================================================
// PARTIE 1 : Coin Change
// =============================================================================

console.log("--- Partie 1 : Coin Change ---");

function coinChange(coins: number[], amount: number): number {
  // TODO : Retourner le nombre minimum de pièces pour atteindre amount
  // Tabulation bottom-up :
  // dp[i] = nombre minimum de pièces pour le montant i
  // dp[0] = 0, dp[i] = Infinity initialement
  // Pour chaque montant i de 1 à amount :
  //   Pour chaque pièce : dp[i] = min(dp[i], dp[i - coin] + 1)
  // Retourner dp[amount] si dp[amount] !== Infinity, sinon -1

  return -1;
}

console.log("coins=[1,5,10,25] amount=36:", coinChange([1, 5, 10, 25], 36));
// Attendu : 3 (25 + 10 + 1)
console.log("coins=[2] amount=3:", coinChange([2], 3));
// Attendu : -1

// =============================================================================
// PARTIE 2 : Knapsack 0/1
// =============================================================================

console.log("\n--- Partie 2 : Knapsack 0/1 ---");

interface Item { name: string; weight: number; value: number }

function knapsack(items: Item[], capacity: number): { maxValue: number; chosen: string[] } {
  // TODO : Retourner la valeur maximale et les noms des items choisis
  // dp[i][w] = meilleure valeur avec les i premiers items et capacité w
  // Récurrence :
  //   Si items[i-1].weight > w : dp[i][w] = dp[i-1][w]
  //   Sinon : dp[i][w] = max(dp[i-1][w], dp[i-1][w - weight] + value)
  //
  // Reconstruction : remonter dp pour trouver quels items ont été sélectionnés

  return { maxValue: 0, chosen: [] };
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
// Attendu : $4700 [Laptop, Camera, Book] ou similaire

// =============================================================================
// PARTIE 3 : LCS (Longest Common Subsequence)
// =============================================================================

console.log("\n--- Partie 3 : LCS ---");

function lcs(s1: string, s2: string): { length: number; sequence: string } {
  // TODO : Retourner la longueur et la séquence LCS
  // dp[i][j] = longueur LCS de s1[0..i-1] et s2[0..j-1]
  // Si s1[i-1] === s2[j-1] : dp[i][j] = dp[i-1][j-1] + 1
  // Sinon : dp[i][j] = max(dp[i-1][j], dp[i][j-1])
  //
  // Reconstruction : remonter la matrice pour extraire la séquence

  return { length: 0, sequence: "" };
}

const { length, sequence } = lcs("ABCBDAB", "BDCAB");
console.log(`LCS length: ${length}, sequence: "${sequence}"`);
// Attendu : length=4, sequence="BCAB"

// =============================================================================
// PARTIE BONUS : Chemins dans une grille avec obstacles
// =============================================================================

console.log("\n--- Bonus : Unique Paths avec obstacles ---");

function uniquePaths(grid: number[][]): number {
  // TODO : Compter les chemins uniques de (0,0) à (m-1, n-1)
  // Mouvement : droite ou bas uniquement
  // grid[r][c] === 1 → obstacle (pas de chemin par cette case)
  // dp[r][c] = nombre de chemins pour atteindre (r, c)
  // dp[0][0] = grid[0][0] === 0 ? 1 : 0
  // Première ligne/colonne : 1 tant qu'il n'y a pas d'obstacle

  return 0;
}

const grid = [
  [0, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 1, 0],
];

console.log("Chemins:", uniquePaths(grid));
// Attendu : 4

console.log("\n=== Fin du Lab 09 ===");
