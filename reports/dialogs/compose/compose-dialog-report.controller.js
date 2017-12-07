(function ()
{
    'use strict';

    angular
        .module('app.report')
        .controller('AddReportController', AddReportController);

    /** @ngInject */
    function AddReportController($mdDialog,notifications,$charge,reportName)
    {
        var vm = this;
        // Methods
        vm.closeDialog = closeDialog;
      vm.saveReport = saveReport;


        function closeDialog()
        {
            $mdDialog.cancel();
        }

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
                        "note":""
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
