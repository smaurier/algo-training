# Lab 10 — Union-Find, Trie & greedy d'intervalles

> **Outcome :** à la fin, tu sais implémenter un union-find (union par rang + compression de chemin), un trie d'autocomplétion, et un glouton de sélection d'intervalles — en TypeScript, sans harnais simulé.
> **Vrai outil :** TypeScript + `ts-node` (ou `tsx`) exécuté à la main. Tu vérifies les sorties avec des `console.log`, pas un test-runner auto-correcteur.
> **Feedback :** le coach valide en session — tu lis tes sorties et tu justifies chaque valeur attendue.

## Énoncé

Tu construis les trois briques algorithmiques de TribuZen, dans un seul fichier `lab10.ts` que tu exécutes à la main.

1. **`UnionFind`** — regrouper des membres en communautés connectées. Répondre à `connectes(a, b)` et `count` (nombre de communautés) en `O(α(n))`.
2. **`Trie`** — autocompléter la recherche de familles/membres : proposer tous les noms commençant par un préfixe.
3. **`selectionMax`** — planifier le maximum d'ateliers dans une salle sans chevauchement (greedy d'intervalles).

Starter minimal (copie-le, complète les `// TODO`) :

```ts
// lab10.ts — exécute avec : npx tsx lab10.ts   (ou npx ts-node lab10.ts)

// ─── 1. UNION-FIND ───────────────────────────────────────────────
class UnionFind {
  private parent: number[];
  private rang: number[];
  private nbEnsembles: number;

  constructor(n: number) {
    // TODO : parent[i] = i, rang[i] = 0, nbEnsembles = n
  }

  find(x: number): number {
    // TODO : remonter jusqu'à la racine AVEC compression de chemin
  }

  union(x: number, y: number): boolean {
    // TODO : union PAR RANG ; renvoyer false si déjà connectés
  }

  connectes(x: number, y: number): boolean {
    // TODO
  }

  get count(): number {
    // TODO
  }
}

// ─── 2. TRIE ─────────────────────────────────────────────────────
class NoeudTrie {
  enfants = new Map<string, NoeudTrie>();
  estFin = false;
}

class Trie {
  private racine = new NoeudTrie();

  insert(mot: string): void {
    // TODO
  }

  autocomplete(prefixe: string, limite = 10): string[] {
    // TODO : descendre au préfixe, puis collecter tous les mots (DFS)
  }
}

// ─── 3. GREEDY D'INTERVALLES ─────────────────────────────────────
interface Creneau { titre: string; debut: number; fin: number }

function selectionMax(creneaux: Creneau[]): Creneau[] {
  // TODO : trier par FIN croissante, balayer, garder les non-chevauchants
}

// ─── VÉRIFICATIONS (ne pas modifier) ─────────────────────────────
const uf = new UnionFind(5);
uf.union(0, 1); uf.union(2, 3); uf.union(1, 3);
console.log('count =', uf.count);                 // attendu : 2
console.log('0~2   =', uf.connectes(0, 2));       // attendu : true
console.log('0~4   =', uf.connectes(0, 4));       // attendu : false

const trie = new Trie();
['martin', 'marchand', 'marie', 'durand'].forEach(m => trie.insert(m));
console.log('mar ->', trie.autocomplete('mar'));  // attendu : martin, marchand, marie
console.log('du  ->', trie.autocomplete('du'));   // attendu : durand

const creneaux: Creneau[] = [
  { titre: 'Yoga', debut: 9, fin: 10 },
  { titre: 'Peinture', debut: 9, fin: 12 },
  { titre: 'Cuisine', debut: 10, fin: 11 },
  { titre: 'Musique', debut: 11, fin: 13 },
  { titre: 'Lecture', debut: 12, fin: 14 },
  { titre: 'Danse', debut: 13, fin: 15 },
];
console.log('planning ->', selectionMax(creneaux).map(c => c.titre));
// attendu : Yoga, Cuisine, Musique, Danse
```

## Étapes (en friction)

