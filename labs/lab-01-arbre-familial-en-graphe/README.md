# Lab 01 — De zéro : l'arbre familial TribuZen en graphe (BFS + debounce)

> **Outcome :** à la fin, tu as une fonctionnalité PRODUIT complète — une recherche de
> membres à inviter, débouncée, dont les résultats sont triés par proximité familiale
> (BFS) — pas deux exercices isolés « fais un BFS » et « fais un debounce ».
> **Vrai geste :** liste d'adjacence, BFS avec `visited` marqué à l'enfilement,
> reconstruction de chemin par `parent`, debounce avec `.cancel()`, et l'intégration des
> deux dans une seule fonction de recherche.
> **Feedback :** `npm run lab:01` — RED tant que `src/familyGraph.ts` ne satisfait pas
> l'oracle (18 tests). `npm run solution:01` prouve l'oracle.

## Prérequis technique

```bash
cd 05-algorithms/labs
npm install
```

## Lire avant (une lecture bornée)

- Module [`07-graphes-et-parcours.md`](../../modules/07-graphes-et-parcours.md), §2.2 à
  2.4 — liste d'adjacence, BFS avec `visited`, BFS = plus court chemin en nombre d'arêtes.
  Le piège #2 (marquer `visited` à l'enfilement, pas au défilement) est directement testé.
- Module [`11-patterns-js-fullstack.md`](../../modules/11-patterns-js-fullstack.md), §2.2 —
  debounce : « n'exécute qu'après un délai d'inactivité, chaque appel réarme le timer ».

## Énoncé

TribuZen doit suggérer à qui envoyer une invitation pendant que l'utilisateur tape un nom.
Deux besoins, un seul geste :

1. **Ne pas relancer une recherche à chaque frappe** — `debounce`.
2. **Prioriser les résultats par proximité familiale** — un utilisateur cherche d'abord
   dans son entourage proche, pas dans une liste alphabétique brute. Le graphe de relations
   (parents, conjoints — non orienté) donne cette proximité via BFS.

Lis les commentaires en tête de `src/familyGraph.ts`. Implémente les quatre fonctions dans
l'ordre : `buildFamilyGraph`, `shortestPath`, `debounce`, puis `createFamilySearch` qui les
assemble.

**Le piège à éviter.** Une fois que `shortestPath` marche, la tentation est de l'appeler
une fois PAR candidat trouvé pour le trier — un BFS complet par résultat. Un seul BFS
depuis `meId` donne les distances vers TOUS les membres en une passe (`O(V+E)`) ; c'est ce
calcul, fait une seule fois par recherche, qui sert ensuite à trier.

## Étapes (en friction)

1. `npm run lab:01` : RED (`buildFamilyGraph` lève dès le premier `describe`).
2. `buildFamilyGraph` : liste d'adjacence (`Map<id, voisins[]>`), chaque relation ajoutée
   dans les deux sens, erreur si un id référencé n'existe pas.
3. `shortestPath` : BFS, `visited` marqué à l'enfilement, reconstruction du chemin via une
   `Map<enfant, parent>`.
4. `debounce` : timer réarmé à chaque appel, `.cancel()` annule un appel en attente.
5. `createFamilySearch` : un seul BFS depuis `meId`, tri par distance croissante puis
   alphabétique, `meId` exclu, requête vide → résultats vides.

## Vérifier

```bash
cd 05-algorithms/labs
npm run lab:01
npm run solution:01
```

**Ce que l'oracle vérifie (18 tests)**

`buildFamilyGraph` : arêtes bidirectionnelles, membre isolé présent avec une liste vide,
erreur sur relation invalide. `shortestPath` : chemin direct, chemin à travers un
intermédiaire, robustesse à un cycle dans le graphe (pas de boucle infinie, chemin toujours
minimal), cas trivial (même sommet), composantes déconnectées → `null`, id inconnu →
`null`. `debounce` : un seul appel après plusieurs appels rapprochés, `.cancel()`, un
nouveau cycle après déclenchement. `createFamilySearch` : ne cherche qu'au silence,
`meId` toujours exclu, tri par distance puis alphabétique, membre non connecté trouvable
mais en dernier, requête vide → liste vide.

## Variante J+30 (fading)

Ajoute une troisième relation qui rend le graphe **plus profond** (5 générations) et vérifie
que `shortestPath` trouve toujours le chemin minimal — pas un chemin quelconque — quand
plusieurs chemins existent de longueurs différentes.

## Application TribuZen

Même geste sur le vrai graphe de relations `tribuzen-api`, consommé par l'écran
d'invitation : `MemberSearch` (module 11, exemple 1) rebranché sur ce module au lieu d'un
simple filtre alphabétique. Commit :
`feat(algo): suggestions d'invitation triées par proximité familiale (BFS + debounce)`.
