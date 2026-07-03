# Lab 05 — Tris, partition et tas

> **Outcome :** à la fin, tu sais implémenter un merge sort stable, un `MinHeap<T>` générique, et le pattern top-K en TypeScript, puis les vérifier à la main sur des données TribuZen.
> **Vrai outil :** TypeScript + `tsx` (exécution directe d'un fichier `.ts` en Node, sans build). Aucun test-runner auto-correcteur.
> **Feedback :** le coach valide en session à partir des `console.log` attendus — tu produis, tu lis la sortie, tu compares.

---

## Énoncé

Tu construis la brique de classement de l'admin TribuZen. Cahier des charges **exact**, trois livrables dans un seul fichier `sorting-heaps.ts` :

1. **`mergeSort(arr: number[]): number[]`** — tri fusion **stable**, `O(n log n)`, qui **ne mute pas** l'entrée (renvoie un nouveau tableau).
2. **`MinHeap<T>`** — classe générique avec comparateur injectable : `push`, `pop`, `peek`, `size`, `isEmpty`. Racine = minimum.
3. **`topKFamilies(families, k)`** — les K familles les plus actives, via un `MinHeap` de taille K, en `O(n log K)`, **sans muter** `families`.

**Données de départ (à copier dans `sorting-heaps.ts`) :**

```ts
export interface Family {
  id: string;
  name: string;
  weeklyEvents: number; // activité de la semaine
}

const FAMILIES: Family[] = [
  { id: 'f1', name: 'Durand', weeklyEvents: 3 },
  { id: 'f2', name: 'Martin', weeklyEvents: 12 },
  { id: 'f3', name: 'Bernard', weeklyEvents: 7 },
  { id: 'f4', name: 'Petit', weeklyEvents: 1 },
  { id: 'f5', name: 'Robert', weeklyEvents: 9 },
  { id: 'f6', name: 'Richard', weeklyEvents: 5 },
];
```

**Contraintes :**
- `mergeSort` et `topKFamilies` **ne mutent jamais** leur entrée (copie défensive ou nouveau tableau).
- `MinHeap` doit être **générique** (`<T>`) avec un comparateur par défaut numérique.
- Interdiction d'utiliser `Array.prototype.sort` **dans** `mergeSort` (c'est justement ce que tu réimplémentes). Tu peux l'utiliser ailleurs.
- **Pas de gap-fill** — tu écris chaque fonction complète depuis le starter.

### Starter minimal

```bash
mkdir tribuzen-lab05 && cd tribuzen-lab05
npm init -y
npm i -D tsx typescript
# écris sorting-heaps.ts, puis :
npx tsx sorting-heaps.ts
```

```ts
// sorting-heaps.ts — squelette à compléter

export interface Family { id: string; name: string; weeklyEvents: number; }

function mergeSort(arr: number[]): number[] {
  // TODO
  return arr;
}

class MinHeap<T> {
  // TODO : items, cmp, push, pop, peek, size, isEmpty
}

function topKFamilies(families: Family[], k: number): Family[] {
  // TODO : MinHeap de taille K
  return [];
}

// --- vérifications manuelles (ne pas modifier les attendus) ---
console.log(mergeSort([10, 2, 1, 12, 7]));   // attendu : [1, 2, 7, 10, 12]
```

---

## Étapes (en friction)

