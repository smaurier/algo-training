# Lab 01 — Analyse de complexité

> **Outcome :** à la fin, tu sais donner la complexité temps ET espace de plusieurs fonctions JS rien qu'en les lisant, puis **mesurer** avec `performance.now()` pour confirmer (ou infirmer) ta prédiction — dont le lookup TribuZen `Array.find` `O(n)` vs `Map` `O(1)`.
> **Vrai outil :** Node.js + `performance.now()` (API `perf_hooks`), lancé avec `tsx` ou `node`. Aucun harnais de test simulé — tu observes des millisecondes réelles.
> **Feedback :** le coach valide en session — tu défends ta prédiction Big-O puis tu montres la courbe mesurée.

---

## Énoncé

Tu reçois un fichier de fonctions. Pour **chacune**, tu dois :

1. Prédire, **avant toute exécution**, sa complexité **temps** et **espace** (à la main, sur papier).
2. Écrire un banc de mesure qui fait tourner la fonction sur des tailles croissantes (`n = 1 000, 4 000, 16 000, 64 000`) et affiche le temps médian.
3. Confronter : si `n` est multiplié par 4, un `O(n)` fait ×4, un `O(n log n)` un peu plus, un `O(n²)` fait ×16. La courbe mesurée doit correspondre à ta prédiction.
4. Pour la fonction TribuZen (`lookupByEmail`), comparer la version `Array.find` (`O(n)`) et la version `Map` (`O(1)`) sur le **même** dataset.

**Contraintes :**
- Pas de bibliothèque de bench (pas de `benchmark`, pas de `tinybench`) — tu écris ta propre boucle de mesure avec `performance.now()`. C'est l'objet du lab.
- Warmup obligatoire (laisser le JIT compiler), médiane sur plusieurs runs (le GC pollue la moyenne).
- Force l'utilisation du résultat (`console.log` d'une valeur dérivée) sinon V8 peut supprimer un calcul mort.

### Starter minimal

Crée un dossier et un fichier `complexity.ts`. Lance-le avec `npx tsx complexity.ts` (ou renomme en `.mjs` et `node complexity.mjs`).

```ts
// complexity.ts — STARTER (à compléter)
import { performance } from 'node:perf_hooks';

// ─── Les fonctions à analyser (NE PAS MODIFIER leur logique) ──────────

type Member = { id: string; email: string; name: string };

// F1
export function sumAll(arr: number[]): number {
  let s = 0;
  for (const x of arr) s += x;
  return s;
}

// F2
export function hasDuplicateSlow(arr: number[]): boolean {
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] === arr[j]) return true;
  return false;
}

// F3
export function hasDuplicateFast(arr: number[]): boolean {
  const seen = new Set<number>();
  for (const x of arr) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}

// F4 — recherche membre TribuZen, version O(n)
export function lookupFind(members: Member[], email: string): Member | undefined {
  return members.find((m) => m.email === email);
}

// F5 — recherche membre TribuZen, version O(1) (index pré-construit)
export function makeLookupMap(members: Member[]) {
  const byEmail = new Map<string, Member>();
  for (const m of members) byEmail.set(m.email, m);
  return (email: string) => byEmail.get(email);
}

// ─── À TOI : écris measure() et le programme de bench ci-dessous ───────
```

---

## Étapes (en friction)

