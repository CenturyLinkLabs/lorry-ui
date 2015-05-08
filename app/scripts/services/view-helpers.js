(function () {
  'use strict';

  angular
    .module('lorryApp')
    .factory('viewHelpers', viewHelpers);

  viewHelpers.$inject = ['$window'];

  function viewHelpers($window) {
    return {
      animatedScrollTo: function(el) {
        $window.$('html, body').animate({
          scrollTop: el.offset().top - 10
        }, 500);
      },
      animateLogo: function() {
        var audioElement = $window.document.createElement('audio');
        audioElement.setAttribute('src', 'images/honk.mp3');

        var logo = $window.$('#lorryLogo');
        // animate
        logo.animate({
            left: $window.innerWidth,
            opacity: '0.85'
          }, 9000, 'swing');
        // play audio
        audioElement.play();
        setTimeout(function(){
          audioElement.play();
        }, 4000);
        // animate
        logo.animate({left: '-130px', opacity: '0'}, 1)
            .animate({left: '0', opacity: '1'}, 3000);
      }
    };
  }
})();
