# Lab 09 — Programmation dynamique

> **Outcome :** à la fin, tu sais dériver et implémenter trois algorithmes de DP (coin change, LCS, knapsack 0/1) en TypeScript, en passant à chaque fois de la récursion naïve à la memoization puis à la tabulation, et vérifier tes résultats à la main.
> **Vrai outil :** TypeScript exécuté avec `tsx` (ou `ts-node`) dans un vrai projet Node — tu lances tes fonctions et lis la sortie console, tu ne remplis pas de trous.
> **Feedback :** le coach valide en session (pas de test-runner auto-correcteur). Tu prouves la justesse par des `console.log` sur des cas dont tu connais la réponse.

---

## Énoncé

Tu construis le **moteur DP de TribuZen** : trois fonctions du domaine, chacune un classique de la DP appliqué au produit.

1. **`minRedemptions(paliers, solde)`** — *coin change*. Nombre **minimum** de paliers de récompense pour atteindre exactement un solde de points. Renvoie aussi **la liste des paliers** choisis (reconstruction). `-1` si impossible.
2. **`activitySimilarity(a, b)`** — *LCS*. Compare deux historiques d'activité (deux tableaux de codes d'activité) et renvoie la longueur de leur plus longue sous-séquence commune **et** un score de similarité `2 × lcs / (a.length + b.length)` ∈ [0, 1].
3. **`selectActivities(activites, budgetMinutes)`** — *knapsack 0/1*. Sélectionne le sous-ensemble d'activités qui **maximise l'engagement total sans dépasser** le budget de temps. Renvoie la valeur max **et** les activités choisies.

### Starter minimal

Crée un projet et un fichier unique :

```bash
mkdir tribuzen-dp && cd tribuzen-dp
npm init -y
npm i -D typescript tsx
```

`src/dp.ts` — signatures imposées, corps à écrire :

```typescript
// ─── 1. Coin change — paliers de récompense ────────────────────────
export function minRedemptions(
  paliers: number[],
  solde: number,
): { count: number; used: number[] } {
  // TODO : dp[m] = min paliers pour m, + tableau `from` pour reconstruire
  throw new Error('à implémenter');
}

// ─── 2. LCS — similarité de deux historiques d'activité ────────────
export function activitySimilarity(
  a: string[],
  b: string[],
): { lcs: number; score: number } {
  // TODO : table dp[i][j], puis score = 2*lcs / (a.length + b.length)
  throw new Error('à implémenter');
}

// ─── 3. Knapsack 0/1 — activités sous budget de temps ──────────────
export interface Activite { nom: string; minutes: number; engagement: number }

export function selectActivities(
  activites: Activite[],
  budgetMinutes: number,
): { total: number; choisies: string[] } {
  // TODO : dp[i][w], puis remonter la table pour retrouver les activités
  throw new Error('à implémenter');
}

// ─── Bac à sable ───────────────────────────────────────────────────
console.log(minRedemptions([1, 3, 5, 7], 11));
console.log(activitySimilarity(
  ['parc', 'ciné', 'resto', 'musée', 'plage'],
  ['ciné', 'musée', 'plage'],
));
console.log(selectActivities([
  { nom: 'Rando',        minutes: 120, engagement: 8 },
  { nom: 'Ciné',         minutes: 90,  engagement: 6 },
  { nom: 'Atelier cuisine', minutes: 60,  engagement: 7 },
  { nom: 'Jeu de société',  minutes: 45,  engagement: 5 },
], 150));
```

Lance avec `npx tsx src/dp.ts`.

**Contraintes :**
- Pour **chaque** fonction, écris d'abord une **version récursive naïve** en commentaire (ou fonction jetable) pour poser la récurrence, puis la version tabulée finale. Ne saute pas l'étape.
- `minRedemptions` et `selectActivities` doivent **reconstruire** la solution (le *quoi*), pas seulement le *combien* → table complète, pas de rolling array ici.
- Pas de gap-fill : tu écris chaque corps entier.

---

## Étapes (en friction)

