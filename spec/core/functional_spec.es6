import {singleInstance, reduction} from '../../src/uif/core/functional.es6'


describe('singleInstance', ()=>{

  it('should prevent recursion on the wrapped fn', ()=>{
    let test = 0;
    let o;
    let fn = jasmine.createSpy('innerFn').and.callFake(()=>{
      o();
      test += 1;
    });
    o = singleInstance(fn);

    o();
    expect(fn.calls.count()).toEqual( 1 );
    expect(test).toEqual(1);

    o();
    expect(fn.calls.count()).toEqual( 2 );
    expect(test).toEqual(2);
  });

  it('should allow providing a default return value', ()=>{
    let test = 0;
    let o;
    let fn = jasmine.createSpy('innerFn').and.callFake(()=>{
      test += o(2);
    });
    o = singleInstance(fn);

    let e = o();
    expect(fn.calls.count()).toEqual( 1 );
    expect(test).toEqual(2);
  });

  it('should allow providing a default return value and args', ()=>{
    let o;
    let fn = jasmine.createSpy('innerFn').and.callFake((test)=>{
      return test + o(2, test);
    });
    o = singleInstance(fn);

    let e = o(0, 8);
    expect(fn.calls.count()).toEqual( 1 );
    expect(e).toEqual(10);

  });
});


describe('pipe', ()=>{

});


describe('reduction', ()=>{

  it('should return a step function that mutates the state', ()=>{

    let ra = reduction((memo, i)=> memo + i, 0);
    ra(1);
    ra(2);
    let a = ra(3);

    expect(a).toEqual(6);
  });
});
