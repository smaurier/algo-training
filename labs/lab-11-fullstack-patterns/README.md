# Lab 11 — Patterns du JS fullstack : LRU cache, debounce, index de recherche

> **Outcome :** à la fin, tu sais implémenter en TypeScript un LRU cache correct, un debounce annulable et un index inversé de recherche, puis les câbler comme dans l'admin TribuZen.
> **Vrai outil :** TypeScript + Node/tsx (ou un simple playground TS / navigateur). Aucun harnais simulé — tu écris de vraies fonctions et tu les exerces à la main.
> **Feedback :** le coach valide en session (pas de test-runner auto-correcteur). Tu observes le comportement en `console.log` et tu expliques chaque décision.

## Énoncé

Tu construis le trio de patterns qui corrige la recherche de membres et la navigation entre familles de l'admin TribuZen. Trois fichiers à écrire de zéro dans un dossier vide :

```
lab-11/
  lru.ts        # LRUCache<K, V> avec capacité fixe
  debounce.ts   # debounce(fn, delay) annulable
  index.ts      # buildIndex + search sur une liste de membres
  demo.ts       # câble le tout et log le comportement
```

Starter minimal (jeu de données, à mettre en haut de `demo.ts`) :

```ts
export type Member = { id: string; name: string; email: string };

export const MEMBERS: Member[] = [
  { id: 'm1', name: 'Dupont Alice',  email: 'alice@tribu.fr'   },
  { id: 'm2', name: 'Dupont Bruno',  email: 'bruno@tribu.fr'   },
  { id: 'm3', name: 'Martin Chloé',  email: 'chloe@martin.fr'  },
  { id: 'm4', name: 'Durand Éric',   email: 'eric@durand.fr'   },
  { id: 'm5', name: 'Nguyen Fanny',  email: 'fanny@nguyen.fr'  },
];
```

Contraintes :
- `LRUCache` : `get`/`set` en O(1) amorti, éviction du moins récemment utilisé quand la capacité est dépassée. La lecture (`get`) doit rafraîchir la récence.
- `debounce` : n'exécute qu'après `delay` ms d'inactivité, expose une méthode `cancel()`.
- `index` : `buildIndex` construit une seule fois `Map<terme, Set<id>>` (accents retirés, insensible à la casse) ; `search` fait un match par préfixe.

## Étapes (en friction)

1. Écris `LRUCache<K, V>(capacity)` à partir d'une `Map`. Sans regarder le cours : rappelle-toi que `Map` garde l'ordre d'insertion et que `get` doit `delete` puis `set` pour marquer la récence.
2. Vérifie l'éviction : capacité 2, insère `a`, `b`, `c` → `a` doit disparaître. Puis relis `b` avant d'insérer `d` : cette fois c'est `c` qui saute, pas `b`.
3. Écris `debounce(fn, delay)` avec `cancel()`. Appelle-le 5 fois d'affilée : `fn` ne doit s'exécuter qu'une fois.
4. Écris `tokenize`, `buildIndex`, puis `search(index, "dup")` → doit retourner `m1` et `m2`.
5. Dans `demo.ts`, câble une fausse recherche : un `debounce` de 200 ms qui appelle `search` et log les noms trouvés. Simule une frappe « d », « du », « dup » rapprochée → un seul log.
6. Ajoute un `LRUCache<string, Member>(3)` qui mémorise les membres « ouverts » ; ouvre 4 membres et montre lequel est évincé.

## Corrigé complet commenté

```ts
// ─── lru.ts ───────────────────────────────────────────────────────
export class LRUCache<K, V> {
  private map = new Map<K, V>();
  constructor(private capacity: number) {}

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key)!;
    this.map.delete(key);      // on retire l'entrée…
    this.map.set(key, value);  // …et on la réinsère en fin => « plus récente »
    return value;
  }

  set(key: K, value: V): void {
    if (this.map.has(key)) {
      this.map.delete(key);    // rafraîchir la position d'une clé existante
    } else if (this.map.size >= this.capacity) {
      // La 1re clé de la Map est la moins récemment utilisée => on l'évince
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest!);
    }
    this.map.set(key, value);
  }

  get size(): number { return this.map.size; }
  has(key: K): boolean { return this.map.has(key); }
}
```

```ts
// ─── debounce.ts ──────────────────────────────────────────────────
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer); // chaque appel ANNULE le précédent = réarme
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timer) { clearTimeout(timer); timer = null; }
  };

  return debounced;
}
```

