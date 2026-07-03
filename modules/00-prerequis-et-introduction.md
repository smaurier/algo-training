---
titre: Prérequis et introduction à l'algorithmique
cours: 05-algorithms
notions: [algorithme vs implémentation, pourquoi l'algo pour un dev fullstack, méthode de résolution en 6 étapes, pseudo-code, pattern matching d'un problème, coût temps/mémoire en intuition, carte du cours]
outcomes: [dérouler une méthode de résolution structurée avant de coder, écrire du pseudo-code avant l'implémentation, reconnaître le pattern algorithmique derrière un problème produit]
prerequis: []
next: 01-complexite-et-raisonnement
libs: []
tribuzen: problèmes algorithmiques réels de TribuZen (dédup de membres, tri de familles, graphe de relations, recommandations) comme fil conducteur du cours
last-reviewed: 2026-07
---

# Prérequis et introduction à l'algorithmique

> **Outcomes — tu sauras FAIRE :** dérouler une méthode de résolution structurée avant de coder, écrire du pseudo-code avant l'implémentation, reconnaître le pattern algorithmique derrière un problème produit.
> **Difficulté :** :star:

## 1. Cas concret d'abord

Tu intègres l'équipe TribuZen. Un import CSV de familles a mal tourné : la table `members` contient des doublons — le même utilisateur inscrit deux fois avec des emails en casse différente (`Jean.Dupont@x.fr` et `jean.dupont@x.fr`). Le lead te lâche un ticket :

> « On reçoit un tableau de ~1,2 million de membres depuis l'ancien système. Trouve-moi les emails en double (insensible à la casse) pour qu'on puisse fusionner. Ça doit tourner en moins d'une seconde dans le job de migration. »

Ton premier réflexe de débutant serait d'ouvrir l'éditeur et d'écrire deux boucles imbriquées :

```ts
// ❌ Le réflexe "je code tout de suite"
function findDuplicates(members: Member[]): string[] {
  const dups: string[] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      if (members[i].email.toLowerCase() === members[j].email.toLowerCase()) {
        dups.push(members[i].email);
      }
    }
  }
  return dups;
}
```

Ça « marche » sur 10 membres. Sur 1,2 million, cette double boucle fait ~720 milliards de comparaisons : le job ne rend pas la main avant plusieurs **minutes**, voire plante. Le ticket demandait une seconde.

Le problème n'est pas ton JavaScript — il est **correct**. Le problème est que tu as codé avant de raisonner. Ce module t'apprend la démarche qui, appliquée à ce ticket, aurait donné en 30 secondes de réflexion la bonne réponse : « c'est un problème de **déduplication** → un `Set` / une `Map` par clé normalisée → O(n) → une passe → une centaine de millisecondes ». On y revient en section 3.

---

## 2. Théorie complète, concise

### 2.1 Algorithme vs implémentation

Un **algorithme** est une suite finie et non ambiguë d'étapes qui transforme une **entrée** en une **sortie**. C'est une idée, indépendante du langage.

L'**implémentation**, c'est cet algorithme traduit dans un langage précis (ici JS/TS), avec sa syntaxe et ses structures.

```
Algorithme  : "pour dédupliquer, garde une trace des clés déjà vues"
Implémentation : new Set(), .has(), .add()   ← les détails JS
```

La même idée (déduplication) s'implémente en JS avec un `Set`, en SQL avec `GROUP BY`, en Python avec un `dict`. Apprendre l'algorithmique, c'est apprendre les **idées** — elles survivent au changement de langage et de framework. C'est pour ça que cette compétence ne périme pas comme un framework front.

### 2.2 Pourquoi l'algo pour un dev JS fullstack

Trois raisons concrètes, dans l'ordre de ce qui te rapporte vraiment :

**1. Résoudre de vrais problèmes produit.** L'algorithmique n'est pas réservée aux concours. Elle est partout dès qu'il y a de la donnée à organiser :

```
Frontend                         Backend
──────────────────────────────   ──────────────────────────────
Autocomplétion    → Trie          Déduplication    → Set / Map
Undo / Redo       → Stack         Ordre migrations → Tri topologique
Feed infini       → Curseurs      File de jobs     → File de priorité
Arbre de routes   → DFS           Permissions      → Parcours de graphe
Cache local       → LRU           Recherche full-text → Trie / index
```

**2. Perf.** Le bon algorithme fait la différence entre un job de 5 ms et un job de 5 000 ms (cas concret ci-dessus, facteur ×1000). À l'échelle produit, ça change ce qui est faisable de ce qui ne l'est pas.

**3. Entretiens ESN / startups.** La quasi-totalité des entretiens techniques incluent une question d'algo. On n'y évalue pas ta mémoire du quicksort, mais ta façon de **décomposer** un problème, de **communiquer** ton raisonnement, de **vérifier** les cas limites et de raisonner sur le **coût**. C'est exactement la méthode de la section suivante.

> Ce cours ne vise **pas** la compétition (résoudre du LeetCode hard en 10 min). Il vise des réflexes d'ingénieur : choisir la bonne structure, raisonner sur le coût, reconnaître un pattern, écrire du TS propre, faire le lien algo ↔ produit.

### 2.3 La méthode de résolution en 6 étapes

C'est le cœur du cours. Devant **tout** problème, avant d'écrire une ligne :

```
1. COMPRENDRE   Reformule le problème avec tes mots. Entrées ? Sorties ?
                Contraintes ? (taille max, trié ou non, doublons, cas vides)
2. EXEMPLES     Prends 2-3 cas à la main, dont un cas limite (tableau vide,
                un seul élément, tout identique). Écris l'entrée ET la sortie.
3. BRUTE FORCE  Trouve N'IMPORTE quelle solution correcte, même lente.
                Une solution lente qui marche > une solution rapide fausse.
4. OPTIMISER    Où est le gaspillage ? Une structure de données aide-t-elle ?
                Peut-on éviter de recalculer ? de re-parcourir ?
5. CODER        Traduis en TS, à partir du pseudo-code, pas de tête.
6. TESTER       Rejoue tes exemples de l'étape 2, surtout les cas limites.
```

Les débutants sautent directement à l'étape 5. Les étapes 1-4 sont exactement ce qui distingue un ingénieur d'un pisseur de code — et ce que l'examinateur d'entretien regarde.

### 2.4 Le pseudo-code

Le **pseudo-code** est une description des étapes en langage semi-naturel, sans se soucier de la syntaxe. Il sert de pont entre l'idée (étape 4) et le code (étape 5).

```
FONCTION findDuplicates(membres) :
    vus        ← ensemble vide
    doublons   ← ensemble vide
    POUR CHAQUE membre DANS membres :
        clé ← membre.email en minuscules
        SI clé est DÉJÀ dans vus :
            ajouter clé à doublons
        SINON :
            ajouter clé à vus
    RETOURNER liste(doublons)
```

Écrire ça d'abord évite de se battre avec la syntaxe TS pendant qu'on réfléchit encore à la logique. On sépare « quoi faire » de « comment l'écrire ».

### 2.5 Le pattern matching d'un problème

La compétence qui accélère tout : reconnaître qu'un énoncé produit « habillé » cache un **pattern** connu. On enlève l'habillage métier et on voit la forme.

```
Énoncé produit                                 → Pattern
──────────────────────────────────────────────────────────────
"emails en double après import"                → déduplication (Set/Map)
"les 10 familles les plus actives"             → tri / top-K (heap)
"qui est relié à qui dans une famille"         → graphe (BFS/DFS)
"a-t-on déjà vu cet identifiant ?"             → appartenance (Set)
"quel ordre pour appliquer les dépendances ?"  → tri topologique
"suggérer des membres à ajouter"               → parcours de graphe / scoring
```

Une fois le pattern identifié, tu connais déjà la structure de données et l'ordre de grandeur du coût. La carte ci-dessous (2.7) est ton catalogue de patterns.

### 2.6 Le coût, en intuition

On formalise le Big-O au module 01. Pour l'instant, garde juste cette intuition « combien de travail par rapport à la taille n des données » :

```
O(1)        travail constant, indépendant de n      ← accès Map, .has() d'un Set
O(log n)    on divise le problème par 2 à chaque pas ← recherche dichotomique
O(n)        une passe sur les données                ← une boucle simple
O(n log n)  une passe × un facteur log               ← un bon tri
O(n²)       deux boucles imbriquées sur les données  ← à fuir sur gros n
```

Et l'ordre de grandeur acceptable selon la taille :

```
n ≈ 10          n'importe quoi passe (même O(n³))
n ≈ 1 000       O(n²) souvent OK
n ≈ 100 000     vise O(n log n) ou mieux
n ≈ 1 000 000+  vise O(n)
```

Le ticket du cas concret (n ≈ 1,2 M) tombe dans la dernière ligne : il **faut** du O(n). La double boucle O(n²) était condamnée d'avance.

### 2.7 La carte du cours

Chaque module ajoute un outil de résolution. La progression va du fondamental à l'avancé, chaque brique s'appuyant sur les précédentes :

```
01  Complexité & raisonnement   → mesurer et comparer le coût (Big-O)
02  Tableaux, chaînes, hash-maps → Map / Set : la boîte à outils de base
03  Stacks, queues, listes       → structures linéaires
04  Récursion & recherche dicho  → diviser pour régner, binary search
05  Tris, partition, heaps       → ordonner, top-K
06  Arbres & BST                 → hiérarchies, recherche ordonnée
07  Graphes & parcours           → relations, BFS / DFS, tri topologique
08  Backtracking                 → explorer toutes les possibilités
09  Programmation dynamique      → mémoriser pour ne pas recalculer
10  Greedy, union-find, trie     → gloutons, ensembles disjoints, préfixes
11  Patterns JS fullstack        → algo appliqué au produit réel
12  Projet final                 → tout combiner sur un cas TribuZen
```

Tu n'as pas besoin de tout retenir maintenant. Retiens juste que chaque problème du cours est un **pattern réutilisable**, et que le module 11 les rebranche tous sur du code fullstack concret.

---

## 3. Worked examples

### Exemple 1 — Résoudre le ticket de déduplication avec la méthode

On déroule les 6 étapes sur le cas concret, entièrement.

**Étape 1 — Comprendre.** Entrée : `Member[]` (~1,2 M), chaque membre a un `email`. Sortie : la liste des emails apparaissant ≥ 2 fois, comparaison **insensible à la casse**. Contrainte forte : < 1 s, donc gros n → il faut O(n).

**Étape 2 — Exemples (dont cas limites).**

```ts
// cas nominal
findDuplicates([
  { email: "Jean.Dupont@x.fr" },
  { email: "jean.dupont@x.fr" }, // même personne, casse différente
  { email: "amel@x.fr" },
]); // → ["jean.dupont@x.fr"]

// cas limites à ne pas oublier
findDuplicates([]);                       // → []  (tableau vide)
findDuplicates([{ email: "a@x.fr" }]);    // → []  (un seul élément)
```

**Étape 3 — Brute force.** La double boucle O(n²) de la section 1. Correcte, mais trop lente. On la garde comme référence de correction, pas comme solution finale.

**Étape 4 — Optimiser.** Le gaspillage : pour chaque membre, on re-parcourt tout le reste. Or « ai-je déjà vu cette clé ? » est exactement ce qu'un `Set` répond en O(1). Pattern reconnu : **déduplication → appartenance → Set**. Une seule passe suffit → O(n).

**Étape 5 — Coder** (à partir du pseudo-code de la section 2.4) :

```ts
interface Member {
  email: string;
}

function findDuplicates(members: Member[]): string[] {
  const seen = new Set<string>();       // clés normalisées déjà rencontrées
  const duplicates = new Set<string>(); // évite de reporter 3x le même doublon

  for (const member of members) {
    const key = member.email.toLowerCase(); // normalisation casse
    if (seen.has(key)) {
      duplicates.add(key);
    } else {
      seen.add(key);
    }
  }

  return [...duplicates];
}
```

**Étape 6 — Tester.** On rejoue les exemples de l'étape 2 : le cas nominal rend `["jean.dupont@x.fr"]`, le tableau vide rend `[]`, l'élément unique rend `[]`. Coût : une passe → O(n) temps, O(n) mémoire. Sur 1,2 M, quelques centaines de ms au lieu de plusieurs minutes. Ticket résolu.

**Le point à retenir :** l'idée gagnante (`Set`) est apparue à l'étape 4, *avant* de coder. La méthode a fait le travail, pas la virtuosité TS.

### Exemple 2 — Pattern matching sur un second ticket TribuZen

> « Affiche les 10 familles les plus actives (par nombre de messages ce mois-ci). On a ~50 000 familles. »

On ne code pas — on **identifie le pattern**, ce qui est déjà 80 % du travail.

```
1. COMPRENDRE  Entrée : 50 000 familles, chacune avec un compteur `messages`.
               Sortie : les 10 avec le compteur le plus élevé, triées desc.
2. ENLEVER L'HABILLAGE MÉTIER
               "les 10 plus grosses valeurs d'une liste" → pattern TOP-K.
3. PATTERN     Top-K → deux options connues :
               (a) trier tout puis prendre 10   → O(n log n)
               (b) tas (heap) de taille 10      → O(n log k), vu au module 05
4. CHOISIR     n = 50 000 : O(n log n) passe très bien. On garde le tri, simple.
```

Traduction directe une fois le pattern posé :

```ts
interface Family {
  id: string;
  name: string;
  messages: number;
}

function topActiveFamilies(families: Family[], k = 10): Family[] {
  return [...families]                       // copie : ne pas muter l'entrée
    .sort((a, b) => b.messages - a.messages) // tri décroissant, O(n log n)
    .slice(0, k);                            // les k premières
}
```

Remarque le réflexe `[...families]` : on trie une **copie** pour ne pas modifier le tableau reçu (piège #4 ci-dessous). Sans avoir écrit une seule ligne « d'algo compliqué », le pattern matching a donné la structure de la solution et son coût.

---

## 4. Pièges & misconceptions

### PIÈGE #1 — Coder avant de comprendre

```ts
// ❌ On saute à l'implémentation, on découvre les contraintes en cours de route
function findDuplicates(members) {
  // ... double boucle ... et on réalise trop tard que n = 1,2 M
}
```

**Pourquoi c'est faux :** la contrainte de taille (n) détermine l'algo. La découvrir après avoir codé, c'est réécrire depuis zéro. **Correct :** étapes 1-2 (comprendre + exemples) d'abord, toujours. 5 minutes de réflexion économisent des heures de refonte.

### PIÈGE #2 — Confondre « ça marche » et « c'est bon »

Une solution qui passe sur 10 éléments peut être inutilisable sur 1 M. « Ça marche » sur ton mini-exemple ne dit **rien** du comportement à l'échelle. Une bonne solution est **correcte ET proportionnée aux contraintes**. Le cas concret : la double boucle « marchait » — et échouait quand même au ticket.

### PIÈGE #3 — Optimiser trop tôt (ou pas assez)

Les deux extrêmes sont des pièges :

```ts
// ❌ Sur-optimisation : n = 20 familles, et on sort un tas binaire maison
//    illisible pour gratter des microsecondes qui n'existent pas.

// ❌ Sous-optimisation : n = 1 M, et on garde le O(n²) "parce que ça marchait
//    sur le jeu de test".
```

**Correct :** l'algo gagnant est **le plus simple qui respecte les contraintes**. Sur petit n, la lisibilité prime. Sur gros n, le coût prime. Le facteur décisif, c'est n (section 2.6).

### PIÈGE #4 — Muter l'entrée sans le vouloir

```ts
// ❌ .sort() trie EN PLACE : il modifie le tableau reçu en argument
function topActive(families: Family[]) {
  return families.sort((a, b) => b.messages - a.messages).slice(0, 10);
  // families est maintenant réordonné chez l'appelant → bug sournois ailleurs
}

// ✅ On trie une copie
function topActive(families: Family[]) {
  return [...families].sort((a, b) => b.messages - a.messages).slice(0, 10);
}
```

**Pourquoi c'est faux :** `Array.prototype.sort` et `reverse` mutent. Un appelant qui réutilise le tableau après coup récupère un ordre changé. **Correct :** copier (`[...arr]` ou `arr.slice()`) avant de trier, sauf si le tri en place est explicitement voulu.

### PIÈGE #5 — Confondre pseudo-code et code approximatif

Le pseudo-code décrit la **logique** (« pour chaque, si déjà vu… »). Ce n'est pas du JS avec des fautes de frappe. Son but est de valider le raisonnement **avant** de se soucier de la syntaxe. Écrire du « presque-JS » bâclé fait perdre les deux avantages : ni la clarté du pseudo-code, ni la correction du vrai code.

---

## 5. Ancrage TribuZen

Ce cours n'illustre pas l'algorithmique sur des exemples abstraits : chaque grande famille de problèmes correspond à un besoin **réel** de TribuZen, le produit fil rouge. Voici le mapping que le cours suit de bout en bout :

| Problème produit TribuZen | Pattern algorithmique | Module qui l'outille |
|---|---|---|
| Dédupliquer les membres après import (cas concret) | déduplication / appartenance → `Set`, `Map` | 02 |
| Classer les familles les plus actives (top-K) | tri / tas | 05 |
| Historique d'actions annulables (undo/redo) | pile | 03 |
| Modéliser les relations familiales (qui est relié à qui) | graphe, BFS/DFS | 07 |
| Recommander des membres/familles à rejoindre | parcours de graphe + scoring | 07, 11 |
| Autocomplétion de recherche de familles | trie / recherche par préfixe | 10 |
| Ordre d'application des migrations de données | tri topologique | 07 |

Concrètement, dans le dépôt `smaurier/tribuzen`, ces algorithmes vivent côté backend dans les jobs et services :

```
tribuzen/src/
  jobs/
    migrate-members.ts      → déduplication (module 02)
  services/
    ranking.service.ts      → top familles actives (module 05)
    relations.service.ts    → graphe de relations familiales (module 07)
    recommend.service.ts    → recommandations (modules 07, 11)
```

Le module 12 (projet final) rassemble plusieurs de ces briques sur un scénario TribuZen complet. Garde ce tableau en tête : à chaque nouveau module, tu sauras **quel problème produit réel** il débloque.

---

## 6. Points clés

1. Un algorithme est une **idée** (suite d'étapes) ; l'implémentation en est la traduction dans un langage — l'idée survit au changement de stack.
2. L'algo sert d'abord à résoudre de vrais problèmes produit et à la perf ; les entretiens ESN ne font qu'évaluer cette même démarche.
3. La méthode en 6 étapes — comprendre, exemples, brute force, optimiser, coder, tester — passe avant toute ligne de code.
4. Une solution lente **correcte** vaut mieux qu'une solution rapide **fausse** : on part du brute force, puis on optimise.
5. Le pseudo-code sépare « quoi faire » de « comment l'écrire » et évite de se battre avec la syntaxe pendant qu'on raisonne.
6. Le pattern matching consiste à enlever l'habillage métier pour reconnaître une forme connue (dédup, top-K, graphe…) et en déduire structure + coût.
7. Le facteur décisif du choix d'algo est la taille n des données ; l'algo gagnant est le plus simple qui respecte les contraintes.
8. Chaque module du cours outille un problème réel de TribuZen — l'algorithmique y est un moyen produit, pas une fin abstraite.

---

## 7. Seeds Anki

```
Quelle différence entre un algorithme et son implémentation ?|L'algorithme est l'idée : une suite finie et non ambiguë d'étapes entrée→sortie, indépendante du langage. L'implémentation est cette idée traduite dans un langage précis (JS/TS) avec sa syntaxe et ses structures.
Quelles sont les 6 étapes de la méthode de résolution ?|1) Comprendre (entrées/sorties/contraintes), 2) Exemples (dont cas limites), 3) Brute force (n'importe quelle solution correcte), 4) Optimiser (chercher le gaspillage), 5) Coder (depuis le pseudo-code), 6) Tester (rejouer les exemples).
Pourquoi commencer par une solution brute force même si elle est lente ?|Parce qu'une solution lente mais correcte vaut mieux qu'une solution rapide mais fausse : elle sert de référence de correction et de base à optimiser à l'étape 4. On sécurise la correction avant la performance.
À quoi sert le pseudo-code ?|À décrire la logique en langage semi-naturel avant de coder, pour séparer « quoi faire » de « comment l'écrire » et éviter de se battre avec la syntaxe pendant qu'on raisonne encore sur l'algorithme.
Qu'est-ce que le pattern matching d'un problème ?|Enlever l'habillage métier d'un énoncé pour reconnaître une forme algorithmique connue (déduplication, top-K, graphe, tri topologique…), ce qui donne directement la structure de données à utiliser et l'ordre de grandeur du coût.
Quel est le facteur qui détermine le choix d'un algorithme ?|La taille n des données. n≈10 : n'importe quoi passe ; n≈1000 : O(n²) souvent OK ; n≈100 000 : viser O(n log n) ; n≈1 000 000+ : viser O(n). L'algo gagnant est le plus simple qui respecte les contraintes.
Pourquoi copier un tableau avant de le trier ?|Parce que Array.prototype.sort (comme reverse) trie EN PLACE et mute le tableau reçu. On fait [...arr] ou arr.slice() avant .sort() pour ne pas modifier l'entrée chez l'appelant, sauf si la mutation est explicitement voulue.
Quel pattern algorithmique résout la déduplication de membres dans TribuZen ?|L'appartenance via un Set (ou une Map) : on garde les clés normalisées déjà vues et on teste .has() en O(1) par élément, soit une seule passe O(n) — au lieu d'une double boucle O(n²) inutilisable sur ~1,2 M de membres.
```
