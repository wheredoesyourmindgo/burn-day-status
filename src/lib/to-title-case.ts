const SMALL_WORDS = new Set(['and', 'or', 'the', 'of', 'in', 'on', 'at', 'for', 'to', 'with'])

function normalizeMeridiem(word: string): string | null {
  const lower = word.toLowerCase().replace(/\./g, '')
  if (lower === 'am') return 'a.m.'
  if (lower === 'pm') return 'p.m.'
  return null
}

export default function toTitleCase(input = ''): string {
  return input
    .trim()
    .split(/\s+/)
    .map((rawWord, i) => {
      // Preserve pure numbers
      if (/^\d+$/.test(rawWord)) return rawWord

      // Normalize am/pm
      const meridiem = normalizeMeridiem(rawWord)
      if (meridiem) return meridiem

      const word = rawWord.toLowerCase()

      // Small words (except at start)
      if (i !== 0 && SMALL_WORDS.has(word)) {
        return word
      }

      // Default capitalization
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

export function toSentenceCase(input = ''): string {
  const trimmed = input.trim()
  if (!trimmed) return ''

  const words = trimmed.split(/\s+/).map((rawWord) => {
    // Normalize am/pm if present
    const meridiem = normalizeMeridiem(rawWord)
    if (meridiem) return meridiem

    return rawWord.toLowerCase()
  })

  const sentence = words.join(' ')
  return sentence.charAt(0).toUpperCase() + sentence.slice(1)
}
