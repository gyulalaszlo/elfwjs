var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

import * as Promise from 'bluebird';

import * as uif_msg from './uif-msg';

// MIDDLEWARE SHIT
// ===============

// Forwards messages
function forward_msg(model, child_key, child_msg, wrapper_msg_fn, child_update_fn, logger) {
  // update child
  var _child_update_fn = child_update_fn(child_msg, model.datafile, logger),
      _child_update_fn2 = _slicedToArray(_child_update_fn, 2),
      child_model = _child_update_fn2[0],
      child_task = _child_update_fn2[1];
  // update model in parent


  model[child_key] = child_model;
  // run child tasks if needed
  if (child_task) {
    return [model, Promise.resolve(child_task).then(wrapper_msg_fn)];
  } else {
    return [model];
  }
}

// Helper that wraps running the next handler in the chain
function run_next(model, msg, logger, next) {
  if (next) {
    return next(msg, model, logger);
  } else {
    logger.error("Unhandled message:", msg);
    return model;
  }
}

// Forwards a messages to the children and wraps them
export function respond_to(obj, next) {
  return function (msg, model, logger) {
    var name = msg.name,
        values = msg.values;

    if (!obj[name]) {
      return run_next(model, msg, logger, next);
    }
    values = values != null ? values : [];
    var context = {
      logger: logger
    };
    return obj[name].apply(context, [model].concat(_toConsumableArray(values)));
  };
}

// Helper that wraps running the next handler in the chain
export function forward_to(obj, next) {
  var _this = this;

  // generate an object for child messages and forward theat
  // to respond_to
  var o = {};

  var _loop = function _loop(k) {
    var _obj$k = obj[k],
        update = _obj$k.update,
        model_key = _obj$k.model_key;
    // The child builfer function

    var msg_maker = function msg_maker(v) {
      return uif_msg.make(k, [v]);
    };

    o[k] = function (model) {
      return forward_msg(model, model_key, arguments.length <= 1 ? undefined : arguments[1], msg_maker, update, _this.logger);
    };
  };

  for (var k in obj) {
    _loop(k);
  }
  return respond_to(o, next);
}