const combinations = (values: number[], k: number): number[][] => {
  const result: number[][] = []
  const path: number[] = []

  const dfs = (start: number) => {
    if (path.length === k) {
      result.push([...path])
      return
    }
    for (let i = start; i < values.length; i++) {
      path.push(values[i])
      dfs(i + 1)
      path.pop()
    }
  }

  dfs(0)
  return result
}

console.log(combinations([1, 2, 3, 4], 2))
