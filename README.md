# roachnet.org

Public website source for `roachnet.org` and `apps.roachnet.org`.

## Structure

- `index.html`
  Main landing page for RoachNet
- `app-store.html`
  Web storefront and native install handoff surface
- `app-store-catalog.json`
  Generated catalog consumed by the Apps UI
- `collections/`
  Source manifests for maps, education packs, and Wikipedia bundles
- `assets/`
  Logos, screenshots, and branded storefront icons
- `scripts/build-app-store-catalog.mjs`
  Rebuilds `app-store-catalog.json` from the collection manifests
- `scripts/build-apps-site.mjs`
  Builds the standalone Apps-site publish directory into `website-apps-dist/`

## Commands

```bash
npm run build:catalog
npm run build:apps
```
