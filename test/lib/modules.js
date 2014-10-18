
var assert = require("assert");
var should = require('chai').should();
var Mod = require("../../lib/modules.js")

describe('lib.modules', function(){
	var mod = null;

	beforeEach(function(){
		mod = new Mod()
	});

	it('should have object with loaded modules', function(){
		assert.equal(typeof mod.modules, "object");
	});
	it('should load modules', function(){
		var ob = {test: "data"};
		mod.set("app", ob);
		assert.equal(mod.modules['app'], ob);
	});

	describe("dependency injector", function(){
		var core = {test: "data"};
		beforeEach(function(){
			mod.set("app", core);
		});
		it('should inject dependency on load', function(done){
			var ob = function(app){
				assert.equal(app, core);
				done();
			}
			mod.call(ob);
		});

		it('should put false if dependency dont exist', function(done){
			var ob = function(dupa){
				assert.equal(dupa, false);
				done();
			}
			mod.call(ob);
		});
		describe('paths', function(){
			it('should try to find dependencies in specyfic paths', function(done){
				mod.setPath([".","./modules","./test/"]);
				var arr = ["./dupa","./modules/dupa","./test/dupa"]
				var counter = 0;
				mod._require = function(name){
					counter ++;
					arr.splice(arr.indexOf(name),1);
					if(arr.length == 0){
						return core;
					}else{
						throw new Error("asd");
					}
				}
				var ob = function(dupa){
					counter.should.equal(3);
					arr.should.have.length(0);
					dupa.should.equal(core);
					done();
				} 
				mod.call(ob);
			});
			it('should try to find config dependencies in specyfic paths if $ on front', function(done){
				mod.setConfigPath([".","./modules","./test/"]);
				var arr = ["./dupa","./modules/dupa","./test/dupa"]
				var counter = 0;
				mod._require = function(name){
					counter ++;
					arr.splice(arr.indexOf(name),1);
					if(arr.length == 0){
						return core;
					}else{
						throw new Error("asd");
					}
				}
				var ob = function($dupa){
					counter.should.equal(3);
					arr.should.have.length(0);
					$dupa.should.equal(core);
					done();
				} 
				mod.call(ob); 
			});


		});
	});
});



