import * as router from '../src/uif/router.es6'

import {DEFAULT_MSG_TRAITS} from '../src/uif/traits/messages_traits.es6'
import {DEFAULT_CHILD_TRAITS} from '../src/uif/traits/child_traits.es6'
import {
  NOMSG_RESULT_TRAITS,
  LEGACY_RESULT_TRAITS,
  DEFAULT_RESULT_TRAITS,
} from '../src/uif/traits/result_traits.es6'



let fakeLogger = ()=> jasmine.createSpyObj("logger", ['debug', 'info', 'error']);


describe('router', ()=> {
  let model, logger, msg, resp;

  let fakeHandler = (name, ret)=>
    jasmine.createSpy(`handler ${name}`).and.callFake(()=> ret);

  let expectHandlerCalled = (fh, times=1, msg_=msg)=> {
    expect(fh.calls.count()).toEqual(times);
    if (times > 0) {
      expect(fh).toHaveBeenCalledWith( model, msg_, logger );
    }
    // hopefully we dont log anything to errros
    expect(logger.error.calls.count()).toEqual(0);
  };


  beforeEach( ()=>{
    model = jasmine.createSpy("model");
    logger = fakeLogger();
    msg = jasmine.createSpy("msg");
    resp = jasmine.createSpy("resp");
  });


  describe('chain', ()=> {


    it('should combine responders', ()=> {
      let h1 = fakeHandler('1', null);
      let h2 = fakeHandler('2', resp);

      let chain = router.chain([ h1, h2 ]);

      expect(chain(model, msg, logger)).toEqual(resp);
      expectHandlerCalled(h1);
      expectHandlerCalled(h2);
    });


    it('should stop at the first non-null returning one', ()=> {
      let h1 = fakeHandler('1', null);
      let h2 = fakeHandler('2', resp);
      let h3 = fakeHandler('3', null);

      let chain = router.chain([ h1, h2 ]);

      expect(chain(model, msg, logger)).toEqual(resp);
      expectHandlerCalled(h1, 1);
      expectHandlerCalled(h2, 1);
      expectHandlerCalled(h3, 0);
    });
  });


  describe('match', ()=> {

    let handler = ()=> {
      return {
        foo: fakeHandler('1', 'foo'),
        bar: fakeHandler('1', { bar: 'bar' }),
      };
    };

    let mm = DEFAULT_MSG_TRAITS.make;


    it('should dispatch based on the name field of the message', ()=>{

        let h = handler();
        expect(router.match(h)(model, mm('foo', msg), logger)).toEqual('foo');
        expectHandlerCalled(h.foo, 1);
        expectHandlerCalled(h.bar, 0);
    });

    it('should be able to return complex objects(?)', ()=>{
        let h = handler();
        expect(router.match(h)(model, mm('bar', msg), logger)).toEqual({ bar: 'bar' });
        expectHandlerCalled(h.foo, 0);
        expectHandlerCalled(h.bar, 1);
    });

    it('should return null if no handler key is found', ()=>{
        let h = handler();
        expect(router.match(h)(model, mm('baz', msg), logger)).toEqual(null);
        expectHandlerCalled(h.foo, 0);
        expectHandlerCalled(h.bar, 0);
    });


    it('should accept a custom message traits object', ()=> {
        let h = handler();
        msg = { $$foo: 'foo', name: 'bar' };
        let msgTraits = {
          getName: (m)=> m.$$foo,
          getValue: (m)=> m.name
        };
        expect(router.match(h, msgTraits)(model, msg, logger)).toEqual('foo');
        expectHandlerCalled(h.foo, 1, 'bar');
        expectHandlerCalled(h.bar, 0);
    });

  });


});

