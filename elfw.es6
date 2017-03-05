import * as router from './src/uif/router.es6'
import * as viewMiddleware from './src/uif/middleware/view.es6'

import createElement from 'virtual-dom/create-element'
import diff from 'virtual-dom/diff'
import patch from 'virtual-dom/patch'
import hyperscriptNode from 'virtual-dom/virtual-hyperscript'

import {DEFAULT_MSG_TRAITS} from './src/uif/traits/messages_traits.es6'
import {ResultIntegrators} from './src/uif/middleware/result-integrators.es6'
import {make} from './src/uif/app.es6'

// Router
// ======
export let Router = router;

// Virtual-dom
// ===========
export let h = hyperscriptNode;


// Creates a `ViewUpdater` (for `middleware.View.frameUpdater()`) that renders
// virtual-dom trees
function virtualDomViewUpdater(container) {
  // initial loading screen
  let tree = h('div', {className: 'elfw-loader'}, [
    "Initializing application..."
  ]);

  //
  let rootNode = createElement(tree);
  container.appendChild(rootNode);

  // The viewUpdater we'll use for the frameUpdater
  let updaterFn = (newTree, t)=> {
    var patches = diff(tree, newTree);
    rootNode = patch(rootNode, patches);
    tree = newTree;
  };

  return viewMiddleware.View.frameUpdater( updaterFn, window.requestAnimationFrame );
}


// Default messages
// ================

export function Messages(keys) {
 return DEFAULT_MSG_TRAITS.generator(keys);
}


export function App(model, update, view) {
  return make({model, update}, [
    ResultIntegrators.default,
    viewMiddleware.View.generateTree(view),
    virtualDomViewUpdater(document.querySelector('.app')),
  ]);
}
