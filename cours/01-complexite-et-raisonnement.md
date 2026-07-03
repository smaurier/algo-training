# Module 01 — Complexité et raisonnement

> **Objectif** : apprendre à comparer des solutions, parler du coût temps / mémoire de manière précise, et développer l'intuition pour anticiper les goulots d'étranglement.

> **Difficulté** : ⭐⭐

::: info Pas de panique !
Le Big-O peut sembler mathématique au premier abord. En réalité, c'est un outil **pratique** : il te dit « est-ce que ma solution va tenir la charge ou pas ? ». Tu n'as pas besoin de maîtriser les preuves formelles — juste de reconnaître les ordres de grandeur.
:::

---

## Prérequis

- Module 00 terminé
- Savoir écrire des boucles (`for`, `while`) et des fonctions en JavaScript/TypeScript

---

## 1. Pourquoi le Big-O compte

Sur 20 éléments, presque tout semble rapide. Sur 2 millions, les différences deviennent **décisives**.

```typescript
// Exemple concret : chercher un élément dans un tableau

// Approche 1 : scan linéaire — O(n)
function linearSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

// Approche 2 : binary search (tableau trié) — O(log n)
function binarySearch(arr: number[], target: number): number {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
```

Sur 1 million d'éléments :
- Linear search : jusqu'à **1 000 000** de comparaisons
- Binary search : au maximum **20** comparaisons ($\log_2(1\,000\,000) \approx 20$)

> 💡 Le Big-O n'est pas une vérité absolue sur le temps d'exécution réel, mais un **modèle utile** pour anticiper l'effet d'un changement d'échelle.

---

## 2. Les ordres de grandeur à reconnaître

### 2.1 Tableau de référence

| Complexité | Nom | Intuition | Exemples |
|-----------|-----|-----------|----------|
| $O(1)$ | Constante | Le coût ne dépend pas de la taille | `Map.get()`, `Set.has()`, accès par index |
| $O(\log n)$ | Logarithmique | On élimine la moitié à chaque étape | Binary search, BST lookup |
| $O(n)$ | Linéaire | Un passage sur toutes les données | Scan, `Array.find()`, comptage |
| $O(n \log n)$ | Quasi-linéaire | Bon tri généraliste | `Array.sort()`, merge sort, heap sort |
| $O(n^2)$ | Quadratique | Double boucle | Comparaison de toutes les paires |
| $O(2^n)$ | Exponentielle | Combinatoire non élaguée | Sous-ensembles, backtracking brut |
| $O(n!)$ | Factorielle | Permutations | Brute force TSP |

### 2.2 Mise en perspective — opérations par seconde

En supposant ~100 millions d'opérations/seconde en JavaScript :

```
n = 10          → O(n²) = 100 ops           → instantané
n = 1 000       → O(n²) = 1 000 000 ops     → ~10ms ✅
n = 10 000      → O(n²) = 100 000 000 ops   → ~1s ⚠️
n = 100 000     → O(n²) = 10 000 000 000    → ~100s ❌
n = 1 000 000   → O(n²) = 1 000 000 000 000 → ~3h ❌❌❌
```

```
n = 1 000 000   → O(n log n) = ~20 000 000  → ~0.2s ✅
n = 1 000 000   → O(n) = 1 000 000          → ~0.01s ✅✅
```

### 2.3 Diagramme ASCII de croissance

```
Opérations
    ▲
    │                                          O(n²)
    │                                       ╱
    │                                    ╱
    │                                 ╱
    │                              ╱
    │                          ╱
    │                      ╱       O(n log n)
    │                  ╱      ╱─────────────
    │              ╱     ╱──────
    │          ╱    ╱─────                      O(n)
    │      ╱   ╱────────────────────────────────
    │  ╱  ╱───
    │╱╱── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    O(log n)
    │─────────────────────────────────────────── O(1)
    └──────────────────────────────────────────► n
```

---

## 3. Comment calculer la complexité

### 3.1 Règles de base

