var syService = angular.module('wings.mobile.controllers.sy',[]);
syService.factory('sy', ['$q','$window','$injector','$timeout','$rootScope','WingsUtil','WingsGlobalManager','WingsTransactionDBService','WingsDialogService','WingsRemoteDbService','WingsConfigurationDBService','WINGS_CONFIG','$cordovaFileTransfer','Restangular','md5',
 function($q,$window,$injector,$timeout,$rootScope,WingsUtil,WingsGlobalManager,WingsTransactionDBService,WingsDialogService,WingsRemoteDbService,WingsConfigurationDBService,WINGS_CONFIG,$cordovaFileTransfer,Restangular,md5){
    var service = {
        CreateTransaction       : CreateTransaction,
        UpdateTransaction       : UpdateTransaction,
        RemoveSyncTransaction   : RemoveSyncTransaction,
        DiscardTransaction      : DiscardTransaction,
        InsertAttachment        : InsertAttachment,
        DeleteRecords           : DeleteRecords,
        PullAttachments         : PullAttachments,
        LoadAttachments         : LoadAttachments,
        LoadAttachmentsByParent : LoadAttachmentsByParent,
        PushAttachments         : PushAttachments,
        RunTach                 : RunTach,
        SyncronizeDB            : SyncronizeDB,
        GetTableRows            : GetTableRows,
        Login                   : Login,
        LoadSecurity            : LoadSecurity
    };
    return service;
    
    function PullAttachments (params) {
//        params :{
//            ParentName:'PR_WORK_CARDS',
//            ParentId: $scope.selectedCard.ID,
//            ImageType:'TECH-DATA'
//        } 

        var divNo       = $rootScope.globals.currentUser.divNo;
        var deferred    = $q.defer();
        var lastDateSql = "Select ifnull(Max(Datetime(Server_Transaction_Date)), Date('now', '-30 day')) imageLastDate " +
        		          "  From Gn_Images      "+
        		          " Where Parent     = ? "+
        		          "   And Parent_Id  = ? "+
        		          "   And Image_Type = ? ";
        WingsTransactionDBService.executeSql(lastDateSql,[params.ParentName,params.ParentId,params.ImageType]).then(function (result) {
            var imageLastDate = result[0].imageLastDate;
            
            var sql = " Select Div_No,                                      "+
                      "        Parent,                                      "+
                      "        Parent_Id,                                   "+
                      "        File_Id,                                     "+
                      "        Image_Type,                                  "+
                      "        Line,                                        "+
                      "        Long_File_Name,                              "+
                      "        File_Extension,                              "+
                      "        Nvl(Dt_Modified,Dt_Created) Transaction_Date "+
                      "   From Gn_Images_v                                  "+
                      "  Where Div_No     = " +divNo+
                      "    And Parent     = '"+params.ParentName+"'          "+
                      "    And Parent_Id  = '"+params.ParentId+  "'          "+
                      "    And Image_Type = '"+params.ImageType+ "'          "+
                      "    And Nvl(Dt_Modified,Dt_Created) > to_date('"+imageLastDate+"','yyyy-mm-dd hh24:mi:ss') "+
                      " Order By Image_Id                                    ";

            var sqlArray     = [{ queryStr: sql, queryType: "READ" }];
            var sqlString    = JSON.stringify(sqlArray);
            WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                var images    = angular.fromJson(dataIn[0].rows);
                var bindings  = [];
                
                //remote is successful, so remove local records
                var sql = "Delete From Gn_Images                       "+
                		  " where Parent     = '"+params.ParentName+"' "+
                          "   And Parent_Id  = '"+params.ParentId+  "' "+
                          "   And Image_Type = '"+params.ImageType+ "' "+
                          "   And File_Id    Is Null                   ";
                WingsTransactionDBService.executeSql(sql,[]);
                
                if (images.length > 0) {
                    var sqlImages = "INSERT OR REPLACE INTO GN_IMAGES ( Div_No,                    " +
                                    "                                   Parent,                    " +
                                    "                                   Parent_Id,                 " +
                                    "                                   File_Id,                   " +
                                    "                                   Image_Type,                " +
                                    "                                   Line,                      " +
                                    "                                   File_Location,             " +
                                    "                                   File_Extension,            " +
                                    "                                   Server_Transaction_Date)   " +
                                    "VALUES (?,?,?,?,?,?,?,?,?);                                   ";

                  var i;
                  for (i in images) {
                      parameters = [images[i].div_no,
                                    images[i].parent,
                                    images[i].parent_id,
                                    images[i].file_id,
                                    images[i].image_type,
                                    images[i].line,
                                    images[i].long_file_name,
                                    images[i].file_extension,
                                    moment(images[i].transaction_date).format('YYYY-MM-DD HH:mm:ss')];                        
                      bindings.push(parameters);
                  }
                  WingsTransactionDBService.insertCollection(sqlImages,bindings).then(function (result) {
                      return deferred.resolve("SUCCESS");
                  }, function (error) {
                      console.log("Package-Error : " +JSON.stringify(error));
                      return deferred.reject(JSON.stringify(error));
                  });
                } else {
                    return deferred.resolve("SUCCESS");
                } 
            }, function (error) { 
                return deferred.reject("Images Server Query FAILED "+JSON.stringify(error));
            });
        }, function (error) {   
            return deferred.reject(JSON.stringify(error));
        });
        
        return deferred.promise;
    }
    
    function PushAttachments () {
		var sql = " Select *                              " +
                  "   From Gn_Images a                    " +
                  "  Where Mobile_Record_Status = 'READY' " +
                  "    And Div_No = ?                     " ;
			var parameters = [$rootScope.globals.currentUser.divNo];
			WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
				var attachments = result;
	            for (var i = 0;i<result.length;i++) {
	            	var options = {
	            			fileName: "test01.jpg",
	            			chunkedMode: true,
	            			mimeType: "image/jpg",
	            			params :{
	            				ParentName: result[i].PARENT,
	            				ParentId  : result[i].PARENT_ID,
	            				ImageType : result[i].IMAGE_TYPE
	            			}
	            	};
	                $cordovaFileTransfer.upload(WINGS_CONFIG.MEDIATOR_URL+"/fileservice/doattachment", result[i].FILE_LOCATION, options).then(function(result) {
                		var sql = "Update Gn_Images set Mobile_Record_Status='' where Mobile_Record_Status = 'READY'";
                		WingsTransactionDBService.executeSql(sql,[]);
	                    console.log("SUCCESS: " + JSON.stringify(result.response));
	                }, function(err) {
	                    console.log("ERROR: " + JSON.stringify(err));
	                }, function (progress) {
	                    // constant progress updates
	                });
	            }
			}, function (error) {
                console.log(JSON.stringify(error));
            });
	};
    
    function LoadAttachments (obj) {
        var deferred = $q.defer();
    	 var checkquery = " Select *                           " +
				          "   From Gn_Images                   " +
				          "  Where Mobile_Record_Id in ( ? )   ";
    	 var ids = [];
    	 for (var i = 0;i<obj.length;i++){
    		 ids.push(obj[i].MOBILE_RECORD_ID);
    	 }
	     WingsTransactionDBService.executeSql(checkquery,[ids.join(",")]).then(function (result) {
	    	  if (result.length < 1) {
                  return deferred.resolve("NOREC");
	    	  }
	          var options = {
	    	      headers: {
	    			       "Authorization": WINGS_CONFIG.BASIC_AUTHENTICATION
	              }
	          }
	          var promises = [];
              var bindings = [];
	          for (var i = 0;i<result.length;i++) {
	        	  var targetPath = $rootScope.globals.wingsAssetsUzipFolderAfterDownload + '/attachments/'+result[i].FILE_ID+'.'+result[i].FILE_EXTENSION;
	        	  promises.push( $cordovaFileTransfer.download(WINGS_CONFIG.MEDIATOR_URL+"/fileservice/download/file?fileName="+result[i].FILE_LOCATION, targetPath.replace("/[\r\n]/g", ""), options, true));
	        	  var parameters = [targetPath,obj[i].MOBILE_RECORD_ID];
	        	  bindings.push(parameters);
	          }
	          $q.all(promises).then(function (res) {
      		      var updateSql = "Update Gn_Images Set File_Location = ? Where Mobile_Record_Id = ?";
      		      WingsTransactionDBService.insertCollection(updateSql,bindings);
                  return deferred.resolve(res);
	          });
	          
	     }, function (error) {
			 return deferred.reject("Login-Error : " +JSON.stringify(error));
		 });
	     return deferred.promise;
    };

    function LoadAttachmentsByParent (params) {
        var deferred = $q.defer();
        
         var checkquery = " Select *              "+
                          "   From Gn_Images      "+
                          "  Where Parent     = ? "+
                          "    And Parent_Id  = ? "+
                          "    And Image_Type = ? ";
         WingsTransactionDBService.executeSql(checkquery,[params.ParentName,params.ParentId,params.ImageType]).then(function (result) {
              var options = {
                  headers: {
                           "Authorization": WINGS_CONFIG.BASIC_AUTHENTICATION
                  }
              }
              var promises = [];
              var bindings = [];
              $rootScope.SY_0002 = {};
              $rootScope.SY_0002.savedFiles = [];
              
              for (var i = 0;i<result.length;i++) {
                  var targetPath = result[i].FILE_LOCATION;
                  if (result[i].FILE_ID && result[i].FILE_EXTENSION) {
                      targetPath = $rootScope.globals.wingsAssetsUzipFolderAfterDownload + '/attachments/'+result[i].FILE_ID+'.'+result[i].FILE_EXTENSION;
                  }
                  
                  $rootScope.SY_0002.savedFiles.push(targetPath);                  
                  
                  //online -- TODO do nu-ot pull the ones that are alredy pulled 
                  if ($rootScope.globals.deviceConnectionInfo.isOnline) {
                      promises.push( $cordovaFileTransfer.download(WINGS_CONFIG.MEDIATOR_URL+"/fileservice/download/file?fileName="+result[i].FILE_LOCATION, targetPath.replace("/[\r\n]/g", ""), options, true));
                      var parameters = [targetPath,result[i].MOBILE_RECORD_ID];
                      bindings.push(parameters);
                  }
              }
              
              //offline
              if (!$rootScope.globals.deviceConnectionInfo.isOnline) {
                  return deferred.resolve($rootScope.SY_0002.savedFiles);
              }
              
              $q.all(promises).then(function (res) {
                  var updateSql = "Update Gn_Images Set File_Location = ? Where Mobile_Record_Id = ?";
                  WingsTransactionDBService.insertCollection(updateSql,bindings).then(function(res2){
                      return deferred.resolve(res);
                  },function(){});
              });
         }, function (error) {
             return deferred.reject("Login-Error : " +JSON.stringify(error));
         });
         return deferred.promise;
    };

    function findLastTransactionDate () {
        var deferred   = $q.defer();
        var lastDateSql = "Select ifnull(Max(Datetime(Server_Transaction_Date)), Date('now', '-30 day')) From Gn_Images";
        
        WingsTransactionDBService.executeSql(lastDateSql,[]).then(function (result) {
            var lastDates = {
                    scheduledFlightsLastDate : result[0].scheduledFlightsLastDate,
                    flightLastDate           : result[0].flightLastDate,
                    consumptionLastDate      : result[0].consumptionLastDate,
                    inspectionLastDate       : result[0].inspectionLastDate,
                    crewLastDate             : result[0].crewLastDate,
                    formDataLastDate         : result[0].formDataLastDate,
                    flightsRejected          : result[0].flightsRejected,
                    consumptioRejected       : result[0].consumptioRejected,
                    inspectionRejected       : result[0].inspectionRejected,
                    crewRejected             : result[0].crewRejected,
                    defectLastDate           : result[0].defectLastDate,
                    defectAction             : result[0].defectAction=='LOAD-OPEN'?"And a.Status In ('OPEN', 'DEFERRED')":'',
                    packageLastDate          : result[0].packageLastDate,
                    packageAction            : result[0].packageAction=='LOAD-OPEN'?"And a.Status = 'OPEN' and Nvl(a.Tracking_Status,'X') != 'COMPLETED' ":'',
                    imageLastDate            : result[0].imageLastDate

            }
            return deferred.resolve(lastDates);
        }, function (error) {   
            return deferred.reject(JSON.stringify(error));
        });
        return deferred.promise;
    }

    function DeleteRecords () {
        var deferred = $q.defer();
    	var sql = "Select ifnull(nullif(Value,''),'0') Value From Sy_Environment where Symbol = 'MAXIMUM_DELETE_TRANSACTION_ID'";
    	WingsConfigurationDBService.executeSql(sql).then(function (result) {
    		var maxId = result[0].Value;
    		var sql = "Select Table_Name,                        " +
					  "         Record_Id,                       " +
					  "         Id                               " +
					  "    From Gn_Interface_Data a              " +
					  "   Where Interface = 'MOBILE-X'           " +
					  "     And Transaction_Type = 'DELETE'      " +
					  "     And Dt_Created > SysDate-30          " +
					  "     And Id > "+maxId;

			var sqlArray     = [{ queryStr: sql, queryType: "READ" }];
		    var sqlString    = JSON.stringify(sqlArray);
		    WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                var records = angular.fromJson(dataIn[0].rows);
		        for (var i = 0;i<records.length;i++) {
		    	    var lastId = records[i].id;
		    		var sql = "Delete From "+records[i].table_name +" Where Id = "+records[i].record_id;
		    		WingsTransactionDBService.executeSql(sql,[]).then(function (result) {
		    	        return deferred.resolve("SUCCESS");
		    		}, function (error) {
		    			console.log("Transaction DB auto delete failure."+error);
		    	        return deferred.reject(error);
		    		});
		    	}
		        if (records.length > 0) {
		        	var updateSql = "Update Sy_Environment Set Value = ? where Symbol = 'MAXIMUM_DELETE_TRANSACTION_ID'"
	        		WingsConfigurationDBService.executeSql(updateSql,[lastId]);
		        } else {
	    	        return deferred.resolve("SUCCESS");
		        }
            }, function (error) {
                console.log(JSON.stringify(error));
    	        return deferred.reject(error);
            });
    	});
        return deferred.promise;
     };
    
    function InsertAttachment(divNo,path,parent,parentId,mobileParentId,imageType){
        var deferred = $q.defer();
		var sql =   "Insert Into GN_IMAGES (Div_No,		           " +
					"                       File_Location,		   " +
					"                       File_Extension,        " +
					"                       Parent,                " +
					"                       Parent_Id,			   " +
					"                       Mobile_Parent_Id,      " +
					"                       Image_Type,            " +
					"                       Mobile_Record_Status,  " +
					"                       Mobile_Dt_Created)     " +
				    " Values (?,?,?,?,?,?,?,?,?);  ";
		if (WingsUtil.IsNull(imageType)) 
			imageType = 'IMAGE';
		var parameters = [
				divNo,
				path,
				path.split('.').pop(),
				parent,
				parentId,
				mobileParentId,
				imageType,
				'READY',
				moment().format('YYYY-MM-DD HH:mm'),
		];
		WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
            return deferred.resolve("SUCCESS");
		}, function (error) {
			console.log("ATTACHMENT INSERT PROBLEM "+error);
            return deferred.reject(error);
		});
        return deferred.promise;
    }
    
    function RunTach(options){
        var deferred = $q.defer();

        console.log("runtaching report");
        var result = Restangular.all(WINGS_CONFIG.REPORT).post(options).then(function (result) {
            return deferred.resolve(result);
        }, function (error) {
            return deferred.reject(error);
        });
        
        return deferred.promise;
    }
    
    function CreateTransaction(mobileActionDate,tableName,mobileRecordId,mobileRecordAction,serverRecordId,serverParentRecordId,mobileParentRecordId){
        var deferred = $q.defer();
        var sql = "Select IfNull(Max(MOBILE_RECORD_ID),'')Mobile_Record_Id, " +
        		  "       MOBILE_ACTION_DATE Mobile_Action_Date             " +
        		  "  From SY_TRANSACTION_QUEUE                              " +
        		  " Where MOBILE_TABLE_NAME = ?                             " +
        		  "   And MOBILE_TABLE_RECORD_ID                 = ?        " +
        		  "   And MOBILE_RECORD_ACTION                   = ?";
        parameters = [tableName,mobileRecordId,mobileRecordAction];
        WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
            var bindings = [];
            if (result[0].Mobile_Record_Id){
                var sql = "Insert or Replace Into SY_TRANSACTION_QUEUE (MOBILE_RECORD_ID,MOBILE_TABLE_NAME,MOBILE_TABLE_RECORD_ID,MOBILE_PARENT_RECORD_ID,MOBILE_RECORD_ACTION,MOBILE_RECORD_STATUS,MOBILE_ACTION_DATE,SERVER_RECORD_ID,SERVER_PARENT_RECORD_ID)                                                                                    "+
                "Values (?,?,?,?,?,?,?,?,?)";
                var row = [result[0].Mobile_Record_Id,
                           tableName,
                           mobileRecordId,
                           (mobileParentRecordId) ? mobileParentRecordId : null,
                           mobileRecordAction,
                          'READY',
                           result[0].Mobile_Action_Date,
                           (serverRecordId) ? serverRecordId : null,
                           (serverParentRecordId) ? serverParentRecordId : null];
                bindings.push(row);
            }else{
                var sql = "Insert or Replace Into SY_TRANSACTION_QUEUE (MOBILE_TABLE_NAME,MOBILE_TABLE_RECORD_ID,MOBILE_PARENT_RECORD_ID,MOBILE_RECORD_ACTION,MOBILE_RECORD_STATUS,MOBILE_ACTION_DATE,SERVER_RECORD_ID,SERVER_PARENT_RECORD_ID)                                                                                    "+
                "Values (?,?,?,?,?,?,?,?)";
                var row = [tableName,
                           mobileRecordId,
                           (mobileParentRecordId) ? mobileParentRecordId : null,
                           mobileRecordAction,
                          'READY',
                           mobileActionDate,
                           (serverRecordId) ? serverRecordId : null,
                           (serverParentRecordId) ? serverParentRecordId : null];
                bindings.push(row);
            }
            
            WingsTransactionDBService.insertCollection(sql,bindings).then(function (result){
                return deferred.resolve(result);
            }, function (error) {
                return deferred.reject(error);
            });
        },function(err){
            console.log(err);
            return deferred.reject(err);
        });
        
        return deferred.promise;
    }
    
    function UpdateTransaction (objectList){
    	var deferred = $q.defer();
    	var sql = "Update SY_TRANSACTION_QUEUE        " +
    			  "   Set MOBILE_RECORD_STATUS    = ?," +
    			  "       SERVER_RECORD_ID        = ?," +
    			  "       SERVER_PARENT_RECORD_ID = ?," +
    			  "       SERVER_FEEDBACK         = ? " +
    			  " Where MOBILE_RECORD_ID        = ? ";

        var bindings = [];
        for(i=0; i<objectList.length;i++){
        	var object = objectList[i];
        	var serverRecordId = null;
        	var serverParentRecordId = null;
        	if (object.OBJECT_TYPE == 'CARD'){
        		serverRecordId = object.ID ? object.ID: null;
        	}else if (object.OBJECT_TYPE == 'STEP'){
        		serverRecordId = object.ID ? object.ID: null;
        		serverParentRecordId = object.CARD_ID ? object.CARD_ID: null;
        	}else if (object.OBJECT_TYPE == 'REQUISITION'){
        		serverRecordId = object.ORDER_LINE_ID ? object.ORDER_LINE_ID: null;
        		serverParentRecordId = serverParentRecordId = object.CARD_ID ? object.CARD_ID: null;
        	}else if (object.OBJECT_TYPE == 'CLOCK'){
        		serverParentRecordId = serverParentRecordId = object.WORK_CARD_ID ? object.WORK_CARD_ID: null;
        	}
        		
	        var row = [object.MOBILE_RECORD_STATUS,
	                   serverRecordId,
	                   serverParentRecordId,
	                   object.SERVER_FEEDBACK,
	                   object.QUEUE_RECORD_ID];
	        bindings.push(row);
        }
        WingsTransactionDBService.insertCollection(sql,bindings).then(function (result){
            return deferred.resolve(result);
        }, function (error) {
            console.log(error);
            return deferred.reject(error);
        });
        return deferred.promise;
    }
    
    function RemoveSyncTransaction(){
        var deferred = $q.defer();
        var sql = " Delete From  Sy_Transaction_Queue                                                                                                                           "+
        		"    Where Mobile_Record_Status In('LOADED','REJECTED')                                                                                                           "+
        		"      And Sy_Transaction_Queue.Mobile_Record_Id In (Select b.Mobile_Record_Id                                                                                    "+
        		"                                                      From Sy_Transaction_Queue b,                                                                               "+
        		"                                                           Sy_Transaction_Queue b2                                                                               "+
        		"                                                     Where b.Mobile_Table_Name       = Sy_Transaction_Queue.Mobile_Table_Name                                    "+
        		"                                                       And b.Mobile_Record_Action    = Sy_Transaction_Queue.Mobile_Record_Action                                 "+
        		"                                                       And b2.Mobile_Record_Action   = b.Mobile_Record_Action                                                    "+
        		"                                                       And b2.Mobile_Table_Record_Id = b.Mobile_Table_Record_Id                                                  "+
        		"                                                       And b2.Mobile_Record_Id      >= b.Mobile_Record_Id                                                        "+
        		"                                                       And b2.Mobile_Record_Id       = (Select Max(c.Mobile_Record_Id)                                           "+
        		"                                                                                          From Sy_Transaction_Queue c                                            "+
        		"                                                                                         Where c.Mobile_Table_Name = b.Mobile_Table_Name                         "+
        		"                                                                                           And c.Mobile_Record_Action = b.Mobile_Record_Action                   "+
        		"                                                                                           And c.Mobile_Table_Record_Id = b.Mobile_Table_Record_Id               "+
        		"                                                                                           And c.Mobile_Record_Status = 'LOADED'))                               ";
        var parameters = [];
        //console.log(sql);
        WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
            deferred.resolve("GO-HEAD");
        },function(err){
            console.log(err);
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function DiscardTransaction (mobileRecordId, tableName){
        var deferred = $q.defer();
        if(tableName){
            var sql = " Delete From  Sy_Transaction_Queue       "+
                      "  Where  Mobile_Table_Name      = ? "+
                      "    And  Mobile_Table_Record_Id = ?";
            var parameters = [tableName,mobileRecordId];
        }else{
            var sql = " Delete From  Sy_Transaction_Queue                 "+
                      "  Where  (Mobile_Table_Name      = 'PR_WORK_CARDS' "+
                      "    And  Mobile_Table_Record_Id  = ?)              "+
                      "     Or  (Mobile_Table_Name     != 'PR_WORK_CARDS' "+
                      "    And  Mobile_Parent_Record_Id = ? )";
            var parameters = [mobileRecordId,mobileRecordId];
        }
        //console.log(sql);
        WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
            deferred.resolve("GO-HEAD");
        },function(err){
            console.log(err);
            deferred.reject(err);
        });
        return deferred.promise;
    }
    function syncronizeDBPrepareQueries (table) {
        var deferred = $q.defer();
        if (table.query1.indexOf('SELECT * FROM') == 0) {
            var sql = "PRAGMA table_info('"+table.table_name+"')";
            WingsTransactionDBService.executeSql(sql,[]).then(function (result) {
        	    var names = "";
        	    for (i in result) {
        		    if (result[i].name != 'MOBILE_RECORD_ID') {
        			    names = names.concat(","+result[i].name);
        		    }
        	    }
                return deferred.resolve("Select  "+names.substr(1)+" From "+table.table_name);
            },function(err){
                console.log(err);
                return deferred.reject(err);
            });
        } else {
        	var query = table.query1.concat(table.query2,
				               			    table.query3,
				            			    table.query4,
				            			    table.query5,
				            			    table.query6,
				            			    table.query7,
				            			    table.query8);
        	  //var sql = "Select '"+query+"' query";
        	var sql = "Select 1 ";
        	  WingsTransactionDBService.executeSql(sql,[]).then(function (result) {
                  return deferred.resolve(query);
              },function(err){
                  console.log(err);
                  return deferred.reject(err);
              });
        }
        return deferred.promise;
    };
    function syncronizeDBInsertDataCollection (insertSql,bindings) {
        var deferred = $q.defer();
    	WingsTransactionDBService.insertCollection(insertSql,bindings).then(function (result){
			return deferred.resolve("GOHEAD");
		}, function (error) {
        	$rootScope.$broadcast('firstuse:hide');
		});
        return deferred.promise;
    }
    function syncronizeDBInsertData (sql,obj) {
        var deferred = $q.defer();
        WingsTransactionDBService.executeSql(sql,Object.values(obj)).then(function (result) {
            return deferred.resolve("GOHEAD");
		}, function (error) {
            return deferred.reject(error);
			console.log("Transaction DB auto insert failure."+error);
		});
        return deferred.promise;
    };
    function SyncronizeDB (interfaceName) {
        var startDate = moment().valueOf();
        var deferred = $q.defer();
        var sql = " Select Max(Value) Value From Sy_Syncronization Where Symbol = 'MAXIMUM_INTERFACE_DATA_ID'";
        WingsTransactionDBService.executeSql(sql,[]).then(function (result) {
            if (!WingsUtil.IsNull(result[0].Value)) {
                var sqlArray = [{ queryStr: "Select * From Gn_Interface_Data Where Interface = 'MOBILE' And Id > "+result[0].Value, queryType: "READ" }];
                WingsRemoteDbService.executeQuery(sqlArray).then(function (dataIn) {
                    $rootScope.$broadcast('synchronizing:show');
                    var data = angular.fromJson(dataIn[0].rows);
                    if (data.length > 0) {
                    	var promises = [];
                        var startDate2 = moment().valueOf();
                        console.log('Timestamp start:'+moment().valueOf())
                    	console.log("STARTED")
                    	for (i in data) {
        		    	    var lastId = data[i].id;
                            if (data[i].transaction_type == 'INSERT' || data[i].transaction_type == 'UPDATE') {
                                data[i].record_data_01.concat(data[i].record_data_02,
                                                           data[i].record_data_03,
                                                           data[i].record_data_04,
                                                           data[i].record_data_05,
                                                           data[i].record_data_06,
                                                           data[i].record_data_07,
                                                           data[i].record_data_08);
                                var obj = JSON.parse(data[i].record_data_01);
                                var keys    = Object.keys(obj);
                                var values  = Object.values(obj);
                                var questionMarks = "";

                    			for (z in Object.values(obj)) {
                    				questionMarks += ",?";
                    			}
                                var sql = "INSERT OR REPLACE INTO  "+data[i].table_name+" ("+keys.join()+") Values ("+questionMarks.substr(1)+")";
                                promises.push(syncronizeDBInsertData(sql,obj));
                            } 
                            else if (data[i].transaction_type == 'DELETE') {
                            	var sql = "Delete From "+data[i].table_name +" Where Id = "+data[i].record_id;
                                promises.push(syncronizeDBInsertData(sql,[]));
                            } 
                            else if (data[i].transaction_type == 'ALTER') {
                            	data[i].record_data_01.concat(data[i].record_data_02,
                                        data[i].record_data_03,
                                        data[i].record_data_04,
                                        data[i].record_data_05,
                                        data[i].record_data_06,
                                        data[i].record_data_07,
                                        data[i].record_data_08);
                                promises.push(syncronizeDBInsertData(data[i].record_data_01,[]));
                            }
                    	}
                    	console.log(promises.length);
                        var updateSql = " Update Sy_Syncronization Set Value = ? Where Symbol = 'MAXIMUM_INTERFACE_DATA_ID'";
                        promises.push(syncronizeDBInsertData(updateSql,[lastId]));
                    	$q.all(promises).then(function(res) {
                            $rootScope.$broadcast('synchronizing:hide');
                        	console.log("FINISHED")
                        	console.log('Timestamp end:'+moment().valueOf())
            				console.log('Diff All: '+(moment().valueOf()-startDate));
            				console.log('Diff Just Insert: '+(moment().valueOf()-startDate2));

                        }, function (error) {
                            $rootScope.$broadcast('synchronizing:hide');
    		    			console.log("Transaction DB auto delete failure."+error.message);
    		    		});
                    } else {
                        $rootScope.$broadcast('synchronizing:hide');
                    }
                },function(err){
                    $rootScope.$broadcast('synchronizing:hide');
                    console.log(err);
                    return deferred.reject(err);
                });
            } 
            else {
                var sqlArray = [{ queryStr: "Select Max(Id) MAXIMUM_INTERFACE_DATA_ID From Gn_Interface_Data", queryType: "READ" },
                                { queryStr: "Select a.Table_Name, Nvl(b.Query1, 'SELECT * FROM ' || a.Table_Name) Query1, b.Query2, b.Query3, b.Query4, b.Query5, b.Query6, b.Query7, b.Query8 From Gn_Interfaces        a, Gn_Interface_Queries b  Where a.Interface = 'MOBILE' And b.Div_No(+) = a.Div_No And b.Interface(+) = a.Interface And b.Table_Name (+)= a.Table_Name",     queryType: "READ" }]
                var sqlString = JSON.stringify(sqlArray);
                WingsRemoteDbService.executeQuery(sqlString).then(function (result) {
                    var maxId  = angular.fromJson(result[0].rows)[0].maximum_interface_data_id;
                    var updateSql = " INSERT OR REPLACE INTO Sy_Syncronization (Symbol,Value) Values ('MAXIMUM_INTERFACE_DATA_ID',?) ";
                    WingsTransactionDBService.executeSql(updateSql,[maxId]);
                    var tables = angular.fromJson(result[1].rows);
                    var sqlArray = [];
                	var promises = [];

                    for (var t=0; t<tables.length; t++) {
                        promises.push(syncronizeDBPrepareQueries(tables[t]));
                    }
                    $q.all(promises).then(function(res) {
                        for (i in res) {
                            sqlArray.push({ queryStr: res[i], queryType: "READ" });
                        }
                        var sqlString = JSON.stringify(sqlArray);
                        WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                        	$rootScope.$broadcast('firstuse:show');
                            for (var i=0; i<tables.length; i++) {
                                var deleteSql = "Delete From "+tables[i].table_name;
                                WingsTransactionDBService.executeSql(deleteSql,[]);
                            }
                            for (var i=0; i<tables.length; i++) {
                            	if (dataIn[i].rows != undefined && dataIn[i].rows) {
                            		var data          = angular.fromJson(dataIn[i].rows);
                            		if (data.length > 0) {
                            			var questionMarks = "";
                            			var bindings      = [];
                            			var promises      = [];
                            			for (z in Object.keys(data[0])) {
                            				questionMarks += ",?";
                            			}
                            			var insertSql = "Insert Into "+tables[i].table_name+" ( "+ Object.keys(data[0]).join()+") values ( "+questionMarks.substr(1)+" )";
                            			for (j in data) {
                            				bindings.push(Object.values(data[j]));
                            			}
                            			promises.push(syncronizeDBInsertDataCollection(insertSql,bindings));
                            		} 
                            	}
                            }
                            $q.all(promises).then(function(res) {
                        	    $rootScope.$broadcast('firstuse:hide');
                            },function(err) {
                        	    $rootScope.$broadcast('firstuse:hide');
                                console.log(err);
                                return deferred.reject(err);
                            });
                        },function(err) {
                        	    $rootScope.$broadcast('firstuse:hide');
                                console.log(err);
                                return deferred.reject(err);
                        });
                    },function(err){
                    	$rootScope.$broadcast('firstuse:hide');
                        console.log(err);
                        return deferred.reject(err);
                    });
                },function(err){
                	$rootScope.$broadcast('firstuse:hide');
                    console.log(err);
                    return deferred.reject(err);
                });
            }
            return deferred.resolve("GO-HEAD");
        },function(err){
            console.log(err);
            returndeferred.reject(err);
        });
        return deferred.promise;
    };
    function GetTableRows (sql, bindings) {
        var deferred = $q.defer();
        WingsTransactionDBService.executeSql(sql, bindings).then(function (result) {
            return deferred.resolve(result);
        }, function (error) {
            return deferred.reject(error);
        });
        return deferred.promise;
    };
    function Login (userId, password) {
        var deferred = $q.defer();
        var sql = "Select * From Sy_Users where User_Id = ? And (Password_Hash = ? Or Password_Hash = ?)";
        WingsTransactionDBService.executeSql(sql,[angular.uppercase(userId),angular.uppercase(md5.createHash(password)),angular.uppercase(md5.createHash(password.toUpperCase()))]).then(function (dataIn) {
            var rows = dataIn[0];
        	if(!_.isEmpty(rows)) {
                return deferred.resolve({ success: true, message: '' });
        	} else {
                return deferred.resolve({ success: false, message: 'Username or password is incorrect'});
            }
        },function (error) {
            return deferred.reject("Login-Error : " +JSON.stringify(error));
        });
        return deferred.promise;
    }; 	
    function LoadSecurity () {
    	var sql = "               Select a.User_Id User_Id,                                                                              " +
		    	"                        '' Role_Id,                                                                                     " +
		    	"                        '' Div_No,                                                                                      " +
		    	"                        a.Program_Name Program_Name,                                                                    " +
		    	"                        a.Full_Name Full_Name,                                                                          " +
		    	"                        a.Property Property,                                                                            " +
		    	"                        a.Value Value                                                                                   " +
		    	"                   From Sy_User_Program_Tag_Properties a                                                                " +
		    	"                  Where a.Program_Name   In (Select c.Program_Id From Sy_Role_Programs c Where c.Role_Id = ?)           " +
		    	"                    And a.User_Id        = ?                                                                     	     " +
		    	"                    And a.Active         = 'Y'                                                                          " +
		    	"                  Union                                                                                                 " +
		    	"                 Select '' User_Id,                                                                                     " +
		    	"                        a.Role_Id Role_Id,                                                                              " +
		    	"                        '' Div_No,                                                                                      " +
		    	"                        a.Program_Name Program_Name,                                                                    " +
		    	"                        a.Full_Name Full_Name,                                                                          " +
		    	"                        a.Property Property,                                                                            " +
		    	"                        a.Value Value                                                                                   " +
		    	"                   From Sy_User_Program_Tag_Properties a                                                                " +
		    	"                  Where a.Program_Name   In (Select c.Program_Id From Sy_Role_Programs c Where c.Role_Id = ?)           " +
		    	"                    And a.Role_Id        = ?                                                                            " +
		    	"                    And a.Active         = 'Y'                                                                          " +
		    	"                    And Not Exists (Select *                                                                            " +
		    	"                                      From Sy_User_Program_Tag_Properties b                                             " +
		    	"                                     Where b.Program_Name   = a.Program_Name                                            " +
		    	"                                       And b.Full_Name      = a.Full_Name                                               " +
		    	"                                       And b.Property       = a.Property                                                " +
		    	"                                       And b.Active         = 'Y'                                                       " +
		    	"                                       And b.User_Id        = ?)                                                        " +
		    	"                  Union                                                                                                 " +
		    	"                 Select '' User_Id,                                                                                     " +
		    	"                        '' Role_Id,                                                                                     " +
		    	"                        a.Div_No Div_No,                                                                                " +
		    	"                        a.Program_Name Program_Name,                                                                    " +
		    	"                        a.Full_Name Full_Name,                                                                          " +
		    	"                        a.Property Property,                                                                            " +
		    	"                        a.Value Value                                                                                   " +
		    	"                   From Sy_User_Program_Tag_Properties a                                                                " +
		    	"                  Where a.Program_Name   In (Select c.Program_Id From Sy_Role_Programs c Where c.Role_Id = ?)           " +
		    	"                    And a.Div_No         =  ?                                                                           " +
		    	"                    And a.Active         = 'Y'                                                                          " +
		    	"                    And Not Exists (Select *                                                                            " +
		    	"                                      From Sy_User_Program_Tag_Properties b                                             " +
		    	"                                     Where b.Program_Name   = a.Program_Name                                            " +
		    	"                                       And b.Full_Name      = a.Full_Name                                               " +
		    	"                                       And b.Property       = a.Property                                                " +
		    	"                                       And b.Active         = 'Y'                                                       " +
		    	"                                       And (b.User_Id = ? Or b.Role_Id = ?))                                            " +
		    	"                  Union                                                                                                 " +
		    	"                 Select '' User_Id,                                                                                     " +
		    	"                        '' Role_Id,                                                                                     " +
		    	"                        '' Div_No,                                                                                      " +
		    	"                        a.Program_Name Program_Name,                                                                    " +
		    	"                        a.Full_Name Full_Name,                                                                          " +
		    	"                        a.Property Property,                                                                            " +
		    	"                        a.Value Value                                                                                   " +
		    	"                   From Sy_User_Program_Tag_Properties a                                                                " +
		    	"                  Where a.Program_Name   In (Select c.Program_Id From Sy_Role_Programs c Where c.Role_Id = ?)           " +
		    	"                    And NullIf(a.User_Id,'') Is Null                                                                    " +
		    	"                    And NullIf(a.Role_Id,'') Is Null                                                                    " +
		    	"                    And NullIf(a.Div_No,'')  Is Null                                                                    " +
		    	"                    And a.Active  = 'Y'                                                                                 " +
		    	"                    And Not Exists (Select *                                                                            " +
		    	"                                      From Sy_User_Program_Tag_Properties b                                             " +
		    	"                                     Where b.Program_Name   = a.Program_Name                                            " +
		    	"                                       And b.Full_Name      = a.Full_Name                                               " +
		    	"                                       And b.Property       = a.Property                                                " +
		    	"                                       And a.Active         = 'Y'                                                       " +
		    	"                                       And (b.User_Id = ? Or b.Role_Id = ? Or b.Div_No =  ? ))      " ;
    	var parameters =[$rootScope.globals.currentUser.roleId,
				    	 $rootScope.globals.currentUser.userId,
				    	 
				    	 $rootScope.globals.currentUser.roleId,
				    	 $rootScope.globals.currentUser.roleId,
				    	 $rootScope.globals.currentUser.userId,
				    	 
				    	 $rootScope.globals.currentUser.roleId,
				    	 $rootScope.globals.currentUser.divNo,
				    	 $rootScope.globals.currentUser.userId,
				    	 $rootScope.globals.currentUser.roleId,
				    	 
				    	 $rootScope.globals.currentUser.roleId,
				    	 $rootScope.globals.currentUser.userId,
				    	 $rootScope.globals.currentUser.roleId,
				    	 $rootScope.globals.currentUser.divNo
				    	 ]
        WingsTransactionDBService.executeSql(sql,parameters).then(function (result) {
        	$rootScope.globals.security = [];
        	for (i in result) {
        		var obj = {
        			programName : result[i].Program_Name,
        		    id : result[i].Full_Name,
        			attribute : result[i].Property,
        			value : result[i].Value
        		}
        		$rootScope.globals.security.push(obj);
        	}
        },function (error) {
        });
    }
}]);