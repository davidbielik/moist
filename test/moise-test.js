var expect = require('chai').expect;
var Moist = require('../src/moist.js');
var P = require('bluebird');
var pool = new Moist({
	prop: 'val'
});
describe('init', function() {
	it('should have default threads', function() {
		expect(pool.threads).to.equal(5);
		expect(pool.prop).to.equal('val');
	});
});

describe('add', function() {
	it('should add to its queue', function() {
		addDelays(pool, 7);
		expect(pool.queue.length).to.equal(7);
	});
});

describe('createBatches', function() {
	it('should create batches synchronously', function() {
		var batches = pool.createBatches();
		expect(batches.length).to.equal(2);
		expect(batches[0].length).to.equal(5);
		expect(batches[1].length).to.equal(2);
	});
});

describe('start', function() {
	it('should resolve each function', function(done) {
		pool.start()
			.then(function(results) {
				var areFulfilled = (function() {
					for (var i = results.length; i--;) {
						if (results[i].isPending()) {
							return 'Some promises [' + i + '] are still pending';
						}
					}
					return true;
				})();
				expect(areFulfilled).to.equal(true);
				done();
			})
			.catch(function(errors) {
				expect('no errors').equal(errors);
				done();
			});
	});
});

function addDelays(pool, count) {
	for (var i = count; i--;) {
		pool.add(delay);
	}
}

function delay() {
	var defer = P.defer();
	setTimeout(function() {
		defer.resolve('resolved value');
	}, 100);
	return defer.promise;
}