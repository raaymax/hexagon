var async = require('async');

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;

function getParamNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '')
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
  if(result === null)
     result = []
  return result
}

Injector.Directory = require('./directory');
Injector.Loader = require('./loader');
Injector.Module = require('./module');

function Injector(){
	this.directory = new Injector.Directory();
	this.loader = new Injector.Loader();
	this.loader.setRoute('config', /^\$/, function(key){
		return key.substr(1);
	});
	this.set('loader', this);
}


Injector.prototype.call = function(func, cb) {
	if(typeof func == 'string'){
		var file = func;
		func = require(file);
		func.filename = file;
	} 
	var params = getParamNames(func);
	var args = [];
	var th = this;
	var check = [];
	for(var i in params) check[i] = null;
	async.each(params,function(param,done){
		th.directory.find(param, function(err,mod){
			if(err){
				mod = th.load(param,function(err){
				});
			}
			mod.get(function(err,res){
				var idx = params.indexOf(param);
//				console.log("module get: ",err);	
				if(err){ 
					args[idx] = null;
					check[idx] = false;
					done(err);
					return;
				}
				args[idx] = res;
				check[idx] = true;
				done();
			});
		});
	},function(err){
		var res = null;
		if(!checkParams()){
			console.log("\nERROR! Function call imposible - not all args colected.")
			console.log("function name:",func.name,"\npath:", func.filename,"\nparams:", params, check);
			console.log(err);
			console.log();
		}else{
			res = func.apply(global,args);
		}
		if(cb) cb(err,res);
	});

	function checkParams(){
		var res = true;
		for(var i in params){
			if(check[i] !== true){
				res = false;
			}
		}
		return res;
	}
};

Injector.prototype.set = function(name, ob) {
	this.directory.register(new Injector.Module(name, function(cb){
		cb(null, ob);
	}),function(err){});
};

Injector.prototype.setf = function(name, func) {
	this.directory.register( new Injector.Module(name, func),
		function(err){});
};

Injector.prototype.config = function(name, cb) {
	return this.load("$"+name,cb);	
};

Injector.prototype.load = function(name, cb) {
	var th = this;
	var mod = new Injector.Module(name,function(cb2){
		th.loader.load(name, function(err,res){
			if(err){
				cb2(err);
				return;
			}
			if(typeof res == 'function')
				th.call(res, cb2);
			else
				cb2(new Error("file is not a function"),null);
		});
	});
	th.directory.register(mod, function(err){
//		console.log("register: ",err);
		if(cb) cb(err);
	});
	return mod;
};

Injector.prototype.list = function() {
	this.directory.list();
};

Injector.prototype.setPath = function(path) {
	this.loader.setPath('default',path);
};
Injector.prototype.setConfigPath = function(path) {
	this.loader.setPath('config',path);
};

module.exports = Injector;