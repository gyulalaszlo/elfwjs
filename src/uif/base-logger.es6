// basic logger with pretty colors :)


function with_tag(base, {tag, css}) {
  return (...args)=> base(`%c ${tag} `, css, ...args);
}

function tag_css(css) {
  return Object.keys(css).map((k)=> `${k}: ${css[k]}`).join(';');
}

function tag(bg, fg) {
  return tag_css({
    color: fg,
    background: bg,
    display: 'inline-block',
    padding: '1px',
    'font-size': '0.8em'
  });
}

const TAG_CSS = {
  info: tag('#ccc', 'white'),
  group: tag('#ddd', '#999'),
  groupEnd: tag('#ddd', '#999'),
  error: tag('#c00', 'white'),
  warn: tag('#c90', 'white')
}


export function make(base=console, tags=TAG_CSS, tagger=with_tag) {
  let o = {};
  Object.keys(tags).forEach( (t)=> {
    o[t] = tagger( base[t], { tag: t, css: tags[t] });
  });
  return o;
}

