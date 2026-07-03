---
titre: Tris, partition et tas
cours: 05-algorithms
notions: [tris quadratiques insertion et sélection, merge sort stable, quicksort et partition de Lomuto et Hoare, choix du pivot et pire cas, quickselect pour le k-ième, tas binaire min et max, sift up et sift down, heapify en O(n), heap sort, priority queue via tas, Array.sort et Timsort, piège du comparateur par défaut lexicographique, tri stable, pattern top-K avec tas]
outcomes: [choisir le bon tri selon la taille des données et la stabilité requise, implémenter un tas binaire et une priority queue en TypeScript, résoudre top-K et le k-ième élément sans trier tout le tableau]
prerequis: [04-recursion-divide-conquer-binary-search]
next: 06-arbres-bst
libs: []
tribuzen: classement des familles par activité en top-K avec tas, tri stable multi-critères des membres, quickselect pour la médiane des contributions
last-reviewed: 2026-07
---

# Tris, partition et tas

> **Outcomes — tu sauras FAIRE :** choisir le bon tri selon la taille et la stabilité, implémenter un tas binaire et une priority queue en TypeScript, résoudre top-K et le k-ième élément sans trier tout le tableau.
> **Difficulté :** :star::star::star:

## 1. Cas concret d'abord

Tu bosses sur le tableau de bord admin TribuZen. Le back te renvoie un tableau de familles, et tu dois afficher **les 10 familles les plus actives** de la semaine. Un collègue a écrit ça :

```ts
// familyRanking.ts — AVANT
interface Family {
  id: string;
  name: string;
  weeklyEvents: number; // nombre d'événements créés cette semaine
}

function topFamilies(families: Family[]): Family[] {
  // tri décroissant sur weeklyEvents, puis on prend les 10 premières
  return families.sort((a, b) => b.weeklyEvents - a.weeklyEvents).slice(0, 10);
}
```

Ça marche, mais trois choses clochent quand la base grossit :

1. Sur 500 000 familles, on trie **tout** ($O(n \log n)$) pour n'en garder que 10. Un tas de taille 10 fait le même travail en $O(n \log 10) \approx O(n)$.
2. `families.sort(...)` **mute le tableau d'entrée** — si `families` vient d'un cache partagé, tu corromps l'ordre pour tout le reste de l'app.
3. Et si la spec disait juste `families.sort()` sans comparateur ? Tu obtiendrais un tri **alphabétique des nombres convertis en chaînes** — le piège n°1 de JavaScript, détaillé plus bas.

Ce module te donne : les tris et leurs coûts réels, la partition (quicksort / quickselect), et le tas — la structure qui rend top-K quasi-linéaire.

---

## 2. Théorie complète, concise

### 2.1 Les tris quadratiques — insertion et sélection

Deux tris en $O(n^2)$. On ne les utilise **jamais** sur de gros volumes, mais ils restent pertinents sur de **petits tableaux** (n < ~16) ou des données **presque triées** — c'est d'ailleurs pour ça que Timsort les utilise en interne.

```ts
// Tri par insertion — construit la portion triée en insérant chaque élément à sa place.
// O(n²) pire cas, mais O(n) si déjà trié → excellent sur petit ou presque-trié. STABLE.
function insertionSort(arr: number[]): number[] {
  const a = [...arr];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j]; // décale à droite
      j--;
    }
    a[j + 1] = key; // insère à la bonne place
  }
  return a;
}

// Tri par sélection — cherche le min du reste et le place. O(n²) TOUJOURS. NON stable.
// Intérêt quasi nul en pratique : à connaître pour le vocabulaire.
function selectionSort(arr: number[]): number[] {
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[min]) min = j;
    }
    [a[i], a[min]] = [a[min], a[i]];
  }
  return a;
}
```

**Quand c'est acceptable :** insertion sort sur un tableau de < 20 éléments, ou quasi-trié, est souvent **plus rapide** que merge/quick sort car il n'a pas leur surcoût constant. En dehors de ça, on monte en $O(n \log n)$.