describe('children', ()=> {
  let model, logger, callCount;

  let msgs = DEFAULT_MSG_TRAITS.generator([
    'barMsg',
    'bazMsg'
  ]);
  let barMsg = msgs.barMsg;
  const BAZ_MSG = msgs.bazMsg({ one: '1', two: '2', plus: '+' });
  const FOOBAR_MSG = { foobar: 'foobar' };

  // Child handlers

  let childHandler = (mdl, msg, logger)=> {
    let {one, plus, two} = DEFAULT_MSG_TRAITS.getValue(msg);
    expect(one).toEqual('1');
    expect(two).toEqual('2');
    expect(plus).toEqual('+');
    callCount++;
    expect(mdl).toEqual(model.bar);
    return { baz: `${mdl.baz} = ${one} ${plus} ${two}` };
  };

  let legacyChildHandler = (mdl, msg, logger)=> {
    return [childHandler(mdl, msg, logger), [ FOOBAR_MSG ]];
  };

  let childHandlerWithMsg = (mdl, msg, logger)=> {
    return {
      model: childHandler(mdl, msg, logger),
      localMessages: [ FOOBAR_MSG ]
    };
  };


  // Default results check
  let checkChildResults = ({
    model, localMessages,
    toParentMessages, toRootMessages
  })=> {
    expect(localMessages).toEqual([ barMsg(FOOBAR_MSG) ]);
    expect(toParentMessages).toEqual(undefined);
    expect(toRootMessages).toEqual(undefined);

    expect(model).toEqual({
      foo: 'foo',
      bar: { baz: 'baz = 1 + 2' }
    });
    expect(callCount).toEqual(1);
  };

  // =========

  beforeEach(()=>{
    logger = fakeLogger()
    model = {
      foo: 'foo',
      bar: { baz: 'baz' }
    };
    callCount = 0;

  });

  // =========

  describe('childrenFwd', ()=> {

    it('should forward messages to the proper children', ()=> {
      let c = router.childrenFwd({
        update: childHandler,
        onlyIf: router.HAS_NAME("barMsg"),
      });
      let msg = barMsg( BAZ_MSG );

      expect(c(model.bar, msg, logger)).toEqual({ baz: 'baz = 1 + 2'});
      expect(callCount).toEqual(1);
    });
  });

  //
  // =========
  //

  describe('childrenBwd', ()=> {
    let errorHandler;

    beforeEach(()=>{
      errorHandler = jasmine.createSpy('errorHandler').and.callFake(console.error);
    });

    afterEach(()=>{
      expect(errorHandler).not.toHaveBeenCalled();
    });

    // Nomsg
    //
    it('should wrap messages from the children and update their model', ()=> {
      let c = router.childrenBwd( {
        key: 'bar', msg: barMsg,  update: childHandler,
        childTraits: DEFAULT_CHILD_TRAITS,
        resultTraits: NOMSG_RESULT_TRAITS,
        errorHandler: errorHandler,
      });

      expect(c(model, BAZ_MSG, logger)).toEqual({
        foo: 'foo',
        bar: { baz: 'baz = 1 + 2' }
      });
      expect(callCount).toEqual(1);
    });


    // Default

    it('should handle message results from the update fn', ()=> {
      let c = router.childrenBwd( {
        key: 'bar', msg: barMsg, update: childHandlerWithMsg, errorHandler
      });
      let results = c(model, BAZ_MSG, logger);
      checkChildResults(results);
    });

    it('should return null if the nested handler returned null', ()=> {
      let handler = ()=> { return null };
      let c = router.childrenBwd({
        key: 'bar', msg: barMsg, update: handler, errorHandler
      });
      let results = c(model, BAZ_MSG, logger);
      expect(results).toEqual(null);
    });


    it('should errrors in the nested handler', ()=> {
      let handler = ()=> { throw 'foo'; };
      let errorHandler = jasmine.createSpy('failing errorHandler');
      let c = router.childrenBwd({
        key: 'bar', msg: barMsg, update: handler, errorHandler
      });
      expect( ()=>  c(model, BAZ_MSG, logger)).not.toThrow();
      expect( errorHandler.calls.count() ).toEqual(1);
    });
    // Legacy

    it('should handle legacy results from the update fn', ()=> {
      let c = router.childrenBwd( {
        key: 'bar', msg: barMsg, update: legacyChildHandler,
        childTraits: DEFAULT_CHILD_TRAITS,
        resultTraits: LEGACY_RESULT_TRAITS,
        errorHandler: errorHandler,
      });

      let result = c(model, BAZ_MSG, logger);
      checkChildResults(LEGACY_RESULT_TRAITS.unpack(result));
    });
  });


  //
  // =========
  //


  describe('combined', ()=>{


    it('should forward messages to the child, update the model and wrap the messages', ()=>{
      let errorHandler = jasmine.createSpy('failing errorHandler');
      let c = router.children({
          key: 'bar',
          msg: barMsg,
          update: childHandlerWithMsg,
          onlyIf: router.HAS_NAME('barMsg'),
          errorHandler: errorHandler,
      });
      let results = c(model, barMsg(BAZ_MSG), logger);
      checkChildResults(results);
      expect( errorHandler ).not.toHaveBeenCalled();
    });

    it('should call the error handler for errors', ()=>{
      let errorHandler = jasmine.createSpy('failing errorHandler');
      let handler = ()=> { throw 'foo'; };
      let c = router.children({
        key: 'bar', msg: barMsg, update: handler,
        errorHandler: errorHandler,
      });
      expect( ()=> c(model, barMsg(BAZ_MSG), logger) ).not.toThrow();
      expect( errorHandler.calls.count() ).toEqual(1);
    });
  });


  describe('restVector', ()=>{

//     it('should support POST', ()=>{

//       let elementFactory = ()=> { return { foo: 'foo' } };
//       let r = router.rest.vector();

//       let model = [];
//       let res = r([], router.rest.msg.POST( elementFactory() ), logger);
//       expect(res.newModel).toEqual([{foo:'foo'}]);

//     });


    // it('should forward messages to the child in a vector, update the model and wrap the messages', ()=>{
    //   let model = {
    //     bar: [
    //       { baz: "baz" },
    //       { foobar: 'foobar' }
    //     ]
    //   };

    //   let c = router.childrenVector( barMsg, childHandlerWithMsg );
    //   let results = c(model, barMsg(BAZ_MSG), logger);
    //   checkChildResults(results);
    // });
  });
});
