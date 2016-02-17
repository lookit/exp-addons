/*
Manage data about one or more documents in the experiments collection
 */
import Ember from 'ember';

import DS from 'ember-data';
import JamModel from '../mixins/jam-model';

export default DS.Model.extend(JamModel, {
    ACTIVE: 'Active',
    DRAFT: 'Draft',
    ARCHIVED: 'Archived',
    DELETED: 'Deleted',

    title: DS.attr('string'),
    description: DS.attr('string'),
    beginDate: DS.attr('date'),	// TODO: ISODate
    endDate: DS.attr('date'),	// TODO: ISODate
    lastEdited: DS.attr('date'),	// TODO: ISODate
    structure: DS.attr(),

    permissions: DS.attr(),

    state: DS.attr('string'),
    isActive: Ember.computed('state', function() {
        return Ember.isEqual(this.get('state'), this.ACTIVE);
    }),

    history: DS.hasMany('history'),
    sessions: DS.hasMany('session'),

    eligibilityCriteria: DS.attr('string'),
    eligibilityString: Ember.computed('eligibilityCriteria', function() {
        var eligibility = this.get('eligibilityCriteria');
        // TODO
        return eligibility || "None";
    })
});
