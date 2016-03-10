// app/components/exp-frame-base.js
import Ember from 'ember';

export default Ember.Component.extend({
    /** An abstract component for defining experimenter frames

     @property {string} id: the unique identifier for the _instance_
     @property {string} type: the static class-level type of this frame, e.g.: exp-consent-form
     @property {object} ctx: a deep copy of the exp-player context
     @property {integer} ctx.frameIndex: the current exp-player frameIndex
     **/
    id: null,
    kind: null,

    meta: {  // Configuration for all fields available on the component/template
        name: 'Base Experimenter Frame',
        description: 'The abstract base frame for Experimenter frames.',
        parameters: {  // Configuration parameters, which can be auto-populated from the experiment structure JSON
            type: 'object',
            properties: {}
        },
        data: {  // Controls what and how parameters are serialized and sent to the server. Ideally there should be a validation mechanism.
            type: 'object',
            properties: {}
        }
    },

    frameIndex: null,
    frameConfig: null,
    frameContext: null,
    eventTimings: null,

    session: null,
    didReceiveAttrs: function() {
        this._super(...arguments);

        if (!this.get('frameConfig')) {
            return;
        }

        this.set('eventTimings', []);

        var defaultParams = this.setupParams();
        Object.keys(defaultParams).forEach((key) => {
            this.set(key, defaultParams[key]);
        });

        if (!this.get('id')) {
            var frameIndex = this.get('frameIndex');
            var kind = this.get('kind');
            this.set('id', `${kind}-${frameIndex}`);
        }
    },
    setupParams(params) {
        // Add config properties and data to be serialized as instance parameters (overriding with values explicitly passed in)
        params = params || this.get('frameConfig');

        var defaultParams = {};
        Object.keys(this.get('meta.parameters').properties || {}).forEach((key) => {
            defaultParams[key] = this.get(`meta.parameters.properties.${key}.default`);
        });

        Object.keys(this.get('meta.data').properties || {}).forEach((key) => {
            var value = this.get(key);
            if (typeof value === 'undefined') {
                defaultParams[key] =  this.get(`meta.data.properties.${key}.default`);
            }
            else {
                defaultParams[key] = value;
            }
        });

        Ember.merge(defaultParams, params);
        return defaultParams;
    },

    serializeContent() {
        // Serialize selected parameters for this frame, plus eventTiming data
        var toSerialize = Object.keys(this.get('meta.data.properties') || {});
        var fields = new Map();
        var self = this;  // todo: do we need to do this?
        toSerialize.forEach(function(item) {
            fields[item] = self.get(item);
        });
        return {fields: fields, eventTimings: this.get('eventTimings')};
    },

    actions: {
        setTimeEvent(eventName, extra) {
            // Track a particular timing event
            var curTime = new Date();
            var eventData = {
                eventType: eventName,
                timestamp: curTime.toISOString()
            };
            Ember.merge(eventData, extra || {});
            // Copy timing event into parent dict; TODO is there a more elegant way?
            var timings = this.get('eventTimings');
            timings.push(eventData);
            this.set('eventTimings', timings);
        },
        next() {
            var frameId = `${this.get('frameIndex')}-${this.get('id')}`;
            console.log('Leaving frame ID', frameId);
            this.send('setTimeEvent', 'nextFrame', {additionalKey: 'this is a sample event'});
            // When exiting frame, save the data to the base player using the provided saveHandler
            this.sendAction('saveHandler', frameId, this.get('serializeContent').apply(this)); // todo ugly use of apply
            this.sendAction('next');
        },
        last() {
            this.sendAction('last');
        },
        previous() {
            this.sendAction('previous');
        }
    }
});
