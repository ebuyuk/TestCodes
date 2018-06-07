angular.module('WingsMobileStarter').controller('SY_M003', [
        '$scope',
        '$cordovaCamera',
        '$ionicPopover',
        '$ionicPopup',
        'WingsDialogService',
        '$timeout',
        '$cordovaImagePicker',
        '$ionicHistory',
        '$q',
        'WingsUtil',
        '$stateParams',
        function($scope,$cordovaCamera,$ionicPopover,$ionicPopup,WingsDialogService,$timeout,$cordovaImagePicker,$ionicHistory,$q,WingsUtil,$stateParams) {
            console.log('SY_M003');
            // advanced 
            $scope.buttonClass = '';
    		$scope.logicOp = '';
    		$scope.relationOp = '';
    		$scope.notOp = '';
    		$scope.tempCondition = '';
    		$scope.primaryColumn = '';
    		$scope.secondaryColumn = '';
    		$scope.advancedQuery = '';
    		$rootScope.globals.queryDesigner.query = '';
            $scope.basicQuery = '';
            $scope.advancedMode = false;
            $scope.columnList = [];
            $scope.stateName = $rootScope.globals.queryDesigner.stateName;
            $scope.opList = [{NAME:'='},{NAME:'!='},{NAME:'>'},{NAME:'<'}];
            $scope.tempColumns = [];
    		//$scope.advancedMode = false;
    		$scope.mode = 'Basic';
    		$scope.nextMode = 'Advanced';
    		$scope.fetchColumns = function(tableName){
    			var sql = "PRAGMA table_info("+tableName+")";
            	WingsTransactionDBService.executeSql(sql).then(function (result){
            		
            		for(i=0; i<result.length; i++){
            			if(!(result[i].name.indexOf('ID') > -1 || result[i].name.indexOf('MOBILE') > -1)){
            		        if(result[i].type == 'INTEGER'){
            		            $scope.columnList.push({Name: result[i].name,RelationalOp: '',Condition: '', Type: 'NUMBER'});
            		        }else{
            		    	    if(result[i].name.indexOf('DATE') > -1){
            		    	        $scope.columnList.push({Name: result[i].name,RelationalOp: '',Condition: '', Type: 'DATE'});	
            		    	    }else{
            		    	        $scope.columnList.push({Name: result[i].name,RelationalOp: '',Condition: '', Type: 'STRING'});	
            		    	    }
            		        }
            		    }
            		}
                          debugger;              	
                }, function (error) {
                    console.log(JSON.stringify(error));
                }); 
    		};
    		if(!WingsUtil.IsNull($rootScope.globals.queryDesigner.columnList)){
    			$scope.columnList = $rootScope.globals.queryDesigner.columnList;
    		}else{
    			$scope.fetchColumns($rootScope.globals.queryDesigner.tableName);
    		}
    		
    		if (window.innerWidth < 500) {
    	    	$scope.buttonClass = 'button-small';	
    	    }
    		
    		$scope.logicButtons = {
    				AND : false,
    				OR  : false,
    				NOT : false
    		};
    		$scope.relationButtons = {
    				EQUAL: false,
    				NOTEQUAL : false,
    				GREATER : false,
    				GREATEROREQUAL: false,
    				LESSER : false,
    				LESSEROREQUAL :false,
    				IN : false,
    				LIKE : false				
    		};

    		
    		$scope.toggleNotButton = function (){
    			$scope.logicButtons.NOT = !$scope.logicButtons.NOT;
    			if($scope.logicButtons.NOT){
    				$scope.notOp = ' NOT';
    			}else{
    				$scope.notOp = '';
    			}
    		};
    		$scope.clearLogicButtons = function(){
    			$scope.logicOp = '';
    			$scope.notOp = '';
    			$scope.logicButtons.AND = false;
    			$scope.logicButtons.OR = false;
    		};
    		$scope.setLogic = function (value){
    			$scope.clearLogicButtons();
    			$scope.logicOp = value;
    		};
    		$scope.clearRelationButtons = function(){
    			$scope.relationOp = '';
    			$scope.relationButtons.EQUAL= false;
    			$scope.relationButtons.NOTEQUAL = false;
    			$scope.relationButtons.GREATER = false;
    			$scope.relationButtons.GREATEROREQUAL= false;
    			$scope.relationButtons.LESSER = false;
    			$scope.relationButtons.LESSEROREQUAL =false;
    			$scope.relationButtons.IN = false;
    			$scope.relationButtons.LIKE = false;
    		};
    		
    		$scope.clearAll = function (){
    			$scope.clearRelationButtons();
    			$scope.clearLogicButtons();
    			$scope.logicButtons.NOT = false; 
    			$scope.primaryColumn = '';
    			$scope.secondaryColumn ='';
    			$scope.tempCondition = '';
            	document.getElementById("tempCon").value = '';
            	document.getElementById("primaryColumn").value = "string:";
            //	document.getElementById("primaryColumn").selectedIndex = 0;
            	document.getElementById("secondaryColumn").value =  "string:";
            //	document.getElementById("primaryColumn").selectedIndex = 0;
    		};
    		$scope.setRelation = function (value){
    			$scope.clearRelationButtons();
    			$scope.relationOp = value;
    		};
    		generateInValues = function(value,columnName){
    			debugger;
    			type = findColumnType(columnName);
    			if(value.indexOf(',') < 0){
    				return "( "+formatValue(columnName,value,type)+" )";
    				
    			}else{
    				valueList = value.split(',');
    				if(type == 'DATE'){
    					tempVar = '';
                		for(i=0; i<valueList.length; i++){
                			tempVar = tempVar +" date('" +valueList[i]+"'),";
                		}
                		return "("+tempVar.substring(0,tempVar.length-1)+" )";
                	}else if (type == 'NUMBER'){
                		return  "( "+valueList.join(",")+" )";
                	}else{
                		return  "( '"+valueList.join("','")+"' )";
                	}
    			}
    		};
    		findColumnType = function(columnName){
    			for(i=0; i<$scope.columnList.length; i++){
    				if($scope.columnList[i].Name == columnName.toString()){
    					return $scope.columnList[i].Type;
    				}
    			}
    			return '';
    		};
    		formatValue = function (columnName, condition, type){
    			debugger;
                if(type){
                	if(type == 'DATE'){
                		return "date('"+condition+"')";
                	}else if (type == 'NUMBER'){
                		return condition;
                	}else{
                		return "'"+condition+"'";
                	}
                }else{
                	return formatValue(columnName,condition,findColumnType(columnName));
                }
    		};
    		generateRelation = function(){
    			if (!WingsUtil.IsNull($scope.relationOp)){
    				if(!WingsUtil.IsNull($scope.secondaryColumn)){
    					if($scope.relationButtons.IN){
    						if(!WingsUtil.IsNull($scope.tempCondition)){
    							return "("+ $scope.primaryColumn+" "+$scope.relationOp+" "+generateInValues($scope.tempCondition,$scope.primaryColumn) +")";
    						}else{
    							WingsDialogService.error('Please fill condition value');
    							return 'error';
    						}
    					}else{
    						return "("+ $scope.primaryColumn+" "+$scope.relationOp +" "+$scope.secondaryColumn+")";
    					}
    				}else{
    					if(!WingsUtil.IsNull($scope.tempCondition)){
    						if($scope.relationButtons.IN){
    							return "("+ $scope.primaryColumn+" "+$scope.relationOp+" "+generateInValues($scope.tempCondition,$scope.primaryColumn) +")";
    						}else if($scope.relationButtons.LIKE){
    							return "("+ $scope.primaryColumn+" "+$scope.relationOp +" '%"+$scope.tempCondition+"%')";
    						}
    						else{
    							return "("+ $scope.primaryColumn+" "+$scope.relationOp +" "+formatValue($scope.primaryColumn,$scope.tempCondition)+")";
    						}
    					}else{
    						if($scope.relationButtons.EQUAL){
    							return "("+ $scope.primaryColumn+" Is Null)";
    						}else if ($scope.relationButtons.NOTEQUAL){
    							return "("+ $scope.primaryColumn+" Is Not Null)";
    						}else{
    						WingsDialogService.error('Please fill condition value or select second column');
    						return 'error';
    						}
    					}
    				}
    			}else{
    				WingsDialogService.error('Please select relational operator');
    				return 'error';
    			}
    		};
    		$scope.addCondition = function (){
    			
    			// hepsiniburda alıcaz set edıcez baslamadan ; on change de değil
    			$scope.tempCondition = document.getElementById("tempCon").value;
    			$scope.advancedQuery = document.getElementById("advancedQuery").value;
    			$scope.primaryColumn = document.getElementById("primaryColumn").value.replace("string:", "");;
    			$scope.secondaryColumn = document.getElementById("secondaryColumn").value.replace("string:", "");;
    			//debugger;
    			if (!WingsUtil.IsNull($scope.primaryColumn)){
    				if(!WingsUtil.IsNull($scope.advancedQuery)){
    					if(!WingsUtil.IsNull($scope.logicOp)){
    					    result = generateRelation();
    						if(result != 'error'){
    							$scope.advancedQuery += "\n"+$scope.logicOp+$scope.notOp+ result;
    							document.getElementById("advancedQuery").value = $scope.advancedQuery;
    							$scope.clearAll();
    						}else{
    							 

    						}
    					}else{
    						WingsDialogService.error('Please select logical operator');	
    						 
    					}
    				}else{
    					result = generateRelation();
    					if(result != 'error'){
    						$scope.advancedQuery += $scope.notOp+result;
    						document.getElementById("advancedQuery").value = $scope.advancedQuery;
    						$scope.clearAll();
    					}else{
    						 
    					}
    				}
    			}else{
    				WingsDialogService.error('Please select field first');
    				 
    			}
    		};
    		// advanced and
            // send object on ng-change find index of object then modify it
            
            $scope.passQuery = function(){
            	if($scope.mode == 'Basic'){
            		$scope.generateBasicQuery();
            		if(!WingsUtil.IsNull($scope.basicQuery)){
            			$rootScope.globals.queryDesigner.query =  $scope.basicQuery.toUpperCase();
            		}else{
            			$rootScope.globals.queryDesigner.query =  '(Null is Null)';
            		}
            	}else{
            		if(!WingsUtil.IsNull($scope.advancedQuery)){
            		$rootScope.globals.queryDesigner.query =  $scope.advancedQuery.toUpperCase();
            		}else{
            			$rootScope.globals.queryDesigner.query =  '(Null is Null)';
            		}
            	}
                $rootScope.globals.queryDesigner.columnList = [];
                $rootScope.globals.queryDesigner.stateName = '';
                $rootScope.globals.queryDesigner.tableName = '';
                if(WingsUtil.IsNull($scope.basicQuery) && WingsUtil.IsNull($scope.advancedQuery)){
                	WingsDialogService.confirm('Query may take long time without criteria. Do you want to continue?','Confirm','OK,Cancel').then(function(buttonIndex) {
                        if (buttonIndex == 1) {
                        	$ionicHistory.goBack();
                        }
                    });
                }else{
                $ionicHistory.goBack();
                }
            };
            
            $scope.changeMode = function(){
            	//$scope.advancedMode = !$scope.advancedMode;
            	if($scope.mode == 'Basic'){
            		$scope.mode = 'Advanced';
            		$scope.nextMode = 'Basic';
            	}else{
            		$scope.mode = 'Basic';
            		$scope.nextMode = 'Advanced';
            	}
            };
            //
            $scope.addColumn = function(){
            	$scope.tempColumns.push({Name: '',
                    			  RelationalOp:'',
                    			  Condition: '',
                    			  Type: ''});
            };
            //
            
            $scope.generateBasicQuery = function(){
            	for(i=0; i<$scope.columnList.length; i++){
            		if(!(WingsUtil.IsNull($scope.columnList[i].Condition) || WingsUtil.IsNull($scope.columnList[i].RelationalOp))){
            			if(!WingsUtil.IsNull($scope.basicQuery)){
            				xtempCondition = "\n OR ("+ $scope.columnList[i].Name +" "+ $scope.columnList[i].RelationalOp+" "+
            				                 formatValue($scope.columnList[i].Name,$scope.columnList[i].Condition,$scope.columnList[i].Type)+")";
            				$scope.basicQuery += xtempCondition;
            			}else{
            				$scope.basicQuery = "("+ $scope.columnList[i].Name +" "+ $scope.columnList[i].RelationalOp+" "+
            				                    formatValue($scope.columnList[i].Name,$scope.columnList[i].Condition,$scope.columnList[i].Type)+")";
            			}
            		}
            	}
            	
            	for(i=0; i<$scope.tempColumns.length; i++){
            		debugger;
            		if(!(WingsUtil.IsNull($scope.tempColumns[i].Condition) || WingsUtil.IsNull($scope.tempColumns[i].RelationalOp))){
            			if(!WingsUtil.IsNull($scope.basicQuery)){
            				xtempCondition = "\n OR ("+ $scope.tempColumns[i].Name +" "+ $scope.tempColumns[i].RelationalOp+" "+
            				                 formatValue($scope.tempColumns[i].Name,$scope.tempColumns[i].Condition)+")";
            				$scope.basicQuery += xtempCondition;
            			}else{
            				$scope.basicQuery = "("+ $scope.tempColumns[i].Name +" "+ $scope.tempColumns[i].RelationalOp+" "+
            				                    formatValue($scope.tempColumns[i].Name,$scope.tempColumns[i].Condition)+")";
            			}
            		}
            	}
            	debugger;
            }
            
        } 
])