import DS from 'ember-data';

import UrlTemplates from 'ember-data-url-templates';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

import config from 'ember-get-config';

export default DS.JSONAPIAdapter.extend(DataAdapterMixin, UrlTemplates, {
    authorizer: `authorizer:${config.JAMDB.authorizer}`,

    host: config.JAMDB.url,
    namespace: 'v1/id',
    urlSegments: {
        jamNamespace: function() {
            return config.JAMDB.namespace;
        }
    }
});
