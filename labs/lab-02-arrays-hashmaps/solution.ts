// =============================================================================
// Lab 02 — Tableaux et HashMaps — SOLUTION
// =============================================================================

console.log("=== Lab 02 : Tableaux et HashMaps — SOLUTION ===\n");

// =============================================================================
// PARTIE 1 : Two Sum avec HashMap — O(n)
// =============================================================================

console.log("--- Partie 1 : Two Sum ---");

function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>(); // valeur → index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    seen.set(nums[i], i);
  }

  return null;
}

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
  const groups = new Map<K, T[]>();

  for (const item of items) {
    const key = keyFn(item);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }

  return groups;
}

interface User { name: string; role: string; age: number }

const users: User[] = [
  { name: "Alice", role: "admin", age: 30 },
  { name: "Bob", role: "user", age: 25 },
  { name: "Charlie", role: "admin", age: 35 },
  { name: "Diana", role: "user", age: 28 },
  { name: "Eve", role: "moderator", age: 32 },
];

const byRole = groupBy(users, u => u.role);
console.log("Par rôle :");
for (const [role, members] of byRole) {
  console.log(`  ${role}: ${members.map(u => u.name).join(", ")}`);
}

const byAgeGroup = groupBy(users, u => u.age < 30 ? "young" : "senior");
console.log("Par âge :");
for (const [group, members] of byAgeGroup) {
  console.log(`  ${group}: ${members.map(u => u.name).join(", ")}`);
}

// =============================================================================
// PARTIE 3 : Grouper les anagrammes
// =============================================================================

console.log("\n--- Partie 3 : Anagrammes ---");

function groupAnagrams(words: string[]): string[][] {
  const groups = new Map<string, string[]>();

  for (const word of words) {
    // Clé canonique : lettres triées
    const key = word.split("").sort().join("");

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(word);
  }

  return [...groups.values()];
}

const anagramTests = ["eat", "tea", "tan", "ate", "nat", "bat"];
const groups = groupAnagrams(anagramTests);
console.log("Anagrammes :", groups);
// [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]] ✅

// =============================================================================
// PARTIE BONUS : Sliding Window
// =============================================================================

console.log("\n--- Bonus : Sliding Window ---");

function maxSumSubarray(nums: number[], k: number): { sum: number; startIndex: number } {
  // Calculer la somme de la première fenêtre
  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += nums[i];
  }

  let maxSum = windowSum;
  let startIndex = 0;

  // Faire glisser la fenêtre
  for (let i = k; i < nums.length; i++) {
    windowSum += nums[i] - nums[i - k]; // Ajouter nouveau, retirer ancien

    if (windowSum > maxSum) {
      maxSum = windowSum;
      startIndex = i - k + 1;
    }
  }

  return { sum: maxSum, startIndex };
}

const swResult = maxSumSubarray([1, 4, 2, 10, 2, 3, 1, 0, 20], 4);
console.log(`Max sum subarray of size 4: sum=${swResult.sum}, start=${swResult.startIndex}`);
console.log(`Sous-tableau : [${[1, 4, 2, 10, 2, 3, 1, 0, 20].slice(swResult.startIndex, swResult.startIndex + 4)}]`);

console.log("\n=== Fin du Lab 02 — SOLUTION ===");
