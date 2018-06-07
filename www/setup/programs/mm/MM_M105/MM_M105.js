angular.module('WingsMobileStarter').controller('MM_M105', [
		'$scope', 		'$ionicPopup',
		function($scope, $ionicPopup) {


		    $scope.name = 'World';
		  $scope.getNumber = function(num) {
		    return new Array(parseInt(num, 10));
		};
		  
		   $scope.getTimes=function(n){
		     return new Array(n);
		   };

		     $scope.btns = [{
		         label: "Handset not possible to stow",
		         state: false
		     }, {
		         label: "Handset damaged",
		         state: false
		     }, {
		         label: "Handset keyboard damaged",
		         state: false
		     }, {
		         label: "Handset display inop",
		         state: false
		     }, {
		         label: "Handset housing damaged",
		         state: false
		     }, {
		         label: "Handset cable torn",
		         state: false
		     }, {
		         label: "Handset cable roll up inop",
		         state: false
		     }, {
		         label: "Earphone-jack clogged",
		         state: false
		     }, {
		         label: "Earphone-jack mono only",
		         state: false
		     }, {
		         label: "Earphone-jack no audio",
		         state: false
		     }, {
		         label: "Earphone-jack not in position",
		         state: false
		     },     ];
		     $scope.toggle = function () {
		         this.b.state = !this.b.state;
		     };
		     
		     
		   // An alert dialog
		   $scope.showAlert = function(num,lt) {
		     
		     var x = 10;
		     var alertPopup = $ionicPopup.show({
		       title: num + '' + lt + ' ',
		       template: '<ion-list>'+
		       
		       '<ion-item ng-click="" >Seats</ion-item>'+
		       '<ion-item ng-click="">IFE</ion-item>'+
		       '<ion-item ng-click="">Lights</ion-item>'+
		       '<ion-item ng-click="">Doors</ion-item>'+
		       '<ion-item ng-click="">FAP</ion-item>'+
		       '<ion-item ng-click="">Overhead Bin</ion-item>'+
		       '<ion-item ng-click="">MCD</ion-item>'+
		      ' </ion-list>' ,
		      buttons: [ 		                {text: 'Cancel'}]
		             
		    	   
		    	   
		     });
		
		     
		     alertPopup.then(function(res) {
		     });
		   };
			
			
			
			
			
		}
		])
		
		