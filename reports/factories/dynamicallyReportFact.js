
//'use strict';

(function(mainApp){
  'use strict';
  //pm.factory('$productHandler', function($http,$charge,$productCacheHandler){
mainApp.factory('dynamicallyReportSrv', function ($http) {
  var getToken = function() {
    var _st = "8298aa106590a6329df1a35032e687cd";
    var nameEQ = "securityToken=";
    var ca = document.cookie.split(';');
    //get the tenant security token
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0){
        _st = c.substring(nameEQ.length, c.length);
      }
    }
    return _st;
  };
    return {
        getReportUI: function (parameter) {
            return $http.get(parameter.apiBase + 'getLayout?SecurityToken=' + getToken() +
                '&Domain=duosoftware.com&Reportname=' + parameter.reportName + '', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
        },
        getAllReports: function (parameter) {
            return $http.get(parameter.apiBase + 'get_all_components?SecurityToken=' + getToken() +
                '&Domain=' + parameter.Digin_Domain);
        },
        getCurrentQry: function (parameter) {
            return $http.get(parameter.apiBase + 'getQueries?Reportname=' + parameter.reportName +
                    '&fieldnames={' + parameter.queryFiled + '}')
        },
        getRenderReport: function (parameter) {
            // return $http.get(parameter.tomCatBase + 'DigIn-Report/ReportService/Reports/getreport/' + parameter.reportName + '/[' + parameter.rptParameter + ']');
            return $http.get(parameter.tomCatBase + 'DigIn-Report/ReportService/Reports/getreport/' + getToken() +'/'+ parameter.reportName +'/['+ parameter.rptParameter+']');

        },
        startReportServer: function (parameter) {
            return $http.get(parameter.tomCatBase + 'DigIn-Report/ReportService/Reports/command/start');
        },
        get_tenant_status: function (parameter) {
            return $http.get( parameter.apiBase+ 'get_user_settings?SecurityToken=' + getToken() );
        },
        initialize_tenant: function (parameter) {
            return $http({
                    method: 'POST',
                    url: parameter.apiBase +'set_init_user_settings',
                    data: {
                         'db' : 'BigQuery'
                    },
                    headers: {
                        'SecurityToken': getToken()
                    }
                });
        }
    }
});
})(angular.module('dynamicallyReportModule', []));


