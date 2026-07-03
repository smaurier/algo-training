# Lab 12 — Moteur de recommandation TribuZen (projet final)

> **Outcome :** à la fin, tu sais assembler graphe de proximité, scoring multi-signaux, top-K par heap et sélection sous contrainte en un seul livrable `recommendActivities(memberId)`, et en donner la complexité.
> **Vrai outil :** TypeScript exécuté avec `tsx` (aucun harnais simulé). Tu valides en lançant le moteur sur un jeu de données réaliste et en lisant les recommandations produites.
> **Feedback :** le coach valide en session — pas de test-runner auto-correcteur. Tu justifies chaque choix d'algo et la complexité de chaque étape à voix haute.

C'est le **dernier lab du cours**. Il ne t'apporte aucune notion nouvelle : il te fait souder tout le parcours algo en un système réel de TribuZen. Réussir ce lab = savoir concevoir un moteur de reco de zéro, exactement comme en entretien ESN.

## Énoncé

TribuZen affiche sur la home d'un membre un bloc **« Activités pour toi »**. Tu dois livrer la fonction qui l'alimente :

```ts
function recommendActivities(memberId: string, k?: number): RecommendedActivity[];
```

Les recommandations doivent :

1. **Exclure** les activités que le membre a déjà rejointes.
2. **Favoriser** ce qu'apprécient les membres proches (même famille, amis, amis d'amis) — signal de **proximité sociale** via un graphe + BFS pondéré borné.
3. **Mélanger** proximité, popularité, affinité de tags et note moyenne en un **score** par activité.
4. Ne renvoyer que le **top-K** sans trier toutes les activités (min-heap).
5. **Respecter** le budget mensuel (euros) et le quota de temps (minutes) du membre — sélection sous contrainte.
6. Rester rapide : chaque structure lourde (index, graphe) construite **une seule fois**.

### Starter — données et types (réels, à ne pas simuler)

Crée `exercise.ts` avec ce socle, puis implémente le reste toi-même :

```ts
// exercise.ts
interface Activity {
  id: string;
  title: string;
  tags: string[];
  category: string;
  price: number;       // euros
  durationMin: number; // minutes
  rating: number;      // 0..5
  joinCount: number;
}

interface Member {
  id: string;
  familyId: string;
  friends: string[];
  joinedActivities: string[];
  preferredTags: string[];
  monthlyBudget: number;
  monthlyMinutes: number;
}

interface RecommendedActivity {
  activity: Activity;
  score: number;
  reason: string;
}

// --- Jeu de données ---
const activities: Activity[] = [
  { id: 'a1', title: 'Rando au lac', tags: ['sport', 'plein-air', 'famille'], category: 'sport', price: 0, durationMin: 180, rating: 4.7, joinCount: 120 },
  { id: 'a2', title: 'Atelier poterie', tags: ['culture', 'créatif'], category: 'culture', price: 35, durationMin: 120, rating: 4.5, joinCount: 60 },
  { id: 'a3', title: 'Escalade en salle', tags: ['sport', 'indoor'], category: 'sport', price: 18, durationMin: 90, rating: 4.6, joinCount: 200 },
  { id: 'a4', title: 'Concert jazz', tags: ['culture', 'musique', 'soirée'], category: 'culture', price: 25, durationMin: 150, rating: 4.8, joinCount: 300 },
  { id: 'a5', title: 'Yoga au parc', tags: ['sport', 'plein-air', 'détente'], category: 'détente', price: 10, durationMin: 60, rating: 4.4, joinCount: 90 },
  { id: 'a6', title: 'Pique-nique famille', tags: ['plein-air', 'famille', 'détente'], category: 'détente', price: 5, durationMin: 120, rating: 4.3, joinCount: 150 },
  { id: 'a7', title: 'Cours de cuisine', tags: ['culture', 'créatif', 'famille'], category: 'culture', price: 45, durationMin: 150, rating: 4.9, joinCount: 80 },
  { id: 'a8', title: 'VTT forêt', tags: ['sport', 'plein-air'], category: 'sport', price: 22, durationMin: 210, rating: 4.5, joinCount: 70 },
];

const members: Member[] = [
  // Famille Martin : m1, m2, m3
  { id: 'm1', familyId: 'f1', friends: ['m4'], joinedActivities: ['a3'], preferredTags: ['sport', 'plein-air'], monthlyBudget: 60, monthlyMinutes: 400 },
  { id: 'm2', familyId: 'f1', friends: [], joinedActivities: ['a1', 'a6'], preferredTags: ['famille', 'plein-air'], monthlyBudget: 40, monthlyMinutes: 300 },
  { id: 'm3', familyId: 'f1', friends: ['m5'], joinedActivities: ['a4'], preferredTags: ['culture'], monthlyBudget: 80, monthlyMinutes: 500 },
  // Famille Dubois : m4, m5
  { id: 'm4', familyId: 'f2', friends: ['m1'], joinedActivities: ['a1', 'a8'], preferredTags: ['sport'], monthlyBudget: 50, monthlyMinutes: 350 },
  { id: 'm5', familyId: 'f2', friends: ['m3'], joinedActivities: ['a2', 'a7'], preferredTags: ['culture', 'créatif'], monthlyBudget: 100, monthlyMinutes: 600 },
];

// TODO : implémente ActivityIndex, buildSocialGraph, proximityFrom,
// scoreActivity, MinHeap + topK, selectGreedy, et la classe
// RecommendationEngine avec recommendActivities().

const engine = new RecommendationEngine(activities, members);
console.log('Reco pour m1 :');
for (const r of engine.recommendActivities('m1', 5)) {
  console.log(`  ${r.activity.title} — ${r.score.toFixed(1)} — ${r.reason}`);
}
```

