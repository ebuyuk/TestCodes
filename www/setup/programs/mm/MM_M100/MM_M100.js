angular.module('WingsMobileStarter').controller('MM_M100', [
		'$scope','$rootScope','WingsTransactionDBService','WingsDialogService','$q','$state','$rootElement','$ionicPopover',
		function($scope,$rootScope,WingsTransactionDBService,WingsDialogService,$q,$state,$rootElement,$ionicPopover) {
			var defaultTailNumber = $rootScope.globals.deviceInformation.tailNumber;
			$scope.hasConsumption = false;
			$scope.hasInspection = false;
			$scope.isAccepted = false;
			$scope.isDiscShown = true;
			$scope.flights = [];
	        $scope.accDisc = [];
	        $scope.defDisc = [];
	        $scope.openDisc = [];
	        $scope.closedDisc = [];
            $scope.records = [];
	        var currentState = $state.current;
	        $scope.technician = false;
            $scope.cabin = false;

	        var showCabinItems = 'N';
	        if(currentState.data.programId == 'MM_M105') {
	            $scope.technician = true;
	            getTechnicianFlightInformation();
	        } else if(currentState.data.programId == 'MM_M106') {
                $scope.cabin = true;
                showCabinItems = 'Y';
	        }
	        $scope.getEmployeeName = getEmployeeName;
	        $scope.isAcceptanceWarning = false;
	        $scope.isFlightAcceptable = false;
	        OnLoad();
	        function OnLoad () {
                var promises = [];
                resetFlight();
                if($scope.technician || $scope.cabin) {
                    promises.push(getDeferredDiscrepancy());
                   promises.push(getOpenDiscrepancy());
                    promises.push(getClosedDiscrepancy());
                    $q.all(promises).then(function(res) {
                        console.log('ONLOAD:'+$scope.flight.id);
                       
                    },function(error) {
                        console.log("PROMISES  - ERROR"+JSON.stringify(error));
                      });
                }else {
    	            getLastFlight().then(function (result){
    	                promises.push(getDeferredDiscrepancy());
    	                promises.push(getOpenDiscrepancy());
    	                promises.push(getClosedDiscrepancy());
    	                $q.all(promises).then(function(res) {
    	                    console.log('ONLOAD:'+$scope.flight.id);
                           
                        },function(error) {
                            console.log("PROMISES  - ERROR"+JSON.stringify(error));
                          });
                    }, function (error) {
                    });
                }
	        }
	        function checkFlightAcceptence () {
	            if($scope.flight.id != '' && $scope.hasConsumption && $scope.hasInspection && !$scope.isAcceptanceWarning ) {
	                $scope.isFlightAcceptable = false;
	            } else {
	                $scope.isFlightAcceptable = true;
	            }
	        }
	        $ionicPopover.fromTemplateUrl('templates/popover.html', {
	            scope: $scope,
	          }).then(function(popover) {
	            $scope.popover = popover;
	          });
			$scope.toggle = function(prop) {
			    eval("$scope."+ prop +"="+"!$scope."+ prop );
			};
			$scope.New  = function () {
	             $scope.popover.hide();
				$rootScope.globals.viewMode ='insert';
			    $state.go('app.MM_M101');
			};
			$scope.OpenD  = function () {
			    $rootScope.globals.viewMode='insert';
	            $rootScope.globals.id = '';
	            $rootScope.globals.windowType = '';
	            if($scope.cabin) {
	                $rootScope.globals.windowType='cabin';
	            }
				$state.go('app.MM_M102');
			};
			$scope.OpenC  = function () {
				if (!$scope.hasConsumption) {
				    $rootScope.globals.viewMode='insert';
					$state.go('app.MM_M103');
				}
			};
			$scope.OpenI  = function () {
				if (!$scope.hasInspection && $rootScope.globals.flightId != '') {
					$rootScope.globals.viewMode='insert';
					$state.go('app.MM_M104');
				}else {
					WingsDialogService.error('You must select a flight');
				}
			};
			$scope.EditFlight = function () {
			    if($rootScope.globals.flightId != undefined && $rootScope.globals.flightId != '') {
		            $scope.popover.hide();
			        $rootScope.globals.viewMode='update';
			        $state.go('app.MM_M101');
			    }
			};
			$scope.EditInspection = function () {
				if ($scope.hasInspection){
				    $rootScope.globals.viewMode='update';
					$state.go('app.MM_M104');
				}
			};
			$scope.EditConsumption = function () {
				 if ($scope.hasConsumption) {
					 $rootScope.globals.viewMode='update';
					 $state.go('app.MM_M103');
				 }
			};
			$scope.EditDiscrepancy = function (id) {
                $rootScope.globals.viewMode='update';
                $rootScope.globals.id = id;
                $state.go('app.MM_M102');
            };
            $scope.ShowCabinItems = function () {
                if($scope.flight.isShowCabinItems == true) {
                    showCabinItems = 'Y';
                    getDeferredDiscrepancy();
                    getOpenDiscrepancy();
                    getClosedDiscrepancy();                
                }else if($scope.flight.isShowCabinItems == false) {
                    showCabinItems = 'N';
                    getDeferredDiscrepancy();
                    getOpenDiscrepancy();
                    getClosedDiscrepancy();                
                }
            };
            $scope.AcceptDiscrepancy = function (id) {
                var sql = " Update mm_discrepancies set Accepted_Flights = Accepted_Flights || ? || ','   " +
                          "  Where Mobile_Record_Id = ?;                                                  ";
                var parameters = [$rootScope.globals.flightId,id];
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    getAcceptenceDiscrepancy();
                    getDeferredDiscrepancy();
                    return deferred.resolve("GOHEAD");
                }, function (error) {
                    WingsDialogService.error(JSON.stringify(error));
                    console.log('MM_0100 - AcceptDiscrepancy - ERROR'+JSON.stringify(error));
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });    
            };
            $scope.AcceptAircraft = function (id) {
                var buttonArray= ['Ok','Cancel'];
                WingsDialogService.confirm('Are you sure to accept aircraft?','Confirm',buttonArray).then(function(buttonIndex) {
                    // no button = 0, 'Ok' = 1, 'Cancel' = 2
                    var btnIndex = buttonIndex;
                    if(buttonIndex == 1) {
                        var sql = " Update mm_flights set Status = 'ACCEPTED'" +
                                  "  Where Mobile_Record_Id = ?; ";
                        var parameters = [$rootScope.globals.flightId];
                        WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                            $scope.isAccepted = true;
                            $scope.flight.status = 'ACCEPTED';
                            return deferred.resolve("GOHEAD");
                        }, function (error) {
                            WingsDialogService.error(JSON.stringify(error));
                            console.log('MM_0100 - AcceptDiscrepancy - ERROR'+JSON.stringify(error));
                            return deferred.reject("Login-Error : " +JSON.stringify(error));
                      });             
                    }
                });
                                             
            };
			 $rootScope.$on('onflightcreate', function(){
			     $scope.flight.id = $rootScope.globals.flightId;
			     $scope.getFlightInformation();
		     });
			 $rootScope.$on('oninspectioncreate', function(){
				 getInspection();
		     });
			 $rootScope.$on('onConsumptionCreate', function(){
                 getConsumption();
		     });
			 $rootScope.$on('getFlightInformation', function(){
				 $scope.getFlightInformation();
		     });
			 $rootScope.$on('onDiscrepancyCreate', function(){
			     getAcceptenceDiscrepancy();
	             getDeferredDiscrepancy();
	             getOpenDiscrepancy();
	             getClosedDiscrepancy();
             });
			 function resetFlight() {
    			 $scope.flight = {
    			     tailNumber:'',
    			     actualFrom:'',
    			     actualTo:'',
    			     actualDate:'',
    			     flightNumber:'',
    			     serialNumber:'',
    			     offBlock:'',
    			     takeOff:'',
    			     landing:'',
    			     onBlock:'',
    			     employeeNumber:'',
    			     status:'',
    			     id:'',
    			     inspection:{
    			    	 date:'',
    			    	 type:'',
    			    	 number:'',
    			    	 name:''
    			     },
    			     consumption : {
    			    	 date:'',
    			    	 description:'',
    			    	 added:''
    			     },
    			     isShowCabinItems:false
    			 };
			 }
			 $scope.lof = function () {
	             $scope.popover.hide();
				 var sql = " Select * " +
				 		   "   From Mm_Flights ";
				 
				 WingsTransactionDBService.executeSql(sql).then(function (result){
				     if(result.length > 0) {
					     $scope.flights = result;
					 }
					 return deferred.resolve("GOHEAD");
				 }, function (error) {
				     WingsDialogService.error(JSON.stringify(error));
					 console.log('MM_0100 - lof - lof'+JSON.stringify(error));
				     return deferred.reject("lof-Error : " +JSON.stringify(error));
				 });
				 return deferred.promise;
			 };
			 function getLastFlight () {
                 var deferred = $q.defer();
			     var sql = " Select w.Div_No,                                                              " +                                                           
			               "        w.Tail_Number Tail_Number,                                             " +                                                      
				           "        w.Mobile_Record_Id Mobile_Record_Id,                                   " +                                                   
			               "        w.Employee_Number Employee_Number,                                     " +                                                  
			               "        w.Status Status,                                                       " +                                                           
					       "        (Select Max(y.Actual_Date)                                             " +                                          
					       "           From Mm_Flights y                                                   " +                                                
			               "          Where y.Mobile_Record_Id = w.Mobile_Record_Id) Last_Actual_Date,     " +
			               "        (Select Max(y.Actual_From)                                             " +                                          
			               "           From Mm_Flights y                                                   " +                                                
			               "           Where y.Mobile_Record_Id = w.Mobile_Record_Id) Last_Actual_From,    " +
			               "        (Select Max(y.Actual_To)                                               " +                                            
			               "           From Mm_Flights y                                                   " +                                                
			               "          Where y.Mobile_Record_Id = w.Mobile_Record_Id) Last_Actual_To,       " +    
			               "        (Select Max(y.Flight_Number)                                           " +                                        
			               "           From Mm_Flights y                                                   " +                                                
			               "          Where y.Mobile_Record_Id = w.Mobile_Record_Id) Last_Flight_Number,   " +
					       "        (Select Max(y.Actual_Take_Off)                                         " +                                      
					       "           From Mm_Flights y                                                   " +                                                
			               "          Where y.Mobile_Record_Id = w.Mobile_Record_Id) Last_Actual_Take_Off, " +
			               "        (Select Max(y.Actual_Landing)                                          " +                                           
			               "           From Mm_Flights y                                                   " +                                                    
			               "          Where y.Mobile_Record_Id = w.Mobile_Record_Id) Last_Actual_Landing,  " +
			               "        (Select Max(y.Actual_Off_Block)                                        " +                                         
			               "           From Mm_Flights y                                                   " +                                                    
			               "          Where y.Mobile_Record_Id = w.Mobile_Record_Id) Last_Actual_Off_Block," +
			               "        (Select Max(y.Actual_On_Block)                                         " +                                          
			               "           From Mm_Flights y                                                   " +                                                    
			               "          Where y.Mobile_Record_Id = w.Mobile_Record_Id) Last_Actual_On_Block, " +
			               "         Status                                                                " +
			               "   From Mm_Flights w                                                           " +
			               "  Where w.Actual_Take_Off = (Select Min(t.Actual_Take_Off)                     " +
			               "                                From Mm_Flights t                              " +
			               "                               Where t.Div_No      = w.Div_No                  " +
			               "                                 And t.Status in('SCHEDULED','ACCEPTED')       " +
			               "                                 And t.Tail_Number = ?);                       ";
				 
				 
				 var parameters = [defaultTailNumber];
				 WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
				     console.log('MM_0100 - Flight '+JSON.stringify(result));
					 if(result.length > 0) {
					     $scope.flight.tailNumber = result[0].Tail_Number;
						 $scope.flight.actualFrom = result[0].Last_Actual_From;
						 $scope.flight.actualTo = result[0].Last_Actual_To;
						 $scope.flight.actualDate = result[0].Last_Actual_Date;
						 $scope.flight.flightNumber = result[0].Last_Flight_Number;
						 $scope.flight.offBlock = result[0].Last_Actual_Off_Block != null ? moment(result[0].Last_Actual_Off_Block).format('HH:mm'):'';
						 $scope.flight.takeOff = result[0].Last_Actual_Take_Off != null ? moment(result[0].Last_Actual_Take_Off).format('HH:mm'):'';
						 $scope.flight.landing = result[0].Last_Actual_Landing != null ? moment(result[0].Last_Actual_Landing).format('HH:mm'):'';
						 $scope.flight.onBlock = result[0].Last_Actual_On_Block != null ? moment(result[0].Last_Actual_On_Block).format('HH:mm'):'';
						 $scope.flight.employeeNumber = result[0].Employee_Number;
						 $scope.flight.status = result[0].Status;
						 $scope.flight.id = result[0].Mobile_Record_Id;	
						 $rootScope.globals.flightId = $scope.flight.id;
						 if(result[0].Status == 'ACCEPTED') {
						     $scope.isAccepted = true;
						 }else if (result[0].Status == 'SCHEDULED') {
						     $scope.isAccepted = false;
						 }else if (result[0].Status == 'COMPLETED') {
                             $scope.isAccepted = false;
                         }
						 getConsumption();
						 getInspection();
						 getAcceptenceDiscrepancy();
					}
					return deferred.resolve("GOHEAD");
				}, function (error) {
  				    WingsDialogService.error(JSON.stringify(error));
					console.log('MM_0100 - Flight - ERROR'+JSON.stringify(error));
				    return deferred.reject("Login-Error : " +JSON.stringify(error));
				});
				return deferred.promise;
			 };
			 $scope.getFlightInformation = function() {
				 console.log("getflightinfo");
			     var sql = " Select w.*                        " +
			               "   From Mm_Flights w             " +
			               "  Where w.Mobile_Record_Id = ?; ";
				 
				 var parameters = [$scope.flight.id];
				 WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
  				     console.log('MM_0100 - getFlightInformation '+JSON.stringify(result));
					 if(result.length > 0) {
					     $scope.flight.tailNumber = result[0].TAIL_NUMBER;
						 $scope.flight.actualFrom = result[0].ACTUAL_FROM;
						 $scope.flight.actualTo = result[0].ACTUAL_TO;
						 $scope.flight.actualDate = result[0].ACTUAL_DATE;
						 $scope.flight.flightNumber = result[0].FLIGHT_NUMBER;
						 $scope.flight.offBlock = !isNull(result[0].ACTUAL_OFF_BLOCK) ? moment(result[0].ACTUAL_OFF_BLOCK).format('HH:mm'):'';
						 $scope.flight.takeOff = !isNull(result[0].ACTUAL_TAKE_OFF) ? moment(result[0].ACTUAL_TAKE_OFF).format('HH:mm'):'';
						 $scope.flight.landing = !isNull(result[0].ACTUAL_LANDING) ? moment(result[0].ACTUAL_LANDING).format('HH:mm'):'';
						 $scope.flight.onBlock = !isNull(result[0].ACTUAL_ON_BLOCK) ? moment(result[0].ACTUAL_ON_BLOCK).format('HH:mm'):'';
						 $scope.flight.employeeNumber = result[0].EMPLOYEE_NUMBER;
						 $scope.flight.status = result[0].STATUS;
						 $scope.flight.id = result[0].MOBILE_RECORD_ID;	
						 $rootScope.globals.flightId = $scope.flight.id;
						 if(result[0].STATUS == 'ACCEPTED') {
                             $scope.isAccepted = true;
                         }else if (result[0].STATUS == 'SCHEDULED') {
                             $scope.isAccepted = false;
                         }else if (result[0].STATUS == 'COMPLETED') {
                             $scope.isAccepted = false;
                         }
						 getConsumption();
						 getInspection();
					} else {
					    resetFlight();
                        $rootScope.globals.flightId = '';
					}
					 getAcceptenceDiscrepancy();
					 checkFlightAcceptence();
					return deferred.resolve("GOHEAD");
				}, function (error) {
					WingsDialogService.error(JSON.stringify(error));
					console.log('MM_0100 - Flight - ERROR'+JSON.stringify(error));
			        return deferred.reject("Login-Error : " +JSON.stringify(error));
			    });
				return deferred.promise;
			 };
			 function getConsumption () {
				   var sql = " Select a.*,                                                                                                                                 " +
			                 "        Case When ifnull(a.No_Refuelling_Flag, 'false') = 'false' Then                                                                       " +  
			                 "        '<b>Supplier: </b>'||a.Vendor_Number/*(Select ifnull(Max(x.Vendor_Name),'-'                                                          " +
			                 "                                From Ic_Vendors x                                                                                            " +
			                 "                               Where x.Div_No = a.Div_No                                                                                     " +
			                 "                                 And x.Vendor_Number = a.Vendor_Number)*/||' / '||a.Fuel_Type||'<br>'||                                      " +
			                 "        '<b>Uplift: </b>'||a.Added||' L ('||(a.Added*a.Density)||' kg)'||'<br>'||                                                            " +
			                 "        '<b>Calc.Fuel after Uplift: </b>'||(a.Remaining+a.Added)||' L ('||((a.Remaining+a.Added)*a.Density)||' kg)'||'<br>'||                " +
			                 "        '<b>Indicated Fuel: </b>'||a.Departure||' L ('||(a.Departure*a.Density)||' kg)'||'<br>'||                                            " +
			                 "        '<b>Calc.Difference: </b>'||((a.Remaining+a.Added-a.Departure)*a.Density)||' kg' Else 'No Refuelling' End as Flight_Consumption_Text " +
			                 "   From Mm_Flight_Consumptions a                                                                                                             " +
			                 "  Where a.Div_No = 1                                                                                                                         " +
			                 "    And a.Consumption_Type = 'FUEL'                                                                                                          " +
			                 "    And a.Flight_Id = ?                                                                                                                      " ;
				   
				   var sql2 = " Select Vendor_Name        " +
                              "   From IC_VENDORS         " +
                              "  Where Div_No = 1         " +
                              "    And Vendor_Number = ?  ";
				   var parameters = [$scope.flight.id]
				    WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
						console.log('MM_0100 - Consumption '+JSON.stringify(result));
						if(result.length > 0) {
							$scope.hasConsumption = true;
							var vendorNumber = result[0].VENDOR_NUMBER;
			                var parameters2 = [vendorNumber];
			                var vendorName = '';
			                if(vendorNumber != '') {
    			                /*WingsSetupDBService.executeSql(sql2,parameters2).then(function (result2){
    		                        vendorName = result2[0].VENDOR_NAME;
    		                        $scope.flight.consumption.description = result[0].Flight_Consumption_Text.replace(vendorNumber,vendorName);
    		                        return deferred.resolve(result2);
    		                    }, function (error) {
    		                        console.log(JSON.stringify(error));
    		                        return deferred.reject("Login-Error : " +JSON.stringify(error));
    		                    });*/
			                }else {
                                $scope.flight.consumption.description = result[0].Flight_Consumption_Text;
			                }
							/*$scope.flight.consumption.date = result[0].Consumption_Date;
						    $scope.flight.consumption.description = result[0].Description;
							$scope.flight.consumption.added = result[0].Amount;*/
						} else {
							$scope.hasConsumption = false;
							$scope.flight.consumption.description = '';
						   /* $scope.flight.consumption.date ='';
						    $scope.flight.consumption.description = '';
						    $scope.flight.consumption.added = '';*/
						}
						checkFlightAcceptence();
					}, function (error) {
						console.log(JSON.stringify(error));
				        return deferred.reject("Login-Error : " +JSON.stringify(error));
		            });
			        return deferred.promise;
				};
				
				function getInspection () {
					 var sql = 'Select a.Inspection_Date   Inspection_Date,  ' +
					           '       a.Inspector_Number  Inspector_Number, ' +
					           '       a.Inspection_Type   Inspection_Type   ' +
						       ' From  MM_FLIGHT_INSPECTIONS a               ' +
						       'Where a.Div_No = 1                           ' +
						       '  And a.Flight_Id = ?                        '; 
					 
				    var sql2 = 'Select employee_name       ' +
				               '  From LB_EMPLOYEES        ' +
				               ' where EMPLOYEE_NUMBER = ? ';
				    var parameters = [$scope.flight.id]
				    WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
						console.log('MM_0100 - Inspection '+JSON.stringify(result));
						if(result.length > 0) {
						    $scope.flight.inspection.date = moment(result[0].Inspection_Date).format('DD MMMM YY, HH:mm');
						    $scope.flight.inspection.number = result[0].Inspector_Number;
						    $scope.flight.inspection.type = result[0].Inspection_Type;
						    $scope.hasInspection = true;
						    var parameters2 = [result[0].Inspector_Number];
						    /*WingsSetupDBService.executeSql(sql2,parameters2).then(function (result2){
						    	if(result2.length > 0) {
						    		$scope.flight.inspection.name = result2[0].EMPLOYEE_NAME;
						    	}
						    	return deferred.resolve("GOHEAD");
						    }, function (error) {
						    	console.log(JSON.stringify(error));
						    	return deferred.reject("Login-Error : " +JSON.stringify(error));
						    });*/
						} else {
							$scope.flight.inspection.name = '';
							$scope.flight.inspection.date = '';
							$scope.flight.inspection.type = '';
				    		$scope.hasInspection = false;
						}
						checkFlightAcceptence();
					}, function (error) {
						console.log(JSON.stringify(error));
				        return deferred.reject("Login-Error : " +JSON.stringify(error));
		            });
			        return deferred.promise;
			    };
			    function getAcceptenceDiscrepancy () {
		            var promises = [];
                    var sql =   " Select *,                                                       " +
                                "        date(julianday(date(Report_Date))+Interval_Day) Due_Date " +
                                "   From Mm_Discrepancies a                                       " +
                                "  Where a.Div_No               = 1                               " +
                                "    And ifnull(Acceptance_Required_Flag,'N') = 'Y'               " +
                                "    And ifnull(Accepted_Flights,'_xX_') Not Like '%'||?||',%'    " +
                                "    And Status != 'CLOSE'                                        " ;
                   
                    var parameters = [$rootScope.globals.flightId];
                    if($scope.flight.status != 'COMPLETED' && $scope.flight.status != 'CANCELLED' ) {
                        WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                            console.log('MM_0100 - AcceptenceDiscrepancy '+JSON.stringify(result));
                            if(result.length > 0) {
                                $scope.isAcceptanceWarning = true;
                                for (var i = 0;i<result.length;i++) {
                                    var jsonObj= null;
                                    var resultLoop = result[i];
                                    promises.push(getEmployeeName(resultLoop.REPORTED_BY_EMPLOYEE_NUMBER));
                                    //console.log('###jsonObj '+jsonObj);
                                }
                                $q.all(promises).then(function(res) {
                                    for (var i = 0;i<res.length;i++){
                                        console.log("PROMISES  - RESULTS : "+res[i]);
                                        result[i].employeeName= res[i]; 
                                    }
                                },function(error) {
                                    console.log("PROMISES  - ERROR"+JSON.stringify(error));
                                  });
                                for (var i = 0;i<result.length;i++){
                                    result[i].REPORT_DATE= moment(result[i].REPORT_DATE).format('DD MMMM YY'); 
                                }
                                $scope.accDisc = result;
                            }else {
                                $scope.accDisc = [];
                                $scope.isAcceptanceWarning = false;
                            }
                            checkFlightAcceptence();
                        }, function (error) {
                            console.log(JSON.stringify(error));
                            return deferred.reject("Login-Error : " +JSON.stringify(error));
                        });
                    }
                    return deferred.promise;
                }; 
                function getDeferredDiscrepancy () {
                    var promises = [];
                    var sql = "Select Discrepancy_Type            " +
                               "  From Mm_Discrepancy_Types       " +
                               " Where Div_No = 1                 " +
                               "   And ifnull(Cabin_Flag,'N') = ? " ;
                    
                    var parameters=[showCabinItems];
                    var parameters2 = [$rootScope.globals.flightId];
                    var questionMarks = '';
             /*       WingsSetupDBService.executeSql(sql,parameters).then(function (result){
                        if(result.length > 0) {
                            for (var i = 0;i<result.length;i++) {
                                questionMarks = questionMarks + ',?';
                                parameters2.push(result[i].DISCREPANCY_TYPE);
                            }
                            questionMarks = questionMarks.replace(',','');
                        } */
                        var sql2 =   " Select *,                                                       " +
                                    "         Case when ifnull(Accepted_Flights,'_xX_') Not Like '%'||?||',%' Then 'false' else 'true' End Acceptence_Status,    " +
                                    "         date(julianday(date(Report_Date))+Interval_Day) Due_Date " +
                                    "   From Mm_Discrepancies a                                        " +
                                    "  Where a.Div_No = 1                                              " +
                                /*    "    And a.Discrepancy_Type in ("+questionMarks+")                 " + */
                                    "    And a.Status = 'DEFER'                                        " ;
                        WingsTransactionDBService.executeSql(sql2,parameters2).then(function (result2){
                            console.log('MM_0100 - Defer '+JSON.stringify(result2));
                            if(result2.length > 0) {
                                for (var i = 0;i<result2.length;i++) {
                                    var jsonObj= null;
                                    var resultLoop = result2[i];
                                    promises.push(getEmployeeName(resultLoop.REPORTED_BY_EMPLOYEE_NUMBER));
                                }
                                $q.all(promises).then(function(res) {
                                    for (var i = 0;i<res.length;i++){
                                        result2[i].employeeName= res[i]; 
                                    }
                                },function(error) {
                                    console.log("PROMISES  - ERROR"+JSON.stringify(error));
                                  });
                                for (var i = 0;i<result2.length;i++){
                                    result2[i].Due_Date= moment(result2[i].Due_Date).format('DD MMMM YY'); 
                                    result2[i].REPORT_DATE= moment(result2[i].REPORT_DATE).format('DD MMMM YY'); 
                                }
                                $scope.defDisc = result2;
                            }else {
                                $scope.defDisc=[];
                            }
                        }, function (error) {
                            console.log(JSON.stringify(error));
                            return deferred.reject("Login-Error : " +JSON.stringify(error));
                        });                       
                    
                    return deferred.promise;
                }; 
                function getOpenDiscrepancy () {
                    var promises = [];
                    var sql = "Select Discrepancy_Type           " +
                              "  From Mm_Discrepancy_Types       " +
                              " Where Div_No = 1                 " +
                              "   And ifnull(Cabin_Flag,'N') = ? " ;

                    var parameters=[showCabinItems];
                    var parameters2 = [];
                    var questionMarks = '';
               /*     WingsSetupDBService.executeSql(sql,parameters).then(function (result){
                        if(result.length > 0) {
                            for (var i = 0;i<result.length;i++) {
                                questionMarks = questionMarks + ',?';
                                parameters2.push(result[i].DISCREPANCY_TYPE);
                            }
                            questionMarks = questionMarks.replace(',','');
                        } */
                        var sql2 =   " Select *                                             " +
                                     "   From Mm_Discrepancies a                            " +
                                     "  Where a.Div_No = 1                                  " +
                                 /*    "    And a.Discrepancy_Type in ("+questionMarks+")     " +  */
                                     "    And a.Status = 'OPEN'                             ";
                        WingsTransactionDBService.executeSql(sql2,parameters2).then(function (result2){
                            console.log('MM_0100 - OPEN '+JSON.stringify(result2));
                            if(result2.length > 0) {
                                for (var i = 0;i<result2.length;i++) {
                                    var jsonObj= null;
                                    var resultLoop = result2[i];
                                    promises.push(getEmployeeName(resultLoop.REPORTED_BY_EMPLOYEE_NUMBER));
                                }
                                $q.all(promises).then(function(res) {
                                    for (var i = 0;i<res.length;i++){
                                        result2[i].employeeName= res[i]; 
                                    }
                                },function(error) {
                                    console.log("PROMISES  - ERROR"+JSON.stringify(error));
                                });
                                for (var i = 0;i<result2.length;i++){
                                    result2[i].REPORT_DATE= moment(result2[i].REPORT_DATE).format('DD MMMM YY'); 
                                }
                                $scope.openDisc = result2;
                                
                            }else {
                                $scope.openDisc=[];
                            }
                        }, function (error) {
                            console.log(JSON.stringify(error));
                        });                       
                   
                    return deferred.promise;
                };  
                function getClosedDiscrepancy () {
                    var promises = [];
                    var sql = "Select Discrepancy_Type     " +
                              "  From Mm_Discrepancy_Types " +
                              " Where Div_No = 1           " +
                              "   And ifnull(Cabin_Flag,'N') = ? " ;

                    var parameters=[showCabinItems];
                    var parameters2 = [];
                    var questionMarks = '';
              /*      WingsSetupDBService.executeSql(sql,parameters).then(function (result){
                        if(result.length > 0) {
                            for (var i = 0;i<result.length;i++) {
                                questionMarks = questionMarks + ',?';
                                parameters2.push(result[i].DISCREPANCY_TYPE);
                            }
                            questionMarks = questionMarks.replace(',','');
                        } */
                        var sql2 =   " Select *,                                                        " +
                                     "        date(julianday(date(Report_Date))+Interval_Day) Due_Date  " +
                                     "   From Mm_Discrepancies a                                        " +
                                     "  Where a.Div_No = 1                                              " +
                                   /*  "    And a.Discrepancy_Type in ("+questionMarks+")                 " + */
                                     "    And a.Status = 'CLOSE'                                        ";
                        WingsTransactionDBService.executeSql(sql2,parameters2).then(function (result2){
                            console.log('MM_0100 - Close '+JSON.stringify(result2));
                            if(result2.length > 0) {
                                for (var i = 0;i<result2.length;i++) {
                                    var jsonObj= null;
                                    var resultLoop = result2[i];
                                    promises.push(getEmployeeName(resultLoop.REPORTED_BY_EMPLOYEE_NUMBER));
                                }
                                $q.all(promises).then(function(res) {
                                    for (var i = 0;i<res.length;i+=2){
                                        result2[i].employeeName= res[i]; 
                                        result2[i].rectEmployeeName = res[i++];
                                    }
                                },function(error) {
                                    console.log("PROMISES  - ERROR"+JSON.stringify(error));
                                });
                                for (var i = 0;i<result2.length;i++){
                                    result2[i].RECTIFICATION_DATE = moment(result2[i].RECTIFICATION_DATE).format('DD MMMM YY'); 
                                    result2[i].Due_Date = moment(result2[i].Due_Date).format('DD MMMM YY'); 
                                    result2[i].REPORT_DATE= moment(result2[i].REPORT_DATE).format('DD MMMM YY'); 
                                }
                                $scope.closedDisc = result2;
                            }else {
                                $scope.closedDisc=[];
                            }
                        }, function (error) {
                            console.log(JSON.stringify(error));
                        });                       

                    return deferred.promise;
                }; 
                function getEmployeeName (number) {
                    var deferred = $q.defer();
                    var sql = 'Select employee_name ' +
                               ' From LB_EMPLOYEES   ' +
                               'where EMPLOYEE_NUMBER = ? ';
                    var parameters = [number];
                    /* WingsSetupDBService.executeSql(sql,parameters).then(function (result){
                        var results = [];
                    if(result.length > 0) {
                        results.push(result[0].EMPLOYEE_NAME);
                    }
                    return deferred.resolve(results);
                    }, function (error) {
                        console.log(JSON.stringify(error));
                        return deferred.reject("Login-Error : " +JSON.stringify(error));
                    });
                    return deferred.promise;  */
                };
                function getTechnicianFlightInformation () {
                    var promises = [];
                    var sql  =   "Select * ," +
                    		     "Cast ((JulianDay(Departure_Time) - JulianDay(Arrival_Time)) * 24 As Integer )|| ':'||(Cast ((JulianDay(Departure_Time) - JulianDay(Arrival_Time)) * 24*60 As Integer ) % 60 ) Ground_Time,   "+
                    		     "Case When JulianDay(Departure_Time) < JulianDay('now') Then '-'  " +
                    		     "     When JulianDay(Arrival_Time) > JulianDay('now') Then Cast ((JulianDay(Departure_Time) - JulianDay(Arrival_Time)) * 24 As Integer )|| ':'||(Cast ((JulianDay(Departure_Time) - JulianDay(Arrival_Time)) * 24*60 As Integer ) % 60 )" +
                    		     "     When (JulianDay(Arrival_Time)< JulianDay('now') AND JulianDay(Departure_Time) > JulianDay('now')) Then (Cast(((JulianDay(Departure_Time) - JulianDay('now')))* 24 As Integer )|| ':'||(Cast (((JulianDay(Departure_Time) - JulianDay('now'))) * 24*60 As Integer )) % 60) End Remaining_Time  "+
                                 " from (                                                                                                           " +
                                 "Select a.Actual_Date Arrival_Date,                                                                                        " +
                                 "       a.Actual_From Arrival_Station,                                                                                     " +
                                 "       a.Actual_Landing Arrival_Time,                                                                                     " +
                                 "       Actual_To Ground_Station,                                                                                          " +
                                 "       (Select y.Actual_Take_Off                                                                                          " +
                                 "          From Mm_Flights y                                                                                               " +
                                 "         Where y.Div_No          = a.Div_No                                                                               " +
                                 "           And y.Tail_Number     = a.Tail_Number                                                                          " +
                                 "           And y.Mobile_Record_Id = (Select Max(t.Mobile_Record_Id)                                                       " +
                                 "                                From Mm_Flights t                                                                         " +
                                 "                               Where t.Div_No      = y.Div_No                                                             " +
                                 "                                 And Datetime (t.actual_take_off) > datetime(a.Actual_Landing)                            " +
                                 "                                 And t.Tail_Number = y.Tail_Number)) Departure_Time,                                      " +
                                 "       (Select Max(x.Actual_To)                                                                                           " +
                                 "          From Mm_Flights x                                                                                               " +
                                 "         Where x.Div_No        = a.Div_No                                                                                 " +
                                 "           And x.Tail_Number   = a.Tail_Number                                                                            " +
                                 "           And x.Actual_Take_Off = (Select Min(y.Actual_Take_Off)                                                           " +
                                 "                                    From Mm_Flights y                                                                     " +
                                 "                                    Where y.Div_No          = a.Div_No                                                    " +
                                 "                                      And y.Tail_Number     = a.Tail_Number                                               " +
                                 "                                      And y.Actual_Take_Off > a.Actual_Landing)) Departure_Station,                       " +
                                 "       a.actual_date,                                                                                                     " +
                                 "       a.Actual_Landing                                                                                                   " +
                                 "  From Mm_Flights a                                                                                                       " +
                                 "Where a.Div_No = 1                                                                                                        " +
                                 "   And a.Tail_Number = ?)                                                                                                  " +
                                 "Order By Arrival_Date                                                                                                     ";
                 
                    var parameters = [defaultTailNumber];
                    WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                        console.log('MM_0105 - TechnicianFlightInformation '+JSON.stringify(result));
                        if(result.length > 0) {
                            for (record in result) {
                                $scope.records.push(result[record]);
                            }
                        }

                    }, function (error) {
                        console.log(JSON.stringify(error));
                        return deferred.reject("Login-Error : " +JSON.stringify(error));
                    });
                    return deferred.promise;
                }; 
                $scope.Delete = function () {
                    var sql = "Update mm_flights set Status = 'CANCELLED' where Mobile_Record_Id = ?";
                    var buttonArray= ['Ok','Cancel'];
                    WingsDialogService.confirm('Are you sure to cancel flight?','Confirm',buttonArray).then(function(buttonIndex) {
                        // no button = 0, 'Ok' = 1, 'Cancel' = 2
                        var btnIndex = buttonIndex;
                        if(buttonIndex == 1) {
                            var parameters = [$rootScope.globals.flightId];
                            WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                                //$rootScope.globals.flightId = '';
                                $scope.getFlightInformation();
                                return deferred.resolve("GOHEAD");
                            }, function (error) {
                                console.log(JSON.stringify(error));
                                return deferred.reject("Login-Error : " +JSON.stringify(error));
                            });
                            return deferred.promise;
                        }
                      });
                };
                function isNull (obj) {
                    if(obj != '' && obj != null) {
                        return false;
                    } else {
                        return true;
                    }
                };
		}
])