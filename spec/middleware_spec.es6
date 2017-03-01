import * as middleware from '../src/uif/middleware.es6'
import {DEFAULT_MSG_TRAITS} from '../src/uif/traits/messages_traits.es6'


let fake_logger = ()=> jasmine.createSpyObj("logger", ['debug', 'info', 'error']);


describe('middleware', ()=> {
  let model, logger, msg, resp;

  let fake_handler = (name, ret)=>
    jasmine.createSpy(`handler ${name}`).and.callFake(()=> ret);

  let expect_handler_called = (fh, times=1, msg_=msg)=> {
    expect(fh.calls.count()).toEqual(times);
    if (times > 0) {
      expect(fh).toHaveBeenCalledWith( model, msg_, logger );
    }
    // hopefully we dont log anything to errros
    expect(logger.error.calls.count()).toEqual(0);
  };


  beforeEach( ()=>{
    model = jasmine.createSpy("model");
    logger = fake_logger();
    msg = jasmine.createSpy("msg");
    resp = jasmine.createSpy("resp");
  });


  describe('chain', ()=> {


    it('should combine responders', ()=> {
      let h1 = fake_handler('1', null);
      let h2 = fake_handler('2', resp);

      let chain = middleware.chain([ h1, h2 ]);

      expect(chain(model, msg, logger)).toEqual(resp);
      expect_handler_called(h1);
      expect_handler_called(h2);
    });


    it('should stop at the first non-null returning one', ()=> {
      let h1 = fake_handler('1', null);
      let h2 = fake_handler('2', resp);
      let h3 = fake_handler('3', null);

      let chain = middleware.chain([ h1, h2 ]);

      expect(chain(model, msg, logger)).toEqual(resp);
      expect_handler_called(h1, 1);
      expect_handler_called(h2, 1);
      expect_handler_called(h3, 0);
    });
  });


  describe('match', ()=> {

    let handler = ()=> {
      return {
        foo: fake_handler('1', 'foo'),
        bar: fake_handler('1', { bar: 'bar' }),
      };
    };

    let mm = DEFAULT_MSG_TRAITS.make;


    it('should dispatch based on the name field of the message', ()=>{

        let h = handler();
        expect(middleware.match(h)(model, mm('foo', msg), logger)).toEqual('foo');
        expect_handler_called(h.foo, 1);
        expect_handler_called(h.bar, 0);
    });

    it('should be able to return complex objects(?)', ()=>{
        let h = handler();
        expect(middleware.match(h)(model, mm('bar', msg), logger)).toEqual({ bar: 'bar' });
        expect_handler_called(h.foo, 0);
        expect_handler_called(h.bar, 1);
    });

    it('should return null if no handler key is found', ()=>{
        let h = handler();
        expect(middleware.match(h)(model, mm('baz', msg), logger)).toEqual(null);
        expect_handler_called(h.foo, 0);
        expect_handler_called(h.bar, 0);
    });


    it('should accept a custom message traits object', ()=> {
        let h = handler();
        msg = { $$foo: 'foo', name: 'bar' };
        let msg_traits = {
          get_name: (m)=> m.$$foo,
          get_value: (m)=> m.name
        };
        expect(middleware.match(h, msg_traits)(model, msg, logger)).toEqual('foo');
        expect_handler_called(h.foo, 1, 'bar');
        expect_handler_called(h.bar, 0);
    });

  });


});

