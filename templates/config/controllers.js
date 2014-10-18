var fs = require('fs');

module.exports = function(app, loader,http, $paths, $passport){
	loader.setf('controllers',function(cb){
		fs.readdir($paths.controllers(), function(err, files){
			files.forEach(function(file){
				loader.call(require($paths.controllers(file)));
			});
			cb(err,files);
		});
	});
}