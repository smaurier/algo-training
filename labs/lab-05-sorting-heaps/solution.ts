// =============================================================================
// Lab 05 — Tris et Heaps — Solutions
// =============================================================================
// Exécuter avec : npx tsx solution.ts
// =============================================================================

console.log("=== Lab 05 : Tris et Heaps — Solutions ===\n");

// =============================================================================
// PARTIE 1 : MinHeap générique
// =============================================================================

console.log("--- Partie 1 : MinHeap ---");

class MinHeap<T> {
  private heap: T[] = [];

  constructor(private compareFn: (a: T, b: T) => number = (a: any, b: any) => a - b) {}

  push(value: T): void {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return min;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  get size(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compareFn(this.heap[index], this.heap[parent]) >= 0) break;
      [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
      index = parent;
    }
  }

  private bubbleDown(index: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      if (left < n && this.compareFn(this.heap[left], this.heap[smallest]) < 0) smallest = left;
      if (right < n && this.compareFn(this.heap[right], this.heap[smallest]) < 0) smallest = right;
      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

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
  const minHeap = new MinHeap<T>(compareFn);

  for (const item of items) {
    if (minHeap.size < k) {
      minHeap.push(item);
    } else if (compareFn(item, minHeap.peek()!) > 0) {
      minHeap.pop();
      minHeap.push(item);
    }
  }

  const result: T[] = [];
  while (minHeap.size > 0) result.push(minHeap.pop()!);
  return result.reverse(); // Du plus grand au plus petit
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

// =============================================================================
// PARTIE 3 : Merge K Sorted Lists
// =============================================================================

console.log("\n--- Partie 3 : Merge K Sorted Lists ---");

function mergeKSorted(lists: number[][]): number[] {
  interface HeapEntry { value: number; listIdx: number; elemIdx: number }
  const minHeap = new MinHeap<HeapEntry>((a, b) => a.value - b.value);

  // Initialiser avec le premier élément de chaque liste
  for (let i = 0; i < lists.length; i++) {
    if (lists[i].length > 0) {
      minHeap.push({ value: lists[i][0], listIdx: i, elemIdx: 0 });
    }
  }

  const result: number[] = [];

  while (minHeap.size > 0) {
    const { value, listIdx, elemIdx } = minHeap.pop()!;
    result.push(value);

    const nextIdx = elemIdx + 1;
    if (nextIdx < lists[listIdx].length) {
      minHeap.push({ value: lists[listIdx][nextIdx], listIdx, elemIdx: nextIdx });
    }
  }

  return result;
}

const sortedLists = [
  [1, 4, 7, 10],
  [2, 5, 8, 11],
  [3, 6, 9, 12],
];
const merged = mergeKSorted(sortedLists);
console.log("Merged:", merged);
const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
console.log(`Résultat correct: ${JSON.stringify(merged) === JSON.stringify(expected) ? "✅" : "❌"}`);

// =============================================================================
// PARTIE BONUS : Running Median
// =============================================================================

console.log("\n--- Bonus : Running Median ---");

class MaxHeap<T> {
  private inner: MinHeap<T>;
  constructor(compareFn: (a: T, b: T) => number = (a: any, b: any) => a - b) {
    this.inner = new MinHeap<T>((a, b) => -compareFn(a, b));
  }
  push(val: T) { this.inner.push(val); }
  pop(): T | undefined { return this.inner.pop(); }
  peek(): T | undefined { return this.inner.peek(); }
  get size() { return this.inner.size; }
}

class MedianFinder {
  private lo = new MaxHeap<number>(); // moitié basse (max en haut)
  private hi = new MinHeap<number>(); // moitié haute (min en haut)

  addNum(num: number): void {
    this.lo.push(num);
    // Garantir que lo.peek() <= hi.peek()
    this.hi.push(this.lo.pop()!);
    // Rééquilibrer les tailles : lo.size >= hi.size
    if (this.hi.size > this.lo.size) {
      this.lo.push(this.hi.pop()!);
    }
  }

  findMedian(): number {
    if (this.lo.size > this.hi.size) {
      return this.lo.peek()!;
    }
    return (this.lo.peek()! + this.hi.peek()!) / 2;
  }
}

const mf = new MedianFinder();
[2, 3, 4].forEach(n => { mf.addNum(n); console.log(`Après ${n}: médiane = ${mf.findMedian()}`); });

console.log("\n=== Fin du Lab 05 ===");
