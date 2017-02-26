import * as Promise from 'bluebird'

import * as uif_msg from './msg.es6'

// MIDDLEWARE SHIT
// ===============

// Forwards messages
export function forward_msg(model, child_key, child_msg, wrapper_msg_fn, child_update_fn, logger) {
  // update child
  let [child_model, child_task] = child_update_fn(child_msg, model[child_key], logger);
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
  return (msg, model, logger)=> {
    let {name, values} = msg;
    if (!obj[name]) {
      return run_next(model, msg, logger, next);
    }
    let context = {
      logger: logger
    };
    return obj[name](model, values, context);
  };
}

// Helper that wraps running the next handler in the chain
export function forward_to(obj, next) {
  // generate an object for child messages and forward theat
  // to respond_to
  let o = {};
  for (let k in obj) {
    let { update, model_key } = obj[k];
    // The child builfer function
    let msg_maker = (v)=> uif_msg.make(k, v);

    o[k] = (model, msg, ctx)=> {
      return forward_msg(model, model_key, msg, msg_maker, update, ctx.logger);
    }
  }
  return respond_to(o, next);
}


