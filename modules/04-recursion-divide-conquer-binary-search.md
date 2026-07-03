---
titre: Récursion, diviser-pour-régner et recherche binaire
cours: 05-algorithms
notions: [anatomie d'une récursion, cas de base et cas récursif, call stack, récursion vs itération, stack overflow, tail call non optimisé en V8, diviser-pour-régner, théorème maître intuitif, recherche binaire sur tableau trié, lower bound et upper bound, binary search on answer, pièges mid overflow et conditions de boucle]
outcomes: [écrire une fonction récursive correcte avec cas de base et convergence, appliquer diviser-pour-régner et estimer sa complexité, implémenter une recherche binaire et ses variantes de bornes sans off-by-one]
prerequis: [03-stacks-queues-listes]
next: 05-tris-partition-heaps
libs: []
tribuzen: recherche binaire d'un membre dans une liste triée, agrégation divide & conquer de stats familiales, binary-search-on-answer d'un seuil
last-reviewed: 2026-07
---

# Récursion, diviser-pour-régner et recherche binaire

> **Outcomes — tu sauras FAIRE :** écrire une fonction récursive correcte (cas de base + convergence), appliquer le paradigme diviser-pour-régner et estimer sa complexité, implémenter une recherche binaire et ses variantes de bornes sans te tromper d'une case.
> **Difficulté :** :star::star::star:

## 1. Cas concret d'abord

Tu intègres l'admin TribuZen. La liste des membres d'une famille est **déjà triée par identifiant** (renvoyée triée par l'API). Un collègue a écrit ceci pour retrouver un membre au clic :

```ts
// membersLookup.ts — AVANT
function findMember(members: Member[], id: number): Member | null {
  for (const m of members) {       // parcours linéaire
    if (m.id === id) return m;
  }
  return null;
}
```

Ça marche. Mais sur les grosses familles synchronisées (plusieurs milliers de membres, et un lookup à chaque survol de ligne dans un tableau virtualisé), ce `O(n)` répété devient le point chaud du profiler.

**Le tableau est trié.** On jette donc de l'information à chaque appel : on relit des éléments dont on sait déjà qu'ils sont trop petits. Une recherche binaire fait le même travail en `O(log n)` — 4 000 membres, ça passe de ~4 000 comparaisons à ~12.

Ce module te donne trois outils imbriqués : la **pensée récursive** (découper un problème en lui-même en plus petit), le **paradigme diviser-pour-régner** (dont la recherche binaire est le cas le plus simple), et la **recherche binaire** avec ses variantes de bornes — celles qui font vraiment la différence en entretien et en prod.

---

## 2. Théorie complète, concise

### 2.1 Anatomie d'une récursion

Une fonction récursive s'appelle elle-même sur une version **plus petite** du problème. Elle a toujours exactement deux morceaux :

1. **Le cas de base** — la condition d'arrêt, résolue sans récursion. Sans lui : récursion infinie → stack overflow.
2. **Le cas récursif** — on réduit le problème et on rappelle la fonction, en se **rapprochant** du cas de base (convergence).

```ts
function factorielle(n: number): number {
  if (n <= 1) return 1;              // cas de base
  return n * factorielle(n - 1);     // cas récursif : n → n-1 (converge vers 1)
}
```

La convergence est la garantie que tu **atteindras** le cas de base. Un cas récursif qui fait `n - 2` sur un `n` impair ne converge jamais vers `0` : il saute par-dessus.

### 2.2 La call stack (rappel du cours JS runtime)

Chaque appel de fonction empile une **frame** (stack frame) sur la call stack : paramètres, variables locales, adresse de retour. Une frame ne se dépile que quand la fonction `return`. Or un appel récursif se produit **avant** le `return` du parent : les frames s'empilent donc jusqu'au cas de base, puis se dépilent en remontant.

```
factorielle(4) déroulé — la stack grandit puis rétrécit :

  push factorielle(4)   → attend factorielle(3)
  push factorielle(3)   → attend factorielle(2)
  push factorielle(2)   → attend factorielle(1)
  push factorielle(1)   → cas de base, renvoie 1   ◄── profondeur max
  pop  → 2 * 1  = 2
  pop  → 3 * 2  = 6
  pop  → 4 * 6  = 24
```

C'est exactement la stack du module 01 (JS runtime). La récursion n'est pas magique : c'est la call stack qui fait le travail de mémorisation des états intermédiaires. Le nombre de frames empilées **en même temps** = la profondeur de récursion = le coût **mémoire** `O(profondeur)`.

### 2.3 Récursion vs itération

Toute récursion peut se réécrire en boucle (avec, au besoin, une stack explicite). Le choix est une question de **clarté**, pas de possibilité.

```ts
// Récursion naturelle : parcours d'arbre (DOM, catégories, AST)
function compterNoeuds(node: UINode): number {
  let total = 1;
  for (const enfant of node.children ?? []) total += compterNoeuds(enfant);
  return total;
}

// Itération naturelle : accumulation linéaire — la récursion n'apporte rien ici
function somme(arr: number[]): number {
  let acc = 0;
  for (const x of arr) acc += x;
  return acc;
}
```

Règle : **récursion** quand la structure est elle-même récursive (arbres, graphes, sous-problèmes qui se divisent). **Itération** pour un simple parcours linéaire ou une accumulation.

### 2.4 Stack overflow et tail calls (non optimisés en V8)

La call stack a une taille limitée (~10 000–15 000 frames selon le moteur). Une récursion trop profonde la fait déborder :

```ts
function profond(n: number): number {
  if (n === 0) return 0;
  return 1 + profond(n - 1);
}
profond(100_000); // ❌ RangeError: Maximum call stack size exceeded
```

Un **tail call** (appel terminal) est un appel récursif qui est la **toute dernière** opération de la fonction — rien ne reste à faire au retour. En théorie, le moteur pourrait réutiliser la frame courante au lieu d'en empiler une nouvelle (**Tail Call Optimization**, TCO). C'est dans la spec ES2015.

```ts
// Forme tail-recursive : l'accumulateur porte le résultat, l'appel est terminal
function factTail(n: number, acc = 1): number {
  if (n <= 1) return acc;
  return factTail(n - 1, n * acc); // dernière opération = l'appel lui-même
}
```

> **À retenir absolument :** V8 (Chrome, Node) **n'implémente pas** la TCO. Seul JavaScriptCore (Safari) l'a fait. Donc en Node, `factTail(100_000)` déborde **quand même**. Ne compte jamais sur la TCO en JS : pour une récursion profonde, **convertis en boucle** ou utilise un trampoline (une boucle qui appelle des fonctions renvoyant la prochaine étape).

### 2.5 Diviser-pour-régner (le paradigme)

Diviser-pour-régner (*divide & conquer*) est une famille de récursions en trois temps :

```
1. DIVISER   → couper le problème en sous-problèmes indépendants (souvent 2 moitiés)
2. RÉGNER    → résoudre chaque sous-problème récursivement
3. COMBINER  → fusionner les sous-solutions en la solution globale
```

Le merge sort (module 05) en est l'archétype : couper en deux, trier chaque moitié, fusionner. La recherche binaire en est la version **dégénérée** : on divise en deux mais on ne garde **qu'une** moitié — pas de phase « combiner ».

### 2.6 Le théorème maître (survol intuitif)

Comment estimer la complexité d'un divide & conquer sans dérouler à la main ? On écrit la récurrence `T(n) = a·T(n/b) + f(n)` :

- `a` = nombre de sous-appels,
- `b` = facteur de réduction de la taille,
- `f(n)` = coût du découpage + de la combinaison à ce niveau.

L'intuition (pas la preuve) : compare le **travail de combinaison** `f(n)` au **travail des feuilles** `n^(log_b a)`.

| Cas | Qui domine | Résultat | Exemple |
|---|---|---|---|
| Feuilles dominent | `f(n)` petit | `O(n^(log_b a))` | multiplication de matrices |
| Équilibre | `f(n) ≈ n^(log_b a)` | `O(n^(log_b a) · log n)` | **merge sort** : `2T(n/2)+O(n)` → `O(n log n)` |
| Racine domine | `f(n)` gros | `O(f(n))` | découpage coûteux |

Pour la **recherche binaire** : `T(n) = 1·T(n/2) + O(1)`. Un seul sous-appel, moitié de taille, travail constant → `O(log n)`. C'est la raison mathématique du gain du cas concret.

### 2.7 Recherche binaire sur tableau trié

Prérequis **absolu** : le tableau doit être **trié** (ou l'espace de recherche ordonné). On garde deux bornes `lo`/`hi`, on regarde le milieu, on élimine la moitié impossible.

```ts
// Recherche exacte : renvoie l'index de target, ou -1
function binarySearch(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length - 1;          // intervalle FERMÉ [lo, hi]

  while (lo <= hi) {                 // <= car hi est inclus
    const mid = lo + Math.floor((hi - lo) / 2); // anti-overflow (voir §4)
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;   // cible à droite
    else hi = mid - 1;                      // cible à gauche
  }
  return -1;
}
```

Le couple `(hi = length - 1, while lo <= hi)` définit un **intervalle fermé** `[lo, hi]`. C'est le style « recherche exacte ». Les variantes de bornes utilisent un **intervalle demi-ouvert**, ci-dessous — et c'est là que 90 % des bugs se logent.

### 2.8 Variantes de bornes — lower bound / upper bound

Souvent, la cible peut apparaître **plusieurs fois**, ou pas du tout, et tu veux une **frontière** plutôt qu'une position exacte. Deux réponses canoniques :

- **`lowerBound`** = premier index `i` tel que `arr[i] >= target` (où insérer target à gauche des égaux).
- **`upperBound`** = premier index `i` tel que `arr[i] > target` (juste après le dernier égal).

```ts
// lower bound — intervalle demi-ouvert [lo, hi), hi = length, while lo < hi
function lowerBound(arr: number[], target: number): number {
  let lo = 0, hi = arr.length;          // hi EXCLU
  while (lo < hi) {                       // < car hi n'est pas un index candidat
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] < target) lo = mid + 1;  // trop petit → strictement à droite
    else hi = mid;                         // arr[mid] >= target → mid reste candidat
  }
  return lo; // premier i où arr[i] >= target (peut valoir arr.length)
}

// upper bound — même squelette, seule la comparaison change (<= au lieu de <)
function upperBound(arr: number[], target: number): number {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] <= target) lo = mid + 1; // <= : on pousse au-delà des égaux
    else hi = mid;
  }
  return lo; // premier i où arr[i] > target
}
```

**Le seul changement entre les deux est `<` vs `<=`.** Mémorise le squelette demi-ouvert (`hi = length`, `while lo < hi`, `hi = mid`, `lo = mid + 1`) : il est plus robuste que le style fermé car il ne peut pas boucler à l'infini tant que `hi = mid` fait strictement rétrécir l'intervalle.

Deux usages directs :

```ts
// Compter les occurrences d'une valeur dans un tableau trié — O(log n)
function countOccurrences(arr: number[], target: number): number {
  return upperBound(arr, target) - lowerBound(arr, target);
}

// Le "search range" LeetCode : [premier, dernier] index de target
function searchRange(arr: number[], target: number): [number, number] {
  const lo = lowerBound(arr, target);
  if (lo === arr.length || arr[lo] !== target) return [-1, -1]; // absent
  return [lo, upperBound(arr, target) - 1];
}

const sorted = [1, 2, 2, 2, 3, 4, 5];
countOccurrences(sorted, 2); // 3
searchRange(sorted, 2);      // [1, 3]
searchRange(sorted, 9);      // [-1, -1]
```

### 2.9 Binary search on answer

La percée conceptuelle : **la recherche binaire ne dépend pas d'un tableau**. Elle marche sur **tout espace ordonné où une condition est monotone** : `false, false, …, false, true, true, …, true`. On cherche la frontière où ça bascule.

Au lieu de chercher *dans* les données, on **binaire-cherche la réponse elle-même** : on devine une valeur candidate `x`, on répond en `O(n)` à « est-ce que `x` est faisable ? », et la monotonie (« si `x` marche, tout `≥ x` marche ») permet de dichotomiser sur `x`.

```ts
// Racine carrée entière : plus grand x tel que x*x <= n
function intSqrt(n: number): number {
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = lo + Math.ceil((hi - lo) / 2); // ceil : on cherche le PLUS GRAND x valide
    if (mid * mid <= n) lo = mid;              // mid faisable → candidat, on garde
    else hi = mid - 1;                          // trop grand
  }
  return lo;
}
intSqrt(16); // 4
intSqrt(20); // 4  (4²=16 ≤ 20 < 25=5²)

// Capacité minimale d'un camion pour livrer tous les colis en `days` jours.
// Le prédicat canDeliver(cap) est monotone : plus la capacité est grande, plus c'est faisable.
function minCapacity(weights: number[], days: number): number {
  let lo = Math.max(...weights);              // au moins le plus gros colis
  let hi = weights.reduce((s, w) => s + w, 0); // tout en un jour
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (canDeliver(weights, days, mid)) hi = mid; // faisable → on tente plus petit
    else lo = mid + 1;                             // infaisable → il faut plus grand
  }
  return lo; // plus petite capacité faisable
}

function canDeliver(weights: number[], days: number, cap: number): boolean {
  let load = 0, need = 1;
  for (const w of weights) {
    if (load + w > cap) { need++; load = 0; }
    load += w;
  }
  return need <= days;
}
minCapacity([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5); // 15
```

Le squelette est identique à `lowerBound` : on cherche le premier `x` où le prédicat devient vrai. Reconnaître un problème d'optimisation comme un « binary search on answer » est l'un des réflexes les plus rentables du répertoire algo.

---

## 3. Worked examples

### Exemple 1 — Dérouler `lowerBound` pas à pas

`lowerBound([1, 2, 2, 2, 3], 2)` — on cherche le **premier** index où `arr[i] >= 2`.

```
Départ : lo=0, hi=5 (length), intervalle [0,5)

Itér 1 : mid = 0 + (5-0)/2 = 2 ; arr[2]=2 ; 2 < 2 ? non → hi = mid = 2
Itér 2 : mid = 0 + (2-0)/2 = 1 ; arr[1]=2 ; 2 < 2 ? non → hi = mid = 1
Itér 3 : mid = 0 + (1-0)/2 = 0 ; arr[0]=1 ; 1 < 2 ? oui → lo = mid + 1 = 1
Sortie : lo == hi == 1 → renvoie 1
```

Index 1 = le premier `2`. Vérifie la cohérence : `upperBound(..., 2)` renverrait 4 (après le dernier 2), donc `countOccurrences = 4 - 1 = 3`. ✓

**Ce qu'il faut voir :** l'intervalle rétrécit **strictement** à chaque tour (`hi = mid` avec `mid < hi`, ou `lo = mid + 1`). C'est la garantie anti-boucle-infinie du style demi-ouvert.

### Exemple 2 — Diviser-pour-régner : agréger des stats familiales

Tu veux le total des points de sérénité d'une grande famille TribuZen, calculé en divide & conquer (préfiguration d'un calcul parallélisable / segment tree du module 06).

```ts
interface Member { id: number; serenityPoints: number }

// DIVISER en deux moitiés, RÉGNER sur chacune, COMBINER par addition.
// T(n) = 2·T(n/2) + O(1)  → par le théorème maître, cas d'équilibre dégénéré → O(n).
function sumSerenity(members: Member[], lo = 0, hi = members.length - 1): number {
  // Cas de base : segment vide ou singleton
  if (lo > hi) return 0;
  if (lo === hi) return members[lo].serenityPoints;

  const mid = lo + Math.floor((hi - lo) / 2); // DIVISER
  const left = sumSerenity(members, lo, mid);      // RÉGNER (gauche)
  const right = sumSerenity(members, mid + 1, hi); // RÉGNER (droite)
  return left + right;                              // COMBINER
}

const famille: Member[] = [
  { id: 1, serenityPoints: 12 },
  { id: 2, serenityPoints: 7 },
  { id: 3, serenityPoints: 20 },
  { id: 4, serenityPoints: 5 },
];
sumSerenity(famille); // 44
```

Ici l'addition est associative, donc l'ordre de combinaison n'importe pas — c'est **exactement** ce qui rend un agrégat parallélisable (chaque moitié pourrait tourner sur un worker séparé). La profondeur de récursion est `O(log n)`, donc la mémoire stack aussi.

---

## 4. Pièges & misconceptions

### PIÈGE #1 — `mid` overflow / division non entière

```ts
// ❌ En JS ça ne "déborde" pas (Number est un flottant 64 bits) mais (lo+hi) peut
//    perdre en précision au-delà de 2^53, et surtout ce code est faux ailleurs (C/Java overflow).
const mid = (lo + hi) / 2;         // + oubli du Math.floor → index fractionnaire !

// ✅ Idiome universel, sûr partout, et entier :
const mid = lo + Math.floor((hi - lo) / 2);
```

`(hi - lo)` ne peut pas déborder (c'est plus petit que `hi`), et `lo + …` reste dans les bornes. Prends cette forme comme réflexe même en JS : c'est celle qu'on attend en entretien.

### PIÈGE #2 — Mélanger le style fermé et le style demi-ouvert

```ts
// ❌ hi = length - 1 (fermé) MAIS hi = mid (demi-ouvert) → off-by-one / boucle infinie
let lo = 0, hi = arr.length - 1;
while (lo < hi) {
  const mid = lo + Math.floor((hi - lo) / 2);
  if (arr[mid] < target) lo = mid + 1;
  else hi = mid; // incohérent avec hi = length - 1
}
```

Choisis **un** style et garde-le entier :
- **Fermé** `[lo, hi]` : `hi = length - 1`, `while lo <= hi`, on écrit `hi = mid - 1` / `lo = mid + 1`.
- **Demi-ouvert** `[lo, hi)` : `hi = length`, `while lo < hi`, on écrit `hi = mid` / `lo = mid + 1`.

Pour les bornes (lower/upper) et le binary-search-on-answer, prends **toujours** le demi-ouvert : il est plus dur à casser.

### PIÈGE #3 — Boucle infinie quand l'intervalle ne rétrécit pas

```ts
// ❌ avec lo < hi et lo = mid (au lieu de mid+1), si mid == lo l'intervalle stagne
while (lo < hi) {
  const mid = lo + Math.floor((hi - lo) / 2); // arrondi vers le bas → mid peut == lo
  if (cond(mid)) lo = mid;  // 🔁 lo ne bouge pas quand mid == lo → boucle infinie
  else hi = mid - 1;
}
// ✅ Si tu dois faire lo = mid (chercher le PLUS GRAND valide), arrondis vers le HAUT :
const mid = lo + Math.ceil((hi - lo) / 2); // biaise mid vers hi → progression garantie
```

Règle mnémonique : **`lo = mid` exige `Math.ceil`**, **`hi = mid` va avec `Math.floor`**. Sinon un des deux côtés stagne quand l'intervalle est de taille 2.

### PIÈGE #4 — Recherche binaire sur données non triées

La dichotomie suppose la **monotonie**. Sur un tableau non trié, elle renvoie n'importe quoi (pas une erreur — un faux négatif silencieux, le pire des bugs).

```ts
binarySearch([3, 1, 2], 1); // -1 alors que 1 est présent — données non triées !
```

Avant toute recherche binaire : **audite l'invariant de tri**. Si les données arrivent d'une API « triée par X », vérifie que c'est bien le champ sur lequel tu cherches.

### PIÈGE #5 — Compter sur la TCO en Node

```ts
// ❌ "C'est tail-recursive, donc pas de stack overflow" — FAUX en V8 (Node/Chrome)
factTail(200_000); // RangeError malgré la forme terminale
```

V8 n'optimise pas les tail calls. Récursion profonde en Node = convertis en boucle ou trampoline. Ne suppose la TCO nulle part sauf test explicite sur le moteur cible.

---

## 5. Ancrage TribuZen

Les trois formes de dichotomie de ce module correspondent à trois besoins réels de l'app.

**Recherche binaire d'un membre (liste triée).** L'API renvoie les membres d'une famille triés par `id`. Le `findMember` linéaire du cas concret devient un `binarySearch` `O(log n)` dans `src/features/members/lookup.ts`. Utilisé à chaque survol de ligne dans la table virtualisée de l'admin — c'est le point chaud du cas concret.

**Diviser-pour-régner sur une agrégation de stats familiales.** Le tableau de bord d'une famille agrège des scores (points de sérénité, activités complétées) sur potentiellement des milliers de membres. `sumSerenity` (Exemple 2) est la forme divide & conquer, associative donc parallélisable — préfiguration du segment tree (module 06) quand les stats deviendront incrémentales (mises à jour en `O(log n)` plutôt que recalcul complet).

**Binary-search-on-answer pour un seuil.** Fonctionnalité « quel seuil de points débloque au plus 20 % des familles le badge Or ? ». On cherche le plus petit seuil `s` tel que `nbFamillesAuDessus(s) <= 0.2 * total`. Le prédicat est monotone en `s` → binary search on answer sur `s` dans `src/features/badges/threshold.ts`, au lieu de balayer toutes les valeurs possibles.

Fichiers cibles dans `smaurier/tribuzen` :

```
tribuzen/src/features/
  members/
    lookup.ts        ← binarySearch + lowerBound (membre par id trié)
  stats/
    aggregate.ts     ← sumSerenity (divide & conquer associatif)
  badges/
    threshold.ts     ← binarySearchOnAnswer (seuil monotone)
```

---

## 6. Points clés

1. Une récursion = cas de base (arrêt) + cas récursif qui **converge** vers le cas de base ; sans convergence, stack overflow.
2. La call stack empile une frame par appel non terminé ; la profondeur de récursion = coût mémoire `O(profondeur)`.
3. Récursion pour les structures récursives (arbres), itération pour les parcours linéaires — c'est un choix de clarté.
4. V8 (Node/Chrome) **n'optimise pas** les tail calls : une récursion profonde déborde même sous forme terminale → convertir en boucle.
5. Diviser-pour-régner = diviser + régner + combiner ; le théorème maître (`T(n)=a·T(n/b)+f(n)`) estime la complexité par comparaison feuilles vs combinaison.
6. Recherche binaire = `O(log n)` sur tout espace **ordonné à condition monotone**, pas seulement un tableau.
7. Style fermé `[lo,hi]` (`hi=len-1`, `lo<=hi`, `±1`) vs demi-ouvert `[lo,hi)` (`hi=len`, `lo<hi`, `hi=mid`) — ne jamais mélanger les deux.
8. `lowerBound` (premier `>= target`) et `upperBound` (premier `> target`) ne diffèrent que par `<` vs `<=` ; leur différence = nombre d'occurrences.
9. « Binary search on answer » : dichotomiser sur la réponse via un prédicat monotone faisable/infaisable.
10. Pièges : `mid = lo + Math.floor((hi-lo)/2)` ; `lo=mid` exige `Math.ceil` ; jamais de dichotomie sur données non triées.

---

## 7. Seeds Anki

```
Quels sont les deux composants obligatoires d'une fonction récursive ?|Un cas de base (condition d'arrêt résolue sans récursion) et un cas récursif qui réduit le problème en convergeant vers le cas de base. Sans convergence vers la base → stack overflow.
Pourquoi la profondeur d'une récursion est-elle un coût mémoire ?|Chaque appel non terminé laisse une frame empilée sur la call stack (params, locales, retour). La profondeur maximale = nombre de frames simultanées = O(profondeur) en mémoire.
V8 optimise-t-il les tail calls (TCO) ?|Non. Malgré la spec ES2015, V8 (Node, Chrome) n'implémente pas la TCO — seul JavaScriptCore/Safari le fait. Une récursion terminale profonde déborde quand même en Node ; il faut convertir en boucle ou trampoline.
Quelles sont les trois étapes du paradigme diviser-pour-régner ?|Diviser (couper en sous-problèmes indépendants), régner (résoudre chaque sous-problème récursivement), combiner (fusionner les sous-solutions). Ex : merge sort. La recherche binaire est le cas dégénéré (on ne garde qu'une moitié, pas de combinaison).
Sur quoi la recherche binaire peut-elle opérer, au-delà d'un tableau trié ?|Tout espace ordonné avec une condition monotone (false…false,true…true). On cherche la frontière de bascule. C'est le principe du "binary search on answer" : dichotomiser sur une réponse candidate via un prédicat faisable/infaisable monotone.
Quelle est la différence entre lowerBound et upperBound ?|lowerBound = premier index i où arr[i] >= target ; upperBound = premier index i où arr[i] > target. Le seul changement de code est arr[mid] < target (lower) vs arr[mid] <= target (upper). Leur différence = nombre d'occurrences de target.
Comment calcule-t-on mid sans risque, et quelle est la règle ceil/floor ?|mid = lo + Math.floor((hi - lo) / 2) évite l'overflow et reste entier. Règle : si on écrit hi = mid on garde Math.floor ; si on écrit lo = mid (chercher le plus grand valide) on doit prendre Math.ceil, sinon boucle infinie sur un intervalle de taille 2.
Quel invariant faut-il auditer avant toute recherche binaire ?|Que les données sont réellement triées sur le champ recherché (monotonie). Sur des données non triées, la dichotomie renvoie un faux négatif silencieux — pas une erreur — donc le pire type de bug.
```

---

## Pont vers le lab

> Lab associé : `05-algorithms/labs/lab-04-recursion-binary-search/README.md`. Implémenter `binarySearch`, `lowerBound`/`upperBound`, un `minCapacity` (binary search on answer) et un agrégat divide & conquer, avec corrigé complet + variante J+30.
