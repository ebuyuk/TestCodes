angular.module('WingsMobileStarter').controller('PR_M100.NewPart', [
        '$scope',
        '$state',
        '$cordovaBarcodeScanner',
        '$ionicModal',
        'WingsRemoteDbService',
        'WingsUtil',
        '$ionicPlatform',
        '$ionicHistory',
        '$window',
        '$stateParams',
        'WingsDialogService',
        function($scope,$state,$cordovaBarcodeScanner,$ionicModal,WingsRemoteDbService,WingsUtil,$ionicPlatform,$ionicHistory,$window,$stateParams,WingsDialogService) {
            console.log('New Part');

            var divNo      = $rootScope.globals.currentUser.divNo;
            var userId     = $rootScope.globals.currentUser.userId;
            var userNumber = $rootScope.globals.currentUser.userNumber;
            $scope.searchCriteria = '';
            $scope.multipleParts = false;
            $scope.partsCount = null;
            $scope.partSearchState = 1; //initial search/validate
            $scope.partNumbers     = [];
            $scope.isPartDefined   = false;
            $scope.isSearched      = false;
            $scope.alternateMode   = false;
            $scope.requested       = false;
            $scope.alternatesExist = false;
            $scope.newPartsCount   = 0;
            $scope.isDone          = false;
            
            var tempPartList = _.cloneDeep($rootScope.prWorkcardParts); 

            $scope.part = {
                part_id : '',
                part_number : '',
                description : '',
                quantity : '',
                repair_flag : ''
            };
            $scope.tempPart = {
                part_id : '',
                part_number : '',
                description : '',
                quantity : '',
                repair_flag : ''                                                  
            };
            $scope.clearPart = function(){
            	$scope.part.part_id = '';
            	$scope.part.description = '';
            	$scope.part.quantity = '';
            	$scope.part.repair_flag = '';
            };
            $scope.onchange = function(){
                $scope.part.part_number = $scope.part.part_number.toUpperCase();
            	$scope.clearPart();
            	if(!$scope.part.part_number){
            		$scope.isSearched = false;
            	}
            	else if($scope.part.part_number.length <3){
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
                    }
            	},10);
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
            	if($scope.part.part_number.length > 2){
            		if($scope.searchCriteria){
            			if(!$scope.part.part_number.toString().includes($scope.searchCriteria.toString())){
            				$scope.searchCriteria = $scope.part.part_number;
            				$scope.search();
            			}
            		}else{
            			$scope.searchCriteria = $scope.part.part_number;
            			$scope.search();
            		}
            	}
            };
            
            $scope.search = function (){
            	$scope.alternateMode = false;
                $scope.isSearched = true;
                $scope.requested = false;
                $scope.populateParts();
            };
        
            $scope.fillRequest = function(partObject){
                $scope.part.part_id       = partObject.id;
                $scope.part.part_number  = partObject.part_number;
                $scope.part.description  = partObject.description;
                $scope.part.repair_flag  = partObject.repair_flag;
                
                if (partObject.rotable_flag == 'Y') $scope.part.quantity = 1;
                
                if (partObject.alternate_count > 0) 
                    $scope.alternatesExist = true;
                else $scope.alternatesExist = false;
                
                $scope.isSearched    = false;
                $scope.isPartDefined = true;
                $scope.partNumbers   = [];
            };
            
            $scope.pullPart = function(){
            	console.log("pullpart");
            	console.log($scope.isSearched);
            	 var sql = " Select a.Id,                                                                         "+
                           "       a.Part_Number,                                                                 "+
                           "       a.Description,                                                                 "+
                           "       a.Oem_Specification_Number,                                                    "+
                           "       a.Uom,                                                                         "+
                           "       Decode(a.Rotable_Flag,'Y','Y','N') Repair_Flag,                                "+
                           "       a.Ipc_Reference,                                                               "+
                           "       Ic_Service.Get_On_Hand_Quantity(a.Div_No, a.Id) || ' ' || Uom On_Hand_Quantity,"+
                           "       (Select Count(0)                                                               "+
                           "          From Ic_Part_Alternates                                                     "+
                           "         Where Div_No       = a.Div_No                                                "+
                           "           And Base_Part_Id = a.Id                                                    "+
                           "           And Active       = 'Y') Alternate_Count,                                   "+
                           "       Round(Nvl(Ic_Service.Get_Part_Price(Div_No, Id, Null),0),2) Part_Price         "+
                           "  From Ic_Parts a                                                                     "+
                           " Where a.Div_No       = "+divNo+
                           "   And a.Part_Number = '"+$scope.part.part_number+"'                                   "+
                           "   And a.Active       = 'Y'                                                           ";
                 
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
            	var sql = "Select Count(a.Id) Count "+
              			  "  From Ic_Parts a        "+
              			  " Where a.Div_No      = "+divNo+
              			  "   And a.Part_Number Like '%"+partObject.part_number+"%'"+
                          "   And a.Active      = 'Y'";
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
                }, function (error) {});
            };
            
            $scope.pullPartscount = function(){
            	console.log("pullpartscount");
            	console.log($scope.isSearched);
            	var sql = "Select Count(a.Id) Count "+
            			  "  From Ic_Parts a        "+
            			  " Where a.Div_No       = "+divNo+
            			  "   And a.Part_Number Like '%"+$scope.part.part_number+"%'"+
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
            	console.log("populate parts");
            	console.log($scope.isSearched);
            	var sql = "Select a.Id,                                                                                      "+
                          "       a.Part_Number,                                                                             "+
                          "       a.Description,                                                                             "+
                          "       a.Oem_Specification_Number,                                                                "+
                          "       a.Uom,                                                                                     "+
                          "       Decode(a.Rotable_Flag,'Y','Y','N') Repair_Flag,                                            "+
                          "       a.Ipc_Reference,                                                                           "+
                          "       Ic_Service.Get_On_Hand_Quantity(a.Div_No, a.Id) || ' ' || Uom On_Hand_Quantity,            "+
                          "       (Select Count(0)                                                                           "+
                          "          From Ic_Part_Alternates                                                                 "+
                          "         Where Div_No       = a.Div_No                                                            "+
                          "           And Base_Part_Id = a.Id                                                                "+
                          "           And Active       = 'Y') Alternate_Count,                                               "+
                          "       Round(Nvl(Ic_Service.Get_Part_Price(Div_No, Id, Null),0),2) Part_Price                     "+
                          "  From Ic_Parts a                                                                                 "+
                          " Where a.Div_No       = "+divNo+
                          "   And (a.Part_Number Like '%"+$scope.part.part_number+"%'                                  "+
                          "    Or a.Description Like '%"+$scope.part.part_number+"%')                                  "+
                          "   And a.Active       = 'Y'                                                                       "+
                          " Order By Decode(InStr(a.Part_Number,'"+$scope.part.part_number+"'),1,Decode(InStr(a.Part_Number||'x_X_x','"+$scope.part.part_number+"'||'x_X_x'),1,1||a.Part_Number,2||a.Part_Number),3||a.Part_Number)";

                var sqlArray = [{ queryStr: sql, queryType: "READ" }];
                var sqlString = JSON.stringify(sqlArray);
                WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                    $scope.partNumbers = angular.fromJson(dataIn[0].rows);
                    
                    var length = $scope.partNumbers.length;
                    if(length < 1){
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
                $scope.part.part_number = $scope.tempPart.partNumber;
                $scope.part.part_id = $scope.tempPart.part_id;
                $scope.part.description = $scope.tempPart.description;
                $scope.part.quantity = $scope.tempPart.quantity;
                $scope.part.repair_flag = $scope.tempPart.repair_flag;
            	$scope.isSearched = false;
            	$scope.alternateMode = false;
            }
            $scope.populateAlternates = function () {
                var sql = "Select b.Id,                                                                                      "+
                          "       b.Part_Number,                                                                             "+
                          "       b.Description,                                                                             "+
                          "       b.Oem_Specification_Number,                                                                "+
                          "       b.Uom,                                                                                     "+
                          "       Decode(b.Rotable_Flag,'Y','Y','N') Repair_Flag,                                            "+
                          "       b.Ipc_Reference,                                                                           "+
                          "       Ic_Service.Get_On_Hand_Quantity(b.Div_No, b.Id) || ' ' || b.Uom On_Hand_Quantity,          "+
                          "       (Select Count(0)                                                                           "+
                          "          From Ic_Part_Alternates                                                                 "+
                          "         Where Div_No       = b.Div_No                                                            "+
                          "           And Base_Part_Id = b.Id                                                                "+
                          "           And Active       = 'Y') Alternate_Count,                                               "+
                          "       Round(Nvl(Ic_Service.Get_Part_Price(b.Div_No, b.Id, Null),0),2) Part_Price                 "+
                          "  From Ic_Part_Alternates a,                                                                      "+
                          "       Ic_Parts           b                                                                       "+
                          " Where a.Div_No       = "+divNo+
                          "   And a.Base_Part_Id = "+$scope.part.part_id+
                          "   And a.Active       = 'Y'                                                                       "+
                          "   And b.Id           = a.Alternate_Part_Id                                                       "+
                          " Order By Decode(InStr(b.Part_Number,'"+$scope.part.part_number+"'),1,Decode(InStr(b.Part_Number||'x_X_x','"+$scope.part.part_number+"'||'x_X_x'),1,1||b.Part_Number,2||b.Part_Number),3||b.Part_Number)";

                var sqlArray = [{ queryStr: sql, queryType: "READ" }];
                var sqlString = JSON.stringify(sqlArray);
                WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                    $scope.partNumbers = angular.fromJson(dataIn[0].rows);
                    $scope.tempPart.part_id = $scope.part.part_id;
                    $scope.tempPart.part_number = $scope.part.part_number;
                    $scope.tempPart.description = $scope.part.description;
                    $scope.tempPart.quantity = $scope.part.quantity;
                    $scope.tempPart.repair_flag = $scope.part.repair_flag;
                    $scope.isSearched = true;
                    $scope.alternateMode = true;
                    $scope.part.part_number ='';
                }, function (error) {});
            };
            
            $scope.addNew = function(){
                if ($scope.part.part_number == '' || $scope.part.description == '' || $scope.part.quantity == '') {
                    WingsDialogService.error('Please fill all fields');
                    return false;
                }

                $.each($rootScope.prWorkcardParts, function(i){
                    if($rootScope.prWorkcardParts[i].part_number == $scope.part.part_number) {
                        WingsDialogService.error('Part number exists.');
                        return false;
                    }
                });
                
                $rootScope.prWorkcardParts.push({
                    part_id :     $scope.part.part_id,
                    part_number : $scope.part.part_number,
                    description : $scope.part.description,
                    quantity :    $scope.part.quantity,
                    repair_flag : $scope.part.repair_flag
                });
                $scope.newPartsCount++;
                $scope.clearPart();
                $scope.part.part_number = '';
                $scope.alternatesExist = false;
                $scope.focusInput('part_number');
            };
            
            $scope.done = function(){
                if ($scope.part.part_number != '' && $scope.part.description != '' && $scope.part.quantity != '') {
                    $scope.addNew();
                } else if ($scope.newPartsCount == 0) {
                    WingsDialogService.error('Please fill all fields');
                    return false;
                }
                
                $scope.isDone = true;
                $ionicHistory.goBack();
            };
            
            $rootScope.$ionicGoBack = function() {
            	if (!$scope.isDone) $rootScope.prWorkcardParts = tempPartList;
                $ionicHistory.goBack();
            };
            
            $ionicPlatform.registerBackButtonAction(function () {
                if ($scope.isSearched) {
                	$scope.clearPart();
                	$scope.part.part_number = '';
                	$scope.isSearched = false;
                	$scope.partSearchIcon(0);
                	$scope.searchCriteria = '';
                	$scope.alternateMode = false;
                	$scope.alternatesExist = false;
                	WingsUtil.Focus('part_number');
                }else{
                    $ionicHistory.goBack();
                }
            }, 100);
            
            $scope.blur = function(){
            	if($scope.part.part_number == '' || !$rootScope.globals.deviceConnectionInfo.isOnline) return false;
            	if(!$scope.isSearched){
            		 $scope.pullPartscount();
            	}
            };

        } ])