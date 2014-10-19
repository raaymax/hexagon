HexagonJS
=======

[![Project status](https://travis-ci.org/raaymax/hexagon.svg)](https://travis-ci.org/raaymax/hexagon)


Simplistic high-configurable Node-JS application framework with dependency injection.

## Installation &nbsp;  [![NPM version](https://badge.fury.io/js/hexagonjs.svg)](https://badge.fury.io/js/hexagonjs)

**With [node installed](http://nodejs.org):**
```sh
# Get the latest stabe hexagonjs
$ sudo npm install hexagonjs -g
```

## Creating first project
```sh
# create simple web app
$ hexagonjs -e <project_name>

# install all dependencies
$ cd <project_name>
$ npm install

# run your app
$ node app
```

## Overview

HexagonJS has build-in dependency injection system. All modules from modules/ or app/modules/ directories can be loaded by typing its filename (without extenion) as arguments for function.  

**app/controllers/home.js**
```js
module.exports = function(http){
	http.get('/', function(req,res){
		res.render('index');
	});
}
```
In this example module from *modules/http.js* is loaded to be used in controller.





## License

MIT License Copyright © 2014 Mateusz Russak
