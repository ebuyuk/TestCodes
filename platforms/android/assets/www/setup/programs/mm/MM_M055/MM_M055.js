angular.module('WingsMobileStarter').controller('MM_M055', [
        '$scope','$rootScope','$ionicModal','$ionicPopup','WingsDialogService','md5','$ionicHistory','WingsPouchDbSetupService','$ionicModal','$q','$ionicLoading','$state','WingsUtil','WingsRemoteDbService','$cordovaBarcodeScanner','sy',
        function($scope,$rootScope, $ionicModal, $ionicPopup,WingsDialogService,md5,$ionicHistory,WingsPouchDbSetupService,$ionicModal,$q,$ionicLoading,$state,WingsUtil,WingsRemoteDbService,$cordovaBarcodeScanner,sy) {
            console.log("MM_M055");
            var defaultTailNumber                 = $rootScope.globals.deviceInformation.tailNumber;
            var currentState            		  = $state.current;
            var aircraftType            		  = $rootScope.MM_M051_AircraftType;
            $scope.isAttachmentShown              = true;
            $scope.now                  		  = new Date;
            $scope.disabled             		  = false;
            $scope.componentTransactionVisibility = false;
            $scope.deferSectionVisibility         = true;
            $scope.viewMode             		  = 'insert';
            $scope.stations             		  = [];                                                                                                                                   
            $scope.discrepancyTypes     		  = [];
            $scope.discrepancyTemplates 		  = [];
            $scope.documents            		  = [];
            $scope.deferReasons         		  = [];
            $scope.employees            		  = [];
            $scope.ataCodes             		  = [];
            $scope.categories           		  = [];
            $scope.attachments                    = [];
            $scope.loadImage =  function (item) {
            	$rootScope.$broadcast('loading:show');
            	sy.LoadAttachments([item]).then(function (result) {
            		$rootScope.$broadcast('downloading:hide');
                	getAttachments();
				}, function (error) {
	            	$rootScope.$broadcast('loading:hide');
                    console.log(JSON.stringify(error));
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });
            }; 
            $scope.$watch('$root.SY_0002.savedFiles', function() {
	        	for (var i = 0;i<$rootScope.SY_0002.savedFiles.length;i++) {
	        		$scope.attachments.push({FILE_LOCATION:$rootScope.SY_0002.savedFiles[i]})
	        	}
        	});
            $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams, error) {
            	if (fromState.name == 'app.MM_M062'){
            		$scope.disabled = true;
            	} else {
            		$scope.disabled = $rootScope.MM_M051_Disabled;
            	}
            	if (fromState.name == 'app.MM_0052_TailStatus') {
            		$scope.componentTransactionVisibility = true;
            	} 
            	if (fromState.name == 'app.MM_0052_TailStatus' && $rootScope.MM_M055_FromState == 'Package') {
                    $scope.deferSectionVisibility = false;
            	}
            });
            $rootScope.$ionicGoBack = function() {
            	$('#sign055').remove();
            	/*$('#m055').siblings('.upper-canvas').remove();
            	$('#m055').parent('.canvas-container').before($('#m055'));
            	$('.canvas-container').remove();*/
            	$rootScope.MM_M055_FromState = undefined;
            	$ionicHistory.goBack();
            };
            $scope.openWorkCard = function() {
    	    	$rootScope.PR_M108 = {};
    	    	$rootScope.PR_M108.Discrepancy_Work_Card_Id = $scope.discrepancy.workCardId;
                $state.go('app.PR_M108');
    	    };
            $scope.user = {
            		username:$rootScope.globals.currentUser.userId,
            		password:''
            };
            $scope.discrepancy = {
                reportDate      : $scope.now,
                employeeName    : $rootScope.globals.currentUser.userName,
                station         : !WingsUtil.IsNull($rootScope.MM_M055_Stations)?$rootScope.MM_M055_Stations[0]:'',
                employeeNumber  : $rootScope.globals.currentUser.userNumber,
                tailNumber      : $rootScope.MM_M055_TailNumber,
                controlNumber   : $rootScope.MM_M055_ControlNumber,
                discrepancyNumber : '',
                discrepancy : {
                    description : '',
                    ataCode     : ''
                },
                aircraftType    : '',
                remarks         : '',
                document        : '',
                taskNumber      : '',
                reference       : '',
                category        : '',
                deferReason     : '',
                repetitiveFlag  : '',
                intervalHour    : '',
                intervalCycle   : '',
                intervalDay     : '',
                status          : 'OPEN',
                acceptanceFlag  : 'N',
                id              : '',
                workCardId      : '',
                defer : {
                    holdByNumber:'',
                    holdByName  :''
                },
                close : {
                    rectByNumber : '',
                    rectByName   : ''
                },
                inspection : {
                    employee : {
                        insByNumber: '',
                        insByName  : ''
                    },
                    date    : '',
                    station : !WingsUtil.IsNull($rootScope.MM_M055_Stations)?$rootScope.MM_M055_Stations[0]:'',
                }
            }
            if (!WingsUtil.IsNull( $rootScope.MM_M055_Discrepancy_id)) {
                $scope.viewMode = 'update';
                getDiscrepancy();
            }
            $scope.setStatus = function () {
                if ($scope.discrepancy.close.date != '' && $scope.discrepancy.close.date != undefined) {
                	$scope.discrepancy.close.rectByNumber              = $rootScope.globals.currentUser.userNumber;
                	$scope.discrepancy.close.rectByName                = $rootScope.globals.currentUser.userName;
                	$scope.discrepancy.close.station                   = $scope.discrepancy.station;
                	$scope.discrepancy.inspection.employee.insByNumber = $rootScope.globals.currentUser.userNumber;
                	$scope.discrepancy.inspection.employee.insByName   = $rootScope.globals.currentUser.userName;
                	$scope.discrepancy.inspection.station              = $scope.discrepancy.station;
                    $scope.discrepancy.defer.holdByNumber              = '';
                	$scope.discrepancy.defer.holdByName                = '';
                    $scope.discrepancy.status                          = 'CLOSED';
                } else if($scope.discrepancy.document != '') {
                    $scope.discrepancy.defer.holdByNumber              = $rootScope.globals.currentUser.userNumber;
                	$scope.discrepancy.defer.holdByName                = $rootScope.globals.currentUser.userName;
                	$scope.discrepancy.close.rectByNumber              = '';
                	$scope.discrepancy.close.rectByName                = '';
                	$scope.discrepancy.inspection.employee.insByNumber = '';
                	$scope.discrepancy.inspection.employee.insByName   = '';
                	$scope.discrepancy.inspection.station              = '';
                	$scope.discrepancy.status             = 'DEFERRED';
                }else {
                    $scope.discrepancy.defer.holdByNumber = '';
                	$scope.discrepancy.defer.holdByName   = '';
                	$scope.discrepancy.close.rectByNumber = '';
                	$scope.discrepancy.close.rectByName   = '';
                    $scope.discrepancy.status             = 'OPEN';
                }
                $scope.discrepancy.reference = '';
            };
            $scope.onselect = function (newValue,oldValue){
                $scope.discrepancy.discrepancy.description = newValue.DESCRIPTION;
                $scope.discrepancy.discrepancy.ataCode     = newValue.ATA_CODE;
            };
            $scope.onDocumentChanged = function () {
                $scope.setStatus();
            };
            
            $scope.onSelectRef = function (newValue,oldValue){
                $scope.discrepancy.reference = newValue.ITEM_NUMBER
                $scope.discrepancy.category = newValue.CATEGORY;
                $scope.discrepancy.acceptanceFlag = newValue.ACCEPTANCE_REQUIRED_FLAG;
                var obj = _.find($scope.categories, function(o) { return o.CATEGORY == newValue.CATEGORY ; });
                if (WingsUtil.IsNull(obj)) {
                    $scope.discrepancy.intervalHour  = '';
                    $scope.discrepancy.intervalCycle = '';
                    $scope.discrepancy.intervalDay   = '';
                } else {
                    $scope.discrepancy.intervalHour  = obj.INTERVAL_TIME;
                    $scope.discrepancy.intervalCycle = obj.INTERVAL_CYCLE;
                    $scope.discrepancy.intervalDay   = obj.INTERVAL_DAY;
                }
            };
            $scope.onSelectCat = function (newValue,oldValue) {
                $scope.discrepancy.category      = newValue.CATEGORY;
                $scope.discrepancy.intervalHour  = newValue.Interval_Time;
                $scope.discrepancy.intervalCycle = newValue.INTERVAL_CYCLE;
                $scope.discrepancy.intervalDay   = newValue.INTERVAL_DAY;
            };
            $scope.employeeOnselect = function (object,newValue,oldValue,column) {
            	if (column == 'INSPECTED') {
            		$scope.discrepancy.inspection.employee.insByNumber = newValue.EMPLOYEE_NUMBER;
            		$scope.discrepancy.inspection.employee.insByName   = newValue.EMPLOYEE_NAME;
            	} else if (column =='RECTIFIED') {
            		$scope.discrepancy.close.rectByNumber = newValue.EMPLOYEE_NUMBER;
            		$scope.discrepancy.close.rectByName   = newValue.EMPLOYEE_NAME;
            	}
            };
            $scope.onselectTailNumber = function (newValue,oldValue) {
                $scope.discrepancy.tailNumber   = newValue.TAIL_NUMBER;
                $scope.discrepancy.aircraftType = newValue.AIRCRAFT_TYPE;
                getCategories();
            };
            getCategories();
            
            sy.GetTableRows("Select * From Mm_Flight_Locations Where Div_No = ? And Active = 'Y' Order By Flight_Location",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.stations = result;
                if (!WingsUtil.IsNull($rootScope.MM_M055_Stations) && $rootScope.MM_M055_Stations.length > 1) {
                    $scope.stations = [];
                    for (x in $rootScope.MM_M055_Stations) {
                        var obj = _.find(result, function(o) { return o.FLIGHT_LOCATION == $rootScope.MM_M055_Stations[x]; });
                        if (obj != undefined) {
                            $scope.stations.push(obj);
                        }
                    }
                } 
            });
            
            sy.GetTableRows("Select * From Mm_Discrepancy_Templates Where Div_No = ? And Active = 'Y' Order By Title",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.discrepancyTemplates = result;
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
            
            sy.GetTableRows("Select * From Mm_Mel_Items Where Div_No = ? And Active = 'Y' ",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.references = result;
            });
            
            sy.GetTableRows("Select * From Pr_Aircrafts Where Div_No = ? And Engineering_Flag = ? And Active = 'Y' Order By Tail_Number",[$rootScope.globals.currentUser.divNo,'Y']).then(function(result){
                $scope.aircraftsLov = result;
            }); 
            
            $scope.discrepancyTypes = [];
            var discrepancyTypeSql = '';
            if ($scope.componentTransactionVisibility) {
                discrepancyTypeSql =  "Select * From Mm_Discrepancy_Types Where Div_No = ? And Marep_Flag = 'Y' And Active = 'Y' Order By Discrepancy_Type";
            } else if (1!=1) {
                discrepancyTypeSql =  "Select * From Mm_Discrepancy_Types Where Div_No = ? And Order_Flag = 'Y' And Active = 'Y' Order By Discrepancy_Type";
            } else {
                discrepancyTypeSql =  "Select * From Mm_Discrepancy_Types Where Div_No = ? And Pirep_Flag = 'Y' And Active = 'Y' Order By Discrepancy_Type";
            }   
            
            sy.GetTableRows(discrepancyTypeSql,[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.discrepancyTypes = result;
                if (result.length == 1) {
                    if ($scope.viewMode == 'insert')
                    $scope.discrepancy.type = result[0].DISCREPANCY_TYPE;
                    $timeout(function() {
                    }, 50);  
               }
            });
            
            sy.GetTableRows("Select * From Mm_Documents Where Div_No = ? And Discrepancy_flag = ? And Mel_Flag = ? And Status = ? And Active = 'Y' Order By Document_Number",[$rootScope.globals.currentUser.divNo,'Y','N','OPEN']).then(function(result){
                $scope.documents = result;
            });
            
            function getCategories () {
                sy.GetTableRows("Select * From Mm_Discrepancy_Categories Where Div_No = ? And Aircraft_Type = ? And Active = 'Y' ",[$rootScope.globals.currentUser.divNo,aircraftType]).then(function(result){
                    $scope.categoriess = result;
                });
            };
            $scope.$on('$destroy', function() {
                customeEventListener();
           });
            var customeEventListener = $rootScope.$on('DigitalSignFeedback', function(event, args) {
        		$scope.digitalSign = args.success;
        		if ($scope.digitalSign) {
        			if ($scope.viewMode == 'update') {
        				$scope.Update();
        			} else {
        				$scope.Save();
        			}
        		}
            });
            $scope.Save = function () {
                var errorText = "";
                if (WingsUtil.IsNull($scope.discrepancy.type)) {
                	errorText = "Type is required!";
                } else if (WingsUtil.IsNull($scope.discrepancy.reportDate)) {
                	errorText = "Report Date is required!";
                } else if (WingsUtil.IsNull($scope.discrepancy.station)) {
                	errorText = "Station is required!";
                } else if (WingsUtil.IsNull($scope.discrepancy.tailNumber)) {
                	errorText = "Tail Number is required!";
                } else if (WingsUtil.IsNull($scope.discrepancy.discrepancy.ataCode)) {
                	errorText = "Ata Code is required!"
                } /*else if (WingsUtil.IsNull($scope.discrepancy.controlNumber)) {
                	errorText = "Log Number is required!";
                }*/
                if (errorText != "") {
                	WingsDialogService.error(errorText);
                	return false;
                }
                if ($scope.discrepancy.status == 'CLOSED' || $scope.discrepancy.status == 'DEFERRED') {
                	document.activeElement.blur();
                	if ($scope.digitalSign != true) {
                		 $timeout(function() {
                    		 $scope.showModal();
                         },150);
                   		return false;
                	}else{
                		$scope.hide();
                	}
                }
                $rootScope.SY_M021 = null;
                var sql = "Insert Into Mm_Discrepancies (Div_No,                                                       " +
                		  "                              Discrepancy_Number,                                           " +
                		  "                              Tail_Number,                             	                   " +
                		  "                              Discrepancy_Type,                                             " +
                		  "                              Ata_Code,                                                     " +
                		  "                              Status,                                                       " +
                		  "                              Flight_Id,                                                    " +
                		  "                              Discrepancy,                                                  " +
                          "                              Corrective_Action,                                            " +
                          "                              Order_Number,                                                 " +
                          "                              Report_Date,                                                  " +
                          "                              Reported_By_Employee_Number,                                  " +
                          "                              Reported_Station,                                             " +
                          "                              Rectification_Date,                                           " +
                          "                              Rectified_By_Employee_Number,                                 " +
                          "                              Rectified_Station,                                            " +
                          "                              Inspected_Date,                                               " +
                          "                              Inspected_By_Employee_Number,                                 " +
                          "                              Inspected_Station,                                            " +
                          "                              Open_Reference_Number,                                        " +
                          "                              Close_Reference_Number,                                       " +
                          "                              Hold_Document_Number,                                         " +
                          "                              Hold_Task_Number,                                             " +
                          "                              Hold_Reference_Number,                                        " +
                          "                              Category,                                                     " +
                          "                              Defer_Reason,                                                 " +
                          "                              Repetitive_Flag,                                              " +
                          "                              Interval_Hour,                                                " +
                          "                              Interval_Cycle,                                               " +
                          "                              Interval_Day,                                                 " +
                          "                              Hold_By_Employee_Number,                                      " +
                          "                              Acceptance_Required_flag,                                     " +
                          "                              Accepted_Flights,                                             " +
                          //"                              Internal_Comment,                                             " +
                          "                              Log_Number,                                                   " +
                          "                              Mobile_Record_Status)                                         " +
                          "     Values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'READY') ";
                var closeDate = '';
                var insDate = '';
                if ($scope.discrepancy.close.date != '' && $scope.discrepancy.close.date != undefined) {
                    closeDate = moment($scope.discrepancy.close.date).format('YYYY-MM-DD');
                }
                if ($scope.discrepancy.inspection.date != '' && $scope.discrepancy.inspection.date != undefined) {
                    insDate = moment($scope.discrepancy.inspection.date).format('YYYY-MM-DD');
                }
                var parameters = [$rootScope.globals.currentUser.divNo,
                                  '',
                                  $scope.discrepancy.tailNumber,
                                  $scope.discrepancy.type,
                                  $scope.discrepancy.discrepancy.ataCode,
                                  $scope.discrepancy.status,
                                  $rootScope.globals.flightId,
                                  $scope.discrepancy.discrepancy.description.toUpperCase(),
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
                                 // $scope.discrepancy.remarks,
                                  $scope.discrepancy.controlNumber.toUpperCase()];
                
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
                	 WingsTransactionDBService.executeSql("Select Max(Mobile_Record_Id) Id From Mm_Discrepancies;",[]).then(function (result2){
                         var bindings = [];
                         for (var i in $rootScope.SY_0002.savedFiles) {
                             sy.InsertAttachment($rootScope.globals.currentUser.divNo,$rootScope.SY_0002.savedFiles[i],'MM_DISCREPANCIES','',result2[0].Id);
                         }
                         WingsDialogService.success();
  		                 $rootScope.$emit('onflightcreate');
                         $rootScope.$emit('refreshDefects');
                         $ionicHistory.goBack();
                         return deferred.resolve("GOHEAD");
                     }, function (error) {});
                	
                   
                }, function (error) {
                    WingsDialogService.error(JSON.stringify(error));
                    console.log(JSON.stringify(error));
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });
                return deferred.promise;
            };

    		$rootScope.SY_0002 = {};
			$rootScope.SY_0002.savedFiles = [];
    		function getAttachments () {
    			var attachmentParentId = $rootScope.MM_M055_Discrepancy_id;
	            if (!WingsUtil.IsNull($scope.discrepancy.id)) {
	            	attachmentParentId = $scope.discrepancy.id;
	                var sql = " Select *             " +
		                     "   From Gn_Images a                " +
		                     "  Where a.Parent_Id = ?     ";
	            } else {
	            	var sql = " Select *             " +
		                      "   From Gn_Images a               " +
		                      "  Where a.Mobile_Parent_Id = ?    ";
	            }
    		
				var parameters = [attachmentParentId];
				WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
					for (var i in result) {
						$rootScope.SY_0002.savedFiles.push(result[i].FILE_LOCATION);
					}
					$scope.attachments = result;
					var temp = $rootScope.SY_0002.savedFiles;
					$rootScope.SY_0002.savedFiles = [];
					$rootScope.SY_0002.savedFiles = temp;
				}, function (error) {
                    console.log(JSON.stringify(error));
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });
    		}
            function getDiscrepancy () {
                var sql = " Select *,                                                                                                                                                                   " +
                          "    (Select Employee_Name From Lb_Employees x Where x.Div_No = a.Div_No And Active = 'Y' And x.Employee_Number = a.REPORTED_BY_EMPLOYEE_NUMBER) REPORTED_BY_EMPLOYEE_NAME,   " +
                		  "    (Select Employee_Name From Lb_Employees x Where x.Div_No = a.Div_No And Active = 'Y' And x.Employee_Number = a.RECTIFIED_BY_EMPLOYEE_NUMBER) RECTIFIED_BY_EMPLOYEE_NAME, " +
                		  "	   (Select Employee_Name From Lb_Employees x Where x.Div_No = a.Div_No And Active = 'Y' And x.Employee_Number = a.INSPECTED_BY_EMPLOYEE_NUMBER) INSPECTED_BY_EMPLOYEE_NAME, " +
                		  "	   (Select Employee_Name From Lb_Employees x Where x.Div_No = a.Div_No And Active = 'Y' And x.Employee_Number = a.HOLD_BY_EMPLOYEE_NUMBER) HOLD_BY_EMPLOYEE_NAME            " +
                          "   From MM_DISCREPANCIES a     " +
                          "  Where a.Mobile_Record_Id = ? ";
                var parameters = [ $rootScope.MM_M055_Discrepancy_id];
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    if(result.length > 0) {
                    	try {
                        $scope.discrepancy.id = result[0].ID;
                        $scope.discrepancy.type = result[0].DISCREPANCY_TYPE;
                        $scope.discrepancy.controlNumber = result[0].LOG_NUMBER;
                        $scope.discrepancy.discrepancy.ataCode= result[0].ATA_CODE;
                        $scope.discrepancy.status = result[0].STATUS;
                        $scope.discrepancy.discrepancyNumber= result[0].DISCREPANCY_NUMBER;
                        if (result[0].STATUS == 'CLOSED' && WingsUtil.IsNull(result[0].SERVER_FEEDBACK)) {
                    		$scope.disabled = true;
                        }
                        $scope.discrepancy.tailNumber = result[0].TAIL_NUMBER;
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
                        if(result[0].INSPECTED_DATE != '') {
                        	$scope.discrepancy.inspection.date = new Date(result[0].INSPECTED_DATE);
                        }
                        $scope.discrepancy.inspection.employee.insByNumber = result[0].INSPECTED_BY_EMPLOYEE_NUMBER;
                        $scope.discrepancy.inspection.station = result[0].INSPECTED_STATION;
                        $scope.discrepancy.document = result[0].HOLD_DOCUMENT_NUMBER;
                        if (result[0].HOLD_TASK_NUMBER != '' && result[0].HOLD_TASK_NUMBER != undefined) {
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
                        $scope.discrepancy.workCardId = result[0].WORK_CARD_ID;
                       // $scope.discrepancy.remarks = result[0].INTERNAL_COMMENT;
                        $scope.discrepancy.inspection.employee.insByName = result[0].INSPECTED_BY_EMPLOYEE_NAME;

                        /*if(!WingsUtil.IsNull(result[0].INSPECTED_BY_EMPLOYEE_NUMBER)) {
	                        getEmployeeName(result[0].INSPECTED_BY_EMPLOYEE_NUMBER).then(function (dataIn) {
	                            $scope.discrepancy.inspection.employee.insByName = dataIn;
	                            return deferred.resolve("GOHEAD");
	
	                        }, function (error) {
	                            return deferred.reject("Login-Error : " +JSON.stringify(error));
	                        });
                        }*/
                        $scope.discrepancy.employeeName = result[0].REPORTED_BY_EMPLOYEE_NAME;
                        /*if(!WingsUtil.IsNull(result[0].REPORTED_BY_EMPLOYEE_NUMBER)) {
	                        getEmployeeName(result[0].REPORTED_BY_EMPLOYEE_NUMBER).then(function (dataIn) {
	                            $scope.discrepancy.employeeName = dataIn;
	                            return deferred.resolve("GOHEAD");
	
	                        }, function (error) {
	                            return deferred.reject("Login-Error : " +JSON.stringify(error));
	                        });
                        }*/
                        $scope.discrepancy.close.rectByName = result[0].RECTIFIED_BY_EMPLOYEE_NAME;
                        /*if(!WingsUtil.IsNull(result[0].RECTIFIED_BY_EMPLOYEE_NUMBER)) {
	                        getEmployeeName(result[0].RECTIFIED_BY_EMPLOYEE_NUMBER).then(function (dataIn) {
	                            $scope.discrepancy.close.rectByName = dataIn;
	                            return deferred.resolve("GOHEAD");
	
	                        }, function (error) {
	                            return deferred.reject("Login-Error : " +JSON.stringify(error));
	                        });
                        }*/
                        $scope.discrepancy.defer.holdByName = result[0].HOLD_BY_EMPLOYEE_NAME;
                        /*if(!WingsUtil.IsNull(result[0].HOLD_BY_EMPLOYEE_NUMBER)) {
	                        getEmployeeName(result[0].HOLD_BY_EMPLOYEE_NUMBER).then(function (dataIn) {
	                            $scope.discrepancy.defer.holdByName = dataIn;
	                            return deferred.resolve("GOHEAD");
	
	                        }, function (error) {
	                            return deferred.reject("Login-Error : " +JSON.stringify(error));
	                        });
                        }*/
                    	} catch (e) {
                    		console.log(e);
                    	}
                    	getAttachments();
                    }
                    return deferred.resolve("GOHEAD");
                }, function (error) {
                    console.log(JSON.stringify(error));
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });
                return deferred.promise;
            };
            $scope.Update = function () {
            	var errorText = "";
                if (WingsUtil.IsNull($scope.discrepancy.type)) {
                	errorText = "Type is required!";
                } else if (WingsUtil.IsNull($scope.discrepancy.reportDate)) {
                	errorText = "Report Date is required!";
                } else if (WingsUtil.IsNull($scope.discrepancy.station)) {
                	errorText = "Station is required!";
                } else if (WingsUtil.IsNull($scope.discrepancy.tailNumber)) {
                	errorText = "Tail Number is required!";
                } else if (WingsUtil.IsNull($scope.discrepancy.discrepancy.ataCode)) {
                	errorText = "Ata Code is required!"
                } /*else if (WingsUtil.IsNull($scope.discrepancy.controlNumber)) {
                	errorText = "Log Number is required!";
                } */else if (WingsUtil.IsNull($scope.discrepancy.discrepancy.description)) {
                	errorText = "Description is required!";
                }
                if (errorText != "") {
                	WingsDialogService.error(errorText);
                	return false;
                }
                if ($scope.discrepancy.status == 'CLOSED' || $scope.discrepancy.status == 'DEFERRED') {
                	if ($scope.digitalSign != true) {
                		$scope.showModal();
                   		return false;
                	}else{
                		$scope.hide();
                	}
                }
                var sql = "Update Mm_Discrepancies Set Div_No                       = ?,        " +
                          "                            Discrepancy_Number           = ?,        " +
                          "                            Discrepancy_Type             = ?,        " +
                          "                            Tail_Number                  = ?,        " +
                          "                            Ata_Code                     = ?,        " +
                          "                            Status                       = ?,        " +
                          "                            Flight_Id                    = ?,        " +
                          "                            Discrepancy                  = ?,        " +
                          "                            Corrective_Action            = ?,        " +
                          "                            Order_Number                 = ?,        " +
                          "                            Report_Date                  = ?,        " +
                          "                            Reported_By_Employee_Number  = ?,        " +
                          "                            Reported_Station             = ?,        " +
                          "                            Rectification_Date           = ?,        " +
                          "                            Rectified_By_Employee_Number = ?,        " +
                          "                            Rectified_Station            = ?,        " +
                          "                            Inspected_Date               = ?,        " +
                          "                            Inspected_By_Employee_Number = ?,        " +
                          "                            Inspected_Station            = ?,        " +
                          "                            Open_Reference_Number        = ?,        " +
                          "                            Close_Reference_Number       = ?,        " +
                          "                            Hold_Document_Number         = ?,        " +
                          "                            Hold_Task_Number             = ?,        " +
                          "                            Hold_Reference_Number        = ?,        " +
                          "                            Category                     = ?,        " +
                          "                            Defer_Reason                 = ?,        " +
                          "                            Repetitive_Flag              = ?,        " +
                          "                            Interval_Hour                = ?,        " +
                          "                            Interval_Cycle               = ?,        " +
                          "                            Interval_Day                 = ?,        " +
                          "                            Hold_By_Employee_Number      = ?,        " +
                          "                            Acceptance_Required_Flag     = ?,        " +
                          //"                            Internal_Comment             = ?,        " +
                          "                            Log_Number                   = ?,        " +
                          "                            Mobile_Record_Status         = ?         " +
                          " Where Mobile_Record_Id = ?                                          ";
                var closeDate = '';
                var insDate = '';
                if ($scope.discrepancy.close.date != '' && $scope.discrepancy.close.date != undefined) {
                    closeDate = moment($scope.discrepancy.close.date).format('YYYY-MM-DD');
                }
                if ($scope.discrepancy.inspection.date != '' && $scope.discrepancy.inspection.date != undefined) {
                    insDate = moment($scope.discrepancy.inspection.date).format('YYYY-MM-DD');
                }
                var parameters = [$rootScope.globals.currentUser.divNo,
                                  '',
                                  $scope.discrepancy.type,
                                  $scope.discrepancy.tailNumber,
                                  $scope.discrepancy.discrepancy.ataCode,
                                  $scope.discrepancy.status,
                                  $rootScope.globals.flightId,
                                  $scope.discrepancy.discrepancy.description.toUpperCase(),
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
                                 // $scope.discrepancy.remarks,
                                  $scope.discrepancy.controlNumber.toUpperCase(),
                                  'READY',
                                  $rootScope.MM_M055_Discrepancy_id];
                var serverDefectId = $scope.discrepancy.id;
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                	 WingsTransactionDBService.executeSql("Delete From Gn_Images where mobile_parent_id = ? and parent='MM_DISCREPANCIES';",[$rootScope.MM_M055_Discrepancy_id]).then(function (result2){
                         var bindings = [];
                         var serverParentId = '';
                         if (!WingsUtil.IsNull(serverDefectId)) {
                        	 serverParentId = serverDefectId;
                         }
                         for (var i in $rootScope.SY_0002.savedFiles) {
                             sy.InsertAttachment($rootScope.globals.currentUser.divNo,$rootScope.SY_0002.savedFiles[i],'MM_DISCREPANCIES',serverParentId,$rootScope.MM_M055_Discrepancy_id);
                         }
                         WingsDialogService.success();
  		                 $rootScope.$emit('onflightcreate');
                         $rootScope.$emit('refreshDefects');
                         $ionicHistory.goBack();
                         return deferred.resolve("GOHEAD");
                     }, function (error) {});
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
                    if (buttonIndex == 1) {
                        var sql = " Delete from MM_DISCREPANCIES Where Mobile_Record_Id = ?      ";
                        var parameters = [$rootScope.MM_M055_Discrepancy_id];
                        WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
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
            function getEmployeeName (number) {
                var deferred = $q.defer();
                sy.GetTableRows("Select * From Lb_Employees Where Div_No = ? And Active = 'Y' And Employee_Number = ? ",[$rootScope.globals.currentUser.divNo, number]).then(function(result){
                    if (result.length > 0) {
                        return deferred.resolve(result[0].EMPLOYEE_NAME);
                    }else{
                        return deferred.resolve("");
                    }
                });
                return deferred.promise; 
            };
           /* function getEmployees (number) {
                var deferred = $q.defer();
                var criteria = {
                    selector: {'Table_Name': 'LB_EMPLOYEES',
		                    	'Data.ACTIVE' : {
		                            $eq : 'Y'
		                         },
		                         'Data.DIV_NO' : {
		                             $eq : $rootScope.globals.currentUser.divNo
		                          }
                              },
                    fields: ['Table_Name','Record_Id','Data']
                };
                console.log("start all number"+ number +"  "+ moment().valueOf());
                WingsPouchDbSetupService.getAllDocuments().then(function (result) {
                    console.log("end all number"+ result.rows[0].value.EMPLOYEE_NUMBER +"  "+ moment().valueOf());
                    debugger;
                    return deferred.resolve("");
                }).catch(function (err) {
                    console.log('ERROR: '+err);
                });
                return deferred.promise;  
            };
            getEmployees();*/
            //COMPONENT TRANSACTIONS
            
            $scope.transaction = {
                    partOff   : '',
                    serialOff : '',
                    partOn    : '',
                    serialOn  : '',
                    position  : ''
            }
            $scope.clearTransaction = function () {
                $scope.transaction = {
                        partOff   : '',
                        serialOff : '',
                        partOn    : '',
                        serialOn  : '',
                        position  : ''
                }
            }
            $scope.transactions = [];
            getTransactions();
            $scope.saveTransaction = function (object) {
                if (WingsUtil.IsNull($rootScope.MM_M055_Discrepancy_id)) {
                    WingsDialogService.errorHide('Save discrepacy before adding transaction.');
                    return false;
                }
                var sql = "Insert or Replace Into Mm_Component_Transactions (Div_No,       " +
                		  "                                       Off_Component_Number,     " +
                		  "                                       Off_Serial_Number,        " +
                		  "                                       On_Component_Number,      " +
                		  "                                       On_Serial_Number,         " +
                		  "                                       Position,                 " +
                		  "                                       Discrepancy_Id,           " +
                		  "                                       Mobile_Record_Id)         " +
                          " Values (?,?,?,?,?,?,?,?)                                          ";
                var parameters = [$rootScope.globals.currentUser.divNo,
                	              object.OFF_COMPONENT_NUMBER,
                	              object.OFF_SERIAL_NUMBER,
                	              object.ON_COMPONENT_NUMBER,
                	              object.ON_SERIAL_NUMBER,
                	              object.POSITION,
                                  $rootScope.MM_M055_Discrepancy_id,
                                  WingsUtil.IsNull(object.MOBILE_RECORD_ID) ? null : object.MOBILE_RECORD_ID];
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
            $scope.toggleTransaction = function(mobileRecordId){
            	var isMatched = false;
            	for (i=0; i<$scope.transactions.length;i++){
            		if (mobileRecordId == $scope.transactions[i].MOBILE_RECORD_ID){
            			$scope.transactions[i].IS_SHOWN = !$scope.transactions[i].IS_SHOWN;
            			isMatched = true;
            		}else{
            			$scope.transactions[i].IS_SHOWN = false;
            		}
            	}
            	if (!isMatched){
            		$scope.transactions[$scope.transactions.length-1].IS_SHOWN = false;
            	}else{
            		$scope.transactions[$scope.transactions.length-1].IS_SHOWN = $scope.transactions[$scope.transactions.length-1].IS_SHOWN;
            	}
            }
            
            function pushTransaction (arr){
            	arr.push({OFF_COMPONENT_NUMBER: '',
 					 ON_COMPONENT_NUMBER: '',
  					 ON_SERIAL_NUMBER: '',
  					 OFF_SERIAL_NUMBER: '',
  					 POSITION:'',
  					 MOBILE_RECORD_ID:null,
  					 IS_SHOWN:true});
            	return arr;
            }
            function getTransactions () {
                var sql = "Select *                         " +
                          "  From Mm_Component_Transactions " +
                          " Where Discrepancy_Id = ?        " ;
                  var parameters = [$rootScope.MM_M055_Discrepancy_id];
                  WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                	  if(result.length > 0){
                		  for(i=0; i<result.length; i++){
                			  result[i].IS_SHOWN = false;
                		  }
                		  $scope.transactions = result;
                		  $scope.transactions = pushTransaction($scope.transactions);
                		  
                	  }else{
                		  $scope.transactions  = [];
                		  $scope.transactions = pushTransaction($scope.transactions);
                	  }
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
                
                $scope.cancelBtn = {
                        State: false,
                        Text:   ""
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
            
            $scope.openModalIFE = function () {
                $scope.cancelBtn = {
                        State: false,
                        Text:   ""
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
                        Text:   ""
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
                        Text:   ""
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
            
            $scope.openModalFAP = function () {
                $scope.cancelBtn={
                    State: false,
                    Text:   ""
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
                    Text:   ""
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
            
            $scope.openModalMCD = function() {
                $scope.cancelBtn = {
                    State: false,
                    Text:   ""
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
            
            $scope.cancelBtn = {
                State: false,
                Text:   ""
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
            $scope.fttoggle = function() {
                this.cancelBtn.State = !this.cancelBtn.State;
            };
            $scope.discrepancyTypeCheck = function (Type) {
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
            $scope.savecabin = function (Discrepancies, Type , Ocancel) {
                if(angular.isUndefined($scope.discrepancy.discrepancy.description))
                    $scope.discrepancy.discrepancy.description  = '';           
                
                for (var i = Discrepancies.length-1; i >= 0; -- i)
                {
                    if(Discrepancies[i].state)
                        $scope.discrepancy.discrepancy.description  = $scope.discrepancy.discrepancy.description +  act_seat + ' Seat ' + Discrepancies[i].label + " \n";
                }
                if (Ocancel.State)
                    $scope.discrepancy.discrepancy.description  =  $scope.discrepancy.discrepancy.description + "" + act_seat + " Seat " + Ocancel.Text + "\n";
                switch (Type) {
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
            $scope.scanObj = 'partoff';
           /* $scope.setScanObj = function (obj) {
                $scope.scanObj = obj;
            };*/
            getActiveTransaction = function(){
            	for(i=0; i<$scope.transactions.length;i++){
            		if($scope.transactions[i].IS_SHOWN){	
            			return $scope.transactions[i];
            		}
            	}
            	return false;
            }
            $scope.scanBarcode = function (scanObj) {
            	var index = -1;
            	for(i=0; i<$scope.transactions.length; i++){
            		if ($scope.transactions[i].IS_SHOWN){
            			index = i;
            		}
            	}
            	if (index >= 0){
            		$cordovaBarcodeScanner.scan().then(function(barcodeData) {
                        console.log('SCAN DATA     '+barcodeData.text);
                        barcodeData.text = barcodeData.text.replace("*P","");
                        if (barcodeData.text){
                        	getPartAndSerialNO(barcodeData.text,index);
                        }else{
                        }
                    }, function(error) {
                        console.log('Error',error);
                    });
            	}
            };
            
            function getPartAndSerialNO(tagNumber, index){
            	var deferred = $q.defer();
              	var sql = " Select Part_Number,                                       "+
              			  "        Serial_Number                                      "+
              			  "   From Ic_Allocations a,                                  "+
              			  "     Ic_Items       b,                                     "+
              			  "     Ic_Parts       c                                      "+
              			  "  Where a.Div_No = "+ $rootScope.globals.currentUser.divNo +
              			  "    And a.Tag_Number = "+ tagNumber +
              			  "    And b.Id = a.Item_Id                                   "+
              			  "    And c.Id = b.Part_Id                                   ";
              	          console.log(sql);
              	var sqlArray = [{ queryStr: sql, queryType: "READ" }];
                  var sqlString = JSON.stringify(sqlArray);
                  WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                	  var data =  angular.fromJson(dataIn[0]);
                	  if (data.success){
                		  $scope.transactions[index].ON_COMPONENT_NUMBER = angular.fromJson(data.rows)[0].part_number;
                		  $scope.transactions[index].ON_SERIAL_NUMBER    = angular.fromJson(data.rows)[0].serial_number;
                	  }else{
                		  console.log("Invalid tag number");
                	  }
                	  deferred.resolve("GO-HEAD");  
                  },function(error){
                  	deferred.reject(error);
                  });
                  return deferred.promise;
            }
            $scope.AddAttachment = function () {
                $state.go('app.SY_M002',{uploadOptions: {}});
            };
            $scope.signin = function () {
            	$ionicLoading.show({
                    noBackdrop: true,
                    template: '<ion-spinner icon="bubbles"/>'
                });
            	sy.Login ($scope.user.username,$scope.user.password).then(function (response) {
            		$ionicLoading.hide();
            		if (response.success) {
            			$scope.hide();
            			$scope.digitalSign = true;
            			if ($scope.viewMode == 'update') {
            				$scope.Update();
            			} else {
            				$scope.Save();
            			}
            		} else {
            			WingsDialogService.alert("Invalid username or Password !", 'Error', 'OK');
            		}
            	}, function (error) {
                    $ionicLoading.hide();
        			WingsDialogService.alert("Invalid username or Password !", 'Error', 'OK');
            	});
            };
            $ionicModal.fromTemplateUrl('templates/digitalSign.html', {
                scope: $scope
            }).then(function(modal) {
                $scope.modal = modal;
            });
            $scope.hide = function(){
            	$scope.modal.hide();
            	$scope.digitalSign = false
            	$scope.user.username = $rootScope.globals.currentUser.userId;
            	$scope.user.password = '';
            }
            $scope.clearCanvas = function () {
            	$scope.canvas.clear();
            	$scope.canvas.width  = "400";
                $scope.canvas.height = "400";
            	$scope.canvas.renderAll();
            } 
            $scope.showModal = function (action) {
            	$scope.isModalActive = true;
                $scope.modal.show();
                if (!WingsUtil.IsNull($scope.canvas)) {
                	$scope.canvas.clear();
                	$scope.canvas.backgroundColor="#f5f2f0";
                	$scope.canvas.renderAll();
                } else {
    	            $scope.canvas = new fabric.Canvas ('m055');
    	            $scope.canvas.selectable = false;
    	            $scope.canvas.backgroundColor="#f5f2f0";
    	            $scope.canvas.hasControls = false;
    	            $scope.canvas.hasBorders = false;
    	            $scope.canvas.hasRotatingPoint = false;
    	            $scope.canvas.selection = false;
    	            $scope.canvas.renderOnAddRemove=false;
    	            fabric.Object.prototype.selectable = false;
    	            fabric.Object.prototype.hasBorders  = true;
    	            fabric.Object.prototype.hasControls  = false;
    	            fabric.Object.prototype.hasRotatingPoint  = false;
    	            fabric.Object.prototype.skipTargetFind   = true;
    	            fabric.Canvas.skipTargetFind = true;
    	            fabric.skipTargetFind = true;
    	            $scope.canvas.skipTargetFind = true;
    	            $scope.canvas.setHeight($scope.modal.modalEl.clientHeight-200);
    	            $scope.canvas.setWidth($scope.modal.modalEl.clientWidth);
    	            $scope.canvas.width  = $scope.modal.modalEl.clientWidth;
    	            $scope.canvas.height = ($scope.modal.modalEl.clientHeight)-200;
    	            $scope.canvas.isDrawingMode = true;
    	            $scope.canvas.isEdited = false;
    	            $scope.canvas.freeDrawingBrush.width = 1;
    	            $scope.canvas.freeDrawingBrush.color = '#000000';
    	            $scope.canvas.renderAll();
                }
            };
            $scope.$on('modal.hidden', function() {
            	$scope.isModalActive = false;
              });
        }
])