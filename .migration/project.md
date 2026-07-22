# project

2026-07-22. Whole-project migration (the 5 requested components — button,
popover, select, table, tooltip — were the entire `src/components/ui/`
directory, so finishing them finished the project).

## Dependency swap

- Added `@base-ui/react@1.6.0` (`yarn add @base-ui/react`).
- Removed `radix-ui` (`yarn remove radix-ui`) once the last wrapper
  (tooltip) was finalized and a full-project grep confirmed zero remaining
  `radix-ui`/`@radix-ui` references anywhere in `src`.
- `components.json` `style`: `radix-vega` -> `base-vega`, so future
  `shadcn add <component>` calls fetch Base UI variants.

## App-code sweep summary

Consumers outside `components/ui/` (`src/app/page.tsx`, `src/app/error.tsx`,
`src/app/info/page.tsx`, `src/components/AreaSelect.tsx`) were swept against
`consumer-props.md`. Changes needed:
- `error.tsx`: import path only (no prop changes; no `asChild` used).
- `page.tsx`: import path + two `PopoverTrigger asChild` -> `render` prop
  conversions.
- `info/page.tsx`: import path only (table has no radix-derived props).
- `AreaSelect.tsx`: import path + `SelectContent position="popper"` ->
  `alignItemWithTrigger={false}` + wrapped `onValueChange` to handle Base
  UI's widened `string | null` value type.

## Final build result

- `yarn type-check` — clean (baseline was already clean before this
  migration started).
- `yarn build` — succeeds (`Next.js 16.2.11`, Turbopack), all 7 pages
  generate successfully.
- `yarn lint` — clean.

## Derived status

`grep -rn "radix-ui\|@radix-ui" src` — **0 wrappers remain on Radix.** All
UI components (`button`, `popover`, `select`, `table`, `tooltip`) are on
`@base-ui/react` (or, for `table`, were never on Radix to begin with).
