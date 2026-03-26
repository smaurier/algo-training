// =============================================================================
// Lab 06 — Navigation dans les arbres
// =============================================================================
// Exécuter avec : npx tsx exercise.ts
// =============================================================================

console.log("=== Lab 06 : Navigation dans les arbres ===\n");

// =============================================================================
// Structure de base
// =============================================================================

class TreeNode {
  left: TreeNode | null = null;
  right: TreeNode | null = null;
  constructor(public val: number) {}
}

// Construire un BST à partir d'un tableau
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

//         8
//        / \
//       3   10
//      / \    \
//     1   6   14
//        / \  /
//       4  7 13

// =============================================================================
// PARTIE 1 : Parcours DFS
// =============================================================================

console.log("--- Partie 1 : Parcours DFS ---");

function inOrder(node: TreeNode | null): number[] {
  // TODO : Parcours in-order (gauche → nœud → droite)
  return [];
}

function preOrder(node: TreeNode | null): number[] {
  // TODO : Parcours pre-order (nœud → gauche → droite)
  return [];
}

function postOrder(node: TreeNode | null): number[] {
  // TODO : Parcours post-order (gauche → droite → nœud)
  return [];
}

console.log("In-order:  ", inOrder(bst));   // [1, 3, 4, 6, 7, 8, 10, 13, 14]
console.log("Pre-order: ", preOrder(bst));   // [8, 3, 1, 6, 4, 7, 10, 14, 13]
console.log("Post-order:", postOrder(bst));  // [1, 4, 7, 6, 3, 13, 14, 10, 8]

// =============================================================================
// PARTIE 2 : BFS par niveaux
// =============================================================================

console.log("\n--- Partie 2 : BFS par niveaux ---");

function levelOrder(root: TreeNode | null): number[][] {
  // TODO : Retourner les valeurs niveau par niveau
  // Utilisez une queue. Pour chaque niveau, traitez exactement queue.length éléments.
  return [];
}

console.log("Niveaux:", levelOrder(bst));
// Attendu : [[8], [3, 10], [1, 6, 14], [4, 7, 13]]

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
  // TODO : Convertir le tableau plat en arbre hiérarchique
  // 1. Créer une Map<id, TreeItem> pour chaque élément (avec children: [])
  // 2. Parcourir à nouveau : si parentId null → racine, sinon → ajouter comme enfant
  return [];
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
// Deux racines : Électronique et Vêtements, chacune avec ses sous-catégories

// =============================================================================
// PARTIE BONUS : LCA dans un BST
// =============================================================================

console.log("\n--- Bonus : LCA ---");

function findLCA(root: TreeNode | null, p: number, q: number): number | null {
  // TODO : Trouver le Lowest Common Ancestor de p et q dans un BST
  // Exploitez la propriété BST :
  //   - Si p et q < root.val → aller à gauche
  //   - Si p et q > root.val → aller à droite
  //   - Sinon → root est le LCA
  return null;
}

console.log("LCA(4, 7):", findLCA(bst, 4, 7));   // 6
console.log("LCA(1, 7):", findLCA(bst, 1, 7));   // 3
console.log("LCA(3, 14):", findLCA(bst, 3, 14)); // 8

console.log("\n=== Fin du Lab 06 ===");
