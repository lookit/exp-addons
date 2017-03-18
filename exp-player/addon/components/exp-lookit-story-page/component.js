import Ember from 'ember';
import layout from './template';
import ExpFrameBaseUnsafeComponent from '../../components/exp-frame-base-unsafe/component';
import FullScreen from '../../mixins/full-screen';
import VideoRecord from '../../mixins/video-record';

let {
    $
} = Ember;

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * TODO: document correctly (below is for pref-look)
 * Frame to implement a basic preferential looking trial, with static images
 * displayed in the center or at left and right of the screen. Trial proceeds
 * in segments:
 * - Intro: central attentiongrabber video (looping) & intro audio [wait until
 *   recording is established to move on, and a minimum amount of time]
 * - Test: image(s) displayed, any test audio played [set amount of time]
 * - Final audio: central attentiongrabber video (looping) & final audio
 *   (optional section, intended for last trial in block)
 *
 *
 * These frames extend ExpFrameBaseUnsafe because they are displayed fullscreen
 * and expected to be repeated.

```json
 "frames": {
    "story-trial": {
    }
 }

 * ```
 * @class ExpLookitStoryPage
 * @extends ExpFrameBaseUnsafe
 * @uses FullScreen
 * @uses VideoRecord
 */

export default ExpFrameBaseUnsafeComponent.extend(FullScreen, VideoRecord,  {
    // In the Lookit use case, the frame BEFORE the one that goes fullscreen
    // must use "unsafe" saves (in order for the fullscreen event to register as
    // being user-initiated and not from a promise handler) #LEI-369.
    // exp-alternation frames are expected to be repeated, so they need to be
    // unsafe.
    type: 'exp-lookit-story-page',
    layout: layout,
    displayFullscreen: true, // force fullscreen for all uses of this component
    fullScreenElementId: 'experiment-player',
    fsButtonID: 'fsButton',
    videoRecorder: Ember.inject.service(),
    recorder: null,
    hasCamAccess: Ember.computed.alias('recorder.hasCamAccess'),
    videoUploadConnected: Ember.computed.alias('recorder.connected'),

    // Track state of experiment
    completedAudio: false,
    completedAttn: false,
    currentSegment: 'intro', // 'calibration', 'test', 'finalaudio' (mutually exclusive)
    previousSegment: 'intro', // used when pausing/unpausing - refers to segment that study was paused during

    currentAudioIndex: -1, // during initial sequential audio, holds an index into audioSources

    readyToStartAudio: Ember.computed('hasCamAccess', 'videoUploadConnected',
        function() {
            return (this.get('hasCamAccess') && this.get('videoUploadConnected'));
        }),

    meta: {
        name: 'ExpLookitStoryPage',
        description: 'Frame to [TODO]',
        parameters: {
            type: 'object',
            properties: {
                /**
                 * Whether to do webcam recording (will wait for webcam
                 * connection before starting audio if so)
                 *
                 * @property {Boolean} doRecording
                 */
                doRecording: {
                    type: 'boolean',
                    description: 'Whether to do webcam recording (will wait for webcam connection before starting audio if so'
                },
                /**
                 * Whether to proceed automatically after audio (and hide
                 * replay/next buttons)
                 *
                 * @property {Boolean} autoProceed
                 */
                autoProceed: {
                    type: 'boolean',
                    description: 'Whether to proceed automatically after audio (and hide replay/next buttons)'
                },
                /**
                 * Array of objects describing audio to play at the start of
                 * this frame. Each element describes a separate audio segment.
                 *
                 * @property {Object[]} audioSources
                 *   @param {String} audioId unique string identifying this
                 *      audio segment
                 *   @param {Object[]} sources Array of {src: 'url', type:
                 *      'MIMEtype'} objects with audio sources for this segment
                 *   @param {Object[]} highlights Array of {'range': [startT,
                 *      endT], 'image': 'imageId'} objects, where the imageId
                 *      values correspond to the ids given in images
                 */
                audioSources: {
                    type: 'array',
                    description: 'List of objects specifying audio src and type for audio played during test trial',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'audioId': {
                                type: 'string'
                            },
                            'sources': {
                                type: 'object',
                                properties: {
                                'src': {
                                    type: 'string'
                                },
                                'type': {
                                    type: 'string'
                                    }
                                },
                            },
                            'highlights': {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        'range': {
                                            type: 'array',
                                            items: {
                                                type: 'number'
                                            }
                                        },
                                        'image': {
                                            'type': 'string'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                /**
                 * Text block to display to parent.
                 *
                 * @property {Object} parentTextBlock
                 *   @param {String} title title to display
                 *   @param {String} text paragraph of text
                 *   @param {Boolean} emph whether to bold this paragraph
                 */
                parentTextBlock: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string'
                        },
                        text: {
                            type: 'string'
                        },
                        emph: {
                            type: 'boolean'
                        }
                    },
                    default: []
                },
                /**
                 * Array of images to display and information about their placement
                 *
                 * @property {Object[]} images
                 *   @param {String} id unique ID for this image
                 *   @param {String} src URL of image source
                 *   @param {String} left left margin, as percentage of story area width
                 *   @param {String} width image width, as percentage of story area width
                 *   @param {String} top top margin, as percentage of story area height

                 */
                images: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            'id': {
                                type: 'string'
                            },
                            'src': {
                                type: 'string'
                            },
                            'left': {
                                type: 'string'
                            },
                            'width': {
                                type: 'string'
                            },
                            'top': {
                                type: 'string'
                            }
                        }
                    }
                }
            }
        },
        data: {
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {String} videoID The ID of any video recorded during this frame
             * @param {Object} eventTimings
             * @return {Object} The payload sent to the server
             */
            type: 'object',
            properties: {
                videoId: {
                    type: 'string'
                }
            }
        }
    },

    audioObserver: Ember.observer('readyToStartAudio', function(frame) {
        if (frame.get('readyToStartAudio')) {
            $('#waitForVideo').hide();
            $('.story-image-container').show();
            frame.set('currentAudioIndex', -1);
            frame.send('playNextAudioSegment');
        }
    }),

    actions: {

        // During playing audio
        updateCharacterHighlighting() {

            var thisAudioData = this.get('audioSources')[this.currentAudioIndex];
            var t = $('#' + thisAudioData.audioId)[0].currentTime;

            $('.story-image-container').removeClass('highlight');

            thisAudioData.highlights.forEach(function (h) {
                if (t > h.range[0] && t < h.range[1]) {
                    $('#' + h.image).addClass('highlight');
                }
            });
        },

        replay() {
            // pause any current audio, and set times to 0
            $('audio').each(function() {
                this.pause();
                this.currentTime = 0;
            });
            // reset to index -1 as at start of study
            this.set('currentAudioIndex', -1);
            // restart audio
            this.send('playNextAudioSegment');
        },

        next() {
            if (this.get('recorder')) {
            /**
             * Just before stopping webcam video capture
             *
             * @event stoppingCapture
             */
                this.sendTimeEvent('stoppingCapture');
                this.get('recorder').stop();
            }
            this._super(...arguments);
        },

        playNextAudioSegment() {
            this.set('currentAudioIndex', this.get('currentAudioIndex') + 1);
            if (this.currentAudioIndex < this.get('audioSources').length) {
                $('#' + this.get('audioSources')[this.currentAudioIndex].audioId)[0].play();
            } else {
                if (this.get('autoProceed')) {
                    this.send('next');
                } else {
                    $('#nextbutton').prop('disabled', false);
                }
            }
        }

    },

    // TODO: should this be moved to the recording mixin?
    sendTimeEvent(name, opts = {}) {
        var streamTime = this.get('recorder') ? this.get('recorder').getTime() : null;
        Ember.merge(opts, {
            streamTime: streamTime,
            videoId: this.get('videoId')
        });
        this.send('setTimeEvent', `exp-lookit-preferential-looking:${name}`, opts);
    },

    // TODO: should the events here be moved to the fullscreen mixin?
    onFullscreen() {
        if (this.get('isDestroyed')) {
            return;
        }
        this._super(...arguments);
        if (!this.checkFullscreen()) {
            /**
             * Upon detecting change out of fullscreen mode
             *
             * @event leftFullscreen
            */
            this.sendTimeEvent('leftFullscreen');
        } else {
            /**
             * Upon detecting change to fullscreen mode
             *
             * @event enteredFullscreen
            */
            this.sendTimeEvent('enteredFullscreen');
        }
    },

    didInsertElement() {
        this._super(...arguments);

        this.send('showFullscreen');
        $('#nextbutton').prop('disabled', true);

        if (this.get('doRecording')) {
            $('.story-image-container').hide();
            if (this.get('experiment') && this.get('id') && this.get('session')) {
                let recorder = this.get('videoRecorder').start(this.get('videoId'), this.$('#videoRecorder'), {
                    hidden: true
                });
                recorder.install({
                    record: true
                }).then(() => {
                    this.sendTimeEvent('recorderReady');
                    this.set('recordingIsReady', true);
                    this.notifyPropertyChange('readyToStartAudio');
                });
                // TODO: move handlers that just record events to the VideoRecord mixin?
                /**
                 * When recorder detects a change in camera access
                 *
                 * @event onCamAccess
                 * @param {Boolean} hasCamAccess
                 */
                recorder.on('onCamAccess', (hasAccess) => {
                    this.sendTimeEvent('hasCamAccess', {
                        hasCamAccess: hasAccess
                    });
                    this.notifyPropertyChange('readyToStartAudio');
                });
                /**
                 * When recorder detects a change in video stream connection status
                 *
                 * @event videoStreamConnection
                 * @param {String} status status of video stream connection, e.g.
                 * 'NetConnection.Connect.Success' if successful
                 */
                recorder.on('onConnectionStatus', (status) => {
                    this.sendTimeEvent('videoStreamConnection', {
                        status: status
                    });
                    this.notifyPropertyChange('readyToStartAudio');
                });
                this.set('recorder', recorder);
            }
        } else {
            this.send('playNextAudioSegment');
        }

    },

    willDestroyElement() {
        this.sendTimeEvent('destroyingElement');

        // Whenever the component is destroyed, make sure that event handlers are removed and video recorder is stopped
        if (this.get('recorder')) {
            this.get('recorder').hide(); // Hide the webcam config screen
            this.get('recorder').stop();
        }

        this._super(...arguments);
    }

});
