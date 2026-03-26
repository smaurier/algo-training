type Order = { userId: string; amount: number }

const groupByUser = (_orders: Order[]): Map<string, number> => {
  return new Map()
}

console.log(groupByUser([
  { userId: 'u1', amount: 10 },
  { userId: 'u2', amount: 20 },
  { userId: 'u1', amount: 15 },
]))
