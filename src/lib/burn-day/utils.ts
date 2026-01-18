import * as cheerio from 'cheerio'
import type {Element} from 'domhandler'
import stringHash from 'string-hash'

export const normalizeText = (s: string) => s.replace(/\s+/g, ' ').trim()

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

export function getHeaderCells($table: cheerio.Cheerio<Element>, $: cheerio.CheerioAPI) {
  return $table
    .find('tr')
    .first()
    .find('th,td')
    .toArray()
    .map((el) => normalizeText($(el).text()))
}

export function stableId(input: string): string {
  return Math.abs(stringHash(input)).toString(36)
}

export function stableEntryId(webId: string, areaId: string, dayId: string): string {
  return stableId(`${webId}|${areaId}|${dayId}`)
}

export function parseYesNo(raw?: string): boolean | null {
  const s = raw?.trim().toLowerCase()
  if (!s) return null
  if (s.includes('yes')) return true
  if (s.includes('no')) return false
  return null
}
