---
titre: Complexité et raisonnement
cours: 05-algorithms
notions: [notation Big-O, bornes Omega et Theta en survol, complexité temporelle, complexité spatiale, classes de croissance (O(1) O(log n) O(n) O(n log n) O(n²) O(2^n) O(n!)), dominance du terme, analyse amortie, best/average/worst case, coût caché des méthodes de tableau, raisonner sur du code JS réel]
outcomes: [donner la complexité temps et espace d'une fonction JS en lisant son code, reconnaître les classes de croissance courantes et leur dominance, mesurer empiriquement avec performance.now et confronter la mesure à la prédiction Big-O]
prerequis: [00-prerequis-et-introduction]
next: 02-tableaux-chaines-hash-maps
libs: []
tribuzen: recherche de membre d'un endpoint TribuZen — O(n) via Array.find vs O(1) via Map, mesurée à performance.now
last-reviewed: 2026-07
---

# Complexité et raisonnement

> **Outcomes — tu sauras FAIRE :** donner la complexité temps ET espace d'une fonction JS rien qu'en lisant son code, reconnaître les classes de croissance et leur dominance, mesurer empiriquement avec `performance.now()` et confronter la mesure à la prédiction Big-O.
> **Difficulté :** :star::star:

C'est **LE module socle** du cours. Tout le reste (structures, tris, graphes, DP) se juge à l'aune du raisonnement que tu construis ici. On n'apprend pas des maths : on apprend à répondre à une seule question d'ingénieur — *« est-ce que ça tient la charge quand les données grossissent ? »*.

## 1. Cas concret d'abord

Tu reprends un endpoint de l'API TribuZen. Il répond à `GET /families/:familyId/members/lookup?email=...` : retrouver un membre par email dans une famille. Un collègue l'a écrit comme ça, et en prod il rame dès qu'une famille dépasse quelques milliers de membres agrégés.

```ts
// members.service.ts — VERSION QUI RAME
type Member = { id: string; email: string; name: string };

class MembersService {
  private members: Member[]; // chargé en mémoire au boot

  lookupByEmail(email: string): Member | undefined {
    // .find scanne le tableau du début jusqu'à trouver -> O(n)
    return this.members.find((m) => m.email === email);
  }

  // Pire : réconcilier une liste d'emails importés avec les membres existants
  matchImported(imported: { email: string }[]): Member[] {
    const matched: Member[] = [];
    for (const row of imported) {
      // .find À L'INTÉRIEUR d'une boucle -> O(n) × O(m) = O(n·m)
      const hit = this.members.find((m) => m.email === row.email);
      if (hit) matched.push(hit);
    }
    return matched;
  }
}
```

**Trois questions auxquelles ce module répond :**
1. `lookupByEmail` est en `O(n)` : sur 50 000 membres, un appel = jusqu'à 50 000 comparaisons. Acceptable ? Ça dépend — mais il faut savoir le dire.
2. `matchImported` cache un `O(n·m)` : `.find` dans une boucle. Sur un import de 10 000 lignes contre 50 000 membres = 500 millions de comparaisons. Ça, ça ne tient pas.
3. Comment le prouver par la mesure, et comment le corriger (une `Map` email→membre → `O(1)` par lookup) ?

On construit d'abord le vocabulaire, puis on revient corriger ce code en section 5 et dans le lab.

---

## 2. Théorie complète, concise

### 2.1 Le Big-O répond à « comment ça grossit », pas « combien de ms »

Le Big-O décrit le **taux de croissance** du coût quand la taille d'entrée `n` tend vers l'infini. Il ne dit rien du temps absolu. Deux algos `O(n)` peuvent avoir un facteur 10 entre eux — le Big-O ignore les constantes. Ce qu'il capture, c'est ce qui arrive quand `n` est multiplié par 10, 100, 1000.

```ts
// Ces deux fonctions sont TOUTES DEUX O(n).
// Le Big-O ne les distingue pas, même si f2 fait 3× plus de travail par tour.
function f1(arr: number[]): number {
  let s = 0;
  for (const x of arr) s += x; // 1 opération / élément
  return s;
}
function f2(arr: number[]): number {
  let s = 0;
  for (const x of arr) s += x * x + 2 * x - 1; // 3-4 opérations / élément
  return s;
}
// O(3n) = O(n). Les constantes multiplicatives disparaissent.
```

### 2.2 Big-O, Omega, Theta (Ω, Θ en survol)

Trois bornes, souvent confondues. En pratique quotidienne on dit « Big-O » pour tout, mais la distinction éclaire best/worst case.

| Notation | Sens | Analogie |
|---|---|---|
| `O(f)` (Big-O) | **borne haute** : le coût ne dépasse jamais `f` (à une constante près) | « au pire, pas plus lent que `f` » |
| `Ω(f)` (Omega) | **borne basse** : le coût est au moins `f` | « au mieux, pas plus rapide que `f` » |
| `Θ(f)` (Theta) | **borne serrée** : `O(f)` ET `Ω(f)` à la fois | « croît exactement comme `f` » |

Exemple : `arr.includes(x)` est `O(n)` (pire cas : absent), `Ω(1)` (meilleur cas : premier élément), et il n'y a pas de `Θ` unique car best et worst diffèrent. Une boucle qui parcourt *toujours* tout le tableau (ex. `sum`) est `Θ(n)` : même coût quelle que soit l'entrée. Dans le cours on écrira `O`, en gardant en tête que pour beaucoup d'algos c'est en fait un `Θ`.

### 2.3 Les classes de croissance à reconnaître

Apprends-les par cœur, de la plus rapide à la plus lente :

| Classe | Nom | Ce qui la produit | Exemple JS |
|---|---|---|---|
| `O(1)` | constante | accès direct, pas de boucle sur `n` | `arr[i]`, `map.get(k)`, `set.has(x)` |
| `O(log n)` | logarithmique | on divise l'espace par 2 à chaque tour | binary search sur tableau trié |
| `O(n)` | linéaire | un passage sur les données | `arr.find`, `arr.map`, un scan |
| `O(n log n)` | quasi-linéaire | tri comparatif optimal | `arr.sort()` (TimSort) |
| `O(n²)` | quadratique | deux boucles imbriquées sur `n` | comparer toutes les paires |
| `O(2^n)` | exponentielle | récursion à 2 branches non élaguée | sous-ensembles, Fibonacci naïf |
| `O(n!)` | factorielle | énumérer toutes les permutations | brute force du voyageur de commerce |

Repère mental de l'échelle. En supposant ~1e8 opérations/seconde en JS :

```
n = 10        n = 1 000       n = 1 000 000
O(1)      1         1               1            -> instantané partout
O(log n)  ~3        ~10             ~20          -> instantané partout
O(n)      10        1 000           1 000 000    -> ~10 ms à 1M
O(n log n)~33       ~10 000         ~20 000 000  -> ~0.2 s à 1M
O(n²)     100       1 000 000       1e12         -> ~3 h à 1M  (mur)
O(2^n)    1 024     ~1e301          ingérable    -> mur dès n~40
O(n!)     3.6e6     ingérable       ingérable    -> mur dès n~12
```

Lecture clé : `O(n²)` tient jusqu'à ~10 000, mur au-delà. `O(2^n)` et `O(n!)` sont des murs quasi immédiats — ils imposent une meilleure approche (DP, mémoïsation, greedy) dès que `n` dépasse quelques dizaines.

### 2.4 Complexité spatiale — le coût MÉMOIRE, à analyser toujours

La complexité spatiale mesure la mémoire **supplémentaire** allouée (hors entrée). On l'analyse avec les mêmes classes. Deux algos de même complexité temporelle peuvent avoir des coûts mémoire opposés.

```ts
// O(1) espace — in-place, on ne crée rien de proportionnel à n
function reverseInPlace(arr: number[]): void {
  let i = 0, j = arr.length - 1;
  while (i < j) {
    [arr[i], arr[j]] = [arr[j], arr[i]]; // swap, 0 allocation liée à n
    i++; j--;
  }
}

// O(n) espace — on alloue une structure proportionnelle à l'entrée
function countByEmailDomain(members: { email: string }[]): Map<string, number> {
  const freq = new Map<string, number>(); // grossit avec le nombre de domaines
  for (const m of members) {
    const domain = m.email.split('@')[1] ?? '';
    freq.set(domain, (freq.get(domain) ?? 0) + 1);
  }
  return freq; // O(n) temps ET O(n) espace au pire
}
```

**Trade-off temps/mémoire** — le compromis le plus fréquent en ingénierie. Notre endpoint TribuZen l'illustre : on passe de `O(n)` par lookup à `O(1)` en payant une `Map` de `O(n)` en mémoire. On échange de la RAM contre de la vitesse. Frontend mobile → la mémoire est comptée. Backend → le temps de réponse (SLA) prime. Le bon choix dépend du contexte, pas d'une règle absolue.

### 2.5 Dominance : on garde le terme qui explose, on jette les constantes

Deux règles de simplification, appliquées dans cet ordre :

```ts
// Règle 1 — les constantes multiplicatives disparaissent : O(2n) -> O(n), O(500) -> O(1)
// Règle 2 — seul le terme dominant survit quand n -> l'infini

// Séquentiel = on ADDITIONNE, puis on garde le dominant :
function process(arr: number[]): number[] {
  arr.sort((a, b) => a - b);        // O(n log n)
  const uniq = [...new Set(arr)];   // O(n)
  return uniq.filter((x) => x > 0); // O(n)
}
// O(n log n + n + n) = O(n log n)  <- n log n domine n

// Imbriqué = on MULTIPLIE :
function pairs(arr: number[]): void {
  for (let i = 0; i < arr.length; i++)      // n
    for (let j = i + 1; j < arr.length; j++) // ~n/2
      void [arr[i], arr[j]];
}
// n × n/2 = n²/2 -> O(n²)  (la constante 1/2 disparaît)
```

Pourquoi c'est légitime : à `n = 1e6`, `n²` vaut 1e12 et `n` vaut 1e6 — le second est un million de fois négligeable. Garder `+ n` serait du bruit.

### 2.6 Analyse amortie — le coût MOYEN sur une séquence d'opérations

Certaines opérations sont *parfois* chères mais *en moyenne* bon marché. On ne regarde pas une opération isolée mais le coût total réparti sur toute la séquence.

```ts
// Array.push -> O(1) AMORTI
// V8 stocke le tableau dans un buffer de capacité fixe.
// - 99 % du temps : il reste de la place -> écriture O(1)
// - de temps en temps : buffer plein -> V8 alloue un buffer 2× plus grand
//   et RECOPIE tout (O(n) ponctuel), puis on repart pour longtemps
const a: number[] = [];
for (let i = 0; i < 1_000_000; i++) a.push(i);
// Coût total des redimensionnements : n + n/2 + n/4 + ... < 2n = O(n)
// Réparti sur n push -> O(1) AMORTI par push.
```

L'analogie du doublement : chaque recopie coûte cher, mais elle achète le double d'espace, donc les recopies s'espacent exponentiellement. La somme de la série géométrique reste `O(n)`. Même mécanique pour `Map.set` / `Set.add` : le rehashing occasionnel est absorbé par les milliers d'insertions `O(1)` qui l'entourent. « Amorti » ≠ « moyen sur des entrées aléatoires » (ça, c'est *average case*, section suivante) : l'amorti est une garantie déterministe sur une *séquence* d'opérations.

