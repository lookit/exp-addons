/* global dcodeIO */
import DS from 'ember-data';

import JamSerializer from '../mixins/jam-serializer';
import JamDocumentSerializer from '../mixins/jam-document-serializer';

const bcrypt = dcodeIO.bcrypt;
const ecryptedRegex = /^\$2b\$12\$.{53}$/;

export default DS.JSONAPISerializer.extend(JamSerializer, JamDocumentSerializer, {
    modelName: 'account',
    serialize(record, options) {
        if (record.record.get('isNew') && !ecryptedRegex.test(record.record.get('password'))) {
            record = record.record;
            const salt = bcrypt.genSaltSync(12);
            record.set('password', bcrypt.hashSync(record.get('password'), salt).replace('$2a$', '$2b$'));
            record = record._createSnapshot();
        }

        return this._super(record, options);
    }
});
