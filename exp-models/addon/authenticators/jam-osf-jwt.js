import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';


import config from 'ember-get-config';

export default BaseAuthenticator.extend({
    authUrl: `${config.JAMDB.url}/v1/auth`,
    namespaceUrl: `${config.JAMDB.url}/v1/id/namespaces/${config.JAMDB.namespace}`,
    // TODO: URL is hardcoded because store requires authentication; alternate suggestions welcome

    _askNamespace: function(accessToken) {
        return Ember.$.ajax({
            method: 'GET',
            url: this.namespaceUrl,
            dataType: 'json',
            headers: {
                'Authorization': accessToken
            }
        });
    },

    _post: function(accessToken) {
        return Ember.$.ajax({
            method: 'POST',
            url: this.authUrl,
            dataType: 'json',
            contentType: 'application/json',
            xhrFields: {withCredentials: true},
            data: JSON.stringify({data: {
                type: 'users',
                attributes: {
                    provider: 'osf',
                    access_token: accessToken
                }
            }})
        });
    },

    restore(data) {
        let accessToken = data.accessToken;
        return this._post(accessToken).then(function(res) {
            res.data.attributes.accessToken = accessToken;
            return res.data.attributes;
        }).fail(this.invalidate);
    },
    authenticate(accessToken /*, expires */) {
        return this._post(accessToken).then(function(res) {
            res.data.attributes.accessToken = accessToken;
            return res.data.attributes;
        }).then((res) => {
            // Only allow someone to login to the admin panel if they have have namespace-level permissions for this project
            return this._askNamespace(res.token)
                .then(() => res)
                .fail(() => {
                    return Ember.RSVP.reject('User does not have permission to access this site');
                });
        });
    }
});
