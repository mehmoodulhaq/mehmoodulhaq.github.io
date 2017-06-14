(function() {
    'use strict';
    AppController.$inject = ['$scope', '$rootScope']

    function AppController($scope, $rootScope) {
        var _this = this;
    };

    angular.module('dashboard').controller('appController', AppController);

})();