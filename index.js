var express = require('express'),
	http = require('http'),
	path = require('path');

var config = require('./config');

var reporter = require('./lib');
reporter.connect({
	key: config.dropbox.key,
	secret: config.dropbox.secret,
	token: config.dropbox.token
});

var app = express();

app.set('port', 3004);
app.use(express.favicon());
app.use(express.json());
app.use(app.router);

app.get('/', function(req, res) {
	reporter.authenticate(function(error, client) {
		if (error) {
			console.log(error);
		} else {
			res.json({
				token: client._oauth._token
			}); // @TODO store this somewhere
		}
	});
});

app.get('/list', function(req, res) {
	reporter.listDates(function(error, stat) {
		res.json(stat);
	});
});

app.get('/data/:date?', function(req, res) {
	var date = req.param('date');
	if (date) {
		reporter.getDate(date, function(error, data) {
			res.json(data);
		});
	} else {
		reporter.getAll(function(error, data) {
			res.json(data);
		});
	}
});

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});