1. Implémente `UnionFind.constructor`, `find` (avec compression de chemin), `union` (par rang, retour `boolean`), `connectes`, `count`. Exécute : les 3 premières lignes doivent afficher `2`, `true`, `false`.
2. Avant de coder le trie, **écris à la main** l'arbre préfixe des 4 mots sur papier. Puis implémente `insert` et `autocomplete` (descente au préfixe + DFS de collecte).
3. Implémente `selectionMax`. **Ne regarde pas** le corrigé avant : trouve toi-même le bon critère de tri (indice : ce n'est ni le début ni la durée).
4. Fais tourner tout le fichier. Pour chaque ligne, dis à voix haute *pourquoi* la valeur attendue est correcte avant de la comparer.

## Corrigé complet commenté

```ts
// ─── 1. UNION-FIND ───────────────────────────────────────────────
class UnionFind {
  private parent: number[];
  private rang: number[];
  private nbEnsembles: number;

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i); // chacun est sa propre racine
    this.rang = new Array(n).fill(0);                      // tous les arbres de hauteur 0
    this.nbEnsembles = n;                                  // n ensembles au départ
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      // compression de chemin : on rebranche x DIRECTEMENT sur la racine
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const rx = this.find(x);
    const ry = this.find(y);
    if (rx === ry) return false;          // déjà dans le même ensemble → rien à faire

    // union PAR RANG : le petit arbre passe sous le grand (garde l'arbre plat)
    if (this.rang[rx] < this.rang[ry]) {
      this.parent[rx] = ry;
    } else if (this.rang[rx] > this.rang[ry]) {
      this.parent[ry] = rx;
    } else {
      this.parent[ry] = rx;               // rangs égaux : on choisit rx comme racine
      this.rang[rx]++;                     // ... et son rang augmente de 1
    }
    this.nbEnsembles--;                    // une fusion = un ensemble de moins
    return true;
  }

  connectes(x: number, y: number): boolean {
    return this.find(x) === this.find(y); // même racine ⟺ même ensemble
  }

  get count(): number {
    return this.nbEnsembles;
  }
}

// ─── 2. TRIE ─────────────────────────────────────────────────────
class NoeudTrie {
  enfants = new Map<string, NoeudTrie>();
  estFin = false;                          // vrai si un mot se termine ICI
}

class Trie {
  private racine = new NoeudTrie();

  insert(mot: string): void {
    let noeud = this.racine;
    for (const lettre of mot) {
      if (!noeud.enfants.has(lettre)) {
        noeud.enfants.set(lettre, new NoeudTrie()); // crée le nœud manquant
      }
      noeud = noeud.enfants.get(lettre)!;  // descend d'un cran
    }
    noeud.estFin = true;                   // marque la fin du mot
  }

  autocomplete(prefixe: string, limite = 10): string[] {
    // 1) descendre jusqu'au nœud du préfixe
    let noeud = this.racine;
    for (const lettre of prefixe) {
      const suivant = noeud.enfants.get(lettre);
      if (!suivant) return [];             // préfixe absent → aucun résultat
      noeud = suivant;
    }
    // 2) collecter tous les mots sous ce nœud (DFS)
    const resultats: string[] = [];
    const collecter = (n: NoeudTrie, acc: string) => {
      if (resultats.length >= limite) return;
      if (n.estFin) resultats.push(acc);   // acc est un mot complet
      for (const [lettre, enfant] of n.enfants) {
        collecter(enfant, acc + lettre);
      }
    };
    collecter(noeud, prefixe);
    return resultats;
  }
}

// ─── 3. GREEDY D'INTERVALLES ─────────────────────────────────────
interface Creneau { titre: string; debut: number; fin: number }

function selectionMax(creneaux: Creneau[]): Creneau[] {
  // CLÉ : trier par heure de FIN croissante (libère le max de temps ensuite)
  const tries = [...creneaux].sort((a, b) => a.fin - b.fin);
  const retenus: Creneau[] = [];
  let finPrecedente = -Infinity;

  for (const c of tries) {
    if (c.debut >= finPrecedente) {        // >= : la salle se libère pile à l'heure
      retenus.push(c);
      finPrecedente = c.fin;               // fixe la nouvelle borne
    }
  }
  return retenus;
}
```

**Sorties attendues :**

```
count = 2
0~2   = true
0~4   = false
mar -> [ 'martin', 'marchand', 'marie' ]
du  -> [ 'durand' ]
planning -> [ 'Yoga', 'Cuisine', 'Musique', 'Danse' ]
```

## Variante J+30 (fading)

Refais les trois briques **de mémoire, en 25 min**, avec ces contraintes ajoutées :

1. **Union-Find** : ajoute une méthode `taille(x): number` qui renvoie le nombre d'éléments dans l'ensemble de `x` (maintiens un tableau `taille` mis à jour dans `union`).
2. **Trie** : ajoute `search(mot): boolean` (mot complet, exige `estFin`) et vérifie que `search('mar')` renvoie `false` alors que `autocomplete('mar')` renvoie 3 résultats.
3. **Greedy** : au lieu de maximiser le *nombre* d'ateliers, calcule le **nombre minimum de salles** nécessaires pour tous les caser (sweep line : trie les événements début `+1` / fin `-1`, suis le maximum courant).

Contrainte transverse : n'utilise ni le corrigé ci-dessus, ni le module — seulement tes notes Anki.

## Application TribuZen

Porte ces briques dans le vrai produit (`smaurier/tribuzen`) :

- `src/services/communities.ts` — expose une classe `CommunityGraph` qui encapsule un `UnionFind` indexé par `memberId` (via une `Map<string, number>` pour convertir les IDs en indices). Méthodes : `link(a, b)`, `sameCommunity(a, b)`, `communityCount`.
- `src/features/search/SearchIndex.ts` — un `Trie` chargé au boot avec les noms de familles/membres normalisés (`toLowerCase()`, sans accents). L'endpoint `/search/suggest?q=` appelle `autocomplete(q, 5)`.
- `src/features/planning/schedule.ts` — `selectionMax` pour proposer un planning d'ateliers sans conflit de salle, plus la variante « nombre de salles » du J+30 pour dimensionner les besoins.

Commit suggéré : `feat(algos): union-find communities + trie search + greedy planning` sur `smaurier/tribuzen`.