1. **Prédis d'abord, sur papier**, pour F1 à F5 : complexité temps ET espace. Écris-les avant de coder quoi que ce soit.
2. **Écris `measure(label, fn, iterations)`** : warmup (10 tours à vide), puis `iterations` runs chronométrés à `performance.now()`, retourne la **médiane** (trie les temps, prends l'élément central). Affiche `label`, médiane en ms.
3. **Génère les datasets** : pour chaque `n ∈ {1000, 4000, 16000, 64000}`, un tableau de `n` entiers, et une liste de `n` membres `{ id, email, name }` avec des emails uniques + une cible en **dernière** position (pire cas du scan).
4. **Bench F1 et F2** sur les 4 tailles. Vérifie : F1 (`O(n)`) ×4 quand `n` ×4 ; F2 (`O(n²)`) ×16 quand `n` ×4.
5. **Bench F4 (`find`) vs F5 (`Map`)** en cherchant l'email en dernière position. Observe que `find` grossit avec `n`, que `Map.get` reste plat.
6. **Force l'usage** du résultat (log une valeur dérivée) pour empêcher l'élimination de code mort.
7. **Confronte** chaque courbe mesurée à ta prédiction de l'étape 1. Note tout écart et explique-le (constantes, cache CPU, JIT).

---

## Corrigé complet commenté

```ts
// complexity.ts — CORRIGÉ
import { performance } from 'node:perf_hooks';

type Member = { id: string; email: string; name: string };

// ─── Fonctions analysées (rappel) ────────────────────────────────────
export function sumAll(arr: number[]): number {
  let s = 0;
  for (const x of arr) s += x; // 1 passage
  return s;
}
// F1 -> TEMPS O(n) : une boucle. ESPACE O(1) : un accumulateur, rien de lié à n.

export function hasDuplicateSlow(arr: number[]): boolean {
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++) // boucle imbriquée
      if (arr[i] === arr[j]) return true;
  return false;
}
// F2 -> TEMPS O(n²) au pire (aucun doublon) : deux boucles imbriquées. ESPACE O(1).

export function hasDuplicateFast(arr: number[]): boolean {
  const seen = new Set<number>();
  for (const x of arr) {
    if (seen.has(x)) return true; // has O(1) amorti
    seen.add(x);
  }
  return false;
}
// F3 -> TEMPS O(n) : un passage, lookups O(1). ESPACE O(n) : le Set grossit jusqu'à n.
//        C'est le trade-off : on paie O(n) de RAM pour passer de O(n²) à O(n).

export function lookupFind(members: Member[], email: string): Member | undefined {
  return members.find((m) => m.email === email); // scan
}
// F4 -> TEMPS O(n) par appel (pire cas : dernier/absent). ESPACE O(1).

export function makeLookupMap(members: Member[]) {
  const byEmail = new Map<string, Member>();
  for (const m of members) byEmail.set(m.email, m); // construction O(n) UNE fois
  return (email: string) => byEmail.get(email);     // chaque appel O(1) amorti
}
// F5 -> construction O(n) temps + O(n) espace, puis chaque lookup O(1). ESPACE O(n).

// ─── Outil de mesure : warmup + médiane ──────────────────────────────
function measure(label: string, fn: () => unknown, iterations = 51): number {
  // Warmup : laisse V8 compiler le chemin chaud (JIT) avant de chronométrer
  for (let i = 0; i < 10; i++) fn();

  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }
  // Médiane : robuste aux pics de GC, contrairement à la moyenne
  times.sort((a, b) => a - b);
  const median = times[Math.floor(times.length / 2)];
  console.log(`${label.padEnd(28)} médiane ${median.toFixed(4)} ms`);
  return median;
}

// ─── Générateurs de données ──────────────────────────────────────────
const makeNums = (n: number): number[] =>
  // pas de doublon -> force le PIRE cas de hasDuplicate* (parcours complet)
  Array.from({ length: n }, (_, i) => i);

const makeMembers = (n: number): Member[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `m${i}`,
    email: `user${i}@tribuzen.app`,
    name: `User ${i}`,
  }));

// ─── Bench 1 : O(n) vs O(n²) sur des tailles ×4 ──────────────────────
console.log('\n=== F1 sumAll O(n) vs F2 hasDuplicateSlow O(n²) ===');
let sink = 0; // force l'usage du résultat -> empêche l'élimination de code mort
for (const n of [1_000, 4_000, 16_000, 64_000]) {
  const nums = makeNums(n);
  measure(`sumAll n=${n}`, () => { sink += sumAll(nums); });
  // n=64000 en O(n²) = ~4e9 -> on borne F2 à 16000 pour ne pas attendre des minutes
  if (n <= 16_000) {
    measure(`hasDuplicateSlow n=${n}`, () => { sink += hasDuplicateSlow(nums) ? 1 : 0; });
  }
}
console.log('sink (ignore):', sink);
// Lecture attendue :
//  - sumAll : quand n ×4, la médiane ×4 environ            -> confirme O(n)
//  - hasDuplicateSlow : quand n ×4, la médiane ×16 environ  -> confirme O(n²)

// ─── Bench 2 : lookup TribuZen — Array.find O(n) vs Map O(1) ─────────
console.log('\n=== F4 lookupFind O(n) vs F5 Map O(1) — email en DERNIÈRE position ===');
let hit = 0;
for (const n of [1_000, 4_000, 16_000, 64_000]) {
  const members = makeMembers(n);
  const targetEmail = `user${n - 1}@tribuzen.app`; // pire cas du scan : tout au bout
  const mapLookup = makeLookupMap(members);         // index construit une fois

  measure(`find   n=${n}`, () => { if (lookupFind(members, targetEmail)) hit++; });
  measure(`Map.get n=${n}`, () => { if (mapLookup(targetEmail)) hit++; });
}
console.log('hit (ignore):', hit);
// Lecture attendue :
//  - find   : la médiane grossit avec n (×4 quand n ×4)     -> O(n)
//  - Map.get : la médiane reste ~plate quel que soit n       -> O(1)
//  Conclusion TribuZen : indexer les membres dans une Map supprime le facteur n.
```

**Pourquoi ce corrigé est correct :**
- La **médiane** (et non la moyenne) isole le coût réel des pics de garbage collection.
- Le **warmup** évite de mesurer la phase interprétée avant que le JIT n'optimise.
- `makeNums` sans doublon force le **pire cas** de `hasDuplicate*` — c'est ce que le Big-O annonce.
- La cible en **dernière position** force le pire cas de `find` (scan complet), ce qui rend le contraste avec `Map.get` maximal et honnête.
- `sink` / `hit` **forcent l'utilisation** des résultats : sans ça, V8 pourrait supprimer les appels dont le retour est ignoré et fausser la mesure.
- On **borne `hasDuplicateSlow` à n = 16 000** : à 64 000 c'est ~4 milliards d'opérations — la preuve que `O(n²)` est un mur, pas une abstraction.

---

## Variante J+30 (fading)

**Même objectif, contraintes ajoutées — de mémoire, sans rouvrir ce corrigé, en 25 minutes :**

1. Ajoute une fonction `groupByDomain(members)` qui regroupe les membres par domaine d'email dans une `Map<string, Member[]>`. Prédis sa complexité temps ET espace, puis mesure-la.
2. Ajoute au bench un cas **best case** pour `lookupFind` : cible en **première** position. Montre que `find` best case = `O(1)` alors que son worst case = `O(n)` — illustre best/average/worst sur une seule fonction.
3. Remplace la médiane par un affichage **médiane + p95** dans `measure`, et explique pourquoi le p95 est plus honnête pour un SLA.
4. Contrainte : ne réutilise aucune ligne copiée du corrigé — réécris `measure` de zéro.

**Critère de réussite :** tes prédictions écrites AVANT exécution correspondent aux courbes ; tu expliques chaque écart (constantes, cache, JIT) ; le contraste `find` best vs worst est visible dans les chiffres.

---

## Application TribuZen

Dans le repo `smaurier/tribuzen` (backend NestJS), ce lab devient une vraie optimisation du `MembersService` :

```
tribuzen/src/
  members/
    members.service.ts    <- remplace Array.find par une Map<string, Member> (email -> membre)
    members.service.spec.ts
    bench/
      lookup.bench.ts      <- le measure() de ce lab, sur des données réalistes (50k membres)
```

**Ce qu'on porte :**
- La `Map` d'index email→membre construite au chargement du service → `lookupByEmail` en `O(1)`, `matchImported` en `O(n + m)` au lieu de `O(n·m)`.
- Le banc `performance.now()` (warmup + médiane) devient `bench/lookup.bench.ts`, exécuté en CI ou à la main pour **prouver** le gain avant de merger — la règle TribuZen : aucune optimisation de complexité sans mesure.

**Commit cible :**
```
perf(members): index email->Member en Map, lookup O(n)->O(1)
test(members): bench performance.now find vs Map sur 50k membres
```
