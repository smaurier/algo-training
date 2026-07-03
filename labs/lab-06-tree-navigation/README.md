# Lab 06 — Navigation dans les arbres

> **Outcome :** à la fin, tu sais parcourir un arbre hiérarchique TribuZen en DFS (pré/in/post-ordre) et en BFS par niveaux, valider qu'un arbre est un BST, et calculer sa hauteur — en TypeScript, à la main.
> **Vrai outil :** Node.js + `tsx` (exécution TypeScript directe) ou le playground TypeScript. Tu écris du vrai code, tu l'exécutes et tu lis la sortie `console.log`.
> **Feedback :** le coach valide en session en te faisant dérouler un parcours à la main — pas de test-runner auto-correcteur.

---

## Énoncé

Tu construis le module `tree` de l'admin TribuZen. Une **tribu** est un arbre binaire de groupes. Tu dois implémenter, **de zéro**, les fonctions dont l'UI a besoin.

**Données de départ (à copier dans `tree.ts`) :**

```ts
interface Group {
  id: string;
  name: string;
  left: Group | null;
  right: Group | null;
}

// Tribu de démonstration
//                Les Martin
//                /         \
//           Parents    Grands-parents
//           /     \             \
//        Papa    Maman          Mamie
const tribu: Group = {
  id: 'g1', name: 'Les Martin',
  left:  { id: 'g2', name: 'Parents',
           left:  { id: 'g4', name: 'Papa',  left: null, right: null },
           right: { id: 'g5', name: 'Maman', left: null, right: null } },
  right: { id: 'g3', name: 'Grands-parents',
           left:  null,
           right: { id: 'g6', name: 'Mamie', left: null, right: null } },
};
```

**Cahier des charges — tu implémentes ces 5 fonctions :**

1. **`preOrder(root): string[]`** — noms en pré-ordre (racine, gauche, droite).
2. **`levelOrder(root): string[][]`** — BFS regroupé par niveau (un tableau par rang).
3. **`height(root): number`** — hauteur en nombre d'arêtes (arbre vide = -1, feuille = 0).
4. **`isValidBST(root): boolean`** — vérifie la propriété d'ordre d'un BST sur un arbre de **nombres** (voir données du point 5).
5. **`isDisplayable(root, maxLevels): boolean`** — vrai si l'arbre tient dans `maxLevels` niveaux.

**Contraintes :**
- **Pas de gap-fill** — tu écris chaque fonction complète depuis une feuille blanche.
- `preOrder` et `height` sont **récursifs** ; `levelOrder` est **itératif avec une file** (`shift`).
- `isValidBST` doit propager des **bornes min/max** — comparer aux seuls enfants directs est refusé.
- Zéro dépendance : juste `console.log` pour observer.

### Starter minimal

```
lab-06-tree-navigation/
  tree.ts        ← à écrire (les 5 fonctions + les données)
```

Lance avec `npx tsx tree.ts` (ou colle dans le playground TypeScript). Vérifie chaque sortie contre les attendus :

```
preOrder(tribu)     → ['Les Martin', 'Parents', 'Papa', 'Maman', 'Grands-parents', 'Mamie']
levelOrder(tribu)   → [['Les Martin'], ['Parents', 'Grands-parents'], ['Papa', 'Maman', 'Mamie']]
height(tribu)       → 2
isDisplayable(tribu, 4) → true
isDisplayable(tribu, 2) → false
```

---

## Étapes (en friction)

1. **`preOrder`** — récursif. Cas de base `null` → `[]`. Sinon `[n.name, ...preOrder(n.left), ...preOrder(n.right)]`. Vérifie l'ordre exact.
2. **`height`** — récursif. Cas de base `null` → `-1`. Sinon `1 + Math.max(height(left), height(right))`. Confirme que la feuille `Papa` donne bien `0`.
3. **`levelOrder`** — itératif. File initialisée avec `[root]`. À chaque tour, **fige `levelSize = queue.length`** puis défile exactement `levelSize` nœuds. Enfile leurs enfants non-null.
4. **`isDisplayable`** — une ligne : `height(root) <= maxLevels - 1`. Teste avec `maxLevels = 2` (doit renvoyer `false` car hauteur 2 = 3 niveaux).
5. **`isValidBST`** — écris une fonction interne `check(n, min, max)` avec bornes `-Infinity`/`+Infinity` par défaut. Teste sur un BST valide ET sur l'arbre piège ci-dessous (le `2` mal placé doit renvoyer `false`).
6. **Déroule un parcours à la main** — sur papier, exécute `levelOrder` en écrivant l'état de la file à chaque tour. C'est ce que le coach te demandera de reproduire.

