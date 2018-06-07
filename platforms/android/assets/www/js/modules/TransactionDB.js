var wingsTransactionDBModule = angular.module('wings.mobile.modules.TransactionDB', [ 'ngCordova' ]);

wingsTransactionDBModule.factory('WingsTransactionDBService', ['$cordovaSQLite','$q','$rootScope', function($cordovaSQLite,$q,$rootScope){

   
    var service = {
            executeSql:executeSql,
            openDB:openDB,
            closeDB:closeDB,
            insertCollection : insertCollection,
            executeLogin     : executeLogin
    };
    
    function openDB(func){
        WingsTransactionDB = $cordovaSQLite.openDB($rootScope.globals.wingsTransactionDB.sqlliteOpenOptions,func,function () {
        	console.log('TRANSACTION DB OPENING ERROR')
        });
    };
    function closeDB(a,b){
        if (WingsTransactionDB != null) {
            WingsTransactionDB.close(a,b);
        } else {
            deleteDB(a,b);
        }
    };
    function deleteDB(a,b){
        window.sqlitePlugin.deleteDatabase({name: $rootScope.globals.wingsTransactionDB.name, location: 'default'}, a, b);
    };
    
    function insertCollection (query,bindings){
        return $cordovaSQLite.insertCollection (WingsTransactionDB,query,bindings);
    };

    function executeSql(query,paramsArr){
        var deferred = $q.defer();
        
        if(angular.isUndefined(paramsArr)){
            paramsArr = [];
        }
        
        $cordovaSQLite.execute(WingsTransactionDB, query, paramsArr).then(function(response) {
            var results = [];
            if(response.rows.length > 0) {
                for(var i = 0; i < response.rows.length; i++) {
                    //console.log("***********************SELECTED -> " + JSON.stringify(response.rows.item(i)));
                    results.push(response.rows.item(i));
                }
                return deferred.resolve(results);
            } else {
                return deferred.resolve(results);
            }
        }, function (err) {
            console.error("Error : " + JSON.stringify(err));
           // return deferred.reject(JSON.stringify(err));
            var errObj = {};
            errObj.message=JSON.stringify(err);
            return deferred.reject(errObj);
        });
        
        return  deferred.promise;
    };
    function executeLogin(userId, password,passwordUppercaseHash) {
        var deferred = $q.defer();
        var sql = "Select * From Sy_Users where User_Id = ? And (Password_Hash = ? Or Password_Hash = ?)";
        executeSql(sql,[angular.uppercase(userId),angular.uppercase(md5.createHash(password)),angular.uppercase(md5.createHash(password.toUpperCase()))]).then(function (result) {
            if (result.length > 0 ) {
            	return deferred.resolve('GOHEAD');
            } else {
            	return deferred.resolve(null);
            }
        }, function (err) {
            console.error("Error : " + JSON.stringify(err));
            return deferred.reject(err.message);
        });
        return  deferred.promise;
     }
    return service;

}]);