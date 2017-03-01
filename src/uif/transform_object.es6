const ADD = 'add';
const REPLACE = 'replace';
const REMOVE = 'remove';


function isUndefined(v) {
  return (typeof v === 'undefined');
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
    if (typeof oldValue === 'undefined') { return patches; }
    let path = `/${k}`;
    // remove and generate patch
    patches.push({op: REMOVE, path: `/${k}`})
    delete obj[k];
    return patches;
  }, []);

  return { value: obj, patches };
}


export function update(obj, key, fn) {
  let oldValue = obj[key], value = fn(oldValue);
  let path = `/${key}`;
  let op  = isUndefined(value) ? ADD : REPLACE;
  obj[key] = value;
  return { value: obj, patches: [{ op, path, value }]};
}
