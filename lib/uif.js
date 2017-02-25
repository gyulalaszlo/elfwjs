var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

import * as _ from 'lodash';
import * as Promise from 'bluebird';
import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';
import createElement from 'virtual-dom/create-element';

import * as uif_msg from './uif-msg';
import * as uif_middleware from './middleware';

/*
 * Creates a message
 */
export var make_msg = uif_msg.make;

/*
 * Generator that allow easy creation of message types
 */
export var msg = uif_msg.generator;

export var middleware = uif_middleware;

// Built in dispatchers the distribute and / or transform
// messages
var dispatchers = {

  // Default dispatcher that simply forwards stuff
  single_method: function single_method(msg, model, update, logger) {
    return update(msg, model, logger);
  },

  // DEPRECATED: Use middleware.respond_to
  object_methods: function object_methods(msg, model, update, logger) {
    logger.error("dispatchers.object_methods is deprecated");
    var name = msg.name,
        values = msg.values;

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


export function update_in(obj, path, fn) {
  var o = obj;
  for (var _i = 0, len = path.length; _i < len - 1; ++_i) {
    o = obj[path[_i]];
  }

  var p = path[i];

  for (var _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    args[_key - 3] = arguments[_key];
  }

  o[p] = fn.apply(undefined, [o[p]].concat(args));
  return obj;
};

export function assoc(o, attrs) {
  for (var k in attrs) {
    o[k] = attrs[k];
  }
  return o;
};

export function assoc_in(o, path, attrs) {
  var ret = update_in(o, path, assoc, attrs);
  // next iteration if theres any

  for (var _len2 = arguments.length, rest = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
    rest[_key2 - 3] = arguments[_key2];
  }

  if (rest.length === 0) return ret;
  return assoc_in.apply(undefined, [ret].concat(rest));
};

// VIEW
// ====
// Creates and wraps the view
function init_view(container, model, view) {
  var tree = view(model);
  var rootNode = createElement(tree);
  // append the root node
  container.appendChild(rootNode);

  // the views render function
  var render = function render(model, dispatch) {
    console.log("RENDER");
    // create the patches
    var newTree = view(model, dispatch);
    var patches = diff(tree, newTree);
    // update the root note
    rootNode = patch(rootNode, patches);
    // swap the trees
    tree = newTree;
  };
  return { render: render };
};

// MAIN
// ====

// Main entry point
export function app(container, model_factory, view, update) {
  var opts = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};


  _.defaults(opts, {
    logger: console,
    dispatcher: dispatchers.single_method
  });

  // init stuff
  var model = model_factory();

  // Wrapper function for updating the model
  var update_model = function update_model(m) {
    return model = m;
  };

  // Wrapper for the dispatcher
  var dispatch_impl = function dispatch_impl(msg, model_) {
    opts.logger.log("DISPATCH", msg, model_);
    return opts.dispatcher(msg, model_, update, opts.logger);
  };

  var renderer = init_view(container, model, view);

  // The dispatch function
  // TODO: add queueing
  var dispatch = function dispatch(msg) {
    console.log("DISPATCH", msg);

    // Recursive implementatino
    var impl = function impl(msg) {
      console.log("DISPATCH_IMPL", msg);
      // if no message, dont do anything
      if (!msg) {
        return Promise.resolve(true);
      }
      // otherwise 
      return Promise.resolve(msg).then(function (m) {
        // run the inner dispatcher
        var _dispatch_impl = dispatch_impl(m, model),
            _dispatch_impl2 = _slicedToArray(_dispatch_impl, 2),
            new_model = _dispatch_impl2[0],
            new_msg = _dispatch_impl2[1];

        // update the model


        model = update_model(new_model);

        // render shit
        renderer.render(model, dispatch);

        // recurse
        return impl(new_msg);
      }).catch(function (e) {
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