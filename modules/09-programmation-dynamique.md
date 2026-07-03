---
titre: Programmation dynamique
cours: 05-algorithms
notions: [sous-problèmes qui se recouvrent, sous-structure optimale, memoization top-down, tabulation bottom-up, définition de l'état, relation de récurrence, cas de base, ordre de remplissage, optimisation mémoire rolling array, Fibonacci, escalier, coin change, knapsack 0/1, longest common subsequence, longest increasing subsequence, edit distance, grid paths, reconnaître un problème DP]
outcomes: [reconnaître un problème DP via ses deux signaux, dériver état + récurrence + cas de base + ordre de remplissage, implémenter en memoization puis en tabulation, optimiser l'espace avec un rolling array]
prerequis: [08-backtracking]
next: 10-greedy-unionfind-trie
libs: []
tribuzen: moteur DP TribuZen — coin change pour les paliers de récompense, LCS pour comparer deux historiques d'activité, knapsack pour sélectionner des activités sous budget de temps
last-reviewed: 2026-07
---

# Programmation dynamique

> **Outcomes — tu sauras FAIRE :** reconnaître un problème DP par ses deux signaux, dériver l'état + la récurrence + les cas de base + l'ordre de remplissage, l'implémenter d'abord en memoization (top-down) puis en tabulation (bottom-up), et optimiser l'espace avec un rolling array.
> **Difficulté :** :star::star::star::star::star:

## 1. Cas concret d'abord

Dans TribuZen, une famille cumule des **points d'engagement**. Le produit propose un catalogue de **paliers de récompense** échangeables : un badge à 3 points, un thème à 5, un avatar animé à 7. Une famille a 11 points. Le produit veut afficher : *« tu peux atteindre exactement 11 points de récompense en un minimum de 3 échanges »* (par ex. 5 + 5 + 1, ou 7 + 3 + 1).

C'est le problème **coin change** : quel est le nombre minimum de « pièces » (paliers) pour composer un montant cible ? Écrit naïvement en récursion, on explore toutes les combinaisons :

```typescript
// Récursion naïve — "combien de paliers min pour faire `montant` ?"
function minPalliersNaif(paliers: number[], montant: number): number {
  if (montant === 0) return 0;          // rien à composer
  if (montant < 0) return Infinity;      // dépassé → branche morte
  let best = Infinity;
  for (const p of paliers) {
    best = Math.min(best, 1 + minPalliersNaif(paliers, montant - p));
  }
  return best;
}

console.log(minPalliersNaif([1, 3, 5, 7], 11)); // 3 — mais explosif
```

Le résultat est correct, mais pour `montant = 60` le navigateur gèle : la fonction recalcule des dizaines de milliers de fois le **même** sous-problème (par ex. « min pour 8 »). Ce module te donne la technique — la **programmation dynamique** — pour transformer cette récursion exponentielle en solution linéaire, sans changer la logique.

---

## 2. Théorie complète, concise

### 2.1 Ce qu'est la DP (et ce qu'elle n'est pas)

La programmation dynamique n'est **pas** un algorithme. C'est une **méthode de conception** : résoudre un problème en le décomposant en sous-problèmes, et en ne calculant **jamais deux fois** le même sous-problème. On stocke chaque réponse la première fois, on la relit ensuite.

> Formule à graver : **DP = récursion + mémoire.** Si tu sais poser une récursion (module 04) et que les branches se répètent, tu sais faire de la DP.

### 2.2 Les deux signaux — les seuls qui comptent

Un problème se traite en DP si et seulement si il a **les deux** propriétés suivantes :

**Signal 1 — sous-problèmes qui se recouvrent.** Le même sous-problème réapparaît plusieurs fois dans l'arbre de récursion. C'est ça qui rend le cache utile.

```
minPalliers(11) avec [1,3,5]
├── minPalliers(10)
│   ├── minPalliers(9)
│   └── minPalliers(7)  ← recalculé ailleurs
├── minPalliers(8)  ← atteint aussi depuis d'autres branches
└── minPalliers(6)  ← recalculé plusieurs fois
```

Le sous-problème `minPalliers(8)` est atteint par plusieurs chemins. Sans cache, chacun le recalcule intégralement.

**Signal 2 — sous-structure optimale.** La solution optimale du problème se construit à partir des solutions optimales de ses sous-problèmes. « Le minimum pour 11 = 1 + le minimum pour (11 − dernière pièce). » On peut donc combiner des sous-solutions optimales sans revenir en arrière.

> Contre-exemple : le **plus long chemin simple** dans un graphe n'a **pas** de sous-structure optimale (le meilleur trajet global ne se compose pas des meilleurs trajets locaux). La DP ne s'applique pas.

### 2.3 Diviser-pour-régner vs DP vs greedy

Trois familles proches, à ne pas confondre :

| Technique | Sous-problèmes | Se recouvrent ? | Choix |
|---|---|---|---|
| Diviser-pour-régner | indépendants (module 04) | non | on découpe |
| **DP** | dépendants | **oui → on mémorise** | on explore tous les choix, on garde le meilleur |
| Greedy (module 10) | dépendants | oui | on prend le choix localement optimal sans revenir |

La DP explore **tous** les choix à chaque étape ; le greedy en prend **un** sans jamais le remettre en cause. La DP est plus lente mais toujours correcte quand les deux signaux sont là ; le greedy est plus rapide mais faux si le problème n'a pas la propriété de choix glouton.

### 2.4 La démarche en 5 temps

C'est le cœur du module. Face à n'importe quel problème DP, dérouler **toujours** ces cinq étapes dans l'ordre :

1. **Définir l'état.** Quels paramètres identifient un sous-problème de façon unique ? C'est ce qui sert de clé de cache. Ex. `dp[montant]`, ou `dp[i][w]` (i objets considérés, capacité w restante).
2. **Écrire la récurrence.** Exprimer `dp[état]` en fonction d'états plus petits. C'est le « comment je choisis ».
3. **Poser les cas de base.** Les états les plus petits, résolus sans récurrence. Ex. `dp[0] = 0`.
4. **Déterminer l'ordre de remplissage.** En bottom-up, dans quel ordre calculer pour qu'un état dispose déjà de ses dépendances ? (les petits avant les grands).
5. **Optimiser la mémoire.** Si `dp[i]` ne dépend que de `dp[i-1]` et `dp[i-2]`, garder deux variables au lieu du tableau entier (**rolling array**).

### 2.5 Top-down (memoization) vs bottom-up (tabulation)

Deux façons d'implémenter la même récurrence.

**Top-down / memoization** : on garde la récursion naturelle, on ajoute un cache. On ne calcule que les sous-problèmes réellement atteints.

```typescript
function minPalliers(paliers: number[], montant: number,
                     cache = new Map<number, number>()): number {
  if (montant === 0) return 0;
  if (montant < 0) return Infinity;
  if (cache.has(montant)) return cache.get(montant)!; // cache HIT

  let best = Infinity;
  for (const p of paliers) {
    best = Math.min(best, 1 + minPalliers(paliers, montant - p, cache));
  }
  cache.set(montant, best); // on mémorise avant de retourner
  return best;
}

console.log(minPalliers([1, 3, 5, 7], 11)); // 3 — instantané
```

**Bottom-up / tabulation** : on remplit un tableau des petits états vers les grands, sans récursion.

```typescript
function minPalliersTab(paliers: number[], montant: number): number {
  const dp = new Array(montant + 1).fill(Infinity);
  dp[0] = 0; // cas de base : 0 palier pour le montant 0
  for (let m = 1; m <= montant; m++) {         // ordre : petits d'abord
    for (const p of paliers) {
      if (p <= m && dp[m - p] !== Infinity) {
        dp[m] = Math.min(dp[m], dp[m - p] + 1); // récurrence
      }
    }
  }
  return dp[montant] === Infinity ? -1 : dp[montant];
}
```

Comparaison :

| | Top-down (memo) | Bottom-up (tab) |
|---|---|---|
| Style | récursif + cache | itératif + tableau |
| Écriture | plus proche de la récurrence, intuitif | demande de fixer l'ordre soi-même |
| Sous-problèmes calculés | seulement les atteints | **tous** ceux du tableau |
| Stack overflow | possible si profondeur grande | jamais |
| Optim mémoire (rolling) | difficile | naturelle |
| Recommandation | dériver / prototyper | production / perf |

> Méthode de travail conseillée pour tout le module : **écrire d'abord la récursion naïve** (elle prouve la récurrence), **ajouter le cache** (memo), **puis transposer en tableau** (tab). Ne jamais sauter direct à la tabulation tant que la récurrence n'est pas sûre.

### 2.6 Les problèmes classiques (à reconnaître d'un coup d'œil)

**Fibonacci** — le « hello world » de la DP. État `dp[n]`, récurrence `dp[n] = dp[n-1] + dp[n-2]`, cas de base `dp[0]=0, dp[1]=1`.

```typescript
function fib(n: number): number {
  if (n <= 1) return n;
  let a = 0, b = 1;              // rolling array : 2 variables suffisent
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}
```

**Escalier (climbing stairs)** — combien de façons de monter `n` marches par pas de 1 ou 2 ? Même récurrence que Fibonacci (`ways[n] = ways[n-1] + ways[n-2]`), mais le sens change : ici on **compte des chemins**, pas une valeur. C'est le motif « nombre de façons de ».

```typescript
function climb(n: number): number {
  if (n <= 2) return n;         // 1 marche→1 façon, 2 marches→2 façons
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) [a, b] = [b, a + b];
  return b;
}
```

**Coin change** — le cas concret. Motif « minimum de » : `dp[m] = min sur chaque pièce c de dp[m-c] + 1`.

**Knapsack 0/1 (sac à dos)** — chaque objet est pris **ou** non (pas de fraction). Motif « maximiser sous contrainte ». État à **deux dimensions** : `dp[i][w]` = valeur max avec les `i` premiers objets et une capacité `w`.

```typescript
interface Objet { poids: number; valeur: number }

function knapsack(objets: Objet[], capacite: number): number {
  const n = objets.length;
  const dp: number[][] = Array.from({ length: n + 1 },
    () => new Array(capacite + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { poids, valeur } = objets[i - 1];
    for (let w = 0; w <= capacite; w++) {
      dp[i][w] = dp[i - 1][w];                 // choix : ne PAS prendre l'objet i
      if (poids <= w) {                         // choix : le prendre si ça rentre
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - poids] + valeur);
      }
    }
  }
  return dp[n][capacite];
}
```

**Longest Common Subsequence (LCS)** — plus longue sous-séquence commune à deux chaînes (les caractères gardent l'ordre mais pas la contiguïté). État `dp[i][j]` sur les préfixes. Motif « comparer/aligner deux séquences ».

```typescript
function lcsLen(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 },
    () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1                       // match → +1 en diagonale
        : Math.max(dp[i - 1][j], dp[i][j - 1]);       // sinon → meilleur voisin
    }
  }
  return dp[m][n];
}
```

**Longest Increasing Subsequence (LIS)** — plus longue sous-séquence strictement croissante. État `dp[i]` = longueur de la plus longue croissante **finissant** en `i`.

```typescript
function lis(nums: number[]): number {
  const dp = new Array(nums.length).fill(1); // chaque élément seul = longueur 1
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
  }
  return Math.max(...dp, 0);
}
```

**Edit distance (Levenshtein)** — nombre min d'opérations (insertion, suppression, remplacement) pour passer d'une chaîne à l'autre. C'est le moteur de `git diff` et des correcteurs. État `dp[i][j]` sur préfixes, comme LCS.

```typescript
function editDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 },
    () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i; // transformer a[0..i] en "" = i suppressions
  for (let j = 0; j <= n; j++) dp[0][j] = j; // "" → b[0..j] = j insertions
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]                              // même char → rien
        : 1 + Math.min(dp[i - 1][j],       // suppression
                       dp[i][j - 1],       // insertion
                       dp[i - 1][j - 1]);  // remplacement
    }
  }
  return dp[m][n];
}
```

**Grid paths** — nombre de chemins de `(0,0)` à `(m-1,n-1)` en n'allant que droite ou bas. État `dp[i][j] = dp[i-1][j] + dp[i][j-1]`.

```typescript
function uniquePaths(m: number, n: number): number {
  const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(1));
  for (let i = 1; i < m; i++)
    for (let j = 1; j < n; j++)
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
  return dp[m - 1][n - 1];
}
```

### 2.7 Optimisation de l'espace — le rolling array

Quand `dp[i]` ne dépend que d'un nombre **fixe** de lignes précédentes, on n'a pas besoin de tout le tableau. On « fait rouler » quelques variables ou une seule ligne.

- Fibonacci : `dp[i]` dépend de `dp[i-1]` et `dp[i-2]` → 2 variables au lieu de `n`. Mémoire `O(n) → O(1)`.
- Knapsack : `dp[i][w]` dépend seulement de la ligne `i-1` → une seule ligne 1D suffit, **parcourue de la droite vers la gauche** pour ne pas écraser une valeur encore nécessaire.

```typescript
// Knapsack optimisé espace : O(capacite) au lieu de O(n × capacite)
function knapsack1D(objets: Objet[], capacite: number): number {
  const dp = new Array(capacite + 1).fill(0);
  for (const { poids, valeur } of objets) {
    for (let w = capacite; w >= poids; w--) { // ← droite→gauche : crucial
      dp[w] = Math.max(dp[w], dp[w - poids] + valeur);
    }
  }
  return dp[capacite];
}
```

> Le sens du parcours n'est pas cosmétique : de gauche à droite, `dp[w - poids]` aurait **déjà** été mis à jour pour l'objet courant → on autoriserait à prendre l'objet plusieurs fois (ce serait le knapsack *non borné*, pas le 0/1).

### 2.8 Reconnaître un problème DP en entretien / en prod

Signaux dans l'énoncé qui doivent déclencher « DP » dans ta tête :

- « **minimum / maximum de** … » (coin change, knapsack)
- « **nombre de façons de** … » (escalier, grid paths)
- « **est-il possible de** … » (word break, subset sum)
- « **plus longue / plus courte** sous-séquence / sous-chaîne… » (LCS, LIS)
- des **choix successifs** (prendre/laisser, avancer d'ici ou de là) avec des sous-problèmes qui reviennent.

Réflexe : pose la récursion brute, dessine deux niveaux de l'arbre, cherche un nœud dupliqué. S'il y en a un → DP.

---

## 3. Worked examples

### Exemple 1 — Coin change, de la récursion naïve à O(montant)

**Problème :** paliers `[1, 3, 5, 7]`, montant `11`, trouver le nombre minimum de paliers.

**Étape A — récursion naïve (pose la récurrence).**

```typescript
function minNaif(paliers: number[], m: number): number {
  if (m === 0) return 0;
  if (m < 0) return Infinity;
  let best = Infinity;
  for (const p of paliers) best = Math.min(best, 1 + minNaif(paliers, m - p));
  return best;
}
// Correct mais O(k^m) : recalcule minNaif(8), minNaif(6)... des milliers de fois.
```

**Étape B — dérouler la démarche en 5 temps.**
1. État : `dp[m]` = nb min de paliers pour composer `m`.
2. Récurrence : `dp[m] = min sur p de dp[m - p] + 1`.
3. Cas de base : `dp[0] = 0`.
4. Ordre : de `1` à `montant` (un `m` a besoin de `m - p` plus petit → déjà calculé).
5. Mémoire : `dp[m]` dépend de plusieurs `dp[m-p]` sur toute la largeur → on garde le tableau complet (pas de rolling ici).

**Étape C — memoization (top-down).**

```typescript
function minMemo(paliers: number[], m: number,
                 cache = new Map<number, number>()): number {
  if (m === 0) return 0;
  if (m < 0) return Infinity;
  if (cache.has(m)) return cache.get(m)!;
  let best = Infinity;
  for (const p of paliers) best = Math.min(best, 1 + minMemo(paliers, m - p, cache));
  cache.set(m, best);
  return best;
}
```

**Étape D — tabulation (bottom-up).**

```typescript
function minTab(paliers: number[], montant: number): number {
  const dp = new Array(montant + 1).fill(Infinity);
  dp[0] = 0;
  for (let m = 1; m <= montant; m++) {
    for (const p of paliers) {
      if (p <= m && dp[m - p] !== Infinity) {
        dp[m] = Math.min(dp[m], dp[m - p] + 1);
      }
    }
  }
  return dp[montant] === Infinity ? -1 : dp[montant];
}

console.log(minTab([1, 3, 5, 7], 11)); // 3   (7 + 3 + 1)
console.log(minTab([2], 3));           // -1  (impossible)
```

Trace de `dp` pour `[1,3,5,7]` :

```
m :    0  1  2  3  4  5  6  7  8  9 10 11
dp:    0  1  2  1  2  1  2  1  2  2  2  3
                 ↑        ↑           ↑
             1 palier  1 palier    dp[11] = min(dp[10],dp[8],dp[6],dp[4]) + 1 = 2 + 1 = 3
```

Complexité : `O(montant × nbPaliers)` temps, `O(montant)` espace. On est passé d'exponentiel à linéaire.

### Exemple 2 — LCS avec reconstruction (fading)

**Problème :** plus longue sous-séquence commune de `"ABCBDAB"` et `"BDCAB"`, **et** la restituer (pas seulement sa longueur).

**Démarche.**
1. État : `dp[i][j]` = longueur de la LCS des préfixes `a[0..i)` et `b[0..j)`.
2. Récurrence : si `a[i-1] === b[j-1]` → `dp[i][j] = dp[i-1][j-1] + 1` ; sinon `max(dp[i-1][j], dp[i][j-1])`.
3. Cas de base : ligne 0 et colonne 0 = `0` (un préfixe vide n'a aucune LCS).
4. Ordre : `i` croissant, `j` croissant (chaque case a besoin de haut / gauche / diagonale déjà remplies).
5. Mémoire : pour la seule longueur, deux lignes suffisent ; mais ici on veut **reconstruire** → on garde toute la table.

```typescript
function lcs(a: string, b: string): { longueur: number; sequence: string } {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 },
    () => new Array(n + 1).fill(0));

  // Remplissage
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Reconstruction : on remonte depuis dp[m][n] vers dp[0][0]
  let i = m, j = n, seq = '';
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {       // caractère commun → il fait partie de la LCS
      seq = a[i - 1] + seq;
      i--; j--;                         // on recule en diagonale
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;                              // on suit la plus grande valeur
    } else {
      j--;
    }
  }
  return { longueur: dp[m][n], sequence: seq };
}

console.log(lcs('ABCBDAB', 'BDCAB')); // { longueur: 4, sequence: 'BCAB' }
```

Table `dp` (lignes = `ABCBDAB`, colonnes = `BDCAB`) :

```
      ""  B  D  C  A  B
  ""   0  0  0  0  0  0
  A    0  0  0  0  1  1
  B    0  1  1  1  1  2
  C    0  1  1  2  2  2
  B    0  1  1  2  2  3
  D    0  1  2  2  2  3
  A    0  1  2  2  3  3
  B    0  1  2  2  3  4  ← dp[m][n] = 4
```

**Fading J+30 :** réécris `lcs` sans regarder, mais renvoie en plus le **pourcentage de similarité** = `2 × longueur / (a.length + b.length)`. (C'est exactement ce que fait la section TribuZen ci-dessous.)

---

## 4. Pièges & misconceptions

### PIÈGE #1 — Croire qu'un seul signal suffit

Beaucoup partent en DP dès qu'ils voient une récursion. **Il faut les deux signaux.** Des sous-problèmes qui se recouvrent **sans** sous-structure optimale (plus long chemin simple) ne donnent pas une DP correcte. Une sous-structure optimale **sans** recouvrement (tri fusion) est du diviser-pour-régner : mémoriser n'apporte rien.

**Règle :** vérifier *recouvrement* ET *sous-structure optimale* avant d'écrire une seule ligne.

### PIÈGE #2 — Oublier le cas de base négatif / hors bornes

```typescript
// ❌ Sans garde sur m < 0, on lit dp[-1] ou on récursionne à l'infini
function bad(paliers: number[], m: number): number {
  if (m === 0) return 0;
  let best = Infinity;
  for (const p of paliers) best = Math.min(best, 1 + bad(paliers, m - p)); // m-p peut être < 0
  return best;
}

// ✅ Cas de base négatif explicite = branche morte
// if (m < 0) return Infinity;
```

Le cas de base n'est pas seulement « le plus petit état valide » : c'est aussi **toutes les sorties invalides** (indice négatif, capacité dépassée). Les oublier fait planter ou fausse le `min`.

### PIÈGE #3 — Mauvais sens de parcours en rolling array (knapsack)

```typescript
// ❌ Gauche → droite sur le tableau 1D : dp[w - poids] déjà mis à jour
for (let w = poids; w <= capacite; w++)          // autorise à reprendre l'objet → knapsack NON borné
  dp[w] = Math.max(dp[w], dp[w - poids] + valeur);

// ✅ Droite → gauche : dp[w - poids] est encore la valeur de la ligne précédente
for (let w = capacite; w >= poids; w--)          // 0/1 correct
  dp[w] = Math.max(dp[w], dp[w - poids] + valeur);
```

Compresser la 2e dimension est puissant mais le **sens du balayage encode la sémantique** (objet unique vs réutilisable). Se tromper de sens ne lève aucune erreur — juste un résultat faux.

### PIÈGE #4 — Confondre sous-séquence et sous-chaîne

LCS = **sous-séquence** : caractères dans l'ordre mais **non contigus** (`"ACE"` est une sous-séquence de `"ABCDE"`). Une **sous-chaîne** est contiguë (`"BCD"`). Ce sont deux problèmes DP différents avec des récurrences différentes. Lire l'énoncé : « subsequence » ≠ « substring ».

### PIÈGE #5 — Mémoriser sur une clé incomplète

Le cache doit être indexé par **tout** l'état. En knapsack, la clé est `(i, w)` — cacher sur `i` seul mélange des sous-problèmes distincts et renvoie des réponses fausses. Si l'état a deux dimensions, la clé de cache en a deux (`Map` sur `` `${i},${w}` `` ou tableau 2D).

### PIÈGE #6 — Optimiser l'espace avant que ce soit correct

Le rolling array supprime des lignes qu'on ne peut alors plus utiliser pour **reconstruire** la solution (le chemin, la séquence). Si l'énoncé demande *quoi* (les objets choisis, la sous-séquence) et pas seulement *combien*, garder la table pleine. Optimiser l'espace en tout dernier, une fois la version 2D validée.

---

## 5. Ancrage TribuZen

Trois usages concrets du moteur DP dans le produit :

**Coin change → paliers de récompense.** Le module d'engagement affiche à une famille comment atteindre exactement son solde de points avec le minimum d'échanges de paliers (`src/domain/rewards/minRedemptions.ts`). Le catalogue de paliers = les « pièces », le solde = le montant. Bonus produit : la variante « nombre de façons de » sert à afficher *« 12 combinaisons possibles »* pour donner de la latitude à l'utilisateur.

**LCS → comparer deux historiques d'activité.** Pour suggérer des activités entre deux familles « compatibles », on compare leurs séquences d'activités passées (`src/domain/matching/activitySimilarity.ts`). La LCS des deux historiques donne un **score de similarité** `2 × lcs / (lenA + lenB)` — plus les familles ont enchaîné les mêmes types d'activités dans le même ordre, plus le score est haut. Sert aussi au « diff » d'un planning familial d'une semaine à l'autre.

**Knapsack 0/1 → activités sous budget de temps.** Le planificateur du week-end reçoit un catalogue d'activités, chacune avec une durée (poids) et un score d'engagement estimé (valeur), et un temps disponible (capacité). Il sélectionne le sous-ensemble qui **maximise l'engagement sans dépasser le temps** (`src/domain/planner/selectActivities.ts`). Chaque activité est prise ou non (0/1) — on ne fait pas une demi-activité.

Fichiers cibles dans `smaurier/tribuzen` :

```
tribuzen/src/domain/
  rewards/
    minRedemptions.ts     // coin change (min + nb de façons)
  matching/
    activitySimilarity.ts // LCS → score de similarité
  planner/
    selectActivities.ts   // knapsack 0/1 → sélection sous budget temps
```

---

## 6. Points clés

1. DP = récursion + mémoire : ne jamais recalculer deux fois le même sous-problème.
2. Deux signaux **obligatoires** : sous-problèmes qui se recouvrent **et** sous-structure optimale — les deux, sinon ce n'est pas de la DP.
3. La démarche : état → récurrence → cas de base → ordre de remplissage → optimisation mémoire.
4. Memoization (top-down) = récursion + cache, ne calcule que l'utile ; tabulation (bottom-up) = tableau itératif, pas de stack overflow, rolling array facile.
5. Toujours partir de la récursion naïve pour prouver la récurrence, puis memo, puis tab.
6. État 1D pour montant/longueur (coin change, LIS) ; état 2D pour deux séquences ou objet×capacité (LCS, edit distance, knapsack, grid).
7. Rolling array : garder seulement les lignes utiles fait passer `O(n)`→`O(1)` (Fibonacci) ou `O(n·W)`→`O(W)` (knapsack) — attention au sens de parcours.
8. Reconstruire la solution (le *quoi*) exige de conserver la table complète ; le *combien* seul autorise l'optimisation d'espace.
9. Mots-clés déclencheurs : « min/max de », « nombre de façons », « est-il possible », « plus longue sous-séquence ».

---

## 7. Seeds Anki

```
Quelles sont les deux conditions pour qu'un problème se résolve en DP ?|Sous-problèmes qui se recouvrent (le même sous-problème revient) ET sous-structure optimale (la solution optimale se compose de solutions optimales de sous-problèmes). Les deux sont nécessaires.
Différence entre memoization (top-down) et tabulation (bottom-up) ?|Top-down = récursion naturelle + cache, ne calcule que les sous-problèmes atteints, risque de stack overflow. Bottom-up = tableau rempli itérativement des petits vers les grands états, pas de récursion, rolling array facile.
Quelles sont les 5 étapes de la démarche DP ?|1) définir l'état (clé de cache), 2) écrire la récurrence, 3) poser les cas de base, 4) déterminer l'ordre de remplissage, 5) optimiser la mémoire (rolling array).
Récurrence du coin change (nb minimum de pièces) ?|dp[m] = min sur chaque pièce c de (dp[m - c] + 1), avec dp[0] = 0 et dp[m<0] = Infinity (branche morte). Complexité O(montant × nbPièces).
Récurrence de la LCS de deux chaînes a et b ?|Si a[i-1] === b[j-1] : dp[i][j] = dp[i-1][j-1] + 1. Sinon : dp[i][j] = max(dp[i-1][j], dp[i][j-1]). Cas de base : ligne 0 et colonne 0 = 0.
Dans le knapsack 0/1, quel est l'état et la récurrence ?|État dp[i][w] = valeur max avec les i premiers objets et capacité w. Récurrence : dp[i][w] = max(dp[i-1][w] (ne pas prendre), dp[i-1][w-poids] + valeur (prendre si poids <= w)).
Pourquoi parcourt-on le tableau 1D du knapsack de droite à gauche ?|Pour que dp[w - poids] soit encore la valeur de la ligne précédente (objet non encore repris). De gauche à droite, on autoriserait à reprendre l'objet, ce qui donnerait le knapsack non borné, pas le 0/1.
Qu'est-ce qu'un rolling array et quand l'utiliser ?|Ne garder que les quelques lignes/valeurs dont dépend l'état courant au lieu de tout le tableau. Fibonacci : 2 variables donnent O(1). Knapsack : 1 ligne donne O(W). À éviter si on doit reconstruire la solution (il faut alors la table complète).
Comment reconnaît-on un problème DP dans un énoncé ?|Mots-clés : « minimum/maximum de », « nombre de façons de », « est-il possible de », « plus longue/courte sous-séquence ». Plus : des choix successifs avec des sous-problèmes qui reviennent. Réflexe : poser la récursion et chercher un nœud dupliqué dans l'arbre.
```

---

## Pont vers le lab

> Lab associé : `05-algorithms/labs/lab-09-dynamic-programming/README.md`. Implémenter coin change (min + reconstruction), LCS avec score de similarité, et knapsack 0/1 de zéro — récursion naïve → memoization → tabulation, corrigé complet inline + variante J+30 + application TribuZen.
