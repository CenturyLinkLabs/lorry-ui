'use strict';

describe('Service: userAgent', function () {

  var userAgent,
      win;

  beforeEach(function() {
    module('lorryApp');
  });

  function injectAgent(agent) {
    module(function($provide) {
      $provide.factory('$window', function() {
        return { navigator: { userAgent: agent} };
      });
    });

    inject(function (_userAgent_, _$window_) {
      userAgent = _userAgent_;
      win = _$window_;
    });
  }

  describe('isMobile', function() {
    it('returns false for a desktop chrome browser', function() {
      injectAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36');
      expect(userAgent.isMobile()).toEqual(false);
    });

    it('returns true for a webOS browser', function() {
      injectAgent('bla bla webOS bla');
      expect(userAgent.isMobile()).toEqual(true);
    });

    it('returns true for an iphone', function() {
      injectAgent('Opera/9.80 (iPhone; Opera Mini/7.0.4/28.2555; U; fr) Presto/2.8.119 Version/11.10');
      expect(userAgent.isMobile()).toEqual(true);
    });

    it('returns true for an ipad', function() {
      injectAgent('Opera/9.80 (iPad; Opera Mini/7.1.32694/27.1407; U; en) Presto/2.8.119 Version/11.10');
      expect(userAgent.isMobile()).toEqual(true);
    });

    it('returns true for an android device', function() {
      injectAgent('Opera/9.80 (Android; Opera Mini/7.6.35766/35.5706; U; en) Presto/2.8.119 Version/11.10');
      expect(userAgent.isMobile()).toEqual(true);
    });

    it('returns true for a BlackBerry device', function() {
      injectAgent('Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.1.0.346 Mobile Safari/534.11+');
      expect(userAgent.isMobile()).toEqual(true);
    });

    it('returns true for an IEMobile device', function() {
      injectAgent('Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)');
      expect(userAgent.isMobile()).toEqual(true);
    });
  });
});
