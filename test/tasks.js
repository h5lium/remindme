var tasker = require('../lib/tasker.js');

tasker.open({
	host: '127.0.0.1',
	port: 27017,
	dbname: 'db_remindme'
}, function(){
	tasker.find({}, function(docs){
		docs.forEach(function(doc){
			doc.when = new Date(doc.when);
		});
		
		console.log(docs);
		console.log(new Date());
	});
});
