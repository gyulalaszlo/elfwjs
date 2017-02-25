/*
 * Creates a message
 */
export function make(name, values) { return { name, values }; }

/*
 * Generator that allow easy creation of message types
 */
export function generator(msgs) {
  let o = {};
  // Build a message
  msgs.forEach((name)=> {
    o[name] = (...values)=> make(name, values);
  });
  return o;
};


/*
 * Wraps a message in another. Useful for child components
 */
export function wrapped(dispatch, msg_generator) {
  return (inner)=> dispatch(msg_generator(inner));
}
