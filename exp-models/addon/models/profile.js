import Ember from 'ember';
import DS from 'ember-data';

import moment from 'moment';

export default DS.Model.extend({
    profileId: DS.attr('string'),
    firstName: DS.attr('string'),
    birthday: DS.attr('date'),
    gender: DS.attr('string'),
    ageAtBirth: DS.attr('string'),
    additionalInformation: DS.attr('string'),
    deleted: DS.attr('boolean', {default: false}),

    age: Ember.computed('birthday', function() {
        var bd = moment(this.get('birthday'));
        return moment(new Date()).diff(bd, 'days');
    }),
    save() {
        this.transitionTo('loaded.saved');
    }
});
