import floodFill from "~/assets/js/floodFill";

const dpr = process.client && window.devicePixelRatio;
const isMobile = () => process.client && window.innerWidth < 571;

export function initCanvas(canvas, { scale = dpr, bg = "#ffffff" } = {}) {
  const rect = canvas.getBoundingClientRect();
  const ctx = canvas.getContext("2d");

  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;

  ctx.scale(scale, scale);

  canvas.style.width = rect.width + "px";
  canvas.style.height = rect.height + "px";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export async function makeDrawing(ctx, drawing, duration) {
  if (duration) {
    const waitFor = (ms) => new Promise((r) => setTimeout(r, ms));
    const totalPoints = drawing.reduce((c, p) => (c += p.length), 0);
    const delay = duration / totalPoints;

    for (const path of drawing) {
      for (const point of path) {
        await waitFor(delay);
        handleDraw(ctx, point);
      }
    }
  } else {
    for (const path of drawing) {
      for (const point of path) {
        handleDraw(ctx, point);
      }
    }
  }
}

export function handleDraw(ctx, point, mode) {
  let p;
  isMobile() ? (p = scalePoint(ctx, point, mode)) : (p = point);

  switch (p.mode) {
    case "draw":
      p.x1 === p.x2 && p.y1 === p.y2 ? drawCircle(ctx, p) : drawPath(ctx, p);
      break;
    case "erase":
      ctx.globalCompositeOperation = "destination-out";
      p.x1 === p.x2 && p.y1 === p.y2 ? drawCircle(ctx, p) : drawPath(ctx, p);
      ctx.globalCompositeOperation = "source-over";
      break;
    case "fill":
      drawFill(ctx, p);
      break;
    case "clear":
      clearCanvas(ctx);
      break;
    default:
      break;
  }
}

export function scalePoint(ctx, point, mode) {
  let p = { ...point };
  const f = 1080 / ctx.canvas.width;

  if (mode === "draw") {
    p.size = Math.round(point.size / f);
  } else {
    p.x1 = Math.round(point.x1 / f);
    p.x2 = Math.round(point.x2 / f);
    p.y1 = Math.round(point.y1 / f);
    p.y2 = Math.round(point.y2 / f);
    p.size = Math.round(point.size / f);
  }

  return p;
}

function drawCircle(ctx, point) {
  ctx.beginPath();
  ctx.arc(point.x1, point.y1, point.size, 0, 2 * Math.PI, true);
  ctx.fillStyle = point.color;
  ctx.fill();
}

function drawPath(ctx, point) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = point.color;
  ctx.lineWidth = point.size * 2;

  ctx.beginPath();
  ctx.moveTo(point.x1, point.y1);
  ctx.lineTo(point.x2, point.y2);
  ctx.stroke();
  ctx.closePath();
}

function drawFill(ctx, point) {
  ctx.fillStyle = point.color;
  floodFill.fill(point.x2 * dpr, point.y2 * dpr, 50, ctx);
}

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export async function pixelateDrawing(ctx, size = 75) {
  const s = size * dpr;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  // dim output and turn off image smoothing for pixelated effect (prefixed in some browsers)
  ctx.filter = "opacity(50%)";
  ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = ctx.msImageSmoothingEnabled = ctx.webkitImageSmoothingEnabled = false;

  // get current image
  const currentImgData = ctx.getImageData(0, 0, w * dpr, h * dpr);
  const currentImg = await createImageBitmap(currentImgData);

  // scale factor
  const fw = (currentImg.width / s) | 0;
  const fh = (currentImg.height / s) | 0;

  // draw current image at scaled factor (aka really small and in the top left corner)
  ctx.drawImage(currentImg, 0, 0, fw, fh);

  // take that small corner bit and enlarge it to full canvas size (aka pixelate it)
  const smallImgData = ctx.getImageData(0, 0, fw, fh);
  const smallImg = await createImageBitmap(smallImgData);
  clearCanvas(ctx);
  ctx.drawImage(smallImg, 0, 0, fw, fh, 0, 0, w / dpr, h / dpr);
}
