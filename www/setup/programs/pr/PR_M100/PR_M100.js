angular.module('WingsMobileStarter').controller('PR_M100', [
        '$scope',
        '$state',
        '$cordovaBarcodeScanner',
        'WingsRemoteDbService',
        'WingsDialogService',
        '$ionicHistory',
        'pr',
        'sy',
        '$cordovaVibration',
        'WingsUtil',
        function($scope,$state,$cordovaBarcodeScanner,WingsRemoteDbService,WingsDialogService,$ionicHistory,pr,sy,$cordovaVibration,WingsUtil) {
            console.log('PR_M100');

            $scope.skillCodes     = [];
            $scope.showCard       = false;
            $scope.evaluated      = false;
            $scope.isPartsShown   = true;
            $scope.skillIndex     = 0;
            $scope.skillsTimesArr = [];
            $scope.parts          = [];
            $scope.contractGroups = [];
            $scope.milestones     = [];
            $scope.flags          = [];
            
            function initialize () {
            	$scope.showCard       = false;
                $scope.evaluated      = false;
                $scope.isPartsShown   = true;
                $scope.skillIndex     = 0;
                $scope.skillsTimesArr = [];      
                $scope.parts          = [];
            };
            
            $scope.navigateToBack = false;
            $scope.card = pr.InstantiateCard();
            
            $scope.clearCard = function () {
            	$scope.card = pr.InstantiateCard();
            	initialize();
                WingsUtil.Focus('workcard');
            };
            
            $scope.scanBarcode = function (scanObj) {
                console.log('[Wings Mobile] '+scanObj);
                $cordovaBarcodeScanner
                    .scan()
                    .then(function(barcodeData) {
                        if (barcodeData.text != '') {
                            tempWorkCardNumber           = $scope.card.WORK_CARD_NUMBER;
                            tempId                       = $scope.card.ID;
                            tempMobileId                 = $scope.card.MOBILE_RECORD_ID;
                            tempMilestones               = $scope.milestones;
                            $scope.card.WORK_CARD_NUMBER = barcodeData.text;
                            $scope.card.ID               = '';
                            $scope.card.MOBILE_RECORD_ID = '';
                            $scope.populateWorkCard($scope.card).then(function(res){
                                
                            },function(err){
                                $scope.card.WORK_CARD_NUMBER = tempWorkCardNumber;
                                $scope.card.ID               = tempId;
                                $scope.card.MOBILE_RECORD_ID = tempMobileId;
                                $scope.milestones =  tempMilestones;
                            });
                        }else{
                            WingsDialogService.error("Barcode can not be read");
                        }
                    }, function(error) {
                        console.log('Error',error);
                    });
            };

            $scope.onblur = function(){
            	if(!$scope.navigateToBack){
               	    $scope.populateWorkCard($scope.card);
            	}
            	$scope.navigateToBack = false;
            };
            $scope.populateWorkCard = function(workCard){
                var deferred = $q.defer();
            	if ($scope.card.ID == '' && $scope.card.WORK_CARD_NUMBER == '') return deferred.reject("Id and Work Card Number are empty.");
            	pr.PopulateWorkCard(workCard).then(function(card){
            		$scope.card = card;
            		getMilestones();
            		$rootScope.prWorkcard = card;
                	setInitialValues();
                	return deferred.resolve("GO-HEAD");
            	},function(err){
            		console.log(err);
    				WingsDialogService.error(err);
    				return deferred.reject(err);
            	})
            	return deferred.promise;
            };
            
            
            sy.GetTableRows("Select * From Lb_Skill_Codes Where Div_No = ? And Active = 'Y' Order By Skill_Code",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.skillCodes = result;
            }); 
            
            function setInitialValues(){
            	$scope.showCard     = false;
                $scope.evaluated    = false;
                $scope.isPartsShown = true;
                $scope.skillIndex = 0;
                $scope.skillsTimesArr = [];
                $scope.parts = [];
            	for(j = 0 ; j<$scope.card.SKILL_CODES.length; j++){
             		$scope.skillsTimesArr.push({
             			id: j+1,
                        skillCode : $scope.card.SKILL_CODES[j],
                        estimatedTime : $scope.card.ESTIMATED_TIMES[j] ? Number($scope.card.ESTIMATED_TIMES[j]) : null
             		});
             		$scope.skillIndex = $scope.card.SKILL_CODES.length;
             	}
            	if($scope.skillsTimesArr.length < 1){
            		$scope.addNewSkill();
            	}
            	
            	for(l = 0; l<$scope.card.PART_IDS.length;l++){
            		$scope.parts.push({
                        part_id     : $scope.card.PART_IDS[l],
                        part_number : $scope.card.PART_NUMBERS[l],
                        description : $scope.card.PART_DESCRIPTIONS[l],
                        quantity    : Number($scope.card.PART_QUANTITIES[l]),
                        repair_flag : $scope.card.PART_REPAIR_FLAGS[l],
                    });
            	}
            	$timeout(function () {
                    $scope.parts = $scope.parts;
                },10);
            };
            
            sy.GetTableRows("Select * From Pr_Contract_Groups Where Div_No = ? And Active = 'Y' Order By Contract_Group",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.contractGroups = result;
            });
            
            function getMilestones () {
                if (!$rootScope.globals.deviceConnectionInfo.isOnline) return;
                var deferred = $q.defer();
                var response;

                var sql7 = "Select Milestone,            " +
                           "       Description           " +
                           "  From Pr_Project_Milestones " +
                           " Where Div_No         = "+$rootScope.globals.currentUser.divNo+
                           "   And Project_Number = '"+$scope.card.PROJECT_NUMBER+"'"+
                           "   And Active         = 'Y'  " +
                           " Order By Milestone          " ;
                
                var sqlArr = [{queryStr: sql7,queryType: "READ"}];
              
                var sqlStr = JSON.stringify(sqlArr);
                WingsRemoteDbService.executeQuery(sqlStr).then(function (dataIn) {
                    console.log("[MULTI QUERY][FETCH NEW UPDATES][SUCCESS] : " +JSON.stringify(dataIn[2]));
                    $scope.milestones     = angular.fromJson(dataIn[0].rows);
                    return deferred.resolve("GOHEAD");
                }, function (error) {
                    console.log(error.status +" MESSAGE : "+error.message);
                    response = { success: false, message: 'Cannot Fetch setup data' };
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });
                return deferred.promise;
            };
            
            $scope.toggle = function (field) {
            	 if (field == 'showCard' && $scope.card.work_card_number) {
                    $scope.showCard = !$scope.showCard;
                }
            };
            
            $scope.addNewSkill = function (index) {
                if (!$scope.bumped){
            		if ($scope.skillsTimesArr.length < 1){	
                		$scope.skillIndex++;
                        $scope.skillsTimesArr.push({
                            id : $scope.skillIndex,
                            skillCode : '',
                            estimatedTime : null
                        });
                	} else{
            	        var currentObject = $scope.skillsTimesArr[$scope.skillIndex-1];
            	        if (!WingsUtil.IsNull(currentObject.estimatedTime) && !WingsUtil.IsNull(currentObject.skillCode)){
                            $scope.skillIndex++;
                            $scope.skillsTimesArr.push({
                                id : $scope.skillIndex,
                                skillCode : '',
                                estimatedTime : null
                            });
            	        }
            	    }
            	}
            };
            
            $scope.activateDelete = function (object){
            	if(!$scope.evaluated){
            	    if ($scope.skillIndex <= 1) return false;
            	    object.showDelete = true;
            	}
            };
            
            $scope.removeSkill = function (index) {
            	if(!$scope.evaluated){
                    if ($scope.skillIndex <= 1) return false;
    
                    $cordovaVibration.vibrate(20);
                    $.each($scope.skillsTimesArr, function(i){
                        if($scope.skillsTimesArr[i].id == index.id) {
                            $scope.skillsTimesArr.splice(i,1);
                            $scope.skillIndex--;
                            return false;
                        }
                    });
                    $.each($scope.skillsTimesArr, function(i){
                        $scope.skillsTimesArr[i].id = i+1;
                    });                
            	}
            };

            $scope.newPart = function () {
                console.log("NEW PART");
                $rootScope.prWorkcardParts = _.cloneDeep($scope.parts);
                $state.go('app.PR_M100_NewPart');
            };

            $scope.removePart = function (partObject) {
                console.log("REMOVE PART");
                $.each($scope.parts, function(i){
                    if($scope.parts[i].part_number == partObject.part_number) {
                        $scope.parts.splice(i,1);
                        return false;
                    }
                });
            };
            
            $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
                if (toState.name == 'app.PR_M100' && fromState.name == 'app.PR_M100_NewPart'){
                    $scope.parts = _.cloneDeep($rootScope.prWorkcardParts);
                }
            });
            
            $scope.evaluate = function () {
                if (!$scope.card.WORK_CARD_ACTIONS.includes('EVALUATE')){
                    WingsDialogService.error('Evaluate action can not be done on this workcard!'); 
                    return false;
                }
            	$scope.card.SKILL_CODES       = [];
                $scope.card.ESTIMATED_TIMES   = [];
                $scope.card.PART_IDS          = [];
                $scope.card.PART_NUMBERS      = [];
                $scope.card.PART_DESCRIPTIONS = [];
                $scope.card.PART_QUANTITIES   = [];
                $scope.card.PART_REPAIR_FLAGS = [];
                for (i = 0; i < $scope.skillsTimesArr.length; i++ ){
                	if (!WingsUtil.IsNull($scope.skillsTimesArr[i].skillCode) && !WingsUtil.IsNull($scope.skillsTimesArr[i].estimatedTime)){
                        $scope.card.SKILL_CODES.push($scope.skillsTimesArr[i].skillCode);
                        $scope.card.ESTIMATED_TIMES.push($scope.skillsTimesArr[i].estimatedTime);
                	}
                }
                for (var i = 0; i < $scope.parts.length;i++) {
                	$scope.card.PART_NUMBERS.push($scope.parts[i].part_number);
                    $scope.card.PART_IDS.push($scope.parts[i].part_id);
                    $scope.card.PART_DESCRIPTIONS.push($scope.parts[i].description);
                    $scope.card.PART_QUANTITIES.push($scope.parts[i].quantity);
                    $scope.card.PART_REPAIR_FLAGS.push($scope.parts[i].repair_flag);
                }
                
                var cards = [];
                var tempCard = _.cloneDeep($scope.card);
                tempCard.MOBILE_RECORD_ACTION = 'EVALUATE';
                tempCard.MOBILE_RECORD_STATUS = 'READY';
                var tempTime = moment().format('YYYY-MM-DD HH:mm:ss');
                tempCard.MOBILE_DT_MODIFIED = tempTime;
                tempCard.MOBILE_USR_MODIFIED = $rootScope.globals.currentUser.userNumber;
                tempCard.MOBILE_USER_ID = $rootScope.globals.currentUser.userId;
                tempCard.DIV_NO =  $rootScope.globals.currentUser.divNo;
                cards.push(tempCard);
                pr.SaveCard(cards).then(function(result){
                    sy.CreateTransaction(tempTime,"PR_WORK_CARDS",tempCard.MOBILE_RECORD_ID,tempCard.MOBILE_RECORD_ACTION,tempCard.ID).then(function(result){
	                    if (!$rootScope.globals.deviceConnectionInfo.isOnline){
	                    	WingsDialogService.notification('Evaluate action is saved to local DB and will be synced when the device is online.','YELLOW');	
	                    }else{
	                    	pr.pushAndPull(tempCard).then(function(result){
	        	            	if (result.status == 'SUCCEED'){
	        	            		$scope.card.ID = result.cardObj.ID;
	        	            		$scope.card.MOBILE_RECORD_ID =  result.cardObj.MOBILE_RECORD_ID;
	        	            		pr.FetchLocalData($scope.card).then(function(res){
	        	            			$scope.card = res;
	        	            			setInitialValues();
	        	            			if ($scope.card.MOBILE_RECORD_STATUS == 'LOADED'){
	        	                    		WingsDialogService.success('Process Completed.');
	        	                    		$scope.evaluated = true;
	        	            			}else{
	        	            				WingsDialogService.error($scope.card.SERVER_FEEDBACK);
	        	            				$scope.evaluated = false;
	        	            			}
	        	            		},function(err){
	        	            			console.log(err);
	                    				WingsDialogService.error(err);
	        	            		})
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
            
            initialize();
            $scope.flags = pr.GetFlags();
            
            $rootScope.$ionicGoBack = function() {
            	$rootScope.prWorkcard = '';
          	    $scope.navigateToBack = true;
                $ionicHistory.goBack();
            };
            
            if ($rootScope.prWorkcard){
            	pr.FetchLocalData($rootScope.prWorkcard).then(function(res){
	            	$scope.card = res;
	            	getMilestones();
	            	setInitialValues();
            	},function(err){
      			  console.log(err);
      		  })
            }else{
            	 WingsUtil.Focus('WORK_CARD_NUMBER');
            }
        }
])