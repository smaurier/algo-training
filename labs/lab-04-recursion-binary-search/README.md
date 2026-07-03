# Lab 04 — Récursion et recherche binaire

> **Outcome :** à la fin, tu sais écrire une recherche binaire exacte, ses variantes de bornes (`lowerBound`/`upperBound`), un « binary search on answer », et un agrégat diviser-pour-régner — en TypeScript, en te fiant aux invariants et non à des tests fournis.
> **Vrai outil :** Node.js + `tsx` (ou `ts-node`) pour exécuter du TypeScript réel, et le débogueur/`console.log` pour observer les bornes. Pas de harnais auto-correcteur.
> **Feedback :** le coach valide en session — tu montres les valeurs de `lo`/`hi`/`mid` déroulées, pas un « tests passed ».

---

## Énoncé

Tu construis le module de recherche des membres et des seuils de l'admin TribuZen. Tu implémentes **cinq** fonctions dans un seul fichier `search.ts`, sans copier le module — tu les écris de tête à partir des signatures.

**Contexte de données (à copier en tête de `search.ts`) :**

```ts
export interface Member {
  id: number;
  name: string;
  serenityPoints: number;
}

// Liste TRIÉE par id (invariant garanti par l'API TribuZen)
export const MEMBERS: Member[] = [
  { id: 3,  name: 'Alice',   serenityPoints: 12 },
  { id: 7,  name: 'Bruno',   serenityPoints: 7  },
  { id: 7,  name: 'Bruno2',  serenityPoints: 4  }, // doublon d'id volontaire
  { id: 12, name: 'Chloé',   serenityPoints: 20 },
  { id: 20, name: 'David',   serenityPoints: 5  },
  { id: 42, name: 'Émile',   serenityPoints: 9  },
];
```

**Signatures à implémenter (aucun corps fourni) :**

```ts
// 1. Recherche exacte de l'index d'un membre par id (tableau trié par id). -1 si absent.
export function findMemberIndex(members: Member[], id: number): number;

// 2. Premier index i tel que members[i].id >= id (intervalle demi-ouvert).
export function lowerBoundById(members: Member[], id: number): number;

// 3. Premier index i tel que members[i].id > id.
export function upperBoundById(members: Member[], id: number): number;

// 4. Binary search on answer : plus petit seuil s tel qu'AU PLUS `maxCount` membres
//    aient serenityPoints >= s. (Le prédicat est monotone en s.)
export function minThreshold(members: Member[], maxCount: number): number;

// 5. Diviser-pour-régner : somme des serenityPoints sur le segment [lo, hi].
export function sumSerenity(members: Member[], lo?: number, hi?: number): number;
```

**Contraintes :**
- `findMemberIndex`, `lowerBoundById`, `upperBoundById`, `minThreshold` sont **toutes en `O(log n)`** (sauf le prédicat interne de `minThreshold`, en `O(n)`).
- Style **demi-ouvert** obligatoire pour `lowerBound`/`upperBound` (`hi = length`, `while lo < hi`, `hi = mid`).
- `sumSerenity` est **récursive** en diviser-pour-régner (pas un `reduce`), avec un cas de base explicite.
- **Aucun test fourni** : tu vérifies en déroulant `lo`/`hi`/`mid` et en comparant à la main.

### Starter minimal

```
mkdir tribuzen-lab04 && cd tribuzen-lab04
npm init -y
npm i -D tsx typescript
# crée search.ts (signatures ci-dessus) + un fichier de vérif manuel
npx tsx search.ts
```

Ajoute en bas de `search.ts` quelques `console.log` de vérification **que tu écris toi-même** (pas fournis) pour observer le comportement — ex. `console.log(findMemberIndex(MEMBERS, 12))`.

---

## Étapes (en friction)

