import {DEFAULT_MSG_TRAITS} from '../src/uif/traits/messages_traits.es6'
import * as middleware from '../src/uif/middleware.es6'
// import dispatcher from '../src/usf/dispatcher.es6'
// import handlers from '../src/uif/handlers.es6'
import * as App from '../src/uif/app.es6'
import {assoc} from '../src/uif/transform_object.es6'



let Msg = DEFAULT_MSG_TRAITS.generator([
  'load_data',
  'compile_code',
  'apply_transform',
]);

let Model = ()=> {
  return {
    data: []
  };
};


let Update = middleware.match({
  load_data: (model, data)=>{
    return {
      newModel: assoc(model, {data}),
      localMessages: [ Msg.apply_transform() ],
    };
  },
}, DEFAULT_MSG_TRAITS);


let View = (model, dispatch)=>
  ['div', {className: 'input'}, [
    ['label', {}, [ 'Hello world' ]]
  ]]



describe('App', ()=>{
  let app, model, errorHandler;

  const MSG_T = DEFAULT_MSG_TRAITS;
  const {getName, getValue} = DEFAULT_MSG_TRAITS;
  const SAMPLE_DATA = [
    { id: 0, value: 1 },
    { id: 1, value: 2 },
  ];


  beforeEach(()=> {
    // model =  Model();
    errorHandler = jasmine.createSpy('errorHandler').and.callFake( console.error );;
    // app = App.make({
    //   model: model,
    //   update: Update,
    //   view: View,
    //   Msg: Msg,
    // });
  });

  afterEach(()=> {
    expect( errorHandler ).not.toHaveBeenCalled();
  });


  it('should dispatch to update on message', ()=>{
    let update = jasmine.createSpy('update');
    let app = App.make({ model: [], update: update }, MSG_T, errorHandler);

    app.dispatch.dispatch( Msg.load_data(SAMPLE_DATA));
    expect( update ).toHaveBeenCalledWith([], Msg.load_data(SAMPLE_DATA));
  });


  it('should render a view if given a message', ()=>{
    let update = (model, msg)=> {
      expect( getName(msg) ).toEqual('load_data');
      return getValue(msg);
    }

    let view = jasmine.createSpy('view');
    let app = App.make({ model: [], update, view }, MSG_T, errorHandler);

    app.dispatch.dispatch( Msg.load_data(SAMPLE_DATA));
    expect( view ).toHaveBeenCalledWith(SAMPLE_DATA, app.dispatch);
  });



  describe('parentMessage forwarding', ()=>{

    // it('should re-dispatch commands returned from the update', ()=>{

    //   // fake update function
    //   let update = jasmine.createSpy('update').and.callFake((model, msg)=> {
    //     let name = getName(msg);
    //     if (name === 'load_data') {
    //       console.log(model.concat(getValue(msg)));
    //       return {
    //         newModel: model.concat(getValue(msg)),
    //         toParentMessages: [
    //           Msg.compile_code(['baz'])
    //         ]
    //       };
    //     } else if (name == 'compile_code') {
    //       return {
    //         newModel: model.concat(getValue(msg))
    //       };
    //     }
    //   });


    //   let updateWr

    //   // let view = jasmine.createSpy('view');
    //   let app = App.make({ model: [], update }, MSG_T, errorHandler);


    //   app.dispatch.dispatch( Msg.load_data(['foo', 'bar']));
    //   // expect
    //   expect( update.calls.count() ).toEqual(2);
    //   expect( update.calls.allArgs() ).toEqual([
    //     [ [], Msg.load_data(['foo', 'bar']) ],
    //     [ ['foo', 'bar'], Msg.compile_code(['baz']) ],
    //   ]);

    //   expect( app.model ).toEqual( ['foo', 'bar', 'baz' ]);
    // });
  });

});
