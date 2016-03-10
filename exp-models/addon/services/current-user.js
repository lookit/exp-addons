import Ember from 'ember';

import config from 'ember-get-config';

export default Ember.Service.extend({
    store: Ember.inject.service(),
    session: Ember.inject.service(),
    account: null,

    init() {
        this._super(...arguments);

        this.get('session').on('invalidationSucceeded', () => {
            this.set('account', null);
        });
    },

    getCurrentUser() {
        return new Ember.RSVP.Promise((resolve, reject) => {
            if(!this.get('session.isAuthenticated')) {
                resolve(null);
            }
            else {
                if (this.get('account')) {
                    resolve(this.get('account'));
                }

                var data = this.get('session.data.authenticated');
                var accountId = null;
                if(data.provider === 'osf') {
                    accountId = config.JAMDB.testAccount.id;
                }
                else if(data.provider === `${config.JAMDB.namespace}:accounts`) {
                    accountId = data.id;
                }
                resolve(this.get('store').findRecord('account', `${config.JAMDB.namespace}.accounts.${accountId}`).catch(reject));
            }
        });
    }
});
