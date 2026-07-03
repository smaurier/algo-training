---
titre: Arbres et BST
cours: 05-algorithms
notions: [terminologie des arbres, arbre binaire, parcours DFS pré/in/post-ordre, DFS itératif avec pile, parcours BFS par niveaux avec file, binary search tree, recherche/insertion/suppression en O(h), déséquilibre et O(n), arbres auto-équilibrés en survol, hauteur, validation de BST, plus proche ancêtre commun, sérialisation]
outcomes: [modéliser une hiérarchie en arbre binaire typé, implémenter les parcours DFS et BFS récursifs et itératifs, écrire et raisonner sur les opérations d'un BST et leur coût]
prerequis: [05-tris-partition-heaps]
next: 07-graphes-et-parcours
libs: []
tribuzen: arbre hiérarchique des familles et sous-groupes TribuZen — parcours pour affichage, hauteur pour limiter la profondeur, BST pour index trié des membres
last-reviewed: 2026-07
---

# Arbres et BST

> **Outcomes — tu sauras FAIRE :** modéliser une hiérarchie en arbre binaire typé, implémenter les parcours DFS (récursif + itératif avec pile) et BFS (par niveaux avec file), écrire et raisonner sur les opérations d'un BST et leur coût.
> **Difficulté :** :star::star::star:

## 1. Cas concret d'abord

Tu travailles sur l'admin TribuZen. Une **tribu** est organisée en hiérarchie : une famille contient des sous-groupes, qui contiennent eux-mêmes des sous-groupes (les cousins, les grands-parents…). Le back te renvoie ça :

```ts
// Ce que le back renvoie : une hiérarchie de groupes
interface Group {
  id: string;
  name: string;
  left: Group | null;   // sous-groupe "principal"
  right: Group | null;  // sous-groupe "secondaire"
}

const tribu: Group = {
  id: 'g1', name: 'Les Martin',
  left:  { id: 'g2', name: 'Parents',      left: { id: 'g4', name: 'Papa', left: null, right: null },
                                            right:{ id: 'g5', name: 'Maman', left: null, right: null } },
  right: { id: 'g3', name: 'Grands-parents', left: null,
                                            right:{ id: 'g6', name: 'Mamie', left: null, right: null } },
};
```

Trois besoins produit **immédiats**, et aucun ne se résout avec une simple boucle `for` :

1. **Afficher** tous les groupes dans l'ordre de la structure — il faut *parcourir* l'arbre.
2. **Limiter la profondeur** de l'arborescence à 4 niveaux (sinon l'UI devient illisible) — il faut mesurer la *hauteur*.
3. **Afficher niveau par niveau** (tous les groupes de rang 1, puis rang 2…) pour un rendu en colonnes — c'est un parcours *en largeur*.

Une boucle plate ne suffit pas : la donnée est **récursive**. Ce module te donne les parcours et les opérations pour manipuler ces structures consciemment.

---

## 2. Théorie complète, concise

### 2.1 Terminologie

Un **arbre** est un ensemble de nœuds reliés, sans cycle, où chaque nœud a **un seul parent** (sauf la racine).

```
            A          ← racine (root) : le seul nœud sans parent
          /   \
         B     C       ← nœuds internes : ont au moins un enfant
        / \     \
       D   E     F     ← feuilles (leaves) : aucun enfant

- Racine (root)      : le sommet, sans parent
- Feuille (leaf)     : un nœud sans enfant
- Nœud interne       : un nœud avec au moins un enfant
- Parent / enfant    : relation directe entre deux nœuds
- Profondeur (depth) : nombre d'arêtes de la RACINE jusqu'au nœud (racine = 0)
- Hauteur (height)   : nombre d'arêtes du nœud jusqu'à sa feuille LA PLUS LOINTAINE
- Sous-arbre         : un nœud + tous ses descendants
```

> **Profondeur vs hauteur** — deux mesures opposées à ne pas confondre. La *profondeur* se compte **depuis le haut** (racine → nœud), la *hauteur* se compte **depuis le bas** (nœud → feuille la plus profonde). La hauteur de l'arbre = la hauteur de sa racine = la profondeur maximale.

### 2.2 Arbre binaire

