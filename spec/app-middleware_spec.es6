import {RequirementNotMet, Layer, ResultIntegrators, renderer} from '../src/uif/app-middleware.es6'
import {NOOP_ROOT_WRAPPER_TRAITS} from '../src/uif/dispatcher.es6'



describe('app-middleware', ()=>{


  describe('Layer', ()=>{


    it('should wrap a middleware', ()=>{
      let fakeMiddleware = jasmine.createSpy('fakeMiddleware');
      let m = new Layer('fake', {}, fakeMiddleware);
      let state = 0, msg = 1, result = 2;
      m.apply(state, msg, result);
      expect(fakeMiddleware).toHaveBeenCalledWith(state, msg, result);
      expect(m.getName()).toEqual('fake');
      expect(m.getRequirements()).toEqual({state: [], result: [], msg: []});
    });


    it('should check the requirements', ()=>{
      let fakeMiddleware = jasmine.createSpy('fakeMiddleware');
      let m = new Layer('fake', { state: ['model', 'dispatch'], msg: ['model']}, fakeMiddleware);
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




  describe('resultIntegrator', ()=>{


    describe('noop', ()=>{
      it('should simply set the model to the result', ()=>{
        let state = { model: 'foo' };
        let msg = null;
        let result = 'bar';
        let newState = ResultIntegrators.noop(state, msg, result);
        expect(newState.model).toEqual('bar');
      });
    });

    describe('default', ()=>{
      it('should set the model to the `model` key in the results', ()=>{
        let state = { model: 'foo', queue: [] };
        let msg = null;
        let result = {model: 'bar'};
        let newState = ResultIntegrators.default(state, msg, result);
        expect(newState.model).toEqual('bar');
      });



      it('should add messages to the queue', ()=>{
        // create a fake dispatcher
        let state = { queue: [], model: 'foo'}
        let msg = null;
        let result = {model: 'bar', toParentMessages: [{ name: 'foo' }]};

        let newState = ResultIntegrators.default(state, msg, result);
        expect( newState.model ).toEqual('bar');
        expect( newState.queue ).toEqual([{name: 'foo'}]);
      });



    });

  });


  describe('rederer', ()=>{
    it('should forward calls to the view with the model and the dispatch from the state', ()=>{
        let state = { model: 'foo', dispatcher: 'bar' };
        let view = jasmine.createSpy('view');
        let newState = renderer(view)( state, {}, {} );
        expect(view).toHaveBeenCalledWith('foo', 'bar');
    });
  });
});
