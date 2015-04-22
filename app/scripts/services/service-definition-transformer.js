'use strict';

angular.module('lorryApp').factory('serviceDefTransformer', ['$log', 'lodash', 'jsyaml',
  function($log, lodash, jsyaml) {
    function parseLine(line) {
      var lineKey, lineValue, lineYaml, keys, values;

      try {
        lineYaml = jsyaml.safeLoad(line.trim());
        keys = lodash.keys(lineYaml);
        values = lodash.values(lineYaml);

        if (angular.isDefined(lodash.first(keys)) && lodash.first(keys) !== '0') {
          lineKey = lodash.first(keys);
        }
        lineValue = values.join('');
      } catch (err) {
        $log.error(err);
      }
      return [lineKey, lineValue];
    }

    return {
      toRawYaml: function(serviceDefs) {
        var yaml = '';
        serviceDefs.forEach(function(sDef) {
          sDef.forEach(function(lineDef) {
            yaml += lineDef.text;
          });
        });
        return yaml;
      },
      fromYamlDocument: function (yamlDocument) {
        var srvcDef = [],
          serviceDefinitions = [];

        lodash.forEach(yamlDocument.lines, function(line, index){
          var lineDetails,
            lineNumber = index + 1,
            parsedLine = parseLine(line);

          lineDetails = {
            text: line,
            lineKey: parsedLine[0],
            lineValue: parsedLine[1],
            lineNumber: lineNumber,
            errors: lodash.select(yamlDocument.errors, { error: { line: lineNumber } }),
            warnings: lodash.select(yamlDocument.warnings, { warning: { line: lineNumber } })
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
