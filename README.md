# Android Wall of Shame

Which Android manufacturers let you unlock your bootloader, which make you beg,
and which have closed the door for good. Sixteen manufacturers, ranked worst to
best.

## Running it

```sh
npm install     # one dev dependency, used only to generate colour tokens
npm run serve   # http://localhost:4173
```

`index.html` is plain static HTML — opening it straight off disk works too.

## Layout

```
index.html               markup
assets/tokens.css        generated colour tokens — do not edit
assets/styles.css        Material 3 Expressive components
assets/app.js            render, filter, sort, theme
data/vendors.js          the wall itself
docs/wall-of-shame.md    source notes the data is written from
tools/generate-tokens.mjs
tools/bundle.mjs         inlines everything into dist/index.html
tools/serve.mjs
```

## Colour

Every colour on the page resolves through `--md-sys-color-*` custom properties.
Nothing is hardcoded.

`tools/generate-tokens.mjs` produces those tokens from one seed using
`material-color-utilities`: **Material 3 Expressive**, colour spec **2026**,
phone platform, standard contrast, seed **`#4444fe`**. Light and dark come out
of the same scheme, so they stay in step.

```sh
npm run tokens   # rewrite assets/tokens.css
npm run build    # tokens + dist/index.html
```

Change `SEED` at the top of the generator and the whole wall re-themes.

## Icon

`assets/favicon.svg` is the source of truth: a padlock tile in the palette seed
`#4444fe`, with the shackle in the error red the masthead uses for the words
"Wall of Shame". One accent only — a second red element turns to mush at 16px.

The two PNGs are rasterised from it for browsers and platforms that will not
take an SVG icon, quantised to 64 colours (1.4 kB and 0.4 kB). Regenerate them
after editing the SVG:

```sh
magick -background none -density 1440 assets/favicon.svg -resize 180x180 \
  -colors 64 -strip PNG8:assets/apple-touch-icon.png
magick -background none -density 384 assets/favicon.svg -resize 32x32 \
  -colors 64 -strip PNG8:assets/favicon-32.png
```

`tools/bundle.mjs` inlines all three as data URIs so the single-file build
carries its own icon.

## Type

Three open-source members of the Google Sans family, all from Google Fonts:

| Role | Face | Why |
| --- | --- | --- |
| Display | Google Sans Flex | The variable Expressive face — `wght 1–1000`, `wdth 25–151`, `ROND 0–100`, `opsz 6–144`. The masthead runs `wdth 122, ROND 100`. |
| Body | Google Sans | `wght 400–700`, built for running text |
| Data | Google Sans Code | `wght 300–800`, OFL — carries ranks, counts, evidence chips |

`opsz` is left to `font-optical-sizing: auto` so the display face adjusts itself
between the masthead and the card headings.

### Difficulty bands

Six bands, mapped onto three colour roles:

| Band | Meaning | Role |
| --- | --- | --- |
| Impossible | No official route exists | `error` |
| Extreme | Restricted to the point of theoretical | `error-container` |
| Hard | Approval, queues, or manual flashing | `tertiary` |
| Varies | Depends entirely on the model | `tertiary`, hatched |
| Medium | A form to fill and a price to pay | `tertiary-container` |
| Easy | Toggle, fastboot, done | `primary-container` |

`Varies` is drawn as a diagonal hatch rather than a fourth flat green — it is
indeterminate by definition, and three solid tertiary bands were not tellable
apart at a glance.

Where a role flips lightness between themes, the graphical severity indicators
use `--tier-error-bright` so `Extreme` reads as red on both grounds instead of
sinking into a dark background.

## Sources

Each card carries a **Learn more** button pointing at where the claim can be
checked, labelled with the source and a dot showing what kind it is:

- **filled dot** — the manufacturer's own page or statement
- **grey dot** — a news outlet
- **hollow dot** — a maintained community reference

`source` is optional. Leave it off an entry and that card simply shows no
button, which is the right outcome when there is nothing solid to point at.
Every URL currently in the file returned HTTP 200 on a live check; re-check them
before trusting an old copy, since vendor unlock pages disappear without notice
— which is rather the point of this site.

## Adding or fixing a brand

Everything lives in `data/vendors.js`. Each entry needs a `name`, a `tier` from
the table above, a one-line `verdict`, the fuller `detail`, an `evidence` list
of specific mechanisms, and ideally a `source`. Ranks, counts, the meter and the
filter chips are all derived — nothing else to update.

```sh
npm run validate            # shape, tiers, evidence, sources
npm run validate -- --links # also check every source URL still resolves
```

**[CONTRIBUTING.md](CONTRIBUTING.md)** has the full guide: how to request a
brand without writing code, the field-by-field contract, sourcing rules, and
the [ranking rubric](CONTRIBUTING.md#the-ranking-rubric) — an ordered decision
procedure for choosing a difficulty band, so two reviewers with the same
evidence land on the same answer.
