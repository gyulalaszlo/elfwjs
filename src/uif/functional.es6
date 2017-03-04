// Returns a wrapped function, that returns immediately
// if the function is already running (thereby hindering recursion)
//
// Allows only a single instance of the function to run
export function singleInstance(fn) {
  let isRunning = false;
  return (defaultValue, ...args)=> {
    if (isRunning) return defaultValue;
    isRunning = true;
    let o = fn(...args);
    isRunning = false;
    return o;
  };
}



export function reduction(fn, init) {
  let memo = init;
  return (el)=> {
    memo = fn(memo, el);
    return memo;
  }
}


