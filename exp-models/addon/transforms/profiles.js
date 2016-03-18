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
                return this.get('store').createRecord('profile', profile);
            }
        });
    },
    serialize(deserialized) {
        return deserialized.toArray().map((item) => item.toJSON());
    }
});
