test();

function test(){
	var request = require('request');
	
	request.post({
		uri: 'http://127.0.0.1/send',
		form: {
			to: 'hellolium@163.com',
			subject: '测试',
			text: '一个好的测试！',
			when: new Date().toString()
		}
	}, function(err, res, body){
		try {
			var json = JSON.parse(body);
			console.log(json);
		} catch (ex) {
			console.log(body);
		}
	});
}
