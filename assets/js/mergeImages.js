export async function mergeBase64(base64s = [], config = {}) {
  const { quality } = {
    quality: 1,
    ...config
  };

  let imgs = await Promise.all(base64s.map(async x => await base642img(x)));
  let { width, height } = calcCanvas(imgs);
  let offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;
  let curTop = 0,
    imageContext = offscreenCanvas.getContext("2d");
  for (let img of imgs) {
    imageContext.drawImage(img, 0, curTop);
    curTop += img.height;
  }
  return offscreenCanvas.toDataURL("image/png");
}

export async function mergeFile(files = [], config = {}) {
  let base64s = await Promise.all(
    [...files].map(async x => await file2base64(x))
  );
  return mergeBase64(base64s, config);
}

export function file2base64(file) {
  return URL.createObjectURL(file);
}

export function base642img(imgFile) {
  return new Promise((resolve, reject) => {
    var img = new Image();
    img.onload = () => resolve(img);
    img.onerror = err => reject(err);
    img.src = imgFile;
  });
}

/**
 *
 * @param {Image[]} imgs
 */
function calcCanvas(imgs = []) {
  let width = 0,
    height = 0;
  for (let img of imgs) {
    width = Math.max(width, img.width);
    height += img.height;
  }
  return { width, height };
}
