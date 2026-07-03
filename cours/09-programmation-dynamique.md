# Module 09 — Programmation dynamique

> **Objectif** : comprendre l'approche DP (top-down avec mémoïsation et bottom-up avec tabulation), identifier les sous-problèmes qui se chevauchent, et résoudre les classiques : Fibonacci, knapsack, LCS, coins, grille.

> **Difficulté** : ⭐⭐⭐⭐⭐

::: info Pas de panique !
La programmation dynamique a une réputation terrifiante, mais le concept est simple : **si tu résous le même sous-problème plusieurs fois, mémorise la réponse**. C'est du cache appliqué à la récursion. Si tu sais faire de la récursion, tu sais faire du DP.
:::

---

## Prérequis

- Module 04 (récursion — la base du DP top-down)
- Module 01 (complexité — comprendre pourquoi le DP améliore les performances)

---

## 1. Le problème : sous-problèmes qui se chevauchent

```
Fibonacci naïf :

fib(5)
├── fib(4)
│   ├── fib(3)
│   │   ├── fib(2) ← calculé 3 fois !
│   │   └── fib(1)
│   └── fib(2) ← calculé ici aussi
└── fib(3) ← calculé ici aussi
    ├── fib(2) ← et encore
    └── fib(1)

Complexité : O(2^n) → CATASTROPHIQUE pour n > 40
```

```typescript
// Version naïve — O(2^n)
function fibNaive(n: number): number {
  if (n <= 1) return n;
  return fibNaive(n - 1) + fibNaive(n - 2);
}

console.time('naive');
console.log(fibNaive(40)); // 102334155 — prend plusieurs secondes
console.timeEnd('naive');
```

---

## 2. Approche Top-Down (Mémoïsation)

```
Principe : garder la récursion naturelle, mais cacher les résultats

fib(5) — avec cache
├── fib(4) — cache miss → calcul
│   ├── fib(3) — cache miss → calcul
│   │   ├── fib(2) — cache miss → calcul → 1
│   │   └── fib(1) → 1
│   │   → cache[3] = 2
│   └── fib(2) — CACHE HIT → 1
│   → cache[4] = 3
└── fib(3) — CACHE HIT → 2
→ cache[5] = 5

Complexité : O(n) temps, O(n) espace
```

```typescript
// Top-down avec Map
function fibMemo(n: number, cache = new Map<number, number>()): number {
  if (n <= 1) return n;
  if (cache.has(n)) return cache.get(n)!;

  const result = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);
  cache.set(n, result);
  return result;
}

console.time('memo');
console.log(fibMemo(40)); // 102334155 — instantané
console.timeEnd('memo');
```

### Pattern générique de mémoïsation

```typescript
// Wrapper générique pour mémoïser n'importe quelle fonction
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

const fibMemoized = memoize((n: number): number => {
  if (n <= 1) return n;
  return fibMemoized(n - 1) + fibMemoized(n - 2);
});
```

---

## 3. Approche Bottom-Up (Tabulation)

```
Principe : remplir un tableau du cas de base vers la solution finale

dp[0] = 0
dp[1] = 1
dp[2] = dp[1] + dp[0] = 1
dp[3] = dp[2] + dp[1] = 2
dp[4] = dp[3] + dp[2] = 3
dp[5] = dp[4] + dp[3] = 5

Pas de récursion → pas de stack overflow → plus rapide en pratique
```

```typescript
// Bottom-up avec tableau
function fibTable(n: number): number {
  if (n <= 1) return n;
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  return dp[n];
}

// Optimisation mémoire : on n'a besoin que des 2 dernières valeurs
function fibOptimal(n: number): number {
  if (n <= 1) return n;
  let prev2 = 0;
  let prev1 = 1;

  for (let i = 2; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }

  return prev1;
}
```

---

## 4. Identifier un problème DP

```
Checklist pour reconnaître un problème DP :

✅ 1. Sous-structure optimale
   → La solution optimale contient des solutions optimales de sous-problèmes
   → "Le meilleur chemin de A à C passe par le meilleur chemin de A à B"

✅ 2. Sous-problèmes qui se chevauchent
   → Les mêmes sous-problèmes sont résolus plusieurs fois
   → Si tu dessines l'arbre de récursion, tu vois des nœuds en double

✅ 3. Formulation récursive possible
   → Tu peux exprimer dp[i] en fonction de dp[i-1], dp[i-2], etc.

Mots-clés dans l'énoncé :
- "minimum/maximum de..."
- "nombre de façons de..."
- "est-il possible de..."
- "plus longue/courte sous-séquence..."
```

