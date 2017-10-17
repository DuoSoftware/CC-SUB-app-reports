(function ()
{
	'use strict';

	angular
		.module('app.report')
		//.directive('datepicker', function () {
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
		//
		//    }
		//  }
		//})
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
		vm.checkAll = checkAll;
		vm.closeReadPane = closeReadPane;
		vm.addInvoice = toggleinnerView;
		vm.isChecked = isChecked;
		vm.selectReport = selectReport;
		vm.toggleStarred = toggleStarred;
		vm.toggleCheck = toggleCheck;
		vm.reportCategorySwitchState = 'default';
		vm.sidenavActiveState = '';
		vm.toggleinnerView = toggleinnerView;
		vm.maximizeReport = maximizeReport;

		vm.loadByKeyword = $scope.loadByKeywordPayment;
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

			var elemSrc = document.getElementById('reportFram').getAttribute('src');
			if(elemSrc.split(':')[0] == 'http' || elemSrc.split(':')[0] == 'https'){
				$scope.reportLoaded = true;
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
			return (_st != null) ? _st : ""; //"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImdmSUtJSC15WjNwaFJIUnlqbnNISXFaTWFlUExHQUVMelBhdDBDTlk0c0EifQ";
		}

		function getDomainForServices() {
			var _st = gst("currentDomain");
			var __st = gst("domain");
			return (_st != null) ? _st : __st;
		}

		function getAccountCategory() {
			var _st = gst("category");
			return (_st != null) ? _st : "";
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
			// $scope.iframeHeight=screen.height;

			// $timeout(function ()
			// {
			//     vm.activeInvoicePaneIndex = 1;
			//
			//     // Store the current scrollPos
			//     vm.scrollPos = vm.scrollEl.scrollTop();
			//
			//     // Scroll to the top
			//     vm.scrollEl.scrollTop(0);
			// });
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
		 * Toggle checked status of the mail
		 *
		 * @param invoice
		 * @param event
		 */
		function toggleCheck(invoice, event)
		{
			if ( event )
			{
				event.stopPropagation();
			}

			var idx = vm.checked.indexOf(invoice);

			if ( idx > -1 )
			{
				vm.checked.splice(idx, 1);
			}
			else
			{
				vm.checked.push(invoice);
			}
		}

		/**
		 * Return checked status of the invoice
		 *
		 * @param invoice
		 * @returns {boolean}
		 */
		function isChecked(invoice)
		{
			return vm.checked.indexOf(invoice) > -1;
		}

		/**
		 * Check all
		 */
		function checkAll()
		{
			if ( vm.allChecked )
			{
				vm.checked = [];
				vm.allChecked = false;
			}
			else
			{
				angular.forEach(vm.payments, function (invoice)
				{
					if ( !isChecked(invoice) )
					{
						toggleCheck(invoice);
					}
				});

				vm.allChecked = true;
			}
		}

		/**
		 * Open compose dialog
		 *
		 * @param ev
		 */
		function addReportDialog(ev)
		{
			$mdDialog.show({
				controller         : 'AddReportController',
				controllerAs       : 'vm',
				locals             : {
					selectedMail: undefined
				},
				templateUrl        : 'app/main/report/dialogs/compose/compose-dialog.html',
				parent             : angular.element($document.body),
				targetEvent        : ev,
				clickOutsideToClose: true
			});
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

		(function () {
			var catReportList;
			if(accCat == 'invoice'){
				catReportList = 'app/core/cloudcharge/js/reportListList.json';
			}else if(accCat == 'subscription'){
				catReportList = 'app/core/cloudcharge/js/reportList.json';
			}

			$http.get(catReportList).then(function(data){

				//console.log(data);
				var IsSuperAdmin = getSuperAdmin();
				if(IsSuperAdmin=="true")
				{
					for (key in data.data) {
						if(data.data[key].superadmin)
						{
							$scope.reportList.push(data.data[key]);
						}
					}
				}
				else
				{
					for (key in data.data) {
						if(!data.data[key].superadmin)
						{
							$scope.reportList.push(data.data[key]);
						}
					}
				}

				$http.get('app/core/cloudcharge/js/config.json').then(function(data){

					//console.log(data);
					$scope.baseUrl=data.data["report"]["domain"];
					//$scope.loadFilterCategories('dashBoardReport.mrt');
					$scope.loadFilterCategories($scope.reportList[0].data[0].report);

					//for (key in data.data) {
					//  if (data.data.hasOwnProperty("report")) {
					//    $scope.baseUrl=data.data["report"]["domain"];
					//
					//    $scope.loadFilterCategories('dashBoardReport.mrt');
					//    break;
					//  }
					//}
				}, function(errorResponse){
					//console.log(errorResponse);
					$scope.baseUrl="";
				});
			}, function(errorResponse){
				//console.log(errorResponse);
			});
		})();

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

		$scope.loadFilterCategories= function (category) {

			$scope.isUrlSet = false;
			$('#reportFram').remove();
			//$scope.reportCategory=category;
			// $timeout(function ()
			// {
			//   vm.activeInvoicePaneIndex = 0;
			// });azure.cloudcharge.com/services/reports/JS/viewer.php?report=&idToken=
			vm.selectedReport = category;

			//var reportURL1="http://azure.cloudcharge.com/services/reports/stimulsoft/index.php?stimulsoft_client_key=ViewerFx";
			var reportURL1=$scope.baseUrl+"/reports/JS/viewer.php?";
			//var reportURL2="&stimulsoft_report_key="+category;
			var reportURL2="report="+category.split('.')[0];
			var reportURL3="&idToken="+getIdTokenForServices();
			var reportURL4="&cUrl="+$scope.companyLogo;
			var reportURL5="&domain="+getDomainForServices();

			$scope.reportURL=reportURL1+reportURL2+reportURL3+reportURL4+reportURL5;

			var elemParent = $('#reportContainer');
			elemParent.append('<iframe fill-width ng-show="isUrlSet" frameborder="0" id="reportFram" src="'+$scope.reportURL+'" marginwidth="0" marginheight="0" height="'+$scope.iframeHeight+'" onload="" allowfullscreen> </iframe>');
			$scope.isUrlSet = true;

			// $scope.clickGoToFilter(category.split('.')[0]);


			//$charge.report().getReport(category, getIdTokenForServices()).success(function (data) {
			//  $scope.reportURL=data;
			//
			//  $scope.clickGoToFilter(category.split('.')[0]);
			//
			//}).error(function (data) {
			//  $scope.reportURL="";
			//});


		}

		//server request handler
		$scope.reports = null;
		//var serverReq = {
		//  reqParameter: {
		//    apiBase: configReport.Digin_Engine_API,
		//    tomCatBase: configReport.apiTomcatBase,
		//    token: '',
		//    reportName: '',
		//    queryFiled: ''
		//  },
		//  getToken: function() {
		//    var _st = "8298aa106590a6329df1a35032e687cd";
		//    var nameEQ = "securityToken=";
		//    var ca = document.cookie.split(';');
		//    //get the tenant security token
		//    for (var i = 0; i < ca.length; i++) {
		//      var c = ca[i];
		//      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		//      if (c.indexOf(nameEQ) == 0){
		//        _st = c.substring(nameEQ.length, c.length);
		//      }
		//    }
		//    return _st;
		//  },
		//  startReportServer: function () {
		//    dynamicallyReportSrv.startReportServer(this.reqParameter).success(function (res) {
		//      console.log("report server start success...");
		//
		//    }).error(function (err) {
		//      //false
		//      console.log("report server start error...!");
		//    });
		//  },
		//  getAllReports: function (callBack) {
		//    this.reqParameter.token = serverReq.getToken();
		//    var rep = [];
		//    $scope.isReportLoading = true;
		//    dynamicallyReportSrv.getAllReports(this.reqParameter).success(function (data) {
		//      if (data.Is_Success) {
		//        for (var i = 0; i < data.Result.length; i++) {
		//          if ( data.Result[i].compType == "report"){
		//            rep.push(data.Result[i].compName);
		//          }
		//        }
		//        if ( rep.length > 0 ){
		//          callBack(rep);
		//        } else {
		//          callBack(null);
		//        }
		//      }
		//      else{
		//        callBack(null);
		//      }
		//    }).error(function (err) {
		//      callBack(null);
		//      console.log("error get report layout..");
		//    });
		//
		//  }
		//
		//};//end

		$scope.reports = [];
		function getAllReport() {
			$scope.reports = [];
			serverReq.getAllReports(function (resp) {
				$scope.isReportLoading = false;
				if ($scope.reports == null) {
					return;
				}
				$scope.reports = resp;
			});
		}

		// Call these functions only when the user is initialized
		$rootScope.$watch('userStatus' , function(newValue,OldValue){
			if ($rootScope.userStatus){
				serverReq.startReportServer();
				getAllReport();
			}
		},true);

		//click event
		//go to filter
		var reportNme;
		$scope.clickGoToFilter = function (reportName) {
			//$state.go('reportFilter', {'reportNme': reportName});
			// angular.element('.sidenav').hide();

			reportNme=reportName;
			$location.hash('top');
			$anchorScroll();
			document.body.style.overflow = 'hidden';
			//serverRequest.getReportUIFromServer(eventHandler);
			vm.reportCategorySwitchState = reportName;
			vm.sidenavActiveState = reportName;

			selectReport(reportName);

			//onClickRefresh();
			privateFun.clearAllUI();

			// $timeout(function ()
			// {
			//   // Store the current scrollPos
			//   vm.scrollPos = vm.scrollEl.scrollTop();
			//
			//   // Scroll to the top
			//   vm.scrollEl.scrollTop(0);
			// });
			//selectReport('');
		};

		$scope.financeFilter={};

		$scope.CompanyDetailList=[];
		var tempCompanyList=[];
		$scope.isAdmin=false;

		var skip=0;
		var take=100;
		$scope.loadFinanceReports=false;
		$scope.reportsLoding=false;
		var selectedFinanceReport="";

		var currntDay=moment(new Date()).format().split('T')[0];
		var yearbacktime=(parseInt(currntDay.split('-')[0])-1).toString()+"-"+currntDay.split('-')[1]+"-"+currntDay.split('-')[2];

		$scope.clickGoToComapny = function (reportName) {
			angular.element('.sidenav').hide();

			reportNme=reportName;
			$location.hash('top');
			$anchorScroll();
			document.body.style.overflow = 'hidden';
			//serverRequest.getReportUIFromServer(eventHandler);
			vm.reportCategorySwitchState = reportName;
			vm.sidenavActiveState = reportName;
			selectReport(reportName);

			$scope.showFinanceReport=true;
			$scope.iframeHeight=0;

			skip=0;
			$scope.CompanyDetailList=[];
			tempCompanyList=[];
			$scope.loadFinanceReports=false;
			selectedFinanceReport=reportName;
			$scope.financeFilter={};

			$scope.financeFilter.from=$scope.financeFilter.from==undefined?yearbacktime:$scope.financeFilter.from;
			$scope.financeFilter.to=$scope.financeFilter.to==undefined?currntDay:$scope.financeFilter.to;

			//$charge.paymentgateway().getAll(skip,take,reportName).success(function(data){
			//  console.log(data);
			//
			//  for (var i = 0; i < data.length; i++) {
			//    //
			//    tempCompanyList.push(data[i]);
			//  }
			//  skip+=take;
			//  $scope.CompanyDetailList=tempCompanyList;
			//  //loadCompanyRecurr(skip,take,reportName);
			//  //$scope.CompanyDetailList=data;
			//  if(data.length<take)
			//  {
			//    $scope.loadFinanceReports=false;
			//  }
			//
			//}).error(function(data){
			//  console.log(data);
			//  $scope.loadFinanceReports=false;
			//})

			//onClickRefresh();
			privateFun.clearAllUI();

			// $timeout(function ()
			// {
			//   vm.activeInvoicePaneIndex = 1;
			//
			//   // Store the current scrollPos
			//   vm.scrollPos = vm.scrollEl.scrollTop();
			//
			//   // Scroll to the top
			//   vm.scrollEl.scrollTop(0);
			// });
		}

		var from="";
		var to="";
		var type="";
		var value="";

		$scope.loadMoreFinanceReoprts = function () {

			//from=$scope.financeFilter.from!=undefined?moment($scope.financeFilter.from).format().split('T')[0]:'';
			//to=$scope.financeFilter.to!=undefined?moment($scope.financeFilter.to).format().split('T')[0]:'';
			//type=$scope.financeFilter.type!=undefined?$scope.financeFilter.type:'';
			//value=type!=''?($scope.financeFilter.value!=undefined?$scope.financeFilter.value:''):'';
			$scope.moreReportsLoding=true;

			$charge.paymentgateway().getAll(skip,take,selectedFinanceReport,to,from,type,value).success(function(data){
				//console.log(data);

				for (var i = 0; i < data.length; i++) {
					//
					tempCompanyList.push(data[i]);
				}
				skip+=take;
				$scope.CompanyDetailList=tempCompanyList;
				//loadCompanyRecurr(skip,take,reportName);
				//$scope.CompanyDetailList=data;
				$scope.moreReportsLoding=false;
				if(data.length<take)
				{
					$scope.loadFinanceReports=false;
				}

			}).error(function(data){
				//console.log(data);
				$scope.loadFinanceReports=false;
				$scope.moreReportsLoding=false;
			})
		}

		$scope.applyFinanceFilter = function () {

			//from=$scope.financeFilter.from!=undefined?moment($scope.financeFilter.from).format().split('T')[0]:'';
			//to=$scope.financeFilter.to!=undefined?moment($scope.financeFilter.to).format().split('T')[0]:'';
			from=$scope.financeFilter.from==undefined?'':$scope.financeFilter.from;
			to=$scope.financeFilter.to==undefined?'':$scope.financeFilter.to;
			type=$scope.financeFilter.type;
			value=$scope.financeFilter.value;

			//$scope.financeFilter.from=$scope.financeFilter.from==undefined?yearbacktime:$scope.financeFilter.from;
			//$scope.financeFilter.to=$scope.financeFilter.to==undefined?currntDay:$scope.financeFilter.to;

			skip=0;
			$scope.CompanyDetailList=[];
			tempCompanyList=[];
			$scope.loadFinanceReports=false;
			$scope.reportsLoding=true;
			$charge.paymentgateway().getAll(skip,take,selectedFinanceReport,to,from,type,value).success(function(data){
				//console.log(data);

				for (var i = 0; i < data.length; i++) {
					//
					tempCompanyList.push(data[i]);
				}
				skip+=take;
				$scope.CompanyDetailList=tempCompanyList;
				//loadCompanyRecurr(skip,take,reportName);
				//$scope.CompanyDetailList=data;
				$scope.reportsLoding=false;
				$scope.loadFinanceReports=true;
				if(data.length<take)
				{
					$scope.loadFinanceReports=false;
				}

			}).error(function(data){
				//console.log(data);
				$scope.loadFinanceReports=false;
				$scope.reportsLoding=false;
			})
		}

		$scope.clearFilterValue = function () {
			$scope.financeFilter.value="";
		}

		$scope.resetFilters = function () {
			$scope.financeFilter={};
			$scope.financeFilter.from=$scope.financeFilter.from==undefined?yearbacktime:$scope.financeFilter.from;
			$scope.financeFilter.to=$scope.financeFilter.to==undefined?currntDay:$scope.financeFilter.to;
			skip=0;
			$scope.CompanyDetailList=[];
			tempCompanyList=[];
			$scope.loadFinanceReports=false;
			$scope.reportsLoding=false;
			//$scope.loadMoreFinanceReoprts();
		}

		function loadCompanyRecurr(skip,take,reportName){
			$charge.paymentgateway().getAll(skip,take,reportName).success(function(data){
				for (var i = 0; i < data.length; i++) {
					//
					tempCompanyList.push(data[i]);
				}
				skip+=take;
				loadCompanyRecurr(skip,take,reportName);

			}).error(function(data){
				//console.log(data);
				$scope.CompanyDetailList=tempCompanyList;
				var dd=$scope.CompanyDetailList[1];
				//console.log(dd);
			})
		}

		$scope.tenantDetailFilter={};
		$scope.appUsageFilter={};

		$scope.TenantDetailList=[];
		var tempTenantList=[];

		var skipTenantWiseDetails=0;
		var skipAppUsageDetails=0;
		var takeTenantDetails=50;
		var takeAppUsageDetails=20;
		$scope.loadTenantReports=false;

		var fromTenatDate='';
		var toTenantDate='';
		var plan='';
		var tenantName='';
		var selectedAppName='';
		var usageAppType='';
		var appUsageFilterType='';

		$scope.clickGoToTenantDetails = function (reportName) {
			angular.element('.sidenav').hide();

			reportNme=reportName;
			$location.hash('top');
			$anchorScroll();
			document.body.style.overflow = 'hidden';
			//serverRequest.getReportUIFromServer(eventHandler);
			vm.reportCategorySwitchState = reportName;
			vm.sidenavActiveState = reportName;
			selectReport(reportName);

			$scope.iframeHeight=0;

			if(reportName=="tenantdetails")
			{
				$scope.showTenantDetailReport=true;

				skipTenantWiseDetails=0;
				$scope.TenantDetailList=[];
				tempTenantList=[];
				$scope.loadTenantReports=false;
				$scope.reportsLoding=false;
				$scope.tenantDetailFilter={};

				$scope.tenantDetailFilter.from=$scope.tenantDetailFilter.from==undefined?yearbacktime:$scope.tenantDetailFilter.from;
				$scope.tenantDetailFilter.to=$scope.tenantDetailFilter.to==undefined?currntDay:$scope.tenantDetailFilter.to;

				//$charge.dashboard().getTenantInfo(skipTenantWiseDetails,takeTenantDetails,'desc').success(function(data){
				//  console.log(data);
				//
				//  for (var i = 0; i < data.length; i++) {
				//    //
				//    tempTenantList.push(data[i]);
				//  }
				//  skipTenantWiseDetails+=takeTenantDetails;
				//  $scope.TenantDetailList=tempTenantList;
				//  //loadCompanyRecurr(skip,take,reportName);
				//  //$scope.CompanyDetailList=data;
				//  $scope.reportsLoding=false;
				//  $scope.loadTenantReports=true;
				//  if(data.length<takeTenantDetails)
				//  {
				//    $scope.loadTenantReports=false;
				//  }
				//
				//}).error(function(data){
				//  console.log(data);
				//  $scope.loadTenantReports=false;
				//  $scope.reportsLoding=false;
				//})
			}
			else if(reportName=="appdetails")
			{
				$scope.showAppUsageReport=true;

				skipAppUsageDetails=0;
				$scope.TenantDetailList=[];
				tempTenantList=[];
				$scope.loadTenantReports=false;
				$scope.reportsLoding=false;
				$scope.appUsageFilter={};

				//$charge.dashboard().getAppUsageInfo(skipAppUsageDetails,takeTenantDetails,'desc').success(function(data){
				//  console.log(data);
				//
				//  for (var i = 0; i < data.length; i++) {
				//    //
				//    tempTenantList.push(data[i]);
				//  }
				//  skipAppUsageDetails+=takeTenantDetails;
				//  $scope.TenantDetailList=tempTenantList;
				//  //loadCompanyRecurr(skip,take,reportName);
				//  //$scope.CompanyDetailList=data;
				//  $scope.reportsLoding=false;
				//  $scope.loadTenantReports=true;
				//  if(data.length<takeTenantDetails)
				//  {
				//    $scope.loadTenantReports=false;
				//  }
				//
				//}).error(function(data){
				//  console.log(data);
				//  $scope.loadTenantReports=false;
				//  $scope.reportsLoding=false;
				//})
			}

			//onClickRefresh();
			privateFun.clearAllUI();

			// $timeout(function ()
			// {
			//   vm.activeInvoicePaneIndex = 1;
			//
			//   // Store the current scrollPos
			//   vm.scrollPos = vm.scrollEl.scrollTop();
			//
			//   // Scroll to the top
			//   vm.scrollEl.scrollTop(0);
			// });
		}

		$scope.applyTenantDetailFilter = function () {

			fromTenatDate=$scope.tenantDetailFilter.from==''?'':moment($scope.tenantDetailFilter.from).format('YYYY-MM-DD')+' 00:00:00';
			toTenantDate=$scope.tenantDetailFilter.to==''?'':moment($scope.tenantDetailFilter.to).format('YYYY-MM-DD')+' 23:59:59';
			plan=$scope.tenantDetailFilter.pricePlan==undefined?'':$scope.tenantDetailFilter.pricePlan;

			$scope.showTenantDetailReport=true;

			skipTenantWiseDetails=0;
			$scope.TenantDetailList=[];
			tempTenantList=[];
			$scope.loadTenantReports=false;
			$scope.reportsLoding=true;

			fromTenatDate="'"+fromTenatDate+"'";
			toTenantDate="'"+toTenantDate+"'";
			plan="'"+plan+"'";
			$charge.dashboard().getTenantInfoFilter(skipTenantWiseDetails,takeTenantDetails,'desc',fromTenatDate,toTenantDate,plan).success(function(data){
				//$charge.dashboard().getTenantInfoFilter(skipTenantWiseDetails,takeTenantDetails,'desc','2016-01-05 00:00:00','2017-01-05 00:00:00','free_trial').success(function(data){
				//  console.log(data);

				for (var i = 0; i < data.Tenants.length; i++) {
					//
					tempTenantList.push(data.Tenants[i]);
				}
				if(plan=="''")
				{
					skipTenantWiseDetails+=parseInt(data.CheckedTenants);
				}
				else
				{
					skipTenantWiseDetails=parseInt(data.CheckedTenants);
				}
				$scope.TenantDetailList=tempTenantList;
				//loadCompanyRecurr(skip,take,reportName);
				//$scope.CompanyDetailList=data;
				$scope.reportsLoding=false;
				$scope.loadTenantReports=true;
				if(data.Tenants.length<takeTenantDetails)
				{
					$scope.loadTenantReports=false;
				}

			}).error(function(data){
				//console.log(data);
				$scope.loadTenantReports=false;
				$scope.reportsLoding=false;
			})
		}

		$scope.loadMoreTenantDetailReports = function () {

			$scope.moreReportsLoding=true;

			$charge.dashboard().getTenantInfoFilter(skipTenantWiseDetails,takeTenantDetails,'desc',fromTenatDate,toTenantDate,plan).success(function(data){
				//console.log(data);

				for (var i = 0; i < data.Tenants.length; i++) {
					//
					tempTenantList.push(data.Tenants[i]);
				}
				if(plan=="''")
				{
					skipTenantWiseDetails+=parseInt(data.CheckedTenants);
				}
				else
				{
					skipTenantWiseDetails=parseInt(data.CheckedTenants);
				}
				$scope.TenantDetailList=tempTenantList;
				//loadCompanyRecurr(skip,take,reportName);
				//$scope.CompanyDetailList=data;
				$scope.moreReportsLoding=false;
				if(data.Tenants.length<takeTenantDetails)
				{
					$scope.loadTenantReports=false;
				}

			}).error(function(data){
				//console.log(data);
				$scope.loadTenantReports=false;
				$scope.moreReportsLoding=false;
			})
		}

		$scope.resetTenantWiseFilters = function () {
			$scope.tenantDetailFilter={};
			$scope.tenantDetailFilter.from=$scope.tenantDetailFilter.from==undefined?yearbacktime:$scope.tenantDetailFilter.from;
			$scope.tenantDetailFilter.to=$scope.tenantDetailFilter.to==undefined?currntDay:$scope.tenantDetailFilter.to;

			skipTenantWiseDetails=0;
			$scope.TenantDetailList=[];
			tempTenantList=[];
			$scope.loadTenantReports=false;
			$scope.reportsLoding=false;
		}

		$scope.applyAppUsageFilter = function () {
			appUsageFilterType=$scope.appUsageFilter.type==undefined?'':$scope.appUsageFilter.type;
			tenantName=$scope.appUsageFilter.tenantName==undefined?'':$scope.appUsageFilter.tenantName;
			selectedAppName=$scope.appUsageFilter.appName==undefined?'':$scope.appUsageFilter.appName;
			usageAppType=$scope.appUsageFilter.appUsage==undefined?'':$scope.appUsageFilter.appUsage;

			$scope.showAppUsageReport=true;

			skipAppUsageDetails=0;
			$scope.TenantDetailList=[];
			tempTenantList=[];
			$scope.loadTenantReports=false;
			$scope.reportsLoding=true;

			if(appUsageFilterType=='tenant')
			{
				$charge.dashboard().getAppUsageTenantFilter(tenantName).success(function(data){
					//console.log(data);

					tempTenantList.push({
						Tenant:tenantName,
						AppInfo:data
					});
					$scope.TenantDetailList=tempTenantList;
					//loadCompanyRecurr(skip,take,reportName);
					//$scope.CompanyDetailList=data;
					$scope.reportsLoding=false;

				}).error(function(data){
					//console.log(data);
					$scope.reportsLoding=false;
				})
			}
			else if(appUsageFilterType=='app')
			{

			}
			else
			{
				$charge.dashboard().getAppUsageInfo(skipAppUsageDetails,takeTenantDetails,'desc').success(function(data){
					//console.log(data);

					for (var i = 0; i < data.length; i++) {
						//
						tempTenantList.push(data[i]);
					}
					skipAppUsageDetails+=takeTenantDetails;
					$scope.TenantDetailList=tempTenantList;
					//loadCompanyRecurr(skip,take,reportName);
					//$scope.CompanyDetailList=data;
					$scope.reportsLoding=false;
					$scope.loadTenantReports=true;
					if(data.length<takeTenantDetails)
					{
						$scope.loadTenantReports=false;
					}

				}).error(function(data){
					//console.log(data);
					$scope.loadTenantReports=false;
					$scope.reportsLoding=false;
				})
			}

		}

		$scope.loadMoreAppUsageReports = function () {

			$scope.moreReportsLoding=true;

			$charge.dashboard().getAppUsageInfo(skipAppUsageDetails,takeTenantDetails,'desc').success(function(data){
				//console.log(data);

				for (var i = 0; i < data.length; i++) {
					//
					tempTenantList.push(data[i]);
				}
				skipAppUsageDetails+=takeTenantDetails;
				$scope.TenantDetailList=tempTenantList;
				//loadCompanyRecurr(skip,take,reportName);
				//$scope.CompanyDetailList=data;
				$scope.moreReportsLoding=false;
				if(data.length<takeTenantDetails)
				{
					$scope.loadTenantReports=false;
				}

			}).error(function(data){
				//console.log(data);
				$scope.loadTenantReports=false;
				$scope.moreReportsLoding=false;
			})
		}

		$scope.clearFilterAppUsage = function () {
			$scope.appUsageFilter.tenantName="";
			$scope.appUsageFilter.appName="";
			$scope.appUsageFilter.appUsage="";
		}

		$scope.resetAppUsageFilters = function () {
			$scope.appUsageFilter={};

			skipAppUsageDetails=0;
			$scope.TenantDetailList=[];
			tempTenantList=[];
			$scope.loadTenantReports=false;
			$scope.reportsLoding=false;
		}

		function toggleinnerView(){
			if(vm.appInnerState === "default"){
				vm.appInnerState = "add";
				vm.pageTitle="View Invoices";
			}else{
				vm.appInnerState = "default";
				vm.pageTitle="Create New";
			}
		}

		//refresh reports view
		$scope.refresh = function () {
			$scope.searchReport = "";
			getAllReport();
		}

		//go to page up
		$scope.goToTop = function () {
			//$window.scrollTo(0, angular.element(document.getElementById('top')).offsetTop);
			//$window.scrollTo(0, 0);
			$location.hash('bottom');
			$anchorScroll();
		};



		//reportFilterCtrl.js

		$scope.isFiled = {
			loading: false,
			found: false
		};
		//back to home
		$scope.onClickBack = function () {
			$state.go('report');
			document.body.style.overflow = 'auto';
		};

		//#event handler
		//report event handler
		$scope.reportName = null;
		var eventHandler = {
			reportName: '',
			isReportLoad: false,
			isFiled: {
				loading: false,
				found: false
			},
			error: {
				isGetError: false,
				msg: ''
			},
			isFiledData: false,
			isDataFound: true
		};
		$scope.eventHandler = eventHandler;
		//end

		//#report filed
		//report data
		var reportFiledList = {
			UIDate: [],
			currentDateFiledName: [],
			loader: [],
			UITextBox: [],
			UIDropDown: [],
			UIElement: [],
			selectedDrpFiled: [],
			selectedDate: [],
			isDateFound: false,
			isDropDownFound: false,
			fromDate: '',
			toDate: '',
			cafDate: '',
			tags: [
				{id: 0, name: "SKY"},
				{id: 1, name: "SKY2"}],
			customerNames: [
				{id: 0, name: 'RAJESWARI N'},
				{id: 1, name: 'CHANDRASEKAR K'},
				{id: 2, name: 'ANITHA B'},
				{id: 3, name: 'ANANDALATCHOUMY S'},
				{id: 4, name: 'ANURADHA R'},
				{id: 5, name: 'VENKATESAN A'},
				{id: 6, name: 'MURUGESAN S'},
				{id: 7, name: 'GANESAN S'},
				{id: 8, name: 'THIRUMANGAI G'}
			]
		};
		$scope.reportFiledList = reportFiledList;
		$scope.reportLayout = false;
		var localStorage = [];

		//#private function
		//controller private function
		var privateFun = (function () {
			return {
				fireMsg: function (msgType, content) {
					if(msgType == '1')
					{
						var theme = 'success-toast';
					}
					else
					{
						var theme = 'error toast';
					}
					$mdToast.show(
						$mdToast.simple()
							.textContent(content)
							.position('top right')
							.hideDelay(3000)
							.theme(theme));
				},
				capitalise: function (string) {
					return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
				},
				waitLoadingFiled: function (filedName) {
					$scope.eventHandler.isFiledData = true;
					// $scope.isFiled.found = false;
					$scope.filedName = filedName;
				}
				,
				doneLoadedFiled: function () {
					$scope.eventHandler.isFiledData = false;
					// $scope.eventHandler.isDataFound = false;
					// $scope.isFiled.found = true;
				}
				,
				waitParameterRender: function () {
					$scope.isFiled.loading = true;
					$scope.isFiled.found = false;
					$scope.eventHandler.error.isGetError = false;
				}
				,
				doneParameterRender: function () {
					$scope.isFiled.loading = false;
					$scope.isFiled.found = true;
					$scope.eventHandler.error.isGetError = false;
				}
				,
				gotParameterRenderError: function () {
					$scope.isFiled.loading = false;
					$scope.eventHandler.error.isGetError = true;
				},
				clearAllUI: function () {
					$scope.reportFiledList.UIDate = [];
					$scope.reportFiledList.UITextBox = [];
					$scope.reportFiledList.UIDropDown = [];
					$scope.reportFiledList.selectedDrpFiled = [];
					$scope.reportFiledList.selectedDate = [];
				},
				doneReportLoad: function () {
					var reportName = $scope.eventHandler.reportName;
					$scope.eventHandler = {
						reportName: reportName,
						isDataFound: false,
						isReportLoad: false,
						isFiled: {
							loading: false,
							found: true
						},
						error: {
							isGetError: false
						}
					}
					$scope.reportFldLoading = false;

				},
				clearIframe: function () {
					$scope.eventHandler.isDataFound = true;
					$scope.eventHandler.isReportLoad = false;
					$scope.reportURL = '';
					var frame = $('#reportFram').get(0);
					frame.src = "";
				},
				getNumberOfMonth: function (month) {
					switch (month.toLowerCase()) {
						case "january":
							return '01';
							break;
						case "february":
							return '02';
							break;
						case "march":
							return '03';
							break;
						case "april":
							return '04';
							break;
						case "may":
							return '05';
							break;
						case "june":
							return '06';
							break;
						case "july":
							return '07';
							break;
						case "august":
							return '08';
							break;
						case "september":
							return '09';
							break;
						case "october":
							return '10';
							break;
						case "november":
							return '11';
							break;
						case "december":
							return '12';
							break;
						case "all":
							return '00';
							break;
					}
				}
			}
		})();
		//end

		//#oncreate #report
		$scope.onCreateReport = function () {
			//serverRequest.reportCreate();
		};


		//#dropDown change selected
		//drop down on change event select
		$scope.onChangeSelected = function (val, filedName) {
			//  var select_value = e.options[e.selectedIndex].text;
			// var select_value = filedName;

			//this function work on filedname must need month or months
			//get number of month
			var select_value = null;
			if (filedName == 'month' || filedName == "months" || filedName == "Months" || filedName == "Month") {
				select_value = privateFun.getNumberOfMonth(val);
			}
			else {
				select_value = val;
			}


			var currentVal = {
				data: $scope.reportFiledList.selectedDrpFiled,
				length: $scope.reportFiledList.selectedDrpFiled.length,
				filedName: filedName,
				value: select_value
			};

			var currentFiledAry = $scope.reportFiledList.selectedDrpFiled;
			for (var i = 0; i < currentFiledAry.length; i++) {
				if (currentFiledAry[i].filedName == currentVal.filedName) {
					$scope.reportFiledList.selectedDrpFiled[i].value = currentVal.value;
				}
			}

			var executeQueryAry = $scope.executeQueryAry;
			var findIndex = 0;
			for (var loop = 0; loop < executeQueryAry.length; loop++) {
				if (executeQueryAry[loop].ParamName == filedName) {
					findIndex = loop;
					findIndex++;
				}
			}

			//check next query isHierarchy
			//then true execute query
			if (findIndex < executeQueryAry.length) {
				if (executeQueryAry[findIndex].isHierarchy) {
					executeQryHandler.executeNextQuery(filedName, currentVal.value, findIndex);
				}
			}
		};//end

//#refresh
//refresh all data
		$scope.onClickRefresh = function () {

			privateFun.clearIframe();
			$scope.reportFiledList.selectedDate = [];
			$("md-select").val("");

			for (var i = 0; i < $scope.reportFiledList.UIDropDown.length; i++) {
				var dropDown=$scope.reportFiledList.UIDropDown[i];
				dropDown.selectedVal="";
			}
		};

//#onclick cancel filed load
		$scope.onClickStLoading = function () {
			privateFun.doneLoadedFiled();
		};

		//Initialize DashBoard Report to Start
		//$scope.loadFilterCategories('dashBoardReport.mrt');

		function maximizeReport(action) {
			action ? vm.showSidenav = false : vm.showSidenav = true
		}


//#server request
//Main function
//      var serverRequest = (function () {
//        var reqParameter = {
//          apiBase: configReport.Digin_Engine_API,
//          tomCatBase: configReport.apiTomcatBase,
//          token: '',
//          reportName: '',
//          queryFiled: '',
//          rptParameter: ''
//
//        };
//        var getSession = function () {
//          // reqParameter.token = '1290a2d5369b69ac6e82d63a7ae4901' //getCookie("securityToken");
//        };
//        var getReportName = function () {
//          //var reportName = $stateParams['reportNme'];
//          var reportName = reportNme;
//          if (reportName == null || reportName == '') {
//            alert('invalid report name');
//          } else {
//            reqParameter.reportName = reportName;
//            $scope.eventHandler.reportName = reportName;
//          }
//        };
//        var getToken = function() {
//          var _st = "8298aa106590a6329df1a35032e687cd";
//          var nameEQ = "securityToken=";
//          var ca = document.cookie.split(';');
//          //get the tenant security token
//          for (var i = 0; i < ca.length; i++) {
//            var c = ca[i];
//            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
//            if (c.indexOf(nameEQ) == 0){
//              _st = c.substring(nameEQ.length, c.length);
//            }
//          }
//          return _st;
//        };
//        var getTenantName = function() {
//          //
//          var name = "authData";
//          var value = "; " + document.cookie;
//          var parts = value.split("; " + name + "=");
//          var partsStr = parts.pop().split(";").shift();
//          console.log(partsStr);
//          var tenantName;
//          if(partsStr=="")
//          {
//            tenantName = 'devadmin.dev.cloudcharge.com';
//          }
//          else
//          {
//            tenantName = JSON.parse(decodeURIComponent(partsStr)).Domain;
//          }
//          console.log(tenantName);
//          return tenantName;
//        };
//
//        $scope.checkadmin=getTenantName();
//        //$scope.checkadmin='admin.dev.cloudcharge.com';
//
//        function checkUserAdminAuth(){
//          if($scope.checkadmin.split('.')[0].toLowerCase()=='admin')
//          {
//            $scope.isAdmin=true;
//          }
//        }
//        checkUserAdminAuth();
//
//        //get queries
//        var getQueries = function (reqParameter, response) {
//          var xhttp = new XMLHttpRequest();
//          xhttp.onreadystatechange = function () {
//            if (xhttp.readyState == 4 && xhttp.status == 200) {
//              response({'code': xhttp.status, 'data': xhttp.responseText});
//            } else {
//              response({'code': xhttp.status, 'data': xhttp.responseText});
//            }
//          };
//          xhttp.open("GET", reqParameter.apiBase + 'getQueries?SecurityToken=' + getToken() +
//          '&Domain=duosoftware.com&Reportname=' + reqParameter.reportName +
//          '&fieldnames={' + reqParameter.queryFiled + '}', true);
//          xhttp.send();
//        };
//
//        //Execute query
//        var getExecuteQuery = function (queryString, length, data) {
//          var db_name = getTenantName();
//          //var db_name = 'devadmin.dev.cloudcharge.com';
//          var xhr = new XMLHttpRequest();
//          xhr.onreadystatechange = function (e) {
//            if (xhr.readyState === 4) {
//              if (xhr.status === 200) {
//                data({'code': 200, 'length': length - 1, 'data': xhr.response});
//              } else {
//                console.error("XHR didn't work: ", xhr.status);
//                data({'code': xhr.status, 'data': xhr.status});
//              }
//            }
//          };
//          xhr.ontimeout = function () {
//            console.error("request timedout: ", xhr);
//            data({'code': 500, 'data': 'request timedout'});
//          };
//          xhr.open("GET", configReport.Digin_Engine_API + "executeQuery?query=" + encodeURIComponent(queryString) + "&SecurityToken=" + getToken() + "" +
//          "&Domain=duosoftware.com&db=mysql&db_name="+db_name, /*async*/ true);
//          xhr.send();
//        };
//
//        var bindingToData = function (res, filedName, list, length) {
//          if (res.code == 200) {
//            switch (list) {
//              case 'dropDown':
//                reportFiledList.UIDropDown[length].data.push(
//                  res.data.Result
//                );
//                break;
//            }
//          }
//        };
//        return {
//          getExecuteQuery: function (queryString, length, data) {
//            return getExecuteQuery(queryString, length, data);
//          },
//          getReportName: function () {
//            return getReportName();
//          },
//          getReportUIFromServer: function (eventHandler) {
//            //
//            getReportName();
//            getSession();
//            reqParameter.token = getToken();
//            privateFun.clearAllUI();
//            privateFun.waitParameterRender();
//            dynamicallyReportSrv.getReportUI(reqParameter).success(function (data) {
//              privateFun.doneParameterRender();
//              //store data in a local storage for refresh purpose
//              localStorage = data;
//              var loop = 0;
//              for (var d in data) {
//                if (Object.prototype.hasOwnProperty.call(data, d)) {
//                  var val = data[d];
//
//                  //get filed data
//                  var dynObject = {
//                    query: val.Query,
//                    label: val.Fieldname,
//                    fieldname: val.Fieldname,
//                    isHierarchy: val.isHierarchy,
//                    ParamName: val.ParamName,
//                    data: []
//                  };
//
//                  $scope.reportFiledList.selectedDrpFiled.push({
//                    'filedName': dynObject.fieldname,
//                    'value': '',
//                    'label': dynObject.label,
//                    'isHierarchy': dynObject.isHierarchy,
//                    'ParamName': dynObject.ParamName
//                  });
//
//                  angular.forEach(val, function (value, key) {
//                    var executeQueryAryObj = {
//                      id: '',
//                      filedName: '',
//                      query: '',
//                      label: '',
//                      state: false,
//                      isHierarchy: val.isHierarchy,
//                      ParamName: val.ParamName
//                    };
//
//                    switch (value) {
//                      case 'datepicker':
//                        reportFiledList.UIDate.push(dynObject);
//                        reportFiledList.currentDateFiledName.push(dynObject.fieldname);
//                        reportFiledList.isDateFound = true;
//                        break;
//                      case 'dropdown':
//                        //
//                        loop++;
//                        reportFiledList.UIDropDown.push(dynObject);
//                        reportFiledList.isDropDownFound = true;
//
//                        var length = reportFiledList.UIDropDown.length;
//
//                        executeQueryAryObj.id = loop;
//                        executeQueryAryObj.filedName = val.Label.toLowerCase();
//                        executeQueryAryObj.query = val.Query;
//                        $scope.executeQueryAry.push(executeQueryAryObj);
//
//
//                        //privateFun.waitLoadingFiled(val.Label.toLowerCase());
//                        var loaderIndex = 0;
//                        for (var l = 0; l < reportFiledList.UIDropDown.length; l++) {
//                          if (reportFiledList.UIDropDown[l].ParamName == val.ParamName) {
//                            loaderIndex = l;
//                            reportFiledList.UIDropDown[l].loader = true;
//                            l = reportFiledList.UIDropDown.length;
//                          }
//                        }
//                        getExecuteQuery(val.Query, length, function (res) {
//                          if (res.data == 500) {
//                            privateFun.fireMsg('0', 'Error 500 :' +
//                            ' Report filed load error...');
//                            $scope.$apply(function () {
//                              $scope.reportFiledList.UIDropDown[loaderIndex].loader = false;
//                            });
//                            return;
//                          }
//                          var jsonObj = JSON.parse(res.data);
//                          if (jsonObj.Is_Success == false){
//                            privateFun.fireMsg('0', 'Report filed load error...');
//                            $scope.$apply(function () {
//                              $scope.reportFiledList.UIDropDown[loaderIndex].loader = false;
//                            });
//                            return;
//                          }
//                          var filed = [];
//                          privateFun.doneLoadedFiled();
//                          for (var c in jsonObj.Result) {
//                            if (Object.prototype.hasOwnProperty.call(jsonObj.Result, c)) {
//                              val = jsonObj.Result[c];
//                              angular.forEach(val, function (value, key) {
//                                if (key == "value") {
//                                  if (value == "All") {
//                                    value = "00";
//                                  }
//                                }
//                                //  console.log(key + "," + value);
//                                if (value != "sort" && value != "1" && value != "2" && value != "3" && value != "4"
//                                  && value != "5" && value != "6" && value != "7" && value != "8"
//                                  && value != "9" && value != "10" && value != "11" && value != "12"
//                                  && value != "01" && value != "02" && value != "03" && value != "05"
//                                  && value != "04" && value != "13" && value != "00"
//                                  && value != "06" && value != "07" && value != "08" && value != "09") {
//                                  filed.push(value);
//                                }
//
//                              });
//                            }
//                          }
//                          $scope.$apply(function () {
//                            $scope.reportFiledList.UIDropDown[loaderIndex].loader = false;
//                            $scope.reportFiledList.UIDropDown[res.length].data = filed;
//                          });
//
//                        });
//                        break;
//                    }
//                  });
//                }
//              }
//              if ($scope.reportFiledList.UIDate.length > 0 || $scope.reportFiledList.UIDropDown.length > 0 ){
//                $scope.reportLayout = true;
//              }else{
//                $scope.reportLayout = false;
//              }
//            }).error(function (respose) {
//              privateFun.gotParameterRenderError();
//              $scope.reportLayout = false;
//            });
//          },
//          reportCreate: function () {
//            $scope.reportFldLoading = true;
//            privateFun.clearIframe();
//            $scope.reportURL = $sce.trustAsResourceUrl('');
//            var selDrpDwnObj = $scope.reportFiledList.selectedDrpFiled;
//            $scope.reportFiledList.selectedDate.From = moment($scope.reportFiledList.selectedDate.From).format('YYYY-MM-DD');
//            $scope.reportFiledList.selectedDate.To = moment($scope.reportFiledList.selectedDate.To).format('YYYY-MM-DD');
//            $scope.reportFiledList.selectedDate['Due Date'] = moment($scope.reportFiledList.selectedDate['Due Date']).format('YYYY-MM-DD');
//            var datePickerObj = $scope.reportFiledList.selectedDate;
//            //var datePickerObj =  ["2015-06-28","2016-08-28"]; //moment($scope.reportFiledList.selectedDate).format('YYYY-MM-DD').toString();
//
//
//            var UI = {
//              UIDate: $scope.reportFiledList.UIDate
//            };
//
//            //#report validation
//            // date validation
//            if ($scope.reportFiledList.isDateFound) {
//              var dateSelectEmpty = 0;
//              if (Object.keys(datePickerObj).length == 0) {
//                dateSelectEmpty = 2;
//              } else if (Object.keys(datePickerObj).length == 1) {
//                dateSelectEmpty = 2;
//              } else {
//                for (var c in  datePickerObj) {
//                  var temp = datePickerObj[c];
//                  if (temp == null || temp == "") {
//                    if (dateSelectEmpty != 2) {
//                      dateSelectEmpty++;
//                    }
//                  }
//                }
//              }
//              if (dateSelectEmpty == 2 || dateSelectEmpty == 1) {
//                privateFun.fireMsg('0', 'Error :' +
//                ' please select the report date parameter...');
//                privateFun.doneReportLoad();
//                return;
//              }
//              for(var c in datePickerObj){
//                if (! moment(datePickerObj[c], 'YYYY-MM-DD', true).isValid()){
//                  privateFun.fireMsg('0','Invalid Date format. The correct date format is YYYY-MM-DD');
//                  privateFun.doneReportLoad();
//                  return;
//                }
//              }
//              if ( datePickerObj.From > datePickerObj.To){
//                privateFun.fireMsg('0','From date is greater than To date');
//                privateFun.doneReportLoad();
//                return;
//              }
//            }
//
//            //drop down validation
//            var validationState = true;
//            var loop;
//            loop = $scope.reportFiledList.isDateFound ? 2 : 0;
//            if ($scope.reportFiledList.isDropDownFound) {
//              for (loop; loop < selDrpDwnObj.length; loop++) {
//                if (selDrpDwnObj[loop].value == "" || selDrpDwnObj[loop].value == null ) {
//                  validationState = false;
//                }
//              }
//              if (validationState == false) {
//                privateFun.fireMsg('0', 'Error :' +
//                ' please select the report  parameter...');
//                privateFun.doneReportLoad();
//                return;
//              }
//            }
//            var getTimeOut = function(){
//              if ( $scope.reportFldLoading == true ){
//                var confirm = $mdDialog.confirm()
//                  .textContent('It is taking too long to load the report. Do you want to cancel and try again?')
//                  .ok('Yes')
//                  .cancel('No')
//                  .clickOutsideToClose(true);
//                $mdDialog.show(confirm).then(function() {
//                  $scope.onClickRefresh()
//                }, function() {
//                });
//              }
//            }
//
//            setTimeout(function() {
//              getTimeOut();
//            }, 300000);
//
//            getReportName();
//            getSession();
//            reqParameter.rptParameter = '';
//
//            //check date parameter
//            for (var c in datePickerObj) {
//              var val = datePickerObj[c];
//              for (var i = 0; i < selDrpDwnObj.length; i++) {
//                if (selDrpDwnObj[i]['filedName'] == c) {
//                  selDrpDwnObj[i]['value'] = val;
//                }
//              }
//            }
//
//            //create drop down report parameter
//            for (var i = 0; i < selDrpDwnObj.length; i++) {
//              if (i == 0) {
//                reqParameter.rptParameter = '{"' + selDrpDwnObj[i]['ParamName'] + '" : ' +
//                '"' + selDrpDwnObj[i]['value'] + '"}';
//              }
//              else {
//                reqParameter.rptParameter = reqParameter.rptParameter + ',{"' + selDrpDwnObj[i]['ParamName'] + '" : ' +
//                '"' + selDrpDwnObj[i]['value'] + '"}';
//              }
//            }//end
//            var reportName = $scope.eventHandler.reportName;
//            //HTTP get report
//            $scope.eventHandler = {
//              reportName: reportName,
//              isDataFound: false,
//              isReportLoad: true,
//              isFiled: {
//                loading: true,
//                found: false
//              }
//            };
//            dynamicallyReportSrv.getRenderReport(reqParameter).success(function (data) {
//              var reportLink = data;
//              privateFun.doneReportLoad();
//              $scope.reportURL = $sce.trustAsResourceUrl(reportLink);
//            }).error(function (res) {
//              privateFun.doneReportLoad();
//
//            });
//          }
//        }
//      })();
		//serverRequest.getReportUIFromServer(eventHandler);
		$scope.toggle = function (item, list) {
			var idx = list.indexOf(item);
			if (idx > -1) list.splice(idx, 1);
			else list.push(item);
		};


//test code
		$scope.noResultsTag = null;
		$scope.addTag = function () {
			$scope.tags.push({
				id: $scope.tags.length,
				name: $scope.noResultsTag
			});
		};
		$scope.$watch('noResultsTag', function (newVal, oldVal) {
			if (newVal && newVal !== oldVal) {
				$timeout(function () {
					var noResultsLink = $('.select2-no-results');
					//console.log(noResultsLink.contents());
					$compile(noResultsLink.contents())($scope);
				});
			}
		}, true);


//select report parameter
		$scope.selectedVal = null;


//#execute query handler
		$scope.executeQueryAry = [];
		var executeQryHandler = (function () {
			return {
				executeNextQuery: function (filedName, selectedVal, findIndex) {
					//console.log(filedName);
					//console.log(selectedVal);
					var executeQueryAry = $scope.executeQueryAry;
					for (var i = 0; i < executeQueryAry.length; i++) {
						var nextRequst = i;
						nextRequst++;
						var length = $scope.reportFiledList.UIDropDown.length
						if (executeQueryAry[i].ParamName == filedName &&
							nextRequst != executeQueryAry.length) {
							if (i != executeQueryAry.length) {
								if (executeQueryAry[i].query != "") {

									//#nextquery
									var nextQuery = executeQueryAry[nextRequst].query;
									//var replaceTxt = privateFun.capitalise(filedName);
									var replaceTxt = '${' + filedName + '}';
									var nextQuery = nextQuery.replace(replaceTxt, "'" + selectedVal + "'");
									//nextQuery = nextQuery.replace('All', selectedVal);

									//loader
									var loaderIndex = 0;
									for (var l = 0; l < reportFiledList.UIDropDown.length; l++) {
										if (reportFiledList.UIDropDown[l].ParamName == executeQueryAry[nextRequst].filedName) {
											loaderIndex = l;
											reportFiledList.UIDropDown[l].loader = true;
											l = reportFiledList.UIDropDown.length;
										}
									}

									serverRequest.getExecuteQuery(nextQuery, length, function (res) {
										if (res.data == 500) {
											var result  = res.data;
											privateFun.fireMsg('0', 'Error 500 :' +
												' Report filed load error...');
											reportFiledList.UIDropDown[loaderIndex].loader = false;
											return;
										}
										var jsonObj = JSON.parse(res.data);
										var filed = [];
										var foundArray = 0
										if (jsonObj.Result.length != 0) {
											for (var c in jsonObj.Result) {
												if (Object.prototype.hasOwnProperty.call(jsonObj.Result, c)) {
													var val = jsonObj.Result[c];
													angular.forEach(val, function (value, key) {
														//console.log(key + "," + value);
														if (key == "value") {
															if (value == "All") {
																value = "00";
															}
														}
														//  console.log(key + "," + value);
														if (value != "sort" && value != "1" && value != "2" && value != "3" && value != "4"
															&& value != "5" && value != "6" && value != "7" && value != "8"
															&& value != "9" && value != "10" && value != "11" && value != "12"
															&& value != "01" && value != "02" && value != "03" && value != "05"
															&& value != "04" && value != "13" && value != "00"
															&& value != "06" && value != "07" && value != "08" && value != "09") {
															filed.push(value);
														}
													});
												}
											}
											$scope.$apply(function () {
												$scope.reportFiledList.UIDropDown[loaderIndex].loader = false;
												$scope.reportFiledList.UIDropDown[findIndex].data = filed;
											});

										} else {
											privateFun.fireMsg('1', 'Data not found..');

										}

									});
								}

							}

						}
					}
				}
			};
		})();

		$scope.goToTop = function () {
			$window.scrollTo(0, angular.element(document.getElementById('top')).offsetTop);
			$window.scrollTo(0, 0);
			//$location.hash('bottom');
			//$anchorScroll();
		};


		//Export Reports==========================================================

		$scope.reportExportXSL = function () {
			var report = new Blob([document.getElementById('reports-exportable').innerHTML], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
			});
			saveAs(report, "CloudCharge.xls");
		}
		//$scope.reportExportPDF = function () {
		//  var report = new Blob([document.getElementById('finance-exportable').innerHTML], {
		//    type: "application/pdf.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
		//  });
		//  saveAs(report, "Report Test.xls");
		//}
	}
})();
