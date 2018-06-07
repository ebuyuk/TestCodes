angular.module('WingsMobileStarter').controller('MM_M103', [
		'$scope','WingsSetupDBService','WingsTransactionDBService','$ionicHistory','WingsDialogService',
		function($scope,WingsSetupDBService,WingsTransactionDBService,$ionicHistory,WingsDialogService) {
			$scope.lastConsumption = [{
					date:'',
					description:'',
					amount:''
			}];
			var flightId = $rootScope.globals.flightId;
			$scope.viewMode = 'insert';
			$scope.isConsShown = true;
			if($rootScope.globals.viewMode == 'update' && flightId != '') {
				$scope.viewMode = 'update';
				Query();
			}
			$scope.toggle = function(prop) {
                eval("$scope."+ prop +"="+"!$scope."+ prop );
            };
            $scope.consumption = {
					vendor : {
						vendorNumber:'',
						vendorName:''
					},
					noRefuellingFlag:'',
                    consumptionType:'FUEL',
					fuelType:'',
					upliftUnit:'',
					density:'',
					arrival:'',
					added:'',
					departure:'',
					remaining:'',
					date:'',
					flightId:flightId,
					uom:'',
					calcFuel:'',
					uplift:'',
					difference:''
			}
			$scope.suppliers = [];

			suppliersLov();
			getLastConsumption();
			function reset () {
				$scope.consumption = {
						vendor : {
							vendorNumber:'',
							vendorName:''
						},
						noRefuellingFlag:true,
						fuelType:'',
						consumptionType:'FUEL',
						upliftUnit:'',
						density:'',
						arrival:'',
						added:'',
						departure:'',
						remaining:'',
						date:'',
						flightId:flightId,
						uom:'',
						calcFuel:'',
						indicated:'',
						difference:''
				}
			};
			$scope.fuelTypes = ['Jet A-1','Jet A','Jet B','TS-1'];
			$scope.calcMass = function() {
				$scope.consumption.uplift = Number(($scope.consumption.added*$scope.consumption.density).toFixed(3));
				$scope.calcUplift();
			};
			$scope.calcDiff = function() {
				$scope.consumption.difference = $scope.consumption.calcFuel-$scope.consumption.departure;
		    };
		    $scope.calcUplift = function() {
		        if($scope.consumption.remaining != '') {
		            $scope.consumption.calcFuel = $scope.consumption.remaining+$scope.consumption.uplift;
		        } else {
		            $scope.consumption.calcFuel = $scope.consumption.uplift;
		        }
		    };
			function suppliersLov () {
				var sql = 'Select Vendor_Number vendorNumber, ' +
					      '       Vendor_Name vendorName      ' +
				          '  From IC_VENDORS                  ' +
				          ' Where Div_No = 1                  ' +
				          ' Order By Vendor_Number            ';
				          
			/*	WingsSetupDBService.executeSql(sql).then(function (result){
					$scope.suppliers = result;
					return deferred.resolve(result);
				}, function (error) {
					console.log(JSON.stringify(error));
			        return deferred.reject("Login-Error : " +JSON.stringify(error));
			    }); */
				return deferred.promise;
			};
			function getLastConsumption () {
				var sql = " Select Max(a.Consumption_Date) Consumption_Date,                   "+
	                      "        'After Fuel Uplift' Description,                            "+
	                      "        Max(a.Departure)||' kg' Amount,                             "+
	                      "        '' Remaining,                                               "+
	                       "        Max(a.Density) Density,                                    "+
	                      "        1 Sort_Order                                                "+
	                      "   From Mm_Flight_Consumptions a,                                   "+
	                      "        Mm_Flights             b                                    "+
	                      "  Where a.Div_No               = 1                                  "+
	                      "    And b.Div_No               = a.Div_No                           "+
	                      "    And b.Mobile_Record_Id     =  (Select Max(x.Mobile_Record_Id)   "+
	                      "                                     From Mm_Flights x              "+
	                      "                                    Where x.Div_No      = a.Div_No  "+
	                      "                                      And x.Mobile_Record_Id < ? )  "+
	                      " Union All                                                          "+
	                      " Select  Max(b.Actual_Date)||' '||Max(b.Actual_Landing) Consumption_Date, "+
	                      "        'After Flight' Description,                                 "+
	                      "        Max(a.Arrival)||' kg' Amount,                               "+
	                      "        Max(a.Arrival) Remaining,                                   "+
	                      "        Max(a.Density) Density,                                     "+
	                      "        2 Sort_Order                                                "+
	                      "   From Mm_Flight_Consumptions a,                                   "+
	                      "        Mm_Flights             b                                    "+
	                      "  Where a.Div_No               = 1                                  "+
	                      "    And b.Div_No               = a.Div_No                           "+
	                      "    And b.Mobile_Record_Id     =  (Select Max(x.Mobile_Record_Id)   "+
	                      "                                     From Mm_Flights x              "+
	                      "                                    Where x.Div_No      = a.Div_No  "+
	                      "                                      And x.Mobile_Record_Id < ? )"+
	                      " Order By Sort_Order                                                ";
			   
				var parameters = [flightId,flightId]
			    WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
					console.log('MM_M103 Last Counsumptions:'+JSON.stringify(result));
				    $scope.lastConsumption = result;
				    console.log('###########'+result[1].Remaining*result[1].Density);
                    console.log('###########'+$scope.consumption.remaining);
                    if(result[1].Remaining*result[1].Density != 0) {
                        $scope.consumption.remaining = result[1].Remaining*result[1].Density;
                    }
				}, function (error) {
					console.log(JSON.stringify(error));
			        return deferred.reject("Login-Error : " +JSON.stringify(error));
	            });
		        return deferred.promise;
			};
			$scope.Save = function () {
				var sql=' Insert Into MM_FLIGHT_CONSUMPTIONS (Div_No,No_Refuelling_Flag,Vendor_Number,Fuel_Type,Density,Arrival,Added,Departure,Remaining,Consumption_Date,Flight_Id,Uom,Consumption_Type) '+
				        ' Values (1,?,?,?,?,?,?,?,?,?,?,?,?)';
				if($scope.consumption.noRefuellingFlag) {
					reset();
				}
				console.log('$scope.consumption.date'+$scope.consumption.date);
				var parameters = [  $scope.consumption.noRefuellingFlag,
				                    $scope.consumption.vendor.vendorNumber,
				                    $scope.consumption.fuelType,
				      				$scope.consumption.density,
				      				$scope.consumption.arrival,
				    				$scope.consumption.added,
				    				$scope.consumption.departure,
				    				$scope.consumption.remaining,
				    				$scope.consumption.date != '' ? moment($scope.consumption.date).format('YYYY-MM-DD HH:MM'):'',
				    				$scope.consumption.flightId,
				    				$scope.consumption.uom,
				    				$scope.consumption.consumptionType];
				
				    WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
						console.log(JSON.stringify(result));
						WingsDialogService.success();
						$rootScope.$emit('onConsumptionCreate');
						$ionicHistory.goBack();
						return deferred.resolve('GOHEAD');
					}, function (error) {
						WingsDialogService.error(JSON.stringify(error));
						console.log(JSON.stringify(error));
				        return deferred.reject('Login-Error : ' +JSON.stringify(error));
				    });
					return deferred.promise;
			
			
			};
			function Query () {
				var sql=" Select No_Refuelling_Flag," +
						"        Vendor_Number," +
						"        Fuel_Type," +
						"        Density," +
						"        Arrival," +
						"        Added," +
						"        Departure," +
						"        Remaining," +
						"        Consumption_Date," +
						"        Uom "+
		                "   From MM_FLIGHT_CONSUMPTIONS" +
						"  Where Flight_Id = ?;";

				
				var sql2 = " Select Vendor_Name        " +
		                   "   From IC_VENDORS         " +
		                   "  Where Div_No = 1         " +
		                   "    And Vendor_Number = ?  ";
				
				var parameters = [flightId]
			    WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
					if(result[0].NO_REFUELLING_FLAG == "false") {
					    $scope.consumption.noRefuellingFlag = false;
					} else {
					    $scope.consumption.noRefuellingFlag = true;
					}
	                $scope.consumption.vendor.vendorNumber = result[0].VENDOR_NUMBER;
	                $scope.consumption.fuelType = result[0].FUEL_TYPE;
	   				$scope.consumption.density = result[0].DENSITY;
	   				$scope.consumption.arrival = result[0].ARRIVAL;
	 				$scope.consumption.added = result[0].ADDED;
	 				$scope.consumption.departure = result[0].DEPARTURE;
	 				$scope.consumption.remaining = result[0].REMAINING;
	 				$scope.consumption.date = new Date(result[0].CONSUMPTION_DATE);
	 				$scope.consumption.uom = result[0].UOM;
					
	 				var parameters2 = [result[0].VENDOR_NUMBER]
	 				WingsSetupDBService.executeSql(sql2,parameters2).then(function (result2){
	 					$scope.consumption.vendor.vendorName = result2[0].VENDOR_NAME;
	 					$scope.calcUplift();
						return deferred.resolve(result2);
					}, function (error) {
						console.log(JSON.stringify(error));
				        return deferred.reject("Login-Error : " +JSON.stringify(error));
				    });
					return deferred.promise;
				}, function (error) {
					console.log(JSON.stringify(error));
			        return deferred.reject("Login-Error : " +JSON.stringify(error));
	            });
		        return deferred.promise;
			};
			$scope.Update = function () {
				
			    var sql = "Update MM_FLIGHT_CONSUMPTIONS "+
			              "   Set Div_No = 1," +
			              "       No_Refuelling_Flag = ?," +
			              "       Vendor_Number = ?, " +
			              "       Fuel_Type = ?," +
			              "       Density = ?, " +
			              "       Arrival = ?," +
			              "       Added = ?," +
			              "       Departure = ?," +
			              "       Remaining = ?," +
			              "       Consumption_Date = ?," +
			              "       Uom = ?" +
			              " Where Flight_Id = ?";
			    if($scope.consumption.noRefuellingFlag) {
					reset();
				}
			    var parameters = [  $scope.consumption.noRefuellingFlag,
				                    $scope.consumption.vendor.vendorNumber,
				                    $scope.consumption.fuelType,
				      				$scope.consumption.density,
				      				$scope.consumption.arrival,
				    				$scope.consumption.added,
				    				$scope.consumption.departure,
				    				$scope.consumption.remaining,
				    				moment($scope.consumption.date).format('YYYY-MM-DD HH:mm'),
				    				$scope.consumption.uom,
				    				flightId];
				WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
					    $rootScope.$emit('onConsumptionCreate');
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
                        var sql = "Delete From MM_FLIGHT_CONSUMPTIONS " +
                                  " Where Flight_Id = ?               ";
                        var parameters = [flightId];
                        WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                            $rootScope.$emit('onConsumptionCreate');
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
		}
		])