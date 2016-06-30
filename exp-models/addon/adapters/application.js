import Ember from 'ember';
import DS from 'ember-data';

import UrlTemplates from 'ember-data-url-templates';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DS.JSONAPIAdapter.extend(DataAdapterMixin, UrlTemplates, {
    namespaceConfig: Ember.inject.service(),
    authorizer: Ember.computed(function() {
	return `authorizer:${this.get('namespaceConfig').get('authorizer')}`;
    }),
    host: Ember.computed(function() {
	return this.get('namespaceConfig').get('url');
    }),
    namespace: 'v1/id',

    urlSegments: {  // Make available to all adapters, not just documents. This appears to be extended rather than overwritten by children.
        namespaceId: function() {
	    return this.get('namespaceConfig').get('namespace');
	}
    }
});
