var Dropbox = require('dropbox'),
	_ = require('underscore'),
	Q = require('q');

var reporterPath = 'Apps/Reporter-App/';

var Reporter = function() {
	this._data = {};

	this._isConnected = function() {
		return this._dropbox ? true : false;
	};

	this._readFile = function(path) {
		var that = this,
			deferred = Q.defer(),
			cacheKey = 'readFile_'+path,
			cached = that._data[cacheKey];
		
		if(that._isConnected) {
			if(typeof cached !== 'undefined' &&
				new Date() - cached.time < cached.ttl) {
				console.log('--- using '+cacheKey+' cache ---');
				deferred.resolve(cached.value);
			} else {
				that._dropbox.readFile(path, function(err, data) {
					if(err) { deferred.reject(err); }
					data = JSON.parse(data.replace(/[\u0000-\u0013]/g, ''));
					that._data[cacheKey] = {
						value: data,
						time: new Date(),
						ttl: 900000 // 15 min
					};
					deferred.resolve(data);
				});
			}
		} else {
			deferred.reject(new Error('Reporter instance not yet instantiated.'));
		}

		return deferred.promise;
	};

	this._readDir = function(path) {
		var that = this,
			deferred = Q.defer(),
			cacheKey = 'readdir_'+path,
			cached = that._data[cacheKey];

		if(that._isConnected) {
			if(typeof cached !== 'undefined' &&
				new Date() - cached.time < cached.ttl) {
				console.log('--- using '+cacheKey+' cache ---');
				deferred.resolve(cached.value);
			} else {
				that._dropbox.readdir(path, function(err, data) {
					if(err) { deferred.reject(err); }
					that._data[cacheKey] = {
						value: data,
						time: new Date(),
						ttl: 900000 // 15 min
					};
					deferred.resolve(data);
				});
			}
		} else {
			deferred.reject(new Error('Reporter instance not yet instantiated.'));
		}

		return deferred.promise;
	};

	this._extractAnswer = function(obj) {
		if(typeof obj !== 'undefined') {
			if(obj.hasOwnProperty('tokens')) {
				return obj['tokens'];
			} else if(obj.hasOwnProperty('answeredOptions')) {
				return obj['answeredOptions'];
			} else if(obj.hasOwnProperty('locationResponse')) {
				var ret = {};
				ret[obj['locationResponse']['text']] = obj['locationResponse'];
				return ret;
			}
		} else {
			return null;
		}
	};
};

Reporter.prototype.connect = function(options) {
	this._dropbox = new Dropbox.Client(options);
	this._dropbox.authDriver(new Dropbox.AuthDriver.NodeServer(8912));
}

Reporter.prototype.authenticate = function(callback) {
	this._dropbox.authenticate(function(error, client) {
		callback(error, client);
	});
};

Reporter.prototype.listDates = function() {
	return this._readDir(reporterPath)
	.then(function(list) {
		var dates = _.map(list, function(file) {
			var date = file.match(/^(20)\d\d(-)(0[1-9]|1[012])(-)(0[1-9]|[12][0-9]|3[01])/g);
			return date[0];
		});
		return dates;
	});
};

Reporter.prototype.getDate = function(date) {
	var filepath = reporterPath + date + '-reporter-export.json';
	return this._readFile(filepath)
	.then(function(day) {
		return _.map(day.snapshots, function(n) {
			return n;
		});
	});
};

Reporter.prototype.getAll = function() {
	var that = this;
	return that._readDir(reporterPath)
	.then(function(files) {
		return _.map(files, function(file) {
			return that._readFile(reporterPath + file)
			.then(function(day) {
				return _.map(day.snapshots, function(n) {
					return n;
				});
			});
		});
	})
	.then(Q.all)
	.then(function(arr) {
		return _.reduce(arr, function(a, b) {
			return a.concat(b);
		});
	});
};

Reporter.prototype.getAnswers = function(prompt) {
	var that = this;

	return that.getAll()
	.then(function(data) {
		return _.compact(_.map(data, function(d) {
				var obj = _.findWhere(d.responses, { questionPrompt: prompt });
				return that._extractAnswer(obj);
			}));
	})
	.then(function(data) {
		return _.uniq(_.reduce(data, function(a, b) {
			if(_.isArray(a)) {
				return a.concat(b);
			} else {
				return _.extend(a, b);
			}
		}));
	});
};

Reporter.prototype.getUser = function(callback) {
	this._dropbox.getUserInfo(callback);
};

module.exports = new Reporter();