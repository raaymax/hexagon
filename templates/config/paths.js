var path = require("path");

module.exports = function(app){
	function pather(base){
		return function(p){
			if(!p) return base;
			return path.join(base, p);
		}
	}

	var paths = {};
	paths.root 			= pather(app.root);
	paths.app			= pather(paths.root("app/"));
	paths.public		= pather(paths.app("public/"));
	paths.views			= pather(paths.app("views/"));
	paths.controllers	= pather(paths.app("controllers/"));
	paths.models		= pather(paths.app("models/"));
	

	// TODO przydało by się cos z tym zrobić....

	return paths;
}
