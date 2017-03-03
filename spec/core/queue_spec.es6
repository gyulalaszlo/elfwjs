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


  it('should provide a reduce function', ()=>{
    q.push('foo'); q.push('bar');

    let res = q.reduce((memo, e)=>{
      return memo + e.length;
    }, 4);

    expect(res).toEqual(10);
  });


  it('should allow concatenating elements', ()=>{
    q.append(['foo', 'bar', 'baz']);
    expect(q.elements()).toEqual(['foo', 'bar', 'baz']);
  });




});