### 2.2 Merge sort — stable, $O(n \log n)$ garanti

Divide & conquer (module 04) : on coupe en deux, on trie chaque moitié, on **fusionne** deux moitiés triées.

```ts
// Merge sort — O(n log n) dans TOUS les cas. STABLE. Coût mémoire : O(n) (pas in-place).
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

// Fusion de deux tableaux triés en un seul, en O(n+m). Deux pointeurs.
function merge(left: number[], right: number[]): number[] {
  const out: number[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    // <= (et pas <) : à égalité on prend GAUCHE d'abord → stabilité préservée
    if (left[i] <= right[j]) out.push(left[i++]);
    else out.push(right[j++]);
  }
  // un des deux est vidé : on colle le reste de l'autre
  while (i < left.length) out.push(left[i++]);
  while (j < right.length) out.push(right[j++]);
  return out;
}
```

Points à retenir : **garanti** $O(n \log n)$ (pas de pire cas dégradé), **stable**, mais consomme $O(n)$ de mémoire supplémentaire.

### 2.3 Quicksort et la partition

Quicksort choisit un **pivot**, **partitionne** le tableau (tout ce qui est ≤ pivot à gauche, > pivot à droite), puis récursionne sur chaque côté. La partition est la brique centrale.

**Partition de Lomuto** — la plus simple à écrire, pivot = dernier élément :

```ts
// Partition de Lomuto : place le pivot (arr[hi]) à sa position finale,
// renvoie son index. Tout ce qui est à gauche est ≤ pivot, à droite > pivot.
function partitionLomuto(arr: number[], lo: number, hi: number): number {
  const pivot = arr[hi];
  let i = lo; // frontière : arr[lo..i-1] ≤ pivot
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]]; // pivot à sa place définitive
  return i;
}

function quickSort(arr: number[], lo = 0, hi = arr.length - 1): number[] {
  if (lo < hi) {
    const p = partitionLomuto(arr, lo, hi);
    quickSort(arr, lo, p - 1);
    quickSort(arr, p + 1, hi);
  }
  return arr; // in-place : mute arr
}
```

**Partition de Hoare** — deux pointeurs qui se croisent, ~3× moins de swaps que Lomuto :

```ts
// Partition de Hoare : deux pointeurs convergent. Renvoie un index de coupe j
// tel que tout arr[lo..j] ≤ tout arr[j+1..hi] (le pivot n'est PAS forcément à sa place finale).
function partitionHoare(arr: number[], lo: number, hi: number): number {
  const pivot = arr[Math.floor((lo + hi) / 2)]; // pivot médian : évite le pire cas sur tableau trié
  let i = lo - 1, j = hi + 1;
  while (true) {
    do { i++; } while (arr[i] < pivot);
    do { j--; } while (arr[j] > pivot);
    if (i >= j) return j;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
```

> ⚠️ Avec Hoare, la récursion devient `quickSort(lo, j)` et `quickSort(j+1, hi)` — le pivot n'est PAS à sa place finale, ne pas réutiliser le `p-1` de Lomuto (sinon tri faux / boucle). (footgun classique en entretien.)

**Complexité de quicksort :** $O(n \log n)$ en moyenne, mais **$O(n^2)$ dans le pire cas** — pivot toujours le plus petit/grand (typiquement Lomuto sur un tableau déjà trié). On l'atténue avec un pivot médian ou aléatoire. Quicksort est **in-place** (peu de mémoire) mais **non stable**.

### 2.4 Quickselect — le k-ième élément en $O(n)$ moyen

Si tu ne veux **qu'un seul** élément (le k-ième plus petit, la médiane), inutile de tout trier. Quickselect = quicksort qui ne récursionne que **du côté** où se trouve k.

