import {replace, assoc, dissoc, update, conj, updateIn} from '../src/uif/transform_object.es6'
// Use the same spec as JSONPatch
// [
//   { "op": "replace", "path": "/baz", "value": "boo" },
//   { "op": "add", "path": "/hello", "value": ["world"] },
//   { "op": "remove", "path": "/foo"}
// ]

// The transformer is
describe('transform_fn', ()=>{
  describe('replace', ()=>{
    it('should replace the value', ()=> {
      let o = replace( 'foo', 'bar');
      expect( o.value ).toEqual('bar');
      expect( o.patches ).toEqual([
        { op: 'replace', path: '/', value: 'bar' },
      ]);
    });
  });


  describe('assoc', ()=>{

    it('should add new keys single levels', ()=>{
      let o =  assoc( {foo:'foo'}, { bar: 'bar', baz: 'baz'  });
      expect(o.value).toEqual( { foo: 'foo', bar: 'bar', baz: 'baz' });
      expect(o.patches)
        .toEqual([
          { op: "add", path: "/bar", value: "bar" },
          { op: "add", path: "/baz", value: "baz" },
        ]);
    });


    it('should replace on single levels', ()=>{
      let o =  assoc( {foo:'foo'}, { foo: 'bar' });
      expect(o.value).toEqual( { foo: 'bar' });
      expect(o.patches)
        .toEqual([ { op: "replace", path: "/foo", value: "bar" } ]);
    });


  });


  describe('dissoc', ()=>{

    it('should remove keys', ()=>{
      let o =  dissoc( {foo:'foo', bar: 'bar', baz: 'baz'}, ['foo', 'bar']);
      expect(o.value).toEqual( {baz: 'baz'});
      expect(o.patches)
        .toEqual([
          { op: "remove", path: "/foo" },
          { op: "remove", path: "/bar" },
        ]);
    });


    it('should do nothing with empty keys', ()=>{
      let o =  dissoc( {foo:'foo', bar: 'bar'}, ['bar', 'baz']);
      expect(o.value).toEqual( { foo: 'foo' });
      expect(o.patches)
        .toEqual([ { op: "remove", path: "/bar" } ]);
    });
  });


  describe('update', ()=>{

    it('should call the updater with the object', ()=>{
      let o = update( {foo:'foo', bar: 'bar'}, 'foo', (foo)=> foo + "baz" );
      expect(o.value).toEqual( { foo: 'foobaz', bar: 'bar' });
      expect(o.patches)
        .toEqual([ { op: "replace", path: "/foo", value: "foobaz" } ]);
    });
  });


  describe('conj', ()=>{
    it('should append an element to an array', ()=>{
      let o = conj( ['foo'], 'bar' );
      expect( o.value ).toEqual( ['foo', 'bar' ] );
      expect( o.patches )
        .toEqual([
          { op: 'add', path: '/1', value: 'bar' }
        ]);
    });
  });



  describe('updateIn', ()=>{
    it('should update a non-nested', ()=>{
      let o = updateIn({foo: {bar: 'bar'}}, [], replace, 'baz' );
      expect( o.value ).toEqual('baz');
      expect( o.patches ).toEqual([
        { op: 'replace', path: '/', value: 'baz'},
      ]);
    });


    it('should update a nested property', ()=>{
      let o = updateIn({foo: {bar: 'bar'}}, ['foo', 'bar'], replace, 'baz');
      expect( o.value ).toEqual({foo: {bar: 'baz'}});
      expect( o.patches ).toEqual([
        { op: 'replace', path: '/foo/bar', value: 'baz'},
      ]);
    });

    it('should update a nested array with conj', ()=>{
      let o = updateIn({foo: {bar: []}}, ['foo', 'bar'], conj, 'baz');
      expect( o.value ).toEqual({foo: {bar: ['baz']}});
      expect( o.patches ).toEqual([
        { op: 'add', path: '/foo/bar/0', value: 'baz'},
      ]);
    });

    it('should remove a nested key with dissoc', ()=>{
      let o = updateIn({foo: {bar: {baz: 'baz', yay:'yay'}}}, ['foo', 'bar'], dissoc, ['baz']);
      expect( o.value ).toEqual({foo: {bar: {yay: 'yay'}}});
      expect( o.patches ).toEqual([
        { op: 'remove', path: '/foo/bar/baz' },
      ]);
    });
  });

});
