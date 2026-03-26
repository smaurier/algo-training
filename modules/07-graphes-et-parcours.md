# Module 07 — Graphes et parcours

> **Objectif** : voir les données relationnelles comme un graphe pour résoudre dépendances, chemins, composantes et propagation.

> **Difficulté** : ⭐⭐⭐⭐

---

## 1. Quand un problème est un graphe

Dès qu'il y a des nœuds et des liens : réseau social, graphe de dépendances, workflow, recommandations, permissions, services, routes.

## 2. Représentations

- liste d'adjacence : pratique et compacte ;
- matrice : rarement utile en JS sauf graphes très denses.

## 3. BFS vs DFS

- **BFS** pour distance minimale en nombre d'arêtes ;
- **DFS** pour explorer, détecter cycles, faire du backtracking.

## 4. Notions clés

- composantes connexes ;
- cycle ;
- ordre topologique ;
- plus court chemin non pondéré.

## 5. Cas terrain

- calcul d'ordre de build ;
- propagation de droits ;
- impact d'une dépendance cassée ;
- navigation entre écrans / étapes.
