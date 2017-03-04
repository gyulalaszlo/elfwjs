

export function make(fn) {
  return (dispatcher, msgOut)=> {
    let done = (val)=> dispatcher(msgOut(val));
    fn(done);
  };
}
