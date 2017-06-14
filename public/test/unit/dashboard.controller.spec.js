describe('dashboard app', function () {

  beforeEach(module('dashboard'));

  var $controller;

  beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));

  describe('dashboardController', function () {
		it('Controller should be defined', function () {
			var $scope = {};
			var controller = $controller('dashboardController', { $scope: $scope });
			
			expect(controller).toBeDefined();
		});	
	});

});