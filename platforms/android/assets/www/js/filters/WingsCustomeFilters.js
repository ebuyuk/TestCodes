angular.module('wings.mobile.filters', []);

angular.module('wings.mobile.filters')
.filter('inSlicesOf', 
  ['$rootScope',  
  function($rootScope) {
      function cacheIt(func) {
          cache = {};
          return function(arg,arg2) {
            // if the function has been called with the argument
            // short circuit and use cached value, otherwise call the
            // cached function with the argument and save it to the cache as well then return
            return cache[arg,arg2] ? cache[arg,arg2] : cache[arg,arg2] = func(arg,arg2);
          };
        };

        // unchanged from your example apart from we are no longer directly returning this   ​
        function chunk(items, chunk_size) {
          var chunks = [];
          if (angular.isArray(items)) {
            if (isNaN(chunk_size))
              chunk_size = 4;
            for (var i = 0; i < items.length; i += chunk_size) {
              chunks.push(items.slice(i, i + chunk_size));
            }
          } else {
            console.log("items is not an array: " + angular.toJson(items));
          }
          return chunks;
        };
   
        return cacheIt(chunk);
  }]
 )
.filter('truncate', function() {
 return function(text, length, end) {

  if (text == null || text.length == 0)
   return null;

  length = length || 10;
  end = end || '...';

  if (text.length <= length || text.length - end.length <= length) {
   return text;
  } else {
   return String(text).substring(0, length - end.length) + end;
  }

 };
}).filter('reverse', function() {
 return function(input, uppercase) {
  input = input || '';
  var out = "";
  for (var i = 0; i < input.length; i++) {
   out = input.charAt(i) + out;
  }
  // conditional based on optional argument
  if (uppercase) {
   out = out.toUpperCase();
  }
  return out;
 };
}).filter('ordinal', function() {

 // Create the return function
 // set the required parameter name to number
 return function(number) {

  // Ensure that the passed in data is a number
  if (isNaN(number) || number < 1) {

   // If the data is not a number or is less than one (thus not having
   // a cardinal value) return it unmodified.
   return number;

  } else {

   // If the data we are applying the filter to is a number, perform
   // the actions to check it's ordinal suffix and apply it.

   var lastDigit = number % 10;

   if (lastDigit === 1) {
    return number + ' st'
   } else if (lastDigit === 2) {
    return number + ' nd'
   } else if (lastDigit === 3) {
    return number + ' rd'
   } else if (lastDigit > 3) {
    return number + ' th'
   }

  }
 }
})
.factory('DynamicImageService', function($q,$cordovaFile){
 
 var StorageDirectory = cordova.file.dataDirectory;
  var service = {
    getOfflineData:getOfflineData
         };
    return service;
    
    function getFileContentAsBase64(path,callback){
     window.resolveLocalFileSystemURL(path, gotFile, fail);
             
     function fail(e) {
           alert('Cannot found requested file');
     }

     function gotFile(fileEntry) {
            fileEntry.file(function(file) {
               var reader = new FileReader();
               reader.onloadend = function(e) {
                    var content = this.result;
                    callback(content);
               };
               // The most important point, use the readAsDatURL Method from the file plugin
               reader.readAsDataURL(file);
            });
     }
 };
  
 function getOfflineData (file, directoryPar) {
         var q = $q.defer();
        // var q = WingsQRef.defer();
         var directory="wings_staticassets/staticsetup"+"/"+directoryPar
         $cordovaFile.checkDir(StorageDirectory, directory).then(function () {
             $cordovaFile.checkFile(StorageDirectory+directory+'/', file).then(function () { //file exists
                 var path = StorageDirectory+directory+'/'+file;
                 console.log("PATH : "+path);
             // var path =cordova.file.dataDirectory+ "wings_staticassets/staticsetup/engin1.png";
                 q.resolve(path)
             }, function (err) {
                 q.reject(err)
             })
         }, function (err) {
             q.reject(err)
         });
         return q.promise
     };
    
 })
