import Ember from 'ember';
import layout from '../templates/components/exp-player';
import parseExperiment from '../utils/parse-experiment';

export default Ember.Component.extend({
    layout: layout,

    experiment: null, // Experiment model
    frames: null,

    frameIndex: null,  // Index of the currently active frame

    expData: {},  // Temporarily store data collected until we sent to server at end

    init: function() {
        this._super(...arguments);
        this.set('frameIndex', 0);
        var frameConfigs = parseExperiment(this.get('experiment.structure'));
        this.set('frames', frameConfigs);  // When player loads, convert structure to list of frames
    },

    currentFrameConfig: Ember.computed('frames', 'frameIndex', function() {
        var frames = this.get('frames') || [];
        var frameIndex = this.get('frameIndex');
        return frames[frameIndex];
    }),

    currentFrameTemplate: Ember.computed('currentFrameConfig', function() {
        var currentFrameConfig = this.get('currentFrameConfig');
        var componentName = `${currentFrameConfig.kind}`;

        if (!Ember.getOwner(this).lookup(`component:${componentName}`)) {
            console.warn(`No component named ${componentName} is registered.`);
        }
        return componentName;
    }),

    actions: {
        saveFrame(frameId, frameData) {
            // Save the data from a completed frame to the session data item
            var expData = this.get('expData');
            expData[frameId] = frameData;
            this.set('expData', expData);
        },
        saveSession() {
            // Construct payload and send to server
            var frames = this.get('frames');
            var sequence = frames.map((frame) => frame.id);

            var payload = {
                expData: this.get('expData'),
                sequence: sequence
            };
            this.sendAction('saveHandler', payload);  // call the passed-in action with payload
        },
        next() {
            console.log('next');

            var frameIndex = this.get('frameIndex');
            if (frameIndex < (this.get('frames').length - 1)) {
                this.set('frameIndex', frameIndex + 1);
            } else {
                // TODO Very ugly hack for demo purposes only: clicking next on final frame acts as a save instead
                console.log('Saving data to server');
                this.send('saveSession');
            }
        },
        previous() {
            console.log('previous');

            var frameIndex = this.get('frameIndex');
            if (frameIndex !== 0) {
                this.set('frameIndex', frameIndex - 1);
            }
        },
        last() {
            // TODO
            console.log('last');
        },
        skipTo(index) {
            this.set('frameIndex', index);
        }
    }
});
