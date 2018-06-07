angular.module('WingsMobileStarter').controller('IC_M065', [
    '$scope',
    'WingsRemoteDbService',
    '$cordovaBarcodeScanner',
    'WingsUtil',
    'WingsDialogService',
    function($scope,WingsRemoteDbService,$cordovaBarcodeScanner,WingsUtil,WingsDialogService) {
        console.log("IC_M065");
        $scope.IC_M065 = {locationId:'',
                          quantity:'',
                          comment:''};
        $scope.IC_M065.comments = [];
        WingsUtil.Focus('tag');
        $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
            // data.slider is the instance of Swiper
            $scope.slider = data.slider;
          });
        $scope.scanBarcode = function (scanObj) {
            $cordovaBarcodeScanner.scan().then(function(barcodeData) {
                  if(barcodeData.text == '') {
                    return false;
                  }
                  WingsUtil.Log(barcodeData.text);
                  barcodeData.text = barcodeData.text.replace("*","");
                  if (scanObj == 'tag') {
                      $scope.IC_M065.tag = Number(barcodeData.text.substr(1));
                      $scope.pullAllocation();
                      $scope.scanObj = 'location';
                      if ($scope.slider.activeIndex == 0) {
                    	  WingsUtil.Focus('location');
                      }
                  } else if(scanObj == 'location') {
                      $scope.IC_M065.locationId = barcodeData.text.substring(1);
                      $scope.IC_M065.location = getLocation(barcodeData.text.substring(1));
                  }
              }, function(error) {
                  WingsUtil.Log('Error',error);
              });
        };
        $scope.setScanObj = function (obj) {
            $scope.scanObj = obj;
        };
        
        function getLocation (id) {
            var sql = "Select Location     " +
                      "  From ic_locations " +
                      " Where id = "+id;
            var sqlArray = [{ queryStr: sql, queryType: "READ" }];
            var sqlString = JSON.stringify(sqlArray);
            WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                $scope.IC_M065.location = angular.fromJson(dataIn[0].rows)[0].location;  
            }, function (error) {});
        };
        $scope.getLocationByName = function () {
       	    var deferred = $q.defer();
            if (WingsUtil.IsNull($scope.IC_M065.location)) {
            	var text = 'Location is required.';
                WingsDialogService.error(text);
                return false;
            }
            var sql = "Select id     " +
                      "  From ic_locations " +
                      " Where location = '"+$scope.IC_M065.location+"'";
            var sqlArray = [{ queryStr: sql, queryType: "READ" }];
            var sqlString = JSON.stringify(sqlArray);
            WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                var rows = angular.fromJson(dataIn[0].rows);
                if(rows.length > 0) {
                    $scope.IC_M065.locationId = rows[0].id;  
                    return deferred.resolve(rows[0].id);
                } else {
                    WingsDialogService.error('Invalid Location.');
                    return deferred.reject('Invalid Location.');
                }
            }, function (error) {});
            return deferred.promise;
        };
        function getComments () {
            var sql = "Select Comment_Text                     "+
                      "  From Gn_Default_Comments              "+
                      " Where Div_No = 1                       "+
                      "   And Parent = 'IC_TRANSACTIONS'       "+
                      "   And Comment_Type = 'ADJUST-QUANTITY' "+
                      "   And Active = 'Y'                     ";
            var sqlArray = [{ queryStr: sql, queryType: "READ" }];
            var sqlString = JSON.stringify(sqlArray);
            WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                var rows = angular.fromJson(dataIn[0].rows);
                if(rows.length > 0) {
                    $scope.IC_M065.comments = rows;
                }
            }, function (error) {});          
            return deferred.promise;
        };
        getComments()
        $scope.pullAllocation = function () {
            if(WingsUtil.IsNull($scope.IC_M065.tag)) {
                return false;
            }
            var sql = "Select Part_Number,                                " +
                      "       Div_No,                                     " +
                      "       Serial_Number,                              " +
                      "       Lot_Number,                                 " +
                      "       Location,                                   " +
                      "       Location_Id,                                " +
                      "       Quantity,                                   " +
                      "       Customer_Name,                              " +
                      "       Expire_Date,                                " +
                      "       Expiration_Flag,                            " +
                      "       Status,                                     " +
                      "       Condition_Code,                             " +
                      "       Shelf_Life,                                 " +
                      "       To_Char(Last_Receipt_Date,'YYYY-MM-DD HH24:mm') receipt_date, " +
                      "       Uom,                                        " +
                      "       Id                                          " +
                      "  From ic_allocations_v                            " +
                      " Where Tag_Number = "+$scope.IC_M065.tag           ;
            var sqlArray = [{ queryStr: sql, queryType: "READ" }];
            var sqlString = JSON.stringify(sqlArray);
            WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                var rows = angular.fromJson(dataIn[0].rows);
                if(rows.length > 0) {
                    $scope.allocation = rows[0];  
                } else {
                    WingsDialogService.error('Invalid Tag.');
                }
            }, function (error) {});
        };
        function moveAllocation () {
        	$scope.getLocationByName().then(function (dataIn) {
	            var text = '';
	            var divNo  = $rootScope.globals.currentUser.divNo;
	            if (WingsUtil.IsNull($scope.IC_M065.location)) {
	                text = 'Quantity is required.';
	                WingsDialogService.error(text);
	                return false;
	            } else if (WingsUtil.IsNull($scope.IC_M065.quantity)) {
	                text = 'Tag will be moved.';
	            } else if ($scope.allocation.div_no != divNo) {
	            	 text = 'Move is not allowed.Tag belongs to another division.';
	                 WingsDialogService.error(text);
	                 return false;
	            }
	            if ($scope.slider.activeIndex == 0) {
	                $scope.IC_M065.quantity='';
	                $scope.IC_M065.comment = '';
	            }
	            WingsDialogService.confirm(text,'Confirm','OK,Cancel').then(function(buttonIndex) {
	                if (buttonIndex == 1) {
	                    var userId = $rootScope.globals.currentUser.userNumber;
	                    var myBuilder = new StoredFuncProcBuilder('Mb_Apps.Adjust_Allocation',
	                                                              'i_Div_No',        divNo,
	                                                              'i_Allocation_Id', $scope.allocation.id,
	                                                              'i_Location_Id',   $scope.IC_M065.locationId,
	                                                              'i_Quantity',      $scope.IC_M065.quantity,
	                                                              'i_Comment_Text',  $scope.IC_M065.comment,
	                                                              'i_Processed_By_Employee_Number',userId);
	
	                    var myFuncArray = [myBuilder.queryObject()];
	                    var strSql = JSON.stringify(myFuncArray);
	                    WingsRemoteDbService.executeFunction(strSql).then(function (dataIn) {
	                        dataIn[0] = JSON.parse(dataIn[0]);
	                        if (dataIn[0].isSuccess =='true'  && dataIn[0].errorText == '') {
	                            WingsRemoteDbService.HandleFeedback(dataIn[0]);
	                            $scope.reset();
	                        } else {
	                            WingsRemoteDbService.HandleFeedback(dataIn[0]);
	                        }
	                    }, function (response) {
	                        WingsUtil.Log("ERROR " + response.status +" MESSAGE : "+response.message);
	                    });
	                }
	            });
        	}, function (error) {});
        };
        function adjustAllocation () {
	            var text = '';
	            var divNo  = $rootScope.globals.currentUser.divNo;
	            if (WingsUtil.IsNull($scope.IC_M065.quantity)) {
	                text = 'Quantity is required.';
	                WingsDialogService.error(text);
	                return false;
	            } else if (WingsUtil.IsNull($scope.IC_M065.comment)) {
	                text = 'Comment is required.';
	                WingsDialogService.error(text);
	                return false;
	            } else if (!WingsUtil.IsNull($scope.IC_M065.quantity)) {
	                text = 'Quantity will be adjusted.';
	            } 
	            WingsDialogService.confirm(text,'Confirm','OK,Cancel').then(function(buttonIndex) {
	                if (buttonIndex == 1) {
	                    var userId = $rootScope.globals.currentUser.userNumber;
	                    var myBuilder = new StoredFuncProcBuilder('Mb_Apps.Adjust_Allocation',
	                                                              'i_Div_No',        divNo,
	                                                              'i_Allocation_Id', $scope.allocation.id,
	                                                              'i_Location_Id',   $scope.IC_M065.locationId,
	                                                              'i_Quantity',      $scope.IC_M065.quantity,
	                                                              'i_Comment_Text',  $scope.IC_M065.comment,
	                                                              'i_Processed_By_Employee_Number',userId);
	
	                    var myFuncArray = [myBuilder.queryObject()];
	                    var strSql = JSON.stringify(myFuncArray);
	                    WingsRemoteDbService.executeFunction(strSql).then(function (dataIn) {
	                        dataIn[0] = JSON.parse(dataIn[0]);
	                        if (dataIn[0].isSuccess =='true'  && dataIn[0].errorText == '') {
	                            WingsRemoteDbService.HandleFeedback(dataIn[0]);
	                            $scope.reset();
	                        } else {
	                            WingsRemoteDbService.HandleFeedback(dataIn[0]);
	                        }
	                    }, function (response) {
	                        WingsUtil.Log("ERROR " + response.status +" MESSAGE : "+response.message);
	                    });
	                }
	            });
        };
        $scope.pushAllocation = function() {
        	if ($scope.slider.activeIndex == 0) {
        		moveAllocation();
        	} else {
        		adjustAllocation();
        	}
            
        };
        $scope.reset = function(){
            /*var a = WingsDialogService.confirms('Hello Test This is a confirm message','Cancel','OK').then (function (res) {
                debugger;
            });*/
            $scope.IC_M065.locationId = '';
            $scope.IC_M065.location = '';
            $scope.IC_M065.quantity = '';
            $scope.IC_M065.tag = '';
            $scope.IC_M065.comment = '';
            $scope.allocation = undefined;
        };
    } 
])