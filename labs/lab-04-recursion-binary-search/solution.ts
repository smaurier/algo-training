// =============================================================================
// Lab 04 — Récursion et recherche binaire — SOLUTION
// =============================================================================

console.log("=== Lab 04 : Récursion et Binary Search — SOLUTION ===\n");

// =============================================================================
// PARTIE 1 : Merge Sort générique
// =============================================================================

console.log("--- Partie 1 : Merge Sort sur objets ---");

function mergeSort<T>(items: T[], compareFn: (a: T, b: T) => number): T[] {
  if (items.length <= 1) return items;
  const mid = Math.floor(items.length / 2);
  const left = mergeSort(items.slice(0, mid), compareFn);
  const right = mergeSort(items.slice(mid), compareFn);
  return merge(left, right, compareFn);
}

function merge<T>(left: T[], right: T[], compareFn: (a: T, b: T) => number): T[] {
  const result: T[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (compareFn(left[i], right[j]) <= 0) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  return result;
}

interface Product { name: string; price: number; rating: number }
const products: Product[] = [
  { name: "Laptop", price: 999, rating: 4.5 },
  { name: "Phone", price: 699, rating: 4.8 },
  { name: "Tablet", price: 499, rating: 4.2 },
  { name: "Watch", price: 299, rating: 4.9 },
  { name: "Earbuds", price: 149, rating: 4.6 },
];

const byPrice = mergeSort(products, (a, b) => a.price - b.price);
console.log("Par prix:", byPrice.map(p => `${p.name}($${p.price})`).join(", "));

const byRating = mergeSort(products, (a, b) => b.rating - a.rating);
console.log("Par rating:", byRating.map(p => `${p.name}(${p.rating})`).join(", "));

// =============================================================================
// PARTIE 2 : Binary Search — Lower/Upper Bound
// =============================================================================

console.log("\n--- Partie 2 : Lower/Upper Bound ---");

function lowerBound(arr: number[], target: number): number {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function upperBound(arr: number[], target: number): number {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] <= target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function countOccurrences(arr: number[], target: number): number {
  return upperBound(arr, target) - lowerBound(arr, target);
}

const sorted = [1, 2, 2, 2, 3, 4, 4, 5, 6, 6, 6, 7];
console.log(`lowerBound(arr, 2) = ${lowerBound(sorted, 2)} ✅`);
console.log(`upperBound(arr, 2) = ${upperBound(sorted, 2)} ✅`);
console.log(`countOccurrences(arr, 2) = ${countOccurrences(sorted, 2)} ✅`);
console.log(`countOccurrences(arr, 6) = ${countOccurrences(sorted, 6)} ✅`);
console.log(`countOccurrences(arr, 8) = ${countOccurrences(sorted, 8)} ✅`);

// =============================================================================
// PARTIE 3 : Binary Search the Answer — Capacité du bateau
// =============================================================================

console.log("\n--- Partie 3 : Capacité minimale du bateau ---");

function shipWithinDays(weights: number[], days: number): number {
  function canShip(capacity: number): boolean {
    let daysNeeded = 1;
    let currentLoad = 0;
    for (const w of weights) {
      if (currentLoad + w > capacity) {
        daysNeeded++;
        currentLoad = 0;
      }
      currentLoad += w;
    }
    return daysNeeded <= days;
  }

  let lo = Math.max(...weights);
  let hi = weights.reduce((a, b) => a + b, 0);

  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (canShip(mid)) hi = mid;
    else lo = mid + 1;
  }

  return lo;
}

console.log(`shipWithinDays([1..10], 5) = ${shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)} ✅`);
console.log(`shipWithinDays([3,2,2,4,1,4], 3) = ${shipWithinDays([3, 2, 2, 4, 1, 4], 3)} ✅`);

// =============================================================================
// PARTIE BONUS : Flatten JSON
// =============================================================================

console.log("\n--- Bonus : Flatten JSON ---");

function flattenJSON(obj: Record<string, any>, prefix = ""): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenJSON(value, fullKey));
    } else if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        if (typeof item === "object" && item !== null) {
          Object.assign(result, flattenJSON(item, `${fullKey}.${idx}`));
        } else {
          result[`${fullKey}.${idx}`] = item;
        }
      });
    } else {
      result[fullKey] = value;
    }
  }

  return result;
}

const nested = {
  user: { name: "Alice", address: { city: "Paris", zip: "75001" }, scores: [95, 87, 92] },
  active: true,
};
console.log(flattenJSON(nested));

console.log("\n=== Fin du Lab 04 — SOLUTION ===");