### 2.7 Best / average / worst case

Le même algo peut avoir trois complexités selon l'entrée :

```ts
// arr.includes(x) sur un tableau de n éléments :
// - best  (Ω) : x est en position 0            -> O(1)
// - avg       : x est au milieu en moyenne      -> O(n/2) = O(n)
// - worst (O) : x est en dernier OU absent       -> O(n)
```

Convention : **on annonce le pire cas** sauf mention contraire. C'est la garantie la plus sûre pour un SLA (« jamais pire que ça »). Contre-exemple classique où l'average compte : le quicksort est `O(n log n)` en moyenne mais `O(n²)` au pire — on l'utilise quand même car le pire cas est rare et évitable (pivot aléatoire). Choisir worst vs average dépend de l'enjeu : rate-limiting → worst ; ranking d'affichage → average suffit.

### 2.8 Raisonner sur du code JS réel : la méthode

Un algorithme pour lire n'importe quelle fonction :

1. **Repérer les boucles sur `n`.** Une boucle → `×n`. Deux imbriquées sur `n` → `×n²`. Une boucle qui divise l'indice par 2 (`i *= 2`, `hi = mid`) → `×log n`.
2. **Traquer les méthodes de tableau au coût caché.** Elles ressemblent à `O(1)` mais ne le sont pas :