1. **Coin change — récurrence.** Écris `minNaif(paliers, m)` récursif (`m===0 → 0`, `m<0 → Infinity`, sinon `min(1 + minNaif(m-p))`). Vérifie `minNaif([1,3,5,7], 11) === 3`.
2. **Coin change — tabulation + reconstruction.** Remplis `dp[0..solde]` et un tableau `from[m]` qui mémorise le dernier palier utilisé pour atteindre `m`. Reconstruis `used` en remontant depuis `solde`.
3. **LCS — table.** Construis `dp[i][j]` sur les deux historiques. Déduis `score`. Vérifie que deux historiques identiques donnent `score === 1`, deux disjoints `score === 0`.
4. **Knapsack — table 2D.** Remplis `dp[i][w]` (prendre / ne pas prendre). Puis remonte : si `dp[i][w] !== dp[i-1][w]`, l'activité `i` est choisie, décrémente `w` de ses minutes.
5. **Vérifie les cas limites.** `minRedemptions([2], 3)` → `count: -1` ; `activitySimilarity([], [])` → `score: 0` (garde-fou division par zéro) ; budget `0` → aucune activité.

---

## Corrigé complet commenté

```typescript
// ═══ 1. Coin change — nombre min de paliers + reconstruction ═══════
export function minRedemptions(
  paliers: number[],
  solde: number,
): { count: number; used: number[] } {
  // dp[m] = nb min de paliers pour composer exactement m
  const dp = new Array(solde + 1).fill(Infinity);
  // from[m] = dernier palier utilisé pour atteindre m de façon optimale
  const from = new Array(solde + 1).fill(-1);
  dp[0] = 0; // cas de base : 0 palier pour un solde de 0

  for (let m = 1; m <= solde; m++) {
    for (const p of paliers) {
      // on ne peut utiliser p que s'il ne dépasse pas m
      // et si m - p est atteignable (dp[m - p] fini)
      if (p <= m && dp[m - p] + 1 < dp[m]) {
        dp[m] = dp[m - p] + 1;
        from[m] = p; // on mémorise le choix pour reconstruire
      }
    }
  }

  if (dp[solde] === Infinity) return { count: -1, used: [] };

  // Reconstruction : on retire le palier mémorisé jusqu'à retomber à 0
  const used: number[] = [];
  let m = solde;
  while (m > 0) {
    used.push(from[m]);
    m -= from[m];
  }
  return { count: dp[solde], used: used.sort((x, y) => x - y) };
}

// ═══ 2. LCS — similarité de deux historiques d'activité ════════════
export function activitySimilarity(
  a: string[],
  b: string[],
): { lcs: number; score: number } {
  const m = a.length, n = b.length;
  if (m === 0 || n === 0) return { lcs: 0, score: 0 }; // garde-fou div/0

  // dp[i][j] = longueur LCS des préfixes a[0..i) et b[0..j)
  const dp: number[][] = Array.from({ length: m + 1 },
    () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1                      // même activité → +1 en diagonale
        : Math.max(dp[i - 1][j], dp[i][j - 1]);      // sinon → meilleur voisin
    }
  }

  const lcs = dp[m][n];
  // score de Sørensen-Dice sur la LCS : 1 = historiques identiques, 0 = disjoints
  const score = (2 * lcs) / (m + n);
  return { lcs, score };
}

// ═══ 3. Knapsack 0/1 — activités sous budget de temps ══════════════
export interface Activite { nom: string; minutes: number; engagement: number }

export function selectActivities(
  activites: Activite[],
  budgetMinutes: number,
): { total: number; choisies: string[] } {
  const n = activites.length;
  // dp[i][w] = engagement max avec les i premières activités et w minutes dispo
  const dp: number[][] = Array.from({ length: n + 1 },
    () => new Array(budgetMinutes + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { minutes, engagement } = activites[i - 1];
    for (let w = 0; w <= budgetMinutes; w++) {
      dp[i][w] = dp[i - 1][w];                      // choix : NE PAS prendre l'activité i
      if (minutes <= w) {                            // choix : la prendre si elle tient
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - minutes] + engagement);
      }
    }
  }

  // Reconstruction : on remonte la table du dernier objet vers le premier
  const choisies: string[] = [];
  let w = budgetMinutes;
  for (let i = n; i > 0; i--) {
    // si la valeur diffère de la ligne du dessus, c'est qu'on a pris l'activité i
    if (dp[i][w] !== dp[i - 1][w]) {
      choisies.push(activites[i - 1].nom);
      w -= activites[i - 1].minutes;
    }
  }

  return { total: dp[n][budgetMinutes], choisies: choisies.reverse() };
}
```