Un **arbre binaire** est un arbre où chaque nœud a **au plus 2 enfants**, nommés `left` et `right`. C'est la forme la plus courante en algorithmique.

```ts
interface TreeNode<T> {
  value: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
}

// Fabrique pour construire un arbre à la main
function node<T>(
  value: T,
  left: TreeNode<T> | null = null,
  right: TreeNode<T> | null = null,
): TreeNode<T> {
  return { value, left, right };
}

//        1
//       / \
//      2   3
//     / \   \
//    4   5   6
const tree = node(1,
  node(2, node(4), node(5)),
  node(3, null, node(6)),
);
```

Le cas de base de **toute** récursion sur un arbre binaire est `node === null` (arbre vide). On traite ensuite le nœud courant, puis on **combine** les résultats des sous-arbres gauche et droit.

### 2.3 Parcours en profondeur (DFS) — récursif

Le **DFS** (Depth-First Search) descend le plus loin possible avant de remonter. Trois ordres, qui diffèrent **uniquement par le moment où l'on visite le nœud courant** par rapport à ses enfants :

```ts
// PRÉ-ordre : nœud AVANT enfants  → racine, gauche, droite
// Usage : copier/sérialiser un arbre, afficher la structure du haut vers le bas
function preOrder<T>(n: TreeNode<T> | null, out: T[] = []): T[] {
  if (!n) return out;              // cas de base
  out.push(n.value);               // ← visite AVANT de descendre
  preOrder(n.left, out);
  preOrder(n.right, out);
  return out;
}

// IN-ordre : nœud ENTRE enfants  → gauche, racine, droite
// Usage : parcours TRIÉ d'un BST (voir 2.6)
function inOrder<T>(n: TreeNode<T> | null, out: T[] = []): T[] {
  if (!n) return out;
  inOrder(n.left, out);
  out.push(n.value);               // ← visite ENTRE les deux descentes
  inOrder(n.right, out);
  return out;
}

// POST-ordre : nœud APRÈS enfants → gauche, droite, racine
// Usage : suppression/libération, calcul agrégé remontant (taille, somme)
function postOrder<T>(n: TreeNode<T> | null, out: T[] = []): T[] {
  if (!n) return out;
  postOrder(n.left, out);
  postOrder(n.right, out);
  out.push(n.value);               // ← visite APRÈS être remonté
  return out;
}

preOrder(tree);  // [1, 2, 4, 5, 3, 6]
inOrder(tree);   // [4, 2, 5, 1, 3, 6]
postOrder(tree); // [4, 5, 2, 6, 3, 1]
```

