/*
Manage data about one or more documents in the experiments collection
 */
import Ember from 'ember';

import DS from 'ember-data';
import JamModel from '../mixins/jam-model';

import SessionAdapter from '../adapters/session';
import SessionModel from '../models/session';
import SessionSerializer from '../serializers/session';

import compile from '../utils/eligibility';

export default DS.Model.extend(JamModel, {
    ACTIVE: 'Active',
    DRAFT: 'Draft',
    ARCHIVED: 'Archived',
    DELETED: 'Deleted',

    title: DS.attr('string'),
    description: DS.attr('string'),
    beginDate: DS.attr('date'),
    endDate: DS.attr('date'),
    structure: DS.attr(),

    // Researchers can provide feedback to participants by writing to this field
    feedback: DS.attr('string'),
    // A flag for whether or not the participant has seen this feedback
    hasReadFeedback: DS.attr('boolean'),

    // This needs to be a seperate collection because string fields of a certain length
    // cannot be indexed by Elasticsearch.
    thumbnailId: DS.attr('string'),
    thumbnail: Ember.computed('thumbnailId', {
        get() {
            var thumbnailId = this.get('thumbnailId');
            if (thumbnailId) {
                return this.get('store').findRecord('thumbnail', thumbnailId);
            }
            return null;
        },
        set (raw) {
            var self = this;

            var getThumbnail = this.get('thumbnail');
            if (getThumbnail) {
                return getThumbnail.then(function(thumbnail) {
                    thumbnail.set('raw', raw);
                    return thumbnail.save();
                });
            }
            else {
                var thumbnail = this.get('store').createRecord('thumbnail', {
                    raw: raw
                });
                return thumbnail.save().then(function() {
                    self.set('thumbnailId', thumbnail.get('id'));
                    self.save();
                });
            }
        }
    }),

    permissions: DS.attr(),

    state: DS.attr('string'),
    isActive: Ember.computed('state', function() {
        return Ember.isEqual(this.get('state'), this.ACTIVE);
    }),

    eligibilityCriteria: DS.attr('string'),
    eligibilityString: Ember.computed('eligibilityCriteria', function() {
        var eligibility = this.get('eligibilityCriteria');
        // TODO
        return eligibility || "None";
    }),
    _isEligible: Ember.computed('eligibilityCriteria', function() {
        return compile(this.get('eligibilityCriteria'));
    }),
    isEligible(participant) {
        return this.get('_isEligible')(participant);
    },

    history: DS.hasMany('history'),
    getCurrentVersion: function() {
        return this.get('history').then(function(changes) {
            return changes.objectAt(0).get('id');
        });
    },

    sessionCollectionId: Ember.computed('shortId', function() {
        // Return a string corresponding to the session collection shortID, to be used by model/adapter/serializer
        // Eg an experiment called 'test0' would have a collection 'session-test0'
        return `session${this.get('shortId')}s`; // FIXME: the spurious s is a requirement imposed by genschemas...
    }),

    _registerSessionModels() {
        // Dynamically register the required models for a session table associated with this experiment
        var cId = this.get('sessionCollectionId');
        var container = Ember.getOwner(this);
        container.register(`model:${cId}`, SessionModel.extend()); // register a dummy model. This seems to work even if model already registered
        container.register(`adapter:${cId}`, SessionAdapter.extend({'sessionCollectionId': cId})); // Override part of adapter URL
        container.register(`serializer:${cId}`, SessionSerializer.extend({'modelName': cId})); // Tell serializer what model to use)
    },

    init() {
        // When an experiment is loaded into the store, generate session-specific models
        this._super(...arguments);
        if (Ember.isPresent(this.get('id'))) {
            this._registerSessionModels();
        }
    },
    onCreate: function() {
        this._registerSessionModels();
        var collection = this.store.createRecord('collection', {
            id: 'experimenter.' + this.get('sessionCollectionId')
        });
        collection.save();
    }.on('didCreate')
});
