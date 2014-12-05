var hexagon = require('hexagonjs');

var app = hexagon();

app.configure(function(loader){
	loader.config('paths');
	loader.config('loader');
	loader.config('controllers');
});
