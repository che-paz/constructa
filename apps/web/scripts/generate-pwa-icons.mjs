import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "../public/icons");
await mkdir(outDir, { recursive: true });

async function createIcon(size) {
  const fontSize = Math.floor(size * 0.45);
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f97316" rx="${Math.floor(size * 0.12)}"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="700" fill="white">C</text>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(join(outDir, `icon-${size}.png`));
}

await createIcon(192);
await createIcon(512);
console.log("PWA icons generated in public/icons/");
