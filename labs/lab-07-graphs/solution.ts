type Graph = Record<string, string[]>

const shortestPathLength = (graph: Graph, start: string, target: string): number => {
  const queue: Array<[string, number]> = [[start, 0]]
  const visited = new Set<string>([start])

  while (queue.length > 0) {
    const [node, distance] = queue.shift()!
    if (node === target) return distance
    for (const next of graph[node] ?? []) {
      if (!visited.has(next)) {
        visited.add(next)
        queue.push([next, distance + 1])
      }
    }
  }
  return -1
}

console.log(shortestPathLength({ A: ['B', 'C'], B: ['D'], C: [], D: [] }, 'A', 'D'))