```ts
const arr = [/* n éléments */];
arr.includes(x);   // O(n) — scan
arr.indexOf(x);    // O(n) — scan
arr.find(fn);      // O(n) — scan avec prédicat
arr.filter(fn);    // O(n)
arr.map(fn);       // O(n)
arr.sort(cmp);     // O(n log n)
arr.unshift(x);    // O(n) — décale tout vers la droite
arr.shift();       // O(n)
arr.splice(i, 1);  // O(n) — décale après i
arr.push(x);       // O(1) amorti
arr.pop();         // O(1)
[...arr];          // O(n) — copie complète

const m = new Map();
m.get(k); m.set(k, v); m.has(k); // O(1) amorti chacun
const s = new Set();
s.has(x); s.add(x);              // O(1) amorti chacun
```

3. **Additionner le séquentiel, multiplier l'imbriqué, garder le dominant.**
4. **Le piège n°1 : une méthode `O(n)` DANS une boucle `O(n)` = `O(n²)`.** `arr.includes` / `arr.find` / `arr.indexOf` dans un `for` sont la cause n°1 de lenteurs invisibles en revue de code.

```ts
// Ça a l'air d'une simple boucle... mais includes est O(n) -> O(n²)
function dedupeSlow(arr: string[]): string[] {
  const out: string[] = [];
  for (const x of arr) {         // O(n)
    if (!out.includes(x)) out.push(x); // O(n) caché -> total O(n²)
  }
  return out;
}
// Correctif O(n) : un Set en lookup O(1)
function dedupeFast(arr: string[]): string[] {
  return [...new Set(arr)]; // O(n) temps, O(n) espace
}
```

