var util = require('util');
var path = require('path');
var events = require("events");


function Core(loader) {
    events.EventEmitter.call(this);
    var self = this;
    this.init = false;
    this.root = path.dirname(require.main.filename);//require.main.path; //('app-root-path').path;
    this.loader = loader;
	loader.set('app', this);
	this.on('configureDone', function(){
		self.start();
	});
	loader.directory.on('idle',function(){
		self.ready();
	});
	loader.setConfigPath([path.join(this.root,"config")]);
	loader.set('loader', loader);
}

util.inherits(Core, events.EventEmitter);

Core.prototype.configure = function(fn){
	this.emit('configure');
	fn(this.loader);
	this.init = true;
}

Core.prototype.ready = function() {
	if(this.init){
		this.emit('configureDone');
	}
};

Core.prototype.start = function(){
	console.log("Aplication start signal");
	this.emit('start');
}

module.exports = Core;