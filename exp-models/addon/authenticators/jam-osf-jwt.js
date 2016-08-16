import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';


import config from 'ember-get-config';

export default BaseAuthenticator.extend({
    authUrl: `${config.JAMDB.url}/v1/auth`,
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
        });
    }
});
