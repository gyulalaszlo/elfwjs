import * as _ from 'lodash'
import * as Promise from 'bluebird'
import diff from 'virtual-dom/diff'
import patch from 'virtual-dom/patch'
import createElement from 'virtual-dom/create-element'

import * as uif_msg from './uif-msg'
import * as uif_middleware from './middleware'


/*
 * Creates a message
 */
export let make_msg = uif_msg.make;


/*
 * Generator that allow easy creation of message types
 */
export let msg = uif_msg.generator;


export let middleware = uif_middleware;

// Built in dispatchers the distribute and / or transform
// messages
let dispatchers = {

  // Default dispatcher that simply forwards stuff
  single_method: (msg, model, update, logger)=> {
    return update(msg, model, logger);
  },


  // DEPRECATED: Use middleware.respond_to
  object_methods: (msg, model, update, logger)=> {
    logger.error("dispatchers.object_methods is deprecated");
    let {name, values} = msg;
    if (!update[name]) {
      logger.error("Unhandled message:", msg, "by", update);
      return model;
    }
    values = values != null ? values : [];
    return update[name].apply(update, [model].concat(values));
  }
};

// Functional helpers
// ==================


export function update_in(obj, path, fn, ...args) {
  let o = obj;
  for (let i = 0, len = path.length; i < len - 1; ++i) {
    o = obj[path[i]];
  }

  let p = path[i];
  o[p] = fn( o[p], ...args);
  return obj;
};

export function assoc(o, attrs) {
  for (let k in attrs) {
    o[k] = attrs[k];
  }
  return o;
};

export function assoc_in(o, path, attrs, ...rest) {
  let ret = update_in(o, path, assoc, attrs);
  // next iteration if theres any
  if (rest.length === 0) return ret;
  return assoc_in(ret, ...rest);
};


// VIEW
// ====
// Creates and wraps the view
function init_view(container, model, view) {
  let tree = view(model);
  let rootNode = createElement(tree);
  // append the root node
  container.appendChild(rootNode);

  // the views render function
  let render = (model, dispatch)=> {
    console.log("RENDER");
    // create the patches
    let newTree = view(model, dispatch);
    let patches = diff(tree, newTree);
    // update the root note
    rootNode = patch(rootNode, patches);
    // swap the trees
    tree = newTree;
  };
  return { render };
};



// MAIN
// ====

// Main entry point
export function app(container, model_factory, view, update, opts={}) {

  _.defaults(opts, {
    logger: console,
    dispatcher: dispatchers.single_method
  });


  // init stuff
  let model = model_factory();

  // Wrapper function for updating the model
  let update_model = function(m) {
    return model = m;
  };

  // Wrapper for the dispatcher
  let dispatch_impl = function(msg, model_) {
    opts.logger.log("DISPATCH", msg, model_);
    return opts.dispatcher(msg, model_, update, opts.logger);
  };

  let renderer = init_view(container, model, view );

  // The dispatch function
  // TODO: add queueing
  let dispatch = (msg)=> {
      console.log("DISPATCH", msg);

    // Recursive implementatino
    let impl = (msg)=> {
      console.log("DISPATCH_IMPL", msg);
      // if no message, dont do anything
      if (!msg) { return Promise.resolve(true); }
      // otherwise 
      return Promise.resolve(msg)
        .then((m)=> {
          // run the inner dispatcher
          let [ new_model, new_msg ] = dispatch_impl(m, model);

          // update the model
          model = update_model(new_model);

          // render shit
          renderer.render(model, dispatch);

          // recurse
          return impl(new_msg);
        })
        .catch((e)=> {
          opts.logger.error("DISPATCH:", e, e.stack);
        });
    };
    return impl(msg);
  };

  return {
    dispatch: dispatch,
    render: renderer.render,
    msg: make_msg
  };
};
