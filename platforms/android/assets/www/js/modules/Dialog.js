var wingsDialogModule = angular.module('wings.mobile.modules.Dialog', [ 'ngCordova' ]);

wingsDialogModule.factory('WingsDialogService', ['$cordovaDialogs','$injector','$timeout','$rootScope','$q',function($cordovaDialogs,$injector,$timeout,$rootScope,$q){
	
    var service = {
        name:name,
        alert:alert,
        confirm:confirm,
        prompt:prompt,
        beep:beep,
        success:success,
        error:error,
        notification:notification,
        confirms:confirms,
        errorHide:errorHide
    };
    return service;
    
    function success () {
    	var $ionicLoading = $injector.get('$ionicLoading');
        $ionicLoading.show({
   	        template : '<div class="loading visible active" style="border-radius: 0;padding:16px;background-color: rgba(101, 232, 86, 0.7);"><span style="vertical-align:super;">Process Completed.<i class="icon ion-checkmark " style="padding-left:5px;"></i></span></div>',
	        noBackdrop: false})
	        $timeout(function() {
	            $ionicLoading.hide();
			}, 1000);
    }
    function error (message) {
    	var $ionicLoading = $injector.get('$ionicLoading');
    	$ionicLoading.show({
    		scope:$rootScope,
            template: '<div class="loading visible active" style="border-radius: 0;padding:16px;background-color: rgba(240, 50, 50, 0.7);" ng-click="hideLoadingProperTimes()"><span style="vertical-align:super;">'+message+'</span></div>',
	        noBackdrop: false});
    	$rootScope.hideLoadingProperTimes = function() {
    	    $ionicLoading.hide();
    	};
   }
    function notification (message) {
        var $ionicLoading = $injector.get('$ionicLoading');
        $ionicLoading.show({
            scope:$rootScope,
            template: '<div class="loading visible active" style="border-radius: 0;padding:16px;background-color: rgba(101, 232, 86, 0.7);" ng-click="hideLoadingProperTimes()"><span style="vertical-align:super;">'+message+'<i class="icon ion-checkmark " style="padding-left:5px;"></i></span></div>',
            noBackdrop: false});
        $rootScope.hideLoadingProperTimes = function() {
            $ionicLoading.hide();
        };
    }
    function errorHide (message) {
        var $ionicLoading = $injector.get('$ionicLoading');
        $ionicLoading.show({
            scope:$rootScope,
            template: '<div class="loading visible active" style="border-radius: 0;padding:16px;background-color: rgba(240, 50, 50, 0.7);"><span style="vertical-align:super;">'+message+'</span></div>',
            noBackdrop: false});
        $timeout(function() {
            $ionicLoading.hide();
        }, 3000);
   }
    function confirms(message,btn1,btn2) {
        var deferred = $q.defer();
        var $ionicLoading = $injector.get('$ionicLoading');
        $ionicLoading.show({
            scope:$rootScope,
            template: '<div class="loading visible active" style="border-radius: 0;padding:16px;background-color:rgb(165, 204, 234);" ng-click="hideLoadingProperTimes()"><span style="vertical-align:super;">'+message+'</span><br><div class="row"><div class="col" align="left"><button class="button button-small " ng-click="hideLoadingProperTimes(1)" style="width:80px;background:#54b0f7">'+btn1+' </button></div><div class="col" align="right"><button class="button button-small " ng-click="hideLoadingProperTimes(2)" style="width:80px;background:#54b0f7">'+btn2+'</button></div></div></div> ',
            noBackdrop: false});
        $rootScope.hideLoadingProperTimes = function(btn) {
            $ionicLoading.hide();
            return deferred.resolve(btn);
          };
          return deferred.promise;
    }; 
    function name(){
    	return "WingsDialogService";
    };
	function alert(message, title, buttonName){
		return $cordovaDialogs.alert(message, title, buttonName);
	};
	function confirm(message, title, buttonArray){
		return $cordovaDialogs.confirm(message, title, buttonArray);
	};
	function prompt(message, title, buttonArray, defaultText){
		return $cordovaDialogs.prompt(message, title, buttonArray, defaultText);
	};
	function beep(beepCount){
		 $cordovaDialogs.beep(beepCount);
	};

}]);