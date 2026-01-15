import {FlameKindling, Wind} from 'lucide-react'
import type {Metadata} from 'next'
import {isSameDay} from 'date-fns'
import {LocalDate} from '@/lib/local-date'
import {getBurnDayStatus} from '@/lib/burn-day'

export const metadata: Metadata = {
  title: 'Burn Day Status',
  description: 'Daily burn day status'
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
      className={`min-h-screen flex flex-col items-center justify-center text-white text-center px-6 ${
        isBurnDay ? 'bg-red-600' : 'bg-sky-500'
      }`}
    >
      {isBurnDay ? (
        <FlameKindling className="w-32 h-32 mb-6" strokeWidth={1.25} />
      ) : (
        <Wind className="w-32 h-32 mb-6" strokeWidth={1.25} />
      )}

      <h1 className="text-4xl font-bold mb-2">
        {isBurnDay ? (
          "It's a Burn Day"
        ) : (
          <>
            Today is <span className="italic">Not</span> a Burn Day
          </>
        )}
      </h1>

      <p className="text-lg opacity-90">for Western Nevada County</p>

      {!isKnown ? (
        <p className="mt-4 text-sm opacity-80">
          Today’s status hasn’t been posted yet.
        </p>
      ) : null}

      <div className="fixed bottom-4 right-4 text-xs text-white/75">
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
