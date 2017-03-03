import {DEFAULT_MSG_TRAITS} from './traits/messages_traits.es6'
// import middleware from '../src/uif/middleware.es6'
import * as dispatcher from './dispatcher.es6'
import * as handlers from './handlers.es6'
import {singleInstance} from './functional.es6'
import {Queue} from './core/queue.es6'




// Dispatch messages until there is stuff in the queue.
//
// This is based on the assumption that update always returns ASAP, and any
// longer running stuff is issues via other systems
export function make(
  {model, update, view, Msg},
  onError=console.error,
  messageTraits=DEFAULT_MSG_TRAITS,
  dispatcherTraits=dispatcher.DEFAULT_ROOT_DISPATCHER_TRAITS,
){

  if (!update) { throw new ArgumentError("No 'update' given"); }
  if (!model) { throw new ArgumentError("No 'model' given"); }

  // create the initial state for the dispatch wrapper
  let dispatch;
  // create the state
  let state = { model, queue: new Queue() };



  let dispatchImpl = (msg)=> {
    state.queue.push(msg);
    dispatchMsgsInQueue();

    // rendering is optional for us. Helps with testing.
    if (view) {
      view(state.model, dispatch);
    }
  };


  let dispatchMsgsInQueue = singleInstance(()=>{

    state = state.queue.reduce((state, msg)=>{

      try {
      // we try to catch errors in the update here
        let result = update(model, msg );
        return dispatcherTraits.reduce(state, result);
      } catch (e) {
        onError(e, msg, model);
        return state;
      }

      // if (updateResult.error) {
      //   // no more work for us for now
      //   onError(updateResult.error, msg, model);
      //   return state;
      // }

      // use the dispatcher traits to dispatch the messages
      // return dispatcherTraits.reduce(state, updateResult.value);
    }, state);
  });


  // create the dispatcher function
  dispatch = dispatcher.make(dispatchImpl)

  // initial state for the dispatch wrapper
  state = dispatcherTraits.init(state);


  return {
    dispatch,
    model,
  };
};
