import {DEFAULT_MSG_TRAITS} from './traits/messages_traits.es6'
// import middleware from '../src/uif/middleware.es6'
import * as dispatcher from './dispatcher.es6'
import * as handlers from './handlers.es6'


// Returns a wrapped function, that returns immediately
// if the function is already running (thereby hindering recursion)
//
// Allows only a single instance of the function to run
function singleInstance(fn) {
  let isRunning = false;
  return (...args)=> {
    if (isRunning) return null;
    isRunning = true;
    fn(...args);
    isRunning = false;
  };
}


export function make(
  {model, update, view, Msg},
  onError=console.error,
  messageTraits=DEFAULT_MSG_TRAITS,
  dispatcherTraits=dispatcher.DEFAULT_ROOT_DISPATCHER_TRAITS,
){

  if (!update) { throw new ArgumentError("No 'update' given"); }
  if (!model) { throw new ArgumentError("No 'model' given"); }

  // create the initial state for the dispatch wrapper
  let dispatch, isDispatchRunning;
  let state = { model, queue: [] };


  let dispatchImpl = (msg)=> {
    state.queue.push(msg);
    dispatchMsgsInQueue();

    // rendering is optional for us. Helps with testing.
    if (view) {
      view(state.model, dispatch);
    }
  };


  let dispatchMsgsInQueue = singleInstance(()=>{
    // Dont allow recursion, just use the queue for now
    if (isDispatchRunning) { return; }

    isDispatchRunning = true;

    let queue = state.queue;
    // Dispatch messages until there is stuff in the
    // queue.
    //
    // This is based on the assumption that update always returns ASAP,
    // and any longer running stuff is issues via other systems
    while (queue.length > 0) {

      // get the first message
      let msg = queue.shift();

      if (typeof msg === 'undefined') { continue; }

      // we try to catch errors in the update here
      let updateResult = handlers.call( update, model, msg );

      if (updateResult.error) {
        // no more work for us for now
        onError(updateResult.error, msg, model);
        continue;
      }

      // use the dispatcher traits to dispatch the messages
      state = dispatcherTraits.reduce(state, updateResult.value);
    }
  });


  // create the dispatcher function
  dispatch = dispatcher.make(dispatchImpl, messageTraits)

  // create the initial state for the dispatch wrapper
  state = dispatcherTraits.init(state);


  return {
    dispatch,
    model,
  };
};
