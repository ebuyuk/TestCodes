angular.module('WingsMobileStarter').controller('GN_M005.Issue', [
        '$scope',
        '$ionicPopover',
        'WingsDialogService',
        '$timeout',
        '$ionicModal',
        'WingsUtil',
        'WingsRemoteDbService',
        function($scope,$ionicPopover,WingsDialogService,$timeout,$ionicModal,WingsUtil,WingsRemoteDbService) {
            console.log("GN_M005-Issue");
            $scope.isDataShown = true;
            $scope.isFlowShown = false;
            $scope.isTransShown = false;
            function parseIssue() {
                var loop = $rootScope.GN_M005_Issue.data;
                $rootScope.GN_M005_Issue = {
                        row              : loop,
                        firstletter      : $scope.firstletter,
                        firstLetterColor : $scope.firstLetterColor,
                        convertToDate    : $scope.convertToDate,
                        Issue_Number     : loop.issue_number,
                        actions          : []
                    };
                    if (loop.actions.length > 0) {
                        loop.actions = loop.actions.replace(new RegExp('\n', 'g'), ',');
                        var actions = loop.actions.split(',');
                        for (var i=0; i<actions.length; i++) {
                            var action = actions[i].split(':');
                            var obj = {
                                    id : action[0],
                                    label : action[1],
                                    status : action[2]
                            }
                            $rootScope.GN_M005_Issue.actions.push(obj);
                        }
                    }
            };
            displayIssue ();

            $scope.transactionData = null;
            
            function displayIssue () {
                getIssue().then(function (result){
                    if ($rootScope.GN_M005_Issue.data == undefined) {
                        pullIssues().then(function (result){
                            getIssue().then(function (result){
                                displayIssue();
                            }, function (error) {});
                        }, function (error) {});
                    } 
                    else {
                        if ($rootScope.SY_M013_MessageDetails == undefined || $rootScope.SY_M013_MessageDetails.messageTransactionDate == undefined) {
                            parseIssue ();
                            getIssueTransaction();
                            getIssueFlow();
                        }
                        else {
                            var messageTime = moment($rootScope.SY_M013_MessageDetails.row.server_transaction_date,'YYYY-MM-DD HH:mm:ss');
                            var issueTime = moment($rootScope.GN_M005_Issue.data.server_transaction_date,'YYYY-MM-DD HH:mm:ss');
                            var diff = (messageTime-issueTime);//ms
                            if (diff > 3000) {
                                    pullIssues().then(function (result){
                                        $rootScope.SY_M013_MessageDetails.messageTransactionDate = undefined;
                                        displayIssue();
                                    }, function (error) {
                                        $rootScope.SY_M013_MessageDetails.messageTransactionDate = undefined;
                                        displayIssue();
                                        WingsDialogService.error('Issue is out of sync! ');
                                    });
                            }
                            else {
                                parseIssue ();
                                getIssueTransaction();
                                getIssueFlow();
                            }
                        }
                    }
                }, function (error) {});
                
            };
            function getIssue() {
                var deferred = $q.defer();
                var issueNumber = $rootScope.GN_M005_Issue.Issue_Number;
                var sql = "Select Id,                                                      " +
                          "       Issue_Number issue_number,                               " +
                          "       Processed_By_Employee_Name processed_by_employee_name ,  " +
                          "       Description description,                                 " +
                          "       Subject subject,                                         " +
                          "       Status status,                                           " +
                          "       Actions actions,                                         " +
                          "       Server_Transaction_Date server_transaction_date,         " +
                          "       Div_No div_no,                                           " +
                          "       response_action_id response_action_id,                   " +
                          "       Response_Remark response_remark,                         " +
                          "       Response_Status response_status,                         " +
                          "       Mobile_Record_Id mobile_record_id,                       " +
                          "       Server_Feedback server_feedback,                         " +
                          "       Data                                                     " +
                          "  From Gn_Issues                                                " +
                          " Where Div_No       = ?                                         " +
                          "   And Issue_Number = ?                                         ";
                
                var parameters = [$rootScope.globals.currentUser.divNo,issueNumber];
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    if (result.length > 0) {
                        $rootScope.GN_M005_Issue.data = result[0];
                    }
                    return deferred.resolve("GOHEAD");
                }, function (error) {
                    WingsDialogService.error(JSON.stringify(error));
                    console.log('GN_M005 - ERROR'+JSON.stringify(error));
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });
                return deferred.promise;
            }
            function getIssueTransaction () {
                var issueNumber = $rootScope.GN_M005_Issue.row.issue_number;
                var sql =  "Select Div_No,                             " +
                           "       Issue_Number,                       " +
                           "       Status,                             " +
                           "       Action,                             " +
                           "       Queue,                              " +
                           "       Remarks,                            " +
                           "       Processed_By_Employee_Name,         " +
                           "       Id,                                 " +
                           "       Dt_Created                          " +
                           "  From Gn_Issue_Transactions a             " +
                           " Where Div_No = 1                          " +
                           "   And Issue_Number = ?                    " +
                           " Order By Dt_Created Desc                  ";
                
                var parameters = [issueNumber];
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    for (var a = 0;a<result.length;a++) {
                        result[a].DT_CREATED = moment(result[a].DT_CREATED).format('DD MMMM YY, HH:mm')
                    }
                    $scope.transactionData = result;
                }, function (error) {
                    WingsDialogService.error(JSON.stringify(error));
                    console.log('GN_M005 - ERROR'+JSON.stringify(error));
                });
            }
            
            function getIssueFlow () {
                var issueNumber = $rootScope.GN_M005_Issue.row.issue_number;
                
                var sql = "Select a.Div_No,                                                                                                               " +
		                  "       a.Issue_Type,                                                                                                           " +
		                  "       a.Issue_Type_Version,                                                                                                   " +
		                  "       a.Issue_Number,                                                                                                         " +
		                  "       a.Id  As ISSUE_ID,                                                                                                      " +
		                  "       a.Status ISSUE_STATUS,                                                                                                  " +
		                  "       b.Type,                                                                                                                 " +
		                  "       b.Id,                                                                                                                   " +
		                  "       b.Node,                                                                                                                 " +
		                  "       b.PositionX,                                                                                                            " +
		                  "       b.PositionY,                                                                                                            " +
		                  "		  Case When b.Type =  'NODE' Then b.Label                                                                                 " +
		                  "			   Else (Case When b.Action = 'CANCEL' Then                                                                           " +
		                  "				        (Select Case When Count(0) = 0 Then ' ' Else b.Label End                                                  " +
		                  "						   From Gn_Issue_Transactions c                                                                           " +
		                  "						  Where b.Type                               = 'EDGE'                                                     " +
		                  "							And c.Div_No                             = a.Div_No                                                   " +
		                  "							And c.Issue_Number                       = a.Issue_Number                                             " +
		                  "							And ifnull(c.Queue,'_FINAL_')            = b.To_Node                                                  " +
		                  "							And c.Action                             = b.Action                                                   " +
		                  "							And ifnull(c.Edge_Id,-1)                 = ifnull(b.Id,-1))                                           " +
		                  "						  Else (Case When b.Transition_Type                  = 'TIMER' Then                                       " +
		                  "							         (Select Case When Count(0) = 0 Then ' ' Else b.Label End                                     " +
		                  "									    From Gn_Issue_Transactions c                                                              " +
		                  "									   Where b.Type                    = 'EDGE'                                                   " +
		                  "										 And c.Div_No                  = a.Div_No                                                 " +
		                  "										 And c.Issue_Number            = a.Issue_Number                                           " +
		                  "										 And ifnull(c.Queue,'_FINAL_') = b.To_Node                                                " +
		                  "										 And c.Action                  = b.Action                                                 " +
		                  "										 And c.Edge_Id                 = b.Id)                                                    " +
		                  "								       Else b.Label End) End )                                                                    " +
		                  "          End as LABEL,                                                                                                        " +
		                  "          b.Tooltip TOOLTIP,                                                                                                   " +
		                  "          b.To_Node,                                                                                                           " +
		                  "          b.Action,                                                                                                            " +
		                  "		  Case When b.Type = 'NODE' Then                                                                                          " +
		                  "              (Select Case When b.Node = a.Queue Then '#FFFF00'                                                                " +
		                  "                           Else (Case When Count(0) = 0 Then b.Color                                                           " +
		                  "                                      Else (Case When ifnull(b.Node,'_FINAL_')||a.Status = '_FINAL_CANCELLED' Then '#FF0000'   " +
		                  "                                                 Else '#33FF33' End ) End ) End                                                " +
		                  "                 From Gn_Issue_Transactions c                                                                                  " +
		                  "                Where b.Type                             = 'NODE'                                                              " +
		                  "                  And c.Div_No                           = a.Div_No                                                            " +
		                  "                  And c.Issue_Number                     = a.Issue_Number                                                      " +
		                  "                  And (ifnull(c.Queue,         '_FINAL_')   = b.Node))                                                         " +
		                  "               Else  (Select Case When Count(0) = 0 Then b.Color Else '#00CC00' End                                            " +
		                  "                        From Gn_Issue_Transactions c                                                                           " +
		                  "                       Where b.Type                    = 'EDGE'                                                                " +
		                  "                         And c.Div_No                  = a.Div_No                                                              " +
		                  "                         And c.Issue_Number            = a.Issue_Number                                                        " +
		                  "                         And ifnull(c.Queue,'_FINAL_') = b.To_Node                                                             " +
		                  "                         And c.Action                  = b.Action                                                              " +
		                  "                         And c.Edge_Id                 = b.Id)                                                                 " +
		                  "          End as COLOR                                                                                                         " +
		                  "     From Gn_Issues              a,                                                                                            " +
		                  "          Gn_Issue_Type_Workflow b                                                                                             " +
		                  "    Where a.Div_No             = ?                                                                                             " +
		                  "      And b.Div_No             = a.Div_No                                                                                      " +
		                  "      And b.Issue_Type         = a.Issue_Type                                                                                  " +
		                  "      And b.Issue_Type_Version = a.Issue_Type_Version                                                                          " +
		                  "      And a.Issue_Number         = ?                                                                                             ";
                
                var parameters = [$rootScope.globals.currentUser.divNo,issueNumber];
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    var nodesArray = [];
                    var edgesArray = [];
                     for (var i=0; i<result.length; i++) {
                         var baseObjectR = result[i];
                         if (baseObjectR.TYPE == 'NODE') {
                             nodesArray.push ({
                                 'id'         : baseObjectR.NODE,
                                 'label'      : baseObjectR.LABEL,
                                 'title'      : baseObjectR.TOOLTIP,
                                 'x'          : baseObjectR.POSITIONX,
                                 'y'          : baseObjectR.POSITIONY,
                                 'color'      : baseObjectR.COLOR,
                                 'borderWidth': 2,
                                 'shadow'     : true
                             });
                         } else if (baseObjectR.TYPE == 'EDGE') {
                             edgesArray.push ({
                                 'id'     : baseObjectR.ID,
                                 'from'   : baseObjectR.NODE,
                                 'to'     : baseObjectR.TO_NODE,
                                 'color'  : baseObjectR.COLOR,
                                 'arrows' : 'to',
                                 'shadow' : true,
                                 'font'   : {align: 'top'},
                                 'label'  : baseObjectR.LABEL,
                                 'title'  : baseObjectR.TOOLTIP
                             });
                         }
                     }
                     nodes = new vis.DataSet(nodesArray);
                     edges = new vis.DataSet(edgesArray);
                     var container = document.getElementById('mynetwork');
                     var data = {
                       nodes: nodes,
                       edges: edges
                     };
                     var options = {autoResize:true,
                     layout: {
                         randomSeed: 120,
                         improvedLayout:false,
                         hierarchical: {
                             enabled:false,
                             levelSeparation: 150,
                             direction: 'UD',   // UD, DU, LR, RL
                             sortMethod: 'hubsize' // hubsize, directed
                         }
                    },
                    physics:{
                        enabled: true,
                        barnesHut: {
                            gravitationalConstant: -2000,
                            centralGravity: 0.2,
                            springLength: 120,
                            springConstant: 0.04,
                            damping: 0.09,
                            avoidOverlap: 0.1
                        },
                        forceAtlas2Based: {
                            gravitationalConstant: -50,
                            centralGravity: 0.01,
                            springConstant: 0.08,
                            springLength: 100,
                            damping: 0.4,
                            avoidOverlap: 0
                        },
                        repulsion: {
                            centralGravity: 0.2,
                            springLength: 200,
                            springConstant: 0.05,
                            nodeDistance: 100,
                            damping: 0.09
                        },
                        hierarchicalRepulsion: {
                            centralGravity: 0.0,
                            springLength: 100,
                            springConstant: 0.01,
                            nodeDistance: 120,
                            damping: 0.09
                        },
                        maxVelocity: 50,
                        minVelocity: 1,
                        solver: 'barnesHut',
                        stabilization: {
                            enabled: true,
                            iterations: 1000,
                            updateInterval: 100,
                            onlyDynamicEdges: true,
                            fit: true
                        },
                        timestep: 0.8,
                        adaptiveTimestep: true
                    }};
                    $scope.network = new vis.Network(container, data, options);
                    $scope.network.fit()
                }, function (error) {
                    WingsDialogService.error(JSON.stringify(error));
                    console.log('GN_M005 - ERROR'+JSON.stringify(error));
                });
            }
            
            $scope.toggle = function(prop) {
                eval("$scope."+ prop +"="+"!$scope."+ prop );
                if (prop == 'isFlowShown') {
                    if ($scope.isFlowShown) {
                        $scope.isDataShown = false;
                        $scope.isTransShown = false;
                        $timeout(function() {
                            $scope.network.fit();
                        }, 250);
                    }
                }
                if (prop == 'isDataShown') {
                    if ($scope.isDataShown) {
                        $scope.isFlowShown = false;
                        $scope.isTransShown = false;
                    }
                }
                if (prop == 'isTransShown') {
                    if ($scope.isTransShown) {
                        $scope.isFlowShown = false;
                        $scope.isDataShown = false;
                    }
                }
            };

            $scope.strcolor = function (str) { // java String#hashCode
                if (str != undefined) {
                    var hash = 0;
                    for (var i = 0; i < str.length; i++) {
                        hash = str.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    var c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
                    return "#"+("00000".substring(0, 6 - c.length) + c);  
                }
            };
            $scope.executeAction = function () {
                var sql = " Update gn_issues set response_action_id    = ?, " +
                          "                      response_remark       = ?, " +
                          "                      response_action_label = ?, " +
                          "                      response_status       = ?  " +
                          "  Where Mobile_Record_Id = ?;                   ";
                var parameters = [$scope.activeAction.id,
                                  $rootScope.GN_M005_Issue.response_remark,
                                  $scope.activeAction.label,
                                  $scope.activeAction.status,
                                  $rootScope.GN_M005_Issue.row.mobile_record_id];  
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    $scope.modal.hide();
                    pushIssues ().then(function (result){
                        pullIssues().then(function (result){
                            displayIssue();
                            WingsDialogService.success();
                            $rootScope.$emit('onExecuteAction');
                        });
                    }, function (error) {
                    });
                    return deferred.resolve("GOHEAD");
                }, function (error) {
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });  
                return deferred.promise;
               
            };
            
            $scope.showModal = function (action) {
                $scope.activeAction = action;
                $scope.popover.hide();
                $scope.modal.show();
                $timeout(function() {
                    WingsUtil.Focus('area');
                }, 200);
            };
            $scope.firstletter = function (str) {
                if (str != undefined) {
                    return str.charAt(0).toUpperCase();
                }
            };
            $ionicModal.fromTemplateUrl('templates/onSave.html', {
                scope: $scope
            }).then(function(modal) {
                $scope.modal = modal;
            });
            $scope.convertToDate = function (stringDate){
                var dateOut = moment(stringDate,'YYYY-MM-DD HH:mm').format('DD/MM/YYYY HH:mm')
                return dateOut;
            };
            $ionicPopover.fromTemplateUrl('templates/popover.html', {
                scope: $scope,
            }).then(function(popover) {
                $scope.popover = popover;
            });
              //DUBLICATE CODE //
            function pushIssues () {
                var deferred = $q.defer();
                var sql = "Select *                           " +
                          "  From Gn_Issues                   " +
                          " Where Response_Status != ''       " +
                          "   And Response_Status Is Not Null ";
                var parameters = [];
                var builders = []; 
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    if(result.length < 1) {
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
                            if(result2[i].isSuccess == 'false') {
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
                            return deferred.resolve("GOHEAD");
                        },function (error) {}
                        );  
                   },function (error) {
                        console.log("ERROR " + error.status +" MESSAGE : "+error.message);
                    }
                    );
                }, function (error) {
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });  
                return deferred.promise;
            };
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
          //DUBLICATE CODE //
        }
  ])