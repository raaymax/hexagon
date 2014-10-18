var path = require('path');


var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;

function getParamNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '')
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
  if(result === null)
     result = []
  return result
}

module.exports = function Modules(){
	this.modules = {};
	this.path = [];
	this.configPath = [];

	this._require = require;

	this.setPath = function(path){
		this.path = path;
	}
	this.setConfigPath = function(path){
		this.configPath = path;
	}

	this.loadFromPath = function(name, tpath){
		if(typeof tpath == 'undefined') tpath = this.path;
		for(i in tpath){
			var p = tpath[i];
			var pp = path.join(p, name);
			if(pp[0] != '/') pp = "./"+pp;
			try{
				return this._require(pp+".js");
			}catch(err){
				if(err.code != "MODULE_NOT_FOUND"){
					console.log(pp+".js");
					console.log(err);
			//		process.exit(1);
				}else{
					console.log(err);
					console.log("not found");
				}
			}
		}
		return false;
	}

	this.set = function(name, ob){
			console.log("set "+name);
		if(typeof ob != "undefined")
			this.modules[name] = ob;
		else 
			this.modules[name] = true;
	}

	this.get = function(name){
		var ob;
		if(this.modules[name]){
			return this.modules[name];
		}
		return null;
	}

	this.load = function(name){
		var ob;
		ob = this.get(name);
		if(ob) return ob;
		console.log("load "+name)
		if(name[0] == '$')
			ob = this.loadFromPath(name.substr(1),this.configPath);
		else
			ob = this.loadFromPath(name);
		if(typeof ob == 'function'){
			ob = this.call(ob);
		}

		this.set(name, ob);
		return ob;
	}

	this.config = function(name){
		return this.load('$'+name);
	}

	this.call = function(fn, cb){
		var params = getParamNames(fn);
		var args = [];
		var self = this;
		var async = false;
		params.forEach(function(par,idx){
			if(par == "callback"){
				async = true;
				args.push(cb);
			}else{
				args.push(self.load(par));
			}
		});
		return fn.apply(global, args);
	}
}

