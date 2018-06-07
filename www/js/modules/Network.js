var wingsNetworkModule = angular.module('wings.mobile.modules.Network', [ 'ngCordova' ]);


wingsNetworkModule.factory('WingsNetworkService', ['$rootScope','$cordovaNetwork','WingsGlobalManager','WingsDialogService', 
                                                   function( $rootScope, $cordovaNetwork,WingsGlobalManager,WingsDialogService){

    var service = {
    	init:init
       
    };
    return service;
       
    function init(){
    	
    	
    	WingsGlobalManager.setDeviceInfoConnectionType($cordovaNetwork.getNetwork());
    	WingsGlobalManager.setDeviceInfoOnlineOffLineStatus($cordovaNetwork.isOnline());

    	// listen for Online event
        /*$rootScope.$on('$cordovaNetwork:online', function(event, networkState){
          var onlineState = networkState;
          console.log("#########################WNetworkModule- onlineState : " +onlineState);
          WingsGlobalManager.setDeviceInfoConnectionType(onlineState);
          WingsGlobalManager.setDeviceInfoOnlineOffLineStatus(true);
        });

        // listen for Offline event
        $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
          var offlineState = networkState;
          console.log("#########################WNetworkModule - offlineState : " +offlineState);
          WingsGlobalManager.setDeviceInfoConnectionType(offlineState);
          WingsGlobalManager.setDeviceInfoOnlineOffLineStatus(false);
        });*/
        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
            // always see what happens in your app!
           // console.debug('stateChangeStart from: ' + (fromState && fromState.name) + ' to: ' + toState.name);
            // handle auth here as well, check whether user is allowed to go to this state, abort if not
        });

         $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            // see what happens in your app!
           // console.debug('stateChangeSuccess from: ' + (fromState && fromState.name) + ' to: ' + toState.name);
            /*
            if(_.startsWith(fromState.name, 'app.') && toState.name == 'signin'){
            	 console.debug('I need to reload');
            	document.location.href = 'index.html';
            }
            */
            
         });
         $rootScope.$on('$stateNotFound',function(event, unfoundState, fromState, fromParams){
        	 // console.log('$stateNotFound '+unfoundState.to+'  - fired when a state cannot be found by its name.');
        	  
        	  WingsDialogService.alert('$stateNotFound '+unfoundState.to+'  - fired when a state cannot be found by its name.', 'Error-UNIMPLEMENTED PROGRAM', 'OK');
        	 // console.log(unfoundState, fromState, fromParams);
    	 });


        // log stateChangeErrors
        /*
         $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
            var msg ='Error on StateChange from: "' + (fromState && fromState.name) + '" to:  "'+ toState.name + '", err:' + error.message + ", code: " + error.status;
        	alert(msg);
            
            var wingsLoggingService = $injector.get('WingsLoggingService');
		    wingsLoggingService.log("STATE CHANGE ERROR : "+JSON.stringify(msg));
            $state.go('home');
            
         });
         */
        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {

            throw error;

        });

    };
    

}]);