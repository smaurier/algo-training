# Module 00 — Prérequis et introduction

> **Objectif** : comprendre ce que ce cours couvre, pourquoi l'algorithmie est une compétence centrale dans une carrière JS fullstack, et comment progresser concrètement sans se perdre dans la théorie pure.

> **Difficulté** : ⭐ — accessible dès que tu sais lire et écrire du JavaScript.

::: info Pas de panique !
Ce module d'introduction est léger. Il pose le cadre. La vraie montée en charge commence au module 01. Si tu connais déjà la réponse à « pourquoi l'algorithmie ? », tu peux le survoler et passer directement au module suivant.
:::

---

## Prérequis

- Savoir écrire une boucle, une condition, une fonction en JavaScript
- Connaître `Array`, `Object`, `Map`, `Set` à un niveau basique
- Node.js 20+ installé (pour exécuter les labs en TypeScript via `tsx`)
- TypeScript utile mais non obligatoire — les notations de type sont expliquées au fil du cours

---

## 1. Qu'est-ce que l'algorithmie pour un développeur ?

L'algorithmie, c'est l'art de **résoudre un problème étape par étape**, en choisissant les bonnes structures et les bons raisonnements.

> 💡 Contrairement à ce que beaucoup pensent, l'algorithmie ne sert pas qu'aux entretiens d'embauche. Tu la recroises dans des dizaines de situations produit réelles.

### Analogie : la recette de cuisine

Un algorithme, c'est une recette :

```
Entrée   → ingrédients (données)
Étapes   → instructions ordonnées
Sortie   → plat terminé (résultat)
```

La différence entre un bon et un mauvais algorithme, c'est la différence entre une recette qui prend 20 minutes et une qui prend 3 heures pour le même plat.

---

## 2. Ce cours n'est PAS un cours de compétition

Ce cours est pensé pour un **développeur JavaScript fullstack** qui veut devenir ingénieur. L'objectif n'est pas de résoudre des puzzles LeetCode hard en 10 minutes, mais de développer des **réflexes de résolution** qui servent au quotidien.

| Ce qu'on fait ici | Ce qu'on ne fait PAS |
|---|---|
| Choisir la bonne structure pour un besoin métier | Apprendre des tricks pour concours |
| Raisonner sur le coût d'une solution | Mémoriser des formules sans comprendre |
| Reconnaître des patterns récurrents | S'arrêter à "ça marche" |
| Implémenter en TypeScript propre | Écrire du code cryptique optimisé à l'extrême |
| Faire le lien algo ↔ produit | Rester dans l'abstraction mathématique |

---

## 3. Pourquoi l'algorithmie compte dans ta carrière

### 3.1 Côté frontend

```
┌──────────────────────────────────────────────────┐
│  Autocomplétion          → Trie, prefix search   │
│  Virtualisation de liste → Sliding window        │
│  Recherche à facettes    → HashMap, counting      │
│  Arbre de routes         → DFS, pattern matching  │
│  Undo / Redo             → Stack                  │
│  Drag & drop ordering    → Sorting, insertion     │
│  Feed infini             → Pagination, cursors    │
│  Détection de cycles     → Graph traversal        │
│  Cache local             → LRU, TTL              │
└──────────────────────────────────────────────────┘
```

### 3.2 Côté backend

```
┌──────────────────────────────────────────────────┐
│  Rate limiting           → Sliding window, queue  │
│  Ordre de migration      → Topological sort       │
│  File de jobs            → Queue, priority queue   │
│  Déduplication           → Set, Bloom filter       │
│  Requêtes sur plages     → Prefix sums, B-tree     │
│  Graphe de permissions   → BFS/DFS, union-find     │
│  Scheduling              → Heap, greedy            │
│  Recherche full-text     → Trie, KMP               │
│  Index BDD               → B-tree, hash index      │
│  Cache distribué         → Consistent hashing      │
└──────────────────────────────────────────────────┘
```

### 3.3 Côté entretiens

La plupart des entretiens techniques en ESN, startup ou GAFAM incluent au moins une question d'algorithmie. Pas pour vérifier que tu connais le quick sort par cœur, mais pour voir :

- ta façon de **décomposer** un problème ;
- ta capacité à **communiquer** ton raisonnement ;
- ton réflexe de **vérifier** les cas limites ;
- ta maîtrise du **coût** de ta solution.

---

## 4. Les trois questions à se poser devant TOUT problème

C'est le réflexe le plus important du cours. Avant d'écrire une ligne de code :

### Question 1 — Quelles sont les entrées et les contraintes ?

```typescript
// Mauvais réflexe : commencer à coder immédiatement
// Bon réflexe : lister les contraintes

// Exemples de questions à se poser :
// - Quelle taille maximum ? 100 éléments ? 10 millions ?
// - Les données sont-elles triées ?
// - Y a-t-il des doublons ?
// - Peut-on modifier le tableau en place ?
// - Faut-il gérer les cas vides ?
```

### Question 2 — Quelle structure de données aide le plus ?

