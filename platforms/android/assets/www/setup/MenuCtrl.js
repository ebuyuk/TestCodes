angular.module('WingsMobileStarter').controller('MenuCtrl', [
		'$scope',
		'WingsGlobalManager',
		'$location',
		'$ionicPopover',
		'WingsRemoteDbService',
		'WingsSessionManager',
		'$ionicHistory',
		'$timeout',
		'$ionicModal',
		'WingsAuthService',
		'WingsDialogService',
		'sy',
		function($scope,WingsGlobalManager,$location,$ionicPopover,WingsRemoteDbService,WingsSessionManager,$ionicHistory,$timeout,$ionicModal,WingsAuthService,WingsDialogService,sy) {
			
			$scope.fetchRolePrograms = function (roleId){
				$rootScope.globals.currentUser.roleId = roleId;
				WingsAuthService.fetchRolePrograms(roleId);
				sy.LoadSecurity();
			};
			$scope.openMessages = function() {
				 $state.go('app.SY_M013');
			};
			$scope.openSettings = function(){
				$state.go('app.SY_M004');
			};
			$scope.signOut = function() {
				WingsGlobalManager.ClearCredentials();
				 // $scope.closePopover ();
				//  $ionicHistory.clearCache();
				
				/*$timeout(function() {
				   $ionicHistory.clearCache();
				    //$ionicHistory.clearHistory();
				}, 100);*/

				/*
				$timeout(function() {
					$location.path('/');
				}, 200);*/
				if(WingsSetupDB){
					WingsSetupDB.close(function() {
					    console.log('Wings Setup database is closed ok');
				    });
				}else{
					console.log('Wings Setup database is not open at all');
				}
				if(WingsTransactionDB){
					WingsTransactionDB.close(function() {
					    console.log('Wings Transaction database is closed ok');
				    });
				}else{
					console.log('Wings Transaction database is not open at all');
				}
				  
				
				$timeout(function() {
			        //$ionicHistory.clearCache();
			         //$ionicHistory.clearHistory();
			         $ionicHistory.clearCache().then(function(){ 
			          
			          $ionicHistory.clearHistory();
			          $state.go('signin'); })
			         
			     }, 300);
				// $state.go('signin');
			};
		} 
])