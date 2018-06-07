angular.module('WingsMobileStarter').controller('IC_M055', [
    '$scope',
    'WingsRemoteDbService',
    '$cordovaBarcodeScanner',
    'WingsUtil',
    'WingsDialogService',
    '$q',
    function($scope,WingsRemoteDbService,$cordovaBarcodeScanner,WingsUtil,WingsDialogService,$q) {
        console.log("IC_M055");
        $scope.isReadOnly = false;
        $rootScope.IC_M055 = {
            tags:''
        }
        $scope.IC_M055 = {
                WORK_CARD_ID             : '',
                WORK_CARD                : '',
                ISSUE_TO_EMPLOYEE_NUMBER : '',
                REQUISITION              : '',
                ALLOCATIONS              : []
        };
        $scope.displayIssues = function () {
            var deferred = $q.defer();
            var sql = "Select Allocation_Id ALLOCATION_ID,                       " +
                      "       Tag_Number TAG_NUMBER,                             " +
                      "       Part_Number PART_NUMBER,                           " +
                      "       Description DESCRIPTION,                           " +
                      "       Location LOCATION,                                 " +
                      "       Status STATUS,                                     " +
                      "       Condition_Code CONDITION_CODE,                     " +
                      "       Serial_Number SERIAL_NUMBER,                       " +
                      "       Lot_Number LOT_NUMBER,                             " +
                      "       Expire_Date EXPIRE_DATE,                           " +
                      "       Requisition_Number REQUISITION_NUMBER,             " +
                      "       Quantity QUANTITY,                                 " +
                      "       Issue_Quantity ISSUE_QUANTITY,                     " +
                      "       Issue_Flag ISSUE_FLAG,                             " +
                      "       Work_Card WORK_CARD,                               " +
                      "       Work_Card_Id WORK_CARD_ID,                         " +
                      "       Issue_To_Employee_Number ISSUE_TO_EMPLOYEE_NUMBER, " +
                      "       Server_Feedback SERVER_FEEDBACK                    " +
                      " From Ic_Allocations                                      ";
            var parameters = [];
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                if (result.length > 0) {
                    $scope.IC_M055.WORK_CARD_ID = result[0].WORK_CARD_ID;
                    $scope.IC_M055.WORK_CARD = result[0].WORK_CARD;
                    $scope.IC_M055.ISSUE_TO_EMPLOYEE_NUMBER = result[0].ISSUE_TO_EMPLOYEE_NUMBER;
                    $scope.IC_M055.ALLOCATIONS = result; 
                    $scope.isReadOnly = true;
                } else {
                    WingsUtil.Focus('workcard');
                }
                return deferred.resolve("GOHEAD");
            }, function (error) {
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });  
            return deferred.promise;
        };
        $scope.displayIssues();
        $scope.register = function () {
            if (!WingsUtil.IsNull($scope.IC_M055.WORK_CARD_ID)) {
                $rootScope.IC_M055.tags = $scope.IC_M055;
                $state.go('app.IC_M055_Issue');
                return false;
            }
            $scope.IC_M055.REQUISITION = ($scope.IC_M055.REQUISITION).toUpperCase();
            var userNumber = $rootScope.globals.currentUser.userNumber;
            var divNo  = $rootScope.globals.currentUser.divNo;
            var myBuilder = new StoredFuncProcBuilder('Mb_Apps.Issue_Register',
                                                      'i_Div_No',                    divNo,
                                                      'i_Work_Card',                 $scope.IC_M055.WORK_CARD,
                                                      'i_Issued_To_Employee_Badge',  $scope.IC_M055.ISSUE_TO_EMPLOYEE_NUMBER,
                                                      'i_Issued_By_Employee_Number', userNumber,
                                                      'i_Requisition_Number',        ($scope.IC_M055.REQUISITION).toUpperCase(),
                                                      'o_Data','');
            
            var myFuncArray = [myBuilder.queryObject()];
            var strSql = JSON.stringify(myFuncArray);
            WingsRemoteDbService.executeFunction(strSql).then(function (dataIn) {
                dataIn[0] = JSON.parse(dataIn[0]);
                if (dataIn[0].isSuccess =='true'  && dataIn[0].errorText == '') {
                    WingsRemoteDbService.HandleFeedback(dataIn[0]);
                    var tags = angular.fromJson(dataIn[0].result.o_Data);
                    //$rootScope.IC_M055.tags = tags;
                    var bindings    = [];
                    var parameters  = [];
                    var sqlTags  = "INSERT OR REPLACE INTO Ic_Allocations (Allocation_Id,            " +
                                   "                                       Tag_Number,               " +
                                   "                                       Part_Number,              " +
                                   "                                       Description,              " +
                                   "                                       Location,                 " +
                                   "                                       Status,                   " +
                                   "                                       Condition_Code,           " +
                                   "                                       Serial_Number,            " +
                                   "                                       Lot_Number,               " +
                                   "                                       Expire_Date,              " +
                                   "                                       Requisition_Number,       " +
                                   "                                       Quantity,                 " +
                                   "                                       Issue_Quantity,           " +
                                   "                                       Issue_Flag,               " +
                                   "                                       Work_Card,                " +
                                   "                                       Work_Card_Id,             " +
                                   "                                       Issue_To_Employee_Number, " +
                                   "                                       Server_Feedback)          " +
                                   "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);                      ";
                    for (var i=0; i<tags.ALLOCATIONS.length; i++) {
                        parameters = [tags.ALLOCATIONS[i].ALLOCATION_ID,
                                      tags.ALLOCATIONS[i].TAG_NUMBER,
                                      tags.ALLOCATIONS[i].PART_NUMBER,
                                      tags.ALLOCATIONS[i].DESCRIPTION,
                                      tags.ALLOCATIONS[i].LOCATION,
                                      tags.ALLOCATIONS[i].STATUS,
                                      tags.ALLOCATIONS[i].CONDITION_CODE,
                                      tags.ALLOCATIONS[i].SERIAL_NUMBER,
                                      tags.ALLOCATIONS[i].LOT_NUMBER,
                                      tags.ALLOCATIONS[i].EXPIRE_DATE,
                                      tags.ALLOCATIONS[i].REQUISITION_NUMBER,
                                      tags.ALLOCATIONS[i].QUANTITY,
                                      tags.ALLOCATIONS[i].QUANTITY,
                                      false,
                                      tags.WORK_CARD,
                                      tags.WORK_CARD_ID,
                                      tags.ISSUED_TO_EMPLOYEE_NUMBER,
                                      ''];
                        bindings.push(parameters);
                    }
                    WingsTransactionDBService.insertCollection(sqlTags,bindings).then(function (result){
                        $scope.displayIssues().then(function (result){
                            $rootScope.IC_M055.tags = $scope.IC_M055;
                            $state.go('app.IC_M055_Issue');
                        });
                    }, function (error) {console.log('IC_M055 tags error'+error);});
                } else {
                    WingsRemoteDbService.HandleFeedback(dataIn[0]);
                }
            }, function (response) {
                WingsUtil.Log("ERROR " + response.status +" MESSAGE : "+response.message);
                WingsDialogService.errorHide('Connection Error.Please check your connection and try again.');
            });
        };
        function parseWorkCard (workCardId) {
            var myBuilder = new StoredFuncProcBuilder('Mb_Apps.Parse_Work_Card',
                                                      'i_Work_Card',             workCardId,
                                                      'o_Work_Order_Number',     '',
                                                      'o_Zone_Number',           '',
                                                      'o_Item_Number',           '');

            var myFuncArray = [myBuilder.queryObject()];
            var strSql = JSON.stringify(myFuncArray);
            WingsRemoteDbService.executeFunction(strSql).then(function (dataIn) {
                $scope.IC_M055.WORK_CARD=angular.fromJson(dataIn[0]).result.Result;
            }, function (response) {
                WingsUtil.Log("ERROR " + response.status +" MESSAGE : "+response.message);
            });
        };
        $scope.deleteLocalRecords = function () {
            WingsDialogService.confirm('Local records will be removed.Are you sure?','Confirm','OK,Cancel').then(function(buttonIndex) {
                if (buttonIndex == 1) {
                    var sql = 'delete from ic_allocations';
                    var parameters = [];
                    WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                        $scope.reset();
                    }, function (error) {console.log('IC_M055 tags error'+error);});
                }
            });
        };

        $scope.scanBarcode = function (scanObj) {
            $cordovaBarcodeScanner.scan().then(function(barcodeData) {
                console.log('SCAN DATA     '+barcodeData.text);
                barcodeData.text = barcodeData.text.replace("*","");
                if (scanObj == 'workcard') {
                    parseWorkCard(barcodeData.text);
                    WingsUtil.Focus('issueTo');
                } else if(scanObj == 'issueTo') {
                    $scope.IC_M055.issueTo = Number(barcodeData.text);
                    WingsUtil.Focus('requisition');
                } else if(scanObj == 'requisition') {
                    $scope.IC_M055.REQUISITION = barcodeData.text;
                }
            }, function(error) {
                console.log('Error',error);
            });
        };
        $rootScope.$on('IssueCompleted', function(){
            var sql = 'delete from ic_allocations';
            var parameters = [];
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                $scope.reset();
            }, function (error) {console.log('IC_M055 tags error'+error);});
        });
        $scope.setScanObj = function (obj) {
            $scope.scanObj = obj;
        };
        
        $scope.reset = function(){
            $scope.IC_M055 = {
                    WORK_CARD_ID             : '',
                    WORK_CARD                : '',
                    ISSUE_TO_EMPLOYEE_NUMBER : '',
                    REQUISITION              : '',
                    ALLOCATIONS              : []
            };
            $scope.isReadOnly = false;
        };
    } 
])