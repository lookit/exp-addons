import Ember from 'ember';
import DS from 'ember-data';

import Profile from '../models/profile';

export default DS.Transform.extend({
    deserialize(serialized) {
        if (!Ember.$.isArray(serialized)) {
            return [];
        }
        return serialized.map((profile) => {
            if (profile.get) {
                return profile;
            }
            else {
                return Profile.create(profile);
            }
        });
    },
    serialize(deserialized) {
        return deserialized;
    }
});
