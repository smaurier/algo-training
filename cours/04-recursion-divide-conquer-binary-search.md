# Module 04 — Récursion, divide & conquer, recherche dichotomique

> **Objectif** : apprendre à découper un problème en sous-problèmes, exploiter l'ordre pour aller plus vite, et maîtriser la pensée récursive sans tomber dans les pièges classiques.

> **Difficulté** : ⭐⭐⭐

::: info Pas de panique !
La récursion fait peur à beaucoup de développeurs. En réalité, c'est simplement une fonction qui s'appelle elle-même avec un problème plus petit. Si tu comprends une boucle, tu peux comprendre la récursion — il faut juste penser différemment.
:::

---

## Prérequis

- Modules 01-03 terminés
- Comprendre la call stack (une fonction récursive empile des frames)
- Savoir ce qu'est O(n), O(n log n), O(log n)

---

## 1. La récursion

### 1.1 Les trois briques

Toute solution récursive repose sur :

1. **Un cas de base** — la condition d'arrêt (sinon → stack overflow)
2. **Une réduction** — le problème devient plus petit à chaque appel
3. **Une garantie de convergence** — on se rapproche du cas de base

```typescript
// Exemple canonique : factorielle
function factorial(n: number): number {
  // 1. Cas de base
  if (n <= 1) return 1;

  // 2. Réduction + 3. Convergence (n → n-1, se rapproche de 1)
  return n * factorial(n - 1);
}

// Déroulé de factorial(5) :
// factorial(5) = 5 × factorial(4)
//              = 5 × 4 × factorial(3)
//              = 5 × 4 × 3 × factorial(2)
//              = 5 × 4 × 3 × 2 × factorial(1)
//              = 5 × 4 × 3 × 2 × 1
//              = 120

// État de la stack au point le plus profond :
// ┌────────────────┐
// │ factorial(1)   │ ← sommet (en cours)
// │ factorial(2)   │
// │ factorial(3)   │
// │ factorial(4)   │
// │ factorial(5)   │ ← base (premier appel)
// └────────────────┘
```

### 1.2 Récursion linéaire vs arbre récursif

```typescript
// Récursion linéaire — un seul appel récursif par étape → O(n) appels
function sumArray(arr: number[], i = 0): number {
  if (i >= arr.length) return 0;
  return arr[i] + sumArray(arr, i + 1);
}

// Arbre récursif — deux appels par étape → O(2^n) appels
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// ⚠️ fibonacci(40) fait ~1 milliard d'appels !
// On verra comment résoudre ça avec la memoization (module 09)
```

```
fibonacci(5) — arbre d'appels :

                    fib(5)
                   /      \
              fib(4)        fib(3)
             /     \        /    \
         fib(3)   fib(2)  fib(2)  fib(1)
        /    \    /   \   /   \
    fib(2) fib(1) fib(1) fib(0) fib(1) fib(0)
    /   \
 fib(1) fib(0)

→ Plein de calculs redondants ! fib(3) est calculé 2 fois, fib(2) 3 fois...
```

### 1.3 Récursion vs itération

```typescript
// Règle d'or : si la récursion n'apporte pas de clarté,
// utilise une boucle.

// ✅ La récursion est naturelle pour :
// - parcours d'arbres (DOM, catégories, AST)
// - combinaisons et permutations
// - divide & conquer (merge sort, quick sort)
// - backtracking

// ❌ La récursion est inutile pour :
// - parcours linéaire (utilise for)
// - accumulation simple (utilise reduce)
// - itérations avec compteur

// Fibonacci — version itérative (bien meilleure)
function fibIterative(n: number): number {
  if (n <= 1) return n;
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}
// O(n) temps, O(1) espace — vs O(2^n) pour la version récursive naïve
```

### 1.4 Pièges de la récursion

```typescript
// Piège 1 — Oublier le cas de base
function infinite(n: number): number {
  return n + infinite(n - 1);
  // ❌ Pas de condition d'arrêt → stack overflow
}

// Piège 2 — Cas de base qui ne couvre pas tous les cas
function badBase(n: number): number {
  if (n === 0) return 0;
  return n + badBase(n - 2);
  // ❌ Si n est impair, on passe de 1 à -1 sans jamais toucher 0
}

// Piège 3 — Récursion trop profonde
// JavaScript a une limite de stack (~10 000-15 000 frames)
function deepRecursion(n: number): number {
  if (n === 0) return 0;
  return 1 + deepRecursion(n - 1);
}
// deepRecursion(100_000) → RangeError: Maximum call stack size exceeded

// Solution : convertir en itératif ou utiliser une trampoline
function deepIterative(n: number): number {
  let count = 0;
  for (let i = n; i > 0; i--) count++;
  return count;
}
```

