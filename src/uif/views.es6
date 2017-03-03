export let NOOP_VIEW_TRAITS = {
  createElement: ({name, attributes, children, key})=> {
    return { name, attributes, children, key };
  },

  init: ()=> {},
  reduce: ()=> {},
};



export function makeViewConverter({createElement}) {
  // converts an element to actual dom using createElement
  let  convertElement = ({name, attributes, children, key})=> {
    // go through the children recursively
    return createElement({ name, attributes, children:children.map(convertElement), key});
  };
  // return the fn
  return convertElement;
}


export function makeRenderer({init, reduce}, container) {

  let state = init(container);

  // returns a rendering function
  return (tree)=>{
    state = reduce(state, {tree});
    return state;
  };
}
