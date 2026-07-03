---
titre: Backtracking et exploration combinatoire
cours: 05-algorithms
notions: [template choix-explorer-defaire, arbre de decision, elagage (pruning), permutations, combinaisons, sous-ensembles, N-queens, sudoku, partition equilibree, generation de parentheses valides, word search sur grille, complexite exponentielle, backtracking vs DFS vs brute force]
outcomes: [ecrire le template general choix-explorer-defaire sur n'importe quel probleme combinatoire, elaguer un arbre de decision pour rendre l'exponentiel viable, distinguer backtracking de DFS et de brute force et choisir le bon]
prerequis: [07-graphes-et-parcours]
next: 09-programmation-dynamique
libs: []
tribuzen: generateur de compositions d'equipe sous contraintes et repartition equilibree en sous-groupes (partition) pour l'admin TribuZen
last-reviewed: 2026-07
---

# Backtracking et exploration combinatoire

> **Outcomes — tu sauras FAIRE :** écrire le template `choix → explorer → défaire` sur n'importe quel problème combinatoire, élaguer (pruning) un arbre de décision pour rendre l'exponentiel viable, distinguer backtracking, DFS et brute force et choisir le bon.
> **Difficulté :** :star::star::star::star:

## 1. Cas concret d'abord

L'admin TribuZen doit constituer les équipes d'un tournoi familial. On te donne 6 membres et tu dois **lister toutes les équipes de 3 valides** — sachant que deux membres brouillés (Bob et Chloé) ne peuvent pas être dans la même équipe.

Première réaction naïve : générer les 20 combinaisons possibles (`C(6,3) = 20`), puis filtrer celles qui contiennent Bob **et** Chloé. Ça marche pour 6 membres. Mais avec 40 membres et des équipes de 8, tu génères `C(40,8) ≈ 76 millions` de combinaisons juste pour en jeter 90 %. La machine rame, l'admin attend.

```ts
type Member = string;

// Naïf : on génère TOUT, puis on filtre. On paie le coût des branches mortes.
function teamsNaive(members: Member[], size: number): Member[][] {
  const all = combinationsBrute(members, size); // toutes les C(n,k)
  return all.filter(
    (team) => !(team.includes('Bob') && team.includes('Chloé')),
  );
}
```

Le problème : on découvre trop tard qu'une équipe est invalide. Dès qu'on a mis Bob **et** Chloé dans le panier, toutes les équipes construites par-dessus sont mortes-nées — mais le naïf continue à les construire.

Le backtracking répond exactement à ça : **on teste la contrainte pendant la construction**, et on coupe la branche à l'instant où elle devient invalide (pruning). On ne construit jamais les 90 % de branches mortes. Ce module te donne le template pour ça.

---

## 2. Théorie complète, concise

### 2.1 Le template universel : choix → explorer → défaire

Tout algorithme de backtracking est une **exploration en profondeur (DFS) d'un arbre de décision**, où à chaque nœud on fait un choix, on explore récursivement, puis on **défait le choix** pour essayer le suivant. Le squelette ne change jamais :

```ts
function backtrack(state: State): void {
  if (isComplete(state)) {
    collect(state); // solution trouvée — on l'enregistre
    return;
  }

  for (const choice of candidates(state)) {
    if (!isValid(state, choice)) continue; // ← PRUNING : on saute la branche morte

    apply(state, choice); //   1. CHOISIR   — on modifie l'état
    backtrack(state); //        2. EXPLORER  — on descend d'un niveau
    undo(state, choice); //     3. DÉFAIRE   — on restaure l'état (backtrack)
  }
}
```

Les trois lignes `apply / backtrack / undo` sont le cœur. La ligne `undo` est ce qui distingue le backtracking d'un simple DFS : **on restaure l'état exact d'avant le choix** pour que l'itération suivante de la boucle parte d'un état propre. Oublier le `undo` est le bug numéro un du backtracking (voir Pièges).

