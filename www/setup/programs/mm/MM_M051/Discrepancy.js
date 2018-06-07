angular.module('WingsMobileStarter').controller('MM_M051.Discrepancy', [
        '$scope','$rootScope','$ionicModal','$ionicPopup','WingsDialogService','$ionicHistory','$q','$state','WingsUtil',
        function($scope,$rootScope, $ionicModal, $ionicPopup,WingsDialogService,$ionicHistory,$q,$state,WingsUtil) {
            console.log("MM_M051.Discrepancy");
            var defaultTailNumber = $rootScope.globals.deviceInformation.tailNumber;
            var WingsQRef=$q;
            $scope.now = new Date;
            $scope.stations = [];
            $scope.discrepancyTypes = [];
            $scope.discrepancyTemplates = [];
            $scope.documents = [];
            $scope.deferReasons = [];
            $scope.employees = [];
            $scope.ataCodes = [];
            $scope.categories= [];
            $scope.viewMode = 'insert';
            var currentState = $state.current;
            if(!WingsUtil.IsNull( $rootScope.MM_M051_Discrepancy_id)) {
                $scope.viewMode = 'update';
                Query();
            }
            $scope.discrepancy = {
                reportDate:$scope.now,
                employeeName:$rootScope.globals.currentUser.userName,
                station:'',
                employeeNumber:$rootScope.globals.currentUser.userNumber,
                tailNumber:$rootScope.globals.deviceInformation.tailNumber,
                discrepancy : {
                    description:'',
                    ataCode:''
                },
                remarks:'',
                document:'',
                taskNumber:'',
                reference:'',
                category:'',
                deferReason:'',
                repetitiveFlag:'',
                intervalHour:'',
                intervalCycle:'',
                intervalDay:'',
                status:'OPEN',
                acceptanceFlag:'N',
                defer: {
                    holdByNumber:$rootScope.globals.currentUser.userNumber,
                    holdByName:$rootScope.globals.currentUser.userName
                },
                close : {
                    rectByNumber:$rootScope.globals.currentUser.userNumber,
                    rectByName:$rootScope.globals.currentUser.userName
                },
                inspection : {
                    employee:{
                        insByNumber:'',
                        insByName:''
                    },
                    date:'',
                    station:''
                    
                }
            }
            $scope.setStatus = function(){
                if ($scope.discrepancy.close.date != '' && $scope.discrepancy.close.date != undefined) {
                    $scope.discrepancy.status = 'CLOSED';
                } else if($scope.discrepancy.document != '') {
                    $scope.discrepancy.status = 'DEFERED';
                }else {
                    $scope.discrepancy.status = 'OPEN';
                }
                $scope.discrepancy.reference = '';
            };
            $scope.onselect = function(newValue,oldValue){
                $scope.discrepancy.discrepancy.description = newValue.DESCRIPTION;
                $scope.discrepancy.discrepancy.ataCode = newValue.ATA_CODE;
            };
            $scope.onDocumentChanged = function () {
                sy.GetTableRows("Select * From Mm_Mel_Items Where Div_No = ? And Active = 'Y' Order By Document_Number",[$rootScope.globals.currentUser.divNo]).then(function(result){
                    $scope.references = result;
                }); 
                $scope.setStatus();
            };
            
            $scope.onSelectRef = function(newValue,oldValue){
                $scope.discrepancy.reference = newValue.ITEM_NUMBER
                $scope.discrepancy.category = newValue.CATEGORY;
                $scope.discrepancy.acceptanceFlag = newValue.ACCEPTANCE_REQUIRED_FLAG;
                var obj = _.find($scope.categories, function(o) { return o.CATEGORY == newValue.CATEGORY ; });
                if (WingsUtil.IsNull(obj)) {
                    $scope.discrepancy.intervalHour = '';
                    $scope.discrepancy.intervalCycle = '';
                    $scope.discrepancy.intervalDay = '';
                } else {
                    $scope.discrepancy.intervalHour = obj.INTERVAL_TIME;
                    $scope.discrepancy.intervalCycle = obj.INTERVAL_CYCLE;
                    $scope.discrepancy.intervalDay = obj.INTERVAL_DAY;
                }
            };
            $scope.onSelectCat = function(newValue,oldValue){
                $scope.discrepancy.category = newValue.CATEGORY;
                $scope.discrepancy.intervalHour = newValue.Interval_Time;
                $scope.discrepancy.intervalCycle = newValue.INTERVAL_CYCLE;
                $scope.discrepancy.intervalDay = newValue.INTERVAL_DAY;
            };
            
            sy.GetTableRows("Select * From Mm_Flight_Locations Where Div_No = ? And Active = 'Y' Order By Flight_Location",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.stations = result;
            }); 
            
            sy.GetTableRows("Select * From Mm_Discrepancy_Types Where Div_No = ? And Active = 'Y' Order By Discrepancy_Type",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.discrepancyTypes = result;
            }); 
            
            sy.GetTableRows("Select * From Mm_Discrepancy_Templates Where Div_No = ? And Active = 'Y' Order By Title",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.discrepancyTemplates = result;
            });
            
            sy.GetTableRows("Select * From Mm_Documents Where Div_No = ? And Discrepancy_Flag = ? And Mel_Flag = ? And Status = ? And Active = 'Y' Order By Document_Number",[$rootScope.globals.currentUser.divNo,'Y','N','OPEN']).then(function(result){
                $scope.documents = result;
            });
            
            sy.GetTableRows("Select * From Mm_Defer_Reasons Where Div_No = ? And Active = 'Y' Order By Defer_Reason",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.deferReasons = result;
            });
            
            sy.GetTableRows("Select * From Lb_Employees Where Div_No = ? And Active = 'Y' Order By Employee_Number",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.employees = result;
            });
            
            sy.GetTableRows("Select * From Pr_Ata_Codes Where Div_No = ? And Active = 'Y' Order By Ata_Code",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.ataCodes = result;
            }); 
            
            sy.GetTableRows("Select * From Mm_Discrepancy_Categories Where Div_No = ? And Aircraft_Type = ? And Active = 'Y'",[$rootScope.globals.currentUser.divNo,$rootScope.MM_M051_AircraftType]).then(function(result){
                $scope.categories = result;
            }); 
            
            $scope.Save = function () {
                if (WingsUtil.IsNull($scope.discrepancy.type) || WingsUtil.IsNull($scope.discrepancy.reportDate) || WingsUtil.IsNull($scope.discrepancy.station) || WingsUtil.IsNull($scope.discrepancy.discrepancy.ataCode)) {
                    WingsDialogService.error('Please fill columns !');
                    return false;
                }
                var sql = "Insert Into MM_DISCREPANCIES (Div_No,Discrepancy_Number,Tail_Number,Discrepancy_Type,ATA_CODE,STATUS,FLIGHT_ID,DISCREPANCY,       " +
                          "       CORRECTIVE_ACTION,ORDER_NUMBER,REPORT_DATE,REPORTED_BY_EMPLOYEE_NUMBER,REPORTED_STATION,RECTIFICATION_DATE,             " +
                          "       RECTIFIED_BY_EMPLOYEE_NUMBER,RECTIFIED_STATION,INSPECTED_DATE,INSPECTED_BY_EMPLOYEE_NUMBER,INSPECTED_STATION,           " +
                          "       OPEN_REFERENCE_NUMBER,CLOSE_REFERENCE_NUMBER,HOLD_DOCUMENT_NUMBER,HOLD_TASK_NUMBER,HOLD_REFERENCE_NUMBER,CATEGORY,      " +
                          "       DEFER_REASON,REPETITIVE_FLAG,INTERVAL_HOUR,INTERVAL_CYCLE,INTERVAL_DAY,HOLD_BY_EMPLOYEE_NUMBER,ACCEPTANCE_REQUIRED_FLAG," +
                          "       ACCEPTED_FLIGHTS,INTERNAL_COMMENT)                                                                                      " +
                          "     Values (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
               console.log("save discrepceny");
                var closeDate = '';
               var insDate = '';
                if ($scope.discrepancy.close.date != '' && $scope.discrepancy.close.date != undefined) {
                    closeDate = moment($scope.discrepancy.close.date).format('YYYY-MM-DD');
                }
                if ($scope.discrepancy.inspection.date != '' && $scope.discrepancy.inspection.date != undefined) {
                    insDate = moment($scope.discrepancy.inspection.date).format('YYYY-MM-DD');
                }
                var parameters = ['',
                                  defaultTailNumber,
                                  $scope.discrepancy.type,
                                  $scope.discrepancy.discrepancy.ataCode,
                                  $scope.discrepancy.status,
                                  $rootScope.globals.flightId,
                                  $scope.discrepancy.discrepancy.description,
                                  $scope.discrepancy.correctiveAction,
                                  '',
                                  moment($scope.discrepancy.reportDate).format('YYYY-MM-DD'),
                                  $scope.discrepancy.employeeNumber,
                                  $scope.discrepancy.station,
                                  closeDate,
                                  $scope.discrepancy.close.rectByNumber,
                                  $scope.discrepancy.close.station,
                                  insDate,
                                  $scope.discrepancy.inspection.employee.insByNumber,
                                  $scope.discrepancy.inspection.station,
                                  '',
                                  '',
                                  $scope.discrepancy.document,
                                  $scope.discrepancy.taskNumber,
                                  $scope.discrepancy.reference,
                                  $scope.discrepancy.category,
                                  $scope.discrepancy.deferReason,
                                  $scope.discrepancy.repetitiveFlag,
                                  $scope.discrepancy.intervalHour,
                                  $scope.discrepancy.intervalCycle,
                                  $scope.discrepancy.intervalDay,
                                  $scope.discrepancy.defer.holdByNumber,
                                  $scope.discrepancy.acceptanceFlag,
                                  '',
                                  $scope.discrepancy.remarks];
                
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    WingsDialogService.success();
                    $rootScope.$emit('onDiscrepancyCreate');
                    $rootScope.$emit('refreshDefects');
                    $ionicHistory.goBack();
                    return deferred.resolve("GOHEAD");
                }, function (error) {
                    WingsDialogService.error(JSON.stringify(error));
                    console.log(JSON.stringify(error));
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });
                return deferred.promise;
            };
            function Query () {

                var sql = " Select *                      " +
                          "   From MM_DISCREPANCIES a     " +
                          "  Where a.Mobile_Record_Id = ? ";
                var parameters = [ $rootScope.MM_M051_Discrepancy_id];
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    if(result.length > 0) {
                        $scope.discrepancy.type = result[0].DISCREPANCY_TYPE;
                        $scope.discrepancy.discrepancy.ataCode= result[0].ATA_CODE;
                        $scope.discrepancy.status = result[0].STATUS;
                        $rootScope.globals.flightId = result[0].FLIGHT_ID;
                        $scope.discrepancy.discrepancy.description = result[0].DISCREPANCY;
                        $scope.discrepancy.correctiveAction = result[0].CORRECTIVE_ACTION;
                        $scope.discrepancy.reportDate = new Date(result[0].REPORT_DATE);
                        $scope.discrepancy.employeeNumber = result[0].REPORTED_BY_EMPLOYEE_NUMBER;
                        $scope.discrepancy.station = result[0].REPORTED_STATION;
                        if(result[0].RECTIFICATION_DATE != '') {
                            $scope.discrepancy.close.date = new Date(result[0].RECTIFICATION_DATE);
                        }
                        $scope.discrepancy.close.rectByNumber = result[0].RECTIFIED_BY_EMPLOYEE_NUMBER;
                        $scope.discrepancy.close.station = result[0].RECTIFIED_STATION;
                        $scope.discrepancy.inspection.date = new Date(result[0].INSPECTED_DATE);
                        $scope.discrepancy.inspection.employee.insByNumber = result[0].INSPECTED_BY_EMPLOYEE_NUMBER;
                        $scope.discrepancy.inspection.station = result[0].INSPECTED_STATION;
                        $scope.discrepancy.document = result[0].HOLD_DOCUMENT_NUMBER;
                        if(result[0].HOLD_TASK_NUMBER != '' && result[0].HOLD_TASK_NUMBER != undefined) {
                            $scope.discrepancy.taskNumber = result[0].HOLD_TASK_NUMBER;
                        }
                        $scope.discrepancy.reference = result[0].HOLD_REFERENCE_NUMBER;
                        $scope.discrepancy.category = result[0].CATEGORY;
                        $scope.discrepancy.deferReason = result[0].DEFER_REASON;
                        $scope.discrepancy.repetitiveFlag = result[0].REPETITIVE_FLAG;
                        $scope.discrepancy.intervalHour = result[0].INTERVAL_HOUR;
                        $scope.discrepancy.intervalCycle = result[0].INTERVAL_CYCLE;
                        $scope.discrepancy.intervalDay = result[0].INTERVAL_DAY;
                        $scope.discrepancy.defer.holdByNumber = result[0].HOLD_BY_EMPLOYEE_NUMBER;
                        $scope.discrepancy.acceptanceFlag = result[0].ACCEPTANCE_REQUIRED_FLAG;
                        $scope.discrepancy.remarks = result[0].INTERNAL_COMMENT;
                        getEmployeeName(result[0].INSPECTED_BY_EMPLOYEE_NUMBER).then(function (dataIn) {
                            var jsonObj = angular.fromJson(dataIn);
                            $scope.discrepancy.inspection.employee.insByName = jsonObj;
                            return deferred.resolve("GOHEAD");

                        }, function (error) {
                            return deferred.reject("Login-Error : " +JSON.stringify(error));
                        });
                        getEmployeeName(result[0].REPORTED_BY_EMPLOYEE_NUMBER).then(function (dataIn) {
                            var jsonObj = angular.fromJson(dataIn);
                            $scope.discrepancy.employeeName = jsonObj;
                            return deferred.resolve("GOHEAD");

                        }, function (error) {
                            return deferred.reject("Login-Error : " +JSON.stringify(error));
                        });
                        getEmployeeName(result[0].RECTIFIED_BY_EMPLOYEE_NUMBER).then(function (dataIn) {
                            var jsonObj = angular.fromJson(dataIn);
                            $scope.discrepancy.close.rectByName = jsonObj;
                            return deferred.resolve("GOHEAD");

                        }, function (error) {
                            return deferred.reject("Login-Error : " +JSON.stringify(error));
                        });
                        getEmployeeName(result[0].HOLD_BY_EMPLOYEE_NUMBER).then(function (dataIn) {
                            var jsonObj = angular.fromJson(dataIn);
                            $scope.discrepancy.defer.holdByName = jsonObj;
                            return deferred.resolve("GOHEAD");

                        }, function (error) {
                            return deferred.reject("Login-Error : " +JSON.stringify(error));
                        });
                    }
                    return deferred.resolve("GOHEAD");
                }, function (error) {
                    console.log(JSON.stringify(error));
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });
                return deferred.promise;
            };
            $scope.Update = function () {
                var sql = "Update MM_DISCREPANCIES Set Div_No = 1," +
                          "                        Discrepancy_Number = ?," +
                          "                        Discrepancy_Type = ?," +
                          "                        ATA_CODE = ?," +
                          "                        STATUS = ?," +
                          "                        FLIGHT_ID = ?," +
                          "                        DISCREPANCY = ?," +
                          "                        CORRECTIVE_ACTION = ?," +
                          "                        ORDER_NUMBER = ?," +
                          "                        REPORT_DATE = ?," +
                          "                        REPORTED_BY_EMPLOYEE_NUMBER = ?," +
                          "                        REPORTED_STATION = ? ," +
                          "                        RECTIFICATION_DATE = ? ,             " +
                          "                        RECTIFIED_BY_EMPLOYEE_NUMBER = ? ," +
                          "                        RECTIFIED_STATION = ? ," +
                          "                        INSPECTED_DATE = ? ," +
                          "                        INSPECTED_BY_EMPLOYEE_NUMBER = ? ," +
                          "                        INSPECTED_STATION = ? ,           " +
                          "                        OPEN_REFERENCE_NUMBER = ? ," +
                          "                        CLOSE_REFERENCE_NUMBER = ? ," +
                          "                        HOLD_DOCUMENT_NUMBER = ? ," +
                          "                        HOLD_TASK_NUMBER = ? ," +
                          "                        HOLD_REFERENCE_NUMBER = ? ," +
                          "                        CATEGORY = ? ,      " +
                          "                        DEFER_REASON = ? ," +
                          "                        REPETITIVE_FLAG = ? ," +
                          "                        INTERVAL_HOUR = ? ," +
                          "                        INTERVAL_CYCLE = ? ," +
                          "                        INTERVAL_DAY = ? ," +
                          "                        HOLD_BY_EMPLOYEE_NUMBER = ? ," +
                          "                        ACCEPTANCE_REQUIRED_FLAG = ? ," +
                          "                        INTERNAL_COMMENT = ?   " +
                          " Where Mobile_Record_Id = ?";
                var closeDate = '';
                var insDate = '';
                if ($scope.discrepancy.close.date != '' && $scope.discrepancy.close.date != undefined) {
                    closeDate = moment($scope.discrepancy.close.date).format('YYYY-MM-DD');
                }
                if ($scope.discrepancy.inspection.date != '' && $scope.discrepancy.inspection.date != undefined) {
                    insDate = moment($scope.discrepancy.inspection.date).format('YYYY-MM-DD');
                }
                var parameters = ['',
                                  $scope.discrepancy.type,
                                  $scope.discrepancy.discrepancy.ataCode,
                                  $scope.discrepancy.status,
                                  $rootScope.globals.flightId,
                                  $scope.discrepancy.discrepancy.description,
                                  $scope.discrepancy.correctiveAction,
                                  '',
                                  moment($scope.discrepancy.reportDate).format('YYYY-MM-DD'),
                                  $scope.discrepancy.employeeNumber,
                                  $scope.discrepancy.station,
                                  closeDate,
                                  $scope.discrepancy.close.rectByNumber,
                                  $scope.discrepancy.close.station,
                                  insDate,
                                  $scope.discrepancy.inspection.employee.insByNumber,
                                  $scope.discrepancy.inspection.station,
                                  '',
                                  '',
                                  $scope.discrepancy.document,
                                  $scope.discrepancy.taskNumber,
                                  $scope.discrepancy.reference,
                                  $scope.discrepancy.category,
                                  $scope.discrepancy.deferReason,
                                  $scope.discrepancy.repetitiveFlag,
                                  $scope.discrepancy.intervalHour,
                                  $scope.discrepancy.intervalCycle,
                                  $scope.discrepancy.intervalDay,
                                  $scope.discrepancy.defer.holdByNumber,
                                  $scope.discrepancy.acceptanceFlag,
                                  $scope.discrepancy.remarks,
                                  $rootScope.MM_M051_Discrepancy_id];
                
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    WingsDialogService.success();
                    $rootScope.$emit('onDiscrepancyCreate');
                    $rootScope.$emit('refreshDefects');
                    $ionicHistory.goBack();
                    return deferred.resolve("GOHEAD");
                }, function (error) {
                    WingsDialogService.error(JSON.stringify(error));
                    console.log(JSON.stringify(error));
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });
                return deferred.promise;
            };
            $scope.Delete = function () {
                var buttonArray= ['Ok','Cancel'];
                WingsDialogService.confirm('Are you sure to delete record?','Confirm',buttonArray).then(function(buttonIndex) {
                    // no button = 0, 'Ok' = 1, 'Cancel' = 2
                    var btnIndex = buttonIndex;
                    if(buttonIndex == 1) {
                        var sql = " Delete from MM_DISCREPANCIES     " +
                                  "  Where Mobile_Record_Id = ?      ";
                        var parameters = [$rootScope.MM_M051_Discrepancy_id];
                       WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                           WingsDialogService.success();
                           $rootScope.$emit('onDiscrepancyCreate');
                           $rootScope.$emit('refreshDefects');
                           $ionicHistory.goBack();
                           return deferred.resolve("GOHEAD");
                       }, function (error) {
                           console.log(JSON.stringify(error));
                           return deferred.reject("Login-Error : " +JSON.stringify(error));
                       });
                       return deferred.promise;
                    }
                  });
               
            };
            $scope.Read = function () {
                var sql = " Select *                      " +
                          "   From MM_DISCREPANCIES a     " ;
                WingsTransactionDBService.executeSql(sql).then(function (result){
                    return deferred.resolve("GOHEAD");
                }, function (error) {
                    console.log(JSON.stringify(error));
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });
                return deferred.promise;
            };
            function getEmployeeName (number) {
                var deferred = $q.defer();
                var sql = 'Select employee_name ' +
                           ' From LB_EMPLOYEES   ' +
                           'where EMPLOYEE_NUMBER = ? ';
                var parameters = [number]
             /*   WingsSetupDBService.executeSql(sql,parameters).then(function (result){
                    var results = [];
                if(result.length > 0) {
                    results.push(result[0].EMPLOYEE_NAME);
                }
                return deferred.resolve(results);
                }, function (error) {
                    console.log(JSON.stringify(error));
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                }); */
                return deferred.promise;  
            };
            
            
            //COMPONENT TRANSACTIONS
            
            $scope.transaction = {
                    partOff:'',
                    serialOff:'',
                    partOn:'',
                    serialOn:'',
                    position:''
            }
            $scope.clearTransaction = function () {
                $scope.transaction = {
                        partOff:'',
                        serialOff:'',
                        partOn:'',
                        serialOn:'',
                        position:''
                }
            }
            $scope.transactions = [];
            getTransactions();
            $scope.saveTransaction = function () {
                if (WingsUtil.IsNull($rootScope.MM_M051_Discrepancy_id)) {
                    WingsDialogService.errorHide('Save discrepacy before adding transaction.');
                    return false;
                }
                var sql = "Insert Into Mm_Component_Transactions (Div_No,OFF_COMPONENT_NUMBER,OFF_SERIAL_NUMBER,ON_COMPONENT_NUMBER,ON_SERIAL_NUMBER,POSITION,DISCREPANCY_ID) "+
                          "     Values (?,?,?,?,?,?,?)";
                var parameters = [$rootScope.globals.currentUser.divNo,
                                  $scope.transaction.partOff,
                                  $scope.transaction.serialOff,
                                  $scope.transaction.partOn,
                                  $scope.transaction.serialOn,
                                  $scope.transaction.position,
                                  $rootScope.MM_M051_Discrepancy_id];
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    getTransactions();
                }, function (error) {
                    WingsDialogService.error(JSON.stringify(error));
                    console.log(JSON.stringify(error));
                });
            };
            $scope.deleteTransaction = function (id) {
                var sql = "Delete From Mm_Component_Transactions where Mobile_Record_Id = ?;"
                var parameters = [id];
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    getTransactions();
                }, function (error) {
                    WingsDialogService.error(JSON.stringify(error));
                    console.log(JSON.stringify(error));
                });
            };
            
            function getTransactions () {
                var sql = "Select *                         " +
                          "  From Mm_Component_Transactions " +
                          " Where Discrepancy_Id = ?        " ;
                  var parameters = [$rootScope.MM_M051_Discrepancy_id];
                  WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                      $scope.transactions = result;
                  }, function (error) {
                      WingsDialogService.error(JSON.stringify(error));
                      console.log(JSON.stringify(error));
                  });           
            }
            $scope.toggle = function(prop) {
                eval("$scope."+ prop +"="+"!$scope."+ prop );
                if(prop == 'isClosedShown') {
                    if($scope.isClosedShown) {
                        $scope.isDeferShown = false;
                    }
                }
                if(prop == 'isDeferShown') {
                    if($scope.isDeferShown) {
                        $scope.isClosedShown = false;
                    }
                }
            };
            
            $ionicModal.fromTemplateUrl('Cabin.html', {
                scope: $scope
            }).then(function(modal) {
                $scope.modal = modal;
            });
           
            $ionicModal.fromTemplateUrl('Cabinp.html', {
                scope: $scope
            }).then(function(modalSeats) {
                $scope.modalSeats = modalSeats;
            });
            
            $scope.openModalSeats = function() {
                
                $scope.cancelBtn={
                        State: false,
                        Text:   "",
                    
                                    };
                $scope.btns = [{
                    label: "Handset impossible to stow",
                    dir: "handset.png",
                    state: false
                }, {
                    label: "Handset damaged",
                    dir: "SY_M000.png",
                    state: false
                }, {
                    label: "Handset keyboard damaged",
                    dir: "handset.png",
                    state: false
                   
                }, {
                    label: "Handset display inop",
                    dir: "SY_M000.png",
                    state: false
                }, {
                    label: "Handset housing damaged",
                    dir: "handset.png",
                    state: false
                   
                }, {
                    label: "Handset cable torn",
                    dir: "SY_M000.png",
                    state: false
                }, {
                    label: "Handset cable roll up inop",
                    dir: "handset.png",
                    state: false
                    
                }, {
                    label: "Earphone-jack clogged",
                    dir: "SY_M000.png",
                    state: false
                }, {
                    label: "Earphone-jack mono only",
                    dir: "handset.png",
                    state: false
                   
                }, {
                    label: "Earphone-jack no audio",
                    dir: "SY_M000.png",
                    state: false
                }, {
                    label: "Earphone-jack not in position",
                    dir: "handset.png",
                    state: false
                    
                },     ];
                
                $scope.modalSeats.show();
              };
            
            $ionicModal.fromTemplateUrl('CabinIFE.html', {
                scope: $scope
            }).then(function(modalIFE) {
                $scope.modalIFE = modalIFE;
            });
            
            $scope.openModalIFE = function(){
                
                $scope.cancelBtn={
                        State: false,
                        Text:   "",
                    
                                    };
                $scope.btnsIFE =[{
                    label: "Handset impossible to stow",
                    dir: "handset.png",
                    state: false
                }, {
                    label: "Handset damaged",
                    dir: "SY_M000.png",
                    state: false
                }, {
                    label: "Handset impossible to stow",
                    dir: "handset.png",
                    state: false
                }, {
                    label: "Handset damaged",
                    dir: "SY_M000.png",
                    state: false
                    }];
                
                $scope.modalIFE.show();
            };
            
            $ionicModal.fromTemplateUrl('CabinLights.html', {
                scope: $scope
            }).then(function(modalLights) {
                $scope.modalLights = modalLights;
            });
            
            $scope.openModalLights = function(){
                
                $scope.cancelBtn={
                        State: false,
                        Text:   "",
                    
                                    };
              
                
                $scope.btnsLights =[{
                    label: "Ltest",
                    dir: "SY_M000.png",
                    state: false
                }, {
                    label: "Ltest2",
                    dir: "handset.png",
                    state: false
                }, {
                    label: "Ltest3",
                    dir: "SY_M000.png",
                    state: false
                }, {
                    label: "Ltest 4",
                    dir: "handset.png",
                    state: false
                    }];
                
                
                $scope.modalLights.show();
                
                
            };
            
            $ionicModal.fromTemplateUrl('CabinDoors.html', {
                scope: $scope
            }).then(function(modalDoors) {
                $scope.modalDoors = modalDoors;
            });
            
            $scope.openModalDoors = function(){
                
                
                $scope.cancelBtn={
                        State: false,
                        Text:   "",
                    
                                    };
              
                
                
                
                $scope.btnsDoors =[{
                    label: "Dtest",
                    dir: "SY_M000.png",
                    state: false
                }, {
                    label: "Dtest2",
                    dir: "handset.png",
                    state: false
                }, {
                    label: "Dtest3",
                    dir: "SY_M000.png",
                    state: false
                }, {
                    label: "Dtest 4",
                    dir: "handset.png",
                    state: false
                    }];
                
                $scope.modalDoors.show();
                
                
            };
           
            
            $ionicModal.fromTemplateUrl('CabinFAP.html', {
                scope: $scope
            }).then(function(modalFAP) {
                $scope.modalFAP = modalFAP;
            });
            
            $scope.openModalFAP = function() {
                
                $scope.cancelBtn={
                        State: false,
                        Text:   "",
                    
                                    };
              
             
                
                $scope.btnsFAP =[{
                    label: "Ftest",
                    dir: "handset.png",
                    state: false
                }, {
                    label: "Ftest2",
                    dir: "SY_M000.png",
                    state: false
                }, {
                    label: "Ftest3",
                    dir: "handset.png",
                    state: false
                }, {
                    label: "Ftest 4",
                    dir: "SY_M000.png",
                    state: false
                    },];
                
                $scope.modalFAP.show();
                
                
            };
            
            $ionicModal.fromTemplateUrl('CabinOHB.html', {
                scope: $scope
            }).then(function(modalOHB) {
                $scope.modalOHB = modalOHB;
            });
            
            $scope.openModalOHB = function(){
                
                $scope.cancelBtn={
                        State: false,
                        Text:   "",
                    
                                    };
              
               
                
                $scope.btnsOHB =[{
                    label: "Otest",
                    dir: "SY_M000.png",
                    state: false
                }, {
                    label: "Otest2",
                    dir: "handset.png",
                    state: false
                }, {
                    label: "Otest3",
                    dir: "SY_M000.png",
                    state: false
                }, {
                    label: "Otest 4",
                    dir: "handset.png",
                    state: false
                    }];
                
                $scope.modalOHB.show();
                
            };
            
            $ionicModal.fromTemplateUrl('CabinMCD.html', {
                scope: $scope
            }).then(function(modalMCD) {
                $scope.modalMCD = modalMCD;
            });
            
            $scope.openModalMCD = function(){
                
                $scope.cancelBtn={
                        State: false,
                        Text:   "",
                    
                                    };
              
               
                $scope.btnsMCD =[{
                    label: "Mtest",
                    dir: "SY_M000.png",
                    state: false
                }, {
                    label: "Mtest2",
                    dir: "handset.png",
                    state: false
                }, {
                    label: "Mtest3",
                    dir: "SY_M000.png",
                    state: false
                }, {
                    label: "Mtest 4",
                    dir: "handset.png",
                    state: false
                    }];
                
                $scope.modalMCD.show();
            };
            
            $scope.cancelBtn={
                    State: false,
                    Text:   "",
                
                                };
            $scope.ft = "";
            $scope.fts = true;
            var act_seat = '';

            $scope.closeWithRemove = function() {
                $scope.modalSeats.remove()
                .then(function() {
                    $scope.modalSeats = null;
                });
            };

            $scope.getNumber = function(num) {
                return new Array(parseInt(num, 10));
            };

            $scope.getTimes=function(n){
                return new Array(n);
            };
            
            

            
            $scope.toggleb= function () {
                this.b.state = !this.b.state;
            };
            $scope.fttoggle = function()
            {
                this.cancelBtn.State = !this.cancelBtn.State;
               
            };

           
            
            $scope.discrepancyTypeCheck = function (Type)
            {
                
                switch(Type){
                
                case "Seats":
          
                    $scope.savecabin($scope.btns, "Seats", $scope.cancelBtn);
                    break;
                    
                case "IFE":
                    
                    $scope.savecabin($scope.btnsIFE, "IFE", $scope.cancelBtn);
                    break;
                case "Lights":
                    
                    $scope.savecabin($scope.btnsLights, "Lights", $scope.cancelBtn);
                    break;
                case "Doors":

                    $scope.savecabin($scope.btnsDoors, "Doors", $scope.cancelBtn);
                    break;
                case "FAP":

                    $scope.savecabin($scope.btnsFAP, "FAP", $scope.cancelBtn);
                    break;
                case "OHB":

                    $scope.savecabin($scope.btnsOHB, "OHB", $scope.cancelBtn);
                    break;
                case "MCD":

                    $scope.savecabin($scope.btnsMCD, "MCD", $scope.cancelBtn);
                    break;
                    
                    default: alert("error");
                    
                
            }};
            $scope.savecabin = function (Discrepancies, Type , Ocancel)
            {
                
            
                if(angular.isUndefined($scope.discrepancy.discrepancy.description))
                    $scope.discrepancy.discrepancy.description  = '';           
                
                for (var i = Discrepancies.length-1; i >= 0; -- i)
                {
                    if(Discrepancies[i].state)
                        $scope.discrepancy.discrepancy.description  = $scope.discrepancy.discrepancy.description +  act_seat + ' Seat ' + Discrepancies[i].label + " \n";
                }
                if(Ocancel.State)
                    $scope.discrepancy.discrepancy.description  =  $scope.discrepancy.discrepancy.description + "" + act_seat + " Seat " + Ocancel.Text + "\n";
                
                
                switch(Type){
                
                case "Seats":

                     $scope.modalSeats.hide();
                    break;
                    
                case "IFE":

                     $scope.modalIFE.hide();
                    break;
                    
                case "Lights":

                    $scope.modalLights.hide();
                    break;
                
                case "Doors":

                    $scope.modalDoors.hide();
                    break;
                
                case "FAP":
                    
                    $scope.modalFAP.hide();
                    break;
                
                case "OHB":

                    $scope.modalOHB.hide();
                    break;
                
                case "MCD":

                    $scope.modalMCD.hide();
                    break;
                    
                    default: alert("error");
                    
                
            }
              
                $scope.modal.hide();
                
                
                

            };
            
                
            
           
            $scope.showAlert = function(num,lt) {
                act_seat = num + '' + lt + '';
                var alertPopup = $ionicPopup.show({
                    title: num + '' + lt + ' ',
                    scope: $scope,
                    template: '<ion-list>'+
                              '<ion-item ng-click="openModalSeats();alertPopup.close();">Seats</ion-item>'+
                              '<ion-item ng-click="openModalIFE();alertPopup.close()">IFE</ion-item>'+
                              '<ion-item ng-click="openModalLights();alertPopup.close();">Lights</ion-item>'+
                              '<ion-item ng-click="openModalDoors();alertPopup.close();">Doors</ion-item>'+
                              '<ion-item ng-click="openModalFAP();alertPopup.close();">FAP</ion-item>'+
                              '<ion-item ng-click="openModalOHB();alertPopup.close();">Overhead Bin</ion-item>'+
                              '<ion-item ng-click="openModalMCD();alertPopup.close();">MCD</ion-item>'+
                              ' </ion-list>' ,
                    buttons: [{text: 'Cancel'}]
                });
                $scope.alertPopup = alertPopup;
                alertPopup.then(function(res) {
                });
            };

            $scope.showAlertg = function() {
                var alertPopup = $ionicPopup.show({
                    title: 'GENERAL ',
                    scope: $scope,
                    template: '<ion-list>'+
                              '<ion-item ng-click="">Doors</ion-item>'+
                              '<ion-item ng-click="">FAP</ion-item>'+
                              '<ion-item ng-click="">MCD</ion-item>'+
                              ' </ion-list>' ,
                    buttons: [{text: 'Cancel'}]
                });
                $scope.alertPopup = alertPopup;
                alertPopup.then(function(res) {
                });
            };

        }
])