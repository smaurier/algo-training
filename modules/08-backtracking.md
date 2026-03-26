# Module 08 — Backtracking et exploration combinatoire

> **Objectif** : comprendre le backtracking comme technique d'exploration systématique, générer des permutations, combinaisons et sous-ensembles, résoudre des problèmes classiques (N-Queens, Sudoku), et appliquer le pruning pour optimiser.

> **Difficulté** : ⭐⭐⭐⭐

::: info Pas de panique !
Le backtracking est simplement la récursion avec un « retour en arrière ». Imagine que tu explores un labyrinthe : tu avances, et quand tu arrives dans un cul-de-sac, tu reviens sur tes pas pour essayer un autre chemin. C'est exactement ça.
:::

---

## Prérequis

- Module 04 (récursion — indispensable)
- Module 06 (arbres — le backtracking construit un arbre de décisions)

---

## 1. Le pattern backtracking

```
Le backtracking est une recherche exhaustive dans un arbre de décisions,
avec coupure (pruning) des branches non viables.

Schéma général :

function backtrack(state, choices):
  if isComplete(state):
    collectSolution(state)
    return

  for choice in choices:
    if isValid(state, choice):      ← pruning
      makeChoice(state, choice)     ← avancer
      backtrack(state, remaining)   ← explorer
      undoChoice(state, choice)     ← RECULER (backtrack)
```

### Arbre de décision pour [1, 2, 3] → permutations

```
                    []
           /        |        \
        [1]        [2]       [3]
       /   \      /   \     /   \
    [1,2] [1,3] [2,1] [2,3] [3,1] [3,2]
      |     |     |     |     |     |
  [1,2,3][1,3,2][2,1,3][2,3,1][3,1,2][3,2,1]

6 feuilles = 3! = 6 permutations
```

---

## 2. Permutations

```typescript
// Générer toutes les permutations de nums
// Complexité : O(n × n!) — n! permutations, chaque de longueur n

function permutations<T>(nums: T[]): T[][] {
  const result: T[][] = [];

  function backtrack(current: T[], remaining: T[]) {
    if (remaining.length === 0) {
      result.push([...current]);
      return;
    }

    for (let i = 0; i < remaining.length; i++) {
      current.push(remaining[i]);

      const nextRemaining = [...remaining.slice(0, i), ...remaining.slice(i + 1)];
      backtrack(current, nextRemaining);

      current.pop(); // ← backtrack
    }
  }

  backtrack([], nums);
  return result;
}

console.log(permutations([1, 2, 3]));
// [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]
```

### 2.1 Permutations avec swap (en place)

```typescript
function permutationsSwap(nums: number[]): number[][] {
  const result: number[][] = [];

  function backtrack(start: number) {
    if (start === nums.length) {
      result.push([...nums]);
      return;
    }

    for (let i = start; i < nums.length; i++) {
      [nums[start], nums[i]] = [nums[i], nums[start]]; // swap
      backtrack(start + 1);
      [nums[start], nums[i]] = [nums[i], nums[start]]; // undo swap
    }
  }

  backtrack(0);
  return result;
}
```

---

## 3. Combinaisons

```typescript
// Choisir k éléments parmi n — C(n, k)
// Complexité : O(C(n,k) × k)

function combinations(n: number, k: number): number[][] {
  const result: number[][] = [];

  function backtrack(start: number, current: number[]) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }

    // Pruning : si même en prenant tous les restants on ne peut pas atteindre k
    const remaining = n - start + 1;
    const needed = k - current.length;
    if (remaining < needed) return; // ← pruning !

    for (let i = start; i <= n; i++) {
      current.push(i);
      backtrack(i + 1, current); // i+1 pour éviter les doublons
      current.pop();
    }
  }

  backtrack(1, []);
  return result;
}

console.log(combinations(4, 2));
// [[1,2], [1,3], [1,4], [2,3], [2,4], [3,4]]
```

---

## 4. Sous-ensembles (Power Set)

```typescript
// Générer tous les sous-ensembles — 2^n sous-ensembles possibles

function subsets<T>(nums: T[]): T[][] {
  const result: T[][] = [];

  function backtrack(start: number, current: T[]) {
    result.push([...current]); // Chaque état est un sous-ensemble valide

    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return result;
}

console.log(subsets([1, 2, 3]));
// [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]
```

### 4.1 Sous-ensembles avec somme cible

