var wingsPouchDbModule = angular.module('wings.mobile.modules.PouchDBW', [ 'ngCordova' ]);


wingsPouchDbModule.factory('WingsPouchDbSetupService', ['$rootScope',"$q","WINGS_CONFIG",
                                                   function( $rootScope,$q,WINGS_CONFIG){
	var _db;
	var remoteDB;
	var changeListener;
	var _rep;
	    
    var service = {
    	init:init,
    	getDocument:getDocument,
    	getAllDocuments:getAllDocuments,
    	findDocuments:findDocuments,
    	getAllIndexes:getAllIndexes,
    	resetDatabase:resetDatabase,
    	closeDb:closeDb,
    	executeLogin:executeLogin,
    	fetchUserRoles:fetchUserRoles,
    	fetchRolePrograms:fetchRolePrograms,
    	findViewDocument:findViewDocument,
    	getAllDocuments:getAllDocuments
    };
    return service;
    
    function executeLogin(username, password,passwordUppercaseHash){
        var deferred = $q.defer();
        var criteria ={
                selector: {'Table_Name': 'SY_USERS',
                          'Data.USER_ID' : username,
                          $or: [ { 'Data.PASSWORD_HASH': { $eq: password.toUpperCase() } },{ 'Data.PASSWORD_HASH': { $eq: passwordUppercaseHash.toUpperCase() } } ]},
            fields: ['Table_Name','Record_Id','Data']
      };
        findDocuments(criteria).then(function (result) {
            console.log("**********************************findDocument result : " +JSON.stringify(result));
            if (result.docs.length > 0) {
                return deferred.resolve(result.docs[0].Data);
            }
            return deferred.resolve(null);

          }).catch(function (err) {
            // ouch, an error
               console.log("**********************************findDocument err : " +JSON.stringify(err));
               return deferred.reject(err);
          });
        return  deferred.promise;
     }
    function getRoleTitle (roleId) {
        var deferred = $q.defer();
        var criteria = { selector: {'Table_Name'   : 'SY_ROLES',
                                    'Data.ROLE_ID' : roleId,
                                    'Data.ACTIVE'  : 'Y'},
                         fields: ['Data']
        };
        findDocuments(criteria).then(function (result) {
            if (result.docs.length > 0) {
                var obj = {
                        'ROLE_ID' : result.docs[0].Data.ROLE_ID,
                        'ROLE_TITLE' : result.docs[0].Data.DESCRIPTION
                };
                return deferred.resolve(obj);
                //return deferred.resolve(result2.docs[0].Data.DESCRIPTION);
            }
        }).catch(function (err) {
            return deferred.reject(err);
       });
        return  deferred.promise;
    }
    function fetchUserRoles(userId){
        var deferred = $q.defer();
        var criteria ={
                selector: {'Table_Name': 'SY_USER_ROLES',
                           'Data.USER_ID' : userId,
                           'Data.ACTIVE':'Y'},
                fields: ['Data.ROLE_ID']
      };

        findDocuments(criteria).then(function (result) {
            if (result.docs.length > 0) {
                var promises = [];
                for(var i = 0; i < result.docs.length;i++) {
                    promises.push(getRoleTitle(result.docs[i].Data.ROLE_ID));
                }
                $q.all(promises).then(function(res) {
                    return deferred.resolve(res);
                },function(error) {
                    console.log("PROMISES  - ERROR"+JSON.stringify(error));
                  });
            }else{
            	return deferred.reject("There is no role for this user !");
            }
          }).catch(function (err) {
               console.log("**********************************findDocument err : " +JSON.stringify(err));
               return deferred.reject(err);
          });
        return  deferred.promise;
     }
    
    function fetchRolePrograms(roleId){
        var deferred = $q.defer();
        var criteria ={
                selector: {'Table_Name':  {
                                $eq: 'SY_ROLE_PROGRAMS'
                            },
                           'Data.ROLE_ID' :  {
                               $eq: roleId
                           },
                           'Data.ACTIVE': {
                               $eq: 'Y'
                           },
                           'Data.LEVEL': {
                               $gt: ''
                             }},
                fields: ['Data'],
                sort: ['Data.LEVEL']
      };
        findDocuments(criteria).then(function (result) {
        	var programs = [];
            if (result.docs.length > 0) {
                for(var i = 0; i < result.docs.length;i++) {
                    var obj = {
                            'PROGRAM_ID' : result.docs[i].Data.PROGRAM_ID,
                            'PROGRAM_TITLE' : result.docs[i].Data.TITLE
                    };
                    programs.push(obj);
                }
                return deferred.resolve(programs);
            }
            return deferred.resolve(programs);
        }).catch(function (err) {
            return deferred.reject(err);
       });
        return  deferred.promise;
     }
    function init(){
    	//PouchDB.plugin(require('pouchdb-find'));
    	//PouchDB.plugin(PouchFind)
    	//PouchDB.debug.enable('*');
    	console.log("WingsPouchDbSetupService : INIT");
    	_db = new PouchDB('WingsPouchSetupDB', {adapter: 'websql', location: 'default'}); // LOCAL
    	
        remoteDB = new PouchDB(WINGS_CONFIG.COUCHDB_URL,{latest:true}); // REMOTE
        //_db.info().then(console.log).catch(console.error)

        _rep= _db.replicate.from(remoteDB, {
           live: true,
           retry: true,
           batch_size: 200
         }).on('change', function (change) {
        	 $rootScope.progressMessage =change.start_time + " -- " + change.docs_read+"/"+change.docs_written;
        	 $rootScope.$broadcast('loading:show');
           // yo, something changed!
         // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!CHANGE START TIME : " +JSON.stringify(change));
          console.log("*************************************************************************************************************************");
          console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!CHANGE start_time : " +change.start_time);
          console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!CHANGE docs_read : " +change.docs_read);
          console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!CHANGE docs_written : " +change.docs_written);
          console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!CHANGE doc_write_failures : " +change.doc_write_failures);
          console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!CHANGE errors : " +change.errors);
          console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!CHANGE deleted : " +change.deleted);
         // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!CHANGE change : " +JSON.stringify(change));
          console.log("*************************************************************************************************************************");
          
         }).on('paused', function (err) {
	           // replication was paused, usually because of a lost connection
	          console.log("replication was paused, usually because of a lost connection");
	          $rootScope.$broadcast('loading:hide');
         }).on('active', function (e) {
	           // replication was resumed
	          console.log("ractive : "+e);
         }).on('complete', function (info) {
	           // replication was resumed
	          console.log("completed "+JSON.stringify(info));
         }).on('denied', function (info) {
	           // replication was resumed
	          console.log("denied "+JSON.stringify(info));
         }).on('error', function (err) {
	           // totally unhandled error (shouldn't happen)
	          console.log("totally unhandled error (shouldn't happen) : "+err);
         });
       // findDocument();

    };
    function closeDb(){
    	/*
    	_db.close().then(function () {
    		console.log("COUCH DB CLOSED SUCCESS");
    	});
    	*/
    }
    function resetDatabase(){
    	
    	_rep.cancel();
    	
    	_db.destroy().then(function (response) {
    		init();
    		}).catch(function (err) {
    		  console.log(err);
    		});
    };
    function getDocument(documentId) {
    	return _db.get(documentId);
    };
    function getAllDocuments() {
       return $q.when(_db.allDocs({ include_docs: true}))
        .then(function(docs) {
        	return row.doc;
       });
    };
    function findDocuments(criteria){
    	return _db.find(criteria);
    };
    function findViewDocument(criteria){
    	return _db.query('employees',criteria);
    };
    function getAllIndexes(){
    	return _db.getIndexes();
    };

}]);