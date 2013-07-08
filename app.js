var http = require('http'),
	fs = require('fs');
var express = require('express');
var app = express();

app.configure(function(){
	var is_bae_dev = fs.existsSync('./app/');
	
	app.set('port', process.APP_PORT || process.env.PORT || 80);
	app.use(express.favicon());
	//app.use(express.logger('dev'));
	
	app.use(express.bodyParser());
	//app.use(express.cookieParser());
	app.use(express.errorHandler({showStack: true, dumpExceptions: true}));
	app.set('appDir', is_bae_dev? './app': '.');
	app.set('staticDir', app.get('appDir') + '/static');
	
	app.set('dbInfo', is_bae_dev? {
		host: process.env.BAE_ENV_ADDR_MONGO_IP || '127.0.0.1',
		port: process.env.BAE_ENV_ADDR_MONGO_PORT || 27017,
		dbname: 'BmntjWkbuRfXOlWjvZBT',
		user: process.env.BAE_ENV_AK || 'tang273942569',
		pass: process.env.BAE_ENV_SK || 'liangye'
	}: {
		host: '127.0.0.1',
		port: 27017,
		dbname: 'db_remindme'
	});
	app.set('mailAccount', {
		nick: 'Remind Me',
		service: 'gmail',
		user: 'remind.me.ok@gmail.com',
		pass: 'pleaseok@gmail',
	});
});


app.get('/', function(req, res){
	res.sendfile(app.get('staticDir') + '/index.html');
});
app.get(/\/.+/, function(req, res, next){
	var path = app.get('staticDir') + req.path;
	fs.exists(path, function(exists){
		if (exists) {
			res.sendfile(path);
		} else {
			next();
		}
	});
});

var tasker = require('./lib/tasker.js');	// should wait for db ready
//var regCn = /^[\u4e00-\u9fa5]$/;
var regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;	// en email
regEmail = new RegExp(
	regEmail.toString().replace(/^\//, '').replace(/\/$/, '')
		.replace(/\\w/g, '(\\w|[\\u4e00-\\u9fa5])')
);	// support cn email
app.post('/send', function(req, res){
	var ret = {};
	var to = req.body['to'],
		subject = req.body['subject'],
		text = req.body['text'],
		when = (function(){
			var date = new Date(req.body['when']);
			return date instanceof Date? date.getTime(): 0;	// the timestamp
		})();
	if (!to || !subject || !text || !when) {	// insufficient params
		ret.err = 1;
		res.send(ret);
	} else if (! regEmail.test(to)) {
		ret.err = 2;
		res.send(ret);
	} else {
		var task = {
			to: to,
			subject: subject,
			text: [
				text, '  ---- remindme.duapp.com'
			].join('\n\n\n'),
			when: when
		}
		console.log(task);
		
		tasker.add(task, function(err){
			if (err) {	// mail sending err
				ret.err = 3;
			} else {
				ret.ok = 1;			
			}
			res.send(ret);
		});
	}
});


var mailsender = require('./lib/mailsender.js');
mailsender.setup(app.get('mailAccount'));
setInterval(function(){
	tasker.find({
		when: {
			$lte: new Date().getTime()
		}
	}, function(docs){
		docs.forEach(function(doc){
			doTask(doc);
		});
	});
}, 1000 * 10);	// 30 sec
function doTask(task){
	console.log('do task: ' + task._id);
	
	mailsender.send({
		to: task.to,
		subject: task.subject,
		text: task.text,
		callback: function(err){
			if (! err) {
				tasker.remove(task._id);
			}
		}
	});
}

var server = http.createServer(app);
tasker.open(app.get('dbInfo'), function(){
	server.listen(app.get('port'), function(){
		console.log('server listening on port ' + app.get('port'));
	});
});
