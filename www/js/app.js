var injectList =[
                 'wings.mobile.controllers.signincontroller',
                 'wings.mobile.modules.Auth',
                 'wings.mobile.modules.RemoteDb',
                 'wings.mobile.modules.RemoteFile',
                 'wings.mobile.modules.ConfigurationDB',
                 'wings.mobile.modules.TransactionDB',
                 'wings.mobile.modules.SetupDB',
                 'wings.mobile.modules.LocalNotification',
                 'wings.mobile.modules.LocalFile',
                 'wings.mobile.modules.ApplicationUpdate',
                 'wings.mobile.modules.Logging',
                 'wings.mobile.modules.Interceptors',
                 'wings.mobile.modules.Network',
                 'wings.mobile.modules.GlobalsAndSession',
                 'wings.mobile.modules.Dialog',
                 'wings.mobile.modules.ContextMenu',
                 'wings.mobile.modules.Socket',
                 'wings.mobile.modules.PouchDBW',
                 'wings.mobile.modules.WingsUtil',
                 'wings.mobile.controllers.pr',
                 'wings.mobile.controllers.lb',
                 'wings.mobile.controllers.sy',
                 'wings.mobile.filters',
                 'ionic', 
                 'formlyIonic',
                 'ngCordova',
                 'restangular',
                 'base64',
                 'ngStorage',
                 'ui.footable',
                 'ionic-modal-select',
                 'ion-floating-menu',
                 'angular-md5',
                 'ionMdInput',
                 'angular-flexslider',
                 'ionic.cloud'];
var WingsConfigurationDB   =null; 
var WingsSetupDB=null; 
var WingsTransactionDB=null;

var wingsMobileApp = angular.module('WingsMobileStarter', injectList);
var WingsGlobalControllerProvider = null;
var WingsGlobalStateProviderRef = null;
var $urlRouterProviderRef = null;
var WingsGlobalProvideRef = null;
var WingsGlobalRestangularProviderRef=null;

