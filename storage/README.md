# Apps Download Descriptors

Apps.RoachNet.org is the public install surface for optional RoachNet content.

The site does not host multi-gigabyte archives from this machine, Netlify, or R2. It hosts small same-origin descriptors under:

```text
https://apps.roachnet.org/downloads/
```

Each descriptor carries:

- the expected filename
- byte size
- sha256 digest
- chunk metadata for first-party packs
- public source URLs
- the RoachNet pack kind and tier

The native app resolves the descriptor, downloads from the first usable public source, reassembles chunked first-party packs when needed, verifies the archive, and only then installs it.

## Why This Shape

The page stays the shelf. The bytes stay on public rails.

That keeps the catalog easy to audit, keeps Netlify small, avoids Cloudflare R2 limits, and avoids quietly turning one Mac into production infrastructure.

## Current Public Source Lane

Use Internet Archive items for first-party optional packs unless a better public mirror is added. It is aligned with the preservation story and does not make RoachNet depend on a private bucket.

Run:

```sh
npm run stage:apps-model-packs
```

That writes descriptor JSON for every static artifact-backed Apps item plus checksum sidecars for first-party local archives. It does not copy ZIP archives into the site.

After `ia configure` is set up for the RoachWares Internet Archive account, publish the chunked archives with:

```sh
npm run publish:apps-model-packs:ia
```

The script uploads small `.sha256` sidecars plus RoachNet-wrapped archive chunks to:

```text
https://archive.org/details/roachnet-apps-catalog-v1_0_5
```

Use a capped smoke before a full mirror publish:

```sh
npm run publish:apps-model-packs:ia -- --dry-run --max-parts=2
npm run publish:apps-model-packs:ia -- --max-parts=1
```

The chunk envelope is intentional. Internet Archive validates archive-looking uploads; a raw first chunk of a ZIP looks like a corrupt ZIP. The `ROACHNET-IA-CHUNK-v1` envelope makes each part opaque storage, and the native app strips the envelope before verifying each payload chunk and the final archive SHA.

Default chunk size is 8 MiB. That keeps the lane resumable without turning a 1.8 GB model shelf into thousands of tiny PUT requests. Override it only when the archive.org transport is misbehaving:

```sh
ROACHNET_IA_CHUNK_BYTES=$((4 * 1024 * 1024)) npm run stage:apps-model-packs
```

The upload command is intentionally quiet, capped to `512k`, and forced through IPv4/TLS 1.2 by default because archive.org can drop long TLS writes from macOS curl. Override the cap when the network is clean:

```sh
ROACHNET_IA_LIMIT_RATE=2m npm run publish:apps-model-packs:ia
```

Each part also has a script-level retry wrapper around curl's own retry budget, so a single ugly IA write does not kill the whole shelf. Tune it only when archive.org is having a bad day:

```sh
ROACHNET_IA_FILE_ATTEMPTS=10 npm run publish:apps-model-packs:ia
```

Descriptor safety rule: generated first-party chunk sources default to `upload-required`. After every part for an archive is published and verified, regenerate descriptors with:

```sh
ROACHNET_IA_PARTS_STATUS=published-after-upload npm run stage:apps-model-packs
```

Until that status flips, the native app refuses to install from incomplete chunk manifests instead of walking users into dead downloads.

Current v1.0.5 state: the full first-party RoachSpeech shelf is published to `roachnet-apps-catalog-v1_0_5` with `229` wrapped parts. A redirect-aware remote `HEAD` verifier checked every part and matched the encoded byte lengths from `downloads/model-packs/index.json`.

The full Apps catalog now has descriptor coverage. External maps, ZIMs, Wikipedia options, and course packs keep their original source URL active and reserve an Internet Archive mirror URL in the descriptor. First-party local model packs are the only files this repo can upload immediately because those ZIPs exist in the local release build.

If a descriptor checksum and local `.sha256` sidecar disagree, the script stops before uploading.
