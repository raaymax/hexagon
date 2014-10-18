var express 		= require('express');
var path			= require('path');
var favicon 		= require('serve-favicon');
var bodyParser 		= require('body-parser');
var methodOverride 	= require('method-override');
var cookieParser 	= require('cookie-parser');
var errorHandler 	= require('errorhandler');
var morgan			= require('morgan');
var compression 	= require('compression');
var session      = require('express-session');



module.exports = function(app, http, loader, $loader, $paths){
	http.set('port', 8080);
	http.set('views', $paths.views());
	http.set('view engine', 'jade');
	http.use(favicon($paths.public("favicon.ico")));
	http.use(bodyParser.json());
	http.use(bodyParser.urlencoded({extended: true}));
	http.use(methodOverride());
	http.use(cookieParser('dupabladanamalymzydelkusiedzisobie'));
	http.use(compression());
	http.use(errorHandler());
	http.use(morgan('dev'));
	http.locals.pretty = true;

	http.use(session({
		secret: 'jeszczejakiskolejnysekretdododania',
		resave: true,
		saveUninitialized: true
	}));

	app.on('start', function(){
		http.listen(http.get('port'));
		console.log('The magic happens on port ' + http.get('port'));
	});

	return http;
}
