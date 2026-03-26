const topK = (values: number[], k: number): number[] => {
  return [...values].sort((a, b) => b - a).slice(0, k)
}

console.log(topK([9, 1, 12, 7, 3, 20], 3))
