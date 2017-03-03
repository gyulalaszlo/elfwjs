import * as dispatcher from '../src/uif/dispatcher.es6'

describe('dispatchWrapper', ()=>{

  let D =dispatcher.DEFAULT_ROOT_DISPATCHER_TRAITS;

  it('should update the model from the "model" field', ()=>{
    // create a fake dispatcher
    let state = { queue: [], model: []}
    let fakeDispatcher = jasmine.createSpyObj(['dispatch']);

    let dw = D.init([], fakeDispatcher);
    state = D.reduce(state, { model: ['foo'] });

    expect( state.model ).toEqual(['foo']);
    expect( state.queue ).toEqual([]);

    expect( fakeDispatcher.dispatch ).not.toHaveBeenCalled();
  });


  it('should add messages coming from the update to the queue', ()=>{
    // create a fake dispatcher
    let state = { queue: [], model: []}
    let fakeDispatcher = jasmine.createSpyObj(['dispatch']);

    let dw = D.init([], fakeDispatcher);
    state = D.reduce(state, { model: ['foo'], toParentMessages: [
      { name: 'bar', value: 'baz' }
    ] });

    expect( state.model ).toEqual(['foo']);
    expect( state.queue ).toEqual([
      { name: 'bar', value: 'baz' }
    ]);

    expect( fakeDispatcher.dispatch ).not.toHaveBeenCalled();
  });

});
