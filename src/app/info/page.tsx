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
import {getBurnDayStatus} from '@/lib/burn-day'
import {Check, X} from 'lucide-react'
import {type Metadata} from 'next'
import {localTz} from '@/lib/local-date'

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
  const {data, source, updatedText, days} = await getBurnDayStatus()
  // console.log('Burn day data:', JSON.stringify(data, null, 2))
  // console.log('Days:', days)
  // console.log(data)

  const areas = Array.from(
    new Map(
      data.map(({areaId, areaLabel, areaSource}) => [areaId, {areaId, areaLabel, areaSource}])
    ).values()
  ).sort((a, b) => a.areaLabel.localeCompare(b.areaLabel))

  const byAreaDay = new Map<string, boolean | null>(
    data.map((d) => [`${d.areaId}|${d.dayId}`, d.value])
  )

  return (
    <main className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        {/* <Button variant="outline">My Button</Button> */}

        <div className="text-muted-foreground text-sm">
          Source:{' '}
          <a className="underline" href={source} target="_blank" rel="noreferrer">
            {source}
          </a>
        </div>
      </div>

      {/* {updatedText ? (
        <p className="text-sm text-muted-foreground">{updatedText}</p>
      ) : null} */}

      <div>
        <Table>
          <TableCaption>{updatedText}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Area</TableHead>

              {days.map((d, idx) => (
                <TableHead key={d.id ?? `day-${idx}`}>
                  {d.date ? format(d.date, 'MMM d', {in: localTz}) : d.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {areas.map((area) => (
              <TableRow key={area.areaId}>
                <TableCell className="align-top break-words whitespace-normal">
                  <a
                    className="underline-offset-2 hover:underline focus-visible:underline"
                    href={`/?areaId=${area.areaId}`}
                  >
                    {area.areaSource}
                  </a>
                </TableCell>

                {days.map((day, idx) => {
                  const val = byAreaDay.get(`${area.areaId}|${day.id}`) ?? null

                  const displayVal =
                    val === true ? <YupIcon /> : val === false ? <NopeIcon /> : 'n/a'

                  return <TableCell key={`${area.areaId}-${idx}`}>{displayVal}</TableCell>
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}