---

## 5. Climbing Stairs

```typescript
// Combien de façons de monter n marches (1 ou 2 marches à la fois) ?

// Top-down
function climbStairsMemo(n: number, cache = new Map<number, number>()): number {
  if (n <= 2) return n;
  if (cache.has(n)) return cache.get(n)!;
  const result = climbStairsMemo(n - 1, cache) + climbStairsMemo(n - 2, cache);
  cache.set(n, result);
  return result;
}

// Bottom-up
function climbStairs(n: number): number {
  if (n <= 2) return n;
  let prev2 = 1; // 1 façon de monter 1 marche
  let prev1 = 2; // 2 façons de monter 2 marches

  for (let i = 3; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }

  return prev1;
}

console.log(climbStairs(5)); // 8
// 1+1+1+1+1, 2+1+1+1, 1+2+1+1, 1+1+2+1, 1+1+1+2, 2+2+1, 2+1+2, 1+2+2
```

---

## 6. Coin Change

```typescript
// Trouver le nombre minimum de pièces pour atteindre un montant
// Classique en entretien + cas réel (systèmes de paiement)

// Relation de récurrence :
// dp[amount] = min(dp[amount - coin] + 1) pour chaque coin

function coinChange(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // 0 pièces pour le montant 0

  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && dp[a - coin] !== Infinity) {
        dp[a] = Math.min(dp[a], dp[a - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log(coinChange([1, 5, 10, 25], 36)); // 3 (25 + 10 + 1)
console.log(coinChange([2], 3));              // -1 (impossible)

// Variante : compter le NOMBRE de façons
function coinChangeWays(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;

  for (const coin of coins) {
    for (let a = coin; a <= amount; a++) {
      dp[a] += dp[a - coin];
    }
  }

  return dp[amount];
}

console.log(coinChangeWays([1, 5, 10, 25], 36)); // 38 façons
```

---

## 7. Longest Common Subsequence (LCS)

```typescript
// Trouver la plus longue sous-séquence commune entre deux chaînes
// Utilisation : diff (Git), correcteur orthographique, bioinformatique

// Relation de récurrence :
// Si s1[i] === s2[j] : dp[i][j] = dp[i-1][j-1] + 1
// Sinon : dp[i][j] = max(dp[i-1][j], dp[i][j-1])

function lcs(s1: string, s2: string): string {
  const m = s1.length;
  const n = s2.length;

  // Construire la table DP
  const dp: number[][] = Array.from({ length: m + 1 },
    () => new Array(n + 1).fill(0),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Reconstituer la sous-séquence
  let result = '';
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (s1[i - 1] === s2[j - 1]) {
      result = s1[i - 1] + result;
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return result;
}

console.log(lcs('ABCBDAB', 'BDCAB')); // 'BCAB' (longueur 4)

// Table DP visualisée :
//       ""  B  D  C  A  B
//   ""   0  0  0  0  0  0
//   A    0  0  0  0  1  1
//   B    0  1  1  1  1  2
//   C    0  1  1  2  2  2
//   B    0  1  1  2  2  3
//   D    0  1  2  2  2  3
//   A    0  1  2  2  3  3
//   B    0  1  2  2  3  4
```

---

## 8. 0/1 Knapsack (Sac à dos)

```typescript
// Maximiser la valeur d'objets dans un sac de capacité limitée
// Chaque objet peut être pris ou non (0/1)

interface Item { weight: number; value: number; name: string }

function knapsack(items: Item[], capacity: number): { maxValue: number; selected: string[] } {
  const n = items.length;
  const dp: number[][] = Array.from({ length: n + 1 },
    () => new Array(capacity + 1).fill(0),
  );

  for (let i = 1; i <= n; i++) {
    const { weight, value } = items[i - 1];
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w]; // Ne pas prendre l'objet
      if (weight <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - weight] + value);
      }
    }
  }

  // Reconstituer la sélection
  const selected: string[] = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(items[i - 1].name);
      w -= items[i - 1].weight;
    }
  }

  return { maxValue: dp[n][capacity], selected: selected.reverse() };
}

const items: Item[] = [
  { name: 'Laptop', weight: 3, value: 2000 },
  { name: 'Guitar', weight: 1, value: 1500 },
  { name: 'Turntable', weight: 4, value: 3000 },
  { name: 'Phone', weight: 1, value: 2000 },
];

console.log(knapsack(items, 4));
// { maxValue: 5500, selected: ['Guitar', 'Phone', 'Laptop'] }
// Poids total : 1 + 1 + 3 = 5... oops, trop lourd
// En réalité : { maxValue: 5500, selected: ['Laptop', 'Phone'] } → 3+1=4 ✅
```

