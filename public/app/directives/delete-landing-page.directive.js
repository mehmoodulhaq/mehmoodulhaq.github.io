// delete-landing-page.directive.js

(function() {
    'use strict';
    DeleteLandingPageAfterBootstrap.$inject = [];

    function DeleteLandingPageAfterBootstrap() {
        // Return the directive configuration.
        return ({
            link: link,
            restrict: "C"
        });

        function link(scope, element, attrs) {

            element.children().eq(1).fadeOut();
            setTimeout(function() {
                element.remove();
            }, 200)
        }
    }

    NgEnter.$inject = [];

    function NgEnter() {
        return function(scope, element, attrs) {

            element.bind("keydown keypress", function(event) {
                if (event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngEnter, { 'event': event });
                    });
                    event.preventDefault();
                }
            });
        };
    };

    MyNgInclude.$inject = [];

    function MyNgInclude() {
        return {
            restrict: 'AE',
            templateUrl: function(ele, attrs) {
                // debugger;
                return attrs.myNgInclude;
            }
        };
    }

    ResponsiveImageIsolated.$inject = ['store'];

    function ResponsiveImageIsolated(store) {

        return {
            scope: { respImage: '=' },
            restrict: 'AE',
            link: function(scope, element, attrs) {

                // scope.$watch(function(){

                // },function (){

                // })
                var defaultImage = attrs.respImage || 'assets/images/2.jpg';
                var url;
                scope.$watch(function() {
                        return scope.respImage.images
                    },
                    function(images, old) {

                        url = select(images)

                        if (element.css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '') !== url) {
                            ChangeImage(url)
                        }

                    })
                store.store.subscribe('viewport', function viewport(vp) {
                    ChangeImage(select(scope.respImage.images))
                });

                function select(_images) {
                    var band = store.getViewport().band;
                    var images = _images && _images.length ? _images : [{ url: defaultImage }]

                    var imageUrl = band === 'xs' || band === 'sm' ?
                        2 in images ? images[2].url : 1 in images ? images[1].url : images[0].url :
                        1 in images ? images[1].url : images[0].url;
                    return imageUrl;
                }

                function ChangeImage(url) {

                    // debugger;
                    var _url = element.css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                    if (_url === url || _url.indexOf(url) !== -1) /* same url so*/ return;
                    if (_url === 'none') {
                        // image not present 
                        element
                            .css({ 'background-image': 'url(' + defaultImage + ')' })
                            .animate({ opacity: 1 });

                        if (_url.indexOf(url) === -1) {
                            load(element, url)
                        }

                    } else {
                        // new image
                        load(element, url)
                    }

                    function load(element, url) {
                        if (['Ctrl.getCardByStatus(Ctrl.modals.selectedCard)', 'Ctrl.modals.selectedCard', 'album', 'Ctrl.getCardByStatus(card)'].indexOf(url) != -1) return; // uglify errors hack
                        // new image
                        // using this technique just to avoid latancy of image downloading
                        var img = new Image();
                        img.src = url;
                        img.onload = function() {
                            element.animate({ opacity: 0, height: 0 }, 'slow', function() {

                                $(this)
                                    .css({ 'background-image': 'url(' + url + ')' })
                                    .animate({ opacity: 1, height: '100%' });
                            });
                        }
                    }
                }

                url = select()
                ChangeImage(url)
            }

        }
    }


    nanoScroller.$inject = ['$timeout'];

    function nanoScroller($timeout) {
        return {
            link: function(scope, elem, attrs, ctrl) {
                var tim = $timeout(function() {
                    angular.element('.nano').nanoScroller({ preventPageScrolling: true })
                }, 0);
                scope.$on('$destroy', function() {
                    $timeout.cancel(tim)
                })
            }
        }
    }

    btnPress.$inject = ['$timeout']

    function btnPress($timeout) {
        return {
            restrict: 'AE',
            link: function(scope, element, attrs) {
                var tim;
                element.click(function() {
                    tim = $timeout(function() {
                        angular.element('body').trigger('click');
                        $timeout.cancel(tim)
                    }, 200)

                })
                scope.$on('$destroy', function() {
                    element.off('click')
                })
            }
        }
    }
    angular.module('dashboard')
        .directive('postBootstrapDel', DeleteLandingPageAfterBootstrap)
        .directive('ngEnter', NgEnter)
        .directive('myNgInclude', MyNgInclude)
        .directive('respImage', ResponsiveImageIsolated)
        .directive('nanoScroller', nanoScroller)
        .directive('btnPress', btnPress)



})()