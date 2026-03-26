# Module 05 — Tris, partition, heaps

> **Objectif** : comprendre quand trier, quand partitionner, et quand un heap est meilleur qu'un tri complet.

> **Difficulté** : ⭐⭐⭐

---

## 1. Pourquoi trier

Trier coûte souvent $O(n \log n)$, mais le gain peut être énorme ensuite : recherche plus simple, fusion plus propre, détection d'intervalles, voisinage immédiat.

## 2. Partition

La partition est au cœur de quicksort mais sert aussi à séparer “petit / grand”, “urgent / non urgent”, “gauche / droite d'un pivot”.

## 3. Heap

Un heap est idéal quand tu veux conserver rapidement le min ou le max courant sans trier toute la collection.

Exemples :

- top K ;
- k plus proches ;
- file de priorité ;
- scheduler.

## 4. Réflexe d'ingénieur

Si tu ne veux que les 10 meilleurs éléments sur 1 million, un heap de taille 10 est souvent plus pertinent qu'un tri complet.
