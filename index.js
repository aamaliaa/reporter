var express = require('express'),
	http = require('http'),
	path = require('path'),
	Q = require('q'),
	_ = require('underscore');

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
			});
		}
	});
});

app.get('/list', function(req, res) {
	return reporter.listDates()
	.then(function(dates) {
		res.json(dates);
	});
});

app.get('/data/:date?', function(req, res) {
	var date = req.param('date');
	if (date) {
		return reporter.getDate(date)
		.then(function(data) {
			res.json(data);
		});
	} else {
		return reporter.getAll()
		.then(function(data) {
			res.json(data);
		});
	}
});

app.get('/tokens', function(req, res) {
	var prompt = req.param('questionPrompt') || 'What are you wearing?';
	return reporter.getAll()
	.then(function(data) {
		return _.compact(_.map(data, function(d) {
				var obj = _.findWhere(d.responses, { questionPrompt: prompt });
				return obj ? obj['tokens'] : null;
			}));
	})
	.then(function(data) {
		return _.uniq(_.reduce(data, function(a, b) {
			return a.concat(b);
		}));
	})
	.then(function(data) {
		res.json(data);
	});
});

app.get('/user', function(req, res) {
	reporter.getUser(function(err, data) {
		res.json(data);
	});
});

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});