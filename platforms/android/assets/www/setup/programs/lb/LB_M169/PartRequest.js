angular.module('WingsMobileStarter').controller('LB_M169.PartRequest', [
        '$scope',
        '$state',
        '$cordovaBarcodeScanner',
        '$ionicModal',
        'WingsRemoteDbService',
        'WingsUtil',
        '$ionicPlatform',
        '$ionicHistory',
        '$window',
        'pr',
        'sy',
        '$ionicHistory',
        'WingsDialogService',
        '$stateParams',
        function($scope,$state,$cordovaBarcodeScanner,$ionicModal,WingsRemoteDbService,WingsUtil,$ionicPlatform,$ionicHistory,$window,pr,sy,$ionicHistory,WingsDialogService,$stateParams) {
            console.log('Part Request');

            var divNo      = $rootScope.globals.currentUser.divNo;
            var userId     = $rootScope.globals.currentUser.userId;
            var userNumber = $rootScope.globals.currentUser.userNumber;
            
            function initialize(){
                $scope.searchCriteria  = '';
                $scope.multipleParts   = false;
                $scope.partsCount      = null;
                $scope.partSearchState = 1; //initial search/validate
                $scope.partNumbers     = [];
                $scope.priorityCodes   = [];
                $scope.uomCodes        = [];
                $scope.aircraftLocations = [];
                $scope.isPartDefined   = false;
                $scope.isSearched      = false;
                $scope.alternateMode   = false;
                $scope.requested       = false;
                $scope.alternatesExist = false;
            }
            
            initialize();
            
            var card = $rootScope.prWorkcard;
            $scope.tempPartRequest = pr.InstantiateRequisition();
            $scope.tempPartRequest.PRIORITY_OBJECT = null;
            if ($rootScope.prCardRequisition){
            	$scope.partRequest = $rootScope.prCardRequisition;
            	$scope.partRequest.PRIORITY_OBJECT = {PRIORITY_CODE :'',DUE_DAYS:''};
            	$scope.partRequest.PRIORITY_OBJECT.PRIORITY_CODE = $rootScope.prCardRequisition.PRIORITY_CODE;
            	//$scope.partRequest.PRIORITY_OBJECT.DUE_DAYS = $scope.partRequest.DUE_DATE;
            }else{
            	$scope.partRequest = pr.InstantiateRequisition();
                $scope.partRequest.PRIORITY_OBJECT = null;
            }
            
            $scope.clearPart = function(){
            	$scope.partRequest.ORDER_LINE_ID     = null;
            	$scope.partRequest.PART_ID           = '';
            	$scope.partRequest.DESCRIPTION       = '';
            	$scope.partRequest.PRIORITY_OBJECT   = null;
            	$scope.partRequest.PRIORITY_CODE     = '';
            	$scope.partRequest.DUE_DATE          = '';
            	$scope.partRequest.QUANTITY          = null;
            	$scope.partRequest.UOM               = '';
            	$scope.partRequest.AIRCRAFT_LOCATION = '';
            	$scope.partRequest.IPC_REFERENCE     = '';
            	$scope.partRequest.INTERNAL_COMMENT  = '';

                $scope.searchCriteria  = '';
                $scope.multipleParts   = false;
                $scope.partsCount      = null;
                $scope.partSearchState = 1; //initial search/validate
                $scope.isPartDefined   = false;
                $scope.isSearched      = false;
                $scope.alternateMode   = false;
                $scope.requested       = false;
                $scope.alternatesExist = false;
            };
            
            $scope.onchange = function(){
            	$scope.clearPart();
            	if(!$scope.partRequest.PART_NUMBER){
            		$scope.isSearched = false;
            	}
            	else if($scope.partRequest.PART_NUMBER.length <3){
            		$scope.partSearchIcon(0);
            	}
            	else if(!$scope.cButtonIcon){
            		$scope.partSearchIcon(2);
            	}
                $scope.alternatesExist = false;
            };
            $scope.focusInput = function(id){
            	$timeout(function() {
            	var element = $window.document.getElementById(id);
                if(element){
                    element.focus();
                    //  datepicker might be used for date inputs 
                }
            	},10);
                    // 
            //	WingsUtil.Focus('partInput');
            };
            $scope.partSearchIcon = function(newState){
                if (newState != null) $scope.partSearchState = newState;

                switch($scope.partSearchState){
                case 1:
                    $scope.cButtonIcon = "icon ion-android-search balanced";
                    break;
                case 2:
                	$scope.cButtonIcon = "icon ion-android-search energized";
                    break;
                case 3:
                	$scope.cButtonIcon = "icon ion-android-search assertive";
                    break;
                default: $scope.cButtonIcon = "";
                    break;
                }
            };
            
            $scope.onIconClick = function(){
            	if($scope.partRequest.PART_NUMBER.length > 2){
            	//	if($scope.isSearched && ){
            		if($scope.searchCriteria){
            			if(!$scope.partRequest.PART_NUMBER.toString().includes($scope.searchCriteria.toString())){
            				$scope.searchCriteria = $scope.partRequest.PART_NUMBER;
            				$scope.search();
            			}
            		}else{
            			$scope.searchCriteria = $scope.partRequest.PART_NUMBER;
            			$scope.search();
            		}
            //		}else{
            	//		$scope.search();
            		//}
            	}
            };
            
            $scope.search = function (){
            	$scope.alternateMode = false;
                $scope.isSearched = true;
                $scope.requested = false;
                $scope.populateParts();
            };
        
            $scope.fillRequest = function(partObject){
                $scope.partRequest.PART_ID       = partObject.id;
                $scope.partRequest.PART_NUMBER   = partObject.part_number;
                $scope.partRequest.DESCRIPTION  = partObject.description;
                $scope.partRequest.UOM          = partObject.uom;
                $scope.partRequest.IPC_REFERENCE = partObject.ipc_reference;
                
                if (partObject.rotable_flag == 'Y') $scope.partRequest.quantity = 1;
                
                if (partObject.alternate_count > 0) 
                    $scope.alternatesExist = true;
                else $scope.alternatesExist = false;
                
                $scope.isSearched    = false;
                $scope.isPartDefined = true;
                $scope.partNumbers   = [];
            };
            $scope.pullPart = function(){
            	$scope.partRequest.PART_NUMBER = $scope.partRequest.PART_NUMBER.toUpperCase();
            	console.log("pullpart");
            	console.log($scope.isSearched);
            	 var sql = "Select a.Id,                                                                                      "+
                 "       a.Part_Number,                                                                             "+
                 "       a.DESCRIPTION,                                                                             "+
                 "       a.Oem_Specification_Number,                                                                "+
                 "       a.UOM,                                                                                     "+
                 "       a.Rotable_Flag,                                                                            "+
                 "       a.Ipc_Reference,                                                                           "+
                 "       Ic_Service.Get_On_Hand_QUANTITY(a.Div_No, a.Id) || ' ' || UOM On_Hand_QUANTITY,            "+
                 "       Ic_Service.Get_Available_Issue_QUANTITY(a.Div_No,                                          "+
                 "                                               a.Id,                                              "+
                 "                                               '"+card.CUSTOMER_ID+"',                            "+
                 "                                               Decode(Rotable_Flag,                               "+
                 "                                                      'Y',                                        "+
                 "                                                      '"+card.APP_STD_VALIDATION_ROTABLE+"',      "+
                 "                                                      '"+card.APP_STD_VALIDATION_OTHER+"'),       "+
                 "                                               '"+card.APPLICABLE_STANDARD+"') Available_QUANTITY, "+
                 "       (Select Count(0)                                                                           "+
                 "          From Ic_Part_Alternates                                                                 "+
                 "         Where Div_No       = a.Div_No                                                            "+
                 "           And Base_Part_Id = a.Id                                                                "+
                 "           And Active       = 'Y') Alternate_Count,                                               "+
                 "       Round(Nvl(Ic_Service.Get_Part_Price(Div_No, Id, Null),0),2) Part_Price                     "+
                 "  From Ic_Parts a                                                                                 "+
                 " Where a.Div_No       = "+divNo+
                 "   And a.Part_Number = '"+$scope.partRequest.PART_NUMBER+"'                                  "+
                 "   And a.Active       = 'Y'                                                                       ";
                 
            	 var sqlArray = [{ queryStr: sql, queryType: "READ" }];
                 var sqlString = JSON.stringify(sqlArray);
                 WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                     $scope.partNumbers = angular.fromJson(dataIn[0].rows);
                     
                     var length = $scope.partNumbers.length;
                     if(length  < 1){
                     	$scope.partSearchIcon(3);
                     } else {
                     	$scope.fillRequest($scope.partNumbers[0]);
                     	$scope.isPartDefined = true;
                     	if($scope.multipleParts){
                     		$scope.partSearchIcon(2);
                     	}else{
                     		$scope.partSearchIcon(1);
                     	}
                     	$scope.multipleParts = false;
                     }
                 }, function (error) {});
            };
            
            $scope.fill = function(partObject){
                partObject.part_number = partObject.part_number.toUpperCase();
            	var sql = "Select Count(a.Id) Count "+
              			  "From Ic_Parts a"+
              			  " Where a.Div_No       = "+divNo+
              			  "   And a.Part_Number Like '%"+partObject.part_number+"%'"+
                          "   And a.Active       = 'Y'";
              	var sqlArray = [{ queryStr: sql, queryType: "READ" }];
                var sqlString = JSON.stringify(sqlArray);
                WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                    $scope.searchCriteria = '';
                    var result = angular.fromJson(dataIn[0].rows);
                    if(result[0].count > 1){
               	        $scope.partSearchIcon(2);
                  	}else{
                  		$scope.partSearchIcon(1);
                  	}
                  	$scope.fillRequest(partObject);
               }, function (error) {
                   
               });
            };
            
            $scope.pullPartscount = function(){
            	$scope.partRequest.PART_NUMBER = $scope.partRequest.PART_NUMBER.toUpperCase();
            	console.log("pullpartscount");
            	console.log($scope.isSearched);
            	var sql = "Select Count(a.Id) Count "+
            			  "From Ic_Parts a"+
            			  " Where a.Div_No       = "+divNo+
            			  "   And a.Part_Number Like '%"+$scope.partRequest.PART_NUMBER+"%'"+
                          "   And a.Active       = 'Y'";
            	var sqlArray = [{ queryStr: sql, queryType: "READ" }];
                var sqlString = JSON.stringify(sqlArray);
                WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                	var result = angular.fromJson(dataIn[0].rows);
                    if(result[0].count<1){
                    	$scope.partSearchIcon(3);
                    } else if (result[0].count == 1){
                    	$scope.pullPart();
                    } else{
                    	$scope.pullPart();
                    	$scope.multipleParts = true;
                    }         	     	
                }	, function (error) {});
            };
            $scope.populateParts = function () {
            	$scope.partRequest.PART_NUMBER = $scope.partRequest.PART_NUMBER.toUpperCase();
            	console.log("populate parts");
            	console.log($scope.isSearched);
            	var sql = "Select a.Id,                                                                                      "+
                          "       a.Part_Number,                                                                             "+
                          "       a.DESCRIPTION,                                                                             "+
                          "       a.Oem_Specification_Number,                                                                "+
                          "       a.UOM,                                                                                     "+
                          "       a.Rotable_Flag,                                                                            "+
                          "       a.Ipc_Reference,                                                                           "+
                          "       Ic_Service.Get_On_Hand_QUANTITY(a.Div_No, a.Id) || ' ' || UOM On_Hand_QUANTITY,            "+
                          "       Ic_Service.Get_Available_Issue_QUANTITY(a.Div_No,                                          "+
                          "                                               a.Id,                                              "+
                          "                                               '"+card.CUSTOMER_ID+"',                            "+
                          "                                               Decode(Rotable_Flag,                               "+
                          "                                                      'Y',                                        "+
                          "                                                      '"+card.APP_STD_VALIDATION_ROTABLE+"',      "+
                          "                                                      '"+card.APP_STD_VALIDATION_OTHER+"'),       "+
                          "                                               '"+card.APPLICABLE_STANDARD+"') Available_QUANTITY, "+
                          "       (Select Count(0)                                                                           "+
                          "          From Ic_Part_Alternates                                                                 "+
                          "         Where Div_No       = a.Div_No                                                            "+
                          "           And Base_Part_Id = a.Id                                                                "+
                          "           And Active       = 'Y') Alternate_Count,                                               "+
                          "       Round(Nvl(Ic_Service.Get_Part_Price(Div_No, Id, Null),0),2) Part_Price                     "+
                          "  From Ic_Parts a                                                                                 "+
                          " Where a.Div_No       = "+divNo+
                          "   And (a.Part_Number Like '%"+$scope.partRequest.PART_NUMBER+"%'                                  "+
                          "    Or a.DESCRIPTION Like '%"+$scope.partRequest.PART_NUMBER+"%')                                  "+
                          "   And a.Active       = 'Y'                                                                       "+
                          " Order By Decode(InStr(a.Part_Number,'"+$scope.partRequest.PART_NUMBER+"'),1,Decode(InStr(a.Part_Number||'x_X_x','"+$scope.partRequest.PART_NUMBER+"'||'x_X_x'),1,1||a.Part_Number,2||a.Part_Number),3||a.Part_Number)";

                var sqlArray = [{ queryStr: sql, queryType: "READ" }];
                var sqlString = JSON.stringify(sqlArray);
                WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                    $scope.partNumbers = angular.fromJson(dataIn[0].rows);
                    
                    var length = $scope.partNumbers.length;
                    if(length  < 1){
                    	$scope.partSearchIcon(3);
                    } else if(length == 1){
                    	$scope.partSearchIcon(1);
                    	$scope.fillRequest($scope.partNumbers[0]);
                    	$scope.isSearched = false;
                    	$scope.isPartDefined = true;
                        $scope.partNumbers   = [];
                    }else {
                    	$scope.partSearchIcon(2);
                    }
                }, function (error) {});
            };
            $scope.closeAlternateMode = function(){
                $scope.partRequest.PART_NUMBER = $scope.tempPartRequest.PART_NUMBER;
                $scope.partRequest.ORDER_LINE_ID = $scope.tempPartRequest.ORDER_LINE_ID;
                $scope.partRequest.PART_ID = $scope.tempPartRequest.PART_ID;
                $scope.partRequest.PART_NUMBER = $scope.tempPartRequest.PART_NUMBER;
                $scope.partRequest.DESCRIPTION = $scope.tempPartRequest.DESCRIPTION;
                $scope.partRequest.PRIORITY_OBJECT = $scope.tempPartRequest.PRIORITY_OBJECT;
                $scope.partRequest.PRIORITY_CODE = $scope.tempPartRequest.PRIORITY_CODE;
                $scope.partRequest.DUE_DATE = $scope.tempPartRequest.DUE_DATE;
                $scope.partRequest.QUANTITY = $scope.tempPartRequest.QUANTITY;
                $scope.partRequest.UOM = $scope.tempPartRequest.UOM;
                $scope.partRequest.AIRCRAFT_LOCATION = $scope.tempPartRequest.AIRCRAFT_LOCATION;
                $scope.partRequest.IPC_REFERENCE = $scope.tempPartRequest.IPC_REFERENCE;
                $scope.partRequest.INTERNAL_COMMENT = $scope.tempPartRequest.INTERNAL_COMMENT;
            	$scope.isSearched = false;
            	$scope.alternateMode = false;
            }
            $scope.populateAlternates = function () {
            	$scope.partRequest.PART_NUMBER = $scope.partRequest.PART_NUMBER.toUpperCase();
                var sql = "Select b.Id,                                                                                      "+
                          "       b.Part_Number,                                                                             "+
                          "       b.DESCRIPTION,                                                                             "+
                          "       b.Oem_Specification_Number,                                                                "+
                          "       b.UOM,                                                                                     "+
                          "       b.Rotable_Flag,                                                                            "+
                          "       b.Ipc_Reference,                                                                           "+
                          "       Ic_Service.Get_On_Hand_QUANTITY(b.Div_No, b.Id) || ' ' || b.UOM On_Hand_QUANTITY,          "+
                          "       Ic_Service.Get_Available_Issue_QUANTITY(b.Div_No,                                          "+
                          "                                               b.Id,                                              "+
                          "                                               '"+card.CUSTOMER_ID+"',                            "+
                          "                                               Decode(b.Rotable_Flag,                             "+
                          "                                                      'Y',                                        "+
                          "                                                      '"+card.APP_STD_VALIDATION_ROTABLE+"',      "+
                          "                                                      '"+card.APP_STD_VALIDATION_OTHER+"'),       "+
                          "                                               '"+card.APPLICABLE_STANDARD+"') Available_QUANTITY, "+
                          "       (Select Count(0)                                                                           "+
                          "          From Ic_Part_Alternates                                                                 "+
                          "         Where Div_No       = b.Div_No                                                            "+
                          "           And Base_Part_Id = b.Id                                                                "+
                          "           And Active       = 'Y') Alternate_Count,                                               "+
                          "       Round(Nvl(Ic_Service.Get_Part_Price(b.Div_No, b.Id, Null),0),2) Part_Price                 "+
                          "  From Ic_Part_Alternates a,                                                                      "+
                          "       Ic_Parts           b                                                                       "+
                          " Where a.Div_No       = "+divNo+
                          "   And a.Base_Part_Id = "+$scope.partRequest.PART_ID+
                          "   And a.Active       = 'Y'                                                                       "+
                          "   And b.Id           = a.Alternate_Part_Id                                                       "+
                          " Order By Decode(InStr(b.Part_Number,'"+$scope.partRequest.PART_NUMBER+"'),1,Decode(InStr(b.Part_Number||'x_X_x','"+$scope.partRequest.PART_NUMBER+"'||'x_X_x'),1,1||b.Part_Number,2||b.Part_Number),3||b.Part_Number)";

                var sqlArray = [{ queryStr: sql, queryType: "READ" }];
                var sqlString = JSON.stringify(sqlArray);
                WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                    $scope.partNumbers = angular.fromJson(dataIn[0].rows);
                    $scope.tempPartRequest.PART_NUMBER = $scope.partRequest.PART_NUMBER;
                    $scope.tempPartRequest.ORDER_LINE_ID = $scope.partRequest.ORDER_LINE_ID;
                    $scope.tempPartRequest.PART_ID = $scope.partRequest.PART_ID;
                    $scope.tempPartRequest.PART_NUMBER = $scope.partRequest.PART_NUMBER;
                    $scope.tempPartRequest.DESCRIPTION = $scope.partRequest.DESCRIPTION;
                    $scope.tempPartRequest.PRIORITY_OBJECT = $scope.partRequest.PRIORITY_OBJECT;
                    $scope.tempPartRequest.PRIORITY_CODE = $scope.partRequest.PRIORITY_CODE;
                    $scope.tempPartRequest.DUE_DATE = $scope.partRequest.DUE_DATE;
                    $scope.tempPartRequest.QUANTITY = $scope.partRequest.QUANTITY;
                    $scope.tempPartRequest.UOM = $scope.partRequest.UOM;
                    $scope.tempPartRequest.AIRCRAFT_LOCATION = $scope.partRequest.AIRCRAFT_LOCATION;
                    $scope.tempPartRequest.IPC_REFERENCE = $scope.partRequest.IPC_REFERENCE;
                    $scope.tempPartRequest.INTERNAL_COMMENT = $scope.partRequest.INTERNAL_COMMENT;
                    $scope.isSearched = true;
                    $scope.alternateMode = true;
                    $scope.partRequest.PART_NUMBER ='';
                }, function (error) {});
            };
            
            sy.GetTableRows("Select * From Ic_Priority_Codes Where Div_No = ? And Active = 'Y' Order By Priority_Code",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.priorityCodes = result;
            }); 
            
            sy.GetTableRows("Select * From Ic_Uom_Codes Where Div_No = ? And Active = 'Y' Order By Uom",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.uomCodes = result;
            });
            
            sy.GetTableRows("Select * From Pr_Aircraft_Locations Where Div_No = ? And Active = 'Y' Order By Aircraft_Location",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.aircraftLocations = result;
            });
            
            $scope.priorityChanged = function(){
                $scope.partRequest.PRIORITY_CODE = $scope.partRequest.PRIORITY_OBJECT.PRIORITY_CODE;
                var dueDays = $scope.partRequest.PRIORITY_OBJECT.DUE_DAYS;
                if (dueDays > 0) {
                    $scope.partRequest.DUE_DATE = new Date();
                    $scope.partRequest.DUE_DATE.setDate($scope.partRequest.DUE_DATE.getDate() + dueDays);
                }
                else {
                    $scope.partRequest.DUE_DATE = null;
                }
            };
            
            $scope.request = function(){
            	$scope.partRequest.PART_NUMBER = $scope.partRequest.PART_NUMBER.toUpperCase();
                $scope.partRequest.IPC_REFERENCE = $scope.partRequest.IPC_REFERENCE.toUpperCase();
                $scope.partRequest.MOBILE_CARD_ID = card.MOBILE_RECORD_ID;
            	
                	var requisitions = [];
	                var tempRequisition = _.cloneDeep($scope.partRequest);
	                tempRequisition.DUE_DATE             = moment(tempRequisition.DUE_DATE).format('YYYY-MM-DD');
	                tempRequisition.MOBILE_RECORD_ACTION = 'REQUEST';
	                tempRequisition.MOBILE_RECORD_STATUS = 'READY';
	                tempRequisition.CARD_ID              = card.ID;
	                tempRequisition.MOBILE_CARD_ID       = card.MOBILE_RECORD_ID;
	                var tempTime = moment().format('YYYY-MM-DD HH:mm:ss');
	                tempRequisition.MOBILE_DT_MODIFIED   = tempTime;
	                tempRequisition.MOBILE_USR_MODIFIED  = $rootScope.globals.currentUser.userId;
	                tempRequisition.EMPLOYEE_NUMBER      = $rootScope.globals.currentUser.userNumber;
	                tempRequisition.DIV_NO               =  $rootScope.globals.currentUser.divNo;
	                requisitions.push(tempRequisition);
	                pr.SaveRequisition(requisitions).then(function(result){
	                    tempRequisition.MOBILE_RECORD_ID = result.insertId;
	                    sy.CreateTransaction(tempTime,"IC_REQUISITIONS",tempRequisition.MOBILE_RECORD_ID,tempRequisition.MOBILE_RECORD_ACTION,tempRequisition.ID,tempRequisition.CARD_ID,tempRequisition.MOBILE_CARD_ID).then(function(res){
    	                	$scope.partRequest = tempRequisition;

    	                	$scope.partRequest.MOBILE_RECORD_ID = result.insertId;
    	                    if (!$rootScope.globals.deviceConnectionInfo.isOnline){
    	                    	WingsDialogService.notification('Part request action is saved to local DB and will be synced when the device is online.','YELLOW');
    	                    	$scope.partRequest = pr.InstantiateRequisition();
    	                    	$scope.clearPart
    	                    }else{
    	                    	pr.pushAndPull(card,null,tempRequisition).then(function(result){
    	                    	    if (result.status == 'SUCCEED'){
                                        $scope.partRequest.ID = result.childObj.ID;
                                        var status = result.childObj.STATUS;
                                        if(status == 'LOADED'){
                                            WingsDialogService.success('Process Completed.');
                                            $scope.partRequest = pr.InstantiateRequisition();
                                            $scope.clearPart
                                        }else{
                                            WingsDialogService.error(result.childObj.SERVER_FEEDBACK);
                                        }
    	                			}else{
    	                				console.log(result.error);
    	                				WingsDialogService.error(result.error);
    	                			}
    	        	        	},function(error){
    	        	        		console.log(result.error);
    	        	        		WingsDialogService.error(result.error);
    	        	        	});
    	                    }
	                    },function(err){
                            WingsDialogService.error('Could not take action. Reason - LOCAL DB ERROR : '+ error);
                        })
	                },function(error){
	                	WingsDialogService.error('Could not take action. Reason - LOCAL DB ERROR : '+ error);
	                })
            };
            $rootScope.$ionicGoBack = function() {
                $rootScope.prCardRequisition = '';
                $ionicHistory.goBack();
            };
            $ionicPlatform.registerBackButtonAction(function () {
                if ($scope.isSearched) {
                	$scope.clearPart();
                	$scope.partRequest.PART_NUMBER = '';
                	$scope.isSearched = false;
                	$scope.partSearchIcon(0);
                	$scope.searchCriteria = '';
                	$scope.alternateMode = false;
                	$scope.alternatesExist = false;
                	WingsUtil.Focus('partInput');
                }else{
                    $ionicHistory.goBack();
                }
            }, 100);
            $scope.blur = function(){
                if (!$rootScope.globals.deviceConnectionInfo.isOnline) return;
            	if(!$scope.isSearched){
            		 $scope.pullPartscount();
            	}
            };
            /*  $scope.cancelSearch = function(){
            $scope.partSearchIcon(1);
            $scope.isSearched = false;
            $scope.Parts = [];
        }; */

        } ])