---

## 3. Worked examples

### Exemple 1 — Analyser `matchImported` pas à pas

On reprend la fonction du cas concret et on la lit à la méthode 2.8.

```ts
function matchImported(members: Member[], imported: { email: string }[]): Member[] {
  const matched: Member[] = [];
  for (const row of imported) {                       // (A) boucle sur m = imported.length
    const hit = members.find((mm) => mm.email === row.email); // (B) .find sur n = members.length -> O(n)
    if (hit) matched.push(hit);                       // (C) push O(1) amorti
  }
  return matched;
}
```

Lecture :
- (A) est une boucle sur `m` éléments → facteur `×m`.
- (B) `members.find` est un scan `O(n)`, exécuté **à chaque tour** de (A) → `m × n`.
- (C) `push` est `O(1)` amorti, négligeable devant (B).
- **Temps total : `O(m·n)`.** Si `m ≈ n`, c'est `O(n²)`.
- **Espace : `O(k)`** où `k` = nombre de correspondances (`matched`), au pire `O(m)`.

Réécriture en `O(n + m)` avec une `Map` d'index :

```ts
function matchImportedFast(members: Member[], imported: { email: string }[]): Member[] {
  // Étape 1 — indexer : O(n) temps, O(n) espace
  const byEmail = new Map<string, Member>();
  for (const mm of members) byEmail.set(mm.email, mm);

  // Étape 2 — scanner l'import avec des lookups O(1) : O(m)
  const matched: Member[] = [];
  for (const row of imported) {
    const hit = byEmail.get(row.email); // O(1) amorti — plus de scan
    if (hit) matched.push(hit);
  }
  return matched;
}
// Temps : O(n) + O(m) = O(n + m).  Espace : O(n) pour l'index.
// On a payé O(n) de RAM pour supprimer un facteur n de temps.
```

À `n = m = 50 000` : de `2.5e9` comparaisons à `1e5` opérations — un facteur ~25 000.

### Exemple 2 — Trois fonctions, quelle complexité ? (avec fading)

Donne la complexité temps et espace de chacune avant de lire la réponse.

```ts
// (1)
function g1(n: number): number {
  let count = 0;
  for (let i = 1; i < n; i *= 2) count++; // i : 1,2,4,8,... jusqu'à n
  return count;
}

// (2)
function g2(arr: number[]): number[][] {
  const res: number[][] = [];
  for (let i = 0; i < arr.length; i++)
    for (let j = 0; j < arr.length; j++)
      res.push([arr[i], arr[j]]);
  return res;
}

// (3)
function g3(arr: number[], target: number): boolean {
  const seen = new Set<number>();
  for (const x of arr) {
    if (seen.has(target - x)) return true; // lookup O(1)
    seen.add(x);
  }
  return false;
}
```

Réponses :
- **(1)** `i` double à chaque tour → nombre de tours = `log2(n)`. **Temps `O(log n)`, espace `O(1)`.**
- **(2)** double boucle sur `arr.length` → `n²` tours ; `res` contient `n²` paires. **Temps `O(n²)`, espace `O(n²)`.** (Ici l'espace n'est pas négligeable — le résultat lui-même explose.)
- **(3)** un seul passage, `has`/`add` en `O(1)` amorti ; `seen` grossit jusqu'à `n`. **Temps `O(n)`, espace `O(n)`.** C'est le pattern « two-sum » : la `Map`/`Set` transforme une double boucle `O(n²)` en scan `O(n)`.

