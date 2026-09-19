import * as cheerio from 'cheerio'
import type {Element} from 'domhandler'
import stringHash from 'string-hash'

/**
 * Normalizes text by collapsing all whitespace into single spaces
 * and trimming leading/trailing whitespace.
 *
 * Useful for making scraped HTML text consistent before parsing
 * or performing comparisons.
 */
export const normalizeText = (s: string) => s.replace(/\s+/g, ' ').trim()

/** Escapes a string for safe embedding inside a RegExp. */
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Reduces a label to a loose comparison key: lowercased, parentheticals
 * removed, and all non-alphanumeric runs collapsed to single spaces.
 *
 * Lets upstream punctuation/qualifier churn (e.g. "Plumas County (Outside
 * Quincy Area)" vs "Plumas County (including the Quincy area...)") still
 * compare equal on the part that actually identifies the row.
 */
const looseKey = (s: string) =>
  normalizeText(s)
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/**
 * Returns true when a table cell reads as the expected header.
 *
 * Deliberately permissive: upstream frequently appends qualifiers to the
 * header cell (e.g. "AREA (NOTE: NEW ZONES BELOW)"), which an exact-equality
 * check would reject.
 */
function isHeaderMatch(cellText: string, headerText: string): boolean {
  const cell = normalizeText(cellText).toUpperCase()
  const target = normalizeText(headerText).toUpperCase()

  if (!cell || !target) return false
  if (cell === target) return true

  // "AREA" should match "AREA (NOTE: ...)" but not "AREAS SERVED BY ..."
  return new RegExp(`^${escapeRegExp(target)}\\b`).test(cell)
}

/**
 * Returns true when a table looks like a data grid we can parse:
 * at least a header row plus one data row, and at least two columns.
 */
function isPlausibleDataTable($table: cheerio.Cheerio<Element>, $: cheerio.CheerioAPI): boolean {
  const rows = $table.find('tr').toArray()
  if (rows.length < 2) return false

  const firstRowCellCount = $(rows[0]).find('th,td').length
  return firstRowCellCount >= 2
}

/**
 * Finds the <table> whose first header cell (th or td) matches the provided
 * header text.
 *
 * Matching is intentionally loose (see {@link isHeaderMatch}). If no table
 * matches by header, falls back to the largest plausible data table on the
 * page so that a cosmetic upstream header edit doesn't break extraction
 * outright.
 *
 * @param $ - Cheerio root instance
 * @param headerText - Expected first header cell text (e.g. "AREA")
 * @returns A Cheerio-wrapped table element, or undefined if none is usable
 */
export function findTableByFirstHeader($: cheerio.CheerioAPI, headerText: string) {
  const tables = $('table')
    .toArray()
    .map((t) => $(t))

  const byHeader = tables.find((t) => isHeaderMatch(t.find('th,td').first().text(), headerText))

  if (byHeader) return byHeader

  // Fallback: the biggest table that structurally looks like a data grid.
  return tables
    .filter((t) => isPlausibleDataTable(t, $))
    .sort((a, b) => b.find('tr').length - a.find('tr').length)[0]
}

/**
 * Extracts and normalizes the header cell labels from the first row
 * of a table (th or td elements).
 *
 * @param $table - Cheerio-wrapped table element
 * @param $ - Cheerio root instance
 * @returns An array of normalized header labels
 */
export function getHeaderCells($table: cheerio.Cheerio<Element>, $: cheerio.CheerioAPI) {
  return $table
    .find('tr')
    .first()
    .find('th,td')
    .toArray()
    .map((el) => normalizeText($(el).text()))
}

/**
 * Generates a short, deterministic, non-negative base36 identifier
 * from the provided input string.
 *
 * Intended for creating stable IDs from human-readable values.
 */
export function stableId(input: string): string {
  return Math.abs(stringHash(input)).toString(36)
}

/**
 * Generates a stable identifier for a burn-day entry based on
 * its source, area, and day identifiers.
 *
 * @param webSource - URL of the data source
 * @param areaSource - Exact upstream / canonical text for the burn area
 * @param dayId - Identifier for the day/column
 */
export function stableEntryId(webSource: string, areaSource: string, dayId: string): string {
  return stableId(`${webSource}|${areaSource}|${dayId}`)
}

/**
 * Generates a stable identifier for a burn-day area based on
 * its source and area identifiers.
 *
 * @param webSource - URL of the data source
 * @param areaSource - Exact upstream / canonical text for the burn area
 */
export function stableAreaId(webSource: string, areaSource: string): string {
  return stableId(`${webSource}|${areaSource}`)
}

/**
 * Parses a textual cell value into a boolean burn-day status.
 *
 * Matches on whole words so that prose cells ("Not a burn day", "Nothing
 * posted") can't be mistaken for a bare "no" via substring matching.
 *
 * @param raw - Raw cell text (e.g. "Yes", "No", "", undefined)
 * @returns true for "yes", false for "no", or null if indeterminate
 */
export function parseYesNo(raw?: string): boolean | null {
  const s = normalizeText(raw ?? '').toLowerCase()
  if (!s) return null
  if (/\byes\b/.test(s)) return true
  if (/\bno\b/.test(s)) return false
  return null
}

/**
 * Fetches an HTML document and loads it into Cheerio.
 *
 * Designed for Next.js server environments where `fetch` supports caching via
 * the `next.revalidate` option.
 *
 * @param url - URL to fetch
 * @param opts - Fetch options
 * @param opts.revalidateSeconds - Cache revalidation window in seconds
 * @param opts.userAgent - Optional user-agent header value
 * @returns Cheerio root instance for the fetched HTML
 * @throws If the upstream fetch fails (non-2xx response)
 */
export async function fetchCheerio(
  url: string,
  opts: {revalidateSeconds: number; userAgent?: string}
): Promise<cheerio.CheerioAPI> {
  const res = await fetch(url, {
    headers: opts.userAgent ? {'user-agent': opts.userAgent} : undefined,
    next: {revalidate: opts.revalidateSeconds}
  })

  if (!res.ok) {
    throw new Error(`Upstream fetch failed: ${res.status} ${res.statusText}`)
  }

  const html = await res.text()
  return cheerio.load(html)
}

/**
 * Looks up a human-friendly display label for a burn area.
 *
 * Tries an exact (case-insensitive) match first, then falls back to a loose
 * comparison that ignores parentheticals and punctuation, so that upstream
 * rewording of a zone name doesn't silently drop its friendly label.
 *
 * @param area - Raw area name as provided by the upstream data source
 * @param labels - Map of upstream area names to preferred display labels
 * @returns A mapped display label if one exists, otherwise undefined
 */
export function lookupAreaLabel(area: string, labels: Record<string, string>): string | undefined {
  const areaLower = normalizeText(area).toLowerCase()
  const entries = Object.entries(labels)

  for (const [key, label] of entries) {
    if (normalizeText(key).toLowerCase() === areaLower) return label
  }

  const areaKey = looseKey(area)
  if (!areaKey) return undefined

  for (const [key, label] of entries) {
    if (looseKey(key) === areaKey) return label
  }

  // Last resort: one name is a leading subset of the other, e.g.
  // "Plumas County" vs "Plumas County Outside Quincy Area".
  for (const [key, label] of entries) {
    const k = looseKey(key)
    if (!k) continue
    if (areaKey.startsWith(`${k} `) || k.startsWith(`${areaKey} `)) return label
  }

  return undefined
}
