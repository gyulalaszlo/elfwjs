import {layer} from './layer.es6'

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
    apply: (state, msg, { model, toParentMessages, localMessages })=>{
      state.model = model;
      // if we have messages to the parent
      if (typeof localMessages !== 'undefined' && localMessages.length > 0) {
        state.queue = state.queue.concat(localMessages);
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