.directive('wingsStaticAssestsPicture', ['$compile', 'DynamicImageService','$timeout', function($compile, DynamicImageService,$timeout){
  
  function link(scope, element, attr) {
   
   console.log(attr.engin);
   var fileName = attr.filename.split('//').pop().split('/').pop();
   DynamicImageService.getOfflineData(fileName, attr.directory).then(function (res) {
             element.attr('src',res);
             $timeout(function () {
                 scope.$apply()
             })
         })
         
       
   
   scope.$watch("filename", function (newView, prevView) {
             console.log("changed view " +  newView+" ex : "+ prevView);
             if(newView !== prevView){
                 DynamicImageService.getOfflineData(newView, attr.directory).then(function (res) {
                     element.attr('src',res);
                     $timeout(function () {
                         scope.$apply()
                     })
                 })
             }
            
         });
         
     }
    
  
  return {
         restrict: 'A',
         scope: {
             filename: '@',
             directory: '@'
         },
         link: link

     }
 }])
 .directive('expandingTextarea', function () {
    return {
        restrict: 'A',
        controller: function ($scope, $element, $attrs, $timeout) {
            $element.css('min-height', '0');
           // $element.css('resize', 'none');
            $element.css('overflow-y', 'hidden');
            //setHeight(0);
            //$timeout(setHeightToScrollHeight);

            function setHeight(height) {
        		var parent = angular.element($element)[0].parentElement.parentElement;
            	if($element.css('height').includes('%')){
            		var tempheight = $element.css('height').substring(0,$element.css('height').length-1);
            		var currentHeight = (Number(angular.element(parent).offsetHeight) /100)*Number(tempheight);
	        	}else{
	        		var currentHeight = Number($element.css('height').substring(0,$element.css('height').length-2));
	        	}
            	//console.log("current Height : "+currentHeight +"   -----  scroll Height : "+height);
            	if (height => currentHeight){
	                //$element.css('height', height + 'px');
            		var tempHeight =  (height / parent.offsetHeight ) * 100;
            		$element.css('height',tempHeight+'%');
	                var el = (angular.element($element));
	                var rrHeight = (el[0].offsetHeight / parent.offsetHeight) * 100;
 	                var rrTop = (el[0].offsetTop / parent.offsetHeight) * 100;
	                var reSize =  $element.next();
	                //var elHeight = ($element.height() / parent.offsetHeight) * 100;
	                //var elTop = ($element.offset().top / parent.offsetHeight) * 100;
	                //var result = elTop+elHeight-1;
	                //var result2 = $element.height()+$element.offset().top;
	                var result3 = rrTop+rrHeight/*-1*/;
	                //reSize.css('top', result + '%');
	                //reSize.css('top', result2 + 'px');
	                reSize.css('top',result3+ '%');
            	}
            }

            function setHeightToScrollHeight() {
                setHeight(0);
                var scrollHeight = angular.element($element)[0].scrollHeight;
                if (scrollHeight !== undefined) {
                    setHeight(scrollHeight);
                }
            }

            $scope.$watch(function () {
            	var str = angular.element($element)[0].value;
            	if (str.slice(-1) == '\n') {
            		str = str+' ';
            	}
                return str;
            }, setHeightToScrollHeight);
        }
    };
})
.directive('errSrc', function() {
      return {
        link: function(scope, element, attrs) {
          element.bind('error', function() {
            if (attrs.src != attrs.errSrc) {
              attrs.$set('src', attrs.errSrc);
            }
          });
          
          attrs.$observe('ngSrc', function(value) {
            if (!value && attrs.errSrc) {
              attrs.$set('src', attrs.errSrc);
            }
          });
        }
      };
    })
