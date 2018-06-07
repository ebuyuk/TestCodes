angular.module('WingsMobileStarter').controller('MM_M104', [
	'$scope','WingsTransactionDBService','WingsSetupDBService','WingsDialogService','$ionicHistory',
    function($scope,WingsTransactionDBService,WingsSetupDBService,WingsDialogService,$ionicHistory) {
	    var defaultTailNumber = $rootScope.globals.deviceInformation.tailNumber;
	    var flightId = $rootScope.globals.flightId;
		$scope.types = [];
		$scope.viewMode = 'insert';
        $scope.isPfcShown = true;
        $scope.isLpfcShown = true;
		$scope.toggle = function(prop) {
            eval("$scope."+ prop +"="+"!$scope."+ prop );
        };
		if($rootScope.globals.viewMode == 'update' && flightId != '') {
			$scope.viewMode = 'update';
			Query();
		}
		$scope.inspection = {
			    date:'',
			    number:$rootScope.globals.currentUser.userNumber,
			    name:$rootScope.globals.currentUser.userName,
			    type:'PRE-FLIGHT'
		};
		$scope.lastInspection = {
				Inspection_Date:'',
				Inspector_Number:'',
				Employee_Name:''
		};
		lastInspection();
		function resetInspection () {
			$scope.inspection = {
				    date:'',
				    number:'',
				    name:$rootScope.globals.currentUser.userName,
				    type:'PRE-FLIGHT'
			};
		};
		function lastInspection () {
			 var sql = "Select Max(a.Inspection_Date)   Inspection_Date,   " +
			           "       Max(a.Inspector_Number)  Inspector_Number  " +
				       " From  MM_FLIGHT_INSPECTIONS a,        " +
				       "       mm_flights b                    " +
				       "Where a.Div_No = 1                     " +
				       "  And b.Div_No = a.Div_No              " +
				       "    And b.Mobile_Record_Id     =  (Select Max(x.Mobile_Record_Id)   "+
	                   "                                     From Mm_Flights x              "+
	                   "                                    Where x.Div_No      = a.Div_No  "+
	                   "                                      And x.Mobile_Record_Id < ?" +
	                   "                                      And x.Tail_Number = ? )"+
				       "  And b.Mobile_Record_Id = a.Flight_Id ";
			 
		    var sql2 = 'Select employee_name ' +
		               ' From LB_EMPLOYEES   ' +
		               'where EMPLOYEE_NUMBER = ? ';
		    var parameters = [flightId,defaultTailNumber]
		    WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
				console.log('MM_0104'+JSON.stringify(result));
				$scope.lastInspection.Inspection_Date = !isNull(result[0].Inspection_Date) ? moment(result[0].Inspection_Date).format('DD MMMM YY, HH:mm') : '';
				$scope.lastInspection.Inspector_Number = result[0].Inspector_Number;
				var parameters2 = [$scope.lastInspection.Inspector_Number];
				WingsSetupDBService.executeSql(sql2,parameters2).then(function (result2){
					if(result2.length > 0) {
						console.log('MM_0104-2'+JSON.stringify(result));
						$scope.lastInspection.Employee_Name = result2[0].EMPLOYEE_NAME;
					}
					return deferred.resolve("GOHEAD");
				}, function (error) {
					console.log(JSON.stringify(error));
			        return deferred.reject("Login-Error : " +JSON.stringify(error));
	            });
			}, function (error) {
				console.log(JSON.stringify(error));
		        return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
	        return deferred.promise;
		};
		$scope.Save = function () {
			console.log('#####'+$scope.inspection.date);
			if($scope.inspection.date == '' || $scope.inspection.date == undefined) {
				WingsDialogService.error('Date field is required !');
				return false;
			}
		    var sql = 'Insert Into MM_FLIGHT_INSPECTIONS (Div_No,Inspection_Date,Inspector_Number,Inspection_Type,Flight_Id) '+
					  '     Values (1,?,?,?,?)';
		    var parameters = [moment($scope.inspection.date).format('YYYY-MM-DD HH:mm'),
		      				  $scope.inspection.number,
		      				  'PRE-FLIGHT',
		    				  flightId];
		    WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
				WingsDialogService.success();
				$rootScope.$emit('oninspectioncreate');
				$ionicHistory.goBack();
				resetInspection();
				return deferred.resolve("GOHEAD");
			}, function (error) {
				WingsDialogService.error(JSON.stringify(error));
				console.log(JSON.stringify(error));
		        return deferred.reject("Login-Error : " +JSON.stringify(error));
		    });
			return deferred.promise;
        };
        function Query () {
		    var sql = "select a.Inspection_Date,       " +
		              "       a.Inspector_Number       " +
		    		  "  from MM_FLIGHT_INSPECTIONS a  " +
		    		  " where Flight_Id = ?     ";
		    var sql2 = "Select employee_name " +
                       " From LB_EMPLOYEES   " +
                       "where EMPLOYEE_NUMBER = ? ";
			var parameters = [$rootScope.globals.flightId];
			    WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
				console.log('MM_104 Query :'+JSON.stringify(result));
				if(result.length > 0) {
					$scope.inspection = {
						    date:new Date(result[0].INSPECTION_DATE),
						    number:result[0].INSPECTOR_NUMBER
					};
					var parameters2 = [$scope.inspection.number];

					WingsSetupDBService.executeSql(sql2,parameters2).then(function (result2){
						if(result2.length > 0) {
							console.log('MM_0104-2'+JSON.stringify(result));
							$scope.inspection.name = result2[0].EMPLOYEE_NAME;
						}
						return deferred.resolve("GOHEAD");
					}, function (error) {
						console.log(JSON.stringify(error));
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
			if($scope.inspection.date == '' || $scope.inspection.date == undefined) {
				WingsDialogService.error('Date field is required !');
				return false;
			}
            var sql = "Update MM_FLIGHT_INSPECTIONS   " +
    		          "   Set Inspection_date = ?     " +
        	          " Where Flight_Id = ?    ";
	         
          var parameters = [moment($scope.inspection.date).format('YYYY-MM-DD HH:mm'),$rootScope.globals.flightId];
	      WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
		      console.log('MM_104 Query :'+JSON.stringify(result));
		      $rootScope.$emit('oninspectioncreate');
		      $ionicHistory.goBack();
		      return deferred.resolve("GOHEAD");
	      }, function (error) {
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
                    var sql = "Delete From MM_FLIGHT_INSPECTIONS where Flight_Id = ?";
                    var parameters = [$rootScope.globals.flightId];
                    WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                        $rootScope.$emit('oninspectioncreate');
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
        function isNull (obj) {
            if(obj != '' && obj != null) {
                return false;
            } else {
                return true;
            }
        };
	}
])