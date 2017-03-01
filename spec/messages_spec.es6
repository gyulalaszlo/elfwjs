import {DEFAULT_MSG_TRAITS} from '../src/uif/traits/messages_traits.es6'

describe('Default message traits', ()=>{

  let T = DEFAULT_MSG_TRAITS;

  describe('make', ()=>{

    it('should create new messages', ()=>{
      let a  = T.make("hello", { foo: 'bar' });
      expect( T.getName(a) ).toEqual( 'hello' );
      expect( T.getValue(a) ).toEqual( { foo: 'bar' });
    });

  });


  describe('generator', ()=>{

    it('should generate a new message for the name', ()=>{
      let g = T.generator([ "foo", "bar" ]);

      let a = g.foo();
      let b = g.bar({bar: 'bar'});

      expect( T.getName(a) ).toEqual('foo');
      expect( T.getName(b) ).toEqual('bar');
      expect( T.getValue(a) ).not.toBeDefined();
      expect( T.getValue(b) ).toEqual({bar:'bar'});
    });
  });



});
