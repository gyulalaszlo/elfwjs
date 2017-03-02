import { DEFAULT_MSG_TRAITS } from './traits/messages_traits.es6'

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
  return new Dispatcher(target);
}
