import ApplicationAdapter from './application';
import JamDocumentAdapter from '../mixins/jam-document-adapter';

export default ApplicationAdapter.extend(JamDocumentAdapter, {
    buildURL() {
	var url = this._super(...arguments);
	return `${url}?page[size]=100`;
    }
});
