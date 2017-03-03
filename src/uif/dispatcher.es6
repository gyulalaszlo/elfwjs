

export let DEFAULT_ROOT_DISPATCHER_TRAITS = {
  init: (state)=> {
    return state;
  },

  reduce: (state, { model, toParentMessages })=> {
    state.model = model;
    // if we have messages to the parent
    if (toParentMessages && toParentMessages.length > 0) {
      state.queue = state.queue.concat(toParentMessages);
    }
    return state;
  }
};


// A root dispatcher that just returns stuff
export let  NOOP_ROOT_WRAPPER_TRAITS = {
  init: (state)=> {
    return state;
  },

  reduce: (state,  newModel)=> {
    state.model = newModel;
    return state;
  }
}



class Dispatcher {
  // Creates a new dispatcher with the given message traits
  constructor(target) {
    this.target = target;
  }

  // dispatch a message to our target
  dispatch(...args) {
    return this.target(...args);
  }


  // Returns a new dispatcher that wraps the messages emitted by this
  // dispatcher in another message
  //
  wrap(msgGenerator) {
    // store the target in a local
    let target = this.target;
    return new Dispatcher(
      (msg, ...args)=> target(msgGenerator(msg), ...args)
    );
  }
}

export function make(target) {
  return new Dispatcher(target);
}
