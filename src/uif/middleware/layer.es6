
// REQUIREMENTS
// ============

function normalizeRequirements({state, msg, result}) {
   return {
     state: state || [],
     msg: msg || [],
     result: result || [],
   }
}

// Helper function that checks if a list of keys in requirements  is present in
// obj.
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

// Exception class when requirements are not met
export class RequirementNotMet extends Error {
  constructor(label, errors) {
    super(`${label} requirements not met: ${JSON.stringify(errors, null, '  ')}`);
    this.errorFields = errors;
  }
}


// Metadata for a middleware layer
// ===============================

// The javascript version of a templated wrapper type for `operator()`
export class Layer {
  constructor(name, fn, requirements={}, mutates=[], validatorFn=requirementsNotMet) {
    this.name = name;
    this.requirements = normalizeRequirements(requirements);
    this.mutates = mutates;
    this.fn = fn;
    this.validatorFn = validatorFn;
  }

  getName() { return this.name; }
  getRequirements() { return this.requirements; }
  getMutatedFields() { return this.mutates; }
  getWrappedFn() { return this.fn; }

  // Tries to call the wrapped middleware if the requirements are ment
  apply(state, msg, result) {
    let errors = this.validatorFn( this.requirements, {state, msg, result});
    if (Object.keys(errors).length > 0) {
      throw new RequirementNotMet(`[middleware::${this.name}]`, errors);
    }
    return this.fn(state, msg, result);
  }
}


// Factory function for returning a layer wrapped version of a function
export function layer(opts) {
  let {name, requires, mutates, apply, validatorFn} = opts;

  // validate the middleware
  if (typeof apply === 'undefined') {
    throw new Error("No `apply` function given for middleware");
  }

  let l = new Layer(name, apply, requires, mutates, validatorFn);
  let fn = (...args)=> l.apply(...args);
  fn.getLayer = ()=> l;
  return fn;
}

