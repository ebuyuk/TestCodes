angular.module('WingsMobileStarter').controller('IC_M055.Issue', [
    '$scope',
    'WingsRemoteDbService',
    '$cordovaBarcodeScanner',
    'WingsUtil',
    'WingsDialogService',
    '$ionicModal',
    '$ionicSlideBoxDelegate',
    '$rootScope',
    '$ionicScrollDelegate',
    '$ionicPopover',
    '$ionicPlatform',
    '$ionicHistory',
    function($scope,WingsRemoteDbService,$cordovaBarcodeScanner,WingsUtil,WingsDialogService,$ionicModal,$ionicSlideBoxDelegate,$rootScope,$ionicScrollDelegate,$ionicPopover,$ionicPlatform,$ionicHistory) {
        console.log("IC_M055_Issue");
        $scope.details = {
                ALLOCATION_ID:'',
                TAG_NUMBER:'',
                PART_NUMBER : '',
                DESCRIPTION : '',
                LOCATION : '',
                STATUS : '',
                CONDITION_CODE : '',
                SERIAL_NUMBER:'',
                LOT_NUMBER:'',
                EXPIRE_DATE:'',
                REQUISITION_NUMBER:'',
                QUANTITY:'',
                ISSUE_QUANTITY : '',
                ISSUE_FLAG : ''
        };
        
        $scope.tagList = [];
        $rootScope.IC_M055.tags.ALLOCATIONS.forEach(function(element) {
           var tag = {
                    ALLOCATION_ID:element.ALLOCATION_ID,
                    TAG_NUMBER:element.TAG_NUMBER,
                    PART_NUMBER : element.PART_NUMBER,
                    DESCRIPTION : element.DESCRIPTION,
                    LOCATION : element.LOCATION,
                    STATUS : element.STATUS,
                    CONDITION_CODE : element.CONDITION_CODE,
                    SERIAL_NUMBER:element.SERIAL_NUMBER,
                    LOT_NUMBER:element.LOT_NUMBER,
                    EXPIRE_DATE:element.EXPIRE_DATE,
                    REQUISITION_NUMBER:element.REQUISITION_NUMBER,
                    QUANTITY:element.QUANTITY,
                    ISSUE_QUANTITY : element.ISSUE_QUANTITY,
                    ISSUE_FLAG : (element.ISSUE_FLAG == 'true')
            }
           $scope.tagList.push(tag);
        });
        
        $scope.pushIssue = function (){
            var userNumber = $rootScope.globals.currentUser.userNumber;
            var divNo  = $rootScope.globals.currentUser.divNo;
            var allocationIdList = [];
            var quantityList = [];
            for (i in $scope.tagList) {
                if ($scope.tagList[i].ISSUE_FLAG == 'true'||$scope.tagList[i].ISSUE_FLAG == true) {
                    allocationIdList.push($scope.tagList[i].ALLOCATION_ID);
                    quantityList.push($scope.tagList[i].ISSUE_QUANTITY);
                }
            }
            var myBuilder = new StoredFuncProcBuilder('Mb_Apps.Issue',
                                                      'i_Div_No',                    divNo,
                                                      'i_Work_Card_Id',              $rootScope.IC_M055.tags.WORK_CARD_ID,
                                                      'i_Allocation_Id_List',        allocationIdList.join(','),
                                                      'i_Quantity_List',             quantityList.join(','),
                                                      'i_Requisition_Number',        ($rootScope.IC_M055.tags.REQUISITION).toUpperCase(),
                                                      'i_Issued_To_Employee_Number', $rootScope.IC_M055.tags.ISSUE_TO_EMPLOYEE_NUMBER,
                                                      'i_Issued_By_Employee_Number', userNumber);

            var myFuncArray = [myBuilder.queryObject()];
            var strSql = JSON.stringify(myFuncArray);
            WingsRemoteDbService.executeFunction(strSql).then(function (dataIn) {
                dataIn[0] = JSON.parse(dataIn[0]);
                if (dataIn[0].isSuccess =='true'  && dataIn[0].errorText == '') {
                    WingsRemoteDbService.HandleFeedback(dataIn[0]);
                    $ionicHistory.goBack();
                    $rootScope.$emit('IssueCompleted');
                } else {
                    WingsRemoteDbService.HandleFeedback(dataIn[0]);
                }
            }, function (response) {
                WingsUtil.Log("ERROR " + response.status +" MESSAGE : "+response.message);
            });
        };
        
        $scope.populateTag = function () {
            if (WingsUtil.IsNull($scope.details.TAG_NUMBER)) {
                return false;
            }
            var userNumber = $rootScope.globals.currentUser.userNumber;
            var divNo  = $rootScope.globals.currentUser.divNo;
            var myBuilder = new StoredFuncProcBuilder('Mb_Apps.Issue_Add',
                                                      'i_Div_No',                    divNo,
                                                      'i_Work_Card_Id',              $rootScope.IC_M055.tags.WORK_CARD_ID,
                                                      'i_Tag_Number',                $scope.details.TAG_NUMBER,
                                                      'i_Requisition_Number',        '',
                                                      'i_Issued_To_Employee_Number', $rootScope.IC_M055.tags.ISSUE_TO_EMPLOYEE_NUMBER,
                                                      'i_Issued_By_Employee_Number', userNumber,
                                                      'o_Data','');
            
            var myFuncArray = [myBuilder.queryObject()];
            var strSql = JSON.stringify(myFuncArray);
            WingsRemoteDbService.executeFunction(strSql).then(function (dataIn) {
                dataIn[0] = JSON.parse(dataIn[0]);
                if (dataIn[0].isSuccess =='true'  && dataIn[0].errorText == '') {
                    var tag = angular.fromJson(dataIn[0].result.o_Data);
                    $scope.details = {
                            TYPE:'NEW',
                            ALLOCATION_ID      : tag.ALLOCATION_ID,
                            TAG_NUMBER         : tag.TAG_NUMBER,
                            PART_NUMBER        : tag.PART_NUMBER,
                            DESCRIPTION        : tag.DESCRIPTION,
                            LOCATION           : tag.LOCATION,
                            STATUS             : tag.STATUS,
                            CONDITION_CODE     : tag.CONDITION_CODE,
                            SERIAL_NUMBER      : tag.SERIAL_NUMBER,
                            LOT_NUMBER         : tag.LOT_NUMBER,
                            EXPIRE_DATE        : tag.EXPIRE_DATE,
                            REQUISITION_NUMBER : tag.REQUISITION_NUMBER,
                            QUANTITY           : tag.QUANTITY,
                            ISSUE_QUANTITY     : tag.QUANTITY==1?tag.QUANTITY:'',
                            ISSUE_FLAG         : true
                    }
                   
                } else {
                    if (dataIn[0].errorText != '') {
                        var tag = angular.fromJson(dataIn[0].result.o_Data);
                        if (!WingsUtil.IsNull(tag)) {
                            $scope.details = {
                                    TYPE:'NEW',
                                    ALLOCATION_ID : '',
                                    TAG_NUMBER:'',
                                    PART_NUMBER : tag.PART_NUMBER,
                                    DESCRIPTION : tag.DESCRIPTION,
                                    LOCATION : tag.LOCATION,
                                    STATUS : tag.STATUS,
                                    CONDITION_CODE : tag.CONDITION_CODE,
                                    SERIAL_NUMBER:tag.SERIAL_NUMBER,
                                    LOT_NUMBER:tag.LOT_NUMBER,
                                    EXPIRE_DATE:tag.EXPIRE_DATE,
                                    REQUISITION_NUMBER:tag.REQUISITION_NUMBER,
                                    QUANTITY:tag.QUANTITY,
                                    ISSUE_QUANTITY : tag.QUANTITY==1?tag.QUANTITY:'',
                                    ISSUE_FLAG : true
                            }
                        }
                        $scope.details.TAG_NUMBER='';
                        WingsDialogService.errorHide(dataIn[0].errorText);
                        WingsUtil.Focus('tagNumber');
                    }
                }
            }, function (response) {
                WingsUtil.Log("ERROR " + response.status +" MESSAGE : "+response.message);
            });
        };

        $scope.openModal = function (tag) {
            if (!WingsUtil.IsNull(tag)) {
                $scope.details = tag;
            } else {
                $scope.details = {
                        TYPE:'NEW',
                        TAG_NUMBER:'',
                        PART_NUMBER : '',
                        DESCRIPTION : '',
                        LOCATION : '',
                        STATUS : '',
                        CONDITION_CODE : '',
                        SERIAL_NUMBER:'',
                        LOT_NUMBER:'',
                        EXPIRE_DATE:'',
                        REQUISITION_NUMBER:'',
                        QUANTITY:'',
                        ISSUE_QUANTITY : '',
                        ISSUE_FLAG : ''
                }
                $timeout(function() {
                    WingsUtil.Focus('tagNumber');
                }, 200);  
            }
            $scope.modal.show();
            
        };
        $scope.closeModal = function () {
            if ($scope.details.TYPE == 'NEW' && !WingsUtil.IsNull($scope.details.ALLOCATION_ID)) {
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
                    parameters = [$scope.details.ALLOCATION_ID,
                                  $scope.details.TAG_NUMBER,
                                  $scope.details.PART_NUMBER,
                                  $scope.details.DESCRIPTION,
                                  $scope.details.LOCATION,
                                  $scope.details.STATUS,
                                  $scope.details.CONDITION_CODE,
                                  $scope.details.SERIAL_NUMBER,
                                  $scope.details.LOT_NUMBER,
                                  $scope.details.EXPIRE_DATE,
                                  $scope.details.REQUISITION_NUMBER,
                                  $scope.details.QUANTITY,
                                  $scope.details.ISSUE_QUANTITY,
                                  $scope.details.ISSUE_FLAG,
                                  $rootScope.IC_M055.tags.WORK_CARD,
                                  $rootScope.IC_M055.tags.WORK_CARD_ID,
                                  $rootScope.IC_M055.tags.ISSUED_TO_EMPLOYEE_NUMBER,
                                  ''];
                    bindings.push(parameters);
                    
                    var obj = _.find($scope.tagList, {'ALLOCATION_ID': $scope.details.ALLOCATION_ID });
                    if (obj == undefined) {
                    	$scope.tagList.push($scope.details);
                    }
                WingsTransactionDBService.insertCollection(sqlTags,bindings).then(function (result){
                }, function (error) {console.log('IC_M055 new tags error'+error);});
            }
            $scope.modal.hide();
        };
        $scope.onFlagChange = function (tag) {
            if (WingsUtil.IsNull(tag.ISSUE_QUANTITY)) {
                tag.ISSUE_QUANTITY = tag.QUANTITY;
            }
        };
        $scope.quantityControl = function () {
            if ($scope.details.ISSUE_QUANTITY > $scope.details.QUANTITY)
                $scope.details.ISSUE_QUANTITY = $scope.details.QUANTITY;
        }
        
        $scope.scanBarcode = function (scanObj) {
            $cordovaBarcodeScanner.scan().then(function(barcodeData) {
                  console.log('SCAN DATA     '+barcodeData.text);
                  barcodeData.text = barcodeData.text.replace("*","");
                  if (scanObj == 'tagNumber') {
                      $scope.details.TAG_NUMBER = Number(barcodeData.text);
                      $scope.populateTag();
                      WingsUtil.Focus('quantity');
                  } 
              }, function(error) {
                  console.log('Error',error);
              });
        };
        $scope.setScanObj = function (obj) {
            $scope.scanObj = obj;
        };
        $ionicModal.fromTemplateUrl('templates/edit.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
        });
    } 
])