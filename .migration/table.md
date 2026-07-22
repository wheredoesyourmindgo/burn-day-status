# table

2026-07-22. Strategy: none needed. Verdict: no Radix usage — nothing to
migrate.

## Changed

Nothing. `src/components/ui/table.tsx` wraps plain native `<table>`/`<thead>`/
`<tbody>`/etc. elements with `cn()` for class merging; it never imported
`radix-ui` or `@radix-ui/*`. There is no Base UI `Table` primitive to move to
either — this file is framework-agnostic HTML.

## Left alone

`src/components/ui/table.tsx` in its entirety — correctly has no radix
dependency to remove. The current `base-vega`/`radix-vega` registries both
ship byte-for-byte-equivalent `table.tsx` files (verified by fetching both);
the only difference is one added class on `TableRow`
(`has-aria-expanded:bg-muted/50`, for expandable-row hover state) present in
the current registry but not in this project's copy. That's registry version
drift unrelated to the radix->base migration and was left untouched to avoid
unrelated styling changes.

## Behavior changes

None.

## Verify by hand

Not applicable — no code changed. `/info` page's two tables continue to
render exactly as before.
