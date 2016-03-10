import Ember from 'ember';

export default Ember.Mixin.create({
    findRecordUrlTemplate: '{+host}/{+namespace}/documents{/id}',
    findAllUrlTemplate: '{+host}/{+namespace}/collections{/jamNamespace}.{+collectionId}/documents',

    queryUrlTemplate: '{+host}/{+namespace}/collections{/jamNamespace}.{+collectionId}{/search}',
    queryRecordUrlTemplate: '{+host}/{+namespace}/collections{/jamNamespace}.{+collectionId}{/search}',

    createRecordUrlTemplate: '{+host}/{+namespace}/collections{/jamNamespace}.{+collectionId}/documents',
    // TODO: Support creation and deletion of records
    updateRecordUrlTemplate: '{+host}/{+namespace}/documents{/id}',

    urlSegments: {
        // Allows serializer to be reused across multiple types
        search(type, id, snapshot, query) {
            return query.q ? '_search' : 'documents';
        },
        collectionId: (type /*, id, snapshot, query*/) => Ember.Inflector.inflector.pluralize(type)
    },
    ajax: function(url, type, options={}) {
        options.traditional = true;
        return this._super(...arguments);
    }
});