```typescript
// Règle 1 : Les constantes disparaissent
// O(2n) → O(n)
// O(100) → O(1)

// Règle 2 : On garde le terme dominant
// O(n² + n) → O(n²)
// O(n + log n) → O(n)

// Règle 3 : Boucle simple = O(n)
function sum(arr: number[]): number {
  let total = 0;
  for (const v of arr) { // ← n itérations
    total += v;           // ← O(1) par itération
  }
  return total;
}
// → O(n)

// Règle 4 : Boucle imbriquée = multiplier
function allPairs(arr: number[]): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < arr.length; i++) {       // n fois
    for (let j = i + 1; j < arr.length; j++) {  // ~n/2 fois
      pairs.push([arr[i], arr[j]]);
    }
  }
  return pairs;
}
// → O(n²)

// Règle 5 : Diviser par 2 à chaque étape = O(log n)
function binarySearch(arr: number[], target: number): number {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {   // l'espace est divisé par 2 à chaque itération
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
// → O(log n)

// Règle 6 : Opérations séquentielles = additionner
function processData(arr: number[]): number[] {
  arr.sort((a, b) => a - b);   // O(n log n)
  const unique = [...new Set(arr)]; // O(n)
  return unique.filter(x => x > 0); // O(n)
}
// → O(n log n + n + n) → O(n log n)
```

### 3.2 Piège : les méthodes cachées

```typescript
// ⚠️ Certaines méthodes ont un coût caché

const arr = [1, 2, 3, 4, 5];

// Array.includes → O(n) — scan linéaire
arr.includes(3); // doit potentiellement parcourir tout le tableau

// Array.indexOf → O(n)
arr.indexOf(3);

// Array.splice(0, 1) → O(n) — décale tous les éléments
arr.splice(0, 1);

// Array.push → O(1) amorti
arr.push(6);

// Array.unshift → O(n) — décale tous les éléments
arr.unshift(0);

// Array.sort → O(n log n)
arr.sort();

// Map.get / Map.set → O(1) amorti
const map = new Map();
map.set('key', 'value');
map.get('key');

// Set.has / Set.add → O(1) amorti
const set = new Set();
set.add(1);
set.has(1);
```

> 💡 Quand tu utilises `.includes()` dans une boucle, tu obtiens involontairement O(n²).

---

## 4. Complexité spatiale (mémoire)

La complexité spatiale mesure combien de **mémoire supplémentaire** ton algorithme consomme.

```typescript
// O(1) espace — in-place
function reverseInPlace(arr: number[]): void {
  let i = 0, j = arr.length - 1;
  while (i < j) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
    i++;
    j--;
  }
}

// O(n) espace — crée un nouveau tableau
function reverseNew(arr: number[]): number[] {
  return [...arr].reverse();
}

// O(n) espace — HashMap pour comptage
function countFrequencies(arr: string[]): Map<string, number> {
  const freq = new Map<string, number>(); // ← O(n) espace
  for (const item of arr) {
    freq.set(item, (freq.get(item) ?? 0) + 1);
  }
  return freq;
}
```

### Trade-off temps / mémoire

C'est l'un des compromis les plus fréquents en ingénierie :

```
┌─────────────────────────────────────────────────────────┐
│  GAGNER DU TEMPS           GAGNER DE LA MÉMOIRE         │
│  ─────────────             ──────────────────          │
│  HashMap de lookup         Double boucle               │
│  Pré-calcul (prefix sum)   Recalcul à la volée          │
│  Cache / memoization       Pas de cache                 │
│  Index supplémentaire      Scan séquentiel              │
│                                                          │
│  + rapide                  + économe                     │
│  - plus de RAM             - plus lent                   │
└─────────────────────────────────────────────────────────┘
```

> 💡 En dev fullstack : côté frontend, la mémoire est souvent plus limitée qu'on ne le croit (mobile). Côté backend, le temps de réponse est roi (SLA).

---

## 5. Complexité amortie

Certaines opérations sont **parfois** coûteuses mais **en moyenne** bon marché.

