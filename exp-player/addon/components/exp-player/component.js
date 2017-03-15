import Ember from 'ember';
import layout from './template';

import FullScreen from '../../mixins/full-screen';
import ExperimentParser from '../../utils/parse-experiment';

let {
    $
} = Ember;

/**
 * @module exp-player
 * @submodule components
 */

/**
 * Experiment player: a component that renders a series of frames that define an experiment
 *
 * Sample usage:
 * ```handlebars
 * {{exp-player
 *   experiment=experiment
 *   session=session
 *   pastSessions=pastSessions
 *   saveHandler=(action 'saveSession')
 *   frameIndex=0
 *   fullScreenElementId='expContainer'}}
 * ```
 * @class ExpPlayer
 */
export default Ember.Component.extend(FullScreen, {
    layout: layout,

    experiment: null, // Experiment model
    session: null,
    pastSessions: null,
    frames: null,
    conditions: null,

    frameIndex: 0, // Index of the currently active frame
    framePage: 0, // Index of the currently visible page within a frame

    displayFullscreen: false,
    fullScreenElementId: 'experiment-player',

    allowExit: false,
    hasAttemptedExit: false,

    // Any additional properties we might wish to pass from the player to individual frames. Allows passing of arbitrary config
    // by individual consuming applications to suit custom needs.
    extra: {},

    /**
     * The message to display in the early exit modal. Newer browsers may not respect this message.
     * @property {String|null} messageEarlyExitModal
     */
    messageEarlyExitModal: 'Are you sure you want to leave this page? You may lose unsaved data.',

    /**
     * Customize what happens when the user exits the page
     * @method beforeUnload
     * @param {event} event The event to be handled
     * @return {String|null} If string is provided, triggers a modal to confirm user wants to leave page
     */
    beforeUnload(event) {
        if (!this.get('allowExit')) {
            this.set('hasAttemptedExit', true);
            this.send('exitFullscreen');

            // Log that the user attempted to leave early, via browser navigation.
            // There is no guarantee that the server request to save this event will finish before exit completed;
            //   we are limited in our ability to prevent willful exits
            this.send('setGlobalTimeEvent', 'exitEarly', {
                exitType: 'browserNavigationAttempt', // Page navigation, closed browser, etc
                lastPageSeen: this.get('frameIndex')
            });
            //Ensure sync - try to force save to finish before exit
            Ember.run(() => this.get('session').save());

            // Then attempt to warn the user and exit
            // Newer browsers will ignore the custom message below. See https://bugs.chromium.org/p/chromium/issues/detail?id=587940
            const message = this.get('messageEarlyExitModal');
            event.returnValue = message;
            return message;
        }
        return null;
    },

    _registerHandlers() {
        $(window).on('beforeunload', this.beforeUnload.bind(this));
    },
    _removeHandlers() {
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
        this.get('session').save().then(() => window.location = this.get('experiment.exitUrl') || '/');
    },

    actions: {
        sessionCompleted() {
            this.get('session').set('completed', true);
        },

        setGlobalTimeEvent(eventName, extra) {
            // Set a timing event not tied to any one frame
            let curTime = new Date();
            let eventData = {
                eventType: eventName,
                timestamp: curTime.toISOString()
            };
            Ember.merge(eventData, extra || {});
            let session = this.get('session');
            session.get('globalEventTimings').pushObject(eventData);
        },

        saveFrame(frameId, frameData) {
            // Save the data from a completed frame to the session data item
            this.get('session.sequence').push(frameId);
            this.get('session.expData')[frameId] = frameData;
            return this.get('session').save();
        },

        next() {
            var frameIndex = this.get('frameIndex');
            if (frameIndex < (this.get('frames').length - 1)) {
                this._transition();
                this.set('frameIndex', frameIndex + 1);
                this.set('framePage', 0);
                return;
            }
            this._exit();
        },

        skipone() {
            var frameIndex = this.get('frameIndex');
            if (frameIndex < (this.get('frames').length - 2)) {
                this._transition();
                this.set('frameIndex', frameIndex + 2);
                return;
            }
            this._exit();
        },

        previous() {
            var frameIndex = this.get('frameIndex');
            if (frameIndex !== 0) {
                this._transition();
                this.set('frameIndex', frameIndex - 1);
            }
        },

        closeExitWarning() {
            this.set('hasAttemptedExit', false);
        },

        updateFramePage(framePage) {
            this.set('framePage', framePage);
        }
    }
});
