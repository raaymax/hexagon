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

HexagonJS can be used to build any application, not only web. I used it to build my webpage and non-http AI for some programing contest.

HexagonJS has build-in dependency injection system. All modules from modules directories can be loaded by typing its filename (without extenion) as arguments for function.  

**app/controllers/home.js**
```js
module.exports = function(http){
	http.get('/', function(req,res){
		res.render('index');
	});
}
```
In this example module from *modules/http.js* is loaded to be used in controller.

## Modules

Whole framework bases on modules. Each module have its dependencies. Modules will be loaded in order - dependencies first. All dependencies will be accessible from the controller function. Controller function is something like constructor of the module - what it will return it will be accesible as the module.

Currently there are 2 ways to create modules. First is the shorter one:
**app/modules/randomUser.js**
```js
module.exports = function(users){
	return function(){
		return users.get(Math.round(Math.random()*users.count()));
	}
}
```
This is very simple example but should be enouch to present basics. module.exports is a function which will have injected parameters by its names. In this case there will be loaded *app/modules/users.js* and injected as the *users* argument to the function. Function returns in this case a function to randomly pick user from *users* module, that means when other module will use *randomUser* as a dependencie - it will be a function that returns a random user.

Second way to define module is by object way, i will use the same example:

**app/modules/randomUser.js**
```js
module.exports = {
	dependencies: ['users'],
	controller: function(anyname){
		var users = this.argv.users;

		return function(){
			return anyname.get(Math.round(Math.random()*anyname.count()));
		}
	}
}
```

In this case all dependencies are listed in *dependencies* property and they will be injected in order to the *controller* function - this gives us an ability to give any names to the arguments - its handy when names are very long. 
If there are too many dependencies to list them as function arguments you can access to them by *this.argv* object which contains all arguments.

## Configuration

### The *loader* module

TODO...

## Generator options

*-e* or *--express* - will add simple express framework support




## License

MIT License Copyright © 2014 Mateusz Russak