### Lancer

```sh
npx tsx exercise.ts
```

Tu dois voir une liste d'activités pour `m1` (membre de la famille Martin, ami de m4), **jamais** `a3` (déjà rejointe), avec un score et une raison. Les activités de ses proches (a1, a8 côté m4 ; a1, a6 côté famille) remontent au **scoring**. Attention : `a8` (VTT, 210 min) remonte bien au scoring mais peut être **écarté de la reco finale par le quota de temps de m1** (`monthlyMinutes`) une fois d'autres activités déjà sélectionnées — le scoring propose, la contrainte dispose.

## Étapes (en friction)

1. **Index (module 02).** Écris `ActivityIndex` : `byId`, `byTag`, et surtout `joinedBy` (activityId → Set de memberIds inscrits). Construis-le **une fois** dans le constructeur du moteur.
2. **Graphe social (module 07).** `buildSocialGraph` : relie les membres d'une même famille (poids 3) et les amis (poids 2). Non orienté.
3. **Proximité (module 07).** `proximityFrom(graph, start, maxHops=2)` : BFS pondéré avec atténuation par saut. Retourne `Map<memberId, score>`. Vérifie que la borne `maxHops` est respectée.
4. **Scoring (modules 01, 02, 05).** `scoreActivity` : somme pondérée de proximité (via `joinedBy` + la map de proximité), popularité normalisée, affinité de tags (Set), qualité normalisée.
5. **Top-K (module 05).** Implémente un `MinHeap` et `topK(scored, k)` en O(A log K). Interdiction de `sort().slice()`.
6. **Sélection sous contrainte (modules 09/10).** `selectGreedy` par ratio `score/prix`, respectant budget **et** minutes. Bonus : ajoute `selectKnapsack` (DP) et compare le résultat.
7. **Assemblage.** `RecommendationEngine.recommendActivities(memberId, k)` : exclusion Set → scoring → top-K → contrainte → habillage `reason`.
8. **Complexité.** Écris en commentaire la complexité de chaque étape + le total par requête. Verbalise-la au coach.

## Corrigé complet commenté

