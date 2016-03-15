import DS from 'ember-data';

import JamSerializer from '../mixins/jam-serializer';
import JamDocumentSerializer from '../mixins/jam-document-serializer';

export default DS.JSONAPISerializer.extend(JamSerializer, JamDocumentSerializer, {
    attrs: {
        createdOn: {serialize: false},
        createdBy: {serialize: false},
        modifiedOn: {serialize: false},
        modifiedBy: {serialize: false}
    },

    modelName: 'session',
    extractAttributes() {
        var attributes = this._super(...arguments);
        // Remove identifying information from the session model
        delete attributes.createdBy;
        delete attributes.modifiedBy;
        return attributes;
    }
});
