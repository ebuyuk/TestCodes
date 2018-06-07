var wingsLoggingModule = angular.module('wings.mobile.modules.Logging', [ 'ngCordova' ]);

wingsLoggingModule.factory('WingsLoggingService', ['$cordovaDevice','WingsGlobalManager','WINGS_CONFIG','$ionicPlatform', function( $cordovaDevice,WingsGlobalManager,WINGS_CONFIG,$ionicPlatform){

    var service = {
    	log:log,
    	name:name
    };
    return service;
    
    function name(){
    	return "WingsLoggingService";
    };
    
    function log(logText){
    	$ionicPlatform.ready(function() {
	    	var response;
	    	var userName =WingsGlobalManager.getCurrentUser().username;
	    	var logObj = {
	    			userName :userName,
	    			ip:WingsGlobalManager.getClientIp(),
	    			deviceInfo :WingsGlobalManager.getDeviceInformation(),
	    			text:logText
	    	};
/*
	    	$.ajax({
	 			type : "POST",
	 			url : "http://192.168.1.5:8555/WingsMobileMediator/webresources/clientlog/insert",
	 			contentType : "application/json",
	 			data : angular.toJson({
	 				//url : $window.location.href,
	 				message : JSON.stringify(logObj),
	 				type : "exception"
	 				//stackTrace : stackTrace,
	 				//cause : (cause || "")
	 			})
	 		});
    	 */
    	 });
    };

}]);