1. **Écris `merge(left, right)`** — fusion de deux tableaux triés avec deux pointeurs, `O(n+m)`. Utilise `<=` (et pas `<`) à l'égalité pour rester **stable**.
2. **Écris `mergeSort(arr)`** — cas de base `length <= 1`, sinon coupe au milieu, récursion sur chaque moitié, `merge`. Vérifie qu'il renvoie une **copie** (l'entrée est intacte).
3. **Écris `MinHeap<T>`** — champ `items: T[]`, comparateur `cmp` (défaut `(a, b) => a - b`). Implémente `siftUp` (dans `push`) et `siftDown` (dans `pop`). Rappels d'index : `parent = floor((i-1)/2)`, `gauche = 2i+1`, `droite = 2i+2`.
4. **Teste le tas seul** — pousse `[5, 3, 7, 1]`, `pop` quatre fois : tu dois obtenir `1, 3, 5, 7` (ordre croissant).
5. **Écris `topKFamilies(families, k)`** — `MinHeap<Family>` avec `(a, b) => a.weeklyEvents - b.weeklyEvents`. Si `size < k` : push. Sinon si le candidat dépasse `peek()` : `pop()` puis `push()`. Vide le tas, `reverse()` pour l'ordre décroissant.
6. **Vérifie les cas limites** : `topKFamilies(FAMILIES, 3)` → `['Martin', 'Robert', 'Bernard']` ; `k` plus grand que la liste → renvoie toutes les familles triées ; l'entrée `FAMILIES` reste dans son ordre d'origine.

---

## Corrigé complet commenté

```ts
// sorting-heaps.ts — corrigé intégral

export interface Family { id: string; name: string; weeklyEvents: number; }

// ─── 1. Merge sort stable, non mutant ───────────────────────────
function merge(left: number[], right: number[]): number[] {
  const out: number[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    // <= : à égalité on prend la GAUCHE d'abord → ordre relatif préservé (stabilité)
    if (left[i] <= right[j]) out.push(left[i++]);
    else out.push(right[j++]);
  }
  // colle le reste du tableau non vidé (un seul des deux while s'exécute)
  while (i < left.length) out.push(left[i++]);
  while (j < right.length) out.push(right[j++]);
  return out;
}

function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return [...arr]; // copie même dans le cas de base → jamais de mutation
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));  // slice = copie → entrée intacte
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

// ─── 2. MinHeap générique ───────────────────────────────────────
class MinHeap<T> {
  private items: T[] = [];
  // comparateur injectable ; défaut : ordre numérique croissant
  constructor(private cmp: (a: T, b: T) => number = (a: any, b: any) => a - b) {}

  get size(): number { return this.items.length; }
  isEmpty(): boolean { return this.items.length === 0; }
  peek(): T | undefined { return this.items[0]; } // racine = min, O(1)

  push(item: T): void {
    this.items.push(item);
    this.siftUp(this.items.length - 1); // remonte à sa place, O(log n)
  }

  pop(): T | undefined {
    if (this.isEmpty()) return undefined;
    const min = this.items[0];
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last; // le dernier élément prend la racine...
      this.siftDown(0);     // ...puis redescend à sa place, O(log n)
    }
    return min;
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      // si l'ordre parent/enfant est déjà bon, on s'arrête
      if (this.cmp(this.items[i], this.items[parent]) >= 0) break;
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
      if (smallest === i) break; // parent ≤ ses deux enfants → propriété rétablie
      [this.items[i], this.items[smallest]] = [this.items[smallest], this.items[i]];
      i = smallest;
    }
  }
}

// ─── 3. Top-K via MinHeap de taille K ───────────────────────────
function topKFamilies(families: Family[], k: number): Family[] {
  // min-heap : la racine est le MOINS actif des K retenus (le seuil d'entrée)
  const heap = new MinHeap<Family>((a, b) => a.weeklyEvents - b.weeklyEvents);

  for (const fam of families) {
    if (heap.size < k) {
      heap.push(fam);
    } else if (fam.weeklyEvents > heap.peek()!.weeklyEvents) {
      heap.pop();     // éjecte le moins actif des K
      heap.push(fam); // le remplace par un candidat plus actif
    }
    // sinon : fam ≤ seuil → ignoré, on ne touche pas au tas
  }

  const out: Family[] = [];
  while (!heap.isEmpty()) out.push(heap.pop()!); // sort du - actif au + actif
  return out.reverse();                          // du + actif au - actif
}

// ─── Vérifications manuelles ────────────────────────────────────
const FAMILIES: Family[] = [
  { id: 'f1', name: 'Durand', weeklyEvents: 3 },
  { id: 'f2', name: 'Martin', weeklyEvents: 12 },
  { id: 'f3', name: 'Bernard', weeklyEvents: 7 },
  { id: 'f4', name: 'Petit', weeklyEvents: 1 },
  { id: 'f5', name: 'Robert', weeklyEvents: 9 },
  { id: 'f6', name: 'Richard', weeklyEvents: 5 },
];

const input = [10, 2, 1, 12, 7];
console.log(mergeSort(input));                 // [1, 2, 7, 10, 12]
console.log(input);                            // [10, 2, 1, 12, 7] ← entrée NON mutée

const h = new MinHeap<number>();
[5, 3, 7, 1].forEach(x => h.push(x));
console.log([h.pop(), h.pop(), h.pop(), h.pop()]); // [1, 3, 5, 7]

console.log(topKFamilies(FAMILIES, 3).map(f => f.name)); // ['Martin', 'Robert', 'Bernard']
console.log(FAMILIES.map(f => f.name));                  // ordre d'origine intact
```

