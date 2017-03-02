import {makeViewConverter, makeRenderer} from '../src/uif/views.es6'


describe('view', ()=>{
  let viewElementTraits, viewConverter;

  let div = (key, children=[])=> {
    return {
      name: 'div',
      attributes: {},
      children,
      key,
    };
  };

  beforeEach(()=>{
    viewElementTraits = jasmine.createSpyObj(['createElement'])
    viewElementTraits.createElement.and.callFake((...args)=>{ return { args: args } });

    viewConverter = makeViewConverter(viewElementTraits);
  });


  // View description
  // ================

  describe('View', ()=>{

    it('should return a view-like array list', ()=>{
      let view = (model, dispatch)=> div('key');

      let o = viewConverter( view() );

      expect(viewElementTraits.createElement).toHaveBeenCalledWith(div('key'));
      expect(o).toEqual({ args: [div('key')]});
    });



    it('should wrap children with createElement', ()=>{
      let view = (model, dispatch)=> div('key', [
        div('inner-1' ),
        div('inner-2' ),
      ]);

      let o = viewConverter( view() );

      expect( viewElementTraits.createElement )
        .toHaveBeenCalledWith( div('inner-1') );

      expect( viewElementTraits.createElement )
        .toHaveBeenCalledWith(div('inner-2'));

      let expectedChildren = [
        {args: [ div('inner-1') ]},
        {args: [ div('inner-2') ]},
      ];

      expect( viewElementTraits.createElement )
        .toHaveBeenCalledWith(div('key', expectedChildren));

      expect(o).toEqual({ args: [div('key', expectedChildren) ]});
    });

  });


  // View rendering
  // ==============

  describe('render', ()=>{
    let viewRenderer;
    let model, dispatch;

    beforeEach( ()=>{
      dispatch = jasmine.createSpy('dispatch');
      viewRenderer = jasmine.createSpyObj(['init', 'reduce']);

    });

    it('should delegate init to the function indicated by the traits', ()=>{
      let viewRenderer = jasmine.createSpyObj(['init']);
      let renderFn = makeRenderer(viewRenderer, { container: 'foocontainer'} );
      expect(viewRenderer.init).toHaveBeenCalledWith({container: 'foocontainer'});

    });


    it('should delegate rendering recursively to the function indicated by the traits', ()=>{
      let model = { a: 1 };
      let i = { name: 'div', attributes: {}, children: [], key: 'key' };

      // mock up a traits object
      let viewRenderer = jasmine.createSpyObj(['init', 'reduce']);
      viewRenderer.init.and.callFake(()=>{
        return { value: 0 };
      });

      viewRenderer.reduce.and.callFake((oldState, {tree})=>{
        return { value: oldState.value + tree.children.size };
      });

      // do the render
      let renderFn = makeRenderer(viewRenderer, 'container' );

      renderFn(i);
      expect(viewRenderer.reduce).toHaveBeenCalledWith({value: 0}, {
        tree: i
      });

    });

//     it('should render the given view', ()=>{
//       viewRenderer.reduce.and.callFake( (memo, newTree)=> {
//         memo.push(newTree);
//         return memo;
//       });

//       let i = { name: 'div', attributes: {}, children: [], key: 'key' };
//       let o = render(i);

//       exp
//       assert();


//     });
  });

});
