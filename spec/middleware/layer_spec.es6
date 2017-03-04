import {Layer, layer} from '../../src/uif/middleware/layer.es6'

describe('middleware::Layer', ()=>{


  it('should wrap a middleware', ()=>{
    let fakeMiddleware = jasmine.createSpy('fakeMiddleware');
    let m = new Layer('fake', fakeMiddleware, {} );
    let state = 0, msg = 1, result = 2;
    m.apply(state, msg, result);
    expect(fakeMiddleware).toHaveBeenCalledWith(state, msg, result);
    expect(m.getName()).toEqual('fake');
    expect(m.getRequirements()).toEqual({state: [], result: [], msg: []});
  });


  it('should check the requirements', ()=>{
    let fakeMiddleware = jasmine.createSpy('fakeMiddleware');
    let m = new Layer('fake', fakeMiddleware, { state: ['model', 'dispatch'], msg: ['model']});
    let state = 0, msg = 1, result = 2;

    expect( ()=> m.apply(state, msg, result) ).toThrow(jasmine.objectContaining({
      errorFields: { state: ['model', 'dispatch'], msg: ['model'] }
    }));
    expect(fakeMiddleware).not.toHaveBeenCalled() //toHaveBeenCalledWith(state, msg, result);

    state = {model: 0, dispatch:1}, msg = {model: 2}, result = 3;
    expect( ()=> m.apply(state, msg, result) ).not.toThrow();
    expect(fakeMiddleware).toHaveBeenCalledWith(state, msg, result);
  });

});


describe('layer()', ()=>{
  it('should add throw if no apply() given',()=>{
    expect( ()=> layer({}) ).toThrow();
    expect( ()=> layer({ apply: jasmine.createSpy('apply') })).not.toThrow();
  });

  it('should add the Layer to the function as `.layer()`',()=>{
    let name = 'foo::bar';
    let requires = { state: ['model'] };
    let mutates = ['model'];
    let apply = (e)=> e + "foo";

    let mw = layer({name, requires, mutates, apply});
    let l = mw.getLayer();

    expect( l.getName() ).toEqual( name );
    expect( l.getRequirements() ).toEqual( {state: ['model'], msg: [], result: []} );
    expect( l.getMutatedFields() ).toEqual( mutates );
    expect( l.getWrappedFn() ).toEqual( apply );

  });
});





