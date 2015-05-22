# Lorry
[Lorry](https://lorry.io) is a project from the team at [CenturyLink Labs](http://www.centurylinklabs.com/).  This utility provides a browser-based validator and builder for [Docker Compose YAML files](https://docs.docker.com/compose/yml/).  A docker-compose.yml can be imported or built from scratch.  You can even import Panamax templates and convert them to docker-compose.yml files.  

The initial import and subsequent modifications of a document triggers validation against a YAML schema derived from the latest [Compose documentation](https://docs.docker.com/compose/).  The utility differentiates between errors which prevent the application defined in the docker-compose.yml from being stood up with Compose and warnings which simply point out things in the document that might not be what you want.  

The Lorry project will make creating docker-compose.yml files easier with its user-friendly interface that provides documentation for Compose options and limits choices of keys to those specified in the [docker-compose.yml reference](https://docs.docker.com/compose/yml/). 

Once you're done crafting the docker-compose.yml, Lorry makes it simple to save your document as a file, copy it to the clipboard, and even share it with others as a Gist or with a Lorry URL for collaborative editing.

## Usage
You can access the hosted version of Lorry at [lorry.io](https://lorry.io). For local development, the lorry-ui project requires services provided by the [Lorry API](https://github.com/CenturyLinkLabs/lorry). The Lorry API must be available in order for the Lorry UI to function.

## Building & development
This project was generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.11.0.

### Setup
* install node
* install Yeoman with `npm install -g yo`
* install the Grunt cli with `npm install -g grunt-cli`
* install Bower with `npm install -g bower`
* install the Yeoman AngularJS generator with `npm install -g generator-angular`

* git clone this repo
* install Ruby if you don't already have it
* install compass with `gem install compass`
* install local node modules with `npm install`
* install local JS modules with `bower install`

### Execution
Run `grunt` for building and `grunt serve` for preview.

## Testing
Running `grunt test` will run the unit tests with karma.

## Environment configuration
By default, the application will assume you are running, testing, or building in development mode.  If you want to 
change that for some reason, you can set a 'LORRY_ENV' environment variable to 'develop', 'qa', or 'production'.  
It is this environment variable that will determine which of the config files in the '/config' directory are used when 
the grunt task generates the app.js file.
