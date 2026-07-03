# Lab 07 — Graphe de dépendances d'onboarding

> **Outcome :** à la fin, tu sais construire un graphe orienté en TypeScript, trouver un plus court chemin en BFS, produire un tri topologique de Kahn, et détecter une dépendance circulaire — à la main, sans librairie.
> **Vrai outil :** Node.js + `tsx` (exécution TypeScript directe : `npx tsx graph.ts`) ou le playground TypeScript. Tu écris du vrai code, tu l'exécutes et tu lis la sortie `console.log`.
> **Feedback :** le coach valide en session en te faisant dérouler un BFS et un Kahn à la main sur papier — pas de test-runner auto-correcteur.

---

## Énoncé

Tu construis le module `onboarding` de l'admin TribuZen. Quand une famille arrive, une **checklist de tâches** doit s'exécuter dans le bon ordre : certaines tâches en bloquent d'autres (`choisir-plan` avant `créer-première-tribu`). Tu modélises ça en **graphe orienté** où `A→B` signifie « A doit être fait avant B », et tu implémentes, **de zéro**, les 3 fonctions dont l'admin a besoin.

**Données de départ (à copier dans `graph.ts`) :**

```ts
type Graph<T> = Map<T, T[]>;

function createGraph<T>(): Graph<T> {
  return new Map();
}
function addVertex<T>(g: Graph<T>, v: T): void {
  if (!g.has(v)) g.set(v, []);
}
// A→B = "A avant B" ; ce lab est TOUJOURS orienté
function addEdge<T>(g: Graph<T>, from: T, to: T): void {
  addVertex(g, from);
  addVertex(g, to);
  g.get(from)!.push(to);
}

// Graphe d'onboarding VALIDE (un DAG)
const onboarding = createGraph<string>();
addEdge(onboarding, 'créer-compte', 'inviter-membres');
addEdge(onboarding, 'créer-compte', 'choisir-plan');
addEdge(onboarding, 'inviter-membres', 'créer-première-tribu');
addEdge(onboarding, 'choisir-plan', 'créer-première-tribu');
addEdge(onboarding, 'créer-première-tribu', 'publier-événement');

// Graphe CASSÉ : cycle A→B→C→A (un admin a créé une boucle)
const buggy = createGraph<string>();
addEdge(buggy, 'A', 'B');
addEdge(buggy, 'B', 'C');
addEdge(buggy, 'C', 'A');
```

**Cahier des charges — tu implémentes ces 3 fonctions :**

