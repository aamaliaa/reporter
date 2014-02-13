var Dropbox = require('dropbox'),
	_ = require('underscore');

var reporterPath = 'Apps/Reporter-App/';

var Reporter = function() {};

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

Reporter.prototype.getUser = function(callback) {
	this._dropbox.getUserInfo(callback);
}

module.exports = new Reporter();