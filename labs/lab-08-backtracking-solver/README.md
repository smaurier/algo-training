# Lab 08 — Backtracking solver

> **Outcome :** à la fin, tu sais écrire de zéro le template `choix → explorer → défaire`, générer des permutations, résoudre un `combinationSum` avec pruning de borne, et coder un solveur de composition d'équipe sous contraintes.
> **Vrai outil :** TypeScript + `tsx` (exécution directe des fichiers `.ts` dans le terminal, sortie observée avec `console.log`).
> **Feedback :** le coach valide en session — pas de test-runner auto-correcteur. Tu compares tes sorties `console.log` aux résultats attendus donnés ci-dessous.

---

## Énoncé

Tu construis le cœur du moteur combinatoire de TribuZen, en trois briques indépendantes qui partagent le **même squelette** `choix → explorer → défaire` :

1. **`permutations(nums)`** — tous les ordres possibles de `nums`. Base du template, sans pruning.
2. **`combinationSum(candidates, target)`** — toutes les combinaisons (avec réutilisation) dont la somme vaut `target`, avec **pruning de borne** (tri + `break`).
3. **`composeTeams(members, size, options)`** — le solveur métier : toutes les équipes de `size` membres valides, en **coupant** dès qu'une paire incompatible cohabite (pruning de contrainte).

### Setup

```
lab-08-backtracking-solver/
  src/
    permutations.ts    ← à écrire
    combinationSum.ts  ← à écrire
    composeTeams.ts    ← à écrire
    run.ts             ← importe les trois et console.log les résultats
  package.json
  tsconfig.json
```

```bash
npm init -y
npm install -D typescript tsx
npx tsx src/run.ts   # exécute et affiche les sorties
```

### Sorties attendues (à reproduire)

```ts
permutations([1, 2, 3]);
// [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]

combinationSum([2, 3, 6, 7], 7);
// [[2,2,3],[7]]

composeTeams(['Alice', 'Bob', 'Chloé', 'Dan'], 3, {
  incompatibles: [['Bob', 'Chloé']],
});
// [['Alice','Bob','Dan'],['Alice','Chloé','Dan']]
// (toutes les équipes contenant Bob ET Chloé sont coupées)
```

**Contraintes :**
- Le squelette `apply / backtrack / undo` doit être **visible** dans les trois fonctions (pas de one-liner `flatMap` déguisé).
- `combinationSum` doit **trier** puis utiliser `break` (pas `continue`) pour le pruning de borne.
- `composeTeams` doit tester l'incompatibilité **pendant** la construction (au moment du choix), jamais filtrer après coup.
- Chaque collecte fige une copie : `result.push([...current])`, jamais `result.push(current)`.

---

## Étapes (en friction)

1. **`permutations.ts`** — signature `permutations<T>(nums: T[]): T[][]`. Fonction interne `backtrack(current, remaining)`. Cas de base : `remaining.length === 0` → `result.push([...current])`. Boucle sur `remaining`, retire l'élément `i` pour le `remaining` suivant, `push` / recurse / `pop`.
2. **`combinationSum.ts`** — trie une copie de `candidates`. `backtrack(start, current, remaining)`. Cas de base `remaining === 0`. Dans la boucle : `if (sorted[i] > remaining) break;`, puis recurse avec `i` (pas `i+1`, réutilisation autorisée) et `remaining - sorted[i]`.
3. **`composeTeams.ts`** — signature avec `options: { incompatibles?: [string,string][] }`. `backtrack(start, current)`. Cas de base `current.length === size`. Avant de descendre, écris `isValid(current, candidate)` qui refuse le candidat s'il crée une paire incompatible. Applique le pruning au moment du choix.
4. **`run.ts`** — importe les trois, `console.log` chaque sortie, compare aux résultats attendus.
5. **Vérifie le pruning** : ajoute un `let calls = 0; calls++` en tête de `backtrack` dans `composeTeams`, logge-le. Compare avec une version qui filtre après coup — mesure combien d'appels tu économises.

---

## Corrigé complet commenté