Complexité : **O(n)** en temps (chaque nœud visité une fois), **O(h)** en espace (la pile de récursion monte jusqu'à la hauteur `h`).

### 2.4 DFS itératif — avec une pile explicite

La récursion utilise **implicitement** la pile d'appels. On peut la rendre **explicite** avec un tableau utilisé comme pile (`push`/`pop`). Utile quand l'arbre est très profond (risque de *stack overflow*) ou pour un contrôle fin.

```ts
// Pré-ordre itératif : on empile la racine, puis on dépile en boucle
function preOrderIter<T>(root: TreeNode<T> | null): T[] {
  if (!root) return [];
  const out: T[] = [];
  const stack: TreeNode<T>[] = [root];

  while (stack.length > 0) {
    const n = stack.pop()!;        // LIFO : dernier empilé, premier sorti
    out.push(n.value);
    // On empile DROITE d'abord pour que GAUCHE ressorte en premier
    if (n.right) stack.push(n.right);
    if (n.left)  stack.push(n.left);
  }
  return out;
}

preOrderIter(tree); // [1, 2, 4, 5, 3, 6] — identique au récursif
```

> **Clé mentale :** une pile (LIFO) donne un parcours en profondeur ; une file (FIFO) donne un parcours en largeur. Changer la structure change l'ordre de visite.

### 2.5 Parcours en largeur (BFS) — avec une file

Le **BFS** (Breadth-First Search) visite l'arbre **niveau par niveau** : tous les nœuds de profondeur 0, puis 1, puis 2… On utilise une **file** (FIFO) : `push` pour enfiler, `shift` pour défiler.

```ts
// BFS simple : ordre niveau par niveau, tout à plat
function bfs<T>(root: TreeNode<T> | null): T[] {
  if (!root) return [];
  const out: T[] = [];
  const queue: TreeNode<T>[] = [root];

  while (queue.length > 0) {
    const n = queue.shift()!;      // FIFO : premier enfilé, premier sorti
    out.push(n.value);
    if (n.left)  queue.push(n.left);
    if (n.right) queue.push(n.right);
  }
  return out;
}

bfs(tree); // [1, 2, 3, 4, 5, 6]

// BFS regroupé PAR niveau : on fige la taille de la file au début de chaque niveau
function levelOrder<T>(root: TreeNode<T> | null): T[][] {
  if (!root) return [];
  const out: T[][] = [];
  const queue: TreeNode<T>[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;   // ← nb de nœuds du niveau courant
    const level: T[] = [];
    for (let i = 0; i < levelSize; i++) {
      const n = queue.shift()!;
      level.push(n.value);
      if (n.left)  queue.push(n.left);
      if (n.right) queue.push(n.right);
    }
    out.push(level);
  }
  return out;
}

levelOrder(tree); // [[1], [2, 3], [4, 5, 6]]
```

> **Astuce du `levelSize`** — figer `queue.length` **avant** la boucle interne isole exactement les nœuds du niveau courant. Sans ça, on mélange les niveaux au fil des `push`.

### 2.6 Binary Search Tree (BST)

Un **BST** est un arbre binaire avec une **propriété d'ordre** : pour *chaque* nœud,

```
tout le sous-arbre GAUCHE  < valeur du nœud < tout le sous-arbre DROIT

         8
        / \
       3   10
      / \    \
     1   6    14
        / \   /
       4   7 13

in-ordre  →  [1, 3, 4, 6, 7, 8, 10, 13, 14]   ← TRIÉ, gratuitement
```

Cette invariante permet de **chercher, insérer, supprimer en O(h)** : à chaque nœud, on compare et on va à gauche OU à droite — on élimine la moitié de l'arbre à chaque pas (si l'arbre est équilibré).

```ts
class BST {
  root: TreeNode<number> | null = null;

  // INSERTION — O(h). On descend jusqu'à trouver la place vide
  insert(value: number): void {
    this.root = this.#insert(this.root, value);
  }
  #insert(n: TreeNode<number> | null, value: number): TreeNode<number> {
    if (!n) return { value, left: null, right: null }; // place trouvée
    if (value < n.value)      n.left  = this.#insert(n.left, value);
    else if (value > n.value) n.right = this.#insert(n.right, value);
    // value === n.value : doublon ignoré
    return n;
  }

  // RECHERCHE — O(h). Itérative : on suit un seul chemin
  search(value: number): boolean {
    let cur = this.root;
    while (cur) {
      if (value === cur.value) return true;
      cur = value < cur.value ? cur.left : cur.right; // gauche OU droite
    }
    return false;
  }

  // MIN — O(h). Le nœud le plus à gauche
  findMin(): number | undefined {
    let cur = this.root;
    while (cur?.left) cur = cur.left;
    return cur?.value;
  }

  // SUPPRESSION — O(h). Le cas dur : nœud à 2 enfants
  delete(value: number): void {
    this.root = this.#delete(this.root, value);
  }
  #delete(n: TreeNode<number> | null, value: number): TreeNode<number> | null {
    if (!n) return null;
    if (value < n.value)      { n.left  = this.#delete(n.left, value);  return n; }
    if (value > n.value)      { n.right = this.#delete(n.right, value); return n; }
    // trouvé — 3 cas :
    if (!n.left)  return n.right;   // 0 ou 1 enfant (à droite)
    if (!n.right) return n.left;    // 1 enfant (à gauche)
    // 2 enfants : remplacer par le SUCCESSEUR (min du sous-arbre droit)
    let succ = n.right;
    while (succ.left) succ = succ.left;
    n.value = succ.value;                        // copie la valeur du successeur
    n.right = this.#delete(n.right, succ.value); // puis supprime le successeur
    return n;
  }
}

const bst = new BST();
[8, 3, 10, 1, 6, 14, 4, 7, 13].forEach(v => bst.insert(v));
bst.search(6);     // true
bst.search(5);     // false
bst.findMin();     // 1
inOrder(bst.root); // [1, 3, 4, 6, 7, 8, 10, 13, 14]
```

