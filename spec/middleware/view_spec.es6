import {View} from '../../src/uif/middleware/view.es6'


describe('middleware::View', ()=>{


  describe('generateTree', ()=>{
    it('should forward calls to the view with the model and the dispatch from the state', ()=>{
      let state = { model: 'foo', dispatcher: 'bar' };
      let view = jasmine.createSpy('view').and.returnValue('foobarbaz');
      let newState = View.generateTree(view)( state, {}, {} );
      expect(view).toHaveBeenCalledWith('foo', 'bar');
      expect(newState.viewTree).toEqual('foobarbaz');
    });
  });


  describe('frameUpdater', ()=>{
    let requestAnimationFrame;

    beforeEach(()=>{
      requestAnimationFrame = jasmine.createSpy('requestAnimationFrame')
        .and.callFake( (fn)=> { fn(10); })
    });

    it('should delegate rendering to the dedicated renderer', ()=>{
      let state = { viewTree: 'foo', viewNeedsUpdate: true };
      let view = (model, dispatch)=> ['div', {}, [String(model)]];
      let viewUpdater = jasmine.createSpy('viewUpdater').and.callFake( (e)=> null);

      let newState = View.frameUpdater(viewUpdater, requestAnimationFrame)(state, {}, {});
      expect(newState.viewNeedsUpdate).toBeFalsy();
      expect(requestAnimationFrame.calls.count()).toEqual(1);
      expect(viewUpdater.calls.count()).toEqual(1);
      expect(viewUpdater).toHaveBeenCalledWith('foo', 10);
      // requestAnimationFrame

    //   // let newState = (view, viewUpdater)( state, {}, {} );
    //   // expect(viewUpdater).toHaveBeenCalledWith(state, view(state.model));
    });

  });
});
