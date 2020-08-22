import floodFill from "~/assets/js/floodFill";

function initCanvas(canvas, whiteBG) {
  let rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * devicePixelRatio;
  canvas.height = rect.height * devicePixelRatio;

  ctx.scale(devicePixelRatio, devicePixelRatio);

  canvas.style.width = rect.width + "px";
  canvas.style.height = rect.height + "px";

  // white background (?) 🚨 MAYBE: this should just happen on save to PNG
  if (whiteBG) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

export async function makeDrawing(drawing, callback, duration) {
  if (duration) {
    const waitFor = (ms) => new Promise((r) => setTimeout(r, ms));
    const totalPoints = drawing.reduce((c, p) => (c += p.length), 0);
    const delay = duration / totalPoints;

    for (const path of drawing) {
      for (const point of path) {
        await waitFor(delay);
        callback(point);
      }
    }
  } else {
    for (const path of drawing) {
      for (const point of path) {
        callback(point);
      }
    }
  }
}

function handleDraw(ctx, p) {
  let point;

  if (this.mode === "draw") {
    const temp = {
      mode: this.mouseMode,
      color: this.palette.current,
      size: this.size.current,
      x1: this.x,
      y1: this.y,
      x2: e.offsetX,
      y2: e.offsetY,
    };
    if (this.isMobile) {
      point = this.handleResponsiveDraw(temp, "size"); // might still work, checking if pixelate() is throwing vuex erros
    } else {
      point = temp;
    }
  } else {
    if (this.isMobile) {
      point = this.handleResponsiveDraw(e);
    } else {
      point = e; // e = point passed from this.makeDrawing()
    }
  }

  switch (point.mode) {
    case "draw":
    case "erase":
      if (point.x1 === point.x2 && point.y1 === point.y2) {
        drawCircle(ctx, point);
      } else {
        drawPath(ctx, point);
      }
      break;
    case "fill":
      // drawFill(ctx, point);
      break;
    case "clear":
      // clearCanvas(ctx);
      break;
    default:
      break;
  }
}

function scalePoint(point, justSize = false) {
  const width = 1080;
  const current = this.$refs.canvas.width;
  const f = width / current;

  let newPoint;
  if (justSize) {
    newPoint = point;
    newPoint.size = Math.round(point.size / f);
  } else {
    newPoint = { mode: point.mode, color: point.color };
    newPoint.x1 = Math.round(point.x1 / f);
    newPoint.x2 = Math.round(point.x2 / f);
    newPoint.y1 = Math.round(point.y1 / f);
    newPoint.y2 = Math.round(point.y2 / f);
    newPoint.size = Math.round(point.size / f);
  }

  return newPoint;
}

function drawCircle(ctx, point) {
  if (point.mode === "erase") {
    ctx.globalCompositeOperation = "destination-out";
  }

  ctx.beginPath();
  ctx.arc(point.x1, point.y1, point.size, 0, 2 * Math.PI, true);
  ctx.fillStyle = point.color;
  ctx.fill();

  if (point.mode === "erase") {
    ctx.globalCompositeOperation = "source-over";
  }
}

function drawPath(ctx, point) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = point.color;
  ctx.lineWidth = point.size * 2;

  if (point.mode === "erase") {
    ctx.globalCompositeOperation = "destination-out";
  }

  ctx.beginPath();
  ctx.moveTo(point.x1, point.y1);
  ctx.lineTo(point.x2, point.y2);
  ctx.stroke();
  ctx.closePath();

  if (point.mode === "erase") {
    ctx.globalCompositeOperation = "source-over";
  }
}

function drawFill(ctx, point) {
  ctx.fillStyle = point.color;
  const tolerance = 50;
  const dprPoint = {
    x2: point.x2 * devicePixelRatio,
    y2: point.y2 * devicePixelRatio,
  };
  floodFill.fill(dprPoint.x2, dprPoint.y2, tolerance, ctx);
}

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

async function pixelateDrawing(ctx, v = 75) {
  const dpr = devicePixelRatio;
  const value = v * dpr;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  // dim output and turn off image smoothing for pixelated effect (prefixed in some browsers)
  ctx.filter = "opacity(50%)";
  ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = ctx.msImageSmoothingEnabled = ctx.webkitImageSmoothingEnabled = false;

  // get current image
  const imgData = ctx.getImageData(0, 0, w * dpr, h * dpr);
  const img = await createImageBitmap(imgData);

  // scale factor
  const fw = (img.width / value) | 0;
  const fh = (img.height / value) | 0;

  // draw current image at scaled factor (aka really small and in the top left corner)
  ctx.drawImage(img, 0, 0, fw, fh);

  // take that small corner bit and enlarge it to full canvas size (aka pixelate it)
  const imgData2 = ctx.getImageData(0, 0, fw, fh);
  const img2 = await createImageBitmap(imgData2);
  clearCanvas(ctx);
  ctx.drawImage(img2, 0, 0, fw, fh, 0, 0, w / dpr, h / dpr);

  // remove white bg on meta-box div
  // $refs.notAllowed.bg();
  //
  // 🚨 NOTE:
  //  this seems like separate functionality.
  //  i think it should be called from the same function that calls pixelateDrawing()
  //  this might require pixelateDrawing() to return a promise
  //  that way it would ensure that pixelateDrawing() was a success before removing bg
}
