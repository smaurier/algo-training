// =============================================================================
// Lab 04 — Récursion et recherche binaire
// =============================================================================
// Exécuter avec : npx tsx exercise.ts
// =============================================================================

console.log("=== Lab 04 : Récursion et Binary Search ===\n");

// =============================================================================
// PARTIE 1 : Merge Sort générique
// =============================================================================

console.log("--- Partie 1 : Merge Sort sur objets ---");

function mergeSort<T>(items: T[], compareFn: (a: T, b: T) => number): T[] {
  // TODO : Implémentez merge sort récursif
  // 1. Cas de base : tableau de taille 0 ou 1 → retourner tel quel
  // 2. Diviser le tableau en deux moitiés
  // 3. Trier récursivement chaque moitié
  // 4. Fusionner les deux moitiés triées avec merge()

  return items; // À modifier
}

function merge<T>(left: T[], right: T[], compareFn: (a: T, b: T) => number): T[] {
  // TODO : Fusionner deux tableaux triés en un seul tableau trié
  // Utilisez deux pointeurs (i pour left, j pour right)

  return []; // À modifier
}

// Tests
interface Product { name: string; price: number; rating: number }

const products: Product[] = [
  { name: "Laptop", price: 999, rating: 4.5 },
  { name: "Phone", price: 699, rating: 4.8 },
  { name: "Tablet", price: 499, rating: 4.2 },
  { name: "Watch", price: 299, rating: 4.9 },
  { name: "Earbuds", price: 149, rating: 4.6 },
];

// Tri par prix croissant
const byPrice = mergeSort(products, (a, b) => a.price - b.price);
console.log("Par prix:", byPrice.map(p => `${p.name}($${p.price})`).join(", "));

// Tri par rating décroissant
const byRating = mergeSort(products, (a, b) => b.rating - a.rating);
console.log("Par rating:", byRating.map(p => `${p.name}(${p.rating})`).join(", "));

// =============================================================================
// PARTIE 2 : Binary Search — Lower/Upper Bound
// =============================================================================

console.log("\n--- Partie 2 : Lower/Upper Bound ---");

function lowerBound(arr: number[], target: number): number {
  // TODO : Retourner l'index du PREMIER élément >= target
  // Si aucun élément >= target, retourner arr.length
  // Complexité : O(log n)

  return -1; // À modifier
}

function upperBound(arr: number[], target: number): number {
  // TODO : Retourner l'index du PREMIER élément > target
  // Si aucun élément > target, retourner arr.length
  // Complexité : O(log n)

  return -1; // À modifier
}

function countOccurrences(arr: number[], target: number): number {
  // TODO : Utiliser lowerBound et upperBound pour compter les occurrences de target
  // Complexité : O(log n) — PAS O(n) !

  return 0; // À modifier
}

const sorted = [1, 2, 2, 2, 3, 4, 4, 5, 6, 6, 6, 7];
console.log(`lowerBound(arr, 2) = ${lowerBound(sorted, 2)} (attendu: 1)`);
console.log(`upperBound(arr, 2) = ${upperBound(sorted, 2)} (attendu: 4)`);
console.log(`countOccurrences(arr, 2) = ${countOccurrences(sorted, 2)} (attendu: 3)`);
console.log(`countOccurrences(arr, 6) = ${countOccurrences(sorted, 6)} (attendu: 3)`);
console.log(`countOccurrences(arr, 8) = ${countOccurrences(sorted, 8)} (attendu: 0)`);

// =============================================================================
// PARTIE 3 : Binary Search the Answer — Capacité du bateau
// =============================================================================

console.log("\n--- Partie 3 : Capacité minimale du bateau ---");

function shipWithinDays(weights: number[], days: number): number {
  // TODO : Trouver la capacité minimale pour livrer tous les colis en `days` jours
  //
  // Indice :
  // - La capacité minimum possible = max(weights) (au moins un colis par jour)
  // - La capacité maximum = sum(weights) (tout en un jour)
  // - Binary search sur la capacité entre min et max
  // - Pour chaque capacité candidate, vérifier si on peut livrer en `days` jours
  //
  // Fonction helper canShip(weights, capacity, days) → boolean :
  //   Simuler le chargement jour par jour, compter les jours nécessaires

  return 0; // À modifier
}

console.log(`shipWithinDays([1,2,3,4,5,6,7,8,9,10], 5) = ${shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)} (attendu: 15)`);
console.log(`shipWithinDays([3,2,2,4,1,4], 3) = ${shipWithinDays([3, 2, 2, 4, 1, 4], 3)} (attendu: 6)`);

// =============================================================================
// PARTIE BONUS : Flatten un objet JSON
// =============================================================================

console.log("\n--- Bonus : Flatten JSON ---");

function flattenJSON(obj: Record<string, any>, prefix = ""): Record<string, any> {
  // TODO : Aplatir un objet imbriqué
  // { a: { b: { c: 1 } } } → { "a.b.c": 1 }
  // { a: [1, 2] } → { "a.0": 1, "a.1": 2 }

  return {}; // À modifier
}

const nested = {
  user: {
    name: "Alice",
    address: { city: "Paris", zip: "75001" },
    scores: [95, 87, 92],
  },
  active: true,
};

console.log(flattenJSON(nested));
// Attendu : { "user.name": "Alice", "user.address.city": "Paris", ... }

console.log("\n=== Fin du Lab 04 ===");