```typescript
function subsetsWithSum(nums: number[], target: number): number[][] {
  const result: number[][] = [];

  function backtrack(start: number, current: number[], sum: number) {
    if (sum === target) {
      result.push([...current]);
      return;
    }
    if (sum > target) return; // pruning

    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current, sum + nums[i]);
      current.pop();
    }
  }

  backtrack(0, [], 0);
  return result;
}

console.log(subsetsWithSum([2, 3, 6, 7], 7));
// [[7]] — seul 7 fait la somme
console.log(subsetsWithSum([1, 2, 3, 4, 5], 5));
// [[1, 4], [2, 3], [5]]
```

---

## 5. N-Queens

```typescript
// Placer N reines sur un échiquier N×N sans qu'elles s'attaquent
// Classique en entretien et pour illustrer le pruning

function solveNQueens(n: number): string[][] {
  const solutions: string[][] = [];
  const board: string[][] = Array.from({ length: n },
    () => new Array(n).fill('.'),
  );

  // Sets pour vérification O(1) des conflits
  const cols = new Set<number>();
  const diag1 = new Set<number>(); // row - col
  const diag2 = new Set<number>(); // row + col

  function backtrack(row: number) {
    if (row === n) {
      solutions.push(board.map(r => r.join('')));
      return;
    }

    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) {
        continue; // ← pruning : cette position est attaquée
      }

      // Placer la reine
      board[row][col] = 'Q';
      cols.add(col);
      diag1.add(row - col);
      diag2.add(row + col);

      backtrack(row + 1);

      // Retirer la reine (backtrack)
      board[row][col] = '.';
      cols.delete(col);
      diag1.delete(row - col);
      diag2.delete(row + col);
    }
  }

  backtrack(0);
  return solutions;
}

const solutions = solveNQueens(4);
console.log(solutions.length); // 2
console.log(solutions[0]);
// ['.Q..', '...Q', 'Q...', '..Q.']
//
//  . Q . .
//  . . . Q
//  Q . . .
//  . . Q .
```

---

## 6. Sudoku Solver

```typescript
function solveSudoku(board: string[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== '.') continue;

      for (let num = 1; num <= 9; num++) {
        const char = String(num);
        if (isValidPlacement(board, row, col, char)) {
          board[row][col] = char;

          if (solveSudoku(board)) return true;

          board[row][col] = '.'; // ← backtrack
        }
      }

      return false; // Aucun chiffre ne marche → backtrack
    }
  }

  return true; // Toutes les cases sont remplies
}

function isValidPlacement(
  board: string[][], row: number, col: number, char: string,
): boolean {
  // Vérifier la ligne
  if (board[row].includes(char)) return false;

  // Vérifier la colonne
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === char) return false;
  }

  // Vérifier le carré 3×3
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === char) return false;
    }
  }

  return true;
}
```

---

## 7. Génération de parenthèses valides

```typescript
// Générer toutes les combinaisons de n paires de parenthèses bien formées

function generateParentheses(n: number): string[] {
  const result: string[] = [];

  function backtrack(current: string, open: number, close: number) {
    if (current.length === 2 * n) {
      result.push(current);
      return;
    }

    if (open < n) {
      backtrack(current + '(', open + 1, close);
    }
    if (close < open) {
      backtrack(current + ')', open, close + 1);
    }
  }

  backtrack('', 0, 0);
  return result;
}

console.log(generateParentheses(3));
// ['((()))', '(()())', '(())()', '()(())', '()()()']
```

---

## 8. Word Search (grille)

```typescript
// Trouver si un mot existe dans une grille 2D en suivant les cases adjacentes

function wordSearch(board: string[][], word: string): boolean {
  const rows = board.length;
  const cols = board[0].length;

  function backtrack(row: number, col: number, index: number): boolean {
    if (index === word.length) return true;

    if (
      row < 0 || row >= rows ||
      col < 0 || col >= cols ||
      board[row][col] !== word[index]
    ) {
      return false;
    }

    const temp = board[row][col];
    board[row][col] = '#'; // Marquer comme visité

    const found =
      backtrack(row + 1, col, index + 1) ||
      backtrack(row - 1, col, index + 1) ||
      backtrack(row, col + 1, index + 1) ||
      backtrack(row, col - 1, index + 1);

    board[row][col] = temp; // ← backtrack

    return found;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (backtrack(r, c, 0)) return true;
    }
  }

  return false;
}

const grid = [
  ['A', 'B', 'C', 'E'],
  ['S', 'F', 'C', 'S'],
  ['A', 'D', 'E', 'E'],
];

console.log(wordSearch(grid, 'ABCCED')); // true
console.log(wordSearch(grid, 'SEE'));     // true
console.log(wordSearch(grid, 'ABCB'));    // false (ne peut pas réutiliser)
```

