var util = require('util');
var events = require("events");

function error(code, message){
	var err = new Error(message);
	err.code = code;
	return err;
}


function Directory(){
	events.EventEmitter.call(this);
	this.dir = {};
	this.status = {};
}
util.inherits(Directory, events.EventEmitter);


Directory.prototype.list = function() {
	console.log(Object.keys(this.dir));
};

Directory.prototype.register = function(ob, cb) {
	var self = this;
	if(!this.dir[ob.name]){
		this.dir[ob.name] = ob;
		this.status[ob.name] = false;
		ob.get(function(err,res){
			self.status[ob.name] = true;
			self.check();
		});
		if(cb) cb(null);
	}else{
		if(cb) cb(error("EXIST",'Module already exist'));
	}
};

Directory.prototype.find = function(name, cb) {
	if(this.dir[name]){
		cb(null,this.dir[name]);
	}else{
		cb(error("NOT_EXIST",'Module not exist'),null);
	}
};


Directory.prototype.check = function() {
	if(this.ready())
		this.emit("idle");	
};

Directory.prototype.ready = function() {
	for(var i in this.status){
		if(!this.status[i]) return false; 
	};
	return true;
};

module.exports = Directory;