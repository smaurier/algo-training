type Node = { value: number; children?: Node[] }

const sumTree = (root: Node | null): number => {
  if (!root) return 0
  return root.value + (root.children ?? []).reduce((sum, child) => sum + sumTree(child), 0)
}

console.log(sumTree({ value: 1, children: [{ value: 2 }, { value: 3 }] }))
