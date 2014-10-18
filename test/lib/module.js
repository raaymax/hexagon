var Module = require("../../lib/module");
var should = require('chai').should();

describe("Module", function(){
	var ob = {asd:123};
	var timer = {qwe:321};
	var timeout = null;
	var time = 0;
	var canceled = false;

	global.setTimeout = function(fn, t){
		timeout = fn;
		time = t;
		return timer;
	}
	global.clearTimeout = function(a){
		a.should.equal(timer);
		canceled = true;
	}

	it('should create and receive and call a function with callback', function(done){
		var test = false;
		var mod = new Module("test",function(fn){
			fn.should.be.a("function");
			test = true;
			done();
		});
	});

	it('should have its name', function(){
		var mod = new Module('name',function(fn){});
		mod.name.should.equal('name');
	});

	it('should inform when callback is called', function(done){
		var cb = null;
		var mod = new Module("test",function(fn){
			cb = fn;
			cb(null,ob);
		});
		mod.get(function(err,res){
			//console.log(err);
			res.should.equal(ob);
			done();
		});
	});

	it('should inform even if callback was called in past', function(done){
		var cb = null;
		var mod = new Module("test",function(fn){
			cb = fn;
			cb(null,ob);
		});
		process.nextTick(function(){
			mod.get(function(err, res){
				res.should.equal(ob);
				done();
			});
		});
	});

	it('should configure timeout', function(done){
		var cb = null;
		var test = false;
		var mod = new Module("test",function(fn){
			cb = fn;
		}, {timeout: 1});

		time.should.equal(1);
		timeout();
		mod.get(function(err, res){
			//console.log(err.message);
			err.code.should.equal('TIMEOUT');
			done();
		});
	});

	it('should cancel timeout', function(done){
		var cb = null;
		var test = false;

		var mod = new Module("test",function(fn){
			cb = fn;
			cb(null,ob);
		}, {timeout: 1});

		mod.get(function(err, res){
			res.should.equal(ob);
			canceled.should.equal(true);
			done();
		});
	});
});