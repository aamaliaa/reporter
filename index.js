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

app.get('/dates', function(req, res) {
	return reporter.listDates()
	.then(function(dates) {
		res.json(dates);
	});
});

app.get('/reports/:date?', function(req, res) {
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

app.get('/answers', function(req, res) {
	var prompt = req.param('questionPrompt') || 'What are you wearing?';
	reporter.getAnswers(prompt)
	.then(function(data) {
		res.json(data);
	})
	.fail(function(error) {
		res.json({
			error: error.message
		});
	});
});

app.get('/questions', function(req, res) {
	reporter.getQuestions()
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