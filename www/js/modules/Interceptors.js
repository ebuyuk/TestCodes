var wingsInterceptorsModule = angular.module('wings.mobile.modules.Interceptors', [ 'ngCordova' ]);


wingsInterceptorsModule.factory('WingsHttpRequestResponseInterceptor', ['$q', '$rootScope','$location','WingsDialogService','$injector','WINGS_CONFIG',
    function ($q, $rootScope, $location,WingsDialogService,$injector,WINGS_CONFIG) {
        return {
            request: function (config) {
      			console.log("int req");
      			$rootScope.canceler = $q.defer();
      			if (config.data != "wingsPing" && config.timeout == undefined) {
      				config.timeout = $rootScope.canceler.promise;
      			}
            	config.headers['userId'] = $rootScope.globals.currentUser.userId;//"USER-FROM -JS";
                var stateRef = $injector.get('$state');
                if(stateRef.current){
                    config.headers['programId'] = JSON.stringify(stateRef.current.name);
                }
                config.headers['divNo']='1';
                //$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode('admin' + ':' + 'abc12345');

                config.headers['Authorization']=WINGS_CONFIG.BASIC_AUTHENTICATION;
                config.headers['uuid']=$rootScope.globals.deviceInformation.uuid;
                config.headers['deviceName']=JSON.stringify($rootScope.globals.deviceInformation.device);
                config.headers['role']=$rootScope.globals.currentUser.defaultRoleId;
            	$rootScope.$broadcast('loading:show');
                return config || $q.when(config);
            },
            requestError: function(request){
      			console.log("int req err");

            	//alert("requestError");
                $rootScope.$broadcast('loading:hide');
                WingsDialogService.alert(JSON.stringify(request), 'Requested Error', 'Ok');
                return $q.reject(request);
            },
            response: function (response) {
      			console.log("int res");

            	$rootScope.$broadcast('loading:hide');
            	//console.log("Response SUCCESS : " + JSON.stringify(response));
                return response || $q.when(response);
            },
            responseError: function (response) {
      			console.log("int res err");
            	$rootScope.$broadcast('loading:hide');
		    	 // alert("Server side error ");
            	console.log("Response ERROR : " + JSON.stringify(response));
            	//WingsDialogService.alert("Connection could not be established.Please check configuration ip and port.", 'Connection Error', 'OK');
                /*if (response && response.status == 404) {
                	WingsDialogService.alert(JSON.stringify(response), 'Requested content not available - '+response.status, 'Ok');
                }else if (response && response.status == 408) {
                	WingsDialogService.alert(JSON.stringify(response), 'Request Timeout - '+response.status, 'Ok');
                }else if (response && response.status >= 500) {
                	WingsDialogService.alert(JSON.stringify(response), 'Remote Server Internal Error - '+response.status, 'Ok');
                }else{
                	WingsDialogService.alert(JSON.stringify(response), 'Connection Problem -  '+response.status, 'Ok');
                }*/
                return $q.reject(response);
            }
        };
}]);