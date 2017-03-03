// Returns a wrapped function, that returns immediately
// if the function is already running (thereby hindering recursion)
//
// Allows only a single instance of the function to run
export function singleInstance(fn) {
  let isRunning = false;
  return (...args)=> {
    if (isRunning) return null;
    isRunning = true;
    fn(...args);
    isRunning = false;
  };
}



