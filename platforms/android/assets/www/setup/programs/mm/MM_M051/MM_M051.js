angular.module('WingsMobileStarter').controller('MM_M051', [
    '$scope',
    '$state',
    'WingsRemoteDbService',
    'WingsUtil',
    'WingsTransactionDBService',
    'WingsDialogService',
    '$ionicPopover',
    '$ionicBackdrop',
    'sy',
    function($scope,$state,WingsRemoteDbService,WingsUtil,WingsTransactionDBService,WingsDialogService,$ionicPopover,$ionicBackdrop,sy) {
        console.log("MM_M051");
        var defaultTailNumber          = $rootScope.globals.deviceInformation.tailNumber;
        $scope.selectedTailNumber      = defaultTailNumber;
        $scope.numberOfFligtsToDisplay = 20;
        $scope.selectedFlight          = '';
        $scope.selectFlight = function (flight) {
        	if ($scope.selectedFlight == flight) {
                $scope.cancelSelect();
            } else {
                $scope.cancelSelect();
            	flight.selected_flag = true;
            	$scope.selectedFlight = flight;
            }
        };
        $scope.cancelSelect = function() {
            angular.forEach($scope.flights, function(o) {
                o.selected_flag = false;
            });
            $scope.selectedFlight = '';
        };
        $scope.toggleFlight = function (flight){
            if (flight.selected_flag) {
                $scope.cancelSelect();
            }
            else {
                $scope.selectFlight(flight);
            }
        };
        $scope.flightIcon = function(flight) {
            if (!flight) return '';
            if (flight.TABLE_NAME == 'MM_SCHEDULED_FLIGHTS') {
                var iconText = 'ion-shipment-plane positive';
            } else if (flight.STATUS == 'ACCEPTED') {
                var iconText = 'ion-shipment-plane energized';
            } else if (flight.STATUS == 'CANCELLED') {
                var iconText = 'ion-shipment-plane assertive';
            } else {
                var iconText = 'ion-shipment-plane balanced';
            }
            if (flight.selected_flag) {
                iconText = 'ion-ios-checkmark balanced';
            }
            return iconText;
        };
        $scope.test = false;
        $scope.security = _.filter($rootScope.globals.security, function(o) { return o.programName == 'MM_M051'; });
        var queryCondition = _.find($scope.security, function(o) { return o.attribute == 'queryCondition'; });
        var query = _.find($scope.security, function(o) { return o.attribute == 'query'; });
        var sortOrder = _.find($scope.security, function(o) { return o.attribute == 'sortOrder'; });

        $scope.addMoreFlights = function (done) {
            if ($scope.flights != undefined && $scope.flights.length > $scope.numberOfFligtsToDisplay) {
                $scope.numberOfFligtsToDisplay += 20;
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };
        $scope.SYNC = function () {
       	    var deferred = $q.defer();
        	$ionicBackdrop.retain();
            sy.DeleteRecords();
        	$scope.pushAllRecords().then(function(result) {
	        		findLastTransactionDate().then(function(lastDateandRejectedIds) {
	            		$scope.pullFlights(lastDateandRejectedIds).then(function(res) {
	            			console.log("Push and Pull Completed Succesfully");
	            			$scope.getFlightList();
	                        return deferred.resolve("GOHEAD");
	            		},function(err) {
	            			WingsDialogService.error(error);
	            			$ionicBackdrop.release();
	                        return deferred.reject("SYNC-Error : " +JSON.stringify(error));
	            		});
	            		$scope.pullDiscrepancies(lastDateandRejectedIds);
	                	$scope.pullPackages (lastDateandRejectedIds);
	                	$scope.pullAttachments (lastDateandRejectedIds);
	        		},function(error){
	            		$ionicBackdrop.release();
	            		WingsDialogService.error(error);
	                    return deferred.reject("SYNC-Error : " +JSON.stringify(error));
	            	})
        	},function(error){
        		$ionicBackdrop.release();
        		WingsDialogService.error(error);
                return deferred.reject("SYNC-Error : " +JSON.stringify(error));
        	})
        
            return deferred.promise;
        };
        
        function getAircrafts () {
            var sql = "Select * From Pr_Aircrafts Where Div_No = ? And Engineering_Flag = 'Y' And Active = 'Y'";
            WingsTransactionDBService.executeSql(sql,[$rootScope.globals.currentUser.divNo]).then(function (result) {
                if (result.length > 0) {
                    var aircraftsArr = [];
                        for (var i=0; i<result.length; i++) {
                            aircraftsArr.push(result[i]);
                        }
                        aircraftsArr =  _.orderBy(aircraftsArr, ['TAIL_NUMBER'],['asc']);
                        $scope.aircraftsLov       = aircraftsArr;
                        $scope.selectedTailNumber = defaultTailNumber;
                    }
              }).catch(function (err) {
                  console.log('ERROR: '+err);
              });
        };
        getAircrafts();
        
        ////     PULL SECTION     ////        
        function findLastTransactionDate () {
            var deferred   = $q.defer();
        	var lastDateSql = "Select Ifnull(Max(Datetime(Server_Transaction_Date)), Date('now', '-30 day')) flightLastDate,                                                          " +
                              "       (Select Ifnull(Max(Datetime(Server_Transaction_Date)), Date('now', '-30 day')) From Mm_Scheduled_Flights) scheduledFlightsLastDate,              " +
        	                  "       (Select Ifnull(Max(Datetime(Server_Transaction_Date)), Date('now', '-30 day')) From Mm_Flight_consumptions) consumptionLastDate,                " +
        	                  "       (Select Ifnull(Max(Datetime(Server_Transaction_Date)), Date('now', '-30 day')) From Mm_Flight_inspections) inspectionLastDate,                  " +
        	                  "       (Select Ifnull(Max(Datetime(Server_Transaction_Date)), Date('now', '-30 day')) From Mm_Flight_Crews) crewLastDate,                              " +
        	                  "       (Select Ifnull(Max(Datetime(Server_Transaction_Date)), Date('now', '-30 day')) From Gn_Form_Data Where Parent = 'MM_FLIGHTS') formDataLastDate, " +
        	                  "       (Select group_concat(id) from mm_flights where mobile_record_Status='REJECTED') flightsRejected,                                       " +
        	                  "       (Select group_concat(id) from Mm_Flight_consumptions where mobile_record_Status='REJECTED') consumptioRejected,                        " +
        	                  "       (Select group_concat(id) from Mm_Flight_inspections where mobile_record_Status='REJECTED') inspectionRejected,                         " +
        	                  "       (Select group_concat(id) from Mm_Flight_Crews where mobile_record_Status='REJECTED') crewRejected,                                     " +
        	                  "       (Select Ifnull(Max(Datetime(Server_Transaction_Date)), Date('now', '-3000 day')) defectLastDate From Mm_Discrepancies) defectLastDate, " +
        	                  "       (Select Ifnull(Max(Datetime(Server_Transaction_Date)), 'LOAD-OPEN')  From Mm_Discrepancies) defectAction,           					 " +
        	                  "       (Select ifnull(Max(Datetime(Server_Transaction_Date)), Date('now', '-3000 day')) From Mm_Packages) packageLastDate,                    " +
        	                  "       (Select ifnull(Max(Datetime(Server_Transaction_Date)), Date('now', '-30 day')) From Gn_Images) imageLastDate,                          " +
        	                  "       (Select ifnull(Max(Datetime(Server_Transaction_Date)), 'LOAD-OPEN') From Mm_Packages ) packageAction                                   " +
        			          "  From Mm_Flights";
            WingsTransactionDBService.executeSql(lastDateSql,[]).then(function (result) {
                var lastDates = {
                		scheduledFlightsLastDate : result[0].scheduledFlightsLastDate,
                		flightLastDate           : result[0].flightLastDate,
                		consumptionLastDate      : result[0].consumptionLastDate,
                		inspectionLastDate       : result[0].inspectionLastDate,
                		crewLastDate             : result[0].crewLastDate,
                		formDataLastDate         : result[0].formDataLastDate,
                		flightsRejected          : result[0].flightsRejected,
                		consumptioRejected       : result[0].consumptioRejected,
                		inspectionRejected       : result[0].inspectionRejected,
                		crewRejected             : result[0].crewRejected,
                		defectLastDate           : result[0].defectLastDate,
                		defectAction             : result[0].defectAction=='LOAD-OPEN'?"And a.Status In ('OPEN', 'DEFERRED')":'',
                		packageLastDate          : result[0].packageLastDate,
                		packageAction            : result[0].packageAction=='LOAD-OPEN'?"And a.Status = 'OPEN' and Nvl(a.Tracking_Status,'X') != 'COMPLETED' ":'',
           				imageLastDate            : result[0].imageLastDate

                }
                return deferred.resolve(lastDates);
            }, function (error) {   
                return deferred.reject(JSON.stringify(error));
            });
            return deferred.promise;
        }
     // PULL FLIGHTS // 
        $scope.pullFlights = function (lastDatesAndRejectedIds) {
        	var deferred   = $q.defer();
            var divNo = $rootScope.globals.currentUser.divNo;
            var flightCondition =" ";
            var consumptionCondition =" ";
            var inspectionCondition =" ";
            var crewCondition =" ";
            var formCondition =" ";
            var scheduledFlightCondition =" ";
            if (lastDatesAndRejectedIds.flightsRejected != null) {
            	flightCondition = " And b.Id Not In ("+ lastDatesAndRejectedIds.flightsRejected+") ";
            } else if (lastDatesAndRejectedIds.consumptioRejected != null) {
                consumptionCondition = " And b.Id Not In ("+ lastDatesAndRejectedIds.consumptioRejected+") ";
            } else if (lastDatesAndRejectedIds.inspectionRejected != null) {
                inspectionCondition = " And b.Id Not In ("+ lastDatesAndRejectedIds.inspectionRejected+") ";
            } else if (lastDatesAndRejectedIds.crewRejected != null) {
                crewCondition = " And b.Id Not In ("+ lastDatesAndRejectedIds.crewRejected+") ";
            }
            var aircraftCondition = $scope.selectedTailNumber!= null? "And c.Tail_Number = '"+$scope.selectedTailNumber+"'":"";
            var sqlFlights =   " Select b.Div_No,                                                                                 " +
					            "        b.Id,                                                                                    " +
					            "        c.Tail_Number                   Tail_Number,                                             " +
					            "        c.Serial_Number                 Serial_Number,                                           " +
					            "        b.Aircraft_Id                   Aircraft_Id,                                             " +
					            "        b.Status                        Status,                                                  " +
					            "        b.Flight_Time                   Flight_Time,                                             " +
					            "        b.Flight_Cycle                  Flight_Cycle,                                            " +
					            "        b.Actual_Date                   Flight_Date,                                             " +
					            "        b.Actual_Off_Block              Flight_Off_Block,                                        " +
					            "        b.Actual_Take_Off               Flight_Take_Off,                                         " +
					            "        b.Actual_Landing                Flight_Landing,                                          " +
					            "        b.Actual_On_Block               Flight_On_Block,                                         " +
					            "        b.Schedule_Date                 Schedule_Date,                                           " +
					            "        b.Scheduled_From                Scheduled_From,                                          " +
					            "        b.Scheduled_To                  Scheduled_To,                                            " +
					            "        b.Scheduled_Off_Block           Scheduled_Off_Block,                                     " +
					            "        b.Scheduled_On_Block            Scheduled_On_Block,                                      " +
					            "        b.Actual_From                   From_Station,                                            " +
					            "        b.Actual_To                     To_Station,                                              " +
					            "        b.Flight_Number                 Flight_Number,                                           " +
					            "        b.Control_Number                Control_Number,                                          " +
					            "        (Select ListAgg(x.Delay_Reason,';') Within Group (Order By x.Id)                         " + 
					            "           From Mm_Flight_Delays x                                                               " +
					            "          Where x.Div_No    = b.Div_No                                                           " +
					            "            And x.Flight_Id = b.Id) Delay_Reasons,                                               " +
					            "        (Select ListAgg(x.Delay,';') Within Group (Order By x.Id)                                " +
					            "           From Mm_Flight_Delays x                                                               " +
					            "          Where x.Div_No    = b.Div_No                                                           " +
					            "            And x.Flight_Id = b.Id) Delay_Times,                                                 " +
					            "        b.Accept_Date                   Accept_Date,                                             " +
					            "        b.Accepted_By_Employee_Number   Accepted_By_Employee_Number,                             " +
					            "        b.Close_Date                    Close_Date,                                              " +
					            "        b.Closed_By_Employee_Number     Closed_By_Employee_Number,                               " +
					            "        b.Cancel_Date                   Cancel_Date,                                             " +
					            "        b.Canceled_By_Employee_Number   Canceled_By_Employee_Number,                             " +
					            "        b.Low_Visibility_Status         Low_Visibility_Status,                                   " +
					            "        Gn_Service.Get_Comment(b.Div_No,'MM_FLIGHTS',b.id,'INTERNAL') Internal_Comment,          " +
					            "        Nvl(b.Dt_Modified,b.Dt_Created) Server_Transaction_Date                                  " +
					            "   From Mm_Flights       b,                                                                      " +
					            "        Mm_Aircrafts_v   c                                                                       " +
					            "  Where b.Div_No                           = "+divNo                                               +
					            "    And Nvl(b.Dt_Modified,b.Dt_Created)    > to_date('"+lastDatesAndRejectedIds.flightLastDate+"','yyyy-mm-dd hh24:mi:ss') " +
					            "    And Nvl(b.Schedule_Date,b.Actual_Date) > SysDate - 30                                        " +
					            "    And c.Div_No                           = b.Div_No                                            " +
					                     flightCondition+
					            "    And c.Id                               = b.Aircraft_Id                                       " +
					            //         aircraftCondition+
					            "    And c.Active                           = 'Y'                                                 ";
            
			var sqlConsumption = " Select w.*,                                                                           				     "+
						         "        Decode(w.Component_Id, w.Aircraft_Id, w.Cons_Type,                            				     "+
						     "                              w.Engine_1_Id, 'ENG-1',                                   					     "+
						     "                              w.Engine_2_Id, 'ENG-2',                                 			 	         "+
						     "                              w.Idg_1_Id,    'IDG-1',                                         				 "+
						     "                              w.Idg_2_Id,    'IDG-2',                                          		  	 	 "+
						     "                              w.Apu_Id,      'APU',                                            		   		 "+
						     "                              w.Cons_Type) Consumption_Type                                                    "+
						     "           From (                                                                                              "+
						     "                Select a.Id,                                                                                   "+
						     "                       a.Flight_Id,                                                                            "+
						     "			             b.Aircraft_Id,                                                                          "+
						     "			             a.Arrival,                                                                              "+
						     "			             a.Added,                                                                                "+
						     "			             a.Remaining,                                                                            "+
						     "			             a.Departure,                                                                            "+
						     "			             a.Density,                                                                              "+
						     "			             a.Component_Id,                                                                         "+
						     "			             a.Vendor_Id,                                                                            "+
						     "                       Decode(Nvl(a.Added,0),0,'N','Y') Consumption_Flag,                                      "+
						     "			             a.Consumption_Type Cons_Type,                                                           "+
						     "			             (Select Max(x.Vendor_Number) From Ic_Vendors x Where x.Id = a.Vendor_Id) Vendor_Number, "+
						     "			             (Select Max(x.Vendor_Name) From Ic_Vendors x Where x.Id = a.Vendor_Id) Vendor_Name,     "+
						     "			             To_Char(Nvl(a.Dt_Modified, a.Dt_Created), 'yyyy-mm-dd hh24:mi') Transaction_Date,       "+
					         "                       Nvl(a.Dt_Modified,a.Dt_Created) Server_Transaction_Date,                                "+
						     "			             (Select Max(x.Id)                                                                       "+
						     "			                From Mm_Components x                                                                 "+
						     "			               Where x.Div_No         = a.Div_No                                                     "+
						     "			                 And x.Aircraft_Id    = c.Id                                                         "+
						     "			                 And x.Id             = a.Component_Id                                               "+
						     "			                 And x.Component_Type = 'ENGINE'                                                     "+
						     "			                 And x.Active         = 'Y'                                                          "+
						     "			                 And x.Position       = (Select Min(y.Position)                                      "+
						     "			                                           From Mm_Components y                                      "+
						     "			                                          Where y.Div_No         = a.Div_No                          "+
						     "			                                            And y.Aircraft_Id    = c.Id                              "+
						     "			                                            And y.Component_Type = 'ENGINE'                          "+
						     "			                                            And y.Active         = 'Y')) Engine_1_Id,                "+
						     "			             (Select Max(x.Id)                                                                       "+
						     "			                From Mm_Components x                                                                 "+
						     "			               Where x.Div_No         = a.Div_No                                                     "+
						     "			                 And x.Aircraft_Id    = c.Id                                                         "+
						     "			                 And x.Id             = a.Component_Id                                               "+
						     "			                 And x.Component_Type = 'ENGINE'                                                     "+
						     "			                 And x.Active         = 'Y'                                                          "+
						     "			                 And x.Position       = (Select Max(y.Position)                                      "+
						     "			                                           From Mm_Components y                                      "+
						     "			                                          Where y.Div_No         = a.Div_No                          "+
						     "			                                            And y.Aircraft_Id    = c.Id                              "+
						     "			                                            And y.Component_Type = 'ENGINE'                          "+
						     "			                                            And y.Active         = 'Y')) Engine_2_Id,                "+
						     "			             (Select Max(x.Id)                                                                       "+
						     "			                From Mm_Components x                                                                 "+
						     "			               Where x.Div_No         = a.Div_No                                                     "+
						     "			                 And x.Aircraft_Id    = c.Id                                                         "+
						     "			                 And x.Id             = a.Component_Id                                               "+
						     "			                 And x.Component_Type = 'IDG'                                                        "+
						     "			                 And x.Active         = 'Y'                                                          "+
						     "			                 And x.Position       = (Select Min(y.Position)                                      "+
						     "			                                           From Mm_Components y                                      "+
						     "			                                          Where y.Div_No         = a.Div_No                          "+
						     "			                                            And y.Aircraft_Id    = c.Id                              "+
						     "			                                            And y.Component_Type = 'IDG'                             "+
						     "			                                            And y.Active         = 'Y')) Idg_1_Id,                   "+
						     "			             (Select Max(x.Id)                                                                       "+
						     "			                From Mm_Components x                                                                 "+
						     "			               Where x.Div_No         = a.Div_No                                                     "+
						     "			                 And x.Aircraft_Id    = c.Id                                                         "+
						     "			                 And x.Id             = a.Component_Id                                               "+
						     "			                 And x.Component_Type = 'IDG'                                                        "+
						     "			                 And x.Active         = 'Y'                                                          "+
						     "			                 And x.Position       = (Select Max(y.Position)                                      "+
						     "			                                           From Mm_Components y                                      "+
						     "			                                          Where y.Div_No         = a.Div_No                          "+
						     "			                                            And y.Aircraft_Id    = c.Id                              "+
						     "			                                            And y.Component_Type = 'IDG'                             "+
						     "			                                            And y.Active         = 'Y')) Idg_2_Id,                   "+
						     "			             (Select Max(x.Id)                                                                       "+
						     "			                From Mm_Components x 																 "+
						     "			               Where x.Div_No         = a.Div_No 													 "+
						     "			                 And x.Aircraft_Id    = c.Id 														 "+
						     "			                 And x.Id             = a.Component_Id 												 "+
						     "			                 And x.Component_Type = 'APU' 														 "+
						     "			                 And x.Active         = 'Y') Apu_Id 												 "+
						     "			       From Mm_Flight_Consumptions a, 																 "+
						     "			            Mm_Flights             b, 																 "+
						     "			            Mm_Aircrafts_v         c 																 "+
						     "			       Where a.Div_No                           =  "+$rootScope.globals.currentUser.divNo			  +  
					         "                   And Nvl(a.Dt_Modified,a.Dt_Created)    > to_date('"+lastDatesAndRejectedIds.consumptionLastDate+"','yyyy-mm-dd hh24:mi:ss') "+
						     "			         And b.Id                               = a.Flight_Id                                        "+
						                             consumptionCondition+
						     "			         And Nvl(b.Schedule_Date,b.Actual_Date) > SysDate - 30 										 "+
						     "			         And c.Div_No                           = b.Div_No 											 "+
						     "			         And c.Id                               = b.Aircraft_Id 									 "+
						     //                        aircraftCondition+
						     "			         And c.Active                           = 'Y' ) w 											 ";
						        
        
            var sqlInspection =    " Select a.Id,                                                                                       " +
                                   "        a.Div_No,                                                                                   " +
                                   "        a.Flight_Id,                                                                                " +
                                   "        a.Inspection_Date,                                                                          " +
                                   "        a.Inspector_Number,                                                                         " +
                                   "        a.Inspection_Type,                                                                          " +
                                   "        (Select Lb_Service.Employee_Name(x.First_Name,x.Middle_Initial,x.Last_Name)                 " +
                                   "           From Lb_Employees x                                                                      " +
                                   "          Where x.Div_No          = a.Div_No                                                        " +
                                   "            And x.Employee_Number = a.Inspector_Number) Inspector_Name,                             " +
   					               "        Nvl(b.Dt_Modified,b.Dt_Created) Server_Transaction_Date                                     " +
                                   "   From Mm_Flight_Inspections a,                                                                    " +
                                   "        Mm_Flights            b,                                                                    " +
                                   "        Mm_Aircrafts_v        c,                                                                    " +
                                   "        Mm_Inspection_Types   d                                                                     " +
                                   "  Where a.Div_No                           = "+$rootScope.globals.currentUser.divNo                   +
      					           "    And Nvl(a.Dt_Modified,a.Dt_Created)    > to_date('"+lastDatesAndRejectedIds.inspectionLastDate+"','yyyy-mm-dd hh24:mi:ss') " +
                                   "    And b.Id                               = a.Flight_Id                                            " +
                                            inspectionCondition+
                                   "    And Nvl(b.Schedule_Date,b.Actual_Date) > SysDate - 30                                           " +
                                   "    And c.Div_No                           = b.Div_No                                               " +
                                   "    And c.Id                               = b.Aircraft_Id                                          " +
		                           //         aircraftCondition+
                                   "    And c.Active                           = 'Y'                                                    " +
                                   "    And d.Div_No                           = a.Div_No                                               " +
                                   "    And d.Inspection_Type                  = a.Inspection_Type                                      " +
                                   "    And d.Active                           = 'Y'                                                    " ;
        
            var sqlCrew =          " Select a.Id,                                                                                    " +
                                   "        a.Flight_Id,                                                                             " +
                                   "        a.Crew_Type,                                                                             " +
                                   "        a.Employee_Number,                                                                       " +
                                   "        (Select Lb_Service.Employee_Name(a.Div_No,a.Employee_Number) From Dual) Employee_Name,   " +
                                   "        a.Duty_Start_Date,                                                                       " +
                                   "        a.Duty_Finish_Date,                                                                      " +
   					               "        Nvl(b.Dt_Modified,b.Dt_Created) Server_Transaction_Date                                  " +
                                   "   From Mm_Flight_Crews a,                                                                       " +
                                   "        Mm_Flights      b,                                                                       " +
                                   "        Mm_Aircrafts_v  c                                                                        " +
                                   "  Where a.Div_No                           = "+$rootScope.globals.currentUser.divNo                +
      					           "    And Nvl(a.Dt_Modified,a.Dt_Created)    > to_date('"+lastDatesAndRejectedIds.crewLastDate+"','yyyy-mm-dd hh24:mi:ss') " +
                                   "    And b.Id                               = a.Flight_Id                                         " +
                                            crewCondition+
                                   "    And Nvl(b.Schedule_Date,b.Actual_Date) > SysDate - 30                                        " +
                                   "    And c.Div_No                           = b.Div_No                                            " +
                                   //         aircraftCondition+
                                   "    And c.Id                               = b.Aircraft_Id                                       " +
                                   "    And c.Active                           = 'Y'                                                 " ;
            
            var sqlScheduledFlights =  "Select b.Div_No              Div_No,                                                         " +
                                       "       b.Id,                                                                                 " +
                                       "       c.Tail_Number         Tail_Number,                                                    " +
                                       "       c.Serial_Number       Serial_Number,                                                  " +
                                       "       b.Aircraft_Id         Aircraft_Id,                                                    " +
                                       "       b.Schedule_Date       Flight_Date,                                                    " +
                                       "       b.Scheduled_Off_Block Flight_Off_Block,                                               " +
                                       "       b.Scheduled_Take_Off  Flight_Take_Off,                                                " +
                                       "       b.Scheduled_Landing   Flight_Landing,                                                 " +
                                       "       b.Scheduled_On_Block  Flight_On_Block,                                                " +
                                       "       b.Scheduled_From      From_Station,                                                   " +
                                       "       b.Scheduled_To        To_Station,                                                     " +
                                       "       b.Flight_Number       Flight_Number,                                                  " +
                                       "       b.Control_Number      Control_Number,                                                 " +
                                       "       b.Crew_Types          Crew_Types,                                                     " +
                                       "       b.Employee_Numbers    Employee_Numbers,                                               " +
       					               "       Nvl(b.Dt_Modified,b.Dt_Created) Server_Transaction_Date                               " +
                                       "  From Mm_Scheduled_Flights b,                                                               " +
                                       "       Mm_Aircrafts_v       c                                                                " +
                                       " Where b.Div_No                        = "+$rootScope.globals.currentUser.divNo+                      
                                       "   And b.Scheduled_Take_Off > SysDate-1                                                      " +
                                       "   And b.Scheduled_Take_Off < SysDate+3                                                      " +
          					           "   And Nvl(b.Dt_Modified,b.Dt_Created) > to_date('"+lastDatesAndRejectedIds.scheduledFlightsLastDate+"','yyyy-mm-dd hh24:mi:ss') " +
                                       "   And b.Scheduled_Take_Off            > (Select Max(x.Actual_Landing)                       " +
                                       "                                            From Mm_Flights x                                " +
                                       "                                           Where x.Div_No      = b.Div_No                    " +
                                       "                                             And x.Aircraft_Id = b.Aircraft_Id)              " + 
                                       "   And c.Div_No                        = b.Div_No                                            " +
                                       "   And c.Id                            = b.Aircraft_Id                                       " +
                                       //        aircraftCondition+
                                       "   And c.Active                        = 'Y'                                                 " ;

            var sqlDelay =  " Select a.Id,                                                                                       " +
				            "        a.Div_No,                                                                                   " +
				            "        a.Flight_Id,                                                                                " +
				            "        a.Delay_Reason,                                                                             " +
				            "        a.Delay,                                                                                    " +
				            "        Nvl(b.Dt_Modified,b.Dt_Created) Server_Transaction_Date                                     " +
				            "   From Mm_Flight_Delays a,                                                                         " +
				            "        Mm_Flights       b,                                                                         " +
				            "        Mm_Aircrafts_v   c                                                                          " +
				            "  Where a.Div_No                           = "+$rootScope.globals.currentUser.divNo                   +
					        "    And Nvl(a.Dt_Modified,a.Dt_Created)    > to_date('"+lastDatesAndRejectedIds.flightLastDate+"','yyyy-mm-dd hh24:mi:ss') " +
				            "    And b.Id                               = a.Flight_Id                                            " +
				            "    And Nvl(b.Schedule_Date,b.Actual_Date) > SysDate - 30                                           " +
				            "    And c.Div_No                           = b.Div_No                                               " +
				            "    And c.Id                               = b.Aircraft_Id                                          " +
                            //         aircraftCondition+
				            "    And c.Active                           = 'Y'                                                    " ;
            
            var sqlFormColumns =      "Select Prompt,                                            " +
							          "       Type,                                              " +
							          "       Style,                                             " +
							          "       Column_Sequence,                                   " +
							          "       Column_Id,                                         " +
							          "       Data_Size,                                         " +
							          "       Form_Id,                                           " +
							          "       Active                                             " +
							          "  From Gn_Form_Columns a                                  " +
							          " Where Div_No  = "+$rootScope.globals.currentUser.divNo     +
							          "   And Form_Id = 'MM_FLIGHTS'                             " +
							          "   And Active  = 'Y'                                      " +
							          "Order By Column_Sequence                                  " ;
				                      
            var sqlArray = [{ queryStr: sqlFlights,          queryType: "READ" },
                            { queryStr: sqlConsumption,      queryType: "READ" },
                            { queryStr: sqlInspection,       queryType: "READ" },
                            { queryStr: sqlCrew,             queryType: "READ" },
                            { queryStr: sqlScheduledFlights, queryType: "READ" },
                            { queryStr: sqlFormColumns,      queryType: "READ" }
                            ];
            var sqlString = JSON.stringify(sqlArray);
            WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                var flights = angular.fromJson(dataIn[0].rows);
                var consumptions = angular.fromJson(dataIn[1].rows);
                if (consumptions.length > 0)
                insertFlightConsumptions(consumptions);
                var inspections = angular.fromJson(dataIn[2].rows);
                if (inspections.length > 0)
                insertFlightInspections(inspections);
                var crews = angular.fromJson(dataIn[3].rows);
                if (crews.length > 0)
                insertFlightCrews(crews);
                var scheduledFlights = angular.fromJson(dataIn[4].rows);
                if (scheduledFlights.length > 0) {
                	insertScheduledFlights (scheduledFlights).then(function (dataIn) {
                		if (flights.length > 0)
                			insertActualFlight(flights);
                	});
                } else {
                	if (flights.length > 0)
            			insertActualFlight(flights);
                }
                var formColumns = angular.fromJson(dataIn[5].rows);
                insertFormColumns(formColumns).then(function (dataIn) {
                    var sqlFormData =   "Select a.Div_No,                                                                                " +
				                        "       a.Parent,                                                                                " +
				                        "       a.Parent_Id,                                                                             " +
				                        "       a.Form_Id,                                                                               " +
				                        "       a.Column_Id,                                                                             " +
				                        "       a.Data                                                                                   " +
				                        "  From Gn_Form_Data   a,                                                                        " +
				                        "       Mm_Flights     b,                                                                        " +
				                        "       Mm_Aircrafts_v c                                                                         " +
							            " Where a.Div_No                           = "+$rootScope.globals.currentUser.divNo                +
				                        "   And a.Parent                           = 'MM_FLIGHTS'                                        " +
								        "   And Nvl(a.Dt_Modified,a.Dt_Created)    > to_date('"+lastDatesAndRejectedIds.formDataLastDate+"','yyyy-mm-dd hh24:mi:ss') " +
				                        "   And a.Column_Id In ("+$scope.flexColumnIds.join(',')+")                                      " +
				                        "   And b.Div_No                           = a.Div_No                                            " +
				                        "   And b.Id                               = a.Parent_Id                                         " +
				                        "   And Nvl(b.Schedule_Date,b.Actual_Date) > SysDate - 30                                        " +
				                        //        aircraftCondition+
				                        "   And c.Id                               = b.Aircraft_Id                                       " ; 
                    var sqlArray = [{ queryStr: sqlFormData,          queryType: "READ" }];
                    var sqlString = JSON.stringify(sqlArray);
                    WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                    	var formData = angular.fromJson(dataIn[0].rows);
                    	if (formData.length > 0)
                            insertFormData (formData);
                    	return deferred.resolve("GO-HEAD");
	                }, function (error) {
	                	return deferred.reject(JSON.stringify(error));
	                });
                }, function (error) {
            		$ionicBackdrop.release();
                	return deferred.reject(JSON.stringify(error));
                });
            }, function (error) {
        		$ionicBackdrop.release();
            	return deferred.reject(JSON.stringify(error));
            });
            return deferred.promise;
        };
        
        function insertActualFlight (flights) {
            var deferred   = $q.defer();
            var parameters = [];
            var bindings   = [];
            var sqlFlight = "INSERT OR REPLACE INTO Mm_Flights (Id,                          " +
                            "                                   DIV_NO,                      " +
                            "                                   FLIGHT_NUMBER,               " +
                            "                                   SERIAL_NUMBER,               " +
                            "                                   STATUS,                      " +
                            "                                   SCHEDULE_DATE,               " +
                            "                                   SCHEDULED_FROM,              " +
                            "                                   SCHEDULED_TO,                " +
                            "                                   SCHEDULED_ON_BLOCK,          " +
                            "                                   SCHEDULED_OFF_BLOCK,         " +
                            "                                   ACTUAL_DATE,                 " +
                            "                                   ACTUAL_FROM,                 " +
                            "                                   ACTUAL_TO,                   " +
                            "                                   ACTUAL_TAKE_OFF,             " +
                            "                                   ACTUAL_OFF_BLOCK,            " +
                            "                                   ACTUAL_ON_BLOCK,             " +
                            "                                   ACTUAL_LANDING,              " +
                            "                                   CONTROL_NUMBER,              " +
                            "                                   SERVER_TRANSACTION_DATE,     " +
                            "                                   MOBILE_RECORD_STATUS,        " +
                            "                                   DELAY_REASON,                " +
                            "                                   DELAY_TIME,                  " +
                            "                                   LOW_VISIBILITY_STATUS,       " +
                            "                                   INTERNAL_COMMENT,            " +
                            "                                   ACCEPT_DATE,                 " +
                            "                                   ACCEPTED_BY_EMPLOYEE_NUMBER, " +
                            "                                   CLOSE_DATE,                  " +
                            "                                   CLOSED_BY_EMPLOYEE_NUMBER,   " +
                            "                                   TAIL_NUMBER)                 " +
                            "VALUES (?,?,?,?,?,date(?),?,?,?,?,date(?),?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);    ";
            var i;
            for (i in flights) {
                checkFlightIsExist(flights[i]);
                parameters = [flights[i].id,
                              flights[i].div_no,
                              flights[i].flight_number,
                              flights[i].serial_number,
                              !WingsUtil.IsNull(flights[i].close_date)? "COMPLETED":!WingsUtil.IsNull(flights[i].accept_date)? "ACCEPTED":flights[i].status,
                              flights[i].schedule_date,
                              flights[i].scheduled_from,
                              flights[i].scheduled_to,
                              flights[i].scheduled_on_block,
                              flights[i].scheduled_off_block,
                              flights[i].flight_date,
                              flights[i].from_station,
                              flights[i].to_station,
                              flights[i].flight_take_off,
                              flights[i].flight_off_block,
                              flights[i].flight_on_block,
                              flights[i].flight_landing,
                              flights[i].control_number,
                              flights[i].server_transaction_date,
                              flights[i].status=="COMPLETED"?'LOADED':'',
                              flights[i].delay_reasons,
                              flights[i].delay_times,
                              flights[i].low_visibility_status,
                              flights[i].internal_comment,
                              flights[i].accept_date,
                              flights[i].accepted_by_employee_number,
                              flights[i].close_date,
                              flights[i].closed_by_employee_number,
                              flights[i].tail_number];
                bindings.push(parameters);
            }
            WingsTransactionDBService.insertCollection(sqlFlight,bindings).then(function (result){
                $scope.getFlightList();
                return deferred.resolve(result);
            }, function (error) {  
                $scope.getFlightList();
                console.log("Flight-Error : " +JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };
        
        function insertFlightConsumptions (consumptions) {
            var deferred   = $q.defer();
            var parameters = [];
            var bindings   = [];
            var sqlFlight = "INSERT OR REPLACE INTO MM_FLIGHT_CONSUMPTIONS (ID,               " +
                            "                                               DIV_NO,           " +
                            "                                               VENDOR_NUMBER,    " +
                            "                                               VENDOR_NAME,      " +
                            "                                               CONSUMPTION_TYPE, " +
                            "                                               DENSITY,          " +
                            "                                               ARRIVAL,          " +
                            "                                               ADDED,            " +
                            "                                               DEPARTURE,        " +
                            "                                               REMAINING,        " +
                            "                                               CONSUMPTION_DATE, " +
                            "                                               SERVER_TRANSACTION_DATE, " +
                            "                                               NO_REFUELLING_FLAG,      " +
                            "                                               FLIGHT_ID)        " +
                            "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?);                                ";
            var i;
            for (i in consumptions) {
                parameters = [consumptions[i].id,
                              consumptions[i].div_no,
                              consumptions[i].vendor_number,
                              consumptions[i].vendor_name,
                              consumptions[i].consumption_type,
                              consumptions[i].density,
                              consumptions[i].arrival,
                              consumptions[i].added,
                              consumptions[i].departure,
                              consumptions[i].remaining,
                              consumptions[i].transaction_date,
                              consumptions[i].server_transaction_date,
                              consumptions[i].consumption_flag=='N'?'true':'false',
                              consumptions[i].flight_id];
                bindings.push(parameters);
            }
            WingsTransactionDBService.insertCollection(sqlFlight,bindings).then(function (result){
                return deferred.resolve(result);
            }, function (error) {  
                console.log("Consumption-Error : " +JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };
        
        function insertFlightInspections (inspections){
            var deferred   = $q.defer();
            var parameters = [];
            var bindings   = [];
            var sql = " INSERT OR REPLACE INTO MM_FLIGHT_INSPECTIONS (ID,                        " +
                      "                                               DIV_NO,                    " +
                      "                                               FLIGHT_ID,                 " +
                      "                                               INSPECTION_DATE,           " +
                      "                                               INSPECTOR_NUMBER,          " +
                      "                                               INSPECTION_TYPE,           " +
                      "                                               SERVER_TRANSACTION_DATE)   " +
                      "VALUES (?,?,?,?,?,?,?)";

            var i;
            for (i in inspections) {
                parameters = [inspections[i].id,
                              inspections[i].div_no,
                              inspections[i].flight_id,
                              inspections[i].inspection_date,
                              inspections[i].inspector_number,
                              inspections[i].inspection_type,
                              inspections[i].server_transaction_date];
                bindings.push(parameters);
            }
            WingsTransactionDBService.insertCollection(sql,bindings).then(function (result) {
                return deferred.resolve(result);
            }, function (error) {  
                console.log("Inspection-Error : " +JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };
        function insertFlightCrews (crews){
            var deferred   = $q.defer();
            var parameters = [];
            var bindings   = [];
            var sql = "INSERT OR REPLACE INTO Mm_Flight_Crews (ID,                " +
                      "                                        DIV_NO,            " +
                      "                                        FLIGHT_ID,         " +
                      "                                        CREW_TYPE,         " +
                      "                                        EMPLOYEE_NUMBER,   " +
                      "                                        EMPLOYEE_NAME,     " +
                      "                                        DUTY_START_DATE,   " +
                      "                                        DUTY_FINISH_DATE,  " +
                      "                                        SERVER_TRANSACTION_DATE)  " +
                      "VALUES (?,?,?,?,?,?,?,?,?);                                  ";
            var i;
            for (i in crews) {
                parameters = [crews[i].id,
                              crews[i].div_no,
                              crews[i].flight_id,
                              crews[i].crew_type,
                              crews[i].employee_number,
                              crews[i].employee_name,
                              crews[i].duty_start_date,
                              crews[i].duty_finish_date,
                              crews[i].server_transaction_date];

                bindings.push(parameters);
            }
            WingsTransactionDBService.insertCollection(sql,bindings).then(function (result) {
                return deferred.resolve(result);
            }, function (error) {  
                console.log("Crew-Error : " +JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };
        function insertFlightDelays (delays){
            var parameters = [];
            var sql = "Update MM_FLIGHTS            " +
                      "   Set DELAY_REASON    = ?,  " +
                      "       DELAY_TIME      = ?   " +
                      "Where Mobile_RECORD_ID = ?   ";
            var i;
            for (i in delays) {
                parameters = [delays[i].delay_reason,
                              delays[i].delay_time,
                              delays[i].flight_id];
                 WingsTransactionDBService.executeSql(sql,parameters);
            }
        };

        function insertScheduledFlights (scheduledFlights) {
        	 var deferred = $q.defer();
             /*var sql = " Delete From Mm_Scheduled_Flights";
             WingsTransactionDBService.executeSql(sql,[]).then(function (result) {
             }, function (error) {
                 console.log(error);
             });*/
             
             var parameters = [];
             var bindings   = [];

             var sqlScheduledFlight =  " INSERT INTO Mm_Scheduled_Flights (Id,                                " +
		                              "                                             DIV_NO,                  " +
		                              "                                             FLIGHT_NUMBER,           " +
		                              "                                             SERIAL_NUMBER,           " +
		                              "                                             STATUS,                  " +
		                              "                                             SCHEDULE_DATE,           " +
		                              "                                             SCHEDULED_FROM,          " +
		                              "                                             SCHEDULED_TO,            " +
		                              "                                             SCHEDULED_OFF_BLOCK,     " +
		                              "                                             SCHEDULED_ON_BLOCK,      " +
		                              "                                             SCHEDULED_TAKE_OFF,      " +
		                              "                                             SCHEDULED_LANDING,       " +
		                              "                                             AIRCRAFT_ID,             " +
		                              "                                             TAIL_NUMBER,             " +
		                              "                                             FLIGHT_TIME,             " +
		                              "                                             FLIGHT_CYCLE,            " +
		                              "                                             CONTROL_NUMBER,          " +
		                              "                                             EMPLOYEE_NUMBERS,        " +
		                              "                                             CREW_TYPES,              " +
		                              "                                             SERVER_TRANSACTION_DATE, " +
		                              "                                             ACTIVE)                  " +
		                              "VALUES (?,?,?,?,?,date(?),?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);             ";
                 
             for (i = 0;i<scheduledFlights.length;i++) {
                     parameters = [scheduledFlights[i].id,
                                   scheduledFlights[i].div_no,
                                   scheduledFlights[i].flight_number,
                                   scheduledFlights[i].serial_number,
                                   'SCHEDULED',
                                   scheduledFlights[i].flight_date,
                                   scheduledFlights[i].from_station,
                                   scheduledFlights[i].to_station,
                                   scheduledFlights[i].flight_off_block,
                                   scheduledFlights[i].flight_on_block,
                                   scheduledFlights[i].flight_take_off,
                                   scheduledFlights[i].flight_landing,
                                   scheduledFlights[i].aircraft_id,
                                   scheduledFlights[i].tail_number,
                                   scheduledFlights[i].flight_time,
                                   scheduledFlights[i].flight_cycle,
                                   scheduledFlights[i].control_number,
                                   scheduledFlights[i].employee_numbers,
                                   scheduledFlights[i].crew_types,
                                   scheduledFlights[i].server_transaction_date,
                                   scheduledFlights[i].active];
                     bindings.push(parameters);
             }
             WingsTransactionDBService.insertCollection(sqlScheduledFlight,bindings).then(function (result) {
                 return deferred.resolve("GOHEAD");
             }, function (error) {  
                   console.log("Scheduled_Flight-Error : " +JSON.stringify(error));
                   return deferred.reject("Login-Error : " +JSON.stringify(error));
             });
             return deferred.promise;
        };
        function insertFormColumns (fields) {
            var deferred   = $q.defer();
            var deleteSql = "Delete from Gn_Form_Columns where Form_Id = 'MM_FLIGHTS' and Div_No = ?;"
            WingsTransactionDBService.executeSql(deleteSql,[$rootScope.globals.currentUser.divNo]).then(function (result) {
                var bindings = [];
                if (fields.length > 0) {
                    var sqlFields = "INSERT OR REPLACE INTO Gn_Form_Columns (DIV_NO,            " +
                                    "                                        FORM_ID,           " +
                                    "                                        COLUMN_SEQUENCE,   " +
                                    "                                        COLUMN_ID,         " +
                                    "                                        PROMPT,            " +
                                    "                                        TYPE,              " +
                                    "                                        STYLE,             " +
                                    "                                        DATA_SIZE,         " +
                                    "                                        ACTIVE)            " +
                                    "VALUES (?,?,?,?,?,?,?,?,?);                                ";
                    var i;
                    $scope.flexColumnIds = [];
                    for (i in fields) {
                         parameters = [$rootScope.globals.currentUser.divNo,
                                       fields[i].form_id,
                                       parseInt(fields[i].column_sequence),
                                       fields[i].column_id,
                                       fields[i].prompt,
                                       fields[i].type,
                                       fields[i].style,
                                       parseInt(fields[i].data_size),
                                       fields[i].active];
                         bindings.push(parameters);
                         $scope.flexColumnIds.push("'"+fields[i].column_id+"'");
                    }
                }
                WingsTransactionDBService.insertCollection(sqlFields,bindings).then(function (result) {
                    return deferred.resolve(result);
                }, function (error) {  
                    return deferred.reject("Form Columns Insert-Error : " +JSON.stringify(error));
                });
            }, function (error) {
                console.log(error);
                return deferred.reject("Form Columns Insert-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };
        
        function insertFormData (formData) {
            var deferred   = $q.defer();
            var parameters = [];
            var bindings   = [];
            var sqlFormData = "INSERT OR REPLACE INTO GN_FORM_DATA (DIV_NO,           " +
                              "                                     PARENT,           " +
                              "                                     PARENT_ID,        " +
                              "                                     COLUMN_ID,        " +
                              "                                     DATA)             " +
                              "VALUES (?,?,?,?,?);                                    ";
            var i;
            for (i in formData) {
                parameters = [formData[i].div_no,
                              formData[i].parent,
                              formData[i].parent_id,
                              formData[i].column_id,
                              formData[i].data];
                bindings.push(parameters);
            }
            WingsTransactionDBService.insertCollection(sqlFormData,bindings).then(function (result){
                return deferred.resolve(result);
            }, function (error) {  
                console.log("FormData-Error : " +JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };
        
        function checkFlightIsExist (flight) {
            var deferred = $q.defer();
            var checkquery = "Delete From Mm_Scheduled_Flights    " +
                             " Where Div_No         = ?           " +
                             "   And Flight_Number  = ?           " +
                             "   And Tail_Number    = ?           " +
                             "   And Scheduled_From = ?           " +
                             "   And Scheduled_To   = ?           " +
                             "   And Schedule_Date  = date(?)     ";
            var parameters = [
            	flight.div_no,
            	flight.flight_number,
            	flight.tail_number,
            	flight.scheduled_from,
            	flight.scheduled_to,
            	flight.schedule_date
            ];
            WingsTransactionDBService.executeSql(checkquery,parameters).then(function (result) {
                return deferred.resolve("GOHEAD");
            }, function (error) {
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };

        $scope.pullDiscrepancies = function (lastDateandAction) {
        	var deferred = $q.defer();
            var divNo = $rootScope.globals.currentUser.divNo;
            var defectCondition = " ";
            /*if (rejectedDefectsArray != undefined && rejectedDefectsArray.length > 0 ){
            	defectCondition = " And a.Id Not In ("+ rejectedDefectsArray.join(',')+") ";
            }*/
            var sql = " Select a.Id,                                                                                               " +
                      "        a.Div_No,                                                                                           " +
                      "        a.Discrepancy_Number,                                                                               " +
                      "        a.Discrepancy_Type,                                                                                 " +
                      "        a.Tail_Number,                                                                                      " +
                      "        a.Order_Number,                                                                                     " +
                      "        a.Control_Number,                                                                                   " +
                      "        a.Ata_Code,                                                                                         " +
                      "        a.Status,                                                                                           " +
                      "        a.Flight_Id,                                                                                        " +
                      "        a.Discrepancy,                                                                                      " +
                      "        a.Corrective_Action,                                                                                " +
                      "        Nvl(a.Extension_Due_Date,a.Due_date) Due_Date,                                                      " +
                      "        a.Remaining_Cycle,                                                                                  " +
                      "        a.Remaining_Hour,                                                                                   " +
                      "        a.Planned_Date,                                                                                     " +
                      "        a.Report_Date,                                                                                      " +
                      "        a.Reported_By_Employee_Number,                                                                      " +
                      "        a.Reported_Station,                                                                                 " +
                      "        a.Rectification_Date,                                                                               " +
                      "        a.Rectified_By_Employee_Number,                                                                     " +
                      "        a.Rectified_Station,                                                                                " +
                      "        a.Inspected_Date,                                                                                   " +
                      "        a.Inspected_By_Employee_Number,                                                                     " +
                      "        a.Inspected_Station,                                                                                " +
                      "        a.Open_Reference_Number,                                                                            " +
                      "        a.Close_Reference_Number,                                                                           " +
                      "        a.Hold_Document_Number,                                                                             " +
                      "        a.Hold_Task_Number,                                                                                 " +
                      "        a.Hold_Reference_Number,                                                                            " +
                      "        a.Category,                                                                                         " +
                      "        a.Defer_Reason,                                                                                     " +
                      "        a.Hold_Task_Repetitive_Flag,                                                                        " +
                      "        a.Hold_By_Employee_Number,                                                                          " +
                      "        a.Hold_Interval_Day,                                                                                " +
                      "        a.Hold_Interval_Time,                                                                               " +
                      "        a.Hold_Interval_Cycle,                                                                              " +
                      "        a.Internal_Comment,                                                                                 " +
                      "        c.Pirep_Flag,                                                                                       " +
                      "        c.Marep_Flag,                                                                                       " +
                      "        c.Cabin_Flag,                                                                                       " +
                      "        c.Order_Flag,                                                                                       " +
                      "        a.Work_Card_Id,                                                                                       " +
		              "        Nvl(a.Dt_Modified,a.Dt_Created) Transaction_Date                                                    " +
                      "   From Mm_Discrepancies_v   a,                                                                             " +
                      "        Mm_Aircrafts_v       b,                                                                             " +
                      "        MM_Discrepancy_Types c                                                                              " +
                      "  Where a.Div_No     = "+divNo                                                                                +
			          "    And Nvl(a.Dt_Modified,a.Dt_Created) > to_date('"+lastDateandAction.defectLastDate+"','yyyy-mm-dd hh24:mi:ss') " +
			                   defectCondition+" "                                                                                   +     
			                   lastDateandAction.defectAction+
                      "    And b.Div_No           = a.Div_No                                                                       " +
                      "    And b.Id               = a.Aircraft_Id                                                                  " +
                      "    And b.Active           = 'Y'                                                                            " +
                      "    And c.Div_No           = a.Div_No                                                                       " +
                      "    And c.Discrepancy_Type = a.Discrepancy_Type                                                             " ;
            
            var sqlArray     = [{ queryStr: sql, queryType: "READ" }];
            var sqlString    = JSON.stringify(sqlArray);
            WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                var defects  = angular.fromJson(dataIn[0].rows);
                var bindings = [];
                if (defects.length > 0) {
                    var sqlDefect = "INSERT OR REPLACE INTO MM_DISCREPANCIES (Id,                              " +
                                    "                                         Div_No,                          " +
                                    "                                         Discrepancy_Number,              " +
                                    "                                         Discrepancy_Type,                " +
                                    "                                         Tail_Number,                     " +
                                    "                                         Order_Number,                    " +
                                    "                                         Log_Number,                      " +
                                    "                                         Ata_Code,                        " +
                                    "                                         Status,                          " +
                                    "                                         Flight_Id,                       " +
                                    "                                         Discrepancy,                     " +
                                    "                                         Corrective_Action,               " +
                                    "                                         Report_Date,                     " +
                                    "                                         Reported_By_Employee_Number,     " +
                                    "                                         Reported_Station,                " +
                                    "                                         Rectification_Date,              " +
                                    "                                         Rectified_By_Employee_Number,    " +
                                    "                                         Rectified_Station,               " +
                                    "                                         Inspected_Date,                  " +
                                    "                                         Inspected_By_Employee_Number,    " +
                                    "                                         Inspected_Station,               " +
                                    "                                         Open_Reference_Number,           " +
                                    "                                         Close_Reference_Number,          " +
                                    "                                         Hold_Document_Number,            " +
                                    "                                         Hold_Task_Number,                " +
                                    "                                         Hold_Reference_Number,           " +
                                    "                                         Category,                        " +
                                    "                                         Defer_Reason,                    " +
                                    "                                         Repetitive_Flag,                 " +
                                    "                                         Hold_By_Employee_Number,         " +
                                    "                                         Interval_Day,                    " +
                                    "                                         Interval_Hour,                   " +
                                    "                                         Interval_Cycle,                  " +
                                    "                                         Due_Date,                        " +
                                    "                                         Remaining_Cycle,                 " +
                                    "                                         Remaining_Hour,                  " +
                                    "                                         Planned_Date,                    " +
                                    "                                         Pirep_Flag,                      " +
                                    "                                         Marep_Flag,                      " +
                                    "                                         Cabin_Flag,                      " +
                                    "                                         Order_Flag,                      " +
                                    "                                         Work_Card_Id,                    " +
                                    "                                         Internal_Comment,                " +
                                    "                                         Server_Transaction_Date,         " +
                                    "                                         Mobile_Record_Id)                " +
                                    "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,(Select Mobile_Record_Id From Mm_Discrepancies Where id = ?)); ";                    
                    var i;
                    for (i in defects) {
                        parameters = [defects[i].id,
                                      defects[i].div_no,
                                      defects[i].discrepancy_number,
                                      defects[i].discrepancy_type,
                                      defects[i].tail_number,
                                      defects[i].order_number,
                                      defects[i].control_number,
                                      defects[i].ata_code,
                                      defects[i].status,
                                      defects[i].flight_id,
                                      defects[i].discrepancy,
                                      defects[i].corrective_action,
                                      WingsUtil.IsNull(defects[i].report_date)?'':moment(defects[i].report_date).format('YYYY-MM-DD HH:mm'),
                                      defects[i].reported_by_employee_number,
                                      defects[i].reported_station,
                                      WingsUtil.IsNull(defects[i].rectification_date)?'':moment(defects[i].rectification_date).format('YYYY-MM-DD HH:mm'),
                                      defects[i].rectified_by_employee_number,
                                      defects[i].rectified_station,
                                      WingsUtil.IsNull(defects[i].inspected_date)?'':moment(defects[i].inspected_date).format('YYYY-MM-DD HH:mm'),
                                      defects[i].inspected_by_employee_number,
                                      defects[i].inspected_station,
                                      defects[i].open_reference_number,
                                      defects[i].close_reference_number,
                                      defects[i].hold_document_number,
                                      defects[i].hold_task_number,
                                      defects[i].hold_reference_number,
                                      defects[i].category,
                                      defects[i].defer_reason,
                                      defects[i].hold_task_repetitive_flag,
                                      defects[i].hold_by_employee_number,
                                      defects[i].hold_interval_day,
                                      defects[i].hold_interval_time,
                                      defects[i].hold_interval_cycle,
                                      WingsUtil.IsNull(defects[i].due_date)?'':moment(defects[i].due_date).format('YYYY-MM-DD HH:mm'),
                                      defects[i].remaining_cycle,
                                      defects[i].remaining_hour,
                                      WingsUtil.IsNull(defects[i].planned_date)?'':moment(defects[i].planned_date).format('YYYY-MM-DD HH:mm'),
                                      defects[i].pirep_flag,
                                      defects[i].marep_flag,
                                      defects[i].cabin_flag,
                                      defects[i].order_flag,
                                      defects[i].work_card_id,
                                      defects[i].internal_comment,
                                      moment(defects[i].transaction_date).format('YYYY-MM-DD HH:mm:ss'),
                                      defects[i].id];                        
                        bindings.push(parameters);
                    }
                    WingsTransactionDBService.insertCollection(sqlDefect,bindings).then(function (result){
                        $rootScope.$emit('refreshDefects');
                        return deferred.resolve("GOHEAD");
                    }, function (error) {
                        console.log("Defect-Error : " +JSON.stringify(error));
                        return deferred.reject(JSON.stringify(error));
                    });
                }else{
                    $rootScope.$emit('refreshDefects');
                	return deferred.resolve("GOHEAD");
                } 
            }, function (error) { return deferred.reject(JSON.stringify(error));});
            return deferred.promise;
        };

        $scope.pullPackages = function (lastDateAndAction) {
        	var deferred = $q.defer();
            var divNo    = $rootScope.globals.currentUser.divNo;
            var packageCondition = " ";
            /*if (rejectedPackagesArray != undefined && rejectedPackagesArray.length > 0 ) {
            	packageCondition = " And a.Id Not In (" + rejectedPackagesArray.join(',') + ") ";
            }*/
            var sql = " Select a.Id,                                                                                             " +
		              "        a.Div_No,                                                                                         " +
		              "        a.Package_Number,                                                                                 " +
		              "        a.Package_Type,                                                                                   " +
		              "        a.Tail_Number,                                                                                    " +
		              "        a.Package_Groups,                                                                                 " +
		              "        a.Status,                                                                                         " +
		              "        a.Work_Order_Station,                                                                             " +
		              "        a.Planned_Start_Date,                                                                             " +
		              "        a.Planned_Finish_Date,                                                                            " +
		              "        a.Total_Estimated_Time,                                                                           " +
		              "        a.Actual_Start_Date,                                                                              " +
		              "        a.Completion_Date,                                                                                " +
		              "        a.Completion_Cycle,                                                                               " +
		              "        a.Completion_Hour,                                                                                " +
		              "        a.Closed_By_Employee_Number,                                                                      " +
		              "        a.Remaining_Cycle,                                                                                " +
		              "        a.Remaining_Hour,                                                                                 " +
		              "        Nvl(a.Department_Line_Flag,'N') Department_Line_Flag,                                             " +
		              "        a.Package_Task_Count,                                                                             " +
		              "        a.Work_Order_Number,                                                                              " +
		              "        Replace(a.Internal_Comment,Chr(10),'<br>') Internal_Comment,                                      " +
		              "        a.Tracking_Status,                                                                                " +
		              "        Nvl(a.Dt_Modified,a.Dt_Created) Transaction_Date                                                  " +
		              "   From Mm_Packages_v   a                                                                                 " +
		              "  Where a.Div_No     = "+divNo                                                                              +
		              "    And a.Aircraft_Id Is Not Null                                                                         " +
			          "    And Nvl(a.Dt_Modified,a.Dt_Created) > to_date('"+lastDateAndAction.packageLastDate+"','yyyy-mm-dd hh24:mi:ss')   " +
			                   packageCondition+" "                                                                                +     
			                   lastDateAndAction.packageAction;
  
            var sqlArray     = [{ queryStr: sql, queryType: "READ" }];
            var sqlString    = JSON.stringify(sqlArray);
            WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
            	var packages  = angular.fromJson(dataIn[0].rows);
            	var bindings  = [];
            	if (packages.length > 0) {
                    var sqlPackages="INSERT OR REPLACE INTO MM_PACKAGES (Id,                        " +
                                    "                                    Div_No,                    " +
                                    "                                    Package_Number,            " +
                                    "                                    Package_Type,              " +
                                    "                                    Tail_Number,               " +
                                    "                                    Package_Groups,            " +
                                    "                                    Status,                    " +
                                    "                                    Work_Order_Station,        " +
                                    "                                    Planned_Start_Date,        " +
                                    "                                    Planned_Finish_Date,       " +
                                    "                                    Total_Estimated_Time,      " +
                                    "                                    Actual_Start_Date,         " +
                                    "                                    Completion_Date,           " +
                                    "                                    Completion_Cycle,          " +
                                    "                                    Completion_Hour,           " +
                                    "                                    Closed_By_Employee_Number, " +
                                    "                                    Work_Order_Number,         " +
                                    "                                    Internal_Comment,          " +
                                    "                                    Remaining_Cycle,           " +
                                    "                                    Remaining_Hour,            " +
                                    "                                    Tracking_Status,           " +
                                    "                                    Department_Line_Flag,      " +
                                    "                                    Package_Task_Count,        " +
                                    "                                    Server_Transaction_Date)   " +
                                    "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);      ";                    
		          var i;
		          for (i in packages) {
		              parameters = [packages[i].id,
		                            packages[i].div_no,
		                            packages[i].package_number,
		                            packages[i].package_type,
		                            packages[i].tail_number,
		                            packages[i].package_groups,
		                            packages[i].status,
		                            packages[i].work_order_station,
		                            packages[i].planned_start_date,
		                            packages[i].planned_finish_date,
		                            packages[i].total_estimated_time,
		                            WingsUtil.IsNull(packages[i].actual_start_date)?'':moment(packages[i].actual_start_date).format('YYYY-MM-DD HH:mm'),
				                    WingsUtil.IsNull(packages[i].completion_date)?'':moment(packages[i].completion_date).format('YYYY-MM-DD HH:mm'),
		                            packages[i].completion_cycle,
		                            packages[i].completion_hour,
		                            packages[i].closed_by_employee_number,
		                            packages[i].work_order_number,
		                            packages[i].internal_comment,
		                            packages[i].remaining_cycle,
		                            packages[i].remaining_hour,
		                            packages[i].tracking_status,
		                            packages[i].department_line_flag,
		                            packages[i].package_task_count,
		                            packages[i].transaction_date];                        
		              bindings.push(parameters);
		          }
		          WingsTransactionDBService.insertCollection(sqlPackages,bindings).then(function (result) {
		              return deferred.resolve("GOHEAD");
		          }, function (error) {
		              console.log("Package-Error : " +JSON.stringify(error));
		              return deferred.reject(JSON.stringify(error));
		          });
	            } else {
	            	return deferred.resolve("GOHEAD");
	            } 
	        }, function (error) { 
            	return deferred.reject("Packages Server Query FAILED "+JSON.stringify(error));
            });
            return deferred.promise;
        };
        $scope.pullAttachments = function (lastDateAndAction) {
        	var deferred = $q.defer();
            var divNo    = $rootScope.globals.currentUser.divNo;
            var sql = " Select Div_No,                                                                                                    " +
            		  "        Parent,                                                                                                    " +
                      "        Parent_Id,                                                                                                 " +
                      "        File_Id,                                                                                                   " +
                      "        Image_Type,                                                                                                " +
                      "        Line,                                                                                                      " +
                      "        Long_File_Name,                                                                                            " +
                      "        File_Extension,                                                                                            " +
		              "        Nvl(Dt_Modified,Dt_Created) Transaction_Date                                                           " +
                      "   From Gn_Images_v                                                                                                " +
                      "  Where Div_No  = " +$rootScope.globals.currentUser.divNo                                                            +
                      "    And Parent In ('MM_DISCREPANCIES','MM_FLIGHTS')                                                                " +
		              "    And Nvl(Dt_Modified,Dt_Created) > to_date('"+lastDateAndAction.imageLastDate+"','yyyy-mm-dd hh24:mi:ss')   " ;
  
            var sqlArray     = [{ queryStr: sql, queryType: "READ" }];
            var sqlString    = JSON.stringify(sqlArray);
            WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
            	var images  = angular.fromJson(dataIn[0].rows);
            	var bindings  = [];
            	if (images.length > 0) {
                    var sqlImages = "INSERT OR REPLACE INTO GN_IMAGES ( Div_No,                    " +
                                    "                                   Parent,                    " +
                                    "                                   Parent_Id,                 " +
                                    "                                   File_Id,                   " +
                                    "                                   Image_Type,                " +
                                    "                                   Line,                      " +
                                    "                                   File_Location,             " +
                                    "                                   File_Extension,            " +
                                    "                                   Server_Transaction_Date)   " +
                                    "VALUES (?,?,?,?,?,?,?,?,?);                                   ";                    
		          var i;
		          for (i in images) {
		              parameters = [images[i].div_no,
				                    images[i].parent,
				                    images[i].parent_id,
				            	    images[i].file_id,
				            	    images[i].image_type,
				            	    images[i].line,
				            	    images[i].long_file_name,
				            	    images[i].file_extension,
				            	    moment(images[i].transaction_date).format('YYYY-MM-DD HH:mm:ss')];                        
		              bindings.push(parameters);
		          }
		          WingsTransactionDBService.insertCollection(sqlImages,bindings).then(function (result) {
		              return deferred.resolve("GOHEAD");
		          }, function (error) {
		              console.log("Package-Error : " +JSON.stringify(error));
		              return deferred.reject(JSON.stringify(error));
		          });
	            } else {
	            	return deferred.resolve("GOHEAD");
	            } 
	        }, function (error) { 
            	return deferred.reject("Images Server Query FAILED "+JSON.stringify(error));
            });
            return deferred.promise;
        };

        $scope.getFlightList = function () {
           // $scope.flights = [];
/*            var sql =" Select * from (                                         " +
                     " Select a.ID,                                            " +
                     "        a.FLIGHT_NUMBER,                                 " +
                     "        a.CONTROL_NUMBER,                                " +
                     "        a.STATUS,                                        " +
                     "        a.TAIL_NUMBER,                                   " +
                     "        a.SCHEDULE_DATE,                                 " +
                     "        a.SCHEDULED_FROM,                                " +
                     "        a.SCHEDULED_TO,                                  " +
                     "        a.SCHEDULED_OFF_BLOCK,                           " +
                     "        a.SCHEDULED_ON_BLOCK,                            " +
                     "        a.SCHEDULED_TAKE_OFF,                            " +
                     "        a.SCHEDULED_LANDING,                             " +
                     "        a.MOBILE_RECORD_ID,                              " +
                     "        'MM_SCHEDULED_FLIGHTS' TABLE_NAME,               " +
                     "        '' SERVER_FEEDBACK,                              " +
                     "        '' MOBILE_RECORD_STATUS                          " +
                     " From Mm_Scheduled_Flights a                             " +
                     "Where TAIL_NUMBER = ?                                    " +
                     "  And datetime(a.SCHEDULED_OFF_BLOCK) >= datetime('now','-3 hour')                " +
                     "  And date (a.SCHEDULE_DATE) < date('now','+3 day') LIMIT 3)    " +
                     " UNION ALL                                               " +
                     " Select * from (                                         " +
                     " Select b.ID,                                            " +
                     "        b.FLIGHT_NUMBER,                                 " +
                     "        b.CONTROL_NUMBER,                                " +
                     "        b.STATUS,                                        " +
                     "        b.TAIL_NUMBER,                                   " +
                     "        ifnull(nullif(b.ACTUAL_DATE,''),b.SCHEDULE_DATE) SCHEDULE_DATE,                     " +
                     "        ifnull(nullif(b.ACTUAL_FROM,''),b.SCHEDULED_FROM) SCHEDULED_FROM,                    " +
                     "        ifnull(nullif(b.ACTUAL_TO,''),b.SCHEDULED_TO) SCHEDULED_TO,                        " +
                     "        ifnull(nullif(b.ACTUAL_OFF_BLOCK,''),b.SCHEDULED_OFF_BLOCK) SCHEDULED_OFF_BLOCK,          " +
                     "        ifnull(nullif(b.ACTUAL_ON_BLOCK,''),b.SCHEDULED_ON_BLOCK) SCHEDULED_ON_BLOCK,            " +
                     "        ifnull(nullif(b.ACTUAL_TAKE_OFF,''),b.SCHEDULED_OFF_BLOCK) SCHEDULED_TAKE_OFF,            " +
                     "        ifnull(nullif(b.ACTUAL_LANDING,''),b.SCHEDULED_ON_BLOCK) SCHEDULED_LANDING,              " +
                     "        b.MOBILE_RECORD_ID,                              " +
                     "        'MM_FLIGHTS' TABLE_NAME,                         " +
                     "        b.SERVER_FEEDBACK,                               " +
                     "        b.MOBILE_RECORD_STATUS                           " +
                     "   From Mm_Flights b                                     " +
                     " Where TAIL_NUMBER = ?                                   " +
                     "   And date(ifnull(b.ACTUAL_DATE,b.SCHEDULE_DATE)) > date('now','-3 day')        " +
                     "   And b.Status != 'LOG'                                   " +
                     " ) Order By SCHEDULED_OFF_BLOCK DESC               ";*/
            var sql =" Select * from (                                                                             " +
            " Select * from ( Select a.ID,                                                                         " +
            "        a.FLIGHT_NUMBER,                                                                              " +
            "        a.CONTROL_NUMBER,                                                                             " +
            "        a.STATUS,                                                                                     " +
            "        a.TAIL_NUMBER,                                                                                " +
            "        a.SCHEDULE_DATE,                                                                              " +
            "        a.SCHEDULED_FROM,                                                                             " +
            "        a.SCHEDULED_TO,                                                                               " +
            "        a.SCHEDULED_OFF_BLOCK,                                                                        " +
            "        a.SCHEDULED_ON_BLOCK,                                                                         " +
            "        a.SCHEDULED_TAKE_OFF,                                                                         " +
            "        a.SCHEDULED_LANDING,                                                                          " +
            "        a.MOBILE_RECORD_ID,                                                                           " +
            "        'MM_SCHEDULED_FLIGHTS' TABLE_NAME,                                                            " +
            "        '' SERVER_FEEDBACK,                                                                           " +
            "        '' MOBILE_RECORD_STATUS                                                                       " +
            " From Mm_Scheduled_Flights a                                                                          " +
            "Where (Null is Null)                                                                                  " +
            "  And Div_No = ?                                                                                      " +
            "  And Tail_Number = ?                                                                                 " +
            "  And datetime(a.SCHEDULED_OFF_BLOCK) >= datetime('now','-30 minute')                                 " +
            "  And date (a.SCHEDULE_DATE) <= date('now','+1 day') " +
            "Order By /*sortOrder*/ SCHEDULED_OFF_BLOCK ASC )  limit 5" +
            ")                                                                                                     " +
            " UNION ALL                                                                                            " +
            " Select * from (                                                                                      " +
            " Select b.ID,                                                                                         " +
            "        b.FLIGHT_NUMBER,                                                                              " +
            "        b.CONTROL_NUMBER,                                                                             " +
            "        b.STATUS,                                                                                     " +
            "        b.TAIL_NUMBER,                                                                                " +
            "        ifnull(nullif(b.ACTUAL_DATE,''),b.SCHEDULE_DATE) SCHEDULE_DATE,                               " +
            "        ifnull(nullif(b.ACTUAL_FROM,''),b.SCHEDULED_FROM) SCHEDULED_FROM,                             " +
            "        ifnull(nullif(b.ACTUAL_TO,''),b.SCHEDULED_TO) SCHEDULED_TO,                                   " +
            "        ifnull(nullif(b.ACTUAL_OFF_BLOCK,''),b.SCHEDULED_OFF_BLOCK) SCHEDULED_OFF_BLOCK,              " +
            "        ifnull(nullif(b.ACTUAL_ON_BLOCK,''),b.SCHEDULED_ON_BLOCK) SCHEDULED_ON_BLOCK,                 " +
            "        ifnull(nullif(b.ACTUAL_TAKE_OFF,''),b.SCHEDULED_OFF_BLOCK) SCHEDULED_TAKE_OFF,                " +
            "        ifnull(nullif(b.ACTUAL_LANDING,''),b.SCHEDULED_ON_BLOCK) SCHEDULED_LANDING,                   " +
            "        b.MOBILE_RECORD_ID,                              											   " +
            "        'MM_FLIGHTS' TABLE_NAME,                         											   " +
            "        b.SERVER_FEEDBACK,                               											   " +
            "        b.MOBILE_RECORD_STATUS                                                                        " +
            "   From Mm_Flights b                                                                                  " +
            " Where (Null is Null)                                                                                 " +
            "   And Div_No = ?                                                                                     " +
            "   And Tail_Number = ?                                                                                " +
            "   And date(ifnull(b.ACTUAL_DATE,b.SCHEDULE_DATE)) > date('now','-3 day')                             " +
            "   And b.Status != 'LOG'                                                                              " +
            " ) Order By /*sortOrder*/ SCHEDULED_OFF_BLOCK DESC                                                    ";
            if (!WingsUtil.IsNull(sortOrder)) {
            	sql = _.replace(sql, new RegExp('/\\*sortOrder\\*/', 'g'), sortOrder.value);
            }
            if (!WingsUtil.IsNull(queryCondition)) {
            	sql = _.replace(sql, new RegExp('(Null is Null)', 'g'), queryCondition.value);
            }
            if (!WingsUtil.IsNull(query)) {
            	sql = query.value;
            }
    		console.log('READ '+moment().format('DD-MM-YYYY HH:mm:ss'));

            WingsTransactionDBService.executeSql(sql,[$rootScope.globals.currentUser.divNo,$scope.selectedTailNumber,$rootScope.globals.currentUser.divNo,$scope.selectedTailNumber]).then(function (result) {
        		console.log('READ '+moment().format('DD-MM-YYYY HH:mm:ss'));

                $ionicBackdrop.release();
                if (result.length > 0) {
                    $scope.flights = result;
                }
                for (var i = 0;i<result.length;i++) {
                    if (!WingsUtil.IsNull(result[i].SCHEDULED_TAKE_OFF) && !WingsUtil.IsNull(result[i].SCHEDULED_TAKE_OFF)) {
                        $scope.flights[i].SCHEDULED_TAKE_OFF = moment(result[i].SCHEDULED_TAKE_OFF).format('HH:mm');
                        $scope.flights[i].SCHEDULED_LANDING = moment(result[i].SCHEDULED_LANDING).format('HH:mm');
                    }
                    $scope.flights[i].SCHEDULE_DATE = new Date(moment(result[i].SCHEDULE_DATE));
                }
                $scope.$broadcast('scroll.refreshComplete');
                return deferred.resolve("GOHEAD");
            }, function (error) {
            	$ionicBackdrop.release();
                WingsDialogService.error(JSON.stringify(error));
                console.log('MM_0100 - lof - lof'+JSON.stringify(error));
                return deferred.reject("lof-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };
        
        //   EVENTS   //
        var removeListener = $rootScope.$on('onflightcreate', function(){
        	  $timeout(function() {
                  $scope.SYNC();
              },100);
        });
        
        var removeListener2 = $rootScope.$on('refreshFlightList', function(){
      	    $timeout(function() {
      		    $scope.getFlightList();
            },100);
        });
        var removeListener3 = $rootScope.$on('onDiscrepancyCreate', function(){
      	    $timeout(function() {
      		    pushDefect();
            },100);
        });
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams, error) {
        	if (toState.name == 'app.home'){
                removeListener();
        	    removeListener2();
        	    removeListener3();
        	} 
        });
        $scope.showFlightDetails = function (object) {
        /*    if(object.STATUS == 'SCHEDULED' && new Date().toDateString() !== object.SCHEDULE_DATE.toDateString()){
                WingsDialogService.error('Scheduled flighs are not accessable before flight date');
                return;
            }*/
        	if (WingsUtil.IsNull(object)) {
                object = $scope.selectedFlight;
            }
            if (object.TABLE_NAME == 'MM_FLIGHTS') {
                   $rootScope.MM_M051_id = object.ID;
                   $state.go('app.MM_0051_FlightDetails')
                   $scope.cancelSelect();
               } else {
            	   
            	   /*var scheduleFlights = _.orderBy(_.filter($scope.flights, function(o) { return o.TABLE_NAME == 'MM_SCHEDULED_FLIGHTS'; }), ['SCHEDULED_OFF_BLOCK'], ['asc']);
            	   if (scheduleFlights[0] != object) {
                  		WingsDialogService.error("Please select flight respectively.  ");
                   		return false;
            	   }*/
            	   var sql = "Select count(0) count From Mm_Flights where Div_No = ? And Tail_Number = ? And Status = 'SCHEDULED' And nullif(Close_Date,'') is null";
                   WingsTransactionDBService.executeSql(sql,[$rootScope.globals.currentUser.divNo,$scope.selectedTailNumber]).then(function (result) {
                	   if (result[0].count > 0) {
                       		WingsDialogService.error("Please close OPEN flight before proceeding with the new one. ");
                       		return false;
                	   }
                	   $rootScope.MM_M051_id = object.ID;
                	   var buttonArray= ['Ok','Cancel'];
                	    WingsDialogService.confirm('Flight process will be started.\nDo you want to continue ?','Confirm',buttonArray).then(function(buttonIndex) {
                            // no button = 0, 'Ok' = 1, 'Cancel' = 2
                            if(buttonIndex == 1) {
                                pushOnlyFlight(object.MOBILE_RECORD_ID).then(function (result) {
                             	   $scope.SYNC().then(function (result) {
                                        $state.go('app.MM_0051_FlightDetails');
                                    }, function (error) {
                                    });
                                }, function (error) {
                             	   $timeout(function() {
                                        $scope.SYNC ();
                                    },5000);
                                });
                            }
                        });
	            	   /*
	                   WingsDialogService.prompt('You are starting a new flight. Please enter log number.','Confirm',buttonArray).then(function(result) {
	                       // no button = 0, 'Ok' = 1, 'Cancel' = 2
	                       var btnIndex = result.buttonIndex;
	                       if(btnIndex == 1) {
	                    	   var logNumber = result.input1
	                    	   $rootScope.MM_M051_id = object.ID;
	                    	  
		                    	   var sql = "Update mm_scheduled_flights set control_number = ? where Mobile_Record_Id = ?";
		                           WingsTransactionDBService.executeSql(sql,[logNumber,object.MOBILE_RECORD_ID]).then(function (result) {
			                           pushOnlyFlight(object.MOBILE_RECORD_ID).then(function (result) {
			                        	   $scope.SYNC ().then(function (result) {
			                                   $state.go('app.MM_0051_FlightDetails');
			                               }, function (error) {
			                               });
			                           }, function (error) {
			                        	   $timeout(function() {
			                                   $scope.SYNC ();
			                               },5000);
			                           });
		                           }, function (error) {
		                        	   $timeout(function() {
		                                   $scope.SYNC ();
		                               },5000);
		                           });
	                       }
	                   });*/
                   }, function (error) {
                	   $timeout(function() {
                           $scope.SYNC ();
                       },5000);
                   });
               }
            $scope.popoverMenu.hide();
               $scope.cancelSelect();
        };
        $scope.modifyFlight = function (object) {
        	if (WingsUtil.IsNull(object)) {
                object = $scope.selectedFlight;
            }
            $rootScope.MM_M051_viewMode ='update';
            if ($scope.selectedFlight.TABLE_NAME != 'MM_FLIGHTS') {
            	/*var scheduleFlights = _.orderBy(_.filter($scope.flights, function(o) { return o.TABLE_NAME == 'MM_SCHEDULED_FLIGHTS'; }), ['SCHEDULED_OFF_BLOCK'], ['asc']);
         	    if (scheduleFlights[0] != object) {
                	WingsDialogService.error("Please select flight respectively.  ");
                 	return false;
         	    }*/
	            var sql = "Select Status From Mm_Flights where Mobile_Record_Id = (SELECT max(Mobile_Record_Id) FROM Mm_Flights)";
	            WingsTransactionDBService.executeSql(sql,[]).then(function (result) {
	          	    if (result.length > 0 && result[0].STATUS == 'SCHEDULED' || result[0].STATUS == 'ACCEPTED') {
	                    WingsDialogService.error("Please close open flight before proceeding to new flight. ");
	                 	return false;
	          	    }
		            var buttonArray= ['Ok','Cancel'];
            	    WingsDialogService.confirm('Flight process will be started.\nDo you want to continue ?','Confirm',buttonArray).then(function(buttonIndex) {
                        var btnIndex = result.buttonIndex;
                        if (buttonIndex == 1) {
                             pushOnlyFlight(object.MOBILE_RECORD_ID).then(function (result) {
                          	     $scope.SYNC().then(function (result) {
	                                 $state.go('app.MM_0051_Flight');
                                 }, function (error) {});
                             }, function (error) {
                          	   $timeout(function() {
                                     $scope.SYNC ();
                               },5000);
                             });
                        }
	                });
	             }, function (error) {
              	     $timeout(function() {
                         $scope.SYNC ();
                     },5000);
                 });
            } else {
                $rootScope.MM_M051_id = $scope.selectedFlight.ID;		
                $scope.cancelSelect();
                $state.go('app.MM_0051_Flight');
            }
            $scope.popoverMenu.hide();
            $scope.cancelSelect();
        };
        function pushOnlyFlight (id) {
       	    var deferred = $q.defer();
            var sqlFlight = " Select *                     " +
                            "   From Mm_Scheduled_Flights  " +
                            "  Where MOBILE_RECORD_ID = ?  ";
            
            var parameters = [id];
            WingsTransactionDBService.executeSql(sqlFlight,parameters).then(function (result) {
            	var builders    = [];
            	var offBlock = "";
            	var onBlock  = "";
            	if (!WingsUtil.IsNull(result[0].SCHEDULED_TAKE_OFF)) {
            		offBlock = moment(result[0].SCHEDULED_TAKE_OFF).format('HHmm');
            	} else if (!WingsUtil.IsNull(result[0].SCHEDULED_OFF_BLOCK)) {
            		offBlock = moment(result[0].SCHEDULED_OFF_BLOCK).format('HHmm');
            	} 
            	if (!WingsUtil.IsNull(result[0].SCHEDULED_LANDING)) {
            		onBlock = moment(result[0].SCHEDULED_LANDING).format('HHmm');
            	} else if (!WingsUtil.IsNull(result[0].SCHEDULED_ON_BLOCK)) {
            		onBlock = moment(result[0].SCHEDULED_ON_BLOCK).format('HHmm');
            	}
           	    var sql = new StoredFuncProcBuilder("Mb_Apps.Do_Flight", 
           		   	                                "i_Div_No",                  result[0].DIV_NO,
           		   	                                "i_Action",                  'CREATE',
							                        "i_Tail_Number",             result[0].TAIL_NUMBER,
							                        "i_Control_Number",          result[0].CONTROL_NUMBER,
							                        "i_Flight_Number",           result[0].FLIGHT_NUMBER,
							                        "i_Schedule_Date",           moment(result[0].SCHEDULE_DATE).format('YYYY-MM-DD'),
							                        "i_Scheduled_From",          result[0].SCHEDULED_FROM,
							                        "i_Scheduled_To",            result[0].SCHEDULED_TO,
							                        "i_Scheduled_Off_Block",     offBlock,
							                        "i_Scheduled_On_Block",      onBlock,
					                        	    "i_Status",                  "SCHEDULED",
						            				"i_Mobile_Flight_Id",        result[0].MOBILE_RECORD_ID,
							                        "o_Data",                    '');
           	    var obj = sql.queryObject();
           	    builders.push(obj);
           	    var crews = result[0].CREW_TYPES;
           	    var employeeNumbers = result[0].EMPLOYEE_NUMBERS;
           	    var divNo = result[0].DIV_NO;
		        if (builders.length > 0) {
		             var str = JSON.stringify(builders);
		             WingsRemoteDbService.executeFunction(str).then (function (response) {
		            	 var result = angular.fromJson(response[0]);
		            	 if (result.isSuccess =='true'  && result.errorText == '') {
		                     WingsRemoteDbService.HandleFeedback(result);
		                     $rootScope.MM_M051_id = angular.fromJson(result.result.o_Data).FLIGHT_ID;
		                     if (crews.length > 0) {
		                    	 var sql = new StoredFuncProcBuilder("Mb_Apps.Do_Flight",   
									                    			 "i_Div_No",             divNo,
									                    			 "i_Action",             'CREW',
									                    			 "i_Flight_Id",          $rootScope.MM_M051_id,
									                    			 "i_Crew_Types",         crews,
									                    			 "i_Employee_Numbers",   employeeNumbers,
									                    			 "o_Data",               '');
		                    	 var obj = sql.queryObject();
		                    	 var str = JSON.stringify([obj]);
		                    	 WingsRemoteDbService.executeFunction(str).then (function (response) {
		                    		 var result = angular.fromJson(response[0]);
		                    		 if (result.isSuccess =='true'  && result.errorText == '') {
		                    			 WingsRemoteDbService.HandleFeedback(result);
		                    			 return deferred.resolve($rootScope.MM_M051_id);
		                    		 }
		                    	 }, function (error) {
		                    		 return deferred.reject("PushOnlyFlight Error : " +JSON.stringify(error));
		                    		 console.log("PROMISES  - ERROR"+JSON.stringify(error));
		                    	 });
		                     } else {
                    			 return deferred.resolve($rootScope.MM_M051_id);
		                     }
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
            });
            return deferred.promise;
       };


        $scope.openFlight = function (object) {
            $rootScope.MM_M051_viewMode ='insert';
            $rootScope.MM_M051_selectedTailNumber = $scope.selectedTailNumber;
            $state.go('app.MM_0051_Flight');
            $scope.popoverMenu.hide();
            $scope.cancelSelect();
        };

        $timeout(function() {
            $scope.getFlightList();
        },10);
        
        
        ///// PUSH RECORDS ////
        function getFlights () {
            var deferred = $q.defer();
            var sqlFlight = "Select a.*,                                                    " +
				            "                (Select Max(x.Data)                            " +
				            "                   From Gn_Form_Data    x,                     " +
				            "                        Gn_Form_Columns y                      " +
				            "                  Where x.Div_No          = a.Div_No           " +
				            "                    And x.Parent          = 'MM_FLIGHTS'       " +
				            "                    And x.Parent_Id       = a.Id               " +
				            "                    And y.Div_No          = x.Div_No           " +
				            "                    And y.Column_Id       = x.Column_Id        " +
				            "                    And y.Column_Sequence = 1) Flex_Data_1,    " +
				            "                (Select Max(x.Data)                            " +
				            "                   From Gn_Form_Data    x,                     " +
				            "                        Gn_Form_Columns y                      " +
				            "                  Where x.Div_No          = a.Div_No           " +
				            "                    And x.Parent          = 'MM_FLIGHTS'       " +
				            "                    And x.Parent_Id       = a.Id               " +
				            "                    And y.Div_No          = x.Div_No           " +
				            "                    And y.Column_Id       = x.Column_Id        " +
				            "                    And y.Column_Sequence = 2) Flex_Data_2,    " +
				            "                (Select Max(x.Data)                            " +
				            "                   From Gn_Form_Data    x,                     " +
				            "                        Gn_Form_Columns y                      " +
				            "                  Where x.Div_No          = a.Div_No           " +
				            "                    And x.Parent          = 'MM_FLIGHTS'       " +
				            "                    And x.Parent_Id       = a.Id               " +
				            "                    And y.Div_No          = x.Div_No           " +
				            "                    And y.Column_Id       = x.Column_Id        " +
				            "                    And y.Column_Sequence = 3) Flex_Data_3,    " +
				            "                (Select Max(x.Data)                            " +
				            "                   From Gn_Form_Data    x,                     " +
				            "                        Gn_Form_Columns y                      " +
				            "                  Where x.Div_No          = a.Div_No           " +
				            "                    And x.Parent          = 'MM_FLIGHTS'       " +
				            "                    And x.Parent_Id       = a.Id               " +
				            "                    And y.Div_No          = x.Div_No           " +
				            "                    And y.Column_Id       = x.Column_Id        " +
				            "                    And y.Column_Sequence = 4) Flex_Data_4,    " +
				            "                (Select Max(x.Data)                            " +
				            "                   From Gn_Form_Data    x,                     " +
				            "                        Gn_Form_Columns y                      " +
				            "                  Where x.Div_No          = a.Div_No           " +
				            "                    And x.Parent          = 'MM_FLIGHTS'       " +
				            "                    And x.Parent_Id       = a.Id               " +
				            "                    And y.Div_No          = x.Div_No           " +
				            "                    And y.Column_Id       = x.Column_Id        " +
				            "                    And y.Column_Sequence = 5) Flex_Data_5,    " +
				            "                (Select Max(x.Data)                            " +
				            "                   From Gn_Form_Data    x,                     " +
				            "                        Gn_Form_Columns y                      " +
				            "                  Where x.Div_No          = a.Div_No           " +
				            "                    And x.Parent          = 'MM_FLIGHTS'       " +
				            "                    And x.Parent_Id       = a.Id               " +
				            "                    And y.Div_No          = x.Div_No           " +
				            "                    And y.Column_Id       = x.Column_Id        " +
				            "                    And y.Column_Sequence = 6) Flex_Data_6,    " +
				            "                (Select Max(x.Data)                            " +
				            "                   From Gn_Form_Data    x,                     " +
				            "                        Gn_Form_Columns y                      " +
				            "                  Where x.Div_No          = a.Div_No           " +
				            "                    And x.Parent          = 'MM_FLIGHTS'       " +
				            "                    And x.Parent_Id       = a.Id               " +
				            "                    And y.Div_No          = x.Div_No           " +
				            "                    And y.Column_Id       = x.Column_Id        " +
				            "                    And y.Column_Sequence = 7) Flex_Data_7,    " +
				            "                (Select Max(x.Data)                            " +
				            "                   From Gn_Form_Data    x,                     " +
				            "                        Gn_Form_Columns y                      " +
				            "                  Where x.Div_No          = a.Div_No           " +
				            "                    And x.Parent          = 'MM_FLIGHTS'       " +
				            "                    And x.Parent_Id       = a.Id               " +
				            "                    And y.Div_No          = x.Div_No           " +
				            "                    And y.Column_Id       = x.Column_Id        " +
				            "                    And y.Column_Sequence = 8) Flex_Data_8,    " +
				            "                (Select Max(x.Data)                            " +
				            "                   From Gn_Form_Data    x,                     " +
				            "                        Gn_Form_Columns y                      " +
				            "                  Where x.Div_No          = a.Div_No           " +
				            "                    And x.Parent          = 'MM_FLIGHTS'       " +
				            "                    And x.Parent_Id       = a.Id               " +
				            "                    And y.Div_No          = x.Div_No           " +
				            "                    And y.Column_Id       = x.Column_Id        " +
				            "                    And y.Column_Sequence = 9) Flex_Data_9,    " +
				            "                (Select Max(x.Data)                            " +
				            "                   From Gn_Form_Data    x,                     " +
				            "                        Gn_Form_Columns y                      " +
				            "                  Where x.Div_No          = a.Div_No           " +
				            "                    And x.Parent          = 'MM_FLIGHTS'       " +
				            "                    And x.Parent_Id       = a.Id               " +
				            "                    And y.Div_No          = x.Div_No           " +
				            "                    And y.Column_Id       = x.Column_Id        " +
				            "                    And y.Column_Sequence = 10) Flex_Data_10,  " +
				            "                 (Select x.Arrival                             " +
		            		"                    From Mm_Flight_Consumptions x              " +
		            		"                   Where x.Flight_Id        = a.Id             " +
		            		"                     And x.Consumption_Type = 'FUEL' ) Arrival " +
				            "           From Mm_Flights a                                   " +
				            "         Where a.Div_No = ?                                    " +
				            "           And a.Mobile_Record_Status = 'READY'                ";
            WingsTransactionDBService.executeSql(sqlFlight,[$rootScope.globals.currentUser.divNo]).then(function (result) {
            	var builders = [];
            	for (var i = 0;i<result.length;i++) {
            		var offBlock = "";
                	var onBlock  = "";
                	if (!WingsUtil.IsNull(result[i].SCHEDULED_TAKE_OFF)) {
                		offBlock = moment(result[i].SCHEDULED_TAKE_OFF).format('HHmm');
                	} else if (!WingsUtil.IsNull(result[i].SCHEDULED_OFF_BLOCK)) {
                		offBlock = moment(result[i].SCHEDULED_OFF_BLOCK).format('HHmm');
                	} 
                	if (!WingsUtil.IsNull(result[i].SCHEDULED_LANDING)) {
                		onBlock = moment(result[i].SCHEDULED_LANDING).format('HHmm');
                	} else if (!WingsUtil.IsNull(result[i].SCHEDULED_ON_BLOCK)) {
                		onBlock = moment(result[i].SCHEDULED_ON_BLOCK).format('HHmm');
                	}
            		if (result[i].STATUS == 'SCHEDULED') {
            			var sql = new StoredFuncProcBuilder("Mb_Apps.Do_Flight", 
								            				"i_Div_No",                result[i].DIV_NO,
								            				"i_Action",                'MODIFY',
								            				"i_Mobile_Flight_Id",      result[i].MOBILE_RECORD_ID,
								            				"i_Flight_Id",             result[i].ID,
								                            "i_Tail_Number",           result[i].TAIL_NUMBER,
								            				"i_Flight_Number",         result[i].FLIGHT_NUMBER,
								                            "i_Control_Number",        result[i].CONTROL_NUMBER,
								                            "i_Schedule_Date",         moment(result[i].SCHEDULE_DATE).format('YYYY-MM-DD'),
									                        "i_Scheduled_From",        result[i].SCHEDULED_FROM,
									                        "i_Scheduled_To",          result[i].SCHEDULED_TO,
									                        "i_Scheduled_Off_Block",   offBlock,
									                        "i_Scheduled_On_Block",    onBlock,
								            				"i_Actual_From",           result[i].ACTUAL_FROM,
								            				"i_Actual_To",             result[i].ACTUAL_TO,
								                            "i_Actual_Date",           moment(result[i].ACTUAL_DATE).format('YYYY-MM-DD'),
								                            "i_Actual_Off_Block",      WingsUtil.IsNull(result[i].ACTUAL_OFF_BLOCK)?'': moment(result[i].ACTUAL_OFF_BLOCK).format('HHmm'),
								                            "i_Actual_Take_Off",       WingsUtil.IsNull(result[i].ACTUAL_TAKE_OFF)?'': moment(result[i].ACTUAL_TAKE_OFF).format('HHmm'),
								                            "i_Actual_Landing",        WingsUtil.IsNull(result[i].ACTUAL_LANDING)?'': moment(result[i].ACTUAL_LANDING).format('HHmm'),
								                            "i_Actual_On_Block",       WingsUtil.IsNull(result[i].ACTUAL_ON_BLOCK)?'': moment(result[i].ACTUAL_ON_BLOCK).format('HHmm'),
								                            "i_Low_Visibility_Status", result[i].LOW_VISIBILITY_STATUS,								            				
								                            "i_Reduced_Visibility_Flag", '',
								            				"i_Air_Turnback_Flag",     result[i].DIVERSION,
								                            "i_Internal_Comment",      result[i].INTERNAL_COMMENT,
								            				"i_Delay_Reasons",         result[i].DELAY_REASON,
								            				"i_Delay_Times",           result[i].DELAY_TIME,
								            				"i_Flex_Field1",           result[i].Flex_Data_1,
								            				"i_Flex_Field2",           result[i].Flex_Data_2,
								            				"i_Flex_Field3",           result[i].Flex_Data_3,
								            				"i_Flex_Field4",           result[i].Flex_Data_4,
								            				"i_Flex_Field5",           result[i].Flex_Data_5,
								            				"i_Flex_Field6",           result[i].Flex_Data_6,
								            				"i_Flex_Field7",           result[i].Flex_Data_7,
								            				"i_Flex_Field8",           result[i].Flex_Data_8,
								            				"i_Flex_Field9",           result[i].Flex_Data_9,
								            				"i_Flex_Field10",          result[i].Flex_Data_10,
								            				"o_Data",                  '');
            			var obj = sql.queryObject();
                   	    builders.push(obj);
            		} else if (result[i].STATUS == 'ACCEPTED') {
            			var sql = new StoredFuncProcBuilder("Mb_Apps.Do_Flight", 
								            				"i_Div_No",                result[i].DIV_NO,
								            				"i_Action",                'MODIFY',
								            				"i_Flight_Id",             result[i].ID,
								            				"i_Mobile_Flight_Id",      result[i].MOBILE_RECORD_ID,
								                            "i_Tail_Number",           result[i].TAIL_NUMBER,
								            				"i_Flight_Number",         result[i].FLIGHT_NUMBER,
								                            "i_Control_Number",        result[i].CONTROL_NUMBER,
								                            "i_Schedule_Date",         moment(result[i].SCHEDULE_DATE).format('YYYY-MM-DD'),
									                        "i_Scheduled_From",        result[i].SCHEDULED_FROM,
									                        "i_Scheduled_To",          result[i].SCHEDULED_TO,
									                        "i_Scheduled_Off_Block",   offBlock,
									                        "i_Scheduled_On_Block",    onBlock,
								            				"i_Actual_From",           result[i].ACTUAL_FROM,
								            				"i_Actual_To",             result[i].ACTUAL_TO,
								                            "i_Actual_Date",           moment(result[i].ACTUAL_DATE).format('YYYY-MM-DD'),
								                            "i_Actual_Off_Block",      WingsUtil.IsNull(result[i].ACTUAL_OFF_BLOCK)?'': moment(result[i].ACTUAL_OFF_BLOCK).format('HHmm'),
								                            "i_Actual_Take_Off",       WingsUtil.IsNull(result[i].ACTUAL_TAKE_OFF)?'': moment(result[i].ACTUAL_TAKE_OFF).format('HHmm'),
								                            "i_Actual_Landing",        WingsUtil.IsNull(result[i].ACTUAL_LANDING)?'': moment(result[i].ACTUAL_LANDING).format('HHmm'),
								                            "i_Actual_On_Block",       WingsUtil.IsNull(result[i].ACTUAL_ON_BLOCK)?'': moment(result[i].ACTUAL_ON_BLOCK).format('HHmm'),
								                            "i_Low_Visibility_Status", result[i].LOW_VISIBILITY_STATUS,								            				
								                            "i_Reduced_Visibility_Flag", '',
								            				"i_Air_Turnback_Flag",     result[i].DIVERSION,
								                            "i_Internal_Comment",      result[i].INTERNAL_COMMENT,
								            				"i_Delay_Reasons",         result[i].DELAY_REASON,
								            				"i_Delay_Times",           result[i].DELAY_TIME,
								            				"i_Flex_Field1",           result[i].Flex_Data_1,
								            				"i_Flex_Field2",           result[i].Flex_Data_2,
								            				"i_Flex_Field3",           result[i].Flex_Data_3,
								            				"i_Flex_Field4",           result[i].Flex_Data_4,
								            				"i_Flex_Field5",           result[i].Flex_Data_5,
								            				"i_Flex_Field6",           result[i].Flex_Data_6,
								            				"i_Flex_Field7",           result[i].Flex_Data_7,
								            				"i_Flex_Field8",           result[i].Flex_Data_8,
								            				"i_Flex_Field9",           result[i].Flex_Data_9,
								            				"i_Flex_Field10",          result[i].Flex_Data_10,
								            				"o_Data",                  '');
							var obj = sql.queryObject();
							builders.push(obj);
							var sql = new StoredFuncProcBuilder("Mb_Apps.Do_Flight", 
									            				"i_Div_No",                      result[i].DIV_NO,
									            				"i_Action",                      'ACCEPT',
									                            "i_Flight_Id",                   result[i].ID,
									            				"i_Mobile_Flight_Id",            result[i].MOBILE_RECORD_ID,
									            				"i_Accept_Date",                 result[i].ACCEPT_DATE,
									                            "i_Accepted_By_Employee_Number", result[i].ACCEPTED_BY_EMPLOYEE_NUMBER,
									                            "o_Data",                        '');
							var obj = sql.queryObject();
							builders.push(obj);
            		} else if (result[i].STATUS == 'COMPLETED') {
            			var sql = new StoredFuncProcBuilder("Mb_Apps.Do_Flight", 
								            				"i_Div_No",                result[i].DIV_NO,
								            				"i_Action",                'MODIFY',
								            				"i_Flight_Id",             result[i].ID,
								            				"i_Mobile_Flight_Id",      result[i].MOBILE_RECORD_ID,
								                            "i_Tail_Number",           result[i].TAIL_NUMBER,
								            				"i_Flight_Number",         result[i].FLIGHT_NUMBER,
								                            "i_Control_Number",        result[i].CONTROL_NUMBER,
								                            "i_Schedule_Date",         moment(result[i].SCHEDULE_DATE).format('YYYY-MM-DD'),
									                        "i_Scheduled_From",        result[i].SCHEDULED_FROM,
									                        "i_Scheduled_To",          result[i].SCHEDULED_TO,
									                        "i_Scheduled_Off_Block",   offBlock,
									                        "i_Scheduled_On_Block",    onBlock,
								            				"i_Actual_From",           result[i].ACTUAL_FROM,
								            				"i_Actual_To",             result[i].ACTUAL_TO,
								                            "i_Actual_Date",           moment(result[i].ACTUAL_DATE).format('YYYY-MM-DD'),
								                            "i_Actual_Off_Block",      WingsUtil.IsNull(result[i].ACTUAL_OFF_BLOCK)?'': moment(result[i].ACTUAL_OFF_BLOCK).format('HHmm'),
								                            "i_Actual_Take_Off",       WingsUtil.IsNull(result[i].ACTUAL_TAKE_OFF)?'': moment(result[i].ACTUAL_TAKE_OFF).format('HHmm'),
								                            "i_Actual_Landing",        WingsUtil.IsNull(result[i].ACTUAL_LANDING)?'': moment(result[i].ACTUAL_LANDING).format('HHmm'),
								                            "i_Actual_On_Block",       WingsUtil.IsNull(result[i].ACTUAL_ON_BLOCK)?'': moment(result[i].ACTUAL_ON_BLOCK).format('HHmm'),
								                            "i_Low_Visibility_Status", result[i].LOW_VISIBILITY_STATUS,								            				
								                            "i_Reduced_Visibility_Flag", '',
								            				"i_Air_Turnback_Flag",     result[i].DIVERSION,
								                            "i_Internal_Comment",      result[i].INTERNAL_COMMENT,
								            				"i_Delay_Reasons",         result[i].DELAY_REASON,
								            				"i_Delay_Times",           result[i].DELAY_TIME,
								            				"i_Flex_Field1",           result[i].Flex_Data_1,
								            				"i_Flex_Field2",           result[i].Flex_Data_2,
								            				"i_Flex_Field3",           result[i].Flex_Data_3,
								            				"i_Flex_Field4",           result[i].Flex_Data_4,
								            				"i_Flex_Field5",           result[i].Flex_Data_5,
								            				"i_Flex_Field6",           result[i].Flex_Data_6,
								            				"i_Flex_Field7",           result[i].Flex_Data_7,
								            				"i_Flex_Field8",           result[i].Flex_Data_8,
								            				"i_Flex_Field9",           result[i].Flex_Data_9,
								            				"i_Flex_Field10",          result[i].Flex_Data_10,
								            				"o_Data",                  '');
							var obj = sql.queryObject();
							builders.push(obj);
							var sql = new StoredFuncProcBuilder("Mb_Apps.Do_Flight", 
									            				"i_Div_No",                      result[i].DIV_NO,
									            				"i_Action",                      'CLOSE',
									                            "i_Flight_Id",                   result[i].ID,
									            				"i_Mobile_Flight_Id",            result[i].MOBILE_RECORD_ID,
									                            "i_Arrival_Fuel",                result[i].Arrival,
									            				"i_Close_Date",                  result[i].CLOSE_DATE,
									                            "i_Closed_By_Employee_Number",   result[i].CLOSED_BY_EMPLOYEE_NUMBER,
									                            "o_Data",                        '');
							var obj = sql.queryObject();
							builders.push(obj);
            		} else if (result[i].STATUS == 'CANCELLED') {
            			var sql = new StoredFuncProcBuilder("Mb_Apps.Do_Flight", 
								            				"i_Div_No",                result[i].DIV_NO,
								            				"i_Action",                'MODIFY',
								            				"i_Flight_Id",             result[i].ID,
								            				"i_Mobile_Flight_Id",      result[i].MOBILE_RECORD_ID,
								                            "i_Tail_Number",           result[i].TAIL_NUMBER,
								            				"i_Flight_Number",         result[i].FLIGHT_NUMBER,
								                            "i_Control_Number",        result[i].CONTROL_NUMBER,
								                            "i_Schedule_Date",         moment(result[i].SCHEDULE_DATE).format('YYYY-MM-DD'),
									                        "i_Scheduled_From",        result[i].SCHEDULED_FROM,
									                        "i_Scheduled_To",          result[i].SCHEDULED_TO,
									                        "i_Scheduled_Off_Block",   offBlock,
									                        "i_Scheduled_On_Block",    onBlock,
								            				"i_Actual_From",           result[i].ACTUAL_FROM,
								            				"i_Actual_To",             result[i].ACTUAL_TO,
								                            "i_Actual_Date",           moment(result[i].ACTUAL_DATE).format('YYYY-MM-DD'),
								                            "i_Actual_Off_Block",      WingsUtil.IsNull(result[i].ACTUAL_OFF_BLOCK)?'': moment(result[i].ACTUAL_OFF_BLOCK).format('HHmm'),
								                            "i_Actual_Take_Off",       WingsUtil.IsNull(result[i].ACTUAL_TAKE_OFF)?'': moment(result[i].ACTUAL_TAKE_OFF).format('HHmm'),
								                            "i_Actual_Landing",        WingsUtil.IsNull(result[i].ACTUAL_LANDING)?'': moment(result[i].ACTUAL_LANDING).format('HHmm'),
								                            "i_Actual_On_Block",       WingsUtil.IsNull(result[i].ACTUAL_ON_BLOCK)?'': moment(result[i].ACTUAL_ON_BLOCK).format('HHmm'),
								                            "i_Low_Visibility_Status", result[i].LOW_VISIBILITY_STATUS,								            				
								                            "i_Reduced_Visibility_Flag", '',
								            				"i_Air_Turnback_Flag",     result[i].DIVERSION,
								                            "i_Internal_Comment",      result[i].INTERNAL_COMMENT,
								            				"i_Delay_Reasons",         result[i].DELAY_REASON,
								            				"i_Delay_Times",           result[i].DELAY_TIME,
								            				"i_Flex_Field1",           result[i].Flex_Data_1,
								            				"i_Flex_Field2",           result[i].Flex_Data_2,
								            				"i_Flex_Field3",           result[i].Flex_Data_3,
								            				"i_Flex_Field4",           result[i].Flex_Data_4,
								            				"i_Flex_Field5",           result[i].Flex_Data_5,
								            				"i_Flex_Field6",           result[i].Flex_Data_6,
								            				"i_Flex_Field7",           result[i].Flex_Data_7,
								            				"i_Flex_Field8",           result[i].Flex_Data_8,
								            				"i_Flex_Field9",           result[i].Flex_Data_9,
								            				"i_Flex_Field10",          result[i].Flex_Data_10,
								            				"o_Data",                  '');
						var obj = sql.queryObject();
						builders.push(obj);
						var sql = new StoredFuncProcBuilder("Mb_Apps.Do_Flight", 
								            				"i_Div_No",                      result[i].DIV_NO,
								            				"i_Action",                      'CANCEL',
								                            "i_Flight_Id",                   result[i].ID,
								            				"i_Mobile_Flight_Id",            result[i].MOBILE_RECORD_ID,
								            				"i_Cancel_Date",                 result[i].CANCEL_DATE,
								                            "i_Canceled_By_Employee_Number", result[i].CANCELED_BY_EMPLOYEE_NUMBER,
								                            "o_Data",                        '');
						var obj = sql.queryObject();
						builders.push(obj);
						}
            	}
            	return deferred.resolve(builders);
            }, function (error) {
                WingsDialogService.error(JSON.stringify(error));
                console.log(JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };
        function getFlightInspection () {
            var deferred = $q.defer();
            var sqlInspection = " Select *                              " +
                                "   From Mm_Flight_Inspections          " +
                                "  Where Div_No    = ?                  " +
                                "    And Mobile_Record_Status = 'READY' ";
            WingsTransactionDBService.executeSql(sqlInspection,[$rootScope.globals.currentUser.divNo]).then(function (result) {
            	var builders = [];
            	for (var i = 0;i<result.length;i++) {
            		var sql = new StoredFuncProcBuilder("Mb_Apps.Do_Flight", 
							            				"i_Div_No",                result[i].DIV_NO,
							            				"i_Action",                'INSPECT',
							            				"i_Flight_Id",             result[i].FLIGHT_ID,
							            				"i_Mobile_Record_Id",      result[i].MOBILE_RECORD_ID,
							            				"i_Inspection_Type",       result[i].INSPECTION_TYPE,
							            				"i_Inspection_Date",       moment(result[i].INSPECTION_DATE).format('YYYY-MM-DD HH:mm'),
							            				"i_Inspector_Number",      result[i].INSPECTOR_NUMBER,
							            				"o_Data",                  '');
            		var obj = sql.queryObject();
               	    builders.push(obj);
            	}
            	return deferred.resolve(builders);
            }, function (error) {
                WingsDialogService.error(JSON.stringify(error));
                console.log(JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };
        
        function getFlightConsumption () {
            var deferred = $q.defer();
            var sqlConsumption = " Select *                              " +
                                 "   From Mm_Flight_Consumptions         " +
                                 "  Where Div_No    = ?                  " +
                                 "    And Mobile_Record_Status = 'READY' ";

            WingsTransactionDBService.executeSql(sqlConsumption,[$rootScope.globals.currentUser.divNo]).then(function (result){
            	var builders = [];
            	for (var i = 0;i<result.length;i++) {
            		var sql = new StoredFuncProcBuilder("Mb_Apps.Do_Flight", 
							            				"i_Div_No",                result[i].DIV_NO,
							            				"i_Action",                'CONSUME',
							            				"i_Flight_Id",             result[i].FLIGHT_ID,
							            				"i_Mobile_Record_Id",      result[i].MOBILE_RECORD_ID,
							            				"i_Consumption_Type", 	   result[i].CONSUMPTION_TYPE,
							            				"i_Arrival",               result[i].ARRIVAL,
							            				"i_Added",                 result[i].ADDED,
							            				"i_Remaining",             result[i].REMAINING,
							            				"i_Departure",             result[i].DEPATURE,
							            				"i_Density",               result[i].DENSITY,
							            				"i_Vendor_Number",         result[i].VENDOR_NUMBER,
							            				"o_Data",                  '');
            		var obj = sql.queryObject();
               	    builders.push(obj);
            	}
                return deferred.resolve(builders);
            },function (error) {
                WingsDialogService.error(JSON.stringify(error));
                console.log(JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };

        function getFlightCrews () {
            var deferred = $q.defer();
            var sqlCrew = " Select *                              " +
                          "   From Mm_Flight_Crews                " +
                          "  Where Div_No    = ?                  " +
                          "    And Mobile_Record_Status = 'READY' ";

            WingsTransactionDBService.executeSql(sqlCrew,[$rootScope.globals.currentUser.divNo]).then(function (result) {
            	var builders = [];
            	for (var i = 0;i<result.length;i++) {
            		var sql = new StoredFuncProcBuilder("Mb_Apps.Do_Flight", 
							            				"i_Div_No",                result[i].DIV_NO,
							            				"i_Action",                'CREW',
							            				"i_Flight_Id",             result[i].FLIGHT_ID,
							            				"i_Mobile_Record_Id",      result[i].MOBILE_RECORD_ID,
							            				"i_Crew_Type",             result[i].CREW_TYPE,
							            				"i_Employee_Number",       result[i].EMPLOYEE_NUMBER,
							            				"i_Duty_Start_Date",       !WingsUtil.IsNull(result[i].DUTY_START_DATE)?moment(result[i].DUTY_START_DATE).format('YYYY-MM-DD HH:mm'):'',
							            				"i_Duty_Finish_Date",      !WingsUtil.IsNull(result[i].DUTY_FINISH_DATE)?moment(result[i].DUTY_FINISH_DATE).format('YYYY-MM-DD HH:mm'):'',
							            				"o_Data",                  '');
            		var obj = sql.queryObject();
               	    builders.push(obj);
            	}
            	return deferred.resolve(builders);
            }, function (error) {
                WingsDialogService.error(JSON.stringify(error));
                console.log(JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };

        function getFlightFormData (id) {
            var deferred = $q.defer();
            var sqlFormData = "Select a.COLUMN_SEQUENCE,                       " +
                              "       (Select Data from gn_Form_Data as b where b.Parent = a.form_Id and b.Column_Id=a.Column_Id and b.Parent_Id = ?) VALUE "+
                              "  From Gn_Form_Columns as a                     " +
                              " Where a.Active  = 'Y'                          " +
                              "   And a.Div_No  = ?                            " +
                              "   And a.Form_Id = 'MM_FLIGHTS'                 " +
                              " Order By Column_Sequence asc;                  ";
            WingsTransactionDBService.executeSql(sqlFormData,[id,$rootScope.globals.currentUser.divNo]).then(function (result){
                return deferred.resolve(result);
            },function (error) {
                WingsDialogService.error(JSON.stringify(error));
                console.log(JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };

        //    PUSH DEFECT    //
        function getDefects () {
            var deferred = $q.defer();
            var sqlDefect =  "Select a.*,                                                                         " +
				            "       group_concat(ifnull(b.OFF_COMPONENT_NUMBER,''),';') OFF_COMPONENT_NUMBER,     " +
				            "       group_concat(ifnull(b.OFF_SERIAL_NUMBER,''),';') OFF_SERIAL_NUMBER,           " +
				            "       group_concat(ifnull(b.ON_COMPONENT_NUMBER,''),';') ON_COMPONENT_NUMBER,       " +
				            "       group_concat(ifnull(b.ON_SERIAL_NUMBER,''),';') ON_SERIAL_NUMBER,  			  " +
				            "       group_concat(b.POSITION,';') POSITION                              			  " +
				            "  From Mm_Discrepancies a                                                 			  " +
				            "       LEFT OUTER JOIN Mm_Component_Transactions b                        			  " +
				            "    On b.Discrepancy_Id       = a.Mobile_Record_Id                        			  " +
				            " Where a.Div_No               = ?                                         			  " +
				            "   And a.Mobile_Record_Status = 'READY'                                   			  " +
				            "GROUP BY a.Mobile_Record_Id                                               			  " ;
            
            WingsTransactionDBService.executeSql(sqlDefect,[$rootScope.globals.currentUser.divNo]).then(function (result) {
                if (result.length < 1) {
                    return deferred.resolve([]);
                }
                var builders = []; 
                for (var i = 0; i<result.length; i++) {
                	 var sql = new StoredFuncProcBuilder("Mb_Apps.Do_Discrepancy",  
                			                             "i_Div_No",                        result[i].DIV_NO,
							                             "i_Discrepancy_Type",              result[i].DISCREPANCY_TYPE,
							                             "i_Field_List",                    'ATA_CODE,DISCREPANCY_TYPE,STATUS,REPORT_DATE,REPORTED_BY_EMPLOYEE_NUMBER,DISCREPANCY,CORRECTIVE_ACTION,RECTIFICATION_DATE,RECTIFIED_BY_EMPLOYEE_NUMBER,CATEGORY,REPORTED_STATION,RECTIFIED_STATION,HOLD_BY_EMPLOYEE_NUMBER,HOLD_STATION,INSPECTED_BY_EMPLOYEE_NUMBER,INSPECTED_STATION,INSPECTED_DATE,CONTROL_NUMBER,AIRCRAFT_ID',
							                             "i_Mobile_Discrepancy_Id",         result[i].MOBILE_RECORD_ID,
							                             "i_Flight_Id",                     Number(result[i].FLIGHT_TYPE),
							                             "i_Discrepancy_Id",                result[i].ID,
							                             "i_Ata_Code",                      result[i].ATA_CODE,
							                             "i_Status",                        result[i].STATUS,
							                             "i_Report_Date",                   WingsUtil.IsNull(result[i].REPORT_DATE)?'':moment(result[i].REPORT_DATE).format('YYYY-MM-DD'),
							                             "i_Reported_By_Employee_Number",   WingsUtil.IsNull(result[i].REPORTED_BY_EMPLOYEE_NUMBER)?'':Number(result[i].REPORTED_BY_EMPLOYEE_NUMBER),
							                             "i_Discrepancy",                   result[i].DISCREPANCY,
							                             "i_Corrective_Action",             result[i].CORRECTIVE_ACTION,
							                             "i_Tail_Number",                   result[i].TAIL_NUMBER,
							                             "i_Rectification_Date",            WingsUtil.IsNull(result[i].RECTIFICATION_DATE)?'':moment(result[i].RECTIFICATION_DATE).format('YYYY-MM-DD'),
							                             "i_Rectified_By_Employee_Number",  WingsUtil.IsNull(result[i].RECTIFIED_BY_EMPLOYEE_NUMBER)?'':Number(result[i].RECTIFIED_BY_EMPLOYEE_NUMBER),
							                             "i_Hold_Document_Number",          result[i].HOLD_DOCUMENT_NUMBER,
							                             "i_Hold_Task_Number",              result[i].HOLD_TASK_NUMBER,
							                             "i_Category",                      result[i].CATEGORY,
							                             "i_Reported_Station",              result[i].REPORTED_STATION,
							                             "i_Rectified_Station",             result[i].RECTIFIED_STATION,
							                             "i_Hold_By_Employee_Number",       WingsUtil.IsNull(result[i].HOLD_BY_EMPLOYEE_NUMBER)?'':Number(result[i].HOLD_BY_EMPLOYEE_NUMBER),
							                             "i_Inspected_By_Employee_Number",  WingsUtil.IsNull(result[i].CORRECTIVE_ACTION)?'':Number(result[i].CORRECTIVE_ACTION),
							                             "i_Inspected_Station",             result[i].INSPECTED_STATION,
							                             "i_Inspected_Date",                WingsUtil.IsNull(result[i].INSPECTED_DATE)?'':moment(result[i].INSPECTED_DATE).format('YYYY-MM-DD'),
							                             "i_Control_Number",                result[i].LOG_NUMBER,
							                             "i_Off_Component_Numbers",         result[i].OFF_COMPONENT_NUMBER,
							                             "i_Off_Serial_Numbers",            result[i].OFF_SERIAL_NUMBER,
							                             "i_On_Component_Numbers",          result[i].ON_COMPONENT_NUMBER,
							                             "i_On_Serial_Numbers",             result[i].ON_SERIAL_NUMBER,
							                             "i_Positions",                     result[i].POSITION,
							                             "o_Discrepancy_Id",                '',
							                             "o_Discrepancy_Number",            '',
							                             "o_Data",                          '');
                	
                	
                	
                	
                	 var obj = sql.queryObject();
                	 builders.push(obj);
                }
                return deferred.resolve(builders);
		        },function (error) {
		        	console.log(error); 
		        	return deferred.reject(JSON.stringify(error));
		        });
		    return deferred.promise;
        };
   
    function getPackages () {
        var deferred = $q.defer();
        var sqlPackage = " Select *                              " +
                         "   From Mm_Packages                    " +
                         "  Where Div_No               = ?       " +
                         "    And Mobile_Record_Status = 'READY' ";

        WingsTransactionDBService.executeSql(sqlPackage,[$rootScope.globals.currentUser.divNo]).then(function (result){
        	if (result.length > 0) { 
        		var builders = [];
        		for (var i = 0;i<result.length;i++) {
	        		if (WingsUtil.IsNull(result[i].ID)) {
	        			var sql = new StoredFuncProcBuilder("Mb_Apps.Do_Package", 
								            				"i_Div_No",                      result[i].DIV_NO,
								            				"i_Action",                      'CREATE',
								            				"i_Mobile_Package_Id",           result[i].MOBILE_RECORD_ID,
								            				"i_Tail_Number",                 result[i].TAIL_NUMBER,
								            				"i_Released_By_Employee_Number", result[i].RELEASED_BY_EMPLOYEE_NUMBER,
								            				"i_Work_Order_Station", 	     result[i].WORK_ORDER_STATION,
								            				"i_Start_Date ", 	             result[i].ACTUAL_START_DATE,
								            				"i_Close_Date",                  result[i].CLOSE_DATE,
								            				"i_Closed_By_Employee_Number",   result[i].CLOSED_BY_EMPLOYEE_NUMBER,
								            				"o_Data",                        '');
	        		} else if (!WingsUtil.IsNull(result[i].ID)) {
	        			var sql = new StoredFuncProcBuilder("Mb_Apps.Do_Package", 
								            				"i_Div_No",                     result[i].DIV_NO,
								            				"i_Action",                     'PERFORM',
								            				"i_Mobile_Package_Id",          result[i].MOBILE_RECORD_ID,
								            				"i_Package_Id",                 result[i].ID,
								            				"i_Start_Date ", 	            result[i].ACTUAL_START_DATE,
								            				"i_Close_Date",                 result[i].CLOSE_DATE,
								            				"i_Closed_By_Employee_Number",  result[i].CLOSED_BY_EMPLOYEE_NUMBER,
								            				"o_Data",                       '');
	        		}
	        		var obj = sql.queryObject();
	           	    builders.push(obj);
	        	}
                return deferred.resolve(builders);
        	} else {
                return deferred.resolve([]);
        	}
        },function (error) {
            WingsDialogService.error(JSON.stringify(error));
            console.log(JSON.stringify(error));
            return deferred.reject("Get Packages-Error : " +JSON.stringify(error));
        });
        return deferred.promise;
    };
  //Go to Server //
    $scope.pushAllRecords = function () {
        var deferred = $q.defer();
    	try {
    		var promises         = [];
    		promises.push(getFlights());
    		promises.push(getFlightInspection());
    		promises.push(getFlightConsumption());
    		promises.push(getFlightCrews());
    		promises.push(getDefects());
    		promises.push(getPackages());
    		console.log(moment().format('DD-MM-YYYY HH:mm:ss'));
    		$q.all(promises).then(function(res) {
        		console.log(moment().format('DD-MM-YYYY HH:mm:ss'));
    			var builders = [];
    			builders = builders.concat(res[0]);
    			builders = builders.concat(res[1]);
    			builders = builders.concat(res[2]);
    			builders = builders.concat(res[3]);
    			builders = builders.concat(res[4]);
    			builders = builders.concat(res[5]);
    			if (builders.length > 0) {
    				var str = JSON.stringify(builders);
    				WingsRemoteDbService.executeFunction(str).then (function (response) {
    					try {
    						var promiseResponse = [];
	    					for (var i = 0;i<response.length;i++) {
	    						var parsedResponse = JSON.parse(response[i]);
	    						var errorText = ""
	    						if (!WingsUtil.IsNull(parsedResponse.result)) {
	    							var data = JSON.parse(parsedResponse.result.o_Data);
	    						} else {
	    							errorText = 'Connection Problem.'+parsedResponse.message;
	    							continue;
	    						}
	    						var res = {
					        		isSuccess : parsedResponse.isSuccess,
					        		errorText : parsedResponse.errorText,
					        		serverId  : data.SERVER_RECORD_ID,
					        		tableName : data.MOBILE_TABLE_NAME,
					        		status    : (parsedResponse.isSuccess == 'true' && parsedResponse.errorText == '')?'LOADED':'REJECTED',
					        		mobileId  : data.MOBILE_RECORD_ID
					        	};
	    						promiseResponse.push(evaluateResponse(res));
	    					}
	    					$q.all(promiseResponse).then(function(res) {
	    						sy.PushAttachments();
	    					},function (error) {
	        					console.log("ERROR:"+error); 
	        					return deferred.reject(error);
	        				});
	    					if (errorText != "") {
	    			            return deferred.reject(errorText);
	    					}
	    					return deferred.resolve();
    					} catch (e) {
    			            return deferred.reject(e);
    					}
    				},function (error) {
    					console.log("ERROR:"+error); 
    					return deferred.reject([]);
    				});
    			} else {
                    return deferred.resolve([]);
    			}
    		});
    	} catch (e) {
    		console.log(e);
    	}
        return deferred.promise;
    };
    function evaluateResponse (response) {
        var deferred  = $q.defer();
		var sql = "Update " +response.tableName+
		          "   Set Server_Feedback         = ?, " +
		          "       Server_Transaction_Date = ?, " +
		          "       Mobile_Record_Status    = ?, " +
		          "       Id                      = ?  " +
		          " Where Mobile_Record_Id        = ?  " +
		          "   And Mobile_Record_Status    = 'READY' ";
		var parameters = [
			response.errorText,
			moment().format('YYYY-MM-DD HH:mm'),
			response.status,
			response.serverId,
			response.mobileId
		];
		var sqlUpdateAttachment = "Update Gn_Images            " +
				                  "   Set Parent_Id = ?        " +
				                  " where Parent    = ?        " +
				                  "   And Mobile_Parent_Id = ? " ;
        WingsTransactionDBService.executeSql(sqlUpdateAttachment,[response.serverId,response.tableName,response.mobileId]);
        WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
            return deferred.resolve("GOHEAD");
        },function(error) {
            console.log("PROMISES  - ERROR"+JSON.stringify(error));
            return deferred.reject(JSON.stringify(error));
        });
        return deferred.promise;
    };

        $scope.openPopover = function($event, msg) {
            console.log(msg);
            $scope.responseMessage = msg
            $scope.popover.show($event);
            $event.stopPropagation();
        };
        $ionicPopover.fromTemplateUrl('tooltip.html', {
            scope: $scope
          }).then(function(popover) {
            $scope.popover = popover;
          });
     
    } 
])