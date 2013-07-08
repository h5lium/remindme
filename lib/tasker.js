var mongo = require('mongodb'),
	assert = require('assert');


var collName = 'coll_tasks';
var task_id_stamp;
var coll;

exports.open = function(dbInfo, callback){
	var client = new mongo.MongoClient(new mongo.Server(dbInfo.host, dbInfo.port));
	client.open(function(err, client){
		assert.notEqual(client, null, 'MongoDB Service not yet started.');
		var db = client.db(dbInfo.dbname);
		
		if (dbInfo.user) {
			db.authenticate(dbInfo.user, dbInfo.pass, function(err, res){
				init();
			});
		} else {
			init();
		}
		
		function init(){
			//db.dropCollection(collName, function(){
				db.collection(collName, function(err, theColl){
					coll = theColl;
					
					coll.find().toArray(function(err, docs){
						if (docs.length) {
							docs = docs.sort(function(a, b){
								return a._id - b._id;	// _id ASC
							});
							//console.log(docs);
							
							task_id_stamp = docs[docs.length - 1]._id + 1;
						} else {
							task_id_stamp = 1;
						}
						
						callback && callback();
						//console.log(task_id_stamp);
					});
				});
			//});
		}
	});
}
exports.add = function(task, callback){
	task._id = task_id_stamp ++;
	coll.insert(task, {w: 1}, function(err, res){
		console.log('added: ' + task._id);
		
		callback && callback(err);
	});
}
exports.remove = function(taskid, callback){
	coll.remove({
		_id: taskid
	}, function(err, res){
		console.log('removed: ' + taskid);
		
		callback && callback(err);
	});
}
exports.find = function(selector, callback){
	coll.find(selector).toArray(function(err, docs){
		callback(err? []: docs);
	});
}
