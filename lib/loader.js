var path = require('path');


function Loader(){
	this.path = {};
	this.routes = {};
	this._require = require;
}
Loader.prototype.setPath = function(id,path, matcher, func) {
	this.path[id] = path;	
//	this.routes[id] = {id:id, matcher: matcher, func:func};
};
Loader.prototype.setRoute = function(id, matcher, func){
	this.routes[id] = {id:id, matcher: matcher, func:func};
};

Loader.prototype.getId = function(key) {
	var res = null;
	for(var i in this.routes){
		var el = this.routes[i];
		if(el.matcher.test(key)) 
			res = el.id;
	}	
	if(!res) res = "default";
	return res;
};

Loader.prototype.createPath = function(key, id, dir) {
	if(this.routes[id] && this.routes[id].func)
		key = this.routes[id].func(key);
	return path.join(dir,key)+".js";
};

Loader.prototype.load = function(key, cb) {
	var id = this.getId(key);
	var error = [];
	var file = null;
	if(!this.path[id] || this.path[id].length == 0)
		error.push(new Error('Path is empty'));
	for(var i in this.path[id]){
		var p = this.path[id][i];
		var ap = this.createPath(key,id,p);
		try{
			file = this._require(ap);
			if(typeof file == "function")
				file.filename = ap;
		}catch(err){
			error.push(err);
			continue;
		}
		cb(null,file,ap);
		return;
	}
	cb(error, null);
};

module.exports = Loader;