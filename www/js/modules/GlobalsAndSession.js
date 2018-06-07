var wingsGlobalsAndSessionModule = angular.module('wings.mobile.modules.GlobalsAndSession', [ 'ngCordova' ]);

wingsGlobalsAndSessionModule.value("WINGS_ERROR_CODES", {
    "SETUP_FILE_DOWNLOAD": "700",		
    "REMOTE_SERVICE_EXCEPTION": "701",
	"LOADING_CONTENT" : "702",
	"LOADING_CONFIG" : "703", 
	"LOGIN_FAILURE" : "704",
	"NETWORK_ERROR" : "705",
	"PACKAGE_UNZIP_FAILURE" : "706",
	"SYNCRONIZE_FAILURE" : "707"
	});
wingsGlobalsAndSessionModule.value("WINGS_CONFIG", {
  //  "MEDIATOR_URL": "http://192.168.1.172:8555/WingsMobileMediator/webresources", // OFIS
    "MEDIATOR_URL": "http://192.168.1.6:8555/WingsMobileMediator/webresources",		// EV
    "NOTIFICATION_SERVICE":"http://192.168.1.6:8555",
    //"WINGS_ASSETS_REMOTE_SETUP_LINK":"http://192.168.1.5:8555/WingsMobileMediator/setup/setup.zip",		// EV
    "WINGS_ASSETS_REMOTE_SETUP_LINK":"http://192.168.1.7:8555/WingsMobileMediator/webresources/fileservice/download/zip",	// EV
    "WINGS_HOTFIX_DOWNLOAD_LINK":"",
    "WINGS_ASSETS_REMOTE_UPDATE_LINK":"http://192.168.1.8:8555/WingsMobileMediator/",		// EV
    "GENERIC_QUERY": "spsf/genericquery",
    "EXECUTE_FUNCTION": "spsf/execute",
    "INSERT_LOG" : "clientlog/insert",
    "REPORT"     : "report/create",
    "FETCH_FILE": "fileupdate",
    "CHECK_APPLICATION_FILES_UPDATE_PATH": "checkApplicationFilesUpdate",
    "DOWNLOAD_FILE":"helloWorldZip",
    "ONDEVICE_TEST" :true,
    "WINGS_STATICASSETS_REMOTE_SETUP_LINK":"http://192.168.2.106:8080/WingsMobileMediator/webresources/fileservice/download/staticassestszip", // EV
    "SYNC_URL":"datasync/sync",
    "APP_VERSION":"",
    "BASE_VERSION":"",
    "DEPLOY_CHANNEL":"production",
    "FRAMEWORK_BASE_VERSION":"MM-453",
    "COUCHDB_URL":"http://192.168.2.121:5984/setupdb",
    "BASIC_AUTHENTICATION":"Basic cm9vdDp0ZXN0MDE="
});
/*
for (var template in appData.views){
	wingsGlobalsAndSessionModule.value(template, appData.views[template].data);
}
*/
wingsGlobalsAndSessionModule.run(function($rootScope,WingsGlobalManager,$cordovaNetwork,$ionicPlatform,WINGS_CONFIG) {
	console.log("[wingsGlobalsAndSessionModule------][RUN] : " );
	var isWebView = ionic.Platform.isWebView();
	  var isIPad = ionic.Platform.isIPad();
	  var isIOS = ionic.Platform.isIOS();
	  var isAndroid = ionic.Platform.isAndroid();
	  var isWindowsPhone = ionic.Platform.isWindowsPhone();

	  var currentPlatform = ionic.Platform.platform();
	  var currentPlatformVersion = ionic.Platform.version();
	$rootScope.globals = {
            currentUser: {
                divNo         : 1,
                userName      : null,
                userNumber    : null,
                userBadge     : null,
                userId        : null,
                roleId        : null,
                defaultRoleId : null,
                roleList      : [],
                rolePrograms  : [],
               	messageCount  : 0
            },
            deviceConnectionInfo:{
            	type:'',
    			isOnline:'',
    			isOffline:''
            },
            deviceInformation:{
            	device:'',
            	cordova:'',
            	model:'',
            	platform:'',
            	uuid:'',
            	version:'',
              	tailNumber:'',
              	station:''
            },
            queryDesigner:{
            	columnList : [],
            	query : '',
            	stateName:'',
            	tableName:''
            },
            security : [],
            wingsConfigurationDB:{
            	name:"WingsConfiguration.db",
            	workingDirectory:cordova.file.applicationStorageDirectory+"databases/", // cordova.file.applicationStorageDirectory+"databases/" : Android
            	dbcopyLocation:0,						// 0 : Android, 2 : IOS
            	sqlliteOpenOptions:{
            		name: "WingsConfiguration.db",
               	    location: 'default' 				// 'default' : Android , 
            	}
            	 
            },
            wingsSetupDB:{
            	name:"WingsSetup.db",
            	nameOnServer:"WingsSetup.db",
            	dupFilePath:cordova.file.applicationStorageDirectory+"databases/", // cordova.file.applicationStorageDirectory+"databases/" : Android
            	sqlliteOpenOptions:{
            		name: "WingsSetup.db",
               	    location: 'default' 				// 'default' : Android , IOS
            	}
            	 
            },
            wingsTransactionDB:{
            	name:"WingsTransaction.db",
            	dbcopyLocation:0,						// 0 : Android, 2 : IOS
            	nameOnServer:"WingsTransaction.db",
            	dupFilePath:cordova.file.applicationStorageDirectory+"databases/", // cordova.file.applicationStorageDirectory+"databases/" : Android
            	sqlliteOpenOptions:{
            		name: "WingsTransaction.db",
               	    location: 'default' 				// 'default' : Android , IOS
            	}
            	 
            },
            wingsAssetsFolderName:"wings_assets",
            wingsAssetsSubSetupFolderName:"setup",
            wingsAssetsParentFolder:cordova.file.dataDirectory, 
            wingsDupFileDownloadPath:cordova.file.dataDirectory + "setup.zip",
            wingsAssetsUzipFolderAfterDownload:cordova.file.dataDirectory +"wings_assets/setup",
            wingsStateFilesDirectory:cordova.file.dataDirectory+"wings_assets/setup/",
            wingsControllerFilesDirectory:cordova.file.dataDirectory+"wings_assets/setup/",
            // STATIC ASSESTS
            wingsStaticAssetsFolderName:"wings_staticassets",
            wingsStaticAssetsSubSetupFolderName:"staticsetup",
            wingsStaticAssetsParentFolder:cordova.file.dataDirectory, 
            wingsStaticAssestsDupFileDownloadPath:cordova.file.dataDirectory + "staticsetup.zip",
            wingsStaticAssetsUzipFolderAfterDownload:cordova.file.dataDirectory +"wings_staticassets/staticsetup",
            //IONIC DEPLOY SNAPSHOT PATH
            wingsIonicSnapshotPath:cordova.file.applicationStorageDirectory+"app_",//For android
            loggedIn:true
    };
	
	 
    
	
	
	//alert(currentPlatform);
	
    
	  $ionicPlatform.ready(function() {

		  if(WINGS_CONFIG.ONDEVICE_TEST){
	    	var type =$cordovaNetwork.getNetwork();
			var onlineState =$cordovaNetwork.isOnline();
			var offlineState =$cordovaNetwork.isOffline();
			
			WingsGlobalManager.setDeviceInfoOnlineOffLineStatus(onlineState);
			WingsGlobalManager.setDeviceInfoConnectionType(type);
			if(isIOS){
				var sqlliteIOSWorkingDirectoryPath =cordova.file.applicationStorageDirectory+"Library/LocalDatabase/";
				
				$rootScope.globals.wingsSetupDB.dupFilePath=sqlliteIOSWorkingDirectoryPath;
				$rootScope.globals.wingsTransactionDB.dupFilePath=sqlliteIOSWorkingDirectoryPath;
				
				$rootScope.globals.wingsConfigurationDB.dbcopyLocation=0;
				$rootScope.globals.wingsConfigurationDB.workingDirectory=sqlliteIOSWorkingDirectoryPath;
				$rootScope.globals.wingsIonicSnapshotPath=cordova.file.applicationStorageDirectory+"Library/Application Support/";
			}
			
			console.log("######################*******TYPE : "+ type+" ONLINE "+onlineState +" OFFLINE : "+ offlineState); 
		  }
		
		
	  });
   
});
wingsGlobalsAndSessionModule.factory('WingsGlobalManager',WingsGlobalManager);
wingsGlobalsAndSessionModule.factory('WingsSessionManager',WingsSessionManager);
wingsGlobalsAndSessionModule.factory('MenuFactory', function() {
	  var menus = [];
	  return {
	    all: function() {
	      return menus;
	    },
	    set : function (menu) {
	    	//alert(menu);
	    	angular.copy(menu,menus);
	    	//alert(menus);
	    }
	  };
});
WingsGlobalManager.$inject = ['$rootScope','WingsSessionManager','$cordovaDevice','WingsSocketService'];
WingsSessionManager.$inject = ['MenuFactory'];

