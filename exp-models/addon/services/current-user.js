import Ember from 'ember';

import config from 'ember-get-config';

let ADMIN = {
    id: 'ADMIN',
    profileId: 'ADMIN.PROFILE'
};

export default Ember.Service.extend({
    store: Ember.inject.service(),
    session: Ember.inject.service(),
    getCurrentUser() {
        return new Ember.RSVP.Promise((resolve, reject) => {
            if(!this.get('session.isAuthenticated')) {
                resolve([null, null]);
            }
            else {
                var data = this.get('session.data.authenticated');
                if(data.provider === 'osf') {
                    var FakeAccount = Ember.Object.extend({
                        pastSessionsFor: function() {
                            return Ember.RSVP.resolve([]);
                        }
                    });
                    var FakeProfile = Ember.Object.extend({});
                    resolve([
                        FakeAccount.create({
                            id: ADMIN.id
                        }),
                        FakeProfile.create({
                            profileId: ADMIN.profileId
                        })
                    ]);
                }
                else if(data.provider === `${config.JAMDB.namespace}:accounts`) {
                    this.get('store').findRecord('account', `${config.JAMDB.namespace}.accounts.${data.id}`)
                    .then((account) => {
                        resolve([account, account.profileById(this.get('data.profile.profileId'))]);
                    })
                    .catch(reject);
                }
            }
        });
    }
});
