# moist
A small little resource pool

## Installation ##
`npm install moist --save`

## Instructions ##

```
// require modules
var Moist = require('moist');
var bluebird = require('bluebird');

// create new resource pool
var pool = new Moist({
  threads: 5
});

// "add" your functions to the queue. They can be synchronous or return a promise
pool.add(timeoutPromise).add(timeoutPromise).add(timeoutPromise).add(timeoutPromise).add(timeoutPromise).add(timeoutPromise);

pool.start({
        afterEachBatch: function(results){
            console.log('One batch of 5 has finished', results);
        }
    })
		.then(function(results) {
			  // results is an array of your results
		})
		.catch(function(errors) {
			  // console.error('ahhh!');
		})
		.done(function(){
		    // finished
		});

function timeoutPromise(){
    var defer = P.defer();
    setTimeout(function(){
        defer.resolve('data!');
    }, 100);
    return defer.promise;
}

```
