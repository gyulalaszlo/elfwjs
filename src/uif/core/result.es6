// helper that wraps the different threading function
function threadImpl(res, wrapper, fns, args) {
    let i = 0, len = fns.length, val = res;

    while (true) {
      // if we have an error
      if (val.error) return val;
      // check if we have elements
      if (i >= len) return val;
      val = wrapper(fns[i], val.value, args);
      // next
      ++i;
    }
}

export const OK = 0x12;
export const ERROR = 0x13;

class Result {
  constructor(value, error) {
    this.value = value;
    this.error = error;
    this._kind = (typeof error !== 'undefined') ? ERROR : OK;
  }


  isOk() { return this._kind === OK; }
  isError() { return this._kind === ERROR; }
  kind() { return this._kind; }


  map(fn, ...args) {
    if (this._kind === OK) { return fn(this.value, ...args); }
    return this;
  }

  // Wraps the output / exception of applying fn to the value of the result
  // (if this result is ok)
  then(fn, ...args) {
    return this.map( (v)=> from(fn, v, ...args));
  }

  withDefault(val) {
    if (this._kind === OK) { return this.value; }
    return val;
  }


  threadMap(fns, ...args) {
    return threadImpl(this, (fn,v, args)=> fn(v, ...args), fns, args);
  }

  threadAsFirst(fns, ...args) {
    let wrapper = (fn, v, args)=> {
      let o =from(fn,v, args);
      return o;
    }

    return threadImpl(this, wrapper, fns, args);
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



