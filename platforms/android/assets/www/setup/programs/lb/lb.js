var lbService = angular.module('wings.mobile.controllers.lb',[]);

lbService.factory('lb', ['$q','$window','$injector','$timeout','$rootScope','WingsUtil','WingsGlobalManager','WingsTransactionDBService','WingsDialogService','WingsRemoteDbService',
    function($q,$window,$injector,$timeout,$rootScope,WingsUtil,WingsGlobalManager,WingsTransactionDBService,WingsDialogService,WingsRemoteDbService){
    var service = {
        SaveClock:SaveClock,
        RemoveClocks:RemoveClocks,
        GetClockPushList:GetClockPushList,
        InstantiateClock:InstantiateClock,
        PullLocalClock:PullLocalClock,
        DeleteClock:DeleteClock
        
    };
    
    return service;

    function SaveClock (clocksObject) {
        var deferred = $q.defer();
        var sql = "Insert or Replace Into Lb_Labor_Collection (Div_No,Badge,Work_Order_Number,Zone_Number,Item_Number,Work_Card_Number,Work_Card_Id,Clock_Time,            "+
        		                                        "Authorized_By_Badge,Mobile_Record_Status,Mobile_Record_Action,Mobile_User_Id,Mobile_Dt_Modified,MOBILE_RECORD_ID,Server_Feedback,AUTHORIZATION_REQUIRED_FLAG) "+
                  "Values (?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?)";
        
        var bindings = [];
        var row  = [];
        var clockObject = null;
        for (var i=0; i<clocksObject.length; i++) {
            clockObject = clocksObject[i];
            
            row = [clockObject.DIV_NO,
                   clockObject.BADGE,
                   clockObject.WORK_ORDER_NUMBER,
                   clockObject.ZONE_NUMBER,
                   clockObject.ITEM_NUMBER,
                   clockObject.WORK_CARD_NUMBER,
                   clockObject.WORK_CARD_ID,
                   clockObject.CLOCK_TIME,
                   clockObject.AUTHORIZED_BY_BADGE,
                   clockObject.MOBILE_RECORD_STATUS,
                   clockObject.MOBILE_RECORD_ACTION,
                   clockObject.MOBILE_USER_ID,
                   clockObject.MOBILE_DT_MODIFIED,
                   clockObject.MOBILE_RECORD_ID ? clockObject.MOBILE_RECORD_ID : null,
                   clockObject.SERVER_FEEDBACK,
                   clockObject.AUTHORIZATION_REQUIRED_FLAG];
            bindings.push(row);
        }
        WingsTransactionDBService.insertCollection(sql,bindings).then(function (result){
            //console.log("saved labor collection data locally");
            return deferred.resolve(result);
        }, function (error) {
            console.log(error);
            return deferred.reject("Save labor collection Error : " +JSON.stringify(error));
        });
        return deferred.promise;
    };
    function RemoveClocks () {
        var deferred = $q.defer();
        var divNo  = $rootScope.globals.currentUser.divNo;
        var userId = $rootScope.globals.currentUser.userId;    
        //console.log("remove labor collection - started");
        var parameters = [];
        var sql = "Delete From Lb_Labor_Collection                                                          "+ 
        "           Where Not exists (Select 1                                                              "+
        "                               From Sy_Transaction_Queue                                           "+
        "                              Where Mobile_Table_Record_Id =  Lb_Labor_Collection.Mobile_Record_Id "+
        "                                And Mobile_Table_Name      = 'LB_LABOR_COLLECTION')                ";
        
        //console.log("**************************remove labor collection   :  "+sql);
        WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
            //console.log("remove labor collection - succeed");
            return deferred.resolve("GOHEAD");
        }, function (error) {
            console.log(error);
            return deferred.reject("Synced labor collection delete error : " +JSON.stringify(error));
        });
        return deferred.promise;
    };
    function GetClockPushList () {
        //console.log("get labor collection list - started");
        var deferred = $q.defer();
        var sql = " Select a.*,                                             "+
        		  "        'CLOCK'                OBJECT_TYPE,              "+
                  "        b.MOBILE_PARENT_RECORD_ID,                       "+
        		  "        b.MOBILE_RECORD_ID     QUEUE_RECORD_ID,          "+
        		  "        b.MOBILE_TABLE_NAME,                             "+
        		  "        b.MOBILE_ACTION_DATE,                            "+
        		  "        b.MOBILE_RECORD_ACTION QUEUE_ACTION,             "+
        		  "        b.MOBILE_RECORD_STATUS QUEUE_STATUS              "+
		    	  "   From Lb_Labor_Collection  a,                          "+
		    	  "        SY_TRANSACTION_QUEUE b                           "+
		    	  "  Where b.MOBILE_TABLE_NAME      = 'LB_LABOR_COLLECTION' "+
		    	  "    And b.MOBILE_TABLE_RECORD_ID = a.MOBILE_RECORD_ID    "+
		    	  "    And b.MOBILE_RECORD_STATUS  != 'LOADED'              "+
		    	  "  Order By b.Mobile_Record_Id Asc                        ";
            var parameters = [];
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                return deferred.resolve(result);
            }, function (error) {
                console.log(error);
                return deferred.reject(error);
            });
            return deferred.promise;
    };
    
    function InstantiateClock(){
        var clock = {
                DIV_NO: $rootScope.globals.currentUser.divNo,
                BADGE : Number($rootScope.globals.currentUser.userBadge),
                WORK_ORDER_NUMBER: '',
                ZONE_NUMBER: '',
                ITEM_NUMBER : '',
                WORK_CARD_NUMBER: '',
                WORK_CARD_ID: '',
                CLOCK_TIME: '',
                AUTHORIZED_BY_BADGE: '',
                MOBILE_RECORD_STATUS : 'READY',
                MOBILE_RECORD_ACTION: '',
                MOBILE_RECORD_ID: null,
                MOBILE_USER_ID: $rootScope.globals.currentUser.userId,
                MOBILE_DT_MODIFIED: '',
                NAME: '',
                SUPERVISOR_NAME: '',
                AUTHORIZATION_REQUIRED_FLAG:'',
                DAILY: '',	
                WEEKLY: ''
        }  
        return clock;
    }
    
    function PullLocalClock(action){
        var deferred = $q.defer();
        var sql = " Select *                                                                   "+
        		  "   From Lb_Labor_Collection                                                 "+
        		  "  Where Mobile_Record_Action = ?                                            "+
        		  "    And Div_No               = '"+$rootScope.globals.currentUser.divNo  +"' "+
        		  "    And Mobile_User_Id       = '"+$rootScope.globals.currentUser.userId +"' "+
        		  "  Order By Mobile_Record_Id Asc                                             ";
        var parameters = [action];
        WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
            return deferred.resolve(result);
        }, function (error) {
            console.log(error);
            return deferred.reject(error);
        });
        return deferred.promise;
    }
    
    function DeleteClock(clockId){
        var deferred = $q.defer();
        var sql = " Delete From Lb_Labor_Collection "+
                  "  Where Mobile_Record_Id = ?     ";
        var parameters = [clockId];
        WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
            return deferred.resolve(result);
        }, function (error) {
            console.log(error);
            return deferred.reject(error);
        });
        return deferred.promise;
    }
}]);