---

## 9. DP sur grille

```typescript
// Nombre de chemins de (0,0) à (m-1, n-1) en ne pouvant aller que droite ou bas

function uniquePaths(m: number, n: number): number {
  const dp: number[][] = Array.from({ length: m },
    () => new Array(n).fill(1),
  );

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    }
  }

  return dp[m - 1][n - 1];
}

console.log(uniquePaths(3, 7)); // 28

// Variante avec obstacles
function uniquePathsWithObstacles(grid: number[][]): number {
  const m = grid.length;
  const n = grid[0].length;
  if (grid[0][0] === 1 || grid[m - 1][n - 1] === 1) return 0;

  const dp: number[][] = Array.from({ length: m },
    () => new Array(n).fill(0),
  );
  dp[0][0] = 1;

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === 1) { dp[i][j] = 0; continue; }
      if (i > 0) dp[i][j] += dp[i - 1][j];
      if (j > 0) dp[i][j] += dp[i][j - 1];
    }
  }

  return dp[m - 1][n - 1];
}
```

---

## 10. Longest Increasing Subsequence (LIS)

```typescript
// Plus longue sous-séquence strictement croissante

// O(n²) — classique
function lis(nums: number[]): number {
  const n = nums.length;
  const dp = new Array(n).fill(1);

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }

  return Math.max(...dp);
}

console.log(lis([10, 9, 2, 5, 3, 7, 101, 18])); // 4 → [2, 3, 7, 101] ou [2, 5, 7, 18]

// O(n log n) — avec binary search (module 04)
function lisOptimal(nums: number[]): number {
  const tails: number[] = [];

  for (const num of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < num) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = num;
  }

  return tails.length;
}
```

---

## 11. Cas terrain fullstack

### 11.1 Calcul de prix avec remises cumulées

```typescript
// Trouver le prix minimum en appliquant des remises combinables

interface Discount {
  minQuantity: number;
  pricePerUnit: number;
}

function bestPrice(quantity: number, discounts: Discount[]): number {
  const dp = new Array(quantity + 1).fill(Infinity);
  dp[0] = 0;

  for (let q = 1; q <= quantity; q++) {
    for (const { minQuantity, pricePerUnit } of discounts) {
      if (minQuantity <= q) {
        dp[q] = Math.min(dp[q], dp[q - minQuantity] + minQuantity * pricePerUnit);
      }
    }
  }

  return dp[quantity];
}

const discounts: Discount[] = [
  { minQuantity: 1, pricePerUnit: 10 },   // à l'unité
  { minQuantity: 5, pricePerUnit: 8 },    // lot de 5
  { minQuantity: 10, pricePerUnit: 6 },   // lot de 10
];

console.log(bestPrice(12, discounts)); // 10*6 + 2*8 = 76 ? Non: 10*6 + 2*10 = 80
// Calcul exact : dp[10]=60, dp[11]=68, dp[12]=76 (10*6 + 1*8 + 1*8)
```

### 11.2 Text wrapping (minimiser la laideur)

```typescript
// Line breaking optimisé — même principe que TeX/LaTeX

function textWrap(words: string[], lineWidth: number): string[] {
  const n = words.length;
  const cost = (i: number, j: number): number => {
    const len = words.slice(i, j + 1).reduce((s, w) => s + w.length, 0) + (j - i);
    if (len > lineWidth) return Infinity;
    return (lineWidth - len) ** 2; // Carré de l'espace inutilisé
  };

  const dp = new Array(n).fill(Infinity);
  const breaks = new Array(n).fill(0);

  for (let j = 0; j < n; j++) {
    for (let i = 0; i <= j; i++) {
      const c = cost(i, j);
      if (c === Infinity) continue;
      const total = (i > 0 ? dp[i - 1] : 0) + c;
      if (total < dp[j]) {
        dp[j] = total;
        breaks[j] = i;
      }
    }
  }

  // Reconstituer les lignes
  const lines: string[] = [];
  let j = n - 1;
  while (j >= 0) {
    const i = breaks[j];
    lines.unshift(words.slice(i, j + 1).join(' '));
    j = i - 1;
  }

  return lines;
}

console.log(textWrap(
  ['The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'],
  15,
));
```

---

## Comparaison Top-Down vs Bottom-Up

