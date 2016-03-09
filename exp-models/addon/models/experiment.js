/*
Manage data about one or more documents in the experiments collection
 */
import Ember from 'ember';
import config from 'ember-get-config';

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
    displayFullscreen: DS.attr('boolean'),

    duration: DS.attr('string'),
    whatHappens: Ember.computed.alias('description'),
    purpose: DS.attr('string'),

    // A url to direct the user to upon completion of the experiment
    exitUrl: DS.attr('string'),

    // This needs to be a separate collection because string fields of a certain length
    // cannot be indexed by Elasticsearch.
    thumbnailId: DS.attr('string'),
    _thumbnail: null,
    onReady: function() {
        var thumbnailId = this.get('thumbnailId');
        if (thumbnailId) {
            this.get('store').findRecord('thumbnail', thumbnailId).then((thumbnail) => {
                this.set('_thumbnail', thumbnail);
            });
        }
    }.on('ready'),
    thumbnail: Ember.computed('_thumbnail', {
        get() {
            return this.get('_thumbnail');
        },
        set (_, raw) {
            var thumbnail = this.get('thumbnail');
            if (!thumbnail) {
                thumbnail = this.get('store').createRecord('thumbnail', {
                    raw: raw
                });
                this.set('_thumbnail', thumbnail);
                thumbnail.save().then((created) => {
                    this.set('thumbnailId', created.get('id'));
                    this.save();
                });
            }
            else {
                thumbnail.set('raw', raw);
                thumbnail.save();
            }
            return thumbnail;
        }
    }),

    schema: Ember.computed('shortId', {
        get() {
            return this.get('store')
                .findRecord('collection', this.get('sessionCollectionId'))
                .then((collection) => collection.schema);
        },
        set(key, value) {
            return this.get('store')
            .findRecord('collection', this.get('sessionCollectionId'))
            .then((collection) => {
                collection.schema = value;
                return collection.save();
            });
        }
    }),

    permissions: DS.attr(),

    state: DS.attr('string'),
    isActive: Ember.computed('state', function() {
        return Ember.isEqual(this.get('state'), this.ACTIVE);
    }),
    onStateChange: function() {
        var state = this.get('state');
        // if changed from inactive to active
        if(state === this.ACTIVE) {
            this.set('beginDate', new Date());
        }
        else if (state !== this.DELETED) {
            this.set('endDate', new Date());
        }
    }.observes('state'),

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
    // Only use to check that the session collection is created when an
    // experiment document is created. NOT a reliable way to fetch an
    // experiment's session collection
    _sessionCollection: null,

    _registerSessionModels() {
        // Dynamically register the required models for a session table associated with this experiment
        var cId = this.get('sessionCollectionId');
        var container = Ember.getOwner(this);
        container.register(`model:${cId}`, SessionModel.extend()); // register a dummy model. This seems to work even if model already registered
        container.register(`adapter:${cId}`, SessionAdapter.extend({'sessionCollectionId': cId})); // Override part of adapter URL
        container.register(`serializer:${cId}`, SessionSerializer.extend({'modelName': cId})); // Tell serializer what model to use
    },

    init() {
        // When an experiment is loaded into the store, generate session-specific models
        this._super(...arguments);
        if (Ember.isPresent(this.get('id'))) {
            this._registerSessionModels();
        }
    },
    didCreate() {
        this._super(...arguments);
        this._registerSessionModels();

        var collection = this.store.createRecord('collection', {
            id: `${config.JAMDB.namespace}.${this.get('sessionCollectionId')}`,
            permissions: {  // Allow participants to create new session records. (Admins should get permission from namespace)
                [`jam-${config.JAMDB.namespace}:accounts-*`]: 'CREATE'
            }
        });
        this.set('_sessionCollection', collection);
        collection.save();
    }
});
