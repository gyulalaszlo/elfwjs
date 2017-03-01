import * as handlers from '../src/uif/handlers.es6'


describe("handler functions", ()=>{


  describe('handler.call', ()=>{

    let click_handler = (model, msg)=> {
      return (model / msg) + 1;
    };

    let failing_handler = (model, msg)=> {
      return msg();
    };


    it('should forward call arguments to the target', ()=> {
      let result = handlers.call(click_handler, 10, 2 );
      expect(result.value).toEqual( 6 );
      expect(result.errors).toBeUndefined();
    });

    it('should catch errors in the invocation', ()=> {
      let result = handlers.call( failing_handler, 10, 12 );
      expect(result.value).not.toBeDefined()
      expect(result.error).toBeDefined()
    });

  });
});
