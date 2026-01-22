import * as chrono from 'chrono-node'
import {LOCAL_TIMEZONE, LocalDate} from '@/lib/local-date'
import {isDate} from 'date-fns'
import type {BurnDayStatusResult, Day, Entry} from './types'
import {
  fetchCheerio,
  findTableByFirstHeader,
  getHeaderCells,
  lookupAreaLabel,
  normalizeText,
  parseYesNo,
  stableAreaId,
  stableEntryId,
  stableId
} from './utils'

const WEB_KEY = 'ca-nc-air-dist' // Stable key for IDs
const WEB_LABEL = 'Northern Sierra Air Quality Management District'
const WEB_SOURCE = 'https://www.myairdistrict.com/burn-day-status'
const WEB_FETCH_URL = 'https://www.myairdistrict.com/burn-day-status'

const OMIT_COLUMNS: string[] = []

const AREA_LABELS: Record<string, string> = {
  'Downtown and East Quincy': 'Quincy',
  'Plumas County (Outside Quincy Area)': 'Plumas County',
  'Sierra County': 'Sierra County',
  'Town of Truckee': 'Truckee',
  'Western Nevada County (West of Norden, Including Soda Springs)': 'Western Nevada County'
}

export async function getBurnDayStatus(): Promise<BurnDayStatusResult> {
  // Get Cheerio-loaded document with caching
  const $ = await fetchCheerio(WEB_FETCH_URL, {
    userAgent: 'burn-day-status/1.0',
    revalidateSeconds: 60 * 60
  })

  // Parse the actual table structure instead of relying on body text.
  // The page renders the burn-day info as an HTML table; extracting from text loses structure
  // and makes headers/rows hard to align.

  // Find the table that contains the "Area" header.
  const table = findTableByFirstHeader($, 'Area')

  if (!table) {
    throw new Error('Could not find burn-day table (missing Area header cell)')
  }

  // Header cells: use the first row (th or td)
  const headerCells = getHeaderCells(table, $)

  const omitIndexes = new Set(
    headerCells
      .map((label, idx) => ({label, idx}))
      .filter(({label}) => OMIT_COLUMNS.some((omit) => label.toLowerCase().includes(omit)))
      .map(({idx}) => idx)
  )

  const includedColIndexes = headerCells
    .map((_, idx) => idx)
    .slice(1) // skip Area column index 0
    .filter((idx) => !omitIndexes.has(idx))

  const days: Day[] = headerCells
    .slice(1)
    .filter(Boolean)
    .map((label, idx) => {
      const date = chrono.parseDate(label, {
        instant: new LocalDate(),
        timezone: LOCAL_TIMEZONE
      })

      const id = isDate(date) ? date.toISOString().slice(0, 10) : `col-${idx}`

      return {id, label, date}
    })

  const data: Entry[] = []

  const webId = stableId(WEB_KEY)

  // Data rows: all rows after the header row
  table
    .find('tr')
    .slice(1)
    .each((_, tr) => {
      const cells = $(tr)
        .find('th,td')
        .toArray()
        .map((el) => normalizeText($(el).text()))

      const areaCell = cells[0]?.trim()
      if (!areaCell) return
      if (cells.length < 2) return

      const areaSource = areaCell
        .replace(/\(see map link below\)/i, '') // Remove parenthetical
        .trim()

      // Ignore non-row junk (e.g., repeated headers)
      if (areaSource.toUpperCase() === 'AREA') return

      const areaLabel = lookupAreaLabel(areaSource, AREA_LABELS) ?? areaSource

      const areaId = stableAreaId(WEB_KEY, areaSource)

      days.forEach((day, i) => {
        const colIndex = includedColIndexes[i]
        const raw = colIndex != null ? cells[colIndex] : undefined

        const value = parseYesNo(raw)

        const id = stableEntryId(WEB_KEY, areaSource, day.id)

        data.push({
          id,
          areaId,
          areaSource,
          areaLabel,
          dayId: day.id,
          value,
          webId,
          webSource: WEB_FETCH_URL,
          webLabel: WEB_LABEL
        })
      })
    })

  // Pull updated text from the whole document (not the table)
  const bodyText = $('body').text().replace(/\s+/g, ' ')
  const updatedTextMatch = bodyText.match(/This page is updated AFTER 3 p\.m\.[^\.]*daily/i)
  const updatedText = updatedTextMatch?.[0]

  return {source: WEB_SOURCE, updatedText, days, data}
}
