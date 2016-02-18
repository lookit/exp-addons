/*
Manage data about one or more documents in the experiments collection
 */
import Ember from 'ember';

import DS from 'ember-data';
import JamModel from '../mixins/jam-model';

import SessionAdapter from '../adapters/session';
import SessionModel from '../models/session';
import SessionSerializer from '../serializers/session';


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

    eligibilityCriteria: DS.attr('string'),
    eligibilityString: Ember.computed('eligibilityCriteria', function() {
        var eligibility = this.get('eligibilityCriteria');
        // TODO
        return eligibility || "None";
    }),

    history: DS.hasMany('history'),

    sessionCollectionId: Ember.computed('shortId', function() {
        // Return a string corresponding to the session collection shortID, to be used by model/adapter/serializer
        // Eg an experiment called 'test0' would have a collection 'session-test0'
        return `session${this.get('shortId')}s`; // FIXME: the spurious s is a requirement imposed by genschemas...
    }),

    _registerSessionModels() {
        // Dynamically register the required models for a session table associated with this experiment
        var cId = this.get('sessionCollectionId');
        window.App.register(`model:${cId}`, SessionModel.extend()); // register a dummy model. This seems to work even if model already registered
        window.App.register(`adapter:${cId}`, SessionAdapter.extend({sessionCollectionId: cId})); // Override part of adapter URL
        window.App.register(`serializer:${cId}`, SessionSerializer.extend({modelName: cId})); // Tell serializer what model to use)
    },

    init() {
        // When an experiment is loaded into the store, generate session-specific models
        this._registerSessionModels();
    },
});
