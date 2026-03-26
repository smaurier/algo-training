# Module 02 — Tableaux, chaînes, hash maps

> **Objectif** : maîtriser les structures de base du quotidien, reconnaître quand un simple tableau ne suffit plus, et manipuler `Map`/`Set` comme des réflexes.

> **Difficulté** : ⭐⭐

::: info Pas de panique !
Tu utilises déjà des tableaux et des objets tous les jours. Ce module va te montrer **quand et pourquoi** passer à `Map`, `Set`, ou changer d'approche — avec des cas concrets et des benchmarks.
:::

---

## Prérequis

- Module 01 (complexité) terminé
- Savoir utiliser `Array`, `Object`, `Map`, `Set` en JavaScript

---

## 1. Les tableaux : structure par défaut

### 1.1 Forces et limites

```
┌───────────────────────────────────────────────────────────┐
│  FORCES                      │  LIMITES                   │
│  ─────────                   │  ────────                  │
│  Accès par index O(1)        │  Recherche O(n)            │
│  Push/pop en O(1) amorti     │  Insertion au milieu O(n)  │
│  Parcours séquentiel rapide  │  Suppression par valeur O(n)│
│  Méthodes built-in riches    │  Pas de lookup par clé      │
│  Ordonné naturellement       │  Doublons possibles         │
└───────────────────────────────────────────────────────────┘
```

### 1.2 Opérations courantes et leur coût

```typescript
const users = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];

// ✅ Rapide — O(1)
users[2];                    // accès par index
users.push('Frank');         // ajout en fin
users.pop();                 // suppression en fin
users.length;                // lecture de la longueur

// ⚠️ Lent — O(n)
users.includes('Diana');     // scan linéaire
users.indexOf('Charlie');    // scan linéaire
users.unshift('Zoe');        // décalage de tout le tableau
users.splice(2, 1);          // suppression + décalage

// ⚠️ Attention aux boucles imbriquées involontaires
// Ceci est O(n²) :
const duplicates = users.filter((u, i) => users.indexOf(u) !== i);
```

### 1.3 Itération efficace

```typescript
const prices = [10.5, 20.0, 30.75, 15.0, 45.25];

// for...of — le plus lisible pour un parcours complet
for (const price of prices) {
  console.log(price);
}

// for classique — quand tu as besoin de l'index
for (let i = 0; i < prices.length; i++) {
  console.log(`#${i}: ${prices[i]}`);
}

// forEach — acceptable mais impossible à break
prices.forEach((price, i) => console.log(`#${i}: ${price}`));

// ❌ for...in — NE PAS UTILISER sur les tableaux
// Itère les clés comme strings, inclut les propriétés du prototype
```

---

## 2. Les chaînes : tableaux spécialisés

Les problèmes de chaînes sont souvent des problèmes de tableaux avec des contraintes supplémentaires.

### 2.1 Propriétés clés en JavaScript

```typescript
const str = 'hello world';

// Les strings sont IMMUTABLES en JavaScript
// Chaque modification crée un nouveau string
str.toUpperCase();    // nouveau string — O(n)
str.slice(0, 5);      // nouveau string — O(k)
str.replace('o', 'a'); // nouveau string — O(n)

// Accès par caractère — O(1)
str[0];  // 'h'
str.charAt(4); // 'o'

// ⚠️ Concaténation en boucle = O(n²) caché
let result = '';
for (let i = 0; i < 10_000; i++) {
  result += 'x'; // chaque += copie tout le string existant
}
// Total : 1 + 2 + 3 + ... + n = n(n+1)/2 → O(n²)

// ✅ Solution : construire un tableau puis .join()
const parts: string[] = [];
for (let i = 0; i < 10_000; i++) {
  parts.push('x');
}
const result2 = parts.join(''); // O(n)
```

### 2.2 Patterns classiques sur les chaînes

```typescript
// Pattern 1 — Comptage de fréquences de caractères
function charFrequency(str: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const char of str) {
    freq.set(char, (freq.get(char) ?? 0) + 1);
  }
  return freq;
}

console.log(charFrequency('abracadabra'));
// Map { 'a' => 5, 'b' => 2, 'r' => 2, 'c' => 1, 'd' => 1 }

