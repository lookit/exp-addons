import DS from 'ember-data';
import JamSerializer from '../mixins/jam-serializer';

export default DS.JSONAPISerializer.extend(JamSerializer, {
    modelName: 'collection',
    attrs: {
        createdBy: { serialize: false },
        createdOn: { serialize: false },
        modifiedBy: { serialize: false },
        modifiedOn: { serialize: false }
    }
});
