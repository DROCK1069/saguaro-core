# @saguaro/core

The **single source of truth** for all money & quantity math across the Saguaro platform.
Consumed by both apps so an edit here hits web and mobile together (no more copy-paste drift):

- **Web** — `saguaro-crm` (Next.js / Vercel → saguarocontrol.net)
- **Mobile** — `saguaro-field` (Expo / EAS → TestFlight)

Deterministic, integer-cents, framework-free (no React, no Next, no React Native). AI extracts/judges; **this engine computes**.

## Modules

| Import | What it does |
|---|---|
| `@saguaro/core` (barrel) | re-exports everything below |
| `@saguaro/core/money` | `toCents`/`addCents`/`percentOf`/`extend`/`roundHalfUp`/`formatUSD` — float-safe cents math |
| `@saguaro/core/units` | dimensional unit conversion (SY=9SF, CY=27CF, TON=2000LB) with incompatibility guards |
| `@saguaro/core/payapp` | AIA G702/G703 pay-application cross-footing (`computePayApp`) |
| `@saguaro/core/changeOrder` | revised-contract summary (`summarizeContract`) |
| `@saguaro/core/takeoff` | takeoff normalization + derived totals (labor rate, contingency) |
| `@saguaro/core/sanity` | plausibility flags (never mutates) |

## Usage

```ts
import { toCents, computePayApp } from '@saguaro/core';
```

## Develop

```bash
npm install
npm run build      # emits dist/ (JS + .d.ts) — what both apps consume
npm test           # runs the cross-foot proof (calc.test.ts) — must be all-pass
```

## Rule

**Never** re-implement any of this math inside `saguaro-crm` or `saguaro-field`. Add it here, bump the version, update both apps to the new version. That is the entire point of this package.
