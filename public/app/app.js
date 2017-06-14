(function() {
    'use strict';
    // main module
    angular.module('dashboard', [
            'ui.router', 'ngAnimate', 'redux.module'
        ])
        // start and load the angular and us dashboard as root module

    angular.element(document).ready(function() {

        /*
         * Intentionally using setTimeout to show the first loading page
         */

        angular.bootstrap(document, ['dashboard'], {

        });

    });

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function config($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('dashboard', {
                url: '/',
                templateUrl: '../app/templates/dashboard_layout.html',
                controller: 'dashboardController as Ctrl'
            })


    }
    angular.module('dashboard').config(config);

})();