import ApplicationAdapter from './application';
import JamDocumentAdapter from '../mixins/jam-document-adapter';

export default ApplicationAdapter.extend(JamDocumentAdapter, {
    sessionCollectionId: null,  // Define the collection name associated with this adapter. Set in subclasses.
    urlSegments: {
        collectionId: function(type /*, id, snapshot, query*/) {
            // TODO: May not want to fall back on type
            return this.get('sessionCollectionId') || type;
        }
    }
});
