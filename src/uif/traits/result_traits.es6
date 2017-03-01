



// Result traits for results without a returning message (AKA only the model is
// returned)
export const NOMSG_RESULT_TRAITS = {
  pack: ({new_model, local_messages, to_parent_messages, root_messages})=> {
    return new_model;
  },

  unpack: (results)=> {
    return { new_model: results };
  }
}

// Legacy result wrappers for older components
export const LEGACY_RESULT_TRAITS = {

  pack: ({new_model, local_messages, to_parent_messages, to_root_messages})=> {
    return [ new_model, local_messages, to_parent_messages, to_root_messages ]
  },

  unpack: (res)=> {
    let [new_model, local_messages, to_parent_messages, to_root_messages] = res;
    return { new_model, local_messages, to_parent_messages, to_root_messages };
  }
};



// The simplest result type is the one without any wrapping
export const DEFAULT_RESULT_TRAITS = {

  // default result layout is:
  // {new_model, local_messages, to_parent_messages, to_root_messages}
  pack: (res)=> res,
  unpack: (res)=>res
};
