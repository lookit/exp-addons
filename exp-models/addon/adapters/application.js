import DS from 'ember-data';

import UrlTemplates from 'ember-data-url-templates';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

import config from 'ember-get-config';

export default DS.JSONAPIAdapter.extend(DataAdapterMixin, UrlTemplates, {
    authorizer: `authorizer:${config.JAMDB.authorizer}`,

    host: config.JAMDB.url,
    namespace: 'v1/id',

    urlSegments: {  // Make available to all adapters, not just documents. This appears to be extended rather than overwritten by children.
        namespaceId: () => config.JAMDB.namespace
    }
});
