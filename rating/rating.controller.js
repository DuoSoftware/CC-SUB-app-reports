////////////////////////////////
// App : Plans
// File : Plans Controller
// Owner  : GihanHerath
// Modified by  : Kasun
// Modified date : 2017/02/15
// Version : 6.0.1.0
/////////////////////////////////

(function ()
{
	'use strict';

	angular
		.module('app.rating')
		.controller('RatingController', RatingController);

	/** @ngInject */
	function RatingController($scope, $timeout, $mdDialog, $http, $mdMedia, $mdSidenav, $filter, $charge, $errorCheck, notifications, $azureSearchHandle, logHelper, $rootScope)
	{
		var vm = this;

		vm.appInnerState = "default";
		vm.pageTitle="Create Rating";
		vm.checked = [];
		vm.colors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg'];

		vm.selectedPlan = {};
		vm.toggleSidenav = toggleSidenav;

		vm.responsiveReadPane = undefined;
		vm.activeInvoicePaneIndex = 0;
		vm.dynamicHeight = false;

		vm.scrollPos = 0;
		vm.scrollEl = angular.element('#content');
		vm.selectedMailShowDetails = false;

		// Methods
		vm.closeReadPane = closeReadPane;
		vm.addInvoice = toggleinnerView;
		vm.changePlans = changePlans;
		vm.billingCycleHandler = billingCycleHandler;
		vm.selectRating = selectRating;

		$scope.showFilers=true;
		$scope.isReadLoaded;
		$scope.items = [];

		$scope.BaseCurrency = "";
		$scope.currencyRate = 1;
		// $scope.decimalPoint = 2;
		$scope.content={};
		//////////

		// Watch screen size to activate responsive read pane
		$scope.$watch(function ()
		{
			// console.log($scope.embedHovered);
			angular.element('.embed-btn').mouseenter(function () {
				// angular.element('#subscriptionPlan').addClass('embed-content');
				$scope.embedHovered = true;
			});
			angular.element('.embed-btn').mouseleave(function () {
				// angular.element('#subscriptionPlan').removeClass('embed-content');
				$scope.embedHovered = false;
			});

			if($scope.embedFormCopied || vm.embedFormCopied){
				$timeout(function(){
					$scope.coppiedTimeout = vm.coppiedTimeout = true;
				},2000);
			}else{
				$scope.coppiedTimeout = vm.coppiedTimeout = false;
			}

			var embedCode = document.getElementsByClassName('embed-code');
			// if(embedCode != undefined){
			// 	angular.forEach(embedCode, function (e) {
			// 		hljs.highlightBlock(e);
			// 	});
			// }

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

		function getDomainName() {
			var _st = gst("currentDomain");
			var __st = gst("domain");
			return (_st != null) ? _st : __st; //"248570d655d8419b91f6c3e0da331707 51de1ea9effedd696741d5911f77a64f";
		}

		function getDomainExtension() {
			var _st = gst("extension_mode");
			if(_st=="sandbox" || _st=="ssandbox"){
				_st="test";
			}
			return (_st != null) ? _st : "test"; //"248570d655d8419b91f6c3e0da331707 51de1ea9effedd696741d5911f77a64f";
		}

		/**
		 * Close read pane
		 */
		function closeReadPane()
		{
			if(vm.addFeatureForm.$pristine && vm.addFeatureForm.$dirty ){
				var confirm = $mdDialog.confirm()
					.title('Are you sure?')
					.textContent('Fields have changed and you might have unsaved data. Are you sure you want to leave this page?')
					.ariaLabel('Are you sure?')
					.targetEvent()
					.ok('Yes')
					.cancel('Stay');

				$mdDialog.show(confirm).then(function() {
					vm.addFeatureForm.$pristine = false;
					vm.addFeatureForm.$dirty = false;
					$scope.editOff = false;
					vm.pageTitle = "Create Rating";
				}, function() {
				});
			}else {
				$scope.editOff = false;
				vm.activePlanPaneIndex = 0;
			}

			$timeout(function ()
			{
				vm.scrollEl.scrollTop(vm.scrollPos);
			}, 650);
			$scope.showFilers=true;
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

		function toggleinnerView(state){
			if(vm.appInnerState === "default"){
				vm.appInnerState = "add";
				vm.pageTitle="View current Rating";
				$scope.showFilers=false;
			}else{
				vm.appInnerState = "default";
				vm.pageTitle="Change Rating";
			}
		}

		function selectRating(feature)
		{
			$scope.openRatingLst(feature);
			vm.showFilters=false;
			$scope.showInpageReadpane = true;
			//$timeout(function ()
			//{
			//  vm.activePlanPaneIndex = 1;
			//
			//  // Store the current scrollPos
			//  vm.scrollPos = vm.scrollEl.scrollTop();
			//
			//  // Scroll to the top
			//  vm.scrollEl.scrollTop(0);
			//});
		}

		$scope.openRatingLst = function(feature) {
			//$scope.isReadLoaded = false;taxgroupcode
			$scope.inpageReadPaneEdit = false;
			$scope.isReadLoaded = false;
			vm.selectedFeature = feature;
			$scope.loadPlansForFeature(feature);

			$scope.isReadLoaded = true;

		};

		$scope.planListForFeature=[];
		$scope.planListForFeatureLoaded=true;

		$scope.loadPlansForFeature = function(feature) {

			$scope.planListForFeatureLoaded=false;
			vm.planFeatureLinkingEnabled = false;
			$scope.planListForFeature=[];
			$charge.plan().getPlansForFeature(feature.featureCode).success(function(data){
				//console.log(data);
				$scope.planListForFeature = data;
				$scope.planListForFeatureLoaded=true;
			}).error(function(data) {
				//console.log(data);
				$scope.planListForFeature=[];
				$scope.planListForFeatureLoaded=true;
			});

		};

		vm.planFeatureLinkingEnabled = false;
		$scope.linkFeaturePlans = function() {
			vm.planFeatureLinkingEnabled = true;
			vm.selectedPlanForLink="";
			vm.overwriteFeatureEnabled = false;
			$scope.plansAddedForLinkList=[];
		}

		$scope.plansAddedForLinkList=[];
		$scope.addPlanToLinkList = function(plan) {
			if(plan!="")
			{
				var alreadyAdded = false;
				for(var i=0;i<$scope.plansAddedForLinkList.length;i++)
				{
					if($scope.plansAddedForLinkList[i]==plan)
					{
						alreadyAdded = true;
						notifications.toast("Plan already added", "error");
						vm.selectedPlanForLink="";
						break;
					}
				}

				if(!alreadyAdded)
				{
					$scope.plansAddedForLinkList.push(plan);
					vm.selectedPlanForLink="";
				}
			}
			else
			{
				notifications.toast("Please select a valid plan", "error");
			}
		}

		vm.overwriteFeatureEnabled = false;
		$scope.overwriteFeature = function() {
			vm.overwriteFeatureEnabled = true;
			vm.uoms=$scope.UOMs;
			vm.featureOverwriteObj = angular.copy(vm.selectedFeature);
		}

		$scope.overwriteFeatureCancel = function() {
			vm.overwriteFeatureEnabled = false;
		}

		vm.submitted = false;

		$scope.addPlansToFeature = function() {
			vm.submitted = true;
			if($scope.plansAddedForLinkList.length!=0)
			{
				for(var i=0;i<$scope.planListForFeature.length;i++)
				{
					var featurePlanObj = $scope.planListForFeature[i];
					for(var j=0;j<$scope.plansAddedForLinkList.length;j++)
					{
						if(featurePlanObj.code==$scope.plansAddedForLinkList[j].code)
						{
							$scope.plansAddedForLinkList.splice(j,1);
							break;
						}
					}
				}

				if($scope.plansAddedForLinkList.length!=0)
				{
					var guplanids = [];
					var newPlanLinkObj = {};
					for(var i=0;i<$scope.plansAddedForLinkList.length;i++)
					{
						guplanids.push($scope.plansAddedForLinkList[i].guPlanID);
					}

					if(vm.overwriteFeatureEnabled)
					{
						var priceschemeOverwrite = [];

						var priceSchemeObj=vm.featureOverwriteObj;
						if(priceSchemeObj.type == "FIXED")
						{
							priceSchemeObj.scheme[0].type="FIXED";
							priceSchemeObj.scheme[0].unitsFrom=priceSchemeObj.unitsFrom;
							priceSchemeObj.scheme[0].unitsTo=priceSchemeObj.unitsTo;
							priceSchemeObj.scheme[0].unitUom=priceSchemeObj.unitUom;
							priceSchemeObj.scheme[0].price=priceSchemeObj.price;
							priceSchemeObj.scheme[0].uom=priceSchemeObj.uom;
							priceSchemeObj.scheme[0].autoTermination=priceSchemeObj.autoTermination;
							priceSchemeObj.scheme[0].costPerUnitAdd=priceSchemeObj.costPerUnitAdd!=undefined?priceSchemeObj.costPerUnitAdd:"";

							for (var k = 1; k < priceSchemeObj.scheme.length; k++) {
								priceSchemeObj.scheme.splice(k, 1);
							}
						}
						else if(priceSchemeObj.type == "SLAB")
						{
							for (var j = 0; j < priceSchemeObj.scheme.length; j++) {
								var slabObj=priceSchemeObj.scheme[j];
								slabObj.type="SLAB";
								slabObj.costPerUnitAdd=slabObj.costPerUnitAdd!=undefined?slabObj.costPerUnitAdd:"";
							}
						}
						else if(priceSchemeObj.type == "optional")
						{
							priceSchemeObj.scheme[0].type="";
							priceSchemeObj.scheme[0].unitsFrom="";
							priceSchemeObj.scheme[0].unitsTo="";
							priceSchemeObj.scheme[0].unitUom="";
							priceSchemeObj.scheme[0].price="";
							priceSchemeObj.scheme[0].uom="";
							priceSchemeObj.scheme[0].autoTermination="";
							priceSchemeObj.scheme[0].costPerUnitAdd="";

							for (var k = 1; k < priceSchemeObj.scheme.length; k++) {
								priceSchemeObj.scheme.splice(k, 1);
							}
						}

						var priceSchemeOWObj = {
							"featureCode":priceSchemeObj.featureCode,
							"scheme":priceSchemeObj.scheme
						};
						priceschemeOverwrite.push(priceSchemeOWObj);

						newPlanLinkObj = {
							"guPlanIDs": guplanids,
							"priceScheme":[vm.selectedFeature.featureCode],
							"priceSchemeOverwrite": priceschemeOverwrite
						};

					}
					else
					{
						newPlanLinkObj = {
							"guPlanIDs": guplanids,
							"priceScheme":[vm.selectedFeature.featureCode]
						};
					}

					$charge.plan().addPlansToLinkFeature(newPlanLinkObj).success(function(data){
						//console.log(data);
						notifications.toast("Successfully Plans linked with the Feature", "success");
						vm.submitted = false;
						vm.planFeatureLinkingEnabled = false;
						$scope.loadPlansForFeature(vm.selectedFeature);
					}).error(function(data) {
						//console.log(data);
						notifications.toast("Plans link to Feature failed", "error");
						vm.submitted = false;
					});

				}
				else
				{
					notifications.toast("No new Plan has selected to be linked", "error");
					vm.submitted = false;
				}
			}
			else
			{
				notifications.toast("No Plans has selected to be linked", "error");
				vm.submitted = false;
			}
		}

		var self = this;
		// list of `state` value/display objects
		//self.tenants        = loadAll();
		self.selectedItem  = null;
		self.searchText    = "";
		self.querySearch   = querySearch;

		function querySearch (query) {

			//Custom Filter
			var results=[];
			var len=0;
			for (var i = 0, len = $scope.planlist.length; i<len; ++i){
				//console.log($scope.allBanks[i].value.value);

				if($scope.planlist[i].name.toLowerCase().indexOf(query.toLowerCase()) !=-1)
				{
					results.push($scope.planlist[i]);
				}
				else if($scope.planlist[i].code.toLowerCase().indexOf(query.toLowerCase()) !=-1)
				{
					results.push($scope.planlist[i]);
				}

			}
			return results;
		}

		vm.selectedPlanForLink="";
		$scope.planlist = [];
		var skipPlans=0;
		var takePlans=2;
		$scope.loadingPlans = false;
		$scope.loadAllPlans = function() {
			$scope.loadingPlans = true;
			$azureSearchHandle.getClient().SearchRequest("plan",skipPlans,takePlans,'desc','Active').onComplete(function(Response)
			{
				if($scope.loadingPlans)
				{
					skipPlans += takePlans;

					for (var i = 0; i < Response.length; i++) {
						Response[i].createdDate = $filter('date')(new Date(Response[i].createdDate), 'yyyy-MM-dd', false);
						$scope.planlist.push(Response[i]);
					}

					$scope.loadingPlans = false;

					if(Response.length=takePlans){
						$scope.loadAllPlans();
					}

				}

			}).onError(function(data)
			{
				//console.log(data);
				$scope.loadingPlans = false;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='rating';
				logHelper.error( $scope.infoJson);
			});
		}
		$scope.loadAllPlans();

		function changePlans(){
			toggleinnerView('add');
		}

		function submit(){
			toggleinnerView('add');
		}

		$charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","BaseCurrency").success(function(data) {
			$scope.BaseCurrency=data[0].RecordFieldData;
			//$scope.selectedCurrency = $scope.BaseCurrency;

		}).error(function(data) {
			//console.log(data);
			$scope.BaseCurrency="USD";
			//$scope.selectedCurrency = $scope.BaseCurrency;
		})

		$scope.prefferedCurrencies=[];
		$charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","FrequentCurrencies").success(function(data) {
			$scope.prefferedCurrencies=data[0].RecordFieldData.trimLeft().split(" ");
		}).error(function(data) {
			//console.log(data);
		})

		$scope.planTypeList=[];
		$charge.settingsapp().getDuobaseFieldsByTableNameAndFieldName("CTS_PlanAttributes", "PlanType").success(function (data) {
			var length = data.length;
			// debugger;
			$scope.planTypeList=[];
			for (var i = 0; i < length; i++) {
				for (var j = 0; j < data[i].length; j++) {
					var obj = data[i][j];
					if (obj.ColumnIndex == "0") {
						$scope.planTypeList.push(obj);

					}
				}
			}
		}).error(function (data) {
		})

		$charge.settingsapp().getDuobaseValuesByTableName("CTS_GeneralAttributes").success(function(data) {
			$scope.decimalPoint = parseInt(data[6].RecordFieldData);
		}).error(function (data) {

		});
		$scope.taxGroup=[];
		var skipGrp= 0,takeGrp=100;

		$charge.tax().allgroups(skipGrp,takeGrp,"asc").success(function(data) {
			//
			skipGrp += takeGrp;
			//console.log(data);
			//if($scope.loading) {
			// returned data contains an array of 2 sentences
			for (var i = 0; i < data.length; i++) {
				$scope.taxGroup.push(data[i]);

			}
		}).error(function(data) {
			//console.log(data);
			$scope.infoJson= {};
			$scope.infoJson.message =JSON.stringify(data);
			$scope.infoJson.app ='plans';
			logHelper.error( $scope.infoJson);
		})

		function billingCycleHandler(selection){
			if(selection=='fixed'){
				$scope.showNoOfCycles = true;
			}else{
				$scope.showNoOfCycles = false;
			}
		}

		$scope.$watch(function () {
			var elem = document.querySelector('#billingFrqCurrency');
			var elem2 = document.querySelector('#billingFrqCurrencyEdit');
			if(elem != null){
				if(elem.innerText != ""){
					var innerCurr = elem.innerText.split('0')[0];
					document.querySelector('#billingFrqCurrency').innerText = innerCurr;
				}
			}
			if(elem2 != null) {
				if (elem2.innerText != "") {
					var innerCurr2 = elem2.innerText.split('0')[0];
					document.querySelector('#billingFrqCurrencyEdit').innerText = innerCurr2;
				}
			}
			vm.planContentHeight = window.innerHeight - 145;
		});

		$scope.updateScroll = function (state) {
			var elem3 = document.getElementById('createPlanContent');
			var elem4 = document.getElementById('updatePlanContent');
			if(elem3 != undefined && state == 'create'){
				$timeout(function(){
					elem3.scrollTop = elem3.scrollHeight;
				});
			}
			if(elem4 != undefined && state == 'edit'){
				$timeout(function(){
					elem4.scrollTop = elem4.scrollHeight;
				});
			}
		};

		$scope.toggleEdit = function () {

			$scope.editOff = true;
			vm.pageTitle = "View Rating";


			vm.activePlanPaneIndex = 1;
			$scope.showInpageReadpane = false;
			$scope.selectMultiplePlansForEmbedForm = false;
			// }
		};

		$scope.sortBy = function(propertyName,status,property) {
			if(propertyName == 'unitPrice'){
				angular.forEach(vm.plans, function (plan) {
					plan.unitPrice = parseInt(plan.unitPrice);
				});
			}
			vm.plans=$filter('orderBy')(vm.plans, propertyName, $scope.reverse);
			$scope.reverse =!$scope.reverse;

			if(status!=null) {
				if(property=='Name')
				{
					$scope.showName = status;
					$scope.showCode = false;
					$scope.showDate = false;
					$scope.showPrice = false;
					$scope.showState = false;
				}
				if(property=='Code')
				{
					$scope.showName = false;
					$scope.showCode = status;
					$scope.showDate = false;
					$scope.showPrice = false;
					$scope.showState = false;
				}
				if(property=='Date')
				{
					$scope.showName = false;
					$scope.showCode = false;
					$scope.showDate = status;
					$scope.showPrice = false;
					$scope.showState = false;
				}
				if(property=='Price')
				{
					$scope.showName = false;
					$scope.showCode = false;
					$scope.showDate = false;
					$scope.showPrice = status;
					$scope.showState = false;
				}
				if(property=='Status')
				{
					$scope.showName = false;
					$scope.showCode = false;
					$scope.showDate = false;
					$scope.showPrice = false;
					$scope.showState = status;
				}
			}
		};

		$scope.showMoreUserInfo=false;
		$scope.contentExpandHandler = function () {
			$scope.reverseMoreLess =! $scope.reverseMoreLess;
			if($scope.reverseMoreLess){
				$scope.showMoreUserInfo=true;
			}else{
				$scope.showMoreUserInfo=false;
			}
		};

		$scope.showInpageReadpane = false;
		$scope.switchInfoPane = function (state, feature) {
			if($scope.selectMultiplePlansForEmbedForm){
				feature.selectForEmbed = !feature.selectForEmbed;
			}else {
				if (state == 'show') {
					$scope.showInpageReadpane = true;
					$scope.editOff = false;
					$scope.showEmbedForm = false;
					$scope.$watch(function () {
						//vm.selectedPlan = plan;
					});
					$scope.openRatingLst(feature);
				} else if (state == 'close') {
					if ($scope.inpageReadPaneEdit) {
						$scope.cancelEdit();
						vm.selectedFeature = angular.copy($scope.tempEditFeature);
					} else {
						$scope.showInpageReadpane = false;
						$scope.inpageReadPaneEdit = false;
					}
				}
			}
		}

		$scope.tempEditPlan=[];
		$scope.editPlan = function (feature) {
			$scope.tempEditFeature=angular.copy(feature);
			vm.editSelectedFeature = feature;
			//debugger;

			$scope.inpageReadPaneEdit=true;
		};

		$scope.cancelEdit = function () {
			vm.editPlanForm.$pristine = false;
			vm.editPlanForm.$dirty = false;
			$scope.inpageReadPaneEdit=false;
			$scope.clearform("");
		}


		$scope.isLoading = true;
		$scope.isdataavailable=true;
		$scope.hideSearchMore=false;
		$scope.priceSchemeFeatureList=[];
		$scope.items=[];

		$scope.more = function(){

			$scope.isLoading = true;

			$scope.priceSchemeFeatureList=[];
			$scope.items=[];
			$scope.loadingPriceSchemeFeatures = true;
			$charge.plan().allFeatures().success(function(data)
			{
				//console.log(data);

				if($scope.loadingPriceSchemeFeatures)
				{
					angular.forEach(data, function(scheme){
						//$scope.priceSchemeFeatureList.push(scheme[0]);
						var featureObj = {};

						if(scheme[0].type=="FIXED")
						{
							featureObj.feature=scheme[0].feature;
							featureObj.featureCode=scheme[0].featureCode;
							featureObj.type=scheme[0].type;
							featureObj.unitsFrom=scheme[0].unitsFrom!=""?parseInt(scheme[0].unitsFrom):"";
							featureObj.unitsTo=scheme[0].unitsTo!=""?parseInt(scheme[0].unitsTo):"";
							featureObj.unitUom=scheme[0].unitUom;
							featureObj.price=scheme[0].price!=""?parseInt(scheme[0].price):"";
							featureObj.uom=scheme[0].uom;
							featureObj.autoTermination=scheme[0].autoTermination=="1"?true:false;
							featureObj.costPerUnitAdd=parseInt(scheme[0].costPerUnitAdd);

							featureObj.scheme = [];

							var slabObj = {};
							//featureObj.productlst = angular.copy($scope.productlist);
							slabObj.type = "SLAB";
							slabObj.autoTermination = true;
							featureObj.scheme.push(slabObj);

							$scope.items.push(featureObj);
						}
						else if(scheme[0].type=="SLAB")
						{
							featureObj.feature=scheme[0].feature;
							featureObj.featureCode=scheme[0].featureCode;
							featureObj.type=scheme[0].type;
							featureObj.autoTermination = scheme[0].autoTermination=="1"?true:false;

							featureObj.scheme = [];
							for (var i = 0; i < scheme.length; i++) {
								var slabObj = {};
								slabObj.type = "SLAB";
								slabObj.unitsFrom = scheme[i].unitsFrom!=""?parseInt(scheme[i].unitsFrom):"";
								slabObj.unitsTo = scheme[i].unitsTo!=""?parseInt(scheme[i].unitsTo):"";
								slabObj.unitUom = scheme[i].unitUom;
								slabObj.price = scheme[i].price!=""?parseInt(scheme[i].price):"";
								slabObj.uom = scheme[i].uom;
								slabObj.autoTermination = scheme[i].autoTermination=="1"?true:false;
								slabObj.costPerUnitAdd = parseInt(scheme[i].costPerUnitAdd);
								featureObj.scheme.push(slabObj);
							}

							$scope.items.push(featureObj);
						}
						else
						{
							featureObj.feature=scheme[0].feature;
							featureObj.featureCode=scheme[0].featureCode;
							featureObj.type="optional";
							featureObj.unitsFrom=scheme[0].unitsFrom!=""?parseInt(scheme[0].unitsFrom):"";
							featureObj.unitsTo=scheme[0].unitsTo!=""?parseInt(scheme[0].unitsTo):"";
							featureObj.unitUom=scheme[0].unitUom;
							featureObj.price=scheme[0].price!=""?parseInt(scheme[0].price):"";
							featureObj.uom=scheme[0].uom;
							featureObj.autoTermination=true;
							featureObj.costPerUnitAdd=parseInt(scheme[0].costPerUnitAdd);

							featureObj.scheme = [];

							var slabObj = {};
							//featureObj.productlst = angular.copy($scope.productlist);
							slabObj.type = "SLAB";
							slabObj.autoTermination = true;
							featureObj.scheme.push(slabObj);

							$scope.items.push(featureObj);
						}

					});

					$timeout(function () {
						$scope.priceSchemeFeatureList = $scope.items;
					});

					$scope.loadingPriceSchemeFeatures = false;
					$scope.isLoading = false;
					$scope.isdataavailable=false;
					$scope.hideSearchMore=true;

				}

			}).error(function(data)
			{
				$scope.loadingPriceSchemeFeatures = false;
				$scope.isLoading = false;
				$scope.isdataavailable=false;
				$scope.hideSearchMore=true;

				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='rating';
				logHelper.error( $scope.infoJson);
			})

		};
		// we call the function twice to populate the list
		$scope.more();

		$scope.applyFilters = function (filter){
			$scope.items = [];
			$scope.loading=true;
			$scope.more();
		}

		$scope.getCatLetter=function(catName){
			try{
				var catogeryLetter = "app/core/cloudcharge/img/material_alperbert/avatar_tile_"+catName.charAt(0).toLowerCase()+"_28.png";
			}catch(exception){}
			return catogeryLetter;
		};
		//$scope.loadUiShareData=[];

		$scope.clearform = function (planType){
			$scope.content={};
			if(planType!="")
			{
				$scope.content.type=planType;
			}
			vm.editSelectedPlan={};
			$scope.content.billingCycleType="auto";
			$scope.content.trailDays=30;
			billingCycleHandler("auto");
		}

		$scope.UOMs = [];
		$scope.getAllUOM = function (){
			$charge.uom().getAllUOM('Plan_123').success(function (data) {
				$scope.UOMs = [];
				//
				//console.log(data);
				for (var i = 0; i < data.length; i++) {
					//
					$scope.UOMs.push(data[i]);
					//
				}
				//$mdDialog.hide($scope.UOMs);
			}).error(function (data) {
				//console.log(data);
				$scope.infoJson= {};
				$scope.infoJson.message =JSON.stringify(data);
				$scope.infoJson.app ='rating';
				logHelper.error( $scope.infoJson);
			})
		}
		$scope.getAllUOM();


		//$scope.features=[];
		vm.features={};

		$scope.openFeatureDialog = function (mode, feature) {

			vm.uoms=$scope.UOMs;
			vm.mode=mode;

			vm.featureType='';
			vm.addNewUOM=false;

			if(mode=="Add")
			{
				vm.closeAdvanceFeatures(vm.features);
				$scope.addNewRow(vm.features);
			}
			else if(mode=="Update")
			{
				//$scope.addNewRow(vm.features);
				vm.features=feature;

				$timeout(function () {
					vm.advancedFeaturesConfirmed = true;
					vm.loaded = true;
				});

				vm.featureType=vm.features.type;
				if(vm.featureType!='optional')
				{
					vm.advancedFeaturesConfirmed = true;
					vm.showAdvanceFeatures = true;
					//vm.setAdvanceFeatures(vm.features);
					//vm.closeAdvanceFeatures(vm.features);
					$scope.setFeature(vm.features, vm.featureType);
				}
				else
				{
					vm.closeAdvanceFeatures(vm.features);
				}

			}
			$scope.toggleEdit();

			//$mdDialog.show({
			//	controller: 'AddFeaturesRatingController as vm',
			//	templateUrl: 'app/main/rating/dialogs/features/addFeature.html',
			//	targetEvent: this,
			//	clickOutsideToClose:false,
			//	locals: {
			//		features: vm.features,
			//		uoms: $scope.UOMs,
			//		mode: mode
			//	}
			//}).then(function(answer) {
			//$scope.more();
			//$scope.getAllUOM();
			//}, function() {
			//
			//});
		};

		$scope.setFeature = function (row, type) {
			// row.advancedFeaturesConfirmed = true;
			vm.featuresInit = false;
			vm.showAdvanceFeatures=true;
			type == 'FIXED' ? row.type = 'FIXED' : row.type='SLAB';
			type == 'FIXED' ? vm.featureType = 'FIXED' : vm.featureType='SLAB';
			var elem = document.getElementsByClassName('content-wrapper')[0];
			elem.scrollTop = elem.scrollHeight - elem.clientHeight;
		}

		vm.setAdvanceFeatures=function(row) {
			// row.showAdvanceFeatures=true;
			vm.featureType = 'FIXED';
			vm.featuresInit = true;
			vm.advancedFeaturesConfirmed = false;
			vm.showAdvanceFeatures = true;
			// angular.element('#createFeatureType').triggerHandler('click');
		}
		vm.closeAdvanceFeatures=function(row) {
			// row.showAdvanceFeatures=false;
			// row.advancedFeaturesConfirmed = false;
			row.type = "optional";

			vm.showAdvanceFeatures=false;
			vm.featuresInit = false;
			vm.featureType = "optional";

			vm.addNewUOM=false;
			vm.newUOM = "";

		}

		$scope.addNewSlab=function(slab) {

			var slabObj = {};
			//featureObj.productlst = angular.copy($scope.productlist);
			slabObj.type = "SLAB";
			slabObj.autoTermination = true;
			slab.scheme.push(slabObj);
		}

		$scope.removerow = function (index,rowname) {

			if(rowname.length!=1)
			{
				rowname.splice(index, 1);
			}
			//rowname.splice(index, 1);
			//self1.searchText.splice(index,1);

		}

		$scope.addUOM = function () {
			var uom=vm.newUOM;
			if (uom != null && uom != "") {
				var isDuplicate = false;
				if (vm.uoms.length != 0) {
					for (var i = 0; i < vm.uoms.length; i++) {
						if (vm.uoms[i].UOMCode == uom) {
							notifications.toast("UOM Code is already exist.", "error");
							vm.newUOM = "";
							isDuplicate = true;
							break;
						}
					}
				}
				if (!isDuplicate) {
					var req = {
						"GUUOMID": "123",
						"GUUOMTypeID": "supplier1",
						"GUTranID": "12345",
						"CommitStatus": "Active",
						"UOMCode": uom,
						"uomApplicationMapperDetail": [{
							"GUApplicationID": "Plan_123"
						}],
						"uomConversionDetails": [{
							"FromUOMCode": uom,
							"Qty": "10",
							"ToUOMCode": uom
						}]

					}
					$charge.uom().store(req).success(function (data) {
						notifications.toast("UOM has been added.", "success");
						vm.uoms.push(req);
						vm.addNewUOM=false;
						vm.newUOM = "";
						//if(data.IsSuccess) {
						//  console.log(data);
						//}
					}).error(function (data) {
						//console.log(data);
						notifications.toast("UOM adding failed", "error");
						vm.addNewUOM=false;
						vm.newUOM = "";
					})
				}
			}
			else{
				notifications.toast("UOM cannot be empty", "error");
			}

		}

		$scope.showAddUOMPrompt = function(ev) {
			// Appending dialog to document.body to cover sidenav in docs app
			vm.addNewUOM=true;
		};

		$scope.closeAddUOM = function() {
			// Appending dialog to document.body to cover sidenav in docs app
			vm.addNewUOM=false;
			vm.newUOM = "";
		};

		$scope.submitAddFeature=function() {

			vm.addFeatureSubmitted=true;

			var priceSchemeObj=vm.features;
			if(priceSchemeObj.type == "FIXED")
			{
				priceSchemeObj.scheme[0].type="FIXED";
				priceSchemeObj.scheme[0].unitsFrom=priceSchemeObj.unitsFrom;
				priceSchemeObj.scheme[0].unitsTo=priceSchemeObj.unitsTo;
				priceSchemeObj.scheme[0].unitUom=priceSchemeObj.unitUom;
				priceSchemeObj.scheme[0].price=priceSchemeObj.price;
				priceSchemeObj.scheme[0].uom=priceSchemeObj.uom;
				priceSchemeObj.scheme[0].autoTermination=priceSchemeObj.autoTermination;
				priceSchemeObj.scheme[0].costPerUnitAdd=priceSchemeObj.costPerUnitAdd!=undefined?priceSchemeObj.costPerUnitAdd:"";

				for (var k = 1; k < priceSchemeObj.scheme.length; k++) {
					priceSchemeObj.scheme.splice(k, 1);
				}
			}
			else if(priceSchemeObj.type == "SLAB")
			{
				for (var j = 0; j < priceSchemeObj.scheme.length; j++) {
					var slabObj=priceSchemeObj.scheme[j];
					slabObj.type="SLAB";
					slabObj.costPerUnitAdd=slabObj.costPerUnitAdd!=undefined?slabObj.costPerUnitAdd:"";
				}
			}
			else if(priceSchemeObj.type == "optional")
			{
				priceSchemeObj.scheme[0].type="";
				priceSchemeObj.scheme[0].unitsFrom="";
				priceSchemeObj.scheme[0].unitsTo="";
				priceSchemeObj.scheme[0].unitUom="";
				priceSchemeObj.scheme[0].price="";
				priceSchemeObj.scheme[0].uom="";
				priceSchemeObj.scheme[0].autoTermination="";
				priceSchemeObj.scheme[0].costPerUnitAdd="";

				for (var k = 1; k < priceSchemeObj.scheme.length; k++) {
					priceSchemeObj.scheme.splice(k, 1);
				}
			}

			if(vm.mode=='Add')
			{
				$charge.plan().addNewFeature(priceSchemeObj).success(function(data){
					//console.log(data);
					if(data.response=="succeeded")
					{
						notifications.toast("Successfully Feature added","success");
						$scope.editOff = false;
						vm.pageTitle = "Create Rating";
						vm.activePlanPaneIndex = 0;
						$scope.loading=true;
						$scope.more();
					}
					else
					{
						notifications.toast("Feature adding Failed","error");
					}
					vm.addFeatureSubmitted=false;
				}).error(function(data) {
					//console.log(data);
					notifications.toast("Feature adding Failed","error");
					vm.addFeatureSubmitted=false;
				});
			}
			else
			{
				$charge.plan().updateFeature(priceSchemeObj).success(function(data){
					//console.log(data);
					if(data.response=="succeeded")
					{
						notifications.toast("Successfully Feature updated","success");
						$scope.editOff = false;
						vm.pageTitle = "Create Rating";
						vm.activePlanPaneIndex = 0;
						$scope.loading=true;
						$scope.more();
					}
					else
					{
						notifications.toast("Feature updating Failed","error");
					}
					vm.addFeatureSubmitted=false;
				}).error(function(data) {
					//console.log(data);
					notifications.toast("Feature updating Failed","error");
					vm.addFeatureSubmitted=false;
				});
			}
		}

		$scope.showDeleteFeatureConfirm = function(ev,row) {
			// Appending dialog to document.body to cover sidenav in docs app
			var confirm = $mdDialog.confirm()
				.title('Would you like to delete this Rating?')
				.textContent('Caution: This Rating will be removed from the Plans that linked with this feature!')
				.ariaLabel('Lucky day')
				.targetEvent(ev)
				.ok('Please do it!')
				.cancel('No!');

			$mdDialog.show(confirm).then(function() {
				$scope.deleteFeature(row);
			}, function() {

			});
		};

		$scope.deleteFeature=function(rowname){
			var featureCode=rowname.featureCode;
			$charge.plan().removeFeature(featureCode).success(function(data){
				//console.log(data);
				if(data.response=="succeeded")
				{
					notifications.toast("Successfully Rating removed","success");
					$scope.more();

					$scope.infoJson= {};
					$scope.infoJson.message =featureCode+' Successfully Rating removed';
					$scope.infoJson.app ='rating';
					logHelper.info( $scope.infoJson);
				}
				else
				{
					notifications.toast("Rating removing Failed","error");

					$scope.infoJson= {};
					$scope.infoJson.message =featureCode+' Rating remove Failed';
					$scope.infoJson.app ='rating';
					logHelper.error( $scope.infoJson);
				}
			}).error(function(data) {
				//console.log(data);
				notifications.toast("Rating removing Failed","error");

				$scope.infoJson= {};
				$scope.infoJson.message =featureCode+' Rating remove Failed';
				$scope.infoJson.app ='rating';
				logHelper.error( $scope.infoJson);
			});
		}

		$scope.addNewRow=function(rowname) {

			var featureObj = {};
			//featureObj.productlst = angular.copy($scope.productlist);
			//product.qty=0;
			featureObj.type = "optional";
			//featureObj.feature = "optional";
			featureObj.unitsFrom = "0";
			featureObj.autoTermination = true;

			featureObj.scheme = [];

			var slabObj = {};
			//featureObj.productlst = angular.copy($scope.productlist);
			slabObj.type = "SLAB";
			slabObj.autoTermination = true;
			featureObj.scheme.push(slabObj);

			//rowname.push(featureObj);
			vm.features=featureObj;
			vm.setAdvanceFeatures();
		}

		//$scope.addNewSlab=function(slab) {
		//
		//	var slabObj = {};
		//	//featureObj.productlst = angular.copy($scope.productlist);
		//	slabObj.type = "SLAB";
		//	slabObj.autoTermination = true;
		//	slab.scheme.push(slabObj);
		//}

		//$scope.addNewRow($scope.features);

		//$scope.removerow = function (index,rowname,parentIndex) {
		//	if(rowname == $scope.features)
		//	{
		//		if($scope.features.length!=1)
		//		{
		//			$scope.features.splice(index, 1);
		//			$scope.calcUnitPrice($scope.features,$scope.content.unitPrice,$scope.content.default_price,$scope.content.add_pricingScheme,'add');
		//		}
		//	}
		//	else if($scope.features[parentIndex] && rowname == $scope.features[parentIndex].scheme)
		//	{
		//		if(rowname.length!=1)
		//		{
		//			rowname.splice(index, 1);
		//			$scope.calcUnitPrice($scope.features,$scope.content.unitPrice,$scope.content.default_price,$scope.content.add_pricingScheme,'add');
		//		}
		//	}
		//	else if(rowname == vm.selectedPlan.priceScheme)
		//	{
		//		if(vm.selectedPlan.priceScheme.length!=1)
		//		{
		//			vm.selectedPlan.priceScheme.splice(index, 1);
		//			$scope.calcUnitPrice(vm.editSelectedPlan.priceScheme,vm.editSelectedPlan.unitPrice,vm.editSelectedPlan.default_price,vm.editSelectedPlan.add_pricingScheme,'update');
		//		}
		//	}
		//	else if(vm.selectedPlan.priceScheme[parentIndex] && rowname == vm.selectedPlan.priceScheme[parentIndex].scheme)
		//	{
		//		if(rowname.length!=1)
		//		{
		//			rowname.splice(index, 1);
		//			$scope.calcUnitPrice(vm.editSelectedPlan.priceScheme,vm.editSelectedPlan.unitPrice,vm.editSelectedPlan.default_price,vm.editSelectedPlan.add_pricingScheme,'update');
		//		}
		//	}
		//	//rowname.splice(index, 1);
		//	//self1.searchText.splice(index,1);
		//
		//}
		//$scope.featureType='';
		//$scope.setFeature = function (row, type) {
		//	// row.advancedFeaturesConfirmed = true;
		//	$scope.advancedFeaturesConfirmed = true;
		//	// type == 'FIXED' ? row.type = 'FIXED' : row.type='SLAB';
		//	type == 'FIXED' ? $scope.featureType = 'FIXED' : $scope.featureType='SLAB';
		//	var elem = document.getElementsByClassName('content-wrapper')[0];
		//	elem.scrollTop = elem.scrollHeight - elem.clientHeight;
		//}

		//$scope.setAdvanceFeatures=function(row) {
		//	// row.showAdvanceFeatures=true;
		//	$scope.showAdvanceFeatures = true;
		//	// angular.element('#createFeatureType').triggerHandler('click');
		//}
		//$scope.closeAdvanceFeatures=function(row) {
		//	// row.showAdvanceFeatures=false;
		//	// row.advancedFeaturesConfirmed = false;
		//	// row.type = "optional";
		//
		//	$scope.showAdvanceFeatures=false;
		//	$scope.advancedFeaturesConfirmed = false;
		//	$scope.featureType = "optional";
		//
		//}

		// Kasun_Wijeratne_8_5_2017
		$scope.embedHovered = false;
		$scope.closeEmbedForm = function () {
			$scope.embedFormCopied = false;
			window.getSelection().empty();
			$scope.showEmbedForm = false;
			vm.clearSelectedEmbed();
		}
		$scope.embedFormCopied = false;
		$scope.copyToClipboard = vm.copyToClipboard = function () {
			window.getSelection().empty();
			var copyField = document.getElementById('embededCode');
			var range = document.createRange();
			range.selectNode(copyField);
			window.getSelection().addRange(range);
			document.execCommand('copy');
			$scope.embedFormCopied = vm.embedFormCopied = true;
		}
		// Kasun_Wijeratne_8_5_2017
		$scope.closeDialog = vm.closeDialog = function () {
			vm.showEmbedMarkup = false;
			$mdDialog.hide();
		}

		$scope.changeDefaultPrice = function (rowname,field,defaultPrice,defaultPriceScheme,change) {
			if(!defaultPrice)
			{
				if(change=="add")
				{
					$scope.content.unitPrice="";
				}
				else if(change=="update")
				{
					vm.editSelectedPlan.unitPrice="";
				}
			}
			$scope.calcUnitPrice(rowname,field,defaultPrice,defaultPriceScheme,change);
		}

		$scope.calcUnitPrice = function (rowname,field,defaultPrice,defaultPriceScheme,change) {
			field=0;
			for (var k = 0; k < rowname.length; k++) {
				var priceSchemeObj=rowname[k];
				if(priceSchemeObj.type=="FIXED" && priceSchemeObj.price!=undefined)
				{
					field=field+priceSchemeObj.price;
				}
				else if(priceSchemeObj.type=="SLAB")
				{
					var smallestTemp=0;
					for (var j = 1; j < priceSchemeObj.scheme.length; j++) {
						var priceSchemeSubObj=priceSchemeObj.scheme[j];
						if(priceSchemeObj.scheme[smallestTemp].unitsFrom>priceSchemeObj.scheme[j].unitsFrom)
						{
							smallestTemp=j;
						}
					}
					if(priceSchemeObj.scheme[smallestTemp].price!=undefined)
					{
						field=field+priceSchemeObj.scheme[smallestTemp].price;
					}
				}
			}
			if(defaultPrice && defaultPriceScheme)
			{
				if(change=="add")
				{
					$scope.content.unitPrice=field;
				}
				else if(change=="update")
				{
					vm.editSelectedPlan.unitPrice=field;
				}
			}
			else if(!defaultPrice)
			{

			}
			else if(!defaultPriceScheme && defaultPrice)
			{
				if(change=="add")
				{
					//$scope.content.unitPrice="";
					$scope.content.default_price=false;
					$scope.features=[];
					$scope.addNewRow($scope.features);
				}
				else if(change=="update")
				{
					//vm.editSelectedPlan.unitPrice="";
					vm.editSelectedPlan.default_price=false;
					vm.editSelectedPlan.priceScheme=[];
					$scope.addNewRow(vm.editSelectedPlan.priceScheme);
				}
			}
			else
			{
				if(change=="add")
				{
					$scope.content.unitPrice="";
				}
				else if(change=="update")
				{
					vm.editSelectedPlan.unitPrice="";
				}
			}
		};

		vm.submitted=false;

		$scope.searchKeyPress = function (event,keyword,length){
			if(event.keyCode === 13)
			{
				//console.log("Function Reached!");
				$scope.loadByKeywordPlan(keyword,length);
			}
		}

		var skipPlanSearch, takePlanSearch;
		var tempList;
		$scope.loadByKeywordPlan= function (keyword,length) {
			if($scope.items.length>=100) {
				//
				if(length==undefined)
				{
					keyword="undefined";
					length=0;
				}
				var searchLength=length;
				//if(keyword.toLowerCase().startsWith($scope.expensePrefix.toLowerCase()))
				//{
				//  keyword=keyword.substr($scope.expensePrefix.length);
				//  console.log(keyword);
				//  searchLength=1;
				//}hirtocer@deyom.com

				if (keyword.length == searchLength) {
					//console.log(keyword);
					//
					skipPlanSearch = 0;
					takePlanSearch = 100;
					tempList = [];

					var dbName="";
					dbName=getDomainName().split('.')[0]+"_"+getDomainExtension();
					//filter="api-version=2016-09-01&?search=*&$orderby=createdDate desc&$skip="+skip+"&$top="+take+"&$filter=(domain eq '"+dbName+"')";
					var data={
						"search": keyword+"*",
						"searchFields": "code,name",
						"filter": "(domain eq '"+dbName+"')",
						"orderby" : "createdDate desc",
						"top":takePlanSearch,
						"skip":skipPlanSearch
					}


					$charge.azuresearch().getAllPlansPost(data).success(function (data) {
						for (var i = 0; i < data.value.length; i++) {
							tempList.push(data.value[i]);
						}
						vm.plans = tempList;
						//skipProfileSearch += takeProfileSearch;
						//$scope.loadPaging(keyword, skipProfileSearch, takeProfileSearch);
					}).error(function (data) {
						vm.plans = [];
					});
				}
				else if (keyword.length == 0 || keyword == null) {
					vm.plans = $scope.items;
				}

				if(searchLength==0||searchLength==undefined)
				{
					$scope.loading=true;
					$scope.more("","");
				}
			}
		}

		//function gst(name) {
		//	var nameEQ = name + "=";
		//	var ca = document.cookie.split(';');
		//	for (var i = 0; i < ca.length; i++) {
		//		var c = ca[i];
		//		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		//		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
		//	}
		//	//debugger;
		//	return null;
		//}
		$scope.subscriptionKey="";
		$charge.tenantEngine().getSubscriptionIdByTenantName(getDomainName()).success(function (response) {

			if(response.status) {
				var subscriptionID = response.data["0"].subscriptionID;

				if (subscriptionID) {

					$charge.myAccountEngine().getSubscriptionInfoByID(subscriptionID).success(function (data) {
						if(data.Result)
						{
							$scope.subscriptionKey = data.Result.primaryKey;
						}
					}).error(function (data) {

					});
				}
			}
		}).error(function (data) {

		});

		function getSecurityToken() {
			var _st = gst("SubscriptionKey");
			return (_st != null) ? _st : ""; //"248570d655d8419b91f6c3e0da331707 51de1ea9effedd696741d5911f77a64f";
		}

		vm.planInjected = false;
		$scope.injectMarkup = function () {
			$timeout(function(){
				var embedPreCnt = angular.element('#embedPreview');
				embedPreCnt.append(vm.fullEmbedMarkup);
				vm.planInjected = true;
			}, 500);

			$timeout(function(){
				var packs = document.getElementsByClassName('package-body');
				var tempHeight = 0;
				angular.forEach(packs, function (pack) {
					if(pack.clientHeight>tempHeight ){
						tempHeight = pack.clientHeight;
					};
				});
				$('.package-body').css('height',tempHeight);
			}, 510);
		}

		$scope.nothingSelected = true;
		$scope.isNothingSelected = [];
		$scope.$watch(function () {
			$scope.isNothingSelected = [];
			angular.forEach($scope.priceSchemeFeatureList, function (feature) {
				if(feature.isSelected){
					$scope.isNothingSelected.push('ok');
				}
			});
			$scope.isNothingSelected.length == 0 ? $scope.nothingSelected = true : $scope.nothingSelected = false;

		});

		vm.updateMainAccentInEmbed = function (color) {
			vm.embedPlanAccent = color;
			$('.af').css('color',vm.embedPlanAccent);
			$('.ab').css('background',vm.embedPlanAccent);
		}

		vm.updateLayout = function (count) {
			vm.embedPlanWidth = 100/count;
			$('#embedPreview form').css('width',vm.embedPlanWidth+'%');
		}

		vm.showEmbedMarkup = false;
		vm.continueToEmbedMarkup = function () {
			vm.planInjected = false;
			$scope.getEmbededPlanForm($scope.selectedPlansForEmbed, null, true);
		}

		vm.goBackToPreview = function () {
			vm.planInjected = false;
			$scope.injectMarkup();
			vm.showEmbedMarkup = false;
		}

	}
})();
