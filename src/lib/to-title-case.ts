const SMALL_WORDS = new Set(['and', 'or', 'the', 'of', 'in', 'on', 'at', 'for', 'to', 'with'])

/**
 * Normalizes common am/pm variants (e.g. "AM", "a.m.", "pm") to
 * a consistent lowercase dotted form ("a.m." / "p.m.").
 *
 * @param word - A single word token from the input string
 * @returns Normalized meridiem string, or null if not a meridiem token
 */
function normalizeMeridiem(word: string): string | null {
  const lower = word.toLowerCase().replace(/\./g, '')
  if (lower === 'am') return 'a.m.'
  if (lower === 'pm') return 'p.m.'
  return null
}

/**
 * Converts a string to title case, capitalizing significant words
 * while keeping common short words (e.g. "and", "of", "the") lowercase,
 * except when they appear at the start.
 *
 * Also normalizes am/pm tokens and preserves numeric values.
 *
 * @param input - Input string to transform
 * @returns Title-cased string suitable for headings or labels
 */
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

/**
 * Converts a string to sentence case: capitalizes the first character
 * and lowercases the remainder of the sentence.
 *
 * Also normalizes am/pm tokens to a consistent dotted form.
 *
 * @param input - Input string to transform
 * @returns Sentence-cased string suitable for prose or descriptions
 */
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
