function make(name, values) {
  return { name, values }; 
}


function get_name(msg, obj) { return msg.name; }
function get_value(msg, obj) { return msg.values; }

/*
 * Generator that allow easy creation of message types
 */
function generator(msgs) {
  let o = {};
  // Build a message
  msgs.forEach((name)=> {
    o[name] = (value)=> make(name, value);
  });
  return o;
};



// Describes messages.
export const DEFAULT_MSG_TRAITS = {
  // Getting the name and the value
  get_name: get_name,
  get_value: get_value,

  // make a new message if needed
  make: make,
  generator: generator,
};

