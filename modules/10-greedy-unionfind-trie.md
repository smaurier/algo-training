---
titre: Greedy, Union-Find et Trie
cours: 05-algorithms
notions: [algorithme glouton, propriété de choix glouton, preuve d'échange, interval scheduling, sac à dos fractionnaire, monnaie canonique, greedy vs DP, union-find/DSU, union par rang, compression de chemin, composantes connexes, détection de cycle, Kruskal, trie/arbre préfixe, autocomplétion]
outcomes: [reconnaître quand un glouton donne l'optimum et quand il échoue, implémenter un union-find avec union par rang et compression de chemin, implémenter un trie pour l'autocomplétion, choisir entre greedy et DP]
prerequis: [09-programmation-dynamique]
next: 11-patterns-js-fullstack
libs: []
tribuzen: union-find pour regrouper les membres en communautés, trie pour l'autocomplétion de recherche, greedy pour planifier des créneaux sans chevauchement
last-reviewed: 2026-07
---

# Greedy, Union-Find et Trie

> **Outcomes — tu sauras FAIRE :** reconnaître quand un glouton donne l'optimum et quand il échoue, implémenter un union-find (union par rang + compression de chemin), implémenter un trie pour l'autocomplétion, et trancher entre greedy et DP.
> **Difficulté :** :star::star::star::star:

## 1. Cas concret d'abord

L'admin TribuZen a trois demandes le même jour, et chacune cache un algorithme de ce module.

**Demande A — planning d'activités.** Une famille propose 6 créneaux d'ateliers pour la même salle. Ils se chevauchent partiellement. On veut caser le **maximum** d'ateliers sans conflit de salle.

```ts
// Créneaux proposés (début, fin en heures)
const creneaux = [
  { titre: 'Yoga',      debut: 9,  fin: 10 },
  { titre: 'Peinture',  debut: 9,  fin: 12 },
  { titre: 'Cuisine',   debut: 10, fin: 11 },
  { titre: 'Musique',   debut: 11, fin: 13 },
  { titre: 'Lecture',   debut: 12, fin: 14 },
  { titre: 'Danse',     debut: 13, fin: 15 },
];
// Combien d'ateliers max sans chevauchement ? Lesquels ?
```

**Demande B — communautés.** On a une liste de « liens d'amitié » entre membres. Question du produit : *combien de communautés déconnectées existe-t-il, et est-ce que Alice et Bob sont dans la même ?* Refaire un parcours de graphe à chaque question serait coûteux.

**Demande C — recherche.** La barre de recherche doit proposer des familles/membres **au fur et à mesure de la frappe** : je tape `mar`, elle suggère `Martin`, `Marchand`, `Marie`. Filtrer tout le tableau à chaque touche ne passe pas à l'échelle.

Trois problèmes, trois outils : un **glouton** (A), un **union-find** (B), un **trie** (C). Ce module te donne les trois — et surtout le critère pour savoir quand le glouton est légitime.

---

## 2. Théorie complète, concise

### 2.1 Le principe glouton

Un algorithme **glouton** (greedy) construit la solution étape par étape en prenant à chaque fois le **choix localement optimal**, sans jamais revenir en arrière.

```ts
// Squelette universel d'un glouton
function greedy(items) {
  const choix = trierParCritère(items); // le critère EST l'algorithme
  const solution = [];
  for (const item of choix) {
    if (compatible(item, solution)) {
      solution.push(item); // décision définitive, jamais annulée
    }
  }
  return solution;
}
```

Toute la difficulté tient dans **deux mots** : *localement optimal*. Rien ne garantit que cumuler des optima locaux donne l'optimum global. Le glouton est donc un **pari**, et ce pari n'est valide que sous conditions.

### 2.2 Quand un glouton donne l'optimum

Un glouton est prouvablement correct quand le problème a **deux propriétés** :

1. **Propriété de choix glouton** — il existe une solution optimale qui contient le premier choix glouton. Autrement dit : prendre le meilleur choix local ne ferme jamais la porte à l'optimum.
2. **Sous-structure optimale** — après avoir fixé ce choix, le problème restant est un plus petit problème de même nature, et sa solution optimale complète l'optimum global.

Ces deux propriétés se démontrent classiquement par un **argument d'échange** (*exchange argument*), l'intuition à retenir :

> Prends n'importe quelle solution optimale `O`. Si son premier choix diffère de celui du glouton `g`, montre que remplacer ce choix par `g` dans `O` donne une solution **au moins aussi bonne**. Donc il existe un optimum qui commence par `g`. On répète : le glouton est optimal.

C'est exactement ce qui marche pour l'interval scheduling (2.3) : trier par fin la plus tôt libère le maximum de temps pour la suite — n'importe quel optimum peut être « réécrit » pour commencer par l'intervalle qui finit le plus tôt.

### 2.3 Interval scheduling (sélection d'activités)

Problème du cas concret A : maximiser le nombre d'intervalles deux à deux non chevauchants.

```ts
interface Creneau { titre: string; debut: number; fin: number }

function selectionMax(creneaux: Creneau[]): Creneau[] {
  // CLÉ : trier par heure de FIN croissante (pas par début, pas par durée)
  const tries = [...creneaux].sort((a, b) => a.fin - b.fin);
  const retenus: Creneau[] = [];
  let finPrecedente = -Infinity;

  for (const c of tries) {
    if (c.debut >= finPrecedente) { // ne chevauche pas le dernier retenu
      retenus.push(c);
      finPrecedente = c.fin;
    }
  }
  return retenus;
}
```

Le critère « fin la plus tôt » est celui qui laisse le maximum de place au reste. Trier par début, ou par durée, casse l'optimalité (voir Pièges #1). Complexité : `O(n log n)` dominée par le tri.

### 2.4 Sac à dos fractionnaire

Le sac à dos **0/1** (module 09) est un problème de DP : on prend un objet en entier ou pas du tout. Le sac à dos **fractionnaire** autorise de prendre des fractions — et là, le glouton redevient optimal.

```ts
interface Objet { nom: string; poids: number; valeur: number }

function sacFractionnaire(objets: Objet[], capacite: number): number {
  // Trier par densité de valeur décroissante (valeur par kg)
  const tries = [...objets].sort(
    (a, b) => b.valeur / b.poids - a.valeur / a.poids,
  );
  let total = 0;
  let reste = capacite;

  for (const o of tries) {
    if (reste <= 0) break;
    const pris = Math.min(o.poids, reste); // fraction autorisée
    total += pris * (o.valeur / o.poids);
    reste -= pris;
  }
  return total;
}
```

Pourquoi le glouton marche ici mais pas en 0/1 ? Parce que la **divisibilité** permet de toujours remplir exactement la capacité avec la meilleure densité disponible. En 0/1, refuser un objet peut être forcé, et un choix local trop gourmand peut bloquer un meilleur assemblage — d'où le recours au DP.

### 2.5 Rendu de monnaie : canonique vs pas

Rendre une somme avec le **minimum** de pièces, en prenant toujours la plus grosse pièce ≤ reste :

```ts
function renduGlouton(montant: number, pieces: number[]): number[] {
  const tries = [...pieces].sort((a, b) => b - a);
  const rendu: number[] = [];
  let reste = montant;
  for (const p of tries) {
    while (reste >= p) { rendu.push(p); reste -= p; }
  }
  return rendu; // ⚠️ optimal SEULEMENT si le système est canonique
}
```

- Système **canonique** (euros : 1, 2, 5, 10, 20, 50…) → le glouton donne toujours le minimum.
- Système **non canonique** (ex. `[1, 3, 4]` pour rendre 6) → le glouton donne `4 + 1 + 1 = 3 pièces`, alors que `3 + 3 = 2 pièces` est mieux. Ici il faut du **DP** (module 09).

La leçon : le glouton n'est correct que si on peut le **prouver** pour le système donné, pas « parce que ça a l'air de marcher sur des exemples ».

### 2.6 Greedy vs DP — le tableau de décision

| | Greedy | DP |
|---|---|---|
| Décision | Un seul choix local, définitif | Explore/combine tous les sous-problèmes |
| Retour arrière | Jamais | Implicite via mémoïsation/tabulation |
| Coût typique | `O(n log n)` (souvent un tri) | `O(n·W)`, `O(n²)`… |
| Optimalité | **Seulement si prouvée** | Garantie (couvre tout l'espace) |
| Écriture | Courte | Plus lourde (états + transitions) |
| Exemples | interval scheduling, sac fractionnaire, Kruskal, Huffman | sac 0/1, monnaie non canonique, LCS, edit distance |

**Règle pratique :** tente d'abord un glouton et cherche la preuve/contre-exemple. Si tu trouves un contre-exemple où le choix local sabote le global → passe au DP. Le DP est le filet de sécurité quand le glouton n'a pas de propriété de choix glouton.

### 2.7 Union-Find (Disjoint Set Union / DSU)

Structure qui gère des **ensembles disjoints** d'éléments avec deux opérations :

- `find(x)` : renvoie le **représentant** (la racine) de l'ensemble de `x`.
- `union(x, y)` : fusionne les ensembles de `x` et `y`.

Deux éléments sont dans le même ensemble ssi ils ont le même représentant. Idéal pour : composantes connexes dynamiques, détection de cycle dans un graphe non orienté, algorithme de Kruskal, clustering.

Deux optimisations rendent les opérations **quasi constantes** :

- **Union par rang** : on accroche le petit arbre sous le grand (rang ≈ hauteur) → arbres plats.
- **Compression de chemin** : pendant `find`, on rebranche chaque nœud visité directement sur la racine.

Combinées, elles donnent une complexité amortie de `O(α(n))`, où `α` est l'inverse d'Ackermann — ≤ 4 pour toute taille physiquement concevable, donc `≈ O(1)`.

```ts
class UnionFind {
  private parent: number[];
  private rang: number[];
  private nbEnsembles: number;

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i); // chacun sa racine
    this.rang = new Array(n).fill(0);
    this.nbEnsembles = n;
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // compression de chemin
    }
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const rx = this.find(x);
    const ry = this.find(y);
    if (rx === ry) return false; // déjà ensemble → aucune fusion

    // union par rang : le plus petit passe sous le plus grand
    if (this.rang[rx] < this.rang[ry]) {
      this.parent[rx] = ry;
    } else if (this.rang[rx] > this.rang[ry]) {
      this.parent[ry] = rx;
    } else {
      this.parent[ry] = rx;
      this.rang[rx]++; // égalité → la racine gagnante monte d'un rang
    }
    this.nbEnsembles--;
    return true;
  }

  connectes(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  get count(): number {
    return this.nbEnsembles;
  }
}
```

### 2.8 Union-Find : détection de cycle et Kruskal

`union` renvoie `false` quand les deux extrémités sont déjà connectées — donc ajouter cette arête **fermerait un cycle** :

```ts
function contientCycle(n: number, aretes: [number, number][]): boolean {
  const uf = new UnionFind(n);
  for (const [a, b] of aretes) {
    if (!uf.union(a, b)) return true; // déjà connectés → cycle
  }
  return false;
}
```

**Kruskal** (arbre couvrant minimal) est un glouton *appuyé sur* union-find : on trie les arêtes par poids croissant, et on ajoute chaque arête sauf si elle crée un cycle.

```ts
interface Arete { a: number; b: number; poids: number }

function kruskal(n: number, aretes: Arete[]): { total: number; mst: Arete[] } {
  const tries = [...aretes].sort((x, y) => x.poids - y.poids); // glouton
  const uf = new UnionFind(n);
  const mst: Arete[] = [];
  let total = 0;

  for (const e of tries) {
    if (uf.union(e.a, e.b)) {  // union réussie = pas de cycle
      mst.push(e);
      total += e.poids;
      if (mst.length === n - 1) break; // un MST a n-1 arêtes
    }
  }
  return { total, mst };
}
```

### 2.9 Trie (arbre préfixe)

Un **trie** stocke des chaînes caractère par caractère. Chaque nœud a des enfants indexés par lettre ; un drapeau `estFin` marque la fin d'un mot. Le chemin racine→nœud *est* le préfixe.

- `insert(mot)` : `O(m)`, `m` = longueur du mot.
- `search(mot)` : `O(m)`, vrai seulement si on atteint un nœud `estFin`.
- `startsWith(prefixe)` : `O(m)`, vrai si le chemin existe.
- `autocomplete(prefixe)` : `O(m + k)`, où `m` = longueur du préfixe et `k` = nombre de **nœuds visités** dans le sous-arbre sous le préfixe (soit `O(m + Σ|résultats|)`, la somme des longueurs des mots collectés) — pas seulement le nombre de résultats.

L'intérêt clé : le coût d'une recherche par préfixe **ne dépend pas** du nombre total de mots stockés, seulement de la longueur du préfixe — d'où son usage en autocomplétion.

```ts
class NoeudTrie {
  enfants = new Map<string, NoeudTrie>();
  estFin = false;
}

class Trie {
  private racine = new NoeudTrie();

  insert(mot: string): void {
    let noeud = this.racine;
    for (const lettre of mot) {
      if (!noeud.enfants.has(lettre)) {
        noeud.enfants.set(lettre, new NoeudTrie());
      }
      noeud = noeud.enfants.get(lettre)!;
    }
    noeud.estFin = true;
  }

  private descendre(chaine: string): NoeudTrie | null {
    let noeud = this.racine;
    for (const lettre of chaine) {
      const suivant = noeud.enfants.get(lettre);
      if (!suivant) return null;
      noeud = suivant;
    }
    return noeud;
  }

  search(mot: string): boolean {
    const n = this.descendre(mot);
    return n !== null && n.estFin;
  }

  startsWith(prefixe: string): boolean {
    return this.descendre(prefixe) !== null;
  }

  autocomplete(prefixe: string, limite = 10): string[] {
    const depart = this.descendre(prefixe);
    if (!depart) return [];
    const resultats: string[] = [];
    const collecter = (noeud: NoeudTrie, acc: string) => {
      if (resultats.length >= limite) return;
      if (noeud.estFin) resultats.push(acc);
      for (const [lettre, enfant] of noeud.enfants) {
        collecter(enfant, acc + lettre);
      }
    };
    collecter(depart, prefixe);
    return resultats;
  }
}
```

---

## 3. Worked examples

### Exemple 1 — Le planning d'ateliers (glouton, cas concret A)

On déroule `selectionMax` sur les 6 créneaux.

```ts
// 1. Tri par FIN croissante :
// Yoga(9-10), Cuisine(10-11), Peinture(9-12), Musique(11-13),
// Lecture(12-14), Danse(13-15)

// 2. Balayage, finPrecedente = -Infini
// Yoga:     debut 9  >= -Inf  → RETENU, finPrecedente = 10
// Cuisine:  debut 10 >= 10    → RETENU, finPrecedente = 11
// Peinture: debut 9  >= 11 ? non → rejeté (chevauche)
// Musique:  debut 11 >= 11    → RETENU, finPrecedente = 13
// Lecture:  debut 12 >= 13 ? non → rejeté
// Danse:    debut 13 >= 13    → RETENU, finPrecedente = 15

// Résultat : [Yoga, Cuisine, Musique, Danse] → 4 ateliers
console.log(selectionMax(creneaux).map(c => c.titre));
// ['Yoga', 'Cuisine', 'Musique', 'Danse']
```

Note l'usage du `>=` : un atelier qui commence pile à l'heure où le précédent finit **ne chevauche pas** (la salle se libère). Trier par début aurait retenu Peinture (9-12) en premier et bloqué la matinée → seulement 2-3 ateliers. Le critère « fin la plus tôt » est ce qui rend le glouton optimal.

### Exemple 2 — Communautés de membres (union-find, cas concret B)

5 membres indexés 0..4. Liens d'amitié fournis. On répond aux questions du produit.

```ts
const uf = new UnionFind(5); // 5 membres isolés → 5 communautés
console.log(uf.count);              // 5

uf.union(0, 1); // Alice(0) — Bob(1)
uf.union(2, 3); // Chloé(2) — David(3)
console.log(uf.count);              // 3  (=> {0,1} {2,3} {4})
console.log(uf.connectes(0, 1));    // true
console.log(uf.connectes(0, 2));    // false

uf.union(1, 3); // relie les deux groupes via Bob—David
console.log(uf.count);              // 2  (=> {0,1,2,3} {4})
console.log(uf.connectes(0, 2));    // true  (0-1-3-2, chemin transitif)
```

Chaque `connectes(a, b)` est en `O(α(n)) ≈ O(1)` amorti — pas de re-parcours du graphe. C'est précisément ce qui rend l'union-find supérieur à un BFS/DFS quand les questions arrivent **au fil de l'eau** et que le graphe grossit.

---

## 4. Pièges & misconceptions

### PIÈGE #1 — Trier par le mauvais critère en interval scheduling

```ts
// ❌ Trier par DÉBUT : un long intervalle qui commence tôt bloque tout
[...creneaux].sort((a, b) => a.debut - b.debut);
// Peinture(9-12) passe en premier et écrase Yoga+Cuisine+…

// ❌ Trier par DURÉE : ne garantit rien non plus (contre-exemples faciles)

// ✅ Trier par FIN croissante — le seul critère prouvé optimal
[...creneaux].sort((a, b) => a.fin - b.fin);
```

**Pourquoi :** finir tôt maximise le temps résiduel pour les intervalles suivants. C'est l'argument d'échange de la section 2.2.

### PIÈGE #2 — Croire qu'un glouton est toujours optimal

```ts
// ❌ Rendu de monnaie glouton sur un système NON canonique
renduGlouton(6, [1, 3, 4]); // → [4, 1, 1] = 3 pièces
// L'optimum est [3, 3] = 2 pièces. Le glouton échoue.
```

Un glouton n'est correct **que** si la propriété de choix glouton est prouvée pour ce problème précis. Sur un système de pièces arbitraire (ou le sac 0/1), il faut du DP. Ne jamais généraliser depuis « ça marche sur mes tests ».

### PIÈGE #3 — Union-Find sans compression ni union par rang

```ts
// ❌ union naïve : on rattache toujours x sous y, sans rang
union(x, y) { this.parent[this.find(x)] = this.find(y); }
// Risque : arbres dégénérés en liste chaînée → find en O(n)

// ✅ union par rang + compression → O(α(n)) ≈ O(1) amorti
```

Sans les deux optimisations, un enchaînement d'unions défavorable crée un arbre linéaire et `find` redevient `O(n)`. Les deux optimisations sont ce qui fait *tout* l'intérêt de la structure.

### PIÈGE #4 — Confondre `search` et `startsWith` dans un trie

```ts
trie.insert('martin');
trie.search('mar');      // false → 'mar' n'est pas un mot complet (pas de estFin)
trie.startsWith('mar');  // true  → 'mar' est un préfixe existant
```

`search` exige d'atteindre un nœud `estFin`. `startsWith` (et donc l'autocomplétion) exige seulement que le chemin existe. Oublier le drapeau `estFin` fait retourner `true` à `search` pour n'importe quel préfixe — bug classique.

### PIÈGE #5 — Réimplémenter un union-find quand un simple parcours suffit

Union-Find brille pour des **fusions dynamiques** avec questions de connexité entrelacées. Si tu construis le graphe une fois puis comptes les composantes une seule fois, un simple DFS/BFS (module 07) est plus lisible. Choisis l'union-find quand les `union` et les `connectes` **s'alternent** dans le temps.

---

## 5. Ancrage TribuZen

Les trois structures de ce module correspondent à trois fonctionnalités réelles du produit.

**Union-Find → communautés de membres.** TribuZen relie des membres par des interactions (amitiés, co-participation à des événements). `src/services/communities.ts` maintient un `UnionFind` : chaque nouvelle relation appelle `union(idA, idB)`, et l'admin peut demander à tout moment `connectes(a, b)` ou `count` (nombre de communautés déconnectées) sans re-parcourir le graphe social. C'est le cas concret B.

**Trie → autocomplétion de recherche.** La barre de recherche de familles/membres (`src/features/search/SearchIndex.ts`) charge un `Trie` avec les noms normalisés en minuscules. Chaque frappe appelle `autocomplete(query, 5)` — coût proportionnel à la longueur du préfixe, pas au nombre de familles. C'est le cas concret C.

**Greedy → planification de créneaux.** Le planificateur d'activités (`src/features/planning/schedule.ts`) applique `selectionMax` pour caser le maximum d'ateliers dans une salle sans chevauchement, et un rendu de ressources glouton pour répartir des quotas canoniques. C'est le cas concret A.

```
tribuzen/src/
  services/
    communities.ts        // UnionFind : regroupement en communautés
  features/
    search/
      SearchIndex.ts       // Trie : autocomplétion familles/membres
    planning/
      schedule.ts          // greedy : créneaux sans chevauchement
```

---

## 6. Points clés

1. Un glouton prend le meilleur choix **local** et ne revient jamais en arrière ; c'est un pari, valide seulement si prouvé.
2. Deux propriétés justifient un glouton : **choix glouton** (un optimum contient le premier choix local) et **sous-structure optimale** ; on les prouve par argument d'échange.
3. Interval scheduling : **trier par fin croissante**, pas par début ni par durée.
4. Sac fractionnaire = glouton (densité valeur/poids) ; sac 0/1 et monnaie non canonique = DP.
5. Greedy vs DP : essaie le glouton et cherche un contre-exemple ; s'il en existe un, bascule sur le DP (garanti optimal).
6. Union-Find gère des ensembles disjoints via `find` + `union`, en `O(α(n)) ≈ O(1)` grâce à **union par rang + compression de chemin**.
7. `union` qui renvoie `false` = extrémités déjà connectées = cycle ; base de Kruskal (MST glouton).
8. Trie = arbre préfixe : `insert`/`search`/`startsWith` en `O(m)`, autocomplétion en `O(m + k)`, indépendant du nombre de mots.
9. Dans un trie, `search` exige `estFin` ; `startsWith` exige seulement que le chemin existe.

---

## 7. Seeds Anki

```
Quelles deux propriétés rendent un algorithme glouton optimal ?|La propriété de choix glouton (il existe un optimum contenant le premier choix local) et la sous-structure optimale (le sous-problème restant se résout de même nature). On les prouve par argument d'échange.
Par quel critère trie-t-on en interval scheduling, et pourquoi ?|Par heure de FIN croissante. Finir au plus tôt maximise le temps résiduel pour les intervalles suivants — c'est le seul critère prouvé optimal (trier par début ou durée casse l'optimalité).
Pourquoi le sac à dos fractionnaire est-il glouton alors que le 0/1 est du DP ?|La divisibilité permet de toujours remplir exactement la capacité avec la meilleure densité valeur/poids. En 0/1 on prend l'objet entier ou rien : un choix local trop gourmand peut bloquer un meilleur assemblage, d'où le DP.
Quand le rendu de monnaie glouton échoue-t-il ? Donne un exemple.|Sur un système non canonique. Pour rendre 6 avec [1,3,4], le glouton donne 4+1+1 = 3 pièces alors que 3+3 = 2 pièces est optimal. Il faut du DP.
Quelles deux optimisations donnent à l'union-find sa complexité O(alpha(n)) ?|Union par rang (accrocher le petit arbre sous le grand) et compression de chemin (rebrancher les nœuds visités directement sur la racine pendant find). Sans elles, find peut dégénérer en O(n).
Comment détecte-t-on un cycle avec un union-find ?|En parcourant les arêtes : si union(a,b) renvoie false, c'est que a et b sont déjà connectés, donc ajouter l'arête fermerait un cycle. C'est la base du filtre de Kruskal.
Quelle est la différence entre search et startsWith dans un trie ?|search renvoie vrai seulement si on atteint un nœud marqué estFin (mot complet). startsWith renvoie vrai dès que le chemin du préfixe existe, indépendamment de estFin. L'autocomplétion s'appuie sur startsWith.
Quelle est la complexité des opérations d'un trie, et de quoi dépend-elle ?|insert/search/startsWith en O(m) où m = longueur du mot ; autocomplete en O(m + k) où k = nombre de résultats. Le coût ne dépend PAS du nombre total de mots stockés.
Comment choisir entre greedy et DP ?|Tenter d'abord le glouton et chercher un contre-exemple où le choix local sabote le global. S'il n'y en a pas (propriété prouvable), garder le glouton (plus rapide, souvent O(n log n)). Sinon passer au DP, qui explore tout l'espace et garantit l'optimum.
```

---

## Pont vers le lab

> Lab associé : `05-algorithms/labs/lab-10-unionfind-trie/README.md`. Implémenter un union-find (union par rang + compression), un trie d'autocomplétion, et un glouton d'intervalles — les trois briques des communautés, de la recherche et du planning TribuZen.