```typescript
// Exemple : Array.push en JavaScript
// - 99% du temps : O(1) — ajoute à la fin du buffer interne
// - 1% du temps : O(n) — le buffer est plein, V8 alloue un buffer 2× plus grand
//   et copie tous les éléments
//
// En moyenne sur n pushes : O(1) amorti

const arr: number[] = [];
for (let i = 0; i < 1_000_000; i++) {
  arr.push(i); // O(1) amorti
}
// Coût total : O(n) pour n pushes → O(1) par push en moyenne

// Même logique pour Map.set / Set.add : le rehashing occasionnel
// est absorbé par les milliers d'insertions O(1) qui précèdent.
```

### Analogie : le péage automatique

Imagine un péage sur autoroute. 99% du temps, la barrière s'ouvre instantanément (O(1)). Mais une fois par an, ton badge doit être rechargé — ça prend plus de temps. En moyenne sur toute l'année, le coût par passage reste quasi constant.

---

## 6. Meilleur cas, pire cas, cas moyen

```typescript
// Prenons Array.includes sur un tableau de n éléments :

const arr = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// Meilleur cas : l'élément est le premier → O(1)
arr.includes(10);

// Pire cas : l'élément est le dernier ou absent → O(n)
arr.includes(100);
arr.includes(999);

// Cas moyen (élément aléatoire) : O(n/2) → O(n)
```

> 💡 Le Big-O exprime habituellement le **pire cas**. C'est la garantie la plus sûre : « dans le pire des cas, ça ne sera jamais pire que ça ».

---

## 7. Reconnaître la complexité d'un pattern

| Pattern de code | Complexité typique |
|----------------|-------------------|
| Accès direct (`map.get`, `arr[i]`) | $O(1)$ |
| Boucle simple sur n éléments | $O(n)$ |
| Boucle avec division par 2 (`while lo < hi`, `mid`) | $O(\log n)$ |
| Deux boucles imbriquées sur n | $O(n^2)$ |
| Tri + scan | $O(n \log n)$ |
| Trois boucles imbriquées | $O(n^3)$ |
| Récursion avec 2 branches de taille n-1 | $O(2^n)$ |
| Test de toutes les permutations | $O(n!)$ |

```typescript
// Exercice mental : quelle est la complexité ?

// Cas 1
for (let i = 0; i < n; i++) {          // O(n)
  for (let j = 0; j < n; j++) {        // O(n)
    console.log(i, j);                 // O(1)
  }
}
// → O(n × n × 1) = O(n²)

// Cas 2
for (let i = 0; i < n; i++) {          // O(n)
  for (let j = 0; j < 100; j++) {      // O(100) = O(1)
    console.log(i, j);
  }
}
// → O(n × 1) = O(n) — la boucle interne est constante

// Cas 3
for (let i = 1; i < n; i *= 2) {       // O(log n)
  console.log(i);
}
// → O(log n) — i double à chaque itération

// Cas 4
for (let i = 0; i < n; i++) {          // O(n)
  for (let j = i; j < n; j++) {        // O(n - i) en moyenne
    console.log(i, j);
  }
}
// → n + (n-1) + (n-2) + ... + 1 = n(n+1)/2 → O(n²)

// Cas 5
const sorted = [...arr].sort((a, b) => a - b); // O(n log n)
const idx = binarySearch(sorted, target);        // O(log n)
// → O(n log n + log n) = O(n log n)
```

---

## 8. Questions d'ingénieur face à un problème de performance

Quand une solution est trop lente en production, pose-toi ces questions :

1. **Les données sont-elles triées ?** → Si oui, binary search au lieu de scan.
2. **Peut-on pré-calculer ?** → Prefix sums, index, cache.
3. **Le coût de mise à jour compte-t-il autant que la lecture ?** → Write-heavy vs read-heavy design.
4. **Faut-il optimiser pour le pire cas ou le cas moyen ?** → Rate limiting (pire cas) vs ranking (cas moyen).
5. **Quelle est la taille réelle des données ?** → Parfois O(n²) sur n=50 est meilleur que O(n log n) à cause des constantes.

