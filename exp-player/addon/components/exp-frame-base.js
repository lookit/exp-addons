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

    meta: { // Configuration for all fields available on the component/template
        name: 'Base Experimenter Frame',
        description: 'The abstract base frame for Experimenter frames.',
        parameters: { // Configuration parameters, which can be auto-populated from the experiment structure JSON
            type: 'object',
            properties: {}
        },
        data: { // Controls what and how parameters are serialized and sent to the server. Ideally there should be a validation mechanism.
            type: 'object',
            properties: {}
        }
    },

    frameIndex: null,
    frameConfig: null,
    frameContext: null,
    eventTimings: null,

    session: null,

    // see https://github.com/emberjs/ember.js/issues/3908. Moved
    // to init because we were losing the first event per instance of a frame
    // when it was in didReceiveAttrs.
    setTimings: function() {
        this.set('eventTimings', []);
    }.on("init"),

    didReceiveAttrs: function(options) {
        this._super(...arguments);

        if (!this.get('frameConfig')) {
            return;
        }

        var newAttrs = options.newAttrs || {};
        var oldAttrs = options.oldAttrs || {};

        let clean = Ember.get(newAttrs, 'frameIndex.value') !== Ember.get(oldAttrs, 'frameIndex.value');
        var defaultParams = this.setupParams(null, clean);
        if (clean) {
            Object.keys(defaultParams).forEach((key) => {
                this.set(key, defaultParams[key]);
            });
        }

        if (!this.get('id')) {
            var frameIndex = this.get('frameIndex');
            var kind = this.get('kind');
            this.set('id', `${kind}-${frameIndex}`);
        }
    },
    setupParams(params, clean) {
        // Add config properties and data to be serialized as instance parameters (overriding with values explicitly passed in)
        params = params || this.get('frameConfig');

        var defaultParams = {};
        Object.keys(this.get('meta.parameters').properties || {}).forEach((key) => {
            defaultParams[key] = this.get(`meta.parameters.properties.${key}.default`);
        });

        Object.keys(this.get('meta.data').properties || {}).forEach((key) => {
            if (this[key] && this[key].isDescriptor) {
                return;
            }
            var value = !clean ? this.get(key) : undefined;
            if (typeof value === 'undefined') {
                // Make deep copy of the default value (to avoid subtle reference errors from reusing mutable containers)
                defaultParams[key] = Ember.copy(this.get(`meta.data.properties.${key}.default`), true);
            } else {
                defaultParams[key] = value;
            }
        });

        Ember.merge(defaultParams, params);
        return defaultParams;
    },

    serializeContent() {
        // Serialize selected parameters for this frame, plus eventTiming data

        var serialized = this.getProperties(Object.keys(this.get('meta.data.properties') || {}));
        serialized.eventTimings = this.get('eventTimings');
        return serialized;
    },

    actions: {
        setTimeEvent(eventName, extra) {
            console.log(`Timing event captured for ${eventName}`, extra);
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
        save() {
            var frameId = `${this.get('frameIndex')}-${this.get('id')}`;
            // When exiting frame, save the data to the base player using the provided saveHandler
            this.sendAction('saveHandler', frameId, this.get('serializeContent').apply(this)); // todo ugly use of apply
        },
        next() {
            var frameId = `${this.get('frameIndex')}-${this.get('id')}`;
            console.log(`Next: Leaving frame ID ${frameId}`);
            this.send('setTimeEvent', 'nextFrame');
            this.send('save');
            this.sendAction('next');
            window.scrollTo(0,0);
        },
        last() {
            this.sendAction('last');
        },
        previous() {
            var frameId = `${this.get('frameIndex')}-${this.get('id')}`;
            console.log(`Previous: Leaving frame ID ${frameId}`);
            this.sendAction('previous');
        }
    }
});
