---
titre: Graphes et parcours
cours: 05-algorithms
notions: [graphe orienté et non orienté, graphe pondéré, liste d'adjacence vs matrice d'adjacence, DFS sur graphe avec visited, BFS sur graphe avec visited, BFS = plus court chemin en nombre d'arêtes, détection de cycle non orienté, détection de cycle orienté par trois couleurs, tri topologique par DFS post-ordre, tri topologique de Kahn par in-degree, composantes connexes, Dijkstra avec priority queue, survol A* et Bellman-Ford]
outcomes: [choisir et construire la bonne représentation d'un graphe en TypeScript, implémenter DFS et BFS avec un ensemble visited pour éviter les cycles, appliquer BFS pour le plus court chemin non pondéré, détecter un cycle et produire un tri topologique, appliquer Dijkstra pour le plus court chemin pondéré]
prerequis: [06-arbres-bst]
next: 08-backtracking
libs: []
tribuzen: graphe de relations entre familles et membres TribuZen — BFS pour le degré de séparation, tri topologique des tâches d'onboarding, détection de cycle dans une hiérarchie de rôles
last-reviewed: 2026-07
---

# Graphes et parcours

> **Outcomes — tu sauras FAIRE :** choisir et construire la bonne représentation d'un graphe, parcourir en DFS et BFS avec un `visited` anti-cycle, trouver un plus court chemin non pondéré via BFS, détecter un cycle, produire un tri topologique, et appliquer Dijkstra pour un plus court chemin pondéré.
> **Difficulté :** :star::star::star::star:

## 1. Cas concret d'abord

Tu bosses sur la fonctionnalité « **degré de séparation** » de TribuZen : sur le profil d'un membre, on veut afficher *« Léa est à 2 relations de toi (toi → Papa → Léa) »*. Le back te renvoie les relations comme une liste de paires — pas un arbre, parce qu'ici il y a des **cycles** (Papa connaît Maman qui connaît Papa) et **plusieurs chemins** possibles.

```ts
// Ce que le back renvoie : des relations symétriques entre membres
const relations: [string, string][] = [
  ['moi', 'Papa'],
  ['moi', 'Maman'],
  ['Papa', 'Maman'],       // ← cycle : moi–Papa–Maman–moi
  ['Papa', 'Léa'],
  ['Maman', 'Mamie'],
  ['Léa', 'Mamie'],
];
```

Un arbre ne suffit plus (module 06) : pas de racine unique, des cycles, des poids possibles (force du lien). Tu as besoin d'un **graphe**. Trois questions concrètes que ce module va résoudre :

1. Comment stocker ça en mémoire pour interroger vite les voisins d'un membre ?
2. Comment calculer le **degré de séparation** entre `moi` et `Léa` sans tourner en rond dans le cycle `Papa–Maman` ?
3. Plus tard : comment ordonner les **tâches d'onboarding** d'une famille quand certaines en bloquent d'autres, et refuser la config si quelqu'un a créé une **dépendance circulaire** ?

---

## 2. Théorie complète, concise

### 2.1 Vocabulaire : ce qu'est un graphe

Un graphe `G = (V, E)` est un ensemble de **sommets** (V, *vertices* / nœuds) et d'**arêtes** (E, *edges*) reliant des paires de sommets. C'est la généralisation de l'arbre du module 06 : un arbre est un graphe **connexe sans cycle** avec une racine ; un graphe quelconque peut avoir des cycles, plusieurs composantes, aucune racine.

Quatre axes de classification, tous indépendants :

- **Non orienté** : `A—B` se parcourt dans les deux sens (amitié, « se connaissent »).
- **Orienté** (*digraph*) : `A→B` n'implique pas `B→A` (follower, « dépend de », héritage de rôle).
- **Pondéré** : chaque arête porte un coût/poids (distance, durée, force du lien).
- **Non pondéré** : toutes les arêtes se valent (coût implicite 1).

Un **DAG** (*Directed Acyclic Graph*) est un graphe orienté sans cycle : c'est le support du tri topologique (§2.6).

### 2.2 Représentation : liste d'adjacence vs matrice

Deux façons de stocker `E`. En JavaScript, on utilise **presque toujours la liste d'adjacence** (`Map<sommet, voisins[]>`), parce que les graphes web sont creux (peu d'arêtes par rapport à V²).

```ts
// ─── Liste d'adjacence : Map<sommet, voisins[]> ──────────────────
type Graph<T> = Map<T, T[]>;

function createGraph<T>(): Graph<T> {
  return new Map();
}

function addVertex<T>(g: Graph<T>, v: T): void {
  if (!g.has(v)) g.set(v, []);
}

// directed = false → on ajoute l'arête dans les DEUX sens
function addEdge<T>(g: Graph<T>, from: T, to: T, directed = false): void {
  addVertex(g, from);
  addVertex(g, to);
  g.get(from)!.push(to);
  if (!directed) g.get(to)!.push(from);
}

const g = createGraph<string>();
for (const [a, b] of [
  ['moi', 'Papa'], ['moi', 'Maman'], ['Papa', 'Maman'],
  ['Papa', 'Léa'], ['Maman', 'Mamie'], ['Léa', 'Mamie'],
] as [string, string][]) {
  addEdge(g, a, b); // non orienté par défaut
}
// Map { 'moi' => ['Papa','Maman'], 'Papa' => ['moi','Maman','Léa'], ... }
```

La **matrice d'adjacence** stocke un tableau `V×V` où `m[i][j] = 1` si l'arête `i→j` existe. Elle brille quand le graphe est **dense** et qu'on teste souvent « l'arête X→Y existe-t-elle ? ».

```ts
// ─── Matrice d'adjacence : m[i][j] = 1 si arête i→j ──────────────
function adjacencyMatrix(vertices: string[], edges: [string, string][]): number[][] {
  const idx = new Map(vertices.map((v, i) => [v, i] as const));
  const m = Array.from({ length: vertices.length }, () =>
    new Array(vertices.length).fill(0),
  );
  for (const [from, to] of edges) {
    m[idx.get(from)!][idx.get(to)!] = 1;
    m[idx.get(to)!][idx.get(from)!] = 1; // non orienté → symétrique
  }
  return m;
}
```

Comparatif — mémorise la ligne « quand choisir » :

| Critère | Liste d'adjacence | Matrice d'adjacence |
|---|---|---|
| Espace | `O(V + E)` | `O(V²)` |
| Ajouter une arête | `O(1)` | `O(1)` |
| Tester une arête `X→Y` | `O(deg)` | `O(1)` |
| Lister les voisins de X | `O(deg)` | `O(V)` |
| Graphe **creux** | idéal | gaspillage mémoire |
| Graphe **dense** | voisins lents | idéal |
| Défaut en JS | oui (`Map` + `Array`) | rare |

### 2.3 DFS et BFS sur graphe : le `visited` obligatoire

La grande différence avec les arbres (module 06) : un graphe a des **cycles**. Sans mémoire des sommets déjà vus, un parcours boucle à l'infini. La parade est un **`Set` visited** qu'on renseigne au moment de découvrir un sommet.

**BFS** (largeur, *breadth-first*) explore niveau par niveau avec une **file** (FIFO). Complexité `O(V + E)`.

```ts
function bfs<T>(g: Graph<T>, start: T): T[] {
  const visited = new Set<T>([start]); // ← marquer À L'ENFILEMENT
  const order: T[] = [];
  const queue: T[] = [start];

  while (queue.length > 0) {
    const v = queue.shift()!;           // défile en tête (FIFO)
    order.push(v);
    for (const nb of g.get(v) ?? []) {
      if (!visited.has(nb)) {
        visited.add(nb);                // marque avant d'enfiler → jamais 2× en file
        queue.push(nb);
      }
    }
  }
  return order;
}
```

**DFS** (profondeur, *depth-first*) va le plus loin possible avant de revenir, avec une **pile** (LIFO) — explicite ou via la pile d'appels récursive. Complexité `O(V + E)`.

```ts
// Version récursive — la plus lisible
function dfs<T>(g: Graph<T>, start: T): T[] {
  const visited = new Set<T>();
  const order: T[] = [];

  function explore(v: T): void {
    visited.add(v);                     // marque À LA VISITE
    order.push(v);
    for (const nb of g.get(v) ?? []) {
      if (!visited.has(nb)) explore(nb);
    }
  }

  explore(start);
  return order;
}

// Version itérative — pile explicite, on check visited au POP
function dfsIter<T>(g: Graph<T>, start: T): T[] {
  const visited = new Set<T>();
  const order: T[] = [];
  const stack: T[] = [start];

  while (stack.length > 0) {
    const v = stack.pop()!;             // dépile (LIFO)
    if (visited.has(v)) continue;       // un sommet peut être empilé plusieurs fois
    visited.add(v);
    order.push(v);
    for (const nb of g.get(v) ?? []) {
      if (!visited.has(nb)) stack.push(nb);
    }
  }
  return order;
}
```

> **BFS ou DFS ?** BFS pour tout ce qui touche à la **distance / plus court chemin non pondéré** et aux niveaux. DFS pour la **détection de cycle**, le **tri topologique**, l'exploration exhaustive (backtracking, module 08).

### 2.4 BFS = plus court chemin en nombre d'arêtes

Propriété clé : dans un graphe **non pondéré**, BFS visite les sommets par distance croissante depuis `start`. Le premier chemin trouvé vers une cible est donc **minimal en nombre d'arêtes**. On reconstruit le chemin avec une `Map<enfant, parent>`.

```ts
function shortestPath<T>(g: Graph<T>, start: T, end: T): T[] | null {
  if (start === end) return [start];
  const visited = new Set<T>([start]);
  const parent = new Map<T, T>();       // ← pour remonter le chemin
  const queue: T[] = [start];

  while (queue.length > 0) {
    const v = queue.shift()!;
    for (const nb of g.get(v) ?? []) {
      if (visited.has(nb)) continue;
      visited.add(nb);
      parent.set(nb, v);                // on note d'où on est arrivé
      if (nb === end) {                 // 1re rencontre = chemin le plus court
        const path: T[] = [end];
        let cur = end;
        while (cur !== start) {
          cur = parent.get(cur)!;
          path.unshift(cur);
        }
        return path;
      }
      queue.push(nb);
    }
  }
  return null;                          // pas de chemin (composantes séparées)
}
```

Le **degré de séparation** du cas concret, c'est `shortestPath(g, 'moi', 'Léa').length - 1`.

### 2.5 Détection de cycle et composantes connexes

**Composantes connexes** (graphe non orienté) : les groupes de sommets reliés entre eux. On lance un parcours depuis chaque sommet non encore visité.

```ts
function connectedComponents<T>(g: Graph<T>): T[][] {
  const visited = new Set<T>();
  const comps: T[][] = [];
  for (const start of g.keys()) {
    if (visited.has(start)) continue;
    const comp: T[] = [];
    const queue: T[] = [start];
    visited.add(start);
    while (queue.length > 0) {
      const v = queue.shift()!;
      comp.push(v);
      for (const nb of g.get(v) ?? []) {
        if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
      }
    }
    comps.push(comp);
  }
  return comps;
}
```

**Cycle dans un graphe non orienté** : pendant un DFS, si on tombe sur un voisin déjà visité **qui n'est pas le parent immédiat**, il y a un cycle.

```ts
function hasCycleUndirected<T>(g: Graph<T>): boolean {
  const visited = new Set<T>();
  function dfs(v: T, parent: T | null): boolean {
    visited.add(v);
    for (const nb of g.get(v) ?? []) {
      if (!visited.has(nb)) {
        if (dfs(nb, v)) return true;
      } else if (nb !== parent) {
        return true;                    // déjà vu et pas le parent → cycle
      }
    }
    return false;
  }
  for (const v of g.keys()) {
    if (!visited.has(v) && dfs(v, null)) return true;
  }
  return false;
}
```

**Cycle dans un graphe orienté** : la règle « pas le parent » ne suffit plus. On utilise **trois couleurs** — BLANC (jamais vu), GRIS (en cours d'exploration, sur la pile d'appels), NOIR (terminé). Rencontrer un sommet **GRIS** signifie qu'on referme une boucle → cycle.

```ts
function hasCycleDirected<T>(g: Graph<T>): boolean {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<T, number>();
  for (const v of g.keys()) color.set(v, WHITE);

  function dfs(v: T): boolean {
    color.set(v, GRAY);                 // entrée : on est en cours
    for (const nb of g.get(v) ?? []) {
      const c = color.get(nb);
      if (c === GRAY) return true;      // arête vers un ancêtre → cycle
      if (c === WHITE && dfs(nb)) return true;
    }
    color.set(v, BLACK);               // sortie : sous-arbre entièrement exploré
    return false;
  }
  for (const v of g.keys()) {
    if (color.get(v) === WHITE && dfs(v)) return true;
  }
  return false;
}
```

### 2.6 Tri topologique : Kahn et DFS

Sur un **DAG**, un tri topologique produit un ordre linéaire tel que pour toute arête `A→B`, `A` apparaît **avant** `B`. Usage : ordre de compilation, dépendances npm, **enchaînement de tâches**.

**Méthode Kahn (BFS par in-degree)** — la plus intuitive, et elle **détecte le cycle gratuitement** : si on n'arrive pas à sortir tous les sommets, c'est qu'il en reste bloqués dans un cycle.

```ts
function topoSortKahn<T>(g: Graph<T>): T[] | null {
  const inDeg = new Map<T, number>();
  for (const v of g.keys()) inDeg.set(v, 0);
  for (const [, nbs] of g) {
    for (const nb of nbs) inDeg.set(nb, (inDeg.get(nb) ?? 0) + 1);
  }

  const queue: T[] = [];
  for (const [v, d] of inDeg) if (d === 0) queue.push(v); // sans prérequis

  const order: T[] = [];
  while (queue.length > 0) {
    const v = queue.shift()!;
    order.push(v);
    for (const nb of g.get(v) ?? []) {
      const d = inDeg.get(nb)! - 1;     // on "retire" v → un prérequis de moins
      inDeg.set(nb, d);
      if (d === 0) queue.push(nb);      // nb n'a plus de prérequis → prêt
    }
  }
  // moins de sommets sortis que dans le graphe → cycle
  return order.length === g.size ? order : null;
}
```

**Méthode DFS (post-ordre inversé)** — on empile un sommet **après** avoir exploré tous ses descendants, puis on inverse. Élégante, mais ne signale pas le cycle sans un contrôle de couleur en plus.

```ts
function topoSortDFS<T>(g: Graph<T>): T[] {
  const visited = new Set<T>();
  const order: T[] = [];
  function dfs(v: T): void {
    visited.add(v);
    for (const nb of g.get(v) ?? []) if (!visited.has(nb)) dfs(nb);
    order.unshift(v);                   // AJOUT en tête après les descendants
  }
  for (const v of g.keys()) if (!visited.has(v)) dfs(v);
  return order;
}
```

### 2.7 Dijkstra : plus court chemin pondéré

BFS ignore les poids. Dès qu'une arête a un **coût**, il faut **Dijkstra** : à chaque étape, on extrait le sommet non finalisé de **distance provisoire minimale**, et on relâche (*relax*) ses arêtes. Le choix du minimum se fait avec une **priority queue** — c'est là que sert le **MinHeap du module 05** (extraction du min en `O(log V)`). Complexité `O((V + E) log V)`. **Condition** : poids **positifs** uniquement.

```ts
type WeightedGraph<T> = Map<T, Array<{ to: T; weight: number }>>;

// Version illustrative avec un tableau trié en guise de PQ.
// EN PROD : remplace `pq` par le MinHeap du module 05 (extractMin O(log V)).
function dijkstra<T>(g: WeightedGraph<T>, start: T): {
  dist: Map<T, number>; prev: Map<T, T | null>;
} {
  const dist = new Map<T, number>();
  const prev = new Map<T, T | null>();
  const done = new Set<T>();
  for (const v of g.keys()) { dist.set(v, Infinity); prev.set(v, null); }
  dist.set(start, 0);

  const pq: Array<{ v: T; d: number }> = [{ v: start, d: 0 }];
  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d);       // ← un MinHeap remplace ce tri
    const { v } = pq.shift()!;
    if (done.has(v)) continue;          // entrée périmée, on ignore
    done.add(v);
    for (const { to, weight } of g.get(v) ?? []) {
      const nd = dist.get(v)! + weight;
      if (nd < dist.get(to)!) {         // relâchement : chemin plus court trouvé
        dist.set(to, nd);
        prev.set(to, v);
        pq.push({ v: to, d: nd });
      }
    }
  }
  return { dist, prev };
}
```

### 2.8 Survol : A* et Bellman-Ford

- **A\*** : Dijkstra + une **heuristique** `h(n)` qui estime la distance restante jusqu'au but (ex. distance à vol d'oiseau). Il priorise `dist + h`, ce qui le rend beaucoup plus rapide vers une cible unique (jeux, GPS). Si `h = 0`, A* **est** Dijkstra.
- **Bellman-Ford** : plus court chemin qui **tolère les poids négatifs** (Dijkstra ne le peut pas). Plus lent (`O(V·E)`), mais sait **détecter un cycle de poids négatif**. Utile en finance/arbitrage. À connaître de nom ; pas d'implémentation attendue ici.

