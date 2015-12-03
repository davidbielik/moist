(function() {
	var P = require('bluebird');

	function Moist(config) {
		this.queue = [];
		this.init(config);
	}

	module.exports = Moist;

	Moist.prototype.start = function(options) {
		var defer = P.defer();
		var batches = this.createBatches();
		var results = [];
		var batchNumber = 0;
		var batchResults;
		var afterEachBatch = (options || {}).afterEachBatch || function(){};
		(function nextBatch() {
			var batch = batches.shift();
			var promises = [];
			++batchNumber;
			if (!batch) {
				return defer.resolve(results);
			}
			for (var i = batch.length; i--;) {
				var task = batch[i];
				if (typeof task !== 'function') {
					throw 'invalid task in pool [' + batchNumber + '.' + i + ']';
				}
				var value = task();
				if (typeof value !== 'function') {
					value = P.resolve(value);
				}
				if (typeof value.then !== 'function') {
					throw 'Function tasks must return a promise';
				}
				promises.push(value);
			}
			P.settle(promises)
				.then(function(data) {
					results = results.concat(data);
					batchResults = data;
				})
				.catch(function(data) {
					results = results.concat(data);
					batchResults = data;
				}).done(function() {
					var callback = afterEachBatch(batchResults);
					if (!callback || typeof callback.then !== 'function') {
						callback = P.resolve(callback);
					}
					callback.done(nextBatch);
				});
		})();
		return defer.promise;
	};

	/**
	 * Groups array of functions into groups of <threads>
	 * @return {Array}
	 */
	Moist.prototype.createBatches = function() {
		var queue = [].concat(this.queue);
		var threads = this.threads;
		var batches = [];
		(function createBatch() {
			var batch = [];
			if (!queue.length) {
				return;
			}
			for (var i = threads; i--;) {
				var nextFunction = queue.shift();
				if (!nextFunction) {
					break;
				}
				batch.push(nextFunction);
			}
			batches.push(batch);
			return createBatch();
		})();
		return batches;
	};

	Moist.prototype.init = function(config) {
		var defaults = {
			threads: 5
		};
		config = typeof config === 'object' ? config : {};
		extend(defaults, this);
		extend(config, this);
	};

	Moist.prototype.add = function(fn) {
		if (typeof fn !== 'function') {
			throw 'Invalid task added';
		}
		this.queue.push(fn);
		return this;
	};

	function extend(from, to) {
		for (var key in from) {
			to[key] = from[key];
		}
		return to;
	}
})();