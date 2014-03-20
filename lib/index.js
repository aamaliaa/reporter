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
			deferred = Q.defer();
		
		if(that._isConnected) {
			that._dropbox.readFile(path, function(err, data) {
				if(err) { deferred.reject(err); }
				data = data.replace(/[\u0000-\u0013]/g, '');
				deferred.resolve(JSON.parse(data));
			});
		} else {
			deferred.reject(new Error('Reporter instance not yet instantiated.'));
		}

		return deferred.promise;
	};

	this._readDir = function(path) {
		var that = this,
			deferred = Q.defer();

		if(that._isConnected) {
			that._dropbox.readdir(path, function(err, data) {
				if(err) { deferred.reject(err); }
				deferred.resolve(data);
			});
		} else {
			deferred.reject(new Error('Reporter instance not yet instantiated.'));
		}

		return deferred.promise;
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

Reporter.prototype.listDates = function(callback) {
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

Reporter.prototype.getAll = function(callback) {
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

Reporter.prototype.getUser = function(callback) {
	this._dropbox.getUserInfo(callback);
};

module.exports = new Reporter();