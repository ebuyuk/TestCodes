angular.module('WingsMobileStarter').controller('SY_M002', [
        '$scope',
        '$cordovaCamera',
        '$ionicPopover',
        '$ionicPopup',
        'WingsDialogService',
        '$timeout',
        '$cordovaImagePicker',
        '$ionicHistory',
        '$q',
        'sy',
        '$stateParams',
        function($scope,$cordovaCamera,$ionicPopover,$ionicPopup,WingsDialogService,$timeout,$cordovaImagePicker,$ionicHistory,$q,sy,$stateParams) {
            console.log('SY_M002');
            $scope.slider         = true;
            $scope.items          = [];
            var savedImageTmp     = [];
            var uploadOptions     = $stateParams.uploadOptions;
            var divNo             = $rootScope.globals.currentUser.divNo;

            //TODO (temporary): 
            $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
                if (toState.name != 'app.SY_M002' && fromState.name == 'app.SY_M002'){
                    if (uploadOptions && uploadOptions.params && uploadOptions.params.ParentName && uploadOptions.params.ParentId) $rootScope.SY_0002 = {};
                }
            });
            
            $scope.takePhoto = function () {
                document.addEventListener("deviceready", function () {
                    var options = {
                        quality: 80,
                        destinationType: Camera.DestinationType.FILE_URI,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        //allowEdit:true,
                        saveToPhotoAlbum: false,
                        encodingType: Camera.EncodingType.JPEG,
                        correctOrientation:true
                    };
                    $cordovaCamera.getPicture(options).then(function(imageURI) {
                        $scope.slider = true;
                        $scope.items.push({src:imageURI,active:'N'});
                        $scope.selectImg(imageURI);
                    }, function(err) {
                    });
                }, false);
            };

            //load provided items
            if ($rootScope.SY_0002 != undefined && $rootScope.SY_0002.savedFiles != undefined && $rootScope.SY_0002.savedFiles.length > 0) {
                $rootScope.SY_0002.savedFiles.forEach(function(element) {
                    $scope.items.push({src:element,active:'N'});
                });
            //new attachment
            } else if (uploadOptions.newAttachment) {
                $scope.takePhoto();
                if (uploadOptions.params.ParentName == 'PR_WORK_CARDS'){
                    if (uploadOptions && uploadOptions.params && uploadOptions.params.ParentName && uploadOptions.params.ParentId){
                        //if online
                        if ($rootScope.globals.deviceConnectionInfo.isOnline) {
                            sy.PullAttachments({
                                ParentName : uploadOptions.params.ParentName,
                                ParentId   : uploadOptions.params.ParentId,
                                ImageType  : uploadOptions.params.ImageType
                            }).then(function (results) {
                                $rootScope.$broadcast('loading:show');
                                sy.LoadAttachmentsByParent(uploadOptions.params).then(function (result) {
                                    $rootScope.$broadcast('downloading:hide');
                                    $rootScope.SY_0002.savedFiles.forEach(function(element) {
                                        $scope.items.push({src:element,active:'N',existing : true});
                                    });
                                }, function (error) {
                                    $rootScope.$broadcast('loading:hide');
                                    console.log(JSON.stringify(error));
                                    return deferred.reject("Error : " +JSON.stringify(error));
                                });
                            }, function(error) {
                            });
                        //if offline
                        } else {
                            $rootScope.$broadcast('loading:show');
                            sy.LoadAttachmentsByParent(uploadOptions.params).then(function (result) {
                                $rootScope.$broadcast('downloading:hide');
                                $rootScope.SY_0002.savedFiles.forEach(function(element) {
                                    $scope.items.push({src:element,active:'N',existing : true});
                                });
                            }, function (error) {
                                $rootScope.$broadcast('loading:hide');
                                console.log(JSON.stringify(error));
                                return deferred.reject("Error : " +JSON.stringify(error));
                            });
                        }
                    } 
                }
            }
            //load attachments
            else if (uploadOptions && uploadOptions.params && uploadOptions.params.ParentName && uploadOptions.params.ParentId){
                //if online
                if ($rootScope.globals.deviceConnectionInfo.isOnline) {
                    sy.PullAttachments({
                        ParentName : uploadOptions.params.ParentName,
                        ParentId   : uploadOptions.params.ParentId,
                        ImageType  : uploadOptions.params.ImageType
                    }).then(function (results) {
                        $rootScope.$broadcast('loading:show');
                        sy.LoadAttachmentsByParent(uploadOptions.params).then(function (result) {
                            $rootScope.$broadcast('downloading:hide');
                            $rootScope.SY_0002.savedFiles.forEach(function(element) {
                                $scope.items.push({src:element,active:'N',existing : true});
                            });
                        }, function (error) {
                            $rootScope.$broadcast('loading:hide');
                            console.log(JSON.stringify(error));
                            return deferred.reject("Error : " +JSON.stringify(error));
                        });
                    }, function(error) {
                    });
                //if offline
                } else {
                    $rootScope.$broadcast('loading:show');
                    sy.LoadAttachmentsByParent(uploadOptions.params).then(function (result) {
                        $rootScope.$broadcast('downloading:hide');
                        $rootScope.SY_0002.savedFiles.forEach(function(element) {
                            $scope.items.push({src:element,active:'N',existing : true});
                        });
                    }, function (error) {
                        $rootScope.$broadcast('loading:hide');
                        console.log(JSON.stringify(error));
                        return deferred.reject("Error : " +JSON.stringify(error));
                    });
                }
            }  
            else {
                $scope.takePhoto();
            }
            
            var width = window.innerWidth; 
            var height = width * (4 / 3) 

            var canvas = new fabric.Canvas('c');
            canvas.selection = false;
            fabric.Object.prototype.selectable = false;
            canvas.setHeight(height);
            canvas.setWidth(width);
            canvas.width = width;
            canvas.height = height;
            canvas.isDrawingMode = false;
            canvas.isEdited = false;
            $scope.isDrawingMode = false;
            canvas.freeDrawingBrush.width = 6;
            $scope.brushcolor = '#ecf0f1'; 
            canvas.freeDrawingBrush.color = $scope.brushcolor;

            $scope.getImages= function () {
                var options = {
                    maximumImagesCount: 10,
                    width: 800,
                    height: 800,
                    quality: 80
                };
                $cordovaImagePicker.getPictures(options).then(function (results) {
                    for (var i = 0; i < results.length; i++) {
                        var obj = {
                                src:results[i],
                                active:'N'
                        }
                        $scope.items.push(obj);
                    }
                }, function(error) {
                });
            };

            $scope.toggle = function(prop) {
                eval("$scope."+ prop +"="+"!$scope."+ prop );
            };

            $scope.selectImg = function (path) {
                if (canvas.imgPath != undefined && canvas.isEdited == true) {
                    saveDrawing().then (function (result) {
                        $scope.items.forEach(function(element) {
                            element.active = 'N';
                        });
                        var index = _.findIndex($scope.items, { 'src': path });
                        $scope.items[index].active=$scope.items[index].active=='Y'?'N':'Y';
                        $scope.addImg(path);  
                        canvas.isEdited = false;
                        canvas.isDrawingMode = false;
                        $scope.isDrawingMode = false;
                    });
                } else {
                    $scope.items.forEach(function(element) {
                        element.active = 'N';
                    });
                    var index = _.findIndex($scope.items, { 'src': path });
                    $scope.items[index].active=$scope.items[index].active=='Y'?'N':'Y';
                    $scope.addImg(path);  
                    canvas.isEdited = false;
                    canvas.isDrawingMode = false;
                    $scope.isDrawingMode = false;
                }
            };
            
            
            function handleRemove() {
                canvas.clear().renderAll(); // Here is your clear canvas function
            };

            $scope.addImg = function (myImg){
                fabric.Image.fromURL(myImg, function(oImg) {
                    var l = Math.random() * (500 - 0) + 0;
                    var t = Math.random() * (500 - 0) + 0;                
                     oImg.set({'height':canvas.height});
                     oImg.set({'width':canvas.width});
                     canvas.add(oImg);
                     canvas.imgPath = myImg;  
                });
            };

            // drawing mode
            $scope.drawingMode = function() {
                if (canvas.isDrawingMode == true) {
                    $scope.showColorPaletteIcon = false; // hind color palette icon
                    canvas.isDrawingMode = false;
                    $scope.isDrawingMode = false;
                } else {
                    $scope.showColorPaletteIcon = true; // show color palette icon
                    canvas.isDrawingMode = true;
                    $scope.isDrawingMode = true;
                    canvas.isEdited = true;
                }
            };
            // list of colors
            $scope.colors = [
                {color: "#ecf0f1"},
                {color: "#95a5a6"},
                {color: "#bdc3c7"},
                {color: "#7f8c8d"},
                {color: "#000000"},
                {color: "#F1A9A0"},
                {color: "#D2527F"},
                {color: "#f1c40f"},
                {color: "#f39c12"},
                {color: "#e67e22"},
                {color: "#d35400"},
                {color: "#e74c3c"},
                {color: "#c0392b"},
                {color: "#6D4C41"},
                {color: "#3E2723"},
                {color: "#1abc9c"},
                {color: "#16a085"},
                {color: "#2ecc71"},
                {color: "#27ae60"},
                {color: "#3498db"},
                {color: "#2980b9"},
                {color: "#34495e"},
                {color: "#2c3e50"},
                {color: "#9b59b6"},
                {color: "#8e44ad"},
            ]

            $scope.changeBrushColor = function(color) {
                canvas.freeDrawingBrush.color = color;
                $scope.brushcolor = color; // used to change the color palatte icon's color
                $scope.popover.hide(); // hide popover
            }

            // undo last object, drawing or text
            $scope.undoLastObject = function() {
              var canvas_objects = canvas._objects;
              var last = canvas_objects[canvas_objects.length - 1];
              canvas.remove(last);
              canvas.renderAll();
            }

            $scope.addText = function() {
                canvas.isDrawingMode = false;
                $scope.showColorPaletteIcon = false;
                $scope.data = {}
                var myPopup = $ionicPopup.show({
                    template: '<input type="text" ng-model="data.input">',
                    title: 'Enter Text',
                    subTitle: '',
                    scope: $scope,
                    buttons: [{
                        text: 'Cancel'
                    }, {
                        text: '<b>Save</b>',
                        type: 'button-stable',
                        onTap: function(e) {
                            if (!$scope.data.input) {
                                e.preventDefault();
                            } else {
                                return $scope.data.input;
                            }
                        }
                    }]
                });
                myPopup.then(function(input) {
                    var t = new fabric.Text(input, {
                        left: (width / 3),
                        top: 100,
                        fontFamily: 'Helvetica',
                        fill: $scope.brushcolor,
                        selectable: true, 
                    });
                    canvas.add(t);
                });
            };

            $scope.deleteImg = function() {
                WingsDialogService.confirm('Are you sure to delete selected image?','Confirm','OK,Cancel').then(function(buttonIndex) {
                    if (buttonIndex == 1) {
                        handleRemove();
                        var result = _.remove($scope.items, function(n) {
                            return n.active == 'Y';
                        });
                    }
                });
            };

           $scope.finishEditAndSave = function () {
                $rootScope.SY_0002 = {};
                $rootScope.SY_0002.savedFiles = [];
                saveDrawing().then (function (result) {
                    $timeout(function() {
                        var promises = [];
                        $scope.items.forEach(function(element) {
                            if(element.src.indexOf('data:image') > -1) {
                                promises.push(saveImage(element.src));
                            } else {
                                if (!element.existing) savedImageTmp.push(element.src);
                            }
                        });
                        $q.all(promises).then(function(res) {
                            $rootScope.SY_0002.savedFiles = savedImageTmp;
                            
                            if (uploadOptions != null && !_.isEmpty(uploadOptions)){
                                for (var i = 0;i<savedImageTmp.length;i++) {
                                    //online
                                    if ($rootScope.globals.deviceConnectionInfo.isOnline) {
                                        $cordovaFileTransfer.upload(WINGS_CONFIG.MEDIATOR_URL+"/fileservice/doattachment", savedImageTmp[i], uploadOptions).then(function(result) {
                                            console.log("SUCCESS: " + JSON.stringify(result.response));
                                            $rootScope.SY_0002.savedFiles = null;
                                            $rootScope.SY_0002 = null;
                                        }, function(err) {
                                            console.log("ERROR: " + JSON.stringify(err));
                                          //TODO Error message / Retry
                                        }, function (progress) {
                                            // constant progress updates
                                        });
                                    //offline
                                    } else {
                                        sy.InsertAttachment(divNo,savedImageTmp[i],uploadOptions.params.ParentName,uploadOptions.params.ParentId,uploadOptions.params.MobileParentId,uploadOptions.params.ImageType);
                                    }
                                }
                            }
                            
                            $timeout(function() {
                                $ionicHistory.goBack();
                            }, 300);
                        },function(error) {
                            console.log("PROMISES  - ERROR"+JSON.stringify(error));
                          });
                    }, 300);
                });
            };

            function saveDrawing () {
                var deferred = $q.defer();
                var drawing = canvas.toDataURL();
                var index = _.findIndex($scope.items, function(o) { return o.src == canvas.imgPath; });
                if (index > -1) {
                    saveImage(drawing).then(function (result) {
                        var index = _.findIndex($scope.items, { 'src': canvas.imgPath });
                        $scope.items[index].src=result; 
                        return deferred.resolve("GOHEAD");
                    });
                } else {
                    $timeout(function() {
                        return deferred.resolve("GOHEAD");
                    }, 300);
                }
                return deferred.promise;
            };

            function saveImage (drawing) {
                var deferred = $q.defer();
                var myBase64 = drawing;//base64
                var block = myBase64.split(";");
                var dataType = block[0].split(":")[1];
                var realData = block[1].split(",")[1];//base64
                var contentType = "image/png";
                var folderpath = cordova.file.cacheDirectory;
                var filename = moment().valueOf()+'.png';//timestamp random string
                savebase64AsImageFile(folderpath,filename,realData,dataType).then (function (success){
                    return deferred.resolve(success);
                }, function (error) {
                    return deferred.reject("Login-Error : " +JSON.stringify(error));
                });
                return deferred.promise;
            };

            function b64toBlob(b64Data, contentType, sliceSize) {
                contentType = contentType || '';
                sliceSize = sliceSize || 512;
                var byteCharacters = atob(b64Data);
                var byteArrays = [];
                for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    var slice = byteCharacters.slice(offset, offset + sliceSize);
                    var byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }
                    var byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }
                var blob = new Blob(byteArrays, {type: contentType});
                return blob;
            };

            function savebase64AsImageFile(folderpath,filename,content,contentType){
                var deferred = $q.defer();
                var DataBlob = b64toBlob(content,contentType);
                window.resolveLocalFileSystemURL(folderpath, function(dir) {
                    dir.getFile(filename, {create:true}, function(file) {
                        file.createWriter(function(fileWriter) {
                            fileWriter.onwriteend = function(e) {
                                return deferred.resolve(folderpath+filename);
                            };
                            fileWriter.write(DataBlob);
                        }, function(error){
                            return deferred.reject("Error : " +JSON.stringify(error));
                        });
                    });
                });
                return deferred.promise;
            };
            if ($scope.items.length > 0) {
            	$scope.selectImg($scope.items[0].src);
            }

            $ionicPopover.fromTemplateUrl('my-popover.html', {
              scope: $scope
            }).then(function(popover) {
              $scope.popover = popover;
            });

            $scope.openColorsPopover = function($event) {
              $scope.popover.show($event);
            };

            $scope.closeColorsPopover = function() {
              $scope.popover.hide();
            };
        } 
])