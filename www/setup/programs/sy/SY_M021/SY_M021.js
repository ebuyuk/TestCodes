angular.module('WingsMobileStarter').controller('SY_M021', [
        '$scope',
        'WingsUtil',
        'WingsAuthService',
        '$ionicHistory',
        '$ionicLoading',
        'WingsPouchDbSetupService',
        'md5',
        'WingsDialogService',
        '$timeout',
        function($scope,WingsUtil,WingsAuthService,$ionicHistory,$ionicLoading,WingsPouchDbSetupService,md5,WingsDialogService,$timeout) {
            console.log('SY_M021');
            $scope.user = {
            		username:'',
            		password:''
            };
            $scope.cancel= function () {
    			$ionicHistory.goBack();
            };
            $scope.signin = function () {
            	$ionicLoading.show({
                    noBackdrop: true,
                    template: '<ion-spinner icon="bubbles"/>'
                });
                WingsPouchDbSetupService.executeLogin(angular.uppercase($scope.user.username),md5.createHash($scope.user.password),md5.createHash($scope.user.password.toUpperCase())).then(function (response) {
            		$ionicLoading.hide();
            		if (!WingsUtil.IsNull(response)) {
            			$rootScope.$broadcast('DigitalSignFeedback', { success: true });
            			$ionicHistory.goBack();
            		} else {
            			WingsDialogService.alert("Invalid username or Password !", 'Error', 'OK');
            		}
            	}, function (error) {
                    $ionicLoading.hide();
        			WingsDialogService.alert("Invalid username or Password !", 'Error', 'OK');
            	});
            };
        } 
])