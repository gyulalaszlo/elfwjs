import {DEFAULT_MSG_TRAITS} from '../src/uif/traits/messages_traits.es6'
import {ResultIntegrators} from '../src/uif/middleware/result-integrators.es6'
import {View} from '../src/uif/middleware/view.es6'
// import * as middleware from '../src/uif/middleware.es6'
import {NOOP_ROOT_WRAPPER_TRAITS} from '../src/uif/dispatcher.es6'
import * as App from '../src/uif/app.es6'
// import {assoc} from '../src/uif/transform_object.es6'



let Msg = DEFAULT_MSG_TRAITS.generator([
  'load_data',
  'compile_code',
  'apply_transform',
]);

// let Model = ()=> {
//   return {
//     data: []
//   };
// };


// let Update = middleware.match({
//   load_data: (model, data)=>{
//     return {
//       newModel: assoc(model, {data}),
//       localMessages: [ Msg.apply_transform() ],
//     };
//   },
// }, DEFAULT_MSG_TRAITS);


// let View = (model, dispatch)=>
//   ['div', {className: 'input'}, [
//     ['label', {}, [ 'Hello world' ]]
//   ]]


describe('App', ()=>{
  let errorHandler;

  const MSG_T = DEFAULT_MSG_TRAITS;
  const {getName, getValue} = DEFAULT_MSG_TRAITS;
  const SAMPLE_DATA = [
    { id: 0, value: 1 },
    { id: 1, value: 2 },
  ];

  let makeTestApp = (obj, middleware=[])=>
    App.make(obj, middleware, errorHandler);

  beforeEach(()=> {
    errorHandler = jasmine.createSpy('errorHandler').and.callFake( console.error );;
  });

  afterEach(()=> {
    expect( errorHandler ).not.toHaveBeenCalled();
  });


  it('should dispatch to update on message', ()=>{
    let update = jasmine.createSpy('update').and.returnValue('hello');
    let app = makeTestApp({ model: [], update }, [
      ResultIntegrators.noop,
    ]);

    app.dispatcher().dispatch( Msg.load_data(SAMPLE_DATA));
    expect( update ).toHaveBeenCalledWith([], Msg.load_data(SAMPLE_DATA));
  });


  it('should render a view if given a message', ()=>{
    let update = (model, msg)=> {
      expect( getName(msg) ).toEqual('load_data');
      return getValue(msg);
    }

    let view = jasmine.createSpy('view');
    let app = makeTestApp({ model: [], update }, [
      ResultIntegrators.noop,
      View.generateTree(view),
    ]);

    app.dispatcher().dispatch( Msg.load_data(SAMPLE_DATA));
    expect( view ).toHaveBeenCalledWith(SAMPLE_DATA, app.dispatcher());
  });




  describe('error handling', ()=> {

    it('should handler errors in update', ()=>{
      let update = (model, msg)=> {
        throw 'foo';
      }

      let errorHandler = jasmine.createSpy('errorHandler');
      let app = App.make({ model: [], update }, [
        ResultIntegrators.noop,
      ], errorHandler);

      app.dispatcher().dispatch( Msg.load_data(SAMPLE_DATA));
      expect( errorHandler ).toHaveBeenCalledWith('foo');
    });


    it('should handler errors in the middleware', ()=>{
      let update = (model, msg)=> getValue(msg);
      let view = (model, dispatch)=> { throw 'bar'; }

      let errorHandler = jasmine.createSpy('errorHandler');
      let app = App.make({ model: [], update }, [
        ResultIntegrators.noop,
        View.generateTree(view),
      ], errorHandler);

      app.dispatcher().dispatch( Msg.load_data(SAMPLE_DATA));
      expect( errorHandler ).toHaveBeenCalledWith('bar');
    });

  });


  // describe('parentMessage forwarding', ()=>{
  //   let update = jasmine.createSpy('update').and.returnValue(
  //   'hello');
  //   let app = makeTestApp({ model: [], update }, [
  //     appMiddleware.ResultIntegrators.noop,
  //   ]);

  //   app.dispatcher().dispatch( Msg.load_data(SAMPLE_DATA));
  //   expect( update ).toHaveBeenCalledWith([], Msg.load_data(SAMPLE_DATA));
  // });

});
