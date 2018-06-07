var wingsRemoteFileModule = angular.module('wings.mobile.modules.RemoteFile', [ 'ngCordova' ]);

wingsRemoteFileModule.factory('WingsRemoteFileService', ['Restangular','WINGS_CONFIG','WingsGlobalManager', function(Restangular,WINGS_CONFIG,WingsGlobalManager){

    // this is service object with list of methods in it this object will be used by controller
    var service = {
        name:name,
        fetchFile:fetchFile
    };
    function name(){
    	return "WingsRemoteFileService";
    }
    function fetchFile(fileName){
    	
     	console.log("[WingsRemoteFileService][fetchFile] : " +fileName);
     	
     	return Restangular.all(WINGS_CONFIG.FETCH_FILE).one('getfile', fileName).get();
     }
   
    
    return service;

}]);
