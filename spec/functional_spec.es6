import {singleInstance} from '../src/uif/functional.es6'


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

});
