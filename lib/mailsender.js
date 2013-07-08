var fs = require('fs');
var nodemailer = require('nodemailer');	// no-child-process nodemailer


var transport;
var from;

function setup(account){
	from = account.nick + ' <' + account.user + '>';
	
	// create reusable transport method (opens pool of SMTP connections)
	transport = nodemailer.createTransport('SMTP', {
		service: account.service,
		auth: {
			user: account.user,
			pass: account.pass
		}
	});
}
function close(){
	// if you don't want to use this transport object anymore, uncomment following line
	transport.close(); // shut down the connection pool, no more messages
}

function send(options){
	// setup e-mail data with unicode symbols
	options.from = from;
	/*var mailOptions = {
		from: 'Eyesover <eyesover@gmail.com>', // sender address
		to: 'hellolium@163.com', // list of receivers
		subject: 'Hello !', // Subject line
		text: 'Hello world 123!', // plaintext body
		html: '<b>Hello world321 !</b>' // html body
	}*/
	
	// send mail with defined transport object
	transport.sendMail(options, function(err, res){
		options.callback && options.callback(err, res);
		/*if(error){
			console.log(err);
		}else{
			console.log('Message sent: ' + res.message);
		}*/
	});
}

exports.setup = setup;
exports.close = close;
exports.send = send;
