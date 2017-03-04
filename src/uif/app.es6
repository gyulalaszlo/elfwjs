import {DEFAULT_MSG_TRAITS} from './traits/messages_traits.es6'
// import middleware from '../src/uif/middleware.es6'
import * as dispatcher from './dispatcher.es6'
import * as handlers from './handlers.es6'
import {singleInstance} from './functional.es6'
import {Queue} from './core/queue.es6'
import * as Result from './core/result.es6'


// Runs the provided middleware chain
function runMiddleware(middleware, onError, state, msg, result) {
  return middleware.reduce( (state, layer)=>{
    let { value, error } = handlers.call( layer, state, msg, result );
    if (error) {
      onError("Error while running middleware layer:", error, {layer, state, msg});
      return state;
    }
    return value;
  }, state);
}


// Helper that dispatches messages one-by-one from the queue
// until its empty
function msgQueueResolver(state, middleware, update, onError) {
  let o =  state.queue.reduce((state, msg)=>{

    return Result
      .from( update, state.model, msg )
      .then((newState)=>{
        // return middleware.reduce( (state, layer)=>{
        //   let { value, error } = handlers.call( layer, state, msg, result );
        // });
        return runMiddleware(middleware, onError, state,  msg, newState);
      })
      .withDefault(state);
    // Run the update
    // let {value, error} = handlers.call( update, state.model, msg );
    // if (error) {
    //   onError("Error during update:", error, {state, msg});
    //   return state;
    // }

    // // run the middleware if we had no errors
    // let middlewareRes = runMiddleware(middleware, onError, state,  msg, value);
    // return middlewareRes;
  }, state);
  return o;
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
    state = msgQueueResolver(state, middleware, update, onError);
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
  };
};
