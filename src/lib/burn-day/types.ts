export type Day = {
  id: string
  label: string
  date: Date | null
}

export type Entry = {
  id: string // Stable hash ID of webId + areaId + dayId
  webId: string
  webSource: string // URL of the upstream source
  webLabel: string // human-friendly display label for the source
  areaId: string
  areaSource: string // exact upstream / canonical text
  areaLabel: string // human-friendly display label
  dayId: string // Foreign key to Day.id
  value: boolean | null
}
