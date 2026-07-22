# select

2026-07-22. Strategy: golden pair via merge (radix-vega/base-vega
select.json, three-way merge, 5 hunks hand-resolved). Verdict: clean;
required one consumer prop change and one handler-signature widening.

## Changed

- `src/components/ui/select.tsx` — full anatomy migration per
  `wrapper-shapes.md`/`universal-patterns.md`:
  - `Select` is now the bare re-export `const Select = SelectPrimitive.Root`
    (no wrapper function/data-slot on Root — `SelectPrimitive.Root.Props` is
    generic and doesn't fit the usual `ComponentProps` pattern).
  - `SelectValue` gained the target's default `"flex flex-1 text-left"`
    className (new in the Base anatomy; wasn't present in either the radix
    ancestor or our old file, so this is a required structural addition, not
    a style choice).
  - Trigger's `<Icon asChild><ChevronDownIcon/></Icon>` -> `<Icon render={
    <ChevronDownIcon/>} />`. The project's icon library is lucide
    (`components.json` `iconLibrary`), so the registry's `IconPlaceholder`
    site-only helper was resolved to plain `ChevronDownIcon`/`CheckIcon`/
    `ChevronUpIcon` imports from `lucide-react`, matching what the CLI itself
    would have resolved it to.
  - `SelectContent`: dropped the radix `position="popper"|"item-aligned"`
    prop entirely; exposes `alignItemWithTrigger` (default `true`) +
    `side`/`sideOffset`/`align`/`alignOffset`, all forwarded to the new
    `Positioner`. `Content` -> `Portal > Positioner > Popup`. CSS vars renamed
    (`--radix-select-content-available-height` -> `--available-height`,
    `--radix-select-content-transform-origin` -> `--transform-origin`); the
    old Viewport's popper-conditional trigger-height/width classes are gone —
    width is now permanently `w-(--anchor-width)` on the Popup itself, and
    `SelectPrimitive.List` (renamed from `Viewport`) carries no classes, per
    the target shape.
  - `SelectItem`: anatomy reordered to `ItemText` first, then
    `ItemIndicator render={<span className="...absolute right-2..."/>}`
    wrapping the check icon (previously a `span` wrapped a plain
    `ItemIndicator`). This is the Base UI target shape, not a style choice.
  - `SelectLabel`: `Label` -> `GroupLabel`.
  - `ScrollUp/DownButton`: `ScrollUp/DownButton` -> `ScrollUp/DownArrow`;
    gained required `top-0 w-full` / `bottom-0 w-full` classes per the target
    shape (these arrows now need explicit full-width/edge positioning inside
    the Popup).
  - Every other Tailwind class string (Trigger, Item, Label, Separator, main
    Popup box) was preserved EXACTLY as this project already had it —
    including the project's pre-existing older syntax (`ring-[3px]` instead
    of the newer registry's `ring-3`, `data-[placeholder]:` instead of
    `data-placeholder:`) — since that's local-drift-vs-current-registry, not
    something a radix->base migration should touch.
- `src/components/AreaSelect.tsx:14` — import repointed to
  `@/components/ui/select`.
- `src/components/AreaSelect.tsx:72` — `<SelectContent position="popper">`
  -> `<SelectContent alignItemWithTrigger={false}>` per the
  `position="popper"` -> `alignItemWithTrigger={false}` consumer mapping.
- `src/components/AreaSelect.tsx:64` — `onValueChange={handleChange}` ->
  `onValueChange={(areaId) => areaId !== null && handleChange(areaId)}`.
  Base UI's `onValueChange` widens to `(value: string | null, eventDetails)`;
  `handleChange` only accepts `string`, so the setter is wrapped rather than
  widening `handleChange`'s signature (this component's values are never
  intentionally `null`).

Leftover scan: `grep -n "radix-ui\|@radix-ui\|IconPlaceholder"
src/components/ui/select.tsx` — clean.

## Left alone

None related.

## Behavior changes

- None expected in normal use. `value` can theoretically be `null` from Base
  UI's Select even though this UI never presents a "clear selection" affordance
  — guarded defensively at the one call site.

## Verify by hand

1. `/` — the area picker (bottom, next to the map-pin icon once an area is
   selected) should open a popper-positioned dropdown (not item-aligned,
   matching `alignItemWithTrigger={false}`), grouped by water/air district
   with group labels, scrollable if the list is long.
2. Selecting an item should navigate (`router.push` with the new `areaId`
   query param) exactly as before.
3. Keyboard: open with Enter/Space, arrow through items, Enter to select,
   Escape to close — should all still work (Base UI Select keeps this
   built-in).
4. Visually confirm the chevron icon, checkmark on the selected item, and
   trigger/item hover-focus styling are pixel-identical to before (classes
   were preserved verbatim).
