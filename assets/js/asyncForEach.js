// https://gist.github.com/Atinux/fd2bcce63e44a7d3addddc166ce93fb2
const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const waitFor = ms => new Promise(r => setTimeout(r, ms));

export default asyncForEach;
