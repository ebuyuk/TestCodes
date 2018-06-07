angular.module('WingsMobileStarter').controller('PR_M118', [
    '$scope',
    '$q',
    'WingsRemoteDbService',
    '$cordovaBarcodeScanner',
    '$rootScope',
    '$ionicModal',
    '$ionicPopover',
    '$ionicPlatform',
    '$ionicHistory',
    'WingsDialogService',
    'WingsUtil',
    '$ionicLoading',
    'WingsPouchDbSetupService',
    'md5',
    'pr',
    'sy',
    function($scope,$q,WingsRemoteDbService,$cordovaBarcodeScanner,$rootScope,$ionicModal,$ionicPopover,$ionicPlatform,$ionicHistory,WingsDialogService,WingsUtil,$ionicLoading,WingsPouchDbSetupService,md5,pr,sy) {
        console.log("PR_M118");
        var userId     = $rootScope.globals.currentUser.userId;
        var divNo      = $rootScope.globals.currentUser.divNo;
        var userNumber = $rootScope.globals.currentUser.userNumber;
        $scope.sortBy ='';
        $scope.isASC = true;
        $scope.fullDescription = '';
        $scope.descVissible = true;
        $scope.navigateToBack = false;
        $scope.signWhat = '';
        $scope.digitalSign = false;
        $scope.user = {
                username:$rootScope.globals.currentUser.userId,
                password:''
        };
        function initialize () {
        	 $scope.showCard     = false;
             $scope.selectedStep = '';
        };
        initialize();
        $scope.card = pr.InstantiateCard();
        $scope.toggleSort = function (){
        	if($scope.isASC){
        		$scope.sortBy = '-'+$scope.sortBy;
        	}else{
        		$scope.sortBy = $scope.sortBy.substring(1,$scope.sortBy.length);
        	}
        	$scope.isASC = !$scope.isASC;
        	
        };
        function setActiveStep(step){
            var isMatched = false;
            for(i=0; i<$scope.steps.length; i++){
                if ((step.ID && step.ID == $scope.steps[i].ID) || (!step.ID && step.MOBILE_RECORD_ID == $scope.steps[i].MOBILE_RECORD_ID)){
                    $scope.steps[i].selected_flag = true;
                    $scope.selectedStep =  $scope.steps[i];
                    isMatched = true;
                }
            } 
            if (!isMatched){
                $scope.selectedStep = '';
            }
        }
        $scope.setSortBy = function(sortby){
        	if(sortby.indexOf("-") > -1){
        		$scope.isASC = false;
        	}else{
        		$scope.isASC = true;
        	}
        	$scope.sortBy = sortby;
        	$scope.popoverSort.hide();
        };
        $scope.closeDescription = function(){
        	$scope.popoverDescription.hide();
        };
        $scope.onblur = function(){
        	if(!$scope.navigateToBack){
        	$scope.populateCard($scope.card);
        	}
        	$scope.navigateToBack = false;
        };
        $scope.populateCard = function (workCard) {
            var deferred = $q.defer();
        	if (workCard.ID == '' && workCard.WORK_CARD_NUMBER == '') return deferred.reject("Id and Work Card Number are empty.");
        	pr.PopulateWorkCard(workCard).then(function(card){
        		$scope.card = card;
        		$rootScope.prWorkcard = card;
        		pr.PullLocalSteps($scope.card).then(function(localSteps){
					$scope.steps = localSteps;
					return deferred.resolve("GO-HEAD");
				},function(localStepError){
					$scope.steps = [];
					console.log("local step Error");
					return deferred.reject(localStepError);
				});
        	},function(err){
        		console.log(err);
        		$scope.steps = [];
				WingsDialogService.error(err);
				return deferred.reject(err);
        	})
        	return deferred.promise;
        };
        $scope.clearSteps = function(){
        	$scope.steps = [];
        	$scope.card = pr.InstantiateCard();
            WingsUtil.Focus('WORK_CARD_NUMBER');
            initialize();
        }; 
        
        $scope.toggle = function (field) {
        	 if (field == 'showCard' && $scope.card.WORK_CARD_NUMBER) {
                $scope.showCard = !$scope.showCard;
            }
        };
        
        $scope.toggleStep = function (stepObject){
        	console.log("toggle");
        	$scope.descVissible = false;
            if (stepObject.selected_flag) {
                cancelSelect();
            }
            else {
                $scope.onHoldStep(stepObject);
            }
        };
        
        $scope.onHoldStep = function (stepObject){
            angular.forEach($scope.steps, function(step) {
                step.selected_flag = false;
            });
            if(stepObject.STEP_STATUS == 'COMPLETED'){
            	cancelSelect();
            }else{
            	stepObject.selected_flag = true;
                $scope.selectedStep = stepObject;
            }
        };
        
        function cancelSelect (){
            $scope.selectedStep.selected_flag = false;
            $scope.selectedStep = '';
            $timeout(function () {
                $scope.selectedStep = $scope.selectedStep;
            },100);
        };
        
        $ionicPlatform.registerBackButtonAction(function () {
            if ($scope.selectedStep == '') {
                $ionicHistory.goBack();
            } else {
                cancelSelect();
            }
        }, 100);
        
        $scope.stepIcon = function(step){
            if (!step) return '';
            
            var iconText = 'ion-steam positive';
            
            if (step.STEP_STATUS == 'PERFORMED')
                iconText = 'ion-steam balanced';
            else if (step.STEP_STATUS == 'OPEN')
                iconText = 'ion-steam energized';
            else if (step.STEP_STATUS == 'COMPLETED')
                iconText = 'ion-steam stable';
            else
                iconText = 'ion-steam calm';
            
            if (step.selected_flag) {
                iconText = 'ion-ios-checkmark balanced';
            }
            
            return iconText;
        };

        $ionicPopover.fromTemplateUrl('templates/popover.html', {
            scope: $scope,
          }).then(function(popover) {
            $scope.popover = popover;
        });
        
        $scope.scanBarcode = function (scanObj) {
            console.log('[Wings Mobile] '+scanObj);
            $cordovaBarcodeScanner
                .scan()
                .then(function(barcodeData) {
                    if (barcodeData.text != '') {
                        tempWorkCardNumber           = $scope.card.WORK_CARD_NUMBER;
                        tempId                       = $scope.card.ID;
                        tempMobileId                 = $scope.card.MOBILE_RECORD_ID;
                        tempSteps                    = $scope.steps;
                        $scope.card.WORK_CARD_NUMBER = barcodeData.text;
                        $scope.card.ID               = '';
                        $scope.card.MOBILE_RECORD_ID = '';
                        $scope.populateCard($scope.card).then(function(res){
                            
                        },function(err){
                            $scope.card.WORK_CARD_NUMBER = tempWorkCardNumber;
                            $scope.card.ID               = tempId;
                            $scope.card.MOBILE_RECORD_ID = tempMobileId;
                            $scope.steps                 = tempSteps;
                        });
                    }else{
                        WingsDialogService.error("Barcode can not be read");
                    }
                }, function(error) {
                    console.log('Error',error);
                });
        };
        $scope.descriptionLengthCheck = function(description){
        	if(description.length > 30){
        		return '...';
        	}else return '';
        };
        $scope.newStep = function () {
            //$state.go('app.PR_M118_NewStep', {workCardObject: $scope.card});
        	var tempStep = pr.InstantiateStep();
        	tempStep.CARD_ID = $scope.card.ID;
        	tempStep.MOBILE_CARD_ID = $scope.card.MOBILE_RECORD_ID;
        	tempStep.CARD_WORK_ORDER_NUMBER = $scope.card.WORK_ORDER_NUMBER;
        	tempStep.CARD_ZONE_NUMBER = $scope.card.ZONE_NUMBER;
        	tempStep.CARD_ITEM_NUMBER = $scope.card.ITEM_NUMBER;
        	$rootScope.prCardStep = tempStep;
        	$rootScope.prWorkcard = _.cloneDeep($scope.card);
        	$state.go('app.PR_M118_NewStep');
        };

        $scope.performStep = function () {
            if($scope.digitalSign){
                $scope.hide();
                performStepHelper();
            }else{
                var result = WingsDialogService.prompt('Please enter action taken', 'Action Taken', ['Ok','Cancel'],'').then(function(result) {
                    var stepAction = result.input1;
                    // no button = 0, 'OK' = 1, 'Cancel' = 2
                    var btnIndex = result.buttonIndex;
                    if (btnIndex == 1) {
                        $scope.selectedStep.STEP_ACTION = stepAction;
                        if ($scope.digitalSign != true && $scope.selectedStep.MECHANIC_SIGNOFF_FLAG == 'Y') {
                            $scope.signWhat = 'PERFORM';
                            $scope.showModal();
                            return false;
                        } else {
                            $scope.hide();
                            performStepHelper();
                        }
                    }
                    else {
                    }
                }); 
            }
        };
        performStepHelper = function (){
            var steps = [];
            var tempStep = _.cloneDeep($scope.selectedStep);
            tempStep.MOBILE_RECORD_ACTION = 'PERFORM';
            tempStep.MOBILE_RECORD_STATUS = 'READY';
            tempStep.PERFORM_DATE = moment().format('YYYY-MM-DD');
            tempStep.MECHANIC_EMPLOYEE_NUMBER = $rootScope.globals.currentUser.userNumber;
            tempStep.MOBILE_CARD_ID = $scope.card.MOBILE_RECORD_ID;
            tempStep.CARD_ID = $scope.card.ID;
            var tempTime = moment().format('YYYY-MM-DD HH:mm:ss');
            tempStep.MOBILE_DT_MODIFIED = tempTime;
            tempStep.MOBILE_USR_MODIFIED = $rootScope.globals.currentUser.userNumber;
            tempStep.MOBILE_USER_ID = $rootScope.globals.currentUser.userId;
            tempStep.DIV_NO =  $rootScope.globals.currentUser.divNo;
            steps.push(tempStep);
            pr.SaveStep(steps).then(function(result){
                sy.CreateTransaction(tempTime,"PR_CARD_STEPS",tempStep.MOBILE_RECORD_ID,tempStep.MOBILE_RECORD_ACTION,tempStep.ID,tempStep.CARD_ID,tempStep.MOBILE_CARD_ID).then(function(result){
                    if (!$rootScope.globals.deviceConnectionInfo.isOnline){
                        WingsDialogService.notification('Perform action is saved to local DB and will be synced when the device is online.','YELLOW');  
                    }else{
                        pr.pushAndPull($scope.card,tempStep).then(function(result){
                            if (result.status == 'SUCCEED'){
                                $scope.selectedStep.ID = result.childObj.ID;
                                pr.FetchLocalStep($scope.selectedStep).then(function(res){
                                    $scope.selectedStep = res;
                                    if ($scope.selectedStep.MOBILE_RECORD_STATUS == 'LOADED'){
                                        WingsDialogService.success('Process Completed.');
                                    }else{
                                        WingsDialogService.error($scope.selectedStep.SERVER_FEEDBACK);
                                    }
                                     pr.PullLocalSteps($scope.card).then(function(localSteps){
                                        $scope.steps = localSteps;
                                        setActiveStep($scope.selectedStep);
                                    },function(localStepError){
                                        console.log("local step Error");
                                    });
                                },function(err){
                                    console.log(err);
                                    WingsDialogService.error(err);
                                })
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
        }
        $scope.modify = function(){
        	$rootScope.prWorkcard = _.cloneDeep($scope.card);
        	$rootScope.prCardStep = _.cloneDeep($scope.selectedStep);
        	$rootScope.prCardStep.MOBILE_CARD_ID = $scope.card.MOBILE_RECORD_ID;
        	$rootScope.prCardStep.CARD_ID = $scope.card.ID;
        	$rootScope.prCardStep.ACTION_MODE = 'MODIFY';
        	$state.go('app.PR_M118_NewStep');
        };
        $scope.completeStep = function () {
        	console.log("complete step pr m118");
        	/*if (!WingsUtil.IsNull($scope.selectedStep.MOBILE_RECORD_ACTION) && $scope.selectedStep.MOBILE_RECORD_ACTION != 'COMPLETE'){
            	if ($scope.selectedStep.MOBILE_RECORD_STATUS == 'REJECTED'){
            		WingsDialogService.error('Action '+ $scope.selectedStep.MOBILE_RECORD_ACTION+' is failed. Reason - '+ $scope.selectedStep.SERVER_FEEDBACK);
            	}else{
            		WingsDialogService.error('Action '+ $scope.selectedStep.MOBILE_RECORD_ACTION + ' have to be taken in order to take action COMPLETE');
            	}
            }else{*/
        	    if ($scope.digitalSign != true && $scope.selectedStep.INSPECTOR_SIGNOFF_FLAG == 'Y') {
        	        $scope.signWhat = 'COMPLETE';
                    $scope.showModal();
                    return false;
                } else {
                    $scope.hide();
                    var steps = [];
                    var tempStep = _.cloneDeep($scope.selectedStep);
                    tempStep.MOBILE_RECORD_ACTION = 'COMPLETE';
                    tempStep.MOBILE_RECORD_STATUS = 'READY';
                    tempStep.COMPLETION_DATE = moment().format('YYYY-MM-DD');
                    tempStep.INSPECTOR_EMPLOYEE_NUMBER = $rootScope.globals.currentUser.userNumber;
                    tempStep.MOBILE_CARD_ID = $scope.card.MOBILE_RECORD_ID;
                    tempStep.CARD_ID = $scope.card.ID;
                    var tempTime = moment().format('YYYY-MM-DD HH:mm:ss');
                    tempStep.MOBILE_DT_MODIFIED = tempTime;
                    tempStep.MOBILE_USR_MODIFIED = $rootScope.globals.currentUser.userNumber;
                    tempStep.MOBILE_USER_ID = $rootScope.globals.currentUser.userId;
                    tempStep.DIV_NO =  $rootScope.globals.currentUser.divNo;
                    steps.push(tempStep);
                    pr.SaveStep(steps).then(function(result){
                        sy.CreateTransaction(tempTime,"PR_CARD_STEPS",tempStep.MOBILE_RECORD_ID,tempStep.MOBILE_RECORD_ACTION,tempStep.ID,tempStep.CARD_ID,tempStep.MOBILE_CARD_ID).then(function(result){
                            if (!$rootScope.globals.deviceConnectionInfo.isOnline){
                            	WingsDialogService.notification('Complete action is saved to local DB and will be synced when the device is online.','YELLOW');	
                            }else{
                            	pr.pushAndPull($scope.card,tempStep).then(function(result){
                	            	if (result.status == 'SUCCEED'){
                	            	    $scope.selectedStep.ID = result.childObj.ID;
                	            		pr.FetchLocalStep($scope.selectedStep).then(function(res){
                	            		    $scope.selectedStep = res;
                	            			if ($scope.selectedStep.MOBILE_RECORD_STATUS == 'LOADED'){
                	                    		WingsDialogService.success('Process Completed.');
                	            			}else{
                	            				WingsDialogService.error($scope.selectedStep.SERVER_FEEDBACK);
                	            			}
                	            			 pr.PullLocalSteps($scope.card).then(function(localSteps){
                	         					$scope.steps = localSteps;
                	         					setActiveStep($scope.selectedStep);
                	         				},function(localStepError){
                	         					console.log("local step Error");
                	         				});
                	            		},function(err){
                	            			console.log(err);
                            				WingsDialogService.error(err);
                	            		})
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
                }
            //}
        };

        $scope.deleteStep = function () {
        	console.log("delete step pr m118");
        	/*if (!WingsUtil.IsNull($scope.selectedStep.MOBILE_RECORD_ACTION) && $scope.selectedStep.MOBILE_RECORD_ACTION != 'DELETE'){
            	if ($scope.selectedStep.MOBILE_RECORD_STATUS == 'REJECTED'){
            		WingsDialogService.error('Action '+ $scope.selectedStep.MOBILE_RECORD_ACTION+' is failed. Reason - '+ $scope.selectedStep.SERVER_FEEDBACK);
            	}else{
            		WingsDialogService.error('Action '+ $scope.selectedStep.MOBILE_RECORD_ACTION + ' have to be taken in order to take action DELETE');
            	}
            }else{*/
            	if ($scope.digitalSign != true) {
                    $scope.signWhat = 'DELETE';
                    $scope.showModal();
                    return false;
                } else {
                    $scope.hide();
                    var steps = [];
                    var tempStep = _.cloneDeep($scope.selectedStep);
                    //
                    tempStep.MOBILE_RECORD_ACTION = 'DELETE';
                    tempStep.MOBILE_RECORD_STATUS = 'READY';
                    tempStep.MOBILE_CARD_ID = $scope.card.MOBILE_RECORD_ID;
                    tempStep.PERFORM_DATE = moment().format('YYYY-MM-DD');
                    tempStep.MECHANIC_EMPLOYEE_NUMBER = $rootScope.globals.currentUser.userNumber;
                    tempStep.MOBILE_CARD_ID = $scope.card.MOBILE_RECORD_ID;
                    tempStep.CARD_ID = $scope.card.ID;
                    var tempTime = moment().format('YYYY-MM-DD HH:mm:ss');
                    tempStep.MOBILE_DT_MODIFIED = tempTime;
                    tempStep.MOBILE_USR_MODIFIED = $rootScope.globals.currentUser.userNumber;
                    tempStep.MOBILE_USER_ID = $rootScope.globals.currentUser.userId;
                    tempStep.DIV_NO =  $rootScope.globals.currentUser.divNo;
                    //
                    steps.push(tempStep);
                    pr.SaveStep(steps).then(function(result){
                        sy.CreateTransaction(tempTime,"PR_CARD_STEPS",tempStep.MOBILE_RECORD_ID,tempStep.MOBILE_RECORD_ACTION,tempStep.ID,tempStep.CARD_ID,tempStep.MOBILE_CARD_ID).then(function(result){
                            if (!$rootScope.globals.deviceConnectionInfo.isOnline){
                            	WingsDialogService.notification('Delete action is saved to local DB and will be synced when the device is online.','YELLOW');	
                            }else{
                            	pr.pushAndPull($scope.card,tempStep).then(function(result){
                	            	if (result.status == 'SUCCEED'){
                	            	    if (result.childObj.STATUS = 'LOADED'){
                	            	        pr.DeleteLocalStep(tempStep.MOBILE_RECORD_ID).then(function(res){
                	            	            WingsDialogService.success('Process Completed.');
                	            	        },function(err){
                	            	            console.log(err);
                	            	        })
                	            	    }else{
                	            	        WingsDialogService.error(result.childObj.SERVER_FEEDBACK);
                	            	    }
                	            	    pr.PullLocalSteps($scope.card).then(function(localSteps){
                                            $scope.steps = localSteps;
                                            setActiveStep($scope.selectedStep);
                                        },function(localStepError){
                                            console.log("local step Error");
                                        });
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
                }
                //}
        };
        $scope.showDescription = function (object,$event){
        	console.log("showdes");
        	$scope.fullDescription = object.DESCRIPTION;
        	if($scope.descVissible){
        	$scope.popoverDescription.show($event)
        	}
        	$scope.descVissible = true;
        };
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if (toState.name == 'app.PR_M118' && fromState.name == 'app.PR_M118_NewStep'){
                pr.PullLocalSteps($scope.card).then(function(localSteps){
					$scope.steps = localSteps;
				},function(localStepError){
					$scope.steps = [];
					console.log("local step Error");
				});
                cancelSelect();
                $scope.card.stepObject = null;
            }
        });
        
        $ionicPopover.fromTemplateUrl('templates/popoverDescription.html', {
            scope: $scope,
        }).then(function(popover) {
          $scope.popoverDescription = popover;
        });
        
        $ionicPopover.fromTemplateUrl('templates/popoverTooltip.html', {
            scope: $scope,
        }).then(function(popover) {
          $scope.popoverTooltip = popover;
        });
        
        $ionicPopover.fromTemplateUrl('templates/popoverSort.html', {
            scope: $scope,
        }).then(function(popover) {
          $scope.popoverSort = popover;
        });
        
        $rootScope.$ionicGoBack = function() {
            $scope.navigateToBack = true;
            $rootScope.prWorkcard = '';
            $ionicHistory.goBack();
        };
        
        $scope.discard = function (){
            sy.DiscardTransaction($scope.selectedStep.MOBILE_RECORD_ID,'PR_CARD_STEPS').then(function(result){
                if($scope.selectedStep.ID){
                    pr.pushAndPull($scope.card).then(function(result){
                        if (result.status == 'FAILED'){
                             WingsDialogService.error(result.error);
                        }
                        pr.PullLocalSteps($scope.card).then(function(localSteps){
                            $scope.steps = localSteps;
                            setActiveStep($scope.selectedStep);
                        },function(localStepError){
                            $scope.steps = [];
                            console.log("local step Error");
                        });
                    },function(error){
                        console.log(error);
                        WingsDialogService.error(error);
                    });
                }else{
                    pr.DeleteLocalStep($scope.selectedStep.MOBILE_RECORD_ID).then(function(res){
                        pr.pushAndPull($scope.card).then(function(result){
                            if (result.status == 'FAILED'){
                                 WingsDialogService.error(result.error);
                            }
                            pr.PullLocalSteps($scope.card).then(function(localSteps){
                                $scope.steps = localSteps;
                                setActiveStep($scope.selectedStep);
                            },function(localStepError){
                                $scope.steps = [];
                                console.log("local step Error");
                            });
                        },function(error){
                            console.log(error);
                            WingsDialogService.error(error);
                        });
                    },function(err){
                        console.log(err);
                        pr.PullLocalSteps($scope.card).then(function(localSteps){
                            $scope.steps = localSteps;
                            setActiveStep($scope.selectedStep);
                        },function(localStepError){
                            $scope.steps = [];
                            console.log("local step Error");
                        });
                    })    
                }
            },function(err){
                console.log(err);
            })
        };
        $scope.doRefresh = function(){
        	cancelSelect();
        	if (!$rootScope.globals.deviceConnectionInfo.isOnline){
        		WingsDialogService.error('Please connect to internet to refresh steps.');
        		$scope.$broadcast('scroll.refreshComplete');
        	} else{
        	    pr.pushAndPull($scope.card).then(function(result){
                    if (result.status == 'SUCCEED'){
                         pr.PullLocalSteps($scope.card).then(function(localSteps){
                            $scope.steps = localSteps;
                            setActiveStep($scope.selectedStep);
                            $scope.$broadcast('scroll.refreshComplete');
                        },function(localStepError){
                            $scope.steps = [];
                            console.log("local step Error");
                            $scope.$broadcast('scroll.refreshComplete');
                        });
                    }else{
                        console.log(result.error);
                        WingsDialogService.error(result.error);
                        $scope.$broadcast('scroll.refreshComplete');
                    }
                },function(error){
                    console.log(error);
                    WingsDialogService.error(error);
                    $scope.$broadcast('scroll.refreshComplete');
                });
        	}
        };
        $scope.openPopover = function($event, msg) {
            console.log(msg);
            $scope.responseMessage = msg
            $scope.popoverTooltip.show($event);
            $event.stopPropagation();
        };
        
        $ionicModal.fromTemplateUrl('templates/digitalSign.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.digitalSignModal = modal;
        });
        
        $scope.showModal = function (action) {
            $scope.isModalActive = true;
            $scope.user.password = '';
            $scope.digitalSignModal.show();
            if (!WingsUtil.IsNull($scope.canvas)) {
                $scope.canvas.clear();
                $scope.canvas.backgroundColor="#f5f2f0";
                $scope.canvas.renderAll();
            } else {
                $scope.canvas = new fabric.Canvas ('prm118');
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
                $scope.canvas.setHeight($scope.digitalSignModal.modalEl.clientHeight-200);
                $scope.canvas.setWidth($scope.digitalSignModal.modalEl.clientWidth);
                $scope.canvas.width  = $scope.digitalSignModal.modalEl.clientWidth;
                $scope.canvas.height = ($scope.digitalSignModal.modalEl.clientHeight)-200;
                $scope.canvas.isDrawingMode = true;
                $scope.canvas.isEdited = false;
                $scope.canvas.freeDrawingBrush.width = 1;
                $scope.canvas.freeDrawingBrush.color = '#000000';
                $scope.canvas.renderAll();
            }
        };
        
        $scope.hide = function(){
            $scope.digitalSignModal.hide();
            $scope.digitalSign = false
            $scope.user.username = $rootScope.globals.currentUser.userId;
            $scope.user.password = '';
        }
        
        $scope.$on('modal.hidden', function() {
            $scope.isModalActive = false;
          });
        
        $scope.signin = function () {
            $ionicLoading.show({
                noBackdrop: true,
                template: '<ion-spinner icon="bubbles"/>'
            });
            /*WingsPouchDbSetupService.executeLogin(angular.uppercase($scope.user.username),md5.createHash($scope.user.password),md5.createHash($scope.user.password.toUpperCase())).then(function (response) {
                $ionicLoading.hide();
                if (!WingsUtil.IsNull(response)) {
                    $scope.digitalSign = true;
                    if ($scope.signWhat == 'COMPLETE') {
                        $scope.completeStep();
                    } else if ($scope.signWhat == 'PERFORM'){
                        $scope.performStep();
                    }else{
                        $scope.deleteStep();
                    }
                } else {
                    WingsDialogService.alert("Invalid username or Password !", 'Error', 'OK');
                }
            }, function (error) {
                $ionicLoading.hide();
                WingsDialogService.alert("Invalid username or Password !", 'Error', 'OK');
            });
            */
            
            sy.Login ($scope.user.username,$scope.user.password).then(function (response) {
                $ionicLoading.hide();
                if (response.success) {
                    $scope.digitalSign = true;
                    if ($scope.signWhat == 'COMPLETE') {
                        $scope.completeStep();
                    } else if ($scope.signWhat == 'PERFORM'){
                        $scope.performStep();
                    }else{
                        $scope.deleteStep();
                    }
                } else {
                    WingsDialogService.alert("Invalid username or Password !", 'Error', 'OK');
                }
            }, function (error) {
                $ionicLoading.hide();
                WingsDialogService.alert("Invalid username or Password !", 'Error', 'OK');
            });
        };
        $scope.clearCanvas = function () {
            $scope.canvas.clear();
            $scope.canvas.setHeight($scope.digitalSignModal.modalEl.clientHeight-200);
            $scope.canvas.setWidth($scope.digitalSignModal.modalEl.clientWidth);
            $scope.canvas.width  = $scope.digitalSignModal.modalEl.clientWidth;
            $scope.canvas.height = ($scope.digitalSignModal.modalEl.clientHeight)-200;
            $scope.canvas.renderAll();
        }
        if ($rootScope.prWorkcard){
        	pr.FetchLocalData($rootScope.prWorkcard).then(function(res){
	        	$scope.card = res;
	        	pr.PullLocalSteps($scope.card).then(function(localSteps){
					$scope.steps = localSteps;
					if($rootScope.prStep){
					    setActiveStep($rootScope.prStep);
					    $rootScope.prStep = '';
					}
				},function(localStepError){
					$scope.steps = [];
					console.log("local step Error");
				});
        	},function(err){
  			  console.log(err);
  		  })
        	//$scope.populateCard($rootScope.prWorkcard);
        }else{
        	 WingsUtil.Focus('WORK_CARD_NUMBER');
        }
    } 
])