import * as cheerio from 'cheerio'
import * as chrono from 'chrono-node'
import {LOCAL_TIMEZONE, LocalDate} from '@/lib/local-date'
import {isDate} from 'date-fns'
import {type Day, type Entry} from './types'
import {
  findTableByFirstHeader,
  getHeaderCells,
  parseYesNo,
  stableAreaId,
  stableEntryId,
  stableId
} from './utils'

const WEB_LABEL = 'Placer County Air Pollution Control District'
const WEB_SOURCE = 'https://placerair.org/1671/Burn-Days'
const WEB_FETCH_URL = 'https://itwebservices.placer.ca.gov/apcdbdi/home/iframe'

const OMIT_COLUMNS = ['permit']

const AREA_LABELS: Record<string, string> = {
  'Western Placer County (West of Cisco Grove)': 'Western Placer County',
  'Granite Bay (Zip Codes 95746 & 95661) Residential': 'Granite Bay',
  'City of Auburn': 'Auburn',
  'Eastern Placer County (East of Cisco Grove)': 'Eastern Placer County',
  'Eastern Placer County Truckee Fire District': 'Truckee Fire District',
  'Lake Tahoe (North Shore Placer County)': 'North Shore, Lake Tahoe'
}

export async function getBurnDayStatus(): Promise<{
  source: string
  updatedText?: string
  days: Day[]
  data: Entry[]
}> {
  // Cache it. This page updates daily, so hourly is plenty (tune as you like).
  const res = await fetch(WEB_FETCH_URL, {
    headers: {'user-agent': 'burn-day-status/1.0'},
    next: {revalidate: 60 * 60}
  })

  if (!res.ok) {
    throw new Error(`Upstream fetch failed: ${res.status} ${res.statusText}`)
  }

  const html = await res.text()
  const $ = cheerio.load(html)

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

  const days: Day[] = headerCells
    .map((label, idx) => ({label, idx}))
    .slice(1)
    .filter(({label, idx}) => label && !omitIndexes.has(idx))
    .map(({label}, dayIdx) => {
      const date = chrono.parseDate(label, {
        instant: new LocalDate(),
        timezone: LOCAL_TIMEZONE
      })

      const id = isDate(date) ? date.toISOString().slice(0, 10) : `col-${dayIdx}`

      return {id, label, date}
    })

  const data: Entry[] = []

  // Data rows: all rows after the header row
  table
    .find('tr')
    .slice(1)
    .each((_, tr) => {
      const cells = $(tr)
        .find('th,td')
        .toArray()
        .map((el) => $(el).text().replace(/\s+/g, ' ').trim())

      const areaCell = cells[0]?.trim()
      if (!areaCell) return
      if (cells.length < 2) return

      const areaSource = areaCell
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim()

      // Ignore non-row junk (e.g., repeated headers)
      if (areaSource.toUpperCase() === 'AREA') return

      const areaLabel = lookupAreaLabel(areaSource) ?? areaSource

      const webSource = WEB_SOURCE.replace(/\s+/g, ' ') // Normalize spaces
        .trim()

      const webId = stableId(webSource)

      const areaId = stableAreaId(webSource, areaSource)

      days.forEach((day, i) => {
        const colIndex = headerCells.findIndex((_, idx) => !omitIndexes.has(idx) && idx > 0) + i

        const raw = cells[colIndex]
        const value = parseYesNo(raw)

        if (!day.id) return

        const id = stableEntryId(webId, areaId, day.id)

        data.push({
          id,
          areaId,
          areaSource,
          areaLabel,
          dayId: day.id,
          value,
          webId,
          webSource,
          webLabel: WEB_LABEL
        })
      })
    })

  // Pull updated text from the whole document (not the table)
  // const bodyText = $('body').text().replace(/\s+/g, ' ')
  // const updatedTextMatch = bodyText.match(//i)
  // const updatedText = updatedTextMatch?.[0]

  return {source: WEB_SOURCE, updatedText: '', days, data}
}

function lookupAreaLabel(area: string): string | undefined {
  const areaLower = area.toLowerCase()

  for (const [key, label] of Object.entries(AREA_LABELS)) {
    if (key.toLowerCase() === areaLower) {
      return label
    }
  }

  return undefined
}
