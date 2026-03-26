// =============================================================================
// Lab 06 — Navigation dans les arbres — Solutions
// =============================================================================
// Exécuter avec : npx tsx solution.ts
// =============================================================================

console.log("=== Lab 06 : Navigation dans les arbres — Solutions ===\n");

// =============================================================================
// Structure de base
// =============================================================================

class TreeNode {
  left: TreeNode | null = null;
  right: TreeNode | null = null;
  constructor(public val: number) {}
}

function insertBST(root: TreeNode | null, val: number): TreeNode {
  if (!root) return new TreeNode(val);
  if (val < root.val) root.left = insertBST(root.left, val);
  else root.right = insertBST(root.right, val);
  return root;
}

let bst: TreeNode | null = null;
for (const v of [8, 3, 10, 1, 6, 14, 4, 7, 13]) {
  bst = insertBST(bst, v);
}

// =============================================================================
// PARTIE 1 : Parcours DFS
// =============================================================================

console.log("--- Partie 1 : Parcours DFS ---");

function inOrder(node: TreeNode | null): number[] {
  if (!node) return [];
  return [...inOrder(node.left), node.val, ...inOrder(node.right)];
}

function preOrder(node: TreeNode | null): number[] {
  if (!node) return [];
  return [node.val, ...preOrder(node.left), ...preOrder(node.right)];
}

function postOrder(node: TreeNode | null): number[] {
  if (!node) return [];
  return [...postOrder(node.left), ...postOrder(node.right), node.val];
}

console.log("In-order:  ", inOrder(bst));
console.log("Pre-order: ", preOrder(bst));
console.log("Post-order:", postOrder(bst));

// =============================================================================
// PARTIE 2 : BFS par niveaux
// =============================================================================

console.log("\n--- Partie 2 : BFS par niveaux ---");

function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const result: number[][] = [];
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level: number[] = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level);
  }

  return result;
}

console.log("Niveaux:", levelOrder(bst));

// =============================================================================
// PARTIE 3 : Flat → Tree
// =============================================================================

console.log("\n--- Partie 3 : Flat → Tree ---");

interface FlatItem {
  id: number;
  name: string;
  parentId: number | null;
}

interface TreeItem {
  id: number;
  name: string;
  children: TreeItem[];
}

function buildTree(items: FlatItem[]): TreeItem[] {
  const map = new Map<number, TreeItem>();
  const roots: TreeItem[] = [];

  // Premier passage : créer tous les nœuds
  for (const item of items) {
    map.set(item.id, { id: item.id, name: item.name, children: [] });
  }

  // Second passage : attacher enfants aux parents
  for (const item of items) {
    const treeItem = map.get(item.id)!;
    if (item.parentId === null) {
      roots.push(treeItem);
    } else {
      map.get(item.parentId)?.children.push(treeItem);
    }
  }

  return roots;
}

const flatData: FlatItem[] = [
  { id: 1, name: "Électronique", parentId: null },
  { id: 2, name: "Ordinateurs", parentId: 1 },
  { id: 3, name: "Laptops", parentId: 2 },
  { id: 4, name: "Desktops", parentId: 2 },
  { id: 5, name: "Téléphones", parentId: 1 },
  { id: 6, name: "Vêtements", parentId: null },
  { id: 7, name: "Hommes", parentId: 6 },
  { id: 8, name: "Femmes", parentId: 6 },
];

const tree = buildTree(flatData);
console.log("Arbre:", JSON.stringify(tree, null, 2));

// =============================================================================
// PARTIE BONUS : LCA dans un BST
// =============================================================================

console.log("\n--- Bonus : LCA ---");

function findLCA(root: TreeNode | null, p: number, q: number): number | null {
  let node = root;
  while (node) {
    if (p < node.val && q < node.val) {
      node = node.left;
    } else if (p > node.val && q > node.val) {
      node = node.right;
    } else {
      return node.val;
    }
  }
  return null;
}

console.log("LCA(4, 7):", findLCA(bst, 4, 7));
console.log("LCA(1, 7):", findLCA(bst, 1, 7));
console.log("LCA(3, 14):", findLCA(bst, 3, 14));

console.log("\n=== Fin du Lab 06 ===");
