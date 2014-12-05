var express = require('express');
var path = require('path');

module.exports = function(http, $paths){
	http.use(require('stylus').middleware($paths.public()));
	http.use(express.static($paths.public()));
}
