const pairs = new Map<string, string>([[')', '('], [']', '['], ['}', '{']])

const isBalanced = (input: string): boolean => {
  const stack: string[] = []
  for (const char of input) {
    if (['(', '[', '{'].includes(char)) stack.push(char)
    else if (pairs.has(char) && stack.pop() !== pairs.get(char)) return false
  }
  return stack.length === 0
}

console.log(isBalanced('(())[]{}'))
