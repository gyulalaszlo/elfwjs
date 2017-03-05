



// Result traits for results without a returning message (AKA only the model is
// returned)
export const NOMSG_RESULT_TRAITS = {
  pack: ({model, localMessages, toParentMessages, rootMessages})=> {
    return model;
  },

  unpack: (results)=> {
    return { model: results };
  }
}

// Legacy result wrappers for older components
export const LEGACY_RESULT_TRAITS = {

  pack: ({model, localMessages, toParentMessages, toRootMessages})=> {
    return [ model, localMessages, toParentMessages, toRootMessages ]
  },

  unpack: (res)=> {
    let [model, localMessages, toParentMessages, toRootMessages] = res;
    return { model, localMessages, toParentMessages, toRootMessages };
  }
};



// The simplest result type is the one without any wrapping
export const DEFAULT_RESULT_TRAITS = {

  // default result layout is:
  // {model, localMessages, toParentMessages, toRootMessages}
  pack: (res)=> res,
  unpack: (res)=>res
};
