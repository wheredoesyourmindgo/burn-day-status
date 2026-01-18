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

/**
 * Finds the first <table> whose first header cell (th or td)
 * matches the provided header text after normalization.
 *
 * @param $ - Cheerio root instance
 * @param headerText - Expected first header cell text (e.g. "AREA")
 * @returns A Cheerio-wrapped table element, or undefined if not found
 */
export function findTableByFirstHeader($: cheerio.CheerioAPI, headerText: string) {
  const target = normalizeText(headerText).toUpperCase()
  const tables = $('table').toArray()

  return tables
    .map((t) => $(t))
    .find((t) => {
      const firstHeaderText = normalizeText(t.find('th,td').first().text()).toUpperCase()
      return firstHeaderText === target
    })
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
 * @param raw - Raw cell text (e.g. "Yes", "No", "", undefined)
 * @returns true for "yes", false for "no", or null if indeterminate
 */
export function parseYesNo(raw?: string): boolean | null {
  const s = raw?.trim().toLowerCase()
  if (!s) return null
  if (s.includes('yes')) return true
  if (s.includes('no')) return false
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
 * Looks up a human-friendly display label for a burn area based on
 * an exact (case-insensitive) match against a provided labels map.
 *
 * This allows upstream area names to be normalized or improved for display
 * purposes without mutating the original source value.
 *
 * @param area - Raw area name as provided by the upstream data source
 * @param labels - Map of upstream area names to preferred display labels
 * @returns A mapped display label if one exists, otherwise undefined
 */
export function lookupAreaLabel(area: string, labels: Record<string, string>): string | undefined {
  const areaLower = area.toLowerCase()

  for (const [key, label] of Object.entries(labels)) {
    if (key.toLowerCase() === areaLower) {
      return label
    }
  }

  return undefined
}
