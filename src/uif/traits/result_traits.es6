



// Result traits for results without a returning message (AKA only the model is
// returned)
export const NOMSG_RESULT_TRAITS = {
  pack: ({newModel, localMessages, toParentMessages, rootMessages})=> {
    return newModel;
  },

  unpack: (results)=> {
    return { newModel: results };
  }
}

// Legacy result wrappers for older components
export const LEGACY_RESULT_TRAITS = {

  pack: ({newModel, localMessages, toParentMessages, toRootMessages})=> {
    return [ newModel, localMessages, toParentMessages, toRootMessages ]
  },

  unpack: (res)=> {
    let [newModel, localMessages, toParentMessages, toRootMessages] = res;
    return { newModel, localMessages, toParentMessages, toRootMessages };
  }
};



// The simplest result type is the one without any wrapping
export const DEFAULT_RESULT_TRAITS = {

  // default result layout is:
  // {newModel, localMessages, toParentMessages, toRootMessages}
  pack: (res)=> res,
  unpack: (res)=>res
};