```ts
// Renvoie le k-ième plus petit élément (k 0-indexé), sans trier tout le tableau.
// O(n) en moyenne (n + n/2 + n/4 + ... = 2n), O(n²) pire cas.
function quickSelect(input: number[], k: number): number {
  const arr = [...input]; // ne pas muter l'entrée
  let lo = 0, hi = arr.length - 1;
  while (lo < hi) {
    const p = partitionLomuto(arr, lo, hi);
    if (p === k) return arr[k];
    if (k < p) hi = p - 1; // k est à gauche : on oublie la droite
    else lo = p + 1;       // k est à droite
  }
  return arr[lo];
}

// Médiane = k-ième au milieu
function median(nums: number[]): number {
  const mid = Math.floor(nums.length / 2);
  if (nums.length % 2 === 1) return quickSelect(nums, mid);
  return (quickSelect(nums, mid - 1) + quickSelect(nums, mid)) / 2;
}
```

### 2.5 Le tas binaire (heap)

Un **tas binaire** est un arbre binaire **complet** (rempli de gauche à droite, sans trou) stocké dans un **simple tableau**, avec une propriété d'ordre :

- **min-heap** : chaque parent ≤ ses enfants → la **racine est le minimum**.
- **max-heap** : chaque parent ≥ ses enfants → la racine est le maximum.

```
min-heap :          Stocké en tableau : [1, 3, 2, 7, 4, 5]
       1            index :              0  1  2  3  4  5
     /   \
    3     2         Relations d'index (0-based) :
   / \   /          - parent(i) = Math.floor((i - 1) / 2)
  7   4 5           - gauche(i) = 2i + 1
                    - droite(i) = 2i + 2
```

Deux opérations internes maintiennent la propriété :

- **sift up** (bubble up) : après un `push` en fin de tableau, on fait remonter l'élément tant qu'il est plus petit que son parent — $O(\log n)$.
- **sift down** (bubble down) : après un `pop` (on remonte le dernier élément à la racine), on le fait descendre vers le plus petit enfant — $O(\log n)$.

```ts
// MinHeap générique — comparateur injectable (défaut : ordre numérique croissant).
class MinHeap<T> {
  private items: T[] = [];
  constructor(private cmp: (a: T, b: T) => number = (a: any, b: any) => a - b) {}

  get size(): number { return this.items.length; }
  isEmpty(): boolean { return this.items.length === 0; }
  peek(): T | undefined { return this.items[0]; } // racine = min, O(1)

  push(item: T): void {
    this.items.push(item);
    this.siftUp(this.items.length - 1); // O(log n)
  }

  pop(): T | undefined {
    if (this.isEmpty()) return undefined;
    const min = this.items[0];
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;   // le dernier prend la racine
      this.siftDown(0);       // puis redescend à sa place, O(log n)
    }
    return min;
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.cmp(this.items[i], this.items[parent]) >= 0) break; // ordre OK, stop
      [this.items[i], this.items[parent]] = [this.items[parent], this.items[i]];
      i = parent;
    }
  }

  private siftDown(i: number): void {
    const n = this.items.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.cmp(this.items[l], this.items[smallest]) < 0) smallest = l;
      if (r < n && this.cmp(this.items[r], this.items[smallest]) < 0) smallest = r;
      if (smallest === i) break; // parent ≤ enfants, stop
      [this.items[i], this.items[smallest]] = [this.items[smallest], this.items[i]];
      i = smallest;
    }
  }
}
```

**Un max-heap** = un min-heap avec le comparateur inversé : `new MinHeap<number>((a, b) => b - a)`.

### 2.6 Heapify en $O(n)$