```ts
// ── Étape 1 — Index hash maps (module 02) ────────────────────────────
class ActivityIndex {
  readonly byId = new Map<string, Activity>();
  readonly byTag = new Map<string, Set<string>>();
  readonly joinedBy = new Map<string, Set<string>>(); // activityId → memberIds

  constructor(activities: Activity[], members: Member[]) {
    for (const a of activities) {
      this.byId.set(a.id, a);
      for (const tag of a.tags) {
        if (!this.byTag.has(tag)) this.byTag.set(tag, new Set());
        this.byTag.get(tag)!.add(a.id);
      }
    }
    // index inversé : qui a rejoint quoi → base du signal proximité
    for (const m of members) {
      for (const actId of m.joinedActivities) {
        if (!this.joinedBy.has(actId)) this.joinedBy.set(actId, new Set());
        this.joinedBy.get(actId)!.add(m.id);
      }
    }
  }
}

// ── Étape 2 — Graphe social non orienté pondéré (module 07) ──────────
type SocialGraph = Map<string, Map<string, number>>;

function buildSocialGraph(members: Member[]): SocialGraph {
  const g: SocialGraph = new Map();
  const link = (a: string, b: string, w: number) => {
    if (!g.has(a)) g.set(a, new Map());
    const prev = g.get(a)!.get(b) ?? 0;
    g.get(a)!.set(b, Math.max(prev, w)); // garde le lien le plus fort
  };
  // liens de famille (fort)
  const byFamily = new Map<string, string[]>();
  for (const m of members) {
    if (!byFamily.has(m.familyId)) byFamily.set(m.familyId, []);
    byFamily.get(m.familyId)!.push(m.id);
  }
  for (const ids of byFamily.values())
    for (let i = 0; i < ids.length; i++)
      for (let j = i + 1; j < ids.length; j++) {
        link(ids[i], ids[j], 3);
        link(ids[j], ids[i], 3);
      }
  // liens d'amitié (moyen), symétriques
  for (const m of members)
    for (const f of m.friends) {
      link(m.id, f, 2);
      link(f, m.id, 2);
    }
  return g;
}

// ── Étape 3 — Proximité par BFS pondéré borné (module 07) ────────────
function proximityFrom(graph: SocialGraph, start: string, maxHops = 2): Map<string, number> {
  const prox = new Map<string, number>();
  const queue: Array<{ id: string; hops: number; strength: number }> = [
    { id: start, hops: 0, strength: 1 },
  ];
  const seen = new Set<string>([start]);
  while (queue.length > 0) {
    const { id, hops, strength } = queue.shift()!; // FIFO → BFS niveau par niveau
    if (hops >= maxHops) continue;                 // borne : pas au-delà de maxHops
    for (const [next, weight] of graph.get(id) ?? []) {
      if (seen.has(next)) continue;                // un membre compté une fois
      seen.add(next);
      const nextStrength = strength * (weight / 10); // atténuation par saut
      prox.set(next, (prox.get(next) ?? 0) + nextStrength);
      queue.push({ id: next, hops: hops + 1, strength: nextStrength });
    }
  }
  return prox;
}

// ── Étape 4 — Scoring multi-signaux (modules 01,02,05) ───────────────
const WEIGHTS = { proximity: 4, popularity: 1, affinity: 3, quality: 2 };

function scoreActivity(
  activity: Activity,
  member: Member,
  index: ActivityIndex,
  memberProximity: Map<string, number>,
  maxJoin: number,
): number {
  // proximité : somme des proximités des membres proches inscrits à l'activité
  let proximity = 0;
  for (const otherId of index.joinedBy.get(activity.id) ?? [])
    proximity += memberProximity.get(otherId) ?? 0;
  const popularity = maxJoin > 0 ? activity.joinCount / maxJoin : 0; // 0..1
  const prefs = new Set(member.preferredTags);
  const affinity = activity.tags.filter((t) => prefs.has(t)).length; // tags communs
  const quality = activity.rating / 5;                               // 0..1
  return (
    proximity * WEIGHTS.proximity +
    popularity * WEIGHTS.popularity +
    affinity * WEIGHTS.affinity +
    quality * WEIGHTS.quality
  );
}

// ── Étape 5 — Top-K par min-heap (module 05) ─────────────────────────
interface Scored { id: string; score: number; }

class MinHeap {
  private d: Scored[] = [];
  get size() { return this.d.length; }
  peek() { return this.d[0]; }
  push(v: Scored) {
    this.d.push(v);
    let i = this.d.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.d[i].score < this.d[p].score) { [this.d[i], this.d[p]] = [this.d[p], this.d[i]]; i = p; }
      else break;
    }
  }
  pop(): Scored {
    const top = this.d[0], last = this.d.pop()!;
    if (this.d.length) {
      this.d[0] = last;
      let i = 0; const n = this.d.length;
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2; let m = i;
        if (l < n && this.d[l].score < this.d[m].score) m = l;
        if (r < n && this.d[r].score < this.d[m].score) m = r;
        if (m === i) break;
        [this.d[i], this.d[m]] = [this.d[m], this.d[i]]; i = m;
      }
    }
    return top;
  }
}

// heap MIN de taille k : on éjecte le plus petit → il reste les k plus HAUTS
function topK(scored: Scored[], k: number): Scored[] {
  const h = new MinHeap();
  for (const s of scored) {
    if (h.size < k) h.push(s);
    else if (s.score > h.peek().score) { h.pop(); h.push(s); }
  }
  const out: Scored[] = [];
  while (h.size > 0) out.push(h.pop());
  return out.reverse(); // du plus haut au plus bas
}

// ── Étape 6 — Sélection sous contrainte, greedy par ratio (module 10) ─
function selectGreedy(
  candidates: Array<Scored & { price: number; durationMin: number }>,
  budget: number,
  minutes: number,
): Scored[] {
  const byRatio = [...candidates].sort(
    (a, b) => b.score / (b.price + 1) - a.score / (a.price + 1),
  );
  const chosen: Scored[] = [];
  let e = 0, mn = 0;
  for (const c of byRatio)
    if (e + c.price <= budget && mn + c.durationMin <= minutes) {
      chosen.push({ id: c.id, score: c.score });
      e += c.price; mn += c.durationMin;
    }
  return chosen;
}

// ── Assemblage — le livrable ─────────────────────────────────────────
class RecommendationEngine {
  private index: ActivityIndex;
  private graph: SocialGraph;
  private byMemberId: Map<string, Member>;
  private maxJoin: number;

  constructor(private activities: Activity[], private members: Member[]) {
    this.index = new ActivityIndex(activities, members);       // 1× O(A·T + M·J)
    this.graph = buildSocialGraph(members);                    // 1× O(M·D)
    this.byMemberId = new Map(members.map((m) => [m.id, m]));   // lookup O(1)
    this.maxJoin = Math.max(1, ...activities.map((a) => a.joinCount));
  }

  recommendActivities(memberId: string, k = 20): RecommendedActivity[] {
    const member = this.byMemberId.get(memberId);
    if (!member) return [];

    const proximity = proximityFrom(this.graph, memberId, 2);   // O(D^2) borné
    const joined = new Set(member.joinedActivities);            // exclusion O(1)
    const candidates = this.activities.filter((a) => !joined.has(a.id));

    const scored = candidates.map((a) => ({                    // O(A·J̄)
      id: a.id,
      score: scoreActivity(a, member, this.index, proximity, this.maxJoin),
    }));

    const best = topK(scored, k * 2);                          // O(A log K)
    const withCost = best.map((s) => {
      const a = this.index.byId.get(s.id)!;
      return { ...s, price: a.price, durationMin: a.durationMin };
    });
    const selected = selectGreedy(withCost, member.monthlyBudget, member.monthlyMinutes); // O(K log K)

    // selectGreedy renvoie l'ordre de sélection (ratio score/prix) → on
    // ré-ordonne par score DÉCROISSANT pour une liste finale bien ordonnée.
    return [...selected]
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map((s) => {                                            // habillage + explicabilité
      const a = this.index.byId.get(s.id)!;
      const prefs = new Set(member.preferredTags);
      const matched = a.tags.filter((t) => prefs.has(t));
      const reason = matched.length
        ? `Correspond à tes goûts (${matched.join(', ')})`
        : 'Apprécié par des membres proches de toi';
      return { activity: a, score: s.score, reason };
    });
  }
}

// Complexité par requête : O(A log K) — dominée par scoring + top-K.
// Construction (constructeur) : O(A·T + M·J + M·D), amortie sur toutes les requêtes.
```

