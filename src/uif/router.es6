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
// matcherFn is a function that shoudl return a handler for the message
export function match(obj,
  { getName, getValue }=DEFAULT_MSG_TRAITS
) {
  return (model, msg, ...args)=> {
    let name = getName(msg, obj);
    if (!name) {
      throw new ArgumentError(`no name in message: ${JSON.stringify(msg)}`);
    }
    if (!obj[name]) return null
    return obj[name](model, getValue(msg), ...args);
  };
}



// Children
// ========================================

// mutating update function
function keyAssoc(o,k,v){
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
export function childrenBwd(
  childKey, msgWrapper, handler,
  { get, update, wrapMsg }=DEFAULT_CHILD_TRAITS,
  { pack, unpack } = DEFAULT_RESULT_TRAITS
) {
  return (model, msg, ...args)=> {
    let child = get(model, childKey);
    // unpack the return
    let {newModel, localMessages, toParentMessages, toRootMessages}
      = unpack(handler( child, msg, ...args ));

    // update the child model
    let modelOut = update( model, childKey, newModel );

    // wrap messages that are local to the child
    let wrappedChildMsgs = localMessages
      ? localMessages.map((msg)=> wrapMsg(msgWrapper, childKey, modelOut, msg))
      : undefined;

    return pack({
      newModel: modelOut,
      localMessages: wrappedChildMsgs,
      // No messages for our parent
      //
      // toParentMessages: undefined,
      //
      toRootMessages: toRootMessages
    });
  };
}


// For now, this simply unpacks the message and validates it
export function childrenFwd(
  handler,
  childMsgValidator=ALWAYS_TRUE,
  { getName, getValue }=DEFAULT_MSG_TRAITS
) {
  return (model, msg, ...args)=> {
    if (!childMsgValidator(msg)) {
      return null;
    }
    return handler(model, getValue(msg), ...args);
  };
}



export function children(
  childKey, msgWrapper, handler,
  childMsgValidator=ALWAYS_TRUE,
  childTraits=DEFAULT_CHILD_TRAITS,
  resultTraits=DEFAULT_RESULT_TRAITS,
  msgTraits=DEFAULT_MSG_TRAITS
) {

  let bwdHandler = childrenBwd( childKey, msgWrapper, handler, childTraits, resultTraits );
  let fwdHandler = childrenFwd( bwdHandler, childMsgValidator, msgTraits );
  return fwdHandler;
}


// function restVector(
//   validator=ALWAYS_TRUE,
//   resultTraits=DEFAULT_RESULT_TRAITS
// ) {
//   return match({
//     POST: (model, newElement)=>{
//       model.push(newElement);
//       let r = resultTraits.pack({
//         newModel: model
//       });
//       return r;
//     }
//   });
// }

// export const rest = {


//   msg: uifMsg.generator([
//     'POST',
//     'PUT',
//     'DELETE'
//   ]),

//   vector: restVector

// };

