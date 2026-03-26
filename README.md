# Algorithms — De débutant autonome à ingénieur pragmatique

Formation progressive d'algorithmie pensée pour un développeur JavaScript fullstack.

**Ce cours n'est PAS un cours de compétition.** L'objectif est d'apprendre les structures, raisonnements et patterns qu'un ingénieur JS recroise dans sa carrière : recherche efficace, parcours d'arbres et de graphes, caching, planification, quotas, déduplication, ranking, feeds, indexation, pagination, programmation dynamique légère, choix de structure de données.

## Prérequis

- JavaScript courant
- Bases TypeScript utiles mais non obligatoires
- Node.js 20+
- Envie de pratiquer sur des problèmes concrets

## Structure

```
modules/          → 13 modules théoriques (Markdown, 300-600+ lignes chacun)
labs/             → 12 labs pratiques exécutables (TypeScript : exercise.ts + solution.ts)
quizzes/          → 13 quizzes HTML interactifs (5 questions chacun)
visualizations/   → 5 visualisations HTML interactives (Canvas)
glossaire.md      → glossaire complet des termes algorithmiques
```

## Lancer un lab

```bash
npm run lab:01          # lance l'exercice du lab 01
npm run solution:01     # lance la solution du lab 01
```

## Programme

| # | Module | Lab | Thème |
|---|--------|-----|-------|
| 00 | Prérequis & introduction | — | Positionnement |
| 01 | Complexité & raisonnement | Analyse de complexité | Big-O pragmatique |
| 02 | Tableaux, chaînes, hash maps | Arrays & hash maps | Structures de base |
| 03 | Stacks, queues, listes | Stacks & queues | Flux et buffers |
| 04 | Récursion, divide & conquer, binary search | Récursion & binary search | Décomposition |
| 05 | Tri, partition, heaps | Sorting & heaps | Classement |
| 06 | Arbres & BST | Navigation d'arbres | Hiérarchie |
| 07 | Graphes & parcours | Graphes & dépendances | Relations |
| 08 | Backtracking | Backtracking solver | Exploration |
| 09 | Programmation dynamique | Dynamic programming | Optimisation |
| 10 | Greedy, union-find, trie | Union-Find & Trie | Décisions locales |
| 11 | Patterns JS fullstack | Patterns fullstack | Cas terrain |
| 12 | Projet final | Moteur de recommandation | Synthèse |

## Visualisations interactives

| Visualisation | Contenu |
|---------------|---------|
| Courbes de complexité | O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ) avec slider |
| Recherche binaire | Animation pas-à-pas avec pointeurs lo/mid/hi |
| Algorithmes de tri | Bubble, Merge, Quick Sort côte à côte |
| BFS vs DFS | Parcours animé d'un graphe avec file/pile |
| Table DP | Remplissage animé de la table Coin Change |

## Objectifs de sortie

À la fin du cours, tu sais :

- choisir la bonne structure de données pour un problème métier courant ;
- raisonner sur la complexité temps / mémoire sans réciter du Big-O à vide ;
- reconnaître rapidement un pattern (`counting`, `two pointers`, `BFS`, `memoization`, `heap`) ;
- implémenter des solutions robustes en TypeScript ;
- expliquer un choix algorithmique en revue de code ou en entretien ;
- faire le lien entre algo “académique” et besoins de produit fullstack.

## Niveau

**Débutant → intermédiaire fort / ingénieur.** Les premiers modules partent des bases, les derniers transforment l'algorithmie en réflexes d'ingénierie.
