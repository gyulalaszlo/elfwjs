// The default children structure is simply accessing by
// name.
export const DEFAULT_CHILD_TRAITS = {

  // Returns the child for the given key
  get: (model, child_key)=> model[child_key],

  // function that updates a parent model based on the
  // child_key and the value returned by the handler
  update: (old_model, child_key, child_model, child_msg)=> {
    old_model[child_key] = child_model;
    return old_model;
  },

  // Wraps a child local message into another
  wrap_msg: (msg_wrapper, child_key, child_model, child_msg)=> {
    return msg_wrapper(child_msg);
  }
};