1. **`shortestPath(g, start, end): string[] | null`** — le chemin le plus court (en nombre d'arêtes) de `start` à `end` via **BFS**, ou `null` s'il n'existe pas.
2. **`topoSort(g): string[] | null`** — un ordre topologique via **Kahn** (in-degree), ou `null` si le graphe a un cycle.
3. **`hasCycle(g): boolean`** — vrai si le graphe orienté contient un cycle (réutilise `topoSort`, ou implémente les **trois couleurs**).

**Contraintes :**
- **Pas de gap-fill** — tu écris chaque fonction complète depuis une feuille blanche.
- `shortestPath` est **itératif avec une file** et une `Map<enfant, parent>` pour reconstruire le chemin.
- `topoSort` marque un sommet **prêt** quand son in-degree tombe à 0 ; la comparaison `order.length === g.size` est ta détection de cycle.
- Un `Set` **visited** est obligatoire dans le BFS — le graphe peut avoir plusieurs chemins.
- Zéro dépendance : juste `console.log` pour observer.

### Starter minimal

```
lab-07-graph-dependencies/
  graph.ts        ← à écrire (helpers fournis + tes 3 fonctions + les données)
```

Lance avec `npx tsx graph.ts`. Vérifie chaque sortie contre les attendus :

```
shortestPath(onboarding, 'créer-compte', 'publier-événement')
  → ['créer-compte', 'inviter-membres', 'créer-première-tribu', 'publier-événement']
    (ou via 'choisir-plan' — même longueur, 3 arêtes)
topoSort(onboarding)  → ordre valide de 5 tâches, 'créer-compte' en tête
topoSort(buggy)       → null
hasCycle(onboarding)  → false
hasCycle(buggy)       → true
```

---

## Étapes (en friction)

1. **`shortestPath`** — file initialisée à `[start]`, `visited = new Set([start])`, `parent = new Map()`. Défile en tête ; pour chaque voisin non visité : marque, enregistre `parent.set(nb, v)`, et si `nb === end` remonte la chaîne des parents avec `unshift`. Renvoie `null` si la file se vide.
2. **Déroule le BFS à la main** — sur papier, écris l'état de la file et de `parent` à chaque tour pour `créer-compte → publier-événement`. C'est ce que le coach te demandera.
3. **`topoSort` (Kahn)** — calcule l'in-degree de chaque sommet (initialise tout à 0, puis `+1` par arête entrante). Enfile les sommets à in-degree 0. À chaque sort, décrémente l'in-degree des voisins et enfile ceux qui atteignent 0. Renvoie `order` si `order.length === g.size`, sinon `null`.
4. **Casse volontairement** — lance `topoSort(buggy)` et observe le `null` : la file initiale est vide car aucun sommet du cycle n'a d'in-degree 0.
5. **`hasCycle`** — version courte : `topoSort(g) === null`. Version bonus : implémente les trois couleurs (BLANC/GRIS/NOIR) et vérifie qu'elle donne le même verdict.

**Piège à éviter :** dans `shortestPath`, marque `visited` **à l'enfilement** (juste avant `queue.push`), pas au défilement — sinon un sommet atteint par deux voisins entre deux fois dans la file.

---

## Corrigé complet commenté

```ts
// ─── graph.ts ────────────────────────────────────────────────────

type Graph<T> = Map<T, T[]>;

function createGraph<T>(): Graph<T> {
  return new Map();
}
function addVertex<T>(g: Graph<T>, v: T): void {
  if (!g.has(v)) g.set(v, []);
}
function addEdge<T>(g: Graph<T>, from: T, to: T): void {
  addVertex(g, from);
  addVertex(g, to);
  g.get(from)!.push(to);
}

// 1. BFS PLUS COURT CHEMIN — file + Map<enfant,parent> pour reconstruire
function shortestPath<T>(g: Graph<T>, start: T, end: T): T[] | null {
  if (start === end) return [start];
  const visited = new Set<T>([start]);   // marqué à l'enfilement
  const parent = new Map<T, T>();
  const queue: T[] = [start];

  while (queue.length > 0) {
    const v = queue.shift()!;            // FIFO : défile en tête
    for (const nb of g.get(v) ?? []) {
      if (visited.has(nb)) continue;
      visited.add(nb);                   // ← AVANT push : jamais 2× en file
      parent.set(nb, v);                 // d'où l'on vient
      if (nb === end) {                  // 1re rencontre = plus court
        const path: T[] = [end];
        let cur = end;
        while (cur !== start) {          // remonte la chaîne des parents
          cur = parent.get(cur)!;
          path.unshift(cur);
        }
        return path;
      }
      queue.push(nb);
    }
  }
  return null;                           // cible injoignable
}

// 2. TRI TOPOLOGIQUE (Kahn) — in-degree ; null si cycle
function topoSort<T>(g: Graph<T>): T[] | null {
  const inDeg = new Map<T, number>();
  for (const v of g.keys()) inDeg.set(v, 0);
  for (const [, nbs] of g) {             // compte les arêtes entrantes
    for (const nb of nbs) inDeg.set(nb, (inDeg.get(nb) ?? 0) + 1);
  }

  const queue: T[] = [];
  for (const [v, d] of inDeg) if (d === 0) queue.push(v); // sans prérequis

  const order: T[] = [];
  while (queue.length > 0) {
    const v = queue.shift()!;
    order.push(v);
    for (const nb of g.get(v) ?? []) {
      const d = inDeg.get(nb)! - 1;      // v "retiré" → un prérequis de moins
      inDeg.set(nb, d);
      if (d === 0) queue.push(nb);       // plus de prérequis → prêt
    }
  }
  // tous les sommets sortis ? sinon il en reste coincés dans un cycle
  return order.length === g.size ? order : null;
}

// 3. DÉTECTION DE CYCLE — Kahn échoue ⇒ cycle
function hasCycle<T>(g: Graph<T>): boolean {
  return topoSort(g) === null;
}

// Variante trois couleurs (bonus) — même verdict, sans passer par le tri
function hasCycleColors<T>(g: Graph<T>): boolean {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<T, number>();
  for (const v of g.keys()) color.set(v, WHITE);

  function dfs(v: T): boolean {
    color.set(v, GRAY);                  // sur la pile d'exploration
    for (const nb of g.get(v) ?? []) {
      const c = color.get(nb);
      if (c === GRAY) return true;       // retour vers un ancêtre → cycle
      if (c === WHITE && dfs(nb)) return true;
    }
    color.set(v, BLACK);                 // terminé
    return false;
  }
  for (const v of g.keys()) {
    if (color.get(v) === WHITE && dfs(v)) return true;
  }
  return false;
}

// ─── Données + vérifications ─────────────────────────────────────
const onboarding = createGraph<string>();
addEdge(onboarding, 'créer-compte', 'inviter-membres');
addEdge(onboarding, 'créer-compte', 'choisir-plan');
addEdge(onboarding, 'inviter-membres', 'créer-première-tribu');
addEdge(onboarding, 'choisir-plan', 'créer-première-tribu');
addEdge(onboarding, 'créer-première-tribu', 'publier-événement');

const buggy = createGraph<string>();
addEdge(buggy, 'A', 'B');
addEdge(buggy, 'B', 'C');
addEdge(buggy, 'C', 'A');

console.log(shortestPath(onboarding, 'créer-compte', 'publier-événement'));
// ['créer-compte', 'inviter-membres', 'créer-première-tribu', 'publier-événement']
console.log(topoSort(onboarding));
// ['créer-compte', 'inviter-membres', 'choisir-plan', 'créer-première-tribu', 'publier-événement']
console.log(topoSort(buggy));            // null
console.log(hasCycle(onboarding));       // false
console.log(hasCycle(buggy));            // true
console.log(hasCycleColors(buggy));      // true (même verdict)
```

**Pourquoi ce corrigé est correct :**
- `shortestPath` marque `visited` **à l'enfilement** : chaque sommet entre une seule fois dans la file, et comme BFS explore par distance croissante, la **1re** arrivée sur `end` est le chemin minimal en arêtes. La `Map parent` permet de remonter sans stocker tous les chemins.
- `topoSort` s'appuie sur l'invariant « un sommet est prêt quand tous ses prérequis sont sortis » (in-degree 0). Sur `buggy`, `A`, `B`, `C` ont tous un in-degree 1 → file initiale vide → `order.length (0) !== g.size (3)` → `null`. C'est la détection de cycle **gratuite** de Kahn.
- `hasCycle` réutilise cette propriété ; `hasCycleColors` la confirme indépendamment : un sommet **GRIS** revu pendant le DFS est une arête vers un ancêtre encore sur la pile, donc un cycle.

---

## Variante J+30 (fading)

**Même objectif, contraintes ajoutées — reproduire de mémoire en 25 minutes, sans rouvrir ce corrigé ni le module 07 :**

1. Ajoute **`allDistances(g, start): Map<string, number>`** — la distance (en arêtes) de `start` à **tous** les sommets atteignables, en un seul BFS (au lieu d'un `shortestPath` par cible).
2. Rends le graphe **pondéré** (`Map<string, {to, weight}[]>`) et écris **`dijkstra(g, start)`** pour le plus court chemin en **coût** ; compare le résultat à `allDistances` sur un graphe où tous les poids valent 1 (doivent coïncider).
3. Réécris `shortestPath` **sans `Array.shift()`** (coûteux en O(n)) : utilise un index de tête (`let head = 0`) qui avance sur un tableau.
4. Ajoute **`criticalTasks(g): string[]`** — les tâches d'in-degree 0 (aucun prérequis, exécutables en premier) ET celles d'out-degree 0 (aucune tâche ne les suit, feuilles de l'onboarding).

**Critère de réussite :** `allDistances` donne les bonnes distances, `dijkstra` coïncide avec BFS quand les poids sont uniformes, la version sans `shift` produit le même chemin, et `criticalTasks(onboarding)` renvoie `['créer-compte']` (racine) + `['publier-événement']` (feuille).

---

## Application TribuZen

Dans le repo `smaurier/tribuzen`, ces fonctions vivent ici :

```
tribuzen/src/
  lib/graph/
    graph.ts          ← createGraph, addVertex, addEdge (partagé)
    traversals.ts     ← shortestPath, allDistances (BFS)
    topoSort.ts       ← topoSort (Kahn), hasCycle
  features/
    onboarding/taskGraph.ts   ← ordre de la checklist + garde-fou cycle
    relations/relations.ts     ← degré de séparation (même BFS)
```

**Différences par rapport au lab :**
- Les tâches seront des objets `Task { id, label, blocks: string[] }` importés depuis `src/types/onboarding.ts` — dans le lab, on utilise de simples `string`.
- `topoSort` alimentera le rendu ordonné de la checklist ; son `null` lèvera une erreur de validation affichée à l'admin (« dépendance circulaire dans les tâches »).
- `hasCycle` sera aussi branché sur la **hiérarchie de rôles** (graphe orienté) pour interdire qu'un rôle hérite de lui-même.
- `shortestPath` sera réutilisé tel quel par la feature `relations` pour le degré de séparation entre membres.

**Commit cible :**
```
feat(onboarding): ordre des tâches via tri topologique + rejet des cycles
feat(graph): BFS plus court chemin réutilisable (onboarding + relations)
```
