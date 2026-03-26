# Module 02 — Tableaux, chaînes, hash maps

> **Objectif** : maîtriser les structures de base et reconnaître quand un simple tableau ne suffit plus.

> **Difficulté** : ⭐⭐

---

## 1. Les tableaux : structure par défaut

Les tableaux sont parfaits pour les parcours séquentiels, la transformation et le filtrage. Ils deviennent coûteux quand il faut faire des recherches répétées ou des suppressions au milieu.

## 2. Les chaînes : tableaux spécialisés

Beaucoup de problèmes de chaînes sont des problèmes de tableaux avec des contraintes en plus : ordre, fréquence, fenêtre glissante, préfixes.

## 3. `Map` et `Set`

- `Set` : présence / absence, déduplication, membership rapide.
- `Map` : comptage, indexation, regroupement, jointure locale.

## 4. Patterns classiques

- fréquence de caractères ou d'IDs ;
- regroupement par clé ;
- détection de doublons ;
- résolution du type “two-sum” via table de hachage.

## 5. Cas terrain

- dédupliquer des IDs issus de plusieurs endpoints ;
- fusionner des produits avec des prix et des stocks ;
- construire un index mémoire pour éviter des scans répétés.
