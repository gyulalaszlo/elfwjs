import {DEFAULT_MSG_TRAITS} from './traits/messages_traits.es6'
// import middleware from '../src/uif/middleware.es6'
import * as dispatcher from './dispatcher.es6'
import * as handlers from './handlers.es6'

export let  NOOP_DISPATCH_WRAPPER_TRAITS = {
  init: (model, dispatch)=> {
    return { model: model, dispatch: dispatch };
  },

  reduce: ({ model, msg, dispatch }, newModel)=> {
    return { state, model: newModel, dispatch };
  }
}

function defaultDispatchWrapper() { }

export function make(
  {model, update, view, Msg},
  messageTraits=DEFAULT_MSG_TRAITS,
  dispatchWrapper=defaultDispatchWrapper,
  onError=console.error
){

  if (!update) { throw new ArgumentError("No 'update' given"); }
  if (!model) { throw new ArgumentError("No 'model' given"); }

  // create the initial state for the dispatch wrapper
  let dispatch, dispatchWrapperState;


  let dispatchImpl = (msg)=> {
    if (!msg) { return; }

    // we try to catch errors in the update here
    let updateResult = handlers.call( update, model, msg );

    if (updateResult.error) {
      // no more work for us for now
      onError(updateResult.error, msg, model);
      return;
    }

    // wrapper that wraps dispatching
    // dispatchWrapperState = dispatchWrapper.reduce(
    //   { state: dispatchWrapperState, model, dispatch },
    //   updateResult.value
    // );

    // dispatchWrapperState

    model = updateResult.value;


    // rendering is optional for us. Helps with testing.
    if (view) {
      view(model, dispatch);
    }
  };

  // create the dispatcher function
  dispatch = dispatcher.make(dispatchImpl, messageTraits)

  // create the initial state for the dispatch wrapper
  // dispatchWrapperState = dispatchWrapper.init(model, dispatch);


  return {
    dispatch,
    model,
  };
};
