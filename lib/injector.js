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
}


Injector.prototype.inputParse = function(argv){
	var params;
	var func;
	var cb;

	if(Array.isArray(argv[0])){
		params = argv[0];
		func = argv[1];
		cb = argv[2];
	}else if(typeof argv[0] == 'object' && argv[0] !== null){
		func = argv[0].controller;
		params = argv[0].dependencies || getParamNames(func);
		cb = argv[1];//.onload || null;
	}else if(typeof argv[0] == 'function'){
		func = argv[0];
		params = getParamNames(func);
		cb = argv[1];
	}else if(typeof argv[0] == 'string'){
		func = this.loader._require(argv[0]);
		func.filename = argv[0];
		params = getParamNames(func);
		cb = argv[1];
	}else{
		throw new Error("Unknown input");
	}
	return {params:params, func:func, cb:cb};
}

Injector.prototype.call = function() {
	var args = [];
	var th = this;
	var check = [];
	
	var input = this.inputParse(arguments);
	var params = input.params;
	var func = input.func;
	var cb = input.cb;

	for(var i in params) check[i] = null;
	async.each(params,function(param,done){
		th.directory.find(param, function(err,mod){
			if(err){
				mod = th.load(param,function(err){
				});
			}
			mod.get(function(err,res){
				var idx = params.indexOf(param);
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
			console.log("function name:",func.name,"\npath:", func.filename,"\nparams:");
			for(var i in params){
				if(check[i] === false){
					console.log("\t\""+params[i]+"\" => error, not loaded ");
					break;
				}
			}
			console.log(err);
			console.log();
			throw new Error("Critical error");
		}else{
			input.argv = {};
			for(var i in params)
				input.argv[params[i]] = args[i];
			res = func.apply(input,args);
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
			if(typeof res == 'function' || (typeof res == 'object' && res !== null))
				th.call(res, cb2);
			else{
				console.log("test",name,res);
				cb2(new Error("file is not a function or object"),null);
			}
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

Injector.prototype.setPath = function(name,path) {
	if(Array.isArray(name))
		this.loader.setPath('default',name);
	else
		this.loader.setPath(name,path);
};

Injector.prototype.setConfigPath = function(path) {
	this.loader.setPath('config',path);
};

Injector.prototype.addContainer = function(name, regex, transformation){
	this.loader.setRoute(name, regex, transformation);
}

module.exports = Injector;
