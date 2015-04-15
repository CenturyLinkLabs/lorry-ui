'use strict';

describe('Service: service-definition-transformer', function () {

  // load the service's module
  beforeEach(module('lorryApp'));

  // serviceDefTransformer factory
  describe('Factory: serviceDefTransformer', function () {

    var serviceDefTransformer;

    // Initialize the service and a mock scope
    beforeEach(inject(function (_serviceDefTransformer_) {
      serviceDefTransformer = _serviceDefTransformer_;
    }));

    var serviceDefs = [
      [
        {
          text: 'db:\ ',
          lineKey: 'db',
          lineValue: '',
          lineNumber: 1,
          errors: [
            { error: { message: 'error1', line: 1, column: 2} }
          ]
        },
        {
          text: '  image: postgres:latest\ ',
          lineKey: 'image',
          lineValue: 'postgres:latest',
          lineNumber: 2,
          errors: [
            { error: { message: 'error2', line: 2, column: 3} }
          ]
        }
      ],
      [
        {
          text: 'web:\ ',
          lineKey: 'web',
          lineValue: '',
          lineNumber: 3,
          errors: [
            { error: { message: 'error3', line: 3, column: 2} }
          ]
        },
        {
          text: '  image: apache:latest\ ',
          lineKey: 'image',
          lineValue: 'apache:latest',
          lineNumber: 4,
          errors: [
            { error: { message: 'error4', line: 4, column: 3} }
          ]
        }
      ]
    ];

    var rawYaml = 'db:\   image: postgres:latest\ web:\   image: apache:latest\ ';

    var yamlDoc = {
      lines: [
        'db:\ ',
        '  image: postgres:latest\ ',
        'web:\ ',
        '  image: apache:latest\ '
      ],
      errors: [
        { error: { message: 'error1', line: 1, column: 2} },
        { error: { message: 'error2', line: 2, column: 3} },
        { error: { message: 'error3', line: 3, column: 2} },
        { error: { message: 'error4', line: 4, column: 3} }
      ]
    };

    describe('toRawYaml', function() {

      it('should transform service definitions to yaml', function () {
        var yamlResp = serviceDefTransformer.toRawYaml(serviceDefs);

        expect(rawYaml).toEqual(yamlResp);
      });

    });

    describe('fromYamlDocument', function() {

      it('should transform yaml to service definitions', function () {
        var sDefResp = serviceDefTransformer.fromYamlDocument(yamlDoc);

        expect(serviceDefs).toEqual(sDefResp);
        expect(serviceDefs.length).toEqual(2);
      });

    });

  });
});
