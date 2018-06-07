angular.module('WingsMobileStarter').controller('MM_M051.FlightDetails', [
    '$scope',
    'WingsUtil',
    'WingsDialogService',
    '$filter',
    'WingsTransactionDBService',
    '$ionicHistory',
    'WingsPouchDbSetupService',
    '$ionicSlideBoxDelegate',
    'WingsRemoteDbService',
    '$ionicModal',
    '$ionicLoading',
    '$q',
    'md5',
    '$ionicPopover',
    '$ionicBackdrop',
    '$ionicTabsDelegate',
    'sy',
    function($scope,WingsUtil,WingsDialogService,$filter,WingsTransactionDBService,$ionicHistory,WingsPouchDbSetupService,$ionicSlideBoxDelegate,WingsRemoteDbService,$ionicModal,$ionicLoading,$q,md5,$ionicPopover,$ionicBackdrop,$ionicTabsDelegate,sy) {
        console.log("MM_M051.FlightDetails");
        $scope.disabled = false;
        $scope.numberOfDiscrepanciesToDisplay = 20;
        $scope.user = {
        		username:$rootScope.globals.currentUser.userId,
        		password:''
        };
        $scope.addMoreDiscrepancies = function(done) {
            if ($scope.discrepancies != undefined && $scope.discrepancies.length > $scope.numberOfDiscrepanciesToDisplay) {
                $scope.numberOfDiscrepanciesToDisplay += 20;
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };
        $scope.$on("$ionicSlides.sliderInitialized", function(event, data) {
            $scope.slider = data.slider;
            $ionicSlideBoxDelegate.update();
        });
        $scope.$on("$ionicSlides.slideChangeStart", function(event, data){
        	if (!$scope.ischangeOnClick){
        		$scope.activeSlideIndex = data.slider.activeIndex;
        		 $timeout(function() {
        			 $ionicTabsDelegate.select($scope.activeSlideIndex , false);
                 }, 50);  
        	}
        	$scope.ischangeOnClick = false;
        	});
        /*$scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
        	  // note: the indexes are 0-based
        	  if (data.slider.previousIndex == 1) {
        		  $scope.saveFlightDetails();
        	  } else if (data.slider.previousIndex == 2) {
        		  $scope.saveCrews();
        	  } else if (data.slider.previousIndex == 3) {
        		  $scope.saveConsumption();
        	  }
        });*/
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams, error) {
            if (fromState.name == 'app.MM_M087') {
                $scope.disabled = true;
            }
        });
        $scope.$on('refreshFlight', function() {
            getFlight();
        });
        var removeListener = $rootScope.$on('refreshFlightDetail', function(){
      	  $timeout(function() {
                getFlight();
            },100);

          // Remove listener
          removeListener();
      });
        $scope.switchSlider = function (index) {
        	if ($scope.activeSlideIndex != index){
            	$scope.ischangeOnClick = true;
        	}
        	$scope.activeSlideIndex = index;
            $scope.slider.slideTo(index, 200);
            $ionicTabsDelegate.select(index, false);
        };
        $rootScope.$ionicGoBack = function() {
        	if ($ionicHistory.currentStateName() != 'app.MM_M055') {
	            if ($scope.slider.activeIndex == 0) {
	            	$('#m051').siblings('.upper-canvas').remove();
	            	$('#m051').parent('.canvas-container').before($('#m051'));
	            	$('.canvas-container').remove();
	                $ionicHistory.goBack();
	            } else {
	                $scope.slider.slideTo(0, 200);
	                $ionicTabsDelegate.select(0, false);
	            }
        	} else {
            	$('#m051').siblings('.upper-canvas').remove();
            	$('#m051').parent('.canvas-container').before($('#m051'));
            	$('.canvas-container').remove();
        		$ionicHistory.goBack();
        	}
        };
      /*  function updateParentStatus (){
        	var deferred = $q.defer();
                var sql = " Update Mm_Flights Set Mobile_Record_Status = 'READY' where id = ?";
                WingsTransactionDBService.executeSql(sql,[$rootScope.MM_M051_id]).then(function (res){
                    return deferred.resolve(res);
                }, function (error) {return deferred.reject(error);});
        	return deferred.promise;
        }*/
        $scope.disabled = false;
        $scope.fuel     = false;
        $scope.antiIce  = false;
        $scope.eng1Oil  = false;
        $scope.eng2Oil  = false;
        $scope.apuOil   = false;
        $scope.idg1     = false;
        $scope.idg2     = false;
        $scope.hyd      = false;
        $scope.expand = function(prop) {
            eval("$scope."+ prop +"="+"!$scope."+ prop );
        };
        $scope.flight = {
                tailNumber     : '',
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
                controlNumber  : '',
                inspection : {
                    date       :'',
                    number     :'',
                    type       : ''
                }
        };
        $scope.isFlightAcceptable  = true;
        $scope.hasConsumption      = '!';
        $scope.hasInspection       = '!';
        $scope.hasCrew             = '!';
        $scope.hasOpenDefect       = '';

        $scope.isAcceptanceWarning = false;
        
        function checkFlightAcceptence () {
        	if (!WingsUtil.IsNull($scope.validationCriteria)) {
        		var obj = $scope.validationCriteria.split('|');
            	var i;
            	var criteria = "$scope.hasInspection=='!'";

    			for (i in obj) {
    				if (obj[i] == 'PFC-REQUIRED') {
    	        	} else if (obj[i] == 'FUEL-REQUIRED') {
    					criteria += "||$scope.hasConsumption=='!'"
    	        	} else if (obj[i] == 'NO-OPEN-ITEM') {
    					criteria += "||$scope.hasOpenDefect=='!'"
    	        	} else if (obj[i] == 'NO-OPEN-CABIN-ITEM') {
    	        		
    	        	} else if (obj[i] == 'NO-OPEN-MAREP-ITEM') {
    	        		
    	        	} else if (obj[i] == 'NO-OPEN-PIREP-ITEM') {
    	        		
    	        	} else if (obj[i] == 'CREW-REQUIRED') {
    	        		criteria += "|| $scope.hasCrew == '!'"
    	        	}
    			}
            	
                if ( eval(criteria)) {
                    $scope.isFlightAcceptable = true;
                } else {
                    $scope.isFlightAcceptable = false;
                }
        	}
        }
        $scope.AcceptFlight = function () {
        	$scope.signWhat = 'ACCEPT';
            var buttonArray= ['Ok','Cancel'];
        	if ($scope.digitalSign != true) {
        		$scope.showModal();
        		return false;
        	} else {
        		$scope.hide();
                var sql = " Update Mm_Flights                       " +
                		  "    Set Status = 'ACCEPTED',             " +
                		  "     Accept_Date                 = ?,    " +
                		  "     Accepted_By_Employee_Number = ?,    " +
                		  "     MOBILE_RECORD_STATUS        = ?     " +
                          "  Where Id = ?                           " ;
                var parameters = [moment().format('YYYY-MM-DD HH:MM'),$rootScope.globals.currentUser.userNumber,'READY',$scope.flight.flightId];
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    try {
                    	var deferred = $q.defer();
                        var runtachOptions = {
                            parent     : 'MM_FLIGHTS',
                            parentId   : $scope.flight.flightId,
                            imageType  : 'IMAGE',
                            fileType   : 'pdf', //pdf|image  TODO image is not available yet
                            programId  : 'MM_558',
                            parameters : {
                                P_FLIGHT_ID : $scope.flight.flightId
                            }
                        };
                        
                        sy.RunTach(runtachOptions).then(function(result){  //returns image ID from remote gn_images
                        	 $scope.isAccepted = true;
                             $scope.flight.status = 'ACCEPTED';
                             $scope.$emit('refreshFlight');
                             $rootScope.$emit('onflightcreate');
                            if (result > 0) {
                                WingsDialogService.success();
                                $timeout(function () {
                                	getAttachments();
                                },2000);
                            } else 
                                WingsDialogService.error("FAILED");
                        },function(error){
                            WingsDialogService.error(error);
                        });
                    } catch (e) {
                    	
                    }
                        
                    
                    
                    
                    return deferred.resolve("GOHEAD");
                }, function (error) {
                    WingsDialogService.error(JSON.stringify(error));
                    console.log('MM_0100 - AcceptDiscrepancy - ERROR'+JSON.stringify(error));
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });  
            }
        };
        $scope.CompleteFlight = function () {
            $rootScope.MM_M051_viewMode ='complete';
            $state.go('app.MM_0051_Flight');
        };

        function getFlight () {
        	$rootScope.$broadcast('loading:show');
            var sql = "Select *                         " +
                      " From Mm_Flights                 " +
                      "Where ID = ?       " ;
            var parameters = [$rootScope.MM_M051_id];
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
            	var actualOffBlock = '';
            	var actualOnBlock = '';
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
                if (result[0].STATUS == 'COMPLETED' || result[0].CLOSE_DATE != ''){

                //if((result[0].STATUS == 'COMPLETED' || result[0].CLOSE_DATE != '') && result[0].MOBILE_RECORD_STATUS == 'LOADED'){
                    $scope.disabled = true;
                }
                $scope.flight = {
                        tailNumber            : result[0].TAIL_NUMBER,
                        flightNumber          : result[0].FLIGHT_NUMBER,
                        serialNumber          : result[0].SERIAL_NUMBER,
                        actualDate            : WingsUtil.IsNull(result[0].ACTUAL_DATE)?new Date(result[0].SCHEDULE_DATE):new Date(result[0].ACTUAL_DATE),
                        actualFrom            : WingsUtil.IsNull(result[0].ACTUAL_FROM)?result[0].SCHEDULED_FROM:result[0].ACTUAL_FROM,
                        actualTo              : WingsUtil.IsNull(result[0].ACTUAL_TO)?result[0].SCHEDULED_TO:result[0].ACTUAL_TO,
                        actualOffBlock        : WingsUtil.IsNull(result[0].ACTUAL_OFF_BLOCK)?moment(result[0].SCHEDULED_OFF_BLOCK).format('HH:mm'):moment(result[0].ACTUAL_OFF_BLOCK).format('HH:mm'),
                        actualTakeOff         : WingsUtil.IsNull(result[0].ACTUAL_TAKE_OFF)?'':moment(result[0].ACTUAL_TAKE_OFF).format('HH:mm'),
                        actualLanding         : WingsUtil.IsNull(result[0].ACTUAL_LANDING)?'':moment(result[0].ACTUAL_LANDING).format('HH:mm'),
                        actualOnBlock         : WingsUtil.IsNull(result[0].ACTUAL_ON_BLOCK)?moment(result[0].SCHEDULED_OFF_BLOCK).format('HH:mm'):moment(result[0].ACTUAL_ON_BLOCK).format('HH:mm'),
                        status                : result[0].STATUS,
                        aircraftType          : '',
                        controlNumber         : result[0].CONTROL_NUMBER,
                        delaysArr             : [],
                        delayReason           : result[0].DELAY_REASON,
                        delayTime             : result[0].DELAY_TIME,
                        lowVisibilityStatus   : result[0].LOW_VISIBILITY_STATUS,
                        reducedVisibilityFlag : result[0].REDUCED_VISIBILITY_FLAG,
                        internalComment       : result[0].INTERNAL_COMMENT,
                        flightId              : result[0].ID,
                        mobileFlightId        : result[0].MOBILE_RECORD_ID
                };
                var delayReasons = $scope.flight.delayReason.split(';');
                var delayTimes = $scope.flight.delayReason.split(';');
                for (var i = 0;i<delayReasons.length;i++) {
                	$scope.flight.delaysArr.push({
                		id          : i,
                		delayReason : delayReasons[i],
                        delayTime   : WingsUtil.IsNull(delayTimes[i])?'':Number(delayTimes[i])
                	});
                	$scope.delayIndex = i;
                }
                if($scope.flight.delaysArr.length < 1){
            		$scope.addNewDelay();
            	}
                getInspection();
                getConsumptions();
                getAircraftType();
                flightHasCrews();
                //getCrews(); Pouch db getcrewtype dublication.
                getFlexFields();
                getAttachments();
            	$rootScope.$broadcast('loading:hide');
            }, function (error) {
                WingsDialogService.error(JSON.stringify(error));
                console.log(JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };
        getFlight();
        
        function getAircraftType () {
            sy.GetTableRows("Select * From Pr_Aircrafts Where Div_No = ? And Engineering_Flag = ? And Tail_Number = ? And Active = 'Y' Order By Tail_Number",[$rootScope.globals.currentUser.divNo,'Y',$scope.flight.tailNumber]).then(function(result){
                if (result.length > 0) {
                    $scope.flight.aircraftType =  result[0].AIRCRAFT_TYPE;
                }
            });
        };
        
        sy.GetTableRows("Select * From Mm_Discrepancy_Types Where Div_No = ? And Active = 'Y' And (Pirep_Flag = ? Or Marep_Flag = ?) Order By Discrepancy_Type",[$rootScope.globals.currentUser.divNo,'Y','Y']).then(function(result){
            $scope.discrepancyTypes = result;
            $scope.getDiscrepancies();
        }); 
        $scope.employees = [];
        sy.GetTableRows("Select * From Lb_Employees Where Div_No = ? And Active = 'Y' And (Resource_Type = ? Or Resource_Type = ?) Order By Employee_Number",[$rootScope.globals.currentUser.divNo,'PILOT','CABIN-CREW']).then(function(result){
            $scope.employees = result;
        });
        
        sy.GetTableRows("Select * From Sy_Environment Where Active = 'Y' And (Symbol = ? Or Symbol = ?) Order By Symbol",['AIRCRAFT-FLIGHT-ACCEPT-VALIDATIONS','FLIGHT-CREW-RULES']).then(function(result){
            $scope.validationCriteria =  result[0].VALUE;
            var crewRulesCrtiteria =  result[1] != undefined ? result[1].VALUE:'';
            var crewRules = crewRulesCrtiteria.split('|');
            $scope.crewShow = false;
            if (crewRules[0] == 'DUTY-TIME-VISIBLE') {
                $scope.crewShow = true;
            }
            checkFlightAcceptence();
        });
        
        $scope.toggle = function (prop) {
            eval("$scope."+ prop +"="+"!$scope."+ prop );
        };
        $scope.delays = [];
        
        sy.GetTableRows("Select * From Mm_Delay_Reasons Where Div_No = ? And Active = 'Y' Order By Delay_Reason",[$rootScope.globals.currentUser.divNo]).then(function(result){
            $scope.delays = result;
        });
        
        //INSPECTION
        $scope.isPfcShown = true;
        $scope.isLpfcShown = true;
        $scope.inspection = {
                date   : '',
                number : $rootScope.globals.currentUser.userNumber,
                name   : $rootScope.globals.currentUser.userName,
                type   : 'PRE-FLIGHT'
        };
        /*$scope.lastInspection = {
                Inspection_Date:'',
                Inspector_Number:'',
                Employee_Name:''
        };*/
        function getInspection () {
            var sql = " Select a.Inspection_Date   Inspection_Date,    " +
                      "        a.Inspector_Number  Inspector_Number,   " +
                      "        a.Inspection_Type   Inspection_Type,    " +
                      "        b.Employee_Name     Inspector_Name      " +
                      "  From  Mm_Flight_Inspections a Left Outer Join " +
                      "        Lb_Employees          b                 " +
                      "    On b.Div_No          = a.Div_No             " +
                      "   And b.Employee_Number = a.Inspector_Number   " +
                      " Where a.Div_No          = ?                    " +
                      "   And a.Inspection_Type = 'PRE-FLIGHT'         " +
                      "   And a.Flight_Id       = ?                    " +
                      "   And b.Div_No          = a.Div_No             " +
                      "   And b.Employee_Number = a.Inspector_Number   "; 
            
           var parameters = [$rootScope.globals.currentUser.divNo,$scope.flight.flightId]
           console.log(sql);
           WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
               if (result.length > 0) {
                   $scope.hasInspection = '';
                   $scope.inspection.date = new Date(moment(result[0].Inspection_Date).format('DD MMMM YY, HH:mm'));
                   $scope.inspection.number = result[0].Inspector_Number;
                   $scope.inspection.type = result[0].Inspection_Type;
                   $scope.inspection.name = result[0].Inspector_Name;
                   
               } else {
                   $scope.hasInspection = '!';
                   //$scope.inspection.name = '';
                   //$scope.inspection.number = '';
                   $scope.inspection.date = '';
               }
               checkFlightAcceptence ();
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
       	   $scope.signWhat = 'PFC';
           if ($scope.inspection.date == '' || $scope.inspection.date == undefined) {
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
                             "     Values (?,?,?,?,?,?)                                                                               ";
                   var parameters = [$rootScope.globals.currentUser.divNo,
                	                 moment($scope.inspection.date).format('YYYY-MM-DD HH:mm'),
                                     $scope.inspection.number,
                                     'PRE-FLIGHT',
                                     'READY',
                                     $scope.flight.flightId];
                   WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                       WingsDialogService.success();
                       getInspection();
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
       //FLIGHT DETAILS
       $scope.addNewDelay = function (index) {
       		if ($scope.flight.delaysArr.length < 1){	
           		$scope.delayIndex++;
           		$scope.flight.delaysArr.push({
                       id : $scope.delayIndex,
                       delayReason : '',
                       delayTime : null
                   });
           	} else{
       	        var currentObject = $scope.flight.delaysArr[index-1];
       	        if (!WingsUtil.IsNull(currentObject.delayReason) && !WingsUtil.IsNull(currentObject.delayTime)){
                       $scope.delayIndex++;
                       $scope.flight.delaysArr.push({
                           id : $scope.delayIndex,
                           delayReason : '',
                           delayTime : null
                       });
       	        }
       	    }
       };
       $scope.activateDelete = function (object){
       	    if ($scope.delayIndex <= 1) return false;
       	    object.showDelete = true;
       };
       $scope.removeDelay = function (index) {
               if ($scope.delayIndex <= 0) return false;
               $.each ($scope.flight.delaysArr, function(i){
                   if ($scope.flight.delaysArr[i].id == index.id) {
                	   $scope.flight.delaysArr.splice(i,1);
                       $scope.delayIndex--;
                       return false;
                   }
               });
               $.each ($scope.flight.delaysArr, function(i){
            	   $scope.flight.delaysArr[i].id = i;
               });                 
       };
       $scope.saveFlightDetails = function () {
           /*if($scope.inspection.date == '' || $scope.inspection.date == undefined) {
               WingsDialogService.error('Date field is required !');
               return false;
           }*/
           var sql = "Update MM_FLIGHTS                         " +
                     "   Set Delay_Reason          = ?,         " +
                     "       Delay_Time            = ?,         " +
                     "       Low_Visibility_Status = ?,         " +
                     "       Internal_Comment      = ?,         " +
                     "       Mobile_Record_Status  = ?          " +
                     " Where Id                    = ?          ";
           var parameters = [_.map($scope.flight.delaysArr, 'delayReason').join(';'),
        	                 _.map($scope.flight.delaysArr, 'delayTime').join(';'),
                             $scope.flight.lowVisibilityStatus,
                             $scope.flight.internalComment,
                             'READY',
                             $scope.flight.flightId];
           WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
               $rootScope.$emit('refreshFlightList');
               $scope.saveFlexFields();
           }, function (error) {
               WingsDialogService.error(JSON.stringify(error));
               console.log(JSON.stringify(error));
           });
       };
       $scope.saveFlexFields = function () {
           var bindings = [];
           var sql = "INSERT OR REPLACE INTO Gn_Form_Data (Mobile_Record_Id,         " +
                     "                                     Div_No,                   " +
                     "                                     Parent,                   " +
                     "                                     Parent_Id,                " +
                     "                                     Column_Id,                " +
                     "                                     Data)                     " +
                     " Values (?,?,?,?,?,?)                                          " ;
           var temp = [];
           for (var i = 0;i<$scope.dynamicFields.length;i++) {
              temp = _.concat(temp , $scope.dynamicFields[i])
           }
           for (var i = 0;i<temp.length;i++) {
               var parameters = [temp[i].ID,
                                 $rootScope.globals.currentUser.divNo,
                                 'MM_FLIGHTS',
                                 $scope.flight.flightId,
                                 temp[i].COLUMN_ID,
                                 temp[i].VALUE];
               bindings.push(parameters);
           }
           WingsTransactionDBService.insertCollection(sql,bindings).then(function (result){
               WingsDialogService.success();
               //updateParentStatus();
               getFlexFields();
           }, function (error) {
               console.log('ERROR:'+error);
           });
       };
       function getFlexFields (column) {
           var deferred   = $q.defer();
           var parameters = [];
           var sqlColumn = "Select a.FORM_ID,                                                                                                                          " +
                           "       a.COLUMN_SEQUENCE,                                                                                                                  " +
                           "       a.COLUMN_ID,                                                                                                                        " +
                           "       a.PROMPT,                                                                                                                           " +
                           "       a.TYPE,                                                                                                                             " +
                           "       a.STYLE COLUMN_STYLE,                                                                                                               " +
                           "       case when a.STYLE='C' then 'text' when a.STYLE='N' then 'number' when a.STYLE='D' then 'date' end as STYLE,                         " +
                           "       (Select Data from gn_Form_Data as b where b.Parent = a.form_Id and b.Column_Id=a.Column_Id and b.Parent_Id = ?) VALUE,              " +
                           "       (Select Mobile_Record_Id from gn_Form_Data as b where b.Parent = a.form_Id and b.Column_Id=a.Column_Id and b.Parent_Id = ?) ID,     " +
                           "       a.DATA_SIZE                                                                                                                         " +
                           " From Gn_Form_Columns as a                                                                                                                 " +
                           "Where a.Active  = 'Y'                                                                                                                      " +
                           "  And a.Div_No  =  ?                                                                                                                       " +
                           "  And a.Form_Id = 'MM_FLIGHTS';                                                                                                            ";
                           
           WingsTransactionDBService.executeSql(sqlColumn,[$scope.flight.flightId,$scope.flight.flightId,$rootScope.globals.currentUser.divNo]).then(function (result){
        	   $scope.antiIceFields = [];
               result.forEach(function (item) {
                   if (!WingsUtil.IsNull(item.VALUE) && item.COLUMN_STYLE == 'N') {
                       item.VALUE = Number(item.VALUE);
                   } else if (!WingsUtil.IsNull(item.VALUE) && item.COLUMN_STYLE == 'D') {
                       item.VALUE = new Date(item.VALUE);
                   }
                   if (item.COLUMN_ID.indexOf('ANTI_ICE') > -1) {
                	   $scope.antiIceFields.push(item);
                   }
               });
               $scope.antiIceFields = _.chunk($scope.antiIceFields, 2);
               $scope.dynamicFields = _.chunk(result, 2);
              return deferred.resolve("GOHEAD");
          }, function (error) {
              console.log('MM_0100 - Flight - ERROR'+JSON.stringify(error));
              return deferred.reject("Login-Error : " +JSON.stringify(error));
          });
          return deferred.promise;
       };

       //CREW
       sy.GetTableRows("Select * From Mm_Crew_Types Where Div_No = ? And Active = 'Y' Order By Sort_Order",[$rootScope.globals.currentUser.divNo]).then(function(result){
           var typesArr = [];
           for (i in result) {
               var crewObj = {
                   title          : result[i].CREW_TYPE,
                   employeeNumber : '',
                   employeeName   : '',
                   startDate      : '',
                   finishDate     : '',
                   hour           : ''
               }
               typesArr.push(crewObj);
           } 
           $scope.crews = typesArr;
           getCrews();
       }); 
       
       $scope.crewOnselect = function (object,newValue,oldValue) {
           var i = _.findIndex($scope.crews , function(o) { return o.employeeName == newValue.EMPLOYEE_NAME; });
           if (i < 0) {
               object.employeeNumber = newValue.EMPLOYEE_NUMBER;
               object.employeeName   = newValue.EMPLOYEE_NAME;
           } else {
               WingsDialogService.error('Same person selected for multiple roles at the same time.');
           }
       };
       $scope.calculateCrewHour = function (object) {
           if (!WingsUtil.IsNull(object.finishDate) && !WingsUtil.IsNull(object.startDate)) {
               var tempDate = (object.finishDate - object.startDate)/60000;
               object.hour  = Math.floor(tempDate/60)+':'+(tempDate%60<10?'0'+tempDate%60:tempDate%60);
           }
       };
       $scope.copyCrew = function (object) {
           for (var i = 0; i<$scope.crews.length; i++) {
               if (!WingsUtil.IsNull($scope.crews[i].startDate) && !WingsUtil.IsNull($scope.crews[i].finishDate) && !WingsUtil.IsNull($scope.crews[i].employeeName)){
                   object.startDate  = $scope.crews[i].startDate
                   object.finishDate = $scope.crews[i].finishDate
                   $scope.calculateCrewHour(object);
                   return;
               }
           }
           WingsDialogService.error('You have to fill task to copy !');
       };
       function parseDate (date) {
           if (!WingsUtil.IsNull(date)) {
               var t = date.split(/[- :]/);
               var d = new Date(t[0], t[1]-1, t[2], t[3], t[4]);
               var actiondate = new Date(d);
               return actiondate;
           }
       };
       function flightHasCrews () {
           var sql = " Select Id    " +
                     "   From Mm_Flight_Crews    " +
                     "  Where Flight_Id = ?      " ;
           var parameters = [$scope.flight.flightId];
           WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
               if (result.length < 1) {
                   $scope.hasCrew  = '!';
               } else {
                   $scope.hasCrew  = '';
               }
           }, function (error) {
               WingsDialogService.error(JSON.stringify(error));
               console.log(JSON.stringify(error));
           });
       };
       function getCrews () {
           var sql = "Select *                 " +
                     "  From Mm_Flight_Crews   " +
                     " Where Flight_Id = ?     " ;
             var parameters = [$scope.flight.flightId];
             WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                 if (result.length<1) {
                     $scope.hasCrew  = '!';
                 } else {
                     $scope.hasCrew  = '';
                 }
                 for (var i=0;i<result.length;i++) {
                     var index = _.findIndex($scope.crews, function(o) { return o.title == result[i].CREW_TYPE; });
                     if (index > -1) {
                         var tempDate = (parseDate(result[i].DUTY_FINISH_DATE)-parseDate(result[i].DUTY_START_DATE))/60000;
                         var crewObj  = {
                                 title          : result[i].CREW_TYPE,
                                 employeeNumber : result[i].EMPLOYEE_NUMBER,
                                 employeeName   : result[i].EMPLOYEE_NAME,
                                 startDate      : result[i].DUTY_START_DATE  != null ? parseDate(result[i].DUTY_START_DATE) : '',
                                 finishDate     : result[i].DUTY_FINISH_DATE != null ? parseDate(result[i].DUTY_FINISH_DATE) : '',
                                 hour           : isNaN(tempDate)?'':Math.floor(tempDate/60)+':'+(tempDate%60<10?'0'+tempDate%60:tempDate%60)
                         }
                         $scope.crews[index] = crewObj
                     }
                 }
                 checkFlightAcceptence();
             }, function (error) {
                 WingsDialogService.error(JSON.stringify(error));
                 console.log(JSON.stringify(error));
             });
             if ($scope.crews != undefined) {
            	 for (var i= 0; i < $scope.crews.length; i++) {
            		 if (WingsUtil.IsNull($scope.crews[i].employeeName) ||WingsUtil.IsNull($scope.crews[i].startDate) ||WingsUtil.IsNull($scope.crews[i].finishDate)) {
            			 $scope.crews[i].employeeNumber = '';
            			 $scope.crews[i].employeeName   = '';
            			 $scope.crews[i].startDate      = '';
            			 $scope.crews[i].finishDate     = '';
            		 }
            	 }
             }
       };
        $scope.saveCrews = function () {
            var sql = "Delete from Mm_Flight_Crews Where Flight_Id = ?";
            var now = moment();
            WingsTransactionDBService.executeSql(sql,[$scope.flight.flightId]).then(function (result){
                var bindings    = [];
                var sqlCrew = "INSERT Into Mm_Flight_Crews (Div_No,Crew_Type,Employee_Number,Employee_Name,Duty_Start_Date,Duty_Finish_Date,Mobile_Record_Status,Flight_Id) "+
                              " Values (?,?,?,?,?,?,?,?)";
                var parameters  = [];
                for (var i=0; i<$scope.crews.length; i++) {
                    if (!WingsUtil.IsNull($scope.crews[i].employeeName)) {
                        parameters = [$rootScope.globals.currentUser.divNo,
                                      $scope.crews[i].title,
                                      $scope.crews[i].employeeNumber,
                                      $scope.crews[i].employeeName,
                                      !WingsUtil.IsNull($scope.crews[i].startDate)?((moment($scope.crews[i].startDate).year(now.year()).month(now.month()).date(now.date())).format('YYYY-MM-DD HH:mm')):'',
                                      !WingsUtil.IsNull($scope.crews[i].finishDate)?((moment($scope.crews[i].finishDate).year(now.year()).month(now.month()).date(now.date())).format('YYYY-MM-DD HH:mm')):'',
                                      'READY',
                                      $scope.flight.flightId];
                        bindings.push(parameters);
                    }
                };
                WingsTransactionDBService.insertCollection(sqlCrew,bindings).then(function (result) {
                     WingsDialogService.success();
                     getCrews();
                }, function (error) {
                    console.log("Save Crew ERROR:"+JSON.stringify(error));
                });
            }, function (error) {
                WingsDialogService.error(JSON.stringify(error));
                console.log(JSON.stringify(error));
            });
        };
      
        /*$scope.deleteCrew = function (id) {
            var sql = "Delete From Mm_Flight_Crews where Mobile_Record_Id = ?;"
            var parameters = [id];
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                getCrews();
            }, function (error) {
                WingsDialogService.error(JSON.stringify(error));
                console.log(JSON.stringify(error));
            });
        };*/
        $scope.clearCrew = function () {
            $scope.crew = {
                type            : '',
                employeeNumber  : '',
                employeeName    : '',
                startDate       : '',
                finishDate      : '',
                hour            : ''
            };
        }
    
        $scope.calculateHours = function (startDate,finishDate) {
            return Math.floor((finishDate - startDate)/60000);
        }
        $scope.calculateHour = function () {
            $scope.crew.hour = Math.floor(($scope.crew.finishDate - $scope.crew.startDate)/60000)
        }
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
                upliftUnit          : '',
                density            : '',
                arrival            : '',
                added              : '',
                departure          : '',
                remaining          : '',
                date               : '',
                flightId           : $scope.flight.flightId,
                uom                : '',
                calcFuel           : '',
                uplift             : '',
                difference         : '',
                fpBurnOff          : ''
        }
        $scope.isConsShown = true;
        
        $scope.getConsumptions = function () {
             getConsumptions();
        };
        $scope.AddAttachment = function () {
            $state.go('app.SY_M002',{uploadOptions: {}});
        };
        function getConsumptions () {
            var deferred = $q.defer();
            var sql=" Select No_Refuelling_Flag,                                   " +
                    "        Consumption_Type,                                     " +
                    "        Fuel_Type,                                            " +
                    "        Departure,                                            " +
                    "        Consumption_Date,                                     " +
                    "        Vendor_Name,                                          " +
                    "        Added,                                                " +
                    "        Density,                                              " +
                    "        Arrival,                                              " +
                    "        Remaining,                                            " +
                    "        Mobile_Record_Id                                      " +
                    "   From MM_FLIGHT_CONSUMPTIONS                                " +
                    "  Where Flight_Id = ?                                         " ;
            var parameters = [$scope.flight.flightId]
            WingsTransactionDBService.executeSql(sql,parameters).then(function(result) {
            	var consumption = {
            			noRefuellingFlag  : '',
            			consumptionType   : '',
            			fuelType          : 'FUEL',
            			departure         : '',
            			date              : '',
            			added             : '',
            			arrival           : '',
            			vendor : {
            				vendorNumber  : '',
            				vendorName    : ''
            			},
            			density           : '',
            			id                : ''
            	};
                if(result.length > 0) {
                	$scope.consumptions = result;
                    for (var i = 0;i<result.length;i++) {
                        if (result[i].NO_REFUELLING_FLAG == "false" || result[i].NO_REFUELLING_FLAG == null ) {
                            consumption.noRefuellingFlag = false;
                        } else {
                            $scope.hasConsumption = '';
                            consumption.noRefuellingFlag = true;
                            $scope.consumption.noRefuellingFlag = true;
                        }
                        if (result[i].NO_REFUELLING_FLAG != "true" && result[i].CONSUMPTION_TYPE == 'FUEL') {
                        
                            $scope.hasConsumption = '';
	                        //consumption.fuelType = result[i].FUEL_TYPE;
	                        consumption.departure            = result[i].DEPARTURE;
	                        consumption.date                 = WingsUtil.IsNull(result[0].CONSUMPTION_DATE)?'':new Date(moment(result[0].CONSUMPTION_DATE).format('DD MMMM YY, HH:mm'));
	                        consumption.consumptionType      = result[i].CONSUMPTION_TYPE;
	                        consumption.added                = result[i].ADDED;
	                        consumption.vendor.vendorName    = result[i].VENDOR_NAME;
	                        consumption.density              = result[i].DENSITY;
	                        consumption.id                   = result[i].MOBILE_RECORD_ID;
	                        consumption.remaining            = result[i].REMAINING;
	                        consumption.arrival              = result[i].ARRIVAL;
	                        $scope.consumption               = consumption;
	                        $scope.calcMass();
	                        $scope.calcDiff();
	                        $scope.calcBurnOff();
                        }
                    }
                } else {
                    $scope.hasConsumption = '!';
                }
                checkFlightAcceptence ();
                return deferred.resolve('GO-HEAD');
            }, function (error) {
                console.log(JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
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
        sy.GetTableRows("Select * From Ic_Vendors Where Div_No = ? And Active = 'Y' Order By Vendor_Number",[$rootScope.globals.currentUser.divNo]).then(function(result){
            $scope.suppliersLov = result;
        }); 

        function getLastConsumption () {
            var divNo = $rootScope.globals.currentUser.divNo;
            var sql = " Select Max(a.Consumption_Date) Consumption_Date,                   " +
                      "        'After Fuel Uplift'     Description,                        " +
                      "        Max(a.Departure)        Amount,                             " +
                      "        ''                      Remaining,                          " +
                      "        Max(a.Density)          Density,                            " +
                      "        1                       Sort_Order                          " +
                      "   From Mm_Flight_Consumptions a,                                   " +
                      "        Mm_Flights             b                                    " +
                      "  Where a.Div_No                = "+divNo                             +
                      "    And b.Div_No                = a.Div_No                          " +
                      "    And b.Mobile_Record_Id      =  (Select Max(x.Mobile_Record_Id)  " +
                      "                                     From Mm_Flights x              " +
                      "                                    Where x.Div_No      = a.Div_No  " +
                      "                                      And x.Mobile_Record_Id < ? )  " +
                      " Union All                                                          " +
                      " Select  Max(b.Actual_Date)     Consumption_Date,                   " +
                      "        'Arrival'               Description,                        " +
                      "        Max(a.Arrival)          Amount,                             " +
                      "        Max(a.Arrival)          Remaining,                          " +
                      "        Max(a.Density)          Density,                            " +
                      "        2                       Sort_Order                          " +
                      "   From Mm_Flight_Consumptions a,                                   " +
                      "        Mm_Flights             b                                    " +
                      "  Where a.Div_No               = "+divNo                              +
                      "    And b.Div_No               = a.Div_No                           " +
                      "    And b.Mobile_Record_Id     =  (Select Max(x.Mobile_Record_Id)   " +
                      "                                     From Mm_Flights x              " +
                      "                                    Where x.Div_No      = a.Div_No  " +
                      "                                      And x.Mobile_Record_Id < ? )  " +
                      " Order By Sort_Order                                                ";
           
            var parameters = [$rootScope.MM_M051_id,$rootScope.MM_M051_id]
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                //console.log('MM_M103 Last Counsumptions:'+JSON.stringify(result));
            	for (var i = 0;i<result.length;i++) {
            		if (result[i].Consumption_Date != null) {
            			result[i].Consumption_Date = moment(result[i].Consumption_Date).format('YYYY-MM-DD, HH:mm');
            		}
            	}
                $scope.lastConsumption = result;
                if(result[1].Remaining*result[1].Density != 0) {
                   // $scope.consumption.remaining =  Number((result[1].Remaining*result[1].Density).toFixed(3));
                	 $scope.consumption.remaining = Number((result[1].Remaining));
                }
                $scope.consumption.remaining = Number((result[1].Remaining));
            }, function (error) {
                console.log(JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };
        getLastConsumption();

     /*   $rootScope.$on('onConsumptionCreate', function(){
            getConsumptions().then(function (result){
                $scope.slider.slideTo(0, 200);
            }, function (error) {
            });
        });*/
        $scope.noRefuelingChange = function () {
        	if ($scope.consumption.noRefuellingFlag == false) {
        		var sql = "Delete From MM_FLIGHT_CONSUMPTIONS where Consumption_Type = 'FUEL' and Flight_Id = ?  "
                var parameters = [$scope.flight.flightId];
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
                	reset();
                	getConsumptions();
                }, function (error) {
                    WingsDialogService.error(JSON.stringify(error));
                    console.log(JSON.stringify(error));
                    return deferred.reject('Login-Error : ' +JSON.stringify(error));
                });
        	} else {
        		$scope.saveConsumption();
        	}
        }
        $scope.saveConsumption = function () {
           // if ($scope.consumption.noRefuellingFlag == false && (WingsUtil.IsNull($scope.consumption.date) || WingsUtil.IsNull($scope.consumption.fuelType) || WingsUtil.IsNull($scope.consumption.departure) || WingsUtil.IsNull($scope.consumption.density) || WingsUtil.IsNull($scope.consumption.added)||WingsUtil.IsNull($scope.consumption.vendor.vendorName)|| WingsUtil.IsNull($scope.consumption.remaining)|| WingsUtil.IsNull($scope.consumption.calcFuel)||WingsUtil.IsNull($scope.consumption.difference)||WingsUtil.IsNull($scope.consumption.calcFuel))) {
            if ($scope.consumption.noRefuellingFlag == false && WingsUtil.IsNull($scope.consumption.date)){
                WingsDialogService.error('Please fill Date !');
                return false;
            }
            if ($scope.consumption.noRefuellingFlag == false && $scope.consumption.density > 2) {
          	    WingsDialogService.error('Density must be in a valid range.');
                return false;
            }
            var sql=' Insert Into MM_FLIGHT_CONSUMPTIONS (Div_No,No_Refuelling_Flag,Vendor_Number,Vendor_Name,Fuel_Type,Density,Arrival,Added,Departure,Remaining,Consumption_Date,Flight_Id,Uom,Mobile_Record_Status,Consumption_Type) '+
                    ' Values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
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
                               $scope.consumption.uom,
                               'READY',
                               'FUEL'];
            
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    getConsumptions();
                    WingsTransactionDBService.executeSql("Delete From Gn_Images where parent_id = ?;",[$rootScope.MM_M051_id]).then(function (result2){
                        var bindings = [];
                        for (var i in $rootScope.SY_0002.savedFiles) {
                        	sy.InsertAttachment($rootScope.globals.currentUser.divNo,$rootScope.SY_0002.savedFiles[i],'MM_FLIGHTS',$rootScope.MM_M051_id,$scope.flight.mobileFlightId);
                    	}
                        WingsDialogService.success();
                        return deferred.resolve("GOHEAD");
                    }, function (error) {});
                    return deferred.resolve('GOHEAD');
                }, function (error) {
                    WingsDialogService.error(JSON.stringify(error));
                    console.log(JSON.stringify(error));
                    return deferred.reject('Login-Error : ' +JSON.stringify(error));
                });
                return deferred.promise;
        };
        
        $scope.Update = function () {
            if ($scope.consumption.noRefuellingFlag == false && WingsUtil.IsNull($scope.consumption.date)){
                WingsDialogService.error('Please fill Date !');
                return false;
            }
            if ($scope.consumption.noRefuellingFlag == false && $scope.consumption.density > 2) {
          	    WingsDialogService.error('Density must be in a valid range.');
                return false;
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
                      "       Uom                      = ?,         " +
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
                               $scope.consumption.uom,
                               'READY',
                               $rootScope.MM_M051_id,
                               $scope.consumption.id];
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    getConsumptions();
                    WingsTransactionDBService.executeSql("Delete From Gn_Images where mobile_parent_id = ?;",[$scope.flight.mobileFlightId]).then(function (result2){
                        var bindings = [];
                        for (var i in $rootScope.SY_0002.savedFiles) {
                            sy.InsertAttachment($rootScope.globals.currentUser.divNo,$rootScope.SY_0002.savedFiles[i],'MM_FLIGHTS',$rootScope.MM_M051_id,$scope.flight.mobileFlightId);
                        }
                        WingsDialogService.success();
                        return deferred.resolve("GOHEAD");
                    }, function (error) {});
                    return deferred.resolve("GOHEAD");
                }, function (error) {
                    console.log(JSON.stringify(error));
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });
            return deferred.promise;
        };
        function insertAttachment(bindings) {
            var deferred = $q.defer();
        	var sql ="Insert Into GN_IMAGES (File_Id,              " +
        		 	 "                       Line,				   " +
        			 "                       Div_No,		       " +
        			 "                       File_Location,		   " +
        			 "                       File_Extension,       " +
        			 "                       Parent_Id,			   " +
        			 "                       Parent,               " +
        			 "                       Image_Type,           " +
        			 "                       Mobile_Record_Status, " +
        			 "                       Mobile_Dt_Created)    " +
		             " Values (?,?,?,?,?,?,'MM_FLIGHTS','IMAGE','READY',?);  ";
               WingsTransactionDBService.insertCollection(sql,bindings).then(function (result){
            	   getAttachments();
               }, function (error) {
            	   //getFiles();
                   console.log("INSER OR REPLACE ISSUE FAILURE! "+error);
               });
		};
		$rootScope.SY_0002 = {};
		$rootScope.SY_0002.savedFiles = [];
		$scope.loadImage =  function (item) {
			if (item.FILE_LOCATION.indexOf('wingsmobile') == -1) {
				$rootScope.$broadcast('loading:show');
				sy.LoadAttachments([item]).then(function (result) {
					$rootScope.$broadcast('loading:hide');
					getAttachments();
				}, function (error) {
					$rootScope.$broadcast('loading:hide');
					console.log(JSON.stringify(error));
					return deferred.reject("Login-Error : " +JSON.stringify(error));
				});
			} else {
				if(item.FILE_EXTENSION.toUpperCase() == "PDF") {
					function onShow(){
						  console.log('document shown');
						  //e.g. track document usage
						}
					function onClose(){
						  console.log('document closed');
						  //e.g. remove temp files
						}
					function onMissingApp(appId, installer)
					{
					    if(confirm("Do you want to install the free PDF Viewer App "
					            + appId + " for Android?"))
					    {
					        installer();
					    }
					} 
					function onError(error){
						  window.console.log(error);
						  alert("Sorry! Cannot view document.");
						}
					var options = {
							title: 'Document Viewer'
							
						}
					cordova.plugins.SitewaertsDocumentViewer.viewDocument(item.FILE_LOCATION, 'application/pdf' , options, onShow, onClose, onMissingApp, onError);
				}
			}
        }; 
        $scope.$watch('$root.SY_0002.savedFiles', function() {
	        	for (var i = 0;i<$rootScope.SY_0002.savedFiles.length;i++) {
	        		$scope.attachments.push({FILE_LOCATION:$rootScope.SY_0002.savedFiles[i]})
	        	}
        	
        	});
		function getAttachments () {
			var sql = " Select *       " +
                      "   From Gn_Images a         " +
                      "  Where a.Parent_Id = ?     ";
				var parameters = [ $rootScope.MM_M051_id];
				WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
			        $scope.isAttachmentShown = true;
					if (result.length > 0) {
				        $scope.isAttachmentShown = true;
					}
					for (var i in result) {
						$rootScope.SY_0002.savedFiles.push(result[i].FILE_LOCATION);
					}
					$scope.attachments = result;
					var temp = $rootScope.SY_0002.savedFiles;
					$rootScope.SY_0002.savedFiles = [];
					$rootScope.SY_0002.savedFiles = temp;
				}, function (error) {
                    console.log(JSON.stringify(error));
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });
		}
		getAttachments();
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
            		$scope.consumption.vendor.vendorNumber = '';
            		$scope.consumption.vendor.vendorName = '';
                    $scope.consumption.id               = $scope.consumption.id;
                    $scope.consumption.fuelType         = 'FUEL';
                    $scope.consumption.consumptionType  = 'FUEL';
                    $scope.consumption.upliftUnit       = '';
                    $scope.consumption.density          = '';
                    $scope.consumption.arrival          = '';
                    $scope.consumption.added            = '';
                    $scope.consumption.departure        = '';
                    $scope.consumption.remaining        = '';
                    $scope.consumption.date             = '';
                    $scope.consumption.flightId         = $scope.flight.flightId;
                    $scope.consumption.uom              = '';
                    $scope.consumption.calcFuel         = '';
                    $scope.consumption.indicated        = '';
                    $scope.consumption.difference       = '';
            
            getLastConsumption();
        };
        //DISCREPANCY
        function getAcceptenceDiscrepancy () {
            var promises = [];
            var sql =   " Select *,                                                           " +
                        "        date(julianday(date(Report_Date))+Interval_Day) Due_Date     " +
                        "   From Mm_Discrepancies a                                           " +
                        "  Where a.Div_No               = ?                                   " +
                        "    And ifnull(Acceptance_Required_Flag,'N') = 'Y'                   " +
                        "    And ifnull(Accepted_Flights || ',','_xX_') Not Like '%'||?||',%' " +
                        "    And Status != 'CLOSE'                                            " ;
           
            var parameters = [$rootScope.globals.currentUser.divNo,$rootScope.MM_M051_id];
            if($scope.flight.status != 'COMPLETED' && $scope.flight.status != 'CANCELLED' ) {
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    console.log('MM_0100 - AcceptenceDiscrepancy '+JSON.stringify(result));
                    if(result.length > 0) {
                        $scope.isAcceptanceWarning = true;
                        $scope.isAcceptanceBadge = result.length;
                        for (var i = 0;i<result.length;i++) {
                            var jsonObj= null;
                            var resultLoop = result[i];
                            //promises.push(getEmployeeName(resultLoop.REPORTED_BY_EMPLOYEE_NUMBER));
                            //console.log('###jsonObj '+jsonObj);
                        }
                        /*$q.all(promises).then(function(res) {
                            for (var i = 0;i<res.length;i++){
                                console.log("PROMISES  - RESULTS : "+res[i]);
                                result[i].employeeName= res[i]; 
                            }
                        },function(error) {
                            console.log("PROMISES  - ERROR"+JSON.stringify(error));
                          });*/
                        for (var i = 0;i<result.length;i++){
                            result[i].REPORT_DATE= moment(result[i].REPORT_DATE).format('DD MMMM YY'); 
                        }
                        $scope.accDisc = result;
                    }else {
                        $scope.accDisc = [];
                        $scope.isAcceptanceWarning = false;
                        $scope.isAcceptanceBadge = '';
                    }
                    checkFlightAcceptence();
                }, function (error) {
                    console.log(JSON.stringify(error));
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });
            }
            return deferred.promise;
        }; 
        $scope.getDiscrepancies = function (condition) {
        	var whereCondition = '';
            if (!WingsUtil.IsNull(condition)) {
                whereCondition += "or a.Status like '%"+condition+"%'";
                whereCondition += "or a.Discrepancy_Type like '%"+condition+"%'";
                whereCondition += "or a.Report_Date like '%"+condition+"%'";
                whereCondition += "or a.Discrepancy like '%"+condition+"%'";
                whereCondition += "or a.Ata_Code like '%"+condition+"%' ";
            }
        	var types = _.map($scope.discrepancyTypes, 'DISCREPANCY_TYPE').join("','");
            var sql = " Select *                                             " +
                      "   From Mm_Discrepancies a                            " +
                      "  Where a.Div_No      = ?                             " +
                      "    And a.Tail_Number = ?                             " +
                      "    And a.Discrepancy_Type in ('"+types+"')           " +
                      "    And a.Status     != 'CLOSED'                      " +whereCondition+
                      "  Order by Report_Date desc                           " +
                      " Limit 250                                             " ;
            var parameters = [$rootScope.globals.currentUser.divNo,$scope.flight.tailNumber];
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
            	 for (i in result) {
              		if (!WingsUtil.IsNull(result[i].REPORT_DATE))
              			result[i].REPORT_DATE = new Date(moment(result[i].REPORT_DATE));
             	 }
                if (result.length > 0) {
                    $scope.discrepancies = result;
                    
                } else {
                    $scope.discrepancies = [];
                }
                var checkOpenItems = _.filter($scope.discrepancies, function(o) { return o.STATUS == 'OPEN'; });
                if (checkOpenItems.length > 0) {
                    $scope.hasOpenDefect       = '!';
                } else {
                    $scope.hasOpenDefect       = '';
                }

            }, function (error) {
                console.log(JSON.stringify(error));
                $ionicBackdrop.release();
            }); 
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
        getAcceptenceDiscrepancy();
        
        /*function generateStoredFunc(discrepancy){
            var deferred  = $q.defer();
            var closeDate = '';
            var insDate   = '';
            if (!WingsUtil.IsNull(discrepancy.RECTIFICATION_DATE)) {
                closeDate = moment(discrepancy.RECTIFICATION_DATE).format('YYYY-MM-DD');
            }
            if (!WingsUtil.IsNull(discrepancy.INSPECTED_DATE)) {
                insDate = moment(discrepancy.INSPECTED_DATE).format('YYYY-MM-DD');
            }
            if (WingsUtil.IsNull(discrepancy.MOBILE_RECORD_ID)) {              
                var sql = new StoredFuncProcBuilder("Mb_Apps.Do_Discrepancy",   "i_Div_No",                       discrepancy.DIV_NO,
                                                                                "i_Discrepancy_Type",             discrepancy.DISCREPANCY_TYPE,
                                                                                "i_Field_List",                   'ATA_CODE,DISCREPANCY_TYPE,STATUS,REPORT_DATE,REPORTED_BY_EMPLOYEE_NUMBER,DISCREPANCY,CORRECTIVE_ACTION,RECTIFICATION_DATE,RECTIFIED_BY_EMPLOYEE_NUMBER,CATEGORY,REPORTED_STATION,RECTIFIED_STATION,HOLD_BY_EMPLOYEE_NUMBER,HOLD_STATION,INSPECTED_BY_EMPLOYEE_NUMBER,INSPECTED_STATION,INSPECTED_DATE,CONTROL_NUMBER,AIRCRAFT_ID',
                                                                                "i_Flight_Id",                    Number(discrepancy.FLIGHT_TYPE),
                                                                                "i_Discrepancy_Id",                  discrepancy.ID,
                                                                                "i_Ata_Code",                     discrepancy.ATA_CODE,
                                                                                "i_Status",                       discrepancy.STATUS,
                                                                                "i_Report_Date",                  moment(discrepancy.REPORT_DATE).format('YYYY-MM-DD'),
                                                                                "i_Reported_By_Employee_Number",  WingsUtil.IsNull(discrepancy.REPORTED_BY_EMPLOYEE_NUMBER)?'':Number(discrepancy.REPORTED_BY_EMPLOYEE_NUMBER),
                                                                                "i_Discrepancy",                  discrepancy.DISCREPANCY,
                                                                                "i_Corrective_Action",            discrepancy.CORRECTIVE_ACTION,
                                                                                "i_Tail_Number",                  discrepancy.TAIL_NUMBER,
                                                                                "i_Rectification_Date",           closeDate,
                                                                                "i_Rectified_By_Employee_Nu mber", WingsUtil.IsNull(discrepancy.RECTIFIED_BY_EMPLOYEE_NUMBER)?'':Number(discrepancy.RECTIFIED_BY_EMPLOYEE_NUMBER),
                                                                                "i_Category",                     discrepancy.CATEGORY,
                                                                                "i_Reported_Station",             discrepancy.REPORTED_STATION,
                                                                                "i_Rectified_Station",            discrepancy.RECTIFIED_STATION,
                                                                                "i_Hold_By_Employee_Number",      WingsUtil.IsNull(discrepancy.HOLD_BY_EMPLOYEE_NUMBER)?'':Number(discrepancy.HOLD_BY_EMPLOYEE_NUMBER),
                                                                                "i_Hold_Station",                 discrepancy.INSPECTED_BY_EMPLOYEE_NUMBER,
                                                                                "i_Inspected_By_Employee_Number", WingsUtil.IsNull(discrepancy.CORRECTIVE_ACTION)?'':Number(discrepancy.CORRECTIVE_ACTION),
                                                                                "i_Inspected_Station",            discrepancy.INSPECTED_STATION,
                                                                                "i_Inspected_Date",               insDate,
                                                                                "i_Control_Number",               discrepancy.LOG_NUMBER,
                                                                                "i_Off_Component_Numbers",             offComponentNumbers.join(";"),
                                                                                "i_Off_Serial_Numbers",              offSerialNumbers.join(";"),
                                                                                "i_On_Component_Numbers",          onComponentNumbers.join(";"),
                                                                                "i_On_Serial_Numbers",              onSerialNumbers.join(";"),
                                                                                "i_Positions",                      positions.join(";"),
                                                                                "o_Discrepancy_Id",               '',
                                                                                "o_Discrepancy_Number",           '');
                deferred.resolve(sql);
            } else{
                var sqlComponent = " Select *                         " +
                                   "   From Mm_Component_Transactions " +
                                   "  Where Discrepancy_Id = ?         ";
                   var parametersC = [discrepancy.MOBILE_RECORD_ID];
                WingsTransactionDBService.executeSql(sqlComponent,parametersC).then(function (innerResult) {
                    var offComponentNumbers = [];
                    var offSerialNumbers    = [];
                    var onComponentNumbers  = [];
                    var onSerialNumbers     = [];
                    var positions           = [];
                    for (var i = 0; i<innerResult.length; i++) {
                         offComponentNumbers.push(innerResult[i].OFF_COMPONENT_NUMBER); 
                         offSerialNumbers.push(innerResult[i].OFF_SERIAL_NUMBER);
                         onComponentNumbers.push(innerResult[i].ON_COMPONENT_NUMBER);
                         onSerialNumbers.push(innerResult[i].ON_SERIAL_NUMBER);
                         positions.push(innerResult[i].POSITION);
                    }
                    
                    var sql = new StoredFuncProcBuilder("Mb_Apps.Do_Discrepancy", "i_Div_No",                       discrepancy.DIV_NO,
                                                                                  "i_Discrepancy_Type",             discrepancy.DISCREPANCY_TYPE,
                                                                                  "i_Field_List",                     'ATA_CODE,DISCREPANCY_TYPE,STATUS,REPORT_DATE,REPORTED_BY_EMPLOYEE_NUMBER,DISCREPANCY,CORRECTIVE_ACTION,RECTIFICATION_DATE,RECTIFIED_BY_EMPLOYEE_NUMBER,CATEGORY,REPORTED_STATION,RECTIFIED_STATION,HOLD_BY_EMPLOYEE_NUMBER,HOLD_STATION,INSPECTED_BY_EMPLOYEE_NUMBER,INSPECTED_STATION,INSPECTED_DATE,CONTROL_NUMBER,AIRCRAFT_ID',
                                                                                  "i_Flight_Id",                    Number(discrepancy.FLIGHT_TYPE),
                                                                                  "i_Discrepancy_Id",                discrepancy.ID,
                                                                                  "i_Ata_Code",                     discrepancy.ATA_CODE,
                                                                                  "i_Status",                       discrepancy.STATUS,
                                                                                  "i_Report_Date",                  moment(discrepancy.REPORT_DATE).format('YYYY-MM-DD'),
                                                                                  "i_Reported_By_Employee_Number",  WingsUtil.IsNull(discrepancy.REPORTED_BY_EMPLOYEE_NUMBER)?'':Number(discrepancy.REPORTED_BY_EMPLOYEE_NUMBER),
                                                                                  "i_Discrepancy",                  discrepancy.DISCREPANCY,
                                                                                  "i_Corrective_Action",            discrepancy.CORRECTIVE_ACTION,
                                                                                  "i_Tail_Number",                  discrepancy.TAIL_NUMBER,
                                                                                  "i_Rectification_Date",           closeDate,
                                                                                  "i_Rectified_By_Employee_Nu mber", WingsUtil.IsNull(discrepancy.RECTIFIED_BY_EMPLOYEE_NUMBER)?'':Number(discrepancy.RECTIFIED_BY_EMPLOYEE_NUMBER),
                                                                                  "i_Category",                      discrepancy.CATEGORY,
                                                                                  "i_Reported_Station",              discrepancy.REPORTED_STATION,
                                                                                  "i_Rectified_Station",             discrepancy.RECTIFIED_STATION,
                                                                                  "i_Hold_By_Employee_Number",       WingsUtil.IsNull(discrepancy.HOLD_BY_EMPLOYEE_NUMBER)?'':Number(discrepancy.HOLD_BY_EMPLOYEE_NUMBER),
                                                                                  "i_Hold_Station",                  discrepancy.INSPECTED_BY_EMPLOYEE_NUMBER,
                                                                                  "i_Inspected_By_Employee_Number",  WingsUtil.IsNull(discrepancy.CORRECTIVE_ACTION)?'':Number(discrepancy.CORRECTIVE_ACTION),
                                                                                  "i_Inspected_Station",             discrepancy.INSPECTED_STATION,
                                                                                  "i_Inspected_Date",                insDate,
                                                                                  "i_Control_Number",                discrepancy.LOG_NUMBER,
                                                                                  "i_Off_Component_Numbers",         offComponentNumbers.join(";"),
                                                                                  "i_Off_Serial_Numbers",             offSerialNumbers.join(";"),
                                                                                  "i_On_Component_Numbers",             onComponentNumbers.join(";"),
                                                                                  "i_On_Serial_Numbers",             onSerialNumbers.join(";"),
                                                                                  "i_Positions",                     positions.join(";"),
                                                                                  "o_Discrepancy_Id",                '',
                                                                                  "o_Discrepancy_Number",            '');
                    deferred.resolve(sql);
                });
            }
            return deferred.promise;
        }; 
        $scope.pullDiscrepancies = function (rejectedDefectsArray) {
        	var deferred = $q.defer();
            var divNo = $rootScope.globals.currentUser.divNo;
            var defectCondition = " ";
            if (rejectedDefectsArray.length > 0 ){
            	var defectCondition = " And a.Id Not In ("+ rejectedDefectsArray.join(',')+") ";

            }
            var sql = " Select a.Id,                                                                                               " +
                      "        a.Div_No,                                                                                           " +
                      "        a.Discrepancy_Number,                                                                               " +
                      "        a.Discrepancy_Type,                                                                                 " +
                      "        a.Tail_Number,                                                                                      " +
                      "        a.Order_Number,                                                                                     " +
                      "        a.Ata_Code,                                                                                         " +
                      "        a.Status,                                                                                           " +
                      "        a.Flight_Id,                                                                                        " +
                      "        a.Discrepancy,                                                                                      " +
                      "        a.Corrective_Action,                                                                                " +
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
                      "        a.Internal_Comment                                                                                  " +
                      "   From Mm_Discrepancies_v a,                                                                               " +
                      "        Mm_Aircrafts_v     b                                                                                " +
                      "  Where a.Div_No     = "+divNo                                                                               +
                      "    And a.Status    != 'CANCELLED'                                                                          " +
                      "    And a.Active     = 'Y'                                                                                  " +
                      "    And ((a.Status In ('OPEN', 'DEFERRED') And a.Report_Date Between sysdate-180 and sysdate-1) Or          " +
                      "        (a.Status = 'CLOSED' And a.Rectification_Date Between SysDate-40 And SysDate+7))                    " +
                      "   And b.Div_No      = a.Div_No"+defectCondition                                                              +
                      "   And b.Id          = a.Aircraft_Id                                                                        " +
                      "   And b.Tail_Number = '"+$scope.selectedTailNumber+"'                                                      " +
                      "   And b.Active      = 'Y'                                                                                  " ;
            
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
                                    "                                         Internal_Comment)                " +
                                    "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?); ";                    
                    var i;
                    for (i in defects) {
                        parameters = [defects[i].id,
                                      defects[i].div_no,
                                      defects[i].discrepancy_number,
                                      defects[i].discrepancy_type,
                                      defects[i].tail_number,
                                      defects[i].order_number,
                                      defects[i].ata_code,
                                      defects[i].status,
                                      defects[i].flight_id,
                                      defects[i].discrepancy,
                                      defects[i].corrective_action,
                                      moment(defects[i].report_date).format('YYYY-MM-DD'),
                                      defects[i].reported_by_employee_number,
                                      defects[i].reported_station,
                                      defects[i].rectification_date,
                                      defects[i].rectified_by_employee_number,
                                      defects[i].rectified_station,
                                      defects[i].inspected_date,
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
                                      defects[i].internal_comment];                        
                        bindings.push(parameters);
                    }
                    WingsTransactionDBService.insertCollection(sqlDefect,bindings).then(function (result){
                        return deferred.resolve("GOHEAD");
                    }, function (error) {
                        console.log("Defect-Error : " +JSON.stringify(error));
                        return deferred.reject(JSON.stringify(error));
                    });
                }else{
                	return deferred.resolve("GOHEAD");
                } 
            }, function (error) { return deferred.reject(JSON.stringify(error));});
            return deferred.promise;
        };
        function pushDefect () {
            var deferred = $q.defer();
            var sqlFlight = " Select *                                " +
                            "   From Mm_Discrepancies                 " +
                            " Where MOBILE_RECORD_STATUS != 'LOADED'  ";

            var parameters = [];
            var builders = [];
            var rejectedDefects = [];
            var numberofLoadedDefects = 0;
            var numberofRejectedDefects =0; 
            WingsTransactionDBService.executeSql(sqlFlight,parameters).then(function (result){
                if (result.length < 1) {
                    $scope.$broadcast('scroll.refreshComplete');
                    return deferred.resolve(rejectedDefects);
                }
                var msg = result.length>1?" records are sending server.":" record is sending server.";
                WingsDialogService.notification(result.length+msg);
                var promises = [];
                var discrepancies = [];
                var builders = []; 
                this.defects = result;
                for (var i = 0; i<result.length; i++) {
                    promises.push(generateStoredFunc(result[i]));
                    
                }
                $q.all(promises).then(function(values) {
                    for(i=0; i<values.length; i++){
                        var obj = values[i].queryObject();
                          builders.push(obj);
                    }
                    var str = JSON.stringify(builders);
                    console.log("SQL : " +str);
                    WingsRemoteDbService.executeFunction(str).then (function (response) {
                        var feedbackSql =  "Update Mm_Discrepancies             " +
                                           "   Set Server_Transaction_Date = ?, " +
                                           "       Server_Feedback         = ?, " +
                                           "       Mobile_Record_Status    = ?, " +
                                           "       Id                      = ?, " +
                                           "       Discrepancy_Number      = ?  " +
                                           " Where Mobile_Record_Id        = ?  ";
                       var bindings = [];
                       var row  = [];
                       for (var i=0; i<response.length; i++) {
                           response[i] = JSON.parse(response[i]);
                           
                           if (response[i].isSuccess == 'false'){
                        	   if (!WingsUtil.IsNull(this.defects[i].ID)){
                        		   rejectedDefects.push(this.defects[i].ID);
                        	   }
                        	   row = [moment().format('YYYY-MM-DD HH:mm'),
                        	          response[i].message,
                                      'REJECTED',
                                      WingsUtil.IsNull(this.defects[i].ID) ? '': this.defects[i].ID,
                                      WingsUtil.IsNull(this.defects[i].DISCREPANCY_NUMBER) ? '': this.defects[i].DISCREPANCY_NUMBER,
                                      this.defects[i].MOBILE_RECORD_ID];
                               numberofRejectedDefects++;
                           }
                           else if (response[i].result.Result == 'FALSE') {
                        	   if (!WingsUtil.IsNull(this.defects[i].ID)){
                        		   rejectedDefects.push(this.defects[i].ID);
                        	   }
                               row = [moment().format('YYYY-MM-DD HH:mm'),
                                      response[i].errorText,
                                      'REJECTED',
                                      WingsUtil.IsNull(this.defects[i].ID) ? '': this.defects[i].ID,
                                      WingsUtil.IsNull(this.defects[i].DISCREPANCY_NUMBER) ? '': this.defects[i].DISCREPANCY_NUMBER,
                                      this.defects[i].MOBILE_RECORD_ID];
                               numberofRejectedDefects++;
                           } 
                           else if (response[i].isSuccess == 'true') {
                               row = [moment().format('YYYY-MM-DD HH:mm'),
                                      response[i].message,
                                      'LOADED', 
                                      response[i].result.o_Discrepancy_Id,
                                      response[i].result.o_Discrepancy_Number,
                                      this.defects[i].MOBILE_RECORD_ID];
                               numberofLoadedDefects++;
                           }
                           bindings.push(row);
                       }
                       WingsTransactionDBService.insertCollection(feedbackSql,bindings).then (function (result3) {
                            $scope.$broadcast('scroll.refreshComplete');
                            var msgRejected =  numberofRejectedDefects.length>1?" records are rejected.":" record is rejected.";
                            var msgLoaded   =  numberofLoadedDefects.length>1?" records are loaded.":" record is loaded.";
                        
                            if(numberofLoadedDefects < 1){
                                WingsDialogService.errorHide(numberofRejectedDefects+msgRejected);
                            }else if (numberofRejectedDefects < 1){
                                WingsDialogService.notification(numberofLoadedDefects+msgLoaded);
                            }else{
                                WingsDialogService.notification(numberofLoadedDefects+msgLoaded + " & "+ numberofRejectedDefects+msgRejected);
                            }
                            return deferred.resolve(rejectedDefects);
                        },function (error) {$scope.$broadcast('scroll.refreshComplete');console.log(error); return deferred.reject(JSON.stringify(error));});
                    },function (error) {$scope.$broadcast('scroll.refreshComplete');console.log(error); return deferred.reject(JSON.stringify(error));});
                    
                },function(error) {
                    console.log("PROMISES  - ERROR"+JSON.stringify(error));
                    return deferred.reject(JSON.stringify(error));
                  });
                
            },function (error) {$scope.$broadcast('scroll.refreshComplete');console.log(error); return deferred.reject(JSON.stringify(error));});
        return deferred.promise;
    };
        $scope.pullandPushDefects = function () {
        	$ionicBackdrop.retain();
        	 pushDefect().then(function (rejectedList){
             	$scope.pullDiscrepancies(rejectedList).then(function(reuslt){
             		getDiscrepancies();
             	},function(error){
             		$ionicBackdrop.release();
             		console.log(error);
             		WingsDialogService.error(error);
             	});
             },function(err){
            	 $ionicBackdrop.release();
             	console.log(err);
             	WingsDialogService.error(error);
             });
        };*/
        $scope.newDiscrepancy = function () {
            if (!WingsUtil.IsNull($scope.flight.controlNumber)) {
                $rootScope.MM_M051_Disabled = false;
                $rootScope.MM_M055_Discrepancy_id = '';
                $rootScope.MM_M051_AircraftType = $scope.flight.aircraftType;
                $rootScope.MM_M055_TailNumber = $scope.flight.tailNumber;
                $rootScope.MM_M055_Stations = [$scope.flight.actualTo,$scope.flight.actualFrom];
                $rootScope.MM_M055_ControlNumber = $scope.flight.controlNumber;
                $state.go('app.MM_M055');
            } else{
                WingsDialogService.error('Log Number is required in order to create defect');
            }
        }
        $scope.openDiscrepancy = function (id) {
            $rootScope.MM_M051_Disabled = $scope.disabled;
            $rootScope.MM_M051_AircraftType = $scope.flight.aircraftType;
            $rootScope.MM_M055_Discrepancy_id = id;
            $rootScope.MM_M055_TailNumber = $scope.flight.tailNumber;
            $rootScope.MM_M055_Stations = [$scope.flight.actualTo,$scope.flight.actualFrom];
            $rootScope.MM_M055_ControlNumber = $scope.flight.controlNumber;
            $('#sign').remove();
            $state.go('app.MM_M055');
        };
        $rootScope.$on('refreshDefects', function(){
            $scope.getDiscrepancies();
            getAcceptenceDiscrepancy();
        });
        $ionicPopover.fromTemplateUrl('tooltip.html', {
            scope: $scope
          }).then(function(popover) {
            $scope.popover = popover;
          });

        $scope.openPopover = function($event, msg) {
            console.log(msg);
            $scope.responseMessage = msg
            $scope.popover.show($event);
            $event.stopPropagation();
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
        			if ($scope.signWhat == 'PFC') {
        				$scope.saveInspection();
        			} else {
        				$scope.AcceptFlight();
        			}
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
        $scope.clearCanvas = function () {
        	$scope.canvas.clear();
        	$scope.canvas.width  = "400";
            $scope.canvas.height = "400";
        	$scope.canvas.renderAll();
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
	            $scope.canvas = new fabric.Canvas ('m051');
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