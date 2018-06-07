var wingsConfigurationDBModule = angular.module('wings.mobile.modules.ConfigurationDB', [ 'ngCordova' ]);

wingsConfigurationDBModule.factory('WingsConfigurationDBService', ['$cordovaSQLite','$q', function($cordovaSQLite,$q){

   
    var service = {
    		executeSql:executeSql,
    		GetFirstItem:GetFirstItem
    };
    function GetFirstItem(query,paramsArr){
    	var deferred = $q.defer();
    	
    	if(angular.isUndefined(paramsArr)){
    		paramsArr = [];
    	}
    	
    	$cordovaSQLite.execute(WingsConfigurationDB, query, paramsArr).then(function(response) {
    		var results = [];
            if(response.rows.length > 0) {
            	return deferred.resolve(response.rows.item(0));
            } else {
                console.log("[GetFirstItem] : No results found");
                return deferred.reject(results);
            }
        }, function (err) {
            console.error("***********************Error : " + JSON.stringify(err));
            var errObj = {};
            errObj.message=JSON.stringify(err);
            return deferred.reject(errObj);
        });
    	
    	return  deferred.promise;
    };
    function executeSql(query,paramsArr){
    	var deferred = $q.defer();
    	
    	if(angular.isUndefined(paramsArr)){
    		paramsArr = [];
    	}
    	
    	$cordovaSQLite.execute(WingsConfigurationDB, query, paramsArr).then(function(response) {
    		var results = [];
            if(response.rows.length > 0) {
                for(var i = 0; i < response.rows.length; i++) {
                    //console.log("***********************SELECTED -> " + JSON.stringify(response.rows.item(i)));
                    results.push(response.rows.item(i));
                }
                return deferred.resolve(results);
            } else {
                console.log("***********************No results found");
                return deferred.resolve(results);
            }
        }, function (err) {
            console.error("***********************Error : " + JSON.stringify(err));
           // return deferred.reject(JSON.stringify(err));
            var errObj = {};
            errObj.message=JSON.stringify(err);
            return deferred.reject(errObj);
        });
    	
    	return  deferred.promise;
    };

    return service;

}]);