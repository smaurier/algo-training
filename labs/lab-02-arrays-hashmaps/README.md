# Lab 02 — Tableaux et hash maps

> **Outcome :** à la fin, tu sais résoudre trois patterns d'entretien en TypeScript — **two-sum** (hash map), **sliding window** (fenêtre glissante), **dédup** (Set) — et nommer la complexité de chacun.
> **Vrai outil :** TypeScript + `tsx` (exécution directe des fichiers `.ts` en ligne de commande). Pas de harnais de test simulé.
> **Feedback :** le coach valide en session — tu lis la sortie console toi-même, pas de test-runner auto-correcteur.

---

## Énoncé

Tu écris trois fonctions dans un petit projet TS, chacune inspirée d'un besoin admin TribuZen. Tu les exécutes avec `tsx` et tu vérifies la sortie console à l'œil.

**Problème A — two-sum sur des points de contribution.** Chaque membre a un score de points. Trouve les **deux membres** dont les points s'additionnent exactement à un `target` donné. Renvoie leurs ids. O(n) attendu, tableau **non trié**.

**Problème B — sliding window sur un flux d'activité.** Un tableau de compteurs d'événements par tranche de 5 min. Trouve la **somme maximale** d'une fenêtre de `k` tranches consécutives (le pic d'activité). O(n) attendu.

**Problème C — dédup des membres par email.** Une liste de membres avec des doublons d'email (imports CSV). Renvoie la liste **dédupliquée**, en gardant la première occurrence et l'ordre. O(n) attendu.

### Starter minimal

```bash
mkdir tribuzen-lab02 && cd tribuzen-lab02
npm init -y
npm i -D tsx typescript
```

Crée `arrays-hashmaps.ts` avec les signatures et les jeux de données, **sans les corps** :

```ts
// ─── Données ────────────────────────────────────────────────────
interface Member {
  id: string;
  email: string;
  points: number;
}

const MEMBERS: Member[] = [
  { id: 'm1', email: 'alice@tribuzen.app', points: 30 },
  { id: 'm2', email: 'bob@tribuzen.app', points: 70 },
  { id: 'm3', email: 'carol@tribuzen.app', points: 45 },
  { id: 'm4', email: 'alice@tribuzen.app', points: 30 }, // doublon email d'Alice
  { id: 'm5', email: 'dan@tribuzen.app', points: 55 },
];

// compteurs d'événements par tranche de 5 min
const ACTIVITY = [2, 1, 5, 1, 3, 2, 8, 1, 0, 4];

// ─── À écrire ───────────────────────────────────────────────────
// A. deux membres dont points[a] + points[b] === target
function pairForTarget(members: Member[], target: number): [string, string] | null {
  throw new Error('à implémenter');
}

// B. somme max d'une fenêtre de k tranches consécutives
function peakActivity(counts: number[], k: number): number {
  throw new Error('à implémenter');
}

// C. dédup par email, garde la première occurrence + l'ordre
function dedupByEmail(members: Member[]): Member[] {
  throw new Error('à implémenter');
}

// ─── Vérifications manuelles ────────────────────────────────────
console.log('A pairForTarget(100):', pairForTarget(MEMBERS, 100)); // ['m1','m2'] (30+70)
console.log('B peakActivity(k=3):', peakActivity(ACTIVITY, 3));    // 13 (fenêtre [3, 2, 8])
console.log('C dedupByEmail count:', dedupByEmail(MEMBERS).length); // 4 (m4 retiré)
```

Lance avec `npx tsx arrays-hashmaps.ts`.

**Contraintes :**
- Problème A : **pas de double boucle**. Une `Map<number, string>` (points → id).
- Problème B : **pas** de recalcul complet à chaque fenêtre — glisse (entrant − sortant).
- Problème C : `Set<string>` sur l'email, un seul passage.
- Pas de gap-fill — tu écris chaque corps complet depuis la signature.

---

## Étapes (en friction)

