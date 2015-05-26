(function () {
  'use strict';

  angular
    .module('lorryApp')
    .factory('PMXConverter', PMXConverter);

  PMXConverter.$inject = ['jsyaml'];

  function PMXConverter(jsyaml) {

    function convert(pmxYaml) {
      var pmxJson,
        images,
        newJson = {};

      try {
        pmxJson = jsyaml.safeLoad(pmxYaml);
        images = pmxJson.images;
        images.forEach(function (image) {
          newJson[image.name.replace(/\s/g, '')] = imageToServiceDefinition(image);
        });
      } catch (error) {
        throw 'The document is not a valid Panamax template.';
      }

      return jsyaml.safeDump(newJson);
    }

    function imageToServiceDefinition(image) {
      var serviceDefinition = {};

      serviceDefinition.image = image.source;
      if (image.links) { serviceDefinition.links = linkFlags(image.links); }
      if (image.ports) { serviceDefinition.ports = portFlags(image.ports); }
      if (image.expose) { serviceDefinition.expose = exposeFlags(image.expose); }
      if (image.environment) { serviceDefinition.environment = environmentFlags(image.environment); }
      if (image.volumes) { serviceDefinition.volumes = volumesFlags(image.volumes); }
      if (image.volumes_from) { serviceDefinition.volumes_from = volumesFromFlags(image.volumes_from); }
      if (image.command) { serviceDefinition.command = image.command; }

      return serviceDefinition;
    }

    function portFlags(ports) {
      return ports.map(function (port) {
        var portString = '';

        if (port.host_interface || port.host_port) {
          if (port.host_interface) { portString += (port.host_interface + ':'); }
          if (port.host_port) { portString += (port.host_port + ':'); }
        }
        portString += port.container_port;
        if (port.proto && port.proto.toUpperCase() === 'UDP') { portString += '/udp'; }

        return portString;
      });
    }

    function linkFlags(links) {
      return links.map(function (link) {
        var linkString = '';

        linkString += link.service;
        if (link.alias) {
          linkString += ':' + link.alias;
        }
        return linkString;
      });
    }

    function exposeFlags(expose) {
      return expose.map(function (port) {
        return port;
      });
    }

    function environmentFlags(environment) {
      return environment.map(function (env) {
        return env.variable + '=' + env.value;
      });
    }

    function volumesFlags(volumes) {
      return volumes.map(function (volume) {
        var volumeString = '';

        if (volume.host_path) { volumeString += volume.host_path + ':'; }
        volumeString += volume.container_path;

        return volumeString;
      });
    }

    function volumesFromFlags(volumesFrom) {
      return volumesFrom.map(function (from) {
        return from;
      });
    }

    // Public API here
    return {
      convert: convert
    };
  }
})();