---

## 9. Cas terrain fullstack

### 9.1 Générateur de routes dynamiques

```typescript
// Générer toutes les combinaisons de segments d'URL possibles

function generateRoutes(
  segments: string[][], // segments[i] = options pour le i-ème segment
): string[] {
  const result: string[] = [];

  function backtrack(depth: number, current: string[]) {
    if (depth === segments.length) {
      result.push('/' + current.join('/'));
      return;
    }

    for (const option of segments[depth]) {
      current.push(option);
      backtrack(depth + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return result;
}

console.log(generateRoutes([
  ['api', 'v2'],
  ['users', 'admin'],
  ['list', 'detail'],
]));
// ['/api/users/list', '/api/users/detail', '/api/admin/list', ...]
```

### 9.2 Filtres de recherche combinés

```typescript
// E-commerce : générer tous les combos de filtres actifs pour du caching

interface Filter { name: string; values: string[] }

function filterCombinations(filters: Filter[]): Record<string, string>[] {
  const result: Record<string, string>[] = [];

  function backtrack(depth: number, current: Record<string, string>) {
    if (depth === filters.length) {
      result.push({ ...current });
      return;
    }

    const filter = filters[depth];

    // Option 1 : ne pas appliquer ce filtre
    backtrack(depth + 1, current);

    // Option 2 : appliquer avec chaque valeur
    for (const value of filter.values) {
      current[filter.name] = value;
      backtrack(depth + 1, current);
      delete current[filter.name];
    }
  }

  backtrack(0, {});
  return result;
}

const filters: Filter[] = [
  { name: 'color', values: ['red', 'blue'] },
  { name: 'size', values: ['S', 'M'] },
];

console.log(filterCombinations(filters));
// [{}, {size:'S'}, {size:'M'}, {color:'red'}, {color:'red',size:'S'}, ...]
```

---

## Points clés

1. **Backtracking** = DFS sur un arbre de décisions avec retour en arrière.
2. Le pattern : `make choice → explore → undo choice`.
3. **Pruning** = couper les branches invalides tôt → performance drastiquement améliorée.
4. **Permutations** O(n!), **Combinaisons** O(C(n,k)), **Sous-ensembles** O(2^n).
5. Pour les grilles : marquer visité → explorer → restaurer.
6. Le backtracking est **exponentiel** — acceptable uniquement pour des petits inputs (n < 20 typiquement).
7. Chaque problème de backtracking a le même squelette ; seuls les contraintes et choix changent.
8. En entretien : N-Queens, Word Search, combinaisons avec somme, Sudoku.
9. En production : génération de configs, feature flags, parcours de cas de test.

---

## Pour aller plus loin

- [Backtracking Visualizer](https://algorithm-visualizer.org/backtracking) — animation des algos
- [LeetCode — Backtracking tag](https://leetcode.com/tag/backtracking/) — 50+ problèmes
- [NeetCode — Backtracking](https://neetcode.io/roadmap) — roadmap avec solutions vidéo

---

## Si tu es perdu

1. Backtracking = essayer tous les chemins, revenir si ça ne marche pas.
2. C'est de la récursion avec un `undo` à chaque retour.
3. On peut couper les branches inutiles pour aller plus vite.
4. Dessine l'arbre de décision sur papier avant de coder.
5. Le résultat est toujours collecté quand on atteint une feuille valide.

---

## Défi

> Génère toutes les adresses IP valides à partir d'une chaîne de chiffres. Chaque segment doit être entre 0 et 255, pas de leading zero (sauf "0"), et il faut exactement 4 segments.

<details>
<summary>Réponse</summary>

```typescript
function restoreIpAddresses(s: string): string[] {
  const result: string[] = [];

  function backtrack(start: number, segments: string[]) {
    if (segments.length === 4 && start === s.length) {
      result.push(segments.join('.'));
      return;
    }
    if (segments.length === 4 || start === s.length) return;

    for (let len = 1; len <= 3; len++) {
      if (start + len > s.length) break;

      const segment = s.slice(start, start + len);

      // Pas de leading zero (sauf "0")
      if (segment.length > 1 && segment[0] === '0') break;
      if (Number(segment) > 255) break;

      segments.push(segment);
      backtrack(start + len, segments);
      segments.pop();
    }
  }

  backtrack(0, []);
  return result;
}

console.log(restoreIpAddresses('25525511135'));
// ['255.255.11.135', '255.255.111.35']
```

</details>

---

::: tip Parcours recommandé
📖 Module terminé → Fais le **Lab 08** (solver de contraintes) → puis le **Quiz 08**.
:::
