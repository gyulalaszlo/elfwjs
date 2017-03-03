
// A basic FIFO queue
export class Queue {
  constructor() {
    this._elements = [];
  }

  // Pushes an element to the end of the queue
  push(o) {
    this._elements.push(o);
  }

  // Returns the elements in the queue
  elements() {
    return this._elements;
  }

  append(els) {
    this._elements = this._elements.concat(els);
  }

  // Runs a FIFO reduction on the elements of the queue.
  //
  // The reducer fn is allowed to push elements to the queue , and those new
  // elements will be also reduced by this reduce.
  reduce(fn, memo) {
    while (this._elements.length > 0) {
      let el = this._elements.shift();
      if (typeof el === 'undefined') { continue; }

      memo = fn(memo, el);
    }

    return memo;
  }
}

