import Ember from 'ember';
import Base from 'ember-simple-auth/authenticators/base';


import config from 'ember-get-config';

export default Base.extend({
    authUrl: `${config.JAMDB.url}/v1/auth`,
    namespaceUrl: `${config.JAMDB.url}/v1/id/namespaces/${config.JAMDB.namespace}`,
    _get: function(accessToken) {
        return Ember.$.ajax({
            method: 'GET',
            url: this.namespaceUrl,
            dataType: 'json',
            contentType: 'application/json',
            xhrFields: {withCredentials: true},
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
        return this._post(accessToken).done(function(res) {
            res.data.attributes.accessToken = accessToken;
            return res.data.attributes;
        }).then((res) => {
            // Then try to make a request, eg to a namespace endpoint to see if user has appropriate permissions
            // Injecting store fails, because it depends on authenticator. Query directly.
            // TODO: Hardcoding a URL here makes me sad; alternate suggestions welcome.

            return this._get(res.data.attributes.token)
                .then(()=> res)
                .fail((reason)=> {
                    return Ember.RSVP.reject('User does not have permission to access this site');
                });
        });
    }
});