### 2.7 Déséquilibre → O(n), et arbres auto-équilibrés (survol)

Le `O(h)` du BST n'est bon **que si `h ≈ log n`**. Insérer des valeurs **déjà triées** dégénère l'arbre en liste chaînée : `h = n`, et toutes les opérations retombent à **O(n)**.

```
Insertion de [1,2,3,4] triés :      Équilibré (h ≈ log n) :

  1                                        3
   \                                      / \
    2         h = n = O(n)  ✗            1   4      h ≈ log n = O(log n)  ✓
     \                                    \
      3                                    2
       \
        4
```

En production, on n'utilise **jamais** un BST nu si l'ordre d'insertion n'est pas contrôlé. On prend des **arbres auto-équilibrés** qui réorganisent la structure à chaque insertion pour garantir `h = O(log n)` :

- **AVL** — équilibre strict (différence de hauteur ≤ 1), recherches très rapides.
- **Red-Black** — équilibre plus souple, insertions/suppressions moins coûteuses. C'est ce qui est derrière `TreeMap` (Java), `std::map` (C++)…

> En JavaScript, tu n'implémenteras presque jamais ces arbres : une `Map`/`Set` native (table de hachage) offre déjà O(1) amorti. Le BST reste pertinent quand tu as besoin de l'**ordre trié** (parcours in-ordre, plage min–max, prédécesseur/successeur).

### 2.8 Problèmes classiques

```ts
// HAUTEUR — convention : arbre vide = -1, feuille = 0
function height<T>(n: TreeNode<T> | null): number {
  if (!n) return -1;
  return 1 + Math.max(height(n.left), height(n.right));
}

// VALIDER un BST — vérifier la propriété d'ordre sur des BORNES min/max
// Piège : comparer juste n.value avec ses enfants directs NE SUFFIT PAS.
function isValidBST(
  n: TreeNode<number> | null,
  min = -Infinity,
  max = Infinity,
): boolean {
  if (!n) return true;
  if (n.value <= min || n.value >= max) return false; // hors bornes
  return (
    isValidBST(n.left, min, n.value) &&   // à gauche : plafond = n.value
    isValidBST(n.right, n.value, max)     // à droite : plancher = n.value
  );
}

// PLUS PROCHE ANCÊTRE COMMUN (LCA) — arbre binaire quelconque
function lca<T>(root: TreeNode<T> | null, a: T, b: T): TreeNode<T> | null {
  if (!root) return null;
  if (root.value === a || root.value === b) return root; // l'un est ici
  const left  = lca(root.left, a, b);
  const right = lca(root.right, a, b);
  if (left && right) return root;  // a et b de part et d'autre → ancêtre = root
  return left ?? right;            // les deux du même côté → remonter la réponse
}

// SÉRIALISATION — pré-ordre avec marqueurs "#" pour la structure
function serialize(n: TreeNode<number> | null): string {
  if (!n) return '#';
  return `${n.value},${serialize(n.left)},${serialize(n.right)}`;
}
function deserialize(data: string): TreeNode<number> | null {
  const tokens = data.split(',');
  let i = 0;
  function build(): TreeNode<number> | null {
    const t = tokens[i++];
    if (t === '#') return null;              // marqueur = sous-arbre vide
    const node: TreeNode<number> = { value: Number(t), left: null, right: null };
    node.left = build();                     // pré-ordre : gauche puis droite
    node.right = build();
    return node;
  }
  return build();
}
```

---

## 3. Worked examples

### Exemple 1 — Limiter la profondeur de l'arbre TribuZen (hauteur)

**Problème produit :** l'UI n'affiche proprement que 4 niveaux de groupes. Avant de rendre, on vérifie que l'arbre de la tribu ne dépasse pas cette profondeur.

