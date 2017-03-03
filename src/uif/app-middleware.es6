import {DEFAULT_ROOT_DISPATCHER_TRAITS, NOOP_ROOT_WRAPPER_TRAITS} from './dispatcher.es6'


// Helper that returns a wrapper for checking the state for keys.
//
// Throws an error if the required keys arent present in the state map.
function requiresInState(keys, fn) {
  return (state, ...args)=> {
    keys.forEach((k)=> {
      if (typeof state[k] === 'undefined') {
        throw new Error(`Key '${k}' not found in state for middleware.`);
      }
    });
    return fn(state, ...args);
  }
}

// Middleware for creating basic application
// -----------------------------------------
//
// These middleware bits allow the customization of the dispatch and
// update process, and allow you to effect changes on them.

// Basic middleware for rendering a view
export function renderer(view) {
  return requiresInState(
    ['model', 'dispatch'],
    (state)=> {
      let {model, dispatch} = state;
      view(model, dispatch);
      return state;
    });
}



// Basic middleware for rendering a view
// export function resultIntegrator(
//   intergrateResultIntoState=DEFAULT_ROOT_DISPATCHER_TRAITS.reduce
// ) {
//   return (state, msg, result)=> {

//     // integrate the result into the state
//     return intergrateResultIntoState(state, result);
//   }
// }

export let ResultIntegrators = {

  default: requiresInState(
    ['model', 'queue'],
    (state, msg, { model, toParentMessages })=>{
      state.model = model;
      // if we have messages to the parent
      if (typeof toParentMessages !== 'undefined' && toParentMessages.length > 0) {
        state.queue = state.queue.concat(toParentMessages);
      }
      return state;
    }
  ),

  noop: requiresInState(
    ['model'],
    (state, msg, result)=> {
      state.model = result;
      return state;
    }
  ),
};
