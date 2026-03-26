# Module 03 — Stacks, queues, listes

> **Objectif** : reconnaître les problèmes où l'ordre d'arrivée, de sortie ou de retour importe plus que la simple recherche.

> **Difficulté** : ⭐⭐

---

## 1. Stack

Une stack est adaptée aux mécanismes LIFO : undo/redo, navigation de chemins, parsing d'expressions, validation de parenthèses.

## 2. Queue

Une queue modélise les files de traitement : tâches asynchrones, BFS, ordonnancement FIFO, traitement d'événements.

## 3. Linked list : culture utile

En JavaScript, on implémente rarement de vraies listes chaînées en production. En revanche, les comprendre aide à raisonner sur les pointeurs, les suppressions locales, et certaines structures comme LRU cache.

## 4. Cas terrain

- file de jobs ;
- buffer de notifications ;
- parcours en largeur d'un arbre ou d'un graphe ;
- historique d'actions utilisateur.
