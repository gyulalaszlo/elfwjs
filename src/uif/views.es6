export let NOOP_VIEW_TRAITS = {
  createElement: ({name, attributes, children, key})=> {
    return { name, attributes, children, key };
  },
};



export function makeViewConverter({createElement}) {
  // converts an element to actual dom using createElement
  let  convertElement = ({name, attributes, children, key})=> {
    // go through the children recursively
    return createElement({ name, attributes, children:children.map(convertElement), key});
  }
  // return the fn
  return convertElement;
}