```ts
interface Group {
  id: string;
  name: string;
  left: Group | null;
  right: Group | null;
}

// height compte des ARÊTES : racine seule = 0, donc "4 niveaux" ⇒ hauteur ≤ 3
function height(n: Group | null): number {
  if (!n) return -1;                                    // 1. cas de base : vide = -1
  return 1 + Math.max(height(n.left), height(n.right)); // 2. combine gauche/droite
}

function isDisplayable(tribu: Group, maxLevels = 4): boolean {
  return height(tribu) <= maxLevels - 1; // 4 niveaux ⇒ hauteur max = 3
}
```

**Déroulé pas à pas** sur `tribu` (racine `Les Martin`, 3 niveaux) :

1. `height('Les Martin')` = `1 + max(height('Parents'), height('Grands-parents'))`.
2. `height('Parents')` = `1 + max(height('Papa'), height('Maman'))` = `1 + max(0, 0)` = `1`.
3. `height('Grands-parents')` = `1 + max(height(null), height('Mamie'))` = `1 + max(-1, 0)` = `1`.
4. Donc `height('Les Martin')` = `1 + max(1, 1)` = `2`.
5. `isDisplayable` → `2 <= 3` → **true**. L'arbre tient dans 4 niveaux (il en a 3).

Le cas de base à `-1` est ce qui fait qu'une **feuille** vaut `0` : `1 + max(-1, -1) = 0`. C'est la convention "hauteur = nombre d'arêtes".

### Exemple 2 — Afficher les membres par niveau (BFS regroupé)

**Problème produit :** rendre la tribu en **colonnes**, une colonne par niveau hiérarchique. Il faut la liste des noms, groupée par profondeur.

```ts
function membersByLevel(root: Group | null): string[][] {
  if (!root) return [];
  const out: string[][] = [];
  const queue: Group[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;   // fige le niveau courant AVANT d'enfiler
    const level: string[] = [];
    for (let i = 0; i < levelSize; i++) {
      const g = queue.shift()!;       // défile (FIFO)
      level.push(g.name);
      if (g.left)  queue.push(g.left);
      if (g.right) queue.push(g.right);
    }
    out.push(level);
  }
  return out;
}

membersByLevel(tribu);
// [
//   ['Les Martin'],               ← niveau 0
//   ['Parents', 'Grands-parents'],← niveau 1
//   ['Papa', 'Maman', 'Mamie'],   ← niveau 2
// ]
```

**Déroulé du parcours :**
1. `queue = [Les Martin]`, `levelSize = 1`. On défile `Les Martin`, on enfile ses 2 enfants.
2. `out = [['Les Martin']]`, `queue = [Parents, Grands-parents]`.
3. Tour 2 : `levelSize = 2` (figé). On défile les 2, on enfile `Papa, Maman` (de Parents) et `Mamie` (de Grands-parents).
4. `out = [['Les Martin'], ['Parents', 'Grands-parents']]`, `queue = [Papa, Maman, Mamie]`.
5. Tour 3 : `levelSize = 3`, aucun enfant enfilé → la boucle se termine. Résultat final ci-dessus.

C'est le `levelSize` figé qui garantit qu'on ne mélange pas `Parents`/`Grands-parents` (niveau 1) avec `Papa`/`Maman`/`Mamie` (niveau 2).

---

## 4. Pièges & misconceptions

### PIÈGE #1 — Confondre profondeur et hauteur

```ts
// ✗ « la hauteur c'est la distance à la racine » → FAUX, c'est la profondeur
// La profondeur descend DEPUIS la racine ; la hauteur monte DEPUIS les feuilles.
```

**Correct :** *profondeur* = arêtes racine → nœud (mesure du haut). *Hauteur* = arêtes nœud → feuille la plus lointaine (mesure du bas). La hauteur de l'arbre = profondeur maximale. Une feuille a une hauteur de `0` mais peut avoir une grande profondeur.

### PIÈGE #2 — Valider un BST en ne regardant que les enfants directs

