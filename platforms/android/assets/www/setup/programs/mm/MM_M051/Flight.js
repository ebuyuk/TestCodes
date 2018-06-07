angular.module('WingsMobileStarter').controller('MM_M051.Flight', [
    '$scope',
    'WingsUtil',
    'WingsDialogService',
    '$filter',
    'WingsTransactionDBService',
    '$ionicHistory',
    '$ionicModal',
    'WingsRemoteDbService',
    '$ionicLoading',
    'sy',
    'md5',
    function($scope,WingsUtil,WingsDialogService,$filter,WingsTransactionDBService,$ionicHistory,$ionicModal,WingsRemoteDbService,$ionicLoading,sy,md5) {
        console.log("MM_M051.Flight");
        var tailNumber = $rootScope.MM_M051_selectedTailNumber;
        if (WingsUtil.IsNull(tailNumber)) {
        	tailNumber = $rootScope.globals.deviceInformation.tailNumber;
        }
        
        $scope.flight = {
                tailNumber     : tailNumber,
                flightNumber   : '',
                logNumber      : '',
                serialNumber   : '',
                actualDate     : '',
                scheduleDate   : new Date(moment().format('YYYY-MM-DD')),
                scheduledFrom  : '',
                scheduledTo    : '',
                actualFrom     : '',
                actualTo       : '',
                diversion      : 'N',
                actualOffBlock : '',
                actualTakeOff  : '',
                actualLanding  : '',
                actualOnBlock  : '',
                arrivalFuel    : '',
                noDefectFlag   : false
        };
        $scope.disabled    = false;
        $scope.isAccept    = false;
        $scope.isCancel    = false;
        $scope.isCompleted = false;
    	$scope.digitalSign = false;

        $scope.locationsLov = [];
        $rootScope.$ionicGoBack = function() {
        	$('#f').siblings('.upper-canvas').remove();
        	$('#f').parent('.canvas-container').before($('#f'));
        	$('.canvas-container').remove();
        	$ionicHistory.goBack();
        };
        if ($rootScope.MM_M051_viewMode == 'update' || $rootScope.MM_M051_viewMode == 'logUpdate'|| $rootScope.MM_M051_viewMode == 'complete' ) {
            getFlight();
        }
        $scope.calculateTimes = function () {
        	if (!WingsUtil.IsNull($scope.flight.actualOnBlock) &&  !WingsUtil.IsNull($scope.flight.actualOffBlock)) {
        		$scope.flight.blockTime  = ($scope.flight.actualOnBlock - $scope.flight.actualOffBlock)/60000;
        		$scope.flight.blockHour  = Math.floor($scope.flight.blockTime/60)+':'+($scope.flight.blockTime%60<10?'0'+$scope.flight.blockTime%60:$scope.flight.blockTime%60);
        		$scope.flight.flightTime = ($scope.flight.actualLanding - $scope.flight.actualTakeOff)/60000;
        		$scope.flight.flightHour = Math.floor($scope.flight.flightTime/60)+':'+($scope.flight.flightTime%60<10?'0'+$scope.flight.flightTime%60:$scope.flight.flightTime%60);
        	}
        };
        
        sy.GetTableRows("Select * From Mm_Flight_Locations Where Div_No = ? And Active = 'Y' Order By Flight_Location",[$rootScope.globals.currentUser.divNo]).then(function(result){
            $scope.locationsLov = result;
        });
        
        sy.GetTableRows("Select * From Pr_Aircrafts Where Div_No = ? And Engineering_Flag = ? And Active = 'Y' Order By Tail_Number",[$rootScope.globals.currentUser.divNo,'Y']).then(function(result){
            $scope.aircraftsLov = result;
            if($rootScope.MM_M051_viewMode != 'update' && $rootScope.MM_M051_viewMode != 'complete'){
                $timeout(function() {
                    setSerialNumber($scope.flight.tailNumber);
                },50);
            }
        });
        
        $scope.onselect = function(newValue,oldValue){
            $scope.flight.tailNumber = newValue.TAIL_NUMBER;
            $scope.flight.serialNumber = newValue.SERIAL_NUMBER;
        };
        setSerialNumber = function(tailNumber){
        	if(!WingsUtil.IsNull(tailNumber)){
        		for(i=0; i<$scope.aircraftsLov.length;i++){
        			if($scope.aircraftsLov[i].TAIL_NUMBER == tailNumber){
        				$scope.flight.serialNumber = $scope.aircraftsLov[i].SERIAL_NUMBER;
        				return;
        			}
        		}
        	}
        };
        function getFlight () {
            var sql = "Select a.*,                                           " +
            		  "       (Select x.Arrival                         " +
            		  "          From Mm_Flight_Consumptions x               " +
            		  "         Where x.Flight_Id        = a.Id              " +
            		  "           And x.Consumption_Type = 'FUEL' ) Arrival, " +
            		  "       (Select COUNT(*)                               " +
                      "          From Mm_Flight_Consumptions x               " +
                      "         Where x.Flight_Id        = a.Id              " +
                      "           And x.Consumption_Type = 'FUEL' ) Count    " +
                      " From Mm_Flights a                                    " +
                      "Where a.Id = ?                                        " ;
            var parameters = [$rootScope.MM_M051_id];
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                console.log(JSON.stringify(result));
                if (result.length > 0) {
                if(result[0].STATUS == 'COMPLETED' && result[0].MOBILE_RECORD_STATUS == 'LOADED' && result[0].MOBILE_RECORD_STATUS != 'REJECTED'){
            		$scope.disabled = true;
            	}
                $scope.flight = {
                        tailNumber        : result[0].TAIL_NUMBER,
                        flightNumber      : result[0].FLIGHT_NUMBER,
                        logNumber         : result[0].CONTROL_NUMBER,
                        serialNumber      : result[0].SERIAL_NUMBER,
                        scheduleDate      : new Date(moment(result[0].SCHEDULE_DATE).format('YYYY-MM-DD')),
                        scheduledFrom     : result[0].SCHEDULED_FROM,
                        scheduledTo       : result[0].SCHEDULED_TO,
                        scheduledOffBlock : result[0].SCHEDULED_OFF_BLOCK != null ? parseDate(result[0].SCHEDULED_OFF_BLOCK):'',
                        scheduledOnBlock  : result[0].SCHEDULED_ON_BLOCK != null ? parseDate(result[0].SCHEDULED_ON_BLOCK):'',
                        actualFrom        : WingsUtil.IsNull(result[0].ACTUAL_FROM)?result[0].SCHEDULED_FROM:result[0].ACTUAL_FROM,
                        actualDate        : WingsUtil.IsNull(result[0].ACTUAL_DATE)?new Date(moment(result[0].SCHEDULE_DATE).format('YYYY-MM-DD')):new Date(moment(result[0].ACTUAL_DATE).format('YYYY-MM-DD')),
                        actualTo          : WingsUtil.IsNull(result[0].ACTUAL_TO)?result[0].SCHEDULED_TO:result[0].ACTUAL_TO,
                        diversion         : result[0].DIVERSION,
                        actualOffBlock    : result[0].ACTUAL_OFF_BLOCK != null ? parseDate(result[0].ACTUAL_OFF_BLOCK):'',
                        actualTakeOff     : result[0].ACTUAL_TAKE_OFF != null ? parseDate(result[0].ACTUAL_TAKE_OFF):'',
                        actualLanding     : result[0].ACTUAL_LANDING != null ? parseDate(result[0].ACTUAL_LANDING):'',
                        actualOnBlock     : result[0].ACTUAL_ON_BLOCK != null ? parseDate(result[0].ACTUAL_ON_BLOCK):'',
                        arrivalFuel       : result[0].Arrival,
                        noDefectFlag      : result[0].NO_DEFECT_FLAG == 'true'
                };
            	$scope.flight.hasFuel = false;
                if (result[0].Count > 0) {
                	$scope.flight.hasFuel = true;
                }
                $scope.calculateTimes();
                if (result[0].STATUS == 'ACCEPTED' || result[0].MOBILE_RECORD_STATUS == 'REJECTED') {
                    $scope.isAccept = true;
                    checkFlightHasDefect();
                } else if (result[0].STATUS == 'COMPLETED'){
                      $scope.isCompleted = true;
                } else if (result[0].STATUS == 'CANCELLED'){
                      $scope.isCancel = true;
                }
                } else {
                    WingsDialogService.error("Flight could not found.");
                }
            }, function (error) {
                WingsDialogService.error(JSON.stringify(error));
                console.log(JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };
        function checkFlightHasDefect () {
        	var sql = "Select Status from mm_discrepancies where log_number = ? ";
			  var parameters = [$scope.flight.logNumber];
			  WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
				  if (result.length > 0) {
					  $scope.flight.hasDefect = true;
				  } else {
					  $scope.flight.hasDefect = false ;
				  }
			  }, function (error) {
	                WingsDialogService.error(JSON.stringify(error));
	                console.log(JSON.stringify(error));
	                return deferred.reject("Login-Error : " +JSON.stringify(error));
	          });
        }
        function pushOnlyFlight () {
       	    var deferred = $q.defer();
	       	var offBlock = '';
	     	var onBlock = '';
	     	var date = moment($scope.flight.scheduleDate);
    	    if($scope.flight.scheduledOffBlock != '') {
                offBlock = moment($scope.flight.scheduledOffBlock).year(date.year()).month(date.month()).date(date.date()).format('HHmm');
            }
            if($scope.flight.scheduledOnBlock != '') {
                onBlock = moment($scope.flight.scheduledOnBlock).year(date.year()).month(date.month()).date(date.date()).format('HHmm');
            }
            if(offBlock < onBlock) {
            	offBlock = moment($scope.flight.scheduledOffBlock).add('days',1).format('HHmm');
                onBlock = moment($scope.flight.scheduledOnBlock).add('days',1).format('HHmm');
    
            }
       	    var sql = new StoredFuncProcBuilder("Mb_Apps.Do_Flight", 
	   		   	                                "i_Div_No",                  $rootScope.globals.currentUser.divNo,
	   		   	                                "i_Action",                  'CREATE',
						                        "i_Tail_Number",             $scope.flight.tailNumber,
						                        "i_Control_Number",          $filter('uppercase')($scope.flight.logNumber),
						                        "i_Flight_Number",           $filter('uppercase')($scope.flight.flightNumber),
						                        "i_Schedule_Date",           moment($scope.flight.scheduleDate).format('YYYY-MM-DD'),
						                        "i_Scheduled_From",          $filter('uppercase')($scope.flight.scheduledFrom),
						                        "i_Scheduled_To",            $filter('uppercase')($scope.flight.scheduledTo),
						                        "i_Scheduled_Off_Block",     offBlock,
						                        "i_Scheduled_On_Block",      onBlock,
				                        	    "i_Status",                  "SCHEDULED",
						                        "o_Data",                    '');
       	    var builders = [];
       	    var obj = sql.queryObject();
       	    builders.push(obj);
	        if (builders.length > 0) {
             var str = JSON.stringify(builders);
             WingsRemoteDbService.executeFunction(str).then (function (response) {
            	 var result = angular.fromJson(response[0]);
            	 if (result.isSuccess =='true'  && result.errorText == '') {
            		   WingsRemoteDbService.HandleFeedback(result);
	                   $rootScope.MM_M051_id = angular.fromJson(result.result.o_Data).FLIGHT_ID;
		               $rootScope.$emit('onflightcreate');
		               $ionicHistory.goBack();
                       return deferred.resolve($rootScope.MM_M051_id);
            	 }
                 else {
                    WingsRemoteDbService.HandleFeedback(angular.fromJson(response[0]));
	            	return deferred.reject("PushOnlyFlight Package Error : ");
                }
             }, function (error) {
            	  return deferred.reject("PushOnlyFlight Error : " +JSON.stringify(error));
                    console.log("PROMISES  - ERROR"+JSON.stringify(error));
             });
         }
        return deferred.promise;
       };
        $scope.Save = function () {
        	if ($rootScope.MM_M051_viewMode == 'update') {
        	if (WingsUtil.IsNull($scope.flight.tailNumber)) {
        		WingsDialogService.error("Tail Number is required.");
        		return false;
        	} else if (WingsUtil.IsNull($scope.flight.actualDate)) {
        		WingsDialogService.error("Date is required.");
        		return false;
        	} else if (WingsUtil.IsNull($scope.flight.actualDate)) {
        		WingsDialogService.error("Date is required.");
        		return false;
        	} else if (WingsUtil.IsNull($scope.flight.flightNumber)) {
        		WingsDialogService.error("Flight Number is required.");
        		return false;
        	} /*else if (WingsUtil.IsNull($scope.flight.logNumber)) {
        		WingsDialogService.error("Log Number is required.");
        		return false;
        	}*/ else if (WingsUtil.IsNull($scope.flight.actualFrom)) {
        		WingsDialogService.error("Actual From is required.");
        		return false;
        	} else if (WingsUtil.IsNull($scope.flight.actualTo)) {
        		WingsDialogService.error("Actual To is required.");
        		return false;
        	}
            	var sql = "Update Mm_Flights                " +
		                  "   Set Tail_Number          = ?, " +
		                  "       Serial_Number        = ?, " +
		                  "       Schedule_Date        = ?, " +
		                  "       Scheduled_From       = ?, " +
		                  "       Scheduled_To         = ?, " +
		                  "       Scheduled_Off_Block  = ?, " +
		                  "       Scheduled_On_Block   = ?, " +
		                  "       Actual_From          = ?, " +
		                  "       Actual_To            = ?, " +
		                  "       Diversion            = ?, " +
		                  "       Actual_Date          = ?, " +
		                  "       Flight_Number        = ?, " +
		                  "       Actual_Off_Block     = ?, " +
		                  "       Actual_Take_Off      = ?, " +
		                  "       Actual_Landing       = ?, " +
		                  "       Actual_On_Block      = ?, " +
		                  "       Control_Number       = ?, " +
		                  "       MOBILE_RECORD_STATUS = ?, " +
		                  "       SERVER_FEEDBACK      = ?  " +
		                  "Where Id  = ?  ";
            	var offBlock = '';
            	var takeOff = '';
            	var landing = '';
            	var onBlock = '';
            	var date = moment($scope.flight.actualDate);
            	if (!WingsUtil.IsNull($scope.flight.actualOffBlock)) {
            		offBlock = moment($scope.flight.actualOffBlock).year(date.year()).month(date.month()).date(date.date()).format('YYYY-MM-DD HH:mm');
            	}
            	if (!WingsUtil.IsNull($scope.flight.actualTakeOff)) {
            		takeOff =  moment($scope.flight.actualTakeOff).year(date.year()).month(date.month()).date(date.date()).format('YYYY-MM-DD HH:mm');
            	}
            	if (!WingsUtil.IsNull($scope.flight.actualLanding)) {
            		landing = moment($scope.flight.actualLanding).year(date.year()).month(date.month()).date(date.date()).format('YYYY-MM-DD HH:mm'); 
            	}
            	if (!WingsUtil.IsNull($scope.flight.actualOnBlock)) {
            		onBlock = moment($scope.flight.actualOnBlock).year(date.year()).month(date.month()).date(date.date()).format('YYYY-MM-DD HH:mm');
            	}
            	if (landing < takeOff) {
            		landing = moment(landing).add('days',1).format('YYYY-MM-DD HH:mm');
            		onBlock = moment(onBlock).add('days',1).format('YYYY-MM-DD HH:mm');
	
            	}
            	parameters = [$scope.flight.tailNumber,
            				  $filter('uppercase')($scope.flight.serialNumber),
            				  moment($scope.flight.scheduleDate).format('YYYY-MM-DD'),
	                          $filter('uppercase')($scope.flight.scheduledFrom),
	                          $filter('uppercase')($scope.flight.scheduledTo),
	                          moment($scope.flight.scheduledOffBlock).year(date.year()).month(date.month()).date(date.date()).format('YYYY-MM-DD HH:mm'),
	                          moment($scope.flight.scheduledOnBlock).year(date.year()).month(date.month()).date(date.date()).format('YYYY-MM-DD HH:mm'),
	                          $filter('uppercase')($scope.flight.actualFrom),
	                          $filter('uppercase')($scope.flight.actualTo),
	                          $scope.flight.diversion,
	                          moment($scope.flight.actualDate).format('YYYY-MM-DD'),
	                          $filter('uppercase')($scope.flight.flightNumber),
	                          offBlock,
	                          takeOff,
	                          landing,
	                          onBlock,
	                          $filter('uppercase')($scope.flight.logNumber),
	                          'READY',
	                          '',
	                          $rootScope.MM_M051_id]
	            WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
	                console.log(JSON.stringify($scope.result));
	                WingsDialogService.success();
	                $rootScope.$emit('refreshFlightList');
	                $rootScope.$emit('onflightcreate');
	                $ionicHistory.goBack();
	                return deferred.resolve("GOHEAD");
	            }, function (error) {
	                WingsDialogService.error(JSON.stringify(error));
	                console.log(JSON.stringify(error));
	                return deferred.reject("Login-Error : " +JSON.stringify(error));
	        });
            return deferred.promise;
        	} else {
        		if (WingsUtil.IsNull($scope.flight.tailNumber)) {
            		WingsDialogService.error("Tail Number is required.");
            		return false;
            	} else if (WingsUtil.IsNull($scope.flight.scheduleDate)) {
            		WingsDialogService.error("Schedule Date is required.");
            		return false;
            	} else if (WingsUtil.IsNull($scope.flight.flightNumber)) {
            		WingsDialogService.error("Flight Number is required.");
            		return false;
            	} /*else if (WingsUtil.IsNull($scope.flight.logNumber)) {
            		WingsDialogService.error("Log Number is required.");
            		return false;
            	} */else if (WingsUtil.IsNull($scope.flight.scheduledFrom)) {
            		WingsDialogService.error("From Station is required.");
            		return false;
            	} else if (WingsUtil.IsNull($scope.flight.scheduledTo)) {
            		WingsDialogService.error("To Station is required.");
            		return false;
            	}
        		pushOnlyFlight();
        	}
        };
        $scope.saveLogFlight = function (){
        	if(!(WingsUtil.IsNull($scope.flight.tailNumber) || WingsUtil.IsNull($scope.flight.serialNumber) || WingsUtil.IsNull($scope.flight.actualDate) || WingsUtil.IsNull($scope.flight.logNumber))){
                var sql = "INSERT OR REPLACE INTO Mm_Flights (Div_No,                  " +
                		  "                                   Tail_Number,             " +
                		  "                                   Serial_Number,           " +
                		  "                                   Actual_Date,             " +
                		  "                                   Control_Number,          " +
                		  "                                   Actual_From,             " +
                		  "                                   Actual_To,               " +
                		  "                                   Status,                  " +
                		  "                                   MOBILE_RECORD_STATUS)    " +
                          " Values (?,?,?,?,?,?,?,?,?);                                " ;
                
                var sql2 = "Update Mm_Flights " +
                		"      Set Id = (Select Max(Mobile_Record_Id) From Mm_Flights ) " +
                		"    where Mobile_Record_Id = (Select Max(Mobile_Record_Id) From Mm_Flights); ";
                var parameters = [$rootScope.globals.currentUser.divNo,
                                  $scope.flight.tailNumber,
                                  $filter('uppercase')($scope.flight.serialNumber),
                                  moment($scope.flight.actualDate).format('YYYY-MM-DD'),
                                  $filter('uppercase')($scope.flight.logNumber),
                                  $filter('uppercase')($scope.flight.actualFrom),
                                  $filter('uppercase')($scope.flight.actualTo),
                                  'LOG',
                                  'READY'];
                
                if ($rootScope.MM_M051_viewMode == 'logUpdate') {
                    sql = "Update Mm_Flights                   " +
                          "   Set Tail_Number          = ?,    " +
                          "       Serial_Number        = ?,    " +
                          "       Actual_Date          = ?,    " +
                          "       Control_Number       = ?,    " +
                          "       Actual_From          = ?,    " +
                		  "       Actual_To            = ?,    " +
                          "       MOBILE_RECORD_STATUS = ?     " +
                          "Where Id      = ?     ";
                    
                    parameters = [$scope.flight.tailNumber,
                                  $filter('uppercase')($scope.flight.serialNumber),
                                  moment($scope.flight.actualDate).format('YYYY-MM-DD'),
                                  $filter('uppercase')($scope.flight.logNumber),
                                  $filter('uppercase')($scope.flight.actualFrom),
                                  $filter('uppercase')($scope.flight.actualTo),
                                  'READY', 
                                  $rootScope.MM_M051_id]
                }
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
                	if ($rootScope.MM_M051_viewMode != 'logUpdate') {
                		WingsTransactionDBService.executeSql(sql2,[]);
                	}
                    console.log(JSON.stringify($scope.result));
                    WingsDialogService.success();
                    $rootScope.$emit('onflightcreate');
                    $ionicHistory.goBack();
                    return deferred.resolve("GOHEAD");
                }, function (error) {
                    WingsDialogService.error(JSON.stringify(error));
                    console.log(JSON.stringify(error));
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });
                return deferred.promise;
        	} else {
           	    WingsDialogService.error("Please fill all columns");
            }
        };
        $scope.updateLogFlight = function(){
        	
        };
        $scope.CompleteFlight = function () {
        	if (WingsUtil.IsNull($scope.flight.arrivalFuel) ) {
        	    WingsDialogService.error("Please enter arrival fuel.");
                return false;
        	} else if (!$scope.flight.hasDefect && !$scope.flight.noDefectFlag ) {
           	    WingsDialogService.error("Please check No Defect Found Flag.");
              	return false;
        	} else if (WingsUtil.IsNull($scope.flight.logNumber)) {
           	    WingsDialogService.error("Please enter Log Number.");
              	return false;
        	} else if(WingsUtil.IsNull($scope.flight.actualOffBlock) || WingsUtil.IsNull($scope.flight.actualTakeOff) || WingsUtil.IsNull($scope.flight.actualLanding) || WingsUtil.IsNull($scope.flight.actualOnBlock)) {
           	    WingsDialogService.error("Please fill all actual columns.");
              	return false;
        	}
        	document.activeElement.blur();
            if ($scope.digitalSign != true) {
            	 $timeout(function() {
            		 $scope.showModal();
                 },150);
               	 return false;
            } else {
                WingsDialogService.confirm("Flight will be completed.Do you want to proceed?",'Confirm','OK,Cancel').then(function(buttonIndex) {
                    if (buttonIndex == 1) {
                        if ($scope.flight.hasFuel) {
                    		var fuelSql = "Update Mm_Flight_Consumptions set Arrival = ? Where Flight_Id = ? and Consumption_Type ='FUEL'";
                        	var parameters = [$scope.flight.arrivalFuel,$rootScope.MM_M051_id];
                    	} else {
                    		var sql=' Insert Into MM_FLIGHT_CONSUMPTIONS (Div_No,No_Refuelling_Flag,Arrival,Consumption_Date,Flight_Id,Consumption_Type) '+
                                    ' Values (?,?,?,?,?,?)';       
                    		var parameters = [ $rootScope.globals.currentUser.divNo,
				                    		   false,
				                    		   $scope.flight.arrivalFuel,
				                    		   moment().format('YYYY-MM-DD HH:MM'),
				                    		   $rootScope.MM_M051_id,
				                    		   'FUEL'];
                    	}
	                    WingsTransactionDBService.executeSql(fuelSql,parameters);
	                    var date = moment($scope.flight.actualDate);
	                    var sql = "Update Mm_Flights set " +
	                    		  "                  Actual_From               = ?,  " +
	                              "                  Actual_To                 = ?,  " +
	                              "                  Diversion                 = ?,  " +
	                              "                  Actual_Date               = ?,  " +
	                              "                  Flight_Number             = ?,  " +
	                              "                  Control_Number            = ?,  " +
	                              "                  Actual_Off_Block          = ?,  " +
	                              "                  Actual_Take_Off           = ?,  " +
	                              "                  Actual_Landing            = ?,  " +
	                              "                  Actual_On_Block           = ?,  " +
	                              "                  Status                    = ?,  " +
	                              "                  Close_Date                = ?,  " +
	                              "                  Closed_By_Employee_Number = ?,  " +
	                              "                  No_Defect_Flag            = ?,  " +
	                              "                  Mobile_Record_Status      = ?   " +
	                              " Where Id = ? ";
	                    var status = $scope.flight.status;
	                    console.log('xxxxxxxxxx'+status);
	                    if(!WingsUtil.IsNull($scope.flight.actualOffBlock) && !WingsUtil.IsNull($scope.flight.actualTakeOff) && !WingsUtil.IsNull($scope.flight.actualLanding) && !WingsUtil.IsNull($scope.flight.actualOnBlock)) {
	                        status = 'COMPLETED';
	                    }
	                    var offBlock = '';
	                    var takeOff = '';
	                    var landing = '';
	                    var onBlock = '';
	                    if ($scope.flight.actualOffBlock != '') {
	                        offBlock = moment($scope.flight.actualOffBlock).year(date.year()).month(date.month()).date(date.date()).format('YYYY-MM-DD HH:mm');
	                    }
	                    if ($scope.flight.actualTakeOff != '') {
	                        takeOff =  moment($scope.flight.actualTakeOff).year(date.year()).month(date.month()).date(date.date()).format('YYYY-MM-DD HH:mm');
	                    }
	                    if ($scope.flight.actualLanding != '') {
	                        landing = moment($scope.flight.actualLanding).year(date.year()).month(date.month()).date(date.date()).format('YYYY-MM-DD HH:mm'); 
	                    }
	                    if ($scope.flight.actualOnBlock != '') {
	                        onBlock = moment($scope.flight.actualOnBlock).year(date.year()).month(date.month()).date(date.date()).format('YYYY-MM-DD HH:mm');
	                    }
	                    if (landing < takeOff) {
	                        landing = moment(landing).add('days',1).format('YYYY-MM-DD HH:mm');
	                        onBlock = moment(onBlock).add('days',1).format('YYYY-MM-DD HH:mm');
	        
	                    }
	                    if (takeOff < offBlock) {
	                	    WingsDialogService.error("'Take Off must be later than Off Block.'");
	                    }
	                    if (landing < offBlock) {
	                	    WingsDialogService.error("'Landing must be later than Off Block.'");
	                    }
	                    if (landing < takeOff) {
	                	    WingsDialogService.error("'Landing must be later than Take Off.'");
	                    }
	                    if (onBlock < offBlock) {
	                	    WingsDialogService.error("'On Block must be later than Off Block.'");
	                    }
	                    if (onBlock < takeOff) {
	                	    WingsDialogService.error("'On Block must be later than Take Off.'");
	                    }
	                    if (onBlock < landing) {
	                	    WingsDialogService.error("'On Block must be later than Landing.'");
	                    }
	                    var parameters = [  $filter('uppercase')($scope.flight.actualFrom),
	                                        $filter('uppercase')($scope.flight.actualTo),
	                                        $filter('uppercase')($scope.flight.actualTo)!=$filter('uppercase')($scope.flight.scheduleTo)?'Y':'N',
	                                        moment($scope.flight.actualDate).format('YYYY-MM-DD'),
	                                        $filter('uppercase')($scope.flight.flightNumber),
	                                        $filter('uppercase')($scope.flight.logNumber),
	                                        offBlock,
	                                        takeOff,
	                                        landing,
	                                        onBlock,
	                                        status,
	                                        moment().format('YYYY-MM-DD HH:MM'),
	                                        $rootScope.globals.currentUser.userNumber,
	                                        $scope.flight.noDefectFlag,
	                                        'READY',
	                                        $rootScope.MM_M051_id];
	                     console.log('xxxxxxxxxx'+status);
	                    WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
	                        console.log(JSON.stringify(result));
	                        $rootScope.$emit('onflightcreate');
	                        $rootScope.$emit('refreshFlightList');
	                        $ionicHistory.goBack();              
	                        $rootScope.$emit('refreshFlightDetail');
	                        return deferred.resolve("GOHEAD");
	                    }, function (error) {
	                        console.log(JSON.stringify(error));
	                        return deferred.reject("Login-Error : " +JSON.stringify(error));
	                    });
	                    return deferred.promise;
	                }
            });
            }
        };
      
        $scope.deleteFlight = function () {
            WingsDialogService.confirm("Flight will be deleted locally.Do you want to continue?",'Confirm','OK,Cancel').then(function(buttonIndex) {
                if (buttonIndex == 1) {
                    var sql = " Delete From  Mm_Flights  " +
                              "  Where Id = ?;           ";
                    var parameters = [$rootScope.MM_M051_id];
                    WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                        //$rootScope.$emit('onflightcreate');
                        $ionicHistory.goBack();
                        return deferred.resolve("GOHEAD");
                    }, function (error) {
                        WingsDialogService.error(JSON.stringify(error));
                        console.log('MM_0100 - AcceptDiscrepancy - ERROR'+JSON.stringify(error));
                        return deferred.reject("Login-Error : " +JSON.stringify(error));
                    });   
                }
            });
        };
        $scope.RejectStatus = function () {
            var sql = " Update Mm_Flights set Status = 'SCHEDULED'" +
                      "  Where Id = ?; ";
            var parameters = [$rootScope.MM_M051_id];
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                $rootScope.$emit('refreshFlightList');
                $ionicHistory.goBack();
            }, function (error) {
                WingsDialogService.error(JSON.stringify(error));
                console.log('MM_0100 - AcceptDiscrepancy - ERROR'+JSON.stringify(error));
            });                                        
        };
        $scope.CancelFlight = function () {
            WingsDialogService.confirm("Flight will be cancelled.Do you want to proceed?",'Confirm','OK,Cancel').then(function(buttonIndex) {
                if (buttonIndex == 1) {
		            var sql = " Update Mm_Flights                                 " +
		            		"      set Status                      = 'CANCELLED', " +
		            		"          Cancel_Date                 = ?,           " +
		            		"          Canceled_By_Employee_Number = ?,           " +
		            		"          Mobile_Record_Status        = ?            " +
		                      "  Where Id                          = ?;           ";
		            var parameters = [moment().format('YYYY-MM-DD HH:MM'),$rootScope.globals.currentUser.userNumber,'READY',$rootScope.MM_M051_id];
		            WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
		            	 $rootScope.$emit('refreshFlightList');
		                 $ionicHistory.goBack();
		            }, function (error) {
		                WingsDialogService.error(JSON.stringify(error));
		                console.log('MM_0100 - AcceptDiscrepancy - ERROR'+JSON.stringify(error));
		            });  
                }
            });
        };
        function parseDate (date) {
            if (!WingsUtil.IsNull(date)) {
                var t = date.split(/[- :]/);
                var d = new Date(t[0], t[1]-1, t[2], t[3], t[4]);
                var actiondate = new Date(d);
                return actiondate;
            }
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
        			$scope.CompleteFlight();
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
        $scope.user = {
        		username:$rootScope.globals.currentUser.userId,
        		password:''
        };
        $scope.hide = function(){
        	$scope.modal.hide();
        	$scope.digitalSign = false
        	$scope.user.username = $rootScope.globals.currentUser.userId;
        	$scope.user.password = '';
        }
        $scope.showModal = function (action) {
        	$scope.isModalActive = true;
        	$scope.user.password = '';
            $scope.modal.show();
            if (!WingsUtil.IsNull($scope.canvas)) {
            	$scope.canvas.clear();
            	$scope.canvas.backgroundColor="#f5f2f0";
            	$scope.canvas.renderAll();
            } else {
	            $scope.canvas = new fabric.Canvas ('f');
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
        $scope.toggle = function (prop) {
            eval("$scope."+ prop +"="+"!$scope."+ prop );
        };
    } 
])