```ts
// ─── src/permutations.ts ─────────────────────────────────────────
// Template pur : aucun pruning, on visite les n! feuilles.
export function permutations<T>(nums: T[]): T[][] {
  const result: T[][] = [];

  function backtrack(current: T[], remaining: T[]): void {
    if (remaining.length === 0) {
      result.push([...current]); // COLLECTE : copie figée, pas la référence
      return;
    }

    for (let i = 0; i < remaining.length; i++) {
      current.push(remaining[i]); // CHOISIR : cet élément vient en position courante
      // remaining privé de l'index i pour la descente
      const next = [...remaining.slice(0, i), ...remaining.slice(i + 1)];
      backtrack(current, next); // EXPLORER
      current.pop(); // DÉFAIRE : on rend la place pour essayer l'élément suivant
    }
  }

  backtrack([], nums);
  return result;
}

// ─── src/combinationSum.ts ───────────────────────────────────────
// Pruning de BORNE : tri croissant + break dès qu'un candidat dépasse le reste.
export function combinationSum(candidates: number[], target: number): number[][] {
  const result: number[][] = [];
  // Le tri est ce qui autorise le break (au lieu de continue).
  const sorted = [...candidates].sort((a, b) => a - b);

  function backtrack(start: number, current: number[], remaining: number): void {
    if (remaining === 0) {
      result.push([...current]); // somme atteinte pile → solution
      return;
    }

    for (let i = start; i < sorted.length; i++) {
      // sorted croissant : si celui-ci dépasse, tous les suivants aussi → break.
      if (sorted[i] > remaining) break; // PRUNING de borne

      current.push(sorted[i]); // CHOISIR
      // i, pas i+1 : on autorise la réutilisation du même candidat
      backtrack(i, current, remaining - sorted[i]); // EXPLORER
      current.pop(); // DÉFAIRE
    }
  }

  backtrack(0, [], target);
  return result;
}

// ─── src/composeTeams.ts ─────────────────────────────────────────
// Pruning de CONTRAINTE : on teste l'incompatibilité au moment du choix,
// jamais en filtrant après coup → on ne construit pas les branches mortes.
interface ComposeOptions {
  incompatibles?: [string, string][]; // paires qui ne peuvent pas coexister
}

export function composeTeams(
  members: string[],
  size: number,
  options: ComposeOptions = {},
): string[][] {
  const result: string[][] = [];
  const incompatibles = options.incompatibles ?? [];

  // Le candidat crée-t-il une paire interdite avec un membre déjà dans l'équipe ?
  function isValid(current: string[], candidate: string): boolean {
    return !incompatibles.some(
      ([a, b]) =>
        (candidate === a && current.includes(b)) ||
        (candidate === b && current.includes(a)),
    );
  }

  function backtrack(start: number, current: string[]): void {
    if (current.length === size) {
      result.push([...current]); // équipe complète et valide
      return;
    }
    // Pruning de faisabilité : plus assez de membres pour compléter → on coupe.
    if (members.length - start < size - current.length) return;

    for (let i = start; i < members.length; i++) {
      const candidate = members[i];
      if (!isValid(current, candidate)) continue; // PRUNING de contrainte

      current.push(candidate); // CHOISIR
      backtrack(i + 1, current); // EXPLORER (i+1 : chaque membre une seule fois)
      current.pop(); // DÉFAIRE
    }
  }

  backtrack(0, []);
  return result;
}

// ─── src/run.ts ──────────────────────────────────────────────────
import { permutations } from './permutations';
import { combinationSum } from './combinationSum';
import { composeTeams } from './composeTeams';

console.log('permutations:', permutations([1, 2, 3]));
// [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]

console.log('combinationSum:', combinationSum([2, 3, 6, 7], 7));
// [[2,2,3],[7]]

console.log(
  'composeTeams:',
  composeTeams(['Alice', 'Bob', 'Chloé', 'Dan'], 3, {
    incompatibles: [['Bob', 'Chloé']],
  }),
);
// [['Alice','Bob','Dan'],['Alice','Chloé','Dan']]
```

**Pourquoi ce corrigé est correct :**
- Les trois fonctions exposent le **même** squelette `apply / backtrack / undo` — seuls le cas de base, les candidats et le pruning changent. C'est la thèse du module.
- `combinationSum` récurse avec `i` (réutilisation) alors que `composeTeams` récurse avec `i + 1` (chaque membre une seule fois) : la différence tient à une seule lettre, à bien nommer mentalement.
- Le pruning de `composeTeams` est appliqué **au moment du choix** (`continue` sur `isValid`) : on ne descend jamais dans un sous-arbre où Bob et Chloé cohabitent — contrairement au naïf qui les construit puis les jette.
- Chaque collecte utilise `[...current]` : sans la copie, `result` contiendrait des références au même tableau muté.

---

## Variante J+30 (fading)

**Même objectif, contraintes ajoutées — reproduire de mémoire, sans rouvrir ce corrigé, en 30 minutes :**

1. Ajoute à `composeTeams` une option `mustInclude?: string` : toute équipe valide doit contenir ce membre. Applique-le en **pruning** (pas en filtre final) — indice : vérifie la faisabilité (le membre est-il encore atteignable dans le reste `start..n` ?) et coupe sinon.
2. Écris `balancedPartition(members, caps)` (section 2.6 du module) : répartis `members` en groupes de capacités `caps` (ex: `[2, 2]`), en élaguant dès qu'un groupe déborde. Sortie pour `(['A','B','C','D'], [2,2])` : les partitions en deux paires.
3. **Sans réutiliser** `combinationSum` ni relire le module 08.

**Critère de réussite :** `composeTeams(['Alice','Bob','Chloé','Dan'], 3, { mustInclude: 'Chloé', incompatibles: [['Bob','Chloé']] })` renvoie uniquement les équipes contenant Chloé et sans Bob ; `balancedPartition` produit des groupes tous pleins, chaque membre placé une fois.

---

## Application TribuZen

Dans le repo `smaurier/tribuzen`, ces fonctions vivent ici :

```
tribuzen/src/lib/
  teams/
    composeTeams.ts        ← le solveur de ce lab, tel quel
    balancedPartition.ts   ← la variante J+30
  planning/
    scheduleSlots.ts       ← même squelette, "conflit de créneau" au lieu de "paire interdite"
```

**Différences par rapport au lab :**
- Les `members` seront des objets `Member` (id, nom, tags) au lieu de `string` — `isValid` comparera des `id` et pourra croiser d'autres champs (rôle, âge, préférences).
- Les incompatibilités viendront de la base (table `member_conflicts`) et non d'un tableau en dur.
- Pour les grandes familles, on plafonnera le nombre de solutions retournées (early-return quand `result.length` atteint une limite) — un pruning de plus.

**Commit cible :**
```
feat(teams): composeTeams — génération d'équipes sous contraintes (backtracking + pruning)
feat(teams): balancedPartition — répartition en sous-groupes équilibrés
```