1. **`findMemberIndex`** — style fermé `[lo, hi]` (`hi = length - 1`, `while lo <= hi`). Compare `members[mid].id` à `id`. Renvoie `mid` si égal, sinon resserre. Vérifie à la main sur `id = 12` (attendu : index 3) et `id = 99` (attendu : -1).
2. **`lowerBoundById`** — style demi-ouvert. Sur les doublons d'`id = 7`, elle doit renvoyer l'index du **premier** 7 (index 1).
3. **`upperBoundById`** — copie de la précédente, change `<` en `<=`. Sur `id = 7`, elle doit renvoyer l'index **après le dernier** 7 (index 3). Vérifie : `upperBoundById(MEMBERS, 7) - lowerBoundById(MEMBERS, 7)` doit valoir 2 (deux membres id 7).
4. **`minThreshold`** — écris d'abord le prédicat interne `countAtLeast(s)` (combien de membres ont `serenityPoints >= s`). Observe qu'il **décroît** quand `s` croît → le prédicat `countAtLeast(s) <= maxCount` est monotone. Dichotomie sur `s` entre 0 et `max(serenityPoints)+1`.
5. **`sumSerenity`** — récursion diviser-pour-régner : cas de base `lo > hi` → 0, `lo === hi` → la valeur ; sinon couper au `mid`, sommer les deux moitiés. Vérifie : total attendu = 57.
6. **Déroule un cas à la main** avant de lancer : écris sur papier les `(lo, hi, mid)` de `lowerBoundById(MEMBERS, 7)` et confirme qu'ils matchent l'exécution.

---

## Corrigé complet commenté

```ts
// ─── search.ts ──────────────────────────────────────────────────
export interface Member {
  id: number;
  name: string;
  serenityPoints: number;
}

export const MEMBERS: Member[] = [
  { id: 3,  name: 'Alice',   serenityPoints: 12 },
  { id: 7,  name: 'Bruno',   serenityPoints: 7  },
  { id: 7,  name: 'Bruno2',  serenityPoints: 4  },
  { id: 12, name: 'Chloé',   serenityPoints: 20 },
  { id: 20, name: 'David',   serenityPoints: 5  },
  { id: 42, name: 'Émile',   serenityPoints: 9  },
];

// 1. Recherche exacte — style FERMÉ [lo, hi]
export function findMemberIndex(members: Member[], id: number): number {
  let lo = 0;
  let hi = members.length - 1;          // hi INCLUS
  while (lo <= hi) {                      // <= car hi est un index candidat
    const mid = lo + Math.floor((hi - lo) / 2); // anti-overflow + entier
    const midId = members[mid].id;
    if (midId === id) return mid;         // trouvé (un des doublons, sans garantie du 1er)
    if (midId < id) lo = mid + 1;         // cible strictement à droite
    else hi = mid - 1;                    // cible strictement à gauche
  }
  return -1;                              // absent
}

// 2. lower bound — style DEMI-OUVERT [lo, hi)
export function lowerBoundById(members: Member[], id: number): number {
  let lo = 0;
  let hi = members.length;               // hi EXCLU
  while (lo < hi) {                        // < car hi n'est pas candidat
    const mid = lo + Math.floor((hi - lo) / 2);
    if (members[mid].id < id) lo = mid + 1; // trop petit → à droite
    else hi = mid;                          // >= id → mid reste candidat, on rétrécit
  }
  return lo; // premier i où members[i].id >= id
}

// 3. upper bound — IDENTIQUE à lowerBound sauf < devient <=
export function upperBoundById(members: Member[], id: number): number {
  let lo = 0;
  let hi = members.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (members[mid].id <= id) lo = mid + 1; // <= : on saute AU-DELÀ des égaux
    else hi = mid;
  }
  return lo; // premier i où members[i].id > id
}

// 4. Binary search on answer — plus petit seuil s tel que countAtLeast(s) <= maxCount
export function minThreshold(members: Member[], maxCount: number): number {
  // Prédicat O(n) : combien de membres ont serenityPoints >= s.
  // countAtLeast DÉCROÎT quand s croît → "countAtLeast(s) <= maxCount" est monotone
  // (false pour les petits s, true à partir d'un certain s) : on cherche la frontière.
  const countAtLeast = (s: number): number =>
    members.reduce((n, m) => n + (m.serenityPoints >= s ? 1 : 0), 0);

  let lo = 0;
  let hi = Math.max(...members.map(m => m.serenityPoints)) + 1; // borne sup exclusive
  while (lo < hi) {                         // demi-ouvert, on cherche le 1er s "vrai"
    const mid = lo + Math.floor((hi - lo) / 2);
    if (countAtLeast(mid) <= maxCount) hi = mid; // faisable → on tente plus petit
    else lo = mid + 1;                            // trop de membres → seuil plus haut
  }
  return lo; // plus petit seuil respectant la contrainte
}

// 5. Diviser-pour-régner — somme récursive sur [lo, hi]
export function sumSerenity(
  members: Member[],
  lo = 0,
  hi = members.length - 1,
): number {
  if (lo > hi) return 0;                    // cas de base : segment vide
  if (lo === hi) return members[lo].serenityPoints; // cas de base : singleton
  const mid = lo + Math.floor((hi - lo) / 2);       // DIVISER
  const left = sumSerenity(members, lo, mid);        // RÉGNER (gauche)
  const right = sumSerenity(members, mid + 1, hi);   // RÉGNER (droite)
  return left + right;                               // COMBINER (associatif)
}

// ─── Vérifications manuelles (tu les écris, ce ne sont PAS des tests fournis) ──
console.log(findMemberIndex(MEMBERS, 12));       // 3
console.log(findMemberIndex(MEMBERS, 99));       // -1
console.log(lowerBoundById(MEMBERS, 7));         // 1 (premier id 7)
console.log(upperBoundById(MEMBERS, 7));         // 3 (après le dernier id 7)
console.log(upperBoundById(MEMBERS, 7) - lowerBoundById(MEMBERS, 7)); // 2 occurrences
console.log(minThreshold(MEMBERS, 2));           // seuil où au plus 2 membres qualifiés
console.log(sumSerenity(MEMBERS));               // 57
```

