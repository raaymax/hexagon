function SysError(code, message){
    if(!message){
    	if(code == "TIMEOUT")
    		message = "Time for operation elapsed";
    }
    var err = new Error(message);
    err.code = code;
    return err;
}

function Module(name, func, opts){
	console.log( "pendding",name);
	this.name = name;
	this.reqs = [];
	this.ready = false;
	this.result = null;
	this.error = null;
	this.timer = null;
	this.opts = opts;
	var self = this;
	this.opts = this.opts || {};
	this.opts.timeout = this.opts.timeout || 5000;

	if(!this.opts.timerDisabled){
		this.timer = setTimeout(function(){
			console.log(this.name,"TIMEOUT");
			self.callback(SysError("TIMEOUT"), null);
		},this.opts.timeout);
	}

	process.nextTick(function(){
		func(function(err,res){
			clearTimeout(self.timer);
			self.callback(err, res);
		});
	});

}
Module.prototype.inform = function(){
	var self = this;
	if(this.ready){
		var reqs = this.reqs;
		this.reqs = [];
		reqs.forEach(function(req){
			req(self.error,self.result);
		});
	}
}
Module.prototype.get = function(getter){
	this.reqs.push(getter);
	this.inform();
}

Module.prototype.callback = function(err,res){
	this.error = err;
	this.result = res;
	this.ready = true;
	console.log(this.name,"ready");
	this.inform();
}

module.exports = Module;

