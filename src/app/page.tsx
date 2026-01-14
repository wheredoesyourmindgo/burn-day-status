// import {Button} from '@/components/ui/button'
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
import {LocalDate} from '@/lib/local-date'

export default async function Home() {
  const data = await getBurnDayStatus()
  console.log('Burn day data:', JSON.stringify(data, null, 2))
  // source, updatedText, headers, rows
  console.log('Headers:', data.headers)

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        {/* <Button variant="outline">My Button</Button> */}

        <div className="text-sm text-muted-foreground">
          Source:{' '}
          <a
            className="underline"
            href={data.source}
            target="_blank"
            rel="noreferrer"
          >
            {data.source}
          </a>
        </div>
      </div>

      {/* {data.updatedText ? (
        <p className="text-sm text-muted-foreground">{data.updatedText}</p>
      ) : null} */}

      <div className="overflow-x-auto">
        <Table>
          <TableCaption>{data.updatedText}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Area</TableHead>

              {data.headers.map((h) => (
                <TableHead key={h}>
                  {format(h ?? new LocalDate(), 'MMM d')}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((r) => (
              <TableRow key={r.area}>
                <TableCell>{r.area}</TableCell>
                {data.headers.map((_, idx) => (
                  <TableCell key={`${r.area}-${idx}`}>
                    {r.data[idx]?.value ?? '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}
