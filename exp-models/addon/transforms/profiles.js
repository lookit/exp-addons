import Ember from 'ember';
import DS from 'ember-data';

import moment from 'moment';

var Profile = Ember.Object.extend({
    profileId: null,
    firstName: null,
    birthday: null,
    age: Ember.computed('birthday', function() {
        var bd = moment(this.get('birthday'));
        return moment(new Date()).diff(bd, 'days');
    })
});

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