describe('children', ()=> {
  let model, logger, callCount;

  let msgs = DEFAULT_MSG_TRAITS.generator([
    'bar_msg',
    'baz_msg'
  ]);
  let bar_msg = msgs.bar_msg;
  const BAZ_MSG = msgs.baz_msg({ one: '1', two: '2', plus: '+' });
  const FOOBAR_MSG = { foobar: 'foobar' };

  // Child handlers

  let child_handler = (mdl, msg, logger)=> {
    let {one, plus, two} = DEFAULT_MSG_TRAITS.get_value(msg);
    expect(one).toEqual('1');
    expect(two).toEqual('2');
    expect(plus).toEqual('+');
    callCount++;
    expect(mdl).toEqual(model.bar);
    return { baz: `${mdl.baz} = ${one} ${plus} ${two}` };
  };

  let legacy_child_handler = (mdl, msg, logger)=> {
    return [child_handler(mdl, msg, logger), [ FOOBAR_MSG ]];
  };

  let child_handler_with_msg = (mdl, msg, logger)=> {
    return {
      new_model: child_handler(mdl, msg, logger),
      local_messages: [ FOOBAR_MSG ]
    };
  };


  // Default results check
  let check_child_results = ({
    new_model, local_messages,
    to_parent_messages, to_root_messages
  })=> {
    expect(local_messages).toEqual([ bar_msg(FOOBAR_MSG) ]);
    expect(to_parent_messages).toEqual(undefined);
    expect(to_root_messages).toEqual(undefined);

    expect(new_model).toEqual({
      foo: 'foo',
      bar: { baz: 'baz = 1 + 2' }
    });
    expect(callCount).toEqual(1);
  };

  // =========

  beforeEach(()=>{
    logger = fake_logger()
    model = {
      foo: 'foo',
      bar: { baz: 'baz' }
    };
    callCount = 0;

  });

  // =========

  describe('children_fwd', ()=> {

    it('should forward messages to the proper children', ()=> {
      let c = middleware.children_fwd( child_handler, middleware.HAS_NAME("bar_msg") );
      let msg = bar_msg( BAZ_MSG );

      expect(c(model.bar, msg, logger)).toEqual({ baz: 'baz = 1 + 2'});
      expect(callCount).toEqual(1);
    });
  });

  //
  // =========
  //

  describe('children_bwd', ()=> {

    // Nomsg
    //
    it('should wrap messages from the children and update their model', ()=> {
      let c = middleware.children_bwd( 'bar', bar_msg,  child_handler,
        middleware.DEFAULT_CHILD_TRAITS,
        middleware.NOMSG_RESULT_TRAITS
      );

      expect(c(model, BAZ_MSG, logger)).toEqual({
        foo: 'foo',
        bar: { baz: 'baz = 1 + 2' }
      });
      expect(callCount).toEqual(1);
    });


    // Default

    it('should handle message results from the update fn', ()=> {
      let c = middleware.children_bwd( 'bar', bar_msg, child_handler_with_msg );
      let results = c(model, BAZ_MSG, logger);
      check_child_results(results);
    });

    // Legacy

    it('should handle legacy results from the update fn', ()=> {
      let c = middleware.children_bwd( 'bar', bar_msg,  legacy_child_handler,
        middleware.DEFAULT_CHILD_TRAITS,
        middleware.LEGACY_RESULT_TRAITS
      );

      let result = c(model, BAZ_MSG, logger);
      check_child_results(middleware.LEGACY_RESULT_TRAITS.unpack(result));
    });
  });


  //
  // =========
  //


  describe('combined', ()=>{


    it('should forward messages to the child, update the model and wrap the messages', ()=>{
      let c = middleware.children( 'bar', bar_msg, child_handler_with_msg,
        middleware.HAS_NAME('bar_msg')
      );
      let results = c(model, bar_msg(BAZ_MSG), logger);
      check_child_results(results);
    });
  });


  describe('rest_vector', ()=>{

    it('should support POST', ()=>{

      let element_factory = ()=> { return { foo: 'foo' } };
      let r = middleware.rest.vector();

      let model = [];
      let res = r([], middleware.rest.msg.POST( element_factory() ), logger);
      expect(res.new_model).toEqual([{foo:'foo'}]);

    });


    // it('should forward messages to the child in a vector, update the model and wrap the messages', ()=>{
    //   let model = {
    //     bar: [
    //       { baz: "baz" },
    //       { foobar: 'foobar' }
    //     ]
    //   };

    //   let c = middleware.children_vector( bar_msg, child_handler_with_msg );
    //   let results = c(model, bar_msg(BAZ_MSG), logger);
    //   check_child_results(results);
    // });
  });
});
