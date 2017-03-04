import {DEFAULT_MSG_TRAITS} from './traits/messages_traits.es6'
// import middleware from '../src/uif/middleware.es6'
import * as dispatcher from './dispatcher.es6'
import * as handlers from './handlers.es6'
import {singleInstance} from './functional.es6'
import {Queue} from './core/queue.es6'
import * as Result from './core/result.es6'


// Runs the provided middleware chain
function runMiddlewares(middleware, onError, state, msg, result) {
  let runLayer = (state, layer)=> state.then( (v)=> layer(v, msg, result));
  return middleware.reduce(runLayer, Result.ok(state));
}


// Helper that dispatches messages one-by-one from the queue
// until its empty
function msgQueueResolver(middleware, onError, state, update) {
  return state.queue.reduce((state, msg)=>{
    return Result
      .from(update, state.model, msg)
      .map((result)=> runMiddlewares(middleware, onError, state,  msg, result))
      .withDefault(state);
  }, state);
}


// Dispatch messages until there is stuff in the queue.
//
// This is based on the assumption that update always returns ASAP, and any
// longer running stuff is issues via other systems
export function make({model, update}, middleware=[], onError=console.error) {

  if (!update) { throw new ArgumentError("No 'update' given"); }
  if (!model) { throw new ArgumentError("No 'model' given"); }

  // create the state
  let state = { model, queue: new Queue() };

  let dispatchMsgsInQueue = singleInstance(()=>{
    // update the state
    state = msgQueueResolver(middleware, onError, state, update);
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
    state: ()=> state,
  };
};
