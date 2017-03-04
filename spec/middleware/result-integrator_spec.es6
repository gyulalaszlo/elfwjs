import {ResultIntegrators} from '../../src/uif/middleware/result-integrators.es6'

describe('middleware::ResultIntegrators', ()=>{


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