```typescript
// Exemple terrain : filtre utilisateur côté serveur
// 50 000 utilisateurs, chaque utilisateur a des tags (3-5 tags)
// Requête : trouver tous les users ayant au moins 2 tags d'une liste donnée

// ❌ Approche naïve O(u × t × q) — triple boucle
function filterNaive(users: User[], queryTags: string[]): User[] {
  return users.filter(u => {
    let count = 0;
    for (const tag of u.tags) {
      for (const qt of queryTags) {
        if (tag === qt) count++;
      }
    }
    return count >= 2;
  });
}

// ✅ Approche optimisée O(u × t) — Set pour les query tags
function filterOptimized(users: User[], queryTags: string[]): User[] {
  const tagSet = new Set(queryTags); // O(q)
  return users.filter(u => {
    let count = 0;
    for (const tag of u.tags) {
      if (tagSet.has(tag)) count++; // O(1) au lieu de O(q)
    }
    return count >= 2;
  });
}

type User = { id: string; tags: string[] };
```

---

## 9. Benchmarking en JavaScript

### 9.1 Outils de base

```typescript
// console.time / console.timeEnd — simple mais suffisant
console.time('operation');
// ... code à mesurer
console.timeEnd('operation');

// performance.now() — plus précis
const start = performance.now();
// ... code à mesurer
const elapsed = performance.now() - start;
console.log(`${elapsed.toFixed(3)}ms`);
```

### 9.2 Fonction utilitaire de benchmark

```typescript
function benchmark(label: string, fn: () => void, iterations = 100): void {
  // Warmup — laisse le JIT compiler
  for (let i = 0; i < 10; i++) fn();

  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }

  times.sort((a, b) => a - b);
  const median = times[Math.floor(times.length / 2)];
  const p95 = times[Math.floor(times.length * 0.95)];
  const avg = times.reduce((s, t) => s + t, 0) / times.length;

  console.log(`${label}:`);
  console.log(`  median: ${median.toFixed(3)}ms`);
  console.log(`  avg:    ${avg.toFixed(3)}ms`);
  console.log(`  p95:    ${p95.toFixed(3)}ms`);
}
```

### 9.3 Pièges du benchmarking

```typescript
// Piège 1 : le JIT optimise le code mort
// Si le résultat n'est jamais utilisé, V8 peut supprimer le calcul
let result = 0;
benchmark('sum', () => {
  result = arr.reduce((s, v) => s + v, 0);
});
console.log(result); // ← force V8 à garder le calcul

// Piège 2 : le garbage collector peut interférer
// → utiliser la médiane plutôt que la moyenne

// Piège 3 : les petits tableaux ne sont pas représentatifs
// → toujours tester avec des tailles réalistes (10k, 100k, 1M)
```

---

## 10. Complexité des opérations JavaScript natives

### 10.1 Array

| Opération | Complexité | Explication |
|-----------|-----------|-------------|
| `arr[i]` | $O(1)$ | Accès direct par index |
| `arr.push(x)` | $O(1)$ amorti | Ajout en fin |
| `arr.pop()` | $O(1)$ | Suppression en fin |
| `arr.unshift(x)` | $O(n)$ | Décale tout vers la droite |
| `arr.shift()` | $O(n)$ | Décale tout vers la gauche |
| `arr.splice(i, 1)` | $O(n)$ | Décale les éléments après i |
| `arr.includes(x)` | $O(n)$ | Scan linéaire |
| `arr.indexOf(x)` | $O(n)$ | Scan linéaire |
| `arr.find(fn)` | $O(n)$ | Scan avec prédicat |
| `arr.filter(fn)` | $O(n)$ | Parcours complet + nouveau tableau |
| `arr.map(fn)` | $O(n)$ | Parcours complet + nouveau tableau |
| `arr.sort()` | $O(n \log n)$ | TimSort (hybride merge/insertion) |
| `arr.concat(b)` | $O(n + m)$ | Copie les deux tableaux |
| `[...arr]` (spread) | $O(n)$ | Copie complète |

### 10.2 Map et Set