---

## 2. Divide & conquer

### 2.1 Le principe

```
┌──────────────────────────────────────────────────┐
│  1. DIVISER    → couper le problème en morceaux  │
│  2. RÉSOUDRE   → résoudre chaque morceau         │
│  3. COMBINER   → fusionner les résultats         │
└──────────────────────────────────────────────────┘
```

### 2.2 Merge sort — l'exemple parfait

```typescript
function mergeSort(arr: number[]): number[] {
  // Cas de base : un tableau de 0 ou 1 élément est déjà trié
  if (arr.length <= 1) return arr;

  // 1. DIVISER — couper en deux moitiés
  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);

  // 2. RÉSOUDRE — trier chaque moitié récursivement
  const sortedLeft = mergeSort(left);
  const sortedRight = mergeSort(right);

  // 3. COMBINER — fusionner les deux moitiés triées
  return merge(sortedLeft, sortedRight);
}

function merge(a: number[], b: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;

  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) {
      result.push(a[i++]);
    } else {
      result.push(b[j++]);
    }
  }

  // Ajouter les éléments restants
  while (i < a.length) result.push(a[i++]);
  while (j < b.length) result.push(b[j++]);

  return result;
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));
// [3, 9, 10, 27, 38, 43, 82]

// Complexité :
// - Diviser : O(log n) niveaux de récursion
// - À chaque niveau : O(n) de travail (merge)
// - Total : O(n log n) — garanti, même dans le pire cas
// - Espace : O(n) — les tableaux temporaires
```

```
Déroulé de mergeSort([38, 27, 43, 3, 9, 82, 10]) :

Niveau 0:  [38, 27, 43, 3, 9, 82, 10]
              /                    \
Niveau 1:  [38, 27, 43]        [3, 9, 82, 10]
            /        \           /          \
Niveau 2: [38]    [27, 43]    [3, 9]    [82, 10]
                   /    \      /   \      /    \
Niveau 3:       [27]   [43]  [3] [9]   [82]  [10]

                   Merge phase (remontée) :
Niveau 3:       [27]   [43]  [3] [9]   [82]  [10]
                   \    /      \   /      \    /
Niveau 2: [38]    [27, 43]    [3, 9]    [10, 82]
            \        /           \          /
Niveau 1:  [27, 38, 43]        [3, 9, 10, 82]
              \                    /
Niveau 0:  [3, 9, 10, 27, 38, 43, 82]
```

### 2.3 Quick sort

```typescript
function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;

  // Choix du pivot (ici : dernier élément — pas optimal mais simple)
  const pivot = arr[arr.length - 1];
  const left: number[] = [];
  const right: number[] = [];

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] <= pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }

  return [...quickSort(left), pivot, ...quickSort(right)];
}

// Complexité :
// - Meilleur / moyen : O(n log n) — le pivot divise bien
// - Pire cas : O(n²) — le pivot est toujours le min ou max
// - Espace : O(n) pour cette version (O(log n) en version in-place)
```

### 2.4 Merge sort vs Quick sort

```
┌─────────────┬──────────────────────┬──────────────────────┐
│             │  Merge Sort          │  Quick Sort          │
├─────────────┼──────────────────────┼──────────────────────┤
│  Meilleur   │  O(n log n)          │  O(n log n)          │
│  Moyen      │  O(n log n)          │  O(n log n)          │
│  Pire       │  O(n log n) ✅       │  O(n²) ⚠️            │
│  Espace     │  O(n) ❌             │  O(log n) ✅ (in-place)│
│  Stable     │  Oui ✅              │  Non ❌              │
│  Cache      │  Moins bon           │  Meilleur            │
└─────────────┴──────────────────────┴──────────────────────┘

JavaScript utilise TimSort (hybride merge sort + insertion sort)
→ O(n log n) garanti, stable, optimisé pour les tableaux "presque triés"
```

---

## 3. Binary search (recherche dichotomique)

### 3.1 Le principe fondamental