```
┌───────────────────────┬──────────────────────┬──────────────────────┐
│                       │  Top-Down (Mémo)     │  Bottom-Up (Tab)     │
├───────────────────────┼──────────────────────┼──────────────────────┤
│  Style                │  Récursif + cache    │  Itératif + tableau  │
│  Implémentation       │  Plus naturelle      │  Plus efficace       │
│  Sous-problèmes       │  Résout seulement    │  Résout TOUS les     │
│                       │  ceux nécessaires    │  sous-problèmes      │
│  Stack overflow       │  Possible (n grand)  │  Jamais              │
│  Optimisation mémoire │  Difficile           │  Possible (variables)│
│  Debug                │  Plus facile         │  Tableau visualisable│
│  Recommandation       │  Prototypage / appren│  Production          │
└───────────────────────┴──────────────────────┴──────────────────────┘
```

---

## Démonstrations

### Demo 1 — House Robber

```typescript
// Un voleur ne peut pas cambrioler deux maisons adjacentes
// Maximiser le butin
function rob(houses: number[]): number {
  const n = houses.length;
  if (n === 0) return 0;
  if (n === 1) return houses[0];

  let prev2 = 0;
  let prev1 = 0;

  for (const money of houses) {
    const current = Math.max(prev1, prev2 + money);
    prev2 = prev1;
    prev1 = current;
  }

  return prev1;
}

console.log(rob([2, 7, 9, 3, 1])); // 12 (2 + 9 + 1)
console.log(rob([1, 2, 3, 1]));     // 4 (1 + 3)
```

### Demo 2 — Word Break

```typescript
// Vérifier si une chaîne peut être segmentée en mots du dictionnaire
function wordBreak(s: string, wordDict: string[]): boolean {
  const words = new Set(wordDict);
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;

  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && words.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }

  return dp[s.length];
}

console.log(wordBreak('leetcode', ['leet', 'code'])); // true
console.log(wordBreak('catsandog', ['cats', 'dog', 'sand', 'and', 'cat'])); // false
```

---

## Points clés

1. **DP = récursion + cache** (ou tabulation bottom-up).
2. Deux conditions : **sous-structure optimale** + **sous-problèmes chevauchants**.
3. **Top-down** = plus intuitif, **bottom-up** = plus performant.
4. Chercher la **relation de récurrence** : comment exprimer `dp[i]` en fonction des cases précédentes.
5. Souvent, on peut **réduire l'espace** en ne gardant que les dernières lignes/valeurs.
6. Les classiques : Fibonacci, coin change, knapsack, LCS, LIS, grid paths, house robber, word break.
7. En entretien : dessiner l'arbre de récursion, identifier les overlaps, écrire la récurrence.
8. En production : calcul de prix, text wrapping, edit distance (diff), planning optimisé.

---

## Pour aller plus loin

- [VisuAlgo — DP](https://visualgo.net/en/recursion) — visualisation des arbres de récursion
- [NeetCode — Dynamic Programming](https://neetcode.io/roadmap) — 40+ problèmes classés
- [MIT 6.006 — DP Lectures](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/) — cours complet

---

## Si tu es perdu

1. DP = ne pas recalculer deux fois la même chose.
2. Top-down = récursion + mémo (Map).
3. Bottom-up = boucle + tableau.
4. Trouve la récurrence : `dp[i] = f(dp[i-1], dp[i-2], ...)`.
5. Commence TOUJOURS par le brute force récursif, puis optimise.

---

## Défi

> Calcule la **Edit Distance** (distance de Levenshtein) entre deux chaînes. C'est le nombre minimum d'opérations (insertion, suppression, remplacement) pour transformer une chaîne en une autre. C'est l'algorithme derrière `git diff` et les correcteurs orthographiques.

<details>
<summary>Réponse</summary>

```typescript
function editDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 },
    () => new Array(n + 1).fill(0),
  );

  // Cas de base : transformer une chaîne vide
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; // Même caractère → pas d'opération
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // Suppression
          dp[i][j - 1],     // Insertion
          dp[i - 1][j - 1], // Remplacement
        );
      }
    }
  }

  return dp[m][n];
}

console.log(editDistance('kitten', 'sitting')); // 3
// kitten → sitten (remplacement k→s)
// sitten → sittin (remplacement e→i)
// sittin → sitting (insertion g)
```

</details>

---

::: tip Parcours recommandé
📖 Module terminé → Fais le **Lab 09** (DP sur problèmes réels) → puis le **Quiz 09**.
:::