---

## 3. Worked examples

### Exemple 1 — Degré de séparation (BFS, cas concret résolu)

On reprend le graphe de relations du §1 et on calcule le degré de séparation `moi → Léa`, pas à pas.

```ts
const g = createGraph<string>();
for (const [a, b] of [
  ['moi', 'Papa'], ['moi', 'Maman'], ['Papa', 'Maman'],
  ['Papa', 'Léa'], ['Maman', 'Mamie'], ['Léa', 'Mamie'],
] as [string, string][]) {
  addEdge(g, a, b);
}

const path = shortestPath(g, 'moi', 'Léa');
console.log(path);                       // ['moi', 'Papa', 'Léa']
console.log((path?.length ?? 1) - 1);    // 2  → "à 2 relations de toi"
```

Déroulé de la file (chaque sommet marqué `visited` à l'enfilement) :

1. File `['moi']`, `parent {}`. On défile `moi`, voisins `Papa`, `Maman` → non vus → `parent{Papa:moi, Maman:moi}`, file `['Papa','Maman']`.
2. On défile `Papa`, voisins `moi` (vu), `Maman` (vu), `Léa` → `Léa` non vu → `parent{...,Léa:Papa}`. **`Léa === end`** → stop.
3. Reconstruction depuis `Léa` : `Léa → parent Papa → parent moi = start`. Chemin `['moi','Papa','Léa']`, longueur 3, soit **2 arêtes**.

Le cycle `Papa–Maman` n'a **jamais** provoqué de boucle : `Maman` était déjà `visited` quand `Papa` l'a re-proposée.

### Exemple 2 — Ordonner l'onboarding + refuser un cycle (Kahn)

Onboarding d'une nouvelle famille TribuZen : certaines tâches en bloquent d'autres. On modélise `A→B` = « A doit être fait avant B », puis on trie.

```ts
const onboarding = createGraph<string>();
addEdge(onboarding, 'créer-compte', 'inviter-membres', true);
addEdge(onboarding, 'créer-compte', 'choisir-plan', true);
addEdge(onboarding, 'inviter-membres', 'créer-première-tribu', true);
addEdge(onboarding, 'choisir-plan', 'créer-première-tribu', true);
addEdge(onboarding, 'créer-première-tribu', 'publier-événement', true);

console.log(topoSortKahn(onboarding));
// ['créer-compte', 'inviter-membres', 'choisir-plan',
//  'créer-première-tribu', 'publier-événement']  (un ordre valide)
```

Déroulé Kahn :
1. In-degrees : `créer-compte:0`, `inviter-membres:1`, `choisir-plan:1`, `créer-première-tribu:2`, `publier-événement:1`. File initiale = sommets à 0 → `['créer-compte']`.
2. Sort `créer-compte` → décrémente `inviter-membres`→0 et `choisir-plan`→0, tous deux enfilés.
3. Sort `inviter-membres` puis `choisir-plan` → chacun décrémente `créer-première-tribu` (2→1→0), enfilé quand il atteint 0.
4. Sort `créer-première-tribu` → `publier-événement`→0. Sort `publier-événement`. `order.length === 5 === g.size` → **pas de cycle**, ordre renvoyé.

Maintenant on introduit une **dépendance circulaire** (un admin distrait) :

```ts
const buggy = createGraph<string>();
addEdge(buggy, 'A', 'B', true);
addEdge(buggy, 'B', 'C', true);
addEdge(buggy, 'C', 'A', true);          // ← referme le cycle A→B→C→A

console.log(topoSortKahn(buggy));        // null
```

Aucun sommet n'a d'in-degree 0 → la file initiale est **vide** → `order.length (0) !== g.size (3)` → **`null`**. On affiche à l'admin « configuration invalide : dépendance circulaire ».

---

## 4. Pièges & misconceptions

### PIÈGE #1 — Oublier `visited` (boucle infinie sur cycle)

```ts
// ❌ DFS sans visited : sur 'Papa'–'Maman'–'Papa'..., ne termine jamais
function dfsBug<T>(g: Graph<T>, v: T): void {
  console.log(v);
  for (const nb of g.get(v) ?? []) dfsBug(g, nb); // relance à l'infini
}
// ✅ un Set visited coupe la récursion dès qu'un sommet est revu (§2.3)
```

Sur un **arbre** (module 06) on s'en passait — pas de cycle, pas de retour en arrière. Sur un **graphe**, `visited` n'est pas optionnel. Règle : *tout parcours de graphe a un `visited`*.

### PIÈGE #2 — Marquer `visited` trop tard en BFS

```ts
// ❌ marquer au DÉFILEMENT : un sommet peut être enfilé plusieurs fois
while (queue.length) {
  const v = queue.shift()!;
  visited.add(v);                        // trop tard
  for (const nb of g.get(v) ?? [])
    if (!visited.has(nb)) queue.push(nb); // nb enfilé par 2 voisins → doublon
}
// ✅ marque À L'ENFILEMENT (§2.3) : visited.add(nb) juste avant queue.push(nb)
```

Marquer au défilement gonfle la file et peut fausser le plus court chemin. En BFS on marque **quand on enfile**.

### PIÈGE #3 — Croire que BFS gère les poids

BFS donne le plus court chemin **en nombre d'arêtes**, pas en **coût**. `moi→Papa→Léa` (2 arêtes) peut être plus « long » qu'un chemin de 3 arêtes si les poids diffèrent. Dès qu'il y a des poids → **Dijkstra** (§2.7), pas BFS.

### PIÈGE #4 — Appliquer un tri topologique sur un graphe avec cycle

Le tri topologique n'existe **que** sur un DAG. Sur un graphe cyclique, `topoSortDFS` renverra un ordre **faux** sans prévenir. Préfère **Kahn** (§2.6) qui renvoie `null` en présence de cycle, ou double le DFS d'un contrôle trois couleurs.

### PIÈGE #5 — Confondre les deux détections de cycle

La condition « voisin visité ≠ parent » **ne marche que pour le non-orienté**. En orienté, un sommet **NOIR** (terminé) n'est pas un cycle — seul un sommet **GRIS** (encore sur la pile) l'est. Utiliser la règle du parent sur un digraph produit des faux positifs.

### PIÈGE #6 — Dijkstra avec des poids négatifs

Dijkstra suppose qu'une fois un sommet finalisé, sa distance est définitive. Un poids négatif casse cette hypothèse et donne un résultat faux. Poids négatifs → **Bellman-Ford** (§2.8).

---

## 5. Ancrage TribuZen

Le graphe est la structure derrière trois fonctionnalités concrètes du produit.

**Graphe de relations (BFS)** — `src/lib/graph/relations.ts`. Les liens familles/membres forment un graphe **non orienté**. `shortestPath` alimente le « degré de séparation » affiché sur un profil (`moi → Papa → Léa` = 2). BFS parce que non pondéré et qu'on veut le minimum d'intermédiaires. Les composantes connexes servent à détecter les membres isolés (aucun lien) à relancer.

**Tri topologique de l'onboarding (Kahn)** — `src/features/onboarding/taskGraph.ts`. Les tâches d'accueil d'une famille ont des prérequis (`choisir-plan` avant `créer-première-tribu`). `topoSortKahn` produit l'ordre d'affichage de la checklist et son `null` bloque toute config incohérente saisie côté admin.

**Détection de cycle dans la hiérarchie de rôles (trois couleurs)** — `src/features/roles/roleHierarchy.ts`. Les rôles héritent en graphe **orienté** (`superadmin→admin→editor→viewer`). Avant d'enregistrer une modification de hiérarchie, `hasCycleDirected` interdit qu'un rôle finisse par hériter de lui-même — sinon la résolution de permissions boucle en prod.

Fichiers cibles dans `smaurier/tribuzen` :

```
tribuzen/src/
  lib/graph/
    graph.ts          ← createGraph, addVertex, addEdge (générique)
    traversals.ts     ← bfs, dfs, shortestPath
    dijkstra.ts       ← plus court chemin pondéré (MinHeap module 05)
  features/
    relations/relations.ts     ← degré de séparation (BFS)
    onboarding/taskGraph.ts     ← ordre des tâches (Kahn) + garde-fou cycle
    roles/roleHierarchy.ts      ← détection de cycle (trois couleurs)
```

---

## 6. Points clés

1. Un graphe = sommets + arêtes ; plus général qu'un arbre (cycles possibles, pas de racine, plusieurs composantes).
2. Quatre axes indépendants : orienté/non orienté, pondéré/non pondéré.
3. En JS, la **liste d'adjacence** (`Map<T, T[]>`) est le défaut ; la matrice ne gagne que sur graphe dense avec tests d'arête fréquents.
4. Tout parcours de graphe porte un **`Set` visited** pour ne pas boucler sur les cycles ; en BFS on marque **à l'enfilement**.
5. **BFS** (file) = niveaux + plus court chemin **en nombre d'arêtes** ; **DFS** (pile/récursion) = détection de cycle + tri topologique.
6. Cycle **non orienté** : voisin visité ≠ parent. Cycle **orienté** : sommet **GRIS** rencontré (trois couleurs).
7. **Tri topologique** (DAG seulement) : Kahn (in-degree, détecte le cycle via `null`) ou DFS post-ordre inversé.
8. **Composantes connexes** = un parcours lancé depuis chaque sommet non visité.
9. **Dijkstra** = plus court chemin **pondéré** (poids ≥ 0), `O((V+E) log V)` avec un **MinHeap** (module 05).
10. Survol : **A\*** = Dijkstra + heuristique vers un but ; **Bellman-Ford** = poids négatifs + détection de cycle négatif.

---

## 7. Seeds Anki

```
Pourquoi un parcours de graphe a-t-il toujours besoin d'un Set visited, contrairement à un parcours d'arbre ?|Un graphe peut contenir des cycles ; sans mémoire des sommets déjà vus, DFS/BFS bouclent à l'infini. Un arbre est acyclique, donc le retour en arrière ne se produit pas.
Liste d'adjacence ou matrice d'adjacence : quand choisir quoi ?|Liste d'adjacence (Map, O(V+E) espace) pour un graphe creux — le défaut en JS. Matrice (O(V²)) pour un graphe dense où l'on teste souvent l'existence d'une arête X vers Y en O(1).
Quelle propriété rend BFS capable de trouver le plus court chemin, et sous quelle condition ?|BFS visite les sommets par distance croissante depuis la source ; la 1re fois qu'il atteint la cible, le chemin est minimal EN NOMBRE D'ARÊTES. Condition : graphe non pondéré.
En BFS, à quel moment faut-il marquer un sommet visited et pourquoi ?|À l'ENFILEMENT (juste avant queue.push), pas au défilement. Sinon deux voisins peuvent enfiler le même sommet, gonflant la file et faussant le plus court chemin.
Comment détecter un cycle dans un graphe ORIENTÉ, et pourquoi la règle du non-orienté ne marche pas ?|Trois couleurs BLANC/GRIS/NOIR ; rencontrer un sommet GRIS (encore sur la pile) = cycle. La règle « voisin visité différent du parent » ne vaut que pour le non-orienté ; en orienté un sommet NOIR terminé n'est pas un cycle.
Qu'est-ce qu'un tri topologique, sur quel type de graphe, et que renvoie Kahn en cas de cycle ?|Un ordre linéaire d'un DAG tel que pour toute arête A vers B, A précède B. Kahn (in-degree) renvoie null si tous les sommets ne sortent pas — c'est sa détection de cycle intégrée.
Pourquoi Dijkstra et pas BFS pour un graphe pondéré, et quelle structure accélère l'extraction du minimum ?|BFS minimise le nombre d'arêtes, pas le coût. Dijkstra extrait à chaque étape le sommet de distance provisoire minimale via une priority queue (MinHeap, module 05), pour O((V+E) log V). Poids positifs requis.
Quelle est la limite de Dijkstra que Bellman-Ford lève, et à quel coût ?|Dijkstra échoue sur les poids négatifs. Bellman-Ford les tolère et détecte les cycles de poids négatif, mais en O(V·E), plus lent.
```

---

## Pont vers le lab

> Lab associé : `05-algorithms/labs/lab-07-graph-dependencies/README.md`. Construire un graphe de dépendances de tâches d'onboarding TribuZen de zéro : BFS pour le plus court chemin, tri topologique de Kahn pour l'ordre, et détection de cycle pour refuser une config circulaire — corrigé complet + variante J+30.
