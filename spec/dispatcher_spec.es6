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


  describe('emitter', ()=> {
    it('should create a function that dispatches a message', ()=> {
      let h = jasmine.createSpy('handler');
      let e = jasmine.createSpyObj(['preventDefault']);
      let d = dispatcher.make(h);
      let eh = d.event( h, 3, 4, 5);
      expect( eh(e) ).toBeFalsy();
      expect(h.calls.argsFor(0)).toEqual([3, 4, 5, e]);
      expect(e.preventDefault.calls.count()).toEqual(1);
    });
  });

  describe('event', ()=> {
    it('should create an event handler', ()=> {
      let h = jasmine.createSpy('handler');
      let e = jasmine.createSpyObj(['preventDefault']);
      let d = dispatcher.make(h);
      let eh = d.event( h, 3, 4, 5);
      expect( eh(e) ).toBeFalsy();
      expect(h.calls.argsFor(0)).toEqual([3, 4, 5, e]);
      expect(e.preventDefault.calls.count()).toEqual(1);
    });
  });

});



