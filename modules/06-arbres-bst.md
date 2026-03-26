# Module 06 — Arbres et BST

> **Objectif** : modéliser les hiérarchies, maîtriser les parcours (DFS pré/in/post-ordre, BFS par niveaux), implémenter des opérations sur les arbres binaires et comprendre le BST.

> **Difficulté** : ⭐⭐⭐

::: info Pas de panique !
Les arbres sont partout dans ton code sans que tu le saches : le DOM, les routes de ton app, les catégories de produits, les permissions, les menus, les AST. Ce module te donne les outils pour les manipuler consciemment.
:::

---

## Prérequis

- Module 04 (récursion) — les arbres sont le terrain de jeu naturel de la récursion
- Module 03 (stack et queue) — pour les parcours DFS et BFS

---

## 1. Pourquoi les arbres sont partout

```
┌────────────────────────────────────────────────────────────────┐
│  Structure                │  Arbre sous-jacent                 │
├───────────────────────────┼────────────────────────────────────┤
│  DOM                      │  Arbre de nœuds HTML               │
│  Routes (React Router)    │  Arbre de segments d'URL            │
│  Catégories e-commerce    │  Arbre de catégories imbriquées     │
│  Permissions              │  Arbre de rôles hérités             │
│  Menus de navigation      │  Arbre de menus/sous-menus          │
│  AST (Abstract Syntax Tree)│ L'arbre que le compilateur voit    │
│  Système de fichiers      │  Arbre de dossiers/fichiers         │
│  Commentaires imbriqués   │  Arbre de threads                   │
│  Organisation d'équipe    │  Arbre hiérarchique                 │
│  JSON imbriqué            │  Arbre de clés/valeurs              │
└───────────────────────────┴────────────────────────────────────┘
```

---

## 2. Vocabulaire

```
            1           ← racine (root)
          /   \
         2     3        ← nœuds internes (internal nodes)
        / \     \
       4   5     6      ← 4, 5, 6 sont des feuilles (leaves)

Termes :
- Racine (root) : nœud sans parent — le sommet
- Feuille (leaf) : nœud sans enfant — l'extrémité
- Profondeur (depth) : distance depuis la racine (racine = 0)
- Hauteur (height) : distance maximale jusqu'à une feuille
- Sous-arbre (subtree) : un nœud et tous ses descendants
- Arbre binaire : chaque nœud a au plus 2 enfants (left, right)
- Arbre N-aire : chaque nœud a 0 à N enfants
```

---

## 3. Représentation en TypeScript

```typescript
// Arbre binaire
interface TreeNode<T> {
  value: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
}

// Arbre N-aire (plus courant en pratique : DOM, catégories, menus)
interface NaryNode<T> {
  value: T;
  children: NaryNode<T>[];
}

// Construction d'un arbre binaire
function node<T>(value: T, left: TreeNode<T> | null = null, right: TreeNode<T> | null = null): TreeNode<T> {
  return { value, left, right };
}

// Exemple
const tree = node(1,
  node(2, node(4), node(5)),
  node(3, null, node(6)),
);
```

---

## 4. Parcours en profondeur (DFS)

### 4.1 Trois ordres de parcours

```typescript
// Pré-ordre : racine → gauche → droite
// Utilisation : copier un arbre, sérialiser, afficher la structure
function preOrder<T>(node: TreeNode<T> | null, result: T[] = []): T[] {
  if (!node) return result;
  result.push(node.value);      // ← Visite AVANT les enfants
  preOrder(node.left, result);
  preOrder(node.right, result);
  return result;
}

// In-ordre : gauche → racine → droite
// Utilisation : parcours trié d'un BST
function inOrder<T>(node: TreeNode<T> | null, result: T[] = []): T[] {
  if (!node) return result;
  inOrder(node.left, result);
  result.push(node.value);      // ← Visite ENTRE les enfants
  inOrder(node.right, result);
  return result;
}

// Post-ordre : gauche → droite → racine
// Utilisation : suppression, calcul de taille, libération de mémoire
function postOrder<T>(node: TreeNode<T> | null, result: T[] = []): T[] {
  if (!node) return result;
  postOrder(node.left, result);
  postOrder(node.right, result);
  result.push(node.value);      // ← Visite APRÈS les enfants
  return result;
}

//         1
//        / \
//       2   3
//      / \   \
//     4   5   6

console.log(preOrder(tree));   // [1, 2, 4, 5, 3, 6]
console.log(inOrder(tree));    // [4, 2, 5, 1, 3, 6]
console.log(postOrder(tree));  // [4, 5, 2, 6, 3, 1]
```

