////////////////////////////////
// App : Reports
// Owner  : Gihan Herath
// Last changed date : 2017/06/10
// Version : 6.1.0.6
// Modified By : Kasun
/////////////////////////////////
(function ()
{
    'use strict';

    angular
        .module('app.report', [])
        .config(config)
        .filter('parseDate',parseDateFilter)
        //.directive('datepicker',datePickerDirective)
        //.constant('configReport',{
        //      appName: 'diginReportViwer',
        //      apiTomcatBase: '/services/duosoftware.commonAPI/apiTomcatBase/',
        //      Digin_Engine_API: '/services/duosoftware.commonAPI/Digin_Engine_API/',
        //      Digin_Domain: 'digin.cloudcharge.com',
        //      storeIndex: 'com.duosoftware.com'
        //})
        //http://dev.cloudcharge.com
        //.constant('configReport',{
        //    appName: 'diginReportViwer',
        //    apiTomcatBase: 'http://digin.cloudcharge.com:9897/',
        //    Digin_Engine_API: 'http://digin.cloudcharge.com:1929/',
        //    Digin_Domain: 'digin.cloudcharge.com',
        //    storeIndex: 'com.duosoftware.com'
        //})
        //.run(runFunction);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, $sceDelegateProvider, msApiProvider, mesentitlementProvider, msNavigationServiceProvider, $mdDateLocaleProvider)
    {

        mesentitlementProvider.setStateCheck("report");

        $stateProvider
            .state('app.report', {
                url    : '/report',
                views  : {
                    'report@app': {
                        templateUrl: 'app/main/reports/report.html',
                        controller : 'ReportController as vm'
                    }
                },
                resolve: {
					security: ['$q','mesentitlement','$timeout','$rootScope','$state','$location', function($q,mesentitlement,$timeout,$rootScope,$state, $location){
						return $q(function(resolve, reject) {
							$timeout(function() {
								if ($rootScope.isBaseSet2) {
									resolve(function () {
										var entitledStatesReturn = mesentitlement.stateDepResolver('report');

										mesentitlementProvider.setStateCheck("report");

										if(entitledStatesReturn !== true){
											return $q.reject("unauthorized");
										}
									});
								} else {
									return $location.path('/guide');
								}
							});
						});
                    }]
                },
                bodyClass: 'report'
            });

        //Api
        msApiProvider.register('cc_invoice.invoices', ['app/data/cc_invoice/invoices.json']);

        // Navigation

        msNavigationServiceProvider.saveItem('report', {
            title    : 'reports',
            state    : 'app.report',
            weight   : 8
        });

        $mdDateLocaleProvider.formatDate = function(date) {
          return moment(date).format('YYYY-MM-DD');
        };

        $sceDelegateProvider.resourceUrlWhitelist([
          // Allow same origin resource loads.
          "self",
          // Allow loading from Google maps
          "http://azure.cloudcharge.com/services/reports**",

          "http://app.cloudcharge.com/services/reports**",

          "https://cloudcharge.com/services/reports**"
        ]);

    }

    function parseDateFilter(){
        return function(input){
            return new Date(input);
        };
    }

    //function configFunction(){
    //
    //  return
    //  {
    //    appName: 'diginReportViwer'
    //    apiTomcatBase: 'http://digin.cloudcharge.com:9897/'
    //    Digin_Engine_API: 'http://digin.cloudcharge.com:1929/'
    //    Digin_Domain: 'digin.cloudcharge.com'
    //    storeIndex: 'com.duosoftware.com'
    //  };
    //}

  function runFunction(configReport,dynamicallyReportSrv,$rootScope){
    //debugger;
    //var appName='diginReportViwer';
    //var apiTomcatBase='http://digin.cloudcharge.com:9897/';
    //var Digin_Engine_API='http://digin.cloudcharge.com:1929/';
    //var Digin_Domain= 'digin.cloudcharge.com';
    //var storeIndex= 'com.duosoftware.com';
    //var config=configFunction();
    //debugger;
    var reqParameter = {
      apiBase: configReport.Digin_Engine_API,
      _st: "8298aa106590a6329df1a35032e687cd"
    };
    //debugger;
    var nameEQ = "securityToken=";
    var ca = document.cookie.split(';');
    ////get the tenant security token
    //debugger;
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0){
            reqParameter._st = c.substring(nameEQ.length, c.length);
        }
    }
    $rootScope.userStatus = false;
    //Find if tenant has logged in
    dynamicallyReportSrv.get_tenant_status(reqParameter).success(function (res) {
      if (res.Is_Success){
        //If tenant has not logged in (Tenant record is not present) , initialize the tenant
        if ( res.Custom_Message == "No user settings saved for given user and domain"){
          dynamicallyReportSrv.initialize_tenant(reqParameter).success(function(res) {
            if (res.Is_Success){
              //console.log("initialized");
              $rootScope.userStatus = true;
            }
            else{
              //console.log("Not initialized");
            }
          }).error(function (res){
            //console.log("Not initialized");
          });
        }
        else{
          $rootScope.userStatus = true;
        }
      }
    }).error(function (res) {
      //console.log("Error!");
    });
  }

   // var mainApp=angular.module('app.report', []);
    ////app common config details
    //mainApp.constant('config', {
    //  appName: 'diginReportViwer',
    //  apiTomcatBase: 'http://digin.cloudcharge.com:9897/',
    //  Digin_Engine_API: 'http://digin.cloudcharge.com:1929/',
    //  Digin_Domain: 'digin.cloudcharge.com',
    //  storeIndex: 'com.duosoftware.com'
    //});
    //
    //mainApp.run(function(config,dynamicallyReportSrv,$rootScope) {
    //  var reqParameter = {
    //    apiBase: config.Digin_Engine_API,
    //    _st: "8298aa106590a6329df1a35032e687cd"
    //  };
    //  //var nameEQ = "securityToken=";
    //  //var ca = document.cookie.split(';');
    //  ////get the tenant security token
    //  //debugger;
    //  //for (var i = 0; i < ca.length; i++) {
    //  //    var c = ca[i];
    //  //    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    //  //    if (c.indexOf(nameEQ) == 0){
    //  //        reqParameter._st = c.substring(nameEQ.length, c.length);
    //  //    }
    //  //}
    //  $rootScope.userStatus = false;
    //  //Find if tenant has logged in
    //  dynamicallyReportSrv.get_tenant_status(reqParameter).success(function (res) {
    //    if (res.Is_Success){
    //      //If tenant has not logged in (Tenant record is not present) , initialize the tenant
    //      if ( res.Custom_Message == "No user settings saved for given user and domain"){
    //        dynamicallyReportSrv.initialize_tenant(reqParameter).success(function(res) {
    //          if (res.Is_Success){
    //            console.log("initialized");
    //            $rootScope.userStatus = true;
    //          }
    //          else{
    //            console.log("Not initialized");
    //          }
    //        }).error(function (res){
    //          console.log("Not initialized");
    //        });
    //      }
    //      else{
    //        $rootScope.userStatus = true;
    //      }
    //    }
    //  }).error(function (res) {
    //    console.log("Error!");
    //  });
    //
    //});

  //function datePickerDirective(){
  //  return {
  //    restrict: "A",
  //    require: "ngModel",
  //    link: function (scope, elem, attrs, ngModelCtrl) {
  //      var updateModel = function (dateText) {
  //        scope.$apply(function () {
  //          ngModelCtrl.$setViewValue(dateText);
  //        });
  //      };
  //      var options = {
  //        dateFormat: "yy-mm-dd",
  //        changeMonth: true,
  //        changeYear: true,
  //        onSelect: function (dateText) {
  //          updateModel(dateText);
  //        }
  //      };
  //      elem.datepicker(options);
  //    }
  //  }
  //}




})();
