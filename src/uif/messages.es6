/*
 * Creates a message
 */
export function make(name, values) {
  return { name, values }; 
}

/*
 * Generator that allow easy creation of message types
 */
export function generator(msgs) {
  let o = {};
  // Build a message
  msgs.forEach((name)=> {
    o[name] = (value)=> make(name, value);
  });
  return o;
};


/*
 * Wraps a message in another. Useful for child components
 */
export function wrapped(dispatch, msg_generator) {
  if (!dispatch) {
    throw new Error("No dispatch given to 'msg.wrapped'. Maybe forgotten to pass it?");
  }
  if (!msg_generator) {
    throw new Error("No message wrapper given to 'msg.wrapped'. Mistyped message name maybe? ");
  }
  return (inner)=> dispatch(msg_generator(inner));
}
