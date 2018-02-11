function WorkerThread(pool, WorkerFile) {
  this.pool = pool;
  this.workerTask = {};
  const _this = this;

  function dummyCallback(event) {
    _this.workerTask.callback(event.data);
    _this.pool.freeWorkerThread(_this); // changed from this to _this
    // terminates current worker thread - this refers to worker, _this refers to workerThread
    this.terminate();
  }

  function dummyErrorCallback(event) {
    _this.workerTask.errorCallback(`${event.message}\nerror in worker at line ${event.lineno} in ${event.filename}`);
    _this.pool.freeWorkerThread(_this);
    this.terminate();
  }

  this.run = function run(workerTask) {
    this.workerTask = workerTask;
    if (this.workerTask.funcName !== null) {
      const worker = new WorkerFile();
      worker.addEventListener('message', dummyCallback, false);
      worker.addEventListener('error', dummyErrorCallback, false);
      worker.postMessage({ funcName: workerTask.funcName, payload: workerTask.payload });
    }
  };

  this.run.bind(this);
}

function Pool(size, WorkerFile) {
  this.taskQueue = [];
  this.workerQueue = [];
  this.poolSize = size;

  this.addWorkerTask = function addWorkerTask(workerTask) {
    if (this.workerQueue.length > 0) {
      const workerThread = this.workerQueue.shift();
      workerThread.run(workerTask);
    } else this.taskQueue.push(workerTask);
  };

  this.init = function init() {
    for (let i = 0; i < this.poolSize; i += 1) {
      this.workerQueue.push(new WorkerThread(this, WorkerFile));
    }
  };

  this.freeWorkerThread = function freeWorkerThread(workerThread) {
    if (this.taskQueue.length > 0) {
      const workerTask = this.taskQueue.shift();
      workerThread.run(workerTask);
    } else this.workerQueue.push(workerThread);
  };

  this.addWorkerTask.bind(this);
  this.init.bind(this);
  this.freeWorkerThread.bind(this);
}

function WorkerTask(funcName, payload, callback, errorCallback) {
  this.funcName = funcName;
  this.payload = payload;
  this.callback = callback;
  this.errorCallback = errorCallback;
}

module.exports = { Pool, WorkerTask };

/*
  modified from original code by jos.dirksen:
  http://www.smartjava.org/content/html5-easily-parallelize-jobs-using-web-workers-and-threadpool
*/