Symétrie à mémoriser : `apply` et `undo` sont des **opérations inverses**. Si `apply` fait `current.push(x)`, alors `undo` fait `current.pop()`. Si `apply` fait `set.add(x)`, alors `undo` fait `set.delete(x)`.

### 2.2 L'arbre de décision

Chaque appel récursif est un nœud ; chaque choix est une arête ; chaque feuille est un état complet (solution ou impasse). Pour les permutations de `[1, 2, 3]` :

```
                     [] (racine)
           /          |          \
        [1]          [2]         [3]        ← niveau 1 : 1er élément choisi
       /   \        /   \       /   \
    [1,2] [1,3]  [2,1] [2,3] [3,1] [3,2]    ← niveau 2 : 2e élément
      |     |      |     |     |     |
  [1,2,3][1,3,2][2,1,3][2,3,1][3,1,2][3,2,1] ← feuilles : 3! = 6 permutations
```

Descendre = `apply` (choisir). Remonter = `undo` (défaire). Le parcours visite les feuilles de gauche à droite. Dessiner cet arbre sur papier **avant de coder** est le meilleur réflexe pour un problème inconnu.

### 2.3 L'élagage (pruning) : le seul levier de performance

Le backtracking est exponentiel par nature. La **seule** façon de le rendre viable est de couper les branches non viables **le plus tôt possible** — avant de les construire. C'est le pruning. Deux formes :

