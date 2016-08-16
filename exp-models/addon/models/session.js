/*
Manage data about one or more documents in the sessions collection
 */

import Ember from 'ember';
import DS from 'ember-data';
import JamModel from '../mixins/jam-model';

const AnonJamModel = JamModel.without(['createdBy', 'modifiedBy']);

export default DS.Model.extend(AnonJamModel, {
    sequence: DS.attr(),
    conditions: DS.attr(),
    expData: DS.attr(),  // Data is a reserved keyword in ember

    profileId: DS.attr('string'), // Store ID of related record

    experimentId: DS.attr('string'),
    experimentVersion: DS.attr('string'),  // TODO: Currently this field is not acted on in any way

    completed: DS.attr('boolean'),  // Filter out sessions that were started, but never finished
    earlyExit: DS.attr(),

    // Researchers can provide feedback to participants by writing to this field
    feedback: DS.attr('string'),
    // A flag for whether or not the participant has seen this feedback
    hasReadFeedback: DS.attr('boolean'),

    permissions: DS.attr(),

    history: DS.hasMany('history'),

    getProfile() {
	let [accountId, ] = this.get('profileId').split('.');
	return this.store.findRecord('account', accountId).then((account) => account.profileById(this.get('profileId')));
    },
    anonProfileId: Ember.computed('profileId', function() {
        // For a profile id of format `<acctShortId>.random`, strip off the identifying account ID
        var profileId = this.get('profileId');
        return profileId.split ? profileId.split('.')[1] : profileId;}),

    experiment: Ember.computed('experimentId', function() {
        var storeId = this.get('experimentId');
        return this.store.findRecord('experiment', storeId);
    })
});
