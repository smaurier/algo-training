---
titre: Projet final — moteur de recommandation TribuZen
cours: 05-algorithms
notions: [assemblage d'algorithmes en système, méthode de résolution end-to-end, graphe de proximité + BFS pondéré, scoring multi-signaux, top-K par heap, sélection sous contrainte (greedy vs DP), index hash maps, analyse de complexité globale, récapitulatif du parcours algo, aborder un problème algo en entretien ESN]
outcomes: [assembler graphe/tri/heap/DP/hash maps en un livrable end-to-end, choisir l'algo adapté à chaque signal d'un problème produit, dérouler une résolution structurée face à un énoncé algo d'entretien ESN]
prerequis: [11-patterns-js-fullstack]
next: fin-du-parcours
libs: []
tribuzen: recommandations — recommendActivities(memberId) combine graphe de proximité, scoring top-K et filtrage sous contrainte (aboutissement du fil-rouge)
last-reviewed: 2026-07
---

# Projet final — moteur de recommandation TribuZen

> **Outcomes — tu sauras FAIRE :** assembler graphe / tri / heap / DP / hash maps en un livrable end-to-end, choisir l'algorithme adapté à chaque signal d'un problème produit, dérouler une résolution structurée face à un énoncé algo d'entretien ESN.
> **Difficulté :** :star::star::star::star::star:

## 1. Cas concret d'abord

Dernier module. Pas de nouvelle notion : on **assemble** tout le cours en un seul livrable réel de TribuZen.

Le problème produit : sur la home d'un membre, TribuZen doit afficher **« Activités pour toi »** — une liste ordonnée d'activités que ce membre n'a pas encore rejointes, pertinentes pour lui, et **réalisables** (budget restant, créneaux libres). L'équipe te donne la signature attendue :

```ts
// Ce qu'on doit livrer — un seul point d'entrée
function recommendActivities(memberId: string): RecommendedActivity[];
```

Derrière cette signature, quatre questions algorithmiques distinctes se cachent :

1. **De qui ce membre est-il proche ?** Les activités appréciées par des membres proches (même famille, amis d'amis) sont de bons candidats. → **graphe + BFS pondéré** (module 07).
2. **Quelles activités valent le coup pour lui ?** Il faut un **score** par activité, mélangeant proximité, popularité, affinité de tags, note moyenne. → **scoring multi-signaux + hash maps** (modules 02, 05).
3. **Comment sortir les meilleures sans trier 10 000 activités ?** → **top-K par heap** (module 05).
4. **Comment tenir un budget mensuel et un quota de temps ?** Sélectionner un sous-ensemble d'activités qui maximise le score sous contrainte. → **greedy** ou **DP knapsack** (modules 09, 10).

Le tout doit rester rapide (module 01 : on analyse la complexité de chaque étape). Ce module montre comment **choisir le bon algo par signal** et les **souder** en un système cohérent — exactement ce qu'on attend de toi en entretien ESN sur un problème « conçois un moteur de reco ».

---

## 2. Théorie complète, concise — la méthodologie d'assemblage

Un projet algo end-to-end ne s'improvise pas. On applique la **méthode de résolution en 6 étapes** vue au module 00, mais à l'échelle d'un système.

### 2.1 Étape 1 — Décomposer le problème en signaux

Un « moteur de reco » est vague. On le rend traitable en le cassant en **signaux mesurables**, chacun mappé à un algorithme connu :

| Question produit | Signal | Algorithme | Module |
|---|---|---|---|
| De qui suis-je proche ? | `proximity[activityId]` | graphe + BFS pondéré | 07 |
| Qu'est-ce qui est populaire ? | `popularity[activityId]` | agrégation hash map | 02 |
| Qu'est-ce qui me ressemble ? | `affinity[activityId]` | intersection de tags (Set) | 02 |
| Qu'est-ce qui est bien noté ? | `quality[activityId]` | moyenne / normalisation | 01 |
| Le top sans tout trier ? | `topK` | min-heap taille K | 05 |
| Que puis-je me permettre ? | sélection finale | greedy / DP knapsack | 09, 10 |

**Règle de découpage :** un signal = une fonction pure `Activity → number`. On les calcule séparément, on les combine par une somme pondérée. Chaque fonction est testable et remplaçable isolément.

### 2.2 Étape 2 — Indexer d'abord (préparer les structures)

Aucune requête n'est rapide si les données sont dans des tableaux qu'on rescanne. On construit **une seule fois** des index hash map (module 02) :

```ts
interface Activity {
  id: string;
  title: string;
  tags: string[];        // ['sport', 'plein-air', 'famille']
  category: string;      // 'sport' | 'culture' | 'détente'
  price: number;         // euros
  durationMin: number;   // minutes
  rating: number;        // 0..5
  joinCount: number;     // nb de membres inscrits
}

interface Member {
  id: string;
  familyId: string;
  friends: string[];          // ids de membres
  joinedActivities: string[]; // ids d'activités déjà rejointes
  preferredTags: string[];    // ['sport', 'plein-air']
  monthlyBudget: number;      // euros restants ce mois
  monthlyMinutes: number;     // temps dispo ce mois
}

class ActivityIndex {
  readonly byId = new Map<string, Activity>();
  readonly byTag = new Map<string, Set<string>>();      // tag → activityIds
  readonly joinedBy = new Map<string, Set<string>>();   // activityId → memberIds

  constructor(activities: Activity[], members: Member[]) {
    for (const a of activities) {
      this.byId.set(a.id, a);
      for (const tag of a.tags) {
        if (!this.byTag.has(tag)) this.byTag.set(tag, new Set());
        this.byTag.get(tag)!.add(a.id);
      }
    }
    // Index inversé activité → membres inscrits (pour le signal proximité)
    for (const m of members) {
      for (const actId of m.joinedActivities) {
        if (!this.joinedBy.has(actId)) this.joinedBy.set(actId, new Set());
        this.joinedBy.get(actId)!.add(m.id);
      }
    }
  }
}
```

Construction O(A·T + M·J) une fois ; ensuite chaque lookup est O(1). C'est l'inversion du coût : on paie l'indexation au démarrage pour rendre chaque requête utilisateur instantanée (modules 01, 02).

### 2.3 Étape 3 — Le graphe de proximité (BFS pondéré)

Deux membres sont **reliés** s'ils sont dans la même famille, amis, ou amis d'amis. On construit un graphe non orienté pondéré et on calcule la **proximité** depuis le membre cible par un BFS qui atténue le poids à chaque saut (module 07).

```ts
type SocialGraph = Map<string, Map<string, number>>; // memberId → (memberId → poids arête)

function buildSocialGraph(members: Member[]): SocialGraph {
  const g: SocialGraph = new Map();
  const link = (a: string, b: string, w: number) => {
    if (!g.has(a)) g.set(a, new Map());
    // garde le lien le plus fort si plusieurs sources
    const prev = g.get(a)!.get(b) ?? 0;
    g.get(a)!.set(b, Math.max(prev, w));
  };

  // Regrouper par famille pour relier les membres d'une même famille
  const byFamily = new Map<string, string[]>();
  for (const m of members) {
    if (!byFamily.has(m.familyId)) byFamily.set(m.familyId, []);
    byFamily.get(m.familyId)!.push(m.id);
  }
  for (const ids of byFamily.values()) {
    for (let i = 0; i < ids.length; i++)
      for (let j = i + 1; j < ids.length; j++) {
        link(ids[i], ids[j], 3); // même famille = lien fort
        link(ids[j], ids[i], 3);
      }
  }
  // Liens d'amitié
  for (const m of members) {
    for (const f of m.friends) {
      link(m.id, f, 2);
      link(f, m.id, 2);
    }
  }
  return g;
}

// BFS pondéré borné : proximité(other) décroît avec la distance sociale.
// On limite à `maxHops` sauts pour ne pas parcourir tout le graphe.
function proximityFrom(
  graph: SocialGraph,
  start: string,
  maxHops = 2,
): Map<string, number> {
  const prox = new Map<string, number>();
  const queue: Array<{ id: string; hops: number; strength: number }> = [
    { id: start, hops: 0, strength: 1 },
  ];
  const seen = new Set<string>([start]);

  while (queue.length > 0) {
    const { id, hops, strength } = queue.shift()!; // BFS niveau par niveau
    if (hops >= maxHops) continue;

    for (const [next, weight] of graph.get(id) ?? []) {
      if (seen.has(next)) continue;
      seen.add(next);
      // atténuation : chaque saut divise l'influence
      const nextStrength = strength * (weight / 10);
      prox.set(next, (prox.get(next) ?? 0) + nextStrength);
      queue.push({ id: next, hops: hops + 1, strength: nextStrength });
    }
  }
  return prox; // memberId → score de proximité (0 = inconnu / lointain)
}
```

> Pourquoi BFS et pas Dijkstra ? On ne cherche pas le plus court chemin exact : on veut un **rayon social borné** (amis + amis d'amis) avec une influence qui décroît. BFS borné à `maxHops` est O(V+E) sur le voisinage exploré, largement suffisant.

### 2.4 Étape 4 — Le scoring multi-signaux

Chaque activité candidate reçoit un score = somme pondérée des signaux. La proximité d'une activité vient des membres proches qui l'ont rejointe.

```ts
interface WeightConfig {
  proximity: number;
  popularity: number;
  affinity: number;
  quality: number;
}

const DEFAULT_WEIGHTS: WeightConfig = {
  proximity: 4,   // ce que mes proches font pèse le plus
  popularity: 1,
  affinity: 3,    // mes tags préférés
  quality: 2,     // note moyenne
};

function scoreActivity(
  activity: Activity,
  member: Member,
  index: ActivityIndex,
  memberProximity: Map<string, number>,
  maxJoin: number,          // pour normaliser la popularité
  w = DEFAULT_WEIGHTS,
): number {
  // Signal proximité : somme des proximités des membres proches inscrits
  let proximity = 0;
  for (const otherId of index.joinedBy.get(activity.id) ?? []) {
    proximity += memberProximity.get(otherId) ?? 0;
  }
  // Signal popularité normalisé 0..1
  const popularity = maxJoin > 0 ? activity.joinCount / maxJoin : 0;
  // Signal affinité : tags communs avec les préférences
  const prefs = new Set(member.preferredTags);
  const affinity = activity.tags.filter((t) => prefs.has(t)).length;
  // Signal qualité normalisé 0..1
  const quality = activity.rating / 5;

  return (
    proximity * w.proximity +
    popularity * w.popularity +
    affinity * w.affinity +
    quality * w.quality
  );
}
```

### 2.5 Étape 5 — Top-K sans trier tout (min-heap)

Trier 10 000 activités pour n'en garder que 50 est du gâchis : O(A log A). Un **min-heap de taille K** donne le top-K en O(A log K) (module 05).

```ts
// MinHeap minimal sur { id, score } — voir module 05 pour l'implémentation complète
class MinHeap<T> {
  private data: T[] = [];
  constructor(private less: (a: T, b: T) => boolean) {}
  get size() { return this.data.length; }
  peek() { return this.data[0]; }
  push(v: T) {
    this.data.push(v);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.less(this.data[i], this.data[p])) {
        [this.data[i], this.data[p]] = [this.data[p], this.data[i]];
        i = p;
      } else break;
    }
  }
  pop(): T {
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      let i = 0;
      const n = this.data.length;
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let m = i;
        if (l < n && this.less(this.data[l], this.data[m])) m = l;
        if (r < n && this.less(this.data[r], this.data[m])) m = r;
        if (m === i) break;
        [this.data[i], this.data[m]] = [this.data[m], this.data[i]];
        i = m;
      }
    }
    return top;
  }
}

interface Scored { id: string; score: number; }

// On garde les K plus HAUTS scores → heap MIN (on éjecte le plus petit)
function topK(scored: Scored[], k: number): Scored[] {
  const heap = new MinHeap<Scored>((a, b) => a.score < b.score);
  for (const s of scored) {
    if (heap.size < k) heap.push(s);
    else if (s.score > heap.peek().score) { heap.pop(); heap.push(s); }
  }
  const out: Scored[] = [];
  while (heap.size > 0) out.push(heap.pop());
  return out.reverse(); // du plus haut au plus bas
}
```

### 2.6 Étape 6 — Sélection sous contrainte (greedy vs DP knapsack)

Le membre a un **budget** (euros) et un **quota de temps** (minutes) pour le mois. On veut la sélection d'activités qui **maximise le score total** sans dépasser ces limites. C'est un problème de sac à dos.

**Deux stratégies, deux compromis :**

- **Greedy par ratio** (module 10) — trier par `score / coût`, prendre tant que ça rentre. O(K log K). Rapide, **pas toujours optimal**, mais excellent en pratique quand les coûts sont petits face au budget.
- **DP knapsack** (module 09) — optimal exact, O(K · budget) en table. À réserver aux petites capacités entières.

```ts
// Version greedy sur contraintes budget + temps. Bon défaut pour la home.
function selectGreedy(
  candidates: Array<Scored & { price: number; durationMin: number }>,
  budget: number,
  minutes: number,
): Scored[] {
  const byRatio = [...candidates].sort(
    (a, b) => b.score / (b.price + 1) - a.score / (a.price + 1),
  );
  const chosen: Scored[] = [];
  let spentE = 0, spentM = 0;
  for (const c of byRatio) {
    if (spentE + c.price <= budget && spentM + c.durationMin <= minutes) {
      chosen.push({ id: c.id, score: c.score });
      spentE += c.price;
      spentM += c.durationMin;
    }
  }
  return chosen;
}

// Version DP 0/1 knapsack sur le budget (optimal exact), prix entiers.
function selectKnapsack(
  candidates: Array<Scored & { price: number }>,
  budget: number,
): Scored[] {
  const n = candidates.length;
  // dp[i][b] = meilleur score avec les i premiers items et budget b
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(budget + 1).fill(0),
  );
  for (let i = 1; i <= n; i++) {
    const { price, score } = candidates[i - 1];
    for (let b = 0; b <= budget; b++) {
      dp[i][b] = dp[i - 1][b]; // ne pas prendre
      if (price <= b) {
        dp[i][b] = Math.max(dp[i][b], dp[i - 1][b - price] + score); // prendre
      }
    }
  }
  // Backtrack pour retrouver les items choisis
  const chosen: Scored[] = [];
  let b = budget;
  for (let i = n; i >= 1; i--) {
    if (dp[i][b] !== dp[i - 1][b]) {
      const item = candidates[i - 1];
      chosen.push({ id: item.id, score: item.score });
      b -= item.price;
    }
  }
  return chosen;
}
```

> **Quel choix par défaut ?** Greedy. Sur une home, le budget est grand devant le prix d'une activité, l'écart à l'optimum est négligeable, et O(K log K) tient sous la milliseconde. On garde DP pour un cas où l'optimalité exacte compte (ex. : suggérer un « pack mensuel » vendu comme optimal).

---

## 3. Worked examples — construction guidée du livrable

### Exemple 1 — Assembler `recommendActivities` de bout en bout

On soude les six étapes derrière la signature demandée.

```ts
interface RecommendedActivity {
  activity: Activity;
  score: number;
  reason: string; // explicabilité : pourquoi cette reco
}

class RecommendationEngine {
  private index: ActivityIndex;
  private graph: SocialGraph;
  private byMemberId: Map<string, Member>;
  private maxJoin: number;

  constructor(
    private activities: Activity[],
    private members: Member[],
  ) {
    // Étape 2 — indexation (une seule fois)
    this.index = new ActivityIndex(activities, members);
    // Étape 3 — graphe social (une seule fois)
    this.graph = buildSocialGraph(members);
    // lookup membre O(1)
    this.byMemberId = new Map(members.map((m) => [m.id, m]));
    // pré-calcul pour la normalisation popularité
    this.maxJoin = Math.max(1, ...activities.map((a) => a.joinCount));
  }

  recommendActivities(memberId: string, k = 20): RecommendedActivity[] {
    const member = this.byMemberId.get(memberId);
    if (!member) return [];

    // Étape 3 (requête) — proximité sociale depuis ce membre
    const proximity = proximityFrom(this.graph, memberId, 2);

    // Candidats = activités NON déjà rejointes (Set → O(1) exclusion)
    const joined = new Set(member.joinedActivities);
    const candidates = this.activities.filter((a) => !joined.has(a.id));

    // Étape 4 — scoring de chaque candidat
    const scored = candidates.map((a) => ({
      id: a.id,
      score: scoreActivity(a, member, this.index, proximity, this.maxJoin),
    }));

    // Étape 5 — top-K par heap (on prélève large avant la contrainte)
    const best = topK(scored, k * 2);

    // Étape 6 — sélection sous contrainte budget + temps (greedy)
    const withCost = best.map((s) => {
      const a = this.index.byId.get(s.id)!;
      return { ...s, price: a.price, durationMin: a.durationMin };
    });
    const selected = selectGreedy(
      withCost,
      member.monthlyBudget,
      member.monthlyMinutes,
    );

    // Habillage : activité complète + explication
    return selected
      .slice(0, k)
      .map((s) => {
        const a = this.index.byId.get(s.id)!;
        const prefs = new Set(member.preferredTags);
        const matched = a.tags.filter((t) => prefs.has(t));
        const reason =
          matched.length > 0
            ? `Correspond à tes goûts (${matched.join(', ')})`
            : 'Apprécié par des membres proches de toi';
        return { activity: a, score: s.score, reason };
      });
  }
}

// === Utilisation ===
const engine = new RecommendationEngine(activities, members);
const recos = engine.recommendActivities('m1', 5);
for (const r of recos) {
  console.log(`${r.activity.title} — ${r.score.toFixed(1)} — ${r.reason}`);
}
```

**Ce que l'assemblage démontre :**
- Chaque module du cours devient **une étape nommée** du pipeline.
- Les structures lourdes (index, graphe) sont construites **une fois** dans le constructeur ; la requête ne fait que du lookup + calcul borné.
- Le résultat est **explicable** (`reason`) — un signal que tu penses produit, pas seulement algo.

### Exemple 2 — Analyser la complexité globale (fading vers l'entretien)

En entretien ESN, après avoir codé, on te demande **« et la complexité ? »**. On la construit étape par étape.

```
Notation : A = nb activités, M = nb membres, D = degré social moyen,
           K = taille du top demandé, B = budget (entier)

Construction (une fois, au boot) :
  index          O(A·T + M·J)      T = tags/activité, J = activités/membre
  graphe social  O(M·D)            liens famille + amis

Par requête recommendActivities(memberId) :
  proximité BFS  O(D^maxHops)      borné (maxHops=2) → petit, quasi constant
  scoring        O(A · J̄)          J̄ = membres inscrits moyens par activité
  top-K heap     O(A log K)        au lieu de O(A log A) pour un tri complet
  greedy         O(K log K)        tri des candidats par ratio
  ─────────────────────────────────────────────────────
  total requête  O(A log K)        dominé par le scoring + heap
```

**Le point clé à verbaliser :** on a transformé un problème qui semblait O(A²) (comparer chaque activité à chaque membre) en O(A log K) par requête, grâce à l'indexation préalable et au heap. L'intervieweur cherche exactement ce raisonnement : *où est le coût, comment je le déplace, quelle structure le tue.*

---

## 4. Pièges & misconceptions

### PIÈGE #1 — Trier tout pour ne garder que K

```ts
// ❌ O(A log A) : on trie 10 000 activités pour en afficher 20
const best = scored.sort((a, b) => b.score - a.score).slice(0, 20);

// ✅ O(A log K) : min-heap de taille K
const best = topK(scored, 20);
```

**Pourquoi c'est faux :** trier produit un ordre total dont on jette 99 %. Le heap ne maintient que les K meilleurs. Sur petit A la différence est invisible ; à l'échelle, elle est décisive — et c'est le genre d'optimisation qu'un intervieweur attend que tu **proposes spontanément**.

### PIÈGE #2 — Greedy présenté comme toujours optimal

```
// ❌ "Je trie par ratio score/prix et je prends → c'est optimal"
```

Faux pour le sac à dos **0/1** : greedy peut rater la combinaison optimale (l'exemple classique : un gros item de meilleur score global qu'on ne peut plus prendre après avoir pris deux petits). Greedy est **optimal pour le sac à dos fractionnaire**, pas 0/1. Le correct : *« greedy est une heuristique rapide et proche de l'optimal quand les coûts sont petits face au budget ; pour l'optimum exact sur capacité entière, DP knapsack en O(K·B) »*. Savoir **nommer** cette limite vaut plus que la coder.

### PIÈGE #3 — Recalculer index et graphe à chaque requête

```ts
// ❌ On reconstruit tout à chaque appel
function recommend(memberId: string) {
  const index = new ActivityIndex(activities, members); // O(A+M) à CHAQUE reco !
  const graph = buildSocialGraph(members);
  // ...
}

// ✅ Construits une fois dans le constructeur, réutilisés par requête
class RecommendationEngine {
  constructor(/* ... */) { this.index = /* ... */; this.graph = /* ... */; }
  recommendActivities(memberId: string) { /* utilise this.index */ }
}
```

**Pourquoi c'est faux :** l'indexation est un coût d'amortissement (module 01) — on le paie une fois pour rendre N requêtes rapides. Le refaire par requête annule tout le bénéfice et transforme du O(1) en O(A).

### PIÈGE #4 — BFS non borné sur un grand graphe social

```ts
// ❌ BFS qui parcourt tout le composant connexe
function proximityFrom(graph, start) { /* pas de maxHops → tout le graphe */ }
```

Sur un réseau social, tout est plus ou moins connecté : un BFS sans borne visite des milliers de membres pour une influence quasi nulle au 5e saut. **Borne `maxHops` à 2** (amis d'amis) : au-delà, le signal ne vaut plus son coût. Discriminer « le graphe est petit » de « le graphe est petit *autour de moi* » est le réflexe clé.

### PIÈGE #5 — Oublier d'exclure le déjà-fait

Recommander une activité que le membre a **déjà rejointe** casse la confiance produit. L'exclusion doit passer par un `Set` (O(1)), pas un `Array.includes` (O(J)) dans une boucle sur A → sinon O(A·J).

```ts
// ✅ Set construit une fois, exclusion O(1)
const joined = new Set(member.joinedActivities);
const candidates = activities.filter((a) => !joined.has(a.id));
```

---

## 5. Ancrage TribuZen

Ce module **est** la couche « recommandations » du fil-rouge — l'aboutissement du cours 05. `recommendActivities(memberId)` alimente le bloc **« Activités pour toi »** de la home d'un membre TribuZen.

Fichiers cibles dans `smaurier/tribuzen` :

```
tribuzen/src/
  server/
    reco/
      ActivityIndex.ts        # étape 2 — index hash maps (module 02)
      socialGraph.ts          # étape 3 — buildSocialGraph + proximityFrom (module 07)
      scoreActivity.ts        # étape 4 — scoring multi-signaux (modules 01,02,05)
      topK.ts                 # étape 5 — MinHeap top-K (module 05)
      selectUnderBudget.ts    # étape 6 — greedy + DP knapsack (modules 09,10)
      RecommendationEngine.ts # assemblage recommendActivities()
    routes/
      recommendations.ts      # GET /api/members/:id/recommendations
```

Chaque signal reste une fonction pure remplaçable : le jour où le produit veut pondérer la nouveauté d'une activité, on ajoute un `noveltyScore` sans toucher au reste. Le graphe social et l'index se reconstruisent en tâche de fond (cron / worker, module 11) quand membres ou activités changent, pas à chaque requête.

**Le fil-rouge, bouclé :** dédup de membres (02) → tri de familles (05) → arbre de catégories (06) → graphe de relations (07) → et ici, tout converge : le graphe, le tri/heap, le DP et les hash maps servent **ensemble** un seul endpoint produit.

### Aborder un problème algo en entretien ESN

Le même réflexe méthodique qui a construit ce moteur sert face à un énoncé d'entretien :

1. **Reformuler et clarifier** — « Le moteur reco : combien d'activités ? de membres ? une contrainte de temps de réponse ? ». On borne le problème avant de coder.
2. **Découper en signaux / sous-problèmes** — nommer à voix haute chaque brique (proximité, popularité, contrainte) et l'algo associé. Montre que tu **pattern-matches** (module 00).
3. **Commencer par la solution naïve, annoncer sa complexité** — « en O(A²) je compare tout ; on peut mieux ». Ne jamais rester bloqué à chercher l'optimal d'emblée.
4. **Optimiser en déplaçant le coût** — index, heap, borne : verbaliser *pourquoi* chaque structure baisse la complexité.
5. **Coder proprement une brique**, pas tout — l'intervieweur regarde ta manière de découper plus que 500 lignes.
6. **Conclure sur complexité + limites** — « greedy ici, DP si l'optimum exact compte ». Nommer les compromis est le signal senior.

---

## 6. Points clés

1. Un projet algo end-to-end se découpe en **signaux mesurables**, chacun mappé à un algorithme connu du cours.
2. On **indexe une fois** (hash maps, graphe) pour rendre chaque requête utilisateur rapide — amortissement du coût.
3. La **proximité sociale** se calcule par un **BFS pondéré borné** (`maxHops`), pas par un parcours complet.
4. Le **scoring multi-signaux** est une somme pondérée de fonctions pures ; les poids se règlent côté produit.
5. Le **top-K** se fait par **min-heap de taille K** en O(A log K), jamais par un tri complet O(A log A).
6. La **sélection sous contrainte** est un sac à dos : **greedy** (rapide, quasi-optimal) par défaut, **DP knapsack** pour l'optimum exact sur capacité entière.
7. La **complexité globale** se construit étape par étape ; savoir dire *où est le coût et comment on le déplace* est l'attendu senior en entretien ESN.

---

## 7. Seeds Anki

```
Comment aborder un "moteur de reco" pour le rendre traitable algorithmiquement ?|Le découper en signaux mesurables (proximité, popularité, affinité, qualité), chacun mappé à un algo connu (graphe/BFS, hash map, Set, normalisation), combinés par une somme pondérée de fonctions pures.
Pourquoi indexer les données une fois dans le constructeur plutôt qu'à chaque requête ?|L'indexation est un coût amorti : on le paie une fois (O(A+M)) pour rendre chaque requête O(1) en lookup. La refaire par requête annule le bénéfice et transforme du O(1) en O(A).
Quel algorithme pour le signal de proximité sociale, et pourquoi borné ?|Un BFS pondéré depuis le membre, borné à maxHops (≈2, amis d'amis), avec atténuation du poids par saut. Borné car sur un réseau social un BFS complet visite tout le composant pour un signal quasi nul au-delà de 2 sauts.
Pourquoi un min-heap de taille K plutôt qu'un tri complet pour le top-K ?|Trier tout est O(A log A) et jette 99% de l'ordre produit. Un min-heap de taille K garde seulement les K meilleurs en O(A log K) : on éjecte le plus petit dès que le heap dépasse K.
Greedy par ratio est-il optimal pour la sélection sous budget ?|Non pour le sac à dos 0/1 : c'est une heuristique rapide (O(K log K)), quasi-optimale quand les coûts sont petits face au budget. L'optimum exact sur capacité entière demande un DP knapsack en O(K·B).
Comment exclure efficacement les activités déjà rejointes ?|Construire un Set des joinedActivities (O(J)) puis filtrer avec .has() en O(1) par activité → O(A) global, au lieu de Array.includes en O(J) par activité qui donnerait O(A·J).
Quelle est la complexité par requête de recommendActivities et qu'est-ce qui la domine ?|O(A log K), dominée par le scoring O(A·J̄) et le top-K heap O(A log K). Le BFS est borné (quasi constant) et le greedy O(K log K) est négligeable devant A.
Quels réflexes en entretien ESN sur un problème algo ?|Reformuler/borner, découper en sous-problèmes nommés, donner la solution naïve + sa complexité, optimiser en déplaçant le coût (index/heap/borne), coder une brique proprement, conclure sur complexité et compromis (greedy vs DP).
```

---

## Pont vers le lab

> Lab associé : `05-algorithms/labs/lab-12-recommendation-engine/README.md`. Construire le moteur `recommendActivities(memberId)` complet — index, graphe de proximité, scoring, top-K, sélection sous contrainte — puis l'analyser en complexité. Aboutissement du fil-rouge : dernier lab du cours.