// Pattern 2 — Vérifier si deux strings sont des anagrammes
function areAnagrams(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const freq = new Map<string, number>();
  for (const c of a) freq.set(c, (freq.get(c) ?? 0) + 1);
  for (const c of b) {
    const count = freq.get(c);
    if (!count) return false;
    freq.set(c, count - 1);
  }
  return true;
}

console.log(areAnagrams('listen', 'silent')); // true

// Pattern 3 — Plus long préfixe commun
function longestCommonPrefix(strs: string[]): string {
  if (strs.length === 0) return '';
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (prefix === '') return '';
    }
  }
  return prefix;
}

console.log(longestCommonPrefix(['flower', 'flow', 'flight'])); // 'fl'
```

---

## 3. `Map` et `Set` — les accélérateurs

### 3.1 Quand passer de Array à Map/Set

```
┌──────────────────────────────────────────────────────────────────┐
│  SITUATION                              │  UTILISE              │
│  ─────────                              │  ────────             │
│  "Cet élément existe-t-il ?"            │  Set                  │
│  "Combien de fois cet élément ?"        │  Map<string, number>  │
│  "Quel est le prix de ce produit ?"     │  Map<id, Product>     │
│  "Quels IDs sont en double ?"           │  Set + parcours       │
│  "Grouper par catégorie"                │  Map<string, T[]>     │
│  "Intersection de deux listes"          │  Set + .has()         │
│  Garder l'ordre naturel                 │  Array                │
│  Accès par position                     │  Array                │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Map en profondeur

```typescript
// Map vs Object : quand utiliser Map ?
// ✅ Map quand :
//   - les clés ne sont pas des strings (Map accepte tout type)
//   - tu itères souvent (Map.forEach / for...of garde l'ordre d'insertion)
//   - tu as besoin de .size
//   - les clés sont dynamiques / fournies par l'utilisateur
// ✅ Object quand :
//   - structure fixe connue à l'avance (type/interface)
//   - sérialisation JSON directe
//   - destructuring

// Exemple : index de produits par ID
interface Product {
  id: string;
  name: string;
  price: number;
}

function buildIndex(products: Product[]): Map<string, Product> {
  const index = new Map<string, Product>();
  for (const p of products) {
    index.set(p.id, p);
  }
  return index;
}

const products: Product[] = [
  { id: 'p1', name: 'Clavier', price: 49.99 },
  { id: 'p2', name: 'Souris', price: 29.99 },
  { id: 'p3', name: 'Écran', price: 399.99 },
];

const index = buildIndex(products);

// Lookup O(1) au lieu de O(n) avec .find()
console.log(index.get('p2')); // { id: 'p2', name: 'Souris', price: 29.99 }
```

### 3.3 Set en profondeur

```typescript
// Le Set est le couteau suisse de la déduplication

// Déduplication simple
const ids = ['u1', 'u2', 'u1', 'u3', 'u2', 'u4', 'u1'];
const unique = [...new Set(ids)];
console.log(unique); // ['u1', 'u2', 'u3', 'u4']

// Intersection de deux ensembles
function intersection<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return a.filter(item => setB.has(item));
}

// Différence
function difference<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return a.filter(item => !setB.has(item));
}

// Union
function union<T>(a: T[], b: T[]): T[] {
  return [...new Set([...a, ...b])];
}

const frontend = ['Alice', 'Bob', 'Charlie'];
const backend = ['Bob', 'Diana', 'Eve'];

console.log(intersection(frontend, backend)); // ['Bob']
console.log(difference(frontend, backend));    // ['Alice', 'Charlie']
console.log(union(frontend, backend));         // ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve']
```

---

## 4. Patterns classiques à connaître

### 4.1 Fréquence / comptage

```typescript
// Pattern universel : compter les occurrences de chaque élément

function countBy<T>(items: T[], keyFn: (item: T) => string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

// Exemples d'utilisation
const logs = [
  { level: 'info', msg: 'started' },
  { level: 'error', msg: 'failed' },
  { level: 'info', msg: 'connected' },
  { level: 'warn', msg: 'slow query' },
  { level: 'error', msg: 'timeout' },
];

console.log(countBy(logs, l => l.level));
// Map { 'info' => 2, 'error' => 2, 'warn' => 1 }
```

