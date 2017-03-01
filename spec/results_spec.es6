import {DEFAULT_RESULT_TRAITS} from '../src/uif/traits/result_traits.es6'

describe('default results traits', ()=>{

  let T = DEFAULT_RESULT_TRAITS;

  describe('pack / unpack', ()=>{
    it('should pack arguments', ()=> {

      let new_model = 1, local_messages=[1], to_parent_messages=[2];
      let a = T.pack({new_model, local_messages, to_parent_messages});
      let b = T.unpack(a);

      expect( b.new_model ).toEqual( 1 );
      expect( b.local_messages ).toEqual( [1] );
      expect( b.to_parent_messages ).toEqual( [2] );
      expect( b.to_root_messages ).not.toBeDefined();
    });


  });

});