```ts
// ✗ FAUX : ne compare qu'avec les enfants immédiats
function isBstNaif(n: TreeNode<number> | null): boolean {
  if (!n) return true;
  if (n.left  && n.left.value  >= n.value) return false;
  if (n.right && n.right.value <= n.value) return false;
  return isBstNaif(n.left) && isBstNaif(n.right);
}
//        5
//       / \
//      3   8
//         / \
//        2   9   ← 2 < 5 mais il est DANS le sous-arbre droit de 5 → BST INVALIDE
// isBstNaif renvoie true à tort : 2 respecte son parent 8, mais viole la borne de 5.
```

**Correct :** propager des **bornes min/max** qui se resserrent à la descente (voir `isValidBST` en 2.8). Chaque nœud doit respecter *tous* ses ancêtres, pas seulement son parent.

### PIÈGE #3 — Utiliser une pile pour du BFS (ou une file pour du DFS)

```ts
// ✗ « stack.pop() ou queue.shift(), c'est pareil » → NON, l'ordre change tout
```

**Correct :** **pile (LIFO, `pop`)** → profondeur (DFS). **File (FIFO, `shift`)** → largeur (BFS). Utiliser `pop` là où on voulait un parcours par niveaux donne un ordre imprévisible. La structure de données *est* l'algorithme.

### PIÈGE #4 — Croire que le BST est toujours en O(log n)

```ts
// ✗ Insérer des données déjà triées dans un BST nu
const bstTrie = new BST();
[1, 2, 3, 4, 5, 6].forEach(v => bstTrie.insert(v)); // arbre = liste chaînée !
// bstTrie.search(6) parcourt les 6 nœuds → O(n), pas O(log n)
```

**Correct :** `O(h)` ne devient `O(log n)` **que si l'arbre est équilibré**. Sur des insertions triées, un BST nu dégénère en `O(n)`. Si l'ordre n'est pas maîtrisé : arbre auto-équilibré (AVL / Red-Black) ou, en JS, une `Map`.

### PIÈGE #5 — Oublier de sérialiser les nœuds vides

```ts
// ✗ Sérialiser sans marqueur de vide
function serializeNaif(n: TreeNode<number> | null): string {
  if (!n) return '';
  return `${n.value},${serializeNaif(n.left)}${serializeNaif(n.right)}`;
}
// "1,2,3" et "1,3,2" pourraient produire la même chaîne → structure PERDUE
```

**Correct :** émettre un **marqueur** (`#` ou `null`) pour chaque sous-arbre vide. C'est ce qui rend la structure reconstructible sans ambiguïté (voir `serialize`/`deserialize` en 2.8).

---

## 5. Ancrage TribuZen

L'arbre est la structure naturelle de la **hiérarchie d'une tribu** dans TribuZen.

**Arbre hiérarchique des familles / sous-groupes** — une tribu = une racine `Group`, ses sous-groupes = les enfants, récursivement. On s'en sert pour :
- **Afficher** l'organigramme : un parcours **pré-ordre** rend la structure du haut vers le bas (racine avant enfants) ; un **BFS par niveaux** (`levelOrder`) rend l'affichage en colonnes (worked example 2).
- **Limiter la profondeur** : `height()` valide qu'une tribu ne dépasse pas 4 niveaux avant rendu (worked example 1) — au-delà, l'UI devient illisible et on force un repli.

**BST pour l'index trié des membres** — quand on doit garder les membres **triés par nom** et interroger des plages (« membres de A à M »), un BST équilibré donne le parcours trié en in-ordre et la recherche en `O(log n)`. En pratique côté front, une `Map` + tri suffit souvent ; le BST se justifie côté service quand on maintient l'ordre en continu.

**BFS pour explorer par niveaux** — la vue « qui est directement sous ce groupe » (rang +1) est exactement le premier niveau d'un BFS partant de ce nœud.

Fichiers cibles dans `smaurier/tribuzen` :
```
tribuzen/src/
  lib/
    tree/
      traversals.ts    ← preOrder, levelOrder, bfs
      height.ts        ← height, isDisplayable
    members/
      memberIndex.ts   ← BST trié des membres (ordre + plages)
```

---

## 6. Points clés

