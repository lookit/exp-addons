import Ember from 'ember';
import DS from 'ember-data';

export default DS.Transform.extend({
    store: Ember.inject.service(),
    deserialize(serialized) {
        if (!Ember.$.isArray(serialized)) {
            return [];
        }
        return serialized.map((profile) => {
            if (profile.get) {
                return profile;
            }
            else {
                profile.birthday = new Date(profile.birthday);
                this.get('store').push({
                    data: {
                        type: 'profile',
                        id: profile.profileId,
                        attributes: profile
                    }
                });
                return this.get('store').peekRecord('profile', profile.profileId);
            }
        });
    },
    serialize(deserialized) {
        return deserialized.toArray().map((item) => item.toJSON());
    }
});
