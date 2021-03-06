/*
Copyright (c) 2015 SONATA-NFV [, ANY ADDITIONAL AFFILIATION]
ALL RIGHTS RESERVED.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Neither the name of the SONATA-NFV [, ANY ADDITIONAL AFFILIATION]
nor the names of its contributors may be used to endorse or promote 
products derived from this software without specific prior written 
permission.

This work has been performed in the framework of the SONATA project,
funded by the European Commission under Grant number 671517 through 
the Horizon 2020 and 5G-PPP programmes. The authors would like to 
acknowledge the contributions of their colleagues of the SONATA 
partner consortium (www.sonata-nfv.eu).
*/

SonataApp.controller('KpisController',['$rootScope','$http','$scope',function($rootScope,$http,$scope){
            
            (function(w){w = w || window; var i = w.setInterval(function(){},100000); while(i>=0) { w.clearInterval(i--); }})(/*window*/);
    
    $scope.user_registrations = 5;
    $scope.packages = 12;
    $scope.kpis = [];

    
    


     $scope.getTotalVMs = function(){
            
           $http({
                method  : 'GET',
                url: $scope.apis.gatekeeper.kpis+'?name=vms_sum',
                headers : $rootScope.getGKHeaders()
              })
                .success(function(datas) {

                       $scope.total_vms = 0;
                       var groups = [];
                       var offsetobj = {};
                       $scope.vms_handlers = [];

                       datas.data.metrics.forEach(function(dat,index){
                            $scope.vms_handlers.push({                                           
                                    name: dat.labels.instance+":"+dat.labels.vim_tenant,
                                    y: parseInt(dat.value),
                                    drilldown: dat.labels.instance        
                                });                           
                            offsetobj[index] = dat.labels.instance+":"+dat.labels.vim_tenant;
                            $scope.total_vms+=parseInt(dat.value);
                            groups[index] = dat.value;
                        });
                        
                       
                        $("#sparkline_vms").sparkline(groups, {

                                tooltipValueLookups: {
                                'offset': offsetobj
                                },
                                type: 'pie',
                                height: '110px',                                
                                sliceColors: ['#2ca48c','#409c89','#1ab394', '#b3b3b3', '#e4f0fb'],
                                tooltipFormat: '<div class="jqsfield"><span style="color: white"></span>{{offset:offset}} : {{value}}</div>',
                        });

                })
    };

    $scope.getHttPTotals = function(){
            
            $http({
                method  : 'GET',
                url: $scope.apis.gatekeeper.kpis+'?name=http_requests_total',
                headers : $rootScope.getGKHeaders()
              })
                .success(function(datas) {
                        
                        
                       $scope.http_categories = [];
                       $scope.http_hndl = [];
                       $scope.http_handlers = [];
                       var offsetobj = {};
                       var groups = [];
                       $scope.total_http_requests = 0;

                       datas.data.metrics.forEach(function(dat,index){
                            $scope.http_handlers.push({                                           
                                    name: dat.labels.handler+":"+dat.labels.method+":"+dat.labels.code+" (#"+parseInt(dat.value)+")",
                                    y: parseInt(dat.value),
                                    drilldown: dat.labels.handler        
                                });                           
                            offsetobj[index] = ""+dat.labels.handler+":"+dat.labels.method+":"+dat.labels.code+" (#"+parseInt(dat.value)+")";
                            $scope.total_http_requests+=parseInt(dat.value);
                            groups[index] = dat.value;
                        });
                        
                        if($scope.total_http_requests>1000000000)
                            $scope.total_http_requests_text = parseFloat($scope.total_http_requests/1000000000).toFixed(2)+'B';
                        else if($scope.total_http_requests>1000000)
                            $scope.total_http_requests_text = parseFloat($scope.total_http_requests/1000000).toFixed(2)+'M';
                        else if($scope.total_http_requests>1000)
                            $scope.total_http_requests_text = parseFloat($scope.total_http_requests/1000).toFixed(2)+'K';
                        else
                            $scope.total_http_requests_text = $scope.total_http_requests;
                       

                       $("#sparkline_http_requests").sparkline(groups, {

                            type: 'bar',
                            barColor: '#1ab394',
                            barWidth:'9px',
                            tooltipFormat: '<div class="jqsfield"><span style="color: white"></span>{{offset:offset}} : {{value}}</div>',
                            tooltipValueLookups: {
                                'offset': offsetobj
                            }, 
                            height: "70px",                        
                            barwidth:"30px",
                            negBarColor: '#c6c6c6'
                        });
                })
    };

    

    $scope.getSyncRequestsBox = function(){
    
        $scope.sync_requests_kpi = {};
        $scope.sync_requests_kpi.api_name = 'synch_monitoring_data_requests';
        $scope.sync_requests_kpi.description = 'Synchronous monitoring data Requests';

        var start = new Date(new Date().getTime() - 10000*60000).toISOString();
        var end = new Date().toISOString();
        var step = '10m';
            $http({
                method  : 'GET',
                url: $scope.apis.gatekeeper.kpis+'?name=synch_monitoring_data_requests&start='+start+'&end='+end+'&step='+step,
                headers : $rootScope.getGKHeaders()
              })
               .success(function(datas) {
                
                    var max = 0;
                    var min = 0;
                    $scope.total_sync_requests = 0;

                    angular.forEach(datas.data.metrics,function(package,index){

                        if(package.labels.elapsed_time>max)
                            max=package.labels.elapsed_time;

                        if(package.labels.elapsed_time<min || min==0)
                            min=package.labels.elapsed_time;
                        
                        $scope.total_sync_requests+=parseFloat(package.value);

                    });
                    
                    var step = 0;
                    var groups=[0,0,0,0];
                    var offset = [];
                    
                    if(max>min){
                        step = (max-min)/4;   
                        offset[0]=parseFloat(min).toFixed(2)+"-"+parseFloat(parseFloat(min)+parseFloat(step)).toFixed(2);
                        offset[1]=parseFloat(parseFloat(min)+parseFloat(step)).toFixed(2)+"-"+parseFloat(parseFloat(min)+2*parseFloat(step)).toFixed(2);
                        offset[2]=parseFloat(parseFloat(min)+2*parseFloat(step)).toFixed(2)+"-"+parseFloat(parseFloat(min)+3*parseFloat(step)).toFixed(2);
                        offset[3]=parseFloat(parseFloat(min)+3*parseFloat(step)).toFixed(2)+"-"+parseFloat(parseFloat(min)+4*parseFloat(step)).toFixed(2);

                        angular.forEach(datas.data.metrics,function(package,index){
                            var elapsed_time = package.labels.elapsed_time;
                        
                            if(elapsed_time>=min && elapsed_time<(parseFloat(min)+parseFloat(step)))
                                groups[0]++;
                            else if(elapsed_time>=(parseFloat(min)+parseFloat(step)) && elapsed_time<(parseFloat(min)+2*parseFloat(step)))
                                groups[1]++;
                            else if(elapsed_time>=(parseFloat(min)+2*parseFloat(step)) && elapsed_time<(parseFloat(min)+3*parseFloat(step)))
                                groups[2]++;
                            else if(elapsed_time>=(parseFloat(min)+3*parseFloat(step)))
                                groups[3]++;                        

                        });

                    }
                   
                    $("#sparkline_sync_requests").sparkline(groups, {
                        type: 'bar',
                        barColor: '#1ab394',
                        barWidth:'9px',
                        tooltipFormat: '<div class="jqsfield"><span style="color: white">Elapsed time </span>{{offset:offset}}(sec) : {{value}}</div>',
                        tooltipValueLookups: {
                            'offset': {
                                0: offset[0],
                                1: offset[1],
                                2: offset[2],
                                3: offset[3]
                            }
                        }, 
                        height: "70px",                        
                        barwidth:"30px",
                        negBarColor: '#c6c6c6'
                    });
            });
    }

    $scope.getRegisteredUsersBox = function(){
    

        var start = new Date(new Date().getTime() - 10000*60000).toISOString();
        var end = new Date().toISOString();
        var step = '10m';
            $http({
                method  : 'GET',
                url: $scope.apis.gatekeeper.kpis+'?name=user_registrations&start='+start+'&end='+end+'&step='+step,
                headers : $rootScope.getGKHeaders()
              })
               .success(function(datas) {
                
                    var max = 0;
                    var min = 0;
                    $scope.total_registered_users = 0;

                    angular.forEach(datas.data.metrics,function(package,index){

                        if(package.labels.elapsed_time>max)
                            max=package.labels.elapsed_time;

                        if(package.labels.elapsed_time<min || min==0)
                            min=package.labels.elapsed_time;
                        
                        $scope.total_registered_users+=parseFloat(package.value);

                    });
                    
                    var step = 0;
                    var groups=[0,0,0,0];
                    var offset = [];
                    
                    if(max>min){
                        step = (max-min)/4;   
                        offset[0]=parseFloat(min).toFixed(2)+"-"+parseFloat(parseFloat(min)+parseFloat(step)).toFixed(2);
                        offset[1]=parseFloat(parseFloat(min)+parseFloat(step)).toFixed(2)+"-"+parseFloat(parseFloat(min)+2*parseFloat(step)).toFixed(2);
                        offset[2]=parseFloat(parseFloat(min)+2*parseFloat(step)).toFixed(2)+"-"+parseFloat(parseFloat(min)+3*parseFloat(step)).toFixed(2);
                        offset[3]=parseFloat(parseFloat(min)+3*parseFloat(step)).toFixed(2)+"-"+parseFloat(parseFloat(min)+4*parseFloat(step)).toFixed(2);

                        angular.forEach(datas.data.metrics,function(package,index){
                            var elapsed_time = package.labels.elapsed_time;
                        
                            if(elapsed_time>=min && elapsed_time<(parseFloat(min)+parseFloat(step)))
                                groups[0]++;
                            else if(elapsed_time>=(parseFloat(min)+parseFloat(step)) && elapsed_time<(parseFloat(min)+2*parseFloat(step)))
                                groups[1]++;
                            else if(elapsed_time>=(parseFloat(min)+2*parseFloat(step)) && elapsed_time<(parseFloat(min)+3*parseFloat(step)))
                                groups[2]++;
                            else if(elapsed_time>=(parseFloat(min)+3*parseFloat(step)))
                                groups[3]++;                        

                        });

                    }
                   
                    $("#sparkline_registered_users").sparkline(groups, {
                        type: 'bar',
                        barColor: '#1ab394',
                        barWidth:'9px',
                        tooltipFormat: '<div class="jqsfield"><span style="color: white">Elapsed time </span>{{offset:offset}}(sec) : {{value}}</div>',
                        tooltipValueLookups: {
                            'offset': {
                                0: offset[0],
                                1: offset[1],
                                2: offset[2],
                                3: offset[3]
                            }
                        }, 
                        height: "70px",                        
                        barwidth:"30px",
                        negBarColor: '#c6c6c6'
                    });
            });
    }


    $scope.getPackagesOnBoarding = function(){
    

        var start = new Date(new Date().getTime() - 10000*60000).toISOString();
        var end = new Date().toISOString();
        var step = '10m';
            $http({
                method  : 'GET',
                url: $scope.apis.gatekeeper.kpis+'?name=package_on_boardings&start='+start+'&end='+end+'&step='+step,
                headers : $rootScope.getGKHeaders()
              })
               .success(function(datas) {
                
                    var max = 0;
                    var min = 0;
                    $scope.total_packages_on_board = 0;
                    angular.forEach(datas.data.metrics,function(package,index){

                        if(package.labels.elapsed_time>max)
                            max=package.labels.elapsed_time;

                        if(package.labels.elapsed_time<min || min==0)
                            min=package.labels.elapsed_time;
                        
                        $scope.total_packages_on_board+=parseFloat(package.value);

                    });
                    var step = 0;
                    var groups=[0,0,0,0];
                    var offset = [];
                    
                    if(max>min){

                        step = (max-min)/4;   
                        offset[0]=parseFloat(min).toFixed(2)+"-"+parseFloat(parseFloat(min)+parseFloat(step)).toFixed(2);
                        offset[1]=parseFloat(parseFloat(min)+parseFloat(step)).toFixed(2)+"-"+parseFloat(parseFloat(min)+2*parseFloat(step)).toFixed(2);
                        offset[2]=parseFloat(parseFloat(min)+2*parseFloat(step)).toFixed(2)+"-"+parseFloat(parseFloat(min)+3*parseFloat(step)).toFixed(2);
                        offset[3]=parseFloat(parseFloat(min)+3*parseFloat(step)).toFixed(2)+"-"+parseFloat(parseFloat(min)+4*parseFloat(step)).toFixed(2);

                        angular.forEach(datas.data.metrics,function(package,index){
                            var elapsed_time = package.labels.elapsed_time;
                        
                            if(elapsed_time>=min && elapsed_time<(parseFloat(min)+parseFloat(step)))
                                groups[0]++;
                            else if(elapsed_time>=(parseFloat(min)+parseFloat(step)) && elapsed_time<(parseFloat(min)+2*parseFloat(step)))
                                groups[1]++;
                            else if(elapsed_time>=(parseFloat(min)+2*parseFloat(step)) && elapsed_time<(parseFloat(min)+3*parseFloat(step)))
                                groups[2]++;
                            else if(elapsed_time>=(parseFloat(min)+3*parseFloat(step)))
                                groups[3]++;                        

                        });

                    }
                    
                    $("#sparkline8").sparkline(groups, {
                        type: 'bar',
                        barColor: '#1ab394',
                        barWidth:'9px',
                        tooltipFormat: '<div class="jqsfield"><span style="color: white">Elapsed time </span>{{offset:offset}}(sec) : {{value}}</div>',
                        tooltipValueLookups: {
                            'offset': {
                                0: offset[0],
                                1: offset[1],
                                2: offset[2],
                                3: offset[3]
                            }
                        }, 
                        height: "70px",                        
                        barwidth:"30px",
                        negBarColor: '#c6c6c6'
                    });
            });
    }
    
    /*$scope.getSyncRequests = function(){    

        var start = new Date(new Date().getTime() - 10000*60000).toISOString();
        var end = new Date().toISOString();
        var step = '10m';
            $http({
                method  : 'GET',
                url: $scope.apis.gatekeeper.kpis+'?name=synch_monitoring_data_requests&start='+start+'&end='+end+'&step='+step,
                headers : $rootScope.getGKHeaders()
              })
                .success(function(datas) {
                    console.log("getSyncRequests");
                    console.log(datas);
                });
    }*/

    /*$scope.getVMSsum = function(){    

        var start = new Date(new Date().getTime() - 10000*60000).toISOString();
        var end = new Date().toISOString();
        var step = '10m';
            $http({
                method  : 'GET',
                url: $scope.apis.gatekeeper.kpis+'?name=vms_sum&start='+start+'&end='+end+'&step='+step,
                headers : $rootScope.getGKHeaders()
              })
                .success(function(datas) {
                    console.log("getVMS_sum");
                    console.log(datas);
                });
    }*/

   /* $scope.getHttpTotalRequests = function(){    

        var start = new Date(new Date().getTime() - 10000*60000).toISOString();
        var end = new Date().toISOString();
        var step = '10m';
            $http({
                method  : 'GET',
                url: $scope.apis.gatekeeper.kpis+'?name=http_requests_total&start='+start+'&end='+end+'&step='+step,
                headers : $rootScope.getGKHeaders()
              })
                .success(function(datas) {
                    console.log("getHttpTotalRequests");
                    console.log(datas);
                });
    }*/

    $scope.getRegisteredUsersBox();
    $scope.getSyncRequestsBox();
    $scope.getPackagesOnBoarding();
    /*$scope.getSyncRequests();*/
    /*$scope.getVMSsum();*/
    $scope.getHttPTotals();
    $scope.getTotalVMs();
    /*$scope.getHttpTotalRequests();*/


    

   

    
    
    

    $scope.getHttPTotalsDetails = function(){
        $('#modalhttps_details').openModal();

        Highcharts.chart('http_chart_container', {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Total number of HTTP requests made'
    },
    xAxis: {
         type: 'category'
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Requests',
            align: 'high'
        },
        labels: {
            overflow: 'justify'
        }
    },
    tooltip: {
        valueSuffix: ' '
    },
    plotOptions: {
        bar: {
            dataLabels: {
                enabled: true
            }
        }
    },
    legend: {
        enabled: false,    
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: -40,
        y: 80,
        floating: true,
        borderWidth: 1,
        backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
        shadow: true
    },
    credits: {
        enabled: false
    },
    series: [{
        name: 'Handlers',
        colorByPoint: true,
        data: $scope.http_handlers
    }]

});


    };

 
    $scope.getVMsDetails = function(){
        $('#modalvms_details').openModal();
        /*$scope.modal.title = $scope.vms_sum.description;*/
            
            $http({
                method  : 'GET',
                url: $scope.apis.gatekeeper.kpis+'?name=vms_state',
                headers : $rootScope.getGKHeaders()
            })
            .success(function(datas) {
            
                        

                        $scope.resl = datas.data.metrics;
                        $scope.selected_data_pie = [];
                        
                        $scope.ss_states = [];
                        if($scope.resl.length>0){

                            $scope.modal = {};
                            $scope.modal.title = "States of VMs";

                        $scope.resl.forEach(function(kpi,index){
                           
                            if($scope.ss_states.indexOf(kpi.labels.result)>=0){
                                var result = {};
                                    result = $scope.selected_data_pie.filter(function( obj ) {
                                
                                     if(obj.name==kpi.labels.state){
                                        return obj;
                                     }
                                        
                                });

                                result[0].y++;                               
                                

                            }else{
                                $scope.ss_states.push(kpi.labels.state);
                                
                                $scope.selected_data_pie.push({
                                    name:kpi.labels.state,
                                    y:parseInt(kpi.value),
                                    sliced: true
                                });
                                
                            }                            
                        });
                         }
                        
                            $scope.setResultChart('resultChartvms');                        
                       
                    });
        
    }

    $scope.getRegisteredUsersDetails = function(){
        $scope.kpi_timeline_data = [];
        var start = new Date(new Date().getTime() - 10000*60000).toISOString();
        var end = new Date().toISOString();
        var step = '10m';

            $scope.results_type = [];
            $scope.results =[];
            $scope.tags = [];
            $scope.modal = {};
            
            $('#modal1').openModal();
            $scope.modal.title = 'Registered Users';

            $http({
                method  : 'GET',
                url: $scope.apis.gatekeeper.kpis+'?name=user_registrations&start='+start+'&end='+end+'&step='+step,
                headers : $rootScope.getGKHeaders()
              })
                .success(function(datas) {
                        console.log(datas);
                        $scope.resl = datas.data.metrics;
                        $scope.selected_data_pie = [];
                        
                        $scope.ss_states = [];
                        if($scope.resl.length>0){

                            $scope.resl.forEach(function(kpi,index){
                                var x = new Date(kpi.labels.time_stamp);                           
                                $scope.kpi_timeline_data.push([x.getTime(), 1]);
                                
                                if($scope.ss_states.indexOf(kpi.labels.result)>=0){

                                    var result = {};
                                        result = $scope.selected_data_pie.filter(function( obj ) {
                                    
                                         if(obj.name==kpi.labels.result){
                                            return obj;
                                         }
                                            
                                    });

                                    result[0].y++;

                                }else{

                                    $scope.ss_states.push(kpi.labels.result);                                    
                                    $scope.selected_data_pie.push({
                                        name:kpi.labels.result,
                                        y:1,
                                        sliced: true
                                    });                                    
                                }                            
                            });

                        }                        
                        $scope.setResultChart('resultChart');                        
                       
                    });
    }
    $scope.getPackageOnBoardingDetails = function(){

        $scope.kpi_timeline_data = [];
        var start = new Date(new Date().getTime() - 10000*60000).toISOString();
        var end = new Date().toISOString();
        var step = '10m';

            $scope.results_type = [];
            $scope.results =[];
            $scope.tags = [];
            $scope.modal = {};
            
            $('#modal1').openModal();
            $scope.modal.title = 'Packages on boarding';

            $http({
                method  : 'GET',
                url: $scope.apis.gatekeeper.kpis+'?name=package_on_boardings&start='+start+'&end='+end+'&step='+step,
                headers : $rootScope.getGKHeaders()
              })
                .success(function(datas) {
                        
                        $scope.resl = datas.data.metrics;
                        $scope.selected_data_pie = [];
                        
                        $scope.ss_states = [];
                        if($scope.resl.length>0){

                            $scope.resl.forEach(function(kpi,index){
                                var x = new Date(kpi.labels.time_stamp);                           
                                $scope.kpi_timeline_data.push([x.getTime(), 1]);
                                
                                if($scope.ss_states.indexOf(kpi.labels.result)>=0){

                                    var result = {};
                                        result = $scope.selected_data_pie.filter(function( obj ) {
                                    
                                         if(obj.name==kpi.labels.result){
                                            return obj;
                                         }
                                            
                                    });

                                    result[0].y++;

                                }else{

                                    $scope.ss_states.push(kpi.labels.result);                                    
                                    $scope.selected_data_pie.push({
                                        name:kpi.labels.result,
                                        y:1,
                                        sliced: true
                                    });                                    
                                }                            
                            });

                        }                        
                        $scope.setResultChart('resultChart');                        
                       
                    });
    }

    $scope.getKPIDetails = function(kpi){
        $('#resultChart').html('');
        $scope.kpi_timeline_data = [];
        var start = new Date(new Date().getTime() - 10000*60000).toISOString();
        var end = new Date().toISOString();
        var step = '10m';

			$scope.results_type = [];
			$scope.results =[];
			$scope.tags = [];
			$scope.modal = {};
            
			$('#modal1').openModal();
			$scope.modal.title = kpi.description;

    		$http({
                method  : 'GET',
                url: $scope.apis.gatekeeper.kpis+'?name='+kpi.api_name+'&start='+start+'&end='+end+'&step='+step,
                headers : $rootScope.getGKHeaders()
              })
                .success(function(datas) {
                		
                        $('#modal1').closeModal();
                        $scope.resl = (datas.data.metrics?datas.data.metrics:[]);
                        $scope.selected_data_pie = [];
                        
                        $scope.ss_states = [];
                        if($scope.resl.length>0){


                        $scope.resl.forEach(function(kpi,index){
                            var x = new Date(kpi.labels.time_stamp);
                           
                            $scope.kpi_timeline_data.push([x.getTime(), 1]);
                        
                            if($scope.ss_states.indexOf(kpi.labels.result)>=0){
                                var result = {};
                                    result = $scope.selected_data_pie.filter(function( obj ) {
                                
                                     if(obj.name==kpi.labels.result){
                                        return obj;
                                     }
                                        
                                });

                                result[0].y++;
                                
                                

                            }else{
                                $scope.ss_states.push(kpi.labels.result);
                                
                                $scope.selected_data_pie.push({
                                    name:kpi.labels.result,
                                    y:1,
                                    sliced: true
                                });
                                
                            }                            
                        });
                         }
                        
                            $scope.setResultChart('resultChart');                        
                       
                	});

        
    }

        $scope.convertToDate = function(timest){

 			var timestamp = timest.toString();
                timestamp = timestamp.replace('.','');
                if(timestamp.length==12)
                            timestamp=timestamp+'0';
                    else if(timestamp.length==11)
                          timestamp = timestamp+'00';
                    else if(timestamp.length==10)
                          timestamp = timestamp+'000';
                    else if(timestamp.length==9)
                          timestamp = timestamp+'0000';
                    else if(timestamp.length==8)
                          timestamp = timestamp+'00000';
                timestamp = parseInt(timestamp);

        	return timestamp;
        }



$scope.setResultChart = function(where){
    

 Highcharts.chart(where, {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    title: {
        text: $scope.modal.title
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    credits: {
      enabled: false
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                style: {
                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                }
            }
        }
    },
    series: [{
        name: 'Results',
        colorByPoint: true,
        data: $scope.selected_data_pie
    }]
});  

var data = $scope.kpi_timeline_data;
//The following code is for testing purposes only.
/*if(data.length>4124114)
data = [
            [Date.UTC(2017, 1, 21), 0],
            [Date.UTC(2017, 2, 4), 1],
            [Date.UTC(2017, 2, 9), 1],
            [Date.UTC(2017, 2, 27), 1],
            [Date.UTC(2017, 3, 2), 1],
            [Date.UTC(2017, 3, 26), 2],
            [Date.UTC(2017, 4, 29), 3],
            [Date.UTC(2017, 5, 1), 3],
            [Date.UTC(2017, 5, 2), 4],
            [Date.UTC(2017, 5, 3), 5],
            [Date.UTC(2017, 5, 11), 5],
            [Date.UTC(2017, 5, 25), 6],
            [Date.UTC(2017, 6, 11), 7],
            [Date.UTC(2017, 6, 11), 7],
            [Date.UTC(2017, 6, 19), 8],
            [Date.UTC(2017, 6, 25), 8],
            [Date.UTC(2017, 6, 29), 8],
            [Date.UTC(2017, 6, 30), 9]
        ];*/
                Highcharts.chart('kpi_timeline', {
                              chart: {
                                  zoomType: 'x',
                              },
                              title: {
                                  text: 'ΤimeLine'
                              },
                              subtitle: {
                                  text: document.ontouchstart === undefined ?
                                          'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
                              },
                              xAxis: {
                                  type: 'datetime'
                              },
                              yAxis: {
                                  title: {
                                      text: ''
                                  }
                              },
                              legend: {
                                  enabled: false
                              },
                              credits: {
                                enabled: false
                              },
                              plotOptions: {
                                  area: {
                                      fillColor: {
                                          linearGradient: {
                                              x1: 0,
                                              y1: 0,
                                              x2: 0,
                                              y2: 1
                                          },
                                          stops: [
                                              [0, '#262B33'],
                                              [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                                          ]
                                      },
                                      marker: {
                                          radius: 2
                                      },
                                      lineWidth: 1,
                                      states: {
                                          hover: {
                                              lineWidth: 1
                                          }
                                      },
                                      threshold: null
                                  }
                              },
                            series: [{
                                name: $scope.modal.title,
                                data: data
                            }]                              
                          });





}

        




}]);