```
Besoin                         → Structure
─────────────────────────────────────────────────
Accès rapide par clé           → Map
Détection de doublons          → Set
Ordre d'arrivée maintenu       → Array / Queue
Dernier arrivé, premier sorti  → Stack
Min ou max courant             → Heap
Relations entre entités        → Graph
Hiérarchie                     → Tree
Préfixes / autocomplétion      → Trie
```

### Question 3 — Quel coût est acceptable ?

```
10 éléments     → n'importe quoi marche, même O(n³)
1 000 éléments  → O(n²) est souvent acceptable
100 000         → O(n log n) ou mieux
1 000 000       → O(n) fortement préférable
10 000 000+     → O(n) obligatoire, O(n log n) à la rigueur
```

> 💡 La réponse à ces trois questions change souvent la solution du tout au tout.

---

## 5. Comment est structuré ce cours

```
00-algorithms/
├── modules/         → 13+ modules théoriques (Markdown, celui-ci est le premier)
├── labs/            → 12+ labs pratiques (TypeScript exécutable)
├── quizzes/         → quizzes interactifs HTML pour valider les notions
├── visualizations/  → visualisations animées des structures clés
├── glossaire.md     → glossaire de tous les termes
├── scripts/         → outils internes
└── .vitepress/      → configuration du site de cours
```

### Cycle d'apprentissage par module

```
┌──────────────────────────────────────────────────────────────────┐
│  1. Lire le module  →  2. Faire le lab  →  3. Faire le quiz     │
│                                                                  │
│  Si un concept reste flou :                                      │
│    → consulter la visualisation associée                         │
│    → revenir au module après 2-3 autres                          │
│    → relire le glossaire                                         │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. La progression du cours

| Phase | Modules | Ce que tu apprends |
|-------|---------|-------------------|
| **Fondations** | 00-03 | Structures linéaires, complexité, `Map`/`Set`, stacks, queues |
| **Décomposition** | 04-05 | Récursion, binary search, tri, partitions, heaps |
| **Hiérarchie & relations** | 06-07 | Arbres, BST, graphes, BFS/DFS, topological sort |
| **Exploration & optimisation** | 08-10 | Backtracking, programmation dynamique, greedy, union-find |
| **Terrain** | 11-12 | Patterns fullstack, caching, pagination, projet final |

---

## 7. Vocabulaire de base

Avant de commencer, assure-toi de connaître ces termes (le glossaire complet est dans `glossaire.md`) :

| Terme | Signification rapide |
|-------|---------------------|
| **Algorithme** | Suite finie d'instructions pour résoudre un problème |
| **Structure de données** | Manière d'organiser les données pour un accès efficace |
| **Complexité** | Mesure du coût d'un algorithme en fonction de la taille des données |
| **Big-O** | Notation pour exprimer la borne supérieure de la complexité |
| **In-place** | Algorithme qui modifie les données sans allocation supplémentaire significative |
| **Immutable** | Donnée qu'on ne modifie pas — on en crée une nouvelle version |
| **Trade-off** | Compromis entre deux contraintes (temps vs mémoire, lisibilité vs perf) |

---

## 8. Configuration de l'environnement

### 8.1 Installation

```bash
# Depuis la racine du curriculum
cd 00-algorithms
npm install
```

### 8.2 Lancer le site de cours

```bash
npm run docs:dev
# → http://localhost:5173
```

### 8.3 Lancer un lab

```bash
# Exercice
npm run lab:01

# Solution (quand tu veux vérifier)
npm run solution:01
```

### 8.4 Vérifier ta version de Node

```bash
node --version
# Doit être >= 20.0.0
```

---

## Démonstrations

### Demo 1 — Le réflexe des trois questions en action

```typescript
// Problème : trouver si un tableau contient un doublon

// QUESTION 1 : entrées et contraintes ?
// → tableau de nombres, taille potentiellement grande (100k+), pas trié

// QUESTION 2 : quelle structure aide ?
// → un Set permet de détecter un doublon en O(1) par lookup

// QUESTION 3 : quel coût est acceptable ?
// → sur 100k éléments, O(n) est bien, O(n²) serait trop lent

// ❌ Approche naïve — O(n²) — double boucle
function hasDuplicateNaive(values: number[]): boolean {
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      if (values[i] === values[j]) return true;
    }
  }
  return false;
}

// ✅ Approche efficace — O(n) temps, O(n) espace — Set
function hasDuplicateFast(values: number[]): boolean {
  const seen = new Set<number>();
  for (const v of values) {
    if (seen.has(v)) return true;
    seen.add(v);
  }
  return false;
}

// Benchmark rapide sur 100 000 éléments :
const big = Array.from({ length: 100_000 }, (_, i) => i);
big.push(50_000); // on ajoute un doublon

console.time('naive');
hasDuplicateNaive(big);
console.timeEnd('naive');
// → ~5000ms

console.time('fast');
hasDuplicateFast(big);
console.timeEnd('fast');
// → ~5ms — facteur ×1000
```

### Demo 2 — Array.includes vs Set.has

```typescript
// Array.includes scanne séquentiellement : O(n)
// Set.has utilise une table de hachage : O(1) amorti