**Données pour `isValidBST` :**

```ts
interface NumNode { value: number; left: NumNode | null; right: NumNode | null; }

// BST VALIDE : gauche < nœud < droite partout
const bstValide: NumNode = {
  value: 5,
  left:  { value: 3, left: { value: 1, left: null, right: null }, right: null },
  right: { value: 8, left: null, right: { value: 9, left: null, right: null } },
};

// BST PIÈGE : 2 respecte son parent 8, mais viole la borne de la racine 5
const bstPiege: NumNode = {
  value: 5,
  left:  { value: 3, left: null, right: null },
  right: { value: 8, left: { value: 2, left: null, right: null }, right: null },
};
// isValidBST(bstValide) → true    isValidBST(bstPiege) → false
```

---

## Corrigé complet commenté

```ts
// ─── tree.ts ─────────────────────────────────────────────────────

interface Group {
  id: string;
  name: string;
  left: Group | null;
  right: Group | null;
}

const tribu: Group = {
  id: 'g1', name: 'Les Martin',
  left:  { id: 'g2', name: 'Parents',
           left:  { id: 'g4', name: 'Papa',  left: null, right: null },
           right: { id: 'g5', name: 'Maman', left: null, right: null } },
  right: { id: 'g3', name: 'Grands-parents',
           left:  null,
           right: { id: 'g6', name: 'Mamie', left: null, right: null } },
};

// 1. PRÉ-ORDRE — récursif : nœud AVANT ses enfants (racine, gauche, droite)
function preOrder(n: Group | null): string[] {
  if (!n) return [];                    // cas de base : sous-arbre vide
  return [n.name, ...preOrder(n.left), ...preOrder(n.right)];
}

// 3. HAUTEUR — récursif : arêtes jusqu'à la feuille la plus lointaine
//    Convention : vide = -1 → une feuille vaut 1 + max(-1,-1) = 0
function height(n: Group | null): number {
  if (!n) return -1;
  return 1 + Math.max(height(n.left), height(n.right));
}

// 2. BFS PAR NIVEAUX — itératif avec une file (FIFO)
function levelOrder(root: Group | null): string[][] {
  if (!root) return [];
  const out: string[][] = [];
  const queue: Group[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;     // ← FIGÉ avant d'enfiler : isole le niveau
    const level: string[] = [];
    for (let i = 0; i < levelSize; i++) {
      const g = queue.shift()!;         // défile en tête (FIFO)
      level.push(g.name);
      if (g.left)  queue.push(g.left);  // enfile les enfants en queue
      if (g.right) queue.push(g.right);
    }
    out.push(level);
  }
  return out;
}

// 5. DISPLAYABLE — la hauteur compte des arêtes, donc N niveaux ⇒ hauteur ≤ N-1
function isDisplayable(root: Group | null, maxLevels = 4): boolean {
  return height(root) <= maxLevels - 1;
}

// 4. VALIDER un BST — bornes min/max qui se resserrent à la descente
interface NumNode { value: number; left: NumNode | null; right: NumNode | null; }

function isValidBST(
  n: NumNode | null,
  min = -Infinity,
  max = Infinity,
): boolean {
  if (!n) return true;                        // vide = valide
  if (n.value <= min || n.value >= max) return false; // hors des bornes héritées
  return (
    isValidBST(n.left, min, n.value) &&       // gauche : plafond devient n.value
    isValidBST(n.right, n.value, max)         // droite : plancher devient n.value
  );
}

// ─── Vérifications ───────────────────────────────────────────────
console.log(preOrder(tribu));
// ['Les Martin', 'Parents', 'Papa', 'Maman', 'Grands-parents', 'Mamie']
console.log(levelOrder(tribu));
// [['Les Martin'], ['Parents', 'Grands-parents'], ['Papa', 'Maman', 'Mamie']]
console.log(height(tribu));            // 2
console.log(isDisplayable(tribu, 4));  // true
console.log(isDisplayable(tribu, 2));  // false

const bstValide: NumNode = {
  value: 5,
  left:  { value: 3, left: { value: 1, left: null, right: null }, right: null },
  right: { value: 8, left: null, right: { value: 9, left: null, right: null } },
};
const bstPiege: NumNode = {
  value: 5,
  left:  { value: 3, left: null, right: null },
  right: { value: 8, left: { value: 2, left: null, right: null }, right: null },
};
console.log(isValidBST(bstValide)); // true
console.log(isValidBST(bstPiege));  // false — le 2 viole la borne de la racine 5
```

