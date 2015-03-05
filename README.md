# lorry-ui

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.11.0.

## Setup
* install node
* install Yeoman with `npm install -g yo`
* install the Grunt cli with `npm install -g grunt-cli`
* install Bower with `npm install -g bower`
* install the Yeoman AngularJS generator with `npm install -g generator-angular`
  
* git clone this repo
* install Ruby if you don't already have it
* install compass with `gem install compass`
* install local node modules with `npm install`
* install local node modules with `bower install`

* launch the application in your browser by running `grunt serve`

## Build & development

Run `grunt` for building and `grunt serve` for preview.

## Testing

Running `grunt test` will run the unit tests with karma.

## Environment configuration

By default, the application will assume you are running, testing, or building in development mode.  If you want to 
change that for some reason, you can set a 'LORRY_ENV' environment variable to ‘develop', ‘qa', or ‘production’.  
It is this environment variable that will determine which of the config files in the '/config' directory are used when 
the grunt task generates the app.js file.