**Pourquoi ce corrigé est correct :**
- `findMemberIndex` (fermé) et `lowerBound`/`upperBound` (demi-ouvert) ne mélangent jamais les deux styles — la source n°1 d'off-by-one est évitée.
- `lowerBound`/`upperBound` ne diffèrent **que** par `<` vs `<=` : `lower` s'arrête sur le premier égal, `upper` saute derrière le dernier égal. Leur différence donne le nombre d'occurrences (2 pour l'`id` 7 dupliqué).
- `minThreshold` illustre le binary-search-on-answer : on ne cherche pas dans un tableau mais la **valeur** `s`. La monotonie de `countAtLeast(s) <= maxCount` justifie la dichotomie.
- `sumSerenity` a deux cas de base (vide + singleton) garantissant la convergence, et une combinaison associative → l'ordre de fusion n'affecte pas le résultat (57).
- Tous les `mid` utilisent `lo + Math.floor((hi - lo) / 2)` : entier et anti-overflow.

---

## Variante J+30 (fading)

**Même objectif, contraintes ajoutées — à reproduire de mémoire en 25 minutes, sans rouvrir le corrigé ni le module :**

1. Réécris `lowerBoundById` et `upperBoundById` **de zéro**, puis prouve à la main sur un tableau de ton choix avec au moins **3 doublons** consécutifs.
2. Ajoute `findFirstBadge(members, minPoints)` : premier membre (par ordre du tableau trié par `serenityPoints`, que tu re-trieras) dont `serenityPoints >= minPoints`, en `O(log n)` via `lowerBound`.
3. Ajoute `intSqrt(n)` en binary-search-on-answer (plus grand `x` tel que `x*x <= n`) — attention : ici tu fais `lo = mid`, donc utilise `Math.ceil` pour le `mid`.
4. **Contrainte anti-triche :** pas de `Array.prototype.indexOf`, `find`, ni `includes`.

**Critère de réussite :** les trois fonctions passent tes vérifications manuelles, et tu sais expliquer pourquoi `intSqrt` exige `Math.ceil` (sinon boucle infinie quand l'intervalle est de taille 2).

---

## Application TribuZen

Dans le repo `smaurier/tribuzen`, ces fonctions vivent ici :

```
tribuzen/src/features/
  members/
    lookup.ts        ← findMemberIndex + lowerBoundById (membre par id trié)
  stats/
    aggregate.ts     ← sumSerenity (divide & conquer associatif)
  badges/
    threshold.ts     ← minThreshold (binary search on answer)
```

**Différences par rapport au lab :**
- `lookup.ts` sera générique (`binarySearchBy<T>(arr, key, target)`) plutôt que couplé à `Member.id`, pour servir aussi les listes d'événements triées par date.
- `MEMBERS` sera remplacé par la donnée renvoyée par l'API ; on **audite** l'invariant de tri en dev (un `assert` que `id` est croissant) avant de faire confiance à la dichotomie.
- `minThreshold` sera relié à la vraie règle métier des badges (« au plus 20 % des familles ») — le prédicat comptera des familles, pas des membres, mais le squelette binary-search-on-answer est identique.
- `sumSerenity` deviendra un segment tree (module 06) quand les stats seront mises à jour en continu (`O(log n)` par update au lieu d'un recalcul complet).

**Commit cible :**
```
feat(members): binarySearch + lowerBound lookup membre (liste triée)
feat(stats): sumSerenity divide & conquer sur points de sérénité
feat(badges): minThreshold via binary search on answer
```
