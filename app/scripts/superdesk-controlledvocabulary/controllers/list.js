/**
 * Created by sdesk on 10/21/14.
 */

define([
    'lodash'
], function(_) {
    'use strict';

    CategoriesListController.$inject = ['$scope', 'api', 'modal', 'gettext'];
    function CategoriesListController($scope, api, modal, gettext) {
        $scope.categories = [];
        var _orig;
        $scope.selectedCategory = null;
        $scope.editCategory = null;
        var apiResource = 'categories';

        api(apiResource).query()
        .then(function(result) {
            $scope.categories = result._items;
        });

        $scope.select = function(category) {
            $scope.selectedCategory = category;
        };

        $scope.edit = function(category) {
            $scope.editCategory = _.create(category);
            _orig = category;
        };

        $scope.save = function(category) {
            var _new = category._id ? false : true;
            api(apiResource).save(_orig, category)
            .then(function() {
                if (_new) {
                    $scope.categories.unshift(category);
                }
                $scope.cancel();
            });
        };

        $scope.cancel = function() {
            $scope.editCategory = null;
        };

        $scope.remove = function(category) {
            confirm().then(function() {
                api(apiResource).remove(category)
                .then(function(result) {
                    _.remove($scope.categories, category);
                }, function(response) {
                    console.log(response);
                });
            });
        };

        function confirm() {
            return modal.confirm(gettext('Are you sure you want to delete category?'));
        }
    }

    return CategoriesListController;
});
