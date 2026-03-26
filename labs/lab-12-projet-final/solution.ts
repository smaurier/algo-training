export const uniqueSorted = (values: number[]): number[] => {
  return [...new Set(values)].sort((a, b) => a - b)
}

export const topThree = (values: number[]): number[] => {
  return [...values].sort((a, b) => b - a).slice(0, 3)
}

console.log(uniqueSorted([4, 1, 4, 2, 2, 9]))
console.log(topThree([4, 1, 4, 2, 2, 9]))
