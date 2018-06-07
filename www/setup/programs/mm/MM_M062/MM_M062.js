angular.module('WingsMobileStarter').controller('MM_M062', [
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
		$scope.isSearchActive = false;
		$scope.rangeValue = 0;
		$scope.stations             		  = [];                                                                                                                                   
        $scope.discrepancyTypes     		  = [];
        $scope.employees            		  = [];
        $scope.ataCodes             		  = [];
        $scope.aircraftsLov                   = [];
        
        $scope.discrepancy = {
        	tailNumber:'',
        	logNumber:'',
        	type:'',
        	status:'OPEN',
        	station:'',
        	ataCode:'',
        	reportedBy:'',
        	reportDate:''
        };
        $scope.discrepancy.tailNumber = $rootScope.globals.deviceInformation.tailNumber;
        $scope.toggleSearchMode = function(){
        	$scope.isSearchActive = !$scope.isSearchActive;
        };
        /*var result = '';
        for (var i in $scope.discrepancy) {
            // obj.hasOwnProperty() is used to filter out properties from the object's prototype chain
            if ($scope.discrepancy.hasOwnProperty(i)) {
              result += 'discrepancy' + '.' + i + ' = ' + $scope.discrepancy[i] + '\n';
            }
          }
        console.log(result);*/
		$scope.numberOfDiscrepanciesToDisplay = 20;
		$scope.addMoreDiscrepancies = function(done) {
            if ($scope.discrepancies != undefined && $scope.discrepancies.length > $scope.numberOfDiscrepanciesToDisplay && !$scope.isSearchActive) {
            	$scope.numberOfDiscrepanciesToDisplay += 20;
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };

		function generateQueryCondition(){
        	condition = '';
        	if (!WingsUtil.IsNull($scope.discrepancy.tailNumber)){
        		condition += " And Tail_Number = '"+ $scope.discrepancy.tailNumber+ "' ";
        	}
        	if (!WingsUtil.IsNull($scope.discrepancy.logNumber)){
        		condition += " And Log_Number Like '%"+ $scope.discrepancy.logNumber.toUpperCase()+ "%' ";
        	}
        	if (!WingsUtil.IsNull($scope.discrepancy.type)){
        		condition += " And Discrepancy_Type = '" + $scope.discrepancy.type+ "' ";
        	}
        	if (!WingsUtil.IsNull($scope.discrepancy.status)){
        		condition += " And Status = '"+ $scope.discrepancy.status+"' ";
        	}
			if (!WingsUtil.IsNull($scope.discrepancy.station)){
				condition += " And Reported_Station = '"+ getStationCode($scope.discrepancy.station)+ "' " ;  		
			}
			if (!WingsUtil.IsNull($scope.discrepancy.ataCode)){
				condition += " And Ata_Code = '"+ $scope.discrepancy.ataCode+ "' " ;
			}
			if (!WingsUtil.IsNull($scope.discrepancy.reportedBy)){
				condition += " And Reported_By_Employee_Number = '"+ getEmployeeNumber($scope.discrepancy.reportedBy)+ "' ";
			}
			if (!WingsUtil.IsNull($scope.discrepancy.reportDate)){
				condition += " And Report_Date = '" /*date('"*/+ moment($scope.discrepancy.reportDate).format('YYYY-MM-DD')+/*"')*/ "' ";
			}
        	return condition;
        };
        function getEmployeeNumber(name){
        	var empNumber = 0;
        	for(i=0; i<$scope.employees.length; i++){
        		if($scope.employees[i].EMPLOYEE_NAME == name){
        			empNumber = $scope.employees[i].EMPLOYEE_NUMBER;
        			return empNumber;
        		}
        	}
        	return empNumber;
        }
        
        function getStationCode(description){
        	var stationCode = 0;
        	for(i=0; i<$scope.stations.length; i++){
        		if($scope.stations[i].DESCRIPTION == description){
        			stationCode = $scope.stations[i].FLIGHT_LOCATION;
        			return stationCode;
        		}
        	}
        	return stationCode;
        }
		$scope.getDiscrepancies = function(isFirstSearch) {
            $scope.isSearchActive = false;
            var sql = " Select *                                             " +
                      "   From Mm_Discrepancies a                            " +
                      "  Where a.Div_No =" + $rootScope.globals.currentUser.divNo;
            var sqlPartTwo = " Order By Report_Date Desc Limit 20";
            /*if(!WingsUtil.IsNull(condition)){
            	sql += " And "+ condition + sqlPartTwo + " Limit 500";
            }else{
            	sql += sqlPartTwo+ " Limit 500";
            }*/
            if (isFirstSearch){
            	if (!WingsUtil.IsNull($scope.discrepancy.tailNumber)){
            		sql += " And Tail_Number = '"+ $scope.discrepancy.tailNumber+ "' And Status In ('OPEN','DEFERRED') ";
            	}else{
            		sql += " And Status In ('OPEN','DEFERRED') ";
            	}
            }else{
            	sql += generateQueryCondition();
                console.log('***** sql  = '+ sql);
            }
            sql += sqlPartTwo;
            console.log('***** sql  = '+ sql);
            criteriaExists();
            WingsTransactionDBService.executeSql(sql).then(function (result){
                if(result.length > 0) {
                    $scope.discrepancies = result;
                }else {
                    $scope.discrepancies=[];
                }
            }, function (error) {
                console.log(JSON.stringify(error));
                $scope.discrepancies=[];
            }); 
        };

        /*sy.GetTableRows("Select * From Mm_Flight_Locations Where Div_No = ? And Active = 'Y' Order By Flight_Location",[$rootScope.globals.currentUser.divNo]).then(function(result){
            $scope.stations = result;
        }); 
        */
        sy.GetTableRows("Select * From Mm_Discrepancy_Types Where Div_No = ? And Active = 'Y' Order By Discrepancy_Type",[$rootScope.globals.currentUser.divNo]).then(function(result){
            $scope.discrepancyTypes = result;
        }); 
        
        /*sy.GetTableRows("Select * From Lb_Employees Where Div_No = ? And Active = 'Y' Order By Employee_Number",[$rootScope.globals.currentUser.divNo]).then(function(result){
            $scope.employees = result;
        }); */
        
        /*sy.GetTableRows("Select * From Pr_Ata_Codes Where Div_No = ? And Active = 'Y' Order By Ata_Code",[$rootScope.globals.currentUser.divNo]).then(function(result){
            $scope.ataCodes = result;
        });*/
        
        sy.GetTableRows("Select * From Pr_Aircrafts Where Div_No = ? And Engineering_Flag = ? And Active = 'Y' Order By Tail_Number",[$rootScope.globals.currentUser.divNo,'Y']).then(function(result){
            $scope.aircraftsLov = result;
        });
        
        $scope.setStatus = function(index, status){
        	if ($.isNumeric(index) && status){
        		document.getElementById('rangeSlider').value = index;
        		$scope.rangeValue = index;
        		$scope.discrepancy.status = status;
        	}else{
	        	var rangeSliderValue = document.getElementById('rangeSlider').valueAsNumber;
	        	if (rangeSliderValue == 0){
	        		$scope.rangeValue = 0;
	        		$scope.discrepancy.status = 'OPEN';
	        	}else if (rangeSliderValue == 1){
	        		$scope.rangeValue = 1;
	        		$scope.discrepancy.status = 'DEFERRED';
	        	}else if (rangeSliderValue == 2){
	        		$scope.rangeValue = 2;
	        		$scope.discrepancy.status = 'CLOSED';
	        	}else{
	        		$scope.rangeValue = 3;
	        		$scope.discrepancy.status = 'CANCELLED';
	        	}
        	}
        	console.log($scope.rangeValue);
        } 

        $scope.clearCriterias = function(){
        	$scope.discrepancy = {
                	tailNumber:'',
                	logNumber:'',
                	type:'',
                	status:'OPEN',
                	station:'',
                	ataCode:'',
                	reportedBy:'',
                	reportDate:''
                };
        	$scope.rangeValue = 0;
        	document.getElementById('rangeSlider').value = 0;
        }
        $scope.openDiscrepancy = function (object) {
        	//$rootScope.MM_M051_AircraftType = $scope.flight.aircraftType;
        	$rootScope.MM_M055_Discrepancy_id = object.MOBILE_RECORD_ID;
            $state.go('app.MM_M055');
        };
        
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
        function criteriaExists (){
        	if (WingsUtil.IsNull($scope.discrepancy.tailNumber) && WingsUtil.IsNull($scope.discrepancy.logNumber) && WingsUtil.IsNull($scope.discrepancy.type) && WingsUtil.IsNull($scope.discrepancy.status) && WingsUtil.IsNull($scope.discrepancy.station) && WingsUtil.IsNull($scope.discrepancy.ataCode) && WingsUtil.IsNull($scope.discrepancy.reportedBy) && WingsUtil.IsNull($scope.discrepancy.reportDate)){
        		$scope.isCriteriaExists = false;
        	}else{
        		$scope.isCriteriaExists = true;
        	}
        	
        }
        $scope.getDiscrepancies(true);
        

		}
		])