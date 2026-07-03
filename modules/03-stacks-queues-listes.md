---
titre: Piles, files et listes chaînées
cours: 05-algorithms
notions: [stack LIFO, usages de la stack, queue FIFO, usages de la queue, deque, priority queue en survol, listes chaînées simple et double, array vs linked list, monotonic stack]
outcomes: [implémenter une pile et une file en O(1) en JavaScript, choisir la bonne structure selon l'ordre de traitement, appliquer le pattern monotonic stack, savoir pourquoi on utilise rarement une liste chaînée en JS]
prerequis: [02-tableaux-chaines-hash-maps]
next: 04-recursion-divide-conquer-binary-search
libs: []
tribuzen: pile d'undo de l'éditeur admin, file de traitement des invitations, monotonic stack pour un classement
last-reviewed: 2026-07
---

# Piles, files et listes chaînées

> **Outcomes — tu sauras FAIRE :** implémenter une pile et une file en O(1) en JavaScript, choisir la structure selon l'ordre de traitement (LIFO/FIFO/priorité), appliquer le pattern monotonic stack, et justifier pourquoi on n'écrit presque jamais de liste chaînée en JS.
> **Difficulté :** :star::star:

## 1. Cas concret d'abord

Tu reprends l'éditeur de contenu de l'admin TribuZen. Un collègue a codé le bouton "Annuler" (undo) comme ça :

```typescript
// editor.ts — AVANT
let content = '';
let previousContent = ''; // ⚠️ une seule étape mémorisée

function applyEdit(next: string): void {
  previousContent = content; // on écrase l'historique précédent
  content = next;
}

function undo(): void {
  content = previousContent; // ne remonte QUE d'un cran
}
```

**Trois problèmes immédiats :**
1. `undo()` ne remonte que d'une seule étape — impossible d'annuler 5 frappes de suite.
2. Aucun `redo` possible : dès qu'on annule, l'état "futur" est perdu.
3. La logique "dernière action d'abord" est là mais non nommée — c'est en réalité une **pile** (stack).

Le bon outil ici est une **pile** : le dernier état empilé est le premier restauré (LIFO). Ce module te donne les trois structures — pile, file, liste chaînée — pour reconnaître et coder ce genre de logique correctement.

---

## 2. Théorie complète, concise

### 2.1 Stack (pile) — LIFO

**LIFO = Last In, First Out.** Le dernier élément empilé est le premier dépilé. Pense à une pile d'assiettes : tu prends toujours celle du dessus.

Toutes les opérations sont O(1) :

| Opération | Rôle | Coût |
|---|---|---|
| `push(x)` | empiler au sommet | O(1) |
| `pop()` | dépiler le sommet | O(1) |
| `peek()` | lire le sommet sans dépiler | O(1) |
| `isEmpty()` | pile vide ? | O(1) |
| `size` | nombre d'éléments | O(1) |

```typescript
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  get size(): number {
    return this.items.length;
  }
}
```

> En JavaScript, un simple `Array` avec `push` / `pop` **est déjà une pile parfaite** en O(1). La classe n'apporte que la clarté d'intention et l'encapsulation.

**Usages typiques de la pile :**
- **Validation de parenthèses / matching** : on empile chaque ouvrante, on dépile à chaque fermante.
- **Undo / redo** : chaque état passé est empilé ; annuler = dépiler.
- **Call stack** : le moteur JS empile chaque appel de fonction et dépile au `return` (d'où le terme "stack overflow" en récursion infinie — module 04).
- **DFS (parcours en profondeur)** : la pile explicite remplace la récursion pour explorer un graphe/arbre.

### 2.2 Queue (file) — FIFO

**FIFO = First In, First Out.** Le premier arrivé est le premier servi, comme une file au supermarché.

Le piège majeur : en JS, `Array.shift()` est **O(n)** (il décale tous les éléments). Une file correcte utilise deux pointeurs `head` / `tail` pour rester en O(1).

```typescript
// ❌ Naïf — dequeue en O(n), désastreux en boucle
class NaiveQueue<T> {
  private items: T[] = [];
  enqueue(item: T): void { this.items.push(item); }
  dequeue(): T | undefined { return this.items.shift(); } // ⚠️ O(n)
}

// ✅ Correct — dequeue en O(1) amorti grâce à head/tail
class Queue<T> {
  private items: Record<number, T> = {};
  private head = 0;
  private tail = 0;

  enqueue(item: T): void {
    this.items[this.tail] = item;
    this.tail++;
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.items[this.head];
    delete this.items[this.head];
    this.head++;
    return item;
  }

  peek(): T | undefined {
    return this.items[this.head];
  }

  isEmpty(): boolean {
    return this.tail === this.head;
  }

  get size(): number {
    return this.tail - this.head;
  }
}
```

**Usages typiques de la file :**
- **BFS (parcours en largeur)** : on traite les nœuds niveau par niveau (module 07).
- **Files de traitement (job queue)** : emails, invitations, webhooks traités dans l'ordre d'arrivée.
- **Buffers** : lisser un flux d'événements reçus plus vite qu'ils ne sont consommés.

### 2.3 Deque (double-ended queue)

Un **deque** autorise l'ajout et le retrait aux **deux** extrémités en O(1). C'est la base du pattern "sliding window maximum" (module 11).

```typescript
class Deque<T> {
  private items: Record<number, T> = {};
  private head = 0;
  private tail = 0;

  pushBack(item: T): void { this.items[this.tail++] = item; }
  pushFront(item: T): void { this.items[--this.head] = item; }

  popBack(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.items[--this.tail];
    delete this.items[this.tail];
    return item;
  }

  popFront(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.items[this.head];
    delete this.items[this.head++];
    return item;
  }

  isEmpty(): boolean { return this.tail === this.head; }
  get size(): number { return this.tail - this.head; }
}
```

Une pile et une file ne sont que des cas particuliers d'un deque (on se restreint à une seule extrémité).

### 2.4 Priority queue (survol)

Une **priority queue** défile par **priorité**, pas par ordre d'arrivée. Version naïve pour l'intuition :

```typescript
class SimplePriorityQueue<T> {
  private items: { value: T; priority: number }[] = [];

  enqueue(value: T, priority: number): void {
    this.items.push({ value, priority });
    // ⚠️ tri à chaque insertion = O(n log n), non optimal
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.value;
  }
}
```

L'implémentation efficace (insertion et extraction en O(log n)) repose sur un **heap** — sujet détaillé au **module 05**. Ici, retiens seulement le concept : "sortir le plus prioritaire d'abord".

### 2.5 Listes chaînées — culture utile, usage rare en JS

Une **liste chaînée** relie des nœuds par des pointeurs `next` (simple) ou `prev` + `next` (double), au lieu de les stocker de façon contiguë comme un tableau.

```typescript
class ListNode<T> {
  value: T;
  next: ListNode<T> | null = null;
  constructor(value: T) {
    this.value = value;
  }
}

class SinglyLinkedList<T> {
  head: ListNode<T> | null = null;

  // Ajout en tête — O(1) (pas de décalage, on rebranche un pointeur)
  prepend(value: T): void {
    const node = new ListNode(value);
    node.next = this.head;
    this.head = node;
  }

  // Accès au i-ème — O(n) : il faut traverser depuis la tête
  at(index: number): T | undefined {
    let current = this.head;
    let i = 0;
    while (current && i < index) {
      current = current.next;
      i++;
    }
    return current?.value;
  }

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
```

Le compromis fondamental **array vs linked list** :

```
┌────────────────┬──────────────┬────────────────┐
│  Opération     │  Array       │  Linked list   │
├────────────────┼──────────────┼────────────────┤
│  Accès [i]     │  O(1)        │  O(n)          │
│  Insert tête   │  O(n)        │  O(1)          │
│  Insert milieu │  O(n)        │  O(1)*         │
│  Suppression   │  O(n)        │  O(1)*         │
│  Mémoire       │  contiguë    │  fragmentée    │
│  Cache CPU     │  excellent   │  mauvais       │
└────────────────┴──────────────┴────────────────┘
* O(1) seulement si on tient déjà le nœud voisin
```

**Quand l'utiliser en JS ?** Presque jamais seule : `Array` et `Map` couvrent 99 % des besoins, et la localité mémoire du tableau bat souvent la linked list en pratique. Les vrais cas :
- comprendre les **pointeurs / références** et le fonctionnement de la call stack ;
- la brique interne d'un **LRU cache** (Map + doubly linked list, tout en O(1)) ;
- lire du code C / Rust / Go où c'est courant.

Retiens la règle : *tu dois savoir la lire et raisonner dessus, pas la réimplémenter en prod.*

### 2.6 Monotonic stack (pattern)

Une **monotonic stack** est une pile qu'on maintient volontairement **triée** (croissante ou décroissante) en dépilant les éléments qui violent l'ordre. Elle résout en **O(n)** les problèmes du type "prochain élément plus grand / plus petit" qui seraient O(n²) en force brute.

```typescript
// Pour chaque élément, trouver le prochain STRICTEMENT plus grand à sa droite.
function nextGreaterElement(nums: number[]): number[] {
  const result = new Array<number>(nums.length).fill(-1);
  const stack: number[] = []; // on empile des INDICES, pas des valeurs

  for (let i = 0; i < nums.length; i++) {
    // Tant que le courant dépasse le sommet, il EST son "prochain plus grand"
    while (stack.length > 0 && nums[i] > nums[stack[stack.length - 1]]) {
      const idx = stack.pop()!;
      result[idx] = nums[i];
    }
    stack.push(i);
  }

  return result;
}

console.log(nextGreaterElement([4, 5, 2, 10, 8])); // [5, 10, 10, -1, -1]
```

Chaque indice est empilé et dépilé **au plus une fois** → O(n) au total, malgré la boucle `while` imbriquée.

---

## 3. Worked examples

### Exemple 1 — Validation de parenthèses (pile)

Problème : vérifier que `()`, `[]`, `{}` sont bien appariés **et** bien imbriqués. `([)]` est invalide.

```typescript
function isBalanced(input: string): boolean {
  const stack: string[] = [];
  // À chaque fermante, on connaît l'ouvrante attendue
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const openers = new Set(['(', '[', '{']);

  for (const char of input) {
    if (openers.has(char)) {
      stack.push(char);            // ouvrante → on empile
    } else if (char in pairs) {
      // fermante → le sommet DOIT être l'ouvrante correspondante
      if (stack.pop() !== pairs[char]) {
        return false;
      }
    }
    // autres caractères ignorés
  }

  // pile vide = toutes les ouvrantes ont été fermées
  return stack.length === 0;
}

console.log(isBalanced('(())[{}]')); // true
console.log(isBalanced('([)]'));     // false — mauvaise imbrication
console.log(isBalanced('{'));        // false — jamais fermée
console.log(isBalanced(''));         // true
```

Déroulé de `([)]` :
1. `(` → `push` → pile `['(']`
2. `[` → `push` → pile `['(', '[']`
3. `)` → attendu `(`, sommet réel `[` → `'[' !== '('` → **false**.

Complexité : O(n) temps, O(n) espace (pire cas : que des ouvrantes).

### Exemple 2 — File de traitement des invitations (queue) + fading

Contexte TribuZen : quand un admin invite 200 membres d'un coup, on ne peut pas envoyer 200 emails en parallèle. On les met en file et un worker les traite dans l'ordre, à un rythme maîtrisé.

```typescript
interface Invitation {
  email: string;
  familyId: string;
}

class InvitationQueue {
  private queue = new Queue<Invitation>(); // la Queue O(1) de la section 2.2
  private processing = false;

  add(invite: Invitation): void {
    this.queue.enqueue(invite);
  }

  // Dépile et traite une invitation à la fois, dans l'ordre d'arrivée (FIFO)
  async processAll(send: (i: Invitation) => Promise<void>): Promise<void> {
    if (this.processing) return; // un seul worker à la fois
    this.processing = true;

    while (!this.queue.isEmpty()) {
      const invite = this.queue.dequeue()!;
      await send(invite); // await = on respecte le rythme, pas de flood
    }

    this.processing = false;
  }
}

// Usage
const q = new InvitationQueue();
q.add({ email: 'a@tribuzen.app', familyId: 'f1' });
q.add({ email: 'b@tribuzen.app', familyId: 'f1' });

await q.processAll(async (invite) => {
  await fakeSendEmail(invite.email); // remplacé par un vrai mailer côté prod
});
```

**Fading — pourquoi pas une pile ici ?** Une invitation envoyée en premier doit partir en premier (équité, ordre chronologique). Une pile (LIFO) traiterait la **dernière** invitation d'abord — inacceptable. Le choix FIFO n'est pas cosmétique, il porte une règle métier.

---

## 4. Pièges & misconceptions

### PIÈGE #1 — Utiliser `Array.shift()` comme file

```typescript
// ❌ shift() décale tout le tableau à chaque appel → O(n) par dequeue → O(n²)
const q: number[] = [];
for (let i = 0; i < 100_000; i++) q.push(i);
while (q.length) q.shift(); // ~500 ms sur 100k éléments

// ✅ Queue avec head/tail → O(1) par dequeue → O(n) total (~5 ms)
```

**Correct :** pour une pile, `push`/`pop` sur un tableau sont O(1), aucun souci. Pour une file, jamais `shift()` en boucle intensive — utilise `head`/`tail`.

### PIÈGE #2 — Confondre LIFO et FIFO

```typescript
// ❌ "J'ai utilisé une pile pour ma file de tâches" → l'ordre s'inverse
const tasks = ['A', 'B', 'C'];
const stack: string[] = [];
tasks.forEach(t => stack.push(t));
stack.pop(); // 'C' — la DERNIÈRE tâche traitée en premier !

// ✅ Ordre d'arrivée = file (FIFO). Ordre inverse = pile (LIFO).
```

**Test mental :** "le premier arrivé doit-il être servi en premier ?" Oui → file. "La dernière action doit-elle être défaite en premier ?" Oui → pile.

### PIÈGE #3 — Croire qu'une linked list est "plus rapide" qu'un array en JS

```typescript
// ❌ "L'insertion en O(1) rend la linked list plus rapide"
// Faux en pratique : l'accès [i] en O(n) + la fragmentation mémoire
// (mauvaise localité de cache) rendent souvent le tableau PLUS rapide,
// même pour des insertions, sur des tailles réalistes.

// ✅ En JS : Array par défaut. Map pour le lookup par clé. Linked list
//    seulement comme brique interne (LRU cache) ou exercice de raisonnement.
```

**Correct :** la complexité asymptotique ne dit pas tout — les constantes et le cache CPU comptent. Le tableau contigu gagne souvent.

### PIÈGE #4 — Monotonic stack : empiler les valeurs au lieu des indices

```typescript
// ❌ On empile les valeurs → on perd la position, impossible de remplir result[idx]
stack.push(nums[i]);

// ✅ On empile les INDICES → on peut écrire result[idx] = nums[i]
stack.push(i);
```

Dans une monotonic stack, on a presque toujours besoin de la **position** de l'élément en attente, pas seulement de sa valeur.

---

## 5. Ancrage TribuZen

Ces trois structures portent des fonctionnalités concrètes du produit :

**Pile d'undo — éditeur admin** (`src/features/editor/history.ts`)
L'éditeur de contenu (descriptions de familles, événements) mémorise chaque état dans une pile `undoStack`. `undo()` dépile vers une `redoStack` ; toute nouvelle édition vide la `redoStack`. C'est exactement le cas concret d'ouverture du module, corrigé.

**File de traitement des invitations** (`src/features/invitations/queue.ts`)
Quand un admin invite en masse, les invitations entrent dans une `Queue` FIFO et un worker les envoie une par une, dans l'ordre chronologique — équité garantie, pas de flood du serveur mail. C'est l'Exemple 2.

**Monotonic stack — classement** (`src/features/leaderboard/ranks.ts`)
Sur le classement d'engagement des membres, on veut pour chaque membre "le prochain membre mieux classé" (pour afficher "il te reste X points avant de dépasser Y"). Une monotonic stack calcule tout le tableau en O(n) au lieu de comparer chaque paire.

```
tribuzen/src/features/
  editor/history.ts        ← pile undo/redo
  invitations/queue.ts     ← file FIFO de traitement
  leaderboard/ranks.ts     ← monotonic stack (prochain mieux classé)
```

---

## 6. Points clés

1. **Pile (LIFO)** : `push`/`pop` en O(1). Cas : parenthèses, undo/redo, call stack, DFS.
2. En JS, un `Array` avec `push`/`pop` **est** une pile en O(1) — pas besoin de plus.
3. **File (FIFO)** : `enqueue`/`dequeue` en O(1) — à condition d'utiliser `head`/`tail`, jamais `shift()`.
4. Cas de la file : BFS, files de jobs (invitations, emails, webhooks), buffers.
5. **Deque** : ajout/retrait aux deux bouts en O(1) ; pile et file en sont des cas particuliers.
6. **Priority queue** : sort le plus prioritaire d'abord ; implémentation efficace = heap (module 05).
7. **Liste chaînée** : insertion en tête O(1) mais accès `[i]` en O(n) ; en JS on la lit/raisonne, on ne la code presque jamais en prod (Array + Map suffisent).
8. **Monotonic stack** : pile maintenue triée, résout "prochain plus grand/petit" en O(n) ; on empile des **indices**.

---

## 7. Seeds Anki

```
Quelle est la différence entre une pile (LIFO) et une file (FIFO) ?|Pile : le dernier entré sort en premier (push/pop au même bout). File : le premier entré sort en premier (enqueue au bout, dequeue en tête). Test : "premier arrivé, premier servi ?" → file.
Pourquoi Array.shift() est un mauvais dequeue en JavaScript ?|shift() retire en tête en décalant tous les autres éléments → O(n) par appel, donc O(n²) sur une boucle. Une vraie file utilise deux pointeurs head/tail pour rester en O(1).
En JS, faut-il une classe pour avoir une pile performante ?|Non. Un Array avec push() et pop() est déjà une pile en O(1). La classe n'apporte que la clarté d'intention et l'encapsulation.
Quels sont les usages classiques d'une pile ?|Validation/matching de parenthèses, undo-redo, call stack du moteur JS, et DFS (parcours en profondeur) via une pile explicite.
Array vs linked list : quel est le compromis fondamental ?|Array : accès [i] en O(1), insertion en tête/milieu en O(n), mémoire contiguë (bon cache). Linked list : insertion en O(1) si on tient le nœud, mais accès [i] en O(n) et mémoire fragmentée.
Quand utilise-t-on une liste chaînée en JavaScript de prod ?|Presque jamais seule — Array et Map couvrent 99% des cas. Surtout comme brique interne d'un LRU cache (Map + doubly linked list) ou comme exercice de raisonnement sur les pointeurs.
Qu'est-ce qu'une monotonic stack et que résout-elle ?|Une pile maintenue triée (croissante/décroissante) en dépilant ce qui viole l'ordre. Elle résout "prochain élément plus grand/plus petit" en O(n) au lieu de O(n²). On y empile des indices, pas des valeurs.
Comment implémente-t-on efficacement une priority queue ?|Avec un heap (tas binaire) : insertion et extraction du plus prioritaire en O(log n). La version qui trie à chaque insertion est O(n log n), à éviter. Détaillé au module 05.
```

---

## Pont vers le lab

> Lab associé : `05-algorithms/labs/lab-03-stacks-queues/README.md`. Implémenter le validateur de parenthèses, une file FIFO en O(1), et une liste chaînée simple — corrigé complet commenté + variante J+30.