### 4.2 DFS itératif (avec stack explicite)

```typescript
// Pré-ordre itératif — utile quand la profondeur est grande
function preOrderIterative<T>(root: TreeNode<T> | null): T[] {
  if (!root) return [];
  const result: T[] = [];
  const stack: TreeNode<T>[] = [root];

  while (stack.length > 0) {
    const node = stack.pop()!;
    result.push(node.value);
    // Empiler right d'abord pour que left soit traité en premier
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }

  return result;
}
```

---

## 5. Parcours en largeur (BFS)

```typescript
// BFS utilise une queue — on visite niveau par niveau

function bfs<T>(root: TreeNode<T> | null): T[] {
  if (!root) return [];
  const result: T[] = [];
  const queue: TreeNode<T>[] = [root];

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node.value);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }

  return result;
}

console.log(bfs(tree)); // [1, 2, 3, 4, 5, 6] — niveau par niveau

// BFS par niveaux (retourner chaque niveau séparément)
function levelOrder<T>(root: TreeNode<T> | null): T[][] {
  if (!root) return [];
  const result: T[][] = [];
  const queue: TreeNode<T>[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level: T[] = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      level.push(node.value);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level);
  }

  return result;
}

console.log(levelOrder(tree));
// [[1], [2, 3], [4, 5, 6]]
```

---

## 6. Opérations classiques sur les arbres

### 6.1 Hauteur

```typescript
function height<T>(node: TreeNode<T> | null): number {
  if (!node) return -1; // convention : arbre vide = -1
  return 1 + Math.max(height(node.left), height(node.right));
}

console.log(height(tree)); // 2
```

### 6.2 Nombre de nœuds

```typescript
function countNodes<T>(node: TreeNode<T> | null): number {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

console.log(countNodes(tree)); // 6
```

### 6.3 Somme de tous les nœuds

```typescript
function sumTree(node: TreeNode<number> | null): number {
  if (!node) return 0;
  return node.value + sumTree(node.left) + sumTree(node.right);
}

console.log(sumTree(tree)); // 1 + 2 + 3 + 4 + 5 + 6 = 21
```

### 6.4 Chercher une valeur

```typescript
function contains<T>(node: TreeNode<T> | null, target: T): boolean {
  if (!node) return false;
  if (node.value === target) return true;
  return contains(node.left, target) || contains(node.right, target);
}
```

### 6.5 Vérifier si l'arbre est équilibré

```typescript
function isBalanced<T>(node: TreeNode<T> | null): boolean {
  function check(n: TreeNode<T> | null): number {
    if (!n) return 0;
    const left = check(n.left);
    if (left === -1) return -1;
    const right = check(n.right);
    if (right === -1) return -1;
    if (Math.abs(left - right) > 1) return -1;
    return 1 + Math.max(left, right);
  }
  return check(node) !== -1;
}
```

---

## 7. Binary Search Tree (BST)

### 7.1 Propriété fondamentale

```
Pour chaque nœud :
- Tous les nœuds du sous-arbre GAUCHE ont une valeur INFÉRIEURE
- Tous les nœuds du sous-arbre DROIT ont une valeur SUPÉRIEURE

Exemple de BST :
         8
        / \
       3   10
      / \    \
     1   6    14
        / \   /
       4   7 13

In-order traversal = [1, 3, 4, 6, 7, 8, 10, 13, 14] → ordre croissant !
```

### 7.2 Implémentation