---

## 4. Pièges & misconceptions

### PIÈGE #1 — Croire que Big-O = temps réel

Le Big-O ignore les constantes et les petites entrées. Sur `n = 30`, un `O(n²)` (900 ops) peut battre un `O(n log n)` mal codé avec de grosses constantes. **Le Big-O prédit le comportement à l'échelle, pas la milliseconde à petite taille.** N'optimise pas la complexité avant d'avoir mesuré que `n` est réellement grand.

### PIÈGE #2 — Oublier le coût caché des méthodes de tableau

```ts
// ❌ On croit lire du O(n) — c'est du O(n²)
for (const id of idsToRemove) {
  const idx = list.indexOf(id); // O(n) caché
  if (idx !== -1) list.splice(idx, 1); // O(n) caché EN PLUS
}
```

`indexOf` et `splice` sont chacun `O(n)`. Dans une boucle → `O(n²)`, voire pire. **Le correct :** construire un `Set` des ids à retirer, puis un seul `filter` → `O(n)`. Règle : dès qu'une méthode de tableau apparaît *dans* une boucle, vérifie sa complexité.

### PIÈGE #3 — Confondre amorti et moyen (average case)

L'**amorti** est une garantie déterministe sur une *séquence* d'opérations (ex. `n` push coûtent `O(n)` au total, quel que soit le scénario). L'**average case** est une espérance sur une *distribution d'entrées* (ex. quicksort `O(n log n)` en moyenne mais `O(n²)` sur une entrée adverse). `push` est `O(1)` amorti — pas « en moyenne » : il n'y a pas d'entrée qui casse la garantie.

### PIÈGE #4 — Ignorer la complexité spatiale

Deux solutions `O(n)` en temps ne se valent pas si l'une est `O(1)` en espace et l'autre `O(n)`. Sur mobile ou sur un gros dataset, allouer une `Map` de plusieurs millions d'entrées peut faire exploser la RAM ou déclencher le GC. **Toujours annoncer les deux :** « `O(n)` temps, `O(1)` espace ». Une réponse qui ne donne que le temps est incomplète.

### PIÈGE #5 — Additionner au lieu de multiplier (et l'inverse)

```ts
// Séquentiel -> ADDITION -> dominant
sort(arr);   // O(n log n)
scan(arr);   // O(n)      -> total O(n log n)

// Imbriqué -> MULTIPLICATION
for (...) {      // n
  for (...) {}   // n      -> total O(n²)
}
```

Erreur fréquente : voir deux boucles l'une après l'autre et écrire `O(n²)` (c'est `O(n)`), ou voir deux boucles imbriquées et écrire `O(2n)` (c'est `O(n²)`). Le critère : **imbriquées** (l'une dans l'autre) = `×` ; **successives** (l'une après l'autre) = `+`.

---

## 5. Ancrage TribuZen

Le cas concret d'ouverture EST l'ancrage. Dans l'API TribuZen (`smaurier/tribuzen`, backend NestJS), le `MembersService` expose une recherche de membre. Deux endpoints le sollicitent :

- `GET /families/:id/members/lookup?email=` — un lookup unitaire.
- `POST /families/:id/members/import` — réconcilier un CSV importé avec les membres existants.

**Problème mesuré :** `lookupByEmail` en `O(n)` (`Array.find`) et surtout `matchImported` en `O(n·m)` (`.find` dans une boucle). Sur les grosses familles agrégées (50 k membres), l'import timeout.

**Correctif :** indexer les membres dans une `Map<string, Member>` (email → membre) au chargement, puis servir chaque lookup en `O(1)`. C'est exactement l'Exemple 1. On paie `O(n)` de RAM pour l'index — trade-off assumé côté backend où le temps de réponse prime.

```ts
// members.service.ts — VERSION INDEXÉE
class MembersService {
  private byEmail = new Map<string, Member>();

  constructor(members: Member[]) {
    for (const m of members) this.byEmail.set(m.email, m); // O(n) une fois
  }

  lookupByEmail(email: string): Member | undefined {
    return this.byEmail.get(email); // O(1) amorti — plus de scan
  }

  matchImported(imported: { email: string }[]): Member[] {
    const out: Member[] = [];
    for (const row of imported) {
      const hit = this.byEmail.get(row.email); // O(1) -> total O(m)
      if (hit) out.push(hit);
    }
    return out;
  }
}
```

**Prouver le gain, pas le supposer** — on mesure avant/après avec `performance.now()` sur des données réalistes (voir le lab). La règle TribuZen : toute optimisation de complexité est justifiée par une mesure, jamais par intuition.

