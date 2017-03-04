
class Result {
  constructor(value, error) {
    this.value = value;
    this.error = error;
  }


  map(fn, ...args) {
    if (this.value) { return fn(this.value, ...args); }
    return this;
  }

  // Wraps the output / exception of applying fn to the value of the result
  // (if this result is ok)
  then(fn, ...args) {
    return this.map( (v)=> from(fn, v, ...args));
  }

  withDefault(val) {
    if (this.value) { return this.value; }
    return val;
  }


  thread(fns, ...args) {
    let i = 0, len = fns.length, val = this;

    while (true) {
      // if we have an error
      if (val.error) return val;
      // check if we have elements
      if (i >= len) return val;
      val = fns[i](val.value, ...args);
      // val = from(fns[i], val.value, ...args);
      // return on error

      // next
      ++i;
    }
  }

}



export function ok(value) { return new Result(value); }
export function error(err) { return new Result(undefined, err); }

// Wraps calling a handler. Catches errors. Use for semantics.
// Returns `{ value: v }` or `{ error: e }`
//
// (aka. its here so we can write `handlers.call( what, ...)` instead
// of `what(...)`, and that makes us look 100% cooler.
export function from( handler, ...args) {
  try {
    // try calling the handler
    return ok(handler(...args));
  } catch (e) {
    // report shit
    return error(e);
  }
}



// function resultMap( result, fn ) {
//   let {value, error} = result;
//   if (error) {
//     onError("Error during update:", error, {state, msg});
//     return state;
//   }

//   // run the middleware if we had no errors
//   let middlewareRes = runMiddleware(middleware, onError, state,  msg, value);
//   return middlewareRes;
// }

