/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


 var track = function(type,errorMessage){
	 $.ajax({
			type : "POST",
			//url : "http://192.168.1.172:8555/WingsMobileMediator/webresources/clientlog/insert",		// OFIS
			url : "http://192.168.1.5:8555/WingsMobileMediator/webresources/clientlog/insert",		// EV
			contentType : "application/json",
			data : angular.toJson({
				//url : $window.location.href,
				message : errorMessage,
				type : type//"exception",
				//stackTrace : stackTrace,
				//cause : (cause || "")
			})
		});
 };

var StoredFuncProcBuilder = function (nameP) {
    this.self = this;
    this.name = nameP;
    var counter = 0;
    this.inputParams = [];
    this.outputParams = [];
    for (var i = 1 ;i<=arguments.length;i++) {
    	var key,value;
    	if (counter%2 == 0 && counter != 0) {
    		if (key.indexOf('i_') > -1) {
    			this.addInputParameter(key ,value);
    		} else {
    			this.addOutputParameter(key);
    		} 
			key = arguments[i];
    	} else {
    		if (counter == 0) {
    			key = arguments[i];
    		} else {
    			value = arguments[i];
    		}
    	}
    	counter++;
    }
    //Built-in Parameters
};
StoredFuncProcBuilder.prototype.addInputParameter = function (paramNameP, paramValueP, paramTypeP, reservedFieldP) {
    this.inputParams.push({
        paramName: paramNameP,
        paramValue: paramValueP,
        paramType: (paramTypeP) ? paramTypeP : null,
        reservedField: (reservedFieldP) ? reservedFieldP : null
    });

    return this.self;
};

StoredFuncProcBuilder.prototype.addOutputParameter = function (paramNameP) {
    this.outputParams.push({
        paramName: paramNameP,
        paramValue: null,
        paramType: null,
        reservedField: null
    });
    return this.self;
};
StoredFuncProcBuilder.prototype.queryObject = function () {
    return obj = {
        name: this.name,
        inputParams: this.inputParams,
        outputParams: this.outputParams
    };
};
StoredFuncProcBuilder.prototype.queryObjectJson = function () {
    return JSON.stringify(this.queryObject());
};
var GroupItem = function (title) {
	this.groupName = title;
	this.MenuItems = [];
	
	this.addMenuItem = function(newObj) {
		this.MenuItems.push(newObj);
    };
};
var MenuItem = function (title,program_id,action,menulevel) {
	
	  var regex = /(<([^>]+)>)/ig;
	  this.title = title.replace(regex, "");
	  this.program_id = program_id;
	  this.action = action;
	  this.menulevel = menulevel;
	  this.items= [];
	  this.sref = 'app.'+program_id;
	  if((menulevel == 2 || menulevel == 1) && action){
		  this.hasSubMenu = true;
	  }else{
		  this.hasSubMenu = false;
	  }
};

 var RoleItem = function (roleId,description) {
	
	var regex = /(<([^>]+)>)/ig;
	
	  this.roleId = roleId;
	  this.description = description;
	  
};

