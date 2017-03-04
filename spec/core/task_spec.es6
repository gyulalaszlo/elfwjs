import * as Task from '../../src/uif/core/task.es6'


describe('task', ()=>{

  it('should start then dispatch a message when finished',()=>{
    let task = Task.make((done)=>{ done('foo'); });
    let dispatcher = jasmine.createSpy('dispatcher');
    let _msg = (val)=> { bar: val };
    let msg = jasmine.createSpy('msg').and.callFake(_msg);
    task( dispatcher, msg );

    expect( dispatcher.calls.count() ).toEqual(1);
    expect( dispatcher ).toHaveBeenCalledWith( _msg('foo') );
    expect( msg.calls.count() ).toEqual(1);
    expect( msg ).toHaveBeenCalledWith('foo');
  });



});
