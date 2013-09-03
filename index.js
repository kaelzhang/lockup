'use strict';

var lockup = module.exports = {};

var node_fs     = require('fs');
var node_path   = require('path');
var EE          = require('events').EventEmitter;


// Yeah, it is crude and effective!
var ev = {
    __proto__: EE.prototype
};

var own = {};

// Create a lock if the lock is not existed, then run the `callback` function.
// If the lock exists, `callback` will put in a queue

// @param {path} file
// @param {Object=} options TODO
// @param {function(err)} callback
lockup.lock = function (file, options, callback) {
    file = node_path.resolve(file);

    if(arguments.length === 2){
        callback = options;
        options = {};
    }

    // Create file first, and save process ticks
    node_fs.open(file, 'wx', function (err, fd) {
        if(!err){

            // Then the current process will own the lock from now on
            own[file] = true;

            node_fs.close(fd, function () {
                callback(null); 
            });

        // The lock file already exists.
        }else if(err.code === 'EEXIST'){
            queue(file, options, callback);

        }else{
            return callback(err);
        }
    });
};


// @param: the same as `lockup.lock`
function queue (file, options, callback) {
    ev.on(file, function () {
        lockup.lock(file, options, callback);
    });
}


// Destroy the lock
lockup.unlock = function (file) {
    file = node_path.resolve(file);

    node_fs.unlink(file, function (err) {
        if(!err){

            // no longer own the lock
            delete own[file];
        }

        run_queue(file);
    });
};

function run_queue (file) {
    ev.emit(file);
    ev.removeAllListeners(file);
}


function NOOP(){};

// Clean and release all locks owned by the current process
function clean_locks () {
    var file;

    for(file in own){
        node_fs.unlink(file, NOOP);
    }
}

process.on('exit', clean_locks);

// if exceptions are already caught, do not clean the lock file
// if there's an uncaught exception, will be an 'exit' event after 'uncaughtException' event
// process.on('uncaughtException', clean_locks);


