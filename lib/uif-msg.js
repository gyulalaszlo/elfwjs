/*
 * Creates a message
 */
export function make(name, values) {
  return { name: name, values: values };
}

/*
 * Generator that allow easy creation of message types
 */
export function generator(msgs) {
  var o = {};
  // Build a message
  msgs.forEach(function (name) {
    o[name] = function () {
      for (var _len = arguments.length, values = Array(_len), _key = 0; _key < _len; _key++) {
        values[_key] = arguments[_key];
      }

      return make(name, values);
    };
  });
  return o;
};