/*
Manage data about one or more documents in the sessions collection
 */

import Ember from'ember';
import DS from 'ember-data';
import JamModel from '../mixins/jam-model';

export default DS.Model.extend(JamModel, {
    parameters: DS.attr(),
    softwareVersion: DS.attr('string'),
    expData: DS.attr(),  // Data is a reserved keyword in ember

    // JamDB requires two pieces of info to unambiguously identify a record
    profileId: DS.attr('string'), // Store ID of related record
    profileVersion: DS.attr('string'), // TODO: Safe to always assume newest profile version?

    experimentId: DS.attr('string'),
    experimentVersion: DS.attr('string'),  // TODO: Currently this field is not acted on in any way

    permissions: DS.attr(),

    history: DS.hasMany('history'),

    profile: Ember.computed('profileId', function() {
        var storeId = this.get('profileId');
        return this.store.findRecord('profile', storeId);
    }),

    experiment: Ember.computed('experimentId', function() {
        var storeId = this.get('experimentId');
        return this.store.findRecord('experiment', storeId);
    }),
});
