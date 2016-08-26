import Ember from 'ember';
import layout from '../templates/components/exp-player';

import FullScreen from '../mixins/full-screen';
import ExperimentParser from '../utils/parse-experiment';

let {
    $
} = Ember;

export default Ember.Component.extend(FullScreen, {
    layout: layout,

    experiment: null, // Experiment model
    session: null,
    pastSessions: null,
    frames: null,
    conditions: null,

    frameIndex: 0, // Index of the currently active frame

    displayFullscreen: false,
    fullScreenElementId: 'experiment-player',

    allowExit: false,
    hasAttemptedExit: false,
    _registerHandlers() {
        $(window).on('beforeunload', () => {
            if (!this.get('allowExit')) {
                this.set('hasAttemptedExit', true);
                this.send('exitFullscreen');
                let toast = this.get('toast');
                toast.warning('To leave the study early, press F1 and then select a privacy level for your videos');
                return `
If you're sure you'd like to leave this study early
you can do so now.

We'd appreciate it if before you leave you fill out a
very breif exit survey letting us know how we can use
any video captured during this session. Press 'Stay on
this Page' and you will be prompted to go to this
exit survey.

If leaving this page was an accident you will be
able to continue the study.
`;
            }
            return null;
        });
        $(window).on('keyup', (e) => {
            console.log(e.which);
            if (e.which === 112) {
                this.send('exitEarly');
            }
        });
    },
    _removeHandlers() {
        $(window).off('keypress');
        $(window).off('beforeunload');
    },
    onFrameIndexChange: Ember.observer('frameIndex', function() {
        var max = this.get('frames.length') - 1;
        var frameIndex = this.get('frameIndex');
        if (frameIndex === max) {
            this._removeHandlers();
        }
    }),
    willDestroy() {
        this._super(...arguments);
        this._removeHandlers();
    },

    init: function() {
        this._super(...arguments);
        this._registerHandlers();

        var parser = new ExperimentParser({
            structure: this.get('experiment.structure'),
            pastSessions: this.get('pastSessions').toArray()
        });
        var [frameConfigs, conditions] = parser.parse();
        this.set('frames', frameConfigs); // When player loads, convert structure to list of frames
        this.set('displayFullscreen', this.get('experiment.displayFullscreen') || false); // Choose whether to display this experiment fullscreen (default false)

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

    _transition() {
        Ember.run(() => {
            this.set('_currentFrameTemplate', 'exp-blank');
        });
        this.set('_currentFrameTemplate', null);
    },
    _exit() {
        this.send('sessionCompleted');
        console.log(`Next: Saving session then redirecting to ${this.get('experiment.exitUrl') || '/'}`);
        this.get('session').save().then(() => window.location = this.get('experiment.exitUrl') || '/');
    },

    actions: {
        sessionCompleted() {
            this.get('session').set('completed', true);
        },
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
            this._exit();
        },
        skipone() {
            console.log('skip one frame');

            var frameIndex = this.get('frameIndex');
            if (frameIndex < (this.get('frames').length - 2)) {
                console.log(`Next: Transitioning to frame ${frameIndex + 2}`);
                this._transition();
                this.set('frameIndex', frameIndex + 2);
                return;
            }
            this._exit();
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
        },
        exitEarly() {
            this.set('hasAttemptedExit', false);
            var max = this.get('frames.length') - 1;
            this.set('frameIndex', max);
        },
        closeExitWarning() {
            this.set('hasAttemptedExit', false);
        }
    }
});
