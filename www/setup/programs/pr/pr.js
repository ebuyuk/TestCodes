angular.module('wings.mobile.controllers.pr',[]).factory('pr', ['$q','$window','$injector','$timeout','$rootScope','WingsUtil','WingsGlobalManager','WingsTransactionDBService','WingsDialogService','WingsRemoteDbService','lb','sy',
 function($q,$window,$injector,$timeout,$rootScope,WingsUtil,WingsGlobalManager,WingsTransactionDBService,WingsDialogService,WingsRemoteDbService,lb,sy){
    var service = {
        SaveCard:SaveCard,
        SaveRequisition:SaveRequisition,
        SaveStep:SaveStep,
        RemoveCards:RemoveCards,
        RemoveSteps:RemoveSteps,
        RemoveRequisitions:RemoveRequisitions,
        InstantiateCard:InstantiateCard,
        InstantiateStep:InstantiateStep,
        InstantiateRequisition:InstantiateRequisition,
        TransformCard:TransformCard,
        TransformStep:TransformStep,
        TransformRequisition:TransformRequisition,
        PopulateWorkCard:PopulateWorkCard,
        PullLocalSteps:PullLocalSteps,
        PullLocalRequisitions:PullLocalRequisitions,
        FetchLocalData:FetchLocalData,
        FetchLocalStep:FetchLocalStep,
        FetchLocalRequisition:FetchLocalRequisition,
        DeleteLocalCard:DeleteLocalCard,
        DeleteLocalStep:DeleteLocalStep,
        DeleteLocalRequisition:DeleteLocalRequisition,
        getCardPushList:getCardPushList,
        getStepPushList:getStepPushList,
        getRequisitionPushList:getRequisitionPushList,
        //removeSyncData:removeSyncData,
        pushAndPull:pushAndPull,
        pullAll:pullAll,
        pushAll:pushAll,
        updateChildRequisitions:updateChildRequisitions,
        updateChildSteps:updateChildSteps,
        PrepareBuilder:PrepareBuilder,
        SortPushList:SortPushList,
        SetFlags:SetFlags,
        GetFlags:GetFlags,
        CompleteNumber:CompleteNumber
    };
    return service;

    function SaveCard (cardsObject) {
        var deferred = $q.defer();
        var sql = "Insert or Replace Into PR_WORK_CARDS (Div_No,Project_Number,Work_Order_Type,Work_Order_Number,Zone_Number,Item_Number,Open_Date,Description,Primary_Skill_Code,Estimated_Time,"+
                  "       Skill_Codes,Estimated_Times,Status,Wip_Status,Wip_Reason,Milestone,Ata_Code,Task_Code,Contract_Group,Shop_Number,Component_Number,Serial_Number," +
                  "       Actual_Time,Applied_Time,Zones,Flags,Source_Card_Id,Source_Work_Card,Id,Aircraft_Location,Corrective_Action,Priority_Code,Authorization_Type,Shop_Flag,Aircraft_Type,Estimator_Comment,Status_Code,Stamp_Numbers,App_Std_Validation_Other,App_Std_Validation_Rotable,Applicable_Standard,Customer_Id," +
                  "       Part_Ids,Part_Numbers,Part_Descriptions,Part_Quantities,Part_Repair_Flags,Planned_Start_Date,Planned_Finish_Date,Mobile_Record_Action,Mobile_Record_Status,MOBILE_RECORD_ID,SERVER_FEEDBACK,MOBILE_DT_MODIFIED,MOBILE_USER_ID,Customer_Work_Card,Tail_Number,Customer_Name,Labor_Count,Tool_Count,Open_Child_Card_Count,Closed_Child_Card_Count,Inspector_Number,Inspection_Date,Inspector_Stamp_Number,Leak_Check_Inspector_Number,Leak_Check_Inspection_Date,Ops_Inspector_Stamp_Number,Work_Card_Actions,Secondary_Inspection_Required,Step_Data,Aircraft_Msn,Check_Type,Created_By_Employee_Number,Created_By_Employee_Name,Work_Order_Station,Inspector_Name,Routine_Flag,Nonroutine_Flag)  " +
                  "Values (?,?,?,?,?,    ?,?,?,?,?,   ?,?,?,?,?,   ?,?,?,?,?,   ?,?,?,?,?,   ?,?,?,ifnull(?,(Select Id From Pr_Work_Cards Where Mobile_Record_Id = ?)),?, ?,?,?,?,?, ?,?,?,?,?,  ?,?,?,?,?, ?,?,?,?,?, ?,ifnull((Select Mobile_Record_Id From Pr_Work_Cards Where Id = ? And Div_No = '"+$rootScope.globals.currentUser.divNo +"' And Mobile_User_Id = '"+$rootScope.globals.currentUser.userId +"'),?),?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        
        var bindings = [];
        var row  = [];
        var cardObject = null;
        for (var i=0; i<cardsObject.length; i++) {
            cardObject = cardsObject[i];
            cardObject.ID = cardObject.ID ? cardObject.ID : null;
            var skillCodes      = WingsUtil.IsNull(cardObject.SKILL_CODES)     ? '' : cardObject.SKILL_CODES.join(";");
            var estimatedTimes  = WingsUtil.IsNull(cardObject.ESTIMATED_TIMES) ? '' : cardObject.ESTIMATED_TIMES.join(";");
            var zoneNumbers     = WingsUtil.IsNull(cardObject.ZONES)           ? '' : cardObject.ZONES.join(',');
            var flags           = WingsUtil.IsNull(cardObject.FLAGS)           ? '' : cardObject.FLAGS.join(',');
            
            var partIdList      = WingsUtil.IsNull(cardObject.PART_IDS)           ? '' : cardObject.PART_IDS.join(',');
            var partNumberList  = WingsUtil.IsNull(cardObject.PART_NUMBERS)       ? '' : cardObject.PART_NUMBERS.join(',');
            var descriptionList = WingsUtil.IsNull(cardObject.PART_DESCRIPTIONS)  ? '' : cardObject.PART_DESCRIPTIONS.join(',');
            var quantityList    = WingsUtil.IsNull(cardObject.PART_QUANTITIES)    ? '' : cardObject.PART_QUANTITIES.join(',');
            var repairFlagList  = WingsUtil.IsNull(cardObject.PART_REPAIR_FLAGS)  ? '' : cardObject.PART_REPAIR_FLAGS.join(',');
            
            //determine work card actions
            var workCardActions = cardObject.WORK_CARD_ACTIONS;
            if (WingsUtil.IsNull(cardObject.ID)) {
                workCardActions = 'DISCARD,EDIT,MATERIALS,STEPS,LOGON';
            }
            
            row = [cardObject.DIV_NO,
                  cardObject.PROJECT_NUMBER,
                  cardObject.WORK_ORDER_TYPE,
                  cardObject.WORK_ORDER_NUMBER ? cardObject.WORK_ORDER_NUMBER : '',
                  cardObject.ZONE_NUMBER,
                  cardObject.ITEM_NUMBER,
                  cardObject.OPEN_DATE,
                  cardObject.DESCRIPTION.toUpperCase(),
                  cardObject.PRIMARY_SKILL_CODE,
                  cardObject.ESTIMATED_TIME ? cardObject.ESTIMATED_TIME : '',
                  skillCodes,
                  estimatedTimes,
                  cardObject.STATUS,
                  cardObject.WIP_STATUS,
                  cardObject.WIP_REASON,
                  cardObject.MILESTONE,
                  cardObject.ATA_CODE,
                  cardObject.TASK_CODE,
                  cardObject.CONTRACT_GROUP,
                  cardObject.SHOP_NUMBER,
                  cardObject.COMPONENT_NUMBER,
                  cardObject.SERIAL_NUMBER,
                  cardObject.ACTUAL_TIME,
                  cardObject.APPLIED_TIME,
                  zoneNumbers,
                  flags,
                  cardObject.SOURCE_CARD_ID,
                  cardObject.SOURCE_WORK_CARD,
                  cardObject.ID,
                  cardObject.MOBILE_RECORD_ID,
                  cardObject.AIRCRAFT_LOCATION,
                  cardObject.CORRECTIVE_ACTION,
                  cardObject.PRIORITY_CODE,
                  cardObject.AUTHORIZATION_TYPE,
                  cardObject.SHOP_FLAG,
                  cardObject.AIRCRAFT_TYPE,
                  cardObject.ESTIMATOR_COMMENT,
                  cardObject.STATUS_CODE,
                  cardObject.STAMP_NUMBERS,
                  cardObject.APP_STD_VALIDATION_OTHER,
                  cardObject.APP_STD_VALIDATION_ROTABLE,
                  cardObject.APPLICABLE_STANDARD,
                  cardObject.CUSTOMER_ID,
                  cardObject.PART_IDS,
                  cardObject.PART_NUMBERS,
                  cardObject.PART_DESCRIPTIONS,
                  cardObject.PART_QUANTITIES,
                  cardObject.PART_REPAIR_FLAGS,
                  cardObject.PLANNED_START_DATE,
                  cardObject.PLANNED_FINISH_DATE,
                  cardObject.MOBILE_RECORD_ACTION,
                  cardObject.MOBILE_RECORD_STATUS,
                  cardObject.ID,
                  cardObject.MOBILE_RECORD_ID,
                  cardObject.SERVER_FEEDBACK,
                  cardObject.MOBILE_DT_MODIFIED,
                  cardObject.MOBILE_USER_ID,
                  cardObject.CUSTOMER_WORK_CARD,
                  cardObject.TAIL_NUMBER,
                  cardObject.CUSTOMER_NAME,
                  Number(cardObject.LABOR_COUNT),
                  Number(cardObject.TOOL_COUNT),
                  Number(cardObject.OPEN_CHILD_CARD_COUNT),
                  Number(cardObject.CLOSED_CHILD_CARD_COUNT),
                  cardObject.INSPECTOR_NUMBER,
                  cardObject.INSPECTION_DATE,
                  cardObject.INSPECTOR_STAMP_NUMBER,
                  cardObject.LEAK_CHECK_INSPECTOR_NUMBER,
                  cardObject.LEAK_CHECK_INSPECTION_DATE,
                  cardObject.OPS_INSPECTOR_STAMP_NUMBER,
                  workCardActions,
                  cardObject.SECONDARY_INSPECTION_REQUIRED,
                  cardObject.STEP_DATA,
                  cardObject.AIRCRAFT_MSN,
                  cardObject.CHECK_TYPE,
                  cardObject.CREATED_BY_EMPLOYEE_NUMBER,
                  cardObject.CREATED_BY_EMPLOYEE_NAME,
                  cardObject.WORK_ORDER_STATION,
                  cardObject.INSPECTOR_NAME,
                  cardObject.ROUTINE_FLAG,
                  cardObject.NONROUTINE_FLAG];
            bindings.push(row);
        }
        
        WingsTransactionDBService.insertCollection(sql,bindings).then(function (result){
            return deferred.resolve(result);
        }, function (error) {
            console.log(error);
            return deferred.reject("Save Card Error : " +JSON.stringify(error));
        });
        return deferred.promise;
    };
      
    function SaveRequisition (requisitionsObject) {
        var deferred = $q.defer();
        var sql = "Insert or Replace Into IC_REQUISITIONS (DIV_NO,Order_Number_Line,Order_Class,Due_Date,Part_Number,Part_Id,Quantity,Employee_Number,Employee_Name,Status,Rotable_Flag, "+
                  "       Cancel_Allowed,Approval_Status,Order_Line_Id,Card_Id,MOBILE_RECORD_ID,Description,Priority_Code,Uom,Aircraft_Location,Ipc_Reference,Internal_Comment, "+
                  "       Mobile_Record_Action,Mobile_Record_Status,Mobile_Card_Id,SERVER_FEEDBACK,MOBILE_DT_MODIFIED,MOBILE_USER_ID)                                                                                    "+
                  "Values (?,?,?,?,?,    ?,?,?,?,?,   ?,?,?,?,nullif(?,''),   ifnull((Select Mobile_Record_Id From Ic_Requisitions Where Order_Line_Id = ? And Div_No = '"+$rootScope.globals.currentUser.divNo +"' And Mobile_User_Id = '"+$rootScope.globals.currentUser.userId +"'),?),?,?,?,?, ?,?,?,?,  ifnull (nullif(?,''),(select mobile_record_id from pr_work_cards where id = ? And Div_No = '"+$rootScope.globals.currentUser.divNo +"' And Mobile_User_Id = '"+$rootScope.globals.currentUser.userId +"')), ?,?,?)";
          
        var bindings = [];
        var row  = [];
        var requisitionObject = null;
        for (var i=0; i<requisitionsObject.length; i++) {
        	requisitionObject = requisitionsObject[i];
              
            row = [requisitionObject.DIV_NO,
            	   requisitionObject.ORDER_NUMBER_LINE,
                   requisitionObject.ORDER_CLASS,
                   requisitionObject.DUE_DATE,
                   requisitionObject.PART_NUMBER,
                   requisitionObject.PART_ID,
                   requisitionObject.QUANTITY,
                   requisitionObject.EMPLOYEE_NUMBER,
                   requisitionObject.EMPLOYEE_NAME,
                   requisitionObject.STATUS,
                   requisitionObject.ROTABLE_FLAG,
                   requisitionObject.CANCEL_ALLOWED,
                   requisitionObject.APPROVAL_STATUS,
                   requisitionObject.ORDER_LINE_ID,
                   requisitionObject.CARD_ID,
                   requisitionObject.ORDER_LINE_ID,
                   requisitionObject.MOBILE_RECORD_ID,
                   requisitionObject.DESCRIPTION,
                   requisitionObject.PRIORITY_CODE,
                   requisitionObject.UOM,
                   requisitionObject.AIRCRAFT_LOCATION,
                   requisitionObject.IPC_REFERENCE,
                   requisitionObject.INTERNAL_COMMENT,
                   requisitionObject.MOBILE_RECORD_ACTION,
                   requisitionObject.MOBILE_RECORD_STATUS,
                   requisitionObject.MOBILE_CARD_ID,
                   requisitionObject.CARD_ID,
                   requisitionObject.SERVER_FEEDBACK,
                   requisitionObject.MOBILE_DT_MODIFIED,
                   requisitionObject.MOBILE_USER_ID];
              bindings.push(row);
        }
          
        WingsTransactionDBService.insertCollection(sql,bindings).then(function (result){
            return deferred.resolve(result);
        }, function (error) {
            console.log(error);
            return deferred.reject("Save requisition Error : " +JSON.stringify(error));
        });
        return deferred.promise;
    };
    
    function SaveStep (stepsObject) {
        var deferred = $q.defer();
        var sql = "Insert or Replace Into PR_CARD_STEPS (DIV_NO,Step_Sequence,Step_Number,Step_Status,Type,Description,Action,Mechanic_Signoff_Flag,Inspector_Signoff_Flag,  "+
                  "       Perform_Date,Completion_Date,Mechanic_Employee_Number,Inspector_Employee_Number,Actions_Info,Step_Action,Id,Card_Id,Mobile_Card_Id,Card_Work_Order_Number, "+
                  "       Card_Zone_Number,Card_Item_Number,Mobile_Record_Action,Mobile_Record_Status,MOBILE_RECORD_ID,SERVER_FEEDBACK,MOBILE_DT_MODIFIED,MOBILE_USER_ID)                                                                                    "+
                  "Values (?,?,?,?,?,    ?,?,?,?,?,   ?,?,?,?,?,   ?,nullif(?,''),ifnull (nullif(?,''),(select mobile_record_id from pr_work_cards where id = ? And Div_No = '"+$rootScope.globals.currentUser.divNo +"' And Mobile_User_Id = '"+$rootScope.globals.currentUser.userId +"')),?,?, ?,?,?,ifnull((Select Mobile_Record_Id From Pr_Card_Steps Where Id = ? And Div_No = '"+$rootScope.globals.currentUser.divNo +"' And Mobile_User_Id = '"+$rootScope.globals.currentUser.userId +"'),?),?, ?,?)";
        
        var bindings = [];
        var row  = [];
        var stepObject = null;
        for (var i=0; i<stepsObject.length; i++) {
            stepObject = stepsObject[i];
            
            row = [stepObject.DIV_NO,
            	   stepObject.STEP_SEQUENCE,
                   stepObject.STEP_NUMBER,
                   stepObject.STEP_STATUS,
                   stepObject.TYPE,
                   stepObject.DESCRIPTION,
                   stepObject.ACTION,
                   stepObject.MECHANIC_SIGNOFF_FLAG,
                   stepObject.INSPECTOR_SIGNOFF_FLAG,
                   stepObject.PERFORM_DATE,
                   stepObject.COMPLETION_DATE,
                   stepObject.MECHANIC_EMPLOYEE_NUMBER,
                   stepObject.INSPECTOR_EMPLOYEE_NUMBER,
                   stepObject.ACTIONS_INFO,
                   stepObject.STEP_ACTION,
                   stepObject.ID,
                   stepObject.CARD_ID,
                   stepObject.MOBILE_CARD_ID,
                   stepObject.CARD_ID,
                   stepObject.CARD_WORK_ORDER_NUMBER,
                   stepObject.CARD_ZONE_NUMBER,
                   stepObject.CARD_ITEM_NUMBER,
                   stepObject.MOBILE_RECORD_ACTION,
                   stepObject.MOBILE_RECORD_STATUS,
                   stepObject.ID,
                   stepObject.MOBILE_RECORD_ID,
                   stepObject.SERVER_FEEDBACK,
                   stepObject.MOBILE_DT_MODIFIED,
                   stepObject.MOBILE_USER_ID];
            bindings.push(row);
        }
        WingsTransactionDBService.insertCollection(sql,bindings).then(function (result){
            return deferred.resolve(result);
        }, function (error) {
            console.log(error);
            return deferred.reject("Save step Error : " +JSON.stringify(error));
        });
        return deferred.promise;
    };

    function RemoveCards () {
        var deferred = $q.defer();
        var sql = "Delete From pr_work_cards                                                          "+ 
                  " Where Not exists (Select 1                                                        "+
                  "                    From Sy_Transaction_Queue                                      "+
                  "                   Where (Mobile_Table_Record_Id =  pr_work_cards.Mobile_Record_Id "+
                  "                     And Mobile_Table_Name       = 'PR_WORK_CARDS')                "+
                  "                      Or (Mobile_Table_Name     != 'LB_LABOR_COLLECTION' And Server_Parent_Record_Id = pr_work_cards.Id)                "+
                  "                      Or (Mobile_Table_Name     != 'LB_LABOR_COLLECTION' And Mobile_Parent_Record_Id = pr_work_cards.Mobile_Record_Id)) ";
        var parameters = [];
        WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
            return deferred.resolve("GOHEAD");
        }, function (error) {
            console.log(error);
            return deferred.reject("Synced card delete error : " +JSON.stringify(error));
        });
        return deferred.promise;
    };
    function RemoveSteps (rejectedCards){
    	 var deferred = $q.defer();
    	 var parameters = [];
    	 var condSql = ' ';
    	 var sql = "Delete From pr_card_steps                                                        "+ 
         "           Where Not exists (Select 1                                                       " +
         "                             From Sy_Transaction_Queue                                     " +
         "                            Where Mobile_Table_Record_Id =  pr_card_steps.Mobile_Record_Id " +
         "                              And Mobile_Table_Name      = 'PR_CARD_STEPS')                ";

       for (i=0; i<rejectedCards.length; i++){
 			if (!WingsUtil.IsNull(rejectedCards[i].ID)){
 			    condSql += rejectedCards[i].ID+",";
 			}
 		}
 		condSql = condSql  == ' '  ? ' ' : "And Card_Id Not In ("+condSql.substring(1, condSql.length - 1)+") ";
 		sql = sql+condSql;
         WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
             return deferred.resolve("GOHEAD");
         }, function (error) {
             console.log(error);
             return deferred.reject("Synced card delete error : " +JSON.stringify(error));
         });
         return deferred.promise;
    }
    function RemoveRequisitions (rejectedCards){
    	var deferred = $q.defer();
    	var condSql  = ' ';
    	var divNo  = $rootScope.globals.currentUser.divNo;
      	var userId = $rootScope.globals.currentUser.userId;    
   	 	var parameters = [];
       	var sql = "Delete From Ic_Requisitions                                                        "+ 
        "           Where Not exists (Select 1                                                         "+
        "                             From Sy_Transaction_Queue                                       "+
        "                            Where Mobile_Table_Record_Id =  Ic_Requisitions.Mobile_Record_Id "+
        "                              And Mobile_Table_Name      = 'IC_REQUISITIONS')                ";

 		for (i=0; i<rejectedCards.length; i++){
 			if (!WingsUtil.IsNull(rejectedCards[i].ID)){
 			    condSql += rejectedCards[i].ID+",";
 			}
 		}
 		condSql = condSql  == ' '  ? ' ' : "And Card_Id Not In ("+condSql.substring(1, condSql.length - 1)+") ";
 		sql = sql+condSql;
 	
   	 	WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
   	 		return deferred.resolve("GOHEAD");
   	 	}, function (error) {
   	 	    console.log(error);
   	 		return deferred.reject("Synced step requisitions error : " +JSON.stringify(error));
   	 	});
   	 	return deferred.promise;
    }

      function InstantiateCard (){
          var card = {
        		  DIV_NO:$rootScope.globals.currentUser.divNo,
        		  MOBILE_USER_ID:$rootScope.globals.currentUser.userId,
                  SOURCE_CARD_OBJECT : '',
                  PROJECT_NUMBER : '',
                  WORK_ORDER_NUMBER: '',
                  ZONE_NUMBER: '',
                  ITEM_NUMBER: '',
                  OPEN_DATE: '',
                  DESCRIPTION: '',
                  PRIMARY_SKILL_CODE : '',
                  ESTIMATED_TIME : '',
                  STATUS: '',
                  WIP_STATUS: '',
                  WIP_REASON: '',
                  MILESTONE: '',
                  ATA_CODE: '',
                  TASK_CODE: '',
                  CONTRACT_GROUP: '',
                  SHOP_NUMBER: '',
                  COMPONENT_NUMBER : '',
                  SERIAL_NUMBER : '',
                  ZONES: [],
                  FLAGS: [],
                  SOURCE_CARD_ID : '',
                  ID : '',
                  SERVER_TRANSACTION_DATE: '',
                  SERVER_FEEDBACK: '',
                  MOBILE_RECORD_STATUS: '',
                  MOBILE_RECORD_ID: null,
                  MOBILE_USR_MODIFIED: '',
                  MOBILE_DT_MODIFIED: '',
                  SOURCE_WORK_CARD : '',
                  SKILL_CODES : [],
                  ESTIMATED_TIMES : [],
                  ACTUAL_TIME : '',
                  APPLIED_TIME : '',
                  WORK_ORDER_TYPE : '',
                  PRIORITY_CODE: '',
                  CORRECTIVE_ACTION: '',
                  AIRCRAFT_LOCATION: '',
                  AUTHORIZATION_TYPE: '',
                  SHOP_FLAG: '',
                  ESTIMATOR_COMMENT: '',
                  AIRCRAFT_TYPE : '',
                  STATUS_CODE   : 'COMPLETED',
                  STAMP_NUMBERS : [],
                  INSPECTOR_NUMBER: '',
                  INSPECTION_DATE: '',
                  INSPECTOR_STAMP_NUMBER: '',
                  LEAK_CHECK_INSPECTOR_NUMBER: '',
                  LEAK_CHECK_INSPECTION_DATE: '',
                  OPS_INSPECTOR_STAMP_NUMBER: '',
                  APP_STD_VALIDATION_OTHER:'',
                  APP_STD_VALIDATION_ROTABLE:'',
                  APPLICABLE_STANDARD:'',
                  CUSTOMER_ID:'',
                  PART_IDS:[],
                  PART_NUMBERS:[],
                  PART_DESCRIPTIONS:[],
                  PART_QUANTITIES:[],
                  PART_REPAIR_FLAGS:[],
                  PLANNED_START_DATE:'',
                  PLANNED_FINISH_DATE:'',
                  WORK_CARD_NUMBER : '',
                  SECONDARY_INSPECTION_REQUIRED : 'N',
                  STEP_DATA : '',
                  AIRCRAFT_MSN : '',
                  CHECK_TYPE : '',
                  CREATED_BY_EMPLOYEE_NUMBER: '',
                  CREATED_BY_EMPLOYEE_NAME: '',
                  WORK_ORDER_STATION: '',
                  INSPECTOR_NAME : '',
                  ROUTINE_FLAG : '',
                  NONROUTINE_FLAG: ''
          };
    	  return card;
      };
      function InstantiateStep(){
    	var step = {
    			DIV_NO:$rootScope.globals.currentUser.divNo,
      		    MOBILE_USER_ID:$rootScope.globals.currentUser.userId,
    			STEP_SEQUENCE:'',
                STEP_NUMBER:'',
                STEP_STATUS:'',
                TYPE:'',
                DESCRIPTION:'',
                ACTION:'',
                MECHANIC_SIGNOFF_FLAG:'',
                INSPECTOR_SIGNOFF_FLAG:'',
                PERFORM_DATE:'',
                COMPLETION_DATE:'',
                MECHANIC_EMPLOYEE_NUMBER:'',
                INSPECTOR_EMPLOYEE_NUMBER:'',
                ACTIONS_INFO:'',
                STEP_ACTION: '',
                ID:'',
                CARD_ID:'',
                MOBILE_CARD_ID:'',
                CARD_WORK_ORDER_NUMBER:'',
                CARD_ZONE_NUMBER:'',
                CARD_ITEM_NUMBER:'',
                SERVER_TRANSACTION_DATE: '',
                SERVER_FEEDBACK: '',
                MOBILE_RECORD_STATUS: '',
                MOBILE_RECORD_ID: null,
                MOBILE_RECORD_ACTION:'',
                MOBILE_USR_MODIFIED: '',
                MOBILE_DT_MODIFIED: ''
    	}  
    	return step;
      };
      function InstantiateRequisition(){
    	  var requisition = {
    			  DIV_NO:$rootScope.globals.currentUser.divNo,
        		  MOBILE_USER_ID:$rootScope.globals.currentUser.userId,
    			  ORDER_NUMBER_LINE:'',
                  ORDER_CLASS:'',
                  DUE_DATE:'',
                  PART_NUMBER:'',
                  PART_ID:'',
                  QUANTITY:null,
                  EMPLOYEE_NUMBER:'',
                  EMPLOYEE_NAME:'',
                  STATUS:'',
                  ROTABLE_FLAG:'',
                  CANCEL_ALLOWED:'',
                  APPROVAL_STATUS:'',
                  ORDER_LINE_ID:null,
                  DESCRIPTION:'',
                  PRIORITY_CODE:'',
                  UOM:'',
                  AIRCRAFT_LOCATION:'',
                  IPC_REFERENCE:'',
                  INTERNAL_COMMENT:'',
                  CARD_ID:'',
                  MOBILE_CARD_ID:'',
                  MOBILE_RECORD_ACTION:'',
                  MOBILE_RECORD_ID: null,
                  MOBILE_RECORD_STATUS:'',
                  SERVER_TRANSACTION_DATE: '',
                  MOBILE_USR_MODIFIED: '',
                  MOBILE_DT_MODIFIED: '',
                  SERVER_FEEDBACK:''
    	  }
    	  return requisition;
      };
      function TransformCard(object){
    	  var skillCodes      = [];
    	  var estimatedTimes  = [];
    	  var zones           = [];
    	  var tempArray       = [];
    	  var tempPartArray   = [];
    	  var partIdList      = [];
    	  var partNumberList  = [];
    	  var descriptionList = [];
    	  var quantityList    = [];
    	  var repairFlagList  = [];
    	  
    	  var flags = SetFlags (object.leak_check_flag,object.bust_exemption_flag,object.etops_flag,object.cdccl_flag,object.cpcp_report_flag,object.rii_flag,object.billable,object.sdr_flag,object.major_repair_flag,object.major_alteration_flag,object.parts_required_flag);
    	  if (!WingsUtil.IsNull(object.zones)) zones = object.zones.split(',');
    	  if (object.source_work_card == '..') object.source_work_card = '';
    	  
    	  if(!WingsUtil.IsNull(object.skills_array))  tempArray = object.skills_array.split(',');
    	  for (i = 0; i<tempArray.length; i = i+2){
    		  skillCodes.push(tempArray[i]);
    		  
    		  tempArray[i+1] = tempArray[i+1] ? tempArray[i+1] : '';
    		  estimatedTimes.push(tempArray[i+1]);
    	  }
    	  
    	  if(!WingsUtil.IsNull(object.parts_array)) tempPartArray = object.parts_array.split(',');
    	  
    	  for (var k = 0; k<tempPartArray.length; k = k+5){
    		  partIdList.push(tempPartArray[k]);
    		  partNumberList.push(tempPartArray[k+1]);
    		  descriptionList.push(tempPartArray[k+2]);
    		  quantityList.push(tempPartArray[k+3]);
    		  repairFlagList.push(tempPartArray[k+4]);
    	  }
    	  
    	  var card = {
    			  DIV_NO :	             object.div_no,
    			  MOBILE_USER_ID :		 $rootScope.globals.currentUser.userId,
                  PROJECT_NUMBER :       object.project_number,
                  WORK_ORDER_NUMBER:     object.work_order_number,
                  ZONE_NUMBER:           object.zone_number,
                  ITEM_NUMBER:           object.item_number,
                  OPEN_DATE:             object.open_date,
                  DESCRIPTION:           object.description,
                  PRIMARY_SKILL_CODE :   object.primary_skill_code,
                  ESTIMATED_TIME :       object.estimated_time,
                  STATUS:                object.status,
                  WIP_STATUS:            object.wip_status,
                  WIP_REASON:            object.wip_reason,
                  MILESTONE:             object.milestone,
                  ATA_CODE:              object.ata_code,
                  TASK_CODE:             object.task_code,
                  CONTRACT_GROUP:        object.contract_group,
                  SHOP_NUMBER:           object.shop_number,
                  COMPONENT_NUMBER :     object.component_number,
                  SERIAL_NUMBER :        object.serial_number,
                  ZONES:                 zones,
                  FLAGS:                 flags,
                  SOURCE_CARD_ID :       object.source_card_id,
                  ID :                   object.id,
                  SOURCE_WORK_CARD :     object.source_work_card,
                  SKILL_CODES :          skillCodes,
                  ESTIMATED_TIMES :      estimatedTimes,
                  ACTUAL_TIME :          object.actual_time,
                  APPLIED_TIME :         object.applied_time,
                  WORK_ORDER_TYPE :      object.work_order_type,
                  PRIORITY_CODE:         object.priority_code,
                  CORRECTIVE_ACTION:     object.corrective_action,
                  AIRCRAFT_LOCATION:     object.aircraft_location,
                  AUTHORIZATION_TYPE:    object.authorization_type,
                  SHOP_FLAG:             object.shop_flag,
                  ESTIMATOR_COMMENT:     object.estimator_comment,
                  AIRCRAFT_TYPE :        object.aircraft_type,
                  STATUS_CODE   :        object.status_code,
                  STAMP_NUMBERS :        object.stamp_numbers,
                  APP_STD_VALIDATION_OTHER:  object.app_std_validation_other,
                  APP_STD_VALIDATION_ROTABLE:object.app_std_validation_rotable,
                  APPLICABLE_STANDARD:       object.applicable_standard,
                  CUSTOMER_ID:object.customer_id,
                  PART_IDS:partIdList,
                  PART_NUMBERS:partNumberList,
                  PART_DESCRIPTIONS:descriptionList,
                  PART_QUANTITIES:quantityList,
                  PART_REPAIR_FLAGS:repairFlagList,
                  PLANNED_START_DATE:object.planned_start_date,
                  PLANNED_FINISH_DATE:object.planned_finish_date,
                  CUSTOMER_WORK_CARD:object.customer_work_card,
                  TAIL_NUMBER:object.tail_number,
                  CUSTOMER_NAME:object.customer_name,
                  LABOR_COUNT:object.labor_count,
                  TOOL_COUNT:object.tool_count,
                  OPEN_CHILD_CARD_COUNT:object.open_child_card_count,
                  CLOSED_CHILD_CARD_COUNT:object.closed_child_card_count,
                  INSPECTOR_NUMBER:object.inspector_number,
                  TAIL_NUMBER:object.tail_number,
                  CUSTOMER_NAME:object.customer_name,
                  CUSTOMER_WORK_CARD:object.customer_work_card,
                  INSPECTOR_NUMBER:object.inspector_number,
                  INSPECTION_DATE:object.inspection_date,
                  INSPECTOR_STAMP_NUMBER:object.inspector_stamp_number,
                  LEAK_CHECK_INSPECTOR_NUMBER:object.leak_check_inspector_number,
                  LEAK_CHECK_INSPECTION_DATE:object.leak_check_inspection_date,
                  OPS_INSPECTOR_STAMP_NUMBER:object.ops_inspector_stamp_number,
                  WORK_CARD_ACTIONS:object.work_card_actions,
                  SECONDARY_INSPECTION_REQUIRED:object.secondary_inspection_required,
                  STEP_DATA:object.step_data,
                  AIRCRAFT_MSN:object.aircraft_msn,
                  CHECK_TYPE:object.check_type,
                  CREATED_BY_EMPLOYEE_NUMBER:object.created_by_employee_number,
                  CREATED_BY_EMPLOYEE_NAME:object.created_by_employee_name,
                  WORK_ORDER_STATION:object.work_order_station,
                  INSPECTOR_NAME:object.inspector_name,
                  ROUTINE_FLAG:object.routine_flag,
                  NONROUTINE_FLAG:object.nonroutine_flag,
                  MOBILE_RECORD_STATUS : 'LOADED',
                  MOBILE_RECORD_ACTION : ''
          };
    	  return card;
      };
      
      function TransformStep(object){
      	var step = {
      			  DIV_NO :object.div_no,
  			      MOBILE_USER_ID :$rootScope.globals.currentUser.userId,
      			  STEP_SEQUENCE:object.step_sequence,
                  STEP_NUMBER:object.step_number,
                  STEP_STATUS:object.step_status,
                  TYPE:object.type,
                  DESCRIPTION:object.description,
                  ACTION:object.action,
                  MECHANIC_SIGNOFF_FLAG:object.mechanic_signoff_flag,
                  INSPECTOR_SIGNOFF_FLAG:object.inspector_signoff_flag,
                  PERFORM_DATE:object.perform_date,
                  COMPLETION_DATE:object.completion_date,
                  MECHANIC_EMPLOYEE_NUMBER:object.mechanic_employee_number,
                  INSPECTOR_EMPLOYEE_NUMBER:object.inspector_employee_number,
                  ACTIONS_INFO:object.actions_info,
                  STEP_ACTION: '',
                  ID:object.id,
                  CARD_ID:object.card_id,
                  CARD_WORK_ORDER_NUMBER:object.card_work_order_number,
                  CARD_ZONE_NUMBER:object.card_zone_number,
                  CARD_ITEM_NUMBER:object.card_item_number,
                  MOBILE_RECORD_STATUS : 'LOADED',
                  MOBILE_RECORD_ACTION : ''
          };
    	  return step;
      };
      function TransformRequisition(object){
        	var requisition = {
        			DIV_NO :object.div_no,
      			    MOBILE_USER_ID :$rootScope.globals.currentUser.userId,
        			ORDER_NUMBER_LINE:object.order_number_line,
                    ORDER_CLASS:object.order_class,
                    DUE_DATE:object.due_date,
                    PART_NUMBER:object.part_number,
                    PART_ID:'',
                    QUANTITY:object.quantity,
                    EMPLOYEE_NUMBER:object.employee_number,
                    EMPLOYEE_NAME:object.employee_name,
                    STATUS:object.status,
                    ROTABLE_FLAG:object.rotable_flag,
                    CANCEL_ALLOWED:object.cancel_allowed,
                    APPROVAL_STATUS:object.approval_status,
                    ORDER_LINE_ID:object.order_line_id,
                    CARD_ID:object.card_id,
                    DESCRIPTION:'',
                    PRIORITY_CODE:'',
                    UOM:'',
                    AIRCRAFT_LOCATION:'',
                    IPC_REFERENCE:'',
                    INTERNAL_COMMENT:'',
                    MOBILE_RECORD_ACTION:'',
                    MOBILE_RECORD_STATUS:'LOADED'
            };
      	  return requisition;
        };
      
      function PopulateWorkCard (workCard){
          var deferred = $q.defer();
          FetchLocalData(workCard).then(function(res){
        	  if (res.MOBILE_RECORD_STATUS == 'REJECTED' || !$rootScope.globals.deviceConnectionInfo.isOnline){
        		  return deferred.resolve(res);
        	  }else{
        		  pushAndPull(res).then(function(result){
    	              if (result.status == 'SUCCEED'){
    	            	  FetchLocalData(workCard).then(function(res){
    	            		  return deferred.resolve(res);
    	            	  },function(err){
    	            	      console.log(err);
    	            		  return deferred.reject('Invalid Work Card');
    	            	  })
          			  }else{
          			    console.log(result.error);
          				return deferred.reject(result.error);
          			  }
    	          },function(error){
    	              console.log(error);
    	        	  return deferred.reject(error);
    	          });
        	  }
  		  },function(err){
  		      if (!$rootScope.globals.deviceConnectionInfo.isOnline){
  		        console.log(err);
  		    	  return deferred.reject(err);
  		      }else{
  		    	  pushAndPull(workCard).then(function(result){
	  	              if (result.status == 'SUCCEED'){
	  	            	  FetchLocalData(workCard).then(function(res){
	  	            		  return deferred.resolve(res);
	  	            	  },function(err){
	  	            		  return deferred.reject('Invalid Work Card');
	  	            	  })
	      			  }else{
	      			    console.log(result.error);
	      				return deferred.reject(result.error);
	      			  }
	  	          },function(error){
	  	              console.log(error);
	  	        	  return deferred.reject(error);
	  	          });
  		      }
  		  })
          return deferred.promise;
      };
      
      function PullLocalRequisitions(card){
        	var deferred = $q.defer();
        	var sql = "Select a.*,   "+
        	" (select ifnull( group_concat(mobile_record_status || ',' || ifnull(server_feedback, '') || ',' || Mobile_Action_Date || ',' || Mobile_Record_Action,';'),'')  "+
            "    from SY_TRANSACTION_QUEUE b  " +
            "   Where Mobile_Table_Name = 'IC_REQUISITIONS'" +
            "     And Mobile_Table_Record_ID  = a.Mobile_Record_Id) UNSYNC_REQUISITION_TEXT " +
            "  From IC_REQUISITIONS a "+
            " Where (a.Card_Id = ?   "+
            "    Or (a.Mobile_Card_Id = ? and a.Card_Id Is Null))" +
            "   And a.Div_No = " + $rootScope.globals.currentUser.divNo+
            "   And a.Mobile_User_Id = '"+$rootScope.globals.currentUser.userId+"' ";
        	var parameters = [card.ID,card.MOBILE_RECORD_ID];
        	WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
        	    for (i=0;i<result.length;i++){
                    result[i].UNSYNC_REQUISITION_TRANSACTIONS = [];
                    if(result[i].UNSYNC_REQUISITION_TEXT){
                        unsyncTransactions = result[i].UNSYNC_REQUISITION_TEXT.split(';')
                        for(j=0; j<unsyncTransactions.length; j++){
                            unsyncTransactionsObjects = unsyncTransactions[j].split(',');
                            result[i].UNSYNC_REQUISITION_TRANSACTIONS.push({MOBILE_RECORD_STATUS: unsyncTransactionsObjects[0] ,SERVER_FEEDBACK: unsyncTransactionsObjects[1] , MOBILE_ACTION_DATE: moment(unsyncTransactionsObjects[2],'YYYY-MM-DD HH:mm:ss') , MOBILE_RECORD_ACTION: unsyncTransactionsObjects[3] })
                        }
                        result[i].MOBILE_RECORD_STATUS = result[i].UNSYNC_REQUISITION_TRANSACTIONS[0].MOBILE_RECORD_STATUS;
                        result[i].SERVER_FEEDBACK = result[i].UNSYNC_REQUISITION_TRANSACTIONS[0].SERVER_FEEDBACK;
                        result[i].MOBILE_RECORD_ACTION = result[i].UNSYNC_REQUISITION_TRANSACTIONS[0].MOBILE_RECORD_ACTION;   
                    }else{
                        result[i].MOBILE_RECORD_STATUS = 'LOADED';
                        result[i].SERVER_FEEDBACK = '';
                        result[i].MOBILE_RECORD_ACTION = '';
                    }
                }
        		return deferred.resolve(result);
        	},function(error){
        	    console.log(error);
        		return deferred.reject('Could not setup connection with local database!')
        	});
        	return deferred.promise;
        };
      function PullLocalSteps(card){
      	var deferred = $q.defer();
      	var sql = "Select a.*,   "+
      	  " (select ifnull( group_concat(mobile_record_status || ',' || ifnull(server_feedback, '') || ',' || Mobile_Action_Date || ',' || Mobile_Record_Action,';'),'')  "+
          "    from SY_TRANSACTION_QUEUE b  " +
          "   Where Mobile_Table_Name = 'PR_CARD_STEPS'" +
          "     And Mobile_Table_Record_ID  = a.Mobile_Record_Id) UNSYNC_STEP_TEXT " +
          "  From Pr_Card_Steps a "+
          " Where (a.Card_Id = ?   "+
          "    Or (a.Mobile_Card_Id = ? and a.Card_Id Is Null))" +
          "   And a.Div_No = " + $rootScope.globals.currentUser.divNo+
          "   And a.Mobile_User_Id = '"+$rootScope.globals.currentUser.userId+"' ";
      	var parameters = [card.ID,card.MOBILE_RECORD_ID];
      	WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
      	  for (i=0;i<result.length;i++){
              result[i].UNSYNC_STEP_TRANSACTIONS = [];
              if(result[i].UNSYNC_STEP_TEXT){
                  unsyncTransactions = result[i].UNSYNC_STEP_TEXT.split(';')
                  for(j=0; j<unsyncTransactions.length; j++){
                      unsyncTransactionsObjects = unsyncTransactions[j].split(',');
                      result[i].UNSYNC_STEP_TRANSACTIONS.push({MOBILE_RECORD_STATUS: unsyncTransactionsObjects[0] ,SERVER_FEEDBACK: unsyncTransactionsObjects[1] , MOBILE_ACTION_DATE: moment(unsyncTransactionsObjects[2],'YYYY-MM-DD HH:mm:ss') , MOBILE_RECORD_ACTION: unsyncTransactionsObjects[3] })
                  }
                  result[i].MOBILE_RECORD_STATUS = result[i].UNSYNC_STEP_TRANSACTIONS[0].MOBILE_RECORD_STATUS;
                  result[i].SERVER_FEEDBACK = result[i].UNSYNC_STEP_TRANSACTIONS[0].SERVER_FEEDBACK;
                  result[i].MOBILE_RECORD_ACTION = result[i].UNSYNC_STEP_TRANSACTIONS[0].MOBILE_RECORD_ACTION;   
              }else{
                  result[i].MOBILE_RECORD_STATUS = 'LOADED';
                  result[i].SERVER_FEEDBACK = '';
                  result[i].MOBILE_RECORD_ACTION = '';
              }
          }
      		return deferred.resolve(result);
      	},function(error){
      	  console.log(error);
      		return deferred.reject('Could not setup connection with local database!')
      	});
      	return deferred.promise;
      };
      function FetchLocalData (workCard){
    	  var deferred = $q.defer();
    	  var parameters = [];
    	  var sql = "";
    	  var sqlHeader = "Select a.*,                                                                    "+
                          "       (Select Count(0)                                                        "+
                          "          From Ic_Requisitions                                                 "+
                          "         Where Div_No         = a.Div_No                                       "+
                          "           And Status         In ('COMPLETED')                                 "+
                          "           And (Card_Id       = a.Id                                           "+
                          "            Or Mobile_Card_Id = a.Mobile_Record_Id)) CLOSED_REQUISITION_COUNT, "+
                          "       (Select Count(0)                                                        "+
                          "          From Ic_Requisitions                                                 "+
                          "         Where Div_No         = a.Div_No                                       "+
                          "           And Status         In ('PENDING','AWAITING','CREATED')              "+
                          "           And (Card_Id       = a.Id                                           "+
                          "            Or Mobile_Card_Id = a.Mobile_Record_Id)) OPEN_REQUISITION_COUNT    "+
                          "  From Pr_Work_Cards a                                                         ";
    	  if (workCard.ID){
    		  var parameters = [workCard.ID];
      		  sql = sqlHeader+ " Where Id = ? ";
    	  }else if (workCard.WORK_CARD_NUMBER){
    	      if (workCard.WORK_CARD_NUMBER.length == 17){
    	          workOrderNumber = Number(workCard.WORK_CARD_NUMBER.substring(0,9));
    	          zoneNumber      = workCard.WORK_CARD_NUMBER.substring(9, 13);
	              itemNumber      = workCard.WORK_CARD_NUMBER.substring(13, 17);
    	          sql = sqlHeader + "  Where Work_Order_Number = ? "+
                                    "    And Zone_Number       = ? "+
                                    "    And Item_Number       = ? ";
    	          parameters = [workOrderNumber,zoneNumber,itemNumber]
    	      }else{
    	      	  sql = sqlHeader + " Where Work_Order_Number = ? "+
                                    "   And Item_Number       = ? ";
    	      		
    	          tempArray = workCard.WORK_CARD_NUMBER.split('.');
    	          if (tempArray.length == 2){
    	      		  parameters = [tempArray[0], CompleteNumber(tempArray[1])];
    	      	  }else if (tempArray.length == 3){
    	      		  sql = sql + " And Zone_Number = ? ";
    	      		  parameters = [tempArray[0], CompleteNumber(tempArray[2]),CompleteNumber(tempArray[1])];
    	      	  }else{
    	      	    sql = sqlHeader + " Where Mobile_Record_Id = ? ";
    	      	    var parameters = [workCard.MOBILE_RECORD_ID];
    	      	  }
    	      }
    	  }else {
    		  sql = sqlHeader + " Where Mobile_Record_Id = ? ";
    		  var parameters = [workCard.MOBILE_RECORD_ID];
    	  }
    	  sql = sql + "   And Div_No         = " + $rootScope.globals.currentUser.divNo+
                      "   And Mobile_User_Id = '"+$rootScope.globals.currentUser.userId+"' ";
    	  WingsTransactionDBService.executeSql(sql,parameters).then(function (resultO){
  	          if (resultO.length < 1){
  	        	return deferred.reject('Card could not be found in local database!');
  	          }else{
  	              if (resultO[0].WORK_ORDER_NUMBER && resultO[0].ZONE_NUMBER && resultO[0].ITEM_NUMBER) {
  	                  resultO[0].WORK_CARD_NUMBER = resultO[0].WORK_ORDER_NUMBER+'.'+resultO[0].ZONE_NUMBER+'.'+resultO[0].ITEM_NUMBER;    
  	              } else {
  	                  resultO[0].WORK_CARD_NUMBER = '<NEW CARD>';
  	              }
  	              
  	           	  resultO[0].ZONES               = resultO[0].ZONES.split(',');
  	           	  resultO[0].FLAGS               = resultO[0].FLAGS.split(',');
  	           	  resultO[0].SKILL_CODES         = resultO[0].SKILL_CODES.split(';');
  	              resultO[0].ESTIMATED_TIMES     = resultO[0].ESTIMATED_TIMES.split(';');
  	              resultO[0].PART_IDS            = WingsUtil.IsNull(resultO[0].PART_IDS)          ? [] : resultO[0].PART_IDS.split(',');
  	              resultO[0].PART_NUMBERS        = WingsUtil.IsNull(resultO[0].PART_NUMBERS)      ? [] : resultO[0].PART_NUMBERS.split(',');
  	              resultO[0].PART_DESCRIPTIONS   = WingsUtil.IsNull(resultO[0].PART_DESCRIPTIONS) ? [] : resultO[0].PART_DESCRIPTIONS.split(',');
  	              resultO[0].PART_QUANTITIES     = WingsUtil.IsNull(resultO[0].PART_QUANTITIES)   ? [] : resultO[0].PART_QUANTITIES.split(',');
  	              resultO[0].PART_REPAIR_FLAGS   = WingsUtil.IsNull(resultO[0].PART_REPAIR_FLAGS) ? [] : resultO[0].PART_REPAIR_FLAGS.split(',');
  	              resultO[0].ESTIMATED_TIME      = WingsUtil.IsNull(resultO[0].ESTIMATED_TIME)    ? '' : parseFloat(resultO[0].ESTIMATED_TIME);
                  resultO[0].APPLIED_TIME        = WingsUtil.IsNull(resultO[0].APPLIED_TIME)      ? '' : parseFloat(resultO[0].APPLIED_TIME);
		          workCard = resultO[0];
		          return deferred.resolve(workCard);
  	          }
          }, function (error) {
              console.log(error);
        	  return deferred.reject('Could not setup connection with local database!');
          });
    	  return deferred.promise;
      };

      function FetchLocalStep(step){
    	  var deferred = $q.defer();
    	  if (step.ID){
    		  var sql = "Select *             "+
                        "  From Pr_Card_Steps "+
                        " Where Id = ?        ";
    		  var parameters = [step.ID];
    	  }else{
    		  var sql = "Select *                    "+
		                "  From Pr_Card_Steps        "+
		                " Where Mobile_Record_Id = ? ";
	          var parameters = [step.MOBILE_RECORD_ID];
    	  }
    	  sql = sql + "   And Div_No = " + $rootScope.globals.currentUser.divNo+
                      "   And Mobile_User_Id = '"+$rootScope.globals.currentUser.userId+"' ";
    	  WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
  	          if (result.length < 1){
  	        	return deferred.reject('Step could not be found in local database!');
  	          }else{
		          return deferred.resolve(result[0]);
  	          }
          }, function (error) {
              console.log(error);
        	  return deferred.reject('Could not setup connection with local database!');
          });
    	  return deferred.promise;
      };
      function FetchLocalRequisition(requisition){
    	  var deferred = $q.defer();
    	  if (requisition.ID){
    		  var sql = "Select *               "+
                        "  From Ic_Requisitions "+
                        " Where Id = ?          ";
    		  var parameters = [requisition.ID];
    	  }else{
    		  var sql = "Select *                    "+
		                "  From Ic_Requisitions      "+
		                " Where Mobile_Record_Id = ? ";
	          var parameters = [requisition.MOBILE_RECORD_ID];
    	  }
    	  sql = sql + "   And Div_No = " + $rootScope.globals.currentUser.divNo+
                      "   And Mobile_User_Id = '"+$rootScope.globals.currentUser.userId+"' ";
    	  WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
  	          if (result.length < 1){
  	        	 return deferred.reject('Requisition could not be found in local database!');
  	          }else{
		          return deferred.resolve(result[0]);
  	          }
          }, function (error) {
              console.log(error);
        	  return deferred.reject('Could not setup connection with local database!');
          });
    	  return deferred.promise;
      };
      function DeleteLocalCard(mobileId){
          var deferred = $q.defer();
          var sql = "Delete From Pr_Work_Cards   "+
          		    " Where Mobile_Record_Id = ? ";
          var parameters = [mobileId];
          WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
              return deferred.resolve(result);
          }, function (error) {
              return deferred.reject(error);
          });
          return deferred.promise;
      }
      function DeleteLocalStep(mobileId){
          var deferred = $q.defer();
          var sql = "Delete From Pr_Card_Steps   "+
                    " Where Mobile_Record_Id = ? ";
          var parameters = [mobileId];
          WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
              return deferred.resolve(result);
          }, function (error) {
              return deferred.reject(error);
          });
          return deferred.promise;
      }
      function DeleteLocalRequisition(mobileId){
          var deferred = $q.defer();
          var sql = "Delete From Ic_Requisitions "+
                    " Where Mobile_Record_Id = ? ";
          var parameters = [mobileId];
          WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
              return deferred.resolve(result);
          }, function (error) {
              return deferred.reject(error);
          });
          return deferred.promise;
      }
      
      function getCardPushList(){
       	  var deferred = $q.defer();
       	  var sql = " Select a.*, 'CARD' OBJECT_TYPE, b.MOBILE_RECORD_ID QUEUE_RECORD_ID, b.MOBILE_TABLE_NAME,b.MOBILE_ACTION_DATE,b.MOBILE_RECORD_ACTION QUEUE_ACTION,b.MOBILE_RECORD_STATUS  QUEUE_STATUS"+
      			    "   From PR_WORK_CARDS a, SY_TRANSACTION_QUEUE b                                                               "+
                    "  Where b.MOBILE_TABLE_NAME      = 'PR_WORK_CARDS'                                                            "+
                    "    And b.MOBILE_TABLE_RECORD_ID = a.MOBILE_RECORD_ID                                                         "+
                    "    And b.MOBILE_RECORD_STATUS  != 'LOADED'                                                                   "+
                    "  Order By b.Mobile_Record_Id Asc                                                                           ";
      	var parameters = [];
	        WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
	        	for(i=0; i<result.length; i++){
	        		result[i].ID                = Number(result[i].ID);
	        		result[i].ZONES             = result[i].ZONES.split(',');
	        		result[i].FLAGS             = result[i].FLAGS.split(',');
	        		result[i].SKILL_CODES       = result[i].SKILL_CODES.split(';');
	        		result[i].ESTIMATED_TIMES   = result[i].ESTIMATED_TIMES.split(';');
	        		result[i].PART_IDS          = result[i].PART_IDS.split(',');
	        		result[i].PART_NUMBERS      = result[i].PART_NUMBERS.split(',');
	        		result[i].PART_DESCRIPTIONS = result[i].PART_DESCRIPTIONS.split(',');
	        		result[i].PART_QUANTITIES   = result[i].PART_QUANTITIES.split(',');
	        		result[i].PART_REPAIR_FLAGS = result[i].PART_REPAIR_FLAGS.split(',');
	        		result[i].ESTIMATED_TIME    = WingsUtil.IsNull(result[i].ESTIMATED_TIME) ? '' : parseFloat(result[i].ESTIMATED_TIME);
	        		result[i].APPLIED_TIME      = WingsUtil.IsNull(result[i].APPLIED_TIME)   ? '' : parseFloat(result[i].APPLIED_TIME);
	        	}
			    return deferred.resolve(result);
			}, function (error) {
			    console.log(error);
			    return deferred.reject(error);
			});
			return deferred.promise;
      };
      function getStepPushList(){
      	var deferred = $q.defer();
      	var sql = " Select a.*, 'STEP' OBJECT_TYPE, b.MOBILE_PARENT_RECORD_ID, b.MOBILE_RECORD_ID QUEUE_RECORD_ID, b.MOBILE_TABLE_NAME,b.MOBILE_ACTION_DATE,b.MOBILE_RECORD_ACTION QUEUE_ACTION,b.MOBILE_RECORD_STATUS  QUEUE_STATUS  "+
                  "   From PR_CARD_STEPS a, SY_TRANSACTION_QUEUE b                                                               "+
                  "  Where b.MOBILE_TABLE_NAME      = 'PR_CARD_STEPS'                                                            "+
                  "    And b.MOBILE_TABLE_RECORD_ID = a.MOBILE_RECORD_ID                                                         "+
                  "    And b.MOBILE_RECORD_STATUS  != 'LOADED'                                                                   "+
                  "  Order By b.Mobile_Record_Id Asc                                                                           ";
			var parameters = [];
	        WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
			    return deferred.resolve(result);
			}, function (error) {
			    console.log(error);
			    return deferred.reject(error);
			});
			return deferred.promise;
      }
      function getRequisitionPushList(){
      	var deferred = $q.defer();
        var sql = " Select a.*, 'REQUISITION' OBJECT_TYPE, b.MOBILE_PARENT_RECORD_ID, b.MOBILE_RECORD_ID QUEUE_RECORD_ID, b.MOBILE_TABLE_NAME,b.MOBILE_ACTION_DATE,b.MOBILE_RECORD_ACTION QUEUE_ACTION,b.MOBILE_RECORD_STATUS  QUEUE_STATUS  "+
                  "   From IC_REQUISITIONS a, SY_TRANSACTION_QUEUE b                                                                    "+
                  "  Where b.MOBILE_TABLE_NAME      = 'IC_REQUISITIONS'                                                                 "+
                  "    And b.MOBILE_TABLE_RECORD_ID = a.MOBILE_RECORD_ID                                                                "+
                  "    And b.MOBILE_RECORD_STATUS  != 'LOADED'                                                                          "+
                  "  Order By b.Mobile_Record_Id Asc                                                                                  ";
			var parameters = [];
	        WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
			    return deferred.resolve(result);
			}, function (error) {
			    console.log(error);
			    return deferred.reject(error);
			});
			return deferred.promise;
      }

