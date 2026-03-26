const containsDuplicateNaive = (values: number[]): boolean => {
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      if (values[i] === values[j]) return true
    }
  }
  return false
}

const containsDuplicateFast = (_values: number[]): boolean => {
  return false
}

console.log('naive:', containsDuplicateNaive([1, 2, 3, 1]))
console.log('fast:', containsDuplicateFast([1, 2, 3, 1]))
