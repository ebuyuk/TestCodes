angular.module('WingsMobileStarter').controller('SY_M013', [
    '$scope',
    '$state',
    '$cordovaBarcodeScanner',
    '$ionicModal',
    'WingsRemoteDbService',
    '$ionicPopup',
    '$q',
    '$ionicPopover',
    'WingsContextMenuService',
    'WingsLocalNotificationService',
    '$cordovaBadge',
    function($scope,$state,$cordovaBarcodeScanner,$ionicModal,WingsRemoteDbService,$ionicPopup,$q,$ionicPopover,WingsContextMenuService,WingsLocalNotificationService,$cordovaBadge) {
        console.log("SY_M013");
        $scope.numberOfMessagesToDisplay = 20;

        $cordovaBadge.get().then(function(badge) {
            if (badge > 0) {
                $scope.refreshMessages();
                clearNotifications();
            }
        }, function(err) {
        });

        $rootScope.$on('onNotificationCreate', function(){
            $scope.refreshMessages();
        });
        cordova.plugins.notification.badge.get(function (badge) {
        	if (badge > 0) {
                $scope.refreshMessages();
                clearNotifications();
            }
        }, function(err) {
        });
        function clearNotifications () {
            cordova.plugins.notification.badge.clear();
            WingsLocalNotificationService.clearAll();
        };

        $scope.refreshMessages = function() {
            $scope.pushMessages();
            $scope.pullMessages();
        }

        $scope.displayMessages = function () {
            var sql = "Select Id id,                                                              " +
                      "       Sent_Date sent_date,                                                " +
                      "       Sender sender,                                                      " +
                      "       Message_Subject message_subject,                                    " +
                      "       Message_Text message_text,                                          " +
                      "       Display_Counter display_counter,                                    " +
                      "       Actions,                                                            " +
                      "       Server_Transaction_Date server_transaction_date                     " +
                      "  From Gn_Message_Items                                                    " +
                      " Where Div_No      =    " + $rootScope.globals.currentUser.divNo      + "  " +
                      "   And User_Number =   '" + $rootScope.globals.currentUser.userNumber + "' " +
                      " Order By Server_Transaction_Date Desc                                     ";
            var parameters = [];
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
                var jsonObj = result;
                $scope.messages = jsonObj;
                $scope.$broadcast('scroll.refreshComplete');
            },function (error) {});  
        };

        $scope.pullMessages = function () {
            var sql = "Select ifnull(Max(datetime(server_transaction_date)),date('now','-30 days')) lastDay From Gn_Message_Items"; 
            var parameters = [];
            WingsTransactionDBService.executeSql(sql,parameters).then(
                function (result2) {
                    var lastDate = result2[0].lastDay;
                    var sql = "Select Div_No,                                                                         " +
                              "       Sent_Date,                                                                      " +
                              "       Sender,                                                                         " +
                              "       Message_Text,                                                                   " +
                              "       Id,                                                                             " +
                              "       Message_Subject,                                                                " +
                              "       Decode(Active,'N',1,Display_Counter) display_counter,                           " +
                              "       Actions,                                                                        " +
                              "       To_Char(Nvl(Dt_Modified,Dt_Created),'YYYY-MM-DD HH24:MI:SS') transaction_date   " +
                              "       From Lb_Messages_v a                                                            " +
                              " Where Div_No                      = " + $rootScope.globals.currentUser.divNo+ "       " +
                              "   And Employee_Number             = '" + $rootScope.globals.currentUser.userNumber+"' " +
                              "   And Nvl(Dt_Modified,Dt_Created) > To_Date('"+lastDate+"','YYYY-MM-DD HH24:MI:SS')   ";  

                    var sqlArr = [{ queryStr: sql,queryType: "READ"}];
                    var sqlStr = JSON.stringify(sqlArr);

                    WingsRemoteDbService.executeQuery(sqlStr).then(
                        function (result) {
                            var jsonObj = angular.fromJson(result[0].rows);
                            if (jsonObj.length > 0) {
                                var sql2 =" Insert or Replace Into Gn_Message_Items (Div_No,                                    " +
                                          "                                          Sent_Date,                                 " +
                                          "                                          Sender,                                    " +
                                          "                                          Message_Text,                              " +
                                          "                                          Id,                                        " +
                                          "                                          Display_Counter,                           " +
                                          "                                          Message_Subject,                           " +
                                          "                                          Mobile_Record_Status,                      " +
                                          "                                          User_Number,                               " +
                                          "                                          Actions,                                   " +
                                          "                                          Server_Transaction_Date)                   " +
                                          " Values (?,?,?,?,?,?,?,'QUERY','"+$rootScope.globals.currentUser.userNumber+"',?,?); ";

                                var bindings = [];
                                var row      = [];

                                for (var i=0; i<jsonObj.length; i++) {
                                    row = [jsonObj[i].div_no,
                                           jsonObj[i].sent_date,
                                           jsonObj[i].sender,
                                           jsonObj[i].message_text,
                                           jsonObj[i].id,
                                           jsonObj[i].display_counter,
                                           jsonObj[i].message_subject,
                                           jsonObj[i].actions,
                                           jsonObj[i].transaction_date ];
                                    bindings.push(row);
                                }
                                WingsTransactionDBService.insertCollection(sql2,bindings).then(
                                    function (result3) {
                                        $scope.$broadcast('scroll.refreshComplete');
                                        $scope.displayMessages();
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

        $scope.pushMessages = function () {
            if ($rootScope.globals.deviceConnectionInfo.isOffline) {
                return;
            }
            var sql = "Select Div_No,                           "+
                      "       Id                                "+
                      "  From Gn_Message_Items                  "+
                      " Where Mobile_Record_Status = 'MODIFIED' ";
            WingsTransactionDBService.executeSql(sql).then (function (result) {
                if (result.length < 1) {
                   return;
                }
                var builders = []; 
                for (var i = 0; i<result.length; i++) {
                    var sql2 = new StoredFuncProcBuilder("Gn_Apps.Do_Message", "i_Div_No", result[i].DIV_NO,
                                                                               "i_Action", "MARK",
                                                                               "i_Id",     result[i].ID);
                    var obj = sql2.queryObject();
                    builders.push(obj);
                }
                var str = JSON.stringify(builders);
                WingsRemoteDbService.executeFunction(str).then (function (result2) {
                    var sql3 = "Update Gn_Message_Items          " +
                               "   Set Mobile_Record_Status = ?, " +
                               "       Server_Feedback      = ?  " +
                               " Where Id                   = ?  ";
                    var bindings = [];
                    var row      = [];
                    for (var i=0; i<result2.length; i++) {
                        result2[i] = JSON.parse(result2[i]);
                        row = ['QUERY', result2[i].errorText, result[i].ID];
                        bindings.push(row);
                    }
                    WingsTransactionDBService.insertCollection(sql3,bindings).then (function (result3) {
                        $scope.displayMessages();
                    }, function (error) {
                       console.log(JSON.stringify(error));
                    });  
                },function (error) {
                    console.log("ERROR " + error.status +" MESSAGE : "+error.message);
                });
            },function (error) {});  
        };

        $scope.addMoreMessages = function(done) {
            if ($scope.messages != undefined && $scope.messages.length > $scope.numberOfMessagesToDisplay) {
              $scope.numberOfMessagesToDisplay += 20;
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };

        $scope.$on('$stateChangeSuccess', function() {
            $scope.addMoreMessages();
        });

        $scope.firstLetterColor = function (str) { // java String#hashCode
            if (str != undefined) {
                var hash = 0;
                for (var i = 0; i < str.length; i++) {
                    hash = str.charCodeAt(i) + ((hash << 5) - hash);
                }
                var c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
                return "#"+("00000".substring(0, 6 - c.length) + c);
            }
        };

        $scope.firstletter = function (str) {
            if (str != undefined) {
                return str.charAt(0).toUpperCase();
            }
        };

        $scope.convertToDate = function (stringDate){
            var dateOut = moment(stringDate,'YYYY-MM-DD HH:mm').format('D MMM H:mm')
            return dateOut;
        };

        $scope.openMessages = function () {
            $state.go('app.SY_M013'); 
        };

        $scope.displayMessage = function(loop) {
            $rootScope.SY_M013_MessageDetails = {
                row              : loop,
                firstletter      : $scope.firstletter,
                firstLetterColor : $scope.firstLetterColor,
                convertToDate    : $scope.convertToDate,
                actions          : []
            };
            if (loop.ACTIONS.length > 0) {
                loop.ACTIONS = loop.ACTIONS.replace(new RegExp('\n', 'g'), ';');
                var actionParameters = loop.ACTIONS.split(';');
                for (var i=0; i<actionParameters.length; i+=3) {
                    var obj = {
                            actionImg : actionParameters[i],
                            actionName : actionParameters[i+1],
                            parameters : actionParameters[i+2]
                    }
                    $rootScope.SY_M013_MessageDetails.actions.push(obj);
                }
            }
            if(loop.display_counter == 0) {
                cordova.plugins.notification.badge.decrease();
            }
            $state.go('app.SY_M013_Message');
            loop.display_counter = 1;
            var sql = "Update Gn_Message_Items                                      " +
                      "     Set Display_Counter      = ifNull(Display_Counter,0)+1, " +
                      "         Mobile_Record_Status = 'MODIFIED'                   " +
                      "   Where Id = ?                                              " +
                      "     And Display_Counter <1";
            var parameters = [loop.id];
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
                $scope.pushMessages();
            },function (error) {});  
            clearNotifications();
        };

        $scope.unread = function (id) {
            var sql = "Update Gn_Message_Items               " +
                      "   Set Display_Counter      = 0,      " +
                      "       Mobile_Record_Status = 'QUERY' " +
                      " Where Id = ?                         " ;
            var parameters = [id];
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
                $scope.displayMessages();
            },function (error) {});    
        };

        $scope.executeAction = function (actionName) {
            //$scope.popover.hide();
            $rootScope.SY_M013_MessageDetails.messageTransactionDate = $rootScope.SY_M013_MessageDetails.row.server_transaction_date;
            WingsContextMenuService.menuClick(actionName);
        };

        //Executions
        $scope.displayMessages();
    } 
])