const minSubArrayLen = (target: number, values: number[]): number => {
  let left = 0
  let sum = 0
  let best = Number.POSITIVE_INFINITY

  for (let right = 0; right < values.length; right++) {
    sum += values[right]
    while (sum >= target) {
      best = Math.min(best, right - left + 1)
      sum -= values[left]
      left++
    }
  }
  return Number.isFinite(best) ? best : 0
}

console.log(minSubArrayLen(7, [2, 3, 1, 2, 4, 3]))
