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
      fromYamlDocument: function (yamlDocument) {
        var srvcDef = [];
        var serviceDefinitions = [];

        lodash.forEach(yamlDocument.lines, function(line, index){
          var lineNumber = index + 1;
          var lineDetails = {
            text: line,
            lineNumber: lineNumber,
            errors: lodash.select(yamlDocument.errors, { error: { line: lineNumber } })
          };

          if (/^(?:\s|-)/i.test(line)) {
            srvcDef.push(lineDetails);
          } else {
            if (srvcDef.length > 0) {
              serviceDefinitions.push(srvcDef);
            }
            srvcDef = [lineDetails];
          }
        });
        if (srvcDef.length > 0) {
          serviceDefinitions.push(srvcDef);
        }
        return serviceDefinitions;
      }
    };
  }]);