**Pourquoi ce corrigé est correct :**
- `preOrder` place `n.name` **avant** les descentes → c'est bien pré-ordre. Le spread `...` aplatit les sous-résultats sans mutation.
- `height` s'appuie sur le cas de base `-1` : c'est ce qui fait qu'une feuille vaut `0` et que la mesure est en **arêtes** (pas en nœuds).
- `levelOrder` **fige `levelSize`** avant la boucle interne : les enfants enfilés pendant le tour n'entrent pas dans le niveau courant → regroupement par niveau exact.
- `isValidBST` propage des **bornes** : le `2` du `bstPiege`, bien qu'inférieur à son parent `8`, est dans le sous-arbre droit de `5` où le plancher hérité est `5` → `2 <= 5` détecte la violation. Une comparaison aux seuls enfants directs l'aurait manqué.
- `isDisplayable` traduit "niveaux" (comptage humain) en "hauteur" (comptage d'arêtes) via `maxLevels - 1`.

---

## Variante J+30 (fading)

**Même objectif, contraintes ajoutées — reproduire de mémoire en 25 minutes, sans rouvrir ce corrigé ni le module 06 :**

1. Ajoute **`inOrder(root): string[]`** et **`postOrder(root): string[]`** — vérifie les trois ordres sur `tribu`.
2. Ajoute **`serialize(root): string`** (pré-ordre avec marqueur `#` pour les vides) et **`deserialize(s): Group | null`** — vérifie que `preOrder(deserialize(serialize(tribu)))` redonne le pré-ordre d'origine.
3. Réécris `levelOrder` **sans `Array.shift()`** (coûteux en O(n)) : utilise un index de tête (`let head = 0`) qui avance sur un tableau, au lieu de retirer physiquement l'élément.
4. Ajoute **`lca(root, a, b): string | null`** — le plus proche ancêtre commun de deux noms (`lca(tribu, 'Papa', 'Maman')` → `'Parents'`, `lca(tribu, 'Papa', 'Mamie')` → `'Les Martin'`).

**Critère de réussite :** les trois parcours donnent le bon ordre, la sérialisation fait un aller-retour fidèle, et le `levelOrder` sans `shift` produit le même résultat que la version d'origine.

---

## Application TribuZen

Dans le repo `smaurier/tribuzen`, ces fonctions vivent ici :

```
tribuzen/src/
  lib/
    tree/
      traversals.ts   ← preOrder, inOrder, postOrder, levelOrder, bfs
      height.ts        ← height, isDisplayable
      serialize.ts     ← serialize, deserialize (cache / URL d'état)
    members/
      memberIndex.ts   ← BST trié des membres (ordre + plages A–M)
```

**Différences par rapport au lab :**
- `Group` sera importé depuis `src/types/tribe.ts` (partagé) — dans le lab, on le définit dans `tree.ts`.
- `levelOrder` alimentera un rendu en colonnes (une `<Column>` par niveau) ; `isDisplayable` gardera un garde-fou avant le rendu de l'organigramme.
- `isValidBST` servira côté service à vérifier l'intégrité de l'index membre après une migration de données.

**Commit cible :**
```
feat(tree): parcours DFS/BFS + hauteur pour l'organigramme des tribus
feat(tree): validation BST de l'index membre TribuZen
```
