(function() {
	var P = require('bluebird');

	function Moist(config) {
		this.queue = [];
		this.init(config);
	}

	module.exports = Moist;

	Moist.prototype.start = function() {
		var defer = P.defer();
		var batches = this.createBatches();
		var results = [];
		var batchNumber = 0;
		console.log('POOL STARTING');
		(function nextBatch() {
			var batch = batches.shift();
			var promises = [];
			++batchNumber;
			if (!batch) {
				return defer.resolve(results);
			}
			for (var i = batch.length; i--;) {
				var item = batch[i];
				if (typeof item !== 'function') {
					throw 'invalid task in pool [' + batchNumber + '.' + i + ']';
				}
				console.log('\t sub-batch #' + i);
				var value = item();
				value = typeof value === 'function' && value.then ? 
					value : P.resolve(value);
				promises.push(value);
			}
			P.settle(promises)
				.then(function(data) {
					console.log(data);
					results.push(data.values);
				})
				.catch(function(data) {
					results.push(data);
				}).done(function() {
					nextBatch();
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