- **Contrainte de validité** : `if (!isValid(state, choice)) continue;` — on refuse un choix qui viole une règle (Bob + Chloé ensemble, deux reines sur la même colonne…).
- **Borne / faisabilité** : on abandonne une branche si, même dans le meilleur des cas, elle ne peut plus aboutir (somme déjà dépassée, plus assez d'éléments restants pour compléter…).

```ts
// Combinaisons de k parmi 1..n — pruning de faisabilité
function combinations(n: number, k: number): number[][] {
  const result: number[][] = [];

  function backtrack(start: number, current: number[]): void {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    // PRUNING : reste-t-il assez de nombres pour compléter ?
    const remaining = n - start + 1; // nombres disponibles : start..n
    const needed = k - current.length; // combien il en manque
    if (remaining < needed) return; // branche condamnée → on coupe

    for (let i = start; i <= n; i++) {
      current.push(i); //          CHOISIR
      backtrack(i + 1, current); // EXPLORER (i+1 : pas de doublon ni de réutilisation)
      current.pop(); //            DÉFAIRE
    }
  }

  backtrack(1, []);
  return result;
}
```

Sans le pruning, l'algo explore quand même les branches trop courtes pour aboutir. Avec, on gagne des ordres de grandeur. **Un pruning précoce vaut mieux qu'un pruning tardif** : plus on coupe haut dans l'arbre, plus le sous-arbre évité est gros.

### 2.4 Complexités des familles classiques

| Problème | Nombre de solutions | Complexité type | Intuition |
|---|---|---|---|
| Permutations | `n!` | `O(n × n!)` | chaque ordre des `n` éléments |
| Combinaisons `C(n,k)` | `C(n,k)` | `O(k × C(n,k))` | sous-ensembles de taille `k` |
| Sous-ensembles (power set) | `2^n` | `O(n × 2^n)` | chaque élément : dedans ou dehors |
| Génération parenthèses | `Cₙ` (Catalan) | `O(4ⁿ / √n)` | pruning intégré aux règles |
| N-Queens | dépend de `n` | `O(n!)` borné par pruning | 1 reine par ligne |

Retiens l'ordre de grandeur : **le backtracking n'est acceptable que pour de petits inputs** (typiquement `n < 20`). Au-delà, on cherche de la programmation dynamique (module suivant) ou un algorithme glouton.

### 2.5 Le facteur : dedans / dehors vs quel élément suivant

Deux gabarits de boucle reviennent tout le temps :

- **Choix binaire par élément** (sous-ensembles, sac à dos) : pour chaque index, deux branches — « je prends » et « je ne prends pas ».
- **Choix d'index de départ** (combinaisons, permutations) : une boucle `for (i = start; …)` qui essaie chaque candidat restant, `start` évitant les doublons.

```ts
// Power set — variante "dedans / dehors" explicite
function subsets<T>(nums: T[]): T[][] {
  const result: T[][] = [];

  function backtrack(index: number, current: T[]): void {
    if (index === nums.length) {
      result.push([...current]);
      return;
    }
    // Branche 1 : on N'INCLUT PAS nums[index]
    backtrack(index + 1, current);
    // Branche 2 : on INCLUT nums[index]
    current.push(nums[index]); // CHOISIR
    backtrack(index + 1, current); // EXPLORER
    current.pop(); // DÉFAIRE
  }

  backtrack(0, []);
  return result;
}
```

### 2.6 Partition en sous-groupes équilibrés

Répartir `n` membres en `g` groupes de tailles données, sans doublon, est un problème de partition classique. On assigne chaque membre à un groupe, en élaguant dès qu'un groupe dépasse sa capacité :

```ts
// Répartir des membres en groupes de capacités fixes (ex: [3, 3] pour 6 membres)
function partitions(members: string[], caps: number[]): string[][][] {
  const result: string[][][] = [];
  const groups: string[][] = caps.map(() => []);

  function backtrack(i: number): void {
    if (i === members.length) {
      // Tous placés ET tous les groupes pleins → solution
      if (groups.every((g, k) => g.length === caps[k])) {
        result.push(groups.map((g) => [...g]));
      }
      return;
    }
    for (let k = 0; k < groups.length; k++) {
      if (groups[k].length >= caps[k]) continue; // PRUNING : groupe plein

      groups[k].push(members[i]); // CHOISIR
      backtrack(i + 1); //           EXPLORER
      groups[k].pop(); //            DÉFAIRE
    }
  }

  backtrack(0);
  return result;
}
```

### 2.7 Backtracking vs DFS vs brute force

Concepts proches, souvent confondus :

| | Brute force | DFS (parcours) | Backtracking |
|---|---|---|---|
| Structure | génère tout puis filtre | visite les nœuds d'un graphe/arbre **existant** | construit un arbre de décision **implicite** |
| État | reconstruit à chaque candidat | marque `visited`, ne défait pas | `apply` puis **`undo`** systématique |
| Pruning | aucun (filtre après coup) | possible mais pas central | **central** — coupe les branches mortes |
| Exemple | `filter` sur toutes les combos | parcours d'un graphe de dépendances | N-Queens, Sudoku |

En une phrase : **le backtracking est un DFS sur un arbre de décision implicite, avec `undo` de l'état à la remontée et pruning des branches invalides.** Le word search de la section 3 montre le pont : c'est un DFS sur grille **avec** backtracking (on marque visité, on explore, on **restaure**).

---

## 3. Worked examples

### Exemple 1 — Combination Sum (avec pruning, résolu pas à pas)

Trouver toutes les combinaisons de `candidates` (chaque nombre **réutilisable** à volonté) dont la somme vaut `target`.

```ts
function combinationSum(candidates: number[], target: number): number[][] {
  const result: number[][] = [];
  // Trier permet un pruning fort : dès qu'un candidat dépasse le reste,
  // tous les suivants (plus grands) le dépassent aussi → on casse la boucle.
  const sorted = [...candidates].sort((a, b) => a - b);

  function backtrack(start: number, current: number[], remaining: number): void {
    if (remaining === 0) {
      result.push([...current]); // somme atteinte pile → solution
      return;
    }

    for (let i = start; i < sorted.length; i++) {
      // PRUNING de borne : sorted est croissant, donc si celui-ci dépasse,
      // inutile de tester les suivants → break (pas continue).
      if (sorted[i] > remaining) break;

      current.push(sorted[i]); // CHOISIR
      // i (pas i+1) : on autorise la RÉUTILISATION du même candidat
      backtrack(i, current, remaining - sorted[i]); // EXPLORER
      current.pop(); // DÉFAIRE
    }
  }

  backtrack(0, [], target);
  return result;
}

console.log(combinationSum([2, 3, 6, 7], 7));
// [[2, 2, 3], [7]]
```

Déroulé mental pour `target = 7`, `sorted = [2,3,6,7]` :
1. On prend `2` (reste 5), encore `2` (reste 3), encore `2` (reste 1). `2 > 1` → `break`. On dépile.
2. Sur reste 3 après `[2,2]`, on prend `3` (reste 0) → solution `[2,2,3]`. On défait.
3. Retour au niveau racine : on prend `3` (reste 4), puis `3` (reste 1) → `break`, puis `6 > 4`... branche morte. On défait.
4. On prend `7` (reste 0) → solution `[7]`.

Le `break` (au lieu de `continue`) n'est possible **que parce qu'on a trié** — c'est le pruning de borne qui rend l'algo rapide.

### Exemple 2 — N-Queens (le pruning O(1) canonique)

Placer `n` reines sur un échiquier `n×n` sans qu'elles s'attaquent. Une reine par ligne (imposé par construction) ; on choisit la colonne de chaque ligne.

```ts
function solveNQueens(n: number): string[][] {
  const solutions: string[][] = [];
  const board: string[][] = Array.from({ length: n }, () =>
    new Array(n).fill('.'),
  );

  // Trois Sets pour tester un conflit en O(1) au lieu de rescanner l'échiquier.
  const cols = new Set<number>(); // colonnes occupées
  const diag1 = new Set<number>(); // diagonales "\" : identifiées par (row - col)
  const diag2 = new Set<number>(); // diagonales "/" : identifiées par (row + col)

  function backtrack(row: number): void {
    if (row === n) {
      solutions.push(board.map((r) => r.join(''))); // toutes les reines placées
      return;
    }

    for (let col = 0; col < n; col++) {
      // PRUNING O(1) : la case est-elle attaquée par une reine déjà posée ?
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) {
        continue; // branche morte → on saute cette colonne
      }

      // CHOISIR : poser la reine et enregistrer ses lignes d'attaque
      board[row][col] = 'Q';
      cols.add(col);
      diag1.add(row - col);
      diag2.add(row + col);

      backtrack(row + 1); // EXPLORER la ligne suivante

      // DÉFAIRE : retirer la reine et TOUTES ses marques (symétrie exacte)
      board[row][col] = '.';
      cols.delete(col);
      diag1.delete(row - col);
      diag2.delete(row + col);
    }
  }

  backtrack(0);
  return solutions;
}

console.log(solveNQueens(4).length); // 2
```

Le point d'or : chaque diagonale « \ » a un `row - col` constant, chaque diagonale « / » a un `row + col` constant. Ça transforme un test de conflit en trois `Set.has` — le pruning coûte O(1), donc on peut couper très tôt et très souvent.

---

## 4. Pièges & misconceptions

### PIÈGE #1 — Oublier le `undo` (état corrompu entre branches)

```ts
// ❌ Pas de pop() : current garde les choix des branches précédentes
function subsetsBuggy(nums: number[]): number[][] {
  const result: number[][] = [];
  function backtrack(start: number, current: number[]) {
    result.push([...current]);
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      // manque current.pop() → les sous-ensembles fuient d'une branche à l'autre
    }
  }
  backtrack(0, []);
  return result;
}

// ✅ apply et undo sont inverses : push ↔ pop
function subsets(nums: number[]): number[][] {
  const result: number[][] = [];
  function backtrack(start: number, current: number[]) {
    result.push([...current]);
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop(); // ← restaure l'état d'avant le choix
    }
  }
  backtrack(0, []);
  return result;
}
```

**Règle :** à chaque `apply` doit correspondre un `undo` inverse, sur le même chemin de code. Si tu ajoutes à trois structures (comme N-Queens), tu retires des trois.

### PIÈGE #2 — Pousser une référence au lieu d'une copie

```ts
// ❌ On stocke la MÊME référence à current, mutée ensuite → toutes les lignes identiques (et vides)
result.push(current);

// ✅ On fige un instantané par copie superficielle
result.push([...current]);
```

`current` est réutilisé tout au long de l'exploration (on push/pop dedans). Sans copie, `result` finit rempli de N pointeurs vers le **même** tableau, qui est vide à la fin. Le `[...current]` (ou `current.slice()`) capture l'état à cet instant précis.

### PIÈGE #3 — Confondre `continue` et `break` dans le pruning

```ts
// Sur un tableau TRIÉ croissant :
if (sorted[i] > remaining) break;    // ✅ tous les suivants sont ≥, donc morts aussi
if (sorted[i] > remaining) continue; // ❌ correct mais gâche du temps : teste inutilement les suivants
```

`break` n'est légitime **que** si le tri garantit que tous les candidats suivants échoueront aussi. Sur un tableau non trié, il faut `continue`. Confondre les deux donne soit un résultat faux (`break` sans tri), soit un pruning inefficace (`continue` avec tri).

### PIÈGE #4 — Croire que « backtracking = brute force filtré »

La brute force génère **toutes** les configurations puis filtre. Le backtracking **ne construit jamais** les branches invalides : le test `isValid` est appliqué *pendant* la descente. Sur le cas concret (Bob + Chloé), la brute force construit 76 M de combos pour en jeter 90 % ; le backtracking coupe la branche dès que Bob et Chloé cohabitent, et n'explore jamais le sous-arbre en dessous. Même résultat, coût radicalement différent.

### PIÈGE #5 — Marquer visité sans restaurer (word search / grille)

```ts
// Dans un DFS sur grille avec backtracking :
board[r][c] = '#';        // CHOISIR : marquer visité pour ce chemin
const found = explore();  // EXPLORER les 4 voisins
board[r][c] = temp;       // ✅ DÉFAIRE : restaurer, sinon la cellule reste bloquée
                          //    pour les autres chemins partant d'ailleurs
```

Sur une grille, le `undo` restaure la cellule pour que d'autres chemins puissent la réutiliser. Sans restauration, on interdit à tort des solutions valides passant par cette même case via un autre trajet.

---

## 5. Ancrage TribuZen

Le backtracking alimente le moteur de **composition sous contraintes** de l'admin TribuZen — partout où l'on doit énumérer ou répartir des membres en respectant des règles.

**Générateur de compositions d'équipe** (`src/lib/teams/composeTeams.ts`) — reprend le cas concret : lister toutes les équipes de taille `k` valides parmi les membres d'une famille, avec des contraintes (`incompatibles: [['Bob','Chloé']]`, `mustInclude`, `maxParTranche`). Le pruning coupe une branche dès qu'une contrainte est violée, ce qui rend viable une famille de 40+ membres.

**Répartition en sous-groupes équilibrés** (`src/lib/teams/balancedPartition.ts`) — le solveur de partition de la section 2.6 : découper les membres d'un événement en `g` groupes de tailles fixes (ateliers, tablées d'un repas, chambrées d'un séjour). On élague dès qu'un groupe déborde sa capacité.

**Planning sous contraintes** (`src/lib/planning/scheduleSlots.ts`) — assigner des créneaux à des activités sans collision (une salle par créneau, un animateur à la fois). Même squelette que N-Queens : le « conflit » remplace « case attaquée », et les `Set` de ressources occupées jouent le rôle des `Set` de colonnes/diagonales.

Fichiers cibles dans `smaurier/tribuzen` :
```
tribuzen/src/lib/
  teams/
    composeTeams.ts        # générateur de compositions sous contraintes
    balancedPartition.ts   # partition en sous-groupes équilibrés
  planning/
    scheduleSlots.ts       # affectation de créneaux sans collision
```

---

## 6. Points clés

1. Tout backtracking suit le même template : **`choix → explorer → défaire`** (`apply / backtrack / undo`), une exploration DFS d'un arbre de décision.
2. `apply` et `undo` sont des opérations **inverses** sur le même chemin de code (`push`↔`pop`, `add`↔`delete`) — le `undo` est ce qui différencie backtracking et DFS simple.
3. Le **pruning** est le seul levier de perf : couper les branches invalides ou non-faisables **le plus tôt possible** ; un pruning haut dans l'arbre économise un gros sous-arbre.
4. Ordres de grandeur : permutations `O(n!)`, sous-ensembles `O(2^n)`, combinaisons `O(C(n,k))` — le backtracking n'est viable que pour `n` petit (< ~20).
5. Deux gabarits de boucle : **dedans/dehors par élément** (power set, sac à dos) et **index de départ** (`for i = start`, combinaisons/permutations, `start` évite les doublons).
6. Copier l'état au moment de collecter (`result.push([...current])`) — jamais la référence vivante.
7. `break` au lieu de `continue` dans le pruning **exige** un tri préalable qui garantit que les candidats suivants échoueront aussi.
8. Backtracking = DFS sur un arbre de décision **implicite** avec `undo` + pruning ; à ne pas confondre avec la brute force (générer tout puis filtrer).

---

## 7. Seeds Anki

```
Quel est le template universel du backtracking ?|choix → explorer → défaire : pour chaque candidat valide, apply(state, choice) puis backtrack(state) récursif puis undo(state, choice). C'est un DFS d'un arbre de décision avec restauration de l'état à la remontée.
Qu'est-ce qui distingue le backtracking d'un DFS simple ?|Le undo : le backtracking restaure l'état exact d'avant chaque choix (push↔pop, add↔delete) pour que l'itération suivante parte propre. Un DFS de parcours marque visited et ne défait pas.
Qu'est-ce que le pruning (élagage) et pourquoi c'est central ?|Couper une branche invalide ou non-faisable le plus tôt possible, avant de la construire. C'est le seul levier de perf du backtracking (exponentiel par nature) : un pruning haut dans l'arbre économise tout le sous-arbre en dessous.
Complexités : permutations, sous-ensembles, combinaisons ?|Permutations O(n × n!), sous-ensembles/power set O(n × 2^n), combinaisons O(k × C(n,k)). Le backtracking n'est viable que pour n petit (< ~20).
Pourquoi result.push([...current]) et pas result.push(current) ?|current est muté (push/pop) tout au long de l'exploration. Sans copie, result contient N références au même tableau, vide à la fin. Le spread fige un instantané de l'état.
Quand peut-on utiliser break plutôt que continue dans le pruning ?|Seulement si les candidats sont triés de façon à garantir que tous les suivants échoueront aussi (ex: sorted croissant, sorted[i] > remaining → break). Sans tri, break donne un résultat faux ; il faut continue.
Backtracking vs brute force : quelle différence de coût ?|La brute force génère toutes les configurations puis filtre. Le backtracking ne construit jamais les branches invalides (test isValid pendant la descente). Même résultat, mais on évite les sous-arbres morts.
Comment tester un conflit en O(1) dans N-Queens ?|Trois Sets : colonnes (col), diagonales "\" identifiées par (row - col), diagonales "/" par (row + col). Une case est attaquée si cols.has(col) || diag1.has(row-col) || diag2.has(row+col).
Comment faire un backtracking sur une grille (word search) ?|DFS 4-directions : marquer la cellule visitée (board[r][c]='#') = CHOISIR, explorer les voisins = EXPLORER, restaurer (board[r][c]=temp) = DÉFAIRE, pour que d'autres chemins puissent réutiliser la case.
```

---

## Pont vers le lab

> Lab associé : `05-algorithms/labs/lab-08-backtracking-solver/README.md`. Écrire `permutations`, `combinationSum` (avec pruning de borne) et un solveur de composition d'équipe sous contraintes — le tout en TypeScript, exécuté à la main dans le REPL, corrigé complet + variante J+30 + portage TribuZen.
