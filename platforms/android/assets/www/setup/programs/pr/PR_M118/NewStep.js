angular.module('WingsMobileStarter').controller('PR_M118.NewStep', [
        '$scope',
        '$state',
        '$cordovaBarcodeScanner',
        '$ionicModal',
        'WingsRemoteDbService',
        'WingsUtil',
        '$stateParams',
        'WingsDialogService',
        'pr',
        'sy',
        function($scope,$state,$cordovaBarcodeScanner,$ionicModal,WingsRemoteDbService,WingsUtil,$stateParams,WingsDialogService,pr,sy) {
            $scope.action = 'CREATE';
            $scope.created = false;
            $scope.card = $rootScope.prWorkcard;
            $scope.step = pr.InstantiateStep();
        	if ($rootScope.prCardStep){
        		if ($rootScope.prCardStep.ACTION_MODE && $rootScope.prCardStep.ID){
        			$scope.action = 'MODIFY';
        		}else{
        			$rootScope.prCardStep.MOBILE_RECORD_STATUS = '';
        			$rootScope.prCardStep.MOBILE_RECORD_ACTION = '';
        		}
        		$scope.step = $rootScope.prCardStep;
        	}
        	
        	$scope.newStep = function(){
                $scope.created = false;
                $scope.step = pr.InstantiateStep();
                WingsUtil.Focus('stepNumber');
            };
            $scope.doStep = function(){
	                var steps = [];
	                $scope.step.DESCRIPTION = $scope.step.DESCRIPTION.toUpperCase();
	                $scope.step.STEP_NUMBER = $scope.step.STEP_NUMBER.toUpperCase();
	                var tempStep = _.cloneDeep($scope.step);
	                tempStep.MOBILE_RECORD_ACTION = $scope.action;
	                tempStep.MOBILE_RECORD_STATUS = 'READY';
	                tempStep.MOBILE_CARD_ID       = $scope.card.MOBILE_RECORD_ID;
                    tempStep.CARD_ID              = $scope.card.ID;
	                
	                var tempTime = moment().format('YYYY-MM-DD HH:mm:ss');
	                tempStep.MOBILE_DT_MODIFIED = tempTime;
	                tempStep.MOBILE_USR_MODIFIED = $rootScope.globals.currentUser.userNumber;
	                tempStep.MOBILE_USER_ID = $rootScope.globals.currentUser.userId;
	                tempStep.DIV_NO =  $rootScope.globals.currentUser.divNo;
	                steps.push(tempStep);
	                pr.SaveStep(steps).then(function(result){
	                    tempStep.MOBILE_RECORD_ID = result.insertId;
	                    sy.CreateTransaction(tempTime,"PR_CARD_STEPS",tempStep.MOBILE_RECORD_ID,tempStep.MOBILE_RECORD_ACTION,tempStep.ID,tempStep.CARD_ID,tempStep.MOBILE_CARD_ID).then(function(res){
    	                	$scope.step = tempStep;
    	                	//$scope.step.created = true;
    	                	$scope.step.MOBILE_RECORD_ID = result.insertId;
    	                    if (!$rootScope.globals.deviceConnectionInfo.isOnline){
    	                    	WingsDialogService.notification($scope.action+' action is saved to local DB and will be synced when the device is online.','YELLOW');
    	                    	$scope.newStep();
    	                    }else{
    	                    	pr.pushAndPull($scope.card,tempStep).then(function(result){
    	        	            	if (result.status == 'SUCCEED'){
    	        	            		$scope.step.ID = result.childObj.ID;
    	        	            		var status = result.childObj.STATUS;
    	        	            		if(status == 'LOADED'){
    	        	            			WingsDialogService.success('Process Completed.');
    	        	            			$scope.newStep();
    	        	            		}else{
    	        	            			WingsDialogService.error(result.childObj.SERVER_FEEDBACK);
    	        	            		}
    	                			}else{
    	                				console.log(result.error);
    	                				WingsDialogService.error(result.error);
    	                			}
    	        	        	},function(error){
    	        	        		console.log(error);
    	        	        		WingsDialogService.error(error);
    	        	        	});
    	                    }
	                    },function(err){
                            WingsDialogService.error('Could not take action. Reason - LOCAL DB ERROR : '+ error);
                        })
	                },function(error){
	                	WingsDialogService.error('Could not take action. Reason - LOCAL DB ERROR : '+ error);
	                })
            };
        }
])