import Ember from 'ember';

import config from 'ember-get-config';

let ADMIN = {
    id: 'ADMIN',
    profileId: 'ADMIN.PROFILE'
};

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
                var profileId = null;
                if(data.provider === 'osf') {
                    accountId = ADMIN.id;
                    profileId = ADMIN.profileId;
                }
                else if(data.provider === `${config.JAMDB.namespace}:accounts`) {
                    accountId = data.id;
                    profileId = this.get('data.profile.profileId');
                }
                resolve(
                    this.get('store').findRecord('account', `${config.JAMDB.namespace}.accounts.${accountId}`)
                        .then((account) => {
                            return [account, account.profileById(profileId)];
                        })
                        .catch(reject)
                );
            }
        });
    }
});
