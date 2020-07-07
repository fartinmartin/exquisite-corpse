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

export const getPixel = (imageData, x, y) => {
  const offset = (y * imageData.width + x) * 4;
  return [
    imageData.data[offset + 0],
    imageData.data[offset + 1],
    imageData.data[offset + 2],
    imageData.data[offset + 3],
  ];
};

export const setPixel = (imageData, x, y, currentColor) => {
  const offset = (y * imageData.width + x) * 4;
  return [
    (imageData.data[offset + 0] = currentColor[0]),
    (imageData.data[offset + 1] = currentColor[1]),
    (imageData.data[offset + 2] = currentColor[2]),
    (imageData.data[offset + 3] = currentColor[3]),
  ];
};

export const colorsMatch = (color1, color2) => {
  return (
    color1[0] === color2[0] &&
    color1[1] === color2[1] &&
    color1[2] === color2[2] &&
    color1[3] === color2[3]
  );
};

let fillStack = [];

export const floodFill = (imageData, x, y, targetColor, currentColor) => {
  console.log(targetColor, currentColor);
  if (colorsMatch(targetColor, currentColor)) return;
  const newColor = setPixel(imageData, x, y, currentColor);
  fillStack.push(imageData, x + 1, y, targetColor, newColor);
  fillStack.push(imageData, x - 1, y, targetColor, newColor);
  fillStack.push(imageData, x, y + 1, targetColor, newColor);
  fillStack.push(imageData, x, y - 1, targetColor, newColor);
};

export const fillColor = (ctx) => {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (fillStack.length) {
    let range = fillStack.length;
    for (let i = 0; i < range; i++) {
      floodFill(
        fillStack[i][0],
        fillStack[i][1],
        fillStack[i][2],
        fillStack[i][3]
      );
    }

    fillStack.splice(0, range);

    fillColor(ctx);
  } else {
    ctx.putImageData(imageData, 0, 0);
    fillStack = [];
  }
};
