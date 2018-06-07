var wingsLocalFileModule = angular.module('wings.mobile.modules.LocalFile', [ 'ngCordova' ]);
var localFileLogHandler=null;

var fileTransferDir = '';
var fileDir = '';

wingsLocalFileModule.factory('WingsLocalFileService', ['Restangular','WINGS_CONFIG','WingsGlobalManager','$cordovaFile', function(Restangular,WINGS_CONFIG,WingsGlobalManager,$cordovaFile){

    // this is service object with list of methods in it this object will be used by controller
    var service = {
        name:name,
        init:init,
        writeLog:writeLog,
        readLog:readLog
    };
    function name(){
    	return "WingsLocalFileService";
    };
    function init(){
    	console.log("[WingsLocalFileService] [init]");
    	/*
    	// FREE DISK SPACE
    	 $cordovaFile.getFreeDiskSpace().then(function (success) {
        	 alert("SUCCESS : $cordovaFile.getFreeDiskSpace: "+JSON.stringify(success));
         }, function (error) {
             // error
        	 alert("ERROR : $cordovaFile.getFreeDiskSpace: "+JSON.stringify(error));
         });
    	 
    	// CHECK
	    $cordovaFile.checkDir(cordova.file.dataDirectory, "dir/other_dir").then(function (success) {
	    	alert("SUCCESS : $cordovaFile.checkDir: "+JSON.stringify(success));
	    }, function (error) {
	    	alert("ERROR : $cordovaFile.checkDir: "+JSON.stringify(error));
	    });
	    
	    // CREATE
	    $cordovaFile.createDir(cordova.file.dataDirectory, "new_dir", false).then(function (success) {
	    	alert("SUCCESS : $cordovaFile.createDir: "+JSON.stringify(success));
	      }, function (error) {
	    	  alert("ERROR : $cordovaFile.createDir: "+JSON.stringify(error));
	      });

	    $cordovaFile.createFile(cordova.file.dataDirectory, "new_file.txt", true).then(function (success) {
	    	alert("SUCCESS : $cordovaFile.createFile: "+JSON.stringify(success));
	      }, function (error) {
	    	  alert("ERROR : $cordovaFile.createFile: "+JSON.stringify(error));
	      });
    	
    	
    	window.resolveLocalFileSystemURL(cordova.file.applicationDirectory + "www/index.html", gotFile, fail);
    	
    	*/
    	
    	/*
    	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
    		console.log("got main dir",dir);
    		dir.getFile("log.txt", {create:true}, function(file) {
    			console.log("got the file", file);
    			localFileLogHandler = file;
    			writeLog("App started");			
    		});
    	});
    	*/
    	
    	
    		//example: list of www folder in cordova/ionic app.
    		//listDir(cordova.file.applicationDirectory + "www/");
    		console.log("");
    		//listDir(cordova.file.dataDirectory);
    	
    	/*
    	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSys) {

            fileSys.root.getDirectory('', { create: true, exclusive: false }, function (dir) {

                if (ionic.Platform.isAndroid()) {
                    var rootDirectory = dir.toURL();
                    fileTransferDir = cordova.file.externalDataDirectory;
                    if (fileTransferDir.indexOf(rootDirectory) === 0) {
                        fileDir = fileTransferDir.replace(rootDirectory, '');
                    } 
                    console.log('ANDROID FILETRANSFERDIR: ' + fileTransferDir);
					console.log('ANDROID FILEDIR: ' + fileDir);
                } else if (ionic.Platform.isIOS()) {
                    console.log('IOS cordova.file.documentsDirectory: ' + cordova.file.documentsDirectory);
					fileTransferDir = cordova.file.documentsDirectory;
					fileDir = '';
					console.log('IOS FILETRANSFERDIR: ' + fileTransferDir);
					console.log('IOS FILEDIR: ' + fileDir);
                }
				if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
					ClearDirectory();
					testFS();
					// Other functions here
				}

            }, errorHandler);
        }, errorHandler);
    	
    	*/
    		/*
    		var localURLs    = [
    		                    cordova.file.dataDirectory
    		                    cordova.file.documentsDirectory,
    		                    cordova.file.externalApplicationStorageDirectory,
    		                    cordova.file.externalCacheDirectory,
    		                    cordova.file.externalRootDirectory,
    		                    cordova.file.externalDataDirectory,
    		                    cordova.file.sharedDirectory,
    		                    cordova.file.syncedDataDirectory
    		                ];
    		                var index = 0;
    		                var i;
    		                var statusStr = "";
    		                var addFileEntry = function (entry) {
    		                    var dirReader = entry.createReader();
    		                    dirReader.readEntries(
    		                        function (entries) {
    		                            var fileStr = "";
    		                            var i;
    		                            for (i = 0; i < entries.length; i++) {
    		                                if (entries[i].isDirectory === true) {
    		                                    // Recursive -- call back into this subdirectory
    		                                    addFileEntry(entries[i]);
    		                                } else {
    		                                   fileStr += (entries[i].fullPath + "<br>"); // << replace with something useful
    		                                   index++;
    		                                }
    		                            }
    		                            // add this directory's contents to the status
    		                            statusStr += fileStr;
    		                            // display the file list in #results
    		                            if (statusStr.length > 0) {
    		                                $("#result").html(statusStr);
    		                            } 
    		                        },
    		                        function (error) {
    		                            console.log("readEntries error: " + error.code);
    		                            statusStr += "<p>readEntries error: " + error.code + "</p>";
    		                        }
    		                    );
    		                };
    		                var addError = function (error) {
    		                    console.log("getDirectory error: " + error.code);
    		                    statusStr += "<p>getDirectory error: " + error.code + ", " + error.message + "</p>";
    		                };
    		                for (i = 0; i < localURLs.length; i++) {
    		                    if (localURLs[i] === null || localURLs[i].length === 0) {
    		                        continue; // skip blank / non-existent paths for this platform
    		                    }
    		                    window.resolveLocalFileSystemURL(localURLs[i], addFileEntry, addError);
    		                }*/
    };
    function fail(e) {
    	console.log("FileSystem Error");
    	console.dir(e);
    };

    function gotFile(fileEntry) {

    	fileEntry.file(function(file) {
    		var s = "";
    		s += "<b>name:</b> " + file.name + "<br/>";
    		s += "<b>localURL:</b> " + file.localURL + "<br/>";
    		s += "<b>type:</b> " + file.type + "<br/>";
    		s += "<b>lastModifiedDate:</b> " + (new Date(file.lastModifiedDate)) + "<br/>";
    		s += "<b>size:</b> " + file.size + "<br/>";
    		
    		document.querySelector("#result").innerHTML = s;
    		console.dir(file);
    	});
    };
    
    function listDir(path){
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
		        function (err) {
		          console.log(err);
		        }
		      );
		    }, function (err) {
		      console.log(err);
		    }
		  );
		}

    /*
     List dir test and remove all dirs and files in test to start over again the test
    */
    function ClearDirectory() {
    		console.log('ClearDirectory');
    		//$cordovaFile.listDir(fileDir + 'test').then( function(entries) {
    		/*
    		listDir(fileDir + 'test').then( function(entries) {
    			console.log('listDir: ', entries);
    		}, function(err) {
    			console.error('listDir error: ', err);
    		});
    		*/
    		listDir(fileDir + 'test')
/*
    		$cordovaFile.removeRecursively(fileDir + 'test').then( function() {
    			console.log(trinlDir + ' recursively removed');
    		},function(err) {
    			console.log(fileDir + ' error: ', err);
    		});
    		*/
    };

    function testFS() {
    	// Download file from 'http://www.yourdomain.com/test.jpg' to test/one/test.jpg on device Filesystem
    		var hostPath = 'http://placehold.it/120x120&text=image1';
    		var clientPath = fileTransferDir + 'test/one/test.jpg';
    		var fileTransferOptions = {};
    		/*
    		$cordovaFile.downloadFile(hostPath, clientPath, true, fileTransferOptions).then (function() {
    		});
    		*/
    		// Create dir test
    		$cordovaFile.createDir(fileDir + 'test/').then( function(dirEntry) {
    			console.log("SUCCESS : $cordovaFile.createDir test");
    		},function(err) {
    			console.log("ERROR : $cordovaFile.createDir test");
    		});
    		// Create dir aganin in dir test
    		$cordovaFile.createDir(fileDir + 'test/one/').then( function(dirEntry) {
    			console.log("SUCCESS : $cordovaFile.createDir test/one/");
    		});
    		// Create empty file test.txt in test/again/
    		$cordovaFile.createFile(fileDir + 'test/one/test.txt', true).then( function(fileEntry) {
    			console.log("SUCCESS : $cordovaFile.createFile test/one/test.txt");
    		});
    		// List of files in test/again
    		/*$cordovaFile.listDir(fileDir + 'test/one/').then( function(entries) {
    		console.log('list dir: ', entries);
    		});*/
    		//listDir(fileDir + 'test/one/');
    		// Write some text into file 
    		$cordovaFile.writeFile(fileDir + 'test/one/test.txt', 'Some text te test filewrite', '').then( function(result) {
    			console.log("SUCCESS : $cordovaFile.writeFile test/one/test.txt");
    		});
    		// Read text written in file
    		$cordovaFile.readAsText(fileDir + 'test/one/test.txt').then( function(result) {
    			console.log('readAsText: ', result);
    		});
    	};

        function testQ() {
    		var hostPath = 'http://placehold.it/120x120&text=image1';
    		var clientPath = fileTransferDir + 'test/one/test.jpg';
                var fileTransferOptions = {};
    		$q.all([
    			//$cordovaFile.downloadFile(hostPath, clientPath, true, fileTransferOptions),
    			$cordovaFile.createDir(fileDir + 'test/'),
    			$cordovaFile.createDir(fileDir + 'test/two/'),
    			$cordovaFile.createFile(fileDir + 'test/one/test.txt', true),
    			//$cordovaFile.listDir(fileDir + 'test/one/'),
    			listDir(fileDir + 'test/one/'),
    			$cordovaFile.writeFile(fileDir + 'test/one/test.txt', 'Some text te test filewrite', ''),
    			$cordovaFile.readAsText(fileDir + 'test/one/test.txt')
    		]).then( function(result) {
    			console.log('testQ result: ', result);
    		});
        };
    
    function writeToFile(){
    	$cordovaFile.writeFile( 'file.txt', data, {'append':false} ).then( function(result) {
            // Success!
	    }, function(err) {
	    	// An error occured. Show a message to the user
	    });
    };
    
    function writeLog(str) {
    	if(!localFileLogHandler) return;
    	var log = str + " [" + (new Date()) + "]\n";
    	console.log("going to log "+log);
    	localFileLogHandler.createWriter(function(fileWriter) {
    		
    		fileWriter.seek(fileWriter.length);
    		
    		var blob = new Blob([log], {type:'text/plain'});
    		fileWriter.write(blob);
    		console.log("ok, in theory i worked");
    	}, fail);
    };
    function readLog() {
    	localFileLogHandler.file(function(file) {
    		var reader = new FileReader();

    		reader.onloadend = function(e) {
    			var result = this.result;
    			console.log(this.result);
    			return result;
    		};

    		reader.readAsText(file);
    	}, fail);

    };
    
    function fail(e) {
    	console.log("FileSystem Error");
    	console.dir(e);
    };
    function errorHandler(e) {
		  var msg = '';

		  switch (e.code) {
			case FileError.QUOTA_EXCEEDED_ERR:
			  msg = 'QUOTA_EXCEEDED_ERR';
			  break;
			case FileError.NOT_FOUND_ERR:
			  msg = 'NOT_FOUND_ERR';
			  break;
			case FileError.SECURITY_ERR:
			  msg = 'SECURITY_ERR';
			  break;
			case FileError.INVALID_MODIFICATION_ERR:
			  msg = 'INVALID_MODIFICATION_ERR';
			  break;
			case FileError.INVALID_STATE_ERR:
			  msg = 'INVALID_STATE_ERR';
			  break;
			default:
			  msg = 'Unknown Error';
			  break;
		  };

		  alert('Error: ' + msg);
		};
    
    return service;

}]);
