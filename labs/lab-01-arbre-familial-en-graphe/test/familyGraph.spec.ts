// Oracle du lab 01 (Algorithmes). Ne pas modifier.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildFamilyGraph, createFamilySearch, debounce, shortestPath, type FamilyMember } from "@lab/familyGraph";

const MEMBERS: FamilyMember[] = [
  { id: "moi", name: "Sylvain" },
  { id: "papa", name: "Papa" },
  { id: "maman", name: "Maman" },
  { id: "lea", name: "Léa" },
  { id: "grandpere", name: "Grand-père" },
  { id: "isole", name: "Isolée" },
];

// moi─papa─grandpere, moi─maman─lea (lea est aussi relié à papa : forme un cycle
// moi-papa-lea-maman-moi, pour vérifier que BFS ne boucle pas et trouve quand même le minimum)
const RELATIONS: Array<[string, string]> = [
  ["moi", "papa"],
  ["moi", "maman"],
  ["papa", "grandpere"],
  ["maman", "lea"],
  ["papa", "lea"],
];

describe("buildFamilyGraph — liste d'adjacence non orientée", () => {
  it("ajoute chaque relation dans les deux sens", () => {
    const graph = buildFamilyGraph(MEMBERS, [["moi", "papa"]]);
    expect(graph.get("moi")).toEqual(["papa"]);
    expect(graph.get("papa")).toEqual(["moi"]);
  });

  it("un membre sans relation a une liste de voisins vide, pas absente", () => {
    const graph = buildFamilyGraph(MEMBERS, [["moi", "papa"]]);
    expect(graph.get("isole")).toEqual([]);
  });

  it("lève une erreur si une relation référence un id inconnu", () => {
    expect(() => buildFamilyGraph(MEMBERS, [["moi", "fantome"]])).toThrow();
  });
});

describe("shortestPath — BFS, plus court chemin en nombre d'arêtes", () => {
  const graph = buildFamilyGraph(MEMBERS, RELATIONS);

  it("une relation directe donne un chemin à 2 sommets", () => {
    expect(shortestPath(graph, "moi", "papa")).toEqual(["moi", "papa"]);
  });

  it("trouve le chemin minimal à travers un intermédiaire", () => {
    expect(shortestPath(graph, "moi", "grandpere")).toEqual(["moi", "papa", "grandpere"]);
  });

  it("un cycle dans le graphe ne fait pas boucler BFS et ne casse pas la minimalité", () => {
    // moi→lea : direct via maman (2 arêtes) OU via papa (2 arêtes) — les deux sont minimaux,
    // mais surtout le test doit se terminer (pas de boucle infinie sur le cycle moi-papa-lea-maman-moi).
    const chemin = shortestPath(graph, "moi", "lea");
    expect(chemin).not.toBeNull();
    expect(chemin!.length).toBe(3);
    expect(chemin![0]).toBe("moi");
    expect(chemin![chemin!.length - 1]).toBe("lea");
  });

  it("même sommet de départ et d'arrivée → chemin à un seul élément", () => {
    expect(shortestPath(graph, "moi", "moi")).toEqual(["moi"]);
  });

  it("aucun chemin entre deux composantes déconnectées → null", () => {
    expect(shortestPath(graph, "moi", "isole")).toBeNull();
  });

  it("id inconnu → null (pas d'exception)", () => {
    expect(shortestPath(graph, "moi", "fantome")).toBeNull();
  });
});

describe("debounce — n'exécute qu'après un silence, chaque appel réarme le timer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("plusieurs appels rapprochés ne déclenchent fn qu'une seule fois", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced("a");
    vi.advanceTimersByTime(100);
    debounced("ab");
    vi.advanceTimersByTime(100);
    debounced("abc");
    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("abc");
  });

  it("cancel() empêche un appel en attente de partir", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced("x");
    vi.advanceTimersByTime(150);
    debounced.cancel();
    vi.advanceTimersByTime(1000);

    expect(fn).not.toHaveBeenCalled();
  });

  it("après un déclenchement, un nouvel appel réarme un nouveau cycle complet", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced("premier");
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);

    debounced("second");
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("second");
  });
});

describe("createFamilySearch — le geste complet : BFS + debounce au service d'une recherche triée", () => {
  const graph = buildFamilyGraph(MEMBERS, RELATIONS);

  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("ne cherche qu'une fois le silence atteint, jamais à chaque frappe", () => {
    const onResults = vi.fn();
    const search = createFamilySearch(MEMBERS, graph, "moi", onResults, 300);

    search("l");
    vi.advanceTimersByTime(100);
    search("le");
    vi.advanceTimersByTime(100);
    search("lea");
    vi.advanceTimersByTime(300);

    expect(onResults).toHaveBeenCalledTimes(1);
  });

  it("exclut toujours meId des résultats, même s'il correspond au texte", () => {
    const onResults = vi.fn();
    const search = createFamilySearch(MEMBERS, graph, "moi", onResults, 300);

    search("sylvain");
    vi.advanceTimersByTime(300);

    expect(onResults).toHaveBeenCalledWith([]);
  });

  it("trie les résultats par proximité dans le graphe depuis meId (distance croissante)", () => {
    const onResults = vi.fn();
    // "a" matche Papa, Maman, Léa, Grand-père — à distances 1, 1, 2, 2 depuis "moi"
    const search = createFamilySearch(MEMBERS, graph, "moi", onResults, 300);

    search("a");
    vi.advanceTimersByTime(300);

    const resultats = onResults.mock.calls[0][0] as FamilyMember[];
    const ids = resultats.map((m) => m.id);
    // Papa et Maman (distance 1) doivent tous les deux précéder Léa et Grand-père (distance 2)
    const indexDistance1Max = Math.max(ids.indexOf("papa"), ids.indexOf("maman"));
    const indexDistance2Min = Math.min(ids.indexOf("lea"), ids.indexOf("grandpere"));
    expect(indexDistance1Max).toBeLessThan(indexDistance2Min);
  });

  it("à distance égale, trie par ordre alphabétique", () => {
    const onResults = vi.fn();
    const search = createFamilySearch(MEMBERS, graph, "moi", onResults, 300);

    search("a");
    vi.advanceTimersByTime(300);

    const resultats = onResults.mock.calls[0][0] as FamilyMember[];
    const ids = resultats.map((m) => m.id);
    // "Maman" < "Papa" alphabétiquement, tous deux à distance 1
    expect(ids.indexOf("maman")).toBeLessThan(ids.indexOf("papa"));
  });

  it("un membre non connecté à meId reste trouvable mais apparaît en dernier", () => {
    const membresAvecIsoleeNommee: FamilyMember[] = [...MEMBERS.filter((m) => m.id !== "isole"), { id: "isole", name: "Alone" }];
    const onResults = vi.fn();
    const search = createFamilySearch(membresAvecIsoleeNommee, graph, "moi", onResults, 300);

    search("a");
    vi.advanceTimersByTime(300);

    const resultats = onResults.mock.calls[0][0] as FamilyMember[];
    const ids = resultats.map((m) => m.id);
    expect(ids).toContain("isole");
    expect(ids[ids.length - 1]).toBe("isole");
  });

  it("une requête vide (ou espaces) renvoie une liste vide, sans planter à mi-frappe", () => {
    const onResults = vi.fn();
    const search = createFamilySearch(MEMBERS, graph, "moi", onResults, 300);

    search("   ");
    vi.advanceTimersByTime(300);

    expect(onResults).toHaveBeenCalledWith([]);
  });
});
