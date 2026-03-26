// =============================================================================
// Lab 05 — Tris et Heaps
// =============================================================================
// Exécuter avec : npx tsx exercise.ts
// =============================================================================

console.log("=== Lab 05 : Tris et Heaps ===\n");

// =============================================================================
// PARTIE 1 : MinHeap générique
// =============================================================================

console.log("--- Partie 1 : MinHeap ---");

class MinHeap<T> {
  private heap: T[] = [];

  constructor(private compareFn: (a: T, b: T) => number = (a: any, b: any) => a - b) {}

  // TODO : Implémentez les méthodes suivantes

  push(value: T): void {
    // TODO : Ajouter un élément et rétablir la propriété de heap (bubble up)
  }

  pop(): T | undefined {
    // TODO : Retirer et retourner le minimum (swap avec dernier, puis bubble down)
    return undefined;
  }

  peek(): T | undefined {
    // TODO : Retourner le minimum sans le retirer
    return undefined;
  }

  get size(): number {
    return this.heap.length;
  }

  // Helpers privés
  private bubbleUp(index: number): void {
    // TODO : Remonter un élément tant qu'il est plus petit que son parent
  }

  private bubbleDown(index: number): void {
    // TODO : Descendre un élément tant qu'il est plus grand que ses enfants
  }
}

// Tests
const heap = new MinHeap<number>();
[5, 3, 8, 1, 9, 2].forEach(n => heap.push(n));

const extracted: number[] = [];
while (heap.size > 0) {
  extracted.push(heap.pop()!);
}
console.log("Extraction ordonnée:", extracted);
console.log(`Résultat correct: ${JSON.stringify(extracted) === JSON.stringify([1, 2, 3, 5, 8, 9]) ? "✅" : "❌"}`);

// =============================================================================
// PARTIE 2 : Top-K éléments
// =============================================================================

console.log("\n--- Partie 2 : Top-K ---");

function topK<T>(items: T[], k: number, compareFn: (a: T, b: T) => number): T[] {
  // TODO : Retourner les k plus grands éléments (en utilisant un MinHeap de taille k)
  // Stratégie : maintenir un heap de taille k
  //   - Si heap.size < k : push
  //   - Sinon si item > heap.peek() : pop + push
  // À la fin, le heap contient les k plus grands

  return []; // À modifier
}

interface Sale { product: string; amount: number }

const sales: Sale[] = [
  { product: "A", amount: 120 },
  { product: "B", amount: 340 },
  { product: "C", amount: 89 },
  { product: "D", amount: 560 },
  { product: "E", amount: 210 },
  { product: "F", amount: 440 },
  { product: "G", amount: 95 },
];

const top3 = topK(sales, 3, (a, b) => a.amount - b.amount);
console.log("Top 3 ventes:", top3.map(s => `${s.product}($${s.amount})`));
// Attendu : D(560), F(440), B(340) dans un ordre quelconque

// =============================================================================
// PARTIE 3 : Merge K Sorted Lists
// =============================================================================

console.log("\n--- Partie 3 : Merge K Sorted Lists ---");

function mergeKSorted(lists: number[][]): number[] {
  // TODO : Fusionner K listes triées en une seule liste triée
  // Utilisez un MinHeap contenant { value, listIndex, elementIndex }
  // Complexité : O(N log K) où N = total d'éléments, K = nombre de listes

  return []; // À modifier
}

const sortedLists = [
  [1, 4, 7, 10],
  [2, 5, 8, 11],
  [3, 6, 9, 12],
];
console.log("Merged:", mergeKSorted(sortedLists));
// Attendu : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

// =============================================================================
// PARTIE BONUS : Running median
// =============================================================================

console.log("\n--- Bonus : Running Median ---");

class MedianFinder {
  // TODO : Maintenir la médiane d'un flux de nombres
  // Utilisez deux heaps : un MaxHeap pour la moitié basse, un MinHeap pour la moitié haute
  // Invariant : maxHeap.size === minHeap.size OU maxHeap.size === minHeap.size + 1

  addNum(num: number): void {
    // TODO
  }

  findMedian(): number {
    return 0; // À modifier
  }
}

const mf = new MedianFinder();
[2, 3, 4].forEach(n => { mf.addNum(n); console.log(`Après ${n}: médiane = ${mf.findMedian()}`); });
// Attendu : 2, 2.5, 3

console.log("\n=== Fin du Lab 05 ===");
