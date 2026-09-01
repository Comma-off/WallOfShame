# Contributing

Two ways in:

- **You know a brand is missing, but not the details.** [Open a brand request](#requesting-a-brand). No code.
- **You know the details and can cite them.** [Open a pull request](#adding-a-brand). One entry in one file.

Corrections matter as much as additions. Manufacturers change unlock policy quietly
and without announcements, so an entry that was right last year may be wrong now.

---

## Requesting a brand

Open an issue using the **Brand request** template and give whatever you have:

- the manufacturer, and which devices you mean (global, CN, a specific series)
- what actually happens when you try to unlock
- anything you can link to

You do not need to pick a difficulty band. That is the reviewer's job, and it is
easier to do well with the evidence in front of us.

---

## Adding a brand

Everything lives in one file: **`data/vendors.js`**. Add an object to the
`vendors` array. Rank, position, counts, the meter and the filter chips are all
derived — do not set them, and do not sort the array by hand.

```js
{
  name: 'Motorola',
  tier: 'medium',
  verdict: 'A key by email — and your warranty, permanently.',
  detail:
    'Motorola issues a digital unlock key through an online form. It arrives quickly, and it instantly and permanently voids the hardware warranty on their servers.',
  evidence: ['online form', 'digital key', 'warranty voided server-side'],
  source: {
    url: 'https://en-us.support.motorola.com/app/standalone/bootloader/unlock-your-device-a',
    label: 'Motorola Support',
    kind: 'official',
  },
},
```

| Field | Rules |
| --- | --- |
| `name` | As the manufacturer writes it — `HONOR`, not `Honor`. Group sub-brands that share one policy: `ZTE / nubia / RedMagic`. |
| `tier` | One of the six ids below. Use the [rubric](#the-ranking-rubric). |
| `verdict` | One sentence, from the owner's side of the screen. What actually happens to *you*. No hedging, no marketing verbs. |
| `detail` | One to three sentences with the mechanism. Name the specific thing — the app, the fuse, the portal, the OS version. |
| `evidence` | Two to four short lowercase fragments. Mechanisms, not adjectives: `anti-rollback fuses`, not `very locked down`. |
| `source` | Optional but strongly wanted. See [sourcing](#sourcing). Omit the whole field rather than link something weak. |

Then:

```sh
npm run validate   # checks shape, tiers, evidence, source
npm run build      # regenerates tokens + dist/index.html
npm run serve      # look at it
```

`npm run validate -- --links` additionally checks every source URL still resolves.
It hits the network, so it is not part of the default run.

---

## The ranking rubric

Six bands. The aim is that two reviewers with the same evidence reach the same
band, so work through this in order and **stop at the first match**.

### Step 1 — Is there an official consumer route, on devices sold today?

| Finding | Band |
| --- | --- |
| No route, and the manufacturer has ended, removed or never offered one | `impossible` |
| A route nominally exists, but is restricted so tightly that an ordinary owner effectively cannot use it | `extreme` |
| The answer genuinely differs by model, chipset or region, with no dominant case | `varies` |
| Yes, a route exists and ordinary owners use it | go to step 2 |

Three clarifications, because these are where reviewers disagree:

- **"Official" means the manufacturer sanctions it.** Exploits, leaked tools, paid
  third-party services and EDL tricks do not count, however well they work. A brand
  with a thriving grey-market unlock scene and no sanctioned route is still
  `impossible` — that is the point the site is making.
- **`extreme` is not "very hard".** It is for a route that formally exists and
  practically does not: discontinued tooling, mainland-only programmes, quotas
  nobody clears. If a determined owner can realistically get through it, it is
  `hard`.
- **`varies` needs genuine indeterminacy.** If most current models land in one
  band, use that band and describe the exceptions in `detail`. Reserve `varies`
  for brands with no coherent policy at all.

### Step 2 — What does the route cost?

Count the frictions that apply, then sort them into two kinds:

| Friction | Kind |
| --- | --- |
| Approval by a human or a server queue | gate |
| Waiting period measured in days | gate |
| Account age, community level or activity requirement | gate |
| Per-account or per-year quota | gate |
| Mainland-only or region-locked programme | gate |
| Manually flashing a vendor-supplied unlock image | gate |
| Permanent warranty void | toll |
| Permanent loss of a feature (camera pipeline, fingerprint, DRM, updates) | toll |
| Device can silently relock itself later | toll |

| Finding | Band |
| --- | --- |
| Any **gate**, or three or more frictions of any kind | `hard` |
| One or two **tolls** and no gate | `medium` |
| None | `easy` |

Filling in a form is not by itself a gate. The gate is *someone deciding* —
a queue, a reviewer, a quota, an eligibility rule. A form that returns a key
straight away is just paperwork, which is why Motorola is `medium` and not
`hard` despite having a form.

**A gate decides whether you may unlock. A toll decides what it costs you.**
That distinction is the whole difference between `hard` and `medium`, and it is
deliberate: a price you can choose to pay is categorically better than someone
else holding the decision.

### Rank by the device as sold, not the trajectory

Rank on what a buyer faces on that device **today**. Where policy is tightening
or a brand is leaving a market, that belongs in `detail`, not in the band.
OnePlus sits at `easy` because the OxygenOS fastboot flow is open right now,
with the ColorOS 16 Deep Testing requirement named in its detail.

### The six bands

| Band | `tier` | Meaning | Bars |
| --- | --- | --- | --- |
| Impossible | `impossible` | No official route exists | 5 |
| Extreme | `extreme` | Restricted to the point of theoretical | 5 |
| Hard | `hard` | Approval, queues, or manual flashing | 4 |
| Varies | `varies` | Depends entirely on the model | 3 |
| Medium | `medium` | A form to fill and a price to pay | 2 |
| Easy | `easy` | Toggle, fastboot, done | 1 |

Bar counts are a property of the band, defined once in `TIERS` in
`assets/app.js`. They are not per-brand and are not yours to set.

### Worked examples

| Brand | Reasoning | Band |
| --- | --- | --- |
| Samsung | Step 1: route removed in One UI 8, code gone from the bootloader | `impossible` |
| OPPO | Step 1: a route exists on paper; current global security design makes it unreachable | `extreme` |
| Xiaomi | Step 2: approval queue, community level, account age, annual quota — four frictions, several gates | `hard` |
| ZTE / nubia / RedMagic | Step 1: some models expose OEM unlocking, others need invasive work, no unified policy | `varies` |
| Sony | Step 2: one toll (breaks camera processing), no gate | `medium` |
| Motorola | Step 2: one toll (warranty void), no gate | `medium` |
| Google | Step 2: no frictions | `easy` |

Running the rubric over all sixteen current entries reproduces every band they
already carry. If a new entry forces an exception, say so in the PR — that is a
signal the rubric needs work, not something to paper over.

---

## Sourcing

Every card should link somewhere the claim can be checked. Preference order:

1. **`official`** — the manufacturer's own unlock page, support article or
   statement. Best possible source, even when it is them announcing bad news.
2. **`news`** — a substantial article from an outlet that does original
   reporting.
3. **`reference`** — a maintained community reference. Use only when nothing
   better exists.

`label` names the source as a reader would recognise it: `Huawei statement`,
`Android Police`, `Sony Open Devices`. The card shows it next to the button with
a dot marking the kind, so readers can weigh it themselves.

Rules:

- The URL must resolve. Check it, do not assume.
- Link the page that supports *this* claim, not a brand homepage.
- No affiliate links, no unlock-code vendors, no sites whose business is selling
  the unlock.
- Forum threads are evidence a problem exists, not evidence of policy. A user
  complaining they cannot unlock is not a `reference`.
- **No source is better than a bad one.** Omit `source` entirely and the card
  simply shows no button.

---

## Review checklist

For maintainers taking a PR that adds or changes a brand:

- [ ] `npm run validate -- --links` passes
- [ ] The band follows the rubric, and the PR says which step decided it
- [ ] Frictions listed in `detail` match the band the rubric would give
- [ ] `verdict` says what happens to the owner, in one sentence
- [ ] `evidence` fragments are mechanisms, not opinions
- [ ] Source resolves, supports the specific claim, and `kind` is honest
- [ ] Sub-brands are grouped only where they genuinely share a policy
- [ ] No hand-set rank, order or bar count
- [ ] `docs/wall-of-shame.md` updated if the underlying note changed

Reject cheerfully: an entry with no verifiable source, a band argued from
frustration rather than the rubric, or a "brand" that is one device.

---

## House style

The site is unimpressed, not angry. It states what manufacturers did and lets
the wall make the argument. Specific beats scathing — `permanently blows the
Knox fuse` lands harder than `Samsung hates you`. Keep sarcasm to at most one
dry aside per entry, and never at the reader's expense.
