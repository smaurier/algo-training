// =============================================================================
// Lab 11 — Patterns Fullstack
// =============================================================================
// Exécuter avec : npx tsx exercise.ts
// =============================================================================

console.log("=== Lab 11 : Patterns Fullstack ===\n");

// =============================================================================
// PARTIE 0 : Rappels JS natifs (Array/Object)
// =============================================================================

console.log("--- Partie 0 : Rappels JS natifs ---");

interface TeamMember {
  id: number;
  nom: string;
  role: 'admin' | 'editor' | 'reader';
  actif: boolean;
}

const team: TeamMember[] = [
  { id: 1, nom: 'Alice', role: 'admin', actif: true },
  { id: 2, nom: 'Bob', role: 'editor', actif: false },
  { id: 3, nom: 'Chloe', role: 'editor', actif: true },
  { id: 4, nom: 'Dina', role: 'reader', actif: true },
];

function nomsActifs(users: TeamMember[]): string[] {
  // TODO : Retourner les noms des utilisateurs actifs en utilisant filter + map
  return [];
}

function grouperNomsParRole(users: TeamMember[]): Record<string, string[]> {
  // TODO : Grouper les noms par role avec reduce
  return {};
}

function resumeRoles(groupes: Record<string, string[]>): string {
  // TODO : Utiliser Object.entries pour produire une chaine du type
  // "admin:1, editor:1, reader:1"
  return '';
}

console.log('Actifs:', nomsActifs(team), '(attendu: [Alice, Chloe, Dina])');
console.log('Groupes:', grouperNomsParRole(team));
console.log('Resume:', resumeRoles(grouperNomsParRole(team)), '(attendu: admin:1, editor:1, reader:1)');

// =============================================================================
// PARTIE 1 : Debounce & Throttle
// =============================================================================

console.log("--- Partie 1 : Debounce & Throttle ---");

function debounce<T extends (...args: any[]) => void>(fn: T, delayMs: number): T {
  // TODO : Retarder l'exécution de fn jusqu'à ce qu'il n'y ait plus d'appel
  // pendant delayMs millisecondes.
  // À chaque appel : annuler le timer précédent, lancer un nouveau setTimeout

  return fn; // À modifier
}

function throttle<T extends (...args: any[]) => void>(fn: T, intervalMs: number): T {
  // TODO : Garantir que fn s'exécute au maximum une fois par intervalMs
  // Utiliser un booléen `waiting` : si true, ignorer l'appel
  // Après exécution, mettre waiting=true et setTimeout pour le réinitialiser

  return fn; // À modifier
}

// Test debounce
let debounceCount = 0;
const debouncedFn = debounce(() => { debounceCount++; }, 100);
debouncedFn(); debouncedFn(); debouncedFn();
await new Promise(r => setTimeout(r, 150));
console.log(`Debounce: appelé 3x, exécuté ${debounceCount}x (attendu: 1)`);

// Test throttle
let throttleCount = 0;
const throttledFn = throttle(() => { throttleCount++; }, 100);
throttledFn(); throttledFn(); throttledFn();
await new Promise(r => setTimeout(r, 250));
throttledFn();
console.log(`Throttle: appelé 4x, exécuté ${throttleCount}x (attendu: 2)`);

// =============================================================================
// PARTIE 2 : LRU Cache avec TTL
// =============================================================================

console.log("\n--- Partie 2 : LRU Cache ---");

class LRUCache<K, V> {
  private cache = new Map<K, { value: V; expiry: number }>();

  constructor(
    private capacity: number,
    private ttlMs: number = Infinity
  ) {}

  get(key: K): V | undefined {
    // TODO : Retourner la valeur si elle existe et n'est pas expirée
    // Si expirée → supprimer et retourner undefined
    // Sinon → rafraîchir la position (delete + set pour Map ordering)
    return undefined;
  }

  set(key: K, value: V): void {
    // TODO : Ajouter/modifier une entrée
    // Si la clé existe déjà → delete pour rafraîchir la position
    // Si capacité atteinte → supprimer la plus ancienne (map.keys().next())
    // Ajouter avec expiry = Date.now() + ttlMs
  }

  get size(): number {
    return this.cache.size;
  }
}

const cache = new LRUCache<string, number>(3, 500);
cache.set("a", 1); cache.set("b", 2); cache.set("c", 3);
console.log("get(a):", cache.get("a")); // 1
cache.set("d", 4); // éjecte "b" (LRU car "a" a été accédé)
console.log("get(b):", cache.get("b")); // undefined (éjecté)
console.log("size:", cache.size);       // 3

// Test TTL
await new Promise(r => setTimeout(r, 600));
console.log("get(a) après TTL:", cache.get("a")); // undefined (expiré)

// =============================================================================
// PARTIE 3 : Token Bucket Rate Limiter
// =============================================================================

console.log("\n--- Partie 3 : Token Bucket ---");

class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,
    private refillRate: number // tokens par seconde
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  tryConsume(tokens: number = 1): boolean {
    // TODO :
    // 1. Calculer le temps écoulé depuis lastRefill
    // 2. Ajouter des tokens proportionnellement (sans dépasser capacity)
    // 3. Si assez de tokens → consommer et retourner true
    // 4. Sinon → retourner false

    return false;
  }

  get available(): number {
    return Math.floor(this.tokens);
  }
}

const bucket = new TokenBucket(5, 2); // 5 max, recharge 2/sec
console.log("consume 1:", bucket.tryConsume(1)); // true
console.log("consume 3:", bucket.tryConsume(3)); // true
console.log("available:", bucket.available);      // 1
console.log("consume 3:", bucket.tryConsume(3)); // false (pas assez)

// =============================================================================
// PARTIE BONUS : Cursor Pagination
// =============================================================================

console.log("\n--- Bonus : Cursor Pagination ---");

interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

function paginateCursor<T extends { id: number }>(
  items: T[],
  cursor: string | null,
  limit: number
): PaginatedResult<T> {
  // TODO : Paginer les items en utilisant un curseur opaque
  // Le curseur est un id encodé en base64 : btoa(String(id))
  // Décoder : Number(atob(cursor))
  // Trouver l'index de l'item après le curseur, retourner limit items

  return { data: [], nextCursor: null, hasMore: false };
}

const products = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
}));

let page = paginateCursor(products, null, 5);
console.log("Page 1:", page.data.map(p => p.name), "hasMore:", page.hasMore);

page = paginateCursor(products, page.nextCursor, 5);
console.log("Page 2:", page.data.map(p => p.name), "hasMore:", page.hasMore);

console.log("\n=== Fin du Lab 11 ===");