.directive('wings', function($compile,$sce) {
  return {
    scope: {
      list: '=wings'
    },
    link: function(scope, elem, attrs) {
      var appliedFlag = false; 
      for (attr in scope.list) {
    	  if (elem[0].id == scope.list[attr].id ) {
    		  if (scope.list[attr].attribute == 'visible') {
    			  elem.attr('ng-show',  scope.list[attr].value);
    			  appliedFlag = true;
    		  } else if (scope.list[attr].attribute == 'innerText') {
    			  var temp = $sce.trustAsHtml(scope.list[attr].value);
    			  elem.attr('ng-bind-html', scope.list[attr].value);
    			  appliedFlag = true;
    		  } else if (scope.list[attr].attribute == 'innerHtml') {
    			  elem.html(scope.list[attr].value);
    			  appliedFlag = true;
    		  } else if (scope.list[attr].attribute == 'readOnly') {
    			  elem.attr('ng-readonly',  scope.list[attr].value);
    			  appliedFlag = true;
    		  } else if (scope.list[attr].attribute == 'style') {
    			  var re = new RegExp(':', 'g');
    			  var match = new RegExp(',', 'g');
    			  var temp = "{'"+scope.list[attr].value.replace(re,"' : '").replace(match,"','")+"'}";
    			  elem.attr('ng-style', temp);
    			  appliedFlag = true;
    		  } else {
    			  elem.attr(scope.list[attr].attribute,  scope.list[attr].value);
    			  appliedFlag = true;
    		  }
    	  }
      }
      if (appliedFlag) {
    	  elem.removeAttr('wings');
    	  $compile(elem)(scope);
      }

    }
  };
})
 .directive('wingscolumn', function($ionicGesture,$compile) {
     return {
         restrict: "E",
         replace: true,
         template: "<div></div>",
         link: function(scope, element, attrs,ngModel) {
           var label,
               el,
               key,
               field;

           field = scope.field;
           if (field.tag == 'stamp') {
        	   var el        = document.createElement('div');
	           el.id = field.columnId;
        	   el.className  = 'boardPanePageStamp';
        	   el.innerHTML  = field['value'];
        	   el.style.top  = field['positionY'];
        	   el.style.left = field['positionX'];
        	   el.title      = 'Stamp title';
        	   el.style.zIndex = 41;
        	   el.style.fontSize = '50%';
           } else if(field.tag == 'section'){
               var el = document.createElement('div');
               el.className = 'formItems';
               el.id = field.columnId;
               //$ionicGesture.on('hold', scope.setActiveElement, element);
               //$ionicGesture.on('release', scope.onRelease, element);
               
               for(key in field) {
                   el.style.backgroundColor = 'rgba(211, 211, 211, 0.3)';
                   el.style.opacity = '0.7';
                   el.style.position= 'absolute';
                   el.innerHTML  = field['value'];
                   //el.style.borderRadius  = '4px';
                   //el.style.fontSize = '100%';
                   //el.style.lineHeight = '100%';
                   if (key == 'positionX') {
                       el.style.left = field[key];  
                   } else if (key == 'positionY') {
                       el.style.top = field[key];  
                   } else if (key == 'width') {
                       el.style.width = field[key];  
                   } else if (key == 'height') {
                       el.style.height = field[key];  
                   } 
                 if(field.hasOwnProperty(key) && // avoid prototype properties
                     key !== 'tag' && // avoid tag
                     key !== 'label' && // avoid label
                     key[0] !== '$' // avoid angular staff derived from scope
                 ) {
                   el.setAttribute(key, field[key]);
                 }
               } 
               el.setAttribute('functionBody', field.functionBody);
           } else {
        	   var reSizeImg = null;
        	   var imgButton = null;
        	   if (field['editable']){
        		   //var reSize = document.createElement('i');
        		   var reSize = document.createElement('img');
        		   //reSize.className = 'icon ion-arrow-resize assertive formItems';
        		   reSize.className = 'formItems';
        		   reSize.src = './img/system/crop.png'
        			   if(field.tag == 'input'){
                		   reSize.style.top  = (Number(field.positionY.substring(0,field.positionY.length-1)) + Number(field.width.substring(0,field.height.length-1)) +1) +'%';
        			   }else{
                		   reSize.style.top  = (Number(field.positionY.substring(0,field.positionY.length-1)) + Number(field.width.substring(0,field.height.length-1)) ) +'%';
        			   }
        		   reSize.style.left = (Number(field.positionX.substring(0,field.positionX.length-1)) + Number(field.width.substring(0,field.width.length-1)) /*- 1*/)+'%';
        		   //reSize.style.fontSize = '10px';
        		   reSize.style.width  = '20px';
        		   reSize.style.height = '20px';
        		   reSize.style.marginTop = '-10px';
        		   reSize.style.marginLeft = '-10px';
        		   //reSize.style.transform = 'rotate(90deg)'
        		   reSize.id = 'reSize'+field.columnId;
        		   
        		   var icon = document.createElement('i');
            	   icon.className = 'icon ion-close-round assertive formItems';
            	   icon.style.top  = (Number(field.positionY.substring(0,field.positionY.length-1)) - 1) +'%';
            	   icon.style.left = (Number(field.positionX.substring(0,field.positionX.length-1)) + Number(field.width.substring(0,field.width.length-1)) + 1)+'%';
            	   icon.style.paddingTop = "12px";
            	   icon.style.visibility = 'hidden';
            	   icon.style.fontSize = '20px'; 
            	   icon.id = 'icon'+field.columnId;
            	   icon.setAttribute('ng-click', "deleteViewById("+field.columnId+")");
        	   }

	           var el = document.createElement(field.tag);
	           el.className = 'formItems';
	           el.id = field.columnId;
	           if (field.tag == 'textarea') {
	        	   el.setAttribute('expanding-textarea','');
	           }
	    	   $ionicGesture.on('hold', scope.setActiveElement, element);
	    	   $ionicGesture.on('release', scope.onRelease, element);
	           
	           for(key in field) {
	               //el.style.backgroundColor = 'rgba(90, 200, 250, 0.4)';
	               el.style.opacity = '0.7';
	               el.style.position= 'absolute';
	               el.style.borderRadius  = '4px';
	               el.style.fontSize = '100%';
	               el.style.lineHeight = '100%';
	               el.innerHTML  = field['value'];
	        	   if (key == 'positionX') {
	        		   el.style.left = field[key];  
	        	   } else if (key == 'positionY') {
	        		   el.style.top = field[key];  
	        	   } else if (key == 'editable') {
	        		   el.setAttribute('ng-readonly', !field[key]);  
	        		   if(field[key]){
	        		       el.style.backgroundColor = 'rgba(90, 200, 250, 0.4)';
	        		   }else{
	        		       el.style.backgroundColor = '#f8f8f8';
	        		   }
	        	   } else if (key == 'width') {
	        		   el.style.width = field[key];  
	        	   } else if (key == 'height') {
	        		   el.style.height = field[key];  
	        	   } else if (key == 'name') {
	        		   scope.ngModel = field[key];
	        		   el.setAttribute('ng-model', field[key]);
	        		   //el.setAttribute('ng-show', attrs.ngShow)
	        		  
	        		   scope.$watch(field[key], function(data,x,y,z) {
	        			   y.$parent.$parent[y.field.name] = data;
	        		    });
	        		   
	        	   } else if (key == 'draggable') {
	        		   /* $ionicGesture.on('drag', function(event) {
	        			   event.target.style.left = (event.gesture.center.pageX-30) / event.target.parentElement.parentElement.clientWidth *100 +"%";
	        	           event.target.style.top = (event.gesture.center.pageY-90) / event.target.parentElement.parentElement.clientHeight *100+"%";
	     		      }, element); */
	        		   $ionicGesture.on('dragstart', scope.onDragStart, element);
	        		   $ionicGesture.on('drag', scope.onDrag, element);
	        	   }
	             if(field.hasOwnProperty(key) && // avoid prototype properties
	                 key !== 'tag' && // avoid tag
	                 key !== 'label' && // avoid label
	                 key[0] !== '$' // avoid angular staff derived from scope
	             ) {
	               el.setAttribute(key, field[key]);
	             }
	           }
           }
           element.append($compile(el)(scope));
           if (field['editable']){
        	   element.append($compile(reSize)(scope));
        	   element.append($compile(icon)(scope));
           } 
          
           if (field.tag == 'canvas') {
        	   var canvas = new fabric.Canvas(field.columnId);
        	   canvas.isDrawingMode = true;
        	   canvas.isEdited = true;
        	   canvas.width = field.width;
        	   canvas.height = field.height;
        	   scope.brushsize = "1";
        	   scope.brushcolor = '#000000';
        	   canvas.freeDrawingBrush.width = scope.brushsize;
        	   canvas.freeDrawingBrush.color = scope.brushcolor;
               fabric.Object.prototype.selectable = false;
               scope.canvasObj = canvas;
               var obj = document.getElementById(field.columnId);
               obj.style.opacity = '0.2';
               obj.parentElement.style.top = field.positionY;
               obj.parentElement.style.left = field.positionX;

           }
         }
       };
     });