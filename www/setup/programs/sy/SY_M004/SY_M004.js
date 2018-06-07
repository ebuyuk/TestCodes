angular.module('WingsMobileStarter').controller('SY_M004', [
        '$scope',
        'WingsDialogService',
        'WingsUtil',
        'WingsConfigurationDBService',
        '$ionicHistory',
        function($scope,WingsDialogService,WingsUtil,WingsConfigurationDBService,$ionicHistory) {
        	console.log('SY_M004');
        	$scope.environment = {
        		tailNumber : '',
        		station :''
        	};
            
            $scope.getEnvironmentValues = function(){
            	//var query = "SELECT * FROM SY_ENVIRONMENT where symbol IN ('TAIL_NUMBER') order by symbol asc ";
            	var query = "SELECT * FROM SY_ENVIRONMENT where symbol in ('TAIL_NUMBER','STATION')";
                WingsConfigurationDBService.executeSql(query, []).then(function(result) {
                	 _.forEach(result, function(n) {
          					if (n.SYMBOL == "TAIL_NUMBER") {
          						$rootScope.globals.deviceInformation.tailNumber = n.VALUE;
          						$scope.environment.tailNumber = n.VALUE;
          					} else if (n.SYMBOL == "STATION") {
          						$rootScope.globals.deviceInformation.station = n.VALUE;
              					$scope.environment.station = n.VALUE;
          					}
          			   }); 
            }, function(error) {
                console.log(JSON.stringify(error));
                WingsDialogService.error(JSON.stringify(error));
            });
        };
            $scope.setEnvironmentValues = function(){
                var sql = "UPDATE SY_ENVIRONMENT SET value='"+$scope.environment.tailNumber.toUpperCase()+"' WHERE symbol='TAIL_NUMBER'";
                var sql2 = "UPDATE SY_ENVIRONMENT SET value='"+$scope.environment.station.toUpperCase()+"' WHERE symbol='STATION'";
                WingsConfigurationDBService.executeSql(sql2, []);
            	$rootScope.globals.deviceInformation.tailNumber = $scope.environment.station.toUpperCase();
                WingsConfigurationDBService.executeSql(sql, []).then(function(result) {
                	$rootScope.globals.deviceInformation.tailNumber = $scope.environment.tailNumber.toUpperCase();
                	WingsDialogService.success();
            }, function(error) {
                console.log(JSON.stringify(error));
                WingsDialogService.error(JSON.stringify(error));
            });
            };
            $scope.cancelSettings = function (){
            	$ionicHistory.goBack();
            };
            $scope.getEnvironmentValues();
            
            
        } 
])