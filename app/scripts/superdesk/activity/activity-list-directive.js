define([
    'lodash'
], function(_) {
    'use strict';

    return ['superdesk', function(superdesk) {
        return {
            scope: {
                data: '=',
                type: '@',
                action: '@',
                done: '='
            },
            template: '<li ng-repeat="activity in activities" sd-activity-item></li>',
            link: function(scope, elem, attrs) {
                var intent = {
                    action: scope.action
                };

                if (!scope.type) { // guess item type by self href
                    //intent.type = scope.data._links.self.href.split('/')[1];
                    intent.type = scope.data.href.split('/')[1];
                } else {
                    intent.type = scope.type;
                }

                if (!intent.action) {
                    console.error('No action set for intent in \'' + elem[0].outerHTML + '\'');
                }

                scope.activities = _.values(_.where(superdesk.activities, function(activity) {
                    return _.find(activity.filters, intent);
                }));
            }
        };
    }];
});