wingsMobileApp.run(function($ionicPlatform,$rootScope,$ionicLoading,$cordovaSQLite,WingsLocalNotificationService,
		WingsNetworkService,WINGS_CONFIG,WingsLocalFileService,WingsApplicationUpdateService,$cordovaPreferences,$timeout,
		$cordovaStatusbar,$cordovaDevice,WingsSocketService,$window) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
	//$cordovaStatusbar.styleHex('#11c1f3');
	 // $cordovaStatusbar.styleColor('white');

    if (window.StatusBar) {
        //org.apache.cordova.statusbar required
    	if(ionic.Platform.isIOS()) {
    		StatusBar.hide();
    	}
        StatusBar.styleLightContent();
    }
    $rootScope.$on('loading:show', function() {
        $ionicLoading.show({
            noBackdrop: true,
            template: '<p class="item-icon-left" style="border-radius: 0;padding:16px;">Processing...<ion-spinner icon="lines"/></p>',
            delay: 500
          })
    });

    $rootScope.$on('loading:hide', function() {
        $ionicLoading.hide();
    });

    $rootScope.$on('downloading:show', function() {
        $ionicLoading.show({
            noBackdrop: true,
            template: '<p class="item-icon-left" style="border-radius: 0;padding:16px;">Downloading...<ion-spinner icon="lines"/></p>',
            delay: 2000

          })
    });

    $rootScope.$on('downloading:hide', function() {
        $ionicLoading.hide();
    });
    
    $rootScope.$on('extracting:show', function() {
        $ionicLoading.show({
            noBackdrop: true,
            template: '<p class="item-icon-left" style="border-radius: 0;padding:16px;">Extracting...<ion-spinner icon="lines"/></p>'
          })
    });


    $rootScope.$on('extracting:hide', function() {
        $ionicLoading.hide();
    });

    $rootScope.$on('logging:show', function() {
        $ionicLoading.show({
            noBackdrop: true,
            template: '<p class="item-icon-left" style="border-radius: 0;padding:16px;">Logging in...<ion-spinner icon="lines"/></p>',
            delay: 2000

          })
    });

    $rootScope.$on('logging:hide', function() {
        $ionicLoading.hide();
    });

    $rootScope.$on('restarting:show', function() {
        $ionicLoading.show({
            noBackdrop: true,
            template: '<p class="item-icon-left" style="border-radius: 0;padding:16px;">Restarting...<ion-spinner icon="lines"/></p>',
            duration: 2000
          })
    });

    $rootScope.$on('synchronizing:show', function() {
        $ionicLoading.show({
            noBackdrop: false,
            template: '<p class="item-icon-left" style="border-radius: 0;padding:16px;">Synchronizing...<ion-spinner icon="lines"/></p>',
            delay: 1000

          })
    });

    $rootScope.$on('synchronizing:hide', function() {
        $ionicLoading.hide();
    }); 
    $rootScope.$on('firstuse:show', function() {
        $ionicLoading.show({
            noBackdrop : true,
            template   : '<p class="item-icon-left" style="border-radius: 0;padding:16px;">Wings Mobile is preparing your device for first use...<ion-spinner icon="lines"/></p>',
            delay      : 1000
          })
    });

    $rootScope.$on('firstuse:hide', function() {
        $ionicLoading.hide();
    }); 
    //handle Cordova resume (enter foreground) and pause (enter background events)
      $ionicPlatform.on('resume', function() {
       var currentdate = new Date(); 
       var datetime = "Last Sync: " + currentdate.getDate() + "/"
                       + (currentdate.getMonth()+1)  + "/" 
                       + currentdate.getFullYear() + " @ "  
                       + currentdate.getHours() + ":"  
                       + currentdate.getMinutes() + ":" 
                       + currentdate.getSeconds();
       console.log(datetime+ " APPLICATION RESUME");
      });

      $ionicPlatform.on('pause', function() {
       var currentdate = new Date(); 
         var datetime = "Last Sync: " + currentdate.getDate() + "/"
                         + (currentdate.getMonth()+1)  + "/" 
                         + currentdate.getFullYear() + " @ "  
                         + currentdate.getHours() + ":"  
                         + currentdate.getMinutes() + ":" 
                         + currentdate.getSeconds();
       console.log(datetime+ " APPLICATION PAUSED");
      });
      
      
      
      if(WINGS_CONFIG.ONDEVICE_TEST){
			$timeout(function() {
					
				// Check whether or not WingsConfigDb already copied
				WingsApplicationUpdateService.isWingsConfigDbFileExist().then(function (success) {
		    		console.log("NOT COPY CONFIG DB");
		    		WingsConfigurationDB = $window.sqlitePlugin.openDatabase($rootScope.globals.wingsConfigurationDB.sqlliteOpenOptions,
		    	        function () {
	                        $rootScope.$broadcast('DBSOpened');
	                    },
	                    function () {
	                        console.log('ERROR TO OPEN CONFIG DB')
	                    });
		    		
		    		//WingsConfigurationDB = $cordovaSQLite.openDB($rootScope.globals.wingsConfigurationDB.sqlliteOpenOptions).then();
		         }, function (error) {
		        	 console.log("COPY CONFIG DB");
		        	
		        	 window.plugins.sqlDB.copy($rootScope.globals.wingsConfigurationDB.name, $rootScope.globals.wingsConfigurationDB.dbcopyLocation,function() {
		        		 WingsConfigurationDB = $window.sqlitePlugin.openDatabase($rootScope.globals.wingsConfigurationDB.sqlliteOpenOptions,
		 		    	        function () {
		 	                        $rootScope.$broadcast('DBSOpened');
		 	                    },
		 	                    function () {
		 	                        console.log('ERROR TO OPEN CONFIG DB')
		 	                    });
		       			 console.log("CONFIG DB COPY SUCCESS - "+ JSON.stringify(WingsConfigurationDB));
		       	        }, function(error) {
		       	         console.log("CONFIG DB COPY ERROR - "+ JSON.stringify(error));
	       	         });
		        });
				WingsApplicationUpdateService.isWingsTransactionDbFileExist().then(function (success) {
                    $rootScope.$broadcast('DBSOpened');
				}, function (error) {
		        	 console.log("COPY TRANSACTION DB");
				});
				 
			}, 500);
			$timeout(function() {
				 $rootScope.globals.deviceInformation.device = $cordovaDevice.getDevice();
			        $rootScope.globals.deviceInformation.cordova = $cordovaDevice.getCordova();
			        $rootScope.globals.deviceInformation.model = $cordovaDevice.getModel();
			        $rootScope.globals.deviceInformation.platform = $cordovaDevice.getPlatform();
			        $rootScope.globals.deviceInformation.uuid = $cordovaDevice.getUUID();
			        $rootScope.globals.deviceInformation.version = $cordovaDevice.getVersion();
			        WingsLocalNotificationService.registerListeners();
			}, 500);
	      WingsNetworkService.init();
	      WingsLocalFileService.init();
	  }
  });
})

