angular.module('WingsMobileStarter').controller('TM_M051', [
    '$scope',
    'WingsRemoteDbService',
    '$cordovaBarcodeScanner',
    '$rootScope',
    function($scope,WingsRemoteDbService,$cordovaBarcodeScanner,$rootScope) {
        console.log("TM_M051");
        $scope.shipments = [];
        $scope.searchCriteria = "";

        $scope.showShipment = function (shiptment){
            $rootScope.sc = $scope.strcolor;
            $rootScope.TM_M051_Details = {};
            $rootScope.TM_M051_Details = shiptment;
            $state.go('app.TM_M051_Shipment');
        };

        $scope.pullShipments = function (criteria) {
            criteria = criteria.toUpperCase();
            var userId =$rootScope.globals.currentUser.userId;
            var divNo = $rootScope.globals.currentUser.divNo;
            var sql = "Select Shipment_Number,                               " +
                      "       Id,                                            " +
                      "       From_Station,                                  " +
                      "       To_Station,                                    " +
                      "       Master_Airwaybill,                             " +
                      "       House_Airwaybill,                              " +
                      "       Carrier,                                       " +
                      "       Status                                         " +
                      "  From Tm_Shipments                                   " +
                      " Where (Null is Null)                                 " +
                      "   And Div_No                 = "+divNo                 +
                      "   And Status        Not In ('COMPLETED','CANCELLED') " +
                      "   And (From_Station      Like '%"+criteria+"%' Or    " +
                      "        To_Station        Like '%"+criteria+"%' Or    " +
                      "        Master_Airwaybill Like '%"+criteria+"%' Or    " +
                      "        House_Airwaybill  Like '%"+criteria+"%')      " +
                      " Order By Id desc                                     ";

            var sqlArray = [{ queryStr: sql, queryType: "READ" }];
            var sqlString = JSON.stringify(sqlArray);
            WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                $scope.shipments = angular.fromJson(dataIn[0].rows);  
                $scope.searchCriteria = "";
                $scope.$broadcast('scroll.refreshComplete');
                $(':focus').blur();
            }, function (error) {$scope.$broadcast('scroll.refreshComplete');});
        };

        $rootScope.$on('onDeliverShipment', function(){
            $scope.searchCriteria = "";
            $scope.pullShipments($scope.searchCriteria);
        });

        $scope.scanBarcode = function () {
            $cordovaBarcodeScanner.scan().then(function(barcodeData) {
                barcodeData.text = barcodeData.text.replace("*","");
                $scope.searchCriteria = barcodeData.text;
                $scope.pullShipments(barcodeData.text);
              }, function(error) {
                  console.log('Error',error);
              });
        };

        //$scope.pullShipments($scope.searchCriteria);
    } 
])