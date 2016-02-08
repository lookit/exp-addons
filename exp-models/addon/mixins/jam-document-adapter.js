import Ember from 'ember';

export default Ember.Mixin.create({
    findRecordUrlTemplate: '{+host}/{+namespace}/documents{/id}',
    findAllUrlTemplate: '{+host}/{+namespace}/collections{/jamNamespace}.{+collectionId}/documents',
    queryUrlTemplate: '{+host}/{+namespace}/collections{/jamNamespace}.{+collectionId}{/search}',

    // TODO: Support creation and deletion of records

    urlSegments: {
        // Allows serializer to be reused across multiple types
        search(type, id, snapshot, query) {
		  return query.q ? '_search' : 'documents';
		},
        collectionId: (type, id, snapshot, query) => Ember.Inflector.inflector.pluralize(type),
    }
});
