var wingsSocketModule = angular.module('wings.mobile.modules.Socket', [ 'ngCordova' ]);


wingsSocketModule.factory('WingsSocketService', ['$rootScope','$cordovaVibration','$cordovaDialogs','$timeout','WINGS_CONFIG','$timeout',
                                                   function( $rootScope,$cordovaVibration,$cordovaDialogs,$timeout,WINGS_CONFIG,$timeout){
    var WingsSocketServer = null;
    var SocketId = null;
    var filters  = new Array();

    var service = {
    	init:init,
    	AddListener:AddListener,
    	emit:emit,
    	disconnect:disconnect
    };
    return service;
    function init(){
         var joinServerParameters = { token: "WingsMobile" };
         WingsSocketServer = io.connect(WINGS_CONFIG.NOTIFICATION_SERVICE,{query: 'joinServerParameters=' + JSON.stringify(joinServerParameters) });
         WingsSocketServer.on('connect', function(){
             WingsSocketServer.emit('authentication', {id: 3333, userInfo: $rootScope.globals.currentUser});
         });
        
         WingsSocketServer.on('authenticated', function(msg) {
             $timeout(function () {
                 $rootScope.globals.deviceConnectionInfo.isOnline  = true;
                 $rootScope.globals.deviceConnectionInfo.isOffline = false;
             },100);
             console.log('User is authenticated ' + " Server socket id " + msg);
             SocketId = msg;
             //globalListeners();
             if (filters.length > 0) {
                 for (var i = 0; i<filters.length; i++) {
                     RemoveListener(filters[i].Channel);
                     RestoreListeners(filters[i].Channel,filters[i].Filter,filters[i].Callback);
                 }
             }
        });
        WingsSocketServer.on('disconnect', function () {
            $timeout(function () {
                $rootScope.globals.deviceConnectionInfo.isOnline  = false;
                $rootScope.globals.deviceConnectionInfo.isOffline = true;
            },100);
  		});
    };
   
    function AddListener (eventName, filter, callback) {
        WingsSocketServer.on(eventName, function () {  
            var args = arguments;
            $rootScope.$apply(function () {
                callback.apply(WingsSocketServer, args);
            });
        });

        var obj = new ChannelFilter(eventName,filter,SocketId);
        WingsSocketServer.emit('addFilter',obj);
        filters.push(new Backupfilter(eventName,filter,callback));
    };
    function RestoreListeners (eventName,filter,callback) {
        WingsSocketServer.on(eventName, function () {  
            var args = arguments;
            $rootScope.$apply(function () {
                callback.apply(WingsSocketServer, args);
            });
        });
        var obj = new ChannelFilter(eventName,filter,SocketId);
        WingsSocketServer.emit('addFilter',obj);
    };
    function RemoveListener (eventName) {
        WingsSocketServer.removeAllListeners(eventName); 
    };

    function globalListeners () {
        /*cordova.plugins.notification.badge.clear();
        AddListener('GN_MESSAGE_ITEMS.INSERT','function (o){return o.EMPLOYEE_NUMBER == '+$rootScope.globals.currentUser.userNumber+'}', function(msg){
            console.log('2');
            cordova.plugins.notification.badge.increase();
            $cordovaVibration.vibrate(1000);
            $cordovaDialogs.beep(1);
            $cordovaDialogs.alert(msg.MESSAGE_TEXT, msg.MESSAGE_SUBJECT);
        });
        AddListener('SYSTEM.ALERT',null,function(msg){
            console.log(msg.MESSAGE);
        });*/
    };
    function emit(eventName, data, callback) {
        WingsSocketServer.emit(eventName, data, function () {
             var args = arguments;
             $rootScope.$apply(function () {
             if (callback) {
                 callback.apply(WingsSocketServer, args);
             }
        });
        })
    };
    function disconnect () {
        WingsSocketServer.disconnect();
        filters  = new Array();
        WingsSocketServer = null;
    };
      function ChannelFilter (channel, filter, id) {
          this.Channel  = channel;
          this.Filter   = filter;
          this.SocketId = id;
      }
      ChannelFilter.prototype = {
          Channel          : null,
          Filter           : null,
          SocketId         : null    
      };
      function Backupfilter (channel, filter, callback) {
          this.Channel  = channel;
          this.Filter   = filter;
          this.Callback = callback;
      }
      Backupfilter.prototype = {
          Channel          : null,
          Filter           : null,
          Callback         : null    
      };
}]);