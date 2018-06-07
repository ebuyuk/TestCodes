angular.module('WingsMobileStarter').controller('PR_M108', [
    '$scope',
    'WingsRemoteDbService',
    '$cordovaBarcodeScanner',
    '$rootScope',
    '$ionicPopover',
    '$ionicPlatform',
    '$cordovaVibration',
    '$ionicHistory',
    'pr',
    'sy',
    'WingsDialogService',
    'WingsUtil',
    function($scope,WingsRemoteDbService,$cordovaBarcodeScanner,$rootScope,$ionicPopover,$ionicPlatform,$cordovaVibration,$ionicHistory,pr,sy,WingsDialogService,WingsUtil) {
        console.log("PR_M108");
        $scope.workCards          = [];
        $scope.card               = null;
        $scope.isThereData        = true;
        $scope.searchCriteria     = "";
        $scope.selectedCard       = "";
        $scope.sortBy             = ['-ID','-MOBILE_RECORD_ID'];
        $scope.isASC              = false;
        $scope.localCardConditionPartTwo = " (exists (select 1 from SY_TRANSACTION_QUEUE Where (Mobile_Table_Record_Id =  a.Mobile_Record_Id       "+
        		                           "                                                    And Mobile_Table_Name  = 'PR_WORK_CARDS')          "+
        		                           "  Or (Mobile_Table_Name     != 'LB_LABOR_COLLECTION' And Server_Parent_Record_Id = a.Id)               "+
        		                           "  Or (Mobile_Table_Name     != 'LB_LABOR_COLLECTION' And Mobile_Parent_Record_Id = a.Mobile_Record_Id)))";
        $scope.localCardCondition = "And  "+$scope.localCardConditionPartTwo;
        
        var userId     = $rootScope.globals.currentUser.userId;
        var divNo      = $rootScope.globals.currentUser.divNo;
        var userNumber = $rootScope.globals.currentUser.userNumber;
        
        $scope.attachReport = function() {
            var deferred = $q.defer();
            var runtachOptions = {
                parent     : 'PR_WORK_CARDS',
                parentId   : 1001036265,
                imageType  : 'TECH-PAGE',
                fileType   : 'pdf', //pdf|image  TODO image is not available yet
                programId  : 'MM_501',
                parameters : {
                    P_BEGIN_DATE : '04/02/2018',
                    P_END_DATE       : '04/19/2018',
                    P_STATUS       : 'A',
                    P_CAMERA_FLAG : 'Y',
                    P_ORDER_BY : 'A',
                    P_PARAMETERS : 'Take Off Date Range\u003d02-04-2018, 19-04-2018, Status\u003dA, Camera\u003dY, Order By\u003dA,'
                }
            };
            
            sy.RunTach(runtachOptions).then(function(result){ //returns image ID from remote gn_images
                if (result > 0) 
                    WingsDialogService.success();
                else 
                    WingsDialogService.error("FAILED");
            },function(error){
                WingsDialogService.error(error);
            });
        };
        
        $scope.doRefresh = function() {
            if(!WingsUtil.IsNull($scope.selectedCard)){
                $scope.$broadcast('scroll.refreshComplete');
                return false;  
            } 
        	if (!$rootScope.globals.deviceConnectionInfo.isOnline){
        		WingsDialogService.error('Please connect to internet to refresh cards.');
        		$scope.$broadcast('scroll.refreshComplete');
        	} else{
        		pr.pushAndPull($scope.card).then(function(result){
    	        	if (result.status == 'FAILED'){
    	        		 WingsDialogService.error(result.error);
    	        	}
    	        	listWorkCards($scope.card)
    	        	$scope.$broadcast('scroll.refreshComplete');
    	    	},function(error){
    	    		 listWorkCards($scope.card);
    	    		 WingsDialogService.error(error);
    	    		 $scope.$broadcast('scroll.refreshComplete');
    	    	});
        	}
        };
        
        $scope.showAttachments = function (){
            $scope.popover.hide();
            var options = {
                fileName: "test01.jpg",
                chunkedMode: true,
                mimeType: "image/jpg",
                params :{
                    ParentName:'PR_WORK_CARDS',
                    ParentId: $scope.selectedCard.ID,
                    ImageType:'APPENDIX'
                }
            };
            $state.go('app.SY_M002',{uploadOptions: options});
        };
        
        function listWorkCards(card) {
            var sql = "Select a.*," +
                      "       Max(a.Estimated_Time - a.Applied_Time,0) REMAINING_TIME,                 "+
                      "       (Select Count(0)                                                         "+
                      "          From Ic_Requisitions                                                  "+
                      "         Where Div_No         = a.Div_No                                        "+
                      "           And Status         In ('COMPLETED')                                  "+
                      "           And (Card_Id       = a.Id                                            "+
                      "            Or Mobile_Card_Id = a.Mobile_Record_Id)) CLOSED_REQUISITION_COUNT,  "+
                      "       (Select Count(0)                                                         "+
                      "          From Ic_Requisitions                                                  "+
                      "         Where Div_No         = a.Div_No                                        "+
                      "           And Status         In ('PENDING','AWAITING','CREATED')               "+
                      "           And (Card_Id       = a.Id                                            "+
                      "            Or Mobile_Card_Id = a.Mobile_Record_Id)) OPEN_REQUISITION_COUNT,    "+
            		  "       (select ifnull( group_concat(mobile_record_status || ',' || ifnull(server_feedback, '') || ',' || Mobile_Action_Date || ',' || Mobile_Record_Action || ',' || Mobile_Table_Name || ',' || MOBILE_TABLE_RECORD_ID ,';'),'')  "+
                      "           from SY_TRANSACTION_QUEUE b                                          "+
                      "          Where ((Mobile_Table_Name = 'PR_WORK_CARDS' And  Mobile_Table_Record_ID = a.Mobile_Record_Id) " +
                      "                Or (Mobile_Table_Name != 'LB_LABOR_COLLECTION' And Mobile_Parent_Record_ID = a.Mobile_Record_Id))) UNSYNC_CARD_TEXT,   "+
                      /*"       (select ifnull(group_concat(mobile_record_status || ',' ||               "+
                      "                                   ifnull(server_feedback, '') || ',' ||        "+
                      "                                   Mobile_Action_Date || ',' ||                 "+
                      "                                   Mobile_Record_Action || ',' || Mobile_Table_Name,"+
                      "                                   ';'),                                        "+
                      "                      '')                                                       "+
                      "          from SY_TRANSACTION_QUEUE b                                           "+
                      "          Where Mobile_Table_Name In ('PR_CARD_STEPS','IC_REQUISITIONS')        "+
                      "          And Mobile_Parent_Record_ID = a.Mobile_Record_Id) UNSYNC_CHILD_TEXT,  "+*/
            		  "        (Select count(0)                                                        "+
                      "           From Sy_Transaction_Queue                                            "+
                      "          Where Mobile_Table_Name = 'PR_CARD_STEPS'                             "+
                      "            And Mobile_Parent_Record_ID  = a.Mobile_Record_Id) UNSYNC_STEPS,    "+
                      "        (Select count(0)                                                        "+
                      "           From Sy_Transaction_Queue                                            "+
                      "          Where Mobile_Table_Name = 'IC_REQUISITIONS'                           "+
                      "            And Mobile_Parent_Record_ID  = a.Mobile_Record_Id) UNSYNC_REQUISITIONS"+
            		  "   From Pr_Work_Cards a                                                         "+
            		  "  Where a.Div_No = " + $rootScope.globals.currentUser.divNo+
                      "    And a.Mobile_User_Id = '"+$rootScope.globals.currentUser.userId+"'          "+
                      $scope.localCardCondition+
            		  "  Order By Mobile_Record_Id Desc                                                ";
            
            var parameters = [];
            $scope.workCards = [];
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                if(result.length > 0) {
                    $scope.isThereData = true;
                   for (i=0;i<result.length;i++){
                       if (result[i].OPEN_DATE) result[i].OPEN_DATE = moment(result[i].OPEN_DATE,'YYYY-MM-DD HH:mm:ss').format('DD-MMM-YYYY');
                       
                        result[i].UNSYNC_CARD_TRANSACTIONS = [];
                        if(result[i].UNSYNC_CARD_TEXT){
                            unsyncTransactions = result[i].UNSYNC_CARD_TEXT.split(';')
                            for(j=0; j<unsyncTransactions.length; j++){
                                unsyncTransactionsObjects = unsyncTransactions[j].split(',');
                                result[i].UNSYNC_CARD_TRANSACTIONS.push({MOBILE_RECORD_STATUS: unsyncTransactionsObjects[0] ,SERVER_FEEDBACK: unsyncTransactionsObjects[1] , MOBILE_ACTION_DATE:moment(unsyncTransactionsObjects[2],'YYYY-MM-DD HH:mm:ss').format('DD-MMM-YYYY HH:mm:ss') , MOBILE_RECORD_ACTION: unsyncTransactionsObjects[3],MOBILE_TABLE_NAME: unsyncTransactionsObjects[4], MOBILE_TABLE_RECORD_ID: unsyncTransactionsObjects[5] })
                            }
                        }
                    }
                    $scope.workCards = result;
                }else{
                    $scope.isThereData = false;
                }

                if ($scope.selectedCard) {
                    $scope.onHoldWorkCard($scope.selectedCard);
                } else if (card){
                    var isExist = false;
                    for (k=0; k<result.length; k++){
                        if (card.ID && card.ID == result[k].ID){
                            isExist = true;
                            $scope.onHoldWorkCard(result[k]);
                        }
                    }
                    if(!isExist && card.ID){
                        WingsDialogService.error('Please connect to internet to pull new card.');
                    }
                }
                
                $scope.$broadcast('scroll.refreshComplete');
            }, function (error) {
                console.log(JSON.stringify(error));
                $scope.$broadcast('scroll.refreshComplete');
            });
        };
        
        $ionicPlatform.registerBackButtonAction(function () {
            if ($scope.selectedCard == '' || ($scope.workCards.length == 1 && WingsUtil.IsNull($scope.workCards[0].UNSYNC_CARD_TEXT))) {
                $ionicHistory.goBack();
            } else {
                $scope.cancelSelect();
            }
        }, 100);
        
        $rootScope.$ionicGoBack = function() {
            if ($scope.selectedCard == '' || ($scope.workCards.length == 1 && WingsUtil.IsNull($scope.workCards[0].UNSYNC_CARD_TEXT))) {
                $ionicHistory.goBack();
            } else {
                $scope.cancelSelect();
            }
        };
        
        $scope.toggleWorkCard = function (cardObject){
            if (cardObject.selected_flag) {
                $scope.cancelSelect();
            }
            else {
                $scope.onHoldWorkCard(cardObject);
            }
        };
        $scope.toggleSort = function (){
        	if($scope.isASC){
        		$scope.sortBy = '-'+$scope.sortBy;
        	}else{
        		$scope.sortBy = $scope.sortBy.substring(1,$scope.sortBy.length);
        	}
        	$scope.isASC = !$scope.isASC;
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
        $scope.discard = function (){
            $scope.popover.hide();
            sy.DiscardTransaction($scope.selectedCard.MOBILE_RECORD_ID).then(function(result){
                if ($scope.selectedCard.ID){
                    if (!$rootScope.globals.deviceConnectionInfo.isOnline){
                        listWorkCards();
                    }else{
                        pr.pushAndPull($scope.selectedCard).then(function(result){
                            if (result.status == 'FAILED'){
                                 WingsDialogService.error(result.error);
                            }
                            listWorkCards(); //TO-DO select card after discard action(refresh) 
                        },function(error){
                             listWorkCards();
                             WingsDialogService.error(error);
                        });
                    }
                }else{
                    pr.DeleteLocalCard($scope.selectedCard.MOBILE_RECORD_ID).then(function(res){
                        $scope.cancelSelect();
                        if (!$rootScope.globals.deviceConnectionInfo.isOnline){
                            listWorkCards();
                        }else{
                            pr.pushAndPull($scope.selectedCard).then(function(result){
                                if (result.status == 'FAILED'){
                                     WingsDialogService.error(result.error);
                                }
                                listWorkCards();
                            },function(error){
                                 listWorkCards();
                                 WingsDialogService.error(error);
                            });
                        }
                    },function(err){
                        console.log(err);
                        listWorkCards();
                    })
                }
            },function(err){
                console.log(err);
            })
        };
        $scope.onHoldWorkCard = function (cardObject){
           // $cordovaVibration.vibrate(20);
            var isMatched = false;
            var uniqueId = $scope.selectedCard ? $scope.selectedCard.ID + $scope.selectedCard.MOBILE_RECORD_ID : null;
            
            angular.forEach($scope.workCards, function(card) {
                //if(uniqueId == card.ID + card.MOBILE_RECORD_ID){
                if((card.ID && card.ID == $scope.selectedCard.ID) || (!$scope.selectedCard.ID && $scope.selectedCard.MOBILE_RECORD_ID == card.MOBILE_RECORD_ID)){
                    cardObject = card;
                    isMatched = true;
                }
                card.selected_flag = false;
            });
            if(isMatched || !$scope.selectedCard){
                cardObject.selected_flag = true;
                $scope.selectedCard = cardObject;
                $scope.selectedCard.WORK_CARD_NUMBER = $scope.selectedCard.WORK_ORDER_NUMBER  +  $scope.selectedCard.ZONE_NUMBER + $scope.selectedCard.ITEM_NUMBER;
                window.myDoughnutRequisition = generateChart('requisition',$scope.selectedCard.OPEN_REQUISITION_COUNT,$scope.selectedCard.CLOSED_REQUISITION_COUNT,'Open','Closed','#FF0000','#00FF00');
                window.myDoughnutTime        = generateChart('time',$scope.selectedCard.APPLIED_TIME,$scope.selectedCard.REMAINING_TIME,'App.','Rem.','#00FF00','#FF0000');
                window.myDoughnutCard        = generateChart('card',$scope.selectedCard.OPEN_CHILD_CARD_COUNT,$scope.selectedCard.CLOSED_CHILD_CARD_COUNT,'Open','Closed','#FF0000','#00FF00');

            }else{
                $scope.selectedCard = '';
            }
        };
        
        $scope.cancelSelect = function(){
            $scope.selectedCard.selected_flag = false;
            $scope.selectedCard = '';
            $rootScope.prWorkcard = '';
            $timeout(function () {
                $scope.selectedCard = $scope.selectedCard;
            },100);
        };
        
        $scope.cardIcon = function(card){
            if (!card) return '';
            
            var iconText = 'ion-clipboard';
            
            if (card.selected_flag) {
                iconText = 'ion-ios-checkmark balanced';
            }
            
            return iconText;
        };

        $scope.callProgram = function (programId,workcard){
            $scope.popover.hide();
            if (workcard){
                $rootScope.prWorkcard = _.cloneDeep(workcard);
            }else if ($scope.selectedCard){
                $rootScope.prWorkcard = _.cloneDeep($scope.selectedCard);
            } else return;
            
            $state.go('app.'+programId);
        };
        
        $scope.deleteCard = function (){ //TODO not in menu yet
            if (!WingsUtil.IsNull($scope.selectedCard.ID)) {
                WingsDialogService.error('Card has been synced. Delete is not allowed.');
                return false;
            } 
            
            var sql = "Delete From PR_WORK_CARDS " +
                      " Where Mobile_Record_Id = ?";
            var parameters = [$scope.selectedCard.MOBILE_RECORD_ID];
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                WingsDialogService.success();
                $.each($scope.workCards, function(i){
                    if($scope.workCards[i].MOBILE_RECORD_ID == $scope.selectedCard.MOBILE_RECORD_ID) {
                        $scope.workCards.splice(i,1);
                        $scope.popover.hide();
                        cancelSelect();
                        return true;
                    }
                });
            }, function (error) {
                WingsDialogService.error(JSON.stringify(error));
                $scope.popover.hide();
                console.log(JSON.stringify(error));
            });
        };
        function getStepPushList(){
        	console.log("get step list - started");
        	var deferred = $q.defer();
        	var sql = "Select * From PR_CARD_STEPS " +
                      " Where Mobile_Record_Status != 'LOADED'";
			var parameters = [];
	        WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
			    deferred.resolve(result);
			}, function (error) {
			    deferred.reject(error);
			});
			return deferred.promise;
        }
        function getRequisitionPushList(){
        	console.log("get requisition list - started");
        	var deferred = $q.defer();
        	var sql = "Select * From IC_REQUISITIONS " +
                      " Where Mobile_Record_Status != 'LOADED'";
			var parameters = [];
	        WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
			    deferred.resolve(result);
			}, function (error) {
			    deferred.reject(error);
			});
			return deferred.promise;
        }
        function getCardPushList(){
        	console.log("get card list - started");
        	var deferred = $q.defer();
        	var sql = "Select * From PR_WORK_CARDS " +
                      " Where Mobile_Record_Status == 'READY'";
			var parameters = [];
	        WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
	        	for(i=0; i<result.length; i++){
	        		result[i].ID                = Number(result[i].ID);
	        		result[i].ZONES             = result[i].ZONES.split(',');
	        		result[i].FLAGS             = result[i].FLAGS.split(',');
	        		result[i].SKILL_CODES       = result[i].SKILL_CODES.split(';');
	        		result[i].ESTIMATED_TIMES   = result[i].ESTIMATED_TIMES.split(';');
	        		result[i].PART_IDS          = result[i].PART_IDS.split(',');
	        		result[i].PART_NUMBERS      = result[i].PART_NUMBERS.split(',');
	        		result[i].PART_DESCRIPTIONS = result[i].PART_DESCRIPTIONS.split(',');
	        		result[i].PART_QUANTITIES   = result[i].PART_QUANTITIES.split(',');
	        		result[i].PART_REPAIR_FLAGS = result[i].PART_REPAIR_FLAGS.split(',');
	        		result[i].ESTIMATED_TIME    = WingsUtil.IsNull(result[i].ESTIMATED_TIME) ? '' : parseFloat(result[i].ESTIMATED_TIME);
	        		result[i].APPLIED_TIME      = WingsUtil.IsNull(result[i].APPLIED_TIME)   ? '' : parseFloat(result[i].APPLIED_TIME);
	        	}
			    deferred.resolve(result);
			}, function (error) {
			    deferred.reject(error);
			});
			return deferred.promise;
        };
        $ionicPopover.fromTemplateUrl('templates/popover.html', {
            scope: $scope,
          }).then(function(popover) {
            $scope.popover = popover;
        });
        
        $ionicPopover.fromTemplateUrl('templates/popoverSort.html', {
            scope: $scope,
        }).then(function(popover) {
          $scope.popoverSort = popover;
        });
        
        $scope.scanBarcode = function () {
            $cordovaBarcodeScanner.scan().then(function(barcodeData) {
                var barcode = barcodeData.text;
                $scope.card = {ID:'', WORK_CARD_NUMBER:barcode};
                //$scope.card = {ID:'', WORK_CARD_NUMBER:'04444603200000019'};
                if (!$rootScope.globals.deviceConnectionInfo.isOnline){
                    WingsDialogService.error('Please connect to internet to pull new card.');
                }else{
                    pr.pushAndPull($scope.card).then(function(result){
                        if (result.status == 'FAILED'){
                            WingsDialogService.error(result.error);
                        }
                        pr.FetchLocalData($scope.card).then(function(result){
                            $scope.card  = result;
                            $scope.selectedCard = $scope.card;
                            $scope.localCardCondition = "And (a.Id = '"+$scope.card.ID+"' Or "+$scope.localCardConditionPartTwo+')';
                            listWorkCards($scope.selectedCard);
                        },function (error) {
                            WingsDialogService.error(error);
                            listWorkCards();
                        });
                    },function(error){
                         listWorkCards();
                         WingsDialogService.error(error);
                    });  
                }
            }, function(error) {
                console.log('Error',error);
            });
        };

        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            var fromChild = false;
            if(!$scope.card) $scope.card = {};
            if (toState.name == 'app.PR_M108') {
                if (fromState.name == 'app.home'){ // && fromState.name == 'app.PR_M115'
                    //$scope.card = {ID:1001036265, WORK_CARD_NUMBER:''};
                    //$scope.localCardCondition = "And (a.Id = 1001036265 "+$scope.localCardConditionPartTwo;
                } else if(fromState.name == 'app.GN_M005'){
                    $scope.card = {ID:$rootScope.PR_M108.Work_Card_Id, WORK_CARD_NUMBER:''};
                    $scope.localCardCondition = "And (a.Id = '"+$rootScope.PR_M108.Work_Card_Id+"' Or "+$scope.localCardConditionPartTwo+')';
                    
                //call from MM
                } else if ((fromState.name == 'app.MM_M055' || fromState.name == 'app.MM_0052_TailStatus') && $rootScope.PR_M108 && ($rootScope.PR_M108.Work_Card_Id || $rootScope.PR_M108.Discrepancy_Work_Card_Id || $rootScope.PR_M108.Project_Number)) {
                    $scope.card = {
                        PARAMETER_TYPE           : $rootScope.PR_M108.Discrepancy_Work_Card_Id ? 'DISCREPANCY-CARDS' : ($rootScope.PR_M108.Project_Number ? 'PROJECT-CARDS' : ''),
                        ID                       : $rootScope.PR_M108.Work_Card_Id,
                        PROJECT_NUMBER           : $rootScope.PR_M108.Project_Number,
                        DISCREPANCY_WORK_CARD_ID : $rootScope.PR_M108.Discrepancy_Work_Card_Id,
                        WORK_CARD_NUMBER         : ''
                    };

                    //card condition
                    $scope.localCardCondition     = "And (a.Id = '"+$scope.card.ID+"' Or "+$scope.localCardConditionPartTwo+')';
                    if ($scope.card.PARAMETER_TYPE == 'DISCREPANCY-CARDS') {
                        $scope.localCardCondition = "And (a.Id = '"+$scope.card.DISCREPANCY_WORK_CARD_ID+"' Or a.Source_Card_Id = '"+$scope.card.DISCREPANCY_WORK_CARD_ID+"' Or "+$scope.localCardConditionPartTwo+')';
                    } else if ($scope.card.PARAMETER_TYPE == 'PROJECT-CARDS') {
                        $scope.localCardCondition = "And (a.Project_Number = '"+$scope.card.PROJECT_NUMBER+"' Or "+$scope.localCardConditionPartTwo+')';
                    }
                } else {
                    fromChild = true;
                }
                
                if (!fromChild && $scope.card && $rootScope.globals.deviceConnectionInfo.isOnline) {
                    pr.pushAndPull($scope.card).then(function(result){
                        if (result.status == 'FAILED'){
                             WingsDialogService.error(result.error);
                        }
                        listWorkCards($scope.card);
                    },function(error){
                         listWorkCards($scope.card);
                         WingsDialogService.error(error);
                    });
                } else {
                    listWorkCards($scope.card);
                }
            } else {
                
            }
        });
        
        $scope.openPopover = function($event, msg) {
            console.log(msg);
            $scope.responseMessage = msg
            $scope.popoverTooltip.show($event);
            $event.stopPropagation();
        };
        $ionicPopover.fromTemplateUrl('templates/popoverTooltip.html', {
            scope: $scope,
        }).then(function(popover) {
          $scope.popoverTooltip = popover;
        });
        $scope.convertToDate = function (stringDate){
            var dateOut = moment(stringDate).format('D MMM H:mm')
            return dateOut;
        };
        $scope.setObjectName = function(TableName){
            if (TableName == 'PR_WORK_CARDS'){
                return 'Card';
            }else if (TableName == 'PR_CARD_STEPS'){
                return 'Step';
            }else if (TableName == 'IC_REQUISITIONS'){
                return 'Material';
            }
        }
        $scope.navigateToAction = function (object){
            $rootScope.prWorkcard = _.cloneDeep($scope.selectedCard);
            if (object.MOBILE_TABLE_NAME == 'PR_WORK_CARDS'){
                if (object.MOBILE_RECORD_ACTION == 'CREATE'){
                    $state.go('app.PR_M115');
                }else if (object.MOBILE_RECORD_ACTION == 'MODIFY'){
                    $state.go('app.PR_M116');
                }else if (object.MOBILE_RECORD_ACTION == 'CLOSE'){
                    $state.go('app.PR_M117');
                }else if (object.MOBILE_RECORD_ACTION == 'BUMP'){
                    $state.go('app.PR_M119');
                }else if (object.MOBILE_RECORD_ACTION == 'EVALUATE'){
                    $state.go('app.PR_M100');
                }
            }else if (object.MOBILE_TABLE_NAME == 'PR_CARD_STEPS'){
                $rootScope.prStep = {ID:null,MOBILE_RECORD_ID:object.MOBILE_TABLE_RECORD_ID};
                $state.go('app.PR_M118');
            }else if (object.MOBILE_TABLE_NAME == 'IC_REQUISITIONS'){
                $rootScope.prRequisition = {ORDER_LINE_ID:null,MOBILE_RECORD_ID:object.MOBILE_TABLE_RECORD_ID}; 
                $state.go('app.LB_M169');
            }
        }
        generateChart = function(chartId, x, y,labelX,labelY,colorX,colorY){
            var config = {
                    type: 'doughnut',
                    data: {
                        datasets: [{
                            data: [],
                            backgroundColor: []
                        }],
                        labels: []
                    },
                    options: {
                        responsive: true,
                        legend: {
                            position: 'right',
                            labels: {
                                boxWidth:10
                            }
                        },
                        title: {
                            display: false,
                            text: 'Chart.js Doughnut Chart'
                        },
                        animation: {
                            animateScale: true,
                            animateRotate: true
                        }
                    }
                };
            var xValue = x ? Number(x) : 0;
            var yValue = y ? Number(y) : 0;
            if (!xValue && !yValue){
                config.data.datasets[0].data = [100];
                config.data.datasets[0].backgroundColor = ['#808080'];
                config.data.labels =['NO DATA'];
            }else{
                var total = Number (xValue + yValue);
                var percentageX = (Number(xValue /total) * 100).toFixed(1);
                var percentageY = Number(100 - percentageX).toFixed(1);
                config.data.datasets[0].data = [percentageX,percentageY];
                config.data.datasets[0].backgroundColor =[colorX,colorY];
                config.data.labels =[labelX,labelY];
            }
            var chart = document.getElementById(chartId).getContext('2d');
             return new Chart(chart, config);
        }
        $scope.callDocumentViewer = function(){
            
            $rootScope.LB_M121_parent = 'PR_WORK_CARDS';
            $rootScope.LB_M121_parentId = $scope.selectedCard.ID;
            $rootScope.LB_M121_parentObject = $scope.selectedCard;
            
            if($scope.selectedCard.ROUTINE_FLAG == 'Y'){
                var rtnObjects = [];
                var sectionList = $scope.selectedCard.STEP_DATA ? $scope.selectedCard.STEP_DATA.split(';') : [];
                for (k=0; k<sectionList.length; k++){
                    var tempList = sectionList[k] ? sectionList[k].split(',') : [];
                    if (tempList.length > 0){
                        if (tempList[3].includes('|') || tempList[5].includes('|')){
                            var posyArr   = tempList[3].split('|');
                            var heightArr = tempList[5].split('|');
                            if (posyArr[0].includes('%') > 0){
                                tempList[3] = posyArr[0];
                            }else{
                                tempList[3] = posyArr[0] + '%';
                            }
                            if (heightArr[0].includes('%') > 0){
                                tempList[5] = heightArr[0];
                            }else{
                                tempList[5] = heightArr[0] + '%';
                            }
                        }
                        var tempObject = {
                                        functionBody:"function run() { if (!$scope.isStampMode){$rootScope.prWorkcard = {ID : parentId}; $rootScope.prStep = {ID:" +tempList[0]+"}; $state.go('app.PR_M118') } else{ performStep("+tempList[0]+")} }; run();",
                                        name:'sectionName'+tempList[0],
                                        pageNumber:tempList[4],
                                        tag:'section',
                                        fileId:tempList[4],
                                        columnId:'section'+tempList[0],
                                        positionX:'0%',
                                        positionY:tempList[3],
                                        type:'',
                                        value:'',
                                        width:tempList[6],
                                        height: tempList[5],
                                        placeholder:'',
                                        stepStatus:tempList[7],
                                        draggable:false,
                                        editable:false
                                        };
                        rtnObjects.push(tempObject);
                        
                        }
                }
                $rootScope.documentObjects = rtnObjects;
            }else{
                var nrcObjects =[
                    {   annotation:false,
                        //name:'taskCode',
                        pageNumber:'0',
                        tag:'input',
                        fileId:'',
                        columnId:'0',
                        positionX:'16.33%',
                        positionY:'2.91%',
                        type:'text',
                        value:$scope.selectedCard.TASK_CODE,
                        width:'23.64%',
                        height: '1.29%',
                        placeholder:'',
                        draggable:false,
                        editable:false
                        
                    },  
                    {   annotation:false,
                        //name:'aircraftMsn',
                        pageNumber:'0',
                        tag:'input',
                        fileId:'',
                        columnId:'1',
                        positionX:'6.38%',
                        positionY:'11.40%',
                        type:'text',
                        value: $scope.selectedCard.AIRCRAFT_MSN,
                        width:'11.12%',
                        height: '3.13%',
                        placeholder:'',
                        draggable:false,
                        editable:false
                        
                    }, 
                    {   annotation:false,
                        //name:'projectNumber',
                        pageNumber:'0',
                        tag:'input',
                        fileId:'',
                        columnId:'2',
                        positionX:'52.49%',
                        positionY:'2.91%',
                        type:'text',
                        value:$scope.selectedCard.PROJECT_NUMBER,
                        width:'17.03%',
                        height: '1.29%',
                        placeholder:'',
                        draggable:false,
                        editable:false
                        
                    },
                    {   annotation:false,
                        //name:'aircraftType',
                        pageNumber:'0',
                        tag:'input',
                        fileId:'',
                        columnId:'3',
                        positionX:'18.43%',
                        positionY:'11.40%',
                        type:'text',
                        value:$scope.selectedCard.AIRCRAFT_TYPE,
                        width:'11.12%',
                        height: '3.13%',
                        placeholder:'',
                        draggable:false,
                        editable:false
                        
                    },
                    {   annotation:false,
                        //name:'itemNumber',
                        pageNumber:'0',
                        tag:'input',
                        fileId:'',
                        columnId:'4',
                        positionX:'79.76%',
                        positionY:'2.91%',
                        type:'text',
                        value:$scope.selectedCard.ITEM_NUMBER,
                        width:'14.52%',
                        height: '1.29%',
                        placeholder:'',
                        draggable:false,
                        editable:false
                        
                    },
                    {   annotation:false,
                        //name:'zones',
                        pageNumber:'0',
                        tag:'input',
                        fileId:'',
                        columnId:'5',
                        positionX:'30.71%',
                        positionY:'11.40%',
                        type:'text',
                        value:$scope.selectedCard.ZONES,
                        width:'11.12%',
                        height: '3.13%',
                        placeholder:'',
                        draggable:false,
                        editable:false
                        
                    },
                    {   annotation:false,
                        //name:'checkType',
                        pageNumber:'0',
                        tag:'input',
                        fileId:'',
                        columnId:'6',
                        positionX:'44.21%',
                        positionY:'11.40%',
                        type:'text',
                        value:$scope.selectedCard.CHECK_TYPE,
                        width:'11.12%',
                        height: '3.13%',
                        placeholder:'',
                        draggable:false,
                        editable:false
                        
                    },
                    {   annotation:false,
                        //name:'workOrderStation',
                        pageNumber:'0',
                        tag:'input',
                        fileId:'',
                        columnId:'7',
                        positionX:'68.40%',
                        positionY:'11.40%',
                        type:'text',
                        value:$scope.selectedCard.WORK_ORDER_STATION,
                        width:'7.12%',
                        height: '3.13%',
                        placeholder:'',
                        draggable:false,
                        editable:false
                        
                    },
                    {   annotation:false,
                        //name:'customerWorkCard',
                        pageNumber:'0',
                        tag:'input',
                        fileId:'',
                        columnId:'8',
                        positionX:'11.45%',
                        positionY:'15.53%',
                        type:'text',
                        value:$scope.selectedCard.CUSTOMER_WORK_CARD,
                        width:'56.03%',
                        height: '1.73%',
                        placeholder:'',
                        draggable:false,
                        editable:false
                        
                    },
                    {   annotation:false,
                        //name:'sourceWorkCard',
                        pageNumber:'0',
                        tag:'input',
                        fileId:'',
                        columnId:'9',
                        positionX:'49.51%',
                        positionY:'89.18%',
                        type:'text',
                        value:$scope.selectedCard.SOURCE_WORK_CARD,
                        width:'42.53%',
                        height: '2.09%',
                        placeholder:'',
                        draggable:false,
                        editable:false
                        
                    },
                    {   annotation:false,
                        //name:'description',
                        pageNumber:'0',
                        tag:'textarea',
                        fileId:'',
                        columnId:'10',
                        positionX:'6.38%',
                        positionY:'24.56%',
                        type:'text',
                        value:$scope.selectedCard.DESCRIPTION,
                        width:'30.94%',
                        height: '54.51%',
                        placeholder:'',
                        draggable:false,
                        editable:false
                        
                    },
                    {   annotation:false,
                        //name:'correctiveAction',
                        pageNumber:'0',
                        tag:'textarea',
                        fileId:'',
                        columnId:'11',// todo
                        positionX:'38.90%',
                        positionY:'24.56%',
                        type:'text',
                        value:$scope.selectedCard.CORRECTIVE_ACTION,
                        width:'30.94%',
                        height: '54.51%',
                        placeholder:'',
                        draggable:false,
                        editable:false
                        
                    },
                    {   annotation:false,
                        //name:'riiYes',
                        pageNumber:'0',
                        tag:'input',
                        fileId:'',
                        columnId:'12',
                        positionX:'85.81%',
                        positionY:'10.03%',
                        type:'text',
                        value:$scope.selectedCard.FLAGS.includes('RII') ? 'X':'',
                        width:'1.30%',
                        height: '0.83%',
                        placeholder:'',
                        draggable:false,
                        editable:false
                        
                    },
                    {   annotation:false,
                        //name:'riiNo',
                        pageNumber:'0',
                        tag:'input',
                        fileId:'',
                        columnId:'13',
                        positionX:'92.09%',
                        positionY:'10.03%',
                        type:'text',
                        value:$scope.selectedCard.FLAGS.includes('RII') ? '':'X',
                        width:'1.30%',
                        height: '0.83%',
                        placeholder:'',
                        draggable:false,
                        editable:false
                        
                    },
                    {   annotation:false,
                        //name:'checkedBy',
                        pageNumber:'0',
                        tag:'textarea',
                        fileId:'',
                        columnId:'14',
                        positionX:'76%',
                        positionY:'92.8%',
                        type:'text',
                        value:$scope.selectedCard.INSPECTOR_NUMBER,
                        width:'18%',
                        height: '2%',
                        placeholder:'',
                        draggable:false,
                        editable:false
                        
                    },
                    {   annotation:false,
                        //name:'checkedBy',
                        pageNumber:'0',
                        tag:'textarea',
                        fileId:'',
                        columnId:'15',
                        positionX:'76%',
                        positionY:'94.5%',
                        type:'text',
                        value:$scope.selectedCard.INSPECTOR_STAMP_NUMBER,
                        width:'18%',
                        height: '2%',
                        placeholder:'',
                        draggable:false,
                        editable:false
                        
                    },
                    {   annotation:false,
                        //name:'checkedBy',
                        pageNumber:'0',
                        tag:'textarea',
                        fileId:'',
                        columnId:'16',
                        positionX:'76%',
                        positionY:'96%',
                        type:'text',//result[i].OPEN_DATE = moment(result[i].OPEN_DATE,'YYYY-MM-DD HH:mm:ss').format('DD-MMM-YYYY');
                        value: $scope.selectedCard.INSPECTION_DATE ? moment($scope.selectedCard.INSPECTION_DATE,'YYYY-MM-DD HH:mm:ss').format('DD-MMM-YYYY') : '',
                        width:'18%',
                        height: '2%',
                        placeholder:'',
                        draggable:false,
                        editable:false
                        
                    }/*,
                    {
                        functionBody:"function run() { $rootScope.prWorkcard = {ID : parentId}; $state.go('app.PR_M117')  }; run();",
                        name:'sectionNameClose',
                        pageNumber:'3',
                        tag:'section',
                        fileId:'',
                        columnId:'section1111',
                        positionX:'65%',
                        positionY:'92.5%',
                        type:'',
                        value:'',
                        width:'30%',
                        height:'5%',
                        placeholder:'',
                        stepStatus:'empty',
                        draggable:false,
                        editable:false
                    },
                    {
                        functionBody:"function run() { $scope.newWindow('PR_WORK_CARDS',1003373421);  }; run();",
                        name:'sectionNameNextDocument',
                        pageNumber:'3',
                        tag:'section',
                        fileId:'',
                        columnId:'section222',
                        positionX:'65%',
                        positionY:'50%',
                        type:'',
                        value:'',
                        width:'30%',
                        height:'5%',
                        placeholder:'',
                        stepStatus:'empty',
                        draggable:false,
                        editable:false
                    },
                    {   annotation:false,
                        //name:'checkedBy',
                        pageNumber:'0',
                        tag:'textarea',
                        fileId:'',
                        columnId:'16',
                        positionX:'70%',
                        positionY:'52%',
                        type:'text',
                        value:'newWindow',
                        width:'10%',
                        height: '3%',
                        placeholder:'',
                        draggable:false,
                        editable:false
                        
                    }*/
            ]
                $rootScope.documentObjects = nrcObjects;
            }
            // sections ready
           /* if (workcard){
                $rootScope.prWorkcard = _.cloneDeep(workcard);
            }else if ($scope.selectedCard){
                $rootScope.prWorkcard = _.cloneDeep($scope.selectedCard);
            } else return;
            */
            $state.go('app.LB_M121');
            
        }
    } 
])