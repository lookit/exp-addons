/*
Manage data about one or more documents in the experiments collection
 */

import DS from 'ember-data';
import JamModel from '../mixins/jam-model';

export default DS.Model.extend(JamModel, {
    title: DS.attr('string'),
    description: DS.attr('string'),
    active: DS.attr('string'),
    beginDate: DS.attr('date'),
    endDate: DS.attr('date'),
    lastEdited: DS.attr('date'),

    eligibilityCriteria: DS.attr(),
    structure: DS.attr(),

    permissions: DS.attr(),

    history: DS.hasMany('history'),
});
