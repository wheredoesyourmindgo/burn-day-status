# tooltip

2026-07-22. Strategy: golden pair via merge (radix-vega/base-vega
tooltip.json, three-way merge, one hunk hand-resolved). Verdict: clean;
component has no consumers in this project today.

## Changed

- `src/components/ui/tooltip.tsx`:
  - `TooltipProvider`: `delayDuration` -> `delay` prop rename.
  - `Content` -> `Portal > Positioner > Popup`, with `side`/`sideOffset`/
    `align`/`alignOffset` now forwarded to `Positioner` (destructured and
    passed explicitly, per the "Pick means forward" rule) instead of living
    on `Content`. Default `sideOffset` changed `0` -> `4` per the target
    shape.
  - Content class string preserved as this project's existing (simpler,
    pre-kbd-support) version, with only
    `--radix-tooltip-content-transform-origin` renamed to
    `--transform-origin`. Did NOT adopt the current registry's newer
    `has-data-[slot=kbd]` / `**:data-[slot=kbd]:*` additions since this
    project doesn't use a `Kbd` component — that's an unrelated registry
    feature, not part of the radix->base migration.
  - `Arrow`: adopted the current base registry's per-side positioning classes
    (`data-[side=bottom]:top-1`, `data-[side=left]:...`, etc.) instead of the
    old fixed `translate-y-[calc(-50%_-_2px)]` centering. This is a required
    change, not a style pick — Base UI's `Arrow` renders a plain `<div>`
    rather than radix's self-positioning `<svg>`, so it needs explicit
    per-side offset classes to center correctly regardless of which side the
    tooltip opens on. (The pre-migration file also had a duplicated
    `translate-y-[calc(-50%_-_2px)]` class fragment, apparently a stale
    leftover — that duplication is gone now that the Arrow uses the new
    positioning classes instead.)

Leftover scan: `grep -n "radix-ui\|@radix-ui" src/components/ui/tooltip.tsx`
— clean.

## Left alone

None related. No consumer imports `Tooltip`/`TooltipTrigger`/
`TooltipContent`/`TooltipProvider` anywhere in `src` today, so there was no
app code to sweep for `asChild`, `delayDuration`, or other call-site prop
changes from `consumer-props.md`.

## Behavior changes

- `Tooltip` no longer auto-wraps itself in a `<TooltipProvider>`. The current
  `radix-vega` registry's `Tooltip` wrapper does this (every `<Tooltip>`
  silently got its own `delayDuration={0}` provider); the current
  `base-vega` registry's `Tooltip` does not — it's a real difference between
  the two registry variants, not something introduced during this migration.
  If `Tooltip` is used standalone in the future without an ancestor
  `<TooltipProvider>`, it will pick up Base UI's own default trigger delay
  (~600ms) instead of the old implicit 0ms. Wrap usage in
  `<TooltipProvider delay={0}>` at a suitable ancestor if instant tooltips are
  wanted.

## Verify by hand

Component is currently unused, so there's no live UI to click through. Before
adopting it anywhere:
1. Wrap a trigger + content pair, confirm it opens on hover/focus and
   dismisses on mouse-leave/blur/Escape.
2. Try all four sides (`side="top"|"right"|"bottom"|"left"`) and confirm the
   arrow visually centers against the trigger in each case (this is the part
   that changed most structurally).
