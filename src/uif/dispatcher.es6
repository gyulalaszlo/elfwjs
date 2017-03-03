import { DEFAULT_MSG_TRAITS } from './traits/messages_traits.es6'


export let DEFAULT_ROOT_DISPATCHER_TRAITS = {
  init: (model, dispatch)=> {
    let queue = [];
    return { model, dispatch, queue };
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



class Dispatcher {
  // Creates a new dispatcher with the given message traits
  constructor(target, msgTraits) {
    this.target = target;
    this.msgTraits = msgTraits;
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
      (msg, ...args)=> target(msgGenerator(msg), ...args),
      this.msgTraits
    );
  }
}

export function make(target, msgTraits=DEFAULT_MSG_TRAITS) {
  return new Dispatcher(target, msgTraits);
}
