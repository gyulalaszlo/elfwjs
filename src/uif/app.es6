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
  {model, update},
  middleWare=[],
  onError=console.error
){

  if (!update) { throw new ArgumentError("No 'update' given"); }
  if (!model) { throw new ArgumentError("No 'model' given"); }

  // create the initial state for the dispatch wrapper
  let dispatch;

  // create the state
  let state = { model, queue: new Queue(), dispatch: null  };


  let dispatchImpl = (msg)=> {
    state.queue.push(msg);
    dispatchMsgsInQueue();
  };

  let dispatchMsgsInQueue = singleInstance(()=>{
    state = state.queue.reduce((state, msg)=>{

      // Run the update
      let result;
      try {
        // we try to catch errors in the update here
        result = update(state.model, msg );
      } catch (e) {
        onError("Error during update:", e, {state, msg});
        return state;
      }

      // Run the middleware chain
      return middleWare.reduce( (state, layer)=>{
        try {
          return layer(state, msg, result);
        } catch (e) {
          onError("Error while running middleware layer:", e, {layer, state, msg});
          return state;
        }
      }, state);

    }, state);
  });


  // create the dispatcher function and make it accessible
  state.dispatch = dispatcher.make(dispatchImpl)


  return {
    dispatch: state.dispatch,
    model,
  };
};
