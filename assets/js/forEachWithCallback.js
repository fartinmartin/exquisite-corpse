function forEachWithCallback(callback) {
  const arrayCopy = this;
  let index = 0;
  const next = () => {
    index++;
    if (arrayCopy.length > 0) {
      callback(arrayCopy.shift(), index, next);
    }
  };
  next();
}

Array.prototype.forEachWithCallback = forEachWithCallback;
