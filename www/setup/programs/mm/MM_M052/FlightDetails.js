angular.module('WingsMobileStarter').controller('MM_M052.FlightDetails', [
    '$scope',
    'WingsUtil',
    'WingsDialogService',
    'WingsTransactionDBService',
    'WingsPouchDbSetupService',
    '$ionicSlideBoxDelegate',
    '$ionicHistory',
    '$ionicModal',
    '$ionicLoading',
    '$q',
    'sy',
    'md5',
    '$ionicTabsDelegate',
    'WingsRemoteDbService',
    function($scope,WingsUtil,WingsDialogService,WingsTransactionDBService,WingsPouchDbSetupService,$ionicSlideBoxDelegate,$ionicHistory,$ionicModal,$ionicLoading,$q,sy,md5,$ionicTabsDelegate,WingsRemoteDbService) {
        console.log("MM_M052.FlightDetails");
        console.log($rootScope.MM_M052_id);
        debugger;
        //UTILS
        $scope.disabled         = false;
        $scope.activeSlideIndex = 0;
        $scope.isModalActive = false;
        //$scope.isdeleteClicked = false;
        $scope.user = {
        		username:$rootScope.globals.currentUser.userId,
        		password:''
        };
        function parseDate (date) {
        	if (!WingsUtil.IsNull(date)) {
        		var t = date.split(/[- :]/);
        		var d = new Date(t[0], t[1]-1, t[2], t[3], t[4]);
        		var actiondate = new Date(d);
        		return actiondate;
        	}
        };
        $rootScope.$ionicGoBack = function() {
        	$('#m052fd').siblings('.upper-canvas').remove();
        	$('#m052fd').parent('.canvas-container').before($('#m052fd'));
        	$('.canvas-container').remove();
        	$ionicHistory.goBack();
        };
        $scope.expand = function (prop) {
        	//if($scope.isdeleteClicked) return;
        	eval("$scope."+ prop +"="+"!$scope."+ prop );
        };
        $scope.toggle = function(prop) {
            eval("$scope."+ prop +"="+"!$scope."+ prop );
        };
        //FLIGHT DETAILS

        $scope.flight = {
                tailNumber     : '',
                flightId       : '',
                flightNumber   : '',
                serialNumber   : '',
                actualDate     : '',
                actualFrom     : '',
                actualTo       : '',
                actualOffBlock : '',
                actuallTakeOff : '',
                actuallLanding : '',
                actualOnBlock  : '',
                status         : '',
                inspection: {
                    date       : '',
                    number     : '',
                    type       : ''
                }
        };
       
        function getFlight () {
            var sql = "Select *             " +
                      " From Mm_Flights     " +
                      "Where Id = ?         " ;
            var parameters = [$rootScope.MM_M052_id];
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
            	var actualOffBlock = '';
            	var actualOnBlock  = '';
                if (!WingsUtil.IsNull(result[0].ACTUAL_OFF_BLOCK)) {
                	actualOffBlock = result[0].ACTUAL_OFF_BLOCK
                } else if (!WingsUtil.IsNull(result[0].SCHEDULED_OFF_BLOCK)) {
                	actualOffBlock = result[0].SCHEDULED_OFF_BLOCK
                }
                if (!WingsUtil.IsNull(result[0].ACTUAL_ON_BLOCK)) {
                	actualOnBlock = result[0].ACTUAL_ON_BLOCK
                } else if (!WingsUtil.IsNull(result[0].SCHEDULED_ON_BLOCK)) {
                	actualOnBlock = result[0].SCHEDULED_ON_BLOCK
                }
            	 $scope.flight = {
                         tailNumber            : result[0].TAIL_NUMBER,
                         flightNumber          : result[0].FLIGHT_NUMBER,
                         serialNumber          : result[0].SERIAL_NUMBER,
                         actualDate            : WingsUtil.IsNull(result[0].ACTUAL_DATE)?new Date(result[0].SCHEDULE_DATE):new Date(result[0].ACTUAL_DATE),
                         actualFrom            : WingsUtil.IsNull(result[0].ACTUAL_FROM)?result[0].SCHEDULED_FROM:result[0].ACTUAL_FROM,
                         actualTo              : WingsUtil.IsNull(result[0].ACTUAL_TO)?result[0].SCHEDULED_TO:result[0].ACTUAL_TO,
                         actualOffBlock        : moment(actualOffBlock).format('HH:mm'),
                         actualTakeOff         : WingsUtil.IsNull(result[0].ACTUAL_TAKE_OFF)?'':moment(result[0].ACTUAL_TAKE_OFF).format('HH:mm'),
                         actualLanding         : WingsUtil.IsNull(result[0].ACTUAL_LANDING)?'':moment(result[0].ACTUAL_LANDING).format('HH:mm'),
                         actualOnBlock         : moment(actualOnBlock).format('HH:mm'),
                         status                : result[0].STATUS,
                         aircraftType          : '',
                         controlNumber         : result[0].CONTROL_NUMBER,
                         delaysArr             : [],
                         delayReason           : result[0].DELAY_REASON,
                         delayTime             : result[0].DELAY_TIME,
                         lowVisibilityStatus   : result[0].LOW_VISIBILITY_STATUS,
                         reducedVisibilityFlag : result[0].REDUCED_VISIBILITY_FLAG,
                         internalComment       : result[0].INTERNAL_COMMENT,
                         flightId              : result[0].ID
                 };
            	 getInspection();
            }, function (error) {
                WingsDialogService.error(JSON.stringify(error));
                console.log(JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };
        getFlight();
       
        //INSPECTION
        
        $scope.pfcinspection = {
                date   : '',
                number : $rootScope.globals.currentUser.userNumber,
                name   : $rootScope.globals.currentUser.userName,
                type   : 'PRE-FLIGHT',
                id     : ''
        };
        function getInspection () {
            var sql = " Select a.Inspection_Date   Inspection_Date,  " +
                      "        a.Inspector_Number  Inspector_Number, " +
                      "        a.Inspection_Type   Inspection_Type   " +
                      "  From  MM_FLIGHT_INSPECTIONS a               " +
                      " Where a.Div_No    = ?                        " +
                      "   And a.Inspection_Type = 'PRE-FLIGHT'       " +
                      "   And a.Flight_Id = ?                        "; 
            
           var sql2 = "Select Employee_Name       " +
                      "  From Lb_Employees        " +
                      " where Employee_Number = ? ";
           var parameters = [$rootScope.globals.currentUser.divNo,$scope.flight.flightId]
           WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
               if (result.length > 0) {
                   $scope.hasInspection = '';
                   $scope.pfcinspection.date = new Date(moment(result[0].Inspection_Date).format('DD MMMM YY, HH:mm'));
                   $scope.pfcinspection.number = result[0].Inspector_Number;
                   $scope.pfcinspection.type = result[0].Inspection_Type;
                   
                   sy.GetTableRows("Select * From Lb_Employees Where Div_No = ? And Employee_Number = ? And Active = 'Y' ",[$rootScope.globals.currentUser.divNo,result[0].Inspector_Number]).then(function(result2){
                       if (result2.length > 0) {
                           $scope.pfcinspection.name = result2[0].EMPLOYEE_NAME;
                       }
                   });
                   
               } else {
                   $scope.hasInspection = '!';
                   $scope.pfcinspection.date = '';
               }
           }, function (error) {
               console.log(JSON.stringify(error));
               return deferred.reject("Login-Error : " +JSON.stringify(error));
           });
           return deferred.promise;
       };
      
       $timeout(function () {
           //DOM has finished rendering
       },2500);
       $scope.saveInspection = function () {
           if ($scope.pfcinspection.date == '' || $scope.pfcinspection.date == undefined) {
               WingsDialogService.error('Date field is required !');
               return false;
           }
    	   if ($scope.digitalSign != true) {
    		    $scope.showModal();
          		return false;
           } else {
        	   $scope.hide();
               if (!$scope.disabled) {
            	   $scope.digitalSign = false;
                   var sql = "Insert Into MM_FLIGHT_INSPECTIONS (Div_No,Inspection_Date,Inspector_Number,Inspection_Type,Mobile_Record_Status,Flight_Id) " +
                             "     Values (?,?,?,?,?,?)                                                                                                  ";
                   var parameters = [$rootScope.globals.currentUser.divNo,
                	                 moment($scope.pfcinspection.date).format('YYYY-MM-DD HH:mm'),
                                     $scope.pfcinspection.number,
                                     'PRE-FLIGHT',
                                     'READY',
                                     $scope.flight.flightId];
                   WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                       WingsDialogService.success();
                       getInspection();
  						$rootScope.$emit('onflightcreate');
                       //$scope.slider.slideTo(0, 200);
                   }, function (error) {
                       WingsDialogService.error(JSON.stringify(error));
                       console.log(JSON.stringify(error));
                   });
               }
           }
       };
       var customeEventListener = $rootScope.$on('DigitalSignFeedback', function(event, args) {
   	       $scope.digitalSign = args.success;
   		   if ($scope.digitalSign) {
   		      $scope.saveInspection();
   		   }
       });
       $scope.deleteInspection = function () {
    	   if ($scope.flight.status == 'ACCEPTED') {
    		   return false;
    	   }
           if (!$scope.disabled) {
               var buttonArray = ['Ok','Cancel'];
               WingsDialogService.confirm('Do you want to cancel PFC ?','Confirm',buttonArray).then(function(buttonIndex) {
                   // no button = 0, 'Ok' = 1, 'Cancel' = 2
                   var btnIndex = buttonIndex;
                   if (buttonIndex == 1) {
                       var sql = "Delete From MM_FLIGHT_INSPECTIONS where Flight_Id = ? and Inspection_Type = ?";
                       var parameters = [$scope.flight.flightId, 'PRE-FLIGHT'];
                       WingsTransactionDBService.executeSql(sql,parameters).then(function(result) {
                           getInspection();
                           $scope.slider.slideTo(0, 200);
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
      

       //CONSUMPTION
       
       $scope.consumption = {
               vendor : {
                   vendorNumber   : '',
                   vendorName     : ''
               },
               id                 : '',
               noRefuellingFlag   : '',
               consumptionType    : 'FUEL',
               fuelType           : 'FUEL',
               upliftUnit         : '',
               density            : '',
               arrival            : '',
               added              : '',
               departure          : '',
               remaining          : '',
               date               : '',
               flightId           : '',
               uom                : '',
               calcFuel           : '',
               uplift             : '',
               difference         : '',
               fpBurnOff          : ''
       }
       $scope.fuels = {
   		eng1 : {
   			arrival : '',
   			added   : '',
   			id      : '',
   			requiredFlag : ''
   		},
   		eng2 : {
   			arrival : '',
   			added   : '',
   			id      : '',
   			requiredFlag : ''
   				
   		},
   		apu : {
   			arrival : '',
   			added   : '',
   			id      : '',
   			requiredFlag : ''
   		},
   		idg1 : {
   			added   : '',
   			id      : '',
   			requiredFlag : ''
   		},
   		idg2 : {
   			added   : '',
   			id      : '',
   			requiredFlag : ''
   		},
   		hyd : {
   			blue : {
   				added : '',
   				id    : ''
   			},
   			green : {
   				added : '',
   				id    : ''
   			},
   			yellow: {
   				added : '',
   				id    : ''
   			}
   		},
   		requiredFlag : ''
       };

       $scope.fuel    = false;
       $scope.antiIce = false;
       $scope.eng1Oil = false;
       $scope.eng2Oil = false;
       $scope.apuOil  = false;
       $scope.idg1    = false;
       $scope.idg2    = false;
       $scope.hyd     = false;
       $scope.isConsShown = true;
        
        $scope.getConsumptions = function () {
            getConsumptions();
        };
        $scope.vendorOnselect = function (newValue,oldValue) {
            $scope.consumption.vendor.vendorNumber = newValue.VENDOR_NUMBER;
            $scope.consumption.vendor.vendorName = newValue.VENDOR_NAME;
        };
        
        $scope.suppliersLov = [];
        //$scope.fuelTypesLov = [];

        $scope.calcMass = function () {
            $scope.consumption.uplift = Number(($scope.consumption.added*$scope.consumption.density).toFixed(3));
            $scope.calcUplift();
        };
        $scope.calcDiff = function () {
            $scope.consumption.difference = Number(($scope.consumption.calcFuel-$scope.consumption.departure).toFixed(3));
        };
        $scope.calcBurnOff = function () {
            if (!WingsUtil.IsNull($scope.consumption.calcFuel) && !WingsUtil.IsNull($scope.consumption.arrival)) {
                $scope.consumption.fpBurnOff = Number(($scope.consumption.calcFuel-$scope.consumption.arrival).toFixed(3));
            } else {
                $scope.consumption.fpBurnOff = 0;
            }
        };
        $scope.calcUplift = function () {
            if (!WingsUtil.IsNull($scope.consumption.remaining)) {
                $scope.consumption.calcFuel = Number($scope.consumption.remaining+$scope.consumption.uplift);
            } else {
                $scope.consumption.calcFuel = Number($scope.consumption.uplift);
            }
        };
        function getConsumptions () {
            var deferred = $q.defer();
            var sql=" Select Consumption_Type,      " +
				    "        Vendor_Number,         " +
				    "        Vendor_Name,           " +
				    "        Density,               " +
                    "        Fuel_Type,             " +
                    "        Consumption_Date,      " +
                    "        Arrival,               " +
                    "        Added,                 " +
                    "        Departure,             " +
                    "        Remaining,             " +
                    "        Mobile_Record_Id,      " +
                    "        Id                     " +
                    "   From MM_FLIGHT_CONSUMPTIONS " +
                    "  Where Flight_Id = ?;         ";
            var parameters = [$rootScope.MM_M052_id]
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
            	$scope.hasConsumption = '!';
                for (var i = 0;i<result.length;i++) {
                	$scope.consumptions = result;
                	if (result[i].CONSUMPTION_TYPE == "FUEL") {
                        $scope.hasConsumption = '';
                        var consumption = {
                              noRefuellingFlag  : '',
                              consumptionType   : '',
                              fuelType          : 'FUEL',
                              departure         : '',
                              date              : '',
                              added             : '',
                              vendor : {
                                  vendorNumber  : '',
                                  vendorName    : ''
                              },
                              density           : '',
                              id                : ''
                        };
                        if (result[i].NO_REFUELLING_FLAG == "false" || result[i].NO_REFUELLING_FLAG == null) {
                        	consumption.noRefuellingFlag = false;
                        } else {
                        	consumption.noRefuellingFlag = true;
                        }
                        //consumption.fuelType = result[i].FUEL_TYPE;
                        consumption.departure            = result[i].DEPARTURE;
                        consumption.date                 = new Date(moment(result[0].CONSUMPTION_DATE).format('DD MMMM YY, HH:mm'));
                        consumption.consumptionType      = result[i].CONSUMPTION_TYPE;
                        consumption.added                = result[i].ADDED;
                        consumption.vendor.vendorName    = result[i].VENDOR_NAME;
                        consumption.vendor.vendorNumber  = result[i].VENDOR_NUMBER;
                        consumption.density              = result[i].DENSITY;
                        consumption.id                   = result[i].MOBILE_RECORD_ID;
                        consumption.remaining            = result[i].REMAINING;
                        consumption.arrival              = result[i].ARRIVAL;
                        $scope.consumption               = consumption;
                        $scope.calcMass();
                        $scope.calcDiff();
                        $scope.calcBurnOff();
                	}
                	if (result[i].CONSUMPTION_TYPE == 'ENG-1') {
                		$scope.fuels.eng1.arrival = result[i].ARRIVAL;
                		$scope.fuels.eng1.added = result[i].ADDED;
                		$scope.fuels.eng1.id = result[i].ID;
                	} else if (result[i].CONSUMPTION_TYPE == 'ENG-2') {
                		$scope.fuels.eng2.arrival = result[i].ARRIVAL;
                		$scope.fuels.eng2.added = result[i].ADDED;
                		$scope.fuels.eng2.id = result[i].ID;
                	} else if (result[i].CONSUMPTION_TYPE == 'APU') {
                		$scope.fuels.apu.arrival = result[i].ARRIVAL;
                		$scope.fuels.apu.added = result[i].ADDED;
                		$scope.fuels.apu.id = result[i].ID;
                	} else if (result[i].CONSUMPTION_TYPE == 'IDG-1') {
                		$scope.fuels.idg1.added = result[i].ADDED;
                		$scope.fuels.idg1.id = result[i].ID;
                	} else if (result[i].CONSUMPTION_TYPE == 'IDG-2') {
                		$scope.fuels.idg2.added = result[i].ADDED;
                		$scope.fuels.idg2.id = result[i].ID;
                	} else if (result[i].CONSUMPTION_TYPE == 'HYD-G') {
                		$scope.fuels.hyd.green.added = result[i].ADDED;
                		$scope.fuels.hyd.green.id = result[i].ID;
                	} else if (result[i].CONSUMPTION_TYPE == 'HYD-B') {
                		$scope.fuels.hyd.blue.added = result[i].ADDED;
                		$scope.fuels.hyd.blue.id = result[i].ID;
                	} else if (result[i].CONSUMPTION_TYPE == 'HYD-Y') {
                		$scope.fuels.hyd.yellow.added = result[i].ADDED;
                		$scope.fuels.hyd.yellow.id = result[i].ID;
                	}
                }
                return deferred.resolve('GO-HEAD');
            }, function (error) {
                console.log(JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };
        
        $scope.suppliersLov = [];
        sy.GetTableRows("Select * From Ic_Vendors Where Div_No = ? And Active = 'Y' Order By Vendor_Number",[$rootScope.globals.currentUser.divNo]).then(function(result){
            $scope.suppliersLov = result;
        }); 
        
        function updateFeedback (id,cons) {
			var deferred = $q.defer();
            var sql=" Update MM_FLIGHT_CONSUMPTIONS                 " +
                    "    Set Id               = ?                   " +
                    "  Where Consumption_Type = ?                   " +
                    "    And Flight_Id        = ?;                  ";
            var parameters = [id,cons.consumptionType,$rootScope.MM_M052_id]
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                return deferred.resolve('GO-HEAD');
            }, function (error) {
                console.log(JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };
        $scope.saveFuelConsumption = function () {
			var deferred = $q.defer();
			if (WingsUtil.IsNull($scope.consumption.added) || WingsUtil.IsNull($scope.consumption.density)) {
                return deferred.resolve("GOHEAD");
        	} 
        	if ($scope.hasConsumption == '') {
        		 if (WingsUtil.IsNull($scope.consumption.date)){
                     WingsDialogService.error('Date is required !');
                     return deferred.resolve("GOHEAD");
                 }
                 if ($scope.consumption.density > 2) {
               	    WingsDialogService.error('Density must be in a valid range.');
                    return deferred.resolve("GOHEAD");
                 }
                var sql = "Update MM_FLIGHT_CONSUMPTIONS                " +
                          "   Set Div_No                   = ?,         " +
                          "       No_Refuelling_Flag       = ?,         " +
                          "       Vendor_Number            = ?,         " +
                          "       Vendor_Name              = ?,         " +
                          "       Consumption_Type         = ?,         " +
                          "       Density                  = ?,         " +
                          "       Arrival                  = ?,         " +
                          "       Added                    = ?,         " +
                          "       Departure                = ?,         " +
                          "       Remaining                = ?,         " +
                          "       Consumption_Date         = ?,         " +
                          "       Mobile_Record_Status     = ?          " +
                          " Where Flight_Id                = ?          " +
                          "   And Mobile_Record_Id         = ?;         ";

                if($scope.consumption.noRefuellingFlag) {
                    reset();
                }
                var parameters = [ $rootScope.globals.currentUser.divNo,
                                   $scope.consumption.noRefuellingFlag,
                                   $scope.consumption.vendor.vendorNumber,
                                   $scope.consumption.vendor.vendorName,
                                   'FUEL',
                                   $scope.consumption.density,
                                   $scope.consumption.arrival,
                                   $scope.consumption.added,
                                   $scope.consumption.departure,
                                   $scope.consumption.remaining,
                                   moment($scope.consumption.date).format('YYYY-MM-DD HH:mm'),
                                   'READY',
                                   $scope.flight.flightId,
                                   $scope.consumption.id];
        	} else {
        		var sql=" Insert Into MM_FLIGHT_CONSUMPTIONS (Div_No,No_Refuelling_Flag,Vendor_Number,Vendor_Name,Fuel_Type,Density,Arrival,Added,Departure,Remaining,Consumption_Date,Flight_Id,Mobile_Record_Status,Consumption_Type) "+
    					" Values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		        if($scope.consumption.noRefuellingFlag) {
		            reset();
		        }
		        console.log('$scope.consumption.date'+$scope.consumption.date);
		        var parameters = [ $rootScope.globals.currentUser.divNo,
		                           $scope.consumption.noRefuellingFlag,
		                           $scope.consumption.vendor.vendorNumber,
		                           $scope.consumption.vendor.vendorName,
		                           '',
		                           $scope.consumption.density,
		                           $scope.consumption.arrival,
		                           $scope.consumption.added,
		                           $scope.consumption.departure,
		                           $scope.consumption.remaining,
		                           $scope.consumption.date != '' ? moment($scope.consumption.date).format('YYYY-MM-DD HH:MM'):'',
		                           $scope.flight.flightId,
	                               'READY',
		                           'FUEL'];
            }
        	WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
                WingsDialogService.success();
                return deferred.resolve("GOHEAD");
            }, function (error) {
                console.log(JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
        	return deferred.promise;
        };
        $scope.saveOilConsumption = function () {
        	var deleteSql = "Delete From Mm_Flight_Consumptions where Consumption_Type != 'FUEL' and Flight_Id = ?";
            WingsTransactionDBService.executeSql(deleteSql,[$rootScope.MM_M052_id]).then(function (deleteResult){
            	function Consumption () {
                	var consumption = {
                    		divNo           : $rootScope.globals.currentUser.divNo,
                    		consumptionDate : new Date(moment().format('DD MMMM YY, HH:mm')),
                    		consumptionType : '',
                    		arrival         : '',
                    		added           : '',
                    		id              : ''
                    }
                	return consumption;
                }
                var consArr = [];
            	var eng1             = new Consumption();
            	eng1.consumptionType = 'ENG-1';
            	eng1.arrival         = WingsUtil.IsNull($scope.fuels.eng1.arrival)?'':$scope.fuels.eng1.arrival;
            	eng1.added           = WingsUtil.IsNull($scope.fuels.eng1.added)?'':$scope.fuels.eng1.added;
            	eng1.id              = $scope.fuels.eng1.id;
            	consArr.push(eng1);
            	var eng2             = new Consumption();
            	eng2.consumptionType = 'ENG-2';
            	eng2.arrival         = WingsUtil.IsNull($scope.fuels.eng2.arrival)?'':$scope.fuels.eng2.arrival;
            	eng2.added           = WingsUtil.IsNull($scope.fuels.eng2.added)?'':$scope.fuels.eng2.added;
            	eng2.id              = $scope.fuels.eng2.id;
            	consArr.push(eng2);
            	var apu             = new Consumption();
            	apu.consumptionType = 'APU';
            	apu.arrival         = WingsUtil.IsNull($scope.fuels.apu.arrival)?'':$scope.fuels.apu.arrival;
            	apu.added           = WingsUtil.IsNull($scope.fuels.apu.added)?'':$scope.fuels.apu.added;
            	apu.id              = $scope.fuels.apu.id;
            	consArr.push(apu);
            	var idg2             = new Consumption();
            	idg2.consumptionType = 'IDG-1';
            	idg2.arrival         = '';
            	idg2.added           = WingsUtil.IsNull($scope.fuels.idg1.added)?'':$scope.fuels.idg1.added;
            	idg2.id              = $scope.fuels.idg1.id;
            	consArr.push(idg2);
            	var idg2             = new Consumption();
            	idg2.consumptionType = 'IDG-2';
            	idg2.arrival         = '';
            	idg2.added           = WingsUtil.IsNull($scope.fuels.idg2.added)?'':$scope.fuels.idg2.added;
            	idg2.id              = $scope.fuels.idg2.id;
            	consArr.push(idg2);
            	var blue             = new Consumption();
            	blue.consumptionType = 'HYD-B';
            	blue.arrival         = '';
            	blue.added           = WingsUtil.IsNull($scope.fuels.hyd.blue.added)?'':$scope.fuels.hyd.blue.added;
            	blue.id              = $scope.fuels.hyd.blue.id;
            	consArr.push(blue);
            	var green             = new Consumption();
            	green.consumptionType = 'HYD-G';
            	green.arrival         = '';
            	green.added           = WingsUtil.IsNull($scope.fuels.hyd.green.added)?'':$scope.fuels.hyd.green.added;
            	green.id              = $scope.fuels.hyd.green.id;
            	consArr.push(green);
            	var yellow             = new Consumption();
            	yellow.consumptionType = 'HYD-Y';
            	yellow.arrival         = '';
            	yellow.added           = WingsUtil.IsNull($scope.fuels.hyd.yellow.added)?'':$scope.fuels.hyd.yellow.added;
            	yellow.id              = $scope.fuels.hyd.yellow.id;
            	consArr.push(yellow);
            	$scope.consArr = consArr;
            	var promises   = [];
                for (var i = 0; i<consArr.length; i++) {
                    promises.push(insertConsumption(consArr[i]));
                }
                $q.all(promises).then(function(res) {
                    WingsDialogService.success();
    			    $rootScope.$emit('onflightcreate');
                	getConsumptions();
                },function(error) {
                    console.log("PROMISES  - ERROR"+JSON.stringify(error));
                });
            },function(deleteError){
            	 console.log("PROMISES  - ERROR"+JSON.stringify(deleteError));
            });
        };
        $scope.saveConsumptions = function () {
        	$scope.saveFuelConsumption();
        	$scope.saveOilConsumption();
        };
        $scope.Delete = function () {
            var buttonArray= ['Ok','Cancel'];
            WingsDialogService.confirm('Are you sure to delete record?','Confirm',buttonArray).then(function(buttonIndex) {
                // no button = 0, 'Ok' = 1, 'Cancel' = 2
                var btnIndex = buttonIndex;
                if(buttonIndex == 1) {
                    var sql = "Delete From MM_FLIGHT_CONSUMPTIONS " +
                              " Where Flight_Id = ?               " +
                              "   And Mobile_Record_Id = ?        ";
                    var parameters = [$scope.flight.flightId, $scope.consumption.id];
                    WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                        reset();
                        $scope.consumption.noRefuellingFlag = false;
                        getConsumptions();
                        return deferred.resolve("GOHEAD");
                    }, function (error) {
                        console.log(JSON.stringify(error));
                        return deferred.reject("Login-Error : " +JSON.stringify(error));
                    });
                    return deferred.promise;
                }
            });
        };
        function reset () {
            $scope.consumption = {
                    vendor : {
                        vendorNumber : '',
                        vendorName   : ''
                    },
                    noRefuellingFlag : true,
                    fuelType         : 'FUEL',
                    consumptionType  : 'FUEL',
                    upliftUnit       : '',
                    density             : '',
                    arrival             : '',
                    added             : '',
                    departure         : '',
                    remaining         : '',
                    date             : '',
                    flightId         : $scope.flight.flightId,
                    calcFuel         : '',
                    indicated         : '',
                    difference         : ''
            }
        };
        function insertConsumption (cons) {
            var deferred = $q.defer();
            if(!WingsUtil.IsNull(cons.id)){
        	var sql= "Insert Into MM_FLIGHT_CONSUMPTIONS (DIV_NO,                 " +
        			 "                                    CONSUMPTION_TYPE,       " +
        			 "                                    ARRIVAL,                " +
        			 "                                    ADDED,                  " +
        			 "                                    CONSUMPTION_DATE,       " +
        			 "                                    ID,                     " +
        			 "                                    MOBILE_RECORD_STATUS,   " +
        			 "                                    FLIGHT_ID)              " +
			         "     Values (?,?,?,?,?,?,?,?)                                   ";
		    var parameters = [cons.divNo,cons.consumptionType,cons.arrival,cons.added, cons.consumptionDate,cons.id,'READY',$rootScope.MM_M052_id]
            }else{
            	var sql= "Insert Into MM_FLIGHT_CONSUMPTIONS (DIV_NO,                 " +
	   			 "                                    CONSUMPTION_TYPE,       " +
	   			 "                                    ARRIVAL,                " +
	   			 "                                    ADDED,                  " +
	   			 "                                    CONSUMPTION_DATE,       " +
    			 "                                    MOBILE_RECORD_STATUS,   " +
	   			 "                                    FLIGHT_ID)              " +
		         "     Values (?,?,?,?,?,?,?)                                   ";
	    var parameters = [cons.divNo,cons.consumptionType,cons.arrival,cons.added, cons.consumptionDate,'READY',$rootScope.MM_M052_id]
            }
		    WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                return deferred.resolve('GO-HEAD');
		    }, function (error) {
                return deferred.reject("Login-Error : " +JSON.stringify(error));
		        console.log(JSON.stringify(error));
		    });
            return deferred.promise;
        }
        getConsumptions();
        $scope.vendorOnselect = function(newValue,oldValue){
            $scope.consumption.vendor.vendorNumber = newValue.VENDOR_NUMBER;
            $scope.consumption.vendor.vendorName = newValue.VENDOR_NAME;
        };
        $scope.AcceptDiscrepancy = function (id) {
        	if(!$scope.disabled){
                var sql = " Update Mm_Discrepancies set Accepted_Flights = Accepted_Flights || ? || ','   " +
                          "  Where Mobile_Record_Id = ?;                                                  ";
                var parameters = [$rootScope.MM_M051_id,id];
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    getAcceptenceDiscrepancy();
                    return deferred.resolve("GOHEAD");
                }, function (error) {
                    WingsDialogService.error(JSON.stringify(error));
                    console.log('MM_0100 - AcceptDiscrepancy - ERROR'+JSON.stringify(error));
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });   
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
        			$scope.saveInspection();
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
        $scope.showModal = function (action) {
	    	$scope.isModalActive = true;
	        $scope.modal.show();
	        $scope.user.password = '';
	        if (!WingsUtil.IsNull($scope.canvas)) {
	        	$scope.canvas.clear();
	        	$scope.canvas.backgroundColor="#f5f2f0";
	        	$scope.canvas.renderAll();
	        } else {
	            $scope.canvas = new fabric.Canvas ('m052fd');
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