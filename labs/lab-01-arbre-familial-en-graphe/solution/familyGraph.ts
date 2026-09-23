// familyGraph.ts — SOLUTION DE RÉFÉRENCE (commentée). Ne l'ouvre pas avant ton GREEN.
export interface FamilyMember {
  id: string;
  name: string;
}

export function buildFamilyGraph(members: FamilyMember[], relations: Array<[string, string]>): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  for (const membre of members) graph.set(membre.id, []);

  for (const [a, b] of relations) {
    if (!graph.has(a) || !graph.has(b)) {
      throw new Error(`relation invalide : membre inconnu (${a} ou ${b})`);
    }
    graph.get(a)!.push(b);
    graph.get(b)!.push(a);
  }
  return graph;
}

export function shortestPath(graph: Map<string, string[]>, fromId: string, toId: string): string[] | null {
  if (!graph.has(fromId) || !graph.has(toId)) return null;
  if (fromId === toId) return [fromId];

  // visited marqué À L'ENFILEMENT (piège #2 module 07) : sinon deux voisins peuvent enfiler
  // le même sommet et gonfler la file.
  const visited = new Set<string>([fromId]);
  const parent = new Map<string, string>();
  const queue: string[] = [fromId];
  let tete = 0;

  while (tete < queue.length) {
    const courant = queue[tete++];
    for (const voisin of graph.get(courant) ?? []) {
      if (visited.has(voisin)) continue;
      visited.add(voisin);
      parent.set(voisin, courant);
      if (voisin === toId) {
        const chemin = [voisin];
        let noeud = voisin;
        while (noeud !== fromId) {
          noeud = parent.get(noeud)!;
          chemin.push(noeud);
        }
        return chemin.reverse();
      }
      queue.push(voisin);
    }
  }
  return null;
}

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
): { (...args: Args): void; cancel(): void } {
  let minuteur: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Args) => {
    if (minuteur !== undefined) clearTimeout(minuteur);
    minuteur = setTimeout(() => {
      minuteur = undefined;
      fn(...args);
    }, delayMs);
  };
  debounced.cancel = () => {
    if (minuteur !== undefined) {
      clearTimeout(minuteur);
      minuteur = undefined;
    }
  };
  return debounced;
}

// Un seul BFS depuis meId donne les distances vers TOUS les membres en O(V+E) — réutilisé
// pour trier chaque résultat, au lieu d'un shortestPath (un BFS complet) par candidat.
function distancesDepuis(graph: Map<string, string[]>, depuisId: string): Map<string, number> {
  const distances = new Map<string, number>();
  if (!graph.has(depuisId)) return distances;

  distances.set(depuisId, 0);
  const queue: string[] = [depuisId];
  let tete = 0;
  while (tete < queue.length) {
    const courant = queue[tete++];
    const d = distances.get(courant)!;
    for (const voisin of graph.get(courant) ?? []) {
      if (distances.has(voisin)) continue;
      distances.set(voisin, d + 1);
      queue.push(voisin);
    }
  }
  return distances;
}

export function createFamilySearch(
  members: FamilyMember[],
  graph: Map<string, string[]>,
  meId: string,
  onResults: (results: FamilyMember[]) => void,
  debounceMs = 300,
): { (query: string): void; cancel(): void } {
  const rechercher = (query: string) => {
    const q = query.trim().toLowerCase();
    if (q === "") {
      onResults([]);
      return;
    }

    const correspondances = members.filter((m) => m.id !== meId && m.name.toLowerCase().includes(q));
    const distances = distancesDepuis(graph, meId);

    const tries = [...correspondances].sort((a, b) => {
      const da = distances.get(a.id) ?? Number.POSITIVE_INFINITY;
      const db = distances.get(b.id) ?? Number.POSITIVE_INFINITY;
      if (da !== db) return da - db;
      return a.name.localeCompare(b.name);
    });
    onResults(tries);
  };

  return debounce(rechercher, debounceMs);
}