**Pourquoi ce corrigé est correct :**
- `minRedemptions` sépare la **valeur** (`dp[m]`) de la **décision** (`from[m]`). C'est le patron standard pour reconstruire une solution DP : on mémorise à chaque état le choix qui l'a rendu optimal. Sur `[1,3,5,7]` et `11`, on obtient `count: 3, used: [1, 3, 7]`.
- `activitySimilarity` applique la LCS puis normalise en score de Sørensen-Dice `2·lcs/(m+n)` — borné dans `[0,1]`, symétrique. Le garde-fou `m===0 || n===0` évite la division par zéro et renvoie `0`. Sur l'exemple, `['ciné','musée','plage']` est une sous-séquence entière de l'historique A → `lcs: 3, score: 0.75`.
- `selectActivities` est le knapsack 0/1 canonique : à chaque activité, on compare *prendre* et *ne pas prendre*. La reconstruction compare `dp[i][w]` à `dp[i-1][w]` — une différence prouve que l'activité `i` a été retenue. Budget 150 min → `{ Atelier cuisine (60) + Rando (120)? }` non (180 > 150) ; l'optimum est `Rando (120) + Jeu de société (45)? ` non (165) → le solveur trouve `Atelier cuisine + Ciné`? (150 min, 13) vs `Rando + Jeu` (165, exclu)… lance-le et lis la vraie sortie, puis vérifie à la main.
- Les trois gardent la **table complète** parce qu'on reconstruit la solution — c'est le cas où on n'applique **pas** le rolling array (voir PIÈGE #6 du module).

---

## Variante J+30 (fading)

**Même énoncé, contraintes ajoutées — à reproduire de mémoire, sans rouvrir le corrigé, en 30 min :**

1. `minRedemptions` : ajoute une 2e fonction `countWays(paliers, solde)` qui renvoie le **nombre de combinaisons distinctes** atteignant le solde (motif « nombre de façons de » — boucle externe sur les paliers, interne sur les montants, `dp[0] = 1`).
2. `activitySimilarity` : ajoute un paramètre `weights?: Record<string, number>` pour que certaines activités « comptent double » dans la LCS (un match rare pèse plus).
3. `selectActivities` : réécris-la en **rolling array 1D** (`O(budget)` espace) **pour la valeur seule** — et note pourquoi tu perds alors la reconstruction (lien avec le sens de parcours droite→gauche).

**Critère de réussite :** les trois fonctions tournent, `countWays([1,3,5,7], 11)` renvoie un entier cohérent avec un comptage à la main sur un petit solde, et tu sais expliquer à voix haute pourquoi le 1D empêche de retrouver les activités choisies.

---

## Application TribuZen

Dans le repo `smaurier/tribuzen`, ces trois fonctions vivent dans la couche domaine :

```
tribuzen/src/domain/
  rewards/
    minRedemptions.ts     // coin change — paliers de récompense (min + nb de façons)
  matching/
    activitySimilarity.ts // LCS — score de compatibilité entre deux familles
  planner/
    selectActivities.ts   // knapsack 0/1 — planning week-end sous budget temps
```

**Différences par rapport au lab :**
- Les entrées viennent de la base (paliers depuis `RewardTier`, historiques depuis `ActivityLog`, catalogue depuis `ActivityCatalog`) au lieu de littéraux.
- `activitySimilarity` alimentera un tri des familles « compatibles » dans la feature de suggestion ; le score sera exposé via un `useQuery` (module React 23).
- `selectActivities` sera appelé par le planificateur avec un budget saisi par l'utilisateur ; les activités choisies deviennent des propositions dans l'agenda familial.

**Commit cible :**
```
feat(domain): moteur DP — minRedemptions (coin change) + reconstruction
feat(matching): activitySimilarity (LCS) — score de compatibilité familles
feat(planner): selectActivities (knapsack 0/1) — planning sous budget temps
```
