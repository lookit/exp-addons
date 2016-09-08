/*
Manage data about one or more documents in the experiments collection
 */
import Ember from 'ember';
import DS from 'ember-data';
import moment from 'moment';

import JamModel from '../mixins/jam-model';

import SessionAdapter from '../adapters/session';
import SessionModel from '../models/session';
import SessionSerializer from '../serializers/session';

export default DS.Model.extend(JamModel, {
    namespaceConfig: Ember.inject.service(),

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
    whatHappens: Ember.computed.alias('description'), // TODO: Deprecate
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
        set(_, raw) {
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
            } else {
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
        if (this.get('isNew')) {
            return;
        }
        var state = this.get('state');
        // if changed from inactive to active
        if (state === this.ACTIVE) {
            this.set('beginDate', new Date());
        } else if (state !== this.DELETED) {
            this.set('endDate', new Date());
        }
    }.observes('state'),

    eligibilityMaxAge: DS.attr('string'),
    eligibilityMinAge: DS.attr('string'),
    eligibilityString: DS.attr('string'),
    _parseAge: function(age) {
        var inflector = new Ember.Inflector();
        var [amount, unit] = age.split(' ');
        return moment.duration(parseFloat(amount), inflector.pluralize(unit)).asDays();
    },
    isEligible(participant) {
        var age = participant.get('age');

        let {
            eligibilityMinAge,
            eligibilityMaxAge
        } = this.getProperties('eligibilityMinAge', 'eligibilityMaxAge');

        var minDays;
        var maxDays;
        if (eligibilityMinAge) {
            let [minNumber, minUnit] = eligibilityMinAge.split(' ');
            minDays = moment.duration(parseFloat(minNumber), minUnit).asDays();
        }
        if (eligibilityMaxAge) {
            let [maxNumber, maxUnit] = eligibilityMaxAge.split(' ');
            maxDays = moment.duration(parseFloat(maxNumber), maxUnit).asDays();
        }
        minDays = minDays || -1;
        maxDays = maxDays || Number.MAX_SAFE_INTEGER;
        return minDays <= age && age <= maxDays;
    },
    ageRange: Ember.computed('eligibilityMinAge', 'eligibilityMaxAge', function() {
        let {
            eligibilityMinAge,
            eligibilityMaxAge
        } = this.getProperties('eligibilityMinAge', 'eligibilityMaxAge');

        if (eligibilityMinAge && eligibilityMaxAge) {
            return `between ${eligibilityMinAge} and ${eligibilityMaxAge}`;
        } else if (eligibilityMinAge) {
            return `${eligibilityMinAge} and up`;
        } else if (eligibilityMaxAge) {
            return `not older than ${eligibilityMaxAge}`;
        } else {
            return 'any';
        }
    }),

    history: DS.hasMany('history'),
    getCurrentVersion: function() {
        return this.get('history').then(function(changes) {
            return changes.objectAt(0).get('id');
        });
    },

    sessionCollectionId: Ember.computed('shortId', function() {
        // Return a string corresponding to the session collection shortID, to be used by model/adapter/serializer
        // Eg an experiment called 'test0' would have a collection 'session-test0'
        return `session${this.get('id')}s`; // FIXME: the spurious s is a requirement imposed by genschemas...
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
        container.register(`adapter:${cId}`, SessionAdapter.extend({
            sessionCollectionId: cId,
            shouldReloadAll: () => true
        })); // Override part of adapter URL
        container.register(`serializer:${cId}`, SessionSerializer.extend({
            'modelName': cId
        })); // Tell serializer what model to use
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

        var namespace = this.get('namespaceConfig').get('namespace');
        var permissions = {
            [`jam-${namespace}:accounts-*`]: 'CREATE'
        };
        var collection = this.store.createRecord('collection', {
            id: `${namespace}.${this.get('sessionCollectionId')}`,
            permissions: this.get('isActive') ? permissions : {} // Allow participants to create new session records on active experiments. (Admins should get permission from namespace)
        });
        this.set('_sessionCollection', collection);
        collection.save();
    }

    // TODO: In the future, we would like to automatically set session access appropriately when the value of isActive changed AND the experiment record is saved to the server (observer easy for one event, less so for the combination)
});
