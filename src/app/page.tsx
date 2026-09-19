import {FlameKindling, Wind, Calendar, Scale, Info, CloudOff} from 'lucide-react'
import type {Metadata} from 'next'
import {isSameDay, format} from 'date-fns'
import {LocalDate, localTz} from '@/lib/local-date'
import {getCaNcBurnDaysStatus} from '@/lib/burn-day'
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
      <PopoverTrigger
        render={
          <button
            type="button"
            className="group inline-flex items-center justify-center rounded-md focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none"
            aria-label={`Show date: ${human}`}
          >
            {/*
              Scale glyph and label together as one unit. Scaling them
              separately makes the label drift against the frame mid-hover,
              since each transforms about its own origin.
            */}
            <span className="relative block h-18 w-18 text-white/85 transition-[color,transform] duration-150 ease-out group-hover:scale-105 group-hover:text-white group-active:scale-95">
              <Calendar className="absolute inset-0 h-full w-full" strokeWidth={1} />

              {/*
                Centre the label in the calendar's blank body — the area below
                the header bar. In lucide's 24-unit viewBox the header rule is
                at y=9 and the frame bottom at y=21, so the body is 37.5% to
                87.5% from the top (hence bottom-[12.5%]).

                Percentages of the viewBox keep this aligned at any icon size,
                and survive the glyph being renumbered upstream — the previous
                hardcoded pixel offsets silently drifted 3px when the frame
                moved up a unit in lucide 1.47.
              */}
              <span className="pointer-events-none absolute inset-x-0 top-[37.5%] bottom-[12.5%] flex flex-col items-center justify-center gap-0.5">
                {/*
                  Leading below 1 on purpose: Darumadrop One's ink overflows
                  its em box, so leading-none reserves more room than the
                  glyphs need, which pushed "Sat" up over the header rule.

                  So the leading values keep each line's box snug to its
                  glyphs, and gap-0.5 sets the space between the two lines.
                  Tune the spacing with the gap — raising the leading instead
                  would push "Sat" back up toward the rule.
                */}
                <span className="font-display text-[13px] leading-2.5 font-semibold tracking-wide uppercase">
                  {dayOfWeek}
                </span>
                <span className="text-lg leading-4 font-extrabold">{dayNum}</span>
              </span>
            </span>
          </button>
        }
      />

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

  const resolvedSearchParams = await searchParams

  const areaIdFromQuery = resolvedSearchParams?.areaId ?? null
  const defaultEntry = caNcData.find((e) => e.areaLabel?.toLowerCase() === 'western nevada county')
  const defaultAreaId = defaultEntry?.areaId ?? null
  const today = new LocalDate()

  const targetAreaId = areaIdFromQuery ?? defaultAreaId ?? null

  const sources = [{key: 'nc' as const, sourceUrl: caNcSource}]

  const sourcesByKey = Object.fromEntries(sources.map((s) => [s.key, s])) as Record<
    (typeof sources)[number]['key'],
    (typeof sources)[number]
  >

  // Find the Day object representing today.
  //
  // Off-season the district replaces its dated columns with a notice (e.g.
  // "Open Burning is closed for the season"), so nothing parses to a date. In
  // that case the first column still carries a real status, so fall back to it
  // rather than reporting the day as unposted. When the source *does* publish
  // dated columns we keep requiring a genuine match, so stale data is never
  // presented as today's.
  const allDays = [...caNcDays]
  const hasDatedColumns = allDays.some((d) => d.date)
  const todayDay = hasDatedColumns
    ? allDays.find((d) => d.date && isSameDay(d.date, today, {in: localTz}))
    : allDays[0]

  // Find the Entry for the specified Area for today’s column
  const allData = caNcData.map((e) => ({...e, sourceKey: 'nc' as const}))

  const todayEntry =
    todayDay && targetAreaId
      ? allData.find((e) => e.areaId === targetAreaId && e.dayId === todayDay.id)
      : undefined

  // When the column isn't a date, its label is the district's own notice.
  const columnNote = todayDay && !todayDay.date ? todayDay.label : null

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
          ? 'bg-linear-to-b from-orange-500 to-orange-700'
          : 'bg-linear-to-b from-sky-400 to-sky-600'
      }`}
    >
      <div className="mb-5">
        {isBurnDay ? (
          <FlameKindling className="h-32 w-32" strokeWidth={1.25} />
        ) : isKnown ? (
          <Wind className="h-32 w-32" strokeWidth={1.25} />
        ) : (
          <CloudOff className="h-32 w-32" strokeWidth={1.25} />
        )}
      </div>

      <h1 className="mb-6 text-4xl">
        {isBurnDay ? (
          "It's a Burn Day!"
        ) : isKnown ? (
          <>
            Today is <span className="italic">NOT</span> a Burn Day.
          </>
        ) : (
          'Burn Day Status Unavailable'
        )}
      </h1>

      <AreaSelect areas={areas} value={targetAreaId} />

      {columnNote ? <p className="mt-4 text-sm opacity-80">{columnNote}</p> : null}

      {!isKnown ? (
        <p className="mt-4 text-sm opacity-80">
          {allDays.length
            ? 'Today’s status hasn’t been posted yet.'
            : 'Burn day status is temporarily unavailable.'}
        </p>
      ) : null}

      <div className="fixed top-4 right-4 z-5">
        <CalendarToday date={(todayDay?.date ?? today) as Date} />
      </div>

      <div className="fixed right-4 bottom-4 left-4 flex items-end justify-between gap-6 text-xs">
        <div className="min-w-0 flex-1 text-left">
          <div className="sm:hidden">
            <Popover>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    aria-label="Disclaimer and usage information"
                    className="inline-flex items-center justify-center rounded-md p-1 text-white/70 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none"
                  >
                    <Info className="h-6 w-6" strokeWidth={1.75} />
                  </button>
                }
              />

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
