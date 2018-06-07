angular.module('WingsMobileStarter').controller('IC_M063', [
    '$scope',
    'WingsRemoteDbService',
    '$cordovaBarcodeScanner',
    'WingsUtil',
    'sy',
    'WingsDialogService',
    function($scope,WingsRemoteDbService,$cordovaBarcodeScanner,WingsUtil,sy,WingsDialogService) {
        console.log("IC_M063");
        $scope.IC_M063 = 
            {scheduleNumber:'',
             id:'',
             name:'',
             date:'',
             status:'',
             type:'',
             description:''
            };
        $rootScope.IC_0063_Schedule = null;
        $rootScope.IC_0063_lovs = {
                customersLov:[],
                programCodesLov:[],
                appStdsLov:[],
                conditionCodesLov:[],
        }
        WingsUtil.Focus('scheduleNumber');
        $scope.changedSchedule = function () {
            if(String($scope.IC_M063.scheduleNumberI).length == 4) {
                $scope.getScheduleId();
            }
        }
        $scope.getScheduleId = function () {
            var deferred = $q.defer();
            var divNo  = $rootScope.globals.currentUser.divNo;
            if (WingsUtil.IsNull($scope.IC_M063.scheduleNumberI)) {
                return false;
            }
            var sql = "Select Id,                  " +
                      "       Schedule_Number,     " +
                      "       Name,                " +
                      "       Schedule_Date,       " +
                      "       Status,              " +
                      "       Count_Type,          " +
                      "       Description          " +
                      "  From Ic_Count_Schedules_v " +
                      " Where Div_No="+divNo+
                      "  And Schedule_Number ="+$scope.IC_M063.scheduleNumberI+
                      "  And Status = 'OPEN'       ";
            var sqlArray = [{ queryStr: sql, queryType: "READ" }];
            var sqlString = JSON.stringify(sqlArray);
            WingsRemoteDbService.executeQuery(sqlString).then(function (dataIn) {
                var result = angular.fromJson(dataIn[0].rows);
                if (result.length) {
                    $scope.IC_M063.id = result[0].id;
                    $scope.IC_M063.scheduleNumber = Number(result[0].schedule_number);
                    $scope.IC_M063.name = result[0].name;
                    $scope.IC_M063.date = moment(result[0].schedule_date).format('YYYY-MM-DD');
                    $scope.IC_M063.status = result[0].status;
                    $scope.IC_M063.type = result[0].count_type;
                    $scope.IC_M063.description = result[0].description;
                } else {
                    $scope.reset();
                    WingsUtil.Focus('scheduleNumber');
                }
                return deferred.resolve("GOHEAD");
            }, function (error) {
                return deferred.reject("Login-Error : " +JSON.stringify(error));
            });
            return deferred.promise;
        };
        
        sy.GetTableRows("Select * From Ar_Customers Where Div_No = ? And Active = 'Y' Order By Customer_Number",[$rootScope.globals.currentUser.divNo]).then(function(result){
            var a = {
                    CUSTOMER_NUMBER:'-1',
                    CUSTOMER_NAME  :'NONE'
            }
            var customerArr = [];
            customerArr.push(a);
            customerArr = customerArr.concat(result);
            $rootScope.IC_0063_lovs.customersLov = customerArr;
        });
        
        sy.GetTableRows("Select * From Ic_Program_Codes Where Div_No = ? And Active = 'Y' Order By Program_Code",[$rootScope.globals.currentUser.divNo]).then(function(result){
            var programCodesArr = result;
            $rootScope.IC_0063_lovs.programCodesLov =  programCodesArr;
        });
        
        
        sy.GetTableRows("Select * From Qa_Certifying_Agencies Where Div_No = ? And Active = 'Y' Order By Certifying_Agencies",[$rootScope.globals.currentUser.divNo]).then(function(result){
            var appStdArr = result;
            $rootScope.IC_0063_lovs.appStdsLov =  appStdArr;
        });
        
        sy.GetTableRows("Select * From Ic_Condition_Codes Where Div_No = ? And Active = 'Y' Order By Condition_Code",[$rootScope.globals.currentUser.divNo]).then(function(result){
            var conditionCodeArr = result;
            $rootScope.IC_0063_lovs.conditionCodesLov =  conditionCodeArr;
        });
        
        $scope.forwardLocations = function () {
            //This shit not working without timeout
            if (!WingsUtil.IsNull($scope.IC_M063.id)) {
                $rootScope.IC_0063_Schedule = $scope.IC_M063; 
                $state.go('app.IC_M063_Locations');
            } else {
                WingsDialogService.error('Please enter a valid schedule number.');
            } 
        }
        
        $scope.reset = function(){
            $scope.IC_M063 = 
            {scheduleNumber:'',
             id:'',
             name:'',
             date:'',
             status:'',
             type:'',
             description:''
            };
        };
    } 
])