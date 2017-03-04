import * as result from '../../src/uif/core/result.es6'

describe('Result', ()=> {
  let ok , err;
  beforeEach(()=>{
    ok = result.ok(1);
    err = result.error("Bad things");
  });

  it('should have class constructors', ()=>{

    expect(ok.value).toEqual(1);
    expect(ok.error).not.toBeDefined();

    expect(err.error).toEqual('Bad things');
    expect(err.value).not.toBeDefined();
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
      expect(o1.value).not.toBeDefined();
      expect(o1.error).toEqual('too small');

      let o3 =  result.ok(10).map(mapper);
      expect(o3.value).toEqual(10);
      expect(o3.error).not.toBeDefined();
    });

    it('should not apply fn on the result if the result is error', ()=> {
      let o2 =  result.error(1).map(mapper);
      expect(o2.value).not.toBeDefined();
      expect(o2.error).toEqual(1);
    });

    it('should apply fn with the args list', ()=> {
      let mapper = (a, b)=> {
        return result.ok(a + b);
      }
      let o1 = result.ok(1).map(mapper, 5);
      expect(o1.value).toEqual(6);
      expect(o1.error).not.toBeDefined();
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

      let a = result.ok(1).then((v)=> v + 10).value;
      let b = result.ok(1).then((v)=> { throw 'error:' + v}).error;

      expect(a).toEqual(11);
      expect(b).toEqual('error:1');
    });
  });

  describe('reduce', ()=>{

    it('should chain until there is an error', ()=> {

      let af = (a, c)=> result.ok(a + 1)
      let bf = (a, c)=> result.ok(a + 2)
      let cf = (a, c)=> result.error(a + 3)

      let a = result.ok(1).thread([af, bf]);
      expect(a.error).not.toBeDefined();;
      expect(a.value).toEqual(4);

      let b = result.ok(1).thread([af, bf, cf]);
      expect(b.value).not.toBeDefined();;
      expect(b.error).toEqual(7);
    });
  });
});