1. Un arbre = nœuds sans cycle, un seul parent par nœud ; racine = sans parent, feuille = sans enfant.
2. Profondeur se mesure depuis la racine (haut) ; hauteur depuis les feuilles (bas) — ne pas les confondre.
3. Toute récursion sur un arbre binaire = cas de base `null`, puis combiner gauche et droite.
4. DFS (pile, implicite en récursif) : pré-ordre (copie/sérialise), in-ordre (trié en BST), post-ordre (agrège/supprime).
5. BFS (file FIFO) visite niveau par niveau ; figer `levelSize` avant la boucle isole chaque niveau.
6. Pile (LIFO) → profondeur ; file (FIFO) → largeur : la structure de données détermine l'ordre.
7. BST : gauche < nœud < droite ; recherche/insertion/suppression en O(h).
8. Valider un BST = propager des bornes min/max qui se resserrent, pas comparer aux seuls enfants directs.
9. O(h) = O(log n) seulement si l'arbre est équilibré ; insertions triées → O(n). En prod : AVL / Red-Black ou Map.
10. LCA = si a et b sont dans des sous-arbres différents, la racine courante est l'ancêtre ; sinon remonter la réponse non-null.
11. Sérialiser = pré-ordre avec un marqueur pour chaque sous-arbre vide, sinon la structure est perdue.

---

## 7. Seeds Anki

```
Quelle est la différence entre profondeur et hauteur d'un nœud ?|La profondeur = nombre d'arêtes de la racine jusqu'au nœud (mesure du haut, racine = 0). La hauteur = nombre d'arêtes du nœud jusqu'à sa feuille la plus lointaine (mesure du bas, feuille = 0). La hauteur de l'arbre = profondeur maximale.
En quoi diffèrent pré-ordre, in-ordre et post-ordre ?|Seulement par le moment où l'on visite le nœud courant : pré = avant les enfants (racine, gauche, droite), in = entre (gauche, racine, droite), post = après (gauche, droite, racine). L'in-ordre d'un BST donne les valeurs triées.
Quelle structure de données pour un DFS itératif, et laquelle pour un BFS ?|DFS = pile (LIFO, push/pop). BFS = file (FIFO, push/shift). La structure détermine l'ordre : pile = profondeur, file = largeur.
Pourquoi figer queue.length avant la boucle interne dans un BFS par niveaux ?|Pour isoler exactement les nœuds du niveau courant. Si on ne fige pas levelSize, les enfants enfilés pendant la boucle se mélangent au niveau en cours et on perd le regroupement par niveau.
Quelle est la propriété d'ordre d'un BST ?|Pour chaque nœud : tout le sous-arbre gauche a des valeurs strictement inférieures, tout le sous-arbre droit des valeurs strictement supérieures. Conséquence : le parcours in-ordre donne les valeurs triées, et recherche/insertion/suppression coûtent O(h).
Pourquoi un BST peut-il retomber à O(n) ?|O(h) = O(log n) seulement si l'arbre est équilibré. Insérer des valeurs déjà triées dégénère le BST en liste chaînée (h = n). En prod, on utilise des arbres auto-équilibrés (AVL, Red-Black) ou une Map (O(1) amorti).
Comment valider correctement qu'un arbre est un BST ?|Propager des bornes min/max qui se resserrent à la descente : à gauche le plafond devient la valeur du nœud, à droite le plancher devient la valeur du nœud. Comparer seulement aux enfants directs est faux (un descendant lointain peut violer un ancêtre).
Comment trouver le plus proche ancêtre commun (LCA) dans un arbre binaire ?|Récursion : si le nœud vaut a ou b, le renvoyer. Chercher à gauche et à droite. Si les deux renvoient non-null, a et b sont de part et d'autre → le nœud courant est le LCA ; sinon remonter la réponse non-null.
Pourquoi faut-il un marqueur pour les nœuds vides lors de la sérialisation ?|Sans marquer les sous-arbres vides, deux arbres de structures différentes peuvent produire la même chaîne et devenir non reconstructibles. On émet un marqueur (# ou null) par sous-arbre vide, en pré-ordre, pour une désérialisation sans ambiguïté.
```

---

## Pont vers le lab

> Lab associé : `05-algorithms/labs/lab-06-tree-navigation/README.md`. Implémenter les parcours DFS/BFS, la validation de BST et le calcul de hauteur sur l'arbre hiérarchique TribuZen — corrigé complet inline + variante J+30.