Construire un tas depuis un tableau existant en poussant élément par élément coûte $O(n \log n)$. En faisant **sift down** sur les nœuds internes de bas en haut, on descend à $O(n)$ — surprenant mais réel (la majorité des nœuds sont en bas de l'arbre, avec peu de niveaux à descendre).

```ts
// heapify : transforme un tableau en min-heap in-place en O(n).
// On sift down depuis le dernier parent jusqu'à la racine.
function heapify(arr: number[]): void {
  const n = arr.length;
  const siftDown = (i: number) => {
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && arr[l] < arr[smallest]) smallest = l;
      if (r < n && arr[r] < arr[smallest]) smallest = r;
      if (smallest === i) break;
      [arr[i], arr[smallest]] = [arr[smallest], arr[i]];
      i = smallest;
    }
  };
  // dernier parent = parent du dernier élément
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i);
}
```

### 2.7 Heap sort et priority queue

**Heap sort** : on heapify, puis on `pop` n fois. $O(n \log n)$ garanti, in-place possible, mais **non stable**.

```ts
// Heap sort via notre MinHeap (version pédagogique, non in-place). O(n log n).
function heapSort(arr: number[]): number[] {
  const heap = new MinHeap<number>();
  for (const x of arr) heap.push(x);
  const out: number[] = [];
  while (!heap.isEmpty()) out.push(heap.pop()!);
  return out;
}
```

**Priority queue** : un tas *est* une file à priorité. `push` = enfiler avec priorité, `pop` = défiler le plus prioritaire. Le comparateur définit la priorité.

```ts
interface Job { label: string; priority: number; } // priorité basse = plus urgent
const pq = new MinHeap<Job>((a, b) => a.priority - b.priority);
pq.push({ label: 'envoi mail', priority: 5 });
pq.push({ label: 'paiement', priority: 1 });
pq.pop(); // { label: 'paiement', priority: 1 } — le plus urgent sort en premier
```

### 2.8 Array.sort et Timsort — LE piège du comparateur

`Array.prototype.sort` en V8 (Chrome / Node) utilise **Timsort** : hybride merge sort + insertion sort, $O(n \log n)$ pire cas, $O(n)$ sur presque-trié, **stable** (garanti par la spec ES2019+), **in-place** (mute le tableau).

**MAIS** — sans comparateur, `sort()` convertit chaque élément en **chaîne** et trie **lexicographiquement** :

```ts
[10, 2, 1].sort();            // ['1', '10', '2'] logiquement → [1, 10, 2] ❌❌❌
// "10" < "2" en ordre alphabétique car '1' < '2' caractère par caractère.

[10, 2, 1].sort((a, b) => a - b); // [1, 2, 10] ✅ comparateur numérique OBLIGATOIRE
```

**Règle absolue :** pour trier des nombres, **toujours** passer `(a, b) => a - b` (croissant) ou `(a, b) => b - a` (décroissant). Le comparateur doit renvoyer un **nombre** : négatif si a avant b, positif si a après b, 0 si égal.

```ts
// Ne PAS renvoyer un booléen ! (a, b) => a > b renvoie true/false → comportement indéfini.
[3, 1, 2].sort((a, b) => a > b); // ❌ tri incohérent selon le moteur
```

### 2.9 Tri stable et tri multi-critères

Un tri est **stable** s'il préserve l'ordre relatif des éléments **égaux**. C'est ce qui rend le tri multi-critères possible **par passes successives** — mais en pratique on encode les critères dans **un seul comparateur** :

```ts
interface Member { name: string; role: 'admin' | 'mod' | 'member'; joinedAt: number; }
const rank = { admin: 0, mod: 1, member: 2 };

// Tri stable multi-critères : rôle croissant, puis à égalité ancienneté croissante,
// puis à égalité nom alphabétique. localeCompare pour l'accentué français.
members.sort((a, b) =>
  rank[a.role] - rank[b.role]
  || a.joinedAt - b.joinedAt
  || a.name.localeCompare(b.name, 'fr')
);
```

L'astuce `||` : si la première comparaison renvoie 0 (égalité), JS évalue la suivante — chaînage naturel des critères.

---

## 3. Worked examples

### Exemple 1 — Top-K avec un tas (le cœur du cas concret)

Objectif : les **K familles les plus actives** parmi n, en $O(n \log K)$, sans muter l'entrée ni tout trier.

**Idée contre-intuitive :** pour les K **plus grands**, on garde un **min-heap de taille K**. La racine est le plus petit des K retenus ; dès qu'un nouvel élément le dépasse, on éjecte la racine.

```ts
interface Family { id: string; name: string; weeklyEvents: number; }

function topKFamilies(families: Family[], k: number): Family[] {
  // min-heap sur weeklyEvents : la racine est le MOINS actif des K gardés
  const heap = new MinHeap<Family>((a, b) => a.weeklyEvents - b.weeklyEvents);

  for (const fam of families) {
    if (heap.size < k) {
      heap.push(fam);
    } else if (fam.weeklyEvents > heap.peek()!.weeklyEvents) {
      heap.pop();       // vire le moins actif des K
      heap.push(fam);   // le remplace par le nouveau, plus actif
    }
    // sinon : fam est moins actif que le seuil courant → ignoré
  }

  // le heap contient les K plus actifs, mais dans l'ordre du tas
  const out: Family[] = [];
  while (!heap.isEmpty()) out.push(heap.pop()!); // sort du - au + actif
  return out.reverse(); // du plus actif au moins actif
}

const families: Family[] = [
  { id: 'f1', name: 'Durand', weeklyEvents: 3 },
  { id: 'f2', name: 'Martin', weeklyEvents: 12 },
  { id: 'f3', name: 'Bernard', weeklyEvents: 7 },
  { id: 'f4', name: 'Petit', weeklyEvents: 1 },
  { id: 'f5', name: 'Robert', weeklyEvents: 9 },
];
console.log(topKFamilies(families, 3).map(f => f.name)); // ['Martin', 'Robert', 'Bernard']
```

**Pourquoi c'est mieux que `sort().slice()` :** on ne trie jamais tout. Sur n = 500 000 et K = 10, le tas fait ~n comparaisons + n×log(10) opérations, contre n×log(n) pour le tri complet — et l'entrée reste intacte.

### Exemple 2 — Médiane des contributions par quickselect (fading)

Objectif : la **médiane** des montants de contributions d'une famille, sans trier tout le tableau. On réutilise `quickSelect` et `partitionLomuto` de la théorie.

```ts
const contributions = [50, 20, 80, 10, 40, 90, 30]; // 7 valeurs → médiane = 4e plus petit

// médiane impaire : k = 3 (0-indexé), soit le 4e plus petit
console.log(quickSelect(contributions, 3)); // 40

// via le helper median() (gère pair/impair)
console.log(median(contributions));          // 40
console.log(median([50, 20, 80, 10]));       // médiane paire = (20+50)/2 = 35
```

Déroulé de `quickSelect(contributions, 3)` (une passe typique) :
1. partition autour de `arr[hi]` → renvoie un index `p`.
2. si `p === 3` : trouvé. Si `3 < p` : on ne garde que la gauche (`hi = p-1`). Sinon la droite (`lo = p+1`).
3. On recommence sur **une seule** moitié → total moyen $n + n/2 + n/4 + \dots = 2n = O(n)$, contre $O(n \log n)$ pour un tri complet.

---

## 4. Pièges & misconceptions

### PIÈGE #1 — `sort()` sans comparateur trie lexicographiquement

```ts
[10, 2, 1].sort();               // → [1, 10, 2]  ❌  (comparaison de CHAÎNES)
[10, 2, 1].sort((a, b) => a - b); // → [1, 2, 10]  ✅
```

`sort()` sérialise chaque élément en string avant de comparer. `"10" < "2"` car `'1' < '2'`. **Toujours** fournir un comparateur numérique. C'est le bug le plus fréquent en entretien et en revue de code JS.

### PIÈGE #2 — Le comparateur doit renvoyer un nombre, pas un booléen

```ts
[3, 1, 2].sort((a, b) => a > b);   // ❌ renvoie true/false → tri non déterministe
[3, 1, 2].sort((a, b) => a - b);   // ✅ renvoie un nombre (-, 0, +)
```

La spec attend un nombre signé. Un booléen est coercé (`true → 1`, `false → 0`), ce qui ne discrimine jamais « a avant b ».

### PIÈGE #3 — Pour les K plus GRANDS, on utilise un MIN-heap (pas un max-heap)

```ts
// ❌ Intuition fausse : "les plus grands → max-heap"
// Un max-heap de taille K ne permet pas d'éjecter efficacement les petits.

// ✅ min-heap de taille K : la racine = seuil d'entrée. On éjecte la racine
//    dès qu'un candidat plus grand arrive. Coût O(n log K).
```

Symétriquement, pour les K plus **petits**, on garde un **max-heap** de taille K.

### PIÈGE #4 — `Array.sort` mute le tableau d'entrée

```ts
const original = [3, 1, 2];
const sorted = original.sort((a, b) => a - b);
console.log(original); // [1, 2, 3] ← muté ! sorted === original (même référence)

// ✅ copie défensive avant de trier une donnée partagée
const safe = [...original].sort((a, b) => a - b);
// ou, moderne (ES2023) : original.toSorted((a, b) => a - b) renvoie une COPIE triée
```

### PIÈGE #5 — Confondre stable et non stable

Merge sort et Timsort sont **stables** ; quicksort et heap sort **ne le sont pas**. Si tu tries des membres déjà triés par nom, puis par rôle, un tri **non stable** casse l'ordre par nom au sein d'un même rôle. `Array.sort` étant garanti stable (ES2019+), le tri multi-passes fonctionne — mais ne compte jamais sur la stabilité de ta propre implémentation de quicksort/heap sort.

### PIÈGE #6 — Quicksort en $O(n^2)$ sur données triées avec pivot naïf

Pivot = dernier élément (Lomuto) sur un tableau **déjà trié** → chaque partition est déséquilibrée à l'extrême → $O(n^2)$. Correctif : pivot **médian-de-trois** ou **aléatoire**. Merge sort et heap sort, eux, restent $O(n \log n)$ quoi qu'il arrive.

---

## 5. Ancrage TribuZen

Ces trois patterns sont directement dans l'admin et l'API TribuZen.

**Top-K avec tas — classement des familles par activité** (`api/src/ranking/familyRanking.service.ts`). Le dashboard affiche les 10 familles les plus actives. Un `MinHeap<Family>` de taille 10 balaie le flux de familles en $O(n \log 10)$ sans matérialiser un tri complet côté serveur. Même pattern pour le top-N des membres les plus contributeurs et le fil « tendances ».

**Tri stable multi-critères — liste des membres** (`web/src/features/members/sortMembers.ts`). La table des membres se trie par rôle (`admin` → `mod` → `member`), puis à égalité par ancienneté, puis par nom via `localeCompare(…, 'fr')` pour l'accentué. Un seul comparateur chaîné avec `||`, en s'appuyant sur la stabilité garantie de `Array.sort`. On utilise `toSorted` pour ne pas muter le tableau du store.

**Quickselect pour la médiane des contributions** (`api/src/stats/contributions.service.ts`). Pour afficher la contribution médiane d'une famille sans trier les milliers de transactions, `quickSelect` renvoie le k-ième en $O(n)$ moyen. Utile aussi pour les percentiles (p90 des temps de réponse dans le monitoring interne).

Fichiers cibles dans `smaurier/tribuzen` :
```
tribuzen/
  api/src/
    common/heap/MinHeap.ts            ← tas générique réutilisable
    ranking/familyRanking.service.ts  ← top-K
    stats/contributions.service.ts    ← quickselect / médiane
  web/src/
    features/members/sortMembers.ts   ← tri stable multi-critères
```

---

## 6. Points clés

1. Insertion et sélection sont en $O(n^2)$ ; l'insertion reste utile sur petit ou presque-trié (Timsort s'en sert).
2. Merge sort : $O(n \log n)$ **garanti**, **stable**, mais $O(n)$ de mémoire.
3. Quicksort : $O(n \log n)$ moyen, **$O(n^2)$ pire cas**, in-place, **non stable** ; la partition (Lomuto/Hoare) en est le cœur.
4. Quickselect trouve le k-ième (dont la médiane) en $O(n)$ moyen en ne récursant que d'un côté.
5. Un tas binaire est un arbre complet stocké en tableau ; min-heap → racine = minimum, via sift up/down en $O(\log n)$.
6. Heapify construit un tas en $O(n)$ ; heap sort trie en $O(n \log n)$ (non stable) ; un tas est une priority queue.
7. Pour top-K des K plus grands : **min-heap de taille K**, coût $O(n \log K)$.
8. `Array.sort` = Timsort (stable, $O(n \log n)$) MAIS sans comparateur il trie **lexicographiquement** : `[10,2,1].sort()` → `[1,10,2]`. Toujours `(a, b) => a - b`.
9. Le comparateur renvoie un **nombre** signé, jamais un booléen ; `sort` **mute** l'entrée (`toSorted` pour une copie).
10. Stabilité : merge/Timsort oui, quick/heap non — décisif pour le tri multi-critères.

