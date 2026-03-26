# Lab 03 — Stacks et Queues

## Objectifs

- Implémenter un **validateur de parenthèses** avec une stack
- Construire un **évaluateur d'expressions** en notation polonaise inverse (RPN)
- Implémenter un **système undo/redo** avec deux stacks
- Construire un **LRU Cache** complet

## Prérequis

- Module 03 (Stacks, queues, listes)

## Lancer l'exercice

```bash
npx tsx exercise.ts
```

## Instructions

### Partie 1 — Validateur de parenthèses étendu

Implémentez `isValidBrackets(s)` qui vérifie que les parenthèses `()`, crochets `[]` et accolades `{}` sont correctement appariés et imbriqués. Gérez aussi les cas d'erreur avec un message descriptif.

### Partie 2 — Évaluateur RPN

Implémentez `evalRPN(tokens)` qui évalue une expression en notation polonaise inverse. Supportez +, -, *, / (division entière).

### Partie 3 — Système Undo/Redo

Implémentez une classe `UndoRedoEditor` qui maintient un texte avec des opérations `type(text)`, `undo()`, `redo()`, et `getText()`.

### Partie Bonus — LRU Cache

Implémentez un `LRUCache` avec capacité fixe, `get(key)` et `set(key, value)`.
