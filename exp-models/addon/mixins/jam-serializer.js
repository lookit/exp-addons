import Ember from 'ember';

/*
Convert JamDB responses to and from models
 */
export default Ember.Mixin.create({
    modelName: null,  // Collection items specify a generic type of "documents"; specify model to use explicitly
    relationAttrs: [],  // List of field names (in JSONAPI attributes section) that contain list of relationship IDs

    keyForAttribute: function(attr, method) {
        // Override the default ember data behavior, so that Jam can use exactly the same keys as in the model (no dasherizing)
        return attr;
    },

    modelNameFromPayloadKey: function(key) {
        // Replace the generic JamDB response type of 'documents' with the name of the model to deserialize as
        return this.modelName || this._super(key);
    },

    extractAttributes: function(modelClass, resourceHash) {
        // Keep track of the original ID values (string) alongside any relationships;
        //  may help avoid a second API call when we want to display IDs of related records
        var attributes = this._super(...arguments);
        for (var item of this.relationAttrs) {
            attributes[item + 'Id'] = resourceHash.attributes[item];
        }
        return attributes;
    },

    extractRelationships: function(modelClass, resourceHash) {
        var relationships = this._super(...arguments);
        // Some relationships are stored as ID list under attributes; convert to JSONAPI format
        // TODO: May need serialization for return to server?
        function makeRel(idVal, index, array) {
            return {
                id: idVal,
                type: Ember.Inflector.inflector.singularize(relName), // Must match this.modelName
              };
        }

        for (var relName of this.relationAttrs) {
            var relData = resourceHash.attributes[relName];
            var newRel;
            if (relData) {
                // If no value found, assume array if plural, else singular entry. This may be fragile for some words.
                if (Ember.Inflector.inflector.singularize(relName) === relName) {
                    newRel = makeRel(relData);
                } else {
                    newRel = relData.map(makeRel);
                }
                relationships[relName] = {
                    data: newRel,
                };
            }
        }
        return relationships;
    },
    serialize: function(snapshot, options) {
        var serialized = this._super(...arguments);
        // Jam does not support sending relationships to the server
        delete serialized.data.relationships;
        return serialized;
    }
});
