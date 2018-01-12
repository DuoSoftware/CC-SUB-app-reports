//////////////////////////////////////
// App : Rating						//
// Owner  : Gihan Herath			//
// Last changed date : 2018/01/10	//
// Version : 6.1.0.2				//
// Modified By : Kasun				//
//////////////////////////////////////

(function ()
{
	'use strict';

	angular
		.module('app.rating', [])
		.config(config)
		.filter('parseDate',parseDateFilter);

	/** @ngInject */
	function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider, mesentitlementProvider)
	{

		mesentitlementProvider.setStateCheck("plans");

		// State
		$stateProvider
			.state('app.rating', {
				url    : '/rating',
				views  : {
					'rating@app': {
						templateUrl: 'app/main/rating/rating.html',
						controller : 'RatingController as vm'
					}
				},
				resolve: {
					security: ['$q','mesentitlement','$timeout','$rootScope','$state','$location', function($q,mesentitlement,$timeout,$rootScope,$state, $location){
						return $q(function(resolve, reject) {
							$timeout(function() {
								//if (true) {
								if ($rootScope.isBaseSet2) {
									resolve(function () {
										var entitledStatesReturn = mesentitlement.stateDepResolver('rating');

										mesentitlementProvider.setStateCheck("rating");

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
				bodyClass: 'rating'
			});

//Api
		msApiProvider.register('cc_invoice.invoices', ['app/data/cc_invoice/invoices.json']);

// Navigation

		msNavigationServiceProvider.saveItem('rating', {
			title    : 'rating',
			icon     : 'icon-leaf',
			state    : 'app.rating',
			/*stateParams: {
			 'param1': 'page'
			 },*/
			weight   : 6
		});
	}

	function parseDateFilter(){
		return function(input){
			return new Date(input);
		};
	}
})();
