var wingsRemoteDbModule = angular.module('wings.mobile.modules.RemoteDb', [ 'ngCordova' ]);

wingsRemoteDbModule.factory('WingsRemoteDbService', ['Restangular','WINGS_CONFIG','WingsGlobalManager','WingsDialogService','$q','WingsUtil','$http','$rootScope', function(Restangular,WINGS_CONFIG,WingsGlobalManager,WingsDialogService,$q,WingsUtil,$http,$rootScope){

    // this is service object with list of methods in it this object will be used by controller
    var service = {
		insertLog:insertLog,
        executeQuery:executeQuery,
        executeLogin:executeLogin,
        executeFunction:executeFunction,
        fetchUserRoles:fetchUserRoles,
        fetchRolePrograms:fetchRolePrograms,
        HandleFeedback:HandleFeedback,
        name:name,
        synch:synch
    };
    function name(){
    	return "WingsRemoteDbService";
    }
    function insertLog(logText){
    	var user = WingsGlobalManager.getCurrentUser();
     	return Restangular.all(WINGS_CONFIG.INSERT_LOG).post(JSON.stringify(user)+" : "+logText);
     }
    function executeQuery(sql){
    	$http({
  		  method: 'GET',
  		  url: WINGS_CONFIG.WINGS_ASSETS_REMOTE_UPDATE_LINK,
  		  timeout:300,
  		  data:"wingsPing"
  		}).then(function successCallback(response) {
  		    // this callback will be called asynchronously
  		    // when the response is available
  		  }, function errorCallback(response) {
  			$rootScope.canceler.resolve();
  		    // called asynchronously if an error occurs
  		    // or server returns response with an error status.
  		  });
    	return Restangular.all(WINGS_CONFIG.GENERIC_QUERY).post(sql);
    }
    function executeFunction(sql,responseObject){
    	$http({
    		  method: 'GET',
    		  url: WINGS_CONFIG.WINGS_ASSETS_REMOTE_UPDATE_LINK,
    		  timeout:300,
    		  data:"wingsPing"
    		}).then(function successCallback(response) {
    		    // this callback will be called asynchronously
    		    // when the response is available
    		  }, function errorCallback(response) {
    			$rootScope.canceler.resolve();
    		    // called asynchronously if an error occurs
    		    // or server returns response with an error status.
    		  });
        var deferred = $q.defer();
        if (responseObject != null) {
            var sqlText = JSON.parse(sql);
            if (sqlText.length == 1){
                sqlText[0].confirmations = responseObject;
                sql = JSON.stringify(sqlText);                
            }
        }
        var result = Restangular.all(WINGS_CONFIG.EXECUTE_FUNCTION).post(sql);
        result.then(function (dataIn) {
            var data = JSON.parse(dataIn[0]);
            var confirmationText = data.confirmationText;
            if (!WingsUtil.IsNull(confirmationText)){
                var confirmations = confirmationText.split(/\r?\n/);
                var confirmationsObject = [];
                for (var i = 0; i < confirmations.length; i++) {
                    if (confirmations[i] != '') {
                        var object = {
                           index : parseInt(confirmations[i].substring(0,100)),
                           id : confirmations[i].substring(100,103),
                           enabled : confirmations[i].substring(103,104) == "Y" ? true : false,
                           parentId : parseInt(confirmations[i].substring(104,107)),
                           parentResponse : confirmations[i].substring(107,108),
                           response : confirmations[i].substring(108,109),
                           text : confirmations[i].substring(109)
                        }
                        confirmationsObject.push(object);
                    }
                }
                var isConfirmationAsked = false;
                var promises = [];
                for (var i = 0; i < confirmationsObject.length; i++) {
                	if (confirmationsObject[i].enabled) {
                		promises.push(WingsDialogService.confirm(confirmationsObject[i].text, 'Confirm', 'Ok,Cancel'));
                	}
                }
                if (promises.length > 0) {
	                $q.all(promises).then(function(res) {
	                    var confirmationsObject = [];
	                    for (var i = 0; i < res.length; i++) {
	                        if (confirmations[i] != '') {
	                            var object = {
	                               index : confirmations[i].substring(0,100),
	                               id : confirmations[i].substring(100,103),
	                               enabled : confirmations[i].substring(103,104),
	                               parentId : confirmations[i].substring(104,107),
	                               parentResponse : confirmations[i].substring(107,108),
	                               response : res[i]==1?'Y':'N',
	                               text : confirmations[i].substring(109)
	                            }
	                            confirmationsObject.push(object);
	                        }
	                    }
	                    if (confirmationsObject.length > 0) {
	                    	executeFunction(sql,confirmationsObject).then(function(res) {
	                    		return deferred.resolve(res);
	                    	},function(error) {
                                console.log("Second Execute Function Error :"+JSON.stringify(error));
	                    		return deferred.reject("Execute Function Error : " +JSON.stringify(error));
	                    	});
	                    } else {
	                		return deferred.resolve("OKAY");
	                    }
	                },function(error) {
                        console.log("PROMISES  - ERROR"+JSON.stringify(error));
	                    return deferred.reject("Execute Function Error : " +JSON.stringify(error));
	                  });
                } else {
                    return deferred.resolve(dataIn);
                }
            } else {
                return deferred.resolve(dataIn);
            }
        },function (error) {
            console.log("Third Execute Function Error :"+JSON.stringify(error));
            return deferred.reject("Execute Function Error : " +JSON.stringify(error));
        });
        return deferred.promise;
    };

    function HandleFeedback(data){
    	if (data.isSuccess === 'false') {
    		WingsDialogService.error('Operation Failed!');
    	}
    	if (data.errorText != '') {
    		WingsDialogService.error(data.errorText.replace(/\\n/g, "</br>"));
    	}
    	else if (data.notificationText != '') {
    		//WingsDialogService.prompt(data.notificationText, 'Notification', 'Ok','');
    		WingsDialogService.notification(data.notificationText);
    	}
//    	else if (data.confirmationText != '') {
//    		WingsDialogService.alert(data.confirmationText, 'Confirm', 'Ok');
//    	}
    	else {
    		WingsDialogService.success();
    	}
    }

    function executeLogin(username, password){
    	var sql ="select t.User_Name, t.role_id,t.user_number,t.user_id from SY_USERS t where t.user_id='"+username+"'";
    	//insertLog("[executeLogin] :  executeQuery : " +sql);
    	//alert("WINGS_CONFIG.GENERIC_QUERY : "+WINGS_CONFIG.GENERIC_QUERY);
     	return Restangular.all(WINGS_CONFIG.GENERIC_QUERY).post(sql);
    }
    
    function fetchUserRoles(username){
    	
    	var sql =//"select role_id,id from sy_user_roles where user_id = '"+username+"' and role_id like 'W-%'";
    	 "Select a.Role_Id," +
		 "       b.Description       " +  
         "  From Sy_User_Roles a," +
         "       Sy_Roles b " +
         " Where b.Role_Id = a.Role_Id" +
         "   And User_Id = '"+username+"'" +
         "   And Platform = 'WEB'";

        // Restangular.one('examples', exampleId).get();
    	//insertLog("[fetchUserRoles] executeQuery : " +sql);
     	return Restangular.all(WINGS_CONFIG.GENERIC_QUERY).post(sql);
     }
    
function fetchUserRoles(username){
    	
    	var sql =//"select role_id,id from sy_user_roles where user_id = '"+username+"' and role_id like 'W-%'";
    	 "Select a.Role_Id," +
		 "       b.Description       " +  
         "  From Sy_User_Roles a," +
         "       Sy_Roles b " +
         " Where b.Role_Id = a.Role_Id" +
         "   And User_Id = '"+username+"'" +
         "   And Platform = 'WEB'";

        // Restangular.one('examples', exampleId).get();
    	//insertLog("************************ executeQuery : " +sql);
     	return Restangular.all(WINGS_CONFIG.GENERIC_QUERY).post(sql);
     }
function synch(sql){
    //insertLog("************************ executeQuery : " +sql);
    return Restangular.all(WINGS_CONFIG.SYNC_URL).post(sql);
   }
function fetchRolePrograms(roleId){
	
	var sql =//"select role_id,id from sy_user_roles where user_id = '"+username+"' and role_id like 'W-%'";
		"Select a.Program_Id, " +
        "       a.Title,      " +
        "       b.Program_Name, " +
        "       b.Type, " +
        "       Decode(a.Level4,0,0,1) +  " +
        "       Decode(a.Level3,0,0,1) +  " +
        "       Decode(a.Level2,0,0,1) +  " +
        "       Decode(a.Level1,0,0,1) Lvl  " +
        "  From Sy_Role_Programs a, " +
        "       Sy_Programs      b " +
        " Where a.Role_Id = '"+roleId+"' " +
        "   And Exists (Select 1 " +
        "                 From Sy_Role_Programs x " +
        "                Where x.Role_Id = a.Role_Id " +
        "   	             And x.Level1  = a.Level1 " +
        "   	             And x.Level2  = 0 " +
        "   	             And x.Level3  = 0 " +
        "   	             And x.Level4  = 0) " +
        "   And b.Program_Id (+)= a.Program_Id " +
        " Order By a.Level1, a.Level2, a.Level3, a.Level4 ";

    // Restangular.one('examples', exampleId).get();
	//insertLog("************************ executeQuery : " +sql);
 	return Restangular.all(WINGS_CONFIG.GENERIC_QUERY).post(sql);
 }
    
    return service;

}]);
