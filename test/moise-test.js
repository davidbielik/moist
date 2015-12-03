(function() {
	var expect = require('chai').expect;
	var Moist = require('../src/moist.js');
	var P = require('bluebird');
	var pool = new Moist({
		prop: 'val'
	});
	var totalTasks = 17;
	var defaultThreads = 5;

	describe('init', function() {
		it('should have default threads', function() {
			expect(pool.threads).to.equal(defaultThreads);
			expect(pool.prop).to.equal('val');
		});
	});

	describe('add', function() {
		it('should add to its queue', function() {
			addDelays(pool, totalTasks);
			expect(pool.queue.length).to.equal(totalTasks);
		});
	});

	describe('createBatches', function() {
		it('should create batches synchronously', function() {
			var batches = pool.createBatches();
			expect(batches.length).to.equal(Math.ceil(totalTasks / defaultThreads));
			expect(batches[0].length).to.equal(5);
			expect(batches[1].length).to.equal(5);
			expect(batches[2].length).to.equal(5);
			expect(batches[3].length).to.equal(2);
		});
	});

	describe('start', function() {
		it('should resolve each function', function(done) {
			pool.start()
				.then(function(results) {
					var allFulfilled = isAllFulfilled(results);
					expect(allFulfilled).to.equal(true);
					done();
				})
				.catch(function(errors) {
					expect('no errors').equal(errors);
					done();
				});
		});
	});

	describe('afterEachBatch', function() {
		var counter = 0;
		it('should run the afterEachBatch function after each batch', function(done) {
			pool.start({
				afterEachBatch: function(batchResults) {
					for (var i = batchResults.length; i--;) {
						++counter;
					}
				}
			}).done(function() {
				expect(counter).to.equal(pool.queue.length);
				done();
			});
		});
	});

	function addDelays(pool, count) {
		for (var i = count; i--;) {
			pool.add(delay);
		}
	}

	function isAllFulfilled(results) {
		for (var i = results.length; i--;) {
			if (results[i].isPending()) {
				return 'Some promises [' + i + '] are still pending';
			}
		}
		return true;
	}

	function delay() {
		var defer = P.defer();
		setTimeout(function() {
			defer.resolve('resolved value');
		}, 100);
		return defer.promise;
	}
})();