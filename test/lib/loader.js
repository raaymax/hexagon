var Loader = require("../../lib/loader");


describe('Loader',function(){
	var ob = {test:123};
	it('should create', function(){
		var loader = new Loader();
		loader.setPath('default', ['/home']);
		loader._require = function(path){
			path.should.equal('/home/test');
			return ob;
		}
		loader.load('test', function(err, contents, path){
			console.log(arguments)
			contents.should.equal(ob);
		});
	});
	it('should modify key for routes', function(){
		var loader = new Loader();
		loader.setRoute('config', /^\$/, 
			function(key){return key.substr(1);});
		loader.createPath("$dupa",'config',"/asd").should.equal('/asd/dupa');
	});
	it('should have many paths', function(){
		var loader = new Loader();
		loader.setPath('default', ['/home']);
		loader.setPath('config', ['/var']);
		loader.setRoute('config', /^\$/, 
			function(key){return key.substr(1);});

		loader._require = function(path){
			path.should.equal('/home/test');
			return ob;
		}
		loader.load('test', function(err, contents, path){
			contents.should.equal(ob);
		});

		loader._require = function(path){
			path.should.equal('/var/test');
			return ob;
		}
		loader.load('$test', function(err, contents, path){
			contents.should.equal(ob);
		});
	});
	it('should return error for all paths if file not exist', function(){
		var loader = new Loader();
		loader.setPath('default', ['/home','/dupa']);
		loader._require = function(path){
			console.log(path);
			throw new Error("dupa");
		}
		loader.load('test', function(err, contents, path){
			err.should.have.length(2);
			err[0].message.should.equal("dupa");
			err[1].message.should.equal("dupa");
		});
	});
}); 