/*
Manage data about one or more documents in the experiments collection
 */
import Ember from 'ember';

import DS from 'ember-data';
import JamModel from '../mixins/jam-model';

export default DS.Model.extend(JamModel, {
    title: DS.attr('string'),
    description: DS.attr('string'),
    beginDate: DS.attr('date'),	// TODO: ISODate
    endDate: DS.attr('date'),	// TODO: ISODate
    lastEdited: DS.attr('date'),	// TODO: ISODate
    structure: DS.attr(),

    permissions: DS.attr(),

    active: DS.attr('string'),
    isActive: Ember.computed('active', function() {
        return Ember.isEqual(this.get('active'), 'Active');
    }),

    administrators: DS.hasMany('admin'),
    history: DS.hasMany('history'),
    sessions: DS.hasMany('session'),

    eligibilityCriteria: DS.attr('string'),
    eligibilityString: Ember.computed('eligibilityCriteria', function() {
        var eligibility = this.get('eligibilityCriteria');
        // TODO
        return eligibility || "None";
    })
});