La dichotomie ne sert pas qu'à "chercher dans un tableau trié". C'est un pattern pour **chercher une frontière** dans un espace ordonné.

```typescript
// Version classique — chercher une valeur exacte
function binarySearch(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2); // évite l'overflow
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }

  return -1; // non trouvé
}

console.log(binarySearch([1, 3, 5, 7, 9, 11, 13], 7)); // 3
console.log(binarySearch([1, 3, 5, 7, 9, 11, 13], 6)); // -1
```

### 3.2 Déroulé pas à pas

```
Chercher 7 dans [1, 3, 5, 7, 9, 11, 13] :

Étape 1: lo=0, hi=6, mid=3 → arr[3]=7 → trouvé !

Chercher 6 dans [1, 3, 5, 7, 9, 11, 13] :

Étape 1: lo=0, hi=6, mid=3 → arr[3]=7 > 6 → hi=2
Étape 2: lo=0, hi=2, mid=1 → arr[1]=3 < 6 → lo=2
Étape 3: lo=2, hi=2, mid=2 → arr[2]=5 < 6 → lo=3
Étape 4: lo=3, hi=2 → lo > hi → non trouvé
```

### 3.3 Variantes importantes

```typescript
// Variante 1 — Trouver la première position d'insertion (lower bound)
function lowerBound(arr: number[], target: number): number {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo; // Premier index où arr[i] >= target
}

// Variante 2 — Trouver la dernière position (upper bound)
function upperBound(arr: number[], target: number): number {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] <= target) lo = mid + 1;
    else hi = mid;
  }
  return lo; // Premier index où arr[i] > target
}

// Utilisation : compter les occurrences d'une valeur dans un tableau trié
function countOccurrences(arr: number[], target: number): number {
  return upperBound(arr, target) - lowerBound(arr, target);
}

const sorted = [1, 2, 2, 2, 3, 4, 5];
console.log(countOccurrences(sorted, 2)); // 3
console.log(lowerBound(sorted, 2));       // 1 (premier 2)
console.log(upperBound(sorted, 2));       // 4 (après le dernier 2)
```

### 3.4 Binary search sur une condition (pas un tableau)

```typescript
// La dichotomie fonctionne sur tout espace ordonné avec une condition monotone
// "trouver la première valeur x telle que f(x) est vrai"

// Exemple : capacité minimale de livraison
// Tu as n colis avec des poids et d jours pour tout livrer.
// Quelle est la capacité minimum du camion ?

function minCapacity(weights: number[], days: number): number {
  let lo = Math.max(...weights); // au minimum le plus gros colis
  let hi = weights.reduce((s, w) => s + w, 0); // tout en un jour

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);

    // Peut-on livrer en `days` jours avec capacité `mid` ?
    if (canDeliver(weights, days, mid)) {
      hi = mid; // on cherche plus petit
    } else {
      lo = mid + 1; // trop petit, on augmente
    }
  }

  return lo;
}

function canDeliver(weights: number[], days: number, capacity: number): boolean {
  let currentLoad = 0;
  let daysNeeded = 1;

  for (const w of weights) {
    if (currentLoad + w > capacity) {
      daysNeeded++;
      currentLoad = 0;
    }
    currentLoad += w;
  }

  return daysNeeded <= days;
}

console.log(minCapacity([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)); // 15
```

### 3.5 Binary search sur réponse (binary search the answer)

```typescript
// Pattern très puissant : tu ne cherches pas dans un tableau,
// tu cherches la valeur optimale d'un paramètre.

// Exemple : racine carrée entière
function intSqrt(n: number): number {
  let lo = 0, hi = n;
  let result = 0;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (mid * mid <= n) {
      result = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return result;
}

console.log(intSqrt(16)); // 4
console.log(intSqrt(20)); // 4 (4² = 16 ≤ 20 < 25 = 5²)

// Exemple : temps minimum pour compléter n tâches
// avec k machines ayant des vitesses différentes
function minTime(speeds: number[], tasks: number): number {
  let lo = 1;
  let hi = Math.max(...speeds) * tasks; // worst case : une seule machine

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    // Combien de tâches peut-on faire en `mid` unités de temps ?
    const done = speeds.reduce((total, speed) => total + Math.floor(mid / speed), 0);
    if (done >= tasks) hi = mid;
    else lo = mid + 1;
  }

  return lo;
}

console.log(minTime([2, 3, 7], 10)); // 12
// En 12 unités : machine 1 fait 6 tâches, machine 2 fait 4, machine 3 fait 1 → 11 ≥ 10 ✅
```

