# roachnet.org

Public site and Apps catalog for RoachNet.

This repo ships the landing page, the iOS page, the API docs, and the separate Apps surface at `apps.roachnet.org`.

## What Lives Here

- `index.html`
  Main RoachNet landing page
- `ios/index.html`
  RoachNet iOS page
- `api/`
  Public API docs shell
- `app-store.html`
  Apps storefront UI
- `app-store-catalog.json`
  Generated install catalog consumed by the Apps UI
- `collections/`
  Source manifests for maps, education packs, Wikipedia bundles, and course shelves
- `assets/`
  Logos, screenshots, app icons, and branded storefront art
- `scripts/build-app-store-catalog.mjs`
  Rebuilds the Apps catalog from the collection manifests
- `scripts/build-apps-site.mjs`
  Builds the standalone Apps-site publish directory into `website-apps-dist/`

## Commands

```bash
npm run build:catalog
npm run build:apps
```
