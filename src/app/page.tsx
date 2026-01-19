import {FlameKindling, Wind, Calendar, Scale, Info} from 'lucide-react'
import type {Metadata} from 'next'
import {isSameDay, format} from 'date-fns'
import {LocalDate, localTz} from '@/lib/local-date'
import {getCaNcBurnDaysStatus, getCaPcBurnDaysStatus} from '@/lib/burn-day'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import AreaSelect from '@/components/AreaSelect'

export const metadata: Metadata = {
  title: 'Burn Day Status',
  description: 'Daily burn day status'
}

const CalendarToday = ({date}: {date: Date}) => {
  const human = format(date, 'EEEE, MMMM do, yyyy', {in: localTz})
  const dayNum = format(date, 'd', {in: localTz})
  const dayOfWeek = format(date, 'EEE', {in: localTz})

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group relative inline-flex items-center justify-center rounded-md focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none"
          aria-label={`Show date: ${human}`}
        >
          <Calendar
            className="h-18 w-18 text-white/85 transition-colors transition-transform duration-150 ease-out group-hover:scale-105 group-hover:text-white group-active:scale-95"
            strokeWidth={1}
          />
          <span className="font-display pointer-events-none absolute top-[28px] left-[35px] -translate-x-1/2 text-[13px] font-semibold tracking-wide text-white/85 uppercase transition-colors transition-transform duration-150 ease-out group-hover:scale-105 group-hover:text-white group-active:scale-95">
            {dayOfWeek}
          </span>
          <span className="pointer-events-none absolute inset-0 flex translate-y-[17px] items-center justify-center text-lg font-extrabold text-white/85 transition-colors transition-transform duration-150 ease-out group-hover:translate-y-[18px] group-hover:scale-105 group-hover:text-white group-active:scale-95">
            {dayNum}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="mx-3 w-auto px-3 py-2 text-sm">{human}</PopoverContent>
    </Popover>
  )
}

type Props = {
  searchParams?: Promise<{
    areaId?: string
  }>
}

export default async function Home({searchParams}: Props) {
  const {days: caNcDays, data: caNcData, source: caNcSource} = await getCaNcBurnDaysStatus()
  const {days: caPcDays, data: caPcData, source: caPcSource} = await getCaPcBurnDaysStatus()

  const resolvedSearchParams = await searchParams

  const areaIdFromQuery = resolvedSearchParams?.areaId ?? null
  const defaultEntry = caNcData.find((e) => e.areaLabel?.toLowerCase() === 'western nevada county')
  const defaultAreaId = defaultEntry?.areaId ?? null
  const today = new LocalDate()

  const targetAreaId = areaIdFromQuery ?? defaultAreaId ?? null

  const sources = [
    {key: 'nc' as const, sourceUrl: caNcSource},
    {key: 'pc' as const, sourceUrl: caPcSource}
  ]

  const sourcesByKey = Object.fromEntries(sources.map((s) => [s.key, s])) as Record<
    (typeof sources)[number]['key'],
    (typeof sources)[number]
  >

  // Find the Day object representing today
  const allDays = [...caNcDays, ...caPcDays]
  const todayDay = allDays.find((d) => d.date && isSameDay(d.date, today, {in: localTz}))

  // Find the Entry for the specified Area for today’s column
  const allData = [
    ...caNcData.map((e) => ({...e, sourceKey: 'nc' as const})),
    ...caPcData.map((e) => ({...e, sourceKey: 'pc' as const}))
  ]

  const todayEntry =
    todayDay && targetAreaId
      ? allData.find((e) => e.areaId === targetAreaId && e.dayId === todayDay.id)
      : undefined

  const burnValue = todayEntry?.value ?? null
  const isBurnDay = burnValue === true
  const isKnown = burnValue !== null

  const areas = Array.from(
    new Map(
      allData.map(({areaId, areaLabel, webId, webLabel, sourceKey}) => [
        `${webId}:${areaId}`, // key only to avoid collisions
        {areaId, areaLabel, webId, webLabel, sourceKey}
      ])
    ).values()
  ).sort((a, b) => a.areaLabel.localeCompare(b.areaLabel))

  const selectedArea = targetAreaId ? areas.find((a) => a.areaId === targetAreaId) : undefined

  const activeSource = selectedArea ? (sourcesByKey[selectedArea.sourceKey]?.sourceUrl ?? '') : ''

  return (
    <main
      className={`flex h-dvh flex-col items-center justify-center overflow-hidden overscroll-none px-6 text-center text-white ${
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

      <AreaSelect areas={areas} value={targetAreaId} />

      {!isKnown ? (
        <p className="mt-4 text-sm opacity-80">Today’s status hasn’t been posted yet.</p>
      ) : null}

      <div className="fixed top-4 right-4 z-5">
        <CalendarToday date={(todayDay?.date ?? today) as Date} />
      </div>

      <div className="fixed right-4 bottom-4 left-4 flex items-end justify-between gap-6 text-xs">
        <div className="min-w-0 flex-1 text-left">
          <div className="sm:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Disclaimer and usage information"
                  className="inline-flex items-center justify-center rounded-md p-1 text-white/70 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none"
                >
                  <Info className="h-6 w-6" strokeWidth={1.75} />
                </button>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                side="top"
                className="w-[min(22rem,calc(100vw-2rem))] text-xs leading-relaxed"
              >
                Information shown here is provided for convenience and may be delayed or subject to
                change. Always verify current burn restrictions with your local air quality
                management district before burning.
              </PopoverContent>
            </Popover>
          </div>

          <div className="hidden max-w-xl items-start gap-2 text-white/60 sm:flex">
            <Scale className="mt-0.5 h-8 w-8 shrink-0 opacity-70" strokeWidth={1.5} />
            <p>
              Information shown here is provided for convenience and may be delayed or subject to
              change. Always verify current burn restrictions with your local air quality management
              district before burning.
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right text-white/75">
          Source:{' '}
          <a
            className="underline underline-offset-3 hover:text-white"
            href={activeSource}
            target="_blank"
            rel="noreferrer"
          >
            {activeSource}
          </a>
        </div>
      </div>
    </main>
  )
}
