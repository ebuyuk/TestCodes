angular.module('WingsMobileStarter').controller('PR_M117', [
        '$scope',
        '$state',
        '$cordovaBarcodeScanner',
        '$ionicModal',
        '$ionicPopup',
        'WingsDialogService',
        '$stateParams',
        '$ionicHistory',
        'WingsUtil',
        'WingsRemoteDbService',
        '$ionicLoading',
        'WingsPouchDbSetupService',
        'md5',
        'pr',
        'sy',
        function($scope,$state,$cordovaBarcodeScanner,$ionicModal,$ionicPopup,WingsDialogService,$stateParams,$ionicHistory,WingsUtil,WingsRemoteDbService,$ionicLoading,WingsPouchDbSetupService,md5,pr,sy) {
            console.log('PR_M117');
            
            $scope.closed         = false;
            $scope.isReqShown     = false;
            $scope.isMultiple     = true;
            $scope.isLaborShown   = false;
            $scope.isToolShown    = false;
            $scope.isChildShown   = false;
            $scope.showCard       = false;
            $scope.stampNumbers   = []; 
            $scope.navigateToBack = false;
            $scope.digitalSign = false;
            $scope.isSecondaryInspection = false;
            var divNo      = $rootScope.globals.currentUser.divNo;
            var userId     = $rootScope.globals.currentUser.userId;
            var userNumber = $rootScope.globals.currentUser.userNumber;
            $scope.user = {
                    username:$rootScope.globals.currentUser.userId,
                    password:''
            };
            $scope.card = pr.InstantiateCard();
            
            $scope.requisitions = [];
            $scope.labor        = [];
            $scope.tools        = [];
            $scope.childCards   = [];
            function initialize () {
                $scope.skillCodes = [];
                $scope.showCard   = false;              
            };
            $scope.clearCard = function () {
                $scope.card.ID = '';
                $scope.card.WORK_CARD_NUMBER = '';
                WingsUtil.Focus('WORK_CARD_NUMBER');
                initialize();
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
                            tempRequisitions             = $scope.requisitions;
                            tempLabor                    = $scope.labor;
                            tempTools                    = $scope.tools;
                            tempChildCards               = $scope.childCards;
                            $scope.card.WORK_CARD_NUMBER = barcodeData.text;
                            $scope.card.ID               = '';
                            $scope.card.MOBILE_RECORD_ID = '';
                            $scope.populateCard($scope.card).then(function(res){
                                
                            },function(err){
                                $scope.card.WORK_CARD_NUMBER = tempWorkCardNumber;
                                $scope.card.ID               = tempId;
                                $scope.card.MOBILE_RECORD_ID = tempMobileId;
                                $scope.requisitions          = tempRequisitions;
                                $scope.labor                 = tempLabor;
                                $scope.tools                 = tempTools;
                                $scope.childCards            = tempChildCards;
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
            	$scope.populateCard($scope.card);
            	}
            	$scope.navigateToBack = false;
            };

            $scope.populateCard = function (workCard) {
                var deferred = $q.defer();
            	if (workCard.ID == '' && workCard.WORK_CARD_NUMBER == '') return;
            	pr.PopulateWorkCard(workCard).then(function(card){
            		$scope.card = card;
            		if (card.STATUS == 'BILLING'){
            			$scope.closed           = true;
            			$scope.card.STATUS_CODE = card.WIP_REASON;
            			WingsDialogService.error('Card is closed.');
            			
            		}
            		parseData();
            		$scope.getRequisitions();
                    $scope.getLabor();
                    $scope.getTools();
                    $scope.getChildCards();
            		return deferred.resolve("GO-HEAD");
            	},function(err){
            		console.log(err);
    				WingsDialogService.error(err);
    				return deferred.reject(err);
            	})
            	return deferred.promise;
            };
            	
            $scope.toggle = function (field) {
                if (field == 'isReqShown') {
                    if (!$scope.isReqShown && $scope.requisitions.length == 0) {
                        $scope.getRequisitions();
                    }
                    $scope.isReqShown = !$scope.isReqShown;
                }
                else if (field == 'isLaborShown') {
                    if (!$scope.isLaborShown && $scope.labor.length == 0) {
                        $scope.getLabor();
                    }
                    $scope.isLaborShown = !$scope.isLaborShown;
                }
                else if (field == 'isToolShown') {
                    if (!$scope.isToolShown && $scope.tools.length == 0) {
                        $scope.getTools();
                    }
                    $scope.isToolShown = !$scope.isToolShown;
                }
                else if (field == 'isChildShown') {
                    if (!$scope.isChildShown && $scope.childCards.length == 0) {
                        $scope.getChildCards();
                    }
                    $scope.isChildShown = !$scope.isChildShown;
                }
                else if (field == 'showCard' && $scope.card.WORK_CARD_NUMBER) {
                    $scope.showCard = !$scope.showCard;
                }
            };
            
            $scope.close = function () {
                if (!$scope.card.WORK_CARD_ACTIONS.includes('CLOSE')){
                    WingsDialogService.error('Close action can not be done on this workcard!'); 
                    return false;
                }
                //if ($scope.digitalSign != true) {
                  if (false){
                    $scope.showModal();
                    return false;
                } else {
                    $scope.hide();
                    var cards = [];
                    var tempCard = _.cloneDeep($scope.card);
                    tempCard.MOBILE_RECORD_ACTION = 'CLOSE';
                    tempCard.MOBILE_RECORD_STATUS = 'READY';
                    var tempTime = moment().format('YYYY-MM-DD HH:mm:ss');
                    tempCard.MOBILE_DT_MODIFIED  = tempTime;
                    tempCard.MOBILE_USR_MODIFIED = $rootScope.globals.currentUser.userNumber;
                    tempCard.MOBILE_USER_ID      = $rootScope.globals.currentUser.userId;
                    tempCard.DIV_NO              = $rootScope.globals.currentUser.divNo;
                    
                    if ($scope.isSecondaryInspection) {
                        tempCard.LEAK_CHECK_INSPECTOR_NUMBER = $rootScope.globals.currentUser.userNumber;
                        tempCard.LEAK_CHECK_INSPECTION_DATE  = tempCard.INSPECTION_DATE ? tempCard.INSPECTION_DATE : moment().format('YYYY-MM-DD');
                    } else {
                        tempCard.INSPECTOR_NUMBER = $rootScope.globals.currentUser.userNumber;
                        tempCard.INSPECTION_DATE  = moment().format('YYYY-MM-DD');
                    }
                    
                    cards.push(tempCard);
                    pr.SaveCard(cards).then(function(result){
                        sy.CreateTransaction(tempTime,"PR_WORK_CARDS",tempCard.MOBILE_RECORD_ID,tempCard.MOBILE_RECORD_ACTION,tempCard.ID).then(function(result){
    	                    if (!$rootScope.globals.deviceConnectionInfo.isOnline){
    	                    	WingsDialogService.notification('Close action is saved to local DB and will be synced when the device is online.','YELLOW');
    	                    	$scope.closed = true;
    	                    }else{
    	                    	pr.pushAndPull(tempCard).then(function(result){
    	        	            	if (result.status == 'SUCCEED'){
    	        	            		$scope.card.ID               = result.cardObj.ID;
    	        	            		$scope.card.MOBILE_RECORD_ID = result.cardObj.MOBILE_RECORD_ID;
    	        	            		
    	        	            		pr.FetchLocalData($scope.card).then(function(res){
    	        	            			$scope.card = res;
    	        	            			if ($scope.card.MOBILE_RECORD_STATUS == 'LOADED'){
    	        	                    		WingsDialogService.success('Process Completed.');
    	        	                    		$scope.closed = true;
    	        	            			}else{
    	        	            				WingsDialogService.error($scope.card.SERVER_FEEDBACK);
    	        	            				if ($scope.card.SECONDARY_INSPECTION_REQUIRED == 'Y'  &&
	        	            	                    !WingsUtil.IsNull($scope.card.INSPECTOR_NUMBER)   &&
	        	            	                    !WingsUtil.IsNull($scope.card.INSPECTION_DATE)    &&
	        	            	                    !WingsUtil.IsNull($scope.card.INSPECTOR_STAMP_NUMBER)) {
	        	            	                    $scope.isSecondaryInspection = true;
    	        	            	            }
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
                }
            };
            
            sy.GetTableRows("Select * From Pr_Status_Reasons Where Div_No = ? And Status_Type = ? And Status = ? And Active = 'Y' Order By Reason",[$rootScope.globals.currentUser.divNo,'CARD-WIP','CLOSED']).then(function(result){
                $scope.statusCodes = result;
            }); 
            
            $rootScope.$ionicGoBack = function() {
          	    $scope.navigateToBack = true;
          	    $rootScope.prWorkcard = '';
          	    /*if($rootScope.documentObjects){
          	        for(t=0; t<$rootScope.documentObjects.length;t++){
          	            if($rootScope.documentObjects[t].columnId == '14'){
          	              $rootScope.documentObjects[t].value = $scope.card.INSPECTOR_NUMBER;
          	            }
          	            if($rootScope.documentObjects[t].columnId == '15'){
          	              $rootScope.documentObjects[t].value = $scope.card.INSPECTOR_STAMP_NUMBER;
                        }
          	            if($rootScope.documentObjects[t].columnId == '16'){
          	              $rootScope.documentObjects[t].value = $scope.card.INSPECTION_DATE;
                        }
          	        }
          	    }*/
                $ionicHistory.goBack();
            };
            
            $scope.getRequisitions = function () {
                if (!$rootScope.globals.deviceConnectionInfo.isOnline) return;
                console.log("get requisitions");
                var sql = "Select Order_Number || '/' ||Order_Line Order_Number_Line, "+
                          "       Ordered_By_Employee_Number Ordered_By,              "+
                          "       Order_Part_Number Part_Number,                      "+
                          "       Due_Date,                                           "+
                          "       Status                                              "+
                          "  From Ic_Order_Lines_v                                    "+
                          " Where (Null is Null)                                      "+
                          "   And Div_No       = "+divNo+
                          "   And Work_Card_Id = "+$scope.card.ID+
                          "   And Order_Type   = 'REQUISITION'                        "+
                          "   And Status       In ('PENDING','AWAITING','CREATED')    "+
                          " Order By Id Desc                                          ";
                var sqlArray = [{ queryStr: sql, queryType: "READ" }];
                var sqlString = JSON.stringify(sqlArray);
                WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                    var result = angular.fromJson(dataIn[0].rows);
                    if (result.length > 0) {
                        $scope.requisitions = angular.fromJson(dataIn[0].rows);
                        $timeout(function(){
                            $('table').trigger('footable_redraw');                           
                        },1);
                    }
                }, function (error) {});
            };
            
            $scope.getLabor = function () {
                if (!$rootScope.globals.deviceConnectionInfo.isOnline) return;
                console.log("get Labors");
                var sql = "Select Employee_Number,                                                 "+
                          "       Lb_Service.Employee_Name(Div_No, Employee_Number) Employee_Name, "+
                          "       To_Char(Clock_In,'DD-MON-YYYY hh24:mi') Clock_In                 "+
                          "  From Lb_Labor_Collection                                              "+
                          " Where (Null is Null)                                                   "+
                          "   And Div_No            = "+divNo+
                          "   And Work_Order_Number = "+$scope.card.WORK_ORDER_NUMBER+
                          "   And Zone_Number       = "+$scope.card.ZONE_NUMBER+
                          "   And Item_Number       = "+$scope.card.ITEM_NUMBER+
                          "   And Clock_Out         Is Null                                        "+
                          "   And Active            = 'Y'                                          "+
                          " Order By Id Desc                                                       ";

                var sqlArray = [{ queryStr: sql, queryType: "READ" }];
                var sqlString = JSON.stringify(sqlArray);
                WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                    var result = angular.fromJson(dataIn[0].rows);
                    if (result.length > 0) {
                        $scope.labor = angular.fromJson(dataIn[0].rows);
                        $timeout(function(){
                            $('table').trigger('footable_redraw');                           
                        },1);
                    }
                }, function (error) {});
            };
            
            $scope.getTools = function () {
                if (!$rootScope.globals.deviceConnectionInfo.isOnline) return;
                console.log("get Tools");
                var sql = "Select c.Oem_Tool_Number,               "+
                          "       b.Item_Number,                   "+
                          "       b.Tag_Number,                    "+
                          "       c.Description,                   "+
                          "       a.Check_Out_Reason,              "+
                          "       a.Check_Out_To_Employee_Number Employee_Number,                "+
                          "       a.Check_Out_To_Employee_Name Employee_Name,                    "+
                          "       To_Char(a.Check_Out_Date,'DD-MON-YYYY hh24:mi') Check_Out_Date "+
                          "  From Tl_Item_Transactions_v a,        "+
                          "       Tl_Items               b,        "+
                          "       Tl_Tools               c         "+
                          " Where a.Div_No       = "+divNo          +
                          "   And a.Work_Card_Id = "+$scope.card.ID +
                          "   And a.Process_Date Is Null           "+
                          "   And b.Div_No       = a.Div_No        "+
                          "   And b.Tool_Id      = a.Tool_Id       "+
                          "   And b.Tag_Number   = a.Tag_Number    "+
                          "   And c.Id           = a.Tool_Id       "+
                          " Order By a.Id Desc                     ";

                var sqlArray = [{ queryStr: sql, queryType: "READ" }];
                var sqlString = JSON.stringify(sqlArray);
                WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                    var result = angular.fromJson(dataIn[0].rows);
                    if (result.length > 0) {
                        $scope.tools = angular.fromJson(dataIn[0].rows);
                        $timeout(function(){
                            $('table').trigger('footable_redraw');                           
                        },1);
                    }
                }, function (error) {});
            };
            
            $scope.getChildCards = function () {
                if (!$rootScope.globals.deviceConnectionInfo.isOnline) return;
                console.log("get child cards");
                var sql = "Select Work_Order_Number,                                   "+
                          "       Zone_Number,                                         "+
                          "       Item_Number,                                         "+
                          "       Status||'-'||Wip_Status||'-'||Wip_Reason Card_Status,"+
                          "       Description                                          "+
                          "  From Pr_Work_Cards                                        "+
                          " Where Div_No         = "+divNo+
                          "   And Source_Card_Id = "+$scope.card.ID +
                          "   And Status        != 'BILLING'                           "+
                          " Order By Id                                                ";

                var sqlArray = [{ queryStr: sql, queryType: "READ" }];
                var sqlString = JSON.stringify(sqlArray);
                WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                    var result = angular.fromJson(dataIn[0].rows);
                    if (result.length > 0) {
                        $scope.childCards = angular.fromJson(dataIn[0].rows);
                        $timeout(function(){
                            $('table').trigger('footable_redraw');                           
                        },1);
                    }
                }, function (error) {});
            };
            function parseData(){
            	if (WingsUtil.IsNull($scope.card.OPEN_REQUISITION_COUNT)) $scope.card.OPEN_REQUISITION_COUNT = 0;
            	if (WingsUtil.IsNull($scope.card.LABOR_COUNT))            $scope.card.LABOR_COUNT            = 0;
         		if (WingsUtil.IsNull($scope.card.OPEN_CHILD_CARD_COUNT))  $scope.card.OPEN_CHILD_CARD_COUNT  = 0;
         		if (WingsUtil.IsNull($scope.card.TOOL_COUNT))             $scope.card.TOOL_COUNT             = 0;

                if ($scope.card.SECONDARY_INSPECTION_REQUIRED == 'Y'  &&
                    !WingsUtil.IsNull($scope.card.INSPECTOR_NUMBER)   &&
                    !WingsUtil.IsNull($scope.card.INSPECTION_DATE)    &&
                    !WingsUtil.IsNull($scope.card.INSPECTOR_STAMP_NUMBER)) {
                   //
                    $scope.isSecondaryInspection = true;
                }
         		
            	if ($scope.card.STAMP_NUMBERS == '') {
            	    $timeout(function() {
            	        WingsDialogService.error('You have no active stamp!');
                    }, 500);
                } else {
                    $scope.stampNumbers = $scope.card.STAMP_NUMBERS.split(',');
                    $scope.isMultiple = true;
                    if ($scope.stampNumbers.length == 1){
                        if ($scope.isSecondaryInspection) {
                            if (WingsUtil.IsNull($scope.card.OPS_INSPECTOR_STAMP_NUMBER)) $scope.card.OPS_INSPECTOR_STAMP_NUMBER = $scope.stampNumbers[0];
                        } else {
                            if (WingsUtil.IsNull($scope.card.INSPECTOR_STAMP_NUMBER)) $scope.card.INSPECTOR_STAMP_NUMBER = $scope.stampNumbers[0];
                        }
                    	$scope.isMultiple = false;
                    }
                }
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
                        $scope.close();
                    } else {
                        WingsDialogService.alert("Invalid username or Password !", 'Error', 'OK');
                    }
                }, function (error) {
                    $ionicLoading.hide();
                    WingsDialogService.alert("Invalid username or Password !", 'Error', 'OK');
                });*/
                
                sy.Login ($scope.user.username,$scope.user.password).then(function (response) {
                    $ionicLoading.hide();
                    if (response.success) {
                        $scope.digitalSign = true;
                        $scope.close();
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
                $scope.canvas.width  = "400";
                $scope.canvas.height = "400";
                $scope.canvas.renderAll();
            }
            if ($rootScope.prWorkcard){
            	pr.FetchLocalData($rootScope.prWorkcard).then(function(res){
	            	$scope.card = res;
	            	if ($scope.card.WIP_STATUS == 'CLOSED'){
	        			$scope.closed = true;
	        		}
	        		parseData();
	        		$scope.getRequisitions();
                    $scope.getLabor();
                    $scope.getTools();
                    $scope.getChildCards();
            	},function(err){
      			  console.log(err);
      		  })
            	//$scope.populateCard($rootScope.prWorkcard);
            }else{
            	 WingsUtil.Focus('WORK_CARD_NUMBER');
            }
        }
])