# Lockup

Lockup uses a certain lock file to queue and deal with inter-process asynchronous resources.

## Installation

	npm install lockup --save
	
## Usage

```js
var lockup = require('lockup');
```

### lockup.lock(file [, options={}], callback);

Create a lock if the lock is not existed, and run the `callback` function.

If the lock already exists, `callback` will put in a queue which will be executed and cleaned up once the lock is released.

Notice that, `lockup.lock` could work with multiple `process`es.

#### file `path`

The path of the lock file.

#### options `Object={}`

Optional, default to `{}`;

#### callback `function(err)`

The callback function.

#### err `Error|String`

`Error` instance or error message.


### lockup.unlock(file)

Release a lock.


## Examples

```js
var file = 'foo.lock';
var counter = 0;

function foo(delay){
    var c = counter ++;

    lockup.lock(file, function (err) {
        setTimeout(function () {
        	console.log('counter', c);
        	
        	// release the lock.
            lockup.unlock(file);
        }, delay);
    });
}

foo(1000);
foo(0); // without `lockup.lock`, "counter 1" will be printed first.

// Then print:
// counter 0
// counter 1
```