# button

2026-07-22. Strategy: golden pair via merge (fetched `radix-vega`/`base-vega`
button.json, three-way merged with `git merge-file`, ancestor = radix golden).
Verdict: clean, real customizations preserved.

## Changed

- `src/components/ui/button.tsx` — swapped `Slot`/`asChild` for the real
  `@base-ui/react/button` primitive (`ButtonPrimitive`), per the hard rule
  that button.tsx targets the actual Button primitive, never a hand-rolled
  `useRender` wrapper. The `cva` class list, including this project's local
  customizations relative to the current registry (older `hover:bg-secondary/80`
  instead of the newer `color-mix` secondary hover, and `lg` size using
  `pr-3`/`pl-3` instead of the newer `pr-2`/`pl-2`), survived the merge
  untouched. `data-variant`/`data-size` attributes on the rendered element —
  a local addition not present in either the radix or base golden — were
  dropped by the automatic merge and manually restored (`button.tsx:52-53`).
- `src/app/error.tsx:5` — import repointed to `@/components/ui/button` (no
  prop changes needed; call site only used `variant`, `onClick`, `className`).

Leftover scan: `grep -n "radix-ui\|@radix-ui" src/components/ui/button.tsx` —
clean.

## Left alone

None related.

## Behavior changes

None. No `asChild` was used at the only call site, so there's no `render`
prop conversion to flag here.

## Verify by hand

1. Visit `/` and force the error boundary (e.g. throw in a data fetch) to see
   the "Try again" ghost button on the purple error screen.
2. Click it — should still call `reset()`.
3. Tab to it with keyboard — focus ring should still show (white ring via
   `focus-visible:ring-2` from the consumer's own className).
