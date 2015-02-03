
var Injector = require('../../lib/injector');


describe("Injector", function(){
	beforeEach(function(){
		Injector.Directory = require('../../lib/directory');
		Injector.Loader = require('../../lib/loader');
		Injector.Module = require('../../lib/module');
	});
	it('should should find in dir', function(){
		Injector.Directory = function(){
			this.find = function(param,cb){
				cb(null, {
					get:function(cb){
						cb(null, "OKO");
					}
				});
			}
		}
		var injector = new Injector();

		injector.call(function(app){
			app.should.equal("OKO");
		})

	});
	it('should call when dependencies ready', function(){
		var list = [];
		Injector.Directory = function(){
			this.find = function(param,cb){
				cb(null, {
					get:function(cb){
						list.push(cb);
					}
				});
			}
		}
		var injector = new Injector();


		injector.call(function(app,asd,zxc){
			app.should.equal("OKO");
			asd.should.equal("asd");
			zxc.should.equal("zxc");
		})

		list.pop()(null,'zxc');
		list.pop()(null,'asd');
		list.pop()(null,'OKO');
	});
	it('if dir empty should load from path', function(){
		Injector.Loader = function(){
			this.load = function(param, cb){
				cb(null, function(){return "OKO";})
			}
			this.setRoute = function(){}
		}
		Injector.Directory = function(){
			this.find = function(param,cb){
				cb(new Error('NOT_EXIST'), null);
			}
			this.register = function(mod, cb){
				cb(null);
			}
		}
		var injector = new Injector();

		injector.call(function(app){
			app.should.equal("OKO");
		})

	});


	it('module can be set', function(){
		var injector = new Injector();
		var ob = {asd:123};
		injector.set("app",ob);
		injector.call(function(app){
			app.should.equal(ob);
		});

	});

	it('module can be set by function', function(){
		var injector = new Injector();
		var ob = {asd:123};
		injector.setf("app",function(cb){
			cb(null,ob);
		});
		injector.call(function(app){
			app.should.equal(ob);
		});
	});
	it('dependencies from array', function(){
		var injector = new Injector();
		var ob = {asd:123};
		injector.setf("app",function(cb){
			cb(null,ob);
		});
		injector.call(['app'],function(oko){
			oko.should.equal(ob);
		});
	});
	it('params from object', function(){
		var injector = new Injector();
		var ob = {asd:123};
		injector.setf("app",function(cb){
			cb(null,ob);
		});
		var params = {
			dependencies: ['app'],
			controller: function(oko){
				oko.should.equal(ob);
			}
		}
		
		injector.call(params);
	});
	it('args in function scope', function(){
		var injector = new Injector();
		var ob = {asd:123};
		injector.setf("app",function(cb){
			cb(null,ob);
		});
		var params = {
			dependencies: ['app'],
			controller: function(){
				this.argv.app.should.equal(ob);
			}
		}
		
		injector.call(params);
	});
	it('module set by function error should be propagated', function(){
		var injector = new Injector();
		var ob = {asd:123};
		injector.setf("app",function(cb){
			cb(new Error("dupa"),ob);
		});
		injector.call(function(app){
		},function(err){
			err.message.should.equal("dupa");
		});
	});

	describe('integration',function(){
		it('all together', function(done){
			var injector = new Injector();
			injector.loader._require = function(path){
				//console.log("require done");
				return function(){
					//console.log("func called");
					return "OKO";
				}
			}
			injector.loader.setPath('default',['/home']);
			injector.call(function(app){
				//console.log(app);
				app.should.equal("OKO");
				done();
			},function(err){
			});
		});
		it('all together - callback', function(done){
			var injector = new Injector();
			injector.loader._require = function(path){
				//console.log("require done");
				return function(callback){
					//console.log("func called");
					callback(null, "OKO");
					return false;
				}
			}
			injector.loader.setPath('default',['/home']);
			injector.call(function(app){
				//console.log(app);
				app.should.equal("OKO");
				done();
			},function(err){
			});
		});
		it('all togethear - load by filename', function(done){
			var injector = new Injector();
			injector.loader._require = function(path){
				path.should.equal("/asd.js");
				return function(){
					done();
					return "OKO";
				}
			}
			injector.loader.setPath('default',['/home']);
			injector.call("/asd.js",function(err){});
		});
		it('all together - object in file', function(done){
			var injector = new Injector();
			var ob = {asd:123};
			injector.loader.setPath('default',['/home']);
			injector.set("app",ob);

			injector.loader._require = function(path){
				return {
					dependencies: ['app'],
					controller: function(){
						this.argv.app.should.equal(ob);
						return "OKO";
					}
				};
			}
			injector.call(function(home){
				//console.log(app);
				home.should.equal("OKO");
				done();
			},function(err){
			});
		});
		it('all together -file has no function', function(done){
			var injector = new Injector();
			injector.loader.setPath('default',['/home']);
			injector.loader._require = function(path){
				return "OKO";
			}

			injector.call(function(app){
				//console.log(app === null);
			},function(err){
				//console.log("to tutaj!",err);
				done();
			});
		});
		it('all together - mixed', function(done){
			var injector = new Injector();
			injector.loader.setPath('default',['/home']);
			injector.loader._require = function(path){
				return function(){return "OKO"};
			}
			var test = null;
			injector.setf('test', function(cb){
				test = cb;
			});
			var test2 = null;
			injector.setf('test2', function(cb){
				test2 = cb;
			});

			injector.call(function(app, test, test2){
				//console.log('function called');
				app.should.equal("OKO");
				test.should.equal("zxc");
				test2.should.equal("asd");
				done();
			},function(err){
			});
			process.nextTick(function(){
				test2(null, "asd");
				process.nextTick(function(){
					test(null, "zxc");
				});
			})

		});
	});
});
