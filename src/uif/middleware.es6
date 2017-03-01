import * as Promise from 'bluebird'

import * as uif_msg from './msg.es6'

import {DEFAULT_MSG_TRAITS} from './traits/messages_traits.es6'
import {DEFAULT_CHILD_TRAITS} from './traits/child_traits.es6'
import {
  NOMSG_RESULT_TRAITS,
  LEGACY_RESULT_TRAITS,
  DEFAULT_RESULT_TRAITS,
} from './traits/result_traits.es6'


// DISABLE FOR PRODUCTION
const ASSERT = (cond, e)=> {
  if (!cond) {
    throw new Error(e);
  }
};

export const ALWAYS_TRUE = ()=> true;
export const HAS_NAME = (name)=> {
  return (m)=> {
    return m.name == name;
  }
}

// MIDDLEWARE SHIT
// ---------------

// TRAITS
// =====
//
// Traits provide simple functions for dealing with parts of the system
// that are modular and can be replaced by the user.


// Chains middlewares togeather, calling them one after another until one returns true
export function chain(handlers) {
  return (...args)=> {
    return handlers.reduce((memo,handler)=> {
      // skip if already have a value
      if (memo != null) return memo;
      // otherwise go for it
      return handler(...args);
    }, null);
  };
}



// Tries to match the message to a handler by calling the method matching the'name' attribute
// of the message, or returns null if no such attribute is found.
//
// matcher_fn is a function that shoudl return a handler for the message
export function match(obj,
  { get_name, get_value }=DEFAULT_MSG_TRAITS
) {
  return (model, msg, ...args)=> {
    let name = get_name(msg, obj);
    if (!name) {
      throw new ArgumentError(`no name in message: ${JSON.stringify(msg)}`);
    }
    if (!obj[name]) return null
    return obj[name](model, get_value(msg), ...args);
  };
}



// Children
// ========================================

// mutating update function
function key_assoc(o,k,v){
  o[k] = v;
  return o;
}

// TRAITS
// =====
//
// Traits provide simple functions for dealing with parts of the system
// that are modular and can be replaced by the user.



// Updates the model from the response of handler and wraps any messages
// from the child
export function children_bwd(
  child_key, msg_wrapper, handler,
  { get, update, wrap_msg }=DEFAULT_CHILD_TRAITS,
  { pack, unpack } = DEFAULT_RESULT_TRAITS
) {
  return (model, msg, ...args)=> {
    let child = get(model, child_key);
    // unpack the return
    let {new_model, local_messages, to_parent_messages, to_root_messages}
      = unpack(handler( child, msg, ...args ));

    // update the child model
    let model_out = update( model, child_key, new_model );

    // wrap messages that are local to the child
    let wrapped_child_msgs = local_messages
      ? local_messages.map((msg)=> wrap_msg(msg_wrapper, child_key, model_out, msg))
      : undefined;

    return pack({
      new_model: model_out,
      local_messages: wrapped_child_msgs,
      // No messages for our parent
      //
      // to_parent_messages: undefined,
      //
      to_root_messages: to_root_messages
    });
  };
}


// For now, this simply unpacks the message and validates it
export function children_fwd(
  handler,
  child_msg_validator=ALWAYS_TRUE,
  { get_name, get_value }=DEFAULT_MSG_TRAITS
) {
  return (model, msg, ...args)=> {
    if (!child_msg_validator(msg)) {
      return null;
    }
    return handler(model, get_value(msg), ...args);
  };
}



export function children(
  child_key, msg_wrapper, handler,
  child_msg_validator=ALWAYS_TRUE,
  child_traits=DEFAULT_CHILD_TRAITS,
  result_traits=DEFAULT_RESULT_TRAITS,
  msg_traits=DEFAULT_MSG_TRAITS
) {

  let bwd_handler = children_bwd( child_key, msg_wrapper, handler, child_traits, result_traits );
  let fwd_handler = children_fwd( bwd_handler, child_msg_validator, msg_traits );
  return fwd_handler;
}


function rest_vector(
  validator=ALWAYS_TRUE,
  result_traits=DEFAULT_RESULT_TRAITS
) {
  return match({
    POST: (model, new_element)=>{
      model.push(new_element);
      let r = result_traits.pack({
        new_model: model
      });
      return r;
    }
  });
}

export const rest = {


  msg: uif_msg.generator([
    'POST',
    'PUT',
    'DELETE'
  ]),

  vector: rest_vector

};



// LEGACY
// ========================================


// Forwards messages
export function forward_msg(model, child_key, child_msg, wrapper_msg_fn, child_update_fn, logger) {
  // update child
  let [child_model, child_task, root_msg] = child_update_fn(child_msg, model[child_key], logger);
  // update model in parent
  model[child_key] = child_model;
  // run child tasks if needed
  if (child_task) {
    return [model, Promise.resolve(child_task).then(wrapper_msg_fn), root_msg];
  } else {
    return [model, child_task, root_msg];
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
    // logger.debug("Respond-to:", msg.name);
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
    let { update, model_key, on_root_msg  } = obj[k];
    // The child builfer function
    let msg_maker = (v)=> uif_msg.make(k, v);
    // if no child message wrapper is given, simply use this
    // as the current components message
    if (!on_root_msg) { on_root_msg = (m, e)=> [m ? m :  e]; };

    o[k] = (model, msg, ctx)=> {
      // ctx.logger.debug("Forward:", msg.name, " to:",  model_key);
      let [ new_model, new_msg, root_msg ] =  
//         ctx.logger.debug("Forward:", msg.name, " to:",  model_key, " with::"
//         , forward_msg(model, model_key, msg, msg_maker, update, ctx.logger)
//         );

        forward_msg(model, model_key, msg, msg_maker, update, ctx.logger);
      return [ new_model, ...on_root_msg(new_msg, root_msg)]
    }
  }
  return respond_to(o, next);
}