.config(['$stateProvider',
		 '$urlRouterProvider',
		 'RestangularProvider',
		 '$httpProvider',
		// 'WINGS_CONFIG',
		 '$provide',
		 '$controllerProvider',
		 '$compileProvider',
		 '$filterProvider',
		 '$ionicConfigProvider',
		 '$ionicCloudProvider',
	function($stateProvider, $urlRouterProvider,RestangularProvider,$httpProvider,$provide,
				$controllerProvider,$compileProvider,$filterProvider,$ionicConfigProvider,$ionicCloudProvider) {
		
	
	WingsGlobalControllerProvider = $controllerProvider;
		
	WingsGlobalStateProviderRef=$stateProvider;
	
	WingsGlobalProvideRef = $provide;
	
	WingsGlobalRestangularProviderRef = RestangularProvider;
		
	$ionicConfigProvider.views.maxCache(10);
	/*$ionicCloudProvider.init({
	    "core": {
	      "app_id": "3aff36f0"
	    },
	    "insights": {
	        "options" : {
	            "enabled": false
	        }
	    }
	  });	*/
	 Pro.init('3aff36f0', {
	        appVersion: '454'
	 });
	// catch exceptions in angular
		$provide.decorator('$exceptionHandler', ['$delegate','$injector', function($delegate,$injector){
		  return function(exception, cause){
		   
			  $delegate(exception, cause);
			  var stateDep = $injector.get('$state');
			  var currentState = stateDep.current;
			  var data = {
			      type: 'angular',
			      currentState:currentState.name,
			      url: window.location.hash,
			      localtime: Date.now()
			  };
		     if(cause)               { data.cause    = cause;              }
		     if(exception){
		      if(exception.message) { data.message  = exception.message;  }
		      if(exception.name)    { data.name     = exception.name;     }
		      if(exception.stack)   { data.stack    = exception.stack;    }
		     }
	/*
		    if(debug){
		      console.log('exception', data);
		      window.alert('Error: '+data.message);
		    } else {
		      //track('exception', data);
		    	//alert("111111111111");
		    	
		    }
		    */
		    //track('exception', JSON.stringify(data));
		    var wingsLoggingService = $injector.get('WingsLoggingService');
		    wingsLoggingService.log("GENERAL HANDLER*********"+JSON.stringify(data));
		    
		  };
		}]);
	
		$httpProvider.interceptors.push('WingsHttpRequestResponseInterceptor');
	
		//RestangularProvider.setBaseUrl(WINGS_CONFIG.MEDIATOR_URL); 
		RestangularProvider.setDefaultHttpFields({cache: false});
		
		$stateProvider.state('signin', {
			    url: '/signin',
			    templateUrl: 'signin.html',
			      controller: 'SignInCtrl'
			  });
	  // if none of the above states are matched, use this as the fallback
	  $urlRouterProvider.otherwise('/signin');

}]);
