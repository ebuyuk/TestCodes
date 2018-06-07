angular.module('WingsMobileStarter').controller('LB_M121', [
	'$scope',
	'$cordovaBarcodeScanner',
	'WingsRemoteDbService',
	'$ionicPopup',
	'WingsUtil',
	'WingsDialogService',
	'WingsGlobalManager',
	'$ionicPopup',
	'$timeout',
	'$ionicLoading',
	'$stateParams',
	'$ionicPopover',
	'$ionicHistory',
	'$ionicPlatform',
	'pr',
	'sy',
	'$ionicScrollDelegate',
	function($scope,$cordovaBarcodeScanner,WingsRemoteDbService,$ionicPopup,WingsUtil,WingsDialogService,WingsGlobalManager,$ionicPopup,$timeout,$ionicLoading,$stateParams,$ionicPopover,$ionicHistory,$ionicPlatform,pr,sy,$ionicScrollDelegate) {
		console.log('LB_M121');
		//document.addEventListener("deviceready", onDeviceReady, false);
		//function onDeviceReady(){};
		//function onDeviceReady() {
		
		//pinch event
		/*var pageImage = document.getElementById('boardContainer');
		pageImage.addEventListener('pinch',function(e){
            console.log('pinc')
		});*/

		//Window List
		/*$scope.windowList = [];
		$scope.newWindow = function (_parent,_parentId){
		    if (canvasData[$scope.activePage]){
                canvasData[$scope.activePage].jsonData = canvas.toJSON(); 
            }else{
                canvasData[$scope.activePage] = {jsonData:canvas.toJSON(),id:null};
            }
		    currentWindow = {parent: parent, parentId: parentId, items: $scope.items,formItems: $scope.formItems,canvasData: canvasData, activeStamp: activeStamp,activePage:$scope.activePage,documentObjects:$rootScope.documentObjects};
		    $scope.windowList.push(currentWindow);
		    clearWindow();
		    parent = _parent;
            parentId = _parentId;
            $scope.activePage = 0;
            $scope.loadDocuments();
		};
		function clearWindow(){
		  //parent = '';
		  //parentId = '';
		  activeStamp = 'testtest';
		  $scope.items = [];
		  $scope.formItems = [];
		  canvasData = [];
		  canvas.clear();
		  $rootScope.documentObjects = [];
		};
		function openPreviousWindow(window,wIndex){
		    clearWindow();
		    parent = window.parent;
            parentId = window.parentId;
            $scope.items = window.items;
            $scope.formItems = window.formItems;
            canvasData = window.canvasData;
            activeStamp = window.activeStamp;
            $scope.activePage = window.activePage;
            $rootScope.documentObjects = window.documentObjects;
            $scope.windowList.pop();
            backgroundImage.style.backgroundImage = "url("+$scope.items[$scope.activePage].fileLocation+")";
            if (canvasData[$scope.activePage] && canvasData[$scope.activePage].jsonData != undefined){
                canvas.loadFromJSON(canvasData[$scope.activePage].jsonData, canvas.renderAll.bind(canvas)); 
            }
            if ($scope.activePage == $scope.items.length-1) $scope.nextExists = false;
            if ($scope.activePage == 0) $scope.previousExists = false;
            //$rootScope.documentObjects = window.
		};
		$ionicPlatform.registerBackButtonAction(function () {
            if ($scope.windowList.length > 0){
                var windowIndex = $scope.windowList.length-1;
                openPreviousWindow($scope.windowList[windowIndex],windowIndex)
            }else{
                $ionicHistory.goBack();
            }
        }, 100);
        
        $rootScope.$ionicGoBack = function() {
            if ($scope.windowList.length > 0){
                var windowIndex = $scope.windowList.length-1;
                openPreviousWindow($scope.windowList[windowIndex],windowIndex)
            }else{
                $ionicHistory.goBack();
            }
        };*/
		
		if(window.cordova && window.cordova.plugins.Keyboard) {
		    window.cordova.plugins.Keyboard.disableScroll(false);
		    window.cordova.plugins.Keyboard.disableScroll(true);
		}
	    
		if (cordova && cordova.plugins.Keyboard) cordova.plugins.Keyboard.disableScroll(true);
		
		$scope.previousExists = false;
		$scope.nextExists     = false;
		$scope.formItems = [];
		var parent = $rootScope.LB_M121_parent;
		var parentId = $rootScope.LB_M121_parentId;
		var activeStamp = '';
		if ($rootScope.LB_M121_parentObject && $rootScope.LB_M121_parentObject.STAMP_NUMBERS){
		    var stampNumbers = $rootScope.LB_M121_parentObject.STAMP_NUMBERS.split(',');
		    activeStamp = stampNumbers[stampNumbers.length -1];
		}
        var fileList = [];
        $scope.items = [];
        $scope.allowDrop = function (ev) {
            ev.preventDefault();
        }
        
        $scope.drag = function (ev) {
            ev.dataTransfer.setData("Text", ev.target.id);
        }
        
        $scope.drop = function (ev) {
            var data = ev.dataTransfer.getData("Text");
            ev.target.appendChild(document.getElementById(data));
            ev.preventDefault();
        }
        
        $scope.windowWidth = 0;
        $scope.windowHeight = 0;
        $scope.isMaximized = false;
        $scope.isDragged = false;
        $scope.doshadow = 0;
        $scope.draggedStyle = {};
        $scope.activePage = 0;
        $scope.activeViewId = null;
        $scope.columnNumber = 0;
        $scope.maxId = 0;
        $scope.isTextMode = false;
        $scope.tempStampObjects = [];
        $scope.lastDiffX = 0;
        $scope.lastDiffY = 0;
        $scope.diffX = 0;
        $scope.diffY = 0;
        $scope.dragStartX = 0;
        $scope.dragStartY = 0;
        $scope.parentWidth = 0;
        $scope.parentHeight = 0;
        $scope.reSizeX = 0;
        $scope.reSizeY = 0;
        
        $scope.onDragStart = function(event){
        	if(event.target.id.includes("reSize")){
        		event.gesture.stopPropagation();
        		$scope.isDragged = true;
        		var left     = event.target.style.left;
            	var top      = event.target.style.top;
            	leftVal      = Number(left.substring(0,left.length-1))*(event.target.parentElement.parentElement.clientWidth/100);
            	topVal       = Number(top.substring(0,top.length-1))*(event.target.parentElement.parentElement.clientHeight/100);
        		var parentWidth = document.getElementById(event.target.id.replace('reSize','')).style.width;
        		var parentHeight = document.getElementById(event.target.id.replace('reSize','')).style.height;
        		var iconTop =  document.getElementById('icon'+event.target.id.replace('reSize','')).style.top;
        		var iconLeft = document.getElementById('icon'+event.target.id.replace('reSize','')).style.left;
        		$scope.parentWidth = Number(parentWidth.substring(0,parentWidth.length-1))*(event.target.parentElement.parentElement.clientWidth/100);
        		if(parentHeight.includes('%')){
        			$scope.parentHeight  = Number(parentHeight.substring(0,parentHeight.length-1))*(event.target.parentElement.parentElement.clientHeight/100);
        		}else{
        			$scope.parentHeight  = (Number(parentHeight.substring(0,parentHeight.length-2))/ event.target.parentElement.parentElement.clientHeight)  * 100;
        		}
        		$scope.iconTop  = Number(iconTop.substring(0,iconTop.length-1))*(event.target.parentElement.parentElement.clientWidth/100);
        		$scope.iconLeft = Number(iconLeft.substring(0,iconLeft.length-1))*(event.target.parentElement.parentElement.clientHeight/100);
        		
        		if (event.gesture){
            	    $scope.dragStartX = event.gesture.center.pageX;
                    $scope.dragStartY = event.gesture.center.pageY;
                    $scope.diffX = leftVal - event.gesture.center.pageX;
            	    $scope.diffY = topVal  - event.gesture.center.pageY;
            	}else{
            		$scope.dragStartX = event.clientX;
                    $scope.dragStartY = event.clientY;
                    $scope.diffX = leftVal - event.clientX;
            		$scope.diffY = topVal  - event.clientY;
            	}
        	}else if ($.isNumeric(event.target.id) || event.target.id.includes('newColumn')){
                event.gesture.stopPropagation();
                $scope.isDragged = true;
                var left     = event.target.style.left;
                var top      = event.target.style.top;
                leftVal      = Number(left.substring(0,left.length-1))*(event.target.parentElement.parentElement.clientWidth/100);
                topVal       = Number(top.substring(0,top.length-1))*(event.target.parentElement.parentElement.clientHeight/100);
                if (event.gesture){
                    $scope.diffX = leftVal - event.gesture.center.pageX;
                    $scope.diffY = topVal  - event.gesture.center.pageY;
                }else{
                    $scope.diffX = leftVal - event.clientX;
                    $scope.diffY = topVal  - event.clientY;
                }
            }
        };
        
        $scope.onDrag = function(event){
        	if (event.target.id.includes("reSize")){
        		diffY =  $scope.dragStartY - event.gesture.center.pageY;
        		diffX =  $scope.dragStartX - event.gesture.center.pageX;
        		var parent = document.getElementById(event.target.id.replace('reSize',''));
        		var icon   = document.getElementById('icon'+event.target.id.replace('reSize',''));
        		var tempParentHeight = Number(parent.style.height.substring(0,parent.style.height.length-1));
        		var tempParentWidth  = Number(parent.style.width.substring(0,parent.style.width.length-1));
        		var parentWidth = ((Number($scope.parentWidth) - diffX)  / event.target.parentElement.parentElement.clientWidth  *100);
		        var parentHeight = ((Number($scope.parentHeight) - diffY) / event.target.parentElement.parentElement.clientHeight *100);
			        if (!(tempParentHeight < 2 && diffY > 0)){
			        	console.log(parentHeight);
			        	if(parentHeight < 2){
			        		parentHeight = 2;
			        	}
			        	parent.style.height = parentHeight + "%";
			        	event.target.style.top = (Number(parent.style.top.substring(0,parent.style.top.length-1)) + parentHeight /*-1*/ )+ '%'; 
			        	icon.style.top = (Number(parent.style.top.substring(0,parent.style.top.length-1)) -1 )+ '%';
			        }
			        if (!(tempParentWidth < 10 && diffX > 0)){
			        	console.log(parentWidth);
			        	if(parentWidth < 10){
			        		parentWidth = 10;
			        	}
			        	parent.style.width =  parentWidth +"%";
			        	event.target.style.left = (Number(parent.style.left.substring(0,parent.style.left.length-1)) + parentWidth /*-1*/ )+ '%';
			        	icon.style.left = (Number(parent.style.left.substring(0,parent.style.left.length-1)) + parentWidth +1 )+ '%';
			        }
	        		event.gesture.stopPropagation();
        	}else if($.isNumeric(event.target.id) || event.target.id.includes('newColumn')){
                var isDraggable  = event.target.getAttribute("draggable");
                var isEditable   = event.target.getAttribute("editable");
                if (isDraggable == 'true'){
               var attr = document.getElementById(event.target.id).getAttribute('expanding-textarea');
               var targetWidth = Number(event.target.style.width.substring(0,event.target.style.width.length-1));
               if(event.target.style.height.includes('%')){
                   var targetHeight = Number(event.target.style.height.substring(0,event.target.style.height.length-1));
               }else{
                   var targetHeight = ((Number(event.target.style.height.substring(0,event.target.style.height.length-2)) / event.target.parentElement.parentElement.clientHeight)  * 100);
               }
               var targetTop = Number(event.target.style.top.substring(0,event.target.style.top.length-1));
               var targetLeft = Number(event.target.style.left.substring(0,event.target.style.left.length-1));
               diffY =  $scope.dragStartY - event.gesture.center.pageY;
               diffX =  $scope.dragStartX - event.gesture.center.pageX;
               if (!((((targetTop + targetHeight) > 99) && (diffY - $scope.lastDiffY) < 0) ||  ((targetTop < 1) && (diffY - $scope.lastDiffY) > 0))){
                   console.log(diffY +"  Y  *   l "+$scope.lastDiffY);
                   $scope.lastDiffY = diffY;
                       event.target.style.top  = (event.gesture.center.pageY+$scope.diffY) / event.target.parentElement.parentElement.clientHeight *100 +"%";
                       if (isEditable == 'true'){
                           document.getElementById('icon'+event.target.id).style.top  = (((event.gesture.center.pageY+$scope.diffY) / event.target.parentElement.parentElement.clientHeight *100)-1)+"%";
                           document.getElementById('reSize'+event.target.id).style.top  = (((event.gesture.center.pageY+$scope.diffY) / event.target.parentElement.parentElement.clientHeight *100)/*-1*/+targetHeight)+"%";   
                       }
               }
               if (!((((targetLeft + targetWidth) > 99) && (diffX - $scope.lastDiffX)< 0)  || ((targetLeft  < 1) && (diffX - $scope.lastDiffX)> 0))){
                   console.log(diffX +"  X  *   l "+$scope.lastDiffX);
                   $scope.lastDiffX = diffX;
                       event.target.style.left = (event.gesture.center.pageX+$scope.diffX) / event.target.parentElement.parentElement.clientWidth  *100 +"%";
                       if (isEditable == 'true'){
                           document.getElementById('icon'+event.target.id).style.left = (((event.gesture.center.pageX+$scope.diffX) / event.target.parentElement.parentElement.clientWidth  *100)+1+targetWidth)+"%";
                           document.getElementById('reSize'+event.target.id).style.left = (((event.gesture.center.pageX+$scope.diffX) / event.target.parentElement.parentElement.clientWidth  *100)/*-1*/+targetWidth)+"%";
                       }
               }
               event.gesture.stopPropagation();
           }
           }
        };
       
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if (toState.name == 'app.LB_M121'){ 
                if (fromState.name != 'app.PR_M108'){
                    getAnnotations();
                }
            	screen.orientation.lock('portrait');
            }else{
            	screen.orientation.unlock();
            }
        });
        
        $scope.deleteViewById = function (id){
        	for(i= 0; i<$scope.formItems.length;i++){
        		if($scope.formItems[i].columnId == id){
        			$scope.formItems.splice(i, 1);
        			$scope.activeViewId = null;
        			return;
        		}
        	}
        };

        $scope.setActiveElement = function(event){
        	if (event.target.getAttribute("editable") == 'false'){
            	$scope.activeViewId    = null;
        	}else{
        		var items = $('[id^=icon]');
        		for (var i = 0;i<items.length;i++) {
        			items[i].style.visibility='hidden';
        		}
        	    $scope.activeViewId    = event.target.getAttribute("columnId");
        	    document.getElementById('icon'+$scope.activeViewId).style.visibility = 'visible';
        	    
        	}
        	$scope.$apply();
        };
        
        $scope.clickImg = function(){
        	console.log("clicked");
        };
        
        $scope.onRelease = function(event)  {
            console.log(event.target.style.left);
            console.log(event.target.style.top);
            $scope.dragStartX = 0;
            $scope.dragStartY = 0;
            $scope.isDragged = false;
        }
        $scope.test = function($event){
            //console.log($event.which);
        }
       
        $scope.maxId = $scope.formItems.length+1;
        angular.forEach($scope.formItems, function(field) {
        	if (!WingsUtil.IsNull(field.value)) {
        		$scope[field.name] = field.value;
        	}
        })
        
        $scope.loadDocuments = function () {
        	if (parentId == '') return;
        	//console.log("load documents");
        	//console.log("parent : "+ parent+" -----  parentid : "+parentId);
            var sql ="Select Line,                       "+
                     "       File_Id,                    "+
                     "       Long_File_Name,             "+
                     "       File_Extension,             "+
                     "       Div_No                      "+
                     "  From gn_images_v                 "+
                     " Where Div_No                = "+$rootScope.globals.currentUser.divNo+
                     "   And Parent                =  '"+parent+"' "+
                     "   And Parent_Id             = "+parentId+
                     "   And (Image_Type          != 'APPENDIX' or Program_Id != 'PR_0097') "+ // TO-DO -REMOVE THIS *ERDEM*-
                     "   And Upper(File_Extension) In ('GIF','JPEG','PNG','JPG','BMP')";
            
            var sqlArray = [{ queryStr: sql, queryType: "READ" }];
            var sqlString = JSON.stringify(sqlArray);
            WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                var result = angular.fromJson(dataIn[0].rows);
                if (result.length > 0) {
                    if (result.length > 1){
                        $scope.nextExists = true;   
                    }
                    
                	var promises = [];
                	var bindings = [];
                		checkAttachmentIsExist(result,parentId).then (function (result){
                			var options = {
                        			headers: {
                        				"Authorization": WINGS_CONFIG.BASIC_AUTHENTICATION
                        			}
                        	}
                			for (var i = 0;i<result.length;i++) {
                            	var targetPath = $rootScope.globals.wingsAssetsUzipFolderAfterDownload + '/attachments/'+result[i].file_id+'.'+result[i].file_extension;
                        		fileList.push(result[i].long_file_name);
                        		promises.push($cordovaFileTransfer.download(WINGS_CONFIG.MEDIATOR_URL+"/fileservice/download/file?fileName="+result[i].long_file_name, targetPath.replace("/[\r\n]/g", ""), options, true));
                        		var parameters = [result[i].file_id,
                        			              result[i].line,
                        			              result[i].div_no,
                        			              targetPath,
                        			              result[i].file_extension,
                        			              parentId,
                        			              moment().format('YYYY-MM-DD')];
                        		bindings.push(parameters)
                			}
                			if(result.length > 0){
	                			$q.all(promises).then(function (res) {
	                				console.log("Download attachment done.");
	                				insertAttachment(bindings);
	                			});
                			}else{
                				getFiles();
                			}
                        });
                } else {
                    $ionicHistory.goBack();
                }
            }, function (error) {WingsDialogService.error('Failed to connect server in order download documents.')});
        };
        
        function checkAttachmentIsExist (data, parentId) {
            var deferred = $q.defer();
            var listFileIds =  _.map(data,'file_id').join("','");                
            var checkquery = " Select File_Id file_id               "+
                             "   From Gn_Images              "+
                             "  Where File_Id in ('"+listFileIds+"')           "+
                             "    And Parent_Id =" +parentId;
            WingsTransactionDBService.executeSql(checkquery,[]).then(function (result){
            	var newData = _.filter(data, function(p){return !_.includes(_.map(result,'file_id'), p.file_id);});
                return deferred.resolve(newData);
            }, function (error) {
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };
        
        function insertAttachment(bindings) {
            var deferred = $q.defer();
        	var sql ="Insert or Replace Into GN_IMAGES (File_Id,             " +
        		 	 "                                  Line,				 " +
        			 "                                  Div_No,		         " +
        			 "                                  File_Location,		 " +
        			 "                                  File_Extension,      " +
        			 "                                  Parent_Id,			 " +
        			 "                                  Mobile_Dt_Created)   " +
		             " Values (?,?,?,?,?,?,?);                               ";
               WingsTransactionDBService.insertCollection(sql,bindings).then(function (result){
            	   getFiles();
               }, function (error) {
            	   getFiles();
                   console.log("INSER OR REPLACE ISSUE FAILURE! "+error);
               });
		};
		
        function getFiles() {
            var deferred = $q.defer();
            //console.log("get files");
            //console.log("parent : "+ parent+" -----  parentid : "+parentId);
            var sql = "Select File_Location,File_Id,Line            " +
                      "  From Gn_Images                             " +
                      " Where Div_No       = ?                      " +
                      "   And Parent_Id    = ?                      " +
                      "   And UPPER(File_Extension) in ('JPG','PNG','JPEG','GIF','BMP')" +
                      "   Order By Line asc                         ";
            
            var parameters = [$rootScope.globals.currentUser.divNo,parentId];
            WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                if (result.length > 0){
                    for (t=0; t<$rootScope.documentObjects.length; t++){
                        $rootScope.documentObjects[t].fileId = $rootScope.documentObjects[t].fileId ? $rootScope.documentObjects[t].fileId : result[0].FILE_ID;
                    }
                    if (result.length > 1) $scope.nextExists = true;
                } 
                for (var i = 0 ;i<result.length;i++) {
                	$scope.items.push({fileLocation: result[i].FILE_LOCATION, fileId: result[i].FILE_ID}); 
                }
                getAnnotations();
                var pageImage = document.getElementById('boardContainer');
                $scope.windowHeight = pageImage.parentElement.clientHeight;
                $scope.windowWidth  = pageImage.parentElement.clientWidth;
                var backgroundImage = document.getElementById('backgroundImg');
                backgroundImage.style.backgroundImage = "url("+$scope.items[$scope.activePage].fileLocation+")";
                backgroundImage.style.height = pageImage.parentElement.clientHeight/*-88*/+'px';
                pageImage.style.height = pageImage.parentElement.clientHeight/*-88*/+'px';
                return deferred.resolve("GOHEAD");
            }, function (error) {
                WingsDialogService.error(JSON.stringify(error));
                console.log('GN_M005 - ERROR'+JSON.stringify(error));
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        }
        
    	if ($rootScope.globals.deviceConnectionInfo.isOnline) {
    		$scope.loadDocuments();
    	} else {
    		getFiles();
    	}
        	
		var canvasData = [];
		
        $scope.nextPage = function () {
            if ($scope.activePage == $scope.items.length-1) return;
            if (canvasData[$scope.activePage]){
                canvasData[$scope.activePage].jsonData = canvas.toJSON(); 
            }else{
                canvasData[$scope.activePage] = {jsonData:canvas.toJSON(),id:null};
            }
       	    $scope.activePage+=1;
       	    
       	    $scope.previousExists = true;
       	    if ($scope.activePage == $scope.items.length-1) $scope.nextExists = false;
         
            if (canvasData[$scope.activePage] && canvasData[$scope.activePage].jsonData != undefined) {
                canvas.loadFromJSON(canvasData[$scope.activePage].jsonData, canvas.renderAll.bind(canvas));
            } else {
                canvas.clear(); 
            }
            backgroundImage.style.backgroundImage = "url("+$scope.items[$scope.activePage].fileLocation+")";
        };
        
        $scope.previousPage = function () {
            if ($scope.activePage == 0) return;
            if (canvasData[$scope.activePage]){
                canvasData[$scope.activePage].jsonData = canvas.toJSON(); 
            }else{
                canvasData[$scope.activePage] = {jsonData:canvas.toJSON(),id:null};
            }
            $scope.activePage-=1;

            $scope.nextExists = true;
            if ($scope.activePage == 0) $scope.previousExists = false;

            if (canvasData[$scope.activePage] && canvasData[$scope.activePage].jsonData != undefined) {
                canvas.loadFromJSON(canvasData[$scope.activePage].jsonData, canvas.renderAll.bind(canvas));
            } else {
                newCanvas(); 
            }
            backgroundImage.style.backgroundImage = "url("+$scope.items[$scope.activePage].fileLocation+")";
        };
        
        $scope.swiped = function ($e) {
        	if ($scope.isDrawingMode || $scope.isMaximized) {
        		return;
        	}
        	switch ($e.gesture.direction) {
	            case 'left':
	        		$scope.nextPage();
	                break;
	            case 'right':
	                if ($scope.activePage == 0) {
	                	var distance = ($e.gesture.distance / $e.currentTarget.clientWidth) * 100;
	                	console.log(distance);
	                	if (distance > 80){
	                		$ionicHistory.goBack();
	                	}
	            	} else {
	            		$scope.previousPage();
	            	}
	                break;
	            default:
	                break;
            }
        }
          
        $scope.drawingMode = function() {
            if($scope.isTextMode || $scope.isStampMode ){
                $scope.isTextMode  = false;
                $scope.isStampMode = false;
                $(".boardContainer").css("z-index","");
            }
            if ($scope.isDrawingMode == true) {
            	$(".formItems").css("z-index","30");
                $scope.showColorPaletteIcon = false; // hind color palette icon
                $scope.isDrawingMode = false;
                canvas.isDrawingMode = false;
            } else {
            	$(".formItems").css("z-index","10");
                $scope.showColorPaletteIcon = true; // show color palette icon
                $scope.isDrawingMode = true;
                canvas.isDrawingMode = true;
            }
        };
        $scope.textMode = function(){
        	if ($scope.isTextMode  == true) {
        		$scope.isTextMode  = false;
            	$(".boardContainer").css("z-index","");
        	}else{
            	$(".boardContainer").css("z-index","30");
        		$scope.isTextMode = true;
        		$scope.isStampMode = false;
                $scope.isDrawingMode = false;
        	}
        };
        $scope.stampMode = function() {
            if ($scope.isStampMode == true) {
                $scope.isStampMode = false;
            	$(".boardContainer").css("z-index", "");
            } else {
                $scope.isStampMode = true;
                $scope.isTextMode = false;
                $scope.isDrawingMode = false;
            	$(".boardContainer").css("z-index","30");
            }
        };
        var backgroundImage = document.getElementById('backgroundImg');
        var pageImage = document.getElementById('boardContainer');
        pageImage.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, false);
        pageImage.addEventListener('click', function (event) {
        	if($scope.activeViewId){
        		if(event.target.id.includes("icon")){
        			$scope.deleteViewById($scope.activeViewId);
        		}else if(event.target.id.includes("img")){
        			$scope.clickImg();
        		}else if(event.target.id.includes("section")){
        		    document.getElementById('icon'+$scope.activeViewId).style.visibility = 'hidden';
                    $scope.activeViewId = null;
                    var functionBody =  event.target.getAttribute("functionBody");
                    eval(functionBody);
        		}else{
        			document.getElementById('icon'+$scope.activeViewId).style.visibility = 'hidden';
        			$scope.activeViewId = null;
        		}
        	}
            if ($scope.isStampMode == true) {
                if(event.target.id.includes("section")){
                    var functionBody =  event.target.getAttribute("functionBody");
                    eval(functionBody);
                }else{
                    $scope.addItem(event, 'STAMP');

                }
            }else if ($scope.isTextMode == true){
            	$scope.addItem(event, 'TEXT');
            }else if(event.target.id.includes("section")){
                var functionBody = event.target.getAttribute("functionBody");
                eval(functionBody);
            }else{
            	$scope.$apply();
            }
        });
        $scope.addItem = function (event ,type){
        	  var a = {};
        	  var fontSize = '';
        	  xPercent = (event.offsetX + event.target.offsetLeft) / $(boardContainer).width() * 100; // tugay note tam ekranda sorun olustu
        	  yPercent = (event.offsetY + event.target.offsetTop) / $(boardContainer).height() * 100; // same
        	  if(xPercent < 5 || yPercent < 5) return;
        	if (type == 'TEXT'){
        		if($scope.isMaximized){
        			fontSize = '200%'
        		}else{
        			fontSize = '100%'
        		}
        		if (xPercent > 69){
        			xPercent = 69;
        		}
        		if (yPercent > 97){
        			yPercent = 97;
        		}
        		a = {   annotation: true,
                		name:'newColumn'+$scope.columnNumber,
                		pageNumber: $scope.activePage.toString(),
                		tag:'textarea',
                		rows:1,
                		fileId: $scope.items[$scope.activePage].fileId,
                		positionX:xPercent+'%',
                		positionY:yPercent+'%',
                		value:'',
                		width:'30%',
                		height: '2%',
                		placeholder:'New Column',
                		draggable:true,
                		editable:true,
                		columnId:'newColumn'+$scope.maxId
                	};
        		$scope.isTextMode = false;
        	}else if (type == 'STAMP'){
        		if($scope.isMaximized){
        			fontSize = '100%'
        		}else{
        			fontSize = '50%'
        		}
        		a = {   annotation: true,
          			    pageNumber: $scope.activePage.toString(),
                		tag:'stamp',
                		value:activeStamp,
                		fileId:$scope.items[$scope.activePage].fileId,
                		positionX:xPercent+'%',
                		positionY:yPercent+'%',
                		columnId:'newColumn'+$scope.maxId
                	};
        		$scope.tempStampObjects.push(a);
        		$scope.isStampMode = false;
        	}
        	$(".boardContainer").css("z-index","");
        	$scope.columnNumber++;
         	$scope.maxId++;
        	$scope.formItems.push(a); 
        	$scope.$apply();
        	document.getElementById(a.columnId).style.fontSize = fontSize;
        	if (type == 'TEXT' && $scope.isMaximized) {
        		document.getElementById(a.columnId).value = ' ';
        		$timeout(function () {
        			document.getElementById(a.columnId).value = '';
                },525);
        	}
        	WingsUtil.Focus(a.columnId);
        };
        
        function newCanvas () {
        	canvas = new fabric.StaticCanvas('c');
            canvas.selection = false;
            fabric.Object.prototype.selectable = false;
            canvas.setHeight( 100);
            canvas.setWidth(100);
            canvas.width = 100;
            canvas.height = 100;
            canvas.style.backgroundColor = '#4c4c4c';
            canvas.style.opacity = '0.2';
            canvas.isDrawingMode = $scope.isDrawingMode;
            canvas.isEdited = false;
            $scope.brushsize = "1";
            canvas.freeDrawingBrush.width = 1;
            $scope.brushcolor = '#000000'; 
            canvas.freeDrawingBrush.color = $scope.brushcolor;
        }
        var width =  $("#boardContainer").width();
        var height = $("#boardContainer").height();
        var canvas = new fabric.Canvas ('c');
        canvas.selectable = false;
        canvas.hasControls = false;
        canvas.hasBorders = false;
        canvas.hasRotatingPoint = false;
        canvas.selection = false;
        canvas.renderOnAddRemove=false;
        fabric.Object.prototype.selectable = false;
        fabric.Object.prototype.hasBorders  = false;
        fabric.Object.prototype.hasControls  = false;
        fabric.Object.prototype.hasRotatingPoint  = false;
        fabric.Object.prototype.skipTargetFind   = true;
        fabric.Canvas.skipTargetFind = true;
        fabric.skipTargetFind = true;
        canvas.skipTargetFind = true;

        canvas.setHeight(height);
        canvas.setWidth(width);
        canvas.isDrawingMode = false;
        canvas.isEdited = false;
        $scope.isDrawingMode = false;
        $scope.brushsize = "1";
        canvas.freeDrawingBrush.width = 1;
        $scope.brushcolor = '#000000'; 
        canvas.freeDrawingBrush.color = $scope.brushcolor;

        $scope.changeBrushColor = function(color) {
            $scope.brushcolor = color; // used to change the color palatte icon's color
            canvas.freeDrawingBrush.color = $scope.brushcolor;
            $scope.popover.hide(); // hide popover

        };
        $scope.changeBrushSize = function() {
        	canvas.freeDrawingBrush.width = $scope.brushsize;
        };
        // undo last object, drawing or text
        $scope.undoLastObject = function() {
            if($scope.isStampMode){
            	var length = $scope.tempStampObjects.length;
            	if (length > 0){
            		 $scope.deleteViewById($scope.tempStampObjects[length-1].columnId);
            		 $scope.tempStampObjects.splice(length-1, 1);
            	}
            }else {
            	 var canvas_objects = canvas._objects;
                 var last = canvas_objects[canvas_objects.length - 1];
                 canvas.remove(last);
                 canvas.renderAll();
            	/*var canvas_objects = fabric.Canvas.activeInstance._objects;
                var last = canvas_objects[canvas_objects.length - 1];
                fabric.Canvas.activeInstance.remove(last);
                fabric.Canvas.activeInstance.renderAll();
                fabric.Canvas.activeInstance.clear();
                fabric.Canvas.activeInstance.renderAll.bind(fabric.Canvas.activeInstance)();
                fabric.Canvas.activeInstance.freeDrawingBrush.canvas.renderAll();
                fabric.Canvas.activeInstance.freeDrawingBrush.canvas.clear();
                fabric.Canvas.activeInstance.relatedTarget.canvas.renderAll();
                fabric.Canvas.activeInstance.relatedTarget.canvas.clear();
                fabric.Canvas.activeInstance.renderAll();
                fabric.Canvas.activeInstance.discardActiveGroup().renderAll();
                fabric.Canvas.activeInstance.discardActiveGroup().clear();
                var canvas_objects2 = canvas._objects;
                var last2 = canvas_objects2[canvas_objects2.length - 1];
                canvas.remove(last2);
                canvas.renderAll();*/
            }  
        };

        $scope.penSize = [
            {size: "1"},
            {size: "2"},
            {size: "3"},
            {size: "4"},
            {size: "5"},
            {size: "6"},
            {size: "7"},
            {size: "8"},
            {size: "9"}
        ];
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
            {color: "#8e44ad"}
        ];
        $scope.finishEditAndSave = function () {
        	var exportObj = [];
        	$scope.formItems.forEach(function(element) {
        		var tempObj = element;
        		tempObj.value = $scope[element.name];
        		tempObj.positionX = $('#'+element.columnId)[0].style.left;
        		tempObj.positionY = $('#'+element.columnId)[0].style.top;
        		tempObj.width = $('#'+element.columnId)[0].style.width
        		tempObj.height = $('#'+element.columnId)[0].style.height
        		exportObj.push(tempObj);
        	});
        	console.log(exportObj);
        	console.log(canvasData);
        	//JSON.stringify(fabric.Canvas.activeInstance.toJSON())
        };
        
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

        $scope.maximize = function(){
        	var container = document.getElementById('boardContainer');
        	var backgroundImage = document.getElementById('backgroundImg');
        	var chevronLeft = document.getElementById('chevronLeft');
        	var chevronRight = document.getElementById('chevronRight');
        	var content = document.getElementById('content');
        	if(!$scope.isMaximized){ 
        		container.style.height = ($scope.windowHeight*2)+'px';
        		container.style.width =  ($scope.windowWidth*2)+'px';
        		backgroundImage.style.height = ($scope.windowHeight*2)+'px';
        		backgroundImage.style.width =  ($scope.windowWidth*2)+'px';
        		canvas.setHeight($scope.windowHeight*2);
        		canvas.setWidth($scope.windowWidth*2);
        		chevronLeft.style.visibility = 'hidden';
        		chevronRight.style.visibility = 'hidden';
        		canvas.setZoom(2);
        		canvas.renderAll();
        		for(i=0; i<$scope.formItems.length; i++){
        			if ($scope.formItems[i].tag == 'stamp'){
        				document.getElementById($scope.formItems[i].columnId).style.fontSize = '100%';
        			}else{
        				document.getElementById($scope.formItems[i].columnId).style.fontSize = '200%';
        				var x = document.getElementById($scope.formItems[i].columnId).style.lineHeight;
        			}
        		}
        		$scope.isMaximized = true;
        	}else{
        		$ionicScrollDelegate.scrollTo(0,0);
        		container.style.height = $scope.windowHeight+'px';
        		container.style.width =  $scope.windowWidth+'px';
        		backgroundImage.style.height = ($scope.windowHeight)+'px';
        		backgroundImage.style.width =  ($scope.windowWidth)+'px';
        		canvas.setHeight($scope.windowHeight);
        		canvas.setWidth($scope.windowWidth);
        		canvas.setZoom(1);
        		chevronLeft.style.visibility = 'visible';
        		chevronRight.style.visibility = 'visible';
        		canvas.renderAll();
        		for(i=0; i<$scope.formItems.length; i++){
        			if ($scope.formItems[i].tag == 'stamp'){
        				document.getElementById($scope.formItems[i].columnId).style.fontSize = '50%';
        			}else{
        				document.getElementById($scope.formItems[i].columnId).style.fontSize = '100%';
       				    var x = document.getElementById($scope.formItems[i].columnId).style.lineHeight;
        			}
        		}
        		$scope.isMaximized = false;
        	}
        }
        
        function HandleDownloadStatus(fileName,targetPath,options){
        	var deferred = $q.defer();
    		$cordovaFileTransfer.download(WINGS_CONFIG.MEDIATOR_URL+"/fileservice/download/file?fileName="+fileName, targetPath.replace("/[\r\n]/g", ""), options, true).then(function (result){
    			return deferred.resolve({status:'SUCCEED',result:result,error:''});
    		},function(error){
    			return deferred.resolve({status:'FAILED',result:null,error:error});
    		});
        	return deferred.promise;
        }
        $(document).on('focusout', function(e){$ionicScrollDelegate.scrollTo(0,0);});
		//}
       
         $scope.saveAnnotations = function() {
             var deferred = $q.defer();
             var sql = " Delete Gn_Annotations Where Parent_Id = "+parentId+" ";
             var sqlArray = [];
             sqlArray.push({ queryStr: sql,       queryType: "READ" });
             var sqlString = JSON.stringify(sqlArray);
             WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                 var sqlArray = []
                 if (canvasData[$scope.activePage]){
                     canvasData[$scope.activePage].jsonData = canvas.toJSON(); 
                 }else{
                     canvasData[$scope.activePage] = {jsonData:canvas.toJSON(),id:null};
                 }
                 var result = _.filter($scope.formItems, { 'annotation': true});
                 var resultGroupBy = _.groupBy(result, "fileId");
                 var keyValues = Object.keys(resultGroupBy);
                 /*var sql = "Update Gn_Images Set Annotation_Objects = ? Where File_Id = ?";
                 for (i in keyValues) {
                     var annotationObjects = resultGroupBy[Object.keys(resultGroupBy)[i]];
                     WingsTransactionDBService.executeSql(sql,[angular.toJson(annotationObjects),keyValues[i]]).then(function (result){
                     }, function (error) {
                         console.log("INSER OR REPLACE ISSUE FAILURE! "+error);
                     });
                 }*/
                 var sql2 = ''
                 for (j in result) {
                     var dotX = result[j].width && result[j].width.replace('%','') ? result[j].width.replace('%','') : null;
                     var dotY = result[j].height && result[j].height.replace('%','') ? result[j].height.replace('%','') : null;
                     var posX = result[j].positionX && result[j].positionX.replace('%','') ? result[j].positionX.replace('%','') : null;
                     var posY = result[j].positionY && result[j].positionY.replace('%','') ? result[j].positionY.replace('%','') : null;
                     var val  = result[j].editable ? document.getElementById(result[j].columnId).value : result[j].value;
                     if (result[j].columnId && !result[j].columnId.includes('newColumn')){
                         var id = result[j].columnId.replace('anno','');
                     }else{
                         var id = null;
                     }
                     
                     sql2 = "Insert Into Gn_Annotations (DotX,DotY,PositionX,PositionY,Text,Title,File_Id,Parent,Parent_Id,Div_No,Id) Values  ("+dotX+","+dotY+","+posX+","+posY+",'"+val+"','"+result[j].tag+"',"+result[j].fileId+",'PR_WORK_CARDS',"+parentId+","+ $rootScope.globals.currentUser.divNo+","+id+")";
                     sqlArray.push({ queryStr: sql2, queryType: "READ" });
                     //console.log(sql2);
                 }
                 for(k=0; k<canvasData.length;k++){
                     var id   = canvasData[k].id ? canvasData[k].id : null;
                     var data = JSON.stringify(canvasData[k].jsonData);
                     sql2 = "Insert Into Gn_Annotations (DotX,DotY,PositionX,PositionY,Text,Text2,Text3,Text4,Text5,Text6,Text7,Text8,Title,File_Id,Parent,Parent_Id,Div_No,Id) Values  ("
                         +null+","+null+","+null+","+null+",'"
                         +data.substring(    0, 4000)+"','" 
                         +data.substring( 4000, 8000)+"','"
                         +data.substring( 8000,12000)+"','"
                         +data.substring(12000,16000)+"','"
                         +data.substring(16000,20000)+"','"
                         +data.substring(20000,24000)+"','"
                         +data.substring(24000,28000)+"','"
                         +data.substring(28000,32000)+"','canvas',"+$scope.items[k].fileId+",'PR_WORK_CARDS',"+parentId+","+ $rootScope.globals.currentUser.divNo+","+id+") ";
                     sqlArray.push({ queryStr: sql2, queryType: "READ" });
                     console.log(sql2);
                 }
                 
                 
                 var sqlString = JSON.stringify(sqlArray);
                 WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                     return deferred.resolve('succeed');
                 }, function (error) {
                     WingsDialogService.error('Failed to delete annotations.');
                     return deferred.reject('failed');
                 });
                 
             }, function (error) {
                 WingsDialogService.error('Failed to delete annotations.');
                 return deferred.reject('failed');
             });
             return deferred.promise;
        }
        
        function getAnnotations () {
            console.log("get annotation");
            console.log("parent : "+ parent+" -----  parentid : "+parentId);
            var sql = "Select Parent,                                            " +
                      "       Parent_Id,                                         " +
                      "       DotX,                                              " +
                      "       DotY,                                              " +
                      "       PositionX,                                         " +
                      "       PositionY,                                         " +
                      "       Text,                                              " +
                      "       Text2,                                             " +
                      "       Text3,                                             " +
                      "       Text4,                                             " +
                      "       Text5,                                             " +
                      "       Text6,                                             " +
                      "       Text7,                                             " +
                      "       Text8,                                             " +
                      "       Title,                                             " +
                      "       File_Id,                                           " +
                      "       Id                                                 " +
                      "  From Gn_Annotations                                     " +
                      " Where Div_No    = "+$rootScope.globals.currentUser.divNo   +
                      "   And Parent    = '"+parent+"'"+
                      "   And Parent_Id = "+parentId+
                      "   And Active    = 'Y'                                    ";
            var sqlArray = [{ queryStr: sql, queryType: "READ" }];
            var sqlString = JSON.stringify(sqlArray);
            WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                var result = angular.fromJson(dataIn[0].rows);
                var resultGroupBy = _.groupBy(result, "file_id");
                var keyValues = Object.keys(resultGroupBy);
                var annotationObjects = [];
                for (i in keyValues) {
                    var sql = "Update Gn_Images Set Annotation_Objects = ? Where File_Id = ?";
                    //var annotationObjects = [];
                    for (j in resultGroupBy[Object.keys(resultGroupBy)[i]]) {
                        var groupObjects = resultGroupBy[Object.keys(resultGroupBy)[i]][j];
                        if (groupObjects.title == 'canvas'){
                            var index = getCanvasIndex(groupObjects.file_id);
                            if(index > -1){
                                textAll = groupObjects.text+
                                          groupObjects.text2+
                                          groupObjects.text3+
                                          groupObjects.text4+
                                          groupObjects.text5+
                                          groupObjects.text6+
                                          groupObjects.text7+
                                          groupObjects.text8;
                                canvasData[index] = {jsonData :angular.fromJson(textAll), id : groupObjects.id};
                            }
                        }else{
                            var tempObj = 
                            {
                                //name:"anno"+groupObjects.id,
                                //pageNumber:groupObjects.file_id,
                                tag:groupObjects.title,
                                fileId:groupObjects.file_id,
                                columnId:"anno"+groupObjects.id,
                                positionX:groupObjects.positionx+'%',
                                positionY:groupObjects.positiony+'%',
                                type:'text',
                                value:groupObjects.text,
                                width:groupObjects.dotx+'%',
                                height: groupObjects.doty+'%',
                                placeholder:'',
                                annotation:true,
                                draggable:false,
                                editable:false
                            };  
                    
                            annotationObjects.push(tempObj);
                        }
                    }
                    if (canvasData[$scope.activePage] && canvasData[$scope.activePage].jsonData != undefined){
                        canvas.loadFromJSON(canvasData[$scope.activePage].jsonData, canvas.renderAll.bind(canvas)); 
                    }
                     WingsTransactionDBService.executeSql(sql,[angular.toJson(annotationObjects),keyValues[i]]).then(function (result){
                     }, function (error) {
                         console.log("INSER OR REPLACE ISSUE FAILURE! "+error);
                     });
                }
                $scope.formItems = $rootScope.documentObjects.concat(annotationObjects);
            }, function (error) {
                WingsDialogService.error('Failed to get annotations.');
            });

        };
        
        performStep = function (id){
            $scope.saveAnnotations().then(function(result){
                var sql = "Select * from pr_card_steps where id = ?";
                var parameters = [id];
                WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                    var steps = [];
                    var tempStep = result[0];
                    tempStep.STEP_ACTION = 'OK';
                    tempStep.MOBILE_RECORD_ACTION = 'PERFORM';
                    tempStep.MOBILE_RECORD_STATUS = 'READY';
                    tempStep.PERFORM_DATE = moment().format('YYYY-MM-DD');
                    tempStep.MECHANIC_EMPLOYEE_NUMBER = $rootScope.globals.currentUser.userNumber;
                    var tempTime = moment().format('YYYY-MM-DD HH:mm:ss');
                    tempStep.MOBILE_DT_MODIFIED = tempTime;
                    tempStep.MOBILE_USR_MODIFIED = $rootScope.globals.currentUser.userNumber;
                    tempStep.MOBILE_USER_ID = $rootScope.globals.currentUser.userId;
                    tempStep.DIV_NO =  $rootScope.globals.currentUser.divNo;
                    steps.push(tempStep);
                    pr.SaveStep(steps).then(function(result){
                        sy.CreateTransaction(tempTime,"PR_CARD_STEPS",tempStep.MOBILE_RECORD_ID,tempStep.MOBILE_RECORD_ACTION,tempStep.ID,tempStep.CARD_ID,tempStep.MOBILE_CARD_ID).then(function(result){
                            if (!$rootScope.globals.deviceConnectionInfo.isOnline){
                                WingsDialogService.notification('Perform action is saved to local DB and will be synced when the device is online.','YELLOW');  
                            }else{
                                pr.pushAndPull({ID: parentId},tempStep).then(function(result){
                                    if (result.status == 'SUCCEED'){
                                            if (result.childObj.STATUS == 'LOADED'){
                                                WingsDialogService.success('Process Completed.');
                                                getAnnotations()
                                            }else{
                                                WingsDialogService.error(result.childObj.SERVER_FEEDBACK);
                                            }
                                    }else{
                                        console.log(result.error);
                                        WingsDialogService.error(result.error);
                                    }
                                },function(error){
                                    console.log(error);
                                    WingsDialogService.error(error);
                                });
                            }
                        },function(err){
                            WingsDialogService.error('Could not take action. Reason - LOCAL DB ERROR : '+ error);
                        })
    
                    },function(error){
                        WingsDialogService.error('Could not take action. Reason - LOCAL DB ERROR : '+ error);
                    })
                },function(error){
                    WingsDialogService.error('Could not take action. Reason - LOCAL DB ERROR : '+ error);
                });
            },function(eror){
                WingsDialogService.error('Could not take action. Reason - Can not save annotations');
            })
        }
        function getCanvasIndex(fileId){
            for(i=0; i<$scope.items.length; i++){
                if ($scope.items[i].fileId == fileId){
                   return i; 
                }
            }
            return -1;
        }
	}])