## Variante J+30 (fading)

Reprends le moteur **sans regarder le corrigé**, avec deux contraintes ajoutées :

1. **En 40 min**, de mémoire, réécris `proximityFrom` (BFS pondéré borné) et `topK` (min-heap) — ce sont les deux briques que les candidats ratent le plus en entretien.
2. **Remplace `selectGreedy` par `selectKnapsack` (DP 0/1 sur le budget entier)** et **compare** les deux sélections sur `m5` (budget 100). Sur quel jeu de prix les deux divergent-elles ? Formule à voix haute *pourquoi* greedy n'est pas optimal en 0/1 et quand la divergence apparaît.

Objectif : pouvoir dérouler l'assemblage complet et justifier chaque complexité comme si l'intervieweur ESN te regardait coder.

## Application TribuZen

Porte ce moteur dans `smaurier/tribuzen` :

- Éclate le corrigé en modules : `server/reco/ActivityIndex.ts`, `socialGraph.ts`, `scoreActivity.ts`, `topK.ts`, `selectUnderBudget.ts`, `RecommendationEngine.ts`.
- Expose `GET /api/members/:id/recommendations?limit=` qui appelle `recommendActivities`.
- Reconstruis `index` + `graph` en tâche de fond (worker / cron, module 11) au changement de membres/activités, jamais par requête.
- Branche le bloc **« Activités pour toi »** de la home dessus, en affichant `reason` sous chaque carte (explicabilité produit).

Commit suggéré : `feat(reco): moteur recommendActivities — graphe proximité + scoring top-K + budget` sur `smaurier/tribuzen`.

C'est l'aboutissement du fil-rouge du cours 05 : le graphe (07), le tri/heap (05), le DP/greedy (09/10) et les hash maps (02) servent enfin **ensemble** un seul endpoint produit.
