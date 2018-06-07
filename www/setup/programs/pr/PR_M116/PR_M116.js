angular.module('WingsMobileStarter').controller('PR_M116', [
        '$scope',
        '$state',
        '$cordovaBarcodeScanner',
        'WingsUtil',
        'WingsDialogService',
        'WingsRemoteDbService',
        '$ionicHistory',
        '$q',
        'pr',
        'sy',
        function($scope,$state,$cordovaBarcodeScanner,WingsUtil,WingsDialogService,WingsRemoteDbService,$ionicHistory,$q,pr,sy) {
        	console.log("PR_M116");
        	$scope.zoneNumbers        = [];
            $scope.taskCodes          = [];
            $scope.ataCodes           = [];
            $scope.shopNumbers        = [];
            $scope.contractGroups     = [];
            $scope.flags              = [];
            $scope.authorizationTypes = [];
            $scope.priorityCodes      = [];
            $scope.milestones         = [];
            $scope.navigateToBack     = false;
            $scope.showCard           = false;
            $scope.card               = pr.InstantiateCard();
            var divNo = $rootScope.globals.currentUser.divNo;
            
            $scope.clearCard = function () {
            	$scope.card = pr.InstantiateCard();
                $scope.showCard   = false;
                WingsUtil.Focus('WORK_CARD_NUMBER');
            };
            
            $scope.toggle = function (field) {
                if (field == 'showCard' && $scope.card.WORK_CARD_NUMBER) {
                    $scope.showCard = !$scope.showCard;
                }
            };
           
            $scope.onblur = function(){
                if (!$scope.navigateToBack){
            	    $scope.populateWorkCard($scope.card);
            	}
            	$scope.navigateToBack = false;
            };
            
            $scope.populateWorkCard = function(workCard){
                var deferred = $q.defer();
            	if (workCard.ID == '' && workCard.WORK_CARD_NUMBER == '') return deferred.reject("Id and Work Card Number are empty.");
            	pr.PopulateWorkCard(workCard).then(function(card){
            		$scope.card = card;
            		return deferred.resolve("GO-HEAD");
            	},function(err){
            		console.log(err);
    				WingsDialogService.error(err);
    				return deferred.reject(err);
            	})
            	return deferred.promise;
            };
            
            sy.GetTableRows("Select * From Pr_Ata_Codes Where Div_No = ? And Active = 'Y' Order By Ata_Code",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.ataCodes = result;
            }); 
            sy.GetTableRows("Select * From Pr_Zones Where Div_No = ? And Active = 'Y' Order By Zone",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.zoneNumbers = result;
            }); 
            
            sy.GetTableRows("Select * From Qa_Authorization_Types Where Div_No = ? And Active = 'Y' Order By Authorization_Type",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.authorizationTypes = result;
            }); 
            
            sy.GetTableRows("Select * From Pr_Priority_Codes Where Div_No = ? And Active = 'Y' Order By Priority_Code",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.priorityCodes = result;
            }); 
            
            sy.GetTableRows("Select * From Pr_Shops Where Div_No = ? And Active = 'Y' Order By Shop_Number",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.shopNumbers = result;
            }); 
            
            sy.GetTableRows("Select * From Mm_Task_Codes Where Div_No = ? And Active = 'Y' Order By Task_Code",[$rootScope.globals.currentUser.divNo]).then(function(result){
                $scope.taskCodes = result;
            }); 
            
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
                           " Where Div_No         = "+divNo+
                           "   And Project_Number = '"+$scope.card.PROJECT_NUMBER+"'"+
                           "   And Active         = 'Y'  " +
                           " Order By Milestone          " ;
                
                var sqlArr = [{queryStr: sql7,queryType: "READ"}];
              
                var sqlStr = JSON.stringify(sqlArr);
                WingsRemoteDbService.executeQuery(sqlStr).then(function (dataIn) {
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
            
            $scope.modify = function () {
                if (!$scope.card.WORK_CARD_ACTIONS.includes('MODIFY')){
                    WingsDialogService.error('Modify action can not be done on this workcard!'); 
                    return false;
                }
                
                var cards = [];
                var tempCard = _.cloneDeep($scope.card);
                tempCard.MOBILE_RECORD_ACTION = 'MODIFY';
                tempCard.MOBILE_RECORD_STATUS = 'READY';
                var tempTime = moment().format('YYYY-MM-DD HH:mm:ss');
                tempCard.MOBILE_DT_MODIFIED = tempTime;
                tempCard.MOBILE_USR_MODIFIED = $rootScope.globals.currentUser.userNumber;
                tempCard.MOBILE_USER_ID = $rootScope.globals.currentUser.userId;
                tempCard.DIV_NO =  divNo;
                cards.push(tempCard);
                pr.SaveCard(cards).then(function(result){
                    sy.CreateTransaction(tempTime,"PR_WORK_CARDS",tempCard.MOBILE_RECORD_ID,tempCard.MOBILE_RECORD_ACTION,tempCard.ID).then(function(result){
	                    if (!$rootScope.globals.deviceConnectionInfo.isOnline){
	                    	WingsDialogService.notification('Modify action is saved to local DB and will be synced when the device is online.','YELLOW');	
	                    }else{
	                    	pr.pushAndPull(tempCard).then(function(result){
	        	            	if (result.status == 'SUCCEED'){
	        	            		$scope.card.ID = result.cardObj.ID;
	        	            		$scope.card.MOBILE_RECORD_ID =  result.cardObj.MOBILE_RECORD_ID;
	        	            		pr.FetchLocalData($scope.card).then(function(res){
	        	            			$scope.card = res;
	        	            			if ($scope.card.MOBILE_RECORD_STATUS == 'LOADED'){
	        	                    		WingsDialogService.success('Process Completed.');
	        	            			}else{
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
        	    $scope.navigateToBack = true;
        	    $rootScope.prWorkcard = '';
                $ionicHistory.goBack();
            };
            
            if ($rootScope.prWorkcard){
                $scope.card = $rootScope.prWorkcard
            	pr.FetchLocalData($rootScope.prWorkcard).then(function(res){
            		$scope.card = res;
                    getMilestones();
        		  },function(err){
        			  console.log(err);
        		  })
            }else{
            	 WingsUtil.Focus('WORK_CARD_NUMBER');
            }
            $scope.flags = pr.GetFlags();
    } ])