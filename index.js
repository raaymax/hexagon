var Core = require('./lib/core');
var Loader = require('./lib/injector');
var path = require('path');


module.exports = function(){
	var loader = new Loader();
	var app = new Core(loader);
	return app;
}







