var wingsLocalNotificationModule = angular.module('wings.mobile.modules.LocalNotification', [ 'ngCordova' ]);

wingsLocalNotificationModule.factory('WingsLocalNotificationService', ['$rootScope',
                                                                       '$cordovaLocalNotification',
                                                                       'WingsRemoteDbService',
                                                                       '$cordovaBadge', 
                                                                       'WingsTransactionDBService',
                                                                       '$q',
                                                                       function( $rootScope, 
                                                                                 $cordovaLocalNotification,
                                                                                 WingsRemoteDbService,
                                                                                 $cordovaBadge,
                                                                                 WingsTransactionDBService,
                                                                                 $q){

    var service = {
    	//scheduleExactTime:scheduleExactTime,
    	registerListeners:registerListeners,
    	showNotification:showNotification,
    	clearAll:clearAll
        //executeLogin:executeLogin,
       // executeFunction:executeFunction,
       // fetchUserRoles:fetchUserRoles,
       // fetchRolePrograms:fetchRolePrograms
    };
    return service;
    
    function addDbSynchronizationTask(){
    	 var now = new Date();
	      var _60_seconds_from_now = new Date(now + 60 * 1000);
	      var event = {
	        id: '500',
	       // at: _60_seconds_from_now,
	        every: 1,
	        //title: "Db Synchronization",
	        //text: "this is a message about the event",
	      };
	      schedule(event);
    };
    function showNotification(event){
         schedule(event);
   };
   function clearAll(){
       $cordovaLocalNotification.clearAll();
   };
   
    function schedule(event){
        // TODO : Bu kisim acilacak
        $cordovaLocalNotification.isScheduled(event.id).then(function (info) {
            if(!info){
                $cordovaLocalNotification.schedule(event).then(function () {
                    console.log("*********local notification added : success");
                },function (error) {
                    console.log("*******local notification added : failed Error : " +error);
                });
            }else{
                console.log("*********local notification added : Already scheduled no need to schedule");
            }

        });
    };
    function registerListeners(){
        //addDbSynchronizationTask();
         // LOCAL NOTIFICATION
        $rootScope.$on("$cordovaLocalNotification:trigger", function (event, notification, state) {
            console.log("[WingsLocalNotificationService] *********Local notification id:" + notification.id + " state: " + state);
            if(notification.id =500){
               // checkFunction ();
            }
         });
    };
    /*function registerListeners(){
        $cordovaLocalNotification.clear([500]).then(function (result) {
            console.log("CLEARED RESULT_____________________________________________________-"+ JSON.stringify(result));
            //addDbSynchronizationTask();
        });

        // LOCAL NOTIFICATION
        $rootScope.$on("$cordovaLocalNotification:trigger", function (event, notification, state) {

            var currentdate = new Date(); 
            var datetime = "Last Sync: " + currentdate.getDate() + "/"
            + (currentdate.getMonth()+1)  + "/" 
            + currentdate.getFullYear() + " @ "  
            + currentdate.getHours() + ":"  
            + currentdate.getMinutes() + ":" 
            + currentdate.getSeconds();
            console.log(currentdate+ "[WingsLocalNotificationService] *********Local notification id:" + notification.id + " state: " + state);
            if(notification.id == "500" && state == "foreground"){
                console.log("FOREGROUND : "+currentdate+" state: " + state + "USER "+JSON.stringify(notification.data));
                //  sendLocalDumpToServer(datetime);
            }else{
                console.log("BACKGROUND : "+currentdate+" state: " + state+ "USER "+JSON.stringify(notification.data));

                //sendLocalDumpToServer(datetime);

            }
        });

        // ON CLICK
        $rootScope.$on("$cordovaLocalNotification:click", function (event, notification, state) {

            console.log("ON CLICK "+JSON.stringify(notification));


        });

        // ON CLICK

        $rootScope.$on('localdata-successfulysenttoserver-godownload', function(event, args) {


            console.log("Now its time to load remote data to device....");
        });
    };*/
    function sendProcessedRecords () {
        var sql = "Select * from gn_issues where processed = 'true'"
        var parameters = [];
        WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
            var myFuncArray = [];
            for (loop in result) {
                var myBuilder = new StoredFuncProcBuilder("Gn_Apps.Do_Workflow",
                        'i_Action',                      'EXECUTE',
                        'i_What',                        'ACTION',
                        'i_Issue_Id',                    '',
                        'i_Edge_Id',                     '',
                        'i_Remarks',                     '');
                myFuncArray.push(myBuilder.queryObject());
            }
            var strSql = JSON.stringify(myFuncArray);
            WingsRemoteDbService.executeFunction(strSql).then(function (dataIn) {
                console.log("************Execute Function : " +JSON.stringify(dataIn));
              
            }, function (response) {
                console.log("ERROR " + response.status +" MESSAGE : "+response.message);
            });
            return deferred.resolve("GOHEAD");
        }, function (error) {
            //WingsDialogService.error(JSON.stringify(error));
            //console.log('MM_0100 - AcceptDiscrepancy - ERROR'+JSON.stringify(error));
            return deferred.reject("Login-Error : " +JSON.stringify(error));
        });  
    };
    function sendLocalDumpToServer (datetime) {

        var successFn = function(json, count){
            try {
                WingsRemoteDbService.synch(JSON.stringify(json)).then(function (dataIn) {
                    console.log("************Server Response: " +JSON.stringify(dataIn));
                    $rootScope.$broadcast('localdata-successfulysenttoserver-godownload');
                }, function (response) {
                    console.log("ERROR " + response);
                });
            }
            catch(err) {
                console.log("************ERROR************ERROR************ERROR************ERROR : " +JSON.stringify(err));
            }
        };
        try {
            if(WingsTransactionDB != null){
                cordova.plugins.sqlitePorter.exportDbToJson(WingsTransactionDB, {
                    successFn: successFn,
                    dataOnly :true
                });
            }
        }
        catch(err1) {
            console.log("************ERROR1************ERROR1************ERROR1************ERROR1 : " +JSON.stringify(err1));
        }
    };
       
    function checkFunction () {
        var myBuilder = new StoredFuncProcBuilder('xx_test.sleep',
        		                                  'i_Time',         '40');
        var myFuncArray = [myBuilder.queryObject()];
        var strSql = JSON.stringify(myFuncArray);
            WingsRemoteDbService.executeFunction(strSql).then(function (dataIn) {
                console.log("************Execute Function : " +JSON.stringify(dataIn));
            }, function (response) {
                console.log("ERROR " + response.status +" MESSAGE : "+response.message);
            });
    };
      $scope.popMessages = function () {
          var sql = "Select ifnull(Max(Id),0) Id From Gn_Message_Items";
          var parameters = [];
          WingsTransactionDBService.executeSql(sql,parameters).then(
              function (result2) {
                  console.log(JSON.stringify(result2[0]));
                  var maxMessageId = result2[0].Id;
                  var sql = "Select Div_No,              "+
                            "       Sent_Date,           "+
                            "       Sender,              "+
                            "       Message_Text,        "+
                            "       Id,                  "+
                            "       Message_Subject,     "+
                            "       Decode(Active,'N',1,Display_Counter) display_counter, "+
                            "       Actions              "+
                            "       From Lb_Messages_v a "+
                            " Where Div_No          =    " + $rootScope.globals.currentUser.divNo       + " "+
                            "   And Employee_Number =   '" + $rootScope.globals.currentUser.userNumber  + "'"+
                            "   And Id              >    " + maxMessageId;
                  var sqlArr = [ { queryStr: sql,
                                   queryType: "READ"
                                 } ];
                  var sqlStr = JSON.stringify(sqlArr);
                  WingsRemoteDbService.executeQuery(sqlStr).then(
                      function (result) {
                          var jsonObj = angular.fromJson(result[0].rows);
                          if (jsonObj.length > 0) {
                              var sql2 =" Insert or Replace Into Gn_Message_Items (Div_No,Sent_Date,Sender,Message_Text,Id,Display_Counter,Message_Subject,Mobile_Record_Status,User_Number,Actions) " +
                                        " Values (?,?,?,?,?,?,?,'QUERY','"+$rootScope.globals.currentUser.userNumber+"',?);"
                              var bindings = [];
                              var row  = [];
                              for (var i=0; i<jsonObj.length; i++) {
                                  row = [jsonObj[i].div_no,jsonObj[i].sent_date,jsonObj[i].sender,jsonObj[i].message_text,jsonObj[i].id,jsonObj[i].display_counter,jsonObj[i].message_subject,jsonObj[i].actions ];
                                  bindings.push(row);
                              }
                              WingsTransactionDBService.insertCollection(sql2,bindings).then(
                                  function (result3) {
                                      $scope.$broadcast('scroll.refreshComplete');
                                      $scope.displayMessages();
                                      console.log(JSON.stringify(result3));
                                  }, 
                                  function (error) {
                                      $scope.$broadcast('scroll.refreshComplete');
                                      console.log(JSON.stringify(error));
                                  }
                              );  
                          } else {
                              $scope.$broadcast('scroll.refreshComplete');
                          }
                      }, 
                      function (error) {
                          $scope.$broadcast('scroll.refreshComplete');
                          console.log("ERROR " + error.status +" MESSAGE : "+error.message);
                      }
                  );
              }, 
              function (error) {
                  $scope.$broadcast('scroll.refreshComplete');
              }
          );
      };
}]);