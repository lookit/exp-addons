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
    onInit: function() {
        var defaultParams = {};
        Object.keys(this.get('meta.parameters.properties')).forEach((key) => {
            defaultParams[key] = this.get(`meta.parameters.properties.${key}.default`);
        });
        Object.keys(defaultParams).forEach((key) => {
            this.set(key, this.get(`params.${key}`) || defaultParams[key]);
        });

        if (!this.get('id')) {
            var frameIndex = this.get('ctx.frameIndex');
            var type = this.get('type');
            this.set('id', `${type}-${frameIndex}`);
        }
    }.on('didReceiveAttrs'),
    actions: {
        next() {
            this.get('next')();
        },
        last() {
            this.get('last')();
        },
        previous() {
            this.get('previous')();
        }
    }
});
