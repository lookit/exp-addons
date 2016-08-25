import Ember from 'ember';

let ADMIN = {
    id: 'ADMIN',
    profileId: 'ADMIN.PROFILE'
};

export default Ember.Service.extend({
    store: Ember.inject.service(),
    session: Ember.inject.service(),
    namespaceConfig: Ember.inject.service(),
    getCurrentUser() {
        return new Ember.RSVP.Promise((resolve, reject) => {
            if(!this.get('session.isAuthenticated')) {
                resolve([null, null]);
            }
            else {
                var data = this.get('session.data.authenticated');
                var FakeProfile = Ember.Object.extend({});
                if(data.provider === 'osf') {
                    var FakeAccount = Ember.Object.extend({
                        pastSessionsFor: function() {
                            return Ember.RSVP.resolve([]);
                        }
                    });
                    resolve([
                        FakeAccount.create({
                            id: ADMIN.id
                        }),
                        FakeProfile.create({
                            profileId: ADMIN.profileId
                        })
                    ]);
                }
                else if(data.provider === `${this.get('namespaceConfig').get('namespace')}:accounts`) {
                    this.get('store').findRecord('account', `${data.id}`)
                        .then((account) => {
                            var profile = account.profileById(this.get('session.data.profile.profileId'));
                            if (profile === undefined) {
                                profile = FakeProfile.create({
                                    profileId: account.get('username') + '.' + account.get('username')
                                });
                            }
                            resolve([account, profile]);
                        })
                        .catch(reject);
                }
            }
        });
    }
});
