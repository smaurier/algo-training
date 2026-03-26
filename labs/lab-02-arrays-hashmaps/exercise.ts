// =============================================================================
// Lab 02 — Tableaux et HashMaps
// =============================================================================
// Exécuter avec : npx tsx exercise.ts
// =============================================================================

console.log("=== Lab 02 : Tableaux et HashMaps ===\n");

// =============================================================================
// PARTIE 1 : Two Sum avec HashMap
// =============================================================================

console.log("--- Partie 1 : Two Sum ---");

function twoSum(nums: number[], target: number): [number, number] | null {
  // TODO : Implémentez cette fonction en O(n)
  // Retournez les INDICES des deux éléments dont la somme = target
  // Utilisez une Map<number, number> pour stocker valeur → index
  //
  // Exemple : twoSum([2, 7, 11, 15], 9) → [0, 1] car 2 + 7 = 9

  return null; // À modifier
}

// Tests
const tests1 = [
  { nums: [2, 7, 11, 15], target: 9, expected: [0, 1] },
  { nums: [3, 2, 4], target: 6, expected: [1, 2] },
  { nums: [3, 3], target: 6, expected: [0, 1] },
  { nums: [1, 2, 3, 4, 5], target: 10, expected: null },
];

for (const test of tests1) {
  const result = twoSum(test.nums, test.target);
  const pass = JSON.stringify(result) === JSON.stringify(test.expected);
  console.log(`twoSum(${JSON.stringify(test.nums)}, ${test.target}) = ${JSON.stringify(result)} ${pass ? "✅" : "❌"}`);
}

// =============================================================================
// PARTIE 2 : GroupBy générique
// =============================================================================

console.log("\n--- Partie 2 : GroupBy ---");

function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K,
): Map<K, T[]> {
  // TODO : Implémentez cette fonction
  // Pour chaque élément, calculez la clé avec keyFn
  // Groupez les éléments ayant la même clé dans un tableau
  // Retournez une Map<K, T[]>

  return new Map(); // À modifier
}

// Test avec des utilisateurs
interface User { name: string; role: string; age: number }

const users: User[] = [
  { name: "Alice", role: "admin", age: 30 },
  { name: "Bob", role: "user", age: 25 },
  { name: "Charlie", role: "admin", age: 35 },
  { name: "Diana", role: "user", age: 28 },
  { name: "Eve", role: "moderator", age: 32 },
];

const byRole = groupBy(users, u => u.role);
console.log("Par rôle :", Object.fromEntries(byRole));

// TODO : Groupez les utilisateurs par tranche d'âge (< 30, >= 30)
const byAgeGroup = groupBy(users, u => u.age < 30 ? "young" : "senior");
console.log("Par âge :", Object.fromEntries(byAgeGroup));

// =============================================================================
// PARTIE 3 : Grouper les anagrammes
// =============================================================================

console.log("\n--- Partie 3 : Anagrammes ---");

function groupAnagrams(words: string[]): string[][] {
  // TODO : Implémentez cette fonction
  // Deux mots sont anagrammes s'ils ont les mêmes lettres dans un ordre différent
  // Indice : triez les lettres de chaque mot pour obtenir une "clé canonique"
  // Exemple : "eat" et "tea" ont la même clé triée : "aet"
  // Retournez un tableau de groupes

  return []; // À modifier
}

const anagramTests = ["eat", "tea", "tan", "ate", "nat", "bat"];
const groups = groupAnagrams(anagramTests);
console.log("Anagrammes :", groups);
// Attendu : [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]

// =============================================================================
// PARTIE BONUS : Sliding Window — Somme maximale
// =============================================================================

console.log("\n--- Bonus : Sliding Window ---");

function maxSumSubarray(nums: number[], k: number): { sum: number; startIndex: number } {
  // TODO : Implémentez cette fonction en O(n)
  // Trouvez le sous-tableau contigu de taille k avec la somme maximale
  // Retournez la somme ET l'index de début
  //
  // Technique : calculez la somme de la première fenêtre,
  // puis faites glisser la fenêtre en ajoutant le nouvel élément et en retirant l'ancien
  //
  // Exemple : maxSumSubarray([1, 4, 2, 10, 2, 3, 1, 0, 20], 4)
  //   → { sum: 24, startIndex: 5 } car [3, 1, 0, 20] = 24

  return { sum: 0, startIndex: 0 }; // À modifier
}

const swResult = maxSumSubarray([1, 4, 2, 10, 2, 3, 1, 0, 20], 4);
console.log(`Max sum subarray of size 4: sum=${swResult.sum}, start=${swResult.startIndex}`);
// Attendu : sum=24, start=5

console.log("\n=== Fin du Lab 02 ===");
