angular.module('WingsMobileStarter').controller('TM_M051.Shipment', [
    '$scope',
    'WingsRemoteDbService',
    'WINGS_CONFIG',
    function($scope,WingsRemoteDbService,WINGS_CONFIG) {
        console.log("TM_M051-Shipment");   
        $scope.shipmentDetail = $rootScope.TM_M051_Details;
        $scope.parts = [];
        $scope.isDataShown = true;
        $scope.isAttachmentShown = true;
        $rootScope.SY_0002 = {};
        $rootScope.SY_0002.savedFiles = [];

        $scope.toggle = function(prop) {
            eval("$scope."+ prop +"="+"!$scope."+ prop );
        };
        
        $scope.upload = function(id) {
            console.log('Uploading start');
            var options = {
                fileName: "test01.jpg",
                chunkedMode: true,
                mimeType: "image/jpg",
                params :{
                    ParentName:'TM_SHIPMENTS',
                    ParentId: id,
                    ImageType:'DELIVERY'
                }
            };
            for (var i = 0;i<$rootScope.SY_0002.savedFiles.length;i++) {
                $cordovaFileTransfer.upload(WINGS_CONFIG.MEDIATOR_URL+"/fileservice/doattachment", $rootScope.SY_0002.savedFiles[i], options).then(function(result) {
                    console.log("SUCCESS: " + JSON.stringify(result.response));
                }, function(err) {
                    console.log("ERROR: " + JSON.stringify(err));
                }, function (progress) {
                    // constant progress updates
                });
            }
       };
        $scope.AddAttachment = function () {
            $state.go('app.SY_M002',{uploadOptions: {}});
        };

        $scope.pullParts = function (criteria) {
            var divNo = $rootScope.globals.currentUser.divNo;
            var sql = "Select Part_Number,          " +
                      "       Description,          " +
                      "       Quantity,             " +
                      "       Order_Number          " +
                      "  From Tm_Shipment_Lines_v   " +
                      " Where (Null is Null)        " +
                      "   And Div_No = "+divNo        +
                      "   And Shipment_Id ="+criteria ;

            var sqlArray = [{ queryStr: sql, queryType: "READ" }];
            var sqlString = JSON.stringify(sqlArray);
            WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                $scope.parts  = angular.fromJson(dataIn[0].rows);
                $timeout(function(){
                    $('table').trigger('footable_redraw');                           
                },1);
            }, function (error) {
                console.log("ERROR: "+error);
            });
        };

        $scope.deliverShipment = function(Id){
            var userId = $rootScope.globals.currentUser.userNumber;
            var divNo  = $rootScope.globals.currentUser.divNo;
            var myBuilder = new StoredFuncProcBuilder('Tm_Apps.Do_Shipment',
                                                      'i_Div_No',                       divNo,
                                                      'i_Action',                       'VALIDATE-DELIVER|DELIVER',
                                                      'i_Shipment_Id',                  Id,
                                                      'i_Processed_By_Employee_Number', userId);

            var myFuncArray = [myBuilder.queryObject()];
            var strSql = JSON.stringify(myFuncArray);
            WingsRemoteDbService.executeFunction(strSql).then(function (dataIn) {
                dataIn[0] = JSON.parse(dataIn[0]);
                if (dataIn[0].isSuccess) {
                    $scope.upload(Id);
                    WingsRemoteDbService.HandleFeedback(dataIn[0]);
                    $rootScope.$emit('onDeliverShipment');
                    $timeout(function(){
                        $state.go('app.TM_M051');
                    },100);
                } else {
                    WingsRemoteDbService.HandleFeedback(dataIn[0]);
                }
            }, function (response) {
                console.log("ERROR " + response.status +" MESSAGE : "+response.message);
            });
        };

        $scope.pullParts($scope.shipmentDetail.id);    
    }
])