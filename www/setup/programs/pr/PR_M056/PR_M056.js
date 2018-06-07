angular.module('WingsMobileStarter').controller('PR_M056', [
    '$scope',
    'WingsRemoteDbService',
    '$cordovaBarcodeScanner',
    '$rootScope',
    '$ionicHistory',
    '$cordovaVibration',
    'pr',
    'WingsDialogService',
    'WingsUtil',
    'WingsTransactionDBService',
    function($scope,WingsRemoteDbService,$cordovaBarcodeScanner,$rootScope,$ionicHistory,$cordovaVibration,pr,WingsDialogService,WingsUtil,WingsTransactionDBService) {
        console.log("PR_M056");
        
        $scope.populateWorkCard = function(workCard){
        	if (workCard.ID == '' && workCard.WORK_CARD_NUMBER == '') return;
        	pr.PopulateWorkCard(workCard).then(function(card){
        		$scope.card = card;
        	},function(err){
        		console.log(err);
				WingsDialogService.error(err);
        	})
        };

        if ($rootScope.prWorkcard){
        	$scope.populateWorkCard($rootScope.prWorkcard);
        }else{
        	 WingsUtil.Focus('WORK_CARD_NUMBER');
        }
        
    } 
])