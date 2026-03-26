const containsDuplicateFast = (values: number[]): boolean => {
  const seen = new Set<number>()
  for (const value of values) {
    if (seen.has(value)) return true
    seen.add(value)
  }
  return false
}

console.log(containsDuplicateFast([1, 2, 3, 1]))
