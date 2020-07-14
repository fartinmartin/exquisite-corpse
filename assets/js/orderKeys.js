export function orderKeys(obj, expected) {
  var keys = Object.keys(obj).sort(function keyOrder(k1, k2) {
    if (k1 < k2) return -1;
    else if (k1 > k2) return +1;
    else return 0;
  });

  var i,
    after = {};
  for (i = 0; i < keys.length; i++) {
    after[keys[i]] = obj[keys[i]];
    delete obj[keys[i]];
  }

  for (i = 0; i < keys.length; i++) {
    obj[keys[i]] = after[keys[i]];
  }
  return obj;
}