const arr = Array.from({ length: 1_000_000 }, (_, i) => i);
const set = new Set(arr);

const target = 999_999;

console.time('Array.includes');
arr.includes(target);
console.timeEnd('Array.includes');
// → ~1-3ms (scan linéaire)

console.time('Set.has');
set.has(target);
console.timeEnd('Set.has');
// → ~0.001ms (hash lookup)
```

### Demo 3 — L'importance de la lisibilité

```typescript
// Deux solutions au même problème : compter les occurrences de chaque mot.
// Les deux sont O(n). Laquelle est meilleure ?

const words = ['chat', 'chien', 'chat', 'oiseau', 'chien', 'chat'];

// Version 1 — fonctionnelle mais dense
const c1 = words.reduce(
  (m, w) => m.set(w, (m.get(w) ?? 0) + 1),
  new Map<string, number>(),
);

// Version 2 — impérative mais lisible
const c2 = new Map<string, number>();
for (const word of words) {
  c2.set(word, (c2.get(word) ?? 0) + 1);
}

// En ingénierie, la version 2 est souvent préférable :
// - plus facile à debugger (breakpoint dans la boucle)
// - plus facile à modifier (ajout de filtre, logging)
// - coût identique
console.log(c2); // Map { 'chat' => 3, 'chien' => 2, 'oiseau' => 1 }
```

### Demo 4 — Mesurer plutôt que deviner

```typescript
function measureTime<T>(label: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const elapsed = performance.now() - start;
  console.log(`${label}: ${elapsed.toFixed(3)}ms`);
  return result;
}

const data = Array.from({ length: 500_000 }, () => Math.random());

measureTime('sort', () => [...data].sort((a, b) => a - b));
measureTime('Set construction', () => new Set(data));

// Le sort coûte O(n log n), le Set coûte O(n)
// Mais la constante du Set peut être plus élevée à cause du hashing
// → toujours benchmarker au lieu de deviner
```

---

## Points clés

1. L'algorithmie utile, c'est choisir la bonne structure et le bon raisonnement pour un problème concret.
2. Trois questions avant de coder : entrées/contraintes, structure idéale, coût acceptable.
3. Ce cours va des fondations (tableaux, complexité) jusqu'aux patterns d'ingénierie (caching, pagination, graphes).
4. Chaque module est suivi d'un lab pratique et d'un quiz.
5. Une solution "qui marche" n'est qu'un début — la bonne solution est **correcte, lisible et proportionnée**.
6. En ingénierie, l'algorithme gagnant est souvent le plus simple qui respecte les contraintes.
7. Mesurer plutôt que deviner : `console.time` / `performance.now()` sont tes amis.
8. La lisibilité a une valeur — un code maintenable vaut souvent mieux qu'un code micro-optimisé.

---

## Pour aller plus loin

- [Big-O Cheat Sheet](https://www.bigocheatsheet.com/) — tableau récapitulatif des complexités
- [VisuAlgo](https://visualgo.net/) — visualisations animées d'algorithmes
- [MDN — Map](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Map) — documentation de référence
- [MDN — Set](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Set) — documentation de référence
- [JavaScript.info — Data types](https://javascript.info/data-types) — rappels sur les types en JS

---

## Si tu es perdu

Retiens juste ces 5 choses :

1. Un algorithme, c'est une suite d'étapes pour résoudre un problème.
2. La structure de données qu'on choisit change tout.
3. Plus les données sont grosses, plus le choix d'algo compte.
4. Avant de coder : **comprendre le problème**.
5. Ce cours te guide de A à Z — lis, code, quiz, recommence.

---

## Défi

Sans chercher sur Internet, essaie de répondre à cette question :

> Tu reçois un tableau de 1 million d'identifiants utilisateur (des strings) depuis une API. Tu dois vérifier lesquels sont aussi présents dans un second tableau de 500 000 identifiants. Quelle structure utilises-tu et pourquoi ?

<details>
<summary>Réponse</summary>

Tu places le plus petit tableau dans un `Set` (500 000 éléments → construction en O(n)), puis tu parcours le plus grand tableau en vérifiant `.has()` pour chaque élément (O(1) par vérification, O(m) total).

```typescript
function findCommon(bigList: string[], smallList: string[]): string[] {
  const lookup = new Set(smallList); // O(n)
  return bigList.filter(id => lookup.has(id)); // O(m)
}
// Coût total : O(n + m) au lieu de O(n × m) avec une double boucle
```

Pourquoi le `Set` ? Parce que `.has()` est O(1) amorti grâce au hachage interne, alors que `.includes()` sur un tableau serait O(n) par vérification, soit O(n × m) au total — beaucoup trop lent sur ces volumes.

</details>

---

::: tip Parcours recommandé
📖 Module terminé ? Passe au **quiz 00** pour valider → puis attaque le **module 01 — Complexité et raisonnement**.
:::
