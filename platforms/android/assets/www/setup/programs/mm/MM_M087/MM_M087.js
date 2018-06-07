angular.module('WingsMobileStarter').controller('MM_M087', [
	'$scope',
	'$cordovaBarcodeScanner',
	'WingsRemoteDbService',
	'$ionicPopup',
	'WingsUtil',
	'WingsDialogService',
	'WingsGlobalManager',
	'$ionicPopup',
	'$timeout',
	'sy',
	'$ionicModal',
    '$ionicHistory',
	'$ionicLoading',
	'$ionicPopover',
	'$stateParams',
	function($scope,$cordovaBarcodeScanner,WingsRemoteDbService,$ionicPopup,WingsUtil,WingsDialogService,WingsGlobalManager,$ionicPopup,$timeout,sy,$ionicModal,$ionicHistory,$ionicLoading,$ionicPopover,$stateParams) {
		$scope.searchCriteria = '';
		$scope.flights = [];
		$scope.aircraftsLov   = [];
		$scope.onModal = false;
		$scope.isSearchActive = false;
		$scope.flight = {
	        	tailNumber:'',
	        	logNumber:'',
	        	flightNumber:'',
	        	startDate:'',
	        	endDate:''
	        };
		$scope.flight.tailNumber = $rootScope.globals.deviceInformation.tailNumber;
		$scope.numberOfFligtsToDisplay = 20;
        $scope.showFlightDetails = function (object) {
            $rootScope.MM_M051_id = object.MOBILE_RECORD_ID;
            $state.go('app.MM_0051_FlightDetails');
        }
        $scope.toggleSearchMode = function(){
        	$scope.isSearchActive = !$scope.isSearchActive;
        };
        $scope.addMoreFlights = function(done) {
            if ($scope.flights != undefined && $scope.flights.length > $scope.numberOfFligtsToDisplay && !$scope.isSearchActive) {
                $scope.numberOfFligtsToDisplay += 20;
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };
		$scope.getFlightList = function (isFirstSearch) {
            $scope.flights = [];
            $scope.isSearchActive = false;
            var tempCondition = ' ';
            if (isFirstSearch){
            	if (!WingsUtil.IsNull($scope.flight.tailNumber)){
            		tempCondition = " And Tail_Number = '"+ $scope.flight.tailNumber+ "' ";
            	}
            }else{
            	tempCondition = generateQueryCondition();
            }
            var sql =" Select * from(Select * from (                "+
                     " Select FLIGHT_NUMBER,                        "+
                     "        CONTROL_NUMBER,                       "+
                     "        STATUS,                               "+
                     "        TAIL_NUMBER,                          "+
                     "        SCHEDULE_DATE,                        "+
                     "        SCHEDULED_FROM,                       "+
                     "        SCHEDULED_TO,                         "+
                     "        SCHEDULED_OFF_BLOCK,                  "+
                     "        SCHEDULED_ON_BLOCK,                   "+
                     "        SCHEDULED_TAKE_OFF,                   "+
                     "        SCHEDULED_LANDING,                    "+
                     "        MOBILE_RECORD_ID,                     "+
                     "        'MM_SCHEDULED_FLIGHTS' TABLE_NAME,    "+
                     "        '' SERVER_FEEDBACK,                   "+
                     "        '' MOBILE_RECORD_STATUS               "+
                     " From Mm_Scheduled_Flights a                  "+
                     "  Where Null is Null "+tempCondition          +")"+
                     " UNION ALL                                    "+
                     " Select * from (                              "+
                     " Select FLIGHT_NUMBER,                        "+
                     "        CONTROL_NUMBER,                       "+
                     "        STATUS,                               "+
                     "        TAIL_NUMBER,                          "+
                     "        ACTUAL_DATE SCHEDULE_DATE,            "+
                     "        ACTUAL_FROM SCHEDULED_FROM,           "+
                     "        ACTUAL_TO SCHEDULED_TO,               "+
                     "        ACTUAL_OFF_BLOCK SCHEDULED_OFF_BLOCK, "+
                     "        ACTUAL_ON_BLOCK SCHEDULED_ON_BLOCK,   "+
                     "        ACTUAL_TAKE_OFF SCHEDULED_TAKE_OFF,   "+
                     "        ACTUAL_LANDING SCHEDULED_LANDING,     "+
                     "        MOBILE_RECORD_ID,                     "+
                     "        'MM_FLIGHTS' TABLE_NAME,              "+
                     "        SERVER_FEEDBACK,                      "+
                     "        MOBILE_RECORD_STATUS                  "+
                     "   From Mm_Flights b                          "+
                     "  Where Null is Null "+tempCondition          +"))"+
                     "   Order By SCHEDULE_DATE desc";
            console.log(sql);
            criteriaExists();
            WingsTransactionDBService.executeSql(sql).then(function (result){
                if (result.length > 0) {
                    $scope.flights = result;
                }
                for (var i = 0;i<result.length;i++) {
                    if (!WingsUtil.IsNull(result[i].SCHEDULED_OFF_BLOCK) && !WingsUtil.IsNull(result[i].SCHEDULED_OFF_BLOCK)) {
                        $scope.flights[i].SCHEDULED_TAKE_OFF = moment(result[i].SCHEDULED_TAKE_OFF).format('HH:mm');
                        $scope.flights[i].SCHEDULED_LANDING = moment(result[i].SCHEDULED_LANDING).format('HH:mm');
                    }
                    $scope.flights[i].SCHEDULE_DATE = new Date(moment(result[i].SCHEDULE_DATE));
                }
                return deferred.resolve("GOHEAD");
            }, function (error) {
                WingsDialogService.error(JSON.stringify(error));
                console.log('MM_0100 - lof - lof'+JSON.stringify(error));
                return deferred.reject("lof-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };

        sy.GetTableRows("Select * From Pr_Aircrafts Where Div_No = ? And Engineering_Flag = ? And Active = 'Y' Order By Tail_Number",[$rootScope.globals.currentUser.divNo,'Y']).then(function(result){
            $scope.aircraftsLov = result;
        }); 
        
        function generateQueryCondition(isActual){
        	condition = '';
        	//var date = 'SCHEDULE_DATE'
        	//if (isActual) 
        	if (!WingsUtil.IsNull($scope.flight.tailNumber)){
        		condition += " And Tail_Number = '"+ $scope.flight.tailNumber+ "' ";
        	}
        	if (!WingsUtil.IsNull($scope.flight.logNumber)){
        		condition += " And Control_Number Like '%"+ $scope.flight.logNumber.toUpperCase()+ "%' ";
        	}
        	if (!WingsUtil.IsNull($scope.flight.flightNumber)){
        		condition += " And Flight_number Like '%"+ $scope.flight.flightNumber.toUpperCase()+ "%' ";
        	}
        	if (!WingsUtil.IsNull($scope.flight.status)){
        		condition += " And Status = '"+ $scope.flight.status+"' ";
        	}
			if (!WingsUtil.IsNull($scope.flight.startDate) && !WingsUtil.IsNull($scope.flight.endDate)){
				condition += " And SCHEDULE_DATE Between '"+ moment($scope.flight.startDate).format('YYYY-MM-DD')+ "'  And  '"+ moment($scope.flight.endDate).format('YYYY-MM-DD') + "' ";
			}else if (!WingsUtil.IsNull($scope.flight.startDate)){
				condition += " And SCHEDULE_DATE = '" /*date('"*/+ moment($scope.flight.startDate).format('YYYY-MM-DD')+/*"')*/ "' ";
			}else if (!WingsUtil.IsNull($scope.flight.endDate)){
				condition += " And SCHEDULE_DATE = '" /*date('"*/+ moment($scope.flight.endDate).format('YYYY-MM-DD')+/*"')*/ "' ";
			}
        	return condition;
        };
        $scope.getFlightList(true);
        
        $scope.clearCriterias = function(){
        	$scope.flight = {
    	        	tailNumber:'',
    	        	logNumber:'',
    	        	flightNumber:'',
    	        	startDate:'',
    	        	endDate:''
    	        };
        }
        $ionicModal.fromTemplateUrl('templates/search.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
        });
        $scope.hide = function(){
        	$scope.modal.hide();
        	$scope.onModal=false;
        }
        $scope.showModal = function (action) {
            $scope.modal.show();
        };
        $scope.$on('modal.hidden', function() {
        	$scope.onModal=false;
          });
       /* $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams, error){
        	if(fromState.name == 'app.SY_M003' && !WingsUtil.IsNull($rootScope.globals.queryDesigner.query)){
        		$scope.testValue = $rootScope.globals.queryDesigner.query;
        		getFlightList($rootScope.globals.queryDesigner.query);
        		}
        });*/
         function criteriaExists (){
        	if (WingsUtil.IsNull($scope.flight.tailNumber) && WingsUtil.IsNull($scope.flight.logNumber) && WingsUtil.IsNull($scope.flight.flightNumber) && WingsUtil.IsNull($scope.flight.startDate) && WingsUtil.IsNull($scope.flight.endDate)){
        		$scope.isCriteriaExists = false;
        	}else{
        		$scope.isCriteriaExists = true;
        	}
        	
        }

		}
		])