---
titre: Tableaux, chaînes et hash maps
cours: 05-algorithms
notions: [accès O(1) et coûts d'insertion/suppression des tableaux, two pointers, sliding window, prefix sums, immutabilité des chaînes JS, hash maps Map/Set/objet, complexité moyenne O(1) et collisions, patterns d'entretien two-sum dédup fréquences anagrammes sous-tableau de somme]
outcomes: [choisir tableau ou Map ou Set selon le coût des opérations, appliquer two pointers et sliding window et prefix sums pour passer de O(n²) à O(n), résoudre les patterns d'entretien classiques two-sum dédup fréquences anagrammes avec une hash map]
prerequis: [01-complexite-et-raisonnement]
next: 03-stacks-queues-listes
libs: []
tribuzen: dédup des membres par email, points de contribution, flux d'activité et fréquences de rôles côté admin TribuZen
last-reviewed: 2026-07
---

# Tableaux, chaînes et hash maps

> **Outcomes — tu sauras FAIRE :** choisir entre tableau / `Map` / `Set` selon le coût réel des opérations, appliquer **two pointers**, **sliding window** et **prefix sums** pour transformer un O(n²) en O(n), résoudre les patterns d'entretien classiques (two-sum, dédup, fréquences, anagrammes, sous-tableau de somme) avec une hash map.
> **Difficulté :** :star::star::star:

> **Pourquoi ce module compte le plus :** en entretien technique, la majorité des problèmes "warm-up" et "medium" tombent ici. `Map`/`Set` + two pointers + sliding window couvrent l'essentiel des exercices LeetCode Easy/Medium. C'est le module au meilleur ROI de tout le cours.

## 1. Cas concret d'abord

Tu ouvres l'admin TribuZen. Un collègue a écrit la fonction qui déduplique les membres d'une famille par email avant de les afficher :

```ts
interface Member {
  id: string;
  email: string;
  displayName: string;
}

// members peut contenir 8 000 lignes (imports CSV répétés, doublons d'invitation)
function dedupByEmail(members: Member[]): Member[] {
  const result: Member[] = [];
  for (const m of members) {
    // ⚠️ .some() re-scanne TOUT result à chaque membre
    if (!result.some(r => r.email === m.email)) {
      result.push(m);
    }
  }
  return result;
}
```

**Trois problèmes immédiats :**
1. `result.some(...)` est un scan O(n) exécuté pour *chaque* membre → l'ensemble est **O(n²)**. Sur 8 000 membres, c'est ~32 millions de comparaisons.
2. Le collègue "sent" que c'est lent mais ne sait pas nommer le coût, donc ne sait pas quoi changer.
3. La bonne version tient en 4 lignes avec un `Set` et tourne en **O(n)**.

```ts
function dedupByEmail(members: Member[]): Member[] {
  const seen = new Set<string>();
  return members.filter(m => {
    if (seen.has(m.email)) return false; // has() est O(1) moyen
    seen.add(m.email);
    return true;
  });
}
```

Ce module te donne le réflexe : dès que tu vois une recherche répétée dans une boucle (`includes`, `some`, `indexOf`, `find`), tu penses **hash map / hash set**. Et dès que tu vois deux boucles imbriquées sur un tableau trié ou une fenêtre glissante, tu penses **two pointers / sliding window**.

---

## 2. Théorie complète, concise

### 2.1 Le tableau : accès O(1), mais tout le reste a un coût

Un tableau JS est une séquence contiguë indexée. L'index donne un accès direct.

```ts
const users = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];

// ✅ O(1) — coût constant, indépendant de la taille
users[2];             // accès par index → calcul d'adresse direct
users.push('Frank');  // ajout en fin → O(1) amorti
users.pop();          // suppression en fin
users.length;

// ⚠️ O(n) — scan ou décalage de tout le tableau
users.includes('Diana');  // scan linéaire jusqu'à trouver
users.indexOf('Charlie'); // idem
users.unshift('Zoe');     // insertion en tête → décale tous les éléments
users.splice(1, 1);       // suppression au milieu → décale la suite
```

La règle mentale : **accès par position = O(1)**, **recherche par valeur = O(n)**, **insertion/suppression ailleurs qu'en fin = O(n)** (à cause du décalage). Le tableau brille pour le parcours séquentiel et l'accès indexé ; il est mauvais pour les lookups répétés par valeur.

### 2.2 Two pointers — deux index qui balaient au lieu d'imbriquer

Le pattern **two pointers** remplace une double boucle O(n²) par deux index qui se déplacent en un seul passage O(n). Deux variantes principales.

**Variante A — pointeurs opposés (tableau trié).** Un pointeur à gauche, un à droite, ils convergent.

```ts
// Deux nombres d'un tableau TRIÉ dont la somme vaut target
function twoSumSorted(nums: number[], target: number): [number, number] | null {
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;   // somme trop petite → augmenter le petit
    else right--;               // somme trop grande → diminuer le grand
  }
  return null;
}
// O(n) temps, O(1) espace. Marche UNIQUEMENT si nums est trié.
```

Pourquoi ça converge : à chaque étape on élimine définitivement une valeur (la plus petite ou la plus grande possible), donc on parcourt chaque index au plus une fois.

**Variante B — pointeurs qui avancent dans le même sens** (lecture/écriture, dédup en place) :

```ts
// Supprime les doublons d'un tableau TRIÉ, en place. slow = position d'écriture.
function dedupInPlace(nums: number[]): number {
  if (nums.length === 0) return 0;
  let slow = 0;
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }
  return slow + 1; // longueur de la partie unique
}
```

### 2.3 Sliding window — une fenêtre qui glisse au lieu de tout recalculer

Le **sliding window** s'applique aux problèmes de **sous-tableau/sous-chaîne contigu**. Au lieu de recalculer chaque fenêtre depuis zéro (O(n·k) ou O(n²)), on ajoute l'élément entrant et on retire l'élément sortant → O(n).

**Fenêtre de taille fixe k :**

```ts
// Somme maximale de k éléments consécutifs
function maxSumWindow(nums: number[], k: number): number {
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += nums[i]; // première fenêtre

  let max = windowSum;
  for (let i = k; i < nums.length; i++) {
    windowSum += nums[i] - nums[i - k]; // entrant - sortant
    max = Math.max(max, windowSum);
  }
  return max;
}
// O(n) au lieu de O(n·k)
```

**Fenêtre de taille variable** (on agrandit à droite, on rétrécit à gauche selon une condition) :

```ts
// Plus longue sous-chaîne sans caractère répété
function longestUnique(s: string): number {
  const lastSeen = new Map<string, number>();
  let start = 0;
  let best = 0;
  for (let end = 0; end < s.length; end++) {
    const c = s[end];
    // si c déjà vu DANS la fenêtre courante, on avance start juste après
    if (lastSeen.has(c) && lastSeen.get(c)! >= start) {
      start = lastSeen.get(c)! + 1;
    }
    lastSeen.set(c, end);
    best = Math.max(best, end - start + 1);
  }
  return best;
}
// O(n) — chaque caractère entre et sort de la fenêtre au plus une fois
```

Le déclencheur mental : « sous-tableau/sous-chaîne **contigu** + max/min/count/somme » → sliding window.

### 2.4 Prefix sums — pré-calculer les sommes cumulées

Un **prefix sum** (somme préfixe) est un tableau `pre` où `pre[i]` = somme des `i` premiers éléments. Il permet de répondre à « somme du segment `[i, j)` » en **O(1)** après un pré-calcul O(n).

```ts
function buildPrefix(nums: number[]): number[] {
  const pre = [0]; // pre[0] = 0, pre[i] = somme des i premiers
  for (let i = 0; i < nums.length; i++) {
    pre.push(pre[i] + nums[i]);
  }
  return pre;
}

// Somme de nums[i..j) = pre[j] - pre[i]  → O(1)
const nums = [3, 1, 4, 1, 5, 9];
const pre = buildPrefix(nums);
const sumOf_1_to_4 = pre[4] - pre[1]; // 1 + 4 + 1 = 6
```

Combiné à une hash map, le prefix sum résout **« existe-t-il un sous-tableau de somme exacte k ? »** en O(n) (pattern d'entretien détaillé en 3.2).

### 2.5 Les chaînes : des tableaux immutables

En JS, une `string` est **immutable** : chaque "modification" crée une nouvelle chaîne.

```ts
const s = 'hello';
s[0] = 'H';        // ❌ silencieusement ignoré (pas d'erreur en mode non-strict)
s.toUpperCase();   // ✅ retourne un NOUVEAU string — O(n)
s.slice(0, 3);     // nouveau string — O(k)
s[0];              // accès caractère → O(1)

// ⚠️ Piège classique : concaténation en boucle = O(n²) caché
let out = '';
for (let i = 0; i < 10_000; i++) out += 'x'; // chaque += recopie tout out

// ✅ construire un tableau puis join une seule fois → O(n)
const parts: string[] = [];
for (let i = 0; i < 10_000; i++) parts.push('x');
const out2 = parts.join('');
```

Manipulations courantes : `split`/`join` (chaîne ↔ tableau), `slice`, `startsWith`/`includes`, et pour l'itération Unicode-safe `for...of` (qui itère par code point, pas par unité UTF-16).

### 2.6 Hash maps : Map, Set, objet — lookup O(1) moyen

Une hash map stocke des paires clé→valeur avec un accès moyen **O(1)** : la clé passe dans une fonction de hachage qui donne directement l'emplacement. JS offre trois implémentations.

| Structure | Clés | Quand l'utiliser |
|---|---|---|
| `Object` | strings / symbols | structure fixe connue à l'avance, sérialisation JSON, destructuring |
| `Map` | **n'importe quel type** (objets, nombres…) | clés dynamiques/utilisateur, itération ordonnée, `.size`, ajout/suppression fréquents |
| `Set` | valeurs uniques | test de présence, déduplication |

```ts
// Set — "cet élément existe-t-il ?" / dédup
const seen = new Set<string>();
seen.add('a'); seen.has('a'); // O(1)

// Map — "quelle valeur pour cette clé ?" / comptage
const freq = new Map<string, number>();
freq.set('info', (freq.get('info') ?? 0) + 1);

// Object — structure connue
const config = { retries: 3, timeout: 5000 };
```

**Complexité moyenne O(1), pas garantie.** Deux clés différentes peuvent produire le même hash : c'est une **collision**. Le moteur gère les collisions (chaînage interne), ce qui donne un coût *moyen* O(1) mais un *pire cas* théorique O(n) si toutes les clés collisionnent. En pratique avec `Map`/`Set` natifs, tu peux raisonner en O(1) — tu n'implémentes pas la table toi-même. Retiens juste : **le O(1) est amorti/moyen, pas un absolu**.

### 2.7 Les patterns d'entretien = combinaisons de ces briques

| Problème | Brique | Complexité |
|---|---|---|
| two-sum (non trié) | `Map` valeur→index | O(n) |
| two-sum (trié) | two pointers | O(n) |
| dédupliquer | `Set` | O(n) |
| compter les fréquences | `Map<clé, number>` | O(n) |
| anagrammes | signature triée + `Map` | O(n·k log k) |
| sous-tableau de somme k | prefix sum + `Map` | O(n) |
| plus longue fenêtre sans répétition | sliding window + `Map` | O(n) |

---

## 3. Worked examples

### Exemple 1 — two-sum non trié avec une hash map (le grand classique)

**Problème :** trouver deux indices `i, j` tels que `nums[i] + nums[j] === target`. Le tableau n'est pas trié.

L'approche naïve teste toutes les paires → O(n²). L'idée gagnante : pour chaque élément `x`, son **complément** est `target - x`. Si on a déjà rencontré ce complément, on a la paire. On mémorise donc les valeurs vues dans une `Map<valeur, index>`.

```ts
function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>(); // valeur déjà vue → son index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    // le complément a-t-il déjà été vu ? lookup O(1)
    if (seen.has(complement)) {
      return [seen.get(complement)!, i]; // paire trouvée
    }
    seen.set(nums[i], i); // sinon on enregistre l'élément courant
  }
  return null;
}

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]  car 2 + 7 = 9
console.log(twoSum([3, 2, 4], 6));      // [1, 2]  car 2 + 4 = 6
```

**Pas à pas sur `[2, 7, 11, 15]`, target 9 :**
1. `i=0`, x=2, complément=7. `seen` vide → pas trouvé. On stocke `2→0`.
2. `i=1`, x=7, complément=2. `seen.has(2)` → oui, index 0. On retourne `[0, 1]`. ✅

Complexité : **O(n) temps** (un passage, lookup O(1)), **O(n) espace** (la map). On échange de la mémoire contre du temps — c'est le trade-off fondamental des hash maps.

### Exemple 2 — sous-tableau de somme exacte k (prefix sum + hash map)

**Problème :** existe-t-il un sous-tableau **contigu** dont la somme vaut exactement `k` ? (Peut contenir des négatifs, donc sliding window ne marche pas ici.)

Idée : la somme du segment `(i, j]` vaut `pre[j] - pre[i]`. On cherche `pre[j] - pre[i] === k`, soit `pre[i] === pre[j] - k`. En balayant, on garde dans un `Set`/`Map` les sommes préfixes déjà vues ; à chaque `j`, on regarde si `pre[j] - k` a déjà été vu.

```ts
function hasSubarraySum(nums: number[], k: number): boolean {
  const seenPrefixes = new Set<number>([0]); // 0 = préfixe vide (avant tout élément)
  let prefix = 0;

  for (const x of nums) {
    prefix += x;
    // si (prefix - k) a déjà été vu, le segment intermédiaire somme à k
    if (seenPrefixes.has(prefix - k)) return true;
    seenPrefixes.add(prefix);
  }
  return false;
}

console.log(hasSubarraySum([3, 4, 7, 2, -3, 1, 4, 2], 7)); // true
console.log(hasSubarraySum([1, 2, 3], 7));                  // false
```

**Pourquoi `Set([0])` au départ :** si `prefix` lui-même vaut `k` (le sous-tableau commence à l'index 0), alors `prefix - k === 0`, qui est présent d'entrée. Sans ce `0` initial, on raterait tous les sous-tableaux préfixes.

Complexité : **O(n) temps, O(n) espace**. La version naïve (toutes les paires de bornes) serait O(n²).

---

## 4. Pièges & misconceptions

### PIÈGE #1 — `.includes()` / `.some()` / `.find()` dans une boucle = O(n²) déguisé

```ts
// ❌ Pour chaque needle, on re-scanne tout haystack → O(needles × haystack)
const common = needles.filter(n => haystack.includes(n));

// ✅ Indexer haystack une fois dans un Set → O(needles + haystack)
const set = new Set(haystack);
const common2 = needles.filter(n => set.has(n));
```

**Signal d'alarme :** une méthode de recherche linéaire (`includes`, `indexOf`, `some`, `find`) **à l'intérieur** d'un `for`/`map`/`filter`. Presque toujours remplaçable par un `Set`/`Map` construit en amont.

### PIÈGE #2 — Sliding window sur des nombres négatifs

Le sliding window de taille variable suppose qu'agrandir la fenêtre **augmente** la métrique de façon monotone (ex: somme qui croît quand on ajoute des positifs). Avec des **négatifs**, ajouter un élément peut *diminuer* la somme → la fenêtre ne peut plus décider correctement quand rétrécir.

```ts
// ❌ "plus petit sous-tableau de somme >= k" par sliding window
//    échoue si nums contient des négatifs.
// ✅ pour sommes avec négatifs → prefix sum + hash map (Exemple 2).
```

**Règle :** sliding window ⇔ métrique monotone (souvent : valeurs positives, ou comptage). Négatifs / somme exacte → prefix sum.

### PIÈGE #3 — Two pointers opposés sur un tableau NON trié

```ts
// ❌ twoSumSorted attend un tableau trié. Sur du non-trié, il rate des paires.
twoSumSorted([7, 2, 15, 11], 9); // renvoie null à tort (2+7=9 existe)

// ✅ soit trier d'abord (O(n log n), mais on perd les index d'origine),
//    soit utiliser la Map (O(n), garde les index) → Exemple 1.
```

Choix selon le besoin : besoin des **index d'origine** → `Map`. Tableau déjà trié / besoin O(1) espace → two pointers.

### PIÈGE #4 — Objet `{}` comme hash map avec des clés non-string

```ts
// ❌ Object convertit toute clé en string
const m: Record<string, string> = {};
m[1] = 'a';
m['1'] = 'b';
console.log(m[1]); // 'b'  — 1 et '1' sont la MÊME clé !

// ❌ objet en clé → toutes deviennent "[object Object]"
const seen: Record<string, boolean> = {};
seen[{ id: 1 } as any] = true;
seen[{ id: 2 } as any] = true;
console.log(Object.keys(seen)); // ['[object Object]'] — collision totale

// ✅ Map accepte n'importe quel type de clé sans coercition
const map = new Map<number, string>();
map.set(1, 'a'); map.set(2, 'b'); // 1 et 2 restent distincts
```

**Règle :** clés dynamiques, numériques ou objets → `Map`. Objet `{}` seulement pour des clés string connues à l'avance.

### PIÈGE #5 — `Map.get()` sur clé absente renvoie `undefined`, pas `0`

```ts
const freq = new Map<string, number>();
// ❌ freq.get('a') vaut undefined au premier passage → NaN
freq.set('a', freq.get('a')! + 1); // NaN au premier passage !

// ✅ valeur par défaut avec ??
freq.set('a', (freq.get('a') ?? 0) + 1);
```

---

## 5. Ancrage TribuZen

Ces briques sont partout côté admin TribuZen, sur des volumes réels (imports CSV, flux d'événements).

**Dédup des membres par email (`Set`)** — `src/features/members/dedupMembers.ts`. Les invitations et imports CSV créent des doublons ; on déduplique par email avant affichage et avant insertion en base. Un `Set<string>` sur l'email, O(n) — exactement le cas concret du module.

**Points de contribution, paire cible (two-sum-like, `Map`)** — `src/features/gamification/matchContribution.ts`. Chaque membre a un score de contribution ; pour un défi "trouver deux membres dont les points se complètent à un palier `target`", on applique le pattern two-sum avec une `Map<points, memberId>`.

**Flux d'activité, pic d'activité (sliding window)** — `src/features/activity/peakWindow.ts`. Sur un flux d'événements horodatés, "quelle fenêtre de N minutes concentre le plus d'activité" est un sliding window de taille fixe sur des buckets temporels.

**Fréquences de rôles (`Map<role, number>`)** — `src/features/members/roleStats.ts`. Le tableau de bord affiche combien de `admin` / `mod` / `member` par famille : un simple comptage `Map<role, number>` en O(n).

Fichiers cibles dans `smaurier/tribuzen` :
```
tribuzen/src/features/
  members/
    dedupMembers.ts      // Set — dédup par email
    roleStats.ts         // Map<role, number> — fréquences
  gamification/
    matchContribution.ts // Map — two-sum sur les points
  activity/
    peakWindow.ts        // sliding window — pic d'activité
```

---

## 6. Points clés

1. Tableau : accès par index O(1), mais recherche par valeur O(n) et insertion/suppression hors fin O(n) (décalage).
2. `Set` = présence/dédup en O(1) moyen ; `Map` = clé→valeur en O(1) moyen ; objet `{}` = clés string fixes seulement.
3. Une recherche linéaire (`includes`/`find`/`some`) dans une boucle est un O(n²) déguisé — indexer d'abord dans un `Set`/`Map`.
4. Two pointers : deux index en un passage O(n) — opposés (tableau trié) ou même sens (dédup/lecture-écriture).
5. Sliding window : sous-tableau/sous-chaîne **contigu** avec métrique monotone → O(n) en ajoutant l'entrant et retirant le sortant.
6. Prefix sum + hash map : somme de segment en O(1), sous-tableau de somme exacte k en O(n) (marche avec les négatifs, contrairement au sliding window).
7. Les chaînes JS sont immutables — jamais de `+=` en boucle, construire un tableau et `join()`.
8. Patterns d'entretien = combinaisons de ces briques : two-sum (Map), dédup (Set), fréquences (Map), anagrammes (signature triée + Map), somme k (prefix + Map).
9. Le O(1) des hash maps est **moyen/amorti** à cause des collisions, pas un absolu garanti.

---

## 7. Seeds Anki

```
Quel est le coût d'un accès par index dans un tableau, et celui d'une recherche par valeur ?|Accès par index : O(1) (adresse calculée directement). Recherche par valeur (includes/indexOf) : O(n), scan linéaire.
Comment repérer un O(n²) déguisé dans du code de tableau ?|Une recherche linéaire (includes/indexOf/some/find) placée À L'INTÉRIEUR d'une boucle (for/map/filter). Correction : indexer d'abord dans un Set ou une Map, puis lookup O(1).
Résous two-sum sur un tableau NON trié en O(n) — quelle structure et quelle idée ?|Une Map<valeur, index>. Pour chaque x, on cherche son complément (target - x) dans la Map ; s'il y est on a la paire, sinon on enregistre x. O(n) temps, O(n) espace.
Quand utiliser two pointers opposés vs sliding window ?|Two pointers opposés : tableau TRIÉ, paires/somme, convergence gauche-droite, O(1) espace. Sliding window : sous-tableau/sous-chaîne CONTIGU avec métrique monotone (max/min/count/somme positive), fenêtre qui glisse.
Pourquoi le sliding window échoue-t-il avec des nombres négatifs, et par quoi le remplacer ?|La fenêtre suppose une métrique monotone (ajouter un élément augmente la somme). Un négatif casse la monotonie. Pour une somme exacte avec négatifs : prefix sum + hash map des sommes préfixes.
Qu'est-ce qu'un prefix sum et que permet-il ?|Un tableau pre où pre[i] = somme des i premiers éléments. La somme du segment [i, j) = pre[j] - pre[i] en O(1) après un pré-calcul O(n). Combiné à une Map, il détecte un sous-tableau de somme k en O(n).
Différence entre Map et objet {} comme table de hachage en JS ?|Object convertit toute clé en string (1 et '1' collisionnent, un objet devient "[object Object]"). Map accepte n'importe quel type de clé sans coercition, garde l'ordre d'insertion, expose .size. Object : clés string fixes connues à l'avance.
Le O(1) d'une Map/Set est-il garanti ?|Non : c'est un coût MOYEN/amorti. Deux clés peuvent produire le même hash (collision), gérées par chaînage interne. Pire cas théorique O(n), mais en pratique on raisonne en O(1) avec les natifs JS.
Pourquoi éviter la concaténation de string en boucle (+=) en JS ?|Les strings sont immutables : chaque += recopie toute la chaîne existante → 1+2+...+n = O(n²). Solution : pousser dans un tableau puis un seul join() → O(n).
```

---

## Pont vers le lab

> Lab associé : `05-algorithms/labs/lab-02-arrays-hashmaps/README.md`. Trois problèmes d'entretien à écrire de zéro en TypeScript : **two-sum** (Map), **sliding window** (pic d'activité), **dédup** (Set) — avec corrigé complet commenté, variante J+30 et portage TribuZen.
