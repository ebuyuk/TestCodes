angular.module('WingsMobileStarter').controller('MM_M052', [
    '$scope',
    '$state',
    'WingsRemoteDbService',
    'WingsUtil',
    'WingsTransactionDBService',
    'WingsDialogService',
    '$ionicSlideBoxDelegate',
    '$ionicHistory',
    '$ionicTabsDelegate',
    'WingsPouchDbSetupService',
    '$ionicBackdrop',
    '$ionicPopover',
    '$timeout',
    function($scope,$state,WingsRemoteDbService,WingsUtil,WingsTransactionDBService,WingsDialogService,$ionicSlideBoxDelegate,$ionicHistory,$ionicTabsDelegate,WingsPouchDbSetupService,$ionicBackdrop,$ionicPopover) {
        console.log("MM_M052");
        $scope.aircraftsLov = [];
        $scope.selectedLocation = $rootScope.globals.deviceInformation.station;
        var defaultTailNumber   = $rootScope.globals.deviceInformation.tailNumber;
        
        $scope.showDetail = function (tailNumber) {
            $rootScope.MM_0052_defaultTailNumber = tailNumber.TAIL_NUMBER;
            $rootScope.MM_0052_defaultStation = $scope.selectedLocation
            $state.go('app.MM_0052_TailStatus');
        };

        if (!WingsUtil.IsNull($scope.selectedLocation) && !WingsUtil.IsNull(defaultTailNumber)) {
        	 $scope.showDetail(defaultTailNumber);
     	}
        $scope.refresh = function () {
        	pullAircraftStatus().then(function (dataIn) {
        		$scope.getAircraftStatus ();
        	}, function (error) {
				return deferred.reject(JSON.stringify(error));
			});
        } 
        $scope.refresh();
        var removeListener = $rootScope.$on('onPackageCreate', function(){
      	    $timeout(function() {
      	    	$scope.getAircraftStatus();
      	    	pullAircraftStatus();
            },100);
        });
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams, error) {
        	if (toState.name == 'app.home') {
                removeListener();
        	} 
        });
        $scope.getAircraftStatus = function () {
        	//$scope.statusByStation = [];
        	if (WingsUtil.IsNull($scope.selectedLocation)) {
	            var sql = "Select z.Tail_Number TAIL_NUMBER,                                                                                                                                             " +
	            		  "       z.From_Flight_Number FROM_FLIGHT_NUMBER,                                                                                                                                      " +
	            		  "       z.From_Station FROM_STATION,                                                                                                                                            " +
	            		  "		  z.Arrival_Time ARRIVAL_TIME,                                                                                                                                            " +
	            		  "       z.To_Flight_Number TO_FLIGHT_NUMBER,                                                                                                                                        " +
	            		  "       z.To_Station TO_STATION,                                                                                                                                              " +
	            		  "       z.Departure_Time DEPARTURE_TIME,                                                                                                                                          " +
	            		  "       z.Ground_Time GROUND_TIME,                                                                                                                                             " +
	            		  "       z.Aircraft_Color_Code AIRCRAFT_COLOR_CODE," +
	            		  "       Case When z.Departure_Time < datetime('now','+10 hour') Then 'RED'                                                                        " +
				          "            Else 'GREY'                                                                                                                          " +
				          "        End FLIGHT_COLOR_CODE,                                                                                                                   " +
				          "        (Select Case When Min(Case When a.Status = 'OPEN' Then date('now','-9999 day') Else date(a.Due_Date) End ) < datetime ('now')           Then 'RED'     " +
				          "                     When Min(Case When a.Status = 'OPEN' Then date('now','-9999 day') Else date(a.Due_Date) End) < datetime ('now','+2 hour')  Then 'ORANGE'  " + 
				          "                     When Min(Case When a.Status = 'OPEN' Then date('now','-9999 day') Else date(a.Due_Date) End) < datetime ('now','+10 hour') Then 'YELLOW'  " + 
				          "                     Else 'GREY'                                                                                                                 " +
				          "                End DEFECT_COLOR_CODE                                                                                                            " +
                          "           From Mm_Discrepancies   a                                                                                                             " +
			              "          Where a.Div_No = z.Div_No                                                                                                              " +
			              "            And a.Tail_Number = z.Tail_Number                                                                                                    " +
			              "            And a.Status in ('OPEN', 'DEFERRED')                                                                                                 " +
			              "            And (a.Pirep_Flag = 'Y' Or a.Marep_Flag = 'Y')) DEFECT_COLOR_CODE,                                                                   " +
			              "        (Select Min(b.Planned_Start_Date)                                                                                                        " +
		                  "           From Mm_Packages b                                                                                                                    " +
		                  "          Where b.Div_No = z.Div_No                                                                                                              " +
		                  "            And b.Tail_Number = z.Tail_Number                                                                                                    " +
		                  "            And b.Status = 'OPEN'                                                                                                                " +
		                  "            And ifnull(b.Tracking_Status, 'X') != 'COMPLETED'                                                                                    " +
		                  "            And b.Planned_Start_Date Between date('now','-3 day') And date('now','+10 day')                                                      " +
		                  "            And b.Planned_Start_Date Is Not Null) PACKAGE_START_DATE,                                                                            " +
		                  "        (Select Min(b.Planned_Date)                                                                                                              " +
		                  "           From Mm_Discrepancies     b                                                                                                           " +
		                  "          Where b.Div_No = z.Div_No                                                                                                              " +
		                  "            And b.Tail_Number = z.Tail_Number                                                                                                    " +
		                  "            And b.Status = 'OPEN'                                                                                                                " +
		                  "            And b.Planned_Date Between date('now','-3 day') And date('now','+10 day')                                                            " +
		                  "            And b.Planned_Date Is Not Null                                                                                                       " +
		                  "            And b.Order_Flag = 'Y') ORDER_START_DATE                                                                                             " +
	            		  "  From (                                                                                                                                                          " +
	            	      "Select a.Div_No," +
	            	      "       a.Tail_Number,                                                                                                                                             " +
			              "       a.From_Flight_Number,                                                                                                                                      " +
			              "       a.Ground_Station FROM_STATION,                                                                                                                             " +
			              "       a.Arrival_Time,                                                                                                                                            " +
			              "       a.To_Flight_Number,                                                                                                                                        " +
			              "       a.To_Station,                                                                                                                                              " +
			              "       a.Departure_Time,                                                                                                                                          " +
			              "       Cast(Cast(round ((julianday(a.Departure_Time) - Max(julianday(a.Arrival_Time),julianday('now')) )*24*60)/60 as int) as char) ||'h '||                      " +
				          "       Cast(cast(round ((julianday(a.Departure_Time) - Max(julianday(a.Arrival_Time),julianday('now')) )*24*60)%60 as int) as char) ||'m' Ground_Time,            " +
				          "       'RED' Aircraft_Color_Code                                                                                                                                  " +
			              "  From Mm_Scheduled_Ground_Times a                                                                                                                                " +
			              " Where a.Div_No         = ?                                                                                                                                       " +
			              "   And julianday('now') Between julianday(a.Arrival_Time) And julianday(a.Departure_Time)                                                                         " +
			              "   And Not Exists (Select 1                                                                                                                                       " +
			              "                    From Mm_Flights x                                                                                                                             " +
			              "                    Where x.Div_No      = a.Div_No                                                                                                                " +
			              "                      And x.Tail_Number = a.Tail_Number                                                                                                           " +
			              "                      And julianday('now') Between julianday(x.Scheduled_Off_Block) and julianday(x.Scheduled_On_Block))                                          " +
			              " Union All                                                                                                                                                        " +
			              "Select b.Div_No," +
			              "       b.Tail_Number,                                                                                                                                             " +
			              "       b.Flight_Number  From_Flight_Number,                                                                                                                       " +
			              "       b.Scheduled_From From_Station,                                                                                                                             " +
			              "       b.Scheduled_Off_Block Arrival_Time,                                                                                                                        " +
			              "       b.Flight_Number To_Flight_Number,                                                                                                                          " +
			              "       b.Scheduled_To To_Station,                                                                                                                                 " +
			              "       b.Scheduled_On_Block Departure_Time,                                                                                                                       " +
			              "       Cast(Cast(round ((julianday(b.Scheduled_On_Block) - Max(julianday(b.Scheduled_Off_Block),julianday('now')) )*24*60)/60 as int) as char) ||'h '||           " +
				          "       Cast(cast(round ((julianday(b.Scheduled_On_Block) - Max(julianday(b.Scheduled_Off_Block),julianday('now')) )*24*60)%60 as int) as char) ||'m' Ground_Time, " +
				          "       'BLUE' Aircraft_Color_Code                                                                                                                                 " +
			              "  From Mm_Flights b                                                                                                                                               " +
			              " Where b.Div_No      = ?                                                                                                                                          " +
			              "   And julianday('now') > julianday(b.Scheduled_Off_Block)                                                                                                        " +
			              "   And julianday('now') < julianday(b.Scheduled_On_Block)                                                                                                         " +
			              " Union All                                                                                                                                                        " +
			              "Select c.Div_No," +
			              "       c.Tail_Number,                                                                                                                                             " +
			              "       c.Flight_Number From_Flight_Number,                                                                                                                        " +
			              "       c.Scheduled_From From_Station,                                                                                                                             " +
			              "       c.Scheduled_Off_Block Arrival_Time,                                                                                                                        " +
			              "       c.Flight_Number To_Flight_Number,                                                                                                                          " +
			              "       c.Scheduled_To To_Station,                                                                                                                                 " +
			              "       c.Scheduled_On_Block Departure_Time,                                                                                                                       " +
			              "       Cast(Cast(round ((julianday(c.Scheduled_On_Block) - Max(julianday(c.Scheduled_Off_Block),julianday('now')) )*24*60)/60 as int) as char) ||'h '||           " +
				          "       Cast(cast(round ((julianday(c.Scheduled_On_Block) - Max(julianday(c.Scheduled_Off_Block),julianday('now')) )*24*60)%60 as int) as char) ||'m' Ground_Time, " +
				          "       'BLUE' Aircraft_Color_Code                                                                                                                                 " +
			              "  From Mm_Scheduled_Flights c                                                                                                                                     " +
			              " Where c.Div_No      = ?                                                                                                                                          " +
			              "   And julianday('now') Between julianday(c.Scheduled_Off_Block) And julianday(c.Scheduled_On_Block)   ) z                                                        " +
			              "  Order By z.Departure_Time                                                                                                                                       " ;
	            var parameters = [$rootScope.globals.currentUser.divNo,$rootScope.globals.currentUser.divNo,$rootScope.globals.currentUser.divNo];
        	} else {
	            var sql = "Select c.Tail_Number TAIL_NUMBER,                                                                                                                              " +
				          "       c.From_Flight_Number FROM_FLIGHT_NUMBER,                                                                                                                " +
				          "       c.From_Station FROM_STATION,                                                                                                                            " +
				          "       c.Arrival_Time ARRIVAL_TIME,                                                                                                                            " +
				          "       c.To_Flight_Number TO_FLIGHT_NUMBER,                                                                                                                    " +
				          "       c.To_Station TO_STATION,                                                                                                                                " +
				          "       c.Departure_Time DEPARTURE_TIME,                                                                                                                        " +
				          "       Cast(Cast(round ((julianday(c.Departure_Time) - Max(julianday(c.Arrival_Time),julianday('now')) )*24*60)/60 as int) as char) ||'h '||                   " +
				          "       Cast(cast(round ((julianday(c.Departure_Time) - Max(julianday(c.Arrival_Time),julianday('now')) )*24*60)%60 as int) as char) ||'m' GROUND_TIME,         " +
				          "       Case When datetime(c.Departure_Time) > datetime('now','+10 hour') Then 'GREY'                                                                           " +
				          "            When datetime('now') Between datetime(c.Arrival_Time) And datetime(c.Departure_Time) Then 'RED'                                                    " +
				          "            Else 'BLUE'                                                                                                                                        " +
				          "        End AIRCRAFT_COLOR_CODE,                                                                                                                               " +
				          "       Case When c.Departure_Time < datetime('now','+10 hour') Then 'RED'                                                                                      " +
				          "            Else 'GREY'                                                                                                                                        " +
				          "        End FLIGHT_COLOR_CODE,                                                                                                                                 " +
				          "        (Select Case When Min(Case When a.Status = 'OPEN' Then date('now','-9999 day') Else date(a.Due_Date) End ) < datetime ('now')           Then 'RED'     " +
				          "                     When Min(Case When a.Status = 'OPEN' Then date('now','-9999 day') Else date(a.Due_Date) End) < datetime ('now','+2 hour')  Then 'ORANGE'  " + 
				          "                     When Min(Case When a.Status = 'OPEN' Then date('now','-9999 day') Else date(a.Due_Date) End) < datetime ('now','+10 hour') Then 'YELLOW'  " + 
				          "                     Else 'GREY'                                                                                                                 " +
				          "                End DEFECT_COLOR_CODE                                                                                                            " +
                          "           From Mm_Discrepancies   a                                                                                                             " +
			              "          Where a.Div_No = c.Div_No                                                                                                              " +
			              "            And a.Tail_Number = c.Tail_Number                                                                                                    " +
			              "            And a.Status in ('OPEN', 'DEFERRED')                                                                                                 " +
			              "            And (a.Pirep_Flag = 'Y' Or a.Marep_Flag = 'Y')) DEFECT_COLOR_CODE,                                                                   " +
			              "        (Select Min(b.Planned_Start_Date)                                                                                                        " +
		                  "           From Mm_Packages b                                                                                                                    " +
		                  "          Where b.Div_No = c.Div_No                                                                                                              " +
		                  "            And b.Tail_Number = c.Tail_Number                                                                                                    " +
		                  "            And b.Status = 'OPEN'                                                                                                                " +
		                  "            And ifnull(b.Tracking_Status, 'X') != 'COMPLETED'                                                                                    " +
		                  "            And b.Planned_Start_Date Between date('now','-3 day') And date('now','+10 day')                                                      " +
		                  "            And b.Planned_Start_Date Is Not Null) PACKAGE_START_DATE,                                                                            " +
		                  "        (Select Min(b.Planned_Date)                                                                                                              " +
		                  "           From Mm_Discrepancies     b                                                                                                           " +
		                  "          Where b.Div_No = c.Div_No                                                                                                              " +
		                  "            And b.Tail_Number = c.Tail_Number                                                                                                    " +
		                  "            And b.Status = 'OPEN'                                                                                                                " +
		                  "            And b.Planned_Date Between date('now','-3 day') And date('now','+10 day')                                                            " +
		                  "            And b.Planned_Date Is Not Null                                                                                                       " +
		                  "            And b.Order_Flag = 'Y') ORDER_START_DATE                                                                                             " +
				          "  From Mm_Scheduled_Ground_Times c                                                                                                               " +
				          " Where c.Div_No = ?                                                                                                                              " +
				          "   And c.Tail_Number ||'*' || c.Arrival_Time In (Select w.Tail_Number || '*' ||                                                                  " +
				          "                                                 Case When Min(First_Date) > datetime('now','+20 day') Then Min(datetime(First_Date,'-100 day')) " +
				          "                                                      Else Min(First_Date)                                                                       " +
				          "                                                  End Arrival_Time                                                                               " +
				          "                                            From (                                                                                               " +
				          "                                          select a.Tail_Number ,                                                                                 " +
				          "                                                 Case When a.Arrival_Time < datetime('now') Then datetime(a.Arrival_Time,'+100 day')             " +
				          "                                                      Else a.Arrival_Time                                                                        " +
				          "                                                  End First_Date                                                                                 " +
				          "                                            from Mm_Scheduled_Ground_Times a                                                                     " +
				          "                                           Where a.Div_No = ?                                                                                    " +
				          "                                             And a.Ground_Station = ?                                                                            " +
				          "                                             And datetime(a.Arrival_Time) < datetime('now','+10 hour')                                           " +
				          "                                             And datetime(a.Departure_Time) > datetime('now') ) w                                                " +
				          "                                           Group By w.Tail_Number)                                                                               " +
				          " Order By Case When Aircraft_Color_Code = 'RED' Then '1'||c.Departure_Time                                                                       " +
				          "            When Aircraft_Color_Code = 'BLUE' Then '1'||c.Departure_Time                                                                         " +
				          "            Else '3'||c.Departure_Time                                                                                                           " +
				          "        End                                                                                                                                      " ;
	            
	            var parameters = [$rootScope.globals.currentUser.divNo,$rootScope.globals.currentUser.divNo,$scope.selectedLocation];
        	}
            
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
				console.log('Read Local Exec: '+(moment().valueOf()-$scope.startDate));
            	var i = 0;
            	for (i in result) {
            		var checkStartDate = _.min([result[i].PACKAGE_START_DATE ,result[i].ORDER_START_DATE])
            		if (!WingsUtil.IsNull(result[i].ARRIVAL_TIME))
            			result[i].ARRIVAL_TIME = moment(result[i].ARRIVAL_TIME).format('HH:mm');
            		if (!WingsUtil.IsNull(result[i].DEPARTURE_TIME))
            			result[i].DEPARTURE_TIME = moment(result[i].DEPARTURE_TIME).format('HH:mm');
            		if (checkStartDate < moment("YYYY-MM-DD").add(1, 'days') ) {
            			result[i].PACKAGE_COLOR_CODE = 'RED';
            		} else {
            			result[i].PACKAGE_COLOR_CODE = 'GREY';
            		}
            	}
                if (result.length > 0) {
                	if (result.length%3 != 0)
                		result.push({});
                	if (result.length%3 != 0)
                		result.push({});
                    $scope.statusByStation = _.chunk(result, 3);
                }
				console.log('Use Local Exec: '+(moment().valueOf()-$scope.startDate));
                $ionicBackdrop.release();
                $scope.$broadcast('scroll.refreshComplete');
                return deferred.resolve("GOHEAD");
            }, function (error) {
            	$ionicBackdrop.release();
                WingsDialogService.error(JSON.stringify(error));
                return deferred.reject("lof-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        } 
        $scope.getAircraftStatus();
        function pullAircraftStatus () {
            $scope.startDate = moment().valueOf();

       	    var deferred = $q.defer();
       	    var lastDateSql = "Select Ifnull(Max(Datetime(Server_Transaction_Date)), Date('now', '-30 day')) statusLastDate From Mm_Scheduled_Ground_Times";        
            WingsTransactionDBService.executeSql(lastDateSql,[]).then(function (result) {
	            var sql = " Select a.Div_No,                                                     " +
			              "        a.From_Flight_Id,                                             " +
			              "        a.From_Station,                                               " +
			              "        a.Arrival_Time,                                               " +
			              "        a.To_Flight_Number,                                           " +
			              "        a.To_Station,                                                 " +
			              "        a.Departure_Time,                                             " +
			              "        a.Ground_Station,                                             " +
			              "        a.From_Flight_Number,                                         " +
			              "        b.Component_Number,                                           " +
			              "        Nvl(a.Dt_Modified,a.Dt_Created) Server_Transaction_Date,      " +
			              "        a.Id                                                          " +
			              "   From Mm_Scheduled_Ground_Times a,                                  " +
			              "        Mm_Components b                                               " +
			              "  Where a.Div_No = b.Div_No                                           " +
			              "    And a.Aircraft_Id = b.Id                                          " +
				          "    And Nvl(a.Dt_Modified,a.Dt_Created)    > to_date('"+result[0].statusLastDate+"','yyyy-mm-dd hh24:mi:ss') " +
			              "    And Nvl(a.arrival_time,a.ground_date) > sysdate-3                 ";
	            
		        var sqlArray = [{ queryStr: sql,  queryType: "READ" }];
				var sqlString = JSON.stringify(sqlArray);
				WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
					console.log('Remote Exec: '+(moment().valueOf()-$scope.startDate));
					var status = angular.fromJson(dataIn[0].rows);
					if (status.length > 0) {
						var sql = "INSERT OR REPLACE INTO MM_SCHEDULED_GROUND_TIMES (Div_No,                       " +
								  "                                                  Tail_Number,                  " +
					              "                                                  From_Flight_Id,               " +
					              "                                                  From_Station,                 " +
					              "                                                  Arrival_Time,                 " +
					              "                                                  To_Flight_Number,             " +
					              "                                                  To_Station,                   " +
					              "                                                  Departure_Time,               " +
					              "                                                  Ground_Station,               " +
					              "                                                  From_Flight_Number,           " +
					              "                                                  Id,                           " +
					              "                                                  Server_Transaction_Date)      " +
	                              "VALUES (?,?,?,?,?,?,?,?,?,?,?,?)                                                ";                    
						var i;
						var bindings = [];
						for (i in status) {
					        parameters = [status[i].div_no,
					                      status[i].component_number,
					                      status[i].from_flight_id,
					                      status[i].from_station,
					                      status[i].arrival_time,
					                      status[i].to_flight_number,
					                      status[i].to_station,
					                      status[i].departure_time,
					                      status[i].ground_station,
					                      status[i].from_flight_number,
					                      status[i].id,
					                      moment(status[i].server_transaction_date).format('YYYY-MM-DD HH:mm:ss')];                        
					        bindings.push(parameters);
						}
						WingsTransactionDBService.insertCollection(sql,bindings).then(function (result) {
							console.log('Insert Local Exec: '+(moment().valueOf()-$scope.startDate));
							var currentState = $state.current.name;
			                if (currentState == 'app.MM_M052') {
			                	$timeout(function() {
			                		$scope.refresh();
			                	}, 120000); 
			                }
							$rootScope.$emit('onAircraftStatusFinished');
							return deferred.resolve("GOHEAD");
						}, function (error) {
							console.log("Status-Error : " +JSON.stringify(error));
							return deferred.reject(JSON.stringify(error));
						});			
					} else {
						var currentState = $state.current.name;
						if (currentState == 'app.MM_M052') {
		                	$timeout(function() {
		                		$scope.refresh();
		                	}, 5000); 
			            }
						return deferred.resolve("GO-HEAD");
					}
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
	    
        function getLocations () {
            var sql = "Select * From Mm_Flight_Locations Where Div_No = ? And Service_Flag = 'Y' And Active = 'Y'";
            WingsTransactionDBService.executeSql(sql,[$rootScope.globals.currentUser.divNo]).then(function (result) {
                if (result.length > 0) {
                    $scope.locationsLov =  result;
                }
            }, function (error) {
				return deferred.reject(JSON.stringify(error));
			});
        };
        getLocations();
    }
])