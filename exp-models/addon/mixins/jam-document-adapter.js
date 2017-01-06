import Ember from 'ember';

import BulkAdapterMixin from './bulk-adapter';

/**
 * @module exp-models
 * @submodule adapters
 */

/**
 * Adapter for communication with a remote JamDB server
 *
 * @class JamDocumentAdapterMixin
 * @uses BulkAdapterMixin
 */

export default Ember.Mixin.create(BulkAdapterMixin, {
    updateRecordUrlTemplate: '{+host}/{+namespace}/documents{/namespaceId}.{collectionId}.{id}',
    findRecordUrlTemplate: '{+host}/{+namespace}/documents{/namespaceId}.{collectionId}.{id}',

    findAllUrlTemplate: '{+host}/{+namespace}/collections{/namespaceId}.{collectionId}/documents',
    createRecordUrlTemplate: '{+host}/{+namespace}/collections{/namespaceId}.{collectionId}/documents',

    queryUrlTemplate: '{+host}/{+namespace}/collections{/namespaceId}.{collectionId{/search}',
    queryRecordUrlTemplate: '{+host}/{+namespace}/collections{/namespaceId}.{collectionId{/search}',

    urlSegments: {
        // Allows serializer to be reused across multiple types
        search(type, id, snapshot, query) {
            return query.q ? '_search' : 'documents';
        },
        collectionId: (type) => Ember.Inflector.inflector.pluralize(type)
    },
    ajax: function(url, type, options={}) {
        options.traditional = true;
        return this._super(...arguments);
    },

    handleResponse(status) {
        // Data adapter mixin only handles 401; Jam sometimes returns 403 instead. Make sure that triggers invalidation.
        if (status === 403 && this.get('session.isAuthenticated')) {
            this.get('session').invalidate();
        }
        return this._super(...arguments);
    }
});