1. **Problème A** — parcours `members` avec une `Map<number, string>` (points vus → id). Pour chaque membre, calcule `complément = target - points` ; si la Map le contient, renvoie `[map.get(complément)!, member.id]`. Sinon enregistre `points → id`.
2. **Vérifie A** : `pairForTarget(MEMBERS, 100)` doit donner `['m1', 'm2']` (30 + 70). Teste aussi un target impossible (ex: 1000) → `null`.
3. **Problème B** — calcule la somme des `k` premières tranches, garde-la comme `max`. Puis de `i = k` à la fin : `windowSum += counts[i] - counts[i - k]`, `max = Math.max(max, windowSum)`.
4. **Vérifie B** : `peakActivity(ACTIVITY, 3)` — la fenêtre `[3, 2, 8]` somme à 13, c'est le pic.
5. **Problème C** — `Set<string>` des emails vus ; `filter` qui garde le membre seulement si son email n'a pas encore été vu (puis l'ajoute au Set).
6. **Vérifie C** : la liste passe de 5 à 4 membres (le doublon `m4` d'Alice disparaît, `m1` reste).
7. **Nomme la complexité** de chaque fonction à voix haute avant de regarder le corrigé.

---

## Corrigé complet commenté

```ts
interface Member {
  id: string;
  email: string;
  points: number;
}

// ─── A. two-sum sur les points (hash map) ───────────────────────
function pairForTarget(members: Member[], target: number): [string, string] | null {
  // points déjà rencontrés → id du membre correspondant
  const seen = new Map<number, string>();

  for (const m of members) {
    const complement = target - m.points; // ce qu'il manque pour atteindre target
    // le complément a-t-il déjà été vu chez un membre précédent ? lookup O(1)
    if (seen.has(complement)) {
      return [seen.get(complement)!, m.id]; // paire trouvée
    }
    seen.set(m.points, m.id); // sinon on mémorise ce membre
  }
  return null;
}
// O(n) temps, O(n) espace — un seul passage, lookups O(1)

// ─── B. sliding window sur le flux d'activité ───────────────────
function peakActivity(counts: number[], k: number): number {
  if (counts.length < k) return 0;

  // somme de la première fenêtre [0, k)
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += counts[i];

  let max = windowSum;
  // on fait glisser : on ajoute l'entrant counts[i], on retire le sortant counts[i-k]
  for (let i = k; i < counts.length; i++) {
    windowSum += counts[i] - counts[i - k];
    max = Math.max(max, windowSum);
  }
  return max;
}
// O(n) — chaque tranche entre puis sort de la fenêtre une seule fois
// (versus O(n·k) si on resommait chaque fenêtre depuis zéro)

// ─── C. dédup par email (Set) ───────────────────────────────────
function dedupByEmail(members: Member[]): Member[] {
  const seen = new Set<string>(); // emails déjà rencontrés
  return members.filter(m => {
    if (seen.has(m.email)) return false; // doublon → on jette
    seen.add(m.email);
    return true;                         // première occurrence → on garde
  });
}
// O(n) temps, O(n) espace — filter garde l'ordre, Set.has en O(1)

// ─── Vérifs ─────────────────────────────────────────────────────
const MEMBERS: Member[] = [
  { id: 'm1', email: 'alice@tribuzen.app', points: 30 },
  { id: 'm2', email: 'bob@tribuzen.app', points: 70 },
  { id: 'm3', email: 'carol@tribuzen.app', points: 45 },
  { id: 'm4', email: 'alice@tribuzen.app', points: 30 },
  { id: 'm5', email: 'dan@tribuzen.app', points: 55 },
];
const ACTIVITY = [2, 1, 5, 1, 3, 2, 8, 1, 0, 4];

console.log('A:', pairForTarget(MEMBERS, 100)); // ['m1', 'm2']
console.log('A impossible:', pairForTarget(MEMBERS, 1000)); // null
console.log('B:', peakActivity(ACTIVITY, 3));   // 13
console.log('C:', dedupByEmail(MEMBERS).map(m => m.id)); // ['m1','m2','m3','m5']
```

**Pourquoi ce corrigé est correct :**
- **A** n'utilise qu'une boucle : la `Map` remplace la seconde boucle imbriquée. On garde les **ids d'origine** (impossible avec un tri + two pointers sans re-mapper les index).
- **B** ne resomme jamais une fenêtre entière : `+= entrant − sortant` est le cœur du sliding window, ce qui donne O(n) au lieu de O(n·k).
- **C** garde l'ordre et la première occurrence parce que `filter` parcourt dans l'ordre et le `Set` bloque toute réapparition d'un email déjà vu.

---

## Variante J+30 (fading)

**Même trio, contraintes ajoutées — reproduire de mémoire en 25 minutes, sans rouvrir ce corrigé ni le module :**

1. **A+** — au lieu d'une seule paire, renvoie **toutes les paires distinctes** de membres dont les points somment à `target` (attention aux doublons de valeur). Toujours O(n) en moyenne.
2. **B+** — en plus du pic, renvoie **l'index de départ** de la fenêtre maximale (utile pour dire "le pic a eu lieu à la tranche X").
3. **C+** — dédup par email **ET** compte, dans une `Map<email, number>`, combien de fois chaque email apparaissait (pour signaler les emails les plus dupliqués).

**Critère de réussite :** les trois fonctions tournent en un passage (ou un passage + un tri final pour A+), tu sais énoncer la complexité de chacune sans hésiter.

---

## Application TribuZen

Dans le repo `smaurier/tribuzen`, ces fonctions vivent ici :

```
tribuzen/src/features/
  members/
    dedupMembers.ts      // C — dédup par email avant insert en base
    roleStats.ts         // comptage de fréquences (variante du pattern Map)
  gamification/
    matchContribution.ts // A — appariement de membres par points
  activity/
    peakWindow.ts        // B — détection du pic d'activité d'une famille
```

**Différences par rapport au lab :**
- `dedupByEmail` sera appelée dans le service d'import CSV, avant `prisma.member.createMany`, pour éviter les erreurs de contrainte d'unicité.
- `peakActivity` opérera sur des buckets construits à partir de vrais timestamps d'événements (agrégés par tranche), pas sur un tableau en dur.
- `pairForTarget` alimentera un défi de gamification "duo complémentaire" affiché dans le tableau de bord famille.

**Commit cible :**
```
feat(members): dédup par email avant import CSV (Set, O(n))
feat(activity): détection du pic d'activité par sliding window
feat(gamification): appariement de membres par points (two-sum, Map)
```