```ts
// ─── index.ts ─────────────────────────────────────────────────────
import type { Member } from './demo';

// Minuscule + suppression des accents + découpe sur les non-mots
export function tokenize(text: string): string[] {
  return text.toLowerCase().normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')   // é -> e, ç -> c…
    .split(/\W+/).filter(Boolean);
}

// Construit UNE fois : terme -> ensemble d'ids de membres
export function buildIndex(members: Member[]): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  for (const m of members) {
    for (const term of tokenize(`${m.name} ${m.email}`)) {
      if (!index.has(term)) index.set(term, new Set());
      index.get(term)!.add(m.id);
    }
  }
  return index;
}

// Recherche par préfixe : on parcourt les TERMES (peu nombreux), pas les membres
export function search(index: Map<string, Set<string>>, query: string): Set<string> {
  const result = new Set<string>();
  const q = tokenize(query)[0] ?? '';
  if (!q) return result;
  for (const [term, ids] of index) {
    if (term.startsWith(q)) ids.forEach(id => result.add(id));
  }
  return result;
}
```

```ts
// ─── demo.ts ──────────────────────────────────────────────────────
import { LRUCache } from './lru';
import { debounce } from './debounce';
import { buildIndex, search } from './index';

export type Member = { id: string; name: string; email: string };

export const MEMBERS: Member[] = [
  { id: 'm1', name: 'Dupont Alice',  email: 'alice@tribu.fr'   },
  { id: 'm2', name: 'Dupont Bruno',  email: 'bruno@tribu.fr'   },
  { id: 'm3', name: 'Martin Chloé',  email: 'chloe@martin.fr'  },
  { id: 'm4', name: 'Durand Éric',   email: 'eric@durand.fr'   },
  { id: 'm5', name: 'Nguyen Fanny',  email: 'fanny@nguyen.fr'  },
];

// 1) Index construit UNE fois
const index = buildIndex(MEMBERS);
const byId = new Map(MEMBERS.map(m => [m.id, m]));

const runSearch = (q: string) => {
  const ids = search(index, q);
  const names = [...ids].map(id => byId.get(id)!.name);
  console.log(`search("${q}") ->`, names);
};

// 2) Recherche débouncée : 3 frappes rapprochées => 1 seule exécution
const debounced = debounce(runSearch, 200);
debounced('d');
debounced('du');
debounced('dup');            // seul celui-ci s'exécutera (après 200 ms de silence)
// => search("dup") -> [ 'Dupont Alice', 'Dupont Bruno' ]

// 3) LRU des membres « ouverts », capacité 3
const opened = new LRUCache<string, Member>(3);
opened.set('m1', MEMBERS[0]);
opened.set('m2', MEMBERS[1]);
opened.set('m3', MEMBERS[2]);
opened.get('m1');            // m1 redevient le plus récent
opened.set('m4', MEMBERS[3]); // capacité dépassée => on évince le LRU = m2
console.log('m2 encore là ?', opened.has('m2')); // false
console.log('m1 encore là ?', opened.has('m1')); // true (rafraîchi par le get)
```

Lancer : `npx tsx demo.ts` (ou coller dans un playground TS). Observe que la recherche débouncée ne log qu'une fois, et que `m2` est bien la victime d'éviction parce que `m1` a été rafraîchi juste avant.

## Variante J+30 (fading)

Reprends le lab **de mémoire, en 25 min**, avec deux contraintes ajoutées :
1. Écris une version `throttle` du debounce : exécute au plus une fois toutes les 200 ms *pendant* la frappe — et explique à voix haute pourquoi ce n'est PAS ce qu'on veut pour une recherche live.
2. Ajoute un `fuzzyMatch(query, text)` par sous-séquence et fais que `search` retombe dessus quand le préfixe ne donne aucun résultat (`"dpnt"` doit encore trouver « Dupont »).

## Application TribuZen

Porte le trio dans `smaurier/tribuzen` :
- `src/lib/lruCache.ts` — la classe `LRUCache`, réutilisée par `familyCache.ts` pour garder les 20 derniers profils de familles consultés (capacité 20).
- `src/lib/debounce.ts` — utilitaire partagé, importé par `MemberSearch.tsx` (delay 250 ms).
- `src/lib/searchIndex.ts` — `buildIndex` + `search` + `fuzzyMatch`, alimenté par la liste de membres/familles déjà en mémoire.
- Branche `MemberSearch.tsx` sur l'index (filtrage client, zéro requête), puis ajoute un `TokenBucket` dans `src/features/invites/inviteLimiter.ts` pour plafonner les invitations (5/min par utilisateur).

Commit suggéré : `feat(admin): recherche membres client (debounce + index inversé) + LRU cache familles`.
