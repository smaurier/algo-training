# Module 01 — Complexité et raisonnement

> **Objectif** : apprendre à comparer des solutions et à parler du coût temps / mémoire sans tomber dans la récitation mécanique.

> **Difficulté** : ⭐⭐

---

## 1. Pourquoi le Big-O compte

Sur 20 éléments, presque tout semble rapide. Sur 2 millions, les différences deviennent décisives. Le Big-O n'est pas une vérité absolue sur le temps d'exécution réel, mais un **modèle utile** pour anticiper l'effet d'un changement d'échelle.

## 2. Les ordres de grandeur à reconnaître

| Complexité | Intuition | Exemples |
|-----------|-----------|----------|
| $O(1)$ | coût constant | accès à une clé de `Map` |
| $O(\log n)$ | on élimine vite | binary search |
| $O(n)$ | un passage | scan, comptage |
| $O(n \log n)$ | bon tri généraliste | merge sort, heap sort |
| $O(n^2)$ | double boucle | comparaison de toutes les paires |

## 3. Complexité spatiale

Une solution plus rapide peut consommer plus de mémoire. Exemple classique : utiliser une `Map` pour compter des fréquences au lieu de rescanner le tableau plusieurs fois.

## 4. Questions d'ingénieur

- Les données sont-elles triées ?
- Peut-on pré-calculer ?
- Le coût de mise à jour compte-t-il autant que le coût de lecture ?
- Faut-il optimiser pour le pire cas ou pour le cas moyen ?

## 5. Pièges fréquents

- optimiser trop tôt sur de petites données ;
- ignorer le coût mémoire ;
- oublier que la lisibilité a une valeur ;
- confondre coût asymptotique et benchmark réel.

## 6. Cas terrain JS fullstack

Quand tu filtres une grande collection côté serveur, quand tu merges des résultats de requêtes, quand tu parcours un arbre de routes ou un menu récursif, tu fais déjà de l'algorithmie.
