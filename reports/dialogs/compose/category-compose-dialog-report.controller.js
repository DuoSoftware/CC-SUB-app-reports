(function ()
{
    'use strict';

    angular
        .module('app.report')
        .controller('AddReportCategoryController', AddReportCategoryController);

    /** @ngInject */
    function AddReportCategoryController($mdDialog,notifications,$charge,category,categoryId)
    {
        var vm = this;
        // Methods
        vm.closeDialog = closeDialog;
        vm.saveReportCategory = saveReportCategory;
      vm.category = category;
      vm.reportCategory = category;
      vm.isReportSaved = false;

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





      function saveReportCategory(){
        if(category === '')
        {
          if(vm.reportCategory === "") {
            notifications.toast("Please add report Category", "error");
            return;
          }
          vm.isReportSaved = true;
          var catdata ={
                        "category":vm.reportCategory,
                        "isParent":1,
                        "isSuperAdmin":getSuperAdmin() === "false" ? 0 :1 ,
                        "module":getAccountCategory()
                      }

              $charge.settingsapp().insertReportCategory(catdata).success(function (data) {
                vm.isReportSaved = false;
                if(data.error===  "00000"){
                  $mdDialog.hide();
                  notifications.toast("Report Category added successfully.", "success");
                }
              }).error(function (res) {
                vm.isReportSaved = false;
                notifications.toast("Error adding Report Category,Please try again", "error");
              });
        }else{

          if(vm.reportCategory === "") {
            notifications.toast("Please add report Category", "error");
            return;
          }
          vm.isReportSaved = true;
          var catdata ={
            "cateName":vm.reportCategory,
            "isParent":1,
            "isSuperAdmin":getSuperAdmin() === "false" ? 0 :1 ,
            "module":getAccountCategory(),
            "guCatId":categoryId
          }

          $charge.settingsapp().updateReportCategory(catdata).success(function (data) {
            vm.isReportSaved = false;
            if(data.error===  "00000"){
              $mdDialog.hide();
              notifications.toast("Report Category updated successfully.", "success");
            }
          }).error(function (res) {
            vm.isReportSaved = false;
            notifications.toast("Error updating Report Category,Please try again", "error");
          });
        }

      }

     // vm.saveReportCategory();


    }
})();