### 4.2 Regroupement (group by)

```typescript
// Grouper des éléments par une clé — extrêmement fréquent en fullstack

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }
  return groups;
}

interface Order { userId: string; product: string; amount: number }

const orders: Order[] = [
  { userId: 'u1', product: 'Clavier', amount: 49.99 },
  { userId: 'u2', product: 'Souris', amount: 29.99 },
  { userId: 'u1', product: 'Écran', amount: 399.99 },
  { userId: 'u3', product: 'Casque', amount: 79.99 },
  { userId: 'u2', product: 'Hub USB', amount: 24.99 },
];

const byUser = groupBy(orders, o => o.userId);
// Map {
//   'u1' => [{ userId: 'u1', product: 'Clavier', ... }, { userId: 'u1', product: 'Écran', ... }],
//   'u2' => [{ userId: 'u2', product: 'Souris', ... }, { userId: 'u2', product: 'Hub USB', ... }],
//   'u3' => [{ userId: 'u3', product: 'Casque', ... }]
// }

// Total par utilisateur
for (const [userId, userOrders] of byUser) {
  const total = userOrders.reduce((s, o) => s + o.amount, 0);
  console.log(`${userId}: ${total.toFixed(2)}€`);
}
```

### 4.3 Two-pointer sur tableau trié

```typescript
// Quand le tableau est trié, on peut résoudre beaucoup de problèmes
// avec deux pointeurs qui se rapprochent — O(n) au lieu de O(n²)

// Exemple : trouver deux nombres dont la somme = target
function twoSumSorted(nums: number[], target: number): [number, number] | null {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return null;
}

const sorted = [1, 3, 5, 7, 11, 15, 20];
console.log(twoSumSorted(sorted, 18)); // [2, 5] → 5 + 15 = 20... non
// Corrigeons : 7 + 11 = 18 → [3, 4]

// Pourquoi ça marche ?
// - Si la somme est trop petite → on augmente left (le plus petit)
// - Si la somme est trop grande → on diminue right (le plus grand)
// - On converge vers la solution en O(n)
```

### 4.4 Le pattern "two-sum" avec HashMap

```typescript
// Quand le tableau N'EST PAS trié, on utilise une HashMap

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

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1] → 2 + 7 = 9

// Complexité : O(n) temps, O(n) espace
// Chaque élément est visité une seule fois
// Le lookup du complément est O(1) grâce à la Map
```

### 4.5 Sliding window (aperçu)

```typescript
// Le sliding window sera détaillé au module 11,
// mais en voici un aperçu avec les tableaux

// Problème : somme maximale de k éléments consécutifs
function maxSumSubarray(nums: number[], k: number): number {
  if (nums.length < k) return 0;

  // Calculer la somme de la première fenêtre
  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += nums[i];
  }

  let maxSum = windowSum;

  // Faire glisser la fenêtre
  for (let i = k; i < nums.length; i++) {
    windowSum += nums[i];      // ajoute le nouveau
    windowSum -= nums[i - k];   // retire l'ancien
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}

console.log(maxSumSubarray([2, 1, 5, 1, 3, 2], 3)); // 9 (5+1+3)

// Au lieu de recalculer la somme de chaque sous-tableau O(n×k),
// on fait glisser en O(n) total.
```

---

## 5. Cas terrain fullstack

### 5.1 Dédupliquer des résultats d'API multiples

```typescript
// Scénario : tu appelles 3 endpoints qui retournent des IDs d'articles
// Certains IDs sont présents dans plusieurs réponses

interface Article { id: string; title: string; source: string }

function mergeArticles(sources: Article[][]): Article[] {
  const seen = new Set<string>();
  const result: Article[] = [];

  for (const articles of sources) {
    for (const article of articles) {
      if (!seen.has(article.id)) {
        seen.add(article.id);
        result.push(article);
      }
    }
  }
  return result;
}
// O(total articles) — un seul passage avec Set.has() en O(1)
```

