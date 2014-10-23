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
    }]);

    app.config(['apiProvider', function(apiProvider) {
        apiProvider.api('categories', {
            type: 'http',
            backend: {
                rel: 'categories'
            }
        });
    }]);

    return app;
});
