import {layer} from './middleware/layer.es6'
// REQUIREMENTS
// ============

// function normalizeRequirements({state, msg, result}) {
//    return {
//      state: state || [],
//      msg: msg || [],
//      result: result || [],
//    }
// }

// // Helper function that checks if a list of keys in requirements  is present in
// // obj.
// //
// // Example:
// //
// // requirementsNotMet('foo', { state: ['model', 'dispatch'], result: ['model']}, {
// //  state: { model: [], dispatch: ()=> null }, result: { model: ['foo'] }
// // });
// //
// // returns a list of error strings
// function requirementsNotMet(requirements, obj) {
//   return Object.keys(requirements).reduce((memo, keyName)=>{
//     // if no key in obj, then Huston, we have a problem
//     if (typeof obj[keyName] === 'undefined') {
//       memo[keyName] = [];
//       // memo.push(`[${label}] Key '${keyName}' cannot be found in object`);
//       return memo;
//     }

//     // fields
//     let requiredKeys = requirements[keyName];
//     requiredKeys.forEach((k)=> {
//       if (typeof obj[keyName][k] === 'undefined') {
//         if (!memo[keyName]) { memo[keyName] = []; }
//         memo[keyName].push(k);
//       }
//     });

//     // ok, go
//     return memo;
//   }, {});
// }

// // Exception class when requirements are not met
// export class RequirementNotMet extends Error {
//   constructor(label, errors) {
//     super(`${label} requirements not met: ${JSON.stringify(errors, null, '  ')}`);
//     this.errorFields = errors;
//   }
// }


// // Metadata for a middleware layer
// // ===============================

// // The javascript version of a templated wrapper type for `operator()`
// export class Layer {
//   constructor(name, fn, requirements={}, mutates=[], validatorFn=requirementsNotMet) {
//     this.name = name;
//     this.requirements = normalizeRequirements(requirements);
//     this.mutates = mutates;
//     this.fn = fn;
//     this.validatorFn = validatorFn;
//   }

//   getName() { return this.name; }
//   getRequirements() { return this.requirements; }

//   // Tries to call the wrapped middleware if the requirements are ment
//   apply(state, msg, result) {
//     let errors = this.validatorFn( this.requirements, {state, msg, result});
//     if (Object.keys(errors).length > 0) {
//       throw new RequirementNotMet(`[middleware::${this.name}]`, errors);
//     }
//     return this.fn(state, msg, result);
//   }
// }


// // Factory function for returning a layer wrapped version of a function
// export function layer(opts) {
//   let {name, requires, mutates, apply, validatorFn} = opts;

//   // validate the middleware
//   if (typeof apply === 'undefined') {
//     throw new Error("No `apply` function given for middleware");
//   }

//   // validator = validator || requirementsNotMet;
//   // requires = requires || {};
//   // mutates = mutates || [];

//   let l = new Layer(name, apply, requires, mutates, validatorFn);
//   return (...args)=> l.apply(...args);
// }

//
// Middleware for creating basic application
// -----------------------------------------
//
// These middleware bits allow the customization of the dispatch and update
// process, and allow you to effect changes on them.


// RENDERING
// =========
//
// helper view updater that does not alter anything in the state or in the
// document
function noopViewUpdater(state, tree) { return state; }


export let View = {
  // Basic middleware for rendering the view tree for a root view from the
  // model
  generateTree: (view)=> layer({
    name: 'treeRenderer',
    requires: {
      state: ['model', 'dispatcher'],
    },
    mutates: ['viewTree'],
    apply: (state)=> {
      let {model, dispatcher} = state;
      state.viewTree  = view(model, dispatcher);
      return state;
    },
  }),
};



// RESULT INTEGRATION
// ==================


// Result integrators are middleware that "integrate" the result from the
// update function into the state of the application (both the user model
// and the backing framework components)
export let ResultIntegrators = {

  // The default is to have a `model` and a `toParentMessages` key in the
  // result object. `model` will be the new model and the messages will be
  // added to the message queue.
  default: layer({
    name: 'ResultIntegrators::default',
    requires: {
      state: ['model', 'queue'],
      result: ['model']
    },
    mutates: ['model', 'queue'],
    apply: (state, msg, { model, toParentMessages })=>{
      state.model = model;
      // if we have messages to the parent
      if (typeof toParentMessages !== 'undefined' && toParentMessages.length > 0) {
        state.queue = state.queue.concat(toParentMessages);
      }
      return state;
    }
  }),

  // Noop simply sets the model to the returned value
  noop: layer({
    name: 'ResultIntegrators::noop',
    requires: { state: ['model'] },
    mutates: ['model'],
    apply: (state, msg, result)=> {
      state.model = result;
      return state;
    }
  }),
};
