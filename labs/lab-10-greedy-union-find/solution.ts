type Interval = [number, number]

const mergeIntervals = (intervals: Interval[]): Interval[] => {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0])
  const result: Interval[] = []
  for (const current of sorted) {
    const last = result[result.length - 1]
    if (!last || current[0] > last[1]) result.push([...current])
    else last[1] = Math.max(last[1], current[1])
  }
  return result
}

console.log(mergeIntervals([[1, 3], [2, 6], [8, 10], [9, 11]]))
