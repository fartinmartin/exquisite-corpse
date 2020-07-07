const floodFill = (x, y, targetColor, replacementColor) => {
  let ctx = state.canvas;

  if (x < 0 || x > ctx.width - 1) return;
  if (y < 0 || y > ctx.height - 1) return;

  if (targetColor === replacementColor) return;
  if (getPixelColor(x, y) !== targetColor) return;

  setPixelColor(x, y, replacementColor);

  handleFill(x + 1, y, targetColor, replacementColor);
  handleFill(x - 1, y, targetColor, replacementColor);
  handleFill(x, y + 1, targetColor, replacementColor);
  handleFill(x, y - 1, targetColor, replacementColor);

  return;
};

const getPixelColor = (x, y) => {
  let ctx = state.canvas;

  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const offset = (y * imageData.width + x) * 4;

  return [
    imageData.data[offset + 0],
    imageData.data[offset + 1],
    imageData.data[offset + 2],
    imageData.data[offset + 3],
  ];
};

const setPixelColor = (x, y, replacementColor) => {
  let ctx = state.canvas;

  const imageData = ctx.getImageData(x, y, ctx.canvas.width, ctx.canvas.height);
  const offset = (y * imageData.width + x) * 4;

  imageData.data[offset + 0] = replacementColor[0];
  imageData.data[offset + 1] = replacementColor[1];
  imageData.data[offset + 2] = replacementColor[2];
  imageData.data[offset + 3] = replacementColor[3];
};

export const hexToRgb = (hex) => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
        255,
      ]
    : null;
};

// below is pasted from DrawingBoard.vue

const floodFill = (x, y, targetColor, replacementColor) => {
  let ctx = state.canvas;

  let currentPixelColor = getPixelColor(x, y);

  if (x < 0 || x > ctx.width - 1) return;
  if (y < 0 || y > ctx.height - 1) return;

  if (targetColor === replacementColor) return;
  if (!colorsMatch(currentPixelColor, targetColor)) return;

  setPixelColor(x, y, replacementColor);

  floodFill(x + 1, y, targetColor, replacementColor);
  floodFill(x - 1, y, targetColor, replacementColor);
  floodFill(x, y + 1, targetColor, replacementColor);
  floodFill(x, y - 1, targetColor, replacementColor);
  return;
};

const floodFillStack = (x, y, targetColor, replacementColor) => {
  let ctx = state.canvas;
  let nodes = [{ x, y }];

  while (nodes.length > 0) {
    const { x: nodeX, y: nodeY } = nodes.pop();

    if (nodeX < 0 || nodeX > ctx.width - 1) continue;
    if (nodeY < 0 || nodeY > ctx.height - 1) continue;

    const nodeColor = getPixelColor(nodeX, nodeY);

    if (nodeColor === replacementColor) continue;
    console.log(nodeColor, targetColor, nodeColor !== targetColor);
    console.log(!colorsMatch(nodeColor, targetColor));
    if (nodeColor !== targetColor) continue;

    setPixelColor(nodeX, nodeY, replacementColor);

    nodes.push({ x: nodeX + 1, y: nodeY });
    nodes.push({ x: nodeX - 1, y: nodeY });
    nodes.push({ x: nodeX, y: nodeY + 1 });
    nodes.push({ x: nodeX, y: nodeY - 1 });
  }
};

const getPixelColor = (x, y) => {
  let ctx = state.canvas;

  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const offset = (y * imageData.width + x) * 4;

  return [
    imageData.data[offset + 0],
    imageData.data[offset + 1],
    imageData.data[offset + 2],
    imageData.data[offset + 3],
  ];
};

const setPixelColor = (x, y, replacementColor) => {
  let ctx = state.canvas;

  const imageData = ctx.getImageData(x, y, ctx.canvas.width, ctx.canvas.height);
  const offset = (y * imageData.width + x) * 4;

  imageData.data[offset + 0] = replacementColor[0];
  imageData.data[offset + 1] = replacementColor[1];
  imageData.data[offset + 2] = replacementColor[2];
  imageData.data[offset + 3] = replacementColor[3];
};

const hexToRgb = (hex) => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
        255,
      ]
    : null;
};

const colorsMatch = (color1, color2) => {
  return (
    color1[0] === color2[0] &&
    color1[1] === color2[1] &&
    color1[2] === color2[2] &&
    color1[3] === color2[3]
  );
};