### 5.2 Fusionner des données de prix et de stock

```typescript
// Deux sources de données : une pour les prix, une pour les stocks
interface PriceData { productId: string; price: number }
interface StockData { productId: string; quantity: number }
interface MergedProduct { productId: string; price: number; quantity: number }

function mergeData(prices: PriceData[], stocks: StockData[]): MergedProduct[] {
  // Indexer les stocks par productId — O(s)
  const stockIndex = new Map<string, number>();
  for (const s of stocks) {
    stockIndex.set(s.productId, s.quantity);
  }

  // Joindre — O(p)
  return prices.map(p => ({
    productId: p.productId,
    price: p.price,
    quantity: stockIndex.get(p.productId) ?? 0,
  }));
}
// O(p + s) au lieu de O(p × s) avec une recherche linéaire
```

### 5.3 Construire un index mémoire pour une recherche locale

```typescript
// Scénario : tu charges 10 000 utilisateurs au démarrage
// et tu dois faire des lookups fréquents par email et par ID

interface User {
  id: string;
  email: string;
  name: string;
}

class UserIndex {
  private byId = new Map<string, User>();
  private byEmail = new Map<string, User>();

  constructor(users: User[]) {
    for (const u of users) {
      this.byId.set(u.id, u);
      this.byEmail.set(u.email, u);
    }
  }

  findById(id: string): User | undefined {
    return this.byId.get(id); // O(1)
  }

  findByEmail(email: string): User | undefined {
    return this.byEmail.get(email); // O(1)
  }
}

// Construction O(n), chaque lookup ensuite O(1)
// Versus .find() qui serait O(n) par lookup
```

---

## Démonstrations

### Demo 1 — Benchmark : includes vs Set.has en boucle

```typescript
const N = 50_000;
const haystack = Array.from({ length: N }, (_, i) => `user_${i}`);
const needles = Array.from({ length: 1_000 }, (_, i) => `user_${i * 50}`);

// ❌ Array.includes dans une boucle — O(needles × haystack)
console.time('Array.includes');
const found1: string[] = [];
for (const needle of needles) {
  if (haystack.includes(needle)) found1.push(needle);
}
console.timeEnd('Array.includes');

// ✅ Set.has — O(needles + haystack)
console.time('Set.has');
const haystackSet = new Set(haystack);
const found2: string[] = [];
for (const needle of needles) {
  if (haystackSet.has(needle)) found2.push(needle);
}
console.timeEnd('Set.has');
```

### Demo 2 — Group by avec reduce vs for

```typescript
interface LogEntry { level: string; timestamp: number; message: string }

const logs: LogEntry[] = Array.from({ length: 100_000 }, (_, i) => ({
  level: ['info', 'warn', 'error'][i % 3],
  timestamp: Date.now() + i,
  message: `Event ${i}`,
}));

// Version reduce — fonctionnelle
console.time('reduce');
const grouped1 = logs.reduce((acc, log) => {
  const group = acc.get(log.level) ?? [];
  group.push(log);
  acc.set(log.level, group);
  return acc;
}, new Map<string, LogEntry[]>());
console.timeEnd('reduce');

// Version for — impérative
console.time('for loop');
const grouped2 = new Map<string, LogEntry[]>();
for (const log of logs) {
  const group = grouped2.get(log.level);
  if (group) {
    group.push(log);
  } else {
    grouped2.set(log.level, [log]);
  }
}
console.timeEnd('for loop');

// Même complexité O(n), mais la version for peut être légèrement plus rapide
// car elle évite la création d'une closure à chaque itération
```

### Demo 3 — Object.groupBy (ES2024)

```typescript
// Depuis Node.js 21+ / ES2024, on a Object.groupBy
// Pas encore disponible partout, mais l'avenir

const products = [
  { name: 'Clavier', category: 'peripherals' },
  { name: 'Souris', category: 'peripherals' },
  { name: 'RAM', category: 'components' },
  { name: 'SSD', category: 'components' },
  { name: 'Écran', category: 'monitors' },
];

// Object.groupBy(products, p => p.category)
// → { peripherals: [...], components: [...], monitors: [...] }

// En attendant, la version Map manuelle reste universelle
```

