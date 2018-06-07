angular.module('WingsMobileStarter').controller('HomeCtrl', [
        '$scope',
        'WingsSessionManager',
        '$state',
        '$cordovaSQLite',
        '$cordovaFile',
        '$ionicModal',
        'WingsRemoteDbService',
        'WingsSocketService',
        '$cordovaVibration',
        '$cordovaDialogs',
        'WingsLocalNotificationService',
        '$ionicPlatform',
        '$ionicHistory',
        '$cordovaGeolocation',
        'sy',
        'WingsUtil',
        'WingsTransactionDBService',
        //START_CONTROLLER
        function($scope,WingsSessionManager,$state,$cordovaSQLite,$cordovaFile,$ionicModal,WingsRemoteDbService,WingsSocketService,
                $cordovaVibration,$cordovaDialogs,WingsLocalNotificationService,$ionicPlatform,$ionicHistory,$cordovaGeolocation,sy,WingsUtil,WingsTransactionDBService) {
            
            
            
        	sy.SyncronizeDB();
            //sy.SyncronizeDB('SETUPDB','MOBILE')
            console.log('HOME Controller');
            $rootScope.$emit("CallParentMethod", {});

            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            var programColors = [
                {
                    programId : 'MM_M087',
                    color     : '#2A5696'
                },
                {
                    programId : 'MM_M062',
                    color     : '#1D7044'
                },
                {
                    programId : 'MM_M052',
                    color     : '#DD4424'
                },
                {
                    programId : 'MM_M051',
                    color     : '#1A0DAB'
                },
                {
                    programId : 'TM_M051',
                    color     : '#FFC107'
                },
                {
                    programId : 'IC_M055',
                    color     : '#F99E18'
                },
                {
                    programId : 'IC_M063',
                    color     : '#1D7044'
                },
                {
                    programId : 'IC_M065',
                    color     : '#2A5696'
                },
                {
                    programId : 'LB_M100',
                    color     : '#01885B'
                },
                {
                    programId : 'LB_M101',
                    color     : '#ED6A09'
                },
                {
                    programId : 'LB_M169',
                    color     : '#0E2688'
                },
                {
                    programId : 'PR_M108',
                    color     : '#609'
                },
                {
                    programId : 'PR_M115',
                    color     : '#223DFF'
                },
                {
                    programId : 'PR_M116',
                    color     : '#FF8D22'
                },
                {
                    programId : 'PR_M100',
                    color     : '#C34492'
                },
                {
                    programId : 'PR_M118',
                    color     : '#0E26B8'
                },
                {
                    programId : 'PR_M119',
                    color     : '#F00734'
                },
                {
                    programId : 'PR_M117',
                    color     : '#02C9F2'
                },
                {
                    programId : 'SY_M013',
                    color     : '#01885B'
                },
                {
                    programId : 'SY_M000',
                    color     : '#000000'
                },
                {
                    programId : 'GN_M005',
                    color     : '#0e2688'
                },
                {
                    programId : 'PR_M052',
                    color     : '#DD4424'
                },
                {
                    programId : 'PR_M100',
                    color     : '#2A5696'
                }
                
            ];
                    
            $scope.getColorCodes = function (programId) {
                var temp = _.find(programColors, { 'programId': programId });
                return temp.color;
            }
            
            
            /*var posOptions = {timeout: 20000, enableHighAccuracy: false};
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                var lat  = position.coords.latitude
                var long = position.coords.longitude
                console.log('Latitude: '          + position.coords.latitude          + '\n' +
                        'Longitude: '         + position.coords.longitude         + '\n' +
                        'Altitude: '          + position.coords.altitude          + '\n' +
                        'Accuracy: '          + position.coords.accuracy          + '\n' +
                        'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
                        'Heading: '           + position.coords.heading           + '\n' +
                        'Speed: '             + position.coords.speed             + '\n' +
                        'Timestamp: '         + position.timestamp                + '\n');
              
              }, function(err) {
                  console.log(err);
                // error
              });*/
            
           /* var onSuccess = function(position) {
                alert('Latitude: '          + position.coords.latitude          + '\n' +
                      'Longitude: '         + position.coords.longitude         + '\n' +
                      'Altitude: '          + position.coords.altitude          + '\n' +
                      'Accuracy: '          + position.coords.accuracy          + '\n' +
                      'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
                      'Heading: '           + position.coords.heading           + '\n' +
                      'Speed: '             + position.coords.speed             + '\n' +
                      'Timestamp: '         + position.timestamp                + '\n');
            };

            // onError Callback receives a PositionError object
            //
            function onError(error) {
                alert('code: '    + error.code    + '\n' +
                      'message: ' + error.message + '\n');
            }
*/
            //navigator.geolocation.getCurrentPosition(onSuccess, onError);
            var userAgent = navigator.userAgent || navigator.vendor || window.opera;
            if (!(/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)) {
                var permissions = cordova.plugins.permissions;
                permissions.hasPermission(permissions.CAMERA, checkPermissionCallback, null);

                function checkPermissionCallback(status) {
                  if(!status.hasPermission) {
                    var errorCallback = function() {
                      console.warn('Camera permission is not turned on');
                    }

                    permissions.requestPermission(
                      permissions.CAMERA,
                      function(status) {
                        if(!status.hasPermission) errorCallback();
                      },
                      errorCallback);
                  }
                }
            }

            WingsSocketService.AddListener('GN_MESSAGE_ITEMS.INSERT','function (o){return o.EMPLOYEE_NUMBER == '+$rootScope.globals.currentUser.userNumber+'}', function(msg){
                cordova.plugins.notification.badge.increase();
                //$cordovaVibration.vibrate(1000);
                $cordovaDialogs.beep(1);
                //$cordovaDialogs.alert(msg.MESSAGE_TEXT, msg.MESSAGE_SUBJECT);
                var event = {
                        id: msg.ID,
                        title: (msg.MESSAGE_SUBJECT.replace(/<b>|<\/b>|<br>|<\/br>|<h1>|<\/h1>|<h2>|<\/h2>|<h3>|<\/h3>|<div>|<\/div>/gi, "")),
                        text:  (msg.MESSAGE_TEXT.replace(/<b>|<\/b>|<br>|<\/br>|<h1>|<\/h1>|<h2>|<\/h2>|<h3>|<\/h3>|<div>|<\/div>/gi, "")),
                        sound: '',
                        //icon:   'www/img/plane.png'
                        //icon:'res://message.png'
                        icon : 'icon.png'
                      };
                WingsLocalNotificationService.showNotification(event);
                $rootScope.$broadcast('onNotificationCreate');
            });
            WingsSocketService.AddListener('SYSTEM.ALERT',null,function(msg){
                console.log(msg.MESSAGE);
            });
            WingsSocketService.AddListener('GN_INTERFACE_DATA.EVENT','function (o){return true}',function(msg){
                console.log("geldi");

            	sy.SyncronizeDB();
            });
            function listDir(){
                //path =cordova.file.dataDirectory+"databases";
                //path =cordova.file.applicationDirectory+"www/setup" ;
                //path =cordova.file.applicationStorageDirectory;
                path =cordova.file.applicationStorageDirectory+"databases";
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
            
            $scope.DirectoryList = function() {
            /* $cordovaFile.checkDir(cordova.file.dataDirectory, "wings_assets").then(function (success) {
                    alert("SUCCESS : $cordovaFile.checkDir: "+JSON.stringify(success));
                }, function (error) {
                    alert("ERROR : $cordovaFile.checkDir: "+JSON.stringify(error));
                });*/
             
             
             listDir();
            }
            
            
            $scope.rowCount= 5;

            $scope.applications= [];
            //$scope.testDB;
            
            $scope.roles = WingsSessionManager.getRoles();
            
            /*$scope.$on('$ionicView.beforeEnter', function() {
                
                alert("$scope.menus : "+$scope.menus.length);
               });*/
            
            /*function guid() {
                  function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                      .toString(16)
                      .substring(1);
                  }
                  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
                }
            $scope.select = function() {
                var query = "SELECT * FROM TEST_SETUP";
                $cordovaSQLite.execute(WingsSetupDB,query,[]).then(function(result) {
                    if(result.rows.length > 0) {
                        //console.log("SELECTED -> " + result.rows.item(0).firstname + " " + result.rows.item(0).lastname);
                         for(var i = 0; i < result.rows.length; i++) {
                                console.log("***********************SELECTED -> " + JSON.stringify(result.rows.item(i)));
                                
                            }
                    } else {
                        console.log("NO ROWS EXIST");
                    }
                }, function(error) {
                    console.error("WingsSetupDB - ERROR : "+JSON.stringify(error));
                });
            };*/
            
        /*    $scope.insert = function() {
                var uuid = guid();
                var firstname ="FN"+uuid;
                var lastname="LN"+uuid;
                var query = "INSERT INTO TEST_SETUP ('FIRSTNAME', 'LASTNAME') VALUES (?,?)";
                $cordovaSQLite.execute(WingsSetupDB,query,[firstname,lastname]).then(function(result) {
                    console.log("INSERT ID -> " + result.insertId);
                }, function(error) {
                    console.error(error);
                });
            };*/
            $scope.uploadDB = function () {
                 var options = {
                          fileName: "test01.jpg",
                          chunkedMode: true,
                          mimeType: "image/jpg",
                          params :{
                              userId:$rootScope.globals.currentUser.userId,
                              deviceId: $rootScope.globals.deviceInformation.uuid
                          }
                      };
                 $cordovaFileTransfer.upload(WINGS_CONFIG.MEDIATOR_URL+"/fileservice/exportDb", $rootScope.globals.wingsTransactionDB.dupFilePath+$rootScope.globals.wingsTransactionDB.name,options).then(function(result) {
                     console.log("SUCCESS: " + JSON.stringify(result.response));
                     //TODO Success message
                 }, function(err) {
                     console.log("ERROR: " + JSON.stringify(err));
                   //TODO Error message / Retry
                 }, function (progress) {
                     // constant progress updates
                 });
            }
             $scope.exportDbJSON = function(){
                 var successFn = function(json, count){
                    // console.log("Exported SQL: "+sql);
                     //alert("Exported SQL contains "+count+" statements");
                     
                     WingsRemoteDbService.synch(JSON.stringify(json)).then(function (dataIn) {
                   console.log("************Server Response: " +JSON.stringify(dataIn));
                   alert("111Exported JSON contains "+count+" statements");
                        }, function (response) {
                            console.log("ERROR " + response);
                        });
                 };
                 cordova.plugins.sqlitePorter.exportDbToJson(WingsTransactionDB, {
                     successFn: successFn,
                     dataOnly :true
                 });
                };
            $scope.ListTables = function() {
                var query = "SELECT name FROM  sqlite_master WHERE type='table'";
                $cordovaSQLite.execute(WingsSetupDB,query,[]).then(function(result) {
                    if(result.rows.length > 0) {
                        //console.log("SELECTED -> " + result.rows.item(0).firstname + " " + result.rows.item(0).lastname);
                         for(var i = 0; i < result.rows.length; i++) {
                                console.log("***********************SELECTED -> " + JSON.stringify(result.rows.item(i)));
                                
                            }
                    } else {
                        console.log("ListTables - NO ROWS EXIST");
                    }
                }, function(error) {
                    console.error("WingsSetupDB - ListTables- - ERROR : "+JSON.stringify(error));
                });
            };
            $scope.ListTablesTransaction = function() {
                var query = "SELECT name FROM  sqlite_master WHERE type='table'";
                $cordovaSQLite.execute(WingsTransactionDB,query,[]).then(function(result) {
                    if(result.rows.length > 0) {
                        //console.log("SELECTED -> " + result.rows.item(0).firstname + " " + result.rows.item(0).lastname);
                         for(var i = 0; i < result.rows.length; i++) {
                                console.log("***********************SELECTED -> " + JSON.stringify(result.rows.item(i)));
                                
                            }
                    } else {
                        console.log("ListTables Transction DB - NO ROWS EXIST");
                    }
                }, function(error) {
                    console.error("ListTables Transction DB- - ERROR : "+JSON.stringify(error));
                });
            };
            $scope.exportDbSQL = function(){
                 var successFn = function(sql, count){
                    // console.log("Exported SQL: "+sql);
                     //alert("Exported SQL contains "+count+" statements");
                     
                     WingsRemoteDbService.synch(sql).then(function (dataIn) {
                   console.log("************Server Response: " +dataIn);
                   alert("Exported SQL contains "+count+" statements");
                        }, function (response) {
                            console.log("ERROR " + response);
                        });
                 };
                 cordova.plugins.sqlitePorter.exportDbToSql(WingsSetupDB, {
                     successFn: successFn,
                     dataOnly :true
                 });
                };
                /*var deregisterHardBack = $ionicPlatform.registerBackButtonAction (
                        CallbackFunction, 101
                );
                $scope.$on('$destroy', function() {
                    deregisterHardBack();
                });
                document.addEventListener("deviceready", onDeviceReady, false);
                function onDeviceReady() {
                    // Register the event listener
                    document.addEventListener("backbutton",CallbackFunction, false);
                }
                function CallbackFunction(e) {
                    if($state.is('app.home')){
                        e.preventDefault();
                    }
                }*/
                $ionicPlatform.registerBackButtonAction(function (event) {
                    if($state.current.name=="app.home"){
                      return false;
                    }
                    else {
                        $ionicHistory.goBack();  
                        }
                  }, 100);
                
                $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
                    if (fromState.name == 'app.home'){
                        $rootScope.prWorkcard = '';
                    }
                });
            // SELECT name FROM  sqlite_master WHERE type='table';
            /*$scope.LoadDB = function() {
                //file:///data/data/com.ionicframework.wingsmobile861558/files/wings_assets
                console.log('****LoadDB -WingsSetup - DB*******');
                WingsSetupDB = $cordovaSQLite.openDB({ name: $rootScope.globals.wingsSetupDB.name, location: 'default' });
                window.plugins.sqlDB.copy($rootScope.globals.wingsSetupDB.dupFilePath+"WingsSetup.db", 0,function() {
                    WingsSetupDB = $cordovaSQLite.openDB({ name: "WingsSetup.db", location: 'default' });
                         //alert("HEEyyyyyyyyyyyyyyyyyyy");
                       console.log("\n***************------------************ WingsSetupDB11: "+ JSON.stringify(WingsSetupDB));
                       }, function(error) {
                          console.log("ERRORERRORERRORERRORERRORERRORThere was an error copying the database: " + JSON.stringify(error));
                           WingsSetupDB = $cordovaSQLite.openDB({ name: "WingsSetup.db", location: 'default' });
                           
                        console.log("\n***************------------************ WingsSetupDB22: "+ JSON.stringify(WingsSetupDB));
                       });
                
                
                //WingsSetupDB= $cordovaSQLite.openDB('/data/data/' + 'com.ionicframework.wingsmobile861558' + '/databases/'+"WingsSetup.db");
                
                //$cordovaSQLite.execute(WingsSetupDB,"CREATE TABLE IF NOT EXISTS people (id integer primary key, firstname text, lastname text)");
            }*/
        } 
        //END_CONTROLLER
        ])