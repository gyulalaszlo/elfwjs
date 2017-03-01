// The default children structure is simply accessing by
// name.
export const DEFAULT_CHILD_TRAITS = {

  // Returns the child for the given key
  get: (model, childKey)=> model[childKey],

  // function that updates a parent model based on the
  // childKey and the value returned by the handler
  update: (oldModel, childKey, childModel, childMsg)=> {
    oldModel[childKey] = childModel;
    return oldModel;
  },

  // Wraps a child local message into another
  wrapMsg: (msgWrapper, childKey, childModel, childMsg)=> {
    return msgWrapper(childMsg);
  }
};


