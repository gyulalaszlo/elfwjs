import {layer} from './layer.es6'

// RENDERING
// =========

const TIMING = {};

// Set timing for the browser
if (typeof window !== 'undefined') {
  TIMING.requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

  TIMING.cancelAnimationFrame = window.cancelAnimationFrame ||
    window.mozCancelAnimationFrame;
}


function makeFrameUpdater(viewUpdater, requestAnimationFrame, updateNeededFlagName='viewNeedsUpdate') {
  let callbackId = null;
  let treeToRender = null;

  // the callback we'll get from requestAnimationFrame
  let perFrame = (t)=> {
    if (treeToRender !== null ) {
      viewUpdater(treeToRender, t);
      treeToRender = null;
    }
  };

  let apply = (state)=> {
    // trigger an update only if the flag is set
    if (!state.viewNeedsUpdate) { return state; }
    // update the tree we need to render, but check if we have already
    // dispatch the next rendering function
    let needsFrameRequest = (treeToRender === null);
    treeToRender = state.viewTree;
    // dispatch after the update completed
    if (needsFrameRequest) { callbackId = requestAnimationFrame(perFrame); }
    // clear the udpate needed flag
    state.viewNeedsUpdate = false;
    return state;
  };


  return layer({
    name: 'frameUpdater',
    requires: {
      state: [ 'viewTree', updateNeededFlagName ],
    },
    mutates: [ updateNeededFlagName ],
    apply,
  });
}


export let View = {
  // Basic middleware for rendering the view tree for a root view from the
  // model.
  //
  // This middleware simply sets the `viewTree` property in state to the tree
  // returned by `view(model, dispatch)`
  generateTree: (view, updateNeededFlagName='viewNeedsUpdate')=> layer({
    name: 'treeRenderer',
    requires: {
      state: ['model', 'dispatcher'],
    },
    mutates: ['viewTree', updateNeededFlagName],
    apply: (state)=> {
      let {model, dispatcher} = state;
      state.viewTree  = view(model, dispatcher);
      // mark for update
      state[updateNeededFlagName] = true;
      return state;
    },
  }),


  frameUpdater: makeFrameUpdater,

};



