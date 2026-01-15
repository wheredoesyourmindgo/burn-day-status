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

const YupIcon = () => {
  return (
    <Check
      strokeWidth={2}
      className="h-5 w-5 text-green-500 inline-block align-middle"
      aria-label="Yes"
    />
  )
}

const NopeIcon = () => {
  return (
    <X
      strokeWidth={2}
      className="h-5 w-5 text-red-500 inline-block align-middle"
      aria-label="No"
    />
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

  const areas = Array.from(new Set(data.map((d) => d.area))).sort()

  const byAreaDay = new Map<string, boolean | null>(
    data.map((d) => [`${d.area}|${d.dayId}`, d.value])
  )

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        {/* <Button variant="outline">My Button</Button> */}

        <div className="text-sm text-muted-foreground">
          Source:{' '}
          <a
            className="underline"
            href={source}
            target="_blank"
            rel="noreferrer"
          >
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
                  {d.date ? format(d.date, 'MMM d') : d.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {areas.map((area) => (
              <TableRow key={area}>
                <TableCell className="whitespace-normal break-words align-top">
                  {area}
                </TableCell>

                {days.map((day, idx) => {
                  const val = byAreaDay.get(`${area}|${day.id}`) ?? null

                  const displayVal =
                    val === true ? (
                      <YupIcon />
                    ) : val === false ? (
                      <NopeIcon />
                    ) : (
                      'n/a'
                    )

                  return (
                    <TableCell key={`${area}-${idx}`}>{displayVal}</TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}
