angular.module('WingsMobileStarter').controller('IC_M063.Locations', [
    '$scope',
    'WingsRemoteDbService',
    '$cordovaBarcodeScanner',
    'WingsUtil',
    'WingsDialogService',
    '$ionicModal',
    '$ionicSlideBoxDelegate',
    '$rootScope',
    '$ionicScrollDelegate',
    '$ionicPopover',
    '$ionicPlatform',
    '$ionicHistory',
    function($scope,WingsRemoteDbService,$cordovaBarcodeScanner,WingsUtil,WingsDialogService,$ionicModal,$ionicSlideBoxDelegate,$rootScope,$ionicScrollDelegate,$ionicPopover,$ionicPlatform,$ionicHistory) {
        console.log("IC_M063_Locations");
//LOCATION SLIDE     
        $scope.locations = [];
        $scope.allLocations= [];
        $scope.IC_M063 = {
                searchKey : ''
        };
        function getLocations () {
            var sql = "Select id,                     " +
                      "       div_no,                 " +
                      "       schedule_id,            " +
                      "       location_id,            " +
                      "       location,               " +
                      "       location_type,          " +
                      "       status                  " +
                      "  From ic_count_locations      " +
                      " Where schedule_id = "+$rootScope.IC_0063_Schedule.id+
                      " Group By  Div_No,              " +
                      "          Id,                  " +
                      "          Location_Type,       " +
                      "          Location             " +
                      " Order By Location";

            var parameters = [];
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
                var locations = result;
                var activePlant = -1;
                var activeStockRoom = -1;
                var activeColumn = -1;
                $rootScope.$broadcast('loading:hide');
                locations.forEach(function(element) {
                    if (element.LOCATION_TYPE == 'PLANT') {
                        $scope.locations.push({
                            "name":element.LOCATION,
                            "id":element.LOCATION_ID,
                            "type":element.LOCATION_TYPE,
                            "status":element.STATUS,
                            "toCount":element.TO_COUNT_LOCATIONS,
                            "counting":element.COUNTING_LOCATIONS,
                            "counted":element.COUNTED_LOCATIONS,
                            "empty":element.EMPTY_LOCATIONS,
                            "childItems" : []
                        });
                        activePlant = activePlant+1
                        activeStockRoom = -1;
                        activeColumn = -1;
                    } else if (element.LOCATION_TYPE == 'STOCKROOM') {
                        $scope.locations[activePlant].childItems.push({
                            "name":element.LOCATION,
                            "id":element.LOCATION_ID,
                            "type":element.LOCATION_TYPE,
                            "status":element.STATUS,
                            "toCount":element.TO_COUNT_LOCATIONS,
                            "counting":element.COUNTING_LOCATIONS,
                            "counted":element.COUNTED_LOCATIONS,
                            "empty":element.EMPTY_LOCATIONS,
                            "childItems" : []
                        });
                        activeStockRoom = activeStockRoom+1;
                        activeColumn = -1;
                    }else if (element.LOCATION_TYPE == 'COLUMN') {
                        $scope.locations[activePlant].childItems[activeStockRoom].childItems.push({
                            "name":element.LOCATION,
                            "id":element.LOCATION_ID,
                            "type":element.LOCATION_TYPE,
                            "status":element.STATUS,
                            "toCount":element.TO_COUNT_LOCATIONS,
                            "counting":element.COUNTING_LOCATIONS,
                            "counted":element.COUNTED_LOCATIONS,
                            "empty":element.EMPTY_LOCATIONS,
                            "childItems" : []
                        });
                        activeColumn = activeColumn+1;
                    }else if (element.LOCATION_TYPE == 'BIN') {
                        $scope.locations[activePlant].childItems[activeStockRoom].childItems[activeColumn].childItems.push({
                            "name":element.LOCATION,
                            "id":element.LOCATION_ID,
                            "status":element.STATUS,
                            "toCount":element.TO_COUNT_LOCATIONS,
                            "counting":element.COUNTING_LOCATIONS,
                            "counted":element.COUNTED_LOCATIONS,
                            "empty":element.EMPTY_LOCATIONS,
                            "type":element.LOCATION_TYPE
                        });
                    }
                });
            },function (error) {
                console.log(error);
                $rootScope.$broadcast('loading:hide');
            });  
        };

        $scope.pullLocations = function () {
            var divNo  = $rootScope.globals.currentUser.divNo;
            var sql = " Select b.Div_No,"+
                      "        b.Id Location_Id,  "+
                      "        b.Id Id,           "+
                      "        b.Location,"+
                      "        b.Location_Type,"+
                      "        (Select Count(0)"+
                      "           From Ic_Locations       x,"+
                      "                Ic_Count_Locations y"+
                      "          Where x.Div_No      = b.Div_No"+
                      "            And x.Location Like b.Location||'%'"+
                      "            And x.Location_Type In ('BIN','BIN-ROUTE','BIN-REJECT')"+
                      "            And y.Div_No      = x.Div_No"+
                      "            And y.Schedule_Id ="+$rootScope.IC_0063_Schedule.id+
                      "            And y.Location_Id = x.Id"+
                      "            And y.Status      = 'TO-COUNT') To_Count_Locations,"+
                      "        (Select Count(0)"+
                      "           From Ic_Locations       x,"+
                      "                Ic_Count_Locations y"+
                      "          Where x.Div_No      = b.Div_No"+
                      "            And x.Location Like b.Location||'%'"+
                      "            And x.Location_Type In ('BIN','BIN-ROUTE','BIN-REJECT')"+
                      "            And y.Div_No      = x.Div_No"+
                      "            And y.Schedule_Id ="+$rootScope.IC_0063_Schedule.id+
                      "            And y.Location_Id = x.Id"+
                      "            And y.Status      = 'COUNTING') Counting_Locations,"+
                      "        (Select Count(0)"+
                      "           From Ic_Locations       x,"+
                      "                Ic_Count_Locations y"+
                      "          Where x.Div_No      = b.Div_No"+
                      "            And x.Location Like b.Location||'%'"+
                      "            And x.Location_Type In ('BIN','BIN-ROUTE','BIN-REJECT')"+
                      "            And y.Div_No      = x.Div_No"+
                      "            And y.Schedule_Id ="+$rootScope.IC_0063_Schedule.id+
                      "            And y.Location_Id = x.Id"+
                      "            And y.Status      = 'COUNTED') Counted_Locations,"+
                      "        (Select Count(0)"+
                      "           From Ic_Locations       x,"+
                      "                Ic_Count_Locations y"+
                      "          Where x.Div_No      = b.Div_No"+
                      "            And x.Location Like b.Location||'%'"+
                      "            And x.Location_Type In ('BIN','BIN-ROUTE','BIN-REJECT')"+
                      "            And y.Div_No      = x.Div_No"+
                      "            And y.Schedule_Id ="+$rootScope.IC_0063_Schedule.id+
                      "            And y.Location_Id = x.Id"+
                      "            And y.Status      = 'EMPTY') Empty_Locations,"+
                      "        (Select Assigned_To_Employee_Number "+
                      "           From Ic_Count_Locations "+
                      "          Where Div_No      = b.Div_No"+
                      "            And Schedule_Id ="+$rootScope.IC_0063_Schedule.id+
                      "            And Location_Id = b.Id) Assigned_To_Employee_Number,"+
                      "        (Select Counted_By_Employee_Number "+
                      "           From Ic_Count_Locations "+
                      "          Where Div_No      = b.Div_No"+
                      "            And Schedule_Id ="+$rootScope.IC_0063_Schedule.id+
                      "            And Location_Id = b.Id) Counted_By_Employee_Number,"+
                      "        (Select Status"+
                      "           From Ic_Count_Locations "+
                      "          Where Div_No      = b.Div_No"+
                      "            And Schedule_Id ="+$rootScope.IC_0063_Schedule.id+
                      "            And Location_Id = b.Id) Status"+
                      "  From Ic_Locations b"+
                      " Where (Null is Null)"+
                      "   And b.Div_No         = "+divNo+
                      "   And b.Active = 'Y'               "+
                      "   And b.Location_Type != 'EMPLOYEE'"+
                      " Connect By b.Id          = Prior b.Parent_Id"+
                      " Start With b.Id In (Select a.Location_Id "+
                      "                       From Ic_Count_Locations a "+
                      "                      Where a.Div_No      = "+divNo+
                      "                        And a.Schedule_Id = "+$rootScope.IC_0063_Schedule.id+")"+
                      " Group By b.Div_No, b.Id, b.Location_Type, b.Location"+
                      " Order By b.Location";
             var sqlArray = [{ queryStr: sql, queryType: "READ" }];
            var sqlString = JSON.stringify(sqlArray);
            WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                /*$rootScope.$broadcast('loading:show');
                var locations = angular.fromJson(dataIn[0].rows);
                var bindings    = [];
                var parameters  = [];
                var sqlLocations = "INSERT OR REPLACE INTO ic_count_locations (Id,            " +
                                   "                                           Schedule_Id,   " +
                                   "                                           Location_Id,   " +
                                   "                                           Location,      " +
                                   "                                           Location_Type, " +
                                   "                                           Div_No,        " +
                                   "                                           Status)        " +
                                   "VALUES (?,?,?,?,?,?,?);                                     ";
                for(var i=0; i<locations.length; i++) {
                    parameters = [locations[i].id,
                                  $rootScope.IC_0063_Schedule.id,
                                  locations[i].id,
                                  locations[i].location,
                                  locations[i].location_type,
                                  locations[i].div_no,
                                  locations[i].status];
                    bindings.push(parameters);
                }
                WingsTransactionDBService.insertCollection(sqlLocations,bindings).then(function (result){
                    getLocations();
                }, function (error) {
                    console.log(error);
                    $rootScope.$broadcast('loading:hide');
                });  */
                var locations = angular.fromJson(dataIn[0].rows);
                $scope.locations = [];
                var activePlant = -1;
                var activeStockRoom = -1;
                var activeColumn = -1;
                locations.forEach(function(element) {
                    if (element.location_type == 'PLANT') {
                        $scope.locations.push({
                            "name":element.location,
                            "id":element.location_id,
                            "type":element.location_type,
                            "status":element.status,
                            "toCount":element.to_count_locations,
                            "counting":element.counting_locations,
                            "counted":element.counted_locations,
                            "empty":element.empty_locations,
                            "childItems" : []
                        });
                        activePlant = activePlant+1
                        activeStockRoom = -1;
                        activeColumn = -1;
                    } else if (element.location_type == 'STOCKROOM') {
                        $scope.locations[activePlant].childItems.push({
                            "name":element.location,
                            "id":element.location_id,
                            "type":element.location_type,
                            "status":element.status,
                            "toCount":element.to_count_locations,
                            "counting":element.counting_locations,
                            "counted":element.counted_locations,
                            "empty":element.empty_locations,
                            "childItems" : []
                        });
                        activeStockRoom = activeStockRoom+1;
                        activeColumn = -1;
                    }else if (element.location_type == 'COLUMN') {
                        $scope.locations[activePlant].childItems[activeStockRoom].childItems.push({
                            "name":element.location,
                            "id":element.location_id,
                            "type":element.location_type,
                            "status":element.status,
                            "toCount":element.to_count_locations,
                            "counting":element.counting_locations,
                            "counted":element.counted_locations,
                            "empty":element.empty_locations,
                            "childItems" : []
                        });
                        activeColumn = activeColumn+1;
                    }/*else if (element.location_type == 'BIN') {
                        $scope.locations[activePlant].childItems[activeStockRoom].childItems[activeColumn].childItems.push({
                            "name":element.location,
                            "id":element.location_id,
                            "status":element.status,
                            "toCount":element.to_count_locations,
                            "counting":element.counting_locations,
                            "counted":element.counted_locations,
                            "empty":element.empty_locations,
                            "type":element.location_type
                        });
                    }*/
                });
                $scope.$broadcast('scroll.refreshComplete');
            }, function (error) {
            	$scope.$broadcast('scroll.refreshComplete');
            });
        };
        $scope.pullLocations();
        
        $scope.searchinLocation = function () {
            var key = $scope.IC_M063.searchKey;
            var a = _.remove($scope.locations, function(n) {
                return n.childItems.name.indexOf($scope.IC_M063.searchKey) == -1;
              });
        };
        
        $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
            $scope.slider = data.slider;
            $ionicSlideBoxDelegate.update();
        });
        
        $scope.$on("$ionicSlides.slideChangeStart", function(event, data){
            $timeout(function() {
                //This shit not working without timeout
                $scope.slider = data.slider;
           }, 100);
            if (data.slider.activeIndex == 1) {
                if (!WingsUtil.IsNull($scope.IC_M063_Count.location)) {
                    WingsUtil.Focus('tag');
                } else {
                    WingsUtil.Focus('location');
                }
            }
          });
        $scope.forwardCount = function (bin) {
            $scope.IC_M063_Count.location = bin.name;
            $scope.IC_M063_Count.locationId = bin.id;
            $scope.slider.slideTo(2, 200);
            //WingsUtil.Focus('tag');
        }
        
        $scope.togglePlant = function(plant) {
            if ($scope.isPlantShown(plant)) {
              $scope.shownPlant = null;
              $scope.shownStockroom = null;
              $scope.shownColumn = null;
            } else {
              $scope.shownPlant = plant;
            }
            $timeout(function() {
                //This shit not working without timeout
                var initHeight = window.innerHeight;
                var itemHeight = $("#IC_M063_location")[0].children[0].clientHeight;
                if (initHeight > itemHeight) {
                    $scope.slideHeight = initHeight;
                } else {
                    $scope.slideHeight = itemHeight+200;
                }
           }, 300);
            // $ionicScrollDelegate.resize();
          }

          $scope.toggleStockroom = function(stockroom) {
            if ($scope.isStockroomShown(stockroom)) {
              $scope.shownStockroom = null;
              $scope.shownColumn = null;
            } else {
              $scope.shownStockroom = stockroom;
            }
            $timeout(function() {
                //This shit not working without timeout
                var initHeight = window.innerHeight;
                var itemHeight = $("#IC_M063_location")[0].children[0].clientHeight;
                if (initHeight > itemHeight) {
                    $scope.slideHeight = initHeight;
                } else {
                    $scope.slideHeight = itemHeight+200;
                }
           }, 300);
            // $ionicScrollDelegate.resize();
          }
          $scope.toggleColumn = function(column) {
              if ($scope.isColumnShown(column)) {
                $scope.shownColumn = null;
              } else {
                $scope.shownColumn = column;
              }
              $timeout(function() {
                  //This shit not working without timeout
                  var initHeight = window.innerHeight;
                  var itemHeight = $("#IC_M063_location")[0].children[0].clientHeight;
                  if (initHeight > itemHeight) {
                      $scope.slideHeight = initHeight;
                  } else {
                      $scope.slideHeight = itemHeight+200;
                  }
             }, 300);
              // $ionicScrollDelegate.resize();
            }
          $scope.isPlantShown = function(plant) {
            return $scope.shownPlant === plant;
          }

          $scope.isStockroomShown = function(stockroom) {
            return $scope.shownStockroom === stockroom;
          }
          $scope.isColumnShown = function(column) {
              return $scope.shownColumn === column;
          };