| Opération | Complexité | Explication |
|-----------|-----------|-------------|
| `map.get(k)` | $O(1)$ amorti | Lookup par hash |
| `map.set(k, v)` | $O(1)$ amorti | Insertion/mise à jour |
| `map.has(k)` | $O(1)$ amorti | Test de présence |
| `map.delete(k)` | $O(1)$ amorti | Suppression |
| `set.has(x)` | $O(1)$ amorti | Test de présence |
| `set.add(x)` | $O(1)$ amorti | Insertion |
| Itération (`for...of`) | $O(n)$ | Parcours de tous les éléments |

### 10.3 String

| Opération | Complexité | Notes |
|-----------|-----------|-------|
| `str[i]` | $O(1)$ | Accès par index |
| `str.includes(sub)` | $O(n × m)$ | Recherche de sous-chaîne |
| `str.indexOf(sub)` | $O(n × m)$ | Idem |
| `str.slice(i, j)` | $O(j - i)$ | Copie |
| `str + other` | $O(n + m)$ | Concaténation → nouveau string |
| `str.split(sep)` | $O(n)$ | Parcours + allocations |

---

## Démonstrations

### Demo 1 — Visualiser la différence O(n) vs O(n²)

```typescript
function timeForSize(n: number): { linear: number; quadratic: number } {
  const arr = Array.from({ length: n }, (_, i) => i);
  const target = n - 1;

  // O(n) — un seul scan
  const t1 = performance.now();
  arr.includes(target);
  const linearMs = performance.now() - t1;

  // O(n²) — tous les couples
  const t2 = performance.now();
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] + arr[j] === target * 2) break;
    }
  }
  const quadMs = performance.now() - t2;

  return { linear: linearMs, quadratic: quadMs };
}

for (const n of [1_000, 5_000, 10_000, 50_000]) {
  const { linear, quadratic } = timeForSize(n);
  console.log(
    `n=${n.toLocaleString().padStart(6)} | O(n): ${linear.toFixed(3).padStart(8)}ms | O(n²): ${quadratic.toFixed(1).padStart(10)}ms`
  );
}
// Observe comment O(n²) explose quand n × 5 mais le temps × 25
```

### Demo 2 — La Map comme accélérateur

```typescript
// Problème : trouver deux nombres dans un tableau dont la somme = target
// C'est le fameux "Two Sum"

// ❌ O(n²) — double boucle
function twoSumNaive(nums: number[], target: number): [number, number] | null {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return null;
}

// ✅ O(n) — HashMap
function twoSumMap(nums: number[], target: number): [number, number] | null {
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

const nums = Array.from({ length: 100_000 }, (_, i) => i);

console.time('twoSum naive');
twoSumNaive(nums, 199_997);
console.timeEnd('twoSum naive');

console.time('twoSum map');
twoSumMap(nums, 199_997);
console.timeEnd('twoSum map');
```

### Demo 3 — Quand O(n²) est acceptable

```typescript
// Parfois, un O(n²) est parfaitement adapté

// Configuration admin : 30 rôles, on vérifie les conflits entre paires
const roles = Array.from({ length: 30 }, (_, i) => `role_${i}`);

console.time('30 roles O(n²)');
const conflicts: string[] = [];
for (let i = 0; i < roles.length; i++) {
  for (let j = i + 1; j < roles.length; j++) {
    // Simulation de check de conflit
    if (roles[i].length === roles[j].length) {
      conflicts.push(`${roles[i]} ↔ ${roles[j]}`);
    }
  }
}
console.timeEnd('30 roles O(n²)');
// → <1ms — O(n²) avec n=30 = 435 opérations. Irréprochable.

// Leçon : n'optimise pas avant de savoir si c'est nécessaire.
```

### Demo 4 — Impact de unshift vs push

```typescript
const N = 100_000;

// push — O(1) amorti × N = O(N)
console.time('push × 100k');
const arrPush: number[] = [];
for (let i = 0; i < N; i++) arrPush.push(i);
console.timeEnd('push × 100k');

// unshift — O(n) × N = O(N²)
console.time('unshift × 100k');
const arrUnshift: number[] = [];
for (let i = 0; i < N; i++) arrUnshift.unshift(i);
console.timeEnd('unshift × 100k');

// Le unshift sera ~100× plus lent car chaque insertion
// décale tous les éléments existants vers la droite
```

