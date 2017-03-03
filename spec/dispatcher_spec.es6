import * as dispatcher from '../src/uif/dispatcher.es6'

let M = (value)=> { return { name: 'M', value}; };
let W = (value)=> { return { name: 'W', value}; };


describe('dispatcher', ()=>{

  it('should forward calls to the wrapped handler', ()=>{
    let target = jasmine.createSpy()
    let d = dispatcher.make(target);
    let m1 = M('foo'), m2 = M('bar');

    d.dispatch(M('foo'))
    d.dispatch(M('bar'))

    expect(target).toHaveBeenCalledWith(M('foo'));
    expect(target).toHaveBeenCalledWith(M('bar'));

  });


  it('should be scopable for passing to children', ()=>{
    let target = jasmine.createSpy()
    let d = dispatcher.make(target);
    let w = d.wrap(W);

    w.dispatch(M('foo'))
    expect(target).toHaveBeenCalledWith({ name: 'W', value: { name: 'M', value: 'foo'}});

    w.dispatch(M('bar'))
    expect(target).toHaveBeenCalledWith({ name: 'W', value: { name: 'M', value: 'bar'}});
  });




});