//COUNT SLIDE
          $scope.IC_M063_Count = {
                  locationId:'',
                  quantity:'',
                  tag:'',
                  locationStatus:'',
                  locationType:''};

          $scope.IC_M063_editTag = {
                  serial_number:'',
                  lot_number:'',
                  expire_date:'',
                  customer_number:'',
                  form_number:'',
                  condition_code:'',
                  program_code:'',
                  applicable_standart:'',
                  shelf_life:''};
          
          $scope.showModal = function (action) {
              if (WingsUtil.IsNull($scope.IC_M063_Count.tag)) {
                  var text = 'Tag is required.';
                  WingsDialogService.error(text);
                  return false;
              }
              $scope.modal.show();
              $scope.resetEditTag();
          };

          $ionicModal.fromTemplateUrl('templates/edit.html', {
              scope: $scope
          }).then(function(modal) {
              $scope.modal = modal;
          });
          $ionicPopover.fromTemplateUrl('templates/popover.html', {
              scope: $scope,
          }).then(function(popover) {
              $scope.popover = popover;
          });

          $scope.openPopover = function($event) {
              if (!WingsUtil.IsNull($scope.IC_M063_Count.locationId) && WingsUtil.IsNull($scope.IC_M063_Count.tag)&& WingsUtil.IsNull($scope.IC_M063_Count.quantity)) {
                  $scope.popover.show($event);
              }
          };

          $scope.scanBarcode = function (scanObj) {
              $cordovaBarcodeScanner.scan().then(function(barcodeData) {
                    if(barcodeData.text == '') {
                      return false;
                    }
                    WingsUtil.Log(barcodeData.text);
                    barcodeData.text = barcodeData.text.replace("*","");
                    if (scanObj == 'tag') {
                        $scope.IC_M063_Count.tag = Number(barcodeData.text.substring(1))
                        $scope.pullAllocation();
                        $scope.scanObj = 'location';
                        WingsUtil.Focus('quantity');
                    } else if(scanObj == 'location') {
                        $scope.IC_M063_Count.locationId = barcodeData.text.substring(1);
                        $scope.IC_M063_Count.location = getLocation(barcodeData.text.substring(1));
                        //$scope.getLocationByName();
                    }
                }, function(error) {
                    WingsUtil.Log('Error',error);
                });
          };
          $scope.setScanObj = function (obj) {
              $scope.scanObj = obj;
          };
          $scope.changedQty = function () {
              var max_chars = 8;
              if(String($scope.IC_M063_Count.quantity).length > max_chars) {
                  $scope.IC_M063_Count.quantity = Number(String($scope.IC_M063_Count.quantity).substr(0, max_chars));
              } 
          };
          function getLocation (id) {
              var sql = "Select Location,     " +
                        "       location_type"+
                        "  From ic_locations " +
                        " Where id = "+id;
              var sqlArray = [{ queryStr: sql, queryType: "READ" }];
              var sqlString = JSON.stringify(sqlArray);
              WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                  $scope.IC_M063_Count.location = angular.fromJson(dataIn[0].rows)[0].location;  
                  $scope.IC_M063_Count.locationType =  angular.fromJson(dataIn[0].rows)[0].location_type;  
              }, function (error) {});
          };

          $scope.getLocationByName = function () {
              if (WingsUtil.IsNull($scope.IC_M063_Count.location)) {
                  return false;
              }
              var sql = "Select id,                                            " +
                        "       location_type                                  " +
                        "  From ic_locations                                   " +
                        " Where location = '"+$scope.IC_M063_Count.location+"' ";
              var sqlArray = [{ queryStr: sql, queryType: "READ" }];
              var sqlString = JSON.stringify(sqlArray);
              WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                  var rows = angular.fromJson(dataIn[0].rows);
                  if(rows.length > 0) {
                      $scope.IC_M063_Count.locationId = rows[0].id; 
                      $scope.IC_M063_Count.locationType = rows[0].location_type;  
                  } else {
                      WingsDialogService.error('Invalid Location.');
                  }
              }, function (error) {});              
          };

          $scope.pullAllocation = function () {
              if(WingsUtil.IsNull($scope.IC_M063_Count.tag)) {
                  return false;
              }
              var sql = "Select Part_Number,           " +
                        "       Serial_Number,         " +
                        "       Lot_Number,            " +
                        "       Location,              " +
                        "       Location_Id,           " +
                        "       Customer_Name,         " +
                        "       To_Date(Expire_Date,'YYYY-MM-DD') expire_date, " +
                        "       Expiration_Flag,       " +
                        "       Status,                " +
                        "       Condition_Code,        " +
                        "       Id                     " +
                        "  From ic_allocations_v       " +
                        " Where Tag_Number = "+$scope.IC_M063_Count.tag;
              var sqlArray = [{ queryStr: sql, queryType: "READ" }];
              var sqlString = JSON.stringify(sqlArray);
              WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                  var rows = angular.fromJson(dataIn[0].rows);
                  if(rows.length > 0) {
                      $scope.allocation = rows[0];  
                  } else {
                      WingsDialogService.error('Invalid program code.');
                  }
              }, function (error) {});
          };
          $scope.pushAllocation = function (iWhat,locationStatus){
              $scope.popover.hide();
              $scope.modal.hide();
              if(!WingsUtil.IsNull(locationStatus)) {
                  $scope.IC_M063_Count.locationStatus = locationStatus;
              }
              var text = '';
              if(!WingsUtil.IsNull()) {
                  if (WingsUtil.IsNull($scope.IC_M063_Count.tag) || WingsUtil.IsNull($scope.IC_M063_Count.quantity)) {
                      var text = 'Tag and Quantity is required.';
                      WingsDialogService.error(text);
                  }
              }
              var userId = $rootScope.globals.currentUser.userNumber;
              var divNo  = $rootScope.globals.currentUser.divNo;
              var myBuilder = new StoredFuncProcBuilder('Mb_Apps.Count_Allocation',
                                                        'i_Div_No',              divNo,
                                                        'i_Action',              iWhat,
                                                        'i_Schedule_Id',         $rootScope.IC_0063_Schedule.id,
                                                        'i_Location_Id',         $scope.IC_M063_Count.locationId,
                                                        'i_Tag_Number',          WingsUtil.IsNull($scope.IC_M063_Count.tag)?'':$scope.IC_M063_Count.tag,
                                                        'i_Quantity',            WingsUtil.IsNull($scope.IC_M063_Count.quantity)?'':$scope.IC_M063_Count.quantity,
                                                        'i_Location_Status',     $scope.IC_M063_Count.locationStatus);

              var myFuncArray = [myBuilder.queryObject()];
              var strSql = JSON.stringify(myFuncArray);
              WingsRemoteDbService.executeFunction(strSql).then(function (dataIn) {
                  dataIn[0] = JSON.parse(dataIn[0]);
                  if (dataIn[0].isSuccess =='true'  && dataIn[0].errorText == '') {
                      WingsRemoteDbService.HandleFeedback(dataIn[0]);
                      $scope.IC_M063_Count.tag = '';
                      $scope.IC_M063_Count.quantity = '';
                      $scope.IC_M063_Count.locationStatus = '';
                      $scope.IC_M063_Count.locationType = '';
                      $scope.allocation = undefined;
                      $timeout(function() {
                          //This shit not working without timeout
                          $scope.pullLocations();
                     }, 500);
                  } else {
                      WingsRemoteDbService.HandleFeedback(dataIn[0]);
                  }
              }, function (response) {
                  WingsUtil.Log("ERROR " + response.status +" MESSAGE : "+response.message);
              });
          };
          $scope.modifyTag = function (iWhat,locationStatus){
              var text = '';
              if (WingsUtil.IsNull($scope.IC_M063_Count.location) || WingsUtil.IsNull($scope.IC_M063_Count.tag)) {
                  var text = 'Locationa and Tag are required.';
                  WingsDialogService.error(text);
                  return false;
              }
              var userId = $rootScope.globals.currentUser.userNumber;
              var divNo  = $rootScope.globals.currentUser.divNo;
              var myBuilder = new StoredFuncProcBuilder('Mb_Apps.Count_Allocation',
                                                        'i_Div_No',              divNo,
                                                        'i_Action',              iWhat,
                                                        'i_Schedule_Id',         $rootScope.IC_0063_Schedule.id,
                                                        'i_Location_Id',         $scope.IC_M063_Count.locationId,
                                                        'i_Tag_Number',          $scope.IC_M063_Count.tag,
                                                        'i_Condition_Code',      $scope.IC_M063_editTag.condition_code.toUpperCase(),
                                                        'i_Customer_Number',     String($scope.IC_M063_editTag.customer_number).toUpperCase(),
                                                        'i_Serial_Number',       $scope.IC_M063_editTag.serial_number.toUpperCase(),
                                                        'i_Program_Code',        $scope.IC_M063_editTag.program_code.toUpperCase(),
                                                        'i_Lot_Number',          $scope.IC_M063_editTag.lot_number.toUpperCase(),
                                                        'i_Expire_Date',         WingsUtil.IsNull($scope.IC_M063_editTag.expire_date)?'':moment($scope.IC_M063_editTag.expire_date).format('YYYY-MM-DD'),
                                                        'i_Shelf_Life',          $scope.IC_M063_editTag.shelf_life.toUpperCase(),
                                                        'i_Applicable_Standard', WingsUtil.IsNull($scope.IC_M063_editTag.applicable_standard)?'':String($scope.IC_M063_editTag.applicable_standard).toUpperCase(),
                                                        'i_Form_Number',         $scope.IC_M063_editTag.form_number.toUpperCase());

                      var myFuncArray = [myBuilder.queryObject()];
                      var strSql = JSON.stringify(myFuncArray);
                      WingsRemoteDbService.executeFunction(strSql).then(function (dataIn) {
                          dataIn[0] = JSON.parse(dataIn[0]);
                          if (dataIn[0].isSuccess =='true'  && dataIn[0].errorText == '') {
                              WingsRemoteDbService.HandleFeedback(dataIn[0]);
                              $scope.modal.hide();
                              $scope.pullAllocation();
                          } else {
                              WingsRemoteDbService.HandleFeedback(dataIn[0]);
                          }
                      }, function (response) {
                          WingsUtil.Log("ERROR " + response.status +" MESSAGE : "+response.message);
                      });
                 // }
            //  });
          };
          $scope.IC_M065={};

          $scope.changedTag = function () {
              if(WingsUtil.IsNull($scope.IC_M063_Count.tag)) {
                  $scope.allocation = undefined;
                  $scope.IC_M063_Count.quantity = '';
              }
          };
          
          $ionicPlatform.onHardwareBackButton(function () {
              if ($state.is('#.#')) { // here to check whether the home page, if yes, exit the application
                  AlertService.Confirm('System warning', 'are you sure you want to exit?',
                      function() {
                          navigator.app.exitApp();
                      },
                      function() {
                          return;
                      });
              }
          });
          var oldSoftBack = $rootScope.$ionicGoBack;
          $rootScope.$ionicGoBack = function() {
              WingsDialogService.confirm("Do you want to go back?",'Confirm','OK,Cancel').then(function(buttonIndex) {
                  if (buttonIndex == 1) {
                      $rootScope.$ionicGoBack = function() {
                          $ionicHistory.goBack();
                      };
                      $ionicHistory.goBack();
                  }
              });
          };
          $ionicPlatform.registerBackButtonAction(function (event) {
        	  WingsDialogService.confirm("Do you want to go back?",'Confirm','OK,Cancel').then(function(buttonIndex) {
                  if (buttonIndex == 1) {
                      $rootScope.$ionicGoBack = function() {
                          $ionicHistory.goBack();
                      };
                      $ionicHistory.goBack();
                  }
              });
		      }, 100);
          $scope.reset = function(){
              $scope.IC_M063_Count.locationId = '';
              $scope.IC_M063_Count.location = '';
              $scope.IC_M063_Count.locationType = '';
              $scope.IC_M063_Count.quantity = '';
              $scope.IC_M063_Count.tag = '';
              $scope.allocation = undefined;
          };

          $scope.resetEditTag = function(){
              $scope.IC_M063_editTag = {
                      serial_number:'',
                      lot_number:'',
                      expire_date:'',
                      customer_number:'',
                      form_number:'',
                      condition_code:'',
                      program_code:'',
                      applicable_standart:'',
                      shelf_life:''};
          };
    } 
])