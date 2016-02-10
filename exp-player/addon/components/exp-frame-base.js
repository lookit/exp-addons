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
    type: null,
    ctx: null,
    meta: {
        name: 'Base Experimenter Frame',
        description: 'The abstract base frame for Experimenter frames.',
        parameters: {}
    },
    setupParams(params) {
        params = params || this.get('params');

        var defaultParams = {};
        Object.keys(this.get('meta.parameters').properties || {}).forEach((key) => {
            defaultParams[key] = this.get(`meta.parameters.properties.${key}.default`);
        });

        Ember.merge(defaultParams, params);
        return defaultParams;
    },
    onInit: function() {
        var defaultParams = this.setupParams();
        Object.keys(defaultParams).forEach((key) => {
            this.set(key, defaultParams[key]);
        });

        if (!this.get('id')) {
            var frameIndex = this.get('ctx.frameIndex');
            var type = this.get('type');
            this.set('id', `${type}-${frameIndex}`);
        }
    }.on('didReceiveAttrs'),
    actions: {
        next() {
            //this.get('sendContent')(); // TODO: Better transition mechanism?
            this.sendAction('saveHandler', this.get('id'), this.get('serializeContent').apply(this)); // todo ugly use of apply
            this.sendAction('next'); // todo send a named action?
        },
        last() {
            this.sendAction('last');
        },
        previous() {
            this.sendAction('previous');
        }
    },

    serializeContent: function () {
        // Serialize selected parameters for this frame, plus eventTiming data
        var toSerialize = Object.keys(this.get('meta.data.properties'));
        var fields = new Map();
        var self = this;  // todo: do we need to do this?
        toSerialize.forEach(function(item) {
            fields[item] = self.get(item);
        });
        return {fields: fields, eventTimings: this.get('eventTimings')};
    },

});