Fichiers cibles dans `smaurier/tribuzen` :
```
tribuzen/src/
  members/
    members.service.ts   <- Map d'index email->Member
    members.service.spec.ts
    bench/lookup.bench.ts <- mesure performance.now find vs Map
```

---

## 6. Points clés

1. Le Big-O décrit le **taux de croissance** quand `n` grandit, pas le temps en millisecondes ; les constantes et les petites entrées sont hors sujet.
2. `O`, `Ω`, `Θ` = borne haute (pire cas), borne basse (meilleur cas), borne serrée ; en pratique on annonce le pire cas (`O`).
3. Classes à connaître par cœur, du plus rapide au plus lent : `O(1)`, `O(log n)`, `O(n)`, `O(n log n)`, `O(n²)`, `O(2^n)`, `O(n!)`.
4. On analyse **toujours** temps ET espace ; deux solutions de même temps peuvent différer en mémoire (trade-off temps/mémoire).
5. Dominance : on garde le terme qui explose et on jette les constantes (`O(n²/2 + n)` = `O(n²)`).
6. Séquentiel = on **additionne** ; imbriqué = on **multiplie**.
7. Amorti = garantie sur une *séquence* (`push` = `O(1)` amorti) ; average case = espérance sur une *distribution* d'entrées.
8. Piège n°1 en JS : une méthode `O(n)` (`includes`/`find`/`indexOf`/`splice`) **dans** une boucle → `O(n²)` invisible ; corriger avec `Map`/`Set` en lookup `O(1)`.
9. `Array.push`/`pop` = `O(1)` (amorti) ; `unshift`/`shift`/`splice`/`includes`/`find` = `O(n)` ; `sort` = `O(n log n)` ; `Map`/`Set` get/set/has = `O(1)` amorti.
10. On mesure avec `performance.now()` (médiane, warmup, tailles réalistes) pour confirmer la prédiction — jamais deviner.

---

## 7. Seeds Anki

```
Que décrit exactement la notation Big-O ?|Le taux de croissance du coût (temps ou espace) quand la taille d'entrée n tend vers l'infini — pas le temps absolu. Les constantes multiplicatives et les petites entrées sont ignorées.
Différence entre O, Omega et Theta ?|O = borne haute (pire cas, jamais plus lent). Omega = borne basse (meilleur cas, jamais plus rapide). Theta = borne serrée, quand O et Omega coïncident (le coût croît exactement comme f).
Deux boucles imbriquées vs deux boucles successives : quelle complexité ?|Imbriquées (l'une dans l'autre) = on MULTIPLIE -> O(n²). Successives (l'une après l'autre) = on ADDITIONNE puis on garde le dominant -> O(n).
Quel est le piège n°1 de complexité en JS ?|Une méthode de tableau O(n) (includes, find, indexOf, splice) placée DANS une boucle O(n) -> O(n²) invisible. Correctif : indexer dans une Map/Set pour des lookups O(1).
Pourquoi Array.push est-il O(1) amorti et non O(1) strict ?|La plupart des push écrivent dans un buffer avec de la place (O(1)), mais quand le buffer est plein V8 alloue un buffer 2× plus grand et recopie tout (O(n) ponctuel). La somme sur n push reste O(n) -> O(1) amorti.
Différence entre complexité amortie et average case ?|Amorti = garantie déterministe sur une SÉQUENCE d'opérations (ex. n push = O(n) total). Average case = espérance sur une DISTRIBUTION d'entrées (ex. quicksort O(n log n) en moyenne, O(n²) au pire).
Complexité temps et espace de : trouver deux nombres dont la somme vaut target ?|Avec une double boucle : O(n²) temps, O(1) espace. Avec un Set des compléments déjà vus : O(n) temps, O(n) espace. Trade-off classique temps/mémoire.
Quelles opérations Array/Map sont O(1) et lesquelles sont O(n) ?|O(1) : arr[i], push, pop, map.get/set/has, set.has/add. O(n) : unshift, shift, splice, includes, indexOf, find, spread [...arr]. O(n log n) : sort.
```

---

## Pont vers le lab

> Lab associé : `05-algorithms/labs/lab-01-complexity-analysis/README.md`. Analyser à la main la complexité de plusieurs fonctions, puis la **mesurer** avec `performance.now()` pour confronter prédiction et réalité — dont le lookup TribuZen `Array.find` (`O(n)`) vs `Map` (`O(1)`).
