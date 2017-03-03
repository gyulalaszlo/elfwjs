import {Queue} from '../../src/uif/core/queue.es6'


describe('Queue', ()=>{

  let q;

  beforeEach(()=>{
    q = new Queue();
  });

  it('should push elements to the queue', ()=>{
    q.push('foo');
    q.push('bar');

    expect(q.elements()).toEqual(['foo', 'bar']);
  });



  it('should allow concatenating elements', ()=>{
    q.concat(['foo', 'bar', 'baz']);
    expect(q.elements()).toEqual(['foo', 'bar', 'baz']);
  });


  describe('reduce', ()=>{

    it('should provide a reduce function', ()=>{
      q.concat(['foo', 'bar', 'baz']);

      let res = q.reduce((memo, e)=>{
        return memo + e.length;
      }, 4);

      expect(res).toEqual(13);
    });


    it('should allow adding elements to the queue during reduce', ()=>{
      q.concat(['foo', 'bar', 'baz']);

      let res = q.reduce((memo, e)=>{
        if (e == 'bar') q.push('baz');
        return memo + e + "::";
      }, "::");

      expect(res).toEqual("::foo::bar::baz::baz::");

    });

  });


});