// WINGS SESSION MANAGER
function WingsSessionManager(MenuFactory) {
	var programList = [];
	
	var roleList = [];
	
	var groupList = [];
	
	var addRole = function(newObj) {
		roleList.push(newObj);
	   };

   var getRoles = function(){
       return roleList;
   };
   
   var addProgram = function(newObj) {
    programList.push(newObj);
   };

   var getPrograms = function(){
       return programList;
   };
   
   var reset= function(){
       programList = [];
       roleList = [];
   };
   var resetRoleProgram= function(){
	    programList = [];
   };
  
   return { 
	addProgram: addProgram,
    getPrograms: getPrograms,
    addRole: addRole,
    getRoles: getRoles,
    reset:reset,
    resetRoleProgram:resetRoleProgram
   };
};

// WINGS GLOBAL MANAGER
function WingsGlobalManager($rootScope,WingsSessionManager,$cordovaDevice,WingsSocketService) {
	
	var clientIp="";
    var service = {
    		name:name,
    		SetCredentials : SetCredentials,
    		ClearCredentials : ClearCredentials,
    		SetRolePrograms:SetRolePrograms,
    		setDeviceInfoConnectionType:setDeviceInfoConnectionType,
    		setDeviceInfoOnlineOffLineStatus:setDeviceInfoOnlineOffLineStatus,
    		getCurrentUser:getCurrentUser,
    		getDeviceInformation:getDeviceInformation,
    		setClientIp:setClientIp,
    		getClientIp:getClientIp,
    		setMessageCount:setMessageCount
    		
    };
    
    
    return service;
    function increaseMessageBadge () {
        $rootScope.globals.messageBadge += 1;
    }
    function decreaseMessageBadge () {
        $rootScope.globals.messageBadge -= 1;
    }
    function setClientIp(ipParam){
    	clientIp=ipParam;
    };
    function setMessageCount(count){
    	$rootScope.globals.currentUser.messageCount = Math.floor(count * 10) / 10;
    };
    function getClientIp(){
    	return clientIp;
    };
    
    function name(){
    	return "WingsGlobalManager";
    };
    
    function getCurrentUser(){
    	return angular.copy($rootScope.globals.currentUser);
    };
    function getDeviceInformation(){
    	return angular.copy($rootScope.globals.deviceInformation);
    };
    
    function setDeviceInfoConnectionType (type_Par){
 	   $rootScope.globals.deviceConnectionInfo.type=type_Par;
    };
    function setDeviceInfoOnlineOffLineStatus (isOnline){
 	   if(isOnline){
 		   $rootScope.globals.deviceConnectionInfo.isOnline =true;
 		   $rootScope.globals.deviceConnectionInfo.isOffline=false;
 	   }else{
 		   $rootScope.globals.deviceConnectionInfo.isOnline =false;
 		   $rootScope.globals.deviceConnectionInfo.isOffline=true;
 	   }
    };
    
    function SetRolePrograms(rolePrograms_p) {
    	//console.log("SetRolePrograms :"+rolePrograms_p);
		$rootScope.globals.currentUser.rolePrograms = rolePrograms_p;
	};
    function SetCredentials(userInfo) {
    	console.log("Set Credentials :"+userInfo.userName);
        $rootScope.globals.currentUser.divNo           = userInfo.divNo;
    	$rootScope.globals.currentUser.userId          = userInfo.userId.toUpperCase();
    	$rootScope.globals.currentUser.userNumber      = userInfo.userNumber;
    	$rootScope.globals.currentUser.userBadge       = userInfo.userBadge;
		$rootScope.globals.currentUser.userName        = userInfo.userName;
		$rootScope.globals.currentUser.defaultRoleId   = userInfo.defaultRoleId;
		$rootScope.globals.currentUser.roleId          = userInfo.defaultRoleId;
		$rootScope.globals.currentUser.roleList        = userInfo.roleList;
		$rootScope.globals.currentUser.rolePrograms    = userInfo.rolePrograms;
        $rootScope.globals.loggedIn                    = true;
        WingsSocketService.init();
        
      /*$rootScope.globals.deviceInformation.device   = $cordovaDevice.getDevice();
        $rootScope.globals.deviceInformation.cordova  = $cordovaDevice.getCordova();
        $rootScope.globals.deviceInformation.model    = $cordovaDevice.getModel();
        $rootScope.globals.deviceInformation.platform = $cordovaDevice.getPlatform();
        $rootScope.globals.deviceInformation.uuid     = $cordovaDevice.getUUID();
        $rootScope.globals.deviceInformation.version  = $cordovaDevice.getVersion();*/
    };

    function ClearCredentials() {
    	console.log("*****************ClearCredentials");
    	$rootScope.globals.currentUser.userId        = null;
    	$rootScope.globals.currentUser.userNumber    = null;
    	$rootScope.globals.currentUser.userBadge     = null;
        $rootScope.globals.currentUser.userName      = null;
		$rootScope.globals.currentUser.defaultRoleId = null;
		$rootScope.globals.currentUser.roleList      = [];
		$rootScope.globals.currentUser.rolePrograms  = [];
		$rootScope.globals.currentUser.messageCount  = 0;
        $rootScope.globals.loggedIn                  = false;
    	WingsSessionManager.reset();
    	WingsSocketService.disconnect();

    };
};
