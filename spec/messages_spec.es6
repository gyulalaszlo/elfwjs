import {DEFAULT_MSG_TRAITS} from '../src/uif/traits/messages_traits.es6'

describe('Default message traits', ()=>{

  let T = DEFAULT_MSG_TRAITS;

  describe('make', ()=>{

    it('should create new messages', ()=>{
      let a  = T.make("hello", { foo: 'bar' });
      expect( T.get_name(a) ).toEqual( 'hello' );
      expect( T.get_value(a) ).toEqual( { foo: 'bar' });
    });

  });


  describe('generator', ()=>{

    it('should generate a new message for the name', ()=>{
      let g = T.generator([ "foo", "bar" ]);

      let a = g.foo();
      let b = g.bar({bar: 'bar'});

      expect( T.get_name(a) ).toEqual('foo');
      expect( T.get_name(b) ).toEqual('bar');
      expect( T.get_value(a) ).not.toBeDefined();
      expect( T.get_value(b) ).toEqual({bar:'bar'});
    });
  });



});
