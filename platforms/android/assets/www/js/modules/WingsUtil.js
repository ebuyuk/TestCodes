var wingsUtilModule = angular.module('wings.mobile.modules.WingsUtil', [ 'ngCordova' ]);

wingsUtilModule.factory('WingsUtil', ['$window','$injector','$timeout','$rootScope',function($window,$injector,$timeout,$rootScope){
	
    var service = {
        Focus:Focus,
        IsNull:IsNull,
        Log:Log
    };
    return service;
    
    function Focus (id) {
        // timeout makes sure that is invoked after any other event has been triggered.
        // e.g. click events that need to run before the focus or
        // inputs elements that are in a disabled state but are enabled when those events
        // are triggered.
        $timeout(function() {
            var element = $window.document.getElementById(id);
            if(element)
                element.focus();
        },500);
    };
    function IsNull (obj) {
        if(obj != '' && obj != null && obj != undefined) {
            return false;
        } else {
            return true;
        }
    };
    function Log (msg) {
        console.log('[Wings Mobile] '+msg);
    };
}]);
