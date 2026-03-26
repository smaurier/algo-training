const climbStairs = (n: number): number => {
  const memo = new Map<number, number>()
  const solve = (steps: number): number => {
    if (steps <= 2) return steps
    if (memo.has(steps)) return memo.get(steps)!
    const value = solve(steps - 1) + solve(steps - 2)
    memo.set(steps, value)
    return value
  }
  return solve(n)
}

console.log(climbStairs(5))
