const ADD = 'add';
const REPLACE = 'replace';
const REMOVE = 'remove';

// checking if something is an array


var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
var isArrayLike = function(collection) {
  var length = collection.length;
  return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
};



let isArray = Array.isArray ? Array.isArray : isArrayLike;

function isUndefined(v) {
  return (typeof v === 'undefined');
}


// Replaces a with b.
// This function is useful in conjunction with updateIn
export function replace(a,b) {
  return { value: b, patches: [{ op: REPLACE, path: '/', value: b}]};
}

// Adds elements by key to an object (or array)
export function assoc(obj, attrs) {
  let patches = Object.keys(attrs).map((k)=>{
    // test if we have an undefined value
    let oldValue = obj[k], value = attrs[k], path = `/${k}`;
    let op = isUndefined(oldValue) ? ADD : REPLACE;
    // update and generate patch
    obj[k] = value;
    return { op, path, value };
  });

  return { value: obj, patches };
}




// Removes keys from an object (or elements from an array)
export function dissoc(obj, keys) {
  let patches = keys.reduce((patches,k)=>{
    let oldValue = obj[k];
    // skip patch if we never had a value there
    if (isUndefined(oldValue)) { return patches; }
    let path = `/${k}`;
    // remove and generate patch
    patches.push({op: REMOVE, path: `/${k}`})
    delete obj[k];
    return patches;
  }, []);

  return { value: obj, patches };
}


// Updates a single key in an object by calling fn on them
export function update(obj, key, fn) {
  let oldValue = obj[key], value = fn(oldValue);
  let path = `/${key}`;
  let op  = isUndefined(value) ? ADD : REPLACE;
  obj[key] = value;
  return { value: obj, patches: [{ op, path, value }]};
}


// ARRAY OPEARATIONS
// =================


// Appends an element to the end of an array
export function conj(arr, el) {
  if (isUndefined(el)) { return { value: arr, patches: [] }; };
  let path = `/${arr.length}`;
  arr.push(el);
  return { value: arr, patches: [{op: ADD, path, value: el }] };
}

// Removes  elements from the end of an array
export function disj(arr, el) {
  // only valid for arrays
  const nothing = { value: arr, patches: [] };
  if (isUndefined(el) || !isArray(arr)) { return nothing; };

  // no patch if not not in the array
  let idx = arr.indexOf( el );
  if (idx == -1) { return nothing; }

  // patch
  let path = `/${idx}`;
  // delete a[idx];
  arr.splice(idx, 1);
  return { value: arr, patches: [{op: REMOVE, path, value: el }] };
}


export function updateIn(obj, path, fn, ...args) {
  let o = obj;

  // if the path is 0 length, we are doing a simple replace
  if (path.length == 0) {
    return fn(obj, ...args);
  }

  // step through the path
  let last = path.length - 1;
  for (let i = 0; i < last; ++i) {
    o = obj[path[i]];
  }

  let p = path[last];
  let { value, patches } = fn( o[p], ...args);

  // update the current target
  o[p] =  value;
  // update the patch paths
  patches.forEach((patch)=>{
    let subPath = patch.path.split('/').filter((e)=> e.length > 0);
    patch.path = `/${path.concat(subPath).join('/')}`;
  });

  return { value: obj, patches: patches}


}
