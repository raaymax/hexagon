
var assert = require("assert");
var should = require('chai').should();
var Mod = require("../../lib/modulesAsync.js")

describe('moduleAsync', function(){
	it('should inform when result is ready', function(done){
		var cb = null;
		var ob = {asd:"czxc"};

		var module = new Mod.Module("test", function(callback){
			cb = callback;
		});
		module.get(function(err, el){
			el.should.equal(ob);
			done();
		})
		process.nextTick(function(){
			cb(null, ob);
		});
	});
});

describe('modulatorAsync', function(){
	it(" set function should store modules as they are", function(){
		var ob = {asd:123};
		var modulator = new Mod.Modulator(function(fn, cb){
			assert.equal(false, true);
		});
		modulator.set('app', ob);
		modulator.get('app', function(err,ret){
			ret.should.equal(ob);
		});
	});	
	it("load should load module from path", function(done){
		var ob = function(){return {asd:123} };
		var modulator = new Mod.Modulator(function(fn, cb){
			console.log(fn);
			cb(null, fn());
			//assert.equal(false, true);
		});
		modulator.setPath(['/test/dir']);
		modulator._require = function(name){
			assert.equal(name, "/test/dir/app.js");
			console.log(name);
			return ob
		}
		modulator.load('app', function(err,ret){
			ret.should.equal(ob);
			done();
		});

	});

	it("get should load module from path and call it", function(done){
		var ob = {asd:123};
		var modulator = new Mod.Modulator(function(fn, cb){
			console.log(fn);
			cb(null, fn());
			//assert.equal(false, true);
		});
		modulator.setPath(['/test/dir']);
		modulator._require = function(name){
			assert.equal(name, "/test/dir/app.js");
			console.log(name);
			return function(){
				return ob;
			}
		}
		modulator.get('app', function(err,ret){
			ret.should.equal(ob);
			done();
		});

	});
});



describe('lib.modulesAsync', function(){
	var mod = null;

	beforeEach(function(){
		mod = new Mod()
	});

	it('try to use', function(){
		var a = {asd:"test"};
		var b = {qwe:"zxc"};
		mod.set('app',a);
		mod.set('zxc',b);
		mod.call(function(app,zxc){
			app.should.equal(a);
			zxc.should.equal(b);
			return {};
		});
	});
});



