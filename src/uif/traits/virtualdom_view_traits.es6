import h from 'virtual-dom/virtual-hyperscript'

export let VIRTUALDOM_VIEW_TRAITS = {
  createElement: (name, attributes, children, key)=> {
    return h(name, attributes, children, key);;
  },
};

