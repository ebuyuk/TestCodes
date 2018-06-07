var wingsSetupDBModule = angular.module('wings.mobile.modules.SetupDB', [ 'ngCordova' ]);

wingsSetupDBModule.factory('WingsSetupDBService', ['$cordovaSQLite','$q','$rootScope', function($cordovaSQLite,$q,$rootScope){
   
    var service = {
    		executeSql:executeSql,
    		executeLogin:executeLogin,
    		fetchUserRoles:fetchUserRoles,
    		fetchRolePrograms:fetchRolePrograms,
    		openDB:openDB
    };
    function openDB(){
    	WingsSetupDB = $cordovaSQLite.openDB($rootScope.globals.wingsSetupDB.sqlliteOpenOptions);
    }
    function executeSql(query,paramsArr){
    	var deferred = $q.defer();
    	
    	if(angular.isUndefined(paramsArr)){
    		paramsArr = [];
    	}
    	
    	$cordovaSQLite.execute(WingsSetupDB, query, paramsArr).then(function(response) {
    		var results = [];
            if(response.rows.length > 0) {
                for(var i = 0; i < response.rows.length; i++) {
                    results.push(response.rows.item(i));
                }
                return deferred.resolve(results);
            } else {
                console.log("*No results found");
                return deferred.resolve(results);
            }
        }, function (err) {
            var errObj = {};
            errObj.message=JSON.stringify(err);
            return deferred.reject(errObj);
        });
    	
    	return  deferred.promise;
    };
    
    function executeLogin(username, password){
    	var sql =" Select user_name,        " +
    			 "        company_number,   " +
    			 "        pda_role_id,       " +
    			 "        user_number       " +
    			 "   From SY_USERS          " +
    			 "  Where user_id = ?       " +
    			 "    And password_hash = ? ";
	    var deferred = $q.defer();
        var paramsArr = [username, password];

    	$cordovaSQLite.execute(WingsSetupDB, sql, paramsArr).then(function(response) {
    		var results = [];
            if(response.rows.length > 0) {
                for(var i = 0; i < response.rows.length; i++) {
                    //console.log("***********************SELECTED -> " + JSON.stringify(response.rows.item(i)));
                    results.push(response.rows.item(i));
                }
                return deferred.resolve(results);
            } else {
                console.log("***************** executeLogin No results found");
                return deferred.resolve(results);
            }
        }, function (err) {
            console.error("*********************** executeLogin Error : " + JSON.stringify(err));
           // return deferred.reject(JSON.stringify(err));
            var errObj = {};
            errObj.message=JSON.stringify(err);
            return deferred.reject(errObj);
        });
    	
    	return  deferred.promise;
     }
    
    function fetchUserRoles(userId){
    	var deferred = $q.defer();
        var paramsArr = [userId];
        var sql = "Select distinct role_id,     " +
        		  "       role_title            " +
        		  " From sy_user_role_programs  " +
        		  "Where user_id = ?            ";
        $cordovaSQLite.execute(WingsSetupDB, sql, paramsArr).then(function(response) {
    		var results = [];
            if(response.rows.length > 0) {
                for(var i = 0; i < response.rows.length; i++) {
                	console.log("***********************executeLogin SELECTED -> " + JSON.stringify(response.rows.item(i)));
                    results.push(response.rows.item(i));
                }
                return deferred.resolve(results);
            } else {
                console.log("***********************fetchUserRoles No results found");
                return deferred.resolve(results);
            }
        }, function (err) {
            console.error("***********************fetchUserRoles Error : " + JSON.stringify(err));
           // return deferred.reject(JSON.stringify(err));
            var errObj = {};
            errObj.message=JSON.stringify(err);
            return deferred.reject(errObj);
        });
    	return  deferred.promise;

     }
    
    function fetchRolePrograms(roleId){
    	var deferred = $q.defer();
        var paramsArr = [roleId];
        var sql = " Select program_Id,          " +
        		  "        program_title        " +
        		  "  From sy_user_role_programs " +
        		  " Where role_id = ?           ";
        
        $cordovaSQLite.execute(WingsSetupDB, sql, paramsArr).then(function(response) {
    		var results = [];
            if(response.rows.length > 0) {
                for(var i = 0; i < response.rows.length; i++) {
                    results.push(response.rows.item(i));
                }
                return deferred.resolve(results);
            } else {
                console.log("********************fetchRolePrograms ***No results found");
                return deferred.resolve(results);
            }
        }, function (err) {
            console.error("***********************fetchRolePrograms Error : " + JSON.stringify(err));
            var errObj = {};
            errObj.message=JSON.stringify(err);
            return deferred.reject(errObj);
        });
    	return  deferred.promise;
     }
    
    return service;

}]);