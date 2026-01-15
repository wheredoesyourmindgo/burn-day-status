import {FlameKindling, Wind, Calendar, MapPinned} from 'lucide-react'
import type {Metadata} from 'next'
import {isSameDay} from 'date-fns'
import {LocalDate} from '@/lib/local-date'
import {getBurnDayStatus} from '@/lib/burn-day'
import {format} from 'date-fns'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'

export const metadata: Metadata = {
  title: 'Burn Day Status',
  description: 'Daily burn day status'
}

const CalendarToday = ({date}: {date: Date}) => {
  const human = format(date, 'EEEE, MMMM do, yyyy')
  const dayNum = format(date, 'd')
  const monthAbbrev = format(date, 'MMM')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group relative inline-flex items-center justify-center rounded-md focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none"
          aria-label={`Show date: ${human}`}
        >
          <Calendar
            className="h-16 w-16 text-white/85 transition-colors transition-transform duration-150 ease-out group-hover:scale-105 group-hover:text-white group-active:scale-95"
            strokeWidth={1}
          />
          <span className="font-display pointer-events-none absolute top-[24px] left-[31px] -translate-x-1/2 text-[12px] font-semibold tracking-wide text-white/85 uppercase transition-colors transition-transform duration-150 ease-out group-hover:scale-105 group-hover:text-white group-active:scale-95">
            {monthAbbrev}
          </span>
          <span className="pointer-events-none absolute inset-0 flex translate-y-[15px] items-center justify-center text-base font-extrabold text-white/85 transition-colors transition-transform duration-150 ease-out group-hover:scale-105 group-hover:text-white group-active:scale-95">
            {dayNum}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="mx-3 w-auto px-3 py-2 text-sm">
        {human}
      </PopoverContent>
    </Popover>
  )
}

export default async function Home() {
  const {days, data, source} = await getBurnDayStatus()

  const areaKey = 'western nevada county'
  const today = new LocalDate()

  // Find the Day object representing today (already parsed by your lib)
  const todayDay = days.find((d) => d.date && isSameDay(d.date, today))

  // Find the Entry for Western Nevada County for today’s column
  const todayEntry =
    todayDay &&
    data.find(
      (e) => e.area.toLowerCase().includes(areaKey) && e.dayId === todayDay.id
    )

  const burnValue = todayEntry?.value ?? null
  const isBurnDay = burnValue === true
  const isKnown = burnValue !== null

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center px-6 text-center text-white ${
        isBurnDay
          ? 'bg-gradient-to-b from-red-500 to-red-700'
          : 'bg-gradient-to-b from-sky-400 to-sky-600'
      }`}
    >
      <div className="mb-5">
        {isBurnDay ? (
          <FlameKindling
            className="h-32 w-32 transition-transform hover:scale-105 active:scale-90"
            strokeWidth={1.25}
          />
        ) : (
          <Wind
            className="h-32 w-32 transition-transform hover:scale-105 active:scale-90"
            strokeWidth={1.25}
          />
        )}
      </div>

      <h1 className="font-display mb-6 text-4xl">
        {isBurnDay ? (
          "It's a Burn Day!"
        ) : (
          <>
            Today is <span className="italic">NOT</span> a Burn Day.
          </>
        )}
      </h1>

      {todayEntry?.areaLabel ? (
        <p className="inline-flex items-center gap-2 text-base opacity-90">
          <MapPinned className="h-5 w-5 shrink-0" />
          <span>{todayEntry?.areaLabel}</span>
        </p>
      ) : null}

      {!isKnown ? (
        <p className="mt-4 text-sm opacity-80">
          Today’s status hasn’t been posted yet.
        </p>
      ) : null}

      <div className="fixed top-4 right-4 z-5">
        <CalendarToday date={(todayDay?.date ?? today) as Date} />
      </div>

      <div className="fixed right-4 bottom-4 text-xs text-white/75">
        Source:{' '}
        <a
          className="underline underline-offset-3 hover:text-white"
          href={source}
          target="_blank"
          rel="noreferrer"
        >
          {source}
        </a>
      </div>
    </main>
  )
}