### 3.6 Pièges du binary search

```typescript
// Piège 1 — Off-by-one dans les bornes
// lo <= hi (avec hi = arr.length - 1) vs lo < hi (avec hi = arr.length)
// → être consistant et tester les cas limites

// Piège 2 — Integer overflow au calcul du mid
// ❌ const mid = (lo + hi) / 2;           // peut overflow en C/Java
// ✅ const mid = lo + Math.floor((hi - lo) / 2);  // safe

// Piège 3 — Boucle infinie quand lo = hi - 1
// Quand l'espace est de taille 2, vérifier que mid progresse
// Toujours s'assurer que lo ou hi change à chaque itération

// Piège 4 — Tableau non trié
// La dichotomie ne fonctionne QUE sur un espace ordonné
// ou une condition monotone (false, false, ..., true, true, ...)
```

---

## 4. Applications terrain

### 4.1 Recherche dans une API paginée

```typescript
// Tu as une API de produits triés par prix.
// Tu cherches le premier produit au-dessus de 50€.
// Au lieu de parcourir toutes les pages, tu peux faire une dichotomie.

interface PaginatedResponse {
  items: { id: string; price: number }[];
  hasMore: boolean;
}

async function findFirstAbovePrice(
  fetchPage: (page: number) => Promise<PaginatedResponse>,
  targetPrice: number,
  totalPages: number,
): Promise<{ id: string; price: number } | null> {
  let lo = 0, hi = totalPages - 1;

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const page = await fetchPage(mid);
    const lastItem = page.items[page.items.length - 1];

    if (lastItem.price < targetPrice) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  const page = await fetchPage(lo);
  return page.items.find(item => item.price >= targetPrice) ?? null;
}
```

### 4.2 Récursion sur un arbre DOM

```typescript
// Trouver tous les éléments textuels dans un arbre de composants
interface UINode {
  type: string;
  text?: string;
  children?: UINode[];
}

function findAllText(node: UINode): string[] {
  const texts: string[] = [];

  if (node.text) texts.push(node.text);

  for (const child of node.children ?? []) {
    texts.push(...findAllText(child)); // récursion naturelle sur l'arbre
  }

  return texts;
}
```

---

## Démonstrations

### Demo 1 — Merge sort sur des objets (tri stable)

```typescript
interface Student { name: string; grade: number }

function mergeSortBy<T>(arr: T[], compareFn: (a: T, b: T) => number): T[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSortBy(arr.slice(0, mid), compareFn);
  const right = mergeSortBy(arr.slice(mid), compareFn);
  return mergeBy(left, right, compareFn);
}

function mergeBy<T>(a: T[], b: T[], compareFn: (a: T, b: T) => number): T[] {
  const result: T[] = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (compareFn(a[i], b[j]) <= 0) result.push(a[i++]);
    else result.push(b[j++]);
  }
  while (i < a.length) result.push(a[i++]);
  while (j < b.length) result.push(b[j++]);
  return result;
}

const students: Student[] = [
  { name: 'Alice', grade: 15 },
  { name: 'Bob', grade: 12 },
  { name: 'Charlie', grade: 15 },
  { name: 'Diana', grade: 12 },
];

const sorted = mergeSortBy(students, (a, b) => b.grade - a.grade);
console.log(sorted.map(s => `${s.name}(${s.grade})`));
// ['Alice(15)', 'Charlie(15)', 'Bob(12)', 'Diana(12)']
// Tri STABLE : Alice reste avant Charlie (même note), Bob reste avant Diana
```

### Demo 2 — Binary search pour trouver un commit cassé (git bisect)

```typescript
// git bisect fait exactement une recherche dichotomique !
// Tu as N commits. Un bug a été introduit entre le commit 0 (bon) et N-1 (cassé).
// Trouver le premier commit cassé en O(log n) tests.

function gitBisect(
  commits: string[],
  isBroken: (commit: string) => boolean,
): string {
  let lo = 0, hi = commits.length - 1;

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (isBroken(commits[mid])) {
      hi = mid;     // le bug est au mid ou avant
    } else {
      lo = mid + 1; // le bug est après
    }
  }

  return commits[lo]; // premier commit cassé
}

const commits = ['abc123', 'def456', 'ghi789', 'jkl012', 'mno345'];
// Supposons que le bug est introduit au commit 'ghi789'
const broken = gitBisect(commits, c => ['ghi789', 'jkl012', 'mno345'].includes(c));
console.log(`Premier commit cassé : ${broken}`); // 'ghi789'
// Seulement ~log2(5) = 3 tests au lieu de 5
```

