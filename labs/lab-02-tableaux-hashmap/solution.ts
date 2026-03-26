type Order = { userId: string; amount: number }

const groupByUser = (orders: Order[]): Map<string, number> => {
  const totals = new Map<string, number>()
  for (const order of orders) {
    totals.set(order.userId, (totals.get(order.userId) ?? 0) + order.amount)
  }
  return totals
}

console.log(groupByUser([
  { userId: 'u1', amount: 10 },
  { userId: 'u2', amount: 20 },
  { userId: 'u1', amount: 15 },
]))
