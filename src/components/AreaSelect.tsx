'use client'

import {MapPinned} from 'lucide-react'
import {useRouter} from 'next/navigation'
import {useCallback} from 'react'
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from '@/components/ui/select'

type AreaOption = {
  areaId: string
  areaLabel: string
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

  const handleChange = useCallback(
    (areaId: string) => {
      if (onChange) return onChange(areaId)
      const qs = new URLSearchParams({[paramName]: areaId})
      router.push(`${basePath}?${qs.toString()}`)
    },
    [onChange, paramName, basePath, router]
  )

  return (
    <div className="inline-flex items-center gap-2 text-base opacity-90 transition-opacity duration-150 focus-within:opacity-100 hover:opacity-100">
      <MapPinned className="h-5 w-5 shrink-0" />
      <Select value={value ?? undefined} onValueChange={(areaId) => handleChange(areaId)}>
        <SelectTrigger
          aria-label="Select a geographic area for burn day status"
          className="h-auto gap-1 border-0 bg-transparent p-0 text-base underline-offset-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 [&>svg]:transition-opacity [&>svg:not([class*='text-'])]:text-current [&>svg:not([class*='text-'])]:opacity-70 hover:[&>svg:not([class*='text-'])]:opacity-100"
        >
          <SelectValue placeholder="Select area" />
        </SelectTrigger>

        <SelectContent align="start">
          {areas.map((area) => (
            <SelectItem key={area.areaId} value={area.areaId}>
              {area.areaLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default AreaSelect
