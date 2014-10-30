define([
    'angular',
    'require',
    './controllers/list'
], function(angular, require) {
    'use strict';

    var app = angular.module('superdesk.vocabulary', []);

    app.config(['superdeskProvider', function(superdesk) {
        superdesk
            .activity('/settings/categories', {
                label: gettext('Categories'),
                templateUrl: require.toUrl('./views/settings.html'),
                controller: require('./controllers/list'),
                category: superdesk.MENU_SETTINGS
            });
    }])
        .config(['apiProvider', function(apiProvider) {
        apiProvider.api('categories', {
            type: 'http',
            backend: {
                rel: 'categories'
            }
        });
    }])
        .directive('sdCategoryUnique', ['$q', 'api', function($q, api){
            //need to create unique directive
            return {
                require: 'ngModel',
                scope: {exclude: '='},
                link: function (scope, element, attrs, ngModel) {

                    /**
                     * Test if given value is unique for seleted field
                     */
                    function testUnique(modelValue, viewValue) {
                        var value = modelValue || viewValue;
                        if (value && attrs.uniqueField) {
                            var criteria = {},where = {};
                            where[attrs.uniqueField] = {$regex: '^' + value + '$', $options: '-i'};
                            criteria.where = angular.toJson({$or: [where]});
                            return api('categories').query(criteria)
                                .then(function (categories) {

                                    if (categories._items.length && (!scope.exclude._id || categories._items[0]._id !== scope.exclude._id)) {
                                        return $q.reject(categories);
                                    }

                                    return categories;
                                });
                        }

                        // mark as ok
                        return $q.when();
                    }

                    ngModel.$asyncValidators.unique = testUnique;
                }
            };
     }]);

    return app;
});
