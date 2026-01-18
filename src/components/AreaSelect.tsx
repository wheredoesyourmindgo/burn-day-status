'use client'

import {MapPinned} from 'lucide-react'
import {useRouter} from 'next/navigation'
import {useCallback, useMemo} from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel
} from '@/components/ui/select'

type AreaOption = {
  areaId: string
  areaLabel: string
  webId: string
  webLabel: string
}

type Props = {
  areas: AreaOption[]
  value?: string | null
  onChange?: (areaId: string) => void
  basePath?: string
  paramName?: string
}

const AreaSelect = ({areas, value, onChange, basePath = '/', paramName = 'areaId'}: Props) => {
  const router = useRouter()

  const selectedValue = value ?? ''

  const handleChange = useCallback(
    (areaId: string) => {
      if (onChange) return onChange(areaId)
      const qs = new URLSearchParams({[paramName]: areaId})
      router.push(`${basePath}?${qs.toString()}`)
    },
    [onChange, paramName, basePath, router]
  )

  const areasByWeb = useMemo(() => {
    return areas.reduce<Record<string, {webLabel: string; items: AreaOption[]}>>((acc, area) => {
      if (!acc[area.webId]) {
        acc[area.webId] = {webLabel: area.webLabel, items: []}
      }
      acc[area.webId].items.push(area)
      return acc
    }, {})
  }, [areas])

  const sortedGroups = useMemo(() => {
    return Object.entries(areasByWeb).sort(([, a], [, b]) => a.webLabel.localeCompare(b.webLabel))
  }, [areasByWeb])

  const showIcon = selectedValue.length > 0

  return (
    <div className="inline-flex items-center gap-2 text-base opacity-90 transition-opacity duration-150 focus-within:opacity-100 hover:opacity-100">
      {showIcon ? <MapPinned className="h-5 w-5 shrink-0" /> : null}
      <Select value={selectedValue} onValueChange={handleChange}>
        <SelectTrigger
          aria-label="Select a geographic area for burn day status"
          className="h-auto gap-1 border-0 bg-transparent p-0 text-base underline-offset-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 [&>svg]:transition-opacity [&>svg:not([class*='text-'])]:text-current [&>svg:not([class*='text-'])]:opacity-70 hover:[&>svg:not([class*='text-'])]:opacity-100"
        >
          <SelectValue placeholder="Select area" />
        </SelectTrigger>

        <SelectContent position="popper">
          {sortedGroups.map(([webId, group]) => (
            <SelectGroup key={webId}>
              <SelectLabel>{group.webLabel}</SelectLabel>
              {group.items.map((area) => (
                <SelectItem key={area.areaId} value={area.areaId}>
                  {area.areaLabel}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default AreaSelect
