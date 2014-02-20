var Dropbox = require('dropbox'),
	_ = require('underscore');

var reporterPath = 'Apps/Reporter-App/';

var Reporter = function() {
	this._data = {};
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
	this._dropbox.readdir(reporterPath, function(error, list) {
		var dates = [];
		_.each(list, function(file) {
			var date = file.match(/^(20)\d\d(-)(0[1-9]|1[012])(-)(0[1-9]|[12][0-9]|3[01])/g);
			dates.push(date[0]);
		});
		callback(error, dates);
	});
};

Reporter.prototype.getDate = function(date, callback) {
	var filepath = reporterPath + date + '-reporter-export.json';
	this._dropbox.readFile(filepath, function(error, data) {
		callback(error, JSON.parse(data));
	});
};

Reporter.prototype.getAll = function(callback) {
	var that = this;

	that._dropbox.readdir(reporterPath, function(error, list) {
		_.each(list, function(file) {
			console.log(file);
			that._dropbox.readFile(reporterPath + file, function(error, data) {
				console.log('reading '+file);
				data = data.replace(/[\u0000-\u0013]/g, '');
					var day = JSON.parse(data);
					for(var i=0; i<day.snapshots.length; i++){
						var milli = day.snapshots[i].date;
						var origin = new Date('January 1 2001');
						var date = new Date(origin.getTime() + milli*1000);
					}
			});
		});
	});
};

Reporter.prototype.getUser = function(callback) {
	this._dropbox.getUserInfo(callback);
}

module.exports = new Reporter();