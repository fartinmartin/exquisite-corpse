/**
 * Turns a section thumbnail into a faint sky-blue watermark for the
 * background doodles: everything that isn't the drawing's background colour,
 * in blue. Done once per section, in the browser.
 */

const cache = new Map<string, Promise<string>>();

export function tint(id: string, src: string): Promise<string> {
  let hit = cache.get(id);
  if (!hit) {
    hit = run(src);
    cache.set(id, hit);
  }
  return hit;
}

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

const W = 360;
const H = 120;
const SKY = [0, 100, 255];

async function run(src: string): Promise<string> {
  const image = await load(src);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(image, 0, 0, W, H);
  const { data } = ctx.getImageData(0, 0, W, H);

  // the background is the most common colour (coarsely quantised)
  const counts = new Map<number, number>();
  for (let i = 0; i < data.length; i += 16) {
    const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let bgKey = 0;
  let best = 0;
  for (const [key, count] of counts) {
    if (count > best) {
      best = count;
      bgKey = key;
    }
  }
  const bg = [((bgKey >> 8) & 15) * 16 + 8, ((bgKey >> 4) & 15) * 16 + 8, (bgKey & 15) * 16 + 8];

  const out = ctx.createImageData(W, H);
  for (let i = 0; i < data.length; i += 4) {
    const fromBg = Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]);
    out.data[i] = SKY[0];
    out.data[i + 1] = SKY[1];
    out.data[i + 2] = SKY[2];
    // ignore near-background noise so the sheet itself doesn't show as a rectangle
    out.data[i + 3] = fromBg < 60 ? 0 : Math.min(255, Math.round((fromBg - 60) * 1.1));
  }

  ctx.clearRect(0, 0, W, H);
  ctx.putImageData(out, 0, 0);
  return canvas.toDataURL("image/png");
}
