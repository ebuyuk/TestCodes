angular.module('WingsMobileStarter').controller('LB_M101', [
		'$scope',
		'$state',
		'$cordovaBarcodeScanner',
		'$ionicModal',
		'WingsRemoteDbService',
		'WingsGlobalManager',
		'$ionicPopup',
		'WingsDialogService',
		'WingsUtil',
		'lb',
		'pr',
		'sy',
		function($scope,$state,$cordovaBarcodeScanner,$ionicModal,WingsRemoteDbService,WingsGlobalManager,$ionicPopup,WingsDialogService,WingsUtil,lb,pr,sy) {
		    WingsUtil.Focus('badge');
		    console.log("LB_M101");
		    $scope.clock         = lb.InstantiateClock();
		    $scope.selectedClock = '';
		    $scope.isLogout      = false;
		    $scope.clocks        = [];

			$scope.scanBarcode = function (scanObj) {
		    	console.log('[Wings Mobile] '+scanObj);
				$cordovaBarcodeScanner
			      .scan()
			      .then(function(barcodeData) {
			    	  barcodeData.text = barcodeData.text.replace("*","");
			    	  if (scanObj == 'Badge') {
			    		  $scope.clock.BADGE = Number(barcodeData.text);
			    		  $scope.logout();
			    	  } 
			      }, function(error) {
			    	  console.log('Error',error);
			      });

			};
			$scope.logout = function () {
			    if (WingsUtil.IsNull($scope.clock.BADGE)){
	                WingsDialogService.error('Badge is required !');
	                return false;
	            }
				var clocks = [];
		        $scope.clock.MOBILE_RECORD_ACTION = 'CLOCK-OUT';
		        $scope.clock.MOBILE_RECORD_STATUS = 'READY';
                var tempTime = moment().format('YYYY-MM-DD HH:mm:ss');
                $scope.clock.MOBILE_DT_MODIFIED = tempTime; 
                $scope.clock.CLOCK_TIME = $scope.clock.CLOCK_TIME ? $scope.clock.CLOCK_TIME : tempTime;
		        clocks.push($scope.clock);
		        lb.SaveClock(clocks).then(function(result){
        		    $scope.clock.MOBILE_RECORD_ID  = result.insertId;
        		    sy.CreateTransaction(tempTime,"LB_LABOR_COLLECTION",$scope.clock.MOBILE_RECORD_ID,$scope.clock.MOBILE_RECORD_ACTION,null,$scope.clock.WORK_CARD_ID).then(function(res){
        		    	if ($rootScope.globals.deviceConnectionInfo.isOnline){
            		    	pr.pushAndPull($rootScope.prWorkcard,null,null,$scope.clock).then(function(result){
            		    	    lb.PullLocalClock('CLOCK-OUT').then(function(res){
            		                $scope.clocks = res;
            		                $scope.clock  = result.clockObj;
                                    if ($scope.clock.MOBILE_RECORD_STATUS == 'LOADED') {
                                        $scope.isLogout = true;
                                        WingsDialogService.success();
                                        if ($scope.selectedClock) $scope.selectedClock.selected_flag = false;
                                    } else {
                                        $scope.isLogout = false;
                                        setActiveClock($scope.clock);
                                        WingsDialogService.error($scope.clock.SERVER_FEEDBACK);
                                    }
            		            },function(err){
            		                console.log(err);
            		            });
            		        },function(error){
            		        	console.log(error);
            		        })
        		    	}else{
                            $scope.isLogout = true;
                            if ($scope.selectedClock) $scope.selectedClock.selected_flag = false;
        		    		WingsDialogService.notification('Clock out action is saved to local DB and will be synced when the device is online.','YELLOW');
                            lb.PullLocalClock('CLOCK-OUT').then(function(res){
                                $scope.clocks = res;
                                setActiveClock($scope.clock);
                            },function(err){
                                
                            });
        		    	}
        		    },function(err){
                        console.log(err);
                    })
        		},function(err){
        		    console.log(err);
        		})
		    };
		    $scope.setScanObj = function (obj) {
                $scope.scanObj = obj;
            };
            lb.PullLocalClock('CLOCK-OUT').then(function(res){
                $scope.clocks = res;
            },function(err){
                
            });
		    
		    $scope.onHoldClock = function (clockObject){
		         $scope.isLogout = false;
                 angular.forEach($scope.clocks, function(clock) {
                     clock.selected_flag = false;
                 });
                 clockObject.selected_flag = true;
                 $scope.selectedClock = clockObject;
                 $scope.clock = $scope.selectedClock;
             };
             
             function cancelSelect (){
                 $scope.selectedClock.selected_flag = false;
                 $scope.selectedClock = '';
                 $scope.isLogout = false;
                 $scope.clock = lb.InstantiateClock();
                 $timeout(function () {
                     $scope.selectedClock = $scope.selectedClock;
                 },100);
             };
             
             $scope.toggleClock = function (clockObject){
                 console.log("toggle");
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
                         lb.PullLocalClock('CLOCK-OUT').then(function(res){
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
			
		} ])