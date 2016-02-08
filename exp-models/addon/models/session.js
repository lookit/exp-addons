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
    profileVersion: DS.attr('string'),  // TODO: safe to always assume newest profile version?

    experiment: DS.belongsTo('experiment'),
    experimentVersion: DS.attr('string'),


    // TODO: Can we add computed properties for experiment name/ ID from a relationship?
});
