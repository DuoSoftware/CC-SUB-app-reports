(function ()
{
    'use strict';

    angular
        .module('app.report')
        .controller('AddReportController', AddReportController);

    /** @ngInject */
    function AddReportController($mdDialog,notifications,$charge,reportName,categoryList)
    {
        var vm = this;
        // Methods
        vm.closeDialog = closeDialog;
      vm.saveReport = saveReport;

      function gst(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        //debugger;
        return null;
      }

      function getAccountCategory() {
        var _st = gst("category");
        return (_st != null) ? _st : "subscription";
      }

      function getSuperAdmin() {
        var _st = gst("isSuperAdmin");
        return (_st != null) ? _st : "false"; //"248570d655d8419b91f6c3e0da331707 51de1ea9effedd696741d5911f77a64f";
      }


        function closeDialog()
        {
            $mdDialog.cancel();
        }

      vm.categoryList = [];
      vm.loadReportCategory = function(){

        if(categoryList != undefined && categoryList != null)
        {
          vm.categoryList = categoryList;
        }else {

          var isSuperAdmin = getSuperAdmin() === "false" ? 0 : 1;

          $charge.settingsapp().getAllReportCategories(0, 500, "asc", getAccountCategory()).success(function (data) {

            angular.forEach(data.result, function (res) {
              if (res.isSuperAdmin === isSuperAdmin)
                vm.categoryList.push(res);

            })
            //vm.categoryList = data.result;
            vm.category = data.result[data.result.length - 1].guCatId;

          }).error(function (res) {
            // $scope.createdReportList = null;
            vm.categoryList = [];
          });
        }
      }

      vm.loadReportCategory();



      vm.reportName = reportName;
      vm.isReportSaved = false;

      function saveReport(){
        if(vm.reportName === undefined || vm.reportName === "")
        {
          notifications.toast("Please add report name","error");
          return;

        }else{
          vm.isReportSaved = true;
          toDataUrl('app/main/reports/sampleReport.mrt', function(myBase64) {
            //myBase64; // myBase64 is the base64 string
            var convertedValue =  myBase64.split(',');
            var uploadImageObj = {
                "base64Image": convertedValue[1],
                "fileName": vm.reportName,
                "format": "mrt",
                "app": "Reports",
                "fileType": "file"
              };

              $charge.storage().storeImage(uploadImageObj).success(function (data) {
                if(data.error === "00000")
                {

                  var reportInfo = {
                        "reportName":vm.reportName,
                        "reportUrl":data.fileUrl,
                        "note":vm.reportName,
                        "guCatId": vm.category,
                        "type":"custom"
                      }
                  $charge.settingsapp().insertReportInfo(reportInfo).success(function (result) {
                    if(result.error === "00000")
                    {
                      vm.isReportSaved = false;
                      $mdDialog.hide(vm.reportName);

                    }else{
                      vm.isReportSaved = false;
                      notifications.toast("Error saving report, Please try again","error");
                    }
                  }).error(function (err) {
                    vm.isReportSaved = false;
                    notifications.toast("Error saving report, Please try again","error");
                  });


                }else{
                  vm.isReportSaved = false;
                  notifications.toast("Error saving report, Please try again","error");
                }
              }).error(function (res) {
                vm.isReportSaved = false;
                notifications.toast("Error saving report, Please try again","error");
              });

          });



        }

      }

      function toDataUrl(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
          var reader = new FileReader();
          reader.onloadend = function() {
            callback(reader.result);
          }
          reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
      }




    }
})();
