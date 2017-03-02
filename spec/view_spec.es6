import {makeViewConverter} from '../src/uif/views.es6'


describe('view', ()=>{
  let viewElementTraits;

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
  });

  describe('View', ()=>{

    it('should return a view-like array list', ()=>{
      let view = (model, dispatch)=> div('key');

      let viewConverter = makeViewConverter(viewElementTraits);
      let o = viewConverter( view() );

      expect(viewElementTraits.createElement).toHaveBeenCalledWith(div('key'));
      expect(o).toEqual({ args: [div('key')]});
    });



    it('should wrap children with createElement', ()=>{
      let view = (model, dispatch)=> div('key', [
        div('inner-1' ),
        div('inner-2' ),
      ]);

      let viewConverter = makeViewConverter( viewElementTraits );
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




  describe('renderLoop', ()=>{

  });

});