### Demo 3 — Trampoline pour éviter le stack overflow

```typescript
// Technique pour exécuter de la "récursion" sans empiler de frames

type Thunk<T> = () => T | Thunk<T>;

function trampoline<T>(fn: Thunk<T>): T {
  let result: any = fn;
  while (typeof result === 'function') {
    result = result();
  }
  return result;
}

// Factorielle avec trampoline — pas de stack overflow
function factTrampoline(n: number, acc = 1): number | (() => number | (() => any)) {
  if (n <= 1) return acc;
  return () => factTrampoline(n - 1, n * acc);
}

console.log(trampoline(() => factTrampoline(100_000)));
// Fonctionne même pour n = 100 000 ! (résultat = Infinity car trop grand)
```

---

## Points clés

1. La récursion = cas de base + réduction + convergence.
2. Arbre récursif (2 branches) = $O(2^n)$ — souvent trop lent sans memoization.
3. Divide & conquer = diviser + résoudre + combiner → $O(n \log n)$ typiquement.
4. Merge sort est le modèle parfait de divide & conquer — $O(n \log n)$ garanti, stable.
5. Binary search fonctionne sur tout espace **ordonné avec condition monotone**, pas que sur les tableaux.
6. Lower bound / upper bound sont des variantes essentielles de la dichotomie.
7. "Binary search the answer" : chercher le paramètre optimal au lieu de chercher dans un tableau.
8. Attention aux pièges : off-by-one, boucle infinie, stack overflow pour les récursions profondes.
9. La récursion est naturelle pour les arbres et les combinaisons, inutile pour les parcours linéaires.
10. Tout algorithme récursif peut être converti en itératif avec une stack explicite ou un trampoline.

---

## Pour aller plus loin

- [MDN — Recursion](https://developer.mozilla.org/en-US/docs/Glossary/Recursion) — fondamentaux
- [Visualgo — Sorting](https://visualgo.net/en/sorting) — merge sort / quick sort animés
- [Binary Search — A Different Perspective](https://www.topcoder.com/thrive/articles/Binary%20Search) — article détaillé
- [Brilliant — Divide and Conquer](https://brilliant.org/wiki/divide-and-conquer/) — exemples avancés
- [JavaScript.info — Recursion](https://javascript.info/recursion) — tutoriel progressif

---

## Si tu es perdu

1. Récursion = une fonction qui s'appelle elle-même avec un problème **plus petit**.
2. Sans condition d'arrêt → stack overflow.
3. Binary search = diviser par 2 à chaque étape → $O(\log n)$.
4. Merge sort = couper-trier-fusionner → $O(n \log n)$.
5. En cas de doute, dessine l'arbre d'appels sur papier.

---

## Défi

> Implémente `searchRange(nums: number[], target: number): [number, number]` qui retourne le premier et le dernier index d'une valeur dans un tableau trié. Si la valeur n'existe pas, retourne `[-1, -1]`. Contrainte : $O(\log n)$.

<details>
<summary>Réponse</summary>

```typescript
function searchRange(nums: number[], target: number): [number, number] {
  const first = findFirst(nums, target);
  if (first === -1) return [-1, -1];
  const last = findLast(nums, target);
  return [first, last];
}

function findFirst(nums: number[], target: number): number {
  let lo = 0, hi = nums.length - 1, result = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) { result = mid; hi = mid - 1; }
    else if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return result;
}

function findLast(nums: number[], target: number): number {
  let lo = 0, hi = nums.length - 1, result = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) { result = mid; lo = mid + 1; }
    else if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return result;
}

console.log(searchRange([5, 7, 7, 8, 8, 10], 8)); // [3, 4]
console.log(searchRange([5, 7, 7, 8, 8, 10], 6)); // [-1, -1]

// Deux binary searches → O(log n) + O(log n) = O(log n)
```

</details>

---

::: tip Parcours recommandé
📖 Module terminé → Fais la **visualisation Binary Search** → puis le **Lab 04** → puis le **Quiz 04**.
:::