### Demo 5 — Préfixes et coûts cachés des strings

```typescript
// ⚠️ La concaténation de strings en boucle cache un coût O(n²)

const N = 50_000;

// ❌ O(n²) — chaque += crée un nouveau string
console.time('concat +=');
let result1 = '';
for (let i = 0; i < N; i++) {
  result1 += 'x'; // copie i caractères + 1 à chaque itération
}
console.timeEnd('concat +=');

// ✅ O(n) — Array.join
console.time('array join');
const parts: string[] = [];
for (let i = 0; i < N; i++) parts.push('x');
const result2 = parts.join('');
console.timeEnd('array join');
```

---

## Points clés

1. Le Big-O est un modèle de **changement d'échelle**, pas une mesure exacte du temps.
2. Apprends les 7 ordres : $O(1)$, $O(\log n)$, $O(n)$, $O(n \log n)$, $O(n^2)$, $O(2^n)$, $O(n!)$.
3. La complexité spatiale compte autant que la complexité temporelle.
4. Trade-off classique : plus de mémoire → plus de vitesse (HashMap, cache, pré-calcul).
5. Les méthodes natives JS ont des coûts cachés : `.includes()` dans une boucle = $O(n^2)$.
6. `Array.sort()` est $O(n \log n)$, `Map.get()` est $O(1)$ amorti.
7. Mesure toujours → `performance.now()` + médiane sur plusieurs runs.
8. N'optimise que quand c'est **nécessaire** : O(n²) sur n=30 est parfait.
9. Le pire cas guide les garanties de performance (SLA, rate limiting).
10. Benchmarke avec des tailles réalistes, pas avec 10 éléments.

---

## Pour aller plus loin

- [Big-O Cheat Sheet](https://www.bigocheatsheet.com/) — complexités visuelles
- [Time Complexity of JavaScript Array Methods](https://dev.to/lukocastillo/time-complexity-big-0-for-javascript-array-methods-and-examples-mlg) — référence détaillée
- [MDN — Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) — mesure de temps
- [VisuAlgo — Sorting](https://visualgo.net/en/sorting) — visualisations animées de tris
- [V8 Blog — Array internals](https://v8.dev/blog/elements-kinds) — comment V8 optimise les tableaux

---

## Si tu es perdu

Retiens ces 5 choses :

1. $O(n)$ = une boucle. $O(n^2)$ = deux boucles imbriquées. $O(\log n)$ = diviser par 2 à chaque étape.
2. Plus n est grand, plus l'effet du Big-O est visible.
3. `Map` et `Set` offrent des lookups en $O(1)$ — utilise-les pour éviter les doubles boucles.
4. Mesure plutôt que deviner.
5. Commence simple, optimise si nécessaire.

---

## Défi

> Analyse la complexité temps ET espace de cette fonction. Puis propose une version plus efficace.

```typescript
function findDuplicates(arr: string[]): string[] {
  const duplicates: string[] = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j] && !duplicates.includes(arr[i])) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
}
```

<details>
<summary>Réponse</summary>

**Analyse de la version originale :**
- Double boucle : $O(n^2)$
- `.includes()` dans la boucle interne : $O(d)$ où d = nombre de doublons trouvés
- **Pire cas total : $O(n^2 \times d)$ → quasi $O(n^3)$**
- Espace : $O(d)$ pour le tableau de doublons

**Version optimisée — $O(n)$ temps et espace :**

```typescript
function findDuplicatesOptimized(arr: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const item of arr) {
    if (seen.has(item)) {
      duplicates.add(item); // Set gère la déduplication automatiquement
    } else {
      seen.add(item);
    }
  }
  return [...duplicates];
}
// O(n) temps — un seul passage avec des lookups O(1)
// O(n) espace — deux Sets de taille ≤ n
```

</details>

---

::: tip Parcours recommandé
📖 Module terminé → Fais la **visualisation Complexity Growth** pour voir les courbes → puis le **Lab 01** → et le **Quiz 01**.
:::
