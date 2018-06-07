var wingsContextMenuModule = angular.module('wings.mobile.modules.ContextMenu', [ 'ngCordova' ]);

wingsContextMenuModule.factory('WingsContextMenuService', ['$rootScope','$state', function($rootScope,$state){
   
    var service = {
            menuClick:menuClick
        };
    return service;
    function menuClick (data) {
        var list = new Array();
        var inString = false;
        var name = '';
        var value = '';
        var position = 0;
        /*            if (!IsNull(systemMouseItem)) {
            systemMouseItem = systemMouseItem.toString();
            systemMouseItem = systemMouseItem.replaceAll("'","''");
        }
         */            for (var i = 0; i < data.length; i++) {
             var ch = data.charAt(i);
             if (ch == "'") {
                 if (i == 0 || data.charAt(i-1) != '\\') {
                     inString = !inString;
                 }
             }
             else {
                 if (!inString) {
                     if (ch == ',') {
                         value = data.substring(position, i).trim();
                         if (value.charAt(0) == "'") {
                             value = value.substr(1, value.length-2);
                         }
                         list.push({Name : name, Value : value});
                         position = i+1;
                     }
                     else if (ch == '=') {
                         name = data.substring(position, i).trim();
                         if (name == 'FUNCTION') {
                             value = data.substring(i+1,data.length);
                             list.push({Name : name, Value : value});
                             break;
                         }
                         position = i + 1;
                     }
                 }
             }
         }
         value = data.substring(position, i);
         if (value.charAt(0) == "'") {
             value = value.substr(1, value.length-2);
         }
         list.push({Name : name, Value : value});
         var programId  = '';
         var programView  = '';
         var params = '';
         var reportId   = '';
         var type       = 'pdf';
         var destinationType ='';
         var jsFunction = '' ;
         var command = '' ;
         var columnNames='';
         var columnValues='';
         var parameters = new Array();
         for (i = 0; i < list.length; i++) {
             //var parts = list[i].trim().split('=');
             var parts = list[i];
             if (parts.Name == 'DESTINATION_FORMAT') {
                 type = parts.Value;
             }
             else if (parts.Name == 'PROGRAM_VIEW') {
                 programView = parts.Value; 
             }
             else if (parts.Name == 'PROGRAM_ID') {
                 var programValues = parts.Value.split(';'), pairs, regExPairs = /(.*)=(.*)/i, regExRightPair = /(.*)\u002E(.*)/i ;

                 programId = programValues[0];
                 /* if (programId.charAt(0) == ':') {
                    programId = Script.GetItemValue(programId.substring(1));
                }
                else if (parts.Value.indexOf('Application.') == 0) {
                    programId = eval(parts.Value);
                }*/
                 if (programId == '') {
                     return false;
                 }
                 programId = programId.replace('_0','_M');

                 /* for (var j = 1 ; j < programValues.length; j++) {
                    pairs = regExPairs.exec(programValues[j]);
                    params += pairs[1] + '=';
                    if (regExRightPair.test(pairs[2])) {
                        params += Script.GetItemValue(pairs[2]);
                    }
                    else {
                        params += pairs[2];
                    }
                    if (!((programValues.length - 1) === j)) {
                        params += '&';
                    }
                } */              
             } 
             else if (parts.Name == 'REPORT_ID') {
                 reportId = parts.Value; 
                 /*if (reportId.charAt(0) == ':') {
                     reportId = Script.GetItemValue(reportId.substring(1));
                     if (reportId == '') {
                         return false;
                     }
                 }*/
             }
             else if (parts.Name == 'FUNCTION') {
                 jsFunction = parts.Value;
                 /* while (jsFunction.indexOf(':') > -1 ) {
                     var re = new RegExp(":([A-Za-z0-9_\.]+)", 'gi');
                     re.exec(jsFunction);
                     var item = RegExp.$1;
                     jsFunction = jsFunction.replace(':'+item,'Script.GetItemValue("'+item+'")');
                 }*/
                 break;
             }
             /*else if (parts.Name == 'COMMAND') {
                command = parts.Value;
                var re = /:([A-Za-z0-9_]+)\.([A-Za-z0-9_]+)/gi; 
                var m;
                var str = command;
                while ((m = re.exec(str)) !== null) {
                    if (m.index === re.lastIndex) {
                        re.lastIndex++;
                    }
                    var fieldValue = Script.GetItemValue(m[1]+'.'+m[2]);
                    command = command.replace(m[0],fieldValue);
                }
                break;
            }*/
             else {
                 /*if (parts.Value == ':SYSTEM.MOUSE_ITEM') {
                    parameters.push(new ObjectPair(parts.Name, systemMouseItem));
                }
                else if (parts.Value.indexOf('Application.') == 0) {
                    parameters.push(new ObjectPair(parts.Name, eval(parts.Value)));
                }
                else if(parts.Value.indexOf(':') == 0){
                    if (parts.Value.indexOf('.') > -1) {
                        parameters.push(new ObjectPair(parts.Name, Script.GetItemValue(parts.Value.substr(1))));
                    }
                    else {
                        parameters.push(new ObjectPair(parts.Name, recordParams ? recordParams[parts.Value.substr(1)] : Script.GetItemValue(viewName + '.' + parts.Value.substr(1))));
                    }
                } 
                else if (parts.Name == 'DESTINATION_TYPE' && parts.Value == 'MAIL') {
                    destinationType=parts.Value;
                }
                else {
                }*/
                 parameters.push(new ObjectPair(parts.Name, parts.Value)); 
             }
         }
         /*if(!IsNull(reportId) && IsNull(destinationType)) {
           window.setTimeout(function() { 
               var report = Script.CreateReport(reportId,reportId, type);
               for (var i = 0; i < parameters.length; i++) {
                   report[parameters[i].Name] = parameters[i].Value;
                   //report.AddParameter(parameters[i].Name, parameters[i].Value);
               }

               report.Run();
           } , 100);
        }*/
         if(jsFunction != '') {
             eval(jsFunction);
         }
         /*else if(!IsNull(command)) {
            if ("WebSocket" in window && window.chrome != undefined) {
                if(BarcodeSocket == null) {
                    scanInProgress = true;
                    Script.CheckDeamonPorts();
                }
                try {
                    if (BarcodeSocket != null && BarcodeSocket.readyState != 3) {
                        BarcodeSocket.send('notify#~#Executing Command...');
                        BarcodeSocket.send("execute#~#"+command);
                    }
                }catch (e) {
                    alert("Unable to execute command.");
                }
           }
        }*/
         else {
             /*var win = new Window(programId,"", -1, -1, -1, -1);
            if (!IsNull(destinationType)) {
                var columnNames = '', columnValues = '';
                for( var i = 0; i < parameters.length; i++) {
                    columnNames += parameters[i].Name;
                    columnValues += parameters[i].Value;
                    if (i < parameters.length) {
                        columnNames +=';';
                        columnValues+=';';
                    }
                }               
                win.AddParameter('reportId', reportId);
                win.AddParameter('type', type);
                win.AddParameter('columnNames', columnNames);
                win.AddParameter('columnValues', columnValues);
                win.Title = 'New Message';
            }
            else {*/
             var b = '$rootScope.'+programView+"=new Object()";
             eval(b);
             for (var i = 0; i < parameters.length; i++) {
                 var a = '$rootScope.'+programView+"."+parameters[i].Name+"="+parameters[i].Value;
                 eval(a);
             }
             // }
             // var windowLink = '/Wings/programs/' + programId.substr(0, 2).toLowerCase() + '/' + programId + '/' + programId + '.jsp?autoFetch=false';
             /*if (params !== '') {
                windowLink += '&' + params;
            }*/
             $state.go('app.'+programView);
             //win.Create(windowLink);
         }
    };
    function ObjectPair(name, value) {
        this.Name = name;
        this.Value = value;
    };

    ObjectPair.prototype = {
        Name    : null,
        Value   : null,
        
        toString  : function() {
            return this.Name + ':' + this.Value;
        },
        
        createCopy      : function() {
            return new ObjectPair(this.Name, this.Value);
        }
    };  
}]);