```typescript
class BST {
  root: TreeNode<number> | null = null;

  // Insertion — O(h) où h = hauteur
  insert(value: number): void {
    this.root = this.insertNode(this.root, value);
  }

  private insertNode(node: TreeNode<number> | null, value: number): TreeNode<number> {
    if (!node) return { value, left: null, right: null };
    if (value < node.value) node.left = this.insertNode(node.left, value);
    else if (value > node.value) node.right = this.insertNode(node.right, value);
    return node;
  }

  // Recherche — O(h)
  search(value: number): boolean {
    let current = this.root;
    while (current) {
      if (value === current.value) return true;
      current = value < current.value ? current.left : current.right;
    }
    return false;
  }

  // Minimum — O(h)
  findMin(): number | undefined {
    let current = this.root;
    while (current?.left) current = current.left;
    return current?.value;
  }

  // Maximum — O(h)
  findMax(): number | undefined {
    let current = this.root;
    while (current?.right) current = current.right;
    return current?.value;
  }

  // Parcours trié — O(n)
  inOrder(): number[] {
    const result: number[] = [];
    function traverse(node: TreeNode<number> | null) {
      if (!node) return;
      traverse(node.left);
      result.push(node.value);
      traverse(node.right);
    }
    traverse(this.root);
    return result;
  }
}

const bst = new BST();
[8, 3, 10, 1, 6, 14, 4, 7, 13].forEach(v => bst.insert(v));

console.log(bst.search(6));    // true
console.log(bst.search(5));    // false
console.log(bst.findMin());    // 1
console.log(bst.findMax());    // 14
console.log(bst.inOrder());    // [1, 3, 4, 6, 7, 8, 10, 13, 14]
```

### 7.3 Coûts : équilibré vs dégénéré

```
BST équilibré (hauteur ≈ log n) :     BST dégénéré (hauteur = n) :
         8                              1
        / \                              \
       3   10                             2
      / \    \                             \
     1   6    14                            3
                                             \
                                              4

Recherche : O(log n) ✅                Recherche : O(n) ❌
```

> 💡 Le BST simple peut dégénérer. En production, on utilise des arbres auto-équilibrés (AVL, Red-Black) ou simplement une `Map` qui offre O(1) amorti.

---

## 8. Arbres N-aires en pratique

```typescript
// Les arbres "réels" en fullstack ont souvent N enfants, pas 2

interface Category {
  id: string;
  name: string;
  children: Category[];
}

// Parcours récursif d'un arbre de catégories
function findCategory(root: Category, targetId: string): Category | null {
  if (root.id === targetId) return root;
  for (const child of root.children) {
    const found = findCategory(child, targetId);
    if (found) return found;
  }
  return null;
}

// Calculer la profondeur d'un nœud
function findDepth(root: Category, targetId: string, depth = 0): number {
  if (root.id === targetId) return depth;
  for (const child of root.children) {
    const result = findDepth(child, targetId, depth + 1);
    if (result !== -1) return result;
  }
  return -1;
}

// Transformer un tableau plat en arbre
interface FlatItem { id: string; parentId: string | null; name: string }

function buildTree(items: FlatItem[]): Category[] {
  const map = new Map<string, Category>();
  const roots: Category[] = [];

  // Créer tous les nœuds
  for (const item of items) {
    map.set(item.id, { id: item.id, name: item.name, children: [] });
  }

  // Relier parents et enfants
  for (const item of items) {
    const node = map.get(item.id)!;
    if (item.parentId === null) {
      roots.push(node);
    } else {
      map.get(item.parentId)?.children.push(node);
    }
  }

  return roots;
}

// Utilisation
const flat: FlatItem[] = [
  { id: '1', parentId: null, name: 'Électronique' },
  { id: '2', parentId: '1', name: 'Ordinateurs' },
  { id: '3', parentId: '1', name: 'Audio' },
  { id: '4', parentId: '2', name: 'Portables' },
  { id: '5', parentId: '2', name: 'Bureau' },
];

const tree2 = buildTree(flat);
console.log(JSON.stringify(tree2, null, 2));
// Électronique → Ordinateurs (Portables, Bureau), Audio
```

---

## Démonstrations

### Demo 1 — Chemins racine → feuille

```typescript
function allPaths(node: TreeNode<number> | null, path: number[] = []): number[][] {
  if (!node) return [];

  path.push(node.value);

  // Feuille : retourner le chemin actuel
  if (!node.left && !node.right) {
    return [[ ...path ]];
  }

  const paths = [
    ...allPaths(node.left, path),
    ...allPaths(node.right, path),
  ];

  path.pop(); // backtracking
  return paths;
}

console.log(allPaths(tree));
// [[1, 2, 4], [1, 2, 5], [1, 3, 6]]
```

