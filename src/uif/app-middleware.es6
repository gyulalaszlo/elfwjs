import {DEFAULT_ROOT_DISPATCHER_TRAITS, NOOP_ROOT_WRAPPER_TRAITS} from './dispatcher.es6'


function normalizeRequirements({state, msg, result}) {
   return {
     state: state || [],
     msg: msg || [],
     result: result || [],
   }
}

// Helper function that checks if a list of keys in requirements  is present in obj.
//
// Example:
//
// requirementsNotMet('foo', { state: ['model', 'dispatch'], result: ['model']}, {
//  state: { model: [], dispatch: ()=> null }, result: { model: ['foo'] }
// });
//
// returns a list of error strings
function requirementsNotMet(requirements, obj) {
  return Object.keys(requirements).reduce((memo, keyName)=>{
    // if no key in obj, then Huston, we have a problem
    if (typeof obj[keyName] === 'undefined') {
      memo[keyName] = [];
      // memo.push(`[${label}] Key '${keyName}' cannot be found in object`);
      return memo;
    }

    // fields
    let requiredKeys = requirements[keyName];
    requiredKeys.forEach((k)=> {
      if (typeof obj[keyName][k] === 'undefined') {
        if (!memo[keyName]) { memo[keyName] = []; }
        memo[keyName].push(k);
      }
    });

    // ok, go
    return memo;
  }, {});
}

export class RequirementNotMet extends Error {
  constructor(errors) {
    super(`Middleware requirements not met: ${JSON.stringify(errors, null, '  ')}`);
    this.errorFields = errors;
  }
}

// The javascript version of a templated wrapper type for `operator()`
export class Layer {
  constructor(name, requirements, fn, validatorFn=requirementsNotMet) {
    this.name = name;
    this.requirements = normalizeRequirements(requirements);
    this.fn = fn;
    this.validatorFn = validatorFn;
  }

  getName() { return this.name; }
  getRequirements() { return this.requirements; }

  // Tries to call the wrapped middleware if the requirements are ment
  apply(state, msg, result) {
    let errors = this.validatorFn( this.requirements, {state, msg, result});
    if (Object.keys(errors).length > 0) {
      throw new RequirementNotMet(errors);
    }
    return this.fn(state, msg, result);
  }
}


export function layer(name, requirements, fn, validatorFn=requirementsNotMet) {
  let l = new Layer(name, requirements, fn, validatorFn=requirementsNotMet);
  return (...args)=> l.apply(...args);
}

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
  return layer(
    'renderer',
    { state: ['model', 'dispatcher'] },
    (state)=> {
      let {model, dispatcher} = state;
      view(model, dispatcher);
      return state;
    });
}



// Result integrators are middleware that "integrate" the result from the
// update function into the state of the application (both the user model
// and the backing framework components)
export let ResultIntegrators = {

  // The default is to have a `model` and a `toParentMessages` key in the
  // result object. `model` will be the new model and the messages will be
  // added to the message queue.
  default: layer(
    'ResultIntegrators::default',
    {
      state: ['model', 'queue'],
      result: ['model']
    },
    (state, msg, { model, toParentMessages })=>{
      state.model = model;
      // if we have messages to the parent
      if (typeof toParentMessages !== 'undefined' && toParentMessages.length > 0) {
        state.queue = state.queue.concat(toParentMessages);
      }
      return state;
    }
  ),

  // Noop simply sets the model to the returned value
  noop: layer(
    'ResultIntegrators::noop',
    { state: ['model'] },
    (state, msg, result)=> {
      state.model = result;
      return state;
    }
  ),
};