---

## 7. Seeds Anki

```
Que renvoie [10, 2, 1].sort() sans comparateur, et pourquoi ?|[1, 10, 2]. sort() convertit chaque élément en chaîne et compare lexicographiquement : "10" < "2" car '1' < '2'. Il faut toujours passer (a, b) => a - b pour des nombres.
Pour trouver les K plus GRANDS éléments avec un tas, quel type de tas et quelle taille ?|Un MIN-heap de taille K. Sa racine est le plus petit des K retenus (le seuil) ; on éjecte la racine dès qu'un candidat plus grand arrive. Coût O(n log K).
Complexités de merge sort vs quicksort (moyen, pire cas, stabilité, mémoire) ?|Merge : O(n log n) garanti, stable, O(n) mémoire. Quicksort : O(n log n) moyen mais O(n²) pire cas, non stable, in-place. 
Qu'est-ce que quickselect et quelle est sa complexité ?|Un quicksort qui ne récursionne que du côté contenant le k-ième cherché. Trouve le k-ième plus petit (dont la médiane) en O(n) en moyenne, O(n²) pire cas, sans trier tout le tableau.
Relations d'index parent/enfants dans un tas binaire stocké en tableau (0-based) ?|parent(i) = floor((i-1)/2), enfant gauche = 2i+1, enfant droit = 2i+2. L'arbre est complet, rempli de gauche à droite.
Que font sift up et sift down, et à quel coût ?|sift up remonte un élément après un push tant qu'il viole l'ordre avec son parent ; sift down descend la nouvelle racine après un pop vers le plus petit enfant. Les deux en O(log n).
Pourquoi heapify est-il en O(n) et non O(n log n) ?|En siftant down les nœuds internes de bas en haut : la majorité des nœuds sont proches des feuilles et n'ont que peu de niveaux à descendre. La somme donne O(n), pas O(n log n) comme n push successifs.
Comment écrire un tri stable multi-critères en JS (rôle, puis ancienneté, puis nom) ?|Un seul comparateur chaîné avec || : rank[a.role]-rank[b.role] || a.joinedAt-b.joinedAt || a.name.localeCompare(b.name,'fr'). Chaque || n'est évalué qu'en cas d'égalité (0) du critère précédent.
Quelle est la différence entre Array.sort et Array.toSorted ?|sort trie in-place et MUTE le tableau (renvoie la même référence). toSorted (ES2023) renvoie une COPIE triée sans toucher l'original — préférable sur une donnée partagée.
```

---

## Pont vers le lab

> Lab associé : `05-algorithms/labs/lab-05-sorting-heaps/README.md`. Implémenter merge sort, un `MinHeap`, et le pattern top-K de zéro en TypeScript, avec corrigé complet, variante J+30 et portage TribuZen.
