var path = require('path');
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


//TODO: 
// - dodać timeout

function Module(name,fn) {
	this.name = name;
	this.reqs = [];
	this.result = null;
	this.err = null;
	this.ready = false;
	this.timer = null;
	var self = this;

	this.opts = fn(function(err, ret){
		process.nextTick(function(){
			self.callback(err, ret);
		});
	});
	if(!this.opts || !this.opts.timeroff){
		var time = (this.opts && this.opts.timeout) || 5000;
		this.timer = setTimeout(function(){
			//if(self.ready) return;
			self.result = null;
			self.err = new Error("TIMEOUT");
			self.ready = true;
			console.log("---",self.name,"is timed out");
			self.trypop();

		},time);
		console.log("timer for", this.name, time,"ms");
	}
}

Module.prototype.get = function(fn){
//	console.log(fn);
//	console.trace();
	this.reqs.push(fn);
	this.trypop();
}
Module.prototype.trypop = function(){
	var self = this;
//	console.log(this.name,"ready", this.ready);
	if(this.ready){
//		console.log(this);
		var rr = this.reqs;
		this.reqs = [];
		rr.forEach(function(req){
			if(typeof req == "function")
				req(self.err, self.result);
		});
	}
}

Module.prototype.callback = function(err, result){
	if(this.ready != false) 
		throw Error("Callback already called or timeout");
	if(!this.opts || !this.opts.timeroff){
		clearTimeout(this.timer);
		console.log(this.name,"timer canceled");
	}
	this.result = result;
	this.ready = true;
	console.log("+++",this.name,"is ready");
	this.trypop();
}

function Modulator(call){
	this.modules = {};
	this.path = [];
	this._require = require;
	this.call = call;
}

Modulator.prototype.setPath = function(path){
	this.path = path;
}
Modulator.prototype.list = function(){
	console.log(Object.keys(this.modules));
}
Modulator.prototype.set = function(name, ob){
	this.modules[name] = new Module(name,function(callback){
		callback(null,ob);
	});
}

Modulator.prototype.setf = function(name, func){
	this.modules[name] = new Module(name,func);
/*	this.get(name,function(err,res){
		console.log("setf", name,"ready");
	})*/
}
Modulator.prototype.load = function(name,cb){
	var tpath = this.path;
	var res = null;
	var err = null;
	console.log(tpath)
	for(i in tpath){
		var p = tpath[i];
		var pp = path.join(p, name);
		if(pp[0] != '/') pp = "./"+pp;
		try{
			err = null;
			console.log("trying",pp+".js");
			res = this._require(pp+".js");
			console.log("loaded",pp+".js");
			break;
		}catch(e){
			err = e;
		}
	}
	cb(err, res);
	return res;
}
Modulator.prototype.get = function(name, cb){
	var self = this;
//	console.log("getting", name);
//	console.log("\nmodulator.get args:");
//	console.log(name);
//	console.log(cb);
//	console.trace();
//	console.log('.\n');
	if(!this.modules[name]){
		console.log('-----------', name, "not exist");
		this.modules[name] = new Module(name,function(callback){
			self.load(name, function(err, res){
				if(typeof res != "function"){
					console.log(name, "is not a function");
					callback(new Error("NOT_A_FUNCTION"),null);
					return;
				}
				self.call(res, callback);
			});
		});
	}

	this.modules[name].get(function(err, res){
		console.log("getting", name, "done");
	});

	this.modules[name].get(cb);
}

Modulator.prototype.param = function(name){
	var self = this;
//	console.log("\nmodulator.param args:");
//	console.log(name);
//	console.log('.\n');
	return { 
		get: function(cb){
//			console.log("\nmodulator.param - get args:");
//			console.log(name);
//			console.log(cb);
//			console.log('.\n');
			return self.get(name, cb);
		},
		set: function(ob){
//			console.log("\nmodulator.param - set args:");
//			console.log(name);
//			console.log(ob);
//			console.log('.\n');
			return self.set(name,ob);
		},
		setf: function(func){
//			console.log("\nmodulator.param - set args:");
//			console.log(name);
//			console.log(ob);
//			console.log('.\n');
			return self.setf(name, func);
		}
	}
}

function Dispatcher(def){
	this.routes = [];
	this.default = def;
}

Dispatcher.prototype.add = function(matcher, mod){
	this.routes.push({
		matcher: matcher,
		modulator: mod
	});
}
Dispatcher.prototype.dispatch = function(par){
//	console.log("dispatching ",par);
	var res = null;
	this.routes.forEach(function(el){
		if(el.matcher.test(par)){
			console.log("dispatching",par,"config")
			res = el.modulator.param(par.replace(el.matcher,""));
		}
	});
	if(res == null){
		res = this.default.param(par);
		console.log("dispatching",par,"default")
	}
	return res;
}

function Injector(disp){
	this.dispatcher = disp;
}
Injector.prototype.inject = function(fn, cb){
	if(typeof fn != "function"){
		cb(new Error("NOT_A_FUNCTION"),null);
		return;
	}
	var self = this;
	var args = [];
	var params = getParamNames(fn);
	var asyn = false;

//	console.log("params:");
//	console.log(params);
//	console.log();
	async.each(params, function(par, done){
		var idx = params.indexOf(par);
		if(par == "callback"){
			args[idx] = cb;
			asyn = true;
//			console.log(par,idx, "done");
			done();
		}else{
			console.log('processing',par);
			self.dispatcher.dispatch(par).get(ret(par,idx,done));
		}
	}, function(err){
		var r = fn.apply(global, args);
		if(!asyn && typeof cb == "function")
			cb(null, r);
	});

	function ret(name, idx, done){
		return function(err, res){
			args[idx] = res;
//			console.log(name,idx, "done");
			done(err);
		}
	}
}

function Modules(){
	var self = this;
	function retCall(){
		return function(fn, cb){
			self.injector.inject(fn, cb);
		}
	}
	this.defaultModulator = new Modulator(retCall());
	this.configModulator = new Modulator(retCall());
	this.dispatcher = new Dispatcher(this.defaultModulator);
	this.dispatcher.add(/^\$/, this.configModulator);
	this.injector = new Injector(this.dispatcher);
}

Modules.Module = Module;
Modules.Modulator = Modulator;
Modules.Injector = Injector;
Modules.Dispatcher = Dispatcher;

Modules.prototype.setPath = function(path){
	console.log('setPath');
	this.defaultModulator.setPath(path);
}
Modules.prototype.setConfigPath = function(path){
	console.log('setConfigPath');
	this.configModulator.setPath(path);
}
Modules.prototype.set = function(name, ob){
	console.log('set ', name);
	this.dispatcher.dispatch(name).set(ob);
}
Modules.prototype.setf = function(name, func){
	console.log('setf ', name);
	this.dispatcher.dispatch(name).setf(func);
}
Modules.prototype.call = function(fn, cb){
	console.log('call');
	this.injector.inject(fn, cb);
}
Modules.prototype.load = function(name, cb){
	console.log('load');
	this.defaultModulator.get(name, cb);
}
Modules.prototype.config = function(name, cb){
	console.log('config ' + name);
	this.configModulator.get(name,cb);
}

Modules.prototype.list = function(){
	console.log("\nDefault:");
	this.defaultModulator.list();
	console.log("Config:");
	this.configModulator.list();
	console.log();
}

module.exports = Modules;