//      function removeSyncData(rejectedCards){
//      	//to-do remove items must check transaction queue status not main objects' status only 
//          var deferred = $q.defer();
//      	  var removePromises = [];
//      	  sy.RemoveSyncTransaction().then(function(result){
//      	    removePromises.push(RemoveSteps(rejectedCards));
//            removePromises.push(RemoveCards());
//            removePromises.push(RemoveRequisitions(rejectedCards));
//            removePromises.push(lb.RemoveClocks());
//      	    $q.all(removePromises).then(function(res) {
//                return deferred.resolve("successful");
//            },function(errorRemovePromises) {
//                console.log("remove Sync Data - failed. Reason - "+JSON.stringify(errorRemovePromises));
//                return deferred.reject(errorRemovePromises);
//            });
//      	  },function(err){
//      	    return deferred.reject(err);
//      	  })
//      	return deferred.promise;
//      }
      
      function pushAndPull(card,step,requisition,clock){
    	  var deferred = $q.defer();
    	  pushAll(card,step,requisition,clock).then(function(returnObject){
      		var rejectedCards = returnObject.cards;
      		var rejectedSteps = returnObject.steps;
      		var rejectedRequisition = returnObject.requisitions;
            sy.PushAttachments();
            sy.RemoveSyncTransaction().then(function(resultSync){
      			pullAll(rejectedCards,rejectedSteps,rejectedRequisition,returnObject.cardObj).then(function(resultPull){
      				return deferred.resolve({status:'SUCCEED',error:'',cardObj:returnObject.cardObj,childObj:returnObject.childObj,clockObj:returnObject.clockObj});
      			},function(pullError){
      				console.log("err : "+pullError);
      				return deferred.resolve({status:'FAILED',error:'Failed to pull',cardObj:returnObject.cardObj,childObj:returnObject.childObj,clockObj:returnObject.clockObj});
      			})
      		},function(removeError){
      			console.log("err : "+removeError);
      			return deferred.resolve({status:'FAILED',error:'Failed to remove',cardObj:returnObject.cardObj,childObj:returnObject.childObj,clockObj:returnObject.clockObj});
      		});
      	},function(pushError){
      		console.log("err : "+pushError);
      		return deferred.resolve({status:'FAILED',error:'Failed to push',cardObj:returnObject.cardObj,childObj:returnObject.childObj,clockObj:returnObject.clockObj});
      	});
    	  return deferred.promise;
      }
      
      function pullAll(cardList ,stepList, requisitionList, card){
      	var deferred = $q.defer();
      	var savePullPromises = [];
      	
//      	var isRejected = false;
      	var rejectedCardIdList = [];
      	
      	var pullChildOnly        = false;
      	var stepCondition        = ' ';
      	var requisitionCondition = ' ';
      	
      	//card condition
      	card.ID = card.ID ? card.ID : '';
      	card.WORK_CARD_NUMBER = card.WORK_CARD_NUMBER ? card.WORK_CARD_NUMBER : '';
      	var cardCondition        = "And a.Id = Nvl('"+card.ID+"',Mb_Service.Parse_Work_Card("+$rootScope.globals.currentUser.divNo+",'"+card.WORK_CARD_NUMBER+"')) ";
      	if (card.PARAMETER_TYPE == 'DISCREPANCY-CARDS') {
      	    cardCondition        = "And (a.Id = '"+card.DISCREPANCY_WORK_CARD_ID+"' Or a.Source_Card_Id = '"+card.DISCREPANCY_WORK_CARD_ID+"')";
      	} else if (card.PARAMETER_TYPE == 'PROJECT-CARDS') {
            cardCondition        = "And a.Project_Number = '"+card.PROJECT_NUMBER+"' ";
      	}
      	
      	var divNo  = $rootScope.globals.currentUser.divNo;
      	var userId = $rootScope.globals.currentUser.userId;
      	
      	for (i=0; i<cardList.length; i++){
      	    if (cardList[i].ID) rejectedCardIdList.push(cardList[i].ID);
      	}
      	if (rejectedCardIdList.length == 0) rejectedCardIdList = '-1000';
      	else rejectedCardIdList = rejectedCardIdList.join();
      	
  		if (stepList.length > 0){
      		for(j=0; j<stepList.length; j++){
      			/*if(stepList[j].CARD_ID == card.ID){
          			isRejected = true;
          		}*/
      			if (!WingsUtil.IsNull(stepList[j].ID) && stepList[j].DIV_NO == divNo && stepList[j].MOBILE_USER_ID == userId){
      				stepCondition += stepList[j].ID+",";
      			}
      		}
      		stepCondition = stepCondition  == ' '  ? ' ' : " And b.Id Not In ("+stepCondition.substring(0, stepCondition.length - 1)+")";
  		}
  		
  		if (requisitionList.length > 0){
      		for(k=0; k<requisitionList.length; k++){
      			/*if(requisitionList[k].CARD_ID == card.ID){
          			isRejected = true;
          		}*/
      			if (!WingsUtil.IsNull(requisitionList[k].ORDER_LINE_ID) && requisitionList[k].DIV_NO == divNo && requisitionList[k].MOBILE_USER_ID == userId){
      				requisitionCondition += requisitionList[k].ORDER_LINE_ID +",";
      			}
      		}
      		requisitionCondition =  requisitionCondition  == ' ' ? ' ' : "And c.Id Not In ("+ requisitionCondition.substring(0, requisitionCondition.length - 1)+")";
  		}
  		
  		 var sqlcard = "Select a.Id,                                                              																 "+
  		 			   "       a.Div_No,                                                                                                                         "+
			           "       a.Project_Number,                                                  																 "+
			           "       a.Work_Order_Number,                                               																 "+
			           "       a.Zone_Number,                                                     																 "+
			           "       a.Item_Number,                                                     																 "+
			           "       a.Customer_Work_Card,                                                                                                             "+
			           "       a.Tail_Number,                                                                                                                    "+
			           "       a.Customer_Name,                                                                                                                  "+
			           "       a.Open_Date,                                                      																 "+
			           "       a.Description,                                                     																 "+
			           "       a.Primary_Skill_Code,                                              																 "+
			           "       a.Estimated_Time,                                                  																 "+
			           "       a.Status,                                                         																 "+
			           "       a.Wip_Status,                                                     																 "+
			           "       a.Wip_Reason,                                                      																 "+
			           "       a.Milestone,                                                       																 "+
			           "       a.Ata_Code,                                                        																 "+
			           "       a.Task_Code,                                                       																 "+
			           "       a.Contract_Group,                                                  																 "+
			           "       a.Shop_Number,                                                     																 "+
			           "       a.Component_Number,                                                																 "+
			           "       a.Serial_Number,                                                   																 "+
			           "       a.Zones,                                                           																 "+
			           "       a.Billable,                                                        																 "+
			           "       a.Cpcp_Report_Flag,                                                																 "+
			           "       a.Cdccl_Flag,                                                      																 "+
			           "       a.Rii_Flag,                                                        																 "+
			           "       a.Etops_Flag,                                                      																 "+
			           "       a.Bust_Exemption_Flag,                                             																 "+
			           "       a.Leak_Check_Flag,                                                 																 "+
			           "       a.Source_Card_Id,                                                  																 "+
			           "       a.Source_Work_Order_Number || '.' || a.Source_Zone_Number          																 "+
			           "       || '.' || a.Source_Item_Number  source_work_card ,                 																 "+
			           "       a.Actual_Time,                                                     																 "+
			           "       a.Applied_Time,                                                    																 "+
			           "       a.Work_Order_Type,                                                 																 "+
			           "       a.Priority_Code,                                                   																 "+
			           "       a.Corrective_Action,                                               																 "+
			           "       a.Aircraft_Location,                                               																 "+
			           "       a.Authorization_Type,                                              																 "+
			           "       Nvl(a.Shop_Flag,'N') Shop_Flag,                                    																 "+
			           "       a.Estimator_Comment,                                               																 "+
			           "       a.Aircraft_Type,                                                   															" +
			           //
			           "	  (Select Max(y.Serial_Number)" +
			           "       From Pr_Aircrafts y" +
			           "        Where y.Div_No      = a.Div_No" +
			           "        And y.Tail_Number = a.Tail_Number) Aircraft_Msn," +
			           "        (Select Max(Check_Type)" +
			           "        From Pr_Work_Orders y" +
			           "        Where y.Div_No            = a.Div_No" +
			           "        And y.Work_Order_Number = a.Work_Order_Number) Check_Type," +
			           "        a.Created_By_Employee_Number," +
			           "        a.Created_By_Employee_Name," +
			           "        a.Work_Order_Station," +
			           "        a.Inspector_Name, " +
			           "       (Select ListAgg (Id || ',' ||                                                                                                     " +
			           "               Step_Sequence || ',' ||                                                                                                   " +
			           "               Position_X || '%,' ||                                                                                                      " +
			           "               replace(Position_Y,',','|') || '%,' ||                                                                                                      " +
			           "               File_Id || ',' || " +
			           "               replace(Height,',','|') || '%,' ||" +
			           "               '100%' || ',' ||" +
			           "               Step_Status,';') within group (order by 1)" +
			           "          from Pr_Card_Steps " +
			           "         Where Div_No = a.Div_No" +
			           "           And Work_Card_Id = a.Id) step_data ,"+
			           //
			           "       (Select ListAgg(Skill_Code||','||Estimated_Time,',')               																 "+
			           "               Within Group (Order By Decode(Primary_Skill_Flag,'Y',1,2)) 																 "+
			           "          From Pr_Card_Skills x                                           																 "+
			           "         Where x.Div_No       = a.Div_No                                  																 "+
			           "           And x.Work_Card_Id = a.Id) Skills_Array,                        																 "+
			           "     (Select ListAgg(Stamp_Number,',') Within Group (Order By Stamp_Number) 														     "+
		               "        From Qa_Employee_Stamp_v                                            															 "+
		               "       Where Div_No          = a.Div_No                                     															 "+
		               "         And Employee_Number = '"+$rootScope.globals.currentUser.userNumber+"'                             						  		 "+
		               "         And Active          = 'Y'                                          															 "+
		               "         And Trunc((Select Sy_Database.System_Date(a.Div_No) From Dual)) Between Begin_Date     										 "+
		               "         And Nvl(End_Date,To_Date('01/01/2050','mm/dd/yyyy'))               															 "+
		               "     ) Stamp_Numbers,                                                       															 "+
		               "     (Select Count(0)                                                       															 "+
		               "        From Lb_Labor_Collection                                            															 "+
		               "       Where Div_No            = a.Div_No                                   															 "+
		               "         And Work_Order_Number = a.Work_Order_Number                        															 "+
		               "         And Zone_Number       = a.Zone_Number                              															 "+
		               "         And Item_Number       = a.Item_Number                              															 "+
		               "         And Clock_Out         Is Null                                      															 "+
		               "         And Active            = 'Y') Labor_Count,                          															 "+
		               "     (Select Count(0)                                                       															 "+
		               "        From Tl_Item_Transactions_v x,                                      															 "+
		               "             Tl_Items               y,                                      															 "+
		               "             Tl_Tools               z                                       															 "+
		               "       Where x.Div_No       = a.Div_No                                      															 "+
		               "         And x.Work_Card_Id = a.Id                                          															 "+
		               "         And x.Process_Date Is Null                                         															 "+
		               "         And y.Div_No       = x.Div_No                                      															 "+
		               "         And y.Tool_Id      = x.Tool_Id                                     															 "+
		               "         And y.Tag_Number   = x.Tag_Number                                  															 "+
		               "         And z.Id           = x.Tool_Id) Tool_Count,                       																 "+
                       "     (Select Count(0)                                                                                                                    "+
                       "        From Pr_Work_Cards                                                                                                               "+
                       "       Where Div_No         = a.Div_No                                                                                                   "+
                       "         And Source_Card_Id = a.Id                                                                                                       "+
                       "         And Status        != 'BILLING') Open_Child_Card_Count,                                                                          "+
		               "     (Select Count(0)                                                      																 "+
		               "        From Pr_Work_Cards                                                  															 "+
		               "       Where Div_No         = a.Div_No                                      															 "+
		               "         And Source_Card_Id = a.Id                                          															 "+
		               "         And Status         = 'BILLING') Closed_Child_Card_Count,                  													     "+
		               "       Gn_Service.To_Id(a.Div_No,'AR_CUSTOMERS',Customer_Number) Customer_Id, 															 "+
		               "       a.Applicable_Standard,                                                 															 "+
		               "       Gn_Service.isIncluded(Sy_Database.Environment('APPLICABLE_STANDARD_VALIDATION'),'ROTABLE','ONE','|') App_Std_Validation_Rotable,  "+
		               "       Gn_Service.isIncluded(Sy_Database.Environment('APPLICABLE_STANDARD_VALIDATION'),'CONSUMABLE','ONE','|') App_Std_Validation_Other, "+
		               "       'COMPLETED' Status_Code,                                                                   										 "+
		               "       (Select ListAgg(Id||','||Requested_Part_Number||','||Requested_Part_Description||','||Quantity||','||Repair_Flag,',') 			 "+
		               "               Within Group (Order By Requested_Part_Number) 																 			 "+
		               "          From Pr_Card_Parts x                      																 					 "+
		               "         Where x.Div_No       = a.Div_No            																 					 "+
		               "           And x.Work_Card_Id = a.Id) Parts_Array,  																 					 "+
		               "       a.Planned_Start_Date,                          																 					 "+
		               "       a.Planned_Finish_Date,                         																 					 "+
		               "       a.Sdr_Flag,                                    																 					 "+
		               "       a.Major_Repair_Flag,                           																 					 "+
		               "       a.Major_Alteration_Flag,                       																 					 "+
		               "       a.Parts_Required_Flag,                                                                                                            " +
		               "       a.Routine_Flag,                																 					                 "+
	                   "       a.Nonroutine_Flag,                                                                                                                "+
		               "       a.Inspector_Number,                        																 					     "+
		               "       a.Inspection_Date,                       																 					     "+
		               "       a.Inspector_Stamp_Number,                       																 					 "+
		               "       a.Leak_Check_Inspector_Number,                       																 		     "+
		               "       a.Leak_Check_Inspection_Date,                       																 				 "+
		               "       a.Ops_Inspector_Stamp_Number,                                                                                                     "+
		               "       Pr_Service.Get_Card_Actions(a.Id)             Work_Card_Actions,                                                                  "+
		               "       Pr_Service.is2ndary_Inspection_Required(a.Id) Secondary_Inspection_Required                                                       "+
		               " From Pr_Work_Cards_v a                                                                                                               	 "+
		               "Where a.Div_No = "+$rootScope.globals.currentUser.divNo +
		               "  And a.Id     Not In ("+rejectedCardIdList+") " + cardCondition;
      	
  		var sqlStep = "Select b.Id,                                																			"+
  		              "       a.Div_No,                                                                                                     "+
			          "       a.Id Card_Id,                                 																"+
			          "       a.Work_Order_Number Card_Work_Order_Number,   																"+
			          "       a.Zone_Number Card_Zone_Number,                																"+
			          "       a.Item_Number Card_Item_Number,                																"+
		    		  "       b.Type,                                        																"+
		              "       b.Step_Number,                                 																"+
		              "       b.Step_Sequence,                               																"+
		              "       b.Step_Status,                                 																"+
		              "       b.Description,                                 																"+
		              "       b.Action,                                      																"+
		              "       b.Mechanic_Signoff_Flag,                       																"+
		              "       b.Inspector_Signoff_Flag,                      																"+
		              "       b.Perform_Date,                                																"+
		              "       b.Completion_Date,                             																"+
		              "       b.Mechanic_Employee_Number,                    																"+
		              "       b.Inspector_Employee_Number,                   																"+
		              "       Decode(b.Mechanic_Employee_Number,Null,'','<b>Performed By:</b>'||b.Mechanic_Employee_Number)||'  '||         "+
		              "       Decode(b.Inspector_Employee_Number,Null,'','<b>Completed By:</b>'||b.Inspector_Employee_Number) Actions_Info  "+
		              "  From Pr_Work_Cards a,                             																    "+
		              "       Pr_Card_Steps b                              																    "+
		              " Where a.Div_No       = "+$rootScope.globals.currentUser.divNo+
		                      cardCondition+" "+
		                      stepCondition+
		              "   And b.Div_No       = a.Div_No                    																    "+
		              "   And b.Work_Card_Id = a.Id                       																    "+
		              "   And b.Type         = 'STEP'                        																";

  		 var sqlRequisition = " Select c.Div_No,                                                                                            "+
                              "        a.Id Card_Id,                                                                                        "+    
                              "        c.Order_Number || '/' || c.Order_Line Order_Number_Line,                                             "+
                              "        b.Order_Class,                                                                                       "+
                              "        Gn_Service.To_Character(c.Due_Date) Due_Date,                                                        "+
                              "        Decode(b.Order_Class,                                                                                "+
                              "              'TOOL',                                                                                        "+
                              "              c.Oem_Tool_Number,                                                                             "+
                              "              Nvl(d.Part_Number, c.Part_Number)) Part_Number,                                                "+
                              "        c.Quantity || ' ' || d.Uom Quantity,                                                                 "+
                              "        b.Ordered_By_Employee_Number Employee_Number,                                                        "+
                              "        (Select Lb_Service.Employee_Name(b.Div_No, b.Ordered_By_Employee_Number) From Dual)   Employee_Name, "+
                              "        c.Status,                                                                                            "+
                              "        d.Rotable_Flag,                                                                                      "+
                              "        Decode(c.Status, 'CREATED', 'TRUE', 'FALSE') Cancel_Allowed,                                         "+
                              "        (Select Max(y.Reason)                                                                                "+
                              "          From Ic_Transactions y                                                                             "+
                              "         Where y.Requisition_Line_Id = c.Id                                                                  "+
                              "           And y.Operation           In ('CREATE', 'RESERVE')                                                "+
                              "           And y.Active              = 'Y') Approval_Status,                                                 "+
                              "        c.Id Order_Line_Id                                                                                   "+
                              "  From Pr_Work_Cards  a,                                                                                     "+
                              "       Ic_Orders      b,                                                                                     "+
                              "       Ic_Order_Lines c,                                                                                     "+
                              "       Ic_Parts       d                                                                                      "+
                              " Where a.Div_No       = 1                                                                                    "+
                                  cardCondition+" "+requisitionCondition+
                              "   And b.Work_Card_Id = a.Id                                                                                 "+ 
                            //"   And b.Order_Type   = 'REQUISITION'                                                                        "+  
                              "   And c.Div_No       = b.Div_No                                                                             "+
                              "   And c.Order_Number = b.Order_Number                                                                       "+
                              "   And d.Id           = c.Part_Id                                                                            ";
  		 var sqlArray = [{ queryStr: sqlcard,          queryType: "READ" },
            { queryStr: sqlStep,      queryType: "READ" },
            { queryStr: sqlRequisition,       queryType: "READ" }];
      	var sqlString = JSON.stringify(sqlArray);
      	WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
      		var terminate = false;
      		var terminateErr = '';
      		var result = [];
      		var i = 0;
      		while(i < dataIn.length && !terminate){
      			dataIn[i] = angular.fromJson(dataIn[i]);
	      		if (dataIn[i].success){
	      			result.push(angular.fromJson(dataIn[i].rows));
	      		}else{
	      			terminateErr = dataIn[i].message;
	      			terminate = true;
	      		}
	      		i++;
      		}
      		if (terminate){
      		     console.log(terminateErr);
      			 deferred.reject(terminateErr);
      		}else{
      			if (result[0].length > 0){
      				for(l=0; l<result[0].length; l++){
      					result[0][l] = TransformCard(result[0][l]);
      				}
      				SaveCard(result[0]).then(function(res){
      				  if (result[1].length > 0){
                          for(m=0; m<result[1].length; m++){
                              result[1][m] = TransformStep(result[1][m]);
                          }
                          savePullPromises.push(SaveStep(result[1]));
                      } 
                      if (result[2].length > 0){
                          for(n=0; n<result[2].length; n++){
                              result[2][n] = TransformRequisition(result[2][n]);
                          }
                          savePullPromises.push(SaveRequisition(result[2]));
                      } 
                  
                      if (savePullPromises.length > 0){
                          $q.all(savePullPromises).then(function(result) {
                               deferred.resolve("GO-HEAD");
                          },function(saveError){
                               console.log(saveError);
                               deferred.reject(saveError);
                          });
                      }else{
                           deferred.resolve("GO-HEAD");
                      }
      				},function(err){
      				  console.log(err);
      				  deferred.reject(err);
      				});
      			}else{
      			  deferred.resolve("GO-HEAD");
      			} 
      		}
      	}, function (error) {
      	     console.log(JSON.stringify(error));
        	 deferred.reject(JSON.stringify(error));
        });

      	return deferred.promise;
      }
      
      function pushAll(card,step,requisition,clock){
    	  var deferred = $q.defer();
    	  var sortedList = [];
    	  var rejectedCards = [];
    	  var rejectedClocks = [];
    	  var loadedClocks = [];
    	  var tempRejectedCard = [];
    	  var cardObj = card ?  {PARAMETER_TYPE:card.PARAMETER_TYPE,ID:card.ID,PROJECT_NUMBER:card.PROJECT_NUMBER,DISCREPANCY_WORK_CARD_ID:card.DISCREPANCY_WORK_CARD_ID,MOBILE_RECORD_ID:null,STATUS:'',SERVER_FEEDBACK:'',WORK_CARD_NUMBER:card.WORK_CARD_NUMBER} : {ID:null,MOBILE_RECORD_ID:null,STATUS:'',SERVER_FEEDBACK:'',WORK_CARD_NUMBER:''};
    	  var childObj = {ID:null,MOBILE_RECORD_ID:null,SERVER_FEEDBACK:'',STATUS:''};
    	  var clockObj = {};
    	  var loadedCards = [];
    	  var createdCards = [];
    	  var rejectedSteps = [];
    	  var loadedSteps = [];
    	  var rejectedRequisitions = [];
    	  var loadedRequisitions = [];
          var builders = [];
    	  var pushListPromises = [getCardPushList(),getStepPushList(),getRequisitionPushList(),lb.GetClockPushList()];
	      var updateChildPromises = [];
	      
	      var readyCardMobileRecordIds = [];
	      
    	  $q.all(pushListPromises).then(function(res) {
    		  var tempCards =[];
    		  var tempSteps =[];
    		  var tempRequisitions =[];
    		  var tempClocks       =[];
    		  for (x = 0; x< res[0].length;x++){
      	    	  if (res[0][x].QUEUE_STATUS == 'READY'){
      	    		tempCards.push(res[0][x]);
      	    		
      	    		readyCardMobileRecordIds.push(res[0][x].MOBILE_RECORD_ID);
      	    	  }else{
      	    		if (res[0][x].ID) tempRejectedCard.push(res[0][x]);
      	    	  }
      	      }
    		  for (y = 0; y< res[1].length;y++){
      	    	  if (res[1][y].QUEUE_STATUS == 'READY' || readyCardMobileRecordIds.indexOf(res[1][y].MOBILE_PARENT_RECORD_ID) >= 0){
      	    		tempSteps.push(res[1][y]);
      	    	  }else{
      	    		if (res[1][y].ID) rejectedSteps.push(res[1][y]);
      	    		if (res[1][y].CARD_ID) tempRejectedCard.push({ID : res[1][y].CARD_ID, DIV_NO:res[1][y].DIV_NO, MOBILE_USER_ID:res[1][y].MOBILE_USER_ID});
      	    	  }
      	      }
    		  for (z = 0; z< res[2].length;z++){
      	    	  if (res[2][z].QUEUE_STATUS == 'READY' || readyCardMobileRecordIds.indexOf(res[2][z].MOBILE_PARENT_RECORD_ID) >= 0){
      	    		tempRequisitions.push(res[2][z]);
      	    	  }else{
      	    		if (res[2][z].ORDER_LINE_ID) rejectedRequisitions.push(res[2][z]);
      	    		if (res[2][z].CARD_ID) tempRejectedCard.push({ID : res[2][z].CARD_ID, DIV_NO : res[2][z].DIV_NO, MOBILE_USER_ID : res[2][z].MOBILE_USER_ID});
      	    	  }
      	      }
    		  for(w = 0; w < res[3].length; w++){
    			  if (res[3][w].QUEUE_STATUS == 'READY' || readyCardMobileRecordIds.indexOf(res[3][w].MOBILE_PARENT_RECORD_ID) >= 0){
    				  tempClocks.push(res[3][w]);
    			  }else{
    				  rejectedClocks.push(res[3][w]);
    			  }
    		  }
    		  
    		  sortedList = SortPushList(tempCards,tempSteps)
    		  sortedList = SortPushList(sortedList, tempRequisitions);
    		  sortedList = SortPushList(sortedList, tempClocks);
    		  for(i=0; i<sortedList.length; i++){
    			  console.log("row "+i+" MRI :"+sortedList[i].QUEUE_RECORD_ID)
    		      builders.push(PrepareBuilder(sortedList[i]));
    		  }
    		  if (builders.length > 0) {
                  var str = JSON.stringify(builders);
                  WingsRemoteDbService.executeFunction(str).then (function (response) {
                	  for(j=0; j<response.length; j++){
                		  var tempAction = sortedList[j].QUEUE_ACTION;
                		  response[j] = JSON.parse(response[j]);
	                	  if (response[j].isSuccess =='true' && response[j].errorText == ''){
	                		  var returnObject = angular.fromJson(response[0].result.o_Data);
	                		  
                              sortedList[j].NOTIFICATION_TEXT    = response[j].notificationText;
	                		  sortedList[j].MOBILE_RECORD_STATUS = 'LOADED';
	                		  sortedList[j].MOBILE_RECORD_ACTION = '';
	                		  sortedList[j].SERVER_FEEDBACK      = '';
	                		  
	                		  if (sortedList[j].OBJECT_TYPE == 'CARD'){
	                			  sortedList[j].ID = returnObject.WORK_CARD_ID ? returnObject.WORK_CARD_ID : null;
	                			  if (tempAction == 'CREATE'){
	                				  sortedList[j].ZONE_NUMBER       = returnObject.ZONE_NUMBER;
	                				  sortedList[j].WORK_ORDER_NUMBER = returnObject.WORK_ORDER_NUMBER;
	                				  sortedList[j].ITEM_NUMBER       = returnObject.ITEM_NUMBER;
	                				  createdCards.push(sortedList[j]);
	                			  }
	                			  loadedCards.push(sortedList[j]);
	            			  }else if(sortedList[j].OBJECT_TYPE == 'STEP'){
	            				  sortedList[j].ID = returnObject.CARD_STEP_ID;
	            				  loadedSteps.push(sortedList[j]);

	            			  }else if(sortedList[j].OBJECT_TYPE == 'REQUISITION'){
	            				  sortedList[j].ORDER_LINE_ID = returnObject.ORDER_LINE_ID;
	            				  loadedRequisitions.push(sortedList[j]);
	            				  /*if (tempAction == 'CREATE'){
	                				 //update transaction queue
	                			  }*/
	            			  }else if(sortedList[j].OBJECT_TYPE == 'CLOCK'){
	            				  if (returnObject && returnObject.EMPLOYEE_NAME)               sortedList[j].NAME                        = returnObject.EMPLOYEE_NAME;
	            				  if (returnObject && returnObject.AUTHORIZATION_REQUIRED_FLAG) sortedList[j].AUTHORIZATION_REQUIRED_FLAG = returnObject.AUTHORIZATION_REQUIRED_FLAG;
	            				  if (returnObject && returnObject.AUTHORIZED_BY_EMPLOYEE_NAME) sortedList[j].SUPERVISOR_NAME             = returnObject.AUTHORIZED_BY_EMPLOYEE_NAME;
	            				  if (returnObject && returnObject.WORK_CARD_NUMBER)            sortedList[j].WORK_CARD_NUMBER            = returnObject.WORK_CARD_NUMBER;
	            				  if (returnObject && returnObject.DAILY_HOURS)                 sortedList[j].DAILY                       = returnObject.DAILY_HOURS;
	            				  if (returnObject && returnObject.WEEKLY_HOURS)                sortedList[j].WEEKLY                      = returnObject.WEEKLY_HOURS;
	            				  loadedClocks.push(sortedList[j]);
	            			  }
	                	  }else{
	                	      // "reject" the local record only if there is NOT low level problem
	                	      if (response[j].isSuccess == 'true') {
	                              sortedList[j].MOBILE_RECORD_STATUS = 'REJECTED';
                              }
                              sortedList[j].SERVER_FEEDBACK = WingsUtil.IsNull(response[j].errorText) ? response[j].message : response[j].errorText;
	                	      
                              if (sortedList[j].OBJECT_TYPE == 'CARD'){
                                  rejectedCards.push(sortedList[j]);
                              }else if(sortedList[j].OBJECT_TYPE == 'STEP'){
                                  rejectedSteps.push(sortedList[j]);
                                  if(sortedList[j].CARD_ID) tempRejectedCard.push({ID : sortedList[j].CARD_ID, DIV_NO : sortedList[j].DIV_NO, MOBILE_USER_ID : sortedList[j].MOBILE_USER_ID});
                              }else if(sortedList[j].OBJECT_TYPE == 'REQUISITION'){
                                  rejectedRequisitions.push(sortedList[j]);
                                  if(sortedList[j].CARD_ID) tempRejectedCard.push({ID : sortedList[j].CARD_ID, DIV_NO : sortedList[j].DIV_NO, MOBILE_USER_ID : sortedList[j].MOBILE_USER_ID});
                              }else if(sortedList[j].OBJECT_TYPE == 'CLOCK'){
                                  if (response[j].isSuccess == 'true') {
                                      var returnObject = angular.fromJson(response[0].result.o_Data);
                                      if (returnObject && returnObject.EMPLOYEE_NAME)               sortedList[j].NAME                        = returnObject.EMPLOYEE_NAME;
                                      if (returnObject && returnObject.AUTHORIZATION_REQUIRED_FLAG) sortedList[j].AUTHORIZATION_REQUIRED_FLAG = returnObject.AUTHORIZATION_REQUIRED_FLAG;
                                      if (returnObject && returnObject.AUTHORIZED_BY_EMPLOYEE_NAME) sortedList[j].SUPERVISOR_NAME             = returnObject.AUTHORIZED_BY_EMPLOYEE_NAME;
                                      if (returnObject && returnObject.WORK_CARD_NUMBER)            sortedList[j].WORK_CARD_NUMBER            = returnObject.WORK_CARD_NUMBER;
                                      if (returnObject && returnObject.DAILY_HOURS)                 sortedList[j].DAILY                       = returnObject.DAILY_HOURS;
                                      if (returnObject && returnObject.WEEKLY_HOURS)                sortedList[j].WEEKLY                      = returnObject.WEEKLY_HOURS;
                                  }

                                  rejectedClocks.push(sortedList[j]);
                              }
	                	  }
                	  }
                	  var saveResponsePromises = [];
                	  var allCards        = rejectedCards.concat(loadedCards);
                	  var allClocks        = rejectedClocks.concat(loadedClocks);
                	  var allSteps        = rejectedSteps.concat(loadedSteps);
                	  var allRequisitions = rejectedRequisitions.concat(loadedRequisitions);
                	  if (sortedList.length >0)saveResponsePromises.push(sy.UpdateTransaction(sortedList));
                	  if (allCards.length > 0) saveResponsePromises.push(SaveCard(allCards));
                	  if (allSteps.length > 0) saveResponsePromises.push(SaveStep(allSteps));
                	  if (allRequisitions.length > 0) saveResponsePromises.push(SaveRequisition(allRequisitions));
                	  if (allClocks.length > 0) saveResponsePromises.push(lb.SaveClock(allClocks));
                	  if (requisition){
            			  for (k=0; k < allRequisitions.length; k++){
            				  if (requisition.MOBILE_RECORD_ID == allRequisitions[k].MOBILE_RECORD_ID){
            					  childObj.ID               = allRequisitions[k].ORDER_LINE_ID;
            					  childObj.MOBILE_RECORD_ID = allRequisitions[k].MOBILE_RECORD_ID;
            					  childObj.STATUS           = allRequisitions[k].MOBILE_RECORD_STATUS;
            					  childObj.SERVER_FEEDBACK  = WingsUtil.IsNull(allRequisitions[k].SERVER_FEEDBACK) ? '' : allRequisitions[k].SERVER_FEEDBACK;
            				  } 
                		  }
                	  }else if (step){
            			  for (l=0; l < allSteps.length; l++){
            				  if (step.MOBILE_RECORD_ID == allSteps[l].MOBILE_RECORD_ID){
            					  childObj.ID               = allSteps[l].ID;
            					  childObj.MOBILE_RECORD_ID = allSteps[l].MOBILE_RECORD_ID;
            					  childObj.STATUS           = allSteps[l].MOBILE_RECORD_STATUS;
            					  childObj.SERVER_FEEDBACK  = WingsUtil.IsNull(allSteps[l].SERVER_FEEDBACK) ? '' : allSteps[l].SERVER_FEEDBACK;
            				  } 
            			  }
                	  }else if (clock){
                		  for(p=0; p<allClocks.length; p++){
                			  if (clock.MOBILE_RECORD_ID == allClocks[p].MOBILE_RECORD_ID){
                				  clockObj = allClocks[p];
                			  }
                		  }
                	  }
                	  if (card){
            			  for (m=0; m < allCards.length; m++){
            				  if (card.MOBILE_RECORD_ID == allCards[m].MOBILE_RECORD_ID){
            					  cardObj.ID               = allCards[m].ID;
            					  cardObj.MOBILE_RECORD_ID = allCards[m].MOBILE_RECORD_ID;
            					  cardObj.STATUS           = allCards[m].MOBILE_RECORD_STATUS;
            					  cardObj.WORK_CARD_NUMBER = WingsUtil.IsNull(allCards[m].WORK_CARD_NUMBER) ? '' : allCards[m].WORK_CARD_NUMBER;
            					  cardObj.SERVER_FEEDBACK  = WingsUtil.IsNull(allCards[m].SERVER_FEEDBACK) ? '' : allCards[m].SERVER_FEEDBACK;
            				  }
            			  }
                	  }
                	  if (saveResponsePromises.length > 0){
                		  $q.all(saveResponsePromises).then(function(saveResponse) {
                    		  for(p=0; p<createdCards.length; p++){
                    			  updateChildPromises.push(updateChildRequisitions(createdCards[p]));
      							  updateChildPromises.push(updateChildSteps(createdCards[p]));
                                  updateChildPromises.push(updateChildClocks(createdCards[p]));
                    		  }
                    		  if (updateChildPromises.length > 0){
	                    		  $q.all(updateChildPromises).then(function(childResponse) {
	                    			  rejectedCards = rejectedCards.concat(tempRejectedCard);
	                    			  return deferred.resolve({cards:rejectedCards,steps:rejectedSteps,requisitions:rejectedRequisitions,cardObj:cardObj,childObj:childObj,clockObj:clockObj});
	                          	  },function(childErr){
	                          	      console.log(childErr);
	                          		  return deferred.reject(childErr);
	                          	  });
                    		  }else{
                    			  rejectedCards = rejectedCards.concat(tempRejectedCard);
                    			  return deferred.resolve({cards:rejectedCards,steps:rejectedSteps,requisitions:rejectedRequisitions,cardObj:cardObj,childObj:childObj,clockObj:clockObj});
                    		  }
                      	  },function(saveErr){
                      		console.log(saveErr);
                      		return deferred.reject(saveErr);
                      	  });
                	  }else{
                		  rejectedCards = rejectedCards.concat(tempRejectedCard);
                		  return deferred.resolve({cards:rejectedCards,steps:rejectedSteps,requisitions:rejectedRequisitions,cardObj:cardObj,childObj:childObj,clockObj:clockObj});
                	  }
                  },function (errPush){
                	  console.log("Execute Push Functions - failed. Reason - "+JSON.stringify(errPush));
                      return deferred.reject(JSON.stringify(errPush));
                  });
    		  }else{
    			  rejectedCards = rejectedCards.concat(tempRejectedCard);
    			  return deferred.resolve({cards:rejectedCards,steps:rejectedSteps,requisitions:rejectedRequisitions,cardObj:cardObj,childObj:childObj,clockObj:clockObj}); 
    		  }
          },function(errPushList) {
              console.log("Get Push List - failed. Reason - "+errPushList);
              return deferred.reject(errPushList);
          });
    	  return deferred.promise;
      }
      
      function updateChildRequisitions(card){
    	  var deferred = $q.defer();
    	  var sql = " Update Ic_Requisitions    "+
    	  		    "    Set Card_Id = ?        "+
                    "  Where Mobile_Card_Id = ? "+
                    "    And Div_No = ?         "+
                    "    And Mobile_User_Id = ? ";
          var parameters = [card.ID,card.MOBILE_RECORD_ID,card.DIV_NO,card.MOBILE_USER_ID];
    	  WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
    		  console.log("child requisitions are updated");
		      return deferred.resolve('SUCCEED');
          }, function (error) {
              console.log(error);
        	  return deferred.reject('Could not update requisitions of newly created card - Mobile Card Id : '+card.MOBILE_RECORD_ID);
          });
    	  return deferred.promise;
      }
      function updateChildSteps(card){
    	  var deferred = $q.defer();
    	  var sql = " Update Pr_Card_Steps         "+
    	  		    "    Set Card_Id = ?,          "+
    	            "        Card_Zone_Number = ?, "+
    	            "        Card_Item_Number = ?  "+
                    "  Where Mobile_Card_Id = ?    "+
                    "    And Div_No = ?            "+
                    "    And Mobile_User_Id = ?    ";
          var parameters = [card.ID,card.ZONE_NUMBER,card.ITEM_NUMBER,card.MOBILE_RECORD_ID,card.DIV_NO,card.MOBILE_USER_ID];
          console.log(sql);
    	  WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
		          return deferred.resolve('SUCCEED');
          }, function (error) {
              console.log(error);
        	      return deferred.reject('Could not update steps of newly created card - Mobile Card Id : '+card.MOBILE_RECORD_ID);
          });
    	  return deferred.promise;
      }
      
      function updateChildClocks(card){
          var deferred = $q.defer();
          var sql = " Update Sy_Transaction_Queue                          "+
                    "    Set Server_Parent_Record_Id = ?                   "+
                    "  Where Mobile_Table_Name      = 'LB_LABOR_COLLECTION'"+
                    "    And Mobile_Table_Record_Id = ?                    ";
          var parameters = [card.ID,card.MOBILE_RECORD_ID];
          console.log(sql);
          
          WingsTransactionDBService.executeSql(sql,parameters).then(function (result){
                  return deferred.resolve('SUCCEED');
          }, function (error) {
              console.log(error);
                  return deferred.reject('Could not update labor collections of newly created card - Mobile Card Id : '+card.MOBILE_RECORD_ID);
          });
          return deferred.promise;
      }
  
      function PrepareBuilder (object){
    	  var myBuilder = '';
    	  var builder = null;
    	  if (object.OBJECT_TYPE == 'CARD'){
    		  var primaryFlags = [];
        	  for (k=0; k<object.SKILL_CODES.length;k++){
        		  primaryFlags.push(k == 0 ? 'Y':'N');
        	  }
	    	  myBuilder = new StoredFuncProcBuilder("Mb_Apps.Do_Work_Card", 'i_Div_No',                  object.DIV_NO,
																			 'i_Action',                 object.QUEUE_ACTION,
																		  	 'i_What',					 '',
																			 'i_Work_Card_Id',           object.ID ? object.ID : null,
																		     'i_Work_Card',              '',
																			 'i_Mobile_Work_Card_Id',    object.MOBILE_RECORD_ID,
																			 'i_Project_Number',         object.PROJECT_NUMBER,
														                     'i_Work_Order_Type',        object.WORK_ORDER_TYPE,
														                     'i_Work_Order_Number',      object.WORK_ORDER_NUMBER,
														                     'i_Source_Card_Id',         object.SOURCE_CARD_ID,
														                     'i_Source_Card_Number',     object.SOURCE_WORK_CARD,
														                     'i_Contract_Group',         object.CONTRACT_GROUP,
														                     'i_Description',            object.DESCRIPTION.toUpperCase(),
														                     'i_Skill_Codes',            object.SKILL_CODES.join(";"),
														                     'i_Estimated_Times',        object.ESTIMATED_TIMES.join(";"),
														                     'i_Shop_Number',            object.SHOP_NUMBER,
														                     'i_Milestone',              object.MILESTONE,
														                     'i_Ata_Code',               object.ATA_CODE,
															                 'i_Task_Code',              object.TASK_CODE,
														                     'i_Zones',                  object.ZONES.join(','),
														                     'i_Component_Number',       object.COMPONENT_NUMBER,
														                     'i_Serial_Number',          object.SERIAL_NUMBER,
														                     'i_Flags',                  object.FLAGS.join(),
														                     'i_Field_List', 			'BILLABLE,AUTHORIZATION_TYPE,MILESTONE,AIRCRAFT_LOCATION,ATA_CODE,DESCRIPTION,CORRECTIVE_ACTION,SHOP_NUMBER,COMPONENT_NUMBER,SERIAL_NUMBER,TASK_CODE,ZONES,ACTION_EMPLOYEE_NUMBER,CONTRACT_GROUP,RII_FLAG,DII_FLAG,CPCP_FLAG,CDCCL_FLAG,ETOPS_FLAG,BUST_EXEMPTION_FLAG,LEAK_CHECK_FLAG,SDR_FLAG,STRUCTURAL_TASK_FLAG,ENGINE_RUN_FLAG',
														                     'i_Authorization_Type',     object.AUTHORIZATION_TYPE,
														                     'i_Aircraft_Location',      object.AIRCRAFT_LOCATION,
														                     'i_Corrective_Action',   	 object.CORRECTIVE_ACTION.toUpperCase(),
														                     'i_Planned_Start_Date',     object.PLANNED_START_DATE,
														                     'i_Planned_Finish_Date',    object.PLANNED_FINISH_DATE,
														                     'i_Parts',                  object.PART_NUMBERS.join(';'),
														                     'i_Card_Part_Ids',          object.PART_IDS.join(';'),
														                     'i_Part_Descriptions',      object.PART_DESCRIPTIONS.join(';'),
														                     'i_Part_Quantities',        object.PART_QUANTITIES.join(';'),
														                     'i_Part_Repair_Flags',      object.PART_REPAIR_FLAGS.join(';'),
														                     'i_Primary_Skill_Flags',         primaryFlags.join(';'),
														                     'i_Estimator_Comment',           object.ESTIMATOR_COMMENT,
														                     'i_Wip_Reason',                  object.STATUS_CODE,
														                     'i_Inspector_Number',            object.INSPECTOR_NUMBER,
																             'i_Inspector_Stamp_Number',      object.INSPECTOR_STAMP_NUMBER,
																             'i_Inspection_Date',             object.INSPECTION_DATE,
																             'i_Leak_Check_Inspector_Number', object.LEAK_CHECK_INSPECTOR_NUMBER, 
																             'i_Leak_Check_Inspection_Date',  object.LEAK_CHECK_INSPECTION_DATE, 
																             'i_Ops_Inspector_Stamp_Number',  object.OPS_INSPECTOR_STAMP_NUMBER,
																             'i_Mobile_User_Id',              object.MOBILE_USER_ID,
																             'o_Data',                        '');
	    	  }else if (object.OBJECT_TYPE == 'STEP'){
	    		  myBuilder = new StoredFuncProcBuilder("Mb_Apps.Do_Work_Card", 'i_Div_No',                     object.DIV_NO,
							 													 'i_Action',                    'VALIDATE-'+object.QUEUE_ACTION+'|'+object.QUEUE_ACTION,
																			  	 'i_What',					    'STEP',
																				 'i_Work_Card_Id',              object.CARD_ID,
																			     'i_Work_Card',                 '',
																				 'i_Mobile_Work_Card_Id',       object.MOBILE_CARD_ID,
																				 'i_Work_Order_Number',         object.CARD_WORK_ORDER_NUMBER,
																                 'i_Card_Step_Id',              object.ID,
																                 'i_Step_Sequence',			    object.STEP_SEQUENCE,
																                 'i_Type',                      'STEP',
																                 'i_Step_Number',               object.STEP_NUMBER,
																                 'i_Description',               object.DESCRIPTION,
																                 'i_Mechanic_Employee_Number',  object.MECHANIC_EMPLOYEE_NUMBER,
																                 'i_Mechanic_Signoff_Flag',     object.MECHANIC_SIGNOFF_FLAG,
																                 'i_Perform_Date',              object.PERFORM_DATE,
																                 'i_Inspector_Employee_Number', object.INSPECTOR_EMPLOYEE_NUMBER,
																                 'i_Inspector_Signoff_Flag',    object.INSPECTOR_SIGNOFF_FLAG,
																                 'i_Completion_Date',           object.COMPLETION_DATE,
																                 'i_Step_Action',               object.STEP_ACTION.toUpperCase(),
																                 'i_Active',                    'Y',
																                 'i_Mobile_User_Id',            object.MOBILE_USER_ID,
																	             'o_Data',                      '');
	    	  }else if (object.OBJECT_TYPE == 'REQUISITION'){
	    		  if (object.MOBILE_RECORD_ACTION == 'REQUEST'){
		    		  myBuilder = new StoredFuncProcBuilder("Mb_Apps.Do_Work_Card", 'i_Div_No',            object.DIV_NO,
															    				  	 'i_Action',           'REQUEST',
																				  	 'i_What',		       '',
																					 'i_Work_Card_Id',     object.CARD_ID,
																				     'i_Work_Card',        '',
																					 'i_Mobile_Work_Card_Id',   object.MOBILE_CARD_ID,
																					 'i_Employee_Number',  object.EMPLOYEE_NUMBER,
																					 'i_Quantity',         object.QUANTITY,
																					 'i_Order_Uom',        object.UOM,
																    				 'i_Part_Id',          object.PART_ID,
															                         'i_Part_Number',      object.PART_NUMBER,
															                         'i_Part_Description', object.DESCRIPTION,
															                         'i_Due_Date',         object.DUE_DATE,
														                             'i_Priority_Code',    object.PRIORITY_CODE,
														                             'i_Comment',          object.INTERNAL_COMMENT,
														                             'i_Aircraft_Location',object.AIRCRAFT_LOCATION,
														                             'i_Ipc_Reference',    object.IPC_REFERENCE,
														                             'i_Active',           'Y',
														                             'i_Mobile_User_Id',   object.MOBILE_USER_ID,
		    				  														 'o_Data',             '');
	    		  }else{
    	    		  var myBuilder = new StoredFuncProcBuilder("Mb_Apps.Do_Order_Line", 'i_Div_No',         object.DIV_NO,
                              															 'i_Action',         'VALIDATE-UNDO|UNDO',
                              															 'i_Order_Line_Id',  object.ORDER_LINE_ID,
                              															 'i_Mobile_User_Id', object.MOBILE_USER_ID,
                              															 'o_Data',           '');
	    		  }
	    	  }else if (object.OBJECT_TYPE == 'CLOCK'){
	    	      var myBuilder = new StoredFuncProcBuilder("Mb_Apps.Do_Time", 'i_Div_No',              object.DIV_NO,
                                                                               'i_Action',              object.QUEUE_ACTION,
                                                                               'i_Badge',               object.BADGE,
                                                                               'i_Work_Card',           object.WORK_CARD_NUMBER,
                                                                               'i_Work_Card_Id',        object.SERVER_PARENT_RECORD_ID,
                                                                               'i_Mobile_Work_Card_Id', object.MOBILE_PARENT_RECORD_ID,
                                                                               'i_Clock_Time',          object.CLOCK_TIME,
                                                                               'i_Authorized_By_Badge', object.AUTHORIZED_BY_BADGE,
                                                                               'i_Mobile_User_Id',      object.MOBILE_USER_ID,
                                                                               'o_Data',                '');
	    	  }
    	  
    	  builder = myBuilder.queryObject();
    	  return builder;
      }
      
      function SortPushList (alphaArr, betaArr) {
      	var i = 0;
      	var j = 0;
      	var k = 0;
      	var tempArr = [];
      	
      	while(i < alphaArr.length && j < betaArr.length){
      		if (alphaArr[i].QUEUE_RECORD_ID < betaArr[j].QUEUE_RECORD_ID){
      			tempArr[k] = alphaArr[i];
      			i++;
      		}else{
      			tempArr[k] = betaArr[j];
      			j++;
      		}
      		k++;
      	}
      	
      	while (i < alphaArr.length){
      		tempArr[k] = alphaArr[i];
      		i++;
      		k++;
      	}
      	
      	while (j < betaArr.length){
      		tempArr[k] = betaArr[j];
      		j++;
      		k++;
      	}
      	
      	return tempArr;
      }
      
      function SetFlags (Leak,Bust,Etops,Cdccl,Cpcp,Rii,Billable,Sdr,MajorRepair,MajorAlteration,PartsRequired){
          var flag = [];
      	  if (Leak == 'Y'){
      	      flag.push('LEAK');
      	  }
      	  if (Bust == 'Y'){
      		  flag.push('BUST');
      	  }
      	  if (Etops == 'Y'){
      		  flag.push('ETOPS');
      	  }
      	  if (Cdccl == 'Y'){
      		  flag.push('CDCCL');
      	  }
      	  if (Cpcp == 'Y'){
      		  flag.push('CPCP');
      	  }
      	  if (Rii == 'Y'){
      		  flag.push('RII');
      	  }
      	  if (Billable != 'Y'){
      	      flag.push('NONBILLABLE');
      	  }
      	  if (Sdr == 'Y'){
      		  flag.push('SDR');
      	  }
      	  if (MajorRepair == 'Y'){
    		  flag.push('MAJOR_REPAIR');
    	  }
      	  if (MajorAlteration == 'Y'){
    		  flag.push('MAJOR_ALTERATION');
    	  }
      	  if (PartsRequired == 'Y'){
    		  flag.push('PARTS_REQUIRED');
    	  }
      		  return flag;
      };
      
      function GetFlags () {
          var flags = [{
                  FLAG : 'NONBILLABLE',
                  DESCRIPTION : 'NON-BILLABLE FLAG'
              },{
                  FLAG : 'RII',
                  DESCRIPTION : 'RII FLAG'
              },{
                  FLAG : 'CPCP',
                  DESCRIPTION : 'CPCP FLAG'
              },{
                  FLAG : 'CDCCL',
                  DESCRIPTION : 'CDCCL FLAG'
              },{
                  FLAG : 'ETOPS',
                  DESCRIPTION : 'ETOPS FLAG'
              },{
                  FLAG : 'BUST',
                  DESCRIPTION : 'BUST FLAG'
              },{
                  FLAG : 'LEAK',
                  DESCRIPTION : 'LEAK FLAG'
              },{
                  FLAG : 'MAJOR_REPAIR',
                  DESCRIPTION : 'MAJOR REPAIR FLAG'
              },{
	              FLAG : 'SDR',
	              DESCRIPTION : 'SDR FLAG'
			  },{
			      FLAG : 'MAJOR_ALTERATION',
			      DESCRIPTION : 'MAJOR ALTERATION FLAG'
			  },{
				  FLAG : 'PARTS_REQUIRED',
				  DESCRIPTION : 'PARTS REQUIRED FLAG'
		      }];
          return flags;
      };
      
      function CompleteNumber (itemNumber){
          if (itemNumber.length < 4){
      	      var remaining = 4 - itemNumber.length
      		      while(remaining != 0){
      			      itemNumber = '0'+itemNumber;
      				  remaining--;
      			  }
      		  }
      	  return itemNumber;
      };
}]);