### Demo 4 — Détection d'anagrammes dans un tableau

```typescript
// Grouper les mots qui sont des anagrammes entre eux
// Astuce : deux anagrammes ont la même signature quand triées

function groupAnagrams(words: string[]): string[][] {
  const groups = new Map<string, string[]>();

  for (const word of words) {
    // La clé est la version triée des caractères
    const key = word.split('').sort().join('');
    const group = groups.get(key) ?? [];
    group.push(word);
    groups.set(key, group);
  }

  return [...groups.values()];
}

console.log(groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']));
// [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]

// Complexité : O(n × k log k) — n mots, k longueur max du mot
// Le tri de chaque mot est O(k log k)
```

---

## Points clés

1. Les tableaux sont parfaits pour le séquentiel — mauvais pour les lookups répétés.
2. `Map` pour associer clé → valeur avec lookup $O(1)$. `Set` pour tester la présence en $O(1)$.
3. Ne mets jamais `.includes()` ou `.indexOf()` dans une boucle sans raison — c'est un $O(n^2)$ déguisé.
4. Patterns fondamentaux : **comptage**, **regroupement**, **déduplication**, **two-sum**, **two-pointer**.
5. Les strings sont immutables en JS — évite la concaténation en boucle (`+=`), préfère `Array.join()`.
6. Construire un index (`Map<id, T>`) en $O(n)$ au démarrage pour des lookups $O(1)$ ensuite.
7. L'intersection de deux ensembles : petit dans un `Set`, grand en parcours filtré.
8. `Object.groupBy` arrive en ES2024 — en attendant, le pattern `Map<string, T[]>` est universel.
9. Les anagrammes se détectent par signature triée.
10. Toujours se demander : « est-ce que je scanne le même tableau plusieurs fois ? → peut-être qu'un `Set` ou `Map` aiderait. »

---

## Pour aller plus loin

- [MDN — Map](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Map) — documentation complète
- [MDN — Set](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Set) — documentation complète
- [TC39 — Object.groupBy](https://github.com/tc39/proposal-array-grouping) — proposition ES2024
- [V8 Blog — Elements kinds](https://v8.dev/blog/elements-kinds) — comment V8 optimise les tableaux selon leur contenu
- [JavaScript.info — Map and Set](https://javascript.info/map-set) — tutoriel progressif

---

## Si tu es perdu

1. `Array` = collection ordonnée, accès par index.
2. `Map` = clé → valeur, lookup rapide. Utilise-la quand tu cherches par clé.
3. `Set` = ensemble unique, test de présence rapide. Utilise-le pour dédupliquer ou vérifier l'existence.
4. « J'ai une double boucle avec `.includes()` » → remplace par un `Set`.
5. Grouper = `Map<string, T[]>` → boucle simple, résultat structuré.

---

## Défi

> Tu reçois un tableau de 100 000 commandes, chaque commande ayant un `productId` (string) et un `amount` (number). Deux tâches :
> 1. Calculer le total par produit.
> 2. Trouver les 3 produits les plus vendus (en montant total).
> Quelle est ta complexité pour chaque étape ?

<details>
<summary>Réponse</summary>

```typescript
interface Order { productId: string; amount: number }

function topProducts(orders: Order[], k: number): [string, number][] {
  // Étape 1 : total par produit — O(n)
  const totals = new Map<string, number>();
  for (const o of orders) {
    totals.set(o.productId, (totals.get(o.productId) ?? 0) + o.amount);
  }

  // Étape 2 : trier par total et prendre les k premiers — O(m log m)
  // où m = nombre de produits distincts (souvent m << n)
  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, k);
}

// Complexité totale : O(n + m log m)
// Si m est petit par rapport à n (ex: 500 produits pour 100k commandes),
// le coût est dominé par O(n) — excellent.
//
// Pour faire encore mieux si m est grand : utiliser un Heap de taille k
// → O(n + m log k). On verra ça au module 05.
```

</details>

---

::: tip Parcours recommandé
📖 Module terminé → Fais le **Lab 02** (déduplication et comptage) → puis le **Quiz 02**.
:::
