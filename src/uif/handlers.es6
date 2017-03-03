
// Wraps calling a handler. Catches errors. Use for semantics.
// Returns `{ value: v }` or `{ error: e }`
//
// (aka. its here so we can write `handlers.call( what, ...)` instead
// of `what(...)`, and that makes us look 100% cooler.
export function call( handler, ...args) {
  try {
    // try calling the handler
    let result = handler(...args);
    return { value: result };
  } catch (e) {
    // report shit
    return { error: e };
  }
}
