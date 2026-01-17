type Day = {
  id: string
  label: string
  date: Date | null
}

type Entry = {
  webId: string
  webSource: string // URL of the upstream source
  webLabel: string // human-friendly display label for the source
  areaId: string
  areaSource: string // exact upstream / canonical text
  areaLabel: string // human-friendly display label
  dayId: string
  value: boolean | null
}

export {getBurnDayStatus as getMyAirBurnDaysStatus} from './my-air-dist'
export {getBurnDayStatus as getPlacerCountyBurnDaysStatus} from './pc-air-pollution-cntrl-dist'
export type {Day, Entry}
