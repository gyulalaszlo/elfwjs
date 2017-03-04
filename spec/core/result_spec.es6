import * as result from '../../src/uif/core/result.es6'

describe('Result', ()=> {
  let ok , err;
  beforeEach(()=>{
    ok = result.ok(1);
    err = result.error("Bad things");
  });

  it('should have class constructors', ()=>{

    expect(ok.getValue()).toEqual(1);
    expect(ok.getError()).not.toBeDefined();

    expect(err.getError()).toEqual('Bad things');
    expect(err.getValue()).not.toBeDefined();

    expect(err.isOk()).toBeFalsy();
    expect(err.isError()).toBeTruthy();

    expect(ok.isOk()).toBeTruthy();
    expect(ok.isError()).toBeFalsy();

    expect(ok.getKind()).toEqual( result.OK );
    expect(err.getKind()).toEqual( result.ERROR );
  });




  describe('map', ()=> {
    let mapper = (r)=> {
      if (r > 5)
        return result.ok(r);
      else
        return result.error("too small");
    };

    it('should apply fn on the result if the result is ok', ()=> {
      let o1 =  result.ok(1).map(mapper);
      expect(o1.getValue()).not.toBeDefined();
      expect(o1.getError()).toEqual('too small');

      let o3 =  result.ok(10).map(mapper);
      expect(o3.getValue()).toEqual(10);
      expect(o3.getError()).not.toBeDefined();
    });

    it('should not apply fn on the result if the result is error', ()=> {
      let o2 =  result.error(1).map(mapper);
      expect(o2.getValue()).not.toBeDefined();
      expect(o2.getError()).toEqual(1);
    });

    it('should apply fn with the args list', ()=> {
      let mapper = (a, b)=> {
        return result.ok(a + b);
      }
      let o1 = result.ok(1).map(mapper, 5);
      expect(o1.getValue()).toEqual(6);
      expect(o1.getError()).not.toBeDefined();
    });
  });

  describe('withDefault', ()=> {
    it('should return the default if there is an error', ()=>{
      let a = result.ok(1).withDefault(5);
      let b = result.error(1).withDefault(5);

      expect(a).toEqual(1);
      expect(b).toEqual(5);
    });
  });

  describe('then', ()=>{

    it('should be a shorthand for result.map((v)=> result.from(<fn>, v))', ()=> {

      let a = result.ok(1).then((v)=> v + 10).getValue();
      let b = result.ok(1).then((v)=> { throw 'error:' + v}).getError();

      expect(a).toEqual(11);
      expect(b).toEqual('error:1');
    });
  });

  describe('thread', ()=>{

    it('should chain until there is an error', ()=> {

      let af = (a, c)=> result.ok(a + 1)
      let bf = (a, c)=> result.ok(a + 2)
      let cf = (a, c)=> result.error(a + 3)

      let a = result.ok(1).threadMap([af, bf]);
      expect(a.getError()).not.toBeDefined();;
      expect(a.getValue()).toEqual(4);

      let b = result.ok(1).threadMap([af, bf, cf]);
      expect(b.getValue()).not.toBeDefined();;
      expect(b.getError()).toEqual(7);
    });

  });


  describe('threadAsFirst', ()=>{

    it('should chain until there is an exception', ()=> {

      let af = (a, c)=> a + 1
      let bf = (a, c)=> a + 2
      let cf = (a, c)=> a + 3
      let df = (a, c)=> { throw 'foo'; }

      let a = result.ok(1).threadAsFirst([af, bf]);
      expect(a.getError()).not.toBeDefined();
      expect(a.getValue()).toEqual(4);

      let b = result.ok(1).threadAsFirst([af, bf, cf]);
      expect(b.getError()).not.toBeDefined();;
      expect(b.getValue()).toEqual(7);


      let c = result.ok(1).threadAsFirst([af, bf, cf, df]);
      expect(c.getError()).toEqual('foo');
      expect(c.getValue()).not.toBeDefined();;
    });
  });


  describe('throwOnError', ()=>{

    it('should throw if there is an error', ()=> {
      expect( ()=> result.ok(1).throwOnError() ).not.toThrow();
      expect( ()=> result.error(2).throwOnError() ).toThrow(2);

      expect( result.ok(1).throwOnError().getValue() ).toEqual(1);
    });
  });


  describe('mapError', ()=>{
    it('should transform the error value', ()=> {
      let err = (e)=> "Error: " + e;
      let a = result.ok(1).mapError(err);
      let b = result.error(2).mapError(err);

      expect( a.getKind() ).toEqual(result.OK);
      expect( b.getKind() ).toEqual(result.ERROR);

      expect( a.getValue() ).toEqual(1);
      expect( b.getError() ).toEqual("Error: 2");
    });
  });
});
