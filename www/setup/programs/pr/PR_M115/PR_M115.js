angular.module('WingsMobileStarter').controller('PR_M115', [
        '$scope',
        '$state',
        '$cordovaBarcodeScanner',
        '$ionicModal',
        'WingsRemoteDbService',
        '$ionicPopup',
        'WingsUtil',
        'WingsDialogService',
        '$ionicHistory',
        '$ionicPopover',
        '$cordovaVibration',
        'pr',
        'sy',
        function($scope,$state,$cordovaBarcodeScanner,$ionicModal,WingsRemoteDbService,$ionicPopup,WingsUtil,WingsDialogService,$ionicHistory,$ionicPopover,$cordovaVibration,pr,sy) {
            console.log("PR_M115");
        	$scope.workOrderTypes = [];
            $scope.skillCodes     = [];
            $scope.shopNumbers    = [];
            $scope.zoneNumbers    = [];
            $scope.taskCodes      = [];
            $scope.ataCodes       = [];
            $scope.contractGroups = [];
            $scope.milestones     = [];
            $scope.flags          = [];
            $scope.card           = pr.InstantiateCard();
            
            $scope.card.created	  = false;
            $scope.skillIndex     = 0;
            $scope.skillsTimesArr = [];
            $scope.navigateToBack = false;
            var divNo      = $rootScope.globals.currentUser.divNo;
            var userId     = $rootScope.globals.currentUser.userId;
            var userNumber = $rootScope.globals.currentUser.userNumber;
            $scope.showCard = false;

            $scope.clearCard = function () {
            	$scope.card                  = pr.InstantiateCard();
                $scope.card.SOURCE_CARD_ID   = '';
                $scope.card.SOURCE_WORK_CARD = '';
                $scope.showCard              = false;
                
                $scope.skillIndex     = 0;
                $scope.skillsTimesArr = [];
                $scope.addNewSkill();
                
                $scope.flags = pr.GetFlags();
                
                WingsUtil.Focus('sourceCard');
            };
            
            $scope.toggle = function (field) {
                if (field == 'showCard' && $scope.card.SOURCE_WORK_CARD) {
                    $scope.showCard = !$scope.showCard;
                }
            };
            
            $scope.onblur = function(){
            	if(!$scope.navigateToBack){
            	    $scope.populateSourceCard();
            	}
            	$scope.navigateToBack = false;
            };
            
            $scope.populateSourceCard = function () {
                var deferred = $q.defer();
                if ($scope.card.SOURCE_CARD_ID == '' && $scope.card.SOURCE_WORK_CARD == '') return deferred.reject("Id and Work Card Number are empty.");
                
                if (!$rootScope.globals.deviceConnectionInfo.isOnline) {
                	if (!WingsUtil.IsNull($scope.card.SOURCE_CARD_ID)){
                	$scope.card.SOURCE_WORK_CARD    = $scope.card.SOURCE_CARD_OBJECT.WORK_ORDER_NUMBER+'.'+$scope.card.SOURCE_CARD_OBJECT.ZONE_NUMBER+'.'+$scope.card.SOURCE_CARD_OBJECT.ITEM_NUMBER;
                    $scope.card.PROJECT_NUMBER      = $scope.card.SOURCE_CARD_OBJECT.PROJECT_NUMBER;
                    //$scope.card.AIRCRAFT_TYPE       = $scope.card.SOURCE_CARD_OBJECT.AIRCRAFT_TYPE;
                    $scope.card.SOURCE_CARD_ID      = Number($scope.card.SOURCE_CARD_OBJECT.ID);
                    $scope.card.sourceDescription   = $scope.card.SOURCE_CARD_OBJECT.DESCRIPTION;
                    $scope.card.sourceEstimatedTime = $scope.card.SOURCE_CARD_OBJECT.ESTIMATED_TIME;
                    $scope.card.sourceAppliedTime   = $scope.card.SOURCE_CARD_OBJECT.APPLIED_TIME;
                    //$scope.card.WORK_ORDER_TYPE     = $scope.card.SOURCE_CARD_OBJECT.WORK_ORDER_TYPE;
                    //$scope.card.WORK_ORDER_NUMBER   = Number($scope.card.SOURCE_CARD_OBJECT.WORK_ORDER_NUMBER);
                    //$scope.card.SHOP_FLAG           = $scope.card.SOURCE_CARD_OBJECT.SHOP_FLAG;
                    return deferred.resolve("GO-HEAD");
                	}else{
                	    workCard = {ID:$scope.card.SOURCE_CARD_ID, WORK_CARD_NUMBER:$scope.card.SOURCE_WORK_CARD};
                		pr.FetchLocalData(workCard).then(function(result){
                			$scope.card.SOURCE_CARD_OBJECT  = result;
        		            $scope.card.SOURCE_WORK_CARD    = result.WORK_ORDER_NUMBER+'.'+result.ZONE_NUMBER+'.'+result.ITEM_NUMBER;
                            $scope.card.PROJECT_NUMBER      = result.PROJECT_NUMBER;
                            //$scope.card.AIRCRAFT_TYPE       = result.AIRCRAFT_TYPE;
                            $scope.card.SOURCE_CARD_ID      = result.ID;
                            $scope.card.sourceDescription   = result.DESCRIPTION;
                            $scope.card.sourceEstimatedTime = result.ESTIMATED_TIME;
                            $scope.card.sourceAppliedTime   = result.APPLIED_TIME;
                            //$scope.card.WORK_ORDER_TYPE     = result.WORK_ORDER_TYPE;
                            //$scope.card.WORK_ORDER_NUMBER   = NUMBER(result.WORK_ORDER_NUMBER);
                            //$scope.card.SHOP_FLAG           = result.SHOP_FLAG;
                            return deferred.resolve("GO-HEAD");
                  	    },function (error) {
                  	        WingsDialogService.error(error);
         		            $scope.card  = pr.InstantiateCard();
         		            return deferred.reject(err);
      			        });
                	}
                }else{
	                var myBuilder = new StoredFuncProcBuilder("Mb_Apps.Do_Work_Card", 		  'i_Div_No',          divNo,
					                														  'i_Action',		   'POPULATE',	
	                                                                                          'i_Work_Order_Type', $scope.card.WORK_ORDER_TYPE,
	                                                                                          'i_Work_Card_Id',    $scope.card.SOURCE_CARD_ID,
	                                                                                          'i_Work_Card',       $scope.card.SOURCE_WORK_CARD,
	                                                                                          'o_Data',            '');
	                var myFuncArray = [myBuilder.queryObject()];
	                var strSql = JSON.stringify(myFuncArray);
	                WingsRemoteDbService.executeFunction(strSql).then(function (dataIn) {
	                    console.log("************Execute Function : " +JSON.stringify(dataIn));
	                    dataIn[0] = JSON.parse(dataIn[0]);
	                    if (dataIn[0].isSuccess === 'false') {
	                        WingsDialogService.error('Operation Failed!');
	                        return deferred.reject('Operation Failed!');
	                    }
	                    if (dataIn[0].errorText != '') {
	                        WingsDialogService.error(dataIn[0].errorText);
	                        return deferred.reject(dataIn[0].errorText);
	                    }
	                    if (dataIn[0].result.Result) {
	                        var returnObject = angular.fromJson(dataIn[0].result.o_Data);
	                        $scope.card.SOURCE_WORK_CARD    = returnObject.SOURCE_WORK_CARD;
	                        $scope.card.PROJECT_NUMBER      = returnObject.PROJECT_NUMBER;
	                        $scope.card.WORK_ORDER_TYPE     = returnObject.WORK_ORDER_TYPE;
	                        $scope.card.WORK_ORDER_NUMBER   = returnObject.WORK_ORDER_NUMBER;
	                        $scope.card.AIRCRAFT_TYPE       = returnObject.AIRCRAFT_TYPE;
	                        $scope.card.SOURCE_CARD_ID      = Number(returnObject.SOURCE_CARD_ID);
	                        $scope.card.SHOP_FLAG           = returnObject.SHOP_FLAG;
	                        $scope.card.sourceDescription   = returnObject.DESCRIPTION;
	                        $scope.card.sourceEstimatedTime = returnObject.ESTIMATED_TIME;
	                        $scope.card.sourceAppliedTime   = returnObject.APPLIED_TIME;
	                        getMilestones();
	                        return deferred.resolve("GO-HEAD");
	                    } else {
	                    	WingsDialogService.error('Invalid Work Card!');
	                    	$scope.card  = pr.InstantiateCard();
	                        $scope.milestones = [];
	                        return deferred.reject(err);
	                    }
	                }, function (response) {
	                    console.log("ERROR " + response.status +" MESSAGE : "+response.message);
	                    return deferred.reject("ERROR " + response.status +" MESSAGE : "+response.message);
	                });
	            }
                return deferred.promise;
            };
            
            $scope.callProgram = function (programId){
                $scope.popover.hide();
                $rootScope.prWorkcard = $scope.card; //may need to send deepclone
                $state.go('app.'+programId);
            };
            
            $scope.logon = function (){
            	var workcard = $scope.card.ID+'-'+$scope.card.WORK_CARD_NUMBER;
                $scope.popover.hide();
                $rootScope.prWorkcard = $scope.card; //may need to send deepclone
                $state.go('app.LB_M100');
            };
            
            sy.GetTableRows("Select * From Pr_Ata_Codes Where Div_No = ? And Active = 'Y' Order By Ata_Code",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.ataCodes = result;
            }); 
            
            sy.GetTableRows("Select * From Pr_Zones Where Div_No = ? And Active = 'Y' Order By Zone",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.zoneNumbers = result;
            }); 
            
            sy.GetTableRows("Select * From Pr_Work_Order_Types Where Div_No = ? And Active = 'Y' Order By Work_Order_Type",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.workOrderTypes = result;
            }); 
            
            sy.GetTableRows("Select * From Lb_Skill_Codes Where Div_No = ? And Active = 'Y' Order By Skill_Code",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.skillCodes = result;
            }); 
            
            sy.GetTableRows("Select * From Pr_Shops Where Div_No = ? And Active = 'Y' Order By Shop_Number",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.shopNumbers = result;
            }); 
            
            sy.GetTableRows("Select * From Qa_Authorization_Types Where Div_No = ? And Active = 'Y' Order By Authorization_Type",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.authorizationTypes = result;
            }); 
            
            sy.GetTableRows("Select * From Mm_Task_Codes Where Div_No = ? And Active = 'Y' Order By Task_Code",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.taskCodes = result;
            }); 
            
            sy.GetTableRows("Select * From Pr_Contract_Groups Where Div_No = ? And Active = 'Y' Order By Contract_Group",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.contractGroups = result;
            });
            $scope.flags = pr.GetFlags();
            
            function completeNumber (itemNumber){
            	if (itemNumber.length < 4){
            	var remaining = 4 - itemNumber.length
            	while(remaining != 0){
            		itemNumber = '0'+itemNumber;
            		remaining--;
            	}
            	}
            	return itemNumber;
            };
            
            function getMilestones () {
                if (!$rootScope.globals.deviceConnectionInfo.isOnline) return;
                
                var deferred = $q.defer();
                var response;

                var sql7 = "Select Milestone,            " +
                           "       Description           " +
                           "  From Pr_Project_Milestones " +
                           " Where Div_No         = "+divNo+
                           "   And Project_Number = '"+$scope.card.PROJECT_NUMBER+"'"+
                           "   And Active         = 'Y'  " +
                           " Order By Milestone          " ;
                
                var sqlArr = [{queryStr: sql7,queryType: "READ"}];
              
                var sqlStr = JSON.stringify(sqlArr);
                WingsRemoteDbService.executeQuery(sqlStr).then(function (dataIn) {
                    console.log("[MULTI QUERY][FETCH NEW UPDATES][SUCCESS] : " +JSON.stringify(dataIn[2]));
  
                    $scope.milestones = angular.fromJson(dataIn[0].rows);
  
                    return deferred.resolve("GOHEAD");
                }, function (error) {
                    console.log(error.status +" MESSAGE : "+error.message);
                    response = { success: false, message: 'Cannot Fetch setup data' };
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });
                return deferred.promise;
            }
            
            $scope.scanBarcode = function (scanObj) {
                console.log('[Wings Mobile] '+scanObj);
                $cordovaBarcodeScanner
                    .scan()
                    .then(function(barcodeData) {
                        if (barcodeData.text != '') {
                            tempWorkCardNumber           = $scope.card.SOURCE_WORK_CARD;
                            tempId                       = $scope.card.SOURCE_CARD_ID;
                            tempMilestones               = $scope.milestones;
                            $scope.card.SOURCE_WORK_CARD = barcodeData.text;
                            $scope.card.SOURCE_CARD_ID   = '';
                            $scope.populateSourceCard($scope.card).then(function(res){
                                
                            },function(err){
                                $scope.card.SOURCE_WORK_CARD = tempWorkCardNumber;
                                $scope.card.SOURCE_CARD_ID   = tempId;
                                $scope.milestones            = tempMilestones;
                            });
                        }else{
                            WingsDialogService.error("Barcode can not be read");
                        }
                    }, function(error) {
                        console.log('Error',error);
                    });
            };
            
            $scope.addNewSkill = function (index) {
            	if(!$scope.card.created){
                	if($scope.skillsTimesArr.length < 1){	
                		$scope.skillIndex++;
                        $scope.skillsTimesArr.push({
                            id : $scope.skillIndex,
                            skillCode : '',
                            estimatedTime : null
                        });
                	}else{
                    	var currentObject = $scope.skillsTimesArr[$scope.skillIndex-1];
                    	if(!WingsUtil.IsNull(currentObject.estimatedTime) && !WingsUtil.IsNull(currentObject.skillCode)){
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
            	if(!$scope.card.created){
                	if ($scope.skillIndex <= 1) return false;
                	object.showDelete = true;
            	}
            };
            
            $scope.removeSkill = function (index) {
            	if(!$scope.card.created){
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
            
            $scope.addNewSkill();
            
            $scope.create = function () {
                if (WingsUtil.IsNull($scope.card.DESCRIPTION)){
                    WingsDialogService.error('Description is required !');
                    return false;
                }
            	var primarySkillCode = null;
                var estimatedTime     = 0;
            	$scope.card.SKILL_CODES        = [];
                $scope.card.ESTIMATED_TIMES    = [];
                for (i = 0; i < $scope.skillsTimesArr.length; i++ ){
                	if (!WingsUtil.IsNull($scope.skillsTimesArr[i].skillCode) && !WingsUtil.IsNull($scope.skillsTimesArr[i].estimatedTime)){
                		if (i == 0) primarySkillCode = $scope.skillsTimesArr[i].skillCode;
                        $scope.card.SKILL_CODES.push($scope.skillsTimesArr[i].skillCode);
                        $scope.card.ESTIMATED_TIMES.push($scope.skillsTimesArr[i].estimatedTime);
                        estimatedTime += $scope.skillsTimesArr[i].estimatedTime;
                	}
                }
	                var cards = [];
	                var tempCard = _.cloneDeep($scope.card);
	                tempCard.MOBILE_RECORD_ACTION = 'CREATE';
	                tempCard.MOBILE_RECORD_STATUS = 'READY';
	                var tempTime = moment().format('YYYY-MM-DD HH:mm:ss');
	                tempCard.MOBILE_DT_MODIFIED = tempTime;
	                tempCard.MOBILE_USR_MODIFIED = $rootScope.globals.currentUser.userNumber;
	                tempCard.MOBILE_USER_ID = $rootScope.globals.currentUser.userId;
	                tempCard.DIV_NO =  $rootScope.globals.currentUser.divNo;
	                cards.push(tempCard);
	                pr.SaveCard(cards).then(function(result){
	                    tempCard.MOBILE_RECORD_ID = result.insertId;
	                    sy.CreateTransaction(tempTime,"PR_WORK_CARDS",tempCard.MOBILE_RECORD_ID,tempCard.MOBILE_RECORD_ACTION,tempCard.ID).then(function(res){
    	                    if (!$rootScope.globals.deviceConnectionInfo.isOnline){
    	                    	$scope.card = tempCard;
    	                    	$scope.card.created = true;
    	                    	$scope.card.MOBILE_RECORD_ID = result.insertId;
    	                    	$rootScope.prWorkcard = $scope.card;
    	                    	WingsDialogService.notification('Card create action is saved to local DB and will be synced when the device is online.','YELLOW');	
    	                    }else{
    	                    	pr.pushAndPull(tempCard).then(function(result){
    	        	            	if (result.status == 'SUCCEED'){
    	        	            		$scope.card.ID = result.cardObj.ID;
    	        	            		$scope.card.MOBILE_RECORD_ID =  result.cardObj.MOBILE_RECORD_ID;
    	        	            		pr.FetchLocalData($scope.card).then(function(res){
    	        	            			$scope.card = res;
    	        	            			if ($scope.card.MOBILE_RECORD_STATUS == 'LOADED'){
    	        	                    		WingsDialogService.success('Process Completed.');
    	        	                    		$scope.card.created = true;
    	        	                    		$rootScope.prWorkcard = $scope.card;
    	        	            			}else{
    	        	            				$scope.card.created = false;
    	        	            				$scope.card.WORK_CARD_NUMBER = '';
    	        	            				WingsDialogService.error($scope.card.SERVER_FEEDBACK);
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
          
          $scope.focusChildCard = function(){
        	  $timeout(function () {
        		  $('#woType').animate({opacity:0.5},250);
        		  $('#woType').animate({opacity:1},250);
        		  $('#woType').animate({opacity:0.5},250);
        		  $('#woType').animate({opacity:1},250);
        	  },4000);
          };
          
          $scope.newAttachment = function (){
              $scope.popover.hide();
              var options = {
                  newAttachment : true,
                  fileName: "test01.jpg",
                  chunkedMode: true,
                  mimeType: "image/jpg",
                  params :{
                      ParentName:'PR_WORK_CARDS',
                      ParentId: $scope.card.ID,
                      ImageType:'APPENDIX'
                  }
              };
              $state.go('app.SY_M002',{uploadOptions: options});
          };

          $ionicPopover.fromTemplateUrl('templates/popover.html', {
              scope: $scope,
            }).then(function(popover) {
              $scope.popover = popover;
          });
          
          $rootScope.$ionicGoBack = function() {
        	  $scope.navigateToBack = true;
        	  $rootScope.prWorkcard = '';
              $ionicHistory.goBack();
          };
          //getAllSetupData();

          if ($rootScope.prWorkcard) {
        	  if ($rootScope.prWorkcard.ID){
	        	  $scope.card.SOURCE_CARD_OBJECT    = $rootScope.prWorkcard;
	        	  $scope.card.SOURCE_CARD_OBJECT.ID = parseInt($rootScope.prWorkcard.ID);
	        	  $scope.card.SOURCE_CARD_ID        = $scope.card.SOURCE_CARD_OBJECT.ID;
	              $scope.populateSourceCard();
        	  }else{
        		  $scope.skillsTimesArr = [];
        		  pr.FetchLocalData($rootScope.prWorkcard).then(function(workcard){
        			  $scope.card = workcard;
        			  $scope.card.MOBILE_RECORD_STATUS = '';
            		  $scope.card.MOBILE_RECORD_ACTION = '';
            		  $scope.card.WORK_CARD_NUMBER = '';
            		  $scope.card.WORK_ORDER_NUMBER = $scope.card.WORK_ORDER_NUMBER == '0' ? '' : $scope.card.WORK_ORDER_NUMBER;
            		  
            		  for(j = 0 ; j<$scope.card.SKILL_CODES.length; j++){
                     		$scope.skillsTimesArr.push({
                     			id: j+1,
                                skillCode : $scope.card.SKILL_CODES[j],
                                estimatedTime : Number($scope.card.ESTIMATED_TIMES[j])
                     		});
                     		$scope.skillIndex = $scope.card.SKILL_CODES.length;
                     	}
                    	if($scope.skillsTimesArr.length < 1){
                    		$scope.addNewSkill();
                    	}
              		  getMilestones();
        		  },function(error){
        			  WingsDialogService.error(error);
        		  });
        	  }
          } else{
              WingsUtil.Focus('sourceCard');
          }
} ])