angular.module('WingsMobileStarter').controller('PR_M119', [
        '$scope',
        '$state',
        '$cordovaBarcodeScanner',
        'WingsDialogService',
        '$ionicHistory',
        '$cordovaVibration',
        'WingsUtil',
        'pr',
        'sy',
        function($scope,$state,$cordovaBarcodeScanner,WingsDialogService,$ionicHistory,$cordovaVibration,WingsUtil,pr,sy) {
            console.log('PR_M119');
            $scope.navigateToBack = false;
            $scope.skillCodes = [];
            $scope.card = pr.InstantiateCard();
            
            function initialize () {
                $scope.showCard   = false;
                $scope.bumped     = false;
                $scope.skillIndex = 0;
                $scope.skillsTimesArr = [];                
            };
            function setInitialValues(){
            	$scope.showCard   = false;
                $scope.bumped     = false;
                $scope.skillIndex = 0;
                $scope.skillsTimesArr = [];
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
            };

            $scope.clearCard = function () {
            	$scope.card = pr.InstantiateCard();
                initialize();
                WingsUtil.Focus('WORK_CARD_NUMBER');
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
                            $scope.card.WORK_CARD_NUMBER = barcodeData.text;
                            $scope.card.ID               = '';
                            $scope.card.MOBILE_RECORD_ID = '';
                            $scope.populateWorkCard($scope.card).then(function(res){
                                
                            },function(err){
                                $scope.card.WORK_CARD_NUMBER = tempWorkCardNumber;
                                $scope.card.ID               = tempId;
                                $scope.card.MOBILE_RECORD_ID = tempMobileId;
                            });
                        }else{
                            WingsDialogService.error("Barcode can not be read");
                        }
                    }, function(error) {
                        console.log('Error',error);
                    });
            };

            $scope.onblur = function(){
                if (!$scope.navigateToBack){
            	    $scope.populateWorkCard($scope.card);
            	}
            	$scope.navigateToBack = false;
            };
            
            $scope.populateWorkCard = function(workCard){
                var deferred = $q.defer();
            	if (workCard.ID == '' && workCard.WORK_CARD_NUMBER == '') return;
            	pr.PopulateWorkCard(workCard).then(function(card){
            		$scope.card = card;
            		setInitialValues();
            		return deferred.resolve("GO-HEAD");
            	},function(err){
            		console.log(err);
        			//initialize();
    				WingsDialogService.error(err);
    				return deferred.reject(err);
            	})
            	return deferred.promise;
            };
            
            sy.GetTableRows("Select * From Lb_Skill_Codes Where Div_No = ? And Active = 'Y' Order By Skill_Code",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.skillCodes = result;
            }); 
            
            $scope.toggle = function (field) {
                if (field == 'showCard' && $scope.card.WORK_CARD_NUMBER) {
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
            	if (!$scope.bumped){
            	    if ($scope.skillIndex <= 1) return false;
            	    object.showDelete = true;
            	}
            };
            
            $scope.removeSkill = function (index) {
            	if (!$scope.bumped){
                    if ($scope.skillIndex <= 1) return false;
                    $cordovaVibration.vibrate(20);
                    $.each ($scope.skillsTimesArr, function(i){
                        if ($scope.skillsTimesArr[i].id == index.id) {
                            $scope.skillsTimesArr.splice(i,1);
                            $scope.skillIndex--;
                            return false;
                        }
                    });
                    $.each ($scope.skillsTimesArr, function(i){
                        $scope.skillsTimesArr[i].id = i+1;
                    });                
            	}
            };
            
            $scope.bump = function () {
                if (!$scope.card.WORK_CARD_ACTIONS.includes('BUMP')){
                    WingsDialogService.error('Bump action can not be done on this workcard!'); 
                    return false;
                }
                $scope.card.SKILL_CODES     = [];
                $scope.card.ESTIMATED_TIMES = [];
                for (i = 0; i < $scope.skillsTimesArr.length; i++ ){
                	if (!WingsUtil.IsNull($scope.skillsTimesArr[i].skillCode) && !WingsUtil.IsNull($scope.skillsTimesArr[i].estimatedTime)){
                        $scope.card.SKILL_CODES.push($scope.skillsTimesArr[i].skillCode);
                        $scope.card.ESTIMATED_TIMES.push($scope.skillsTimesArr[i].estimatedTime);
                	}
                }
                /*if (!WingsUtil.IsNull($scope.card.MOBILE_RECORD_ACTION) && $scope.card.MOBILE_RECORD_ACTION != 'BUMP'){
                	if ($scope.card.MOBILE_RECORD_STATUS == 'REJECTED'){
                		WingsDialogService.error('Action '+ $scope.card.MOBILE_RECORD_ACTION+' is failed. Reason - '+ $scope.card.SERVER_FEEDBACK);
                	}else{
                		WingsDialogService.error('Action '+ $scope.card.MOBILE_RECORD_ACTION + ' have to be taken in order to take action BUMP');
                	}
                }else{*/
	                var cards = [];
	                var tempCard = _.cloneDeep($scope.card);
	                tempCard.MOBILE_RECORD_ACTION = 'BUMP';
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
    	                        $scope.bumped = true;
    	                    	WingsDialogService.notification('Bump action is saved to local DB and will be synced when the device is online.','YELLOW');	
    	                    } else {
    	                    	pr.pushAndPull(tempCard).then(function(result){
    	        	            	if (result.status == 'SUCCEED'){
    	        	            		$scope.card.ID = result.cardObj.ID;
    	        	            		$scope.card.MOBILE_RECORD_ID =  result.cardObj.MOBILE_RECORD_ID;
    	        	            		pr.FetchLocalData($scope.card).then(function(res){
    	        	            			initialize();
    	        	            			$scope.card = res;
    	        	            			setInitialValues();
    	        	            			if ($scope.card.MOBILE_RECORD_STATUS == 'LOADED'){
    	        	                    		WingsDialogService.success('Process Completed.');
    	        	                    		$scope.bumped = true;
    	        	            			}else{
    	        	            				WingsDialogService.error($scope.card.SERVER_FEEDBACK);
    	        	            			}
    	        	            		},function(err){
    	        	            			console.log(err);
    	        	            			initialize();
    	                    				WingsDialogService.error(err);
    	        	            		})
    	                			}else{
    	                				console.log(result.error);
    	                				WingsDialogService.error(result.error);
    	                			}
    	        	        	},function(error){
    	        	        		console.log(result.error);
    	        	        		initialize();
    	        	        		WingsDialogService.error(result.error);
    	        	        	});
    	                    }
	                },function(error){
	                	WingsDialogService.error('Could not take action. Reason - LOCAL DB ERROR : '+ error);
	                })
                	
                },function(err){
                    WingsDialogService.error('Could not take action. Reason - LOCAL DB ERROR : '+ error);
                })
                //}
            };
            
            $rootScope.$ionicGoBack = function() {
          	  $scope.navigateToBack = true;
          	  $rootScope.prWorkcard = '';
              $ionicHistory.goBack();
            };
            initialize();
            
            if ($rootScope.prWorkcard){
            	pr.FetchLocalData($rootScope.prWorkcard).then(function(res){
	            	$scope.card = res;
	            	setInitialValues();
            	},function(err){
      			  console.log(err);
      		    })
            	//$scope.populateWorkCard($rootScope.prWorkcard);
            }else{
            	 WingsUtil.Focus('WORK_CARD_NUMBER');
            }
        } ])