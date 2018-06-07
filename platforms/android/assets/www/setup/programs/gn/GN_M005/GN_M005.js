angular.module('WingsMobileStarter').controller('GN_M005', [
        '$scope',
        'WingsContextMenuService',
        '$ionicBackdrop',
        '$cordovaBarcodeScanner',
        'WingsRemoteDbService',
        'WingsSocketService',
        '$ionicPopup',
        'WingsDialogService',
        'WingsGlobalManager',
        '$ionicPopup',
        '$timeout',
        '$ionicLoading',
        '$window',
        function($scope,WingsContextMenuService,$ionicBackdrop,$cordovaBarcodeScanner,WingsRemoteDbService,WingsSocketService,$ionicPopup,WingsUtil,WingsDialogService,WingsGlobalManager,$ionicPopup,$timeout,$ionicLoading,$window) {
            console.log("GN_M005");
            $scope.numberOfIssuesToDisplay = 20;

            $scope.doRefresh = function() {
            	$ionicBackdrop.retain();
                $scope.rows = [];
                pushIssues ().then(function (result){
                    pullIssues().then(function (result){
                        $scope.displayIssues();
                    }, function (error) {
                        $scope.displayIssues();
                    });
                }, function (error) {
                    $scope.displayIssues();
                });
            };
           /* WingsSocketService.AddListener('GN_ISSUES.INSERT','function (o){return true}', function(msg){
            	 $scope.doRefresh();
            });*/
            WingsSocketService.AddListener('GN_ISSUES.UPDATE','function (o){return true}', function(msg){
            	console.log('test');
            	 $scope.doRefresh();
            });
            $rootScope.$on('onExecuteAction', function(){
                $scope.displayIssues();
            });

            function pushIssues () {
                var deferred = $q.defer();
                var sql = "Select *                           " +
                          "  From Gn_Issues                   " +
                          " Where Response_Status != ''       " +
                          "   And Response_Status Is Not Null " +
                          "   And Response_Action_Id Is Not Null ";
                var parameters = [];
                var builders = []; 
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    if (result.length < 1) {
                        return deferred.resolve("GOHEAD");
                    }
                    for (var i = 0; i<result.length; i++) {
                        var sql = new StoredFuncProcBuilder("Gn_Apps.Do_Workflow", "i_Div_No",   result[i].DIV_NO, 
                                                                                   "i_Action",   "EXECUTE",
                                                                                   "i_What",     "ACTION",
                                                                                   "i_Issue_Id", result[i].ID,
                                                                                   "i_Edge_Id",  result[i].RESPONSE_ACTION_ID,
                                                                                   "i_Remarks",  result[i].RESPONSE_REMARK);
                        var obj = sql.queryObject();
                        builders.push(obj);
                    }
                    var str = JSON.stringify(builders);
                    WingsRemoteDbService.executeFunction(str).then (function (result2) {
                        var sql =  "Update Gn_Issues                  " +
                                   "   Set Response_Action_Id    = ?, " +
                                   "       Response_Remark       = ?, " +
                                   "       Response_Action_Label = ?, " +
                                   "       Response_Status       = ?, " +
                                   "       Server_Feedback       = ?  " +
                                   " Where Id                    = ?  ";
                        var bindings = [];
                        var row  = [];
                        for (var i=0; i<result2.length; i++) {
                            result2[i] = JSON.parse(result2[i]);
                            if (result2[i].isSuccess == 'false') {
                                row = [result[i].RESPONSE_ACTION_ID,
                                       result[i].RESPONSE_REMARK,
                                       result[i].RESPONSE_ACTION_LABEL,
                                       result[i].RESPONSE_STATUS,
                                       result2[i].message, 
                                       result[i].ID];
                            } 
                            else if (result[i].ID != undefined) {
                                row = ['','','','','', result[i].ID];
                            }
                            bindings.push(row);
                        }
                        WingsTransactionDBService.insertCollection(sql,bindings).then (function (result3) {
                            $scope.displayIssues();
                        },function (error) {}
                        );  
                    },function (error) {
                        console.log("ERROR " + error.status +" MESSAGE : "+error.message);
                    });
                    return deferred.resolve("GOHEAD");
                }, function (error) {
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });  
                return deferred.promise;
            };

            pushIssues();

            function pullIssues () {
                var deferred = $q.defer();
                var response;
                var userId =$rootScope.globals.currentUser.userId;
                var lastDateSql = "Select ifnull(Max(datetime(server_transaction_date)),date('now','-6 month')) lastDate,                                          " +
                		          "       ifnull(Max(datetime(server_transaction_date)),'TRUE') isFirstRun,                                                        " +
                		          "       (Select ifnull(Max(datetime(server_transaction_date)),date('now','-6 month')) From Gn_Issue_Type_Workflow) typeLastDate  " +
                		          "  From gn_issues where User_Id ='"+userId+"'";
                WingsTransactionDBService.executeSql(lastDateSql,[]).then(function (result){
                    var lastDate             = result[0].lastDate;
                    var typeLastDate         = result[0].typeLastDate;
                    var isFirstRunCondition  = result[0].isFirstRun=="TRUE"?"And Status = 'OPEN'":"";
                    var isFirstRunCondition2 = result[0].isFirstRun=="TRUE"?"And Issue_Status = 'OPEN'":"";
                    var issueSql = "Select Div_No,                                                                  " +
                                   "       Issue_Number,                                                            " +
                                   "       Issue_Type,                                                              " +
                                   "       Issue_Type_Version,                                                      " +
                                   "       Processed_By_Employee_Name,                                              " +
                                   "       Description,                                                             " +
                                   "       Subject,                                                                 " +
                                   "       Status,                                                                  " +
                                   "       Queue,                                                                   " +
                                   "       Actions,                                                                 " +
                                   "       Application_Actions,                                                     " +
                                   "       Decode(Nvl(InStr(Inbox_Users,'|"+userId+"|'),0),0,'FALSE','TRUE') inbox, " +
                                   "       Gn_Service.Get_Tooltip_Text(Div_No, Label_Type, Id) data,                " +
                                   "       Issue_Transaction_Date,                                                  " +
                                   "       Id                                                                       " +
                                   "  From Gn_Issues_v                                                              " +
                                   " Where (Null is Null)                                                           " +
                                   "   And Div_No                 = "+$rootScope.globals.currentUser.divNo            +
                                   "   And Issue_Transaction_Date > to_date('"+lastDate+"','yyyy-mm-dd hh24:mi:ss') " +
                                   isFirstRunCondition+
                                   "   And All_Users              Like '%|"+userId+"|%'                             " +
                                   " Order By Id Desc                                                               " ;
                        
                    var typeSql = " Select Div_No,                                                                           " +
				                  "        Type,                                                                             " +
				                  "        Issue_Type,                                                                       " +
				                  "        Issue_Type_Version,                                                               " +
				                  "        Id,                                                                               " +
				                  "        Node,                                                                             " +
				                  "        PositionX,                                                                        " +
				                  "        PositionY,                                                                        " +
				                  "        Label,                                                                            " +
				                  "        Tooltip,                                                                          " +
				                  "        To_Node,                                                                          " +
				                  "        Action,                                                                           " +
				                  "        Color,                                                                            " +
				                  "        Transition_Type,                                                                  " +
				                  "        Nvl(Dt_Modified,Dt_Created) Server_Transaction_Date                               " +
				                  "   From Gn_Issue_Type_Workflow_v                                                          " +
				                  "  Where (Null is Null)                                                                    " +
				                  "    And Div_No                 = "+$rootScope.globals.currentUser.divNo                     +
				                  "    And Nvl(Dt_Modified,Dt_Created) > to_date('"+typeLastDate+"','yyyy-mm-dd hh24:mi:ss') " +
				                  "  Order By Div_No,Issue_Type,Issue_Type_Version,Type,Id                                   " ; 
                    
                    
                    var transactionSql = "Select Div_No,                                                                  " +
                                         "       Issue_Number,                                                            " +
                                         "       Status,                                                                  " +
                                         "       Action,                                                                  " +
                                         "       Queue,                                                                   " +
                                         "       Remarks,                                                                 " +
                                         "       Processed_By_Employee_Name,                                              " +
                                         "       Id,                                                                      " +
                                         "       Edge_Id,                                                                 " +
                                         "       Dt_Created                                                               " +
                                         "  From Gn_Issue_Transactions_v                                                  " +
                                         " Where Div_No                 = "+$rootScope.globals.currentUser.divNo            +
                                         "   And Issue_Transaction_Date > to_date('"+lastDate+"','yyyy-mm-dd hh24:mi:ss') " +
                                         isFirstRunCondition2+
                                         "   And All_Users              Like '%|"+userId+"|%'                             " +
                                         " Order By Issue_Id, Id                                                          " ;

                    var sqlArray = [
                                    { queryStr: issueSql,       queryType: "READ" },
                                    { queryStr: typeSql,        queryType: "READ" },
                                    { queryStr: transactionSql, queryType: "READ" }
                                   ]
                    var sqlString = JSON.stringify(sqlArray);
                    WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                        // Issues
                        var issues = angular.fromJson(dataIn[0].rows);
                        if (issues.length > 0) {
                            var bindings    = [];
                            var parameters  = [];
                            var sqlIssue = "INSERT OR REPLACE INTO Gn_Issues (Id,                         " +
                                           "                                  User_Id,                    " +
                                           "                                  Issue_Number,               " +
                                           "                                  Issue_Type,                 " +
                                           "                                  Issue_Type_Version,         " +
                                           "                                  Processed_By_Employee_Name, " +
                                           "                                  Description,                " +
                                           "                                  Subject,                    " +
                                           "                                  Status,                     " +
                                           "                                  Queue,                      " +
                                           "                                  Actions,                    " +
                                           "                                  Server_Transaction_Date,    " +
                                           "                                  Div_No,                     " +
                                           "                                  Application_Actions,        " +
                                           "                                  Inbox,                      " +
                                           "                                  Data)                       " +
                                           "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);                       ";
                            for(var i=0; i<issues.length; i++) {
                                parameters = [issues[i].id,
                                              $rootScope.globals.currentUser.userId,
                                              issues[i].issue_number,
                                              issues[i].issue_type,
                                              issues[i].issue_type_version,
                                              issues[i].processed_by_employee_name,
                                              issues[i].description,
                                              issues[i].subject,
                                              issues[i].status,
                                              issues[i].queue,
                                              issues[i].actions,
                                              issues[i].issue_transaction_date,
                                              issues[i].div_no,
                                              issues[i].application_actions,
                                              issues[i].inbox,
                                              issues[i].data];
                                bindings.push(parameters);
                            }
                            WingsTransactionDBService.insertCollection(sqlIssue,bindings).then(function (result){
                            }, function (error) {});
                        }
                        // Nodes and Edges
                        var types = angular.fromJson(dataIn[1].rows);
                        if (types.length > 0) {
                        	var deleteSql = "Delete From Gn_Issue_Type_Workflow Where Div_No = ? And Issue_Type = ? And Issue_Type_Version = ? ";
                        	for (i in types) {
                                WingsTransactionDBService.executeSql(deleteSql,[types[i].div_no,types[i].issue_type,types[i].issue_type_version]);
                        	}
                            var bindings = [];
                            var parameters  = [];
                            var sqlIssue = "INSERT OR REPLACE INTO Gn_Issue_Type_Workflow (Id,                      " +
                                           "                                               Div_No,                  " +
                                           "                                               Type,                    " +
                                           "                                               Issue_Type,              " +
                                           "                                               Issue_Type_Version,      " +
                                           "                                               Node,                    " +
                                           "                                               PositionX,               " +
                                           "                                               PositionY,               " +
                                           "                                               Label,                   " +
                                           "                                               Tooltip,                 " +
                                           "                                               To_Node,                 " +
                                           "                                               Action,                  " +
                                           "                                               Transition_Type,         " +
                                           "                                               Color,                   " +
                                           "                                               Server_Transaction_Date) " +
                                           "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);                                 ";
                            for(var i=0; i<types.length; i++) {
                                parameters = [types[i].id,
		                                	  types[i].div_no,
		                                	  types[i].type,
		                                  	  types[i].issue_type,
		                                	  types[i].issue_type_version,
		                                	  types[i].node,
		                                	  types[i].positionx,
		                                	  types[i].positiony,
		                                	  types[i].label,
		                                	  types[i].tooltip,
		                                	  types[i].to_node,
		                                	  types[i].action,
		                                	  types[i].transition_type,
		                                	  types[i].color,
		                                	  types[i].server_transaction_date];
                                bindings.push(parameters);
                            }
                            WingsTransactionDBService.insertCollection(sqlIssue,bindings).then(function (result){
                            }, function (error) {});
                        }
                       
                        // Transactions
                        var transactions = angular.fromJson(dataIn[2].rows);
                        if (transactions.length > 0) {
                            var sqlTransaction = "INSERT OR REPLACE INTO Gn_Issue_Transactions (Id,                         " +
                                                 "                                              Div_No,                     " +
                                                 "                                              Issue_Number,               " +
                                                 "                                              Status,                     " +
                                                 "                                              Action,                     " +
                                                 "                                              Queue,                      " +
                                                 "                                              Edge_Id,                    " +
                                                 "                                              Remarks,                    " +
                                                 "                                              Processed_By_Employee_Name, " +
                                                 "                                              Dt_Created)                 " +
                                                 "VALUES (?,?,?,?,?,?,?,?,?,?);                                               ";
                            var bindings = [];
                            var parameters  = [];
                            for(var i = 0;i<transactions.length;i++) {
                                parameters = [transactions[i].id,
                                              transactions[i].div_no,
                                              transactions[i].issue_number,
                                              transactions[i].status,
                                              transactions[i].action,
                                              transactions[i].queue,
                                              transactions[i].edge_id,
                                              transactions[i].remarks,
                                              transactions[i].processed_by_employee_name,
                                              transactions[i].dt_created];
                                bindings.push(parameters);
                            }
                            WingsTransactionDBService.insertCollection(sqlTransaction,bindings).then(function (result){
                                 return deferred.resolve("GOHEAD");
                            }, function (error) {});
                        }
                        else {
                            return deferred.resolve("GOHEAD");
                        }
                    }, function (error) {
                        console.log("[MULTI QUERY][FETCH NEW UPDATES][ERROR] :  " + error.status +" MESSAGE : "+error.message);
                        response = { success: false, message: 'Cannot Fetch the updates' };
                        return deferred.reject("Login-Error : " +JSON.stringify(error));
                    });
                
                }, function (error) {});
                return deferred.promise;
            };
            $scope.addMoreIssues = function(done) {
                if ($scope.rows != undefined && $scope.rows.length > $scope.numberOfIssuesToDisplay) {
                    $scope.numberOfIssuesToDisplay += 20;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            };
            $scope.displayIssues = function () {
                var sql = "Select Id,                                                      " +
                          "       Issue_Number issue_number,                               " +
                          "       Processed_By_Employee_Name processed_by_employee_name ,  " +
                          "       Description description,                                 " +
                          "       Subject subject,                                         " +
                          "       Status status,                                           " +
                          "       Actions actions,                                         " +
                          "       Server_Transaction_Date server_transaction_date,         " +
                          "       Div_No div_no,                                           " +
                          "       Response_Action_Id response_action_id,                   " +
                          "       Response_Remark response_remark,                         " +
                          "       Response_Status response_status,                         " +
                          "       Server_Feedback server_feedback,                         " +
                          "       Mobile_Record_Id mobile_record_id,                       " +
                          "       Data,                                                    " +
                          "       Inbox,                                                   " +
                          "       Application_Actions                                      " +
                          " From Gn_Issues                                                 " +
                          "Order by inbox desc ,Server_Transaction_Date desc                   ";
                var parameters = [];
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    var jsonObj = result;
                    for (var i in jsonObj ) {
                		jsonObj[i].viewActions = [];
                		jsonObj[i].actionsTaken = [];
                		if (jsonObj[i].response_status != null) {
                			jsonObj[i].actionsTaken = jsonObj[i].response_status.split(',');
                		}
                    	if (jsonObj[i].APPLICATION_ACTIONS != null && jsonObj[i].APPLICATION_ACTIONS.length > 0) {
                    		jsonObj[i].APPLICATION_ACTIONS = jsonObj[i].APPLICATION_ACTIONS.replace(new RegExp('\n', 'g'), ';');
                            var actionParameters = jsonObj[i].APPLICATION_ACTIONS.split(';');
                            for (var j=0; j<actionParameters.length; j+=3) {
                                var obj = {
                                        actionImg : actionParameters[j],
                                        actionName : actionParameters[j+1],
                                        parameters : actionParameters[j+2]
                                }
                                jsonObj[i].viewActions.push(obj);
                            }
                        }
                    }
                    $scope.rows = jsonObj;
                    $scope.$broadcast('scroll.refreshComplete');
        			$ionicBackdrop.release();
                    return deferred.resolve("GOHEAD");
                }, function (error) {
                	$scope.$broadcast('scroll.refreshComplete');
        			$ionicBackdrop.release();
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });  
                return deferred.promise;
            };
            $scope.executeAction = function (action) {
                //$scope.popover.hide();
                WingsContextMenuService.menuClick(action.parameters);
            };
            
            $scope.showIssue = function(issue) {
            	if (issue.viewActions != undefined  && issue.viewActions.length > 0) {
            		$scope.executeAction(issue.viewActions[0]); //TODO:Open dropdown to handle all actions
            		return false;
            	}
                $rootScope.sc = $scope.strcolor;
                $rootScope.GN_M005_Issue = {};
                $rootScope.GN_M005_Issue.Issue_Number = issue.issue_number;
                $state.go('app.GN_M005_Issue');
            };
            $scope.strcolor = function (str) {
                var hash = 0;
                for (var i = 0; i < str.length; i++) {
                   hash = str.charCodeAt(i) + ((hash << 5) - hash);
                }
                var c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
                return "#"+("00000".substring(0, 6 - c.length) + c);            
            };
            
            $scope.firstletter = function (str) {
                return str.charAt(0).toUpperCase();
            };
            $scope.convertToDate = function (stringDate){
                var dateOut = moment(stringDate,'YYYY-MM-DD HH:mm').format('D MMM H:mm')
                return dateOut;
            };
            $scope.displayIssues();
        }
        ])