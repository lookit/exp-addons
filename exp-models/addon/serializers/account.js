/* global dcodeIO */
import DS from 'ember-data';

import JamSerializer from '../mixins/jam-serializer';
import JamDocumentSerializer from '../mixins/jam-document-serializer';

let bcrypt = dcodeIO.bcrypt;

export default DS.JSONAPISerializer.extend(JamSerializer, JamDocumentSerializer, {
    modelName: 'account',
    serialize(record, options) {
        if (record.record.get('isNew')) {
            record = record.record;
            var salt = bcrypt.genSaltSync(12);
            record.set('password', bcrypt.hashSync(record.get('password'), salt).replace('$2a$', '$2b$'));
            record = record._createSnapshot();
        }

        return this._super(record, options);
    }
});
