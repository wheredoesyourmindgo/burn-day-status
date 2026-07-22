# popover

2026-07-22. Strategy: golden pair via merge (radix-vega/base-vega
popover.json, three-way merge). Verdict: clean, one conflict hand-resolved,
one dropped part restored as inert passthrough.

## Changed

- `src/components/ui/popover.tsx` — `Portal > Content` restructured to
  `Portal > Positioner > Popup` (positioning props `align`/`alignOffset`/
  `side`/`sideOffset` moved to the new `Positioner`, which gets
  `className="isolate z-50"` per the target shape). `PopoverContent`'s class
  string is this project's existing content (kept verbatim, only
  `--radix-popover-content-transform-origin` renamed to `--transform-origin`).
  `PopoverTitle`/`PopoverDescription` now render the real Base UI
  `Title`/`Description` primitives instead of a plain `div`/`p`.
  `PopoverAnchor` has no Base UI equivalent (hard rule) — replaced with an
  inert `<span data-slot="popover-anchor" {...props} />` passthrough so the
  export keeps existing for any future consumer; it does no anchoring.
- `src/app/page.tsx:6` — import repointed to `@/components/ui/popover`.
- `src/app/page.tsx` (two call sites, the calendar-date popover and the
  mobile disclaimer popover) — `<PopoverTrigger asChild><button>...` converted
  to `<PopoverTrigger render={<button>...} />` per the universal `asChild` ->
  `render` mapping.

Leftover scan: `grep -n "radix-ui\|@radix-ui" src/components/ui/popover.tsx` —
clean.

## Left alone

None related.

## Behavior changes

- `PopoverAnchor` is now an inert `<span>` with no positioning behavior (Base
  UI dropped the Anchor part; the real equivalent is passing an `anchor` prop
  to `Positioner`). Not currently used anywhere in this project — flagged in
  case a future consumer expects Radix's anchor-to-a-different-element
  behavior.
- `onOpenChange` (if ever added at a call site) will gain an `eventDetails`
  second argument and additional dismissal reasons (`trigger-hover`,
  `trigger-focus`, etc.) — not exercised today, noted for awareness.

## Verify by hand

1. `/` — click the giant clock/calendar icon (top right): popover should open
   showing "Weekday, Month Day, Year", positioned below with the same slide-in
   animation, and close on outside click / Escape.
2. Shrink the viewport to mobile width — click the small info icon
   (bottom-left): popover should open above-left aligned per
   `align="start" side="top"`, same as before.
3. Confirm both triggers are still fully clickable (the `render` swap
   shouldn't affect hit target size).
