import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {format} from 'date-fns'
import {getMyAirBurnDaysStatus, getPlacerCountyBurnDaysStatus} from '@/lib/burn-day'
import {Check, X} from 'lucide-react'
import {type Metadata} from 'next'
import {localTz} from '@/lib/local-date'
import {toSentenceCase} from '@/lib/to-title-case'

const YupIcon = () => {
  return (
    <Check
      strokeWidth={2}
      className="inline-block h-5 w-5 align-middle text-green-500"
      aria-label="Yes"
    />
  )
}

const NopeIcon = () => {
  return (
    <X strokeWidth={2} className="inline-block h-5 w-5 align-middle text-red-500" aria-label="No" />
  )
}

export const metadata: Metadata = {
  title: 'Burn Day Information',
  description: 'Daily burn day information by area',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false
    }
  }
}

export default async function Info() {
  const {
    data: ncData,
    source: ncSource,
    updatedText: ncUpdatedText,
    days: ncDays
  } = await getMyAirBurnDaysStatus()

  const {
    data: pcData,
    source: pcSource,
    updatedText: pcUpdatedText,
    days: pcDays
  } = await getPlacerCountyBurnDaysStatus()

  const buildAreas = (data: typeof ncData) =>
    Array.from(
      new Map(
        data.map(({areaId, areaLabel, areaSource}) => [areaId, {areaId, areaLabel, areaSource}])
      ).values()
    ).sort((a, b) => a.areaSource.localeCompare(b.areaSource, undefined, {sensitivity: 'base'}))

  const buildByAreaDay = (data: typeof ncData) =>
    new Map<string, boolean | null>(data.map((d) => [`${d.areaId}|${d.dayId}`, d.value]))

  const ncAreas = buildAreas(ncData)
  const ncByAreaDay = buildByAreaDay(ncData)

  const pcAreas = buildAreas(pcData)
  const pcByAreaDay = buildByAreaDay(pcData)

  const correctedNcUpdatedText = ncUpdatedText
    ? ncUpdatedText.replace(/this page/i, 'this data source')
    : ncUpdatedText

  return (
    <main className="min-h-dvh space-y-10 bg-gradient-to-b from-slate-100 to-slate-200 p-6 text-slate-900">
      <header className="space-y-2 text-center">
        <h1 className="font-display text-3xl">Burn Day Information</h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-600">
          Detailed burn day status by area and date, provided by regional air quality districts.
        </p>
      </header>

      <section className="space-y-4 pt-8">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold">Northern Sierra Air Quality Management District</h2>
          <div className="text-sm text-slate-600">
            Source:{' '}
            <a className="underline" href={ncSource} target="_blank" rel="noreferrer">
              {ncSource}
            </a>
          </div>
        </header>

        <Table>
          <TableCaption>{toSentenceCase(correctedNcUpdatedText)}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Area</TableHead>
              {ncDays.map((d, idx) => (
                <TableHead key={d.id ?? `nc-day-${idx}`}>
                  {d.date ? format(d.date, 'MMM d', {in: localTz}) : d.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ncAreas.map((area) => (
              <TableRow key={area.areaId}>
                <TableCell className="align-top break-words whitespace-normal">
                  <a
                    className="underline-offset-2 hover:underline focus-visible:underline"
                    href={`/?areaId=${area.areaId}`}
                  >
                    {area.areaSource}
                  </a>
                </TableCell>

                {ncDays.map((day, idx) => {
                  const val = ncByAreaDay.get(`${area.areaId}|${day.id}`) ?? null
                  const displayVal =
                    val === true ? <YupIcon /> : val === false ? <NopeIcon /> : 'n/a'
                  return <TableCell key={`${area.areaId}-${idx}`}>{displayVal}</TableCell>
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="space-y-4 pt-8">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold">Placer County Air Pollution Control District</h2>
          <div className="text-sm text-slate-600">
            Source:{' '}
            <a className="underline" href={pcSource} target="_blank" rel="noreferrer">
              {pcSource}
            </a>
          </div>
        </header>

        <Table>
          <TableCaption>{pcUpdatedText}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Area</TableHead>
              {pcDays.map((d, idx) => (
                <TableHead key={d.id ?? `pc-day-${idx}`}>
                  {d.date ? format(d.date, 'MMM d', {in: localTz}) : d.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pcAreas.map((area) => (
              <TableRow key={area.areaId}>
                <TableCell className="align-top break-words whitespace-normal">
                  <a
                    className="underline-offset-2 hover:underline focus-visible:underline"
                    href={`/?areaId=${area.areaId}`}
                  >
                    {area.areaSource}
                  </a>
                </TableCell>

                {pcDays.map((day, idx) => {
                  const val = pcByAreaDay.get(`${area.areaId}|${day.id}`) ?? null
                  const displayVal =
                    val === true ? <YupIcon /> : val === false ? <NopeIcon /> : 'n/a'
                  return <TableCell key={`${area.areaId}-${idx}`}>{displayVal}</TableCell>
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </main>
  )
}
