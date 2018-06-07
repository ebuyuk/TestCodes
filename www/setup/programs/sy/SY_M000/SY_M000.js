angular.module('WingsMobileStarter').controller('SY_M000', [
        '$scope','WingsConfigurationDBService','WingsTransactionDBService','WingsDialogService','WingsRemoteDbService',
        '$cordovaFileTransfer','$ionicModal','md5','WingsSocketService','WingsPouchDbSetupService','sy','$sce',
        function($scope,WingsConfigurationDBService,WingsTransactionDBService,WingsDialogService,WingsRemoteDbService,
        		$cordovaFileTransfer,$ionicModal,md5,WingsSocketService,WingsPouchDbSetupService,sy,$sce) {
            //console.log(md5.createHash("value").toUpperCase());
            sy.DeleteRecords();
           /* $scope.htmlString = $sce.trustAsHtml("<b>Html</b><button>Bind</button>");
            
            $scope.security = [{
            	id :'test02',
                attribute: 'visible',
                value: true
              },
              {
            	 id  : 'test01',
            	 attribute:'innerText',
            	 value:"'engin'"
              },
              {
             	 id  : 'test01',
             	 attribute:'style' ,
             	 value:"color:red,font-style:italic"
               },
              {
             	 id  : 'test05',
             	 attribute: 'visible',
                 value: false
               },
               {
            	   
              	 id  : 'test04',
              	 attribute:'innerHtml' ,
              	 value: "<b>Html</b><button>Bind</button><span style=\"color:green\">Test</span>"
                }];
            

            $scope.trustAsHtml = function(string) {
                return $sce.trustAsHtml(string);
            };
        	/*window.chartColors = {
        			red: 'rgb(255, 99, 132)',
        			orange: 'rgb(255, 159, 64)',
        			yellow: 'rgb(255, 205, 86)',
        			green: 'rgb(75, 192, 192)',
        			blue: 'rgb(54, 162, 235)',
        			purple: 'rgb(153, 102, 255)',
        			grey: 'rgb(201, 203, 207)'
        		};
        	var randomScalingFactor = function() {
    			return Math.round(Math.random() * 100);
    		};

    		var config = {
    			type: 'doughnut',
    			data: {
    				datasets: [{
    					data: [
    						randomScalingFactor(),
    						randomScalingFactor(),
    						randomScalingFactor(),
    						randomScalingFactor(),
    						randomScalingFactor(),
    					],
    					backgroundColor: [
    						window.chartColors.red,
    						window.chartColors.orange,
    						window.chartColors.yellow,
    						window.chartColors.green,
    						window.chartColors.blue,
    					],
    					label: 'Dataset 1'
    				}],
    				labels: [
    					'Red',
    					'Orange',
    					'Yellow',
    					'Green',
    					'Blue'
    				]
    			},
    			options: {
    				responsive: true,
    				legend: {
    					position: 'top',
    				},
    				title: {
    					display: true,
    					text: 'Chart.js Doughnut Chart'
    				},
    				animation: {
    					animateScale: true,
    					animateRotate: true
    				}
    			}
    		};
        	
			var ctx = document.getElementById('chart-area').getContext('2d');
			window.myDoughnut = new Chart(ctx, config);
        	
        	
			var colorNames = Object.keys(window.chartColors);

			$scope.addDataset = function () {
				var newDataset = {
					backgroundColor: [],
					data: [],
					label: 'New dataset ' + config.data.datasets.length,
				};

				for (var index = 0; index < config.data.labels.length; ++index) {
					newDataset.data.push(randomScalingFactor());

					var colorName = colorNames[index % colorNames.length];
					var newColor = window.chartColors[colorName];
					newDataset.backgroundColor.push(newColor);
				}

				config.data.datasets.push(newDataset);
				window.myDoughnut.update();
			};
        	
        	
			var barChartData = {
					labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
					datasets: [{
						label: 'Dataset 1',
						backgroundColor: [
							window.chartColors.red,
							window.chartColors.orange,
							window.chartColors.yellow,
							window.chartColors.green,
							window.chartColors.blue,
							window.chartColors.purple,
							window.chartColors.red
						],
						yAxisID: 'y-axis-1',
						data: [
							randomScalingFactor(),
							randomScalingFactor(),
							randomScalingFactor(),
							randomScalingFactor(),
							randomScalingFactor(),
							randomScalingFactor(),
							randomScalingFactor()
						]
					}, {
						label: 'Dataset 2',
						backgroundColor: window.chartColors.grey,
						yAxisID: 'y-axis-2',
						data: [
							randomScalingFactor(),
							randomScalingFactor(),
							randomScalingFactor(),
							randomScalingFactor(),
							randomScalingFactor(),
							randomScalingFactor(),
							randomScalingFactor()
						]
					}]

				};
        	
			var ctx2 = document.getElementById('bar-area').getContext('2d');
			window.myBar = new Chart(ctx2, {
				type: 'bar',
				data: barChartData,
				options: {
					responsive: true,
					title: {
						display: true,
						text: 'Chart.js Bar Chart - Multi Axis'
					},
					tooltips: {
						mode: 'index',
						intersect: true
					},
					scales: {
						yAxes: [{
							type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
							display: true,
							position: 'left',
							id: 'y-axis-1',
						}, {
							type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
							display: true,
							position: 'right',
							id: 'y-axis-2',
							gridLines: {
								drawOnChartArea: false
							}
						}],
					}
				}
			});
        	
        	
        	
        	
        	
        	*/
        	
        	
        	$scope.messageList = [];
        	
        	var criteria ={
            		  selector: {name:  {
          		      "$gt": null
          		    }},
          		  fields: ['_id', 'name','type','trainer','gender','owned'],
          		  sort: ['name']
          	};
             
		    $scope.service = {
		        choice:'transaction',
		        sql:''
		    };
		    $scope.result={};
		    var header =[];
		    // UPLOAD
		    $scope.uploadDB = function () {
				 var options = {
						  fileName: "test01.jpg",
		                  chunkedMode: true,
		                  mimeType: "image/jpg",
		                  params :{
		                      userId:$rootScope.globals.currentUser.userId,
		                      deviceId: $rootScope.globals.deviceInformation.uuid
		                  }
		              };
				 $cordovaFileTransfer.upload(WINGS_CONFIG.MEDIATOR_URL+"/fileservice/exportDb", $rootScope.globals.wingsTransactionDB.dupFilePath+$rootScope.globals.wingsTransactionDB.name,options).then(function(result) {
                    console.log("SUCCESS: " + JSON.stringify(result.response));
                    //TODO Success message
                }, function(err) {
                    console.log("ERROR: " + JSON.stringify(err));
                  //TODO Error message / Retry
                }, function (progress) {
                    // constant progress updates
                });
			}
		    $scope.upload = function() {
		           var options = {
		               fileKey: "WingsTransaction",
		               fileName: "WingsTransaction.db",
		               chunkedMode: false,
		               mimeType: "application/x-sqlite3"
		           };
		          /* var options = {
		              
		            };*/
		           
		           var fileName = cordova.file.applicationStorageDirectory+"databases/WingsTransaction.db"; // cordova.file.applicationStorageDirectory+"databases/" : Android
		            
		           $cordovaFileTransfer.upload("http://192.168.2.127:8080/WingsMobileMediator/webresources/fileservice/upload", fileName, options).then(function(result) {
		               console.log("SUCCESS: " + JSON.stringify(result.response));
		           }, function(err) {
		               console.log("ERROR: " + JSON.stringify(err));
		           }, function (progress) {
		               // constant progress updates
		           });
		      };
		    // UPLOAD
		    $scope.history = [ 'delete from mm_scheduled_ground_times',
		    	               'delete from mm_flights' ,
		    		           'delete from mm_flight_consumptions',
		    		           'delete from mm_flight_crews',
		    		           'delete from mm_flight_inspections',
		    		           'delete from mm_scheduled_flights',
		    		           'delete from mm_discrepancies',
		    		           'delete from mm_packages',
		    		           'delete from gn_form_Columns',
		    		           'delete from gn_form_data',
		                      'Select * from mm_flights',
		                      'Select * from mm_discrepancies',
		                      'Select * from MM_Flight_consumptions',
		                      'Select * from gn_message_items'];
		    $scope.Execute = function () {
		      
		        /*WingsPouchDbSetupService.findDocuments(criteria).then(function (result) {
	                  // yo, a result
	                     console.log("**********************************findDocument result : " +JSON.stringify(result));
	                     $scope.messageList=result.docs;
	                }).catch(function (err) {
	                  // ouch, an error
	                     console.log("**********************************findDocument err : " +JSON.stringify(err));
	                });*/
		        
		          var sql = $scope.service.sql;
		        $scope.history.push(sql);
		        if($scope.service.choice == 'transaction') {
		            WingsTransactionDBService.executeSql(sql).then(function (result){
		                console.log('SY_M000 Transaction Query Result: '+JSON.stringify(result));
                        $scope.result = result;
                        for(var obj in result){
                            if(result.hasOwnProperty(obj)){
                                for(var prop in result[obj]){
                                    if(result[obj].hasOwnProperty(prop)){
                                        if(!header.includes(prop)) {
                                            header.push(prop);
                                        }
                                    }
                                }
                            }
                        }
                        $scope.headers = header;
		             }, function (error) {
		                 console.log('MM_0100 - AcceptDiscrepancy - ERROR'+JSON.stringify(error));
		             });  
		        }else if ($scope.service.choice == 'config') {
		        	WingsConfigurationDBService.executeSql(sql).then(function (result){
                        console.log('SY_M000 Setup Query Result: '+JSON.stringify(result));
                        $scope.result = result;
                        for(var obj in result){
                            if(result.hasOwnProperty(obj)){
                                for(var prop in result[obj]){
                                    if(result[obj].hasOwnProperty(prop)){
                                        if(!header.includes(prop)) {
                                            header.push(prop);
                                        }
                                    }
                                }
                            }
                        }
                        $scope.headers = header;
	                }, function (error) {
	                    console.log(JSON.stringify(error));
	                });
		        } else {
		            WingsRemoteDbService.executeQuery(sql).then(function (dataInMenu) {
	                    var jsonObj = JSON.parse(dataInMenu.rows);
                        console.log('SY_M000 Remote Query Result: '+JSON.stringify(jsonObj));
	                }, function (response) {
	                    console.log("ERROR " + response.status +" MESSAGE : "+response.message);
	                });
		        }
		        
	               return deferred.promise;
		    };
		} 
])