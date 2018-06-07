var signinController = angular.module('wings.mobile.controllers.signincontroller',[]);
signinController.controller('SignInCtrl', [
                                        '$scope',
                                        '$state',
                                        'WingsAuthService',
                                        'WingsConfigurationDBService',
                                        'WingsLoggingService',
                                        'WingsRemoteFileService',
                                        'WingsLocalFileService',
                                        '$cordovaFileTransfer',
                                        '$timeout',
                                        'WingsApplicationUpdateService',
                                        '$cordovaFile',
                                        '$q',
                                        '$rootScope',
                                        '$ionicPlatform',
                                        'WingsDialogService',
                                        '$ionicModal',
                                        'WingsGlobalManager',
                                        '$cordovaZip',
                                        '$cordovaFileTransfer',
                                        'WINGS_CONFIG',
                                        'WINGS_ERROR_CODES',
                                        'WingsRemoteDbService',
                                        '$ionicHistory',
                                        'md5',
                                        '$ionicDeploy',
                                        '$ionicPlatform',
                                        '$ionicLoading',
                                        '$cordovaToast',
                                        '$cordovaSQLite',
                                        'WingsTransactionDBService',
                                        'sy',
function($scope,$state,WingsAuthService,WingsConfigurationDBService,WingsLoggingService,WingsRemoteFileService,
        WingsLocalFileService,$cordovaFileTransfer,$timeout,WingsApplicationUpdateService,$cordovaFile,$q,$rootScope,
        $ionicPlatform,WingsDialogService,$ionicModal,WingsGlobalManager,$cordovaZip,$cordovaFileTransfer,WINGS_CONFIG,
        WINGS_ERROR_CODES,WingsRemoteDbService,$ionicHistory,md5,$ionicDeploy,$ionicPlatform,
        $ionicLoading,$cordovaToast,$cordovaSQLite,WingsTransactionDBService,sy) {
                                            
    networkinterface.getIPAddress(function (ip) { 
        console.log("[WingsLoggingService][LOG][IP ADDRESS] : " +ip);
        WingsGlobalManager.setClientIp(ip);
        ///UPDATE MODULE
    });
    function dbOpened () {
    	console.log('DBDBDB');
    }
  
    
    function updateWingsMobile (deployType,targetVersion) {
        $ionicDeploy.check().then(function(snapshotAvailable) {
            if (snapshotAvailable) {
                $ionicLoading.show({
                    template: '<p style="border-radius: 0;padding:16px;">Wings Mobile has a new version.Downloading is starting ...</p>',
                    duration: 2000
                }).then(function(){
                    $rootScope.$broadcast('downloading:show');
                });
                $ionicDeploy.download().then(function() {
                    $rootScope.$broadcast('downloading:hide');
                    $rootScope.$broadcast('extracting:show');
                    $ionicDeploy.extract().then(function () {
                        $rootScope.$broadcast('extracting:hide');
                        $ionicDeploy.info().then (function(info) {
                            console.log("info : "+JSON.stringify(info)+"\n");
                            var wingsAssetsParentFolder = $rootScope.globals.wingsAssetsParentFolder;
                            $cordovaFile.checkDir(wingsAssetsParentFolder, $rootScope.globals.wingsAssetsFolderName).then(function (success) {
                                console.log('Assets folder found');
                                $cordovaFile.removeRecursively(wingsAssetsParentFolder, $rootScope.globals.wingsAssetsFolderName).then(function (success) {
                                    console.log('Assets folder deleting success');
                                    $cordovaFile.createDir(wingsAssetsParentFolder, $rootScope.globals.wingsAssetsFolderName, false).then(function (success) {
                                        $cordovaFile.copyDir($rootScope.globals.wingsIonicSnapshotPath+info.deploy_uuid, "setup", wingsAssetsParentFolder+$rootScope.globals.wingsAssetsFolderName, $rootScope.globals.wingsAssetsSubSetupFolderName).then(function (success) {
                                            if (deployType == 'SOFT') {
                                                WingsApplicationUpdateService.CopyTransactionDBFromDeployToItsDestination(info).then(function (success) {
                                                    if (targetVersion != undefined && targetVersion != '') {
                                                        var sql2 = "Update SY_ENVIRONMENT SET value = '"+targetVersion+"' Where Symbol = 'APP_VERSION'";
                                                        WingsConfigurationDBService.executeSql(sql2, []);
                                                    }
                                                    $rootScope.$broadcast('restarting:show');
                                                    deleteSnapshots(info.deploy_uuid).then(function (result){
                                                        $ionicDeploy.load();
                                                    });
                                                }, function (error) {
                                                    return deferred.reject("CheckFirstTimeWingsAssetsSetup - STEP 1.4 (Error) : -  During copying WingsTransactionDb : " +JSON.stringify(error));
                                                });
                                            } else {
                                                if (targetVersion != undefined && targetVersion != '') {
                                                    var sql2 = "Update SY_ENVIRONMENT SET value = '"+targetVersion+"' Where Symbol = 'APP_VERSION'";
                                                    WingsConfigurationDBService.executeSql(sql2, []);
                                                }
                                                $rootScope.$broadcast('restarting:show');
                                                deleteSnapshots(info.deploy_uuid).then(function (result){
                                                    $ionicDeploy.load();
                                                });
                                            }
                                        }, function (error) {
                                            console.log("SM CheckFirstTimeWingsAssetsSetup - STEP 1.2 (Error) : - create setup folder from apk source : "+JSON.stringify(error));
                                        });
                                    }, function (error) {
                                        console.log("SM CheckFirstTimeWingsAssetsSetup - STEP 1.1 (Error) : - createDir- Cannot create assets folder : " +JSON.stringify(error));
                                    });
                                });
                            },function (error) {
                                //NO ASSET FOLDER
                                console.log('Assets folder could not find');
                                $cordovaFile.createDir(wingsAssetsParentFolder, $rootScope.globals.wingsAssetsFolderName, false).then(function (success) {
                                    $cordovaFile.copyDir($rootScope.globals.wingsIonicSnapshotPath+info.deploy_uuid, "setup", 
                                                         wingsAssetsParentFolder+$rootScope.globals.wingsAssetsFolderName, $rootScope.globals.wingsAssetsSubSetupFolderName).then(function (success) {
                                         if (deployType == 'SOFT') {
                                             WingsApplicationUpdateService.CopyTransactionDBFromDeployToItsDestination(info).then(function (success) {
                                                 if (targetVersion != undefined && targetVersion != '') {
                                                     var sql2 = "Update SY_ENVIRONMENT SET value = '"+targetVersion+"' Where Symbol = 'APP_VERSION'";
                                                     WingsConfigurationDBService.executeSql(sql2, []);
                                                 }
                                                 $rootScope.$broadcast('restarting:show');
                                                 deleteSnapshots(info.deploy_uuid).then(function (result){
                                                     $ionicDeploy.load();
                                                 });
                                             }, function (error) {
                                                 return deferred.reject("CheckFirstTimeWingsAssetsSetup - STEP 1.4 (Error) : -  During copying WingsTransactionDb : " +JSON.stringify(error));
                                             });
                                         } else {
                                             if (targetVersion != undefined && targetVersion != '') {
                                                 var sql2 = "Update SY_ENVIRONMENT SET value = '"+targetVersion+"' Where Symbol = 'APP_VERSION'";
                                                 WingsConfigurationDBService.executeSql(sql2, []);
                                             }
                                             $rootScope.$broadcast('restarting:show');
                                             deleteSnapshots(info.deploy_uuid).then(function (result){
                                                 $ionicDeploy.load();
                                             });
                                         }
                                     }, function (error) {
                                         console.log("SM CheckFirstTimeWingsAssetsSetup - STEP 1.2 (Error) : - create setup folder from apk source : "+JSON.stringify(error));
                                     });
                                }, function (error) {
                                    console.log("SM CheckFirstTimeWingsAssetsSetup - STEP 1.1 (Error) : - createDir- Cannot create assets folder : " +JSON.stringify(error));
                                });
                            });
                        });
                    });
                });
            } else {
                if (targetVersion != undefined && targetVersion != '') {
                    var sql2 = "Update SY_ENVIRONMENT SET value = '"+targetVersion+"' Where Symbol = 'APP_VERSION'";
                    WingsConfigurationDBService.executeSql(sql2, []);
                }
                $ionicDeploy.getSnapshots().then(function(snapshots) {
                    // snapshots will be an array of snapshot uuids
                });
            }
        });
    };
    
    function deleteSnapshots (activeSS) {
        var deferred = $q.defer();
        $ionicDeploy.getSnapshots().then(function(snapshots) {
            _.forEach(snapshots, function(n) {
                if (n != activeSS) {
                    $ionicDeploy.deleteSnapshot(n);
                }
            });
            return deferred.resolve("GOHEAD");
        });  
        return  deferred.promise;
    };
    $scope.openPage = function () {
        window.open(encodeURI('http://mobile.adbtech.com'), '_system')
    };
    //StatusBar.hide();
    $scope.user = {};
    
    function readStoredUserCredantials () {
        var deferred = $q.defer();
        var sql = "Select *                   " +
                  "  From SY_ENVIRONMENT      " +
                  " Where SYMBOL IN('USER_ID','PASSWORD','COUCHDB_URL','APP_VERSION','BASE_VERSION','DEPLOY_CHANNEL') " ;
        WingsConfigurationDBService.executeSql(sql, []).then(function(results) {
            _.forEach(results, function(n) {
                if (n.SYMBOL == "USER_ID") {
                    $scope.user.username = n.VALUE;
                } else if (n.SYMBOL == "PASSWORD") {
                    $scope.user.password = n.VALUE;
                } else if (n.SYMBOL == "APP_VERSION") {
                    WINGS_CONFIG.APP_VERSION = n.VALUE;
                } else if (n.SYMBOL == "BASE_VERSION") {
                    WINGS_CONFIG.BASE_VERSION = n.VALUE;
                } else if (n.SYMBOL == "DEPLOY_CHANNEL") {
                    WINGS_CONFIG.DEPLOY_CHANNEL = n.VALUE;
                } else if (n.SYMBOL == "COUCHDB_URL") {
                    WINGS_CONFIG.COUCHDB_URL= n.VALUE;
                    $scope.application_config.COUCHDB_URL= $scope.hideIdPw(n.VALUE);
                }});
            $ionicDeploy.channel = WINGS_CONFIG.DEPLOY_CHANNEL;
            if (WINGS_CONFIG.BASE_VERSION != WINGS_CONFIG.FRAMEWORK_BASE_VERSION) {
                WINGS_CONFIG.APP_VERSION = WINGS_CONFIG.FRAMEWORK_BASE_VERSION;
                WINGS_CONFIG.BASE_VERSION = WINGS_CONFIG.FRAMEWORK_BASE_VERSION;
                var sql2 = "update SY_ENVIRONMENT SET value = '"+WINGS_CONFIG.FRAMEWORK_BASE_VERSION+"' where symbol in ('BASE_VERSION','APP_VERSION')";
                WingsConfigurationDBService.executeSql(sql2, []).then(function(results) {
                    return deferred.resolve("GOHEAD");
                });
            } else {
                return deferred.resolve("GOHEAD");
            }
        }, function(error) {
            console.log("ERROR - readAndSetRemoteConnectionsInfo : "+ JSON.stringify(error));
        });
        return  deferred.promise;

    };
    
    $rootScope.$on('DBSOpened', function(event){
        readStoredUserCredantials().then(function(result) {
        	$timeout(function() {
	            var sql = "Select * From Sy_Promotions Where Promotion_Number > ? Order By Promotion_Number";
                WingsTransactionDBService.executeSql(sql,[WINGS_CONFIG.APP_VERSION]).then(function (result) {
	                if (result.length > 0) {
	                    var index = _.findLastIndex(result, function(o) { return o.MOBILE_DEPLOY == 'HARD'; });
	                    if (index > -1) {
	                        $scope.openPage();
	                        return;
	                    }
	                    index = _.findLastIndex(result, function(o) { return o.MOBILE_DEPLOY == 'SOFT';});
	                    if (index > -1) {
	                        updateWingsMobile(result[index].MOBILE_DEPLOY,result[index].PROMOTION_NUMBER);
	                        return;
	                    }
	                    index = _.findLastIndex(result, function(o) { return o.MOBILE_DEPLOY == 'SOFT-NODB';});
	                    if (index > -1) {
	                        updateWingsMobile(result[index].MOBILE_DEPLOY,result[index].PROMOTION_NUMBER);
	                        return;
	                    }
	                    index = _.findLastIndex(result, function(o) { return o.MOBILE_DEPLOY == 'FIX' });
	                    if (index > -1) {
	                        $scope.downloadHotFix(result[index].PROMOTION_NUMBER);
	                        $scope.fixNumber = result[index].PROMOTION_NUMBER;
	                        return;
	                    }
	                }
	              }).catch(function (err) {
	                // ouch, an error
	                   console.log("**********************************findDocument err : " +JSON.stringify(err));
	              });
	        }, 1500);
        });
    });
    $scope.$on('$ionicView.enter', function(event, viewData) {
        $ionicHistory.clearCache();
   });
   
   function parseUri (str) {
       var    o   = parseUri.options,
           m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
           uri = {},
           i   = 14;

       while (i--) uri[o.key[i]] = m[i] || "";

       uri[o.q.name] = {};
       uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
           if ($1) uri[o.q.name][$1] = $2;
       });

       return uri;
   };

   parseUri.options = {
       strictMode: false,
       key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
       q:   {
           name:   "queryKey",
           parser: /(?:^|&)([^&=]*)=?([^&]*)/g
       },
       parser: {
           strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
           loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
       }
   };
    function readAndSetRemoteConnectionsInfo(){
        $scope.application_config.password = '';
        var deferred = $q.defer();
        var query = "SELECT * FROM SY_ENVIRONMENT where symbol IN ('WINGS_ASSETS_REMOTE_SETUP_LINK','WINGS_ASSETS_REMOTE_UPDATE_LINK','TAIL_NUMBER','STATION','WINGS_STATICASSETS_REMOTE_SETUP_LINK','USER_ID'," +
                      "'MEDIATOR_IP','MEDIATOR_PORT','MEDIATOR_PROTOCOL','COUCHDB_URL','NOTIFICATION_SERVICE','PASSWORD') order by symbol asc ";
        WingsConfigurationDBService.executeSql(query, []).then(function(results) {
            _.forEach(results, function(n) {
                if (n.SYMBOL == "WINGS_ASSETS_REMOTE_UPDATE_LINK") {
                    $scope.application_config.WINGS_ASSETS_REMOTE_UPDATE_LINK=n.VALUE;
                } else if (n.SYMBOL == "WINGS_ASSETS_REMOTE_SETUP_LINK") {
                    $scope.application_config.WINGS_ASSETS_REMOTE_SETUP_LINK=n.VALUE;
                } else if (n.SYMBOL == "TAIL_NUMBER") {
                    $rootScope.globals.deviceInformation.tailNumber = n.VALUE;
                    $scope.application_config.TAIL_NUMBER = n.VALUE;
                } else if (n.SYMBOL == "STATION") {
                    $rootScope.globals.deviceInformation.station = n.VALUE;
                    $scope.application_config.STATION = n.VALUE;
                } else if (n.SYMBOL == "WINGS_STATICASSETS_REMOTE_SETUP_LINK"){
                    $scope.application_config.WINGS_STATICASSETS_REMOTE_SETUP_LINK = n.VALUE;
                } else if (n.SYMBOL == "USER_ID") {
                    $scope.application_config.userId = n.VALUE;
                } else if (n.SYMBOL == "PASSWORD") {
                    $scope.application_config.password = n.VALUE;
                } else if (n.SYMBOL == "MEDIATOR_IP") {
                    $scope.application_config.MEDIATOR_IP = n.VALUE;
                } else if (n.SYMBOL == "MEDIATOR_PORT") {
                    $scope.application_config.MEDIATOR_PORT = n.VALUE;
                } else if (n.SYMBOL == "MEDIATOR_PROTOCOL") {
                    $scope.application_config.MEDIATOR_PROTOCOL = n.VALUE;
                    if ($scope.application_config.MEDIATOR_PROTOCOL == "http") {
                        $scope.protocolStatus = true;
                    } else { 
                        $scope.protocolStatus = false;
                    }
                } else if (n.SYMBOL == "COUCHDB_URL"){
                    WINGS_CONFIG.COUCHDB_URL = n.VALUE;
                    $scope.application_config.COUCHDB_URL= $scope.hideIdPw(n.VALUE);
                } else if (n.SYMBOL == "NOTIFICATION_SERVICE"){
                    $scope.application_config.NOTIFICATION_SERVICE = n.VALUE;
                }
            });
            WINGS_CONFIG.WINGS_ASSETS_REMOTE_UPDATE_LINK=$scope.application_config.WINGS_ASSETS_REMOTE_UPDATE_LINK;
            WINGS_CONFIG.WINGS_ASSETS_REMOTE_SETUP_LINK= $scope.application_config.WINGS_ASSETS_REMOTE_SETUP_LINK;
            WINGS_CONFIG.WINGS_STATICASSETS_REMOTE_SETUP_LINK = $scope.application_config.WINGS_STATICASSETS_REMOTE_SETUP_LINK;
            WINGS_CONFIG.NOTIFICATION_SERVICE = $scope.application_config.NOTIFICATION_SERVICE;
            WINGS_CONFIG.MEDIATOR_URL = $scope.application_config.MEDIATOR_PROTOCOL+"://"+$scope.application_config.MEDIATOR_IP+":"+$scope.application_config.MEDIATOR_PORT+"/WingsMobileMediator/webresources";
            WINGS_CONFIG.WINGS_HOTFIX_DOWNLOAD_LINK = WINGS_CONFIG.MEDIATOR_URL+"/fileservice/download/fix?fileName=";
            WingsGlobalRestangularProviderRef.setBaseUrl(WINGS_CONFIG.MEDIATOR_URL);
            
            return deferred.resolve("GOHEAD");
                      // $scope.modalMediatorSettings.show();
        }, function(error) {
            console.log("ERROR - readAndSetRemoteConnectionsInfo : "+ JSON.stringify(error));
            return deferred.reject("ERROR - readAndSetRemoteConnectionsInfo : "+ JSON.stringify(error));
        });
        return  deferred.promise;
    };
    
// SIGN-IN
    $scope.signIn = function() {
        var username = $scope.user.username;
        var password = $scope.user.password;
        $rootScope.$broadcast('logging:show');
        readAndSetRemoteConnectionsInfo().then(function(success) {
            WingsApplicationUpdateService.CheckFirstTimeWingsAssetsSetup().then(function(res){
                WingsAuthService.Login(username, password).then( function (response) {
                    if (response.success) {
                        WingsApplicationUpdateService.LoadControllerStateAndViews().then(function(res){
                            WingsLoggingService.log("LOGIN SUCCESS ["    +username+ "]: ");
                            $rootScope.$broadcast('logging:hide');
                            $state.go('app.home');
                        },function (error){
                            $rootScope.$broadcast('logging:hide');
                            console.log('SIGN IN ERROR:'+error);
                            WingsDialogService.alert(WINGS_ERROR_CODES.LOADING_CONTENT+" - LOADING CONTENT ERROR:\n PLEASE CHECK YOUR SETTINGS AND THEN CLICK ON 'DUP' BUTTON \n", 'Error', 'OK') .then(function() {
                            // $scope.restartApp();
                            });
                        });
                    } else {
                        $rootScope.$broadcast('logging:hide');
                        WingsDialogService.alert("Invalid username or Password !", 'Error', 'OK');
                    }
                }, function (error) {
                    $rootScope.$broadcast('logging:hide');
                    WingsDialogService.alert(WINGS_ERROR_CODES.LOGIN_FAILURE+ " - "+error, 'Error', 'OK');
                });
            },function(error) {
                $rootScope.$broadcast('logging:hide');
                WingsDialogService.alert(WINGS_ERROR_CODES.LOADING_CONFIG+" - LOADING CONFIG ERROR:\n PLEASE CHECK YOUR SETTINGS ", 'Error', 'OK');
            });
        },function (error){
            $rootScope.$broadcast('logging:hide');
            WingsDialogService.alert(WINGS_ERROR_CODES.LOADING_CONTENT+" - CheckFirstTimeWingsAssetsSetup - LOADING CONTENT ERROR:\n PLEASE CHECK YOUR SETTINGS AND THEN CLICK ON 'DUP' BUTTON \n", 'Error', 'OK') .then(function() {
            // $scope.restartApp();
            });
        });
    };
    // DOWNLOAD STATIC ASSETS
    $scope.downloadStaticAssets = function(targetVersion) {
        $rootScope.$broadcast('loading:show');
        if ($rootScope.globals.deviceConnectionInfo.type == 'none') {
            $rootScope.$broadcast('loading:hide');
            WingsDialogService.alert(WINGS_ERROR_CODES.NETWORK_ERROR+" - THIS OPERATION REQUIRE NETWORK CONNECTION. PLEASE CHECK YOUR CONNECTION");
            return;
        }
        WingsApplicationUpdateService.CheckWingsStaticAssets().then(function(success) {
            $rootScope.$broadcast('loading:hide');
            if(targetVersion != undefined && targetVersion != '') {
                var sql2 = "Update SY_ENVIRONMENT SET value = '"+targetVersion+"' Where Symbol = 'APP_VERSION'";
                WingsConfigurationDBService.executeSql(sql2, []);
            }
            $scope.restartApp();
        },function(error) {
            $rootScope.$broadcast('loading:hide');
            WingsDialogService.alert("downloadStaticAssets-CANNOT DOWNLOAD STATIC ASSETS : \n"+ JSON.stringify(error), 'Error', 'OK');
            $scope.restartApp();
        });
    };
    // DOWNLOAD UPDATES
    $scope.downloadUpdates = function(targetVersion) {
        $rootScope.$broadcast('loading:show');
        if ($rootScope.globals.deviceConnectionInfo.type == 'none') {
            $rootScope.$broadcast('loading:hide');
            WingsDialogService.alert(WINGS_ERROR_CODES.NETWORK_ERROR+" - THIS OPERATION REQUIRE NETWORK CONNECTION. PLEASE CHECK YOUR CONNECTION");
            return;
        }
        readAndSetRemoteConnectionsInfo().then(function(success) {
            WingsApplicationUpdateService.CheckWingsAssets().then(function(success) {
                $rootScope.$broadcast('loading:hide');
                $scope.downloadStaticAssets(targetVersion);
            },function(error) {
                $rootScope.$broadcast('loading:hide');
                console.log("Could not download updates.Connection could not be established.Please check configuration ip and port."+JSON.stringify(error))
                WingsDialogService.alert("Could not download updates.Connection could not be established.Please check configuration ip and port.", 'Error', 'OK');
            });
        },function(error) {
            $rootScope.$broadcast('loading:hide');
            WingsDialogService.alert("downloadUpdates-CANNOT READ REMOTE SERVER INFO : \n"+ JSON.stringify(error), 'Error', 'OK');
        });
    };
    // HOT FIX
    $scope.downloadHotFix = function (targetVersion) {
        var targetPath = $rootScope.globals.wingsAssetsParentFolder;
        if(WINGS_CONFIG.WINGS_HOTFIX_DOWNLOAD_LINK == '') {
            readAndSetRemoteConnectionsInfo().then(function (result) {
                $scope.downloadHotFix();
            });
            return false;
        }
        var options = {
            headers: {
                "Authorization": WINGS_CONFIG.BASIC_AUTHENTICATION
            }
        }
        $cordovaFileTransfer.download(WINGS_CONFIG.WINGS_HOTFIX_DOWNLOAD_LINK+'/hotfix.txt', targetPath+"hotfix.txt", options, true).then(function(success) {
            $cordovaFile.readAsText(targetPath, 'hotfix.txt').then(function (fileContent) {
                console.log("Hotfix:"+fileContent);
                fileContent = fileContent.replace(/(\r\n|\n|\r)/gm,"");
                var filesToDownloadForHotFix = fileContent.split(',');
                var promises = [];
                filesToDownloadForHotFix.forEach(function(url,row) {
                    var filename = url.substring(url.lastIndexOf('/')+1);
                    var targetPath = $rootScope.globals.wingsAssetsUzipFolderAfterDownload + url;
                    var path = targetPath.substring(0,targetPath.lastIndexOf('/'));
                    promises.push($cordovaFileTransfer.download(WINGS_CONFIG.WINGS_HOTFIX_DOWNLOAD_LINK+url, targetPath.replace("/[\r\n]/g", ""), options, true));
                });
                $q.all(promises).then(function(res) {
                    console.log("Hot Fix download done.");
                    if($scope.fixNumber != undefined && $scope.fixNumber != '') {
                        var sql2 = "Update SY_ENVIRONMENT SET value = '"+$scope.fixNumber+"' Where Symbol = 'APP_VERSION'";
                        WingsConfigurationDBService.executeSql(sql2, []).then(function (result){
                        }, function (error) {
                            console.log("Update SY_ENVIRONMENT failed : "+JSON.stringify(error));
                        });
                    }
                    $timeout(function() {
                    	$scope.restartApp();
                   }, 1000);
                });
            }, function (error) {
                console.log(" CANNOT READ CONTROLLER FILE...." +JSON.stringify(error));
         });
        },function(error) {
        });
    }
    // DOWNLOAD UPDATES
    
    // MEDIATOR_SETTINGS
    $scope.application_config ={
            MEDIATOR_IP:"localhost",
            MEDIATOR_PORT:"8080",
            MEDIATOR_PROTOCOL:"",
            COUCHDB_URL:"",
            DEPLOY_CHANNEL:"",
            NOTIFICATION_SERVICE:"",
               WINGS_ASSETS_REMOTE_SETUP_LINK:"",
               WINGS_ASSETS_REMOTE_UPDATE_LINK:"",
               TAIL_NUMBER:""
               
   };
    $ionicModal.fromTemplateUrl('./setup/programs/sy/SY_M001/SY_M001.html', {scope: $scope,animation: 'slide-in-up'}).then(function(modal) {
           $scope.modalMediatorSettings = modal;
    });
    

    $scope.showMediatorSettings = function() {
        readAndSetRemoteConnectionsInfo().then(function(success) {
             $scope.modalMediatorSettings.show();
        },function(error) {
            WingsDialogService.alert("Cannot Open Settings : \n"+ JSON.stringify(error), 'Error', 'OK');
        });
    };

    $scope.saveSettings = function() {
        $scope.application_config.WINGS_ASSETS_REMOTE_UPDATE_LINK = $scope.application_config.MEDIATOR_PROTOCOL+"://"+$scope.application_config.MEDIATOR_IP+":"+$scope.application_config.MEDIATOR_PORT+"/WingsMobileMediator/";
        $scope.application_config.WINGS_ASSETS_REMOTE_SETUP_LINK = $scope.application_config.MEDIATOR_PROTOCOL+"://"+$scope.application_config.MEDIATOR_IP+":"+$scope.application_config.MEDIATOR_PORT+"/WingsMobileMediator/webresources/fileservice/download/zip";
        $scope.application_config.WINGS_STATICASSETS_REMOTE_SETUP_LINK = $scope.application_config.MEDIATOR_PROTOCOL+"://"+$scope.application_config.MEDIATOR_IP+":"+$scope.application_config.MEDIATOR_PORT+"/WingsMobileMediator/webresources/fileservice/download/staticassestszip";
        WingsGlobalRestangularProviderRef.setBaseUrl($scope.application_config.MEDIATOR_PROTOCOL+"://"+$scope.application_config.MEDIATOR_IP+":"+$scope.application_config.MEDIATOR_PORT+"/WingsMobileMediator/webresources");
        
        var updateStrMEDIATOR_IP            =     "UPDATE SY_ENVIRONMENT SET value = '"+$scope.application_config.MEDIATOR_IP+"' WHERE symbol = 'MEDIATOR_IP'";
        var updateStrMEDIATOR_PORT          =     "UPDATE SY_ENVIRONMENT SET value = '"+$scope.application_config.MEDIATOR_PORT+"' WHERE symbol = 'MEDIATOR_PORT'";
        var updateStrMEDIATOR_PROTOCOL      =     "UPDATE SY_ENVIRONMENT SET value = '"+$scope.application_config.MEDIATOR_PROTOCOL+"' WHERE symbol = 'MEDIATOR_PROTOCOL'";
        var updateStrWINGS_ASSETS_REMOTE_UPDATE_LINK = "UPDATE SY_ENVIRONMENT SET value = '"+$scope.application_config.WINGS_ASSETS_REMOTE_UPDATE_LINK+"' WHERE symbol = 'WINGS_ASSETS_REMOTE_UPDATE_LINK'";
        var updateStrWINGS_ASSETS_REMOTE_SETUP_LINK = "UPDATE SY_ENVIRONMENT SET value = '"+$scope.application_config.WINGS_ASSETS_REMOTE_SETUP_LINK+"' WHERE symbol = 'WINGS_ASSETS_REMOTE_SETUP_LINK'";
        var updateStrWINGS_STATICASSETS_REMOTE_SETUP_LINK = "UPDATE SY_ENVIRONMENT SET value = '"+$scope.application_config.WINGS_STATICASSETS_REMOTE_SETUP_LINK+"' WHERE symbol = 'WINGS_STATICASSETS_REMOTE_SETUP_LINK'";
        var updateStrTAIL_NUMBER = "UPDATE SY_ENVIRONMENT SET value='"+$scope.application_config.TAIL_NUMBER.toUpperCase()+"' WHERE symbol='TAIL_NUMBER'";
        var updateStrSTATION = "UPDATE SY_ENVIRONMENT SET value='"+$scope.application_config.STATION.toUpperCase()+"' WHERE symbol='STATION'";

        // Mediator 
        WingsConfigurationDBService.executeSql(updateStrMEDIATOR_IP, []);
        WingsConfigurationDBService.executeSql(updateStrMEDIATOR_PORT, []);
        WingsConfigurationDBService.executeSql(updateStrMEDIATOR_PROTOCOL, []).then(
                function(results) {
                    if ($scope.application_config.MEDIATOR_PROTOCOL =="http"){
                         $scope.protocolStatus = true;
                    } else {
                         $scope.protocolStatus = false;
                      }
                },
                function(error) {
                    WingsDialogService.alert("Mediator PROTOCOL : \n"+ JSON.stringify(error), 'Error', 'OK');
                }
        );
        WingsConfigurationDBService.executeSql(updateStrWINGS_ASSETS_REMOTE_UPDATE_LINK, []);
        WingsConfigurationDBService.executeSql(updateStrWINGS_ASSETS_REMOTE_SETUP_LINK, []);
        WingsConfigurationDBService.executeSql(updateStrWINGS_ASSETS_REMOTE_SETUP_LINK, []);
        WingsConfigurationDBService.executeSql(updateStrWINGS_STATICASSETS_REMOTE_SETUP_LINK, []);
        WingsConfigurationDBService.executeSql(updateStrTAIL_NUMBER, []);
        WingsConfigurationDBService.executeSql(updateStrSTATION, []);

        var userId   = $scope.application_config.userId;
        var password = $scope.application_config.password;
        //REMOTE DB CHECK DEPRECATED WITH COUCH DB 
        if (password.length > 0) {
            var sql = "Select * From Sy_Users where User_Id = ? And (Password_Hash = ? Or Password_Hash = ?)";
            WingsTransactionDBService.executeSql(sql,[angular.uppercase(userId),angular.uppercase(md5.createHash(password)),angular.uppercase(md5.createHash(password.toUpperCase()))]).then(function (result) {
                if (result.length > 0) {
                    var sql2 = "Update Sy_Environment     "+
                                "   Set Value  = ?         "+
                                " Where Symbol = 'USER_ID' ";
                     var sql3 = "Update Sy_Environment         "+
                                "   Set Value  = ?             "+
                                " Where Symbol = 'PASSWORD' ";
                     WingsConfigurationDBService.executeSql(sql2, [userId.toUpperCase()]);
                     WingsConfigurationDBService.executeSql(sql3, [password]);
                     $timeout(function() {
                         WingsDialogService.success();  
                    }, 1000);
                } else {
                    WingsDialogService.alert('Invalid User or Password', 'Error', 'OK');  
                }
            },function (error) {
                console.log(error);
            });
        } else {
            var sql2 = "Update Sy_Environment     "+
                        "   Set Value  = ?         "+
                        " Where Symbol = 'USER_ID' ";
             var sql3 = "Update Sy_Environment         "+
                        "   Set Value  = ?             "+
                        " Where Symbol = 'PASSWORD' ";
             WingsConfigurationDBService.executeSql(sql2, ['']);
             WingsConfigurationDBService.executeSql(sql3, ['']);
             WingsDialogService.alert('Process Completed!', 'Success', 'OK');  
        }

        var linksql  = "Select Value,                                                    " +
                       "       Symbol                                                    " +
                       "  From Sy_Environment                                            " +
                       " Where Symbol In ('NOTIFICATION_SERVICE','MOBILE_SETUP_SERVICE','REPORT_CUSTOM') " +
                       " Order By Symbol desc                                            ";
        var linkSqlArr = [{queryStr : linksql, queryType: "READ" }];
        var linkSqlStr = JSON.stringify(linkSqlArr);
        WingsRemoteDbService.executeQuery(linkSqlStr).then (function (result) {
            var obj = JSON.parse(result[0].rows);
            _.forEach(obj, function(n) {
                if (n.symbol == "NOTIFICATION_SERVICE") {
                    $scope.application_config.NOTIFICATION_SERVICE=n.value;
                    var notificationUrlSql = "UPDATE SY_ENVIRONMENT SET value = '"+n.value+"' WHERE symbol = 'NOTIFICATION_SERVICE'";
                    WingsConfigurationDBService.executeSql(notificationUrlSql, []);
                } else if (n.symbol == "MOBILE_SETUP_SERVICE") {
                    WINGS_CONFIG.COUCHDB_URL = n.value;
                    $scope.application_config.COUCHDB_URL= $scope.hideIdPw(n.value);
                    var setupDBSql = "UPDATE SY_ENVIRONMENT SET value = '"+n.value+"' Where Symbol = 'COUCHDB_URL'";
                    WingsConfigurationDBService.executeSql(setupDBSql, []);
                }  else if (n.symbol == "REPORT_CUSTOM") {
                    $scope.application_config.DEPLOY_CHANNEL=n.value.substr(1).toLowerCase();
                    WINGS_CONFIG.DEPLOY_CHANNEL = n.value.substr(1).toLowerCase();
                    var setupDBSql = "UPDATE SY_ENVIRONMENT SET value = '"+n.value.substr(1).toLowerCase()+"' Where Symbol = 'DEPLOY_CHANNEL'";
                    WingsConfigurationDBService.executeSql(setupDBSql, []);
                }         
            });
            sy.SyncronizeDB();
            $timeout(function() {
                $rootScope.$broadcast('DBSOpened');
           }, 1500);
        },function (error) {
            WingsDialogService.alert("Notification and DB links could not taken.This features will not work properly.", 'Warning', 'OK');
            console.log(error);
        });
    }; 
    
    $scope.setProtocol = function (status){
        if (status) {
            $scope.application_config.MEDIATOR_PROTOCOL = "http";
         } else {
              $scope.application_config.MEDIATOR_PROTOCOL = "https";
         }
    };

    $scope.cancelSettings = function() {
       $scope.modalMediatorSettings.hide();
    };
    
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modalMediatorSettings.remove();
    });
     
