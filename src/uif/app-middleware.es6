import {DEFAULT_ROOT_DISPATCHER_TRAITS, NOOP_ROOT_WRAPPER_TRAITS} from './dispatcher.es6'

// Middleware for creating basic application
// -----------------------------------------
//
// These middleware bits allow the customization of the dispatch and
// update process, and allow you to effect changes on them.

// Basic middleware for rendering a view
export function renderer(view) {
  return (state)=> {
    let {model, dispatch} = state;
    view(model, dispatch);
    return state;
  }
}


// Basic middleware for rendering a view
export function resultIntegrator(
  intergrateResultIntoState=DEFAULT_ROOT_DISPATCHER_TRAITS.reduce
) {
  return (state, msg, result)=> {

    // integrate the result into the state
    return intergrateResultIntoState(state, result);
  }
}

export let ResultIntegrators = {
  default: resultIntegrator(DEFAULT_ROOT_DISPATCHER_TRAITS.reduce),
  noop: resultIntegrator(NOOP_ROOT_WRAPPER_TRAITS.reduce),
};
