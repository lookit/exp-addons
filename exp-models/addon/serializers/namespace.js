import DS from 'ember-data';

import JamSerializer from '../mixins/jam-serializer';

export default DS.JSONAPISerializer.extend(JamSerializer, {
    modelName: 'namespace',

    // Suppress fields that should not be sent to the server
    attrs: {
        name: {serialize: false},
        createdOn: {serialize: false},
        createdBy: {serialize: false},
        modifiedOn: {serialize: false},
        modifiedBy: {serialize: false}
    },

});
