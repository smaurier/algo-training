---
titre: Patterns algorithmiques du JS fullstack
cours: 05-algorithms
notions: [debounce et throttle (fenêtre temporelle), pagination par curseur, déduplication et memoization de requêtes, LRU cache (Map + ordre d'insertion), index inversé pour la recherche, fuzzy match léger, rate limiting (token bucket / sliding window), retry avec backoff exponentiel, batch et chunk, diffing par clés (intuition reconciliation React), reconnaître le pattern algo derrière un besoin produit]
outcomes: [reconnaître le pattern algorithmique derrière un besoin produit web, implémenter en TS un LRU cache et un debounce corrects, construire un index inversé pour une recherche client rapide, choisir la bonne stratégie de rate limiting et de retry]
prerequis: [10-greedy-unionfind-trie]
next: 12-projet-final
libs: []
tribuzen: LRU cache des profils de familles consultés, debounce de la recherche de membres dans l'admin, index inversé pour la recherche full-text légère, rate limit des invitations
last-reviewed: 2026-07
---

# Patterns algorithmiques du JS fullstack

> **Outcomes — tu sauras FAIRE :** reconnaître le pattern algorithmique derrière un besoin produit web, implémenter un LRU cache et un debounce corrects en TS, construire un index inversé de recherche, choisir la bonne stratégie de rate limiting et de retry.
> **Difficulté :** :star::star::star:

## 1. Cas concret d'abord

Tu reprends l'admin de TribuZen. La barre de recherche de membres est branchée directement sur l'API :

```tsx
// MemberSearch.tsx — AVANT
function MemberSearch() {
  const [results, setResults] = useState<Member[]>([]);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    // Une requête réseau à CHAQUE frappe
    const res = await fetch(`/api/members?q=${q}`);
    setResults(await res.json());
  };

  return <input onChange={onChange} placeholder="Rechercher un membre…" />;
}
```

Tape « Dupont » : six frappes, six requêtes. Les réponses reviennent dans le désordre — la réponse de « Dup » arrive parfois **après** celle de « Dupont » et écrase le bon résultat. À 500 familles chargées, le serveur reçoit une rafale inutile à chaque recherche.

Trois besoins produit se cachent derrière ce bug, et chacun est un **pattern algorithmique** connu :

1. « N'appelle qu'une fois quand l'utilisateur a fini de taper » → **debounce** (fenêtre temporelle).
2. « Ne recharge pas un profil de famille déjà consulté » → **LRU cache** (Map + ordre d'insertion).
3. « La liste est déjà en mémoire, filtre-la côté client sans réseau » → **index inversé** + fuzzy match.

Ce module t'apprend à voir le pattern algo derrière chaque besoin, puis à l'écrire correctement en TypeScript. C'est le module qui relie tout le cours algorithmes à ton métier réel de dev web.

---

## 2. Théorie complète, concise

### 2.1 Reconnaître le pattern derrière le besoin

La compétence centrale de ce module n'est pas d'apprendre du code par cœur, mais de **traduire une phrase produit en pattern algo**. Table de correspondance :

| Phrase produit | Pattern | Structure clé |
|---|---|---|
| « attends que l'utilisateur ait fini » | debounce | timer réarmé |
| « pas plus d'une fois toutes les N ms » | throttle | timestamp du dernier run |
| « ne recharge pas ce qu'on vient de voir » | LRU cache | `Map` ordonnée |
| « ne relance pas la même requête en cours » | déduplication | `Map<clé, Promise>` |
| « recalcule seulement si l'entrée change » | memoization | `Map<args, résultat>` |
| « cherche vite dans une liste en mémoire » | index inversé | `Map<terme, Set<id>>` |
| « limite les envois par utilisateur » | rate limiting | token bucket / fenêtre |
| « réessaie sans marteler le serveur » | backoff exponentiel | délai `2^n` |
| « pagine une grande liste sans OFFSET » | curseur | borne `WHERE id > cursor` |
| « traite 10 000 lignes sans exploser » | batch / chunk | découpe + boucle |
| « mets à jour seulement ce qui a changé » | diffing par clés | comparaison indexée |

### 2.2 Debounce et throttle — la fenêtre temporelle

Les deux limitent la fréquence d'exécution mais répondent à des besoins opposés.

**Debounce** = n'exécute qu'après un délai **d'inactivité**. Chaque appel réarme le timer. Usage : recherche live, auto-save, resize.

```ts
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer); // annule l'appel précédent
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => { if (timer) clearTimeout(timer); };
  return debounced;
}
```

**Throttle** = exécute **au plus une fois** toutes les N ms, pendant l'activité. Usage : scroll, mousemove, drag.

```ts
function throttle<T extends (...args: any[]) => void>(fn: T, limit: number) {
  let lastRun = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun >= limit) { // la fenêtre est ouverte
      fn(...args);
      lastRun = now;
    }
  };
}
```

Intuition : debounce attend le **silence**, throttle rythme le **bruit continu**.

### 2.3 LRU cache — Map + ordre d'insertion

Un cache LRU (Least Recently Used) garde les N entrées les plus récemment utilisées et évince la plus ancienne. Le pattern JS clé : **`Map` conserve l'ordre d'insertion**, donc `map.keys().next().value` est toujours l'entrée la plus ancienne.

```ts
class LRUCache<K, V> {
  private map = new Map<K, V>();
  constructor(private capacity: number) {}

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key)!;
    this.map.delete(key);      // retire…
    this.map.set(key, value);  // …puis réinsère en fin = « le plus récent »
    return value;
  }

  set(key: K, value: V): void {
    if (this.map.has(key)) this.map.delete(key); // pour réinsérer en fin
    else if (this.map.size >= this.capacity) {
      const oldest = this.map.keys().next().value; // premier inséré = LRU
      this.map.delete(oldest!);
    }
    this.map.set(key, value);
  }
}
```

Coût : `get` et `set` en O(1) amorti — pas de tri, l'ordre est maintenu par les `delete`/`set`.

### 2.4 Déduplication et memoization de requêtes

**Déduplication** : si plusieurs composants demandent la même donnée **en même temps**, une seule requête part. On mémorise la `Promise` en vol, pas le résultat.

```ts
class RequestDedup {
  private inflight = new Map<string, Promise<unknown>>();
  fetch<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const existing = this.inflight.get(key);
    if (existing) return existing as Promise<T>; // réutilise la Promise en cours
    const p = loader().finally(() => this.inflight.delete(key));
    this.inflight.set(key, p);
    return p;
  }
}
```

**Memoization** : on mémorise le **résultat** d'un calcul pur en fonction de ses arguments. Le LRU cache ci-dessus est un memoizer avec éviction. La différence : la dédup vide la clé dès que la Promise se résout, la memo garde le résultat.

### 2.5 Pagination par curseur

Paginer avec `OFFSET` est O(n) : la base scanne et jette les lignes sautées, et une insertion entre deux pages décale tout (doublons/trous). Le **curseur** garde une borne stable (le dernier id vu) et repart de là.

```ts
type Page<T> = { data: T[]; nextCursor: string | null };

// Sur une liste en mémoire — même logique qu'un WHERE id > cursor côté SQL
function paginate<T extends { id: string }>(
  items: T[], cursor: string | null, limit: number,
): Page<T> {
  const start = cursor ? items.findIndex(i => i.id === cursor) + 1 : 0;
  const data = items.slice(start, start + limit);
  const nextCursor = start + limit < items.length ? data.at(-1)!.id : null;
  return { data, nextCursor };
}
```

Avantage : performance constante quelle que soit la profondeur, et pas de saut de ligne quand la liste change en cours de défilement.

### 2.6 Index inversé et fuzzy match léger

Filtrer une liste avec `.filter(m => m.name.includes(q))` est O(n) à chaque frappe et rescanne toute la liste. Un **index inversé** pré-calcule `Map<terme, Set<id>>` une seule fois, puis chaque recherche est une lecture directe.

```ts
type Doc = { id: string; text: string };

function buildIndex(docs: Doc[]): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  for (const doc of docs) {
    for (const term of tokenize(doc.text)) {
      if (!index.has(term)) index.set(term, new Set());
      index.get(term)!.add(doc.id);
    }
  }
  return index;
}

function tokenize(text: string): string[] {
  return text.toLowerCase().normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // retire les accents
    .split(/\W+/).filter(Boolean);
}
```

**Fuzzy match léger** — tolérer les fautes sans lib lourde : match par sous-séquence (les lettres de la requête apparaissent dans l'ordre).

```ts
function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase(), t = text.toLowerCase();
  if (q.length === 0) return true;
  let i = 0;
  for (const ch of t) {
    if (ch === q[i]) i++;
    if (i === q.length) return true; // toutes les lettres trouvées dans l'ordre
  }
  return false;
}
// fuzzyMatch('dpnt', 'Dupont') → true
```

### 2.7 Rate limiting — token bucket et sliding window

Limiter le nombre d'actions par utilisateur et par période (envois d'invitations, appels API).

**Token bucket** : un seau de N jetons qui se recharge à débit constant. Chaque action consomme un jeton ; plus de jeton = refusé. Autorise des rafales jusqu'à N.

```ts
class TokenBucket {
  private tokens: number;
  private last = Date.now();
  constructor(private capacity: number, private refillPerSec: number) {
    this.tokens = capacity;
  }
  tryConsume(n = 1): boolean {
    const now = Date.now();
    this.tokens = Math.min(
      this.capacity,
      this.tokens + ((now - this.last) / 1000) * this.refillPerSec,
    );
    this.last = now;
    if (this.tokens >= n) { this.tokens -= n; return true; }
    return false;
  }
}
```

**Sliding window** : on garde les horodatages des actions récentes et on compte celles dans la dernière fenêtre. Plus précis, plus coûteux en mémoire.

```ts
class SlidingWindow {
  private hits: number[] = [];
  constructor(private max: number, private windowMs: number) {}
  allow(): boolean {
    const now = Date.now();
    this.hits = this.hits.filter(t => now - t < this.windowMs); // purge hors fenêtre
    if (this.hits.length < this.max) { this.hits.push(now); return true; }
    return false;
  }
}
```

### 2.8 Retry avec backoff exponentiel

Réessayer une requête qui échoue, mais en espaçant les tentatives (`2^n`) pour ne pas marteler un serveur déjà en difficulté. Le **jitter** (aléa) évite que tous les clients réessaient en même temps.

```ts
async function retry<T>(fn: () => Promise<T>, maxAttempts = 4): Promise<T> {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= maxAttempts) throw err;
      const base = 2 ** attempt * 100;        // 200, 400, 800 ms
      const jitter = Math.random() * 100;      // désynchronise les clients
      await new Promise(r => setTimeout(r, base + jitter));
    }
  }
}
```

### 2.9 Batch et chunk

Traiter une grande liste par morceaux : borne la mémoire, permet le parallélisme contrôlé, évite les payloads géants.

```ts
function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function processInBatches<T>(
  items: T[], size: number, worker: (batch: T[]) => Promise<void>,
): Promise<void> {
  for (const batch of chunk(items, size)) {
    await worker(batch); // séquentiel : un batch après l'autre
  }
}
```

### 2.10 Diffing par clés — l'intuition de la reconciliation React

Quand React re-rend une liste, il compare l'ancien et le nouvel arbre. Sans identifiant stable, il compare **par position** et re-crée trop de nœuds. Avec une **`key` stable**, il apparie par identité et ne touche que ce qui a bougé — c'est un diff par clés, O(n).

```tsx
// ❌ key = index : insérer en tête décale tout, React croit que tout a changé
{members.map((m, i) => <MemberRow key={i} member={m} />)}

// ✅ key = id stable : React apparie par identité, ne re-rend que le vrai delta
{members.map((m) => <MemberRow key={m.id} member={m} />)}
```

Intuition algorithmique : une `Map<key, node>` de l'ancienne liste permet de retrouver en O(1) le nœud correspondant dans la nouvelle, au lieu de comparer poste par poste.

---

## 3. Worked examples

### Exemple 1 — Recherche de membres corrigée (debounce + index + fuzzy)

On refait `MemberSearch` du cas concret : filtrage **client**, sans réseau, avec debounce et index inversé.

```ts
// ─── searchIndex.ts ──────────────────────────────────────────────
type Member = { id: string; name: string; email: string };

function tokenize(text: string): string[] {
  return text.toLowerCase().normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .split(/\W+/).filter(Boolean);
}

// Construit UNE fois : terme -> ids de membres
function buildMemberIndex(members: Member[]): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  for (const m of members) {
    for (const term of tokenize(`${m.name} ${m.email}`)) {
      if (!index.has(term)) index.set(term, new Set());
      index.get(term)!.add(m.id);
    }
  }
  return index;
}

// Recherche : préfixe sur les termes indexés, O(termes) et non O(membres)
function search(index: Map<string, Set<string>>, query: string): Set<string> {
  const result = new Set<string>();
  const q = tokenize(query)[0] ?? '';
  if (!q) return result;
  for (const [term, ids] of index) {
    if (term.startsWith(q)) ids.forEach(id => result.add(id));
  }
  return result;
}
```

```tsx
// ─── MemberSearch.tsx ────────────────────────────────────────────
function MemberSearch({ members }: { members: Member[] }) {
  const [results, setResults] = useState<Member[]>(members);
  // index construit une seule fois, pas à chaque frappe
  const index = useMemo(() => buildMemberIndex(members), [members]);

  const runSearch = useMemo(
    () => debounce((q: string) => {
      const ids = search(index, q);
      setResults(q ? members.filter(m => ids.has(m.id)) : members);
    }, 250),
    [index, members],
  );

  return (
    <>
      <input onChange={(e) => runSearch(e.target.value)} placeholder="Rechercher…" />
      <ul>{results.map(m => <li key={m.id}>{m.name}</li>)}</ul>
    </>
  );
}
```

**Ce que ça règle :** zéro requête réseau, plus de réponses dans le désordre, le debounce évite de recalculer à chaque frappe, l'index rend la recherche indépendante du nombre de membres.

### Exemple 2 — Cache LRU des profils de familles (fading vers TribuZen)

L'admin ouvre souvent les mêmes profils de familles. On veut garder les 20 derniers en mémoire, mais pas plus.

```ts
type FamilyProfile = { id: string; name: string; members: number };

const cache = new LRUCache<string, FamilyProfile>(20);
const dedup = new RequestDedup();

async function loadFamily(id: string): Promise<FamilyProfile> {
  // 1. déjà en cache ? → O(1), aucune requête
  const cached = cache.get(id);
  if (cached) return cached;

  // 2. sinon on charge, en dédupliquant les appels concurrents
  const profile = await dedup.fetch(id, () =>
    fetch(`/api/families/${id}`).then(r => r.json() as Promise<FamilyProfile>),
  );

  cache.set(id, profile); // évince automatiquement le 21e plus ancien
  return profile;
}
```

Déroulé :
1. Ouvrir famille A → miss, requête, mise en cache.
2. Ouvrir 20 autres familles → A est maintenant la plus ancienne.
3. Ouvrir une 21e → A est évincée (LRU).
4. Rouvrir une famille consultée récemment → hit, aucune requête.

Si deux panneaux demandent la famille B au même instant (étape 1), `dedup` garantit une **seule** requête réseau partagée.

---

## 4. Pièges & misconceptions

### PIÈGE #1 — Confondre debounce et throttle

```ts
// Besoin : « exécute le scroll handler régulièrement pendant le scroll »
// ❌ debounce → n'exécute QU'À la fin du scroll (l'UI ne bouge pas pendant)
const onScroll = debounce(updatePosition, 100);
// ✅ throttle → exécute toutes les 100 ms PENDANT le scroll
const onScroll = throttle(updatePosition, 100);
```

**Règle :** debounce pour « quand c'est fini » (recherche, save). Throttle pour « à intervalle régulier pendant » (scroll, drag, mousemove).

### PIÈGE #2 — LRU sans réinsérer sur `get`

```ts
// ❌ get() qui ne réordonne pas : l'ordre d'insertion ne reflète plus l'usage
get(key: K) { return this.map.get(key); }
// Conséquence : une entrée souvent lue mais insérée tôt sera évincée à tort.

// ✅ get() doit delete + set pour marquer « récemment utilisé »
get(key: K) {
  if (!this.map.has(key)) return undefined;
  const v = this.map.get(key)!;
  this.map.delete(key); this.map.set(key, v);
  return v;
}
```

Sans la réinsertion, ce n'est plus un LRU mais un FIFO déguisé.

### PIÈGE #3 — Déduplication qui ne libère jamais la clé

```ts
// ❌ on stocke la Promise mais on ne la retire jamais → cache figé + fuite
this.inflight.set(key, loader());
// La 2e requête (après résolution) réutilise une Promise résolue périmée.

// ✅ retirer la clé quand la Promise se termine
const p = loader().finally(() => this.inflight.delete(key));
this.inflight.set(key, p);
```

La dédup ne mémorise que le **temps du vol**. Pour garder le résultat, c'est un cache (LRU), pas une dédup.

### PIÈGE #4 — Retry sans backoff ni plafond

```ts
// ❌ retry immédiat en boucle → tempête de requêtes sur un serveur déjà KO
while (true) { try { return await fn(); } catch {} }

// ✅ nombre max de tentatives + délai exponentiel + jitter
// (voir 2.8) : espace les essais et désynchronise les clients
```

Un retry agressif transforme une panne passagère en panne aggravée (effet troupeau).

### PIÈGE #5 — `key={index}` dans une liste réordonnable

```tsx
// ❌ key = index : après un tri ou une insertion, React réutilise le mauvais
//    nœud → états internes (input focus, checkbox) sautent d'une ligne à l'autre
{rows.map((r, i) => <Row key={i} row={r} />)}

// ✅ key = identifiant métier stable
{rows.map((r) => <Row key={r.id} row={r} />)}
```

`key` sert au diffing par identité, pas à la position. Un index n'est stable que pour une liste jamais réordonnée ni filtrée.

---

## 5. Ancrage TribuZen

Ces patterns équipent l'admin de TribuZen et sa gestion des familles.

**LRU cache des profils de familles** (`src/lib/familyCache.ts`) — l'admin navigue entre profils ; un `LRUCache<string, FamilyProfile>(20)` garde les 20 derniers consultés. Rouvrir une famille récente = zéro requête. Combiné à `RequestDedup` pour les ouvertures concurrentes.

**Debounce de la recherche de membres** (`src/features/members/MemberSearch.tsx`) — l'input de recherche est débouncé à 250 ms. Plus de rafale réseau, plus de réponses hors ordre. C'est le cas concret du module.

**Index inversé pour la recherche full-text légère** (`src/lib/searchIndex.ts`) — la liste des membres et familles chargée en mémoire est indexée une fois (`Map<terme, Set<id>>`). La recherche devient indépendante du nombre d'entrées, avec fuzzy match par sous-séquence pour tolérer les fautes de frappe.

**Rate limit des invitations** (`src/features/invites/inviteLimiter.ts`) — un `TokenBucket` par utilisateur borne les envois d'invitations (ex. 5 par minute) pour éviter le spam et les abus. Un `SlidingWindow` côté serveur double la protection.

Fichiers cibles dans `smaurier/tribuzen` :
```
tribuzen/src/
  lib/
    familyCache.ts     # LRUCache + RequestDedup
    searchIndex.ts     # index inversé + fuzzyMatch
    debounce.ts        # utilitaire debounce/throttle
  features/
    members/MemberSearch.tsx
    invites/inviteLimiter.ts
```

---

## 6. Points clés

1. La compétence clé : traduire une phrase produit (« attends la fin de la frappe ») en pattern algo (debounce).
2. Debounce attend le silence ; throttle rythme le bruit continu.
3. LRU cache = `Map` + réinsertion sur `get` ; le premier inséré est la victime d'éviction, en O(1).
4. Déduplication mémorise la `Promise` en vol (et la libère à la fin) ; memoization mémorise le résultat.
5. La pagination par curseur remplace `OFFSET` : performance constante, pas de saut de ligne.
6. Un index inversé (`Map<terme, Set<id>>`) rend la recherche indépendante de la taille de la liste.
7. Fuzzy match léger = sous-séquence ordonnée, sans lib.
8. Rate limiting : token bucket autorise des rafales ; sliding window est plus précis mais plus lourd.
9. Retry sans backoff exponentiel + jitter aggrave les pannes (effet troupeau).
10. Les `key` React stables = un diff par clés O(n) ; `key={index}` casse l'appariement dès qu'on réordonne.

---

## 7. Seeds Anki

```
Quand utiliser debounce plutôt que throttle ?|Debounce quand on veut agir « une fois que c'est fini » (recherche live, auto-save) : le timer se réarme à chaque appel. Throttle quand on veut agir « à intervalle régulier pendant » (scroll, drag, mousemove) : au plus une exécution toutes les N ms.
Pourquoi un LRU cache doit-il réinsérer la clé sur get() ?|Parce que la Map conserve l'ordre d'insertion. Sur get, on delete puis set pour remettre l'entrée en fin = « la plus récemment utilisée ». Sans ça, l'ordre reflète l'insertion et non l'usage : c'est un FIFO, pas un LRU.
Comment identifie-t-on la victime d'éviction dans un LRU basé sur Map ?|map.keys().next().value donne la première clé insérée = la moins récemment utilisée. On la delete quand size atteint la capacité.
Quelle est la différence entre déduplication et memoization de requêtes ?|La déduplication mémorise la Promise en cours et la libère dès qu'elle se résout (une seule requête pour des appels concurrents). La memoization mémorise le résultat pour le réutiliser plus tard (cache). Dédup = le temps du vol ; memo = le résultat.
Qu'est-ce qu'un index inversé et quel problème résout-il ?|Une Map<terme, Set<id>> pré-calculée une fois. Elle rend la recherche indépendante du nombre de documents : au lieu de .filter O(n) à chaque frappe, on lit directement les ids associés au terme.
Pourquoi préférer la pagination par curseur à OFFSET ?|OFFSET est O(n) (la base scanne les lignes sautées) et instable si des lignes changent entre deux pages (doublons/trous). Le curseur garde une borne stable (dernier id vu, WHERE id > cursor) : performance constante et pas de saut de ligne.
Pourquoi ajouter du jitter à un retry avec backoff exponentiel ?|Le backoff (2^n) espace les tentatives pour ne pas marteler un serveur en difficulté ; le jitter (aléa) désynchronise les clients pour éviter qu'ils réessaient tous au même instant (effet troupeau).
Différence entre token bucket et sliding window pour le rate limiting ?|Token bucket : un seau de N jetons rechargé à débit constant, autorise des rafales jusqu'à N. Sliding window : garde les horodatages récents et compte ceux dans la fenêtre, plus précis mais plus coûteux en mémoire.
Pourquoi key={index} pose problème dans une liste React réordonnable ?|La key sert au diff par identité. Avec l'index, après un tri ou une insertion React apparie les nœuds par position et réutilise le mauvais : les états internes (focus, checkbox) sautent de ligne en ligne. Il faut une key = identifiant métier stable.
```

---

## Pont vers le lab

> Lab associé : `05-algorithms/labs/lab-11-fullstack-patterns/README.md`. Construire de zéro un LRU cache, un debounce et un index de recherche en TS, puis les câbler comme dans l'admin TribuZen.
