import * as cheerio from 'cheerio'

export type BurnDayValue = {
  date: string
  value: string
}

export type BurnDayRow = {
  area: string
  data: BurnDayValue[]
}

export async function getBurnDayStatus(): Promise<{
  source: string
  updatedText?: string
  headers: string[]
  rows: BurnDayRow[]
}> {
  const source = 'https://www.myairdistrict.com/burn-day-status'

  // Cache it. This page updates daily, so hourly is plenty (tune as you like).
  const res = await fetch(source, {
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

  // Find the table that contains the "AREA" header.
  const tables = $('table').toArray()
  const table = tables
    .map((t) => $(t))
    .find((t) => t.find('th,td').first().text().trim().toUpperCase() === 'AREA')

  if (!table) {
    throw new Error('Could not find burn-day table (missing AREA header cell)')
  }

  // Header cells: use the first row (th or td)
  const headerCells = table
    .find('tr')
    .first()
    .find('th,td')
    .toArray()
    .map((el) => $(el).text().replace(/\s+/g, ' ').trim())

  // First header cell should be AREA; remaining are day columns
  const headers = headerCells.slice(1).filter(Boolean)

  const rows: BurnDayRow[] = []

  // Data rows: all rows after the header row
  table
    .find('tr')
    .slice(1)
    .each((_, tr) => {
      const cells = $(tr)
        .find('th,td')
        .toArray()
        .map((el) => $(el).text().replace(/\s+/g, ' ').trim())
        .filter((c) => c.length > 0)

      if (cells.length < 2) return

      const area = cells[0]

      const data = headers.map((header, i) => ({
        date: header,
        value: cells[i + 1] ?? ''
      }))
      const filteredData = data.filter((v) => v.date && v.value)
      // Ignore non-row junk (e.g., repeated headers)
      if (area.toUpperCase() === 'AREA') return

      rows.push({area, data: filteredData})
    })

  // Pull updated text from the whole document (not the table)
  const bodyText = $('body').text().replace(/\s+/g, ' ')
  const updatedTextMatch = bodyText.match(
    /This page is updated AFTER 3 p\.m\.[^\.]*daily/i
  )
  const updatedText = updatedTextMatch?.[0]

  return {source, updatedText, headers, rows}
}