**Pourquoi ce corrigé est correct :**
- `mergeSort` utilise `slice` (copie) partout et renvoie `[...arr]` même au cas de base → l'entrée n'est **jamais** mutée, contrairement à `Array.sort`.
- Le `<=` dans `merge` garantit la **stabilité** : à valeur égale, l'élément de gauche (donc d'index d'origine plus petit) sort en premier.
- `MinHeap` est générique et son comparateur est injectable — le même code sert pour des `number` et des `Family`.
- `topKFamilies` maintient un tas d'au plus K éléments : coût `O(n log K)`, pas `O(n log n)`, et `families` reste intact (on ne fait que le lire).

---

## Variante J+30 (fading)

**Même objectif, contraintes ajoutées — reproduire de mémoire en 25 minutes, sans rouvrir ce corrigé ni le module :**

1. Ajoute `quickSelect(nums: number[], k: number): number` (k 0-indexé) qui renvoie le k-ième plus petit **sans trier** tout le tableau, via une partition de Lomuto. Vérifie : `quickSelect([50, 20, 80, 10, 40, 90, 30], 3)` → `40`.
2. Ajoute `medianContribution(amounts: number[]): number` qui utilise `quickSelect` pour la médiane (gère pair et impair). Vérifie : `medianContribution([50, 20, 80, 10])` → `35`.
3. Rends `topKFamilies` générique : `topK<T>(items: T[], k: number, score: (x: T) => number): T[]` — réutilisable pour les membres, les événements, n'importe quoi.

**Critère de réussite :** les trois sorties correspondent aux attendus, `quickSelect` ne trie pas le tableau complet (une seule moitié récursée), et `quickSelect`/`topK` ne mutent pas leur entrée.

---

## Application TribuZen

Dans le repo `smaurier/tribuzen`, ces briques vivent ici :

```
tribuzen/
  api/src/
    common/heap/MinHeap.ts            ← le tas générique du lab, tel quel
    ranking/familyRanking.service.ts  ← topK des familles par activité
    stats/contributions.service.ts    ← quickSelect / médiane des contributions
  web/src/
    features/members/sortMembers.ts   ← tri stable multi-critères (Array.toSorted)
```

**Différences par rapport au lab :**
- `MinHeap` devient un module partagé injecté dans les services NestJS (pas de `console.log`, mais des retours typés validés en session).
- `topKFamilies` devient `topK<T>` générique paramétré par une fonction de score, réutilisé pour le top-N des membres et le fil « tendances ».
- Côté web, on ne réimplémente pas merge sort : on utilise `Array.toSorted` (stable, ES2023) avec un comparateur multi-critères chaîné par `||` — le lab sert à **comprendre** ce que fait le moteur sous le capot.

**Commit cible :**
```
feat(common): MinHeap générique + heapify O(n)
feat(ranking): topK familles par activité via min-heap de taille K
feat(stats): médiane des contributions par quickselect O(n)
```
