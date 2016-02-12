import Em from 'ember';
import Base from 'ember-simple-auth/authenticators/base';


import config from 'ember-get-config';

export default Base.extend({
    url: `${config.JAMDB.url}/v1/auth`,

    restore(data) {
        let accessToken = data.accessToken;

        return Em.$.ajax({
            method: 'POST',
            url: this.url,
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
        }).then(function(res) {
            res.data.attributes.accessToken = accessToken;
            return res.data.attributes;
        });
    },
    authenticate(access_token, _ /* expires */) {
        return Em.$.ajax({
            method: 'POST',
            url: this.url,
            dataType: 'json',
            contentType: 'application/json',
            xhrFields: {withCredentials: true},
            data: JSON.stringify({data: {
                type: 'users',
                attributes: {
                    provider: 'osf',
                    access_token
                }
            }})
        }).then(function(res) {
            res.data.attributes.accessToken = access_token;
            return res.data.attributes;
        });
    },
    invalidate(data) {
        console.log('Invalidating data:');
        console.log(data);
    }
});
