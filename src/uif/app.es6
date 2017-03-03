import {DEFAULT_MSG_TRAITS} from './traits/messages_traits.es6'
// import middleware from '../src/uif/middleware.es6'
import * as dispatcher from './dispatcher.es6'
import * as handlers from './handlers.es6'


export function make(
  {model, update, view, Msg},
  messageTraits=DEFAULT_MSG_TRAITS,
  onError=console.error
){

  if (!update) { throw new ArgumentError("No 'update' given"); }
  if (!model) { throw new ArgumentError("No 'model' given"); }


  let dispatchImpl = (msg)=> {
    if (!msg) { return; }

    // we try to catch errors in the update here
    let updateResult = handlers.call( update, model, msg );

    if (updateResult.error) {
      // no more work for us for now
      onError(updateResult.error, msg, model);
      return;
    }

    model = updateResult.value;


    // rendering is optional for us. Helps with testing.
    if (view) {
      view(model, dispatch);
    }
  };

  // create the dispatcher function
  let dispatch = dispatcher.make(dispatchImpl, messageTraits)

  return {
    dispatch,
    model,
  };
};
