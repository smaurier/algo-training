type Node = { value: number; children?: Node[] }

const sumTree = (_root: Node | null): number => 0

console.log(sumTree({ value: 1, children: [{ value: 2 }, { value: 3 }] }))
