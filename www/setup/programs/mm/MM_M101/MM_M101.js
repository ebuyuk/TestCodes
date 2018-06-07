angular.module('WingsMobileStarter').controller('MM_M101', [
		'$scope','$rootScope','WingsSetupDBService','WingsTransactionDBService','$ionicHistory','WingsDialogService','$filter',
		function($scope,$rootScope,WingsSetupDBService,WingsTransactionDBService,$ionicHistory,WingsDialogService,$filter) {
			var defaultTailNumber = $rootScope.globals.deviceInformation.tailNumber;
			$scope.tailNumbers = [];
			$scope.stations = [];
			$scope.isReadOnly = false;
			$scope.flight = {
				    tail : {
				    		tailNumber :'',
				    		serialNumber:''
				    },
			        actualDate:new Date(),
					flightNumber:'',
					actualFrom:'',
					actualTo:'',
					actualOffBlock:'',
					actualTakeOff:'',
					actualLanding:'',
					actualOnBlock:'',
					employeeNumber:'',
					id:'',
					status:''
							
			};
			$scope.viewMode = 'insert';
			$scope.isAccept = false;
	        $scope.isCancel = false;
	        console.log("lel");
			if($rootScope.globals.viewMode == 'update' && $rootScope.globals.flightId != '') {
				$scope.viewMode = 'update';
				Query();
			}
			getstations();
			if(defaultTailNumber != '') {
				getSerialNumber();
				$scope.isReadOnly = true;
			} else {
				tailNumberLov();
			}
			
			$scope.resetFlight = function () {
				$scope.flight.tail.tailNumber='',
				$scope.flight.tail.serialNumber='',
				$scope.flight.actualDate='',
				$scope.flight.flightNumber='',
				$scope.flight.actualFrom='',
				$scope.flight.actualTo='',
				$scope.flight.actualOffBlock='',
				$scope.flight.actualTakeOff='',
				$scope.flight.actualLanding='',
				$scope.flight.actualOnBlock='',
				$scope.flight.employeeNumber=''
			};
			function tailNumberLov () {
				var sql = 'Select Tail_Number tailNumber,    ' +
					      '       Serial_Number serialNumber   ' +
				          '  From Mm_Aircrafts    ' +
				          ' Where Div_No = 1      ' +
				          ' Order By Tail_Number ';
				          
			/*	WingsSetupDBService.executeSql(sql).then(function (result){
					$scope.tailNumbers = result;
					return deferred.resolve(result);
				}, function (error) {
					console.log(JSON.stringify(error));
			        return deferred.reject("Login-Error : " +JSON.stringify(error));
			    });
			    */
				return deferred.promise;
			};
			function getSerialNumber () {
				var sql = "Select Serial_Number              " +
				          "  From Mm_Aircrafts               " +
				          " Where Div_No = 1                 " +
				          "   And Tail_Number = ?            ";
				
				var parameters =[$rootScope.globals.deviceInformation.tailNumber];         
		/*		WingsSetupDBService.executeSql(sql,parameters).then(function (result){
					if(result.length > 0) {
						$scope.flight.tail.tailNumber = defaultTailNumber;
						$scope.flight.tail.serialNumber = result[0].SERIAL_NUMBER;
					}
					return deferred.resolve(result);
				}, function (error) {
					console.log(JSON.stringify(error));
			        return deferred.reject("Login-Error : " +JSON.stringify(error));
			    });
			    */
				return deferred.promise;
			};
			function getstations () {
				var sql = 'Select Flight_Location      '+
					      '  From Mm_Flight_Locations  '+
					      ' Where Div_No = 1           '+
					      ' Order By Flight_Location   ';
				          
			/*	WingsSetupDBService.executeSql(sql).then(function (result){
					$scope.stations = result;
					return deferred.resolve(result);
				}, function (error) {
					console.log(JSON.stringify(error));
			        return deferred.reject("Login-Error : " +JSON.stringify(error));
			    });
			    */
				return deferred.promise;
			};
			$scope.Save = function () {
			    var sql2 = 'Select Max(Mobile_Record_Id) MOBILE_RECORD_ID from mm_Flights';
			    var sql = 'Insert Into mm_flights (Div_No,Tail_Number,Actual_From,Actual_To,Actual_Date,Flight_Number,Employee_Number,Status) '+
						  '     Values (1,?,?,?,?,?,?,?)';
			    var parameters = [$scope.flight.tail.tailNumber,
			                      $filter('uppercase')($scope.flight.actualFrom),
			                      $filter('uppercase')($scope.flight.actualTo),
			    				  moment($scope.flight.actualDate).format('YYYY-MM-DD'),
			    				  $filter('uppercase')($scope.flight.flightNumber),
			    				 /* moment($scope.flight.actualOffBlock).format('HH:mm'),
			    				  moment($scope.flight.actualTakeOff).format('HH:mm'),
			    				  moment($scope.flight.actualLanding).format('HH:mm'),
			    				  moment($scope.flight.actualOnBlock).format('HH:mm'),*/
			    				  '1021',
			    				  'SCHEDULED'];
			    WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
					console.log(JSON.stringify($scope.result));
					WingsDialogService.success();
		               WingsTransactionDBService.executeSql(sql2,[]).then(function (result2){
		                   $rootScope.globals.flightId  = result2[0].MOBILE_RECORD_ID;
		                   $rootScope.$emit('onflightcreate');
		                   $ionicHistory.goBack();
		                   return deferred.resolve("GOHEAD");
		               }, function (error) {
		                    WingsDialogService.error(JSON.stringify(error));
		                    console.log(JSON.stringify(error));
		                });
					
				}, function (error) {
					WingsDialogService.error(JSON.stringify(error));
					console.log(JSON.stringify(error));
			        return deferred.reject("Login-Error : " +JSON.stringify(error));
			    });
				return deferred.promise;
	        };
			function Query () {
			    var sql = "select a.mobile_record_id,                                            " +
	    	  	          "       a.tail_number,                                                 " +
	    	  	          "       strftime('%Y-%m-%d',a.actual_date) ACTUAL_DATE,                " +
	    	  	          "       a.flight_number,                                               " +
	    	  	          "       a.actual_from,                                                 " +
	    	  	          "       a.actual_to,                                                   " +
	    	  	          "       strftime('%Y-%m-%d %H:%M:%f' ,a.actual_off_block) off_block,   " +
	    	  	          "       strftime('%Y-%m-%d %H:%M:%f' ,a.actual_take_off) take_off,     " +
	    	  	          "       strftime('%Y-%m-%d %H:%M:%f' ,a.actual_landing) landing,       " +
	    	  	          "       strftime('%Y-%m-%d %H:%M:%f' ,a.actual_on_block) on_block,     " +
	    	  	          "       a.Status                                                       " +
	    	  	          "  from mm_flights a                                                   " +
	    	  	          " where Mobile_Record_id=?                                             " +
	    	  	          " order by mobile_record_id desc limit 1                               ";				
	
				var parameters = [$rootScope.globals.flightId];

			    WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
					console.log('MM_101 Query :'+JSON.stringify(result));
					if(result.length > 0) {
						console.log('MM_101 result[0].off_block :'+result[0].off_block);
						$scope.flight = {
								id:result.MOBILE_RECORD_ID,
							    tail : {
							    		tailNumber :result[0].TAIL_NUMBER
							    },
						        actualDate:new Date(result[0].ACTUAL_DATE),
								flightNumber:result[0].FLIGHT_NUMBER,
								actualFrom:result[0].ACTUAL_FROM,
								actualTo:result[0].ACTUAL_TO,
								actualOffBlock:result[0].off_block != null ? parseDate(result[0].off_block):'',
								actualTakeOff:result[0].take_off != null ? parseDate(result[0].take_off):'',
								actualLanding:result[0].landing != null ? parseDate(result[0].landing):'',
								actualOnBlock:result[0].on_block != null ? parseDate(result[0].on_block):'',
							    status : result[0].STATUS
							};
						if(result[0].STATUS == 'ACCEPTED' || result[0].STATUS == 'COMPLETED') {
						    $scope.isAccept = true;
						} else if (result[0].STATUS == 'CANCELLED'){
	                          $scope.isCancel = true;
						}
						
					}
					return deferred.resolve("GOHEAD");
				}, function (error) {
					console.log(JSON.stringify(error));
			        return deferred.reject("Login-Error : " +JSON.stringify(error));
			    });
				return deferred.promise;
	        };
			$scope.Update = function () {
			    var date = moment($scope.flight.actualDate);
			    var sql = "Update mm_flights set Actual_From      = ?,  " +
			    	      "                      Actual_To        = ?,  " +
			    	      "                      Actual_Date      = ?,  " +
			    	      "                      Flight_Number    = ?,  " +
			    	      "                      Actual_Off_Block = ?,  " +
			    	      "                      Actual_Take_Off  = ?,  " +
			    	      "                      Actual_Landing   = ?,  " +
			    	      "                      Actual_On_Block  = ?,  " +
			    	      "                      Status           = ?   " +
			    	      " Where Mobile_Record_id = ? ";
			    var status = $scope.flight.status;
			    console.log('xxxxxxxxxx'+status);
			    if($scope.flight.actualOffBlock != '' && $scope.flight.actualTakeOff  != '' && $scope.flight.actualLanding  != '' && $scope.flight.actualOnBlock  != '') {
			        status = 'COMPLETED';
			    }
			    var offBlock = '';
			    var takeOff = '';
			    var landing = '';
			    var onBlock = '';
			    if($scope.flight.actualOffBlock != '') {
			        offBlock = moment($scope.flight.actualOffBlock).year(date.year()).month(date.month()).date(date.date()).format('YYYY-MM-DD HH:mm');
			    }
			    if($scope.flight.actualTakeOff != '') {
			        takeOff =  moment($scope.flight.actualTakeOff).year(date.year()).month(date.month()).date(date.date()).format('YYYY-MM-DD HH:mm');
                }
			    if($scope.flight.actualLanding != '') {
			        landing = moment($scope.flight.actualLanding).year(date.year()).month(date.month()).date(date.date()).format('YYYY-MM-DD HH:mm'); 
                }
			    if($scope.flight.actualOnBlock != '') {
			        onBlock = moment($scope.flight.actualOnBlock).year(date.year()).month(date.month()).date(date.date()).format('YYYY-MM-DD HH:mm');
                }
			    if(landing < takeOff) {
			        landing = moment(landing).add('days',1).format('YYYY-MM-DD HH:mm');
			        onBlock = moment(onBlock).add('days',1).format('YYYY-MM-DD HH:mm');

			    }
			    var parameters = [  $filter('uppercase')($scope.flight.actualFrom),
	                                $filter('uppercase')($scope.flight.actualTo),
				    				moment($scope.flight.actualDate).format('YYYY-MM-DD'),
				    				$filter('uppercase')($scope.flight.flightNumber),
				    				offBlock,
				    				takeOff,
				    				landing,
				    				onBlock,
				    				status,
				    				$rootScope.globals.flightId];
	             console.log('xxxxxxxxxx'+status);
			    WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
					console.log(JSON.stringify(result));
					$rootScope.$emit('getFlightInformation');
					$ionicHistory.goBack();					
					return deferred.resolve("GOHEAD");
				}, function (error) {
					console.log(JSON.stringify(error));
			        return deferred.reject("Login-Error : " +JSON.stringify(error));
			    });
				return deferred.promise;
	        };
	        
	        $scope.RejectStatus = function () {
                var sql = " Update mm_flights set Status = 'SCHEDULED'" +
                          "  Where Mobile_Record_Id = ?; ";
                var parameters = [$rootScope.globals.flightId];
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    $rootScope.$emit('getFlightInformation');
                    $ionicHistory.goBack();
                    return deferred.resolve("GOHEAD");
                }, function (error) {
                    WingsDialogService.error(JSON.stringify(error));
                    console.log('MM_0100 - AcceptDiscrepancy - ERROR'+JSON.stringify(error));
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });                                        
            };
            function parseDate (date) {
                var t = date.split(/[- :]/);
                var d = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
                var actiondate = new Date(d);
                return actiondate;
            };
		}
		])