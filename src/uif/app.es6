import {DEFAULT_MSG_TRAITS} from './traits/messages_traits.es6'
// import middleware from '../src/uif/middleware.es6'
import * as dispatcher from './dispatcher.es6'
import * as handlers from './handlers.es6'
import {singleInstance} from './functional.es6'
import {Queue} from './core/queue.es6'
import * as Result from './core/result.es6'


// Helper that dispatches messages one-by-one from the queue
// until its empty
function messageHandler(middleware, onError, update) {
  return (state, msg)=>
      // Call update
      Result.from(update, state.model, msg)
        // Run the middleware
        .map((result)=> {
          let runLayer = (state, layer)=> state.then( (v)=> layer(v, msg, result));
          return middleware.reduce(runLayer, Result.ok(state));
        })
        .mapError((err)=>{ onError(err); return err; })
        .withDefault(state);

}


// Dispatch messages until there is stuff in the queue.
//
// This is based on the assumption that update always returns ASAP, and any
// longer running stuff is issues via other systems
export function make({model, update}, middleware=[], onError=console.error) {

  if (typeof update === 'undefined') { throw new ArgumentError("No 'update' given"); }
  if (typeof model === 'undefined') { throw new ArgumentError("No 'model' given"); }

  // create the state
  let state = { model, queue: new Queue() };

  // Transforms state for each message in the queue
  let messageQueueReducer = messageHandler(middleware, onError, update);

  // Transforms state by folding the messages in the queue through
  // `messageQueueReducer`.
  //
  // By keeping it singleInstance, we can avoid recursion and instead use a
  // single flat queue.
  let dispatchMsgsInQueue = singleInstance(()=>{
    // update the state
    state = state.queue.reduce( messageQueueReducer, state);
  });

  // The actual dispatch function just pushes the message to the queue
  // and calls the queue resolver (which is singleInstance-ed, so it'll
  // be non-recursive)
  let dispatchImpl = (msg)=> {
    state.queue.push(msg);
    dispatchMsgsInQueue();
  };

  // create the dispatcher function and make it accessible
  state.dispatcher = dispatcher.make(dispatchImpl);

  return {
    dispatcher: ()=> state.dispatcher,
    model: ()=> state.model,
    // f0r d3bug, plz no use if can have
    state: ()=> state,
  };
};
