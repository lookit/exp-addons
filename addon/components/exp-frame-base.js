// app/components/exp-frame-base.js
import Ember from 'ember';

export default Ember.Component.extend({
    /** An abstract component for defining experimenter frames
     **/
    meta: {
        name: 'Base Experimenter Frame',
        description: 'The abstract base frame for Experimenter frames.',
        parameters: {}
    },
    willRender() {
        this._super(...arguments);

        var defaultParams = {};
        Object.keys(this.get('meta.parameters.properties')).forEach((key) => {
            defaultParams[key] = this.get(`meta.parameters.properties.${key}.default`);
        });
        var params = this.get('params') || {};
        Object.keys(defaultParams).forEach((key) => {
            this.set(key, params[key] || defaultParams[key]);
        });
    },
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
