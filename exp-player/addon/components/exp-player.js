import Ember from 'ember';
import layout from '../templates/components/exp-player';

import FullScreen from '../mixins/full-screen';
import parseExperiment from '../utils/parse-experiment';

export default Ember.Component.extend(FullScreen, {
    layout: layout,

    experiment: null, // Experiment model
    session: null,
    pastSessions: null,
    frames: null,
    conditions: null,

    frameIndex: 0,  // Index of the currently active frame

    displayFullscreen: false,
    videoRecorder: Ember.inject.service(),
    fullScreenElementId: 'experiment-player',

    init: function() {
        this._super(...arguments);
        var [frameConfigs, conditions] = parseExperiment(
            this.get('experiment.structure'),
            this.get('pastSessions').toArray()
        );
        this.set('frames', frameConfigs);  // When player loads, convert structure to list of frames
        this.set('displayFullscreen', this.get('experiment.displayFullscreen') || false);  // Choose whether to display this experiment fullscreen (default false)

        var session = this.get('session');
        session.set('conditions', conditions);
        session.save();
    },

    currentFrameConfig: Ember.computed('frames', 'frameIndex', function() {
        var frames = this.get('frames') || [];
        var frameIndex = this.get('frameIndex');
        return frames[frameIndex];
    }),

    _currentFrameTemplate: null,
    currentFrameTemplate: Ember.computed('currentFrameConfig', '_currentFrameTemplate', function() {
        var currentFrameTemplate = this.get('_currentFrameTemplate');
        if (currentFrameTemplate) {
            return currentFrameTemplate;
        }

        var currentFrameConfig = this.get('currentFrameConfig');
        var componentName = `${currentFrameConfig.kind}`;

        if (!Ember.getOwner(this).lookup(`component:${componentName}`)) {
            console.warn(`No component named ${componentName} is registered.`);
        }
        return componentName;
    }),

    currentFrameContext: Ember.computed('pastSessions', function() {
        return {
            pastSessions: this.get('pastSessions')
        };
    }),


    willDestroyElement() {
        this.get('videoRecorder').stop({destroy: true});
        return this._super(...arguments);
    },

    _transition() {
        Ember.run(() => {
            this.set('_currentFrameTemplate', 'exp-blank');
        });
        this.set('_currentFrameTemplate', null);
    },

    actions: {
        saveFrame(frameId, frameData) {
            // Save the data from a completed frame to the session data item
            console.log(`SaveFrame: Saving frame data for ${frameId}`, frameData);
            this.get('session.sequence').push(frameId);
            this.get('session.expData')[frameId] = frameData;
            //TODO Implement diff PATCHing
            this.get('session').save();
        },
        next() {
            console.log('next');

            var frameIndex = this.get('frameIndex');
            if (frameIndex < (this.get('frames').length - 1)) {
                console.log(`Next: Transitioning to frame ${frameIndex + 1}`);
                this._transition();
                this.set('frameIndex', frameIndex + 1);
                return;
            }
            // Hack: at last frame, save instead of advancing frame
            this.get('session').set('completed', true);
            console.log(`Next: Saving session then redirecting to ${this.get('experiment.exitUrl') || '/'}`);
            this.get('session').save().then(() => window.location = this.get('experiment.exitUrl') || '/');
        },
        previous() {
            console.log('previous');

            var frameIndex = this.get('frameIndex');
            if (frameIndex !== 0) {
                console.log(`Previous: Transitioning to frame ${frameIndex - 1}`);
                this._transition();
                this.set('frameIndex', frameIndex - 1);
            } else {
                console.log('Previous: At frame 0');
            }
        }
    }
});
