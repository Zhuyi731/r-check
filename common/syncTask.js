/**
 * 这个函数是为了保证各项任务顺序的运行下去
 * 而不是大家在一起执行，不然会导致控制台的输出紊乱
 * 
 * @added by  zy 17/12/16
 */
function SyncTask(){
    var that = this;
    this.tasks = new Array();
    this.runFlag = 0; 
    this.push = function(singleTask){
        that.tasks.push(singleTask);
    }
    this.run = function(){

        if(that.runFlag >= that.tasks.length){
            return ;
        }

        that.tasks[that.runFlag].beforeRun.call();

        function callback(){
            that.tasks[that.runFlag].callback.apply(this,arguments);
            that.tasks[that.runFlag].afterRun.call();
            ++that.runFlag;
            that.run();
        }

        that.tasks[that.runFlag].args.push(callback);
        that.tasks[that.runFlag].task.apply(this,that.tasks[that.runFlag].args);

    }
}
syncTask = new SyncTask();
module.exports = syncTask;
