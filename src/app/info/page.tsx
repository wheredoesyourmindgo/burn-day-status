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
import {getCaNcBurnDaysStatus, getCaPcBurnDaysStatus} from '@/lib/burn-day'
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
    data: caNcData,
    source: caNcSource,
    updatedText: caNcUpdatedText,
    days: caNcDays
  } = await getCaNcBurnDaysStatus()

  const {
    data: caPcData,
    source: caPcSource,
    updatedText: caPcUpdatedText,
    days: caPcDays
  } = await getCaPcBurnDaysStatus()

  const buildAreas = (data: typeof caNcData) =>
    Array.from(
      new Map(
        data.map(({areaId, areaLabel, areaSource}) => [areaId, {areaId, areaLabel, areaSource}])
      ).values()
    ).sort((a, b) => a.areaSource.localeCompare(b.areaSource, undefined, {sensitivity: 'base'}))

  const buildByAreaDay = (data: typeof caNcData) =>
    new Map<string, boolean | null>(data.map((d) => [`${d.areaId}|${d.dayId}`, d.value]))

  const caNcAreas = buildAreas(caNcData)
  const caNcByAreaDay = buildByAreaDay(caNcData)

  const caPcAreas = buildAreas(caPcData)
  const caPcByAreaDay = buildByAreaDay(caPcData)

  const correctedNcUpdatedText = caNcUpdatedText
    ? caNcUpdatedText.replace(/this page/i, 'this data source')
    : caNcUpdatedText

  return (
    <main className="min-h-dvh space-y-10 bg-gradient-to-b from-slate-100 to-slate-200 p-6 text-slate-900">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl">Burn Day Information</h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-600">
          Detailed burn day status by area and date, provided by regional air quality districts.
        </p>
      </header>

      <section className="space-y-4 pt-4 sm:pt-8">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold">Northern Sierra Air Quality Management District</h2>
          <div className="text-sm text-slate-600">
            Source:{' '}
            <a className="underline" href={caNcSource} target="_blank" rel="noreferrer">
              {caNcSource}
            </a>
          </div>
        </header>

        <Table>
          <TableCaption>{toSentenceCase(correctedNcUpdatedText)}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Area</TableHead>
              {caNcDays.map((d, idx) => (
                <TableHead key={d.id ?? `nc-day-${idx}`}>
                  {d.date ? format(d.date, 'MMM d', {in: localTz}) : d.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {caNcAreas.map((area) => (
              <TableRow key={area.areaId}>
                <TableCell className="align-top break-words whitespace-normal">
                  <a
                    className="underline-offset-2 hover:underline focus-visible:underline"
                    href={`/?areaId=${area.areaId}`}
                  >
                    {area.areaSource}
                  </a>
                </TableCell>

                {caNcDays.map((day, idx) => {
                  const val = caNcByAreaDay.get(`${area.areaId}|${day.id}`) ?? null
                  const displayVal =
                    val === true ? <YupIcon /> : val === false ? <NopeIcon /> : 'n/a'
                  return <TableCell key={`${area.areaId}-${idx}`}>{displayVal}</TableCell>
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="space-y-4 pt-4 sm:pt-8">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold">Placer County Air Pollution Control District</h2>
          <div className="text-sm text-slate-600">
            Source:{' '}
            <a className="underline" href={caPcSource} target="_blank" rel="noreferrer">
              {caPcSource}
            </a>
          </div>
        </header>

        <Table>
          <TableCaption>{caPcUpdatedText}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Area</TableHead>
              {caPcDays.map((d, idx) => (
                <TableHead key={d.id ?? `pc-day-${idx}`}>
                  {d.date ? format(d.date, 'MMM d', {in: localTz}) : d.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {caPcAreas.map((area) => (
              <TableRow key={area.areaId}>
                <TableCell className="align-top break-words whitespace-normal">
                  <a
                    className="underline-offset-2 hover:underline focus-visible:underline"
                    href={`/?areaId=${area.areaId}`}
                  >
                    {area.areaSource}
                  </a>
                </TableCell>

                {caPcDays.map((day, idx) => {
                  const val = caPcByAreaDay.get(`${area.areaId}|${day.id}`) ?? null
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
