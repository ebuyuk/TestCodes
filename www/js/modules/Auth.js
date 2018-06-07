var authModule = angular.module('wings.mobile.modules.Auth',[]);
authModule.factory('WingsAuthService',WingsAuthService);
WingsAuthService.$inject = ['$rootScope', 'WingsRemoteDbService','WingsSessionManager','WingsGlobalManager','$q','WingsTransactionDBService','md5'];

function WingsAuthService($rootScope,WingsRemoteDbService,WingsSessionManager,WingsGlobalManager,$q,WingsTransactionDBService,md5) {
    var servisName="WingsAuthService";
    var WingsQRef=$q;
    var service = {
            Login:Login,
            name:name,
            fetchRolePrograms:fetchRolePrograms
        };
    return service;

    function name(){
        return servisName;
    };
    function splitArray (items,chunk_size) {
        var chunks = [];
          if (angular.isArray(items)) {
            if (isNaN(chunk_size))
              chunk_size = 4;
            for (var i = 0; i < items.length; i += chunk_size) {
              chunks.push(items.slice(i, i + chunk_size));
            }
          } else {
            console.log("items is not an array: " + angular.toJson(items));
          }
          return chunks;
    };
    function fetchRolePrograms (roleId){
        var deferred = WingsQRef.defer();
        var sqlRolePrograms = "Select * From Sy_Role_Programs where Role_Id = ? and Active='Y' Order by Program_Level";
        WingsTransactionDBService.executeSql(sqlRolePrograms,[roleId]).then(function (result) {
        	var dataInMenu = [];
        	for (i in result) {
        		var obj = {
                        'PROGRAM_ID' : result[i].PROGRAM_ID,
                        'PROGRAM_TITLE' : result[i].TITLE
                };
        		dataInMenu.push(obj);
        	}
                WingsSessionManager.resetRoleProgram();
                //var jsonObj = angular.fromJson(dataInMenu);
                var arrayLength = dataInMenu.length;
                for (var i = 0; i < arrayLength; i++) {
                    WingsSessionManager.addProgram(new MenuItem(dataInMenu[i].PROGRAM_TITLE,dataInMenu[i].PROGRAM_ID,dataInMenu[i].PROGRAM_TITLE,1));
                }
                if (window.screen.width < 767) {
                    WingsGlobalManager.SetRolePrograms(splitArray (WingsSessionManager.getPrograms(),3));
                } else {
                    WingsGlobalManager.SetRolePrograms(splitArray (WingsSessionManager.getPrograms(),5));
                }
                return deferred.resolve("GOHEAD");
            }, 
            function (error) {
                return deferred.reject("fetchRolePrograms-Error : " +JSON.stringify(error));
            }
        );
        return deferred.promise;
    };
    function executeLogin(username, password,passwordUppercaseHash){
        var deferred = $q.defer();
        var criteria ={
                selector: {'Table_Name': 'SY_USERS',
                          'Data.USER_ID' : username,
                          $or: [ { 'Data.PASSWORD_HASH': { $eq: password.toUpperCase() } },{ 'Data.PASSWORD_HASH': { $eq: passwordUppercaseHash.toUpperCase() } } ]},
            fields: ['Table_Name','Record_Id','Data']
      };
        findDocuments(criteria).then(function (result) {
            console.log("**********************************findDocument result : " +JSON.stringify(result));
            if (result.docs.length > 0) {
                return deferred.resolve(result.docs[0].Data);
            }
            return deferred.resolve(null);

          }).catch(function (err) {
            // ouch, an error
               console.log("**********************************findDocument err : " +JSON.stringify(err));
               return deferred.reject(err);
          });
        return  deferred.promise;
     }
    function Login (userId, password, callback) {
        var deferred = WingsQRef.defer();
        var response;
        var sql = "Select * From Sy_Users where User_Id = ? And (Password_Hash = ? Or Password_Hash = ?)";
        WingsTransactionDBService.executeSql(sql,[angular.uppercase(userId),angular.uppercase(md5.createHash(password)),angular.uppercase(md5.createHash(password.toUpperCase()))]).then(function (dataIn) {
                initialState = false;
                authorized=true;
                var rows = dataIn[0];
                var roleId = null;
                var userNumber = null;
                var userBadge = null;
                var userName = null;
                var divNo = null;
                if(!_.isEmpty(rows)){
                    response = { success: true, dataFrom: rows ,columns :null};
                    roleId = rows.PDA_ROLE_ID;
                    userNumber = rows.USER_NUMBER;
                    userBadge  = rows.USER_BADGE;
                    userName = rows.USER_NAME;
                    divNo = rows.DIV_NO;
                    var sqlUserRoles = "Select a.*,b.Description From Sy_User_Roles a ,Sy_Roles b where a.User_Id = ? And a.Active='Y' And b.Role_Id = a.Role_Id";
                    WingsTransactionDBService.executeSql(sqlUserRoles,[angular.uppercase(userId)]).then(function (dataInMenu) {
                            if (!_.isEmpty(dataInMenu)){
                                var arrayLength = dataInMenu.length;
                                WingsSessionManager.reset();
                                for (var i = 0; i < arrayLength; i++) {
                                    WingsSessionManager.addRole(new RoleItem(dataInMenu[i].ROLE_ID,dataInMenu[i].DESCRIPTION));
                                }
                                var userInfo           = {};
                                userInfo.divNo         = divNo;
                                userInfo.userId        = userId;
                                userInfo.userNumber    = userNumber;
                                userInfo.userBadge     = userBadge;
                                userInfo.userName      = angular.uppercase(userName);
                                userInfo.defaultRoleId = roleId;
                                userInfo.roleList      = WingsSessionManager.getRoles();
                                WingsGlobalManager.SetCredentials (userInfo);
                                fetchRolePrograms(roleId).then(
                                    function(success){
                                        return deferred.resolve(response);
                                    },
                                    function(error){
                                        return deferred.reject("Login-fetchRolePrograms-Error : " +JSON.stringify(error));
                                    }
                                );
                            } 
                            else {
                                return deferred.reject("There is no role for this users !");
                            }
                        },
                        function (error) {
                            return deferred.reject("Login-Error : " +JSON.stringify(error));
                        }
                    );
                }
                else {
                    response = { success: false, message: 'Username or password is incorrect' };
                    return deferred.resolve(response);
                }
            }, 
            function (error) {
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            }
        );
        return deferred.promise;
    }
};