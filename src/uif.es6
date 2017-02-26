import * as _ from 'lodash'
import * as Promise from 'bluebird'
import diff from 'virtual-dom/diff'
import patch from 'virtual-dom/patch'
import createElement from 'virtual-dom/create-element'

import * as uif_msg from './uif/msg'
import * as uif_middleware from './uif/middleware'


/*
 * Creates a message
 */
export let make_msg = uif_msg.make;


/*
 * Generator that allow easy creation of message types
 */
export let msg = uif_msg.generator;



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
  let last = path.length - 1;
  for (let i = 0; i < last; ++i) {
    o = obj[path[i]];
  }

  let p = path[last];
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
  let tree = view(model, ()=> { throw new Error("IMPLEMENT ME: handling initial messages")} );
  let rootNode = createElement(tree);
  // append the root node
  container.appendChild(rootNode);

  // the views render function
  let render = (model, dispatch)=> {
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
    try {
      return opts.dispatcher(msg, model_, update, opts.logger);
    } catch (e) {
      opts.logger.error("Error during  dispatch:", e, "msg=",msg, "model=", model_);
      throw(e)
    }
  };

  let renderer = init_view(container, model, view );

  // The dispatch function
  // TODO: add queueing
  let dispatch = (msg)=> {

    // Recursive implementatino
    let impl = (msg)=> {
      // if no message, dont do anything
      if (!msg) { return Promise.resolve(true); }
      // otherwise
      return Promise.resolve(msg)
        .then((m)=> {
          //opts.logger.groupCollapsed(`Dispatch ${JSON.stringify(m).substring(0, 200)}`);

          // run the inner dispatcher
          let [ new_model, new_msg ] = dispatch_impl(m, model);

          // update the model
          model = update_model(new_model);

          // render shit
          renderer.render(model, dispatch);
          // opts.logger.groupEnd();

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
