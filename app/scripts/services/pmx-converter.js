'use strict';

angular.module('lorryApp').factory('PMXConverter', ['jsyaml', 'lodash',
  function (jsyaml, lodash) {

    var convert = function (pmxYaml) {
      var pmxJson, images, newJson;

      try {
        pmxJson = jsyaml.safeLoad(pmxYaml);
      } catch (YamlException) {
        return null;
      }

      images = pmxJson.images;
      newJson = {};
      images.forEach(function (image) {
        newJson[image.name] = imageToServiceDefinition(image);
      });

      return jsyaml.safeDump(newJson);
    };

    var imageToServiceDefinition = function (image) {
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
    };

    var portFlags = function (ports) {
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
    };

    var linkFlags = function (links) {
      return links.map(function (link) {
        return link.service; // TODO: handle link_alias "service:alias"
      });
    };

    var exposeFlags = function (expose) {
      return expose.map(function (port) {
        return port;
      });
    };

    var environmentFlags = function (environment) {
      return environment.map(function (env) {
        return env.variable + '=' + env.value;
      });
    };

    var volumesFlags = function (volumes) {
      return volumes.map(function (volume) {
        var volumeString = '';

        if (volume.host_path) { volumeString += volume.host_path + ':'; }
        volumeString += volume.container_path;

        return volumeString;
      });
    };

    var volumesFromFlags = function (volumesFrom) {
      return volumesFrom.map(function (from) {
        return from;
      });
    };

    // Public API here
    return {
      convert: convert
    };
  }]);
