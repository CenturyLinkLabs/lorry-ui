(function () {
  'use strict';

  angular
    .module('lorryApp')
    .directive('serviceDefinitionEdit', serviceDefinitionEdit);

  serviceDefinitionEdit.$inject = ['$rootScope', '$document', 'lodash', 'viewHelpers'];

  function serviceDefinitionEdit($rootScope, $document, lodash, viewHelpers) {
    return {
      scope: {
        sectionName: '=',
        serviceDefinition: '='
      },
      restrict: 'E',
      replace: 'true',
      templateUrl: '/scripts/directives/service-definition-edit.html',
      link: function (scope, element) {

        scope.transformToJson = function () {
          if (!scope.newSectionName) {
            scope.newSectionName = scope.sectionName;
          }
          if (scope.editableJson) {
            scope.$parent.editedServiceYamlDocumentJson = scope.transformToYamlDocumentFragment(scope.editableJson);
          } else {
            scope.editableJson = scope.transformToEditableJson(scope.$parent.editedServiceYamlDocumentJson);
            // since image/build section is mandatory, add it to the json if not present
            if (!lodash.findWhere(scope.editableJson, {name: 'image'}) &&
              !lodash.findWhere(scope.editableJson, {name: 'build'})) {
              scope.editableJson.push({name: 'image', value: ''});
            }
            // since extends section should always have subkeys file & service, add it to the json if not present
            fixExtendsKeyStructure();
          }
          interweaveWithErrors(scope.editableJson);
        };

        scope.transformToEditableJson = function (json) {
          var fixedJson = [];
          angular.forEach(json, function(svalue, skey) {
            var sectionObj = {};
            var lines = [];

            // if sequence type keys have string value, convert them to array
            svalue = convertSeqKeyValueToArray(svalue, skey);

            // if environment key values are a sequence, convert them to a hash array
            svalue = convertEnvironmentSeqOrHashToArray(svalue, skey);

            // weird way to check if the array is a real array
            // or the array has objects in it
            // if [{"foo": "bar"}] the length is undefined
            // if ["foo", "bar"] the length is 2
            if (Array.isArray(svalue) && svalue.length === 'undefined') {
              angular.forEach(svalue,  function(lvalue, lkey) {
                var lineObj = {
                  name: lkey,
                  value: lvalue
                };
                lines.push(lineObj);
              });
            }
            if (skey !== 'editMode') {
              sectionObj.name = skey;
              if (lines.length > 0) {
                sectionObj.value = lines;
              } else {
                sectionObj.value = svalue;
              }
              fixedJson.push(sectionObj);
            }
          });

          return fixedJson;
        };

        scope.sectionClasses = function() {
          return scope.topLevelError ? 'error' : '';
        };

        scope.transformToYamlDocumentFragment = function (editedJson) {
          var yamlFrag = {};
          angular.forEach(editedJson, function(svalue) {
            if (svalue.name === 'environment') {
              yamlFrag[svalue.name] = convertSeqSyntaxToHashSyntaxForEnvironmentVars(svalue);
            } else {
              yamlFrag[svalue.name] = svalue.value;
            }
          });
          return yamlFrag;
        };

        var convertSeqSyntaxToHashSyntaxForEnvironmentVars = function (svalue) {
          var obj = {};
          var newEnvTracker = [];
          for(var i = 0; i < svalue.value.length; i++) {
            var item = svalue.value[i];
            // look for the first occurance of ':' or '='
            // favor the ':' syntax when mixed chars ae present
            if (item !== '') {
              var subval = '', subkey = '';
              // if incoming value has neither : nor = e.g. DOCKER_HOST
              if (item.indexOf(':') === -1 && item.indexOf('=') === -1) {
                obj[item] = null;
              } else {
                // if incoming value has : syntax
                var index = item.indexOf(':');
                if ( index !== -1) {
                  subkey = item.substring(0, index);
                  subval = item.substring(index+1, item.length);
                  subval = subval === 'null' ? null : subval;
                } else {
                  // if incoming value has = syntax
                  subval = ''; subkey = '';
                  index = item.indexOf('=');
                  if ( index !== -1) {
                    subkey = item.substring(0, index);
                    subval = item.substring(index+1, item.length);
                    subval = subval === 'null' ? null : subval;
                  }
                }
                obj[subkey] = subval;
              }
              // If items for the environment key was marked for deletion
              // substitute the index no. by the actual key
              var envTracker = $rootScope.markAsDeletedTracker.environment;
              if (angular.isDefined(envTracker) && !lodash.isEmpty(envTracker)) {
                if (lodash.includes(envTracker, i)) {
                  newEnvTracker.push(subkey);
                }
              }
            }
          }
          $rootScope.markAsDeletedTracker.environment = newEnvTracker;
          return obj;
        };

        scope.saveServiceDefinition = function (isFormValid) {
          if (isFormValid) {
            scope.$parent.editedServiceYamlDocumentJson = scope.transformToYamlDocumentFragment(scope.editableJson);
            scope.$emit('saveService', scope.sectionName, scope.newSectionName, scope.$parent.editedServiceYamlDocumentJson);
            // reset edited json
            scope.editableJson = [];
          }
          editCompleted();
        };

        scope.cancelEditing = function () {
          // reset scratch form values
          scope.newSectionName = '';
          scope.editableJson = [];
          // since image/build section is mandatory, add it to the json if not present
          if (!lodash.findWhere(scope.editableJson, {name: 'image'}) &&
            !lodash.findWhere(scope.editableJson, {name: 'build'})) {
            scope.editableJson.push({name: 'image', value: ''});
          }

          scope.$emit('cancelEditing', scope.sectionName);
          editCompleted();
        };

        var editCompleted = function() {
          viewHelpers.animatedScrollTo(element);
        };

        scope.addNewKey = function (key) {
          if (lodash.includes($rootScope.validKeys, key)) {
            var keyValue;
            // restrict the create from scratch for 'command' key to a string type
            if (key === 'command') {
              keyValue = '';
            } else {
              keyValue = scope.createNewEmptyValueForKey(key);
            }
            scope.editableJson.push({name: key, value: keyValue});
            scope.transformToJson();
          }
        };

        scope.$on('addNewValueForExistingKey', function (e, key) {
          var node = lodash.findWhere(scope.editableJson, {name: key});
          if (node) {
            var keyValue = scope.createNewEmptyValueForKey(key);
            if (Array.isArray(keyValue)) {
              node.value.push(keyValue[0]);
              scope.transformToJson();
            }
          }
        });

        scope.$on('markKeyForDeletion', function (e, key) {
          var node = lodash.findWhere(scope.editableJson, {name: key});
          if (node) {
            scope.markItemForDeletion(key, null);
          }
        });

        scope.$on('markKeyItemForDeletion', function (e, key, index) {
          var node = lodash.findWhere(scope.editableJson, {name: key});
          if (node) {
            scope.markItemForDeletion(key, index);
          }
        });

        scope.buildValidKeyList = function () {
          if (!lodash.isEmpty($rootScope.validKeys)) {
            var existingKeys = lodash.pluck(scope.editableJson, 'name');
            if (lodash.includes(existingKeys, 'image') || lodash.includes(existingKeys, 'build')) {
              existingKeys = lodash.union(existingKeys, ['image', 'build']);
            }
            var unsortedList = lodash.difference($rootScope.validKeys, existingKeys);
            return lodash.sortBy(unsortedList);
          }
        };

        scope.createNewEmptyValueForKey = function(key) {
          var keyValue;

          if (isKeyTypeSequence(key)) {
            keyValue = [''];
          } else if (isKeyTypeString(key)) {
            keyValue = '';
          } else if (key === 'extends') {
            keyValue = {file: '', service: ''};
          } else {
            keyValue = '';
          }
          return keyValue;
        };

        scope.markItemForDeletion = function(key, index) {
          var tracker = $rootScope.markAsDeletedTracker;

          // toggle add/remove items from the delete marker
          if (tracker.hasOwnProperty(key)) {
            if (index !== null) {
              if (lodash.includes(tracker[key], index)) {
                // remove the item from tracker
                lodash.remove(tracker[key], function (v) {
                  return v === index;
                });
                // if no items in tracker, delete the key
                if (lodash.size(tracker[key]) === 0) {
                  delete tracker[key];
                }
              } else {
                // add the item to the tracker
                tracker[key].push(index);
              }
            } else {
              delete tracker[key];
            }
          } else {
            // add key/index to tracker
            tracker[key] = [];
            if (index !== null) {
              tracker[key].push(index);
            } else {
              tracker[key].push('delete me');
            }
          }
        };

        scope.doesServiceNameExists = function (serviceName) {
          // if the service is being edited, allow the original section name to be used
          return (serviceName === scope.sectionName) ? false : lodash.includes(scope.$parent.serviceNames(), serviceName);
        };

        scope.hasTopLevelErrors = function() {
          return !lodash.isEmpty(scope.topLevelError);
        };

        scope.topLevelTooltip = function() {
          return (scope.topLevelError || []).join('<br/>');
        };

        var fixExtendsKeyStructure = function () {
          var node = lodash.findWhere(scope.editableJson, {name: 'extends'});
          if (node) {
            node.value = node.value ? node.value : { value: '' };
            var obj = {};
            obj.file = node.value.file ? node.value.file : '';
            obj.service = node.value.service ? node.value.service : '';
            node.value = obj;
          }
        };

        var convertSeqKeyValueToArray = function (svalue, skey) {
          // unless it is the hybrid 'command' key
          if (skey !== 'command') {
            // if sequence type keys have string value, convert them to array
            if (isKeyTypeSequence(skey)) {
              if (!Array.isArray(svalue)) {
                var temp = svalue;
                svalue = [];
                svalue.push(temp);
              }
            }
          }
          return svalue;
        };

        var convertEnvironmentSeqOrHashToArray = function (svalue, skey) {
          if (skey !== 'environment') {
            return svalue;
          }

          var valueArr = [];
          if (Array.isArray(svalue) && angular.isObject(svalue)) {
            angular.forEach(svalue, function(lvalue) {
              if (angular.isObject(lvalue)) {
                // {'ENV_KEY_1': 'some value'} -> ['ENV_KEY_1:some value']
                angular.forEach(lvalue,  function(lv, lk) {
                  valueArr.push(lk+':'+lv);
                });
              } else {
                // ['ENV_KEY_1=some value'] -> don't change
                valueArr.push(lvalue);
              }
            });
          }
          return valueArr;
        };

        var isKeyTypeSequence = function (skey) {
          var seqKeys = ['command', 'links', 'external_links', 'ports', 'expose', 'volumes', 'volumes_from', 'environment', 'env_file', 'dns', 'cap_add', 'cap_drop', 'dns_search', 'labels'];
          return lodash.includes(seqKeys, skey);
        };

        var isKeyTypeString = function (skey) {
          var stringKeys = ['image', 'build', 'net', 'pid', 'working_dir', 'entrypoint', 'user', 'hostname', 'domainname', 'mac_address', 'mem_limit', 'memswap_limit', 'privileged', 'restart', 'stdin_open', 'tty', 'cpu_shares', 'cpuset', 'read_only', 'volume_driver', 'container_name'];
          return lodash.includes(stringKeys, skey);
        };

        function interweaveWithErrors(editableJson) {
          var currentKey,
          count = 0;

          lodash.forEach(scope.serviceDefinition, function(line) {
            if (lodash.isEmpty(line.lineKey)) {
              count += 1;
            } else {
              currentKey = line.lineKey;
              count = 0;
            }

            checkFor('Errors', line, count, currentKey);
            checkFor('Warnings', line, count, currentKey);
          });

          function checkFor(type, line, count, currentKey) {
            var collectionType = type.toLowerCase(),
                messages = collectMessagesFrom(line[collectionType]);
            if (line[collectionType] && line[collectionType].length > 0) {
              var lineWithErrors = {};
              if (lodash.isEmpty(line.lineKey)) {
                lineWithErrors = lodash.findWhere(editableJson, { name: currentKey }) || {};
                var s = 'sub' + type;
                if (!lineWithErrors[s]) {
                  lineWithErrors[s] = {};
                }
                lineWithErrors[s][count] = messages;
              } else {
                lineWithErrors = lodash.findWhere(editableJson, { name: line.lineKey });
                if (lineWithErrors) {
                  lineWithErrors[collectionType] = messages;
                } else {
                  scope.topLevelError = messages;
                }
              }
            }

            function collectMessagesFrom(collection) {
              return lodash.map(collection, function(item) {
                var singular = collectionType.replace(/s$/,''),
                    object = item[singular] || {};
                return object.message;
              });
            }
          }
        }


        function initialize() {
          scope.transformToJson();
        }

        initialize();

      }
    };
  }
})();
