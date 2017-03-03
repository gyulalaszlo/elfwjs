import * as appMiddleware from '../src/uif/app-middleware.es6'
import {NOOP_ROOT_WRAPPER_TRAITS} from '../src/uif/dispatcher.es6'



describe('app-middleware', ()=>{

  describe('resultIntegrator', ()=>{


    describe('noop', ()=>{
      it('should simply set the model to the result', ()=>{
        let state = { model: 'foo' };
        let msg = null;
        let result = 'bar';
        let newState = appMiddleware.ResultIntegrators.noop(state, msg, result);
        expect(newState.model).toEqual('bar');
      });
    });

    describe('default', ()=>{
      it('should set the model to the `model` key in the results', ()=>{
        let state = { model: 'foo', queue: [] };
        let msg = null;
        let result = {model: 'bar'};
        let newState = appMiddleware.ResultIntegrators.default(state, msg, result);
        expect(newState.model).toEqual('bar');
      });



      it('should add messages to the queue', ()=>{
        // create a fake dispatcher
        let state = { queue: [], model: 'foo'}
        let msg = null;
        let result = {model: 'bar', toParentMessages: [{ name: 'foo' }]};

        let newState = appMiddleware.ResultIntegrators.default(state, msg, result);
        expect( newState.model ).toEqual('bar');
        expect( newState.queue ).toEqual([{name: 'foo'}]);
      });



    });

  });


  describe('rederer', ()=>{
    it('should forward calls to the view with the model and the dispatch from the state', ()=>{
        let state = { model: 'foo', dispatch: 'bar' };
        let view = jasmine.createSpy('view');
        let newState = appMiddleware.renderer(view)( state );
        expect(view).toHaveBeenCalledWith('foo', 'bar');
    });
  });
});
