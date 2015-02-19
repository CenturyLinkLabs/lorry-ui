'use strict';

angular.module('lorryApp')
  .factory('serviceDefTransformer', ['lodash', function(lodash) {
    return {
      toRawYaml: function(serviceDefs) {
        var yaml = "";
        serviceDefs.forEach(function(sDef, _) {
          sDef.forEach(function(lineDef, _) {
            yaml += lineDef['text'];
          });
        });
        return yaml;
      },
      fromYamlDocument: function (yamlDoc) {
        var serviceDefs = [], serviceDef = [];
        if (yamlDoc.lines != undefined) {
          yamlDoc.lines.forEach(function(line, index) {
            var lineNumber = index + 1;
            var lineDef = {
              text: line,
              lineNumber: lineNumber,
              errors: lodash.select(yamlDoc.errors, { error: { line: lineNumber } })
            };
            serviceDef.push(lineDef);
          });
          serviceDefs.push(serviceDef);
        }
        return serviceDefs;
      }
    };
  }]);
