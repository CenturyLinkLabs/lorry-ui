'use strict';

describe('Service: PMXConverter', function () {

  beforeEach(module('lorryApp'));

  var PMXConverter, jsyaml;

  beforeEach(inject(function (_PMXConverter_, _jsyaml_) {
    PMXConverter = _PMXConverter_;
    jsyaml = _jsyaml_;
  }));

  it('raises an exception if the argument to convert() is not a valid pmx template', function () {
    expect(function () {
      PMXConverter.convert('---\nfoo: bar\n');
    }).toThrow('The document is not a valid Panamax template.');
  });

  it('converts the panamax image names to top-level service definition keys', function () {
    var pmx = '---\nimages:\n- name: foo\n  source: foo/bar\n- name: bar\n  source: baz/quux\n';
    var compose = jsyaml.safeLoad(PMXConverter.convert(pmx));
    expect(compose.foo).not.toBeNull();
    expect(compose.bar).not.toBeNull();
  });

  it('removes spaces in the panamax image names', function () {
    var pmx = '---\nimages:\n- name: foo  bar\n  source: foo/bar\n';
    var compose = jsyaml.safeLoad(PMXConverter.convert(pmx));
    expect(compose.foobar).toBeDefined();
    expect(compose['foo  bar']).toBeUndefined();
  });

  it('converts the panamax image source to service definition image attributes', function () {
    var pmx = '---\nimages:\n- name: foo\n  source: foo/bar\n- name: bar\n  source: baz/quux\n';
    var compose = jsyaml.safeLoad(PMXConverter.convert(pmx));
    expect(compose.foo.image).toBe('foo/bar');
    expect(compose.bar.image).toBe('baz/quux');
  });

  it('does not add attributes to the docker-compose.yml that are not present in the panamax template', function () {
    // image name and source are the only required attributes in a pmx template
    var pmx = '---\nimages:\n- name: foo\n  source: foo/bar\n- name: bar\n  source: baz/quux\n';
    var compose = jsyaml.safeLoad(PMXConverter.convert(pmx));
    expect(compose.foo.ports).toBeUndefined();
    expect(compose.foo.links).toBeUndefined();
    expect(compose.foo.expose).toBeUndefined();
    expect(compose.foo.environment).toBeUndefined();
    expect(compose.foo.volumes).toBeUndefined();
    expect(compose.foo.volumes_from).toBeUndefined();
  });

  it('converts the panamax image ports to service definition port attributes', function () {
    var pmx = '---\nimages:\n- name: foo\n  source: foo/bar\n  ports:\n  - host_interface: 127.0.0.1\n    ' +
              'host_port: "8080"\n    proto: udp\n    container_port: "80"\n  - host_port: "3306"\n    ' +
              'container_port: "3307"\n    proto: tcp\n';
    var compose = jsyaml.safeLoad(PMXConverter.convert(pmx));
    expect(angular.isArray(compose.foo.ports)).toBeTruthy();
    expect(compose.foo.ports).toContain('127.0.0.1:8080:80/udp');
    expect(compose.foo.ports).toContain('3306:3307');
    expect(compose.foo.ports).not.toContain('3306:3307/tcp');
  });

  it('converts the panamax image links to service definition link attributes', function () {
    var pmx = '---\nimages:\n- name: foo\n  source: foo/bar\n  links:\n  - service: bar\n';
    var compose = jsyaml.safeLoad(PMXConverter.convert(pmx));
    expect(angular.isArray(compose.foo.links)).toBeTruthy();
    expect(compose.foo.links).toContain('bar');
  });

  it('converts the panamax image links with aliases to service definition link attributes', function () {
    var pmx = '---\nimages:\n- name: foo\n  source: foo/bar\n  links:\n  - service: bar\n    alias: baz\n';
    var compose = jsyaml.safeLoad(PMXConverter.convert(pmx));
    expect(angular.isArray(compose.foo.links)).toBeTruthy();
    expect(compose.foo.links).toContain('bar:baz');
  });

  it('converts the panamax image exposed ports to service definition expose attributes', function () {
    var pmx = '---\nimages:\n- name: foo\n  source: foo/bar\n  expose:\n  - "3306"\n';
    var compose = jsyaml.safeLoad(PMXConverter.convert(pmx));
    expect(angular.isArray(compose.foo.expose)).toBeTruthy();
    expect(compose.foo.expose).toContain('3306');
  });

  it('converts the panamax image environment to service definition environment attributes', function () {
    var pmx = '---\nimages:\n- name: foo\n  source: foo/bar\n  environment:\n  - variable: ENV_ONE\n    ' +
              'value: env_one_value\n';
    var compose = jsyaml.safeLoad(PMXConverter.convert(pmx));
    expect(angular.isArray(compose.foo.environment)).toBeTruthy();
    expect(compose.foo.environment).toContain('ENV_ONE=env_one_value');
  });

  it('converts the panamax image volumes to service definition volume attributes', function () {
    var pmx = '---\nimages:\n- name: foo\n  source: foo/bar\n  volumes:\n  - host_path: "/host/path"\n    ' +
              'container_path: "/container/path/one"\n  - container_path: "/container/path/two"\n';
    var compose = jsyaml.safeLoad(PMXConverter.convert(pmx));
    expect(angular.isArray(compose.foo.volumes)).toBeTruthy();
    expect(compose.foo.volumes).toContain('/host/path:/container/path/one');
    expect(compose.foo.volumes).toContain('/container/path/two');
  });

  it('converts the panamax image volumes_from to service definition volumes_from attributes', function () {
    var pmx = '---\nimages:\n- name: foo\n  source: foo/bar\n  volumes_from:\n  - "bar"\n';
    var compose = jsyaml.safeLoad(PMXConverter.convert(pmx));
    expect(angular.isArray(compose.foo.volumes_from)).toBeTruthy();
    expect(compose.foo.volumes_from).toContain('bar');
  });


});
