var mongo = require('mongodb'),
	assert = require('assert');


var dbInfo = {
	host: '127.0.0.1',
	port: 27017,
	name: 'db_remindme'
}
var client = new mongo.MongoClient(new mongo.Server(dbInfo.host, dbInfo.port));

var collName = 'coll_tasks';
var task_id_stamp;

client.open(function(err, client){
	assert.notEqual(client, null, 'MongoDB Service not yet started.');
	var db = client.db(dbInfo.name);
	
	//db.dropCollection(collName, function(){
		db.collection(collName, function(err, coll){
			coll.find().toArray(function(err, docs){
				if (docs.length) {
					docs = docs.sort(function(a, b){
						return a._id - b._id;	// 升序
					});
					console.log(docs);
					
					task_id_stamp = docs[docs.length - 1]._id + 1;
				} else {
					task_id_stamp = 1;
				}
				
				coll.insert({
					_id: task_id_stamp ++,
					a: 'b',
				}, function(err, res){
					console.log(res);
				});
			});
		});
	//});
});