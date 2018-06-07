angular.module('WingsMobileStarter').controller('LB_M100', [
	'$scope',
	'$cordovaBarcodeScanner',
	'WingsRemoteDbService',
	'$ionicPopup',
	'WingsUtil',
	'WingsDialogService',
	'WingsGlobalManager',
	'$ionicPopup',
	'$timeout',
	'$ionicHistory',
	'$ionicLoading',
	'$stateParams',
	'lb',
	'sy',
	'pr',
	function($scope,$cordovaBarcodeScanner,WingsRemoteDbService,$ionicPopup,WingsUtil,WingsDialogService,WingsGlobalManager,$ionicPopup,$timeout,$ionicHistory,$ionicLoading,$stateParams,lb,sy,pr) {
		console.log("LB_M100");
		$scope.defaultCard    = false;
		$scope.cardDetail     = false;
		$scope.isLogon        = false;
		$scope.scanEnabled    = true;
		$scope.selectedClock  = '';
		$scope.authorizationShow = false;
		$scope.isReadOnly     = false;
		$scope.clocks         = [];
		$scope.scanBarcode = function (scanObj) {
			console.log('[Wings Mobile] '+scanObj);
			$cordovaBarcodeScanner
		    	.scan()
			    .then(function(barcodeData) {
			    	console.log('SCAN DATA     '+barcodeData.text);
			    	barcodeData.text = barcodeData.text.replace("*","");
			    		if (scanObj == 'Badge') {
			    			$scope.clock.BADGE = Number(barcodeData.text);
			    			WingsUtil.Focus('card');
			    		} else if(scanObj == 'Card') {
			    			$scope.clock.WORK_CARD_NUMBER = barcodeData.text;
			    			$scope.logon();
			    		} else if(scanObj == 'Authorization') {
			    		    $scope.clock.AUTHORIZED_BY_BADGE = Number(barcodeData.text);
			    			$scope.logon();
			    		}
			      	}, function(error) {
			      		console.log('Error',error);
			      	});
		};

		$scope.setScanObj = function (obj) {
			$scope.scanObj = obj;
		};
		$rootScope.$ionicGoBack = function() {
            $rootScope.prWorkcard = '';
            $ionicHistory.goBack();
        };
	    $scope.logon = function () {
	        if (WingsUtil.IsNull($scope.clock.BADGE)){
                WingsDialogService.error('Badge is required !');
                return false;
            }/*else if (WingsUtil.IsNull($scope.clock.WORK_CARD_NUMBER)){
                WingsDialogService.error('Work Card Number is required !');
                return false;
            }*/
	        var clocks = [];
	        $scope.clock.MOBILE_RECORD_ACTION = 'LOGON';
	        $scope.clock.MOBILE_RECORD_STATUS = 'READY';
            var tempTime = moment().format('YYYY-MM-DD HH:mm:ss');
            $scope.clock.MOBILE_DT_MODIFIED = tempTime; 
            $scope.clock.CLOCK_TIME = $scope.clock.CLOCK_TIME ? $scope.clock.CLOCK_TIME : tempTime;
	        clocks.push($scope.clock);
        		lb.SaveClock(clocks).then(function(result){
        		    $scope.clock.MOBILE_RECORD_ID  = result.insertId;
        		    sy.CreateTransaction(tempTime,"LB_LABOR_COLLECTION",$scope.clock.MOBILE_RECORD_ID,$scope.clock.MOBILE_RECORD_ACTION,null,$scope.clock.WORK_CARD_ID,$scope.clock.MOBILE_CARD_ID).then(function(res){
        		    	if ($rootScope.globals.deviceConnectionInfo.isOnline){
            		    	pr.pushAndPull($rootScope.prWorkcard,null,null,$scope.clock).then(function(result){
            		    	    lb.PullLocalClock('LOGON').then(function(res){
            		                $scope.clocks = res;
            		                $scope.clock = result.clockObj;
                                    if ($scope.clock.MOBILE_RECORD_STATUS == 'LOADED') {
                                        WingsDialogService.success();
                                        $scope.isLogon     = true;
                                        $scope.scanEnabled = false;
                                        if ($scope.selectedClock) $scope.selectedClock.selected_flag = false;
                                    } else {
                                        $scope.isLogon = false;
                                        setActiveClock($scope.clock);
                                        WingsDialogService.error($scope.clock.SERVER_FEEDBACK);
                                    }
                                    if ($scope.clock.WORK_CARD_NUMBER && $scope.isLogon) {
                                        $scope.clock.BADGE = '';
                                    }
                                    if($scope.clock.AUTHORIZATION_REQUIRED_FLAG == 'Y') {
                                        $scope.authorizationShow = true;
                                        WingsUtil.Focus('authorization');
                                    }
            		            },function(err){
            		                console.log(err);
            		            });
            		        },function(error){
            		        	console.log(error);
            		        })
        		    	}else{
                            $scope.isLogon     = true;
                            $scope.scanEnabled = false;
                            //if ($scope.selectedClock) $scope.selectedClock.selected_flag = false;
        		    		WingsDialogService.notification('Logon action is saved to local DB and will be synced when the device is online.','YELLOW');
        		    		lb.PullLocalClock('LOGON').then(function(res){
        		                $scope.clocks = res;
        		                setActiveClock($scope.clock);
        		            },function(err){
        		                console.log(err);
        		            });
        		    	}
        		    },function(err){
                        console.log(err);
                    })
        		},function(err){
        		    console.log(err);
        		})
	    };

	    lb.PullLocalClock('LOGON').then(function(res){
	        $scope.clocks = res;
	    },function(err){
	        
	    });
	    
		$scope.clock = lb.InstantiateClock();
		
        if ($rootScope.prWorkcard) {
            if ($rootScope.prWorkcard.WORK_ORDER_NUMBER && $rootScope.prWorkcard.ZONE_NUMBER && $rootScope.prWorkcard.ITEM_NUMBER)  
                $scope.clock.WORK_CARD_NUMBER = $rootScope.prWorkcard.WORK_ORDER_NUMBER+'.'+$rootScope.prWorkcard.ZONE_NUMBER+'.'+$rootScope.prWorkcard.ITEM_NUMBER;
            else 
                $scope.clock.WORK_CARD_NUMBER = '<NEW CARD>';
            
            $scope.clock.WORK_ORDER_NUMBER = $rootScope.prWorkcard.WORK_ORDER_NUMBER;
            $scope.clock.ZONE_NUMBER       = $rootScope.prWorkcard.ZONE_NUMBER;
            $scope.clock.ITEM_NUMBER       = $rootScope.prWorkcard.ITEM_NUMBER;
            
            $scope.clock.MOBILE_CARD_ID    = $rootScope.prWorkcard.MOBILE_RECORD_ID;
            $scope.clock.WORK_CARD_ID      = $rootScope.prWorkcard.ID;
            $scope.scanEnabled = false;
            $scope.isReadOnly = true;       
        }else{
        	WingsUtil.Focus('card');
        }
        
        $scope.onHoldClock = function (clockObject){
            $scope.isLogon           = false;
            $scope.scanEnabled       = true;
            $scope.authorizationShow = false;
            angular.forEach($scope.clocks, function(clock) {
                clock.selected_flag = false;
            });
            clockObject.selected_flag = true;
            $scope.isLogon            = false;
            $scope.isReadOnly         = false;
            $scope.selectedClock      = clockObject;
            $scope.clock              = $scope.selectedClock;

            if (clockObject.AUTHORIZATION_REQUIRED_FLAG == 'Y') {
                WingsUtil.Focus('authorization');
                $scope.authorizationShow = true;
            } else $scope.authorizationShow = false;
        };
         
        function cancelSelect (){
            $scope.isLogon           = false;
            $scope.scanEnabled       = true;
            $scope.authorizationShow = false;
            $scope.selectedClock.selected_flag = false;
            $scope.selectedClock = '';
            $scope.clock = lb.InstantiateClock();
            $timeout(function () {
                $scope.selectedClock = $scope.selectedClock;
            },100);
        };
         
        $scope.toggleClock = function (clockObject){
            if (clockObject.selected_flag) {
                cancelSelect();
            }
            else {
                $scope.onHoldClock(clockObject);
            }
        };
         
        $scope.clockIcon = function(clock){
            if (!clock) return '';
            var iconText = 'ion-alarm positive';
            if (clock.selected_flag) {
                iconText = 'ion-ios-checkmark balanced';
            }
            
            return iconText;
        };
        function setActiveClock(clock){
            var isMatched = false;
            for(i=0; i<$scope.clocks.length; i++){
                if (clock.MOBILE_RECORD_ID && clock.MOBILE_RECORD_ID == $scope.clocks[i].MOBILE_RECORD_ID){
                    $scope.clocks[i].selected_flag = true;
                    $scope.selectedClock =  $scope.clocks[i];
                    isMatched = true;
                }
            } 
            if (!isMatched){
                cancelSelect();
            }
        }
         
        $scope.discard = function (){
            sy.DiscardTransaction($scope.selectedClock.MOBILE_RECORD_ID,'LB_LABOR_COLLECTION').then(function(result){
                lb.DeleteClock($scope.selectedClock.MOBILE_RECORD_ID).then(function(res){
                    cancelSelect();
                    lb.PullLocalClock('LOGON').then(function(res){
                        $scope.clocks = res;
                    },function(errr){
                        console.log(errr);
                    });
                },function(err){
                    console.log(err);
                })
            },function(error){
                console.log(err);
            })
        };

	}
])