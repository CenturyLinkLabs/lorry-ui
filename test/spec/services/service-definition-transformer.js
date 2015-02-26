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
          text: 'db:\\n',
          lineNumber: 1,
          errors: [
            { error: { message: 'error1', line: 1, column: 2} }
          ]
        },
        {
          text: '  image: postgres:latest\\n',
          lineNumber: 2,
          errors: [
            { error: { message: 'error2', line: 2, column: 3} }
          ]
        }
      ],
      [
        {
          text: 'web:\\n',
          lineNumber: 3,
          errors: [
            { error: { message: 'error3', line: 3, column: 2} }
          ]
        },
        {
          text: '  image: apache:latest\\n',
          lineNumber: 4,
          errors: [
            { error: { message: 'error4', line: 4, column: 3} }
          ]
        }
      ]
    ];

    var rawYaml = "db:\\n  image: postgres:latest\\nweb:\\n  image: apache:latest\\n";

    var yamlDoc = {
      lines: [
        'db:\\n',
        '  image: postgres:latest\\n',
        'web:\\n',
        '  image: apache:latest\\n'
      ],
      errors: [
        { error: { message: 'error1', line: 1, column: 2} },
        { error: { message: 'error2', line: 2, column: 3} },
        { error: { message: 'error3', line: 3, column: 2} },
        { error: { message: 'error4', line: 4, column: 3} }
      ]
    };

    describe('toRawYaml', function() {

      it("should transform service definitions to yaml", function () {
        var yamlResp = serviceDefTransformer.toRawYaml(serviceDefs);

        expect(rawYaml).toEqual(yamlResp);
      });

    });

    describe('fromYamlDocument', function() {

      it("should transform yaml to service definitions", function () {
        var sDefResp = serviceDefTransformer.fromYamlDocument(yamlDoc);

        expect(serviceDefs).toEqual(sDefResp);
        expect(serviceDefs.length).toEqual(2);
      });

    });

  });
});
