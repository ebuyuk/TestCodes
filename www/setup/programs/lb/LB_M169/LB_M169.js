angular.module('WingsMobileStarter').controller('LB_M169', [
        '$scope',
        '$state',
        '$cordovaBarcodeScanner',
        '$ionicModal',
        'WingsRemoteDbService',
        'WingsUtil',
        '$stateParams',
        '$ionicPlatform',
        '$ionicPopover',
        'WingsDialogService',
        '$ionicHistory',
        '$cordovaVibration',
        'pr',
        'sy',
        function($scope,$state,$cordovaBarcodeScanner,$ionicModal,WingsRemoteDbService,WingsUtil,$stateParams,$ionicPlatform,$ionicPopover,WingsDialogService,$ionicHistory,$cordovaVibration,pr,sy) {
            console.log('LB_M169');
            $scope.sortBy ='';
            $scope.isASC = true;
            $scope.showCard = false;
            $scope.searchCriteria = "";
            $scope.selectedRequest = '';
            $scope.navigateToBack = false;
            var divNo      = $rootScope.globals.currentUser.divNo;
            var userId     = $rootScope.globals.currentUser.userId;
            var userNumber = $rootScope.globals.currentUser.userNumber;
            
            $scope.card = pr.InstantiateCard();
            $scope.requisitions = [];
            
            $scope.toggleSort = function (){
            	if($scope.isASC){
            		$scope.sortBy = '-'+$scope.sortBy;
            	}else{
            		$scope.sortBy = $scope.sortBy.substring(1,$scope.sortBy.length);
            	}
            	$scope.isASC = !$scope.isASC;
            	
            };
            $scope.setBorder = function(text){
            	if (!WingsUtil.IsNull(text)){
            		return { border : "0px solid red"}
            	}
            };
            $scope.setSortBy = function(sortby){
            	if(sortby.indexOf("-") > -1){
            		$scope.isASC = false;
            	}else{
            		$scope.isASC = true;
            	}
            	$scope.sortBy = sortby;
            	$scope.popoverSort.hide();
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
                            $scope.populateCard($scope.card).then(function(res){
                                
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
            
            $scope.toggle = function (field) {
                if (field == 'showCard' && $scope.card.WORK_CARD_NUMBER) {
                    $scope.showCard = !$scope.showCard;
                }
            };
            
            $scope.clearCard = function () {
                $scope.card = pr.InstantiateCard();
                WingsUtil.Focus('workcard');
                initialize();
            };
            function initialize () {
                $scope.requisitions = [];  
                $scope.showCard   = false;
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
                    pr.PullLocalRequisitions($scope.card).then(function(localRequisitions){
                        $scope.requisitions = localRequisitions;
                        return deferred.resolve("GO-HEAD");
                    },function(localStepError){
                        $scope.requisitions = [];
                        console.log("local requisition Error");
                        return deferred.reject(localStepError);
                    });
                },function(err){
                    console.log(err);
                    $scope.requisitions = [];
                    WingsDialogService.error(err);
                    return deferred.reject(err);
                })
                return deferred.promise;
            };
            
            function pullRequisitions () { // getRequisitions
            	if (!$rootScope.globals.deviceConnectionInfo.isOnline){//offline
                	pr.PullLocalRequisitions($scope.card.ID).then(function(result){
                		$scope.requisitions = result;
                	},function(error){
                		$scope.PullLocalRequisitions = [];
                		WingsDialogService.error(error);
                	});
                }else{
                	pushRequisitions($scope.card.ID).then(function(returnObject){
                		var rejectedRequisitions = returnObject.requisitions;
                		pr.RemoveRequisitions($scope.card.ID).then(function(removeResult){
                			pullRemoteRequisitions($scope.card).then(function(requisitions){
                				if (requisitions.length > 0){
                					for (i= 0; i<rejectedRequisitions.length; i++){
                                        _.remove(requisitions, function(object) {
                                   	        return Number(rejectedRequisitions[i]) == Number(object.ORDER_LINE_ID);
                                    	});
                                    }
                					if(requisitions.length > 0){
        	        					pr.SaveRequisition(requisitions).then(function (saveResult){
        	        						pr.PullLocalRequisitions($scope.card.ID).then(function(localRequisitions){
        	        							$scope.requisitions = localRequisitions;
        	        						},function(localRequisitionError){
        	        							$scope.requisitions= [];
        	        							console.log("local requisition Error");
        	        						});
        	            				},function(saveError){
        	            					console.log("save error");
        	            				});
                					}else{
                						pr.PullLocalRequisitions($scope.card.ID).then(function(localRequisitions){
                							$scope.requisitions = localRequisitions;
                						},function(localRequisitionError){
                							$scope.requisitions= [];
                							console.log("local requisition Error");
                						});
                					}
                				}
                				else {
                					pr.PullLocalRequisitions($scope.card.ID).then(function(localRequisitions){
            							$scope.requisitions = localRequisitions;
            						},function(localRequisitionError){
            							$scope.requisitions= [];
            							console.log("local requisition Error");
            						});
                				}
            				},function(error){
            					console.log("pull error");
            					$scope.requisitions= [];
            				});
                		},function(removeError){
                			console.log("remove Error");
                			$scope.requisitions= [];
                		})
                	},function(pushError){
                		console.log("push error");
                		$scope.requisitions= [];
                	})
                }
            };
            
            $scope.newRequest = function (){
            	$rootScope.prWorkcard = _.cloneDeep($scope.card);
                $state.go('app.LB_M169_PartRequest');
            };
            $scope.editRequest = function(){
            	$rootScope.prWorkcard = _.cloneDeep($scope.card);
            	$rootScope.prCardRequisition = _.cloneDeep($scope.selectedRequest);
                $state.go('app.LB_M169_PartRequest');
            }
            
            $scope.toggleRequest = function (partObject){
                if (partObject.selected_flag) {
                    cancelSelect();
                }
                else {
                    $scope.onHoldRequest(partObject);
                }
            };
            
            $scope.onHoldRequest = function (partObject){
                //$cordovaVibration.vibrate(20);
                angular.forEach($scope.requisitions, function(part) {
                    part.selected_flag = false;
                });
                if(partObject.status == 'CANCELLED' || partObject.status == 'CLOSED' || partObject.status == 'COMPLETED'){
                	cancelSelect();
                }else{
                partObject.selected_flag = true;
                $scope.selectedRequest = partObject;
                }
            };
            
            function cancelSelect (){
                $scope.selectedRequest.selected_flag = false;
                $scope.selectedRequest = '';
                $timeout(function () {
                    $scope.selectedRequest = $scope.selectedRequest;
                },100);
            };
            
            $ionicPlatform.registerBackButtonAction(function () {
                if ($scope.selectedRequest == '') {
                    $ionicHistory.goBack();
                } else {
                    cancelSelect();
                }
            }, 100);
            
            $scope.cancelRequest = function (){
        
                /*if (!WingsUtil.IsNull($scope.selectedRequest.MOBILE_RECORD_ACTION) && $scope.selectedRequest.MOBILE_RECORD_ACTION != 'REQUEST'){
                    if ($scope.selectedRequest.MOBILE_RECORD_STATUS == 'REJECTED'){
                        WingsDialogService.error('Action '+ $scope.selectedRequest.MOBILE_RECORD_ACTION+' is failed. Reason - '+ $scope.selectedRequest.SERVER_FEEDBACK);
                    }else{
                        WingsDialogService.error('Action '+ $scope.selectedRequest.MOBILE_RECORD_ACTION + ' have to be taken in order to take action CANCEL ');
                    }
                }else{*/
                    var requisitions = [];
                    var tempRequisition = _.cloneDeep($scope.selectedRequest);
                    tempRequisition.MOBILE_RECORD_ACTION = 'UNDO';
                    tempRequisition.MOBILE_RECORD_STATUS = 'READY';
                    var tempTime = moment().format('YYYY-MM-DD HH:mm:ss');
                    tempRequisition.MOBILE_DT_MODIFIED = tempTime;
                    tempRequisition.MOBILE_USR_MODIFIED = $rootScope.globals.currentUser.userId;
                    tempRequisition.EMPLOYEE_NUMBER     = $rootScope.globals.currentUser.userNumber;
                    tempRequisition.DIV_NO              =  $rootScope.globals.currentUser.divNo;
                    requisitions.push(tempRequisition);
                    pr.SaveRequisition(requisitions).then(function(result){
                        sy.CreateTransaction(tempTime,"IC_REQUISITIONS",tempRequisition.MOBILE_RECORD_ID,tempRequisition.MOBILE_RECORD_ACTION,tempRequisition.ID,tempRequisition.CARD_ID,tempRequisition.MOBILE_CARD_ID).then(function(result){
                            if (!$rootScope.globals.deviceConnectionInfo.isOnline){
                                WingsDialogService.notification('Part request action is saved to local DB and will be synced when the device is online.','YELLOW');  
                            }else{
                                pr.pushAndPull($scope.card,null,tempRequisition).then(function(result){
                                    if (result.status == 'SUCCEED'){
                                        pr.FetchLocalRequisition($scope.selectedRequest).then(function(res){
                                            $scope.selectedRequest = res;
                                            if ($scope.selectedRequest.MOBILE_RECORD_STATUS == 'LOADED'){
                                                WingsDialogService.success('Process Completed.');
                                            }else{
                                                WingsDialogService.error($scope.selectedRequest.SERVER_FEEDBACK);
                                            }
                                            pr.PullLocalRequisitions($scope.card).then(function(localRequisitions){
                                                $scope.requisitions = localRequisitions;
                                                setActiveRequisition($scope.selectedRequest);
                                            },function(localStepError){
                                                $scope.requisitions = [];
                                            });
                                        },function(err){
                                            console.log("local requisition Error");
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
                //}
            };
                    
            $scope.requestIcon = function(request){
                if (!request) return '';
                
                var iconText = 'ion-';
                
                if (request.selected_flag) {
                    iconText = iconText+'ios-checkmark balanced';
                    return iconText;
                }
                
                if (request.ROTABLE_FLAG == 'Y') 
                    iconText = iconText + 'aperture';
                else iconText = iconText + 'settings';
        
                if (request.STATUS == 'CREATED') 
                    iconText = iconText + ' calm';
                else if (request.STATUS == 'AWAITING') 
                    iconText = iconText + ' energized';
                else if (request.STATUS == 'PENDING') 
                    iconText = iconText + ' royal';
                else if (request.STATUS == 'COMPLETED') 
                    iconText = iconText + ' balanced';
                else iconText = iconText + ' stable';
                
                return iconText;
            };
                    
            $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
                if (toState.name == 'app.LB_M169' && fromState.name == 'app.LB_M169_PartRequest'){
                	pr.PullLocalRequisitions($scope.card).then(function(result){
                		$scope.requisitions = result;
                		cancelSelect();
                	},function(error){
                		WingsDialogService.error(error);
                	});
                }
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
            function pullRemoteRequisitions(card){
                var deferred = $q.defer();
                console.log("pull remote requisitions - started");
                var sql = "Select a.Order_Number|| '/' || a.Order_Line Order_Number_Line, "+
                "       a.Order_Class,                                          "+
                "       Gn_Service.To_Character(a.Due_Date)    Due_Date,        "+
                "       Decode(a.Order_Class,'TOOL',a.Oem_Tool_Number, Nvl(a.Part_Number,a.Order_Part_Number)) Part_Number,     "+
                "       a.Quantity || ' ' || a.Uom   Quantity,                  "+
                "       a.Ordered_By_Employee_Number Employee_Number,           "+
                "       a.Ordered_By_Employee_Name   Employee_Name,             "+
                "       a.Status,                                               "+
                "       a.Rotable_Flag,                                         "+
                "       Decode(Status,'CREATED','TRUE','FALSE') Cancel_Allowed, "+
                "       (Select Max(y.Reason)                                   "+
                "          From Ic_Transactions y                               "+
                "         Where y.Requisition_Line_Id = a.Id                    "+
                "           And y.Operation           In ('CREATE','RESERVE')   "+
                "           And y.Active              = 'Y') Approval_Status,   "+
                "       a.Id Order_Line_Id,                                     "+
                "       Order_Work_Card_Id Card_Id                              "+
                "  From Ic_Order_Lines_v a                                      "+
                " Where a.Div_No             = "+divNo                           +
                "   And a.Order_Type         = 'REQUISITION'                    "+
                "   And a.Order_Work_Card_Id = "+$scope.card.ID                  +
                " Order By Decode(a.Status,'CREATED',1,'AWAITING',2,'PENDING',3,'COMPLETED',4,5)," +
                "          a.Order_Number Desc                                   ";
        
        	    var sqlArray = [{ queryStr: sql, queryType: "READ" }];
        	    var sqlString = JSON.stringify(sqlArray);
        	    WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
        	        var requisitions = angular.fromJson(dataIn[0].rows);
        	        for (j= 0; j<requisitions.length; j++){
        	        	requisitions[j] = pr.TransformRequisition(requisitions[j]);
        	        }
                    console.log("pull remote requisitions - succeed");
        	        deferred.resolve(requisitions);
        	    }, function (error) {
                    console.log("pull remote requisitions - failed");
        		    deferred.reject(error);
        	    });
        	    return deferred.promise;
            };
            
            $ionicPopover.fromTemplateUrl('templates/popoverTooltip.html', {
                scope: $scope,
            }).then(function(popover) {
              $scope.popoverTooltip = popover;
            });
            function pushRequisitions(cardID){
            	console.log("push requisition list - started");
            	var deferred = $q.defer();
            	var sql = "Select * From IC_REQUISITIONS " +
                          " Where Mobile_Record_Status != 'LOADED'"+
                          "  And Card_Id = ?";
        		var parameters = [cardID];
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                	var pushPromises  = [];
                	var rejectedRequisitions = [];
                	if (result.length < 0){
                		console.log("push requisition list - succeed");
                		deferred.resolve({requisitions:rejectedRequisitions});
                	}else{
                		for (i=0; i<result.length; i++){
                			pushPromises.push(pr.DoRequisition(result[i],result[i].MOBILE_RECORD_ACTION,true));
                		}
                		if (pushPromises.length > 0){
        	        		$q.all(pushPromises).then(function(res) {
        	        			for (j=0; j<res.length;j++){
        	        				if (res[j].status != 'SUCCEED'){
        	        					if(res[j].requisition.ORDER_LINE_ID) rejectedRequisitions.push(res[j].requisition.ORDER_LINE_ID);
        	        				}
        	        			}
        		        		console.log("push requisition list - succeed");
        	        			deferred.resolve({requisitions:rejectedRequisitions});
        	        		},function(err){
        		        		console.log("push requisition list - failed");
        	        			deferred.reject(err);
        	        		});
                		}else{
                			deferred.resolve({requisitions:rejectedRequisitions});
                		}
                	}
        		}, function (error) {
            		console.log("push requisition list - failed");
        		    deferred.reject(error);
        		});
        		return deferred.promise;
            }
            $scope.doRefresh = function(){
            	if (!$rootScope.globals.deviceConnectionInfo.isOnline){
            		WingsDialogService.error('Please connect to internet to refresh requisitions.');
            		$scope.$broadcast('scroll.refreshComplete');
            	} else{
            	    pr.pushAndPull($scope.card).then(function(result){
                        if (result.status == 'SUCCEED'){
                            pr.PullLocalRequisitions($scope.card).then(function(localRequisitions){
                                $scope.requisitions = localRequisitions;
                                setActiveRequisition($scope.selectedRequest);
                                $scope.$broadcast('scroll.refreshComplete');
                            },function(localRequisitionError){
                                $scope.requisitions = [];
                                console.log("local Requisition Error");
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
            $scope.discard = function (){
                sy.DiscardTransaction($scope.selectedRequest.MOBILE_RECORD_ID,'IC_REQUISITIONS').then(function(result){
                    if($scope.selectedRequest.ORDER_LINE_ID){
                        pr.pushAndPull($scope.card).then(function(result){
                            if (result.status == 'FAILED'){
                                 WingsDialogService.error(result.error);
                            }
                            pr.PullLocalRequisitions($scope.card).then(function(localRequisitions){
                                $scope.requisitions = localRequisitions;
                                setActiveRequisition($scope.selectedRequest);
                            },function(localStepError){
                                $scope.requisitions = [];
                                console.log("local requisition Error");
                            });
                        },function(error){
                            console.log(error);
                            WingsDialogService.error(error);
                        });
                    }else{
                        pr.DeleteLocalRequisition($scope.selectedRequest.MOBILE_RECORD_ID).then(function(res){
                            pr.pushAndPull($scope.card).then(function(result){
                                if (result.status == 'FAILED'){
                                     WingsDialogService.error(result.error);
                                }
                                pr.PullLocalRequisitions($scope.card).then(function(localRequisitions){
                                    $scope.requisitions = localRequisitions;
                                    setActiveRequisition($scope.selectedRequest);
                                },function(localStepError){
                                    $scope.requisitions = [];
                                    console.log("local requisition Error");
                                });
                            },function(error){
                                console.log(error);
                                WingsDialogService.error(error);
                            });
                        },function(err){
                          console.log(err);
                          pr.PullLocalRequisitions($scope.card).then(function(localRequisitions){
                              $scope.requisitions = localRequisitions;
                              setActiveRequisition($scope.selectedRequest);
                          },function(localStepError){
                              $scope.requisitions = [];
                              console.log("local requisition Error");
                          });
                        })
                    }
                },function(err){
                    
                })
            };
            $scope.openPopover = function($event, msg) {
                console.log(msg);
                $scope.responseMessage = msg
                $scope.popoverTooltip.show($event);
                $event.stopPropagation();
            };
            function setActiveRequisition(requisition){
                var isMatched = false;
                for(i=0; i<$scope.requisitions.length; i++){
                    if ((requisition.ORDER_LINE_ID  && requisition.ORDER_LINE_ID == $scope.requisitions[i].ORDER_LINE_ID) || (!requisition.ORDER_LINE_ID && requisition.MOBILE_RECORD_ID == $scope.requisitions[i].MOBILE_RECORD_ID)){
                        $scope.requisitions[i].selected_flag = true;
                        $scope.selectedRequest =  $scope.requisitions[i];
                        isMatched = true;
                    }
                } 
                if (!isMatched){
                    $scope.selectedRequest = '';
                }
            }
            
            if ($rootScope.prWorkcard){
            	pr.FetchLocalData($rootScope.prWorkcard).then(function(res){
        	    	$scope.card = res;
        	    	pr.PullLocalRequisitions($scope.card).then(function(localRequisitions){
        				$scope.requisitions = localRequisitions;
        				if($rootScope.prRequisition){
        				    setActiveRequisition($rootScope.prRequisition);
                            $rootScope.prRequisition = '';
                        }
        			},function(localStepError){
        				$scope.requisitions = [];
        				console.log("local requisition Error");
        			});
            	},function(err){
        			  console.log(err);
        		  })
            }else{
            	 WingsUtil.Focus('WORK_CARD_NUMBER');
            }
            
} ])