### Demo 2 — Ancêtre commun le plus proche (LCA)

```typescript
function lca<T>(
  root: TreeNode<T> | null, a: T, b: T,
): TreeNode<T> | null {
  if (!root) return null;
  if (root.value === a || root.value === b) return root;

  const left = lca(root.left, a, b);
  const right = lca(root.right, a, b);

  if (left && right) return root; // a et b sont dans des sous-arbres différents
  return left ?? right;
}

console.log(lca(tree, 4, 5)?.value); // 2
console.log(lca(tree, 4, 6)?.value); // 1
```

### Demo 3 — Sérialisation / Désérialisation

```typescript
function serialize(root: TreeNode<number> | null): string {
  if (!root) return 'null';
  return `${root.value},${serialize(root.left)},${serialize(root.right)}`;
}

function deserialize(data: string): TreeNode<number> | null {
  const values = data.split(',');
  let index = 0;

  function build(): TreeNode<number> | null {
    if (index >= values.length || values[index] === 'null') {
      index++;
      return null;
    }
    const node: TreeNode<number> = {
      value: Number(values[index++]),
      left: null,
      right: null,
    };
    node.left = build();
    node.right = build();
    return node;
  }

  return build();
}

const serialized = serialize(tree);
console.log(serialized); // "1,2,4,null,null,5,null,null,3,null,6,null,null"
const restored = deserialize(serialized);
console.log(preOrder(restored)); // [1, 2, 4, 5, 3, 6]
```

---

## Points clés

1. Les arbres sont la structure naturelle pour les **hiérarchies**.
2. **DFS** (récursif ou stack) : pré-ordre (copie), in-ordre (tri en BST), post-ordre (destruction).
3. **BFS** (queue) : parcours par niveaux, distance minimale.
4. Récursion sur un arbre → penser **cas de base** (null) puis **combiner** gauche et droite.
5. Le BST donne un parcours trié via in-order, mais peut dégénérer en O(n).
6. Construire un arbre depuis un tableau plat = `Map<id, Node>` + liaison parent-enfant.
7. Pattern **flat → tree** : deux passes (créer les nœuds, puis relier).
8. LCA (ancêtre commun) = si les deux targets sont dans des sous-arbres différents, la racine courante est le LCA.
9. Sérialiser un arbre = pré-order avec marqueurs `null`.
10. En production JS, les arbres explicites sont fréquents (DOM, catégories, routes, permissions).

---

## Pour aller plus loin

- [VisuAlgo — BST](https://visualgo.net/en/bst) — visualisation interactive
- [JavaScript.info — Walking the DOM](https://javascript.info/dom-navigation) — le DOM est un arbre
- [Wikipedia — Tree traversal](https://en.wikipedia.org/wiki/Tree_traversal) — tous les parcours détaillés
- [MDN — TreeWalker API](https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker) — parcours du DOM natif

---

## Si tu es perdu

1. Un arbre = un nœud avec des enfants, récursivement.
2. DFS = aller le plus loin possible, puis revenir.
3. BFS = visiter tous les voisins d'un niveau avant de descendre.
4. BST = gauche < racine < droite.
5. En cas de doute, dessine l'arbre sur papier et fais le parcours à la main.

---

## Défi

> Étant donné un arbre binaire, inverse-le (miroir) : chaque sous-arbre gauche et droit sont échangés, récursivement. Quelle est la complexité ?

<details>
<summary>Réponse</summary>

```typescript
function invertTree<T>(node: TreeNode<T> | null): TreeNode<T> | null {
  if (!node) return null;

  // Échanger gauche et droite
  const temp = node.left;
  node.left = invertTree(node.right);
  node.right = invertTree(temp);

  return node;
}

// Avant :       1
//              / \
//             2   3
//            / \   \
//           4   5   6

// Après :       1
//              / \
//             3   2
//            /   / \
//           6   5   4

// Complexité : O(n) temps (on visite chaque nœud une fois), O(h) espace (stack de récursion)
```

</details>

---

::: tip Parcours recommandé
📖 Module terminé → Fais le **Lab 06** (navigation hiérarchique) → puis le **Quiz 06**.
:::
