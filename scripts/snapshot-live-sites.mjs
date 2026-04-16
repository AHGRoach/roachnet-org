import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = new URL("..", import.meta.url);
const snapshotRoot = new URL("../live-site-snapshots/", import.meta.url);

const allowedHosts = new Set([
  "roachnet.org",
  "accounts.roachnet.org",
  "apps.roachnet.org",
]);

const seedUrls = [
  "https://roachnet.org/",
  "https://roachnet.org/home/",
  "https://roachnet.org/iOS/",
  "https://roachnet.org/api/",
  "https://roachnet.org/brew/",
  "https://roachnet.org/roachclaw/",
  "https://accounts.roachnet.org/",
  "https://accounts.roachnet.org/roachclaw",
  "https://apps.roachnet.org/",
  "https://apps.roachnet.org/app-store-catalog.json",
];

const textTypes = [
  "text/html",
  "text/css",
  "application/javascript",
  "text/javascript",
  "application/json",
  "image/svg+xml",
];

const assetPattern =
  /(?:src|href)=["']([^"'#]+)["']|url\((?:'|")?([^)"']+)(?:'|")?\)|["'`]((?:\/|\.\/|\.\.\/)[^"'`?#]+\.(?:js|css|png|jpe?g|svg|gif|webp|ico|json|woff2?|ttf|otf|mp4))["'`]/g;

function normalizeUrl(candidate, baseUrl) {
  if (candidate.includes("${") || candidate.includes("%7B") || candidate.includes("{{")) {
    return null;
  }
  try {
    const url = new URL(candidate, baseUrl);
    url.hash = "";
    if (!allowedHosts.has(url.hostname)) {
      return null;
    }
    if (url.protocol !== "https:") {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function filePathForUrl(url, contentType) {
  const cleanPath = url.pathname.replace(/\/+$/, "");
  const hasExtension = /\.[a-z0-9]+$/i.test(cleanPath);

  let relativePath;
  if (!cleanPath || cleanPath === "") {
    relativePath = "index.html";
  } else if (url.pathname.endsWith("/")) {
    relativePath = path.join(cleanPath.slice(1), "index.html");
  } else if (!hasExtension && contentType.startsWith("text/html")) {
    relativePath = path.join(cleanPath.slice(1), "index.html");
  } else {
    relativePath = cleanPath.slice(1);
  }

  return path.join(snapshotRoot.pathname, url.hostname, relativePath);
}

function extractAssetUrls(body, baseUrl) {
  const discovered = [];
  for (const match of body.matchAll(assetPattern)) {
    const candidate = match[1] || match[2] || match[3];
    if (!candidate) continue;
    const normalized = normalizeUrl(candidate, baseUrl);
    if (normalized) {
      discovered.push(normalized.toString());
    }
  }
  return discovered;
}

async function fetchOne(urlString) {
  const response = await fetch(urlString, {
    headers: {
      "user-agent": "RoachNetLiveSnapshot/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const contentType = (response.headers.get("content-type") || "application/octet-stream")
    .split(";")[0]
    .trim()
    .toLowerCase();

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return { contentType, buffer };
}

async function main() {
  await rm(snapshotRoot, { recursive: true, force: true });
  await mkdir(snapshotRoot, { recursive: true });

  const queue = [...seedUrls];
  const seen = new Set();
  const manifest = [];

  while (queue.length) {
    const current = queue.shift();
    if (!current || seen.has(current)) continue;
    seen.add(current);

    const url = new URL(current);
    process.stdout.write(`snapshot ${url.hostname}${url.pathname}\n`);

    let result;
    try {
      result = await fetchOne(current);
    } catch (error) {
      manifest.push({
        url: current,
        error: error instanceof Error ? error.message : String(error),
      });
      continue;
    }

    const filePath = filePathForUrl(url, result.contentType);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, result.buffer);

    manifest.push({
      url: current,
      contentType: result.contentType,
      bytes: result.buffer.length,
      file: path.relative(rootDir.pathname, filePath),
    });

    if (textTypes.some((type) => result.contentType.startsWith(type))) {
      const body = result.buffer.toString("utf8");
      const discovered = extractAssetUrls(body, current);
      for (const discoveredUrl of discovered) {
        if (!seen.has(discoveredUrl)) {
          queue.push(discoveredUrl);
        }
      }

      if (current.endsWith("/app-store-catalog.json")) {
        try {
          const catalog = JSON.parse(body);
          for (const item of catalog.items || []) {
            for (const key of ["icon", "iconPath", "iconAsset", "previewImage", "preview", "image", "detailUrl"]) {
              if (typeof item[key] === "string") {
                const normalized = normalizeUrl(item[key], current);
                if (normalized && !seen.has(normalized.toString())) {
                  queue.push(normalized.toString());
                }
              }
            }
          }
        } catch {
          // Ignore malformed JSON in the snapshot manifest path.
        }
      }
    }
  }

  const manifestPath = path.join(snapshotRoot.pathname, "manifest.json");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  process.stdout.write(`saved ${manifest.length} live files into ${snapshotRoot.pathname}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
