/*
Manage data about one or more documents in the sessions collection
 */

import DS from 'ember-data';
import JamModel from '../mixins/jam-model';

export default DS.Model.extend(JamModel, {
    parameters: DS.attr(),
    softwareVersion: DS.attr('string'),
    expData: DS.attr(),  // Data is a reserved keyword in ember
    timestamp: DS.attr('date'),  // Should we instead rely on Jam meta fields as stamp?

    permissions: DS.attr(),

    history: DS.hasMany('history'),

    // JamDB requires two pieces of info to unambiguously identify a record
    profile: DS.belongsTo('profile'),
    profileId: DS.attr('string'), // Store ID of related record
    profileVersion: DS.attr('string'),  // TODO: safe to always assume newest profile version?

    experiment: DS.belongsTo('experiment'),
    experimentId: DS.attr('string'),
    experimentVersion: DS.attr('string'),  // TODO: Currently this field is not acted on in any way
});
