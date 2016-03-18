import Ember from 'ember';
import DS from 'ember-data';

import moment from 'moment';

export default DS.Model.extend({
    profileId: DS.attr('string'),
    firstName: DS.attr('firstName'),
    birthday: DS.attr('birthday'),
    age: Ember.computed('birthday', function() {
        var bd = moment(this.get('birthday'));
        return moment(new Date()).diff(bd, 'days');
    }),
    save() {
        console.log('Profile instances should not be saved directly. Save from the parent account.');
    }
});
