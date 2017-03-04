import {layer} from './layer.es6'
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



