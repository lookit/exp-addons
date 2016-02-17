import ApplicationAdapter from './application';
import JamDocumentAdapter from '../mixins/jam-document-adapter';

export default ApplicationAdapter.extend(JamDocumentAdapter, {
    sessionCollectionId: null,  // TODO: This will dictate the new collection name to try
    urlSegments: {
        collectionId: (type /*, id, snapshot, query*/) => this.get('sessionCollectionId') || type, // TODO: test that this works
    }
});
