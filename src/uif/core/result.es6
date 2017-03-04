// helper that wraps the different threading function
function threadImpl(res, wrapper, fns, args) {
    let i = 0, len = fns.length, val = res;

    while (true) {
      // if we have an error
      if (val._kind === ERROR) return val;
      // check if we have elements
      if (i >= len) return val;
      val = wrapper(fns[i], val._value, args);
      // next
      ++i;
    }
}

export const OK = 0x12;
export const ERROR = 0x13;


// The Elm guide says:
//
// >  Result is the result of a computation that may fail. This is a great way
// > to manage errors [...]
class Result {
  constructor(value, error) {
    this._value = value;
    this._error = error;
    this._kind = (typeof error !== 'undefined') ? ERROR : OK;
  }


  isOk() { return this._kind === OK; }
  isError() { return this._kind === ERROR; }

  // Accessors
  getKind() { return this._kind; }
  getValue() { return this._value; }
  getError() { return this._error; }


  // > Apply a function to a result. If the result is Ok, it will be converted.
  // > If the result is an Err, the same error value will propagate through.
  map(fn, ...args) {
    if (this._kind === OK) { return fn(this._value, ...args); }
    return this;
  }

  // > Chain together a sequence of computations that may fail.
  // > [...]  we only continue with the callback if things are going well
  //
  // Wraps the output / exception of applying fn to the value of the result
  // (if this result is ok)
  then(fn, ...args) {
    return this.map( (v)=> from(fn, v, ...args));
  }

  // Threading
  // ---------

  // If the result is Ok return the value, but if the result is an Err then
  // return a given default value. 
  withDefault(val) {
    if (this._kind === OK) { return this._value; }
    return val;
  }


  threadMap(fns, ...args) {
    return threadImpl(this, call, fns, args);
  }

  threadAsFirst(fns, ...args) {
    return threadImpl(this, from, fns, args);
  }

  // Handling errors
  // ---------------


  // Throws the error as an exception if the we are an Error.
  // Then returns the object
  throwOnError() {
    if (this._kind === ERROR) { throw this._error; }
    return this;
  }


  mapError(fn) {
    if (this._kind === ERROR) { return error(fn(this._error)); }
    return this;
  }

}


//
// > A Result is either Ok meaning the computation succeeded, or it is an Err
// > meaning that there was some failure.
//
export function ok(value) { return new Result(value); }
export function error(err) { return new Result(undefined, err); }

//
// Wraps calling a handler. Catches errors. Retursn a result. Use for semantics.
//
// (aka. its here so we can write `handlers.call( what, ...)` instead
// of `what(...)`, and that makes us look 100% cooler.
export function from( fn, ...args) {
  try {
    // try calling the handler
    return ok(fn(...args));
  } catch (e) {
    // report shit
    return error(e);
  }
}

// A wrapper that simply calls fn with args. Has the same signature as `from`
// so they can be used interchangeably.
export function call( fn, ...args) { return fn(...args); }



