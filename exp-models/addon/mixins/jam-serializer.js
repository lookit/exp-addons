import Ember from 'ember';

/*
Convert JamDB responses to and from models
 */
export default Ember.Mixin.create({
    modelName: null,  // Collection items specify a generic type of "documents"; specify model to use explicitly

    keyForAttribute: function(attr /* method */) {
        // Override the default ember data behavior, so that Jam can use exactly the same keys as in the model (no dasherizing)
        return attr;
    },

    modelNameFromPayloadKey: function(key) {
        // Replace the generic JamDB response type of 'documents' with the name of the model to deserialize as
        return this.modelName || this._super(key);
    },

    serialize: function(snapshot, options) {
        var serialized = this._super(snapshot, options);
        // Jam does not appear to support sending relationships to the server
        delete serialized.data.relationships;
        return serialized;
    }
});
