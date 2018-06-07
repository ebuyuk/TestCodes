var wingsApplicationUpdateModule = angular.module('wings.mobile.modules.ApplicationUpdate', [ 'ngCordova' ]);

wingsApplicationUpdateModule.factory('WingsApplicationUpdateService', ['Restangular','WINGS_CONFIG','WingsGlobalManager', 
                                                                       '$injector', '$cordovaFileTransfer','$cordovaFile','$q',
                                                                       '$state',
                                                                       '$urlRouter',
                                                                       '$rootScope',
                                                                       'WINGS_ERROR_CODES',
                                                                       'WingsTransactionDBService',
                                                                       'WingsSetupDBService',
                                                                       '$timeout',
                                                                       function(Restangular,WINGS_CONFIG,WingsGlobalManager,
                                                                               $injector,$cordovaFileTransfer,$cordovaFile,$q,$state,$urlRouter,$rootScope,WINGS_ERROR_CODES,WingsTransactionDBService,WingsSetupDBService,$timeout){
    
    
    var wingsAssetsParentFolder=$rootScope.globals.wingsAssetsParentFolder;
    var WingsLocalDbServiceRef = $injector.get('WingsSetupDBService');
    var WingsCordovaFileTransferRef=$cordovaFileTransfer;
    var WingsCordovaFileRef=$cordovaFile;
    var WingsQRef=$q;
    
    // this is service object with list of methods in it this object will be used by controller
    var service = {
        name:name,
        checkApplicationFilesUpdate:checkApplicationFilesUpdate,
        LoadControllerStateAndViews:LoadControllerStateAndViews,
        //installApplcationUpdate:installApplcationUpdate,
        CheckWingsAssets:CheckWingsAssets,
        CheckFirstTimeWingsAssetsSetup:CheckFirstTimeWingsAssetsSetup,
        isWingsConfigDbFileExist:isWingsConfigDbFileExist,
        isWingsTransactionDbFileExist:isWingsTransactionDbFileExist,
        //CopyWingsSetupDBToItsDestination:CopyWingsSetupDBToItsDestination,
        //CheckWingsStaticAssets:CheckWingsStaticAssets,
        CopyTransactionDBFromDeployToItsDestination:CopyTransactionDBFromDeployToItsDestination,
        openWingsTransactionDB:openWingsTransactionDB
    };
    function name(){
        return "WingsApplicationUpdateService";
    }
    function CheckWingsAssets() {
        var deferred = WingsQRef.defer();
        WingsCordovaFileRef.checkDir(wingsAssetsParentFolder, $rootScope.globals.wingsAssetsFolderName).then(function (success) {
            DownloadAndUnzipWingsAssets().then(function(success) {
                return deferred.resolve("GOHEAD");
            }, function(error) {
                return deferred.reject("CheckWingsAssets-CANNOT DOWNLOAD WINGS STATIC ASSETS SETUP FILE : " +JSON.stringify(error));
            });
        },function (error) {
            if($rootScope.globals.deviceConnectionInfo.type == 'none') {
                return deferred.reject("CheckWingsAssets-THIS OPERATION REQUIRES NETWORK CONNECTION BUT YOU DO NOT HAVE A NETWORK CONNECTION. PLEASE CHECK YOUR CONNECTION");
            }
            WingsCordovaFileRef.createDir(wingsAssetsParentFolder, $rootScope.globals.wingsAssetsFolderName, false).then(function (success) {
                DownloadAndUnzipWingsAssets().then(function(success) {
                          
                }, function(error) {
                    return deferred.reject("CheckWingsAssets-CANNOT DOWNLOAD WINGS SETUP FILE : " +JSON.stringify(error));
                });
            }, function (error) {
                return deferred.reject("CANNOT CREATE WINGS_ASSESTS FOLDER : " +JSON.stringify(error));
            });
        });
        return  deferred.promise;
    }
    /*function DownloadAndUnzipWingsAssets(){
        var deferred = WingsQRef.defer();
        var downloadURL =WINGS_CONFIG.WINGS_ASSETS_REMOTE_SETUP_LINK;
        var localDownloadPath = $rootScope.globals.wingsDupFileDownloadPath;
        var trustHosts = true
        var options = {};
        var headers={};
        headers['divNo']='1';
        headers['uuid']=$rootScope.globals.deviceInformation.uuid;
        headers['deviceName']=JSON.stringify($rootScope.globals.deviceInformation.device);
        options.headers = headers;
        $cordovaFileTransfer.download(downloadURL, localDownloadPath, options, trustHosts).then(function(success) {
            var unzipSrc = localDownloadPath;
            var unzipDest = $rootScope.globals.wingsAssetsUzipFolderAfterDownload;
            $cordovaFile.removeRecursively($rootScope.globals.wingsAssetsParentFolder, $rootScope.globals.wingsAssetsFolderName).then(function (success) {
                $cordovaZip.unzip(unzipSrc,unzipDest).then(function (success) {
                    return deferred.resolve("GOHEAD");
                }, function(error) {
                    return deferred.reject("DownloadAndUnzipWingsAssets-UNZIP ERROR" +JSON.stringify(error));
                });
            }, function(error) {
                return deferred.reject("DownloadAndUnzipWingsAssets-UNZIP ERROR" +JSON.stringify(error));
            });
        },function(error) {
            return deferred.reject('DownloadAndUnzipWingsAssets-CANNOT DOWNLOAD ZIP FILE'+JSON.stringify(error));
        });
        return  deferred.promise;
    };*/
    
    /*function CheckWingsStaticAssets(){
        var deferred = WingsQRef.defer();
        WingsCordovaFileRef.checkDir($rootScope.globals.wingsStaticAssetsParentFolder, $rootScope.globals.wingsStaticAssetsFolderName).then(function (success) {
            DownloadAndUnzipWingsStaticAssets().then(function(success) {
                return deferred.resolve("GOHEAD");
            }, function(error) {
                return deferred.reject("CheckWingsStaticAssets-CANNOT DOWNLOAD WINGS STATIC ASSETS SETUP FILE : " +JSON.stringify(error));
            });
        },function (error) {
            WingsCordovaFileRef.createDir($rootScope.globals.wingsStaticAssetsParentFolder, $rootScope.globals.wingsStaticAssetsFolderName, false).then(function (success) {
                DownloadAndUnzipWingsStaticAssets().then(function(success) {
                    return deferred.resolve("GOHEAD");
                }, function(error) {
                    return deferred.reject("CheckWingsStaticAssets-CANNOT DOWNLOAD STATIC ASSETS SETUP FILE : " +JSON.stringify(error));
                });
            }, function (error) {
                return deferred.reject("CANNOT CREATE WINGS_STATICASSESTS FOLDER : " +JSON.stringify(error));
            });
        });
        return  deferred.promise;
    };
     
    /*function DownloadAndUnzipWingsStaticAssets(){
        var deferred = WingsQRef.defer();
        var downloadURL = WINGS_CONFIG.WINGS_STATICASSETS_REMOTE_SETUP_LINK;
        var localDownloadPath = $rootScope.globals.wingsStaticAssestsDupFileDownloadPath;
        var trustHosts = true
        var options = {};
        var headers={};
        headers['divNo']='1';
        headers['uuid']=$rootScope.globals.deviceInformation.uuid;
        headers['deviceName']=JSON.stringify($rootScope.globals.deviceInformation.device);         
        options.headers = headers;
        $cordovaFileTransfer.download(downloadURL, localDownloadPath, options, trustHosts).then(function(success) {
            console.log("DownloadAndUnzipWingsStaticAssets-WINGS STATIC ASSETS SETUP FILE DOWNLOAD DONE..." +JSON.stringify(success));
            var unzipSrc=localDownloadPath;
            var unzipDest=$rootScope.globals.wingsStaticAssetsUzipFolderAfterDownload;
            $cordovaZip.unzip(unzipSrc,unzipDest).then(function (success) {
                console.log('DownloadAndUnzipWingsStaticAssets-UNZIP SUCCESS'+unzipDest);
                return deferred.resolve("GOHEAD");
            }, function(error) {
                console.log('DownloadAndUnzipWingsStaticAssets-UNZIP ERROR'+unzipDest);
                return deferred.reject("DownloadAndUnzipWingsStaticAssets-UNZIP ERROR" +JSON.stringify(error));
            });
        },function(error) {
            console.log('DownloadAndUnzipWingsStaticAssets-CANNOT DOWNLOAD ZIP FILE'+JSON.stringify(error));
            return deferred.reject('DownloadAndUnzipWingsStaticAssets-CANNOT DOWNLOAD ZIP FILE'+JSON.stringify(error));
        });
        return  deferred.promise;
    };*/

    function CheckFirstTimeWingsAssetsSetup(){
        var deferred = WingsQRef.defer();
        WingsCordovaFileRef.checkDir(wingsAssetsParentFolder, $rootScope.globals.wingsAssetsFolderName).then(function (success) {
            openWingsTransactionDB();
            return deferred.resolve("GOHEAD");
        }, function (error) {
            WingsCordovaFileRef.createDir(wingsAssetsParentFolder, $rootScope.globals.wingsAssetsFolderName, false).then(function (success) {
                $cordovaFile.copyDir(cordova.file.applicationDirectory+"www", "setup", wingsAssetsParentFolder+$rootScope.globals.wingsAssetsFolderName, $rootScope.globals.wingsAssetsSubSetupFolderName).then(function (success) {
                    CopyWingsTransactionDBToItsDestination().then(function (success) {
                        openWingsTransactionDB();
                        return deferred.resolve("GOHEAD");
                        /*CheckWingsStaticAssets().then(function(success) {
                            return deferred.resolve("GOHEAD");
                        },function(error) {
                            return deferred.reject("CheckFirstTimeWingsAssetsSetup - STEP 1.3 (Error) : -  During copying WingsTransactionDb : " +JSON.stringify(error));
                        });*/
                    }, function (error) {
                        return deferred.reject("CheckFirstTimeWingsAssetsSetup - STEP 1.4 (Error) : -  During copying WingsTransactionDb : " +JSON.stringify(error));
                    });
                  }, function (error) {
                      return deferred.reject("CheckFirstTimeWingsAssetsSetup - STEP 1.2 (Error) : - create setup folder from apk source : "+JSON.stringify(error));
                });
              }, function (error) {
                  return deferred.reject("CheckFirstTimeWingsAssetsSetup - STEP 1.1 (Error) : - createDir- Cannot create assets folder : " +JSON.stringify(error));
             });
          });
        return  deferred.promise;
    };
    
    function isWingsConfigDbFileExist() {
        var deferred = WingsQRef.defer();
        $cordovaFile.checkFile($rootScope.globals.wingsConfigurationDB.workingDirectory, $rootScope.globals.wingsConfigurationDB.name).then(function (success) {
            return deferred.resolve("GOHEAD");
        }, function (error) {
            return deferred.reject("isWingsConfigDbFileExist - File check error WingsConfigDb " +JSON.stringify(error));
        });
        return  deferred.promise;
    };

    function isWingsTransactionDbFileExist() {
        var deferred = WingsQRef.defer();
        $cordovaFile.checkFile($rootScope.globals.wingsTransactionDB.dupFilePath, $rootScope.globals.wingsTransactionDB.name).then(function (success) {
            openWingsTransactionDB();
            return deferred.resolve("GOHEAD");
        }, function (error) {
            WingsCordovaFileRef.createDir(wingsAssetsParentFolder, $rootScope.globals.wingsAssetsFolderName, false).then(function (success) {
                $cordovaFile.copyDir(cordova.file.applicationDirectory+"www", "setup", wingsAssetsParentFolder+$rootScope.globals.wingsAssetsFolderName, $rootScope.globals.wingsAssetsSubSetupFolderName).then(function (success) {
                    CopyWingsTransactionDBToItsDestination().then(function (success) {
                        openWingsTransactionDB();
                        return deferred.resolve("GOHEAD");
                    }, function (error) {
                        return deferred.reject("CheckFirstTimeWingsAssetsSetup - STEP 1.4 (Error) : -  During copying WingsTransactionDb : " +JSON.stringify(error));
                    });
                  }, function (error) {
                      return deferred.reject("CheckFirstTimeWingsAssetsSetup - STEP 1.2 (Error) : - create setup folder from apk source : "+JSON.stringify(error));
                });
              }, function (error) {
                  return deferred.reject("CheckFirstTimeWingsAssetsSetup - STEP 1.1 (Error) : - createDir- Cannot create assets folder : " +JSON.stringify(error));
             });
          });
        return  deferred.promise;
    };

    function openWingsTransactionDB(){
        WingsTransactionDBService.openDB();
    };

    function isTransactionDbReplacable(){
        return true;
    };

    function CopyWingsTransactionDBToItsDestination() { 
        var deferred = WingsQRef.defer();
            console.log("TRANSACTION DB IS GOING TO BE REPLACED.....");
            $cordovaFile.checkFile($rootScope.globals.wingsTransactionDB.dupFilePath, $rootScope.globals.wingsTransactionDB.name).then(function (success) {
                $cordovaFile.removeFile($rootScope.globals.wingsTransactionDB.dupFilePath, $rootScope.globals.wingsTransactionDB.name).then(function (success1) {
                    $cordovaFile.copyFile($rootScope.globals.wingsAssetsUzipFolderAfterDownload, $rootScope.globals.wingsTransactionDB.nameOnServer,
                        $rootScope.globals.wingsTransactionDB.dupFilePath, $rootScope.globals.wingsTransactionDB.name).then(function (success) {
                        return deferred.resolve("GOHEAD");
                    }, function (error) {
                        return deferred.reject("ERROR DURING COPING WINGS TRANSACTION DB -1 : "+JSON.stringify(error));
                    });
                 }, function (error) {
                     return deferred.reject("CANNOT REMOVE EX DB FILE "+JSON.stringify(error));
                 });
            }, function (error) {
                $cordovaFile.copyFile($rootScope.globals.wingsAssetsUzipFolderAfterDownload, $rootScope.globals.wingsTransactionDB.nameOnServer,
                    $rootScope.globals.wingsTransactionDB.dupFilePath, $rootScope.globals.wingsTransactionDB.name).then(function (success) {
                     return deferred.resolve("GOHEAD");
                }, function (error) {
                    return deferred.reject("ERROR DURING COPING WINGS TRANSACTION DB -1 : "+JSON.stringify(error));
                });
            });
        return  deferred.promise;
    };

    function CopyTransactionDBFromDeployToItsDestination(info) { 
        var deferred = WingsQRef.defer();
        console.log("TRANSACTION DB IS GOING TO BE REPLACED FROM DEPLOY.....");
        $cordovaFile.checkFile($rootScope.globals.wingsTransactionDB.dupFilePath, $rootScope.globals.wingsTransactionDB.name).then(function (success) {
            WingsTransactionDBService.closeDB(function () {
                $cordovaFile.copyFile($rootScope.globals.wingsIonicSnapshotPath+info.deploy_uuid+"/setup/", $rootScope.globals.wingsTransactionDB.name,
                                      $rootScope.globals.wingsTransactionDB.dupFilePath, $rootScope.globals.wingsTransactionDB.name).then(function (success) {
                    openWingsTransactionDB();
                }, function (error) {
                });
            },function () {
                $cordovaFile.copyFile($rootScope.globals.wingsIonicSnapshotPath+info.deploy_uuid+"/setup/", $rootScope.globals.wingsTransactionDB.name,
                                      $rootScope.globals.wingsTransactionDB.dupFilePath, $rootScope.globals.wingsTransactionDB.name).then(function (success) {
                    openWingsTransactionDB();
                }, function (error) {
                });
            });
            return deferred.resolve("GOHEAD");
        }, function (error) {
            $cordovaFile.copyFile($rootScope.globals.wingsIonicSnapshotPath+info.deploy_uuid+"/setup/", $rootScope.globals.wingsTransactionDB.nameOnServer,
                                  $rootScope.globals.wingsTransactionDB.dupFilePath, $rootScope.globals.wingsTransactionDB.name).then(function (success) {
                openWingsTransactionDB();
                return deferred.resolve("GOHEAD");
            }, function (error) {
                return deferred.reject("ERROR DURING COPING WINGS TRANSACTION DB -1 : "+JSON.stringify(error));
            });
        });
        return deferred.promise;
    };

    function defineStateInfo(currentResult) {
        console.log("defineStateInfo: "+currentResult.CONTROLLER+" - START");
        var deferred = WingsQRef.defer();
        var stateListArr=angular.toJson($state.get());
        WingsCordovaFileRef.readAsText($rootScope.globals.wingsStateFilesDirectory, currentResult.TEMPLATE_URL).then(function (fileContent) {
            var stateVariable ={
                url: currentResult.URL,
                abstract: (currentResult.ABSTRACT == 1) ? true : false,
                data:{
                    programId:currentResult.PROGRAM_ID
                }
            };
            if (currentResult.PARENT_CONTROLLER){
                stateVariable['views']={};
                stateVariable.views[currentResult.PARENT_CONTROLLER]={};
                stateVariable.views[currentResult.PARENT_CONTROLLER].template=fileContent;
                if (currentResult.CONTROLLER) {
                    stateVariable.views[currentResult.PARENT_CONTROLLER].controller=currentResult.CONTROLLER;
                }
            } else {
                stateVariable.template=fileContent;
                if (currentResult.CONTROLLER) {
                    stateVariable.controller = currentResult.CONTROLLER;
                }
            }
            WingsGlobalStateProviderRef.state(currentResult.STATE, stateVariable);
                return deferred.resolve(currentResult);
            }, function (error) {
               deferred.reject(currentResult.TEMPLATE_URL+ " CANNOT READ TEMPLATE FILE...." +JSON.stringify(error));
            });
        return deferred.promise;
    };

    function defineControllerInfo(currentResult){
        console.log("registerController: "+currentResult.CONTROLLER+" - START");
        var deferred = WingsQRef.defer();
        WingsCordovaFileRef.readAsText($rootScope.globals.wingsControllerFilesDirectory, currentResult.CONTROLLER_FILE_NAME).then(function (fileContent) {
        	try {
        		eval("("+fileContent+")");
        		registerController("WingsMobileStarter", currentResult.CONTROLLER);
        		console.log("registerController: "+currentResult.CONTROLLER+" - END");
        	} catch (e) {
        		console.log('ERROR Reading Controller File in : '+currentResult.CONTROLLER_FILE_NAME+'  '+e);
        	}
            return deferred.resolve(currentResult);
        }, function (error) {
            console.log(currentResult.CONTROLLER + " CANNOT READ CONTROLLER FILE...." +JSON.stringify(error));
            deferred.reject(currentResult.CONTROLLER + " CANNOT READ CONTROLLER FILE...." +JSON.stringify(error));
     });
        return  deferred.promise;
    };

    function LoadControllerStateAndViews(){
        var deferred = WingsQRef.defer();
        var promises = [];
        var promises1 = [];
        var promises2 = [];

        var programs = [];
        // READ VIEWS FROM LOCAL
        var sql = "Select * From Sy_Programs Where Active = 'Y' Order By Application_Abstract";
        WingsTransactionDBService.executeSql(sql,[]).then(function (result) {
            for(var i = 0; i < result.length;i++) {
                var obj = {'PROGRAM_ID': result[i].PROGRAM_ID,
                           'STATE': result[i].APPLICATION_STATE,
                           'URL': result[i].APPLICATION_URL,
                           'CONTROLLER': result[i].APPLICATION_CONTROLLER,
                           'CONTROLLER_FILE_NAME': result[i].APPLICATION_CONTROLLER_FILE,
                           'TEMPLATE_URL': result[i].APPLICATION_TEMPLATE_URL,
                           'TEMPLATE': result[i].APPLICATION_TEMPLATE,
                           'ABSTRACT': result[i].APPLICATION_ABSTRACT,
                           'PARENT_CONTROLLER': result[i].APPLICATION_PARENT_CONTROLLER
                };
                programs.push(obj);
            }
            for (var i = 0; i < 15; i++) {
                var currentResult=programs[i];
                var existingState = $state.get(currentResult.STATE)
                if (existingState !== null) {
                    continue; 
                }
                if (currentResult.STATE !== 'signin') {
                    if (currentResult.CONTROLLER) {
                        promises.push(defineControllerInfo(currentResult));
                    }
                    promises.push(defineStateInfo(currentResult));
                }
            }
            $q.all(promises).then(function(res) {
            	for (var j = 15; j < 30; j++) {
                    var currentResult1 = programs[j];
                    var existingState1 = $state.get(currentResult1.STATE)
                    if (existingState1 !== null) {
                        continue; 
                    }
                    if (currentResult1.STATE !== 'signin') {
                        if (currentResult1.CONTROLLER) {
                            promises1.push(defineControllerInfo(currentResult1));
                        }
                        promises1.push(defineStateInfo(currentResult1));
                    }
                }
            	$q.all(promises1).then(function(res) {
            		 for (var k = 30; k < programs.length; k++) {
                         var currentResult2 = programs[k];
                         var existingState2 = $state.get(currentResult2.STATE)
                         if (existingState2 !== null) {
                             continue; 
                         }
                         if (currentResult2.STATE !== 'signin') {
                             if (currentResult2.CONTROLLER) {
                                 promises2.push(defineControllerInfo(currentResult2));
                             }
                             promises2.push(defineStateInfo(currentResult2));
                         }
                     }
            		$q.all(promises2).then(function(res) {
                        $urlRouter.sync();
                        $urlRouter.listen();
                        return deferred.resolve("GOHEAD");
                    },function(error) {
                        deferred.reject("CANNOT LOAD FILE  - ERROR : \n "+JSON.stringify(error));
                    });
                },function(error) {
                    deferred.reject("CANNOT LOAD FILE  - ERROR : \n "+JSON.stringify(error));
                });
            },function(error) {
                deferred.reject("CANNOT LOAD FILE  - ERROR : \n "+JSON.stringify(error));
            });
        },function(error) {
            deferred.reject("CANNOT READ VIEWS FROM WINGS DB  - ERROR : \n"+JSON.stringify(error));
        });
        return  deferred.promise;
    }
    function checkApplicationFilesUpdate(){
         console.log("[WingsApplicationUpdateService][checkForUpdate] : "+" [" + (new Date()) + "]\n");
         return Restangular.all(WINGS_CONFIG.FETCH_FILE).one(WINGS_CONFIG.CHECK_APPLICATION_FILES_UPDATE_PATH).get();
         //return Restangular.all(WINGS_CONFIG.CHECK_APPLICATION_FILES_UPDATE_PATH).getList();
     }; 
    
    function registerController(moduleName, controllerName) {
        // Here I cannot get the controller function directly so I
        // need to loop through the module's _invokeQueue to get it
        var queue = angular.module(moduleName)._invokeQueue;
        for (var i=0; i<queue.length; i++) {
            var call = queue[i];
            if (call[0] == "$controllerProvider" &&
                call[1] == "register" &&
                call[2][0] == controllerName) {
                WingsGlobalControllerProvider.register(controllerName, call[2][1]);
            }
        }
    };

    function listDir(path) {
        window.resolveLocalFileSystemURL(path,function (fileSystem) {
            var reader = fileSystem.createReader();
            reader.readEntries(function (entries) {
                console.log("Directory entries");
                for (var i=0; i<entries.length; i++) {
                    console.log("DATA DIRECTORY LIST : entries.name : "+ " [" + (new Date()) + "]\t "+entries[i].name+"\n");
                }
            },function (err) {
                console.log(err);
            });
        }, function (err) {
            console.log(err);
        });
    };
    
    return service;
}]);
