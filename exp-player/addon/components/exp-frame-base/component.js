import Ember from 'ember';

import config from 'ember-get-config';

/**
 * @module exp-player
 * @submodule frames
 */

/** An abstract component for defining experimenter frames
 *
 * This provides common base behavior required for any experiment frame. All experiment frames must extend this one.
 *
 * This frame has no configuration options because all of its logic is internal, and is almost never directly used
 *   in an experiment. It exports no data. Sample experiment definition usage (provided for completeness):
  ```json
    "frames": {
       "my-sample-frame": {
         "kind": "exp-base-frame"
       }
    }
 * ```
 *
 * As a user you will almost never need to insert a component into a template directly- the platform should handle that
 *   by automatically inserting `exp-player` when your experiment starts.
 * However, a sample template usage is provided below for completeness.
 *
 * ```handlebars
 *  {{
      component currentFrameTemplate
        frameIndex=frameIndex
        framePage=framePage
        updateFramePage=(action 'updateFramePage')
        frameConfig=currentFrameConfig
        frameContext=currentFrameContext

        session=session
        experiment=experiment

        next=(action 'next')
        previous=(action 'previous')
        saveHandler=(action 'saveFrame')
        skipone=(action 'skipone')
        sessionCompleted=(action 'sessionCompleted')

        extra=extra
    }}
 * ```
 * @class ExpFrameBase
 */
export default Ember.Component.extend({
    toast: Ember.inject.service(),
    // {String} the unique identifier for the _instance_
    id: null,
    kind: null,

    extra: {},

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
    // {Number} the current exp-player frameIndex
    frameIndex: null,
    framePage: null,
    frameConfig: null,
    frameContext: null,
    eventTimings: null,

    session: null,

    // see https://github.com/emberjs/ember.js/issues/3908. Moved
    // to init because we were losing the first event per instance of a frame
    // when it was in didReceiveAttrs.
    setTimings: Ember.on('init', function () {
        this.set('eventTimings', []);
    }),

    loadData: function (frameData) { // jshint ignore:line
        return null;
    },

    didReceiveAttrs: function (options) {
        this._super(...arguments);

        if (!this.get('frameConfig')) {
            return;
        }

        var newAttrs = options.newAttrs || {};
        var oldAttrs = options.oldAttrs || {};

        let clean = Ember.get(newAttrs, 'frameIndex.value') !== Ember.get(oldAttrs, 'frameIndex.value');
        var defaultParams = this.setupParams(clean);
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

        if (clean && config.featureFlags.loadData) {
            var session = this.get('session');
            var expData = session ? session.get('expData') : null;
            if (session && session.get('expData')) {
                var key = this.get('frameIndex') + '-' + this.get('id');
                if (expData[key]) {
                    this.loadData(expData[key]);
                }
            }
        }
    },

    // Internal save logic
    _save() {
        var frameId = `${this.get('frameIndex')}-${this.get('id')}`;
        // When exiting frame, save the data to the base player using the provided saveHandler
        const payload = this.serializeContent();
        return this.attrs.saveHandler(frameId, payload);
    },

    // Display error messages related to save failures
    displayError(error) { // jshint ignore:line
        // If the save failure was a server error, warn the user. This error should never disappear.
        const msg = 'If this problem persists, please contact your study coordinator.';
        this.get('toast').error(msg, 'Error: Could not save data', {timeOut: 0, extendedTimeOut: 0});
    },

    setupParams(clean) {
        // Add config properties and data to be serialized as instance parameters (overriding with values explicitly passed in)
        var params = this.get('frameConfig');

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

    /**
     * The base class does not define any data to save to the server. It does, however, capture some basic event
     *   timing data. (such as when the user clicks the "next" button)
     *
     * This section slightly breaks YUIDoc conventions- rather than being a literal guide to using the code, the
     *   "parameters" here are abstract descriptions of what data is captured.
     *
     * Each frame that extends ExpFrameBase will send an array `eventTimings`
     * back to the server upon completion. This array is an ordered list (oldest
     * to newest) of every EVENT that happened during the frame. Each event is
     * represented as an object with at least the properties
     * `{'eventType': EVENTNAME, 'timestamp': TIMESTAMP}`. Frame-specific events
     * may define additional properties that are sent.
     *
     * @param {Array} eventTimings
     * @method serializeContent
     * @return {Object}
     */
    serializeContent() {
        // Serialize selected parameters for this frame, plus eventTiming data
        var serialized = this.getProperties(Object.keys(this.get('meta.data.properties') || {}));
        serialized.eventTimings = this.get('eventTimings');
        return serialized;
    },

    /**
     * Create the time event payload for a particular frame / event. This can be overridden to add fields to every
     *  event sent by a particular frame
     * @method makeTimeEvent
     * @param {String} eventName
     * @param {Object} [extra] An object with additional properties to be sent to the server
     * @return {Object} Event type, time, and any additional metadata provided
     */
    makeTimeEvent(eventName, extra) {
        const curTime = new Date();
        const eventData = {
            eventType: eventName,
            timestamp: curTime.toISOString()
        };
        Ember.merge(eventData, extra);
        return eventData;
    },

    actions: {
        setTimeEvent(eventName, extra) {
            console.log(`Timing event captured for ${eventName}`, extra);
            let eventData = this.makeTimeEvent(eventName, extra);
            // Copy timing event into a single dict for this component instance
            let timings = this.get('eventTimings');
            timings.push(eventData);
            this.set('eventTimings', timings);
        },

        save() {
            this._save().catch(err => this.displayError(err));
        },

        next() {
            /**
             * Move to next frame
             *
             * @event nextFrame
             */
            this.send('setTimeEvent', 'nextFrame');
            // Only advance the form if save succeeded
            this._save()
                .then(() => {
                    this.sendAction('next');
                    window.scrollTo(0, 0);
                })
                .catch(err => this.displayError(err));
        },

        last() {
            this.sendAction('last');
        },

        previous() {
            var frameId = `${this.get('frameIndex')}-${this.get('id')}`;
            console.log(`Previous: Leaving frame ID ${frameId}`);
            this.sendAction('previous');
            window.scrollTo(0, 0);
        }
    }
});
