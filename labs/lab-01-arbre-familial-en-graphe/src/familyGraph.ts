// familyGraph.ts — PAGE BLANCHE. Le graphe de relations TribuZen (module 07, §2.2-2.4) au
// service d'une VRAIE fonctionnalité produit : suggérer à qui envoyer une invitation, en
// tapant un nom, sans relancer un calcul de graphe à chaque frappe (module 11, §2.2).
//
// export function buildFamilyGraph(members: FamilyMember[], relations: Array<[string, string]>): Map<string, string[]>
//   - Construit une liste d'adjacence (`Map<id, voisins[]>`, le défaut en JS — module 07 §2.2)
//     à partir de `relations`, des paires NON ORIENTÉES (parent-enfant, conjoints — peu importe
//     le sens, on ne modélise qu'« est lié à »). Chaque relation ajoute l'arête dans LES DEUX
//     sens.
//   - Toute `relation` qui référence un id absent de `members` doit faire lever une erreur —
//     mieux vaut planter à la construction qu'avoir un graphe à moitié cohérent.
//
// export function shortestPath(graph: Map<string, string[]>, fromId: string, toId: string): string[] | null
//   - BFS (pas DFS — module 07 §2.4 : BFS trouve le plus court chemin EN NOMBRE D'ARÊTES dans
//     un graphe non pondéré), avec un `visited` marqué À L'ENFILEMENT (piège #2 du module :
//     marquer au défilement gonfle la file et peut casser la minimalité).
//   - Retourne le chemin complet, de `fromId` à `toId` inclus (`[fromId, ..., toId]`).
//   - `fromId === toId` → `[fromId]`. Pas de chemin (composantes différentes, ou id inconnu)
//     → `null`.
//
// export function debounce<Args extends unknown[]>(fn: (...args: Args) => void, delayMs: number): { (...args: Args): void; cancel(): void }
//   - Cf. module 11 §2.2 : « n'exécute qu'après un délai d'inactivité, chaque appel réarme le
//     timer ». La fonction retournée expose aussi `.cancel()` (annule un appel en attente sans
//     jamais appeler `fn`).
//
// export function createFamilySearch(members: FamilyMember[], graph: Map<string, string[]>, meId: string, onResults: (results: FamilyMember[]) => void, debounceMs?: number): { (query: string): void; cancel(): void }
//   - LE GESTE COMPLET : une recherche de membres par nom (sous-chaîne, insensible à la casse,
//     `meId` toujours exclu), débouncée (`debounceMs`, défaut 300ms), dont les résultats sont
//     triés par proximité dans le graphe familial depuis `meId` (BFS, distance croissante),
//     puis par ordre alphabétique à distance égale. Un membre non connecté à `meId` reste dans
//     les résultats (le nom correspond) mais apparaît en DERNIER.
//   - Une requête vide (ou uniquement des espaces) appelle `onResults([])` immédiatement (après
//     le debounce, pas de recherche vide affichée à mi-frappe).
//
// LE PIÈGE (le sujet réel du lab) : calculer un `shortestPath` séparé pour CHAQUE candidat
// retrouvé referait un BFS complet par résultat — un seul BFS depuis `meId`, une seule fois par
// recherche, donne les distances vers TOUS les membres en O(V+E) ; c'est cette distance déjà
// calculée qu'on utilise ensuite pour trier.
export interface FamilyMember {
  id: string;
  name: string;
}

export function buildFamilyGraph(_members: FamilyMember[], _relations: Array<[string, string]>): Map<string, string[]> {
  throw new Error("buildFamilyGraph n'est pas encore implémenté");
}

export function shortestPath(_graph: Map<string, string[]>, _fromId: string, _toId: string): string[] | null {
  throw new Error("shortestPath n'est pas encore implémenté");
}

export function debounce<Args extends unknown[]>(
  _fn: (...args: Args) => void,
  _delayMs: number,
): { (...args: Args): void; cancel(): void } {
  throw new Error("debounce n'est pas encore implémenté");
}

export function createFamilySearch(
  _members: FamilyMember[],
  _graph: Map<string, string[]>,
  _meId: string,
  _onResults: (results: FamilyMember[]) => void,
  _debounceMs?: number,
): { (query: string): void; cancel(): void } {
  throw new Error("createFamilySearch n'est pas encore implémenté");
}