// MEDIATOR_SETTINGS
      
      
//APPLICATION EXIT
    $scope.exitApp = function(){
        WingsDialogService.confirm('Are you sure ?', 'Exit Application', ['Ok','Cancel']).then(function(buttonIndex) {
          // no button = 0, 'Ok' = 1, 'Cancel' = 2
          var btnIndex = buttonIndex;
          if(btnIndex == 1){
              ionic.Platform.exitApp();
          }else{
              console.log("not exit");
          }
        });
        
    };
// APPLICATION RESTART
    $scope.restartApp = function(){
        document.location.href = 'index.html';
    };
// EXPORT DB
    
    $scope.exportDbSQL = function(){
        var successFn = function(sql, count){
            console.log("Exported SQL: "+sql);
            alert("Exported SQL contains "+count+" statements");
        };
        cordova.plugins.sqlitePorter.exportDbToSql(WingsConfigurationDB, {
            successFn: successFn
        });
    };
    
    $scope.exportDbJSON = function(){
        var successFn = function(json, count){
            console.log("Exported JSON: "+json);
            alert("Exported JSON contains equivalent of "+count+" SQL statements");
        };
        cordova.plugins.sqlitePorter.exportDbToJson(WingsConfigurationDB, {
            successFn: successFn
        });
    };
    
    
    $scope.importSqlToDb = function(){
        var sql = "CREATE TABLE Artist ([Id] PRIMARY KEY, [Title]);"+
        "INSERT INTO Artist(Id,Title) VALUES ('1','Fred');INSERT INTO Artist(Id,Title) VALUES ('2','Fred2');INSERT INTO Artist(Id,Title) VALUES ('3','3Fred');";
        var successFn = function(count){
            alert("Successfully imported "+count+" SQL statements to DB");
        };
        var errorFn = function(error){
            alert("The following error occurred: "+error.message);
        };
        var progressFn = function(current, total){
            console.log("Imported "+current+"/"+total+" statements");
        };
        cordova.plugins.sqlitePorter.importSqlToDb(WingsConfigurationDB, sql, {
            successFn: successFn,
            errorFn: errorFn,
            progressFn: progressFn
        });
    };
    $scope.setUserId = function () {
        
    };
    $scope.hideIdPw = function(url) {
        if (url.indexOf("https") >= 0){
            var partOne = url.substring(0,8); // https://
        } else {
            var partOne = url.substring(0,7); // http://
        }
        var partTwo = url.substring(url.indexOf("@")+ 1,url.length);
        return partOne+partTwo;
    };
       
    if (window.innerHeight < 700) {
    	$scope.isFit = false;	
    }
    else {
        $scope.isFit = true;
    }
    
    $scope.focusElement = function(){
        if (!$scope.isFit){
    	    $('#loginImg').animate({opacity:0}, 100);
    	    $('#loginList').animate({top: '-=150px', opacity:1}, 100);
    	    $('#loginButton').animate({opacity:1}, 100);
        }
    };

    $scope.blurElement = function(){
    	if (!$scope.isFit){
    	    $('#loginImg').animate({opacity:1}, 100);
    	    $('#loginList').animate({top: '+=150px', opacity:0.8}, 100);
    	    $('#loginButton').animate({opacity:0.8}, 100);
    	}
    };
    
    $scope.listDir = function (){
        var wingsAssetsParentFolder=$rootScope.globals.wingsAssetsParentFolder;
        //path =cordova.file.dataDirectory+"databases";
        path =wingsAssetsParentFolder+$rootScope.globals.wingsAssetsFolderName;
        //path =cordova.file.applicationStorageDirectory;
        //path =cordova.file.applicationStorageDirectory+"databases";
        console.log("path3 "+path);
          window.resolveLocalFileSystemURL(path,
            function (fileSystem) {
              var reader = fileSystem.createReader();
              reader.readEntries(
                function (entries) {
                  console.log("Directory entries");
                  
                  var i;
                  for (i=0; i<entries.length; i++) {
                   console.log("DATA DIRECTORY LIST : entries.name : "+ " [" + (new Date()) + "]\t "+entries[i].name+"\n");
                  }
                  //console.log("entries.name : "+JSON.stringify(entries)+"\n");
                },
                function (error) {
                  console.log("ERROR1 : "+JSON.stringify(error));
                }
              );
            }, function (error) {
             console.log("ERROR2 : "+JSON.stringify(error));
            }
          );
        }
}
]);