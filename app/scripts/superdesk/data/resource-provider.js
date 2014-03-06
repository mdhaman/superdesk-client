define(['lodash'], function(_) {
    'use strict';

    /**
     * Resource service provider
     */
    function ResourceServiceProvider() {

        var resources = {};

        this.resource = function(name, config) {
            resources[name] = config;
        };

        this.$get = ['$http', '$q', 'config', function($http, $q, config) {
            var service = new ResourceService($http, $q, config);
            registerResources(service);
            return service;
        }];

        function registerResources(service) {
            _.each(resources, function(config, name) {
                service.resource(name, config);
            });
        }
    }

    /**
     * Resource service
     */
    function ResourceService($http, $q, config) {

        var links;

        /**
         * Register resource
         *
         * @param {string} name
         * @param {Object} config
         * @returns {ResourceService}
         */
        this.resource = function(name, config) {
            this[name] = new Resource(config);
        };

        /**
         * Get resource links via root url
         *
         * @returns {Promise}
         */
        function getResourceLinks() {

            if (links) {
                return $q.when(links);
            }

            return http({
                method: 'GET',
                url: config.server.url
            }).then(function(response) {
                links = {};
                _.each(response.data.collection, function(link) {
                    links[link.rel] = link.href;
                });

                return links;
            });
        }

        /**
         * Get url for given resource
         *
         * @param {Object} resource
         * @returns {Promise}
         */
        function getUrl(resource) {
            return getResourceLinks().then(function(links) {
                return links[resource.rel] ? links[resource.rel] : $q.reject(resource);
            });
        }

        /**
         * Wrap $http call
         *
         * @param {Object} config
         * @returns {Promise}
         */
        function http(config) {
            return $q.when(config.url)
                .then(function(url) {
                    config.url = url;
                    return $http(config);
                })
                .then(function(response) {
                    if (response.status >= 200 && response.status < 300) {
                        return response;
                    } else {
                        return $q.reject(response);
                    }
                });
        }

        /**
         * Resource wrapper
         */
        function Resource(config) {
            this.rel = config.rel;
        }

        /**
         * Get entity by url
         *
         * @param {string} url
         * @returns {Promise}
         */
        Resource.prototype.getByUrl = function(url) {
            return http({
                method: 'GET',
                url: url
            }).then(function(response) {
                return response.data;
            });
        };

        /**
         * Resource query method
         *
         * @param {Object} params
         */
        Resource.prototype.query = function(params) {
            return http({
                method: 'GET',
                params: params,
                url: getUrl(this)
            }).then(function(response) {
                response.data._items = response.data.collection;
                return response.data;
            });
        };

        /**
         * Update item
         *
         * @param {Object} item
         * @returns {Promise}
         */
        Resource.prototype.update = function(item) {
            var url = item.href;
            delete item.href;
            return http({
                method: 'PATCH',
                url: url,
                data: item
            }).then(function(response) {
                _.extend(item, {href: url}, response.data);
                return item;
            });
        };

        /**
         * Create new item
         *
         * @param {Object} itemData
         * @returns {Promise}
         */
        Resource.prototype.create = function(itemData) {
            return http({
                method: 'POST',
                data: itemData,
                url: getUrl(this)
            }).then(function(response) {
                _.extend(itemData, response.data);
                return itemData;
            });
        };

        /**
         * Save item
         *
         * @param {Object} item
         * @returns {Promise}
         */
        Resource.prototype.save = function(item) {
            return item.href ? this.update(item) : this.create(item);
        };

        /**
         * Delete item
         *
         * @param {Object} item
         * @returns {Promise}
         */
        Resource.prototype['delete'] = function(item) {
            return http({
                method: 'DELETE',
                url: item.href
            });
        };

        /**
         * Remove item - alias for delete
         */
        Resource.prototype.remove = Resource.prototype['delete'];
    }

    return ResourceServiceProvider;
});