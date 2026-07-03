# Lab 03 — Piles, files et listes chaînées

> **Outcome :** à la fin, tu sais implémenter un validateur de parenthèses avec une pile, une file FIFO en O(1) (pas de `shift()`), et une liste chaînée simple — en TypeScript, sans harnais de test simulé.
> **Vrai outil :** Node + `tsx` (exécution directe du `.ts`) ; tu observes les `console.log` réels dans le terminal.
> **Feedback :** le coach valide en session — pas de test-runner auto-correcteur, pas de gap-fill.

---

## Énoncé

Tu écris trois structures de zéro dans un seul fichier `stacks-queues.ts`, puis tu les exerces avec des `console.log` dont tu **prédis la sortie avant de lancer**.

1. **`isBalanced(input: string): boolean`** — valide que `()`, `[]`, `{}` sont bien appariés et imbriqués, avec une **pile**.
2. **`Queue<T>`** — file FIFO avec `enqueue`, `dequeue`, `peek`, `isEmpty`, `size`, en **O(1)** grâce à deux pointeurs `head` / `tail` (interdiction d'`Array.shift()`).
3. **`SinglyLinkedList<T>`** — liste chaînée simple avec `prepend` (O(1)), `append` (O(n)), `toArray`.

### Starter minimal

Crée un dossier et un fichier `stacks-queues.ts` :

```
lab-03/
  stacks-queues.ts   ← tout ton code ici
```

Squelette de départ (tu remplis les corps toi-même) :

```typescript
// stacks-queues.ts

// ── 1. Pile : validateur de parenthèses ────────────────────────
function isBalanced(input: string): boolean {
  // à écrire : pile d'ouvrantes, matching à chaque fermante
  return false;
}

// ── 2. File FIFO en O(1) ───────────────────────────────────────
class Queue<T> {
  // à écrire : items en Record<number, T> + head/tail
}

// ── 3. Liste chaînée simple ────────────────────────────────────
class SinglyLinkedList<T> {
  // à écrire : ListNode { value, next }, head, prepend, append, toArray
}

// ── Bac à sable : prédis chaque sortie AVANT de lancer ─────────
console.log(isBalanced('(())[{}]')); // ?
console.log(isBalanced('([)]'));     // ?
```

Lance avec :

```bash
npx tsx stacks-queues.ts
```

---

## Étapes (en friction)

1. **Écris `isBalanced`** : une pile `string[]`, un `Set` d'ouvrantes, un `Record` fermante → ouvrante attendue. À chaque fermante, `pop()` et compare ; à la fin, la pile doit être vide.
2. **Prédis puis vérifie** : `'(())[{}]'` → `true`, `'([)]'` → `false`, `'{'` → `false`, `''` → `true`. Écris ta prédiction en commentaire **avant** de lancer.
3. **Écris `Queue<T>`** avec `items: Record<number, T>`, `head = 0`, `tail = 0`. `enqueue` écrit en `tail++`, `dequeue` lit en `head`, `delete` puis `head++`. Aucun `shift()`.
4. **Prouve le O(1)** : enfile 100 000 nombres puis défile-les tous entre `console.time` / `console.timeEnd`. Compare mentalement avec ce que ferait `shift()` (O(n²)).
5. **Écris `SinglyLinkedList<T>`** : `prepend` rebranche `head` (O(1)), `append` traverse jusqu'au dernier nœud (O(n)), `toArray` parcourt les `next`.
6. **Vérifie l'ordre** : `prepend(3); prepend(2); prepend(1); append(4)` puis `toArray()` doit donner `[1, 2, 3, 4]`.

---

## Corrigé complet commenté

```typescript
// stacks-queues.ts — corrigé

// ── 1. Pile : validateur de parenthèses ────────────────────────
function isBalanced(input: string): boolean {
  const stack: string[] = [];
  // à chaque fermante, l'ouvrante attendue
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const openers = new Set(['(', '[', '{']);

  for (const char of input) {
    if (openers.has(char)) {
      stack.push(char);              // ouvrante → empiler
    } else if (char in pairs) {
      // fermante → le sommet doit être l'ouvrante correspondante
      if (stack.pop() !== pairs[char]) {
        return false;                // mauvais match OU pile vide (pop = undefined)
      }
    }
    // tout autre caractère est ignoré
  }

  // il ne doit rester aucune ouvrante non fermée
  return stack.length === 0;
}

console.log(isBalanced('(())[{}]')); // true
console.log(isBalanced('([)]'));     // false — imbrication croisée
console.log(isBalanced('{'));        // false — jamais fermée
console.log(isBalanced(''));         // true — rien à équilibrer

// ── 2. File FIFO en O(1) ───────────────────────────────────────
class Queue<T> {
  private items: Record<number, T> = {};
  private head = 0; // index du prochain à défiler
  private tail = 0; // index de la prochaine place libre

  enqueue(item: T): void {
    this.items[this.tail] = item; // on écrit à la fin
    this.tail++;
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.items[this.head];
    delete this.items[this.head]; // libère la mémoire du slot consommé
    this.head++;                  // avance la tête, PAS de décalage → O(1)
    return item;
  }

  peek(): T | undefined {
    return this.items[this.head];
  }

  isEmpty(): boolean {
    return this.head === this.tail;
  }

  get size(): number {
    return this.tail - this.head;
  }
}

const invites = new Queue<string>();
invites.enqueue('alice');
invites.enqueue('bob');
invites.enqueue('carol');
console.log(invites.dequeue()); // 'alice' — premier arrivé, premier servi
console.log(invites.peek());    // 'bob'
console.log(invites.size);      // 2

// Preuve du O(1) : 100k enqueue + 100k dequeue reste quasi instantané.
// Avec Array.shift(), ce serait O(n²) (~des centaines de ms).
console.time('queue-100k');
const big = new Queue<number>();
for (let i = 0; i < 100_000; i++) big.enqueue(i);
while (!big.isEmpty()) big.dequeue();
console.timeEnd('queue-100k');

// ── 3. Liste chaînée simple ────────────────────────────────────
class ListNode<T> {
  value: T;
  next: ListNode<T> | null = null;
  constructor(value: T) {
    this.value = value;
  }
}

class SinglyLinkedList<T> {
  head: ListNode<T> | null = null;

  // Ajout en tête — O(1) : on rebranche un seul pointeur
  prepend(value: T): void {
    const node = new ListNode(value);
    node.next = this.head;
    this.head = node;
  }

  // Ajout en fin — O(n) : il faut traverser jusqu'au dernier nœud
  append(value: T): void {
    const node = new ListNode(value);
    if (!this.head) {
      this.head = node;
      return;
    }
    let current = this.head;
    while (current.next) current = current.next;
    current.next = node;
  }

  // Parcours des next jusqu'à null
  toArray(): T[] {
    const out: T[] = [];
    let current = this.head;
    while (current) {
      out.push(current.value);
      current = current.next;
    }
    return out;
  }
}

const list = new SinglyLinkedList<number>();
list.prepend(3);
list.prepend(2);
list.prepend(1);
list.append(4);
console.log(list.toArray()); // [1, 2, 3, 4]
```

**Pourquoi ce corrigé est correct :**
- `isBalanced` : `stack.pop()` renvoie `undefined` si la pile est vide (fermante sans ouvrante), ce qui est ≠ de l'ouvrante attendue → `false` sans cas spécial. La pile vide à la fin garantit qu'aucune ouvrante ne reste.
- `Queue` : `dequeue` avance `head` sans décaler les autres éléments → O(1) amorti, contrairement à `Array.shift()` en O(n). Le `delete` évite que `items` retienne les slots consommés.
- `SinglyLinkedList` : `prepend` est O(1) (un seul rebranchement), `append` est O(n) faute de pointeur `tail` — ce contraste avec l'array (accès O(1) mais insertion en tête O(n)) est tout l'intérêt de l'exercice.

---

## Variante J+30 (fading)

**Même objectif, reproduit de mémoire en 25 minutes, avec deux contraintes ajoutées :**

1. Étends `isBalanced` en `firstError(input): number | null` qui retourne l'**index** du premier caractère fautif (fermante orpheline ou mauvaise imbrication), ou `null` si tout est équilibré. Empile les **indices** des ouvrantes, pas les caractères.
2. Ajoute une **monotonic stack** : `nextGreater(nums: number[]): number[]` qui, pour chaque élément, renvoie le prochain strictement plus grand à sa droite (`-1` sinon), en O(n). Empile des indices.
3. **Sans rouvrir ce corrigé** ni le module.

**Critère de réussite :** `firstError('a(b]c')` renvoie l'index du `]` ; `nextGreater([4,5,2,10,8])` renvoie `[5,10,10,-1,-1]`, et tu peux expliquer pourquoi la complexité reste O(n) malgré le `while` imbriqué.

---

## Application TribuZen

Dans le repo `smaurier/tribuzen`, ces structures portent trois fonctionnalités :

```
tribuzen/src/features/
  editor/history.ts        ← pile undo/redo de l'éditeur admin
  invitations/queue.ts     ← file FIFO de traitement des invitations
  leaderboard/ranks.ts     ← monotonic stack (prochain membre mieux classé)
```

**Différences par rapport au lab :**
- `editor/history.ts` utilise **deux** piles (`undoStack` + `redoStack`) au lieu du seul validateur du lab — même primitive LIFO, appliquée à des snapshots d'état.
- `invitations/queue.ts` branche la `Queue` sur un vrai mailer async (`await send(invite)`) et gère un flag `processing` pour n'avoir qu'un worker à la fois.
- `leaderboard/ranks.ts` réutilise le pattern monotonic stack de la variante J+30 sur le score d'engagement des membres.

**Commit cible :**
```
feat(editor): pile undo/redo pour l'éditeur admin
feat(invitations): file FIFO O(1) de traitement des invitations
feat(leaderboard): monotonic stack — prochain membre mieux classé
```
