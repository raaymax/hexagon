var Directory = require('../../lib/directory');

describe('Directory',function(){
	var dir = null;
	beforeEach(function(){
		dir = new Directory();
	});
	it('should create', function(){
		dir.register({
			name:"asd",
			data: 123123,
			get: function(cb){
				cb(null,123123);
			}
		},function(err){});
		dir.find('asd', function(err, ob){
			ob.data.should.equal(123123);
		});
	});
	it('should inform if module not exist', function(){
		dir.find('asd',function(err,res){
			err.code.should.equal('NOT_EXIST');
		});
	});
	it('should inform if new module exist', function(){
		dir.register({
			name:"asd",
			data: 123123,
			get: function(cb){
				cb(null,123123);
			}
		},function(err){});
		dir.register({
			name:"asd",
			data: 123123,
			get: function(cb){
				cb(null,123123);
			}
		},function(err){
			err.code.should.equal("EXIST");
		});
	});
});
