(function ()
{
	'use strict';

	angular
		.module('app.report')
		.controller('ReportController', ReportController);

	/** @ngInject */
	function ReportController($scope, $document, $timeout, notifications, $mdDialog, $mdToast, $mdMedia, $mdSidenav,$charge,$filter, $http, $rootScope, $state, $window, $location, $anchorScroll, $stateParams, $sce)
	{
		//
		var vm = this;

		vm.appInnerState = "default";
		vm.pageTitle="Create New";
		vm.checked = [];
		vm.colors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg'];
		$scope.iframeHeight=screen.height;
		vm.selectedReport = {};
		vm.toggleSidenav = toggleSidenav;

		vm.responsiveReadPane = undefined;
		vm.activeInvoicePaneIndex = 0;
		vm.dynamicHeight = false;

		vm.scrollPos = 0;
		vm.scrollEl = angular.element('#content');

		//vm.invoices = Invoice.data;
		//console.log(vm.invoices);
		//invoice data getter !
		//vm.selectedInvoice = vm.invoices[0];
		vm.selectedMailShowDetails = false;

		// Methods
		vm.closeReadPane = closeReadPane;
		vm.selectReport = selectReport;
		vm.toggleStarred = toggleStarred;
		vm.reportCategorySwitchState = 'default';
		vm.sidenavActiveState = '';

		vm.showSidenav = true;

		// Collapsible panel
		$scope.sidenavCollapseHandler = function (index) {
      if($scope.reportList[index].collapse == undefined){
				$scope.reportList[index].collapse = true;
			}else{
				$scope.reportList[index].collapse = !$scope.reportList[index].collapse;
			}
		}
		// / Collapsible panel

		//////////

		// Watch screen size to activate responsive read pane
		$scope.$watch(function ()
		{
			return $mdMedia('gt-md');
		}, function (current)
		{
			vm.responsiveReadPane = !current;
		});

		// Watch screen size to activate dynamic height on tabs
		$scope.$watch(function ()
		{
			return $mdMedia('xs');
		}, function (current)
		{
			vm.dynamicHeight = current;
		});

		$scope.$watch(function () {
			var containerHeight = document.getElementsByClassName('content-wrapper');
			containerHeight.length != 0 ? $scope.iframeHeight=containerHeight[0].scrollHeight - 5 : null;

      if(document.getElementById('reportFram') != null){
        var elemSrc = document.getElementById('reportFram').getAttribute('src');
        if(elemSrc.split(':')[0] == 'http' || elemSrc.split(':')[0] == 'https'){
          $scope.reportLoaded = true;
        }
      }
		});

		/**
		 * Select product
		 *
		 * @param product
		 */

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

		function getIdTokenForServices() {
			var _st = gst("securityToken");
			return (_st != null) ? _st : "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsifQ.eyJleHAiOjE1MTM0MTM3MzUsIm5iZiI6MTUxMzMzMDkzNSwidmVyIjoiMS4wIiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5taWNyb3NvZnRvbmxpbmUuY29tL2MxZjlmOGU2LTM0NjktNGQ1Zi1hMzI2LTgzZTk5MGE5OTI2YS92Mi4wLyIsInN1YiI6IjFmNGZkNjJmLWE3ZTItNGJiMS1hNTU2LTc1OWY1NmM3MzExOSIsImF1ZCI6ImQwODRhMjI3LWJiNTItNDk5Mi04ODlkLTZlNDgzNTYxMGU3NiIsIm5vbmNlIjoiZGVmYXVsdE5vbmNlIiwiaWF0IjoxNTEzMzMwOTM1LCJhdXRoX3RpbWUiOjE1MTMzMzA5MzUsIm9pZCI6IjFmNGZkNjJmLWE3ZTItNGJiMS1hNTU2LTc1OWY1NmM3MzExOSIsImdpdmVuX25hbWUiOiJsdXlkb2hvbHRpIiwibmFtZSI6InppeWFwIiwiY291bnRyeSI6IlNyaSBMYW5rYSIsImV4dGVuc2lvbl9tb2RlIjoidGVzdCIsImV4dGVuc2lvbl9Eb21haW4iOiJsdXlkb2hvbHRpLmFwcC5jbG91ZGNoYXJnZS5jb20iLCJmYW1pbHlfbmFtZSI6ImZyZWVfdHJpYWwiLCJqb2JUaXRsZSI6ImFkbWluIiwiZW1haWxzIjpbImx1eWRvaG9sdGlAeml5YXAuY29tIl0sInRmcCI6IkIyQ18xX0RlZmF1bHRQb2xpY3kifQ.oFIGKbst3hxBFqvH9A6fp-dfSIUDC1uQ0y_okarF_c2YbsB9i2TaNzXHHWoYs33cTJsbeA2jROqkFqyfMk6w5aUkcJYXFzgsejSIOoN1GrXgwqn62mLTg31TVK8RL3yIe71Nm3bizRbg4sbDDdpZ32n0bqiUv2GuI2SkaakdYgJ1m53boX5F4mWEvmIP-fxUu0up9n-CD3FIg6YuJGdvhq4uslI0_b4DQK81PKZ14HxRsAdSiNdOKxQRfbvoMaujCbz9L8MnQIfvfl-9GBT8z7KTAK9jvgWOv7awXSli-XHKFjmAtXGWJF6fvkKxkyIi6WNmBKwgG14Voz0dbAVzWA";
		}

		function getDomainForServices() {
			var _st = gst("currentDomain");
			var __st = "luydoholti.app.cloudcharge.com";//gst("domain");
			return (_st != null) ? _st : __st;
		}

		function getAccountCategory() {
			var _st = gst("category");
			return (_st != null) ? _st : "subscription";
		}

		function getSuperAdmin() {
			var _st = gst("isSuperAdmin");
			return (_st != null) ? _st : "false"; //"248570d655d8419b91f6c3e0da331707 51de1ea9effedd696741d5911f77a64f";
		}

		var accCat = getAccountCategory();


		function selectReport(report)
		{

			$scope.showFinanceReport=false;
			$scope.showTenantDetailReport=false;
			$scope.showAppUsageReport=false;
		}

		/**
		 * Close read pane
		 */
		function closeReadPane()
		{
			vm.activeInvoicePaneIndex = 0;
			angular.element('.sidenav').show();

			$scope.onClickRefresh();
			$timeout(function ()
			{
				vm.scrollEl.scrollTop(vm.scrollPos);
			}, 650);

			$scope.showFinanceReport=false;
			$scope.showTenantDetailReport=false;
			$scope.showAppUsageReport=false;
			//$scope.iframeHeight=screen.height;
		}

		/**
		 * Toggle starred
		 *
		 * @param mail
		 * @param event
		 */
		function toggleStarred(mail, event)
		{
			event.stopPropagation();
			mail.starred = !mail.starred;
		}


		/**
		 * Toggle sidenav
		 *
		 * @param sidenavId
		 */
		function toggleSidenav(sidenavId)
		{
			$mdSidenav(sidenavId).toggle();
		}

		/**
		 * Toggle innerview
		 *
		 */

		function toggleinnerView(){
			if(vm.appInnerState === "default"){
				vm.appInnerState = "add";
				vm.pageTitle="View Reports";
			}else{
				vm.appInnerState = "default";
				vm.pageTitle="Create New";
			}
		}


		$scope.reportCategory="";

		$scope.companyReportList=[
			{ company : 'Cloud Charge', type : 'cloudcharge'},
			{ company : 'DuoWorld', type : 'duoworld'},
			{ company : 'Smooth Flow', type : 'smoothflow'},
			{ company : 'Digin', type : 'duodigin'}
			//{ company : 'FaceTone', type : 'facetone'}
		];

		$scope.tenantReportList=[
			{ name : 'Tenant Details', type : 'tenantdetails'},
			{ name : 'App Usage Details', type : 'appdetails'}
			//{ company : 'FaceTone', type : 'facetone'}
		];

		$scope.reportList=[];
		$scope.baseUrl="";
		$scope.isUrlSet = false;

		$scope.reportURL = "";

		//(function () {
		//	var catReportList;
		//	if(accCat == 'invoice'){
		//		catReportList = 'app/core/cloudcharge/js/reportListInvoice.json';
		//	}else if(accCat == 'subscription'){
		//		catReportList = 'app/core/cloudcharge/js/reportList.json';
		//	}
        //
		//	$http.get(catReportList).then(function(data){
        //
		//		//console.log(data);
		//		var IsSuperAdmin = getSuperAdmin();
		//		if(IsSuperAdmin=="true")
		//		{
		//			for (var key in data.data) {
		//				if(data.data[key].superadmin)
		//				{
		//					$scope.reportList.push(data.data[key]);
		//				}
		//			}
		//		}
		//		else
		//		{
		//			for (var key in data.data) {
		//				if(!data.data[key].superadmin)
		//				{
		//					$scope.reportList.push(data.data[key]);
		//				}
		//			}
		//		}
        //
		//		$http.get('app/core/cloudcharge/js/config.json').then(function(data){
        //
		//			//console.log(data);
		//			$scope.baseUrl=data.data["report"]["domain"];
		//			//$scope.loadFilterCategories('dashBoardReport.mrt');
		//			$scope.loadFilterCategories($scope.reportList[0].data[0].report);
        //
		//			//for (key in data.data) {
		//			//  if (data.data.hasOwnProperty("report")) {
		//			//    $scope.baseUrl=data.data["report"]["domain"];
		//			//
		//			//    $scope.loadFilterCategories('dashBoardReport.mrt');
		//			//    break;
		//			//  }
		//			//}
		//		}, function(errorResponse){
		//			//console.log(errorResponse);
		//			$scope.baseUrl="";
		//		});
		//	}, function(errorResponse){
		//		//console.log(errorResponse);
		//	});
		//})();

		$scope.companyLogo="";
		$charge.settingsapp().getDuobaseValuesByTableName("CTS_CompanyAttributes").success(function(data) {
			//
			$scope.companyLogo=(data[4].RecordFieldData=="")?"":data[4].RecordFieldData=="Array"?"":data[4].RecordFieldData;

		}).error(function(data) {
			$scope.companyLogo="";
		})



		$scope.showFinanceReport=false;
		$scope.showTenantDetailReport=false;
		$scope.showAppUsageReport=false;

		//$scope.loadFilterCategories= function (category) {
		//	$scope.isUrlSet = false;
		//	$('#reportFram').remove();
		//	//$scope.reportCategory=category;
		//	// $timeout(function ()
		//	// {
		//	//   vm.activeInvoicePaneIndex = 0;
		//	// });azure.cloudcharge.com/services/reports/JS/viewer.php?report=&idToken=
		//	vm.selectedReport = category;
        //
		//	//var reportURL1="http://azure.cloudcharge.com/services/reports/stimulsoft/index.php?stimulsoft_client_key=ViewerFx";
		//	var reportURL1=$scope.baseUrl+"/reports/JS/viewer.php?";
		//	//var reportURL2="&stimulsoft_report_key="+category;
		//	var reportURL2="report="+category.split('.')[0];
		//	var reportURL3="&idToken="+getIdTokenForServices();
		//	var reportURL4="&cUrl="+$scope.companyLogo;
		//	var reportURL5="&domain="+getDomainForServices();
        //
		//	$scope.reportURL=reportURL1+reportURL2+reportURL3+reportURL4+reportURL5;
        //
		//	var elemParent = $('#reportContainer');
		//	elemParent.append('<iframe fill-width ng-show="isUrlSet" frameborder="0" id="reportFram" src="'+$scope.reportURL+'" marginwidth="0" marginheight="0" height="'+$scope.iframeHeight+'" onload="" allowfullscreen> </iframe>');
		//	$scope.isUrlSet = true;
        //
		//}


    //===================================================User create report functions==============================================================================

    $scope.addNewReport = function(ev){

      vm.reportName = '';

      $mdDialog.show({
        controller         : 'AddReportController',
        controllerAs       : 'vm',
        locals             : {
          reportName : vm.reportName
        },
        templateUrl        : 'app/main/reports/dialogs/compose/compose-dialog.html',
        parent             : angular.element($document.body),
        targetEvent        : ev,
        clickOutsideToClose: false
      }).then(function(answer) {

        if(answer === undefined || answer === null){}
        else {
          $scope.loadCreatedReports();
          $scope.loadCreatedReport(answer, 'edit');
        }

       }, function() {
          $mdDialog.hide();
         });

    }


    $scope.addEditCategory = function(ev,value){

      vm.category =  value;

      $mdDialog.show({
        controller         : 'AddReportCategoryController',
        controllerAs       : 'vm',
        locals             : {
          category : vm.category
        },
        templateUrl        : 'app/main/reports/dialogs/compose/category-compose-dialog.html',
        parent             : angular.element($document.body),
        targetEvent        : ev,
        clickOutsideToClose: false
      }).then(function(answer) {

        if(answer === undefined || answer === null){}
        else {
          $scope.loadCreatedReports();

        }

      }, function() {
        $mdDialog.hide();
      });

    }

    //$scope.createdReportList = null;
    $scope.loadCreatedReports = function(){
      $charge.settingsapp().getAllReportInfo(0,500,"desc",getAccountCategory()).success(function (data) {
       // $scope.createdReportList = data.result;
        $scope.reportList = data.result;

      }).error(function (res) {
       // $scope.createdReportList = null;
        $scope.reportList = null;
      });
    }

    $scope.loadCreatedReports();

    $scope.showCreatedReport = function(report){
      $scope.loadCreatedReport(report.reportName,'view');
    }

    $scope.editUserCreatedReport = function(report){
      $scope.loadCreatedReport(report.reportName,'edit');
    }

    $scope.loadCreatedReport= function (reportName,action) {

      $scope.isUrlSet = false;
      $('#reportFram').remove();

      vm.selectedReport = reportName;

      var reportURL1=$scope.baseUrl+"/reports/CUSTOM/viewer.php?";
      if(action === 'edit')
      {
        reportURL1=$scope.baseUrl+"/reports/CUSTOM/designer.php?";
      }
      var reportURL2="report="+reportName;
      var reportURL3="&idToken="+getIdTokenForServices();
      var reportURL4="&cUrl="+$scope.companyLogo;
      var reportURL5="&domain="+getDomainForServices();

      $scope.reportURL=reportURL1+reportURL2+reportURL3+reportURL4+reportURL5;
      if(action === 'edit')
      {
        $scope.reportURL=reportURL1+reportURL2+reportURL3+reportURL5;
        $window.open($scope.reportURL,'_blank');
      }
      else {
        var elemParent = $('#reportContainer');
        elemParent.append('<iframe fill-width ng-show="isUrlSet" frameborder="0" id="reportFram" src="' + $scope.reportURL + '" marginwidth="0" marginheight="0" height="' + $scope.iframeHeight + '" onload="" allowfullscreen> </iframe>');
        $scope.isUrlSet = true;
